import { useState } from 'react';
import { Egg, Save, Plus, Minus, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';

const API_BASE_EGGS = 'http://localhost:3000/api/v1/eggs';
const API_BASE_TRACKING = 'http://localhost:3000/api/v1/bird-tracking';

const CONDITIONS = ['GOOD', 'DIRTY', 'DAMAGE', 'REJECTION'] as const;
const GRADES = ['JUMBO', 'XL', 'LARGE', 'MEDIUM', 'SMALL', 'PULLET'] as const;

type Grade = typeof GRADES[number];
type Condition = typeof CONDITIONS[number];
type Matrix = Record<Grade, Record<Condition, number>>;

const GRADE_STYLES: Record<Grade, { border: string; header: string; text: string; bar: string; badge: string }> = {
  JUMBO:  { border: 'border-violet-200', header: 'bg-violet-50', text: 'text-violet-700', bar: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700 border-violet-200' },
  XL:     { border: 'border-blue-200',   header: 'bg-blue-50',   text: 'text-blue-700',   bar: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  LARGE:  { border: 'border-emerald-200',header: 'bg-emerald-50',text: 'text-emerald-700',bar: 'bg-emerald-500',badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  MEDIUM: { border: 'border-amber-200',  header: 'bg-amber-50',  text: 'text-amber-700',  bar: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  SMALL:  { border: 'border-orange-200', header: 'bg-orange-50', text: 'text-orange-700', bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  PULLET: { border: 'border-rose-200',   header: 'bg-rose-50',   text: 'text-rose-700',   bar: 'bg-rose-500',   badge: 'bg-rose-100 text-rose-700 border-rose-200' },
};

const CONDITION_LABEL: Record<Condition, { color: string; dot: string }> = {
  GOOD:      { color: 'text-emerald-600', dot: 'bg-emerald-500' },
  DIRTY:     { color: 'text-amber-600',   dot: 'bg-amber-500' },
  DAMAGE:    { color: 'text-orange-600',  dot: 'bg-orange-500' },
  REJECTION: { color: 'text-red-600',     dot: 'bg-red-500' },
};

function makeEmptyMatrix(): Matrix {
  const m = {} as Matrix;
  GRADES.forEach(g => {
    m[g] = {} as Record<Condition, number>;
    CONDITIONS.forEach(c => { m[g][c] = 0; });
  });
  return m;
}

export default function DailyEggProductionScreen() {
  const [flockId, setFlockId] = useState('');
  const [houseId, setHouseId] = useState('');
  const [matrix, setMatrix] = useState<Matrix>(makeEmptyMatrix());

  const { data: flocks = [] } = useQuery({ queryKey: ['flocks'], queryFn: async () => (await axios.get(`${API_BASE_TRACKING}/flocks`)).data });
  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: async () => (await axios.get(`${API_BASE_TRACKING}/locations`)).data });

  const updateCell = (grade: Grade, cond: Condition, delta: number) => {
    setMatrix(prev => ({
      ...prev,
      [grade]: { ...prev[grade], [cond]: Math.max(0, (prev[grade][cond] || 0) + delta) }
    }));
  };

  const setCell = (grade: Grade, cond: Condition, val: string) => {
    const n = parseInt(val, 10);
    setMatrix(prev => ({
      ...prev,
      [grade]: { ...prev[grade], [cond]: isNaN(n) ? 0 : Math.max(0, n) }
    }));
  };

  const gradeTotal = (g: Grade) => CONDITIONS.reduce((s, c) => s + matrix[g][c], 0);
  const grandTotal = GRADES.reduce((s, g) => s + gradeTotal(g), 0);

  const mutation = useMutation({
    mutationFn: async (payload: any) => axios.post(`${API_BASE_EGGS}/daily-collection`, payload),
    onSuccess: (res) => {
      Swal.fire('Recorded!', `${res.data.totalCollected} eggs logged in batch ${res.data.batch}`, 'success');
      setMatrix(makeEmptyMatrix());
      setFlockId(''); setHouseId('');
    },
    onError: (err: any) => Swal.fire('Error', err.response?.data?.message || 'Failed', 'error'),
  });

  const handleSubmit = () => {
    if (!flockId || !houseId) return Swal.fire('Required', 'Select a flock and house first', 'warning');
    if (grandTotal === 0) return Swal.fire('Empty', 'Enter at least one egg count', 'warning');
    const entries: any[] = [];
    GRADES.forEach(g => CONDITIONS.forEach(c => {
      if (matrix[g][c] > 0) entries.push({ grade: g, condition: c, quantity: matrix[g][c] });
    }));
    mutation.mutate({ flockId, houseLocationId: houseId, operatorId: 'Operator 1', entries });
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-3.5 animate-in fade-in duration-300 pb-2">

      {/* ── Standard Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-purple-900 px-4 sm:px-5 py-3.5 text-white shadow-lg shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-pink-500/20 blur-2xl" />
        <div className="flex items-center space-x-3 sm:space-x-4 relative z-10">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-purple-500 text-white shadow-md shadow-purple-500/30 shrink-0">
            <Egg size={22} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">Daily Egg Collection</h1>
            <p className="text-xs font-medium text-purple-200 mt-0.5">Record today's yield directly from the sheds</p>
          </div>
        </div>
        
        {/* Total Yield badge in Header with Vibrant Gradient Background */}
        <div className="relative z-10 flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 border border-white/25 rounded-xl px-4 sm:px-5 py-2 shadow-lg shadow-black/20">
           <p className="text-[10px] font-extrabold uppercase tracking-widest text-purple-100 sm:mb-0.5">Total Yield</p>
           <div className="flex items-baseline space-x-1.5">
             <span className="text-2xl sm:text-3xl font-black text-white tabular-nums leading-none drop-shadow-sm">{grandTotal.toLocaleString()}</span>
             <span className="text-xs font-bold text-purple-100">eggs</span>
           </div>
        </div>
      </div>

      {/* ── Context Selectors, By Condition Badges & Save Button ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white px-3.5 py-3 rounded-2xl shadow-sm border border-slate-200/90 shrink-0 w-full">
        
        {/* Left: Selectors with responsive width */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative flex items-center justify-between sm:justify-start gap-1.5">
             <label className="text-xs font-bold text-slate-700 whitespace-nowrap min-w-20 sm:min-w-0">Flock Batch</label>
            <div className="relative flex-1 sm:w-36">
              <select
                className="w-full appearance-none pl-2.5 pr-7 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 outline-none text-slate-700 transition-all truncate"
                value={flockId} onChange={e => setFlockId(e.target.value)}
              >
                <option value="">Select Flock...</option>
                {flocks.map((f: any) => <option key={f.id} value={f.id}>{f.batchNumber}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="relative flex items-center justify-between sm:justify-start gap-1.5">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap min-w-20 sm:min-w-0">Collection House</label>
            <div className="relative flex-1 sm:w-36">
              <select
                className="w-full appearance-none pl-2.5 pr-7 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 outline-none text-slate-700 transition-all truncate"
                value={houseId} onChange={e => setHouseId(e.target.value)}
              >
                <option value="">Select Shed...</option>
                {locations.filter((l: any) => l.type !== 'FARM').map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Center: By Condition Counts Badges (Qualities on top, counts below on mobile, row on desktop - NO SCROLL) */}
        <div className="grid grid-cols-4 sm:flex items-center gap-1.5 sm:gap-3 p-1.5 sm:px-3 sm:py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs w-full sm:w-auto">
          {CONDITIONS.map(c => {
            const total = GRADES.reduce((s, g) => s + matrix[g][c], 0);
            const cl = CONDITION_LABEL[c];
            return (
              <div key={c} className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 p-1 sm:p-0 rounded-lg bg-white sm:bg-transparent border sm:border-0 border-slate-100">
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${cl.dot}`} />
                  <span className={`text-[10px] sm:text-[11px] font-bold ${cl.color} uppercase`}>{c}</span>
                </div>
                <span className="text-[11px] sm:text-xs font-black text-slate-800 bg-slate-50 sm:bg-white px-1 sm:px-1.5 py-0.5 rounded-md border border-slate-200 shadow-xs tabular-nums text-center w-full sm:w-auto">
                  {total.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Record Eggs button cleanly contained within the container */}
        <button
          onClick={handleSubmit}
          disabled={mutation.isPending || grandTotal === 0 || !flockId || !houseId}
          className="flex justify-center items-center gap-2 w-full sm:w-auto px-5 py-2.5 sm:py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:grayscale text-white rounded-xl shadow-md shadow-purple-600/20 transition-all shrink-0"
        >
          <Save size={15} />
          {mutation.isPending ? 'Saving...' : `Record ${grandTotal > 0 ? grandTotal.toLocaleString() : ''} Eggs`}
        </button>
      </div>

      {/* ── Body: 2x3 Cards Grid + Grade Breakdown Sidebar ── */}
      <div className="flex flex-col lg:flex-row gap-3 flex-1 items-stretch">

        {/* Left Area: 6 Grade Cards in 2 rows x 3 cols */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {GRADES.map(grade => {
            const s = GRADE_STYLES[grade];
            const total = gradeTotal(grade);
            return (
              <div
                key={grade}
                className={`bg-white border ${s.border} rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow justify-between`}
              >
                {/* Card header */}
                <div className={`${s.header} px-4 py-2 flex items-center justify-between border-b ${s.border}`}>
                  <span className={`text-sm font-black uppercase tracking-wider ${s.text}`}>{grade}</span>
                  <span className={`text-xs font-black tabular-nums px-2.5 py-0.5 rounded-lg border ${s.badge}`}>
                    {total.toLocaleString()}
                  </span>
                </div>

                {/* Condition rows */}
                <div className="flex flex-col px-4 py-2 gap-2 justify-around flex-1">
                  {CONDITIONS.map(cond => {
                    const cl = CONDITION_LABEL[cond];
                    const val = matrix[grade][cond];
                    return (
                      <div key={cond} className="flex items-center gap-2">
                        {/* Dot + label */}
                        <div className="flex items-center gap-2 w-24 shrink-0">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${cl.dot}`} />
                          <span className={`text-xs font-bold uppercase tracking-wide ${cl.color}`}>{cond}</span>
                        </div>

                        {/* Counter controls */}
                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            onClick={() => updateCell(grade, cond, -1)}
                            disabled={val === 0}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-all disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <Minus size={14} />
                          </button>

                          <input
                            type="number"
                            min="0"
                            className="w-14 text-center text-sm font-black text-slate-800 bg-slate-50 border border-slate-200 rounded-lg py-0.5 outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white tabular-nums transition-all"
                            value={val === 0 ? '' : val}
                            placeholder="0"
                            onChange={e => setCell(grade, cond, e.target.value)}
                          />

                          <button
                            onClick={() => updateCell(grade, cond, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-all"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Right Column: Grade Breakdown ── */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Grade Breakdown</p>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                  {grandTotal.toLocaleString()} total
                </span>
              </div>
              <div className="space-y-3">
                {GRADES.map(g => {
                  const total = gradeTotal(g);
                  const pct = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
                  const s = GRADE_STYLES[g];
                  return (
                    <div key={g}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-black ${s.text}`}>{g}</span>
                        <span className="text-xs font-black text-slate-700 tabular-nums">
                          {total.toLocaleString()}
                          <span className="text-[10px] font-normal text-slate-400 ml-1">({pct.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.bar} transition-all duration-300`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
              <span className="text-xs font-medium text-slate-400">Live dynamic distribution</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
