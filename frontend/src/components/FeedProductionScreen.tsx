import { useState } from 'react';
import { Factory, CheckCircle2, XCircle, Settings2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';

const API_BASE_FEED = 'http://localhost:3000/api/v1/feed';
const API_BASE_INVENTORY = 'http://localhost:3000/api/v1/inventory';

export default function FeedProductionScreen() {
  const [formulaId, setFormulaId] = useState('');
  const [versionId, setVersionId] = useState('');
  const [targetQuantityKg, setTargetQuantityKg] = useState(1000);

  const { data: formulas = [] } = useQuery({ queryKey: ['formulas'], queryFn: async () => (await axios.get(`${API_BASE_FEED}/formula`)).data });
  const { data: balances = [] } = useQuery({ queryKey: ['inventory-balance'], queryFn: async () => (await axios.get(`${API_BASE_INVENTORY}/balance`)).data });

  const activeFormula = formulas.find((f: any) => f.id === formulaId);
  const activeVersion = activeFormula?.versions.find((v: any) => v.id === versionId) || activeFormula?.versions[0];

  const ratio = activeVersion ? (targetQuantityKg / activeVersion.baseQuantityKg) : 0;

  const getStock = (itemId: string) => balances.find((b: any) => b.item.id === itemId)?.totalBalance || 0;

  const isFeasible = activeVersion?.ingredients.every((ing: any) => {
    const required = ing.inclusionKg * ratio;
    const available = getStock(ing.rawMaterialItemId);
    return available >= required;
  });

  const mutation = useMutation({
    mutationFn: async (payload: any) => axios.post(`${API_BASE_FEED}/production`, payload),
    onSuccess: (res) => {
      Swal.fire('Success', `Production Run ${res.data.productionNumber} executed successfully!`, 'success');
    },
    onError: (err: any) => Swal.fire('Error', err.response?.data?.message || 'Failed', 'error')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVersion) return;
    if (!isFeasible) return Swal.fire('Error', 'Insufficient raw materials to fulfill this run', 'error');

    mutation.mutate({
      formulaVersionId: activeVersion.id,
      targetQuantityKg,
      operatorId: 'Operator 1'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative overflow-hidden rounded-xl bg-slate-900 p-4 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="flex items-center space-x-5 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-white shadow-xl shadow-cyan-500/30">
            <Factory size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Feed Production Run</h1>
            <p className="text-sm font-medium text-slate-400 mt-1">Execute manufacturing and calculate stock feasibility</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Select Formula</label>
              <select className="w-full p-2 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none font-bold text-slate-800 transition-all" value={formulaId} onChange={e => { setFormulaId(e.target.value); setVersionId(''); }}>
                <option value="">Choose...</option>
                {formulas.map((f: any) => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Formula Version</label>
              <select className="w-full p-2 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none font-bold text-slate-800 transition-all disabled:opacity-50" value={versionId || (activeVersion?.id || '')} onChange={e => setVersionId(e.target.value)} disabled={!formulaId}>
                {activeFormula?.versions.map((v: any) => <option key={v.id} value={v.id}>Version {v.versionNumber}</option>)}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Target Output (KG)</label>
              <input type="number" className="w-full p-2 text-lg bg-white border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none font-black text-slate-900 transition-all tabular-nums text-center shadow-sm" value={targetQuantityKg} onChange={e => setTargetQuantityKg(Number(e.target.value))} required />
            </div>
          </div>

          {activeVersion && (
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center space-x-2">
                <Settings2 size={16} /> <span>Feasibility Analysis</span>
              </h3>
              
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-[500px] w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-3 sm:p-4 font-bold text-slate-600">Ingredient</th>
                      <th className="p-3 sm:p-4 font-bold text-slate-600 text-right">Required (KG)</th>
                      <th className="p-3 sm:p-4 font-bold text-slate-600 text-right">Warehouse Stock (KG)</th>
                      <th className="p-3 sm:p-4 font-bold text-slate-600 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeVersion.ingredients.map((ing: any) => {
                      const required = ing.inclusionKg * ratio;
                      const available = getStock(ing.rawMaterialItemId);
                      const ok = available >= required;

                      return (
                        <tr key={ing.id} className={ok ? 'bg-white' : 'bg-red-50/50'}>
                          <td className="p-3 sm:p-4 font-semibold text-slate-800">{ing.rawMaterialItem.name}</td>
                          <td className="p-3 sm:p-4 font-black text-slate-900 text-right tabular-nums">{required.toFixed(2)}</td>
                          <td className={`p-3 sm:p-4 font-black text-right tabular-nums ${ok ? 'text-slate-600' : 'text-red-600'}`}>{available.toFixed(2)}</td>
                          <td className="p-3 sm:p-4 text-center">
                            {ok ? <CheckCircle2 className="inline text-green-500" size={18} /> : <XCircle className="inline text-red-500" size={18} />}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button type="submit" disabled={!isFeasible || mutation.isPending} className="w-full sm:w-auto px-5 py-2.5 text-sm bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none text-white font-black rounded-2xl flex justify-center items-center space-x-3 transition-all shadow-lg shadow-cyan-600/30">
                  <Factory size={20} /> 
                  <span>{mutation.isPending ? 'Processing...' : 'Execute Production Run'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
