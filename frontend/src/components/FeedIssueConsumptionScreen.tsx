import { useState } from 'react';
import { Wheat, ArrowRight, Activity, PackageOpen } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';

const API_BASE_FEED = 'http://localhost:3000/api/v1/feed';
const API_BASE_INVENTORY = 'http://localhost:3000/api/v1/inventory';
const API_BASE_TRACKING = 'http://localhost:3000/api/v1/bird-tracking';

export default function FeedIssueConsumptionScreen() {
  const [activeTab, setActiveTab] = useState<'ISSUE' | 'CONSUME'>('ISSUE');
  
  const [issueFeedBatchId, setIssueFeedBatchId] = useState('');
  const [issueTargetHouseId, setIssueTargetHouseId] = useState('');
  const [issueQty, setIssueQty] = useState('');

  const [consumeFlockId, setConsumeFlockId] = useState('');
  const [consumeHouseId, setConsumeHouseId] = useState('');
  const [consumeBatchId, setConsumeBatchId] = useState('');
  const [consumeQty, setConsumeQty] = useState('');

  const { data: balances = [], refetch: refetchInv } = useQuery({ queryKey: ['inventory-balance'], queryFn: async () => (await axios.get(`${API_BASE_INVENTORY}/balance`)).data });
  const { data: flocks = [] } = useQuery({ queryKey: ['flocks'], queryFn: async () => (await axios.get(`${API_BASE_TRACKING}/flocks`)).data });
  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: async () => (await axios.get(`${API_BASE_TRACKING}/locations`)).data });

  const feedBatches = balances.filter((b: any) => b.item.category === 'FEED');
  const houses = locations.filter((l: any) => l.type !== 'FARM');

  const issueMutation = useMutation({
    mutationFn: async (payload: any) => axios.post(`${API_BASE_FEED}/issue`, payload),
    onSuccess: () => { Swal.fire('Success', 'Feed issued to house successfully', 'success'); refetchInv(); setIssueQty(''); },
    onError: (err: any) => Swal.fire('Error', err.response?.data?.message || 'Failed', 'error')
  });

  const consumeMutation = useMutation({
    mutationFn: async (payload: any) => axios.post(`${API_BASE_FEED}/consume`, payload),
    onSuccess: () => { Swal.fire('Success', 'Flock consumption logged', 'success'); refetchInv(); setConsumeQty(''); },
    onError: (err: any) => Swal.fire('Error', err.response?.data?.message || 'Failed', 'error')
  });

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    issueMutation.mutate({ feedBatchId: issueFeedBatchId, targetHouseId: issueTargetHouseId, quantityKg: Number(issueQty), operatorId: 'Operator 1' });
  };

  const handleConsume = (e: React.FormEvent) => {
    e.preventDefault();
    consumeMutation.mutate({ flockId: consumeFlockId, houseLocationId: consumeHouseId, feedBatchId: consumeBatchId, quantityConsumedKg: Number(consumeQty), operatorId: 'Operator 1' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative overflow-hidden rounded-xl bg-slate-900 p-4 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="flex items-center space-x-3 sm:space-x-5 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 shrink-0">
            <Wheat size={20} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight">Issue & Consumption</h1>
            <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5 sm:mt-1">Manage shed stocks and daily feed intake</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button onClick={() => setActiveTab('ISSUE')} className={`flex-1 py-2 text-xs sm:text-sm font-bold transition-colors border-b-2 ${activeTab === 'ISSUE' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
            Issue to Shed
          </button>
          <button onClick={() => setActiveTab('CONSUME')} className={`flex-1 py-2 text-xs sm:text-sm font-bold transition-colors border-b-2 ${activeTab === 'CONSUME' ? 'border-amber-500 text-amber-600 bg-amber-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
            Log Bird Consumption
          </button>
        </div>

        <div className="p-3.5 sm:p-4">
          {activeTab === 'ISSUE' && (
            <form onSubmit={handleIssue} className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center space-x-3 mb-2 sm:mb-3">
                <PackageOpen className="text-emerald-500" size={22} />
                <h2 className="text-base sm:text-lg font-black text-slate-800">Transfer from Main Store</h2>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Select Feed Batch in Store</label>
                <select required className="w-full p-2 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-slate-800" value={issueFeedBatchId} onChange={e => setIssueFeedBatchId(e.target.value)}>
                  <option value="">Choose Batch...</option>
                  {feedBatches.map((b: any) => <option key={b.item.id} value={b.batchId}>Batch {b.batchNumber || b.item.code} (Available: {b.totalBalance}kg)</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Target Shed / House</label>
                <select required className="w-full p-2 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-slate-800" value={issueTargetHouseId} onChange={e => setIssueTargetHouseId(e.target.value)}>
                  <option value="">Choose House...</option>
                  {houses.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Quantity (KG)</label>
                <input required type="number" step="0.01" className="w-full p-2 text-lg bg-white border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-black text-slate-900 shadow-sm" value={issueQty} onChange={e => setIssueQty(e.target.value)} />
              </div>
              <button type="submit" disabled={issueMutation.isPending} className="w-full py-2.5 text-sm mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-500/30">
                <ArrowRight size={18} /> <span>Issue to Shed</span>
              </button>
            </form>
          )}

          {activeTab === 'CONSUME' && (
            <form onSubmit={handleConsume} className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center space-x-3 mb-2 sm:mb-3">
                <Activity className="text-amber-500" size={22} />
                <h2 className="text-base sm:text-lg font-black text-slate-800">Log Flock Consumption</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Flock Batch</label>
                  <select required className="w-full p-2 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold text-slate-800" value={consumeFlockId} onChange={e => setConsumeFlockId(e.target.value)}>
                    <option value="">Choose...</option>
                    {flocks.map((f: any) => <option key={f.id} value={f.id}>{f.batchNumber}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">House / Location</label>
                  <select required className="w-full p-2 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold text-slate-800" value={consumeHouseId} onChange={e => setConsumeHouseId(e.target.value)}>
                    <option value="">Choose...</option>
                    {houses.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Feed Batch Consumed</label>
                <select required className="w-full p-2 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold text-slate-800" value={consumeBatchId} onChange={e => setConsumeBatchId(e.target.value)}>
                  <option value="">Choose Batch...</option>
                  {feedBatches.map((b: any) => <option key={b.item.id} value={b.batchId}>Batch {b.batchNumber || b.item.code}</option>)}
                </select>
              </div>
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Consumed Quantity (KG)</label>
                <input required type="number" step="0.01" className="w-full p-2 text-lg bg-white border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-black text-slate-900 shadow-sm" value={consumeQty} onChange={e => setConsumeQty(e.target.value)} />
              </div>
              <button type="submit" disabled={consumeMutation.isPending} className="w-full py-2 text-sm mt-4 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/30">
                <Wheat size={20} /> <span>Log Daily Consumption</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
