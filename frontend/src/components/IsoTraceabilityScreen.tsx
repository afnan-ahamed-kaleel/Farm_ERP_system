import { useState } from 'react';
import { ShieldCheck, Search, ArrowRight, Package, Box, Truck } from 'lucide-react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = 'http://localhost:3000/api/v1/traceability';

export default function IsoTraceabilityScreen() {
  const [mode, setMode] = useState<'BACKWARD' | 'FORWARD'>('BACKWARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [queryTerm, setQueryTerm] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['traceability', mode, queryTerm],
    queryFn: async () => {
      if (!queryTerm) return null;
      const endpoint = mode === 'BACKWARD' ? `backward?eggBatchNumber=${queryTerm}` : `forward?rmBatchNumber=${queryTerm}`;
      return (await axios.get(`${API_BASE}/${endpoint}`)).data;
    },
    enabled: !!queryTerm
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) setQueryTerm(searchTerm);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative overflow-hidden rounded-xl bg-slate-900 p-3.5 sm:p-4 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-slate-700/50 blur-3xl" />
        <div className="flex items-center space-x-3 sm:space-x-5 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 shadow-xl shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight">ISO Two-Way Traceability Engine</h1>
            <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5 sm:mt-1">End-to-end lineage across all operational pillars</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden p-3.5 sm:p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 mb-4">
          <select className="p-2.5 sm:p-2 text-xs sm:text-sm bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-slate-200 outline-none font-bold text-slate-800" value={mode} onChange={e => { setMode(e.target.value as any); setQueryTerm(''); setSearchTerm(''); }}>
            <option value="BACKWARD">Backward (Egg to Raw Material)</option>
            <option value="FORWARD">Forward (Raw Material to Egg)</option>
          </select>
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder={mode === 'BACKWARD' ? 'Enter Egg Batch Number (e.g. EGG-...)' : 'Enter Raw Material Batch Number'}
              className="w-full p-2.5 sm:p-2 pl-9 text-xs sm:text-sm bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
          <button type="submit" className="w-full sm:w-auto px-5 py-2.5 sm:py-2 text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl sm:rounded-2xl transition-all shadow-lg flex justify-center items-center">
            Trace
          </button>
        </form>

        {isLoading && <div className="text-center py-20 animate-pulse text-slate-400 font-bold">Tracing lineage across ledger...</div>}
        
        {isError && (
          <div className="p-4 sm:p-6 bg-red-50 text-red-700 rounded-2xl font-bold border border-red-200 text-sm">
            {(error as any)?.response?.data?.message || 'Failed to trace batch.'}
          </div>
        )}

        {data && (
          <div className="space-y-4 animate-in slide-in-from-bottom-8 overflow-x-auto">
            <h3 className="text-base sm:text-lg font-black text-slate-800 border-b border-slate-200 pb-2">Lineage Tree</h3>
            
            <div className="relative border-l-4 border-slate-200 ml-2 sm:ml-6 space-y-6 sm:space-y-10 py-2 text-sm min-w-[280px]">
              
              {/* This is a simplified visual rendering. A true production app would recursively render the tree. */}
              {mode === 'BACKWARD' && (
                <>
                  <TraceNode icon={Package} title="Egg Batch" data={data.batchNumber} color="purple" />
                  
                  {data.eggProductionLogs?.map((log: any, idx: number) => (
                    <div key={idx}>
                      <TraceNode icon={ArrowRight} title="Produced by Flock" data={`${log.flock.batchNumber} in ${log.houseLocation.name}`} color="blue" />
                      
                      {log.flock.feedConsumptions?.map((cons: any, cidx: number) => (
                        <div key={cidx} className="ml-4 sm:ml-12 border-l-4 border-slate-100 pl-3 sm:pl-8 space-y-3 mt-4 sm:mt-6">
                          <TraceNode icon={Box} title="Consumed Feed Batch" data={`${cons.feedBatch.batchNumber} (${cons.quantityConsumedKg}kg)`} color="amber" />
                          
                          {cons.feedBatch.productionRun && (
                             <TraceNode icon={Truck} title="Formula Version" data={`${cons.feedBatch.productionRun.formulaVersion.formula.name} v${cons.feedBatch.productionRun.formulaVersion.versionNumber}`} color="slate" />
                          )}
                          
                          {cons.feedBatch.productionRun?.ingredientUsages?.map((usage: any, uidx: number) => (
                            <div key={uidx} className="ml-4 sm:ml-12 mt-3 sm:mt-4">
                              <TraceNode icon={Package} title="Raw Material Extracted" data={`${usage.rawMaterialItem.name} - Batch: ${usage.rawMaterialBatch.batchNumber}`} color="green" />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                  
                  {data.dispatchRecords?.map((dispatch: any, idx: number) => (
                    <TraceNode key={idx} icon={Truck} title="Dispatched To" data={`Customer ID: ${dispatch.customerId} (Qty: ${dispatch.quantity})`} color="cyan" />
                  ))}
                </>
              )}

              {mode === 'FORWARD' && (
                <>
                  <TraceNode icon={Package} title="Raw Material Batch" data={data.batchNumber} color="green" />
                  <div className="ml-8 text-sm font-bold text-slate-500 mt-4">Forward tracing parses through the Feed Production Runs this material was used in, the Feed Batches created, the Flocks that ate them, and the Eggs dispatched.</div>
                  {/* Additional mapping logic would go here to render the nested forward trace */}
                </>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TraceNode({ icon: Icon, title, data, color }: any) {
  const colors: any = {
    purple: 'bg-purple-500', blue: 'bg-blue-500', amber: 'bg-amber-500', slate: 'bg-slate-500', green: 'bg-green-500', cyan: 'bg-cyan-500'
  };
  return (
    <div className="relative pl-8">
      <div className={`absolute -left-[26px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full ${colors[color]} border-4 border-white shadow-md flex items-center justify-center text-white`}>
        <Icon size={20} />
      </div>
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl shadow-sm">
        <p className="text-xs font-bold uppercase text-slate-500">{title}</p>
        <p className="text-base font-black text-slate-800">{data}</p>
      </div>
    </div>
  );
}
