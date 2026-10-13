import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowRightLeft, Send, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

const API_INVENTORY = 'http://localhost:3000/api/v1/inventory';
const API_LOCATIONS = 'http://localhost:3000/api/v1/bird-tracking/locations';

const Toast = Swal.mixin({
  toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
});

export default function StockTransferScreen() {
  const queryClient = useQueryClient();
  const [itemId, setItemId] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [quantity, setQuantity] = useState('');

  const { data: balances = [] } = useQuery({ 
      queryKey: ['inventory-balance-all'], 
      queryFn: async () => (await axios.get(`${API_INVENTORY}/balance`)).data 
  });
  
  const { data: locations = [] } = useQuery({ 
      queryKey: ['locations'], 
      queryFn: async () => (await axios.get(API_LOCATIONS)).data 
  });
  
  const { data: balanceData } = useQuery({
    queryKey: ['inventory-balance', itemId, sourceId],
    queryFn: async () => (await axios.get(`${API_INVENTORY}/balance?itemId=${itemId}&locationId=${sourceId}`)).data,
    enabled: !!itemId && !!sourceId,
  });

  useEffect(() => {
    if (balances.length > 0 && !itemId) setItemId(balances[0].item.id);
    if (locations.length > 0 && !sourceId) setSourceId(locations[0].id);
    if (locations.length > 1 && !targetId) setTargetId(locations[1].id);
  }, [balances, locations, itemId, sourceId, targetId]);

  const mutation = useMutation({
    mutationFn: async (payload: any) => axios.post(`${API_INVENTORY}/transaction`, payload),
    onSuccess: () => {
      Toast.fire({ icon: 'success', title: `Transferred successfully!` });
      setQuantity('');
      queryClient.invalidateQueries({ queryKey: ['inventory-balance'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balance-all'] });
    },
    onError: (err: any) => Toast.fire({ icon: 'error', title: err.response?.data?.message || 'Transfer failed' })
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || sourceId === targetId) {
      Toast.fire({ icon: 'error', title: 'Invalid locations or quantity' });
      return;
    }
    Swal.fire({
      title: 'Confirm Transfer', text: `Move ${quantity} units?`, icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#10b981', confirmButtonText: 'Yes, Transfer'
    }).then((result) => {
      if (result.isConfirmed) {
        const item = balances.find((b:any) => b.item.id === itemId)?.item;
        mutation.mutate({ 
            date: new Date().toISOString(),
            itemId, 
            fromLocationId: sourceId, 
            toLocationId: targetId, 
            transactionType: 'TRANSFER', 
            quantity: Number(quantity), 
            uom: item?.primaryUom || 'KG',
            createdBy: 'Farm Manager' 
        });
      }
    });
  };

  const selectedItem = balances.find((b:any) => b.item.id === itemId)?.item;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="relative overflow-hidden bg-slate-900 p-4 sm:p-6 text-white">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 shrink-0">
                <ArrowRightLeft size={22} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">Stock Transfer</h1>
                <p className="text-xs font-medium text-slate-400 mt-0.5">Move feed and materials between locations</p>
              </div>
            </div>
            {balanceData && (
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10 shrink-0">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="font-bold text-sm text-emerald-400 tabular-nums">{balanceData.balance.toLocaleString()}</span>
                <span className="text-xs text-slate-300">Available in Source</span>
              </div>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Select Item</label>
            <select className="w-full p-2.5 sm:p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={itemId} onChange={e => setItemId(e.target.value)}>
              {balances.map((b: any) => <option key={b.item.id} value={b.item.id}>{b.item.name} ({b.item.code})</option>)}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="space-y-1.5 flex-1">
              <label className="text-sm font-bold text-slate-700">Source Location</label>
              <select className="w-full p-2.5 sm:p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={sourceId} onChange={e => setSourceId(e.target.value)}>
                {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="flex justify-center sm:mt-5">
              <ArrowRightLeft className="text-slate-400 rotate-90 sm:rotate-0 transition-transform shrink-0" size={20} />
            </div>
            <div className="space-y-1.5 flex-1">
              <label className="text-sm font-bold text-slate-700">Target Location</label>
              <select className="w-full p-2.5 sm:p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={targetId} onChange={e => setTargetId(e.target.value)}>
                {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5 pt-1">
            <label className="text-sm font-bold text-slate-700">Transfer Quantity ({selectedItem?.primaryUom || 'Units'})</label>
            <input type="number" placeholder="e.g. 500" className="w-full p-3 sm:p-3.5 text-xl font-black text-slate-900 bg-white border-2 border-slate-200 rounded-xl outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all tabular-nums" value={quantity} onChange={e => setQuantity(e.target.value)} />
          </div>
          <div className="pt-4">
            <button type="submit" disabled={!quantity || mutation.isPending} className="w-full py-3 text-base bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 text-white font-bold rounded-xl flex justify-center items-center space-x-2 transition-all">
              <Send size={20} /><span>{mutation.isPending ? 'Processing...' : 'Execute Transfer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
