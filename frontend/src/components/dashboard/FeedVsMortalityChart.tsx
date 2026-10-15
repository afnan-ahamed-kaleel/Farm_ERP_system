import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Utensils, HeartPulse, AlertTriangle } from 'lucide-react';

export interface HouseFeedMortalityPoint {
  house: string;
  feedIssuedKg: number;
  feedConsumedKg: number;
  mortality: number;
  mortalityLimit: number;
}

const DEFAULT_HOUSE_DATA: HouseFeedMortalityPoint[] = [
  { house: 'Shed 01', feedIssuedKg: 1450, feedConsumedKg: 1420, mortality: 6, mortalityLimit: 15 },
  { house: 'Shed 02', feedIssuedKg: 1520, feedConsumedKg: 1490, mortality: 8, mortalityLimit: 15 },
  { house: 'Shed 03', feedIssuedKg: 1380, feedConsumedKg: 1360, mortality: 4, mortalityLimit: 15 },
  { house: 'Shed 04', feedIssuedKg: 1620, feedConsumedKg: 1580, mortality: 18, mortalityLimit: 15 }, // Breach
  { house: 'Shed 05', feedIssuedKg: 1400, feedConsumedKg: 1390, mortality: 5, mortalityLimit: 15 },
  { house: 'Shed 06', feedIssuedKg: 1550, feedConsumedKg: 1510, mortality: 11, mortalityLimit: 15 },
];

interface Props {
  data?: HouseFeedMortalityPoint[];
  isLoading?: boolean;
}

export default function FeedVsMortalityChart({ data, isLoading }: Props) {
  const chartData = data && data.length > 0 ? data : DEFAULT_HOUSE_DATA;

  const totalIssued = chartData.reduce((acc, curr) => acc + curr.feedIssuedKg, 0);
  const totalConsumed = chartData.reduce((acc, curr) => acc + curr.feedConsumedKg, 0);
  const totalMortality = chartData.reduce((acc, curr) => acc + curr.mortality, 0);

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload as HouseFeedMortalityPoint;
      const isBreached = pData.mortality > pData.mortalityLimit;

      return (
        <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md text-xs z-50 min-w-52">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-white text-sm">{label}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                isBreached
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {isBreached ? 'Threshold Breach' : 'Normal State'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" />
                <span>Feed Issued:</span>
              </span>
              <span className="font-mono font-bold text-white">{pData.feedIssuedKg.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" />
                <span>Feed Consumed:</span>
              </span>
              <span className="font-mono font-bold text-white">{pData.feedConsumedKg.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-slate-300">
              <span className="flex items-center gap-1.5">
                <HeartPulse size={13} className="text-rose-400" />
                <span>Mortality (Loss):</span>
              </span>
              <span className={`font-mono font-bold ${isBreached ? 'text-rose-400 font-black' : 'text-slate-200'}`}>
                {pData.mortality} birds <span className="text-[10px] text-slate-400">(&gt; {pData.mortalityLimit})</span>
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 text-white shadow-xl flex flex-col justify-between transition-all hover:border-slate-700 relative overflow-hidden group">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-sm">
            <Utensils size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Feed Inflow vs. Consumption</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/25">
                House Audits
              </span>
            </div>
            <p className="text-xs text-slate-400">Daily KG intake compared against mortality threshold limits</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/25 px-2.5 py-1 rounded-lg text-rose-300 text-xs font-semibold">
            <AlertTriangle size={13} className="text-rose-400" />
            <span>Limit: 15 Loss/Day</span>
          </div>
        </div>
      </div>

      {/* Metric Mini-Badges */}
      <div className="grid grid-cols-3 gap-2.5 my-3.5">
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-2.5 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Feed Issued</span>
          <span className="text-base sm:text-lg font-black text-amber-400 font-mono mt-0.5">
            {totalIssued.toLocaleString()} <span className="text-xs font-bold text-slate-400">kg</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5">Shed dispatch</span>
        </div>
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-2.5 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consumed</span>
          <span className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">
            {totalConsumed.toLocaleString()} <span className="text-xs font-bold text-slate-400">kg</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold mt-0.5">
            {((totalConsumed / (totalIssued || 1)) * 100).toFixed(1)}% absorbed
          </span>
        </div>
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-2.5 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mortality Rate</span>
          <span className="text-base sm:text-lg font-black text-rose-400 font-mono mt-0.5">
            {totalMortality} <span className="text-xs font-bold text-slate-400">birds</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Across all sheds</span>
        </div>
      </div>

      {/* Main Bar Chart */}
      <div className="h-64 sm:h-72 w-full mt-1">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-slate-400 text-sm font-semibold animate-pulse">
            Loading feed analytics...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" opacity={0.4} vertical={false} />
              
              <XAxis
                dataKey="house"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />

              <YAxis
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}kg`}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                height={28}
                iconSize={8}
                formatter={(val) => (
                  <span className="text-[11px] font-semibold text-slate-300 capitalize">{val}</span>
                )}
              />

              {/* Reference line for max allowable mortality benchmark indicator */}
              <ReferenceLine
                y={1500}
                stroke="#F43F5E"
                strokeDasharray="4 4"
                label={{
                  value: 'Optimum Feed Target (1.5k kg)',
                  fill: '#F43F5E',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />

              <Bar dataKey="feedIssuedKg" name="Feed Issued" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="feedConsumedKg" name="Feed Consumed" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
