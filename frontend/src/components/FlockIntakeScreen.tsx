import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Save, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import QuickAddModal from './QuickAddModal';

const API_BASE = 'http://localhost:3000/api/v1/bird-tracking';
const API_MASTER = 'http://localhost:3000/api/v1/master-data';

const Toast = Swal.mixin({
  toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
});

export default function FlockIntakeScreen() {
  const [flockId, setFlockId] = useState('');

  const [targetId, setTargetId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [quickAddType, setQuickAddType] = useState<'flock' | 'supplier' | 'location' | null>(null);

  const { data: flocks = [], isLoading: isLoadingFlocks, refetch: refetchFlocks } = useQuery({ queryKey: ['flocks'], queryFn: async () => (await axios.get(`${API_BASE}/flocks`)).data });
  const { data: locations = [], isLoading: isLoadingLocs, refetch: refetchLocations } = useQuery({ queryKey: ['locations'], queryFn: async () => (await axios.get(`${API_BASE}/locations`)).data });
  const { data: suppliers = [], refetch: refetchSuppliers } = useQuery({ queryKey: ['master-suppliers'], queryFn: async () => (await axios.get(`${API_MASTER}/suppliers`)).data });


  useEffect(() => {
    if (flocks.length > 0 && !flockId) setFlockId(flocks[0].id);
    if (locations.length > 0 && !targetId) setTargetId(locations[0].id);
  }, [flocks, locations, flockId, targetId]);

  const mutation = useMutation({
    mutationFn: async (newMovement: any) => axios.post(`${API_BASE}/movements`, newMovement),
    onSuccess: (res) => {
      Toast.fire({ icon: 'success', title: `Successfully received ${quantity} chicks.` });
      setQuantity('');
      return axios.post(`${API_BASE}/movements/${res.data.id}/post`, { approvedBy: 'Operator' });
    },
    onError: (err: any) => Toast.fire({ icon: 'error', title: err.response?.data?.message || 'Failed' })
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!quantity) return;
    Swal.fire({
      title: 'Confirm Intake?', text: `Register ${quantity} chicks?`, icon: 'question',
      showCancelButton: true, confirmButtonColor: '#3b82f6', confirmButtonText: 'Yes, Register!'
    }).then((result) => {
      if (result.isConfirmed) {
        mutation.mutate({ flockId, sourceLocationId: targetId, targetLocationId: targetId, pathway: 'INTAKE', quantity: Number(quantity), date: new Date().toISOString(), createdBy: 'Operator' });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="relative overflow-hidden bg-slate-900 p-4 sm:p-6 text-white">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="flex items-center space-x-3 sm:space-x-4 relative z-10">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/30 overflow-hidden relative shrink-0">
              <div className="absolute inset-0 scale-[1.7]">
                <DotLottieReact src="/Truck.lottie" loop autoplay />
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">Flock Intake</h1>
              <p className="text-xs font-medium text-slate-400 mt-0.5">Receive Day Old Chicks into the Brooder</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Assign to Flock Batch</label>
                <button
                  type="button"
                  onClick={() => setQuickAddType('flock')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  <Plus size={12} />
                  <span>+ Add Flock</span>
                </button>
              </div>
              <select className="w-full p-2.5 sm:p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm font-semibold" value={flockId} onChange={e => setFlockId(e.target.value)} disabled={isLoadingFlocks}>
                {isLoadingFlocks ? <option>Loading...</option> : flocks.map((f: any) => <option key={f.id} value={f.id}>{f.batchNumber} ({f.breed})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Supplier / Hatchery</label>
                <button
                  type="button"
                  onClick={() => setQuickAddType('supplier')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  <Plus size={12} />
                  <span>+ Add Supplier</span>
                </button>
              </div>
              <select 
                className="w-full p-2.5 sm:p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm font-semibold" 
                value={supplier} 
                onChange={e => setSupplier(e.target.value)}
              >
                <option value="">Select Hatchery...</option>
                {suppliers.map((s: any) => (
                  <option key={s.id} value={s.name}>{s.name} ({s.type || 'Hatchery'})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700">Receiving House (Target)</label>
              <button
                type="button"
                onClick={() => setQuickAddType('location')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                <Plus size={12} />
                <span>+ Add House</span>
              </button>
            </div>
            <select className="w-full p-2.5 sm:p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm font-semibold" value={targetId} onChange={e => setTargetId(e.target.value)} disabled={isLoadingLocs}>
              {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name} ({l.type})</option>)}
            </select>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-sm font-bold text-slate-700">Received Quantity (Alive)</label>
            <input type="number" placeholder="e.g. 15000" className="w-full p-3 sm:p-3.5 text-xl font-black text-slate-900 bg-white border-2 border-slate-200 rounded-xl outline-none shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 tabular-nums" value={quantity} onChange={e => setQuantity(e.target.value)} />
          </div>
          <div className="pt-4">
            <button type="submit" disabled={!quantity || mutation.isPending} className="w-full py-3 text-base bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-50 disabled:hover:shadow-none disabled:bg-slate-300 text-white font-bold rounded-xl flex justify-center items-center space-x-2 transition-all">
              <Save size={18} className="sm:w-5 sm:h-5" /><span>{mutation.isPending ? 'Processing...' : 'Register Flock Intake'}</span>
            </button>
          </div>
        </form>
      </div>

      <QuickAddModal
        entityType={quickAddType || 'flock'}
        isOpen={!!quickAddType}
        onClose={() => setQuickAddType(null)}
        onCreated={(newRecord) => {
          if (quickAddType === 'flock') {
            refetchFlocks();
            if (newRecord?.id) setFlockId(newRecord.id);
          } else if (quickAddType === 'supplier') {
            refetchSuppliers();
            if (newRecord?.name) setSupplier(newRecord.name);
          } else if (quickAddType === 'location') {
            refetchLocations();
            if (newRecord?.id) setTargetId(newRecord.id);
          }
        }}
      />
    </div>
  );
}

