import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { CheckCircle2, ShieldAlert, HeartPulse, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import { differenceInDays } from 'date-fns';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import QuickAddModal from './QuickAddModal';

const API_BASE = 'http://localhost:3000/api/v1/bird-tracking';
const API_MASTER = 'http://localhost:3000/api/v1/master-data';

const Toast = Swal.mixin({
  toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
});

export default function DailyMortalityScreen() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [flockId, setFlockId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [mortality, setMortality] = useState('');
  const [culling, setCulling] = useState('');
  const [cause, setCause] = useState('Natural');
  const [isQuickAddCauseOpen, setIsQuickAddCauseOpen] = useState(false);

  const { data: flocks = [] } = useQuery({ queryKey: ['flocks'], queryFn: async () => (await axios.get(`${API_BASE}/flocks`)).data });
  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: async () => (await axios.get(`${API_BASE}/locations`)).data });
  const { data: causes = [], refetch: refetchCauses } = useQuery({
    queryKey: ['master-reasons-mortality'],
    queryFn: async () => (await axios.get(`${API_MASTER}/reasons?category=MORTALITY_CAUSE`)).data,
  });

  const { data: balanceData } = useQuery({
    queryKey: ['balance', flockId, locationId],
    queryFn: async () => (await axios.get(`${API_BASE}/balance?flockId=${flockId}&locationId=${locationId}`)).data,
    enabled: !!flockId && !!locationId,
  });

  useEffect(() => {
    if (flocks.length > 0 && !flockId) setFlockId(flocks[0].id);
    if (locations.length > 0 && !locationId) setLocationId(locations[0].id);
  }, [flocks, locations, flockId, locationId]);

  const activeFlock = flocks.find((f: any) => f.id === flockId);
  let ageString = 'Unknown Age';
  if (activeFlock && date) {
    const totalDays = differenceInDays(new Date(date), new Date(activeFlock.hatchDate));
    if (totalDays >= 0) {
      const weeks = Math.floor(totalDays / 7);
      const days = totalDays % 7;
      ageString = `Week ${weeks}, Day ${days} (${totalDays} Days)`;
    }
  }

  const mutation = useMutation({
    mutationFn: async (payload: any) => axios.post(`${API_BASE}/mortality`, payload),
    onSuccess: () => {
      Toast.fire({ icon: 'success', title: 'Mortality recorded successfully' });
      setMortality(''); setCulling('');
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (err: any) => Toast.fire({ icon: 'error', title: err.response?.data?.message || 'Failed' })
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mCount = Number(mortality) || 0;
    const cCount = Number(culling) || 0;
    if (mCount === 0 && cCount === 0) return;

    if (balanceData && (mCount + cCount) > balanceData.liveBalance) {
      Toast.fire({ icon: 'error', title: 'Losses exceed live balance!' });
      return;
    }

    Swal.fire({
      title: 'Confirm Recording', text: `Record ${mCount} dead and ${cCount} culled?`, icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#f97316', confirmButtonText: 'Yes, Submit'
    }).then((result) => {
      if (result.isConfirmed) {
        mutation.mutate({ flockId, locationId, date: new Date(date).toISOString(), mortalityCount: mCount, cullingCount: cCount, cause, operatorId: 'Operator' });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="relative overflow-hidden bg-slate-900 p-4 sm:p-6 text-white">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/30 overflow-hidden relative shrink-0">
                <div className="absolute inset-0 scale-[2]">
                  <DotLottieReact src="/Heartbeat.lottie" loop autoplay />
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">Daily Mortality</h1>
                <p className="text-xs font-medium text-slate-400 mt-0.5">Record daily losses and culling</p>
              </div>
            </div>
            {balanceData && (
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10 shrink-0">
                <CheckCircle2 size={16} className="text-orange-400" />
                <span className="font-bold text-sm text-orange-400 tabular-nums">{balanceData.liveBalance.toLocaleString()}</span>
                <span className="text-xs text-slate-300">Alive</span>
              </div>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="bg-orange-50/50 border border-orange-100 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2 text-orange-700">
              <ShieldAlert size={18} />
              <span className="font-bold text-sm">Flock Age</span>
            </div>
            <span className="font-black text-sm text-orange-600">{ageString}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Record Date</label>
              <input type="date" className="w-full p-2.5 sm:p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Flock Batch</label>
              <select className="w-full p-2.5 sm:p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" value={flockId} onChange={e => setFlockId(e.target.value)}>
                {flocks.map((f: any) => <option key={f.id} value={f.id}>{f.batchNumber}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
              <label className="text-sm font-bold text-slate-700">House/Location</label>
              <select className="w-full p-2.5 sm:p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" value={locationId} onChange={e => setLocationId(e.target.value)}>
                {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Mortality Count (Found Dead)</label>
              <input type="number" className="w-full p-3 sm:p-3.5 text-xl font-black text-slate-900 bg-white border-2 border-slate-200 rounded-xl outline-none shadow-sm focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 tabular-nums" value={mortality} onChange={e => setMortality(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Culling Count (Removed)</label>
              <input type="number" className="w-full p-3 sm:p-3.5 text-xl font-black text-slate-900 bg-white border-2 border-slate-200 rounded-xl outline-none shadow-sm focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 tabular-nums" value={culling} onChange={e => setCulling(e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700">Primary Mortality Cause</label>
              <button
                type="button"
                onClick={() => setIsQuickAddCauseOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-800 hover:underline cursor-pointer"
              >
                <Plus size={12} />
                <span>+ Add Cause</span>
              </button>
            </div>
            <select className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-semibold text-slate-800" value={cause} onChange={e => setCause(e.target.value)}>
              {causes.length > 0 ? (
                causes.map((c: any) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))
              ) : (
                <>
                  <option value="Natural">Natural Causes</option>
                  <option value="Disease">Disease / Infection</option>
                  <option value="Heat Stress">Heat Stress</option>
                  <option value="Smothering">Smothering</option>
                </>
              )}
            </select>
          </div>
          
          <div className="pt-4">
            <button type="submit" disabled={(!mortality && !culling) || mutation.isPending} className="w-full py-3 text-base bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 disabled:hover:shadow-none disabled:bg-slate-300 text-white font-bold rounded-xl flex justify-center items-center space-x-2 transition-all">
              <HeartPulse size={20} /><span>{mutation.isPending ? 'Saving...' : 'Record Mortality Data'}</span>
            </button>
          </div>
        </form>
      </div>

      <QuickAddModal
        entityType="cause"
        title="Quick Add Mortality Cause"
        isOpen={isQuickAddCauseOpen}
        onClose={() => setIsQuickAddCauseOpen(false)}
        onCreated={(newReason) => {
          refetchCauses();
          if (newReason?.name) setCause(newReason.name);
        }}
      />
    </div>
  );
}

