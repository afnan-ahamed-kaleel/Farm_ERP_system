import { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Egg } from 'lucide-react';

export interface EggProductionDataPoint {
  date: string;
  dayLabel: string;
  small: number;
  medium: number;
  large: number;
  jumbo: number;
  henDayPct: number;
}

// Realistic 7-day and 30-day poultry production mock datasets
const DEFAULT_7D_DATA: EggProductionDataPoint[] = [
  { date: '2026-10-09', dayLabel: 'Fri 09', small: 3200, medium: 9400, large: 14800, jumbo: 4600, henDayPct: 88.4 },
  { date: '2026-10-10', dayLabel: 'Sat 10', small: 3100, medium: 9600, large: 15200, jumbo: 4800, henDayPct: 89.2 },
  { date: '2026-10-11', dayLabel: 'Sun 11', small: 3400, medium: 9500, large: 15000, jumbo: 4700, henDayPct: 88.9 },
  { date: '2026-10-12', dayLabel: 'Mon 12', small: 2900, medium: 9800, large: 15600, jumbo: 5100, henDayPct: 91.0 },
  { date: '2026-10-13', dayLabel: 'Tue 13', small: 3050, medium: 9700, large: 15400, jumbo: 4950, henDayPct: 90.3 },
  { date: '2026-10-14', dayLabel: 'Wed 14', small: 2800, medium: 9900, large: 15800, jumbo: 5200, henDayPct: 91.8 },
  { date: '2026-10-15', dayLabel: 'Thu 15', small: 3150, medium: 10100, large: 16100, jumbo: 5400, henDayPct: 93.1 },
];

const DEFAULT_30D_DATA: EggProductionDataPoint[] = [
  { date: '2026-09-16', dayLabel: 'Wk 1-1', small: 3100, medium: 8800, large: 13900, jumbo: 4200, henDayPct: 85.0 },
  { date: '2026-09-20', dayLabel: 'Wk 1-5', small: 3200, medium: 9000, large: 14200, jumbo: 4300, henDayPct: 86.2 },
  { date: '2026-09-24', dayLabel: 'Wk 2-2', small: 3050, medium: 9200, large: 14500, jumbo: 4500, henDayPct: 87.1 },
  { date: '2026-09-28', dayLabel: 'Wk 2-6', small: 3150, medium: 9350, large: 14700, jumbo: 4600, henDayPct: 87.8 },
  { date: '2026-10-02', dayLabel: 'Wk 3-3', small: 3000, medium: 9500, large: 15000, jumbo: 4800, henDayPct: 89.0 },
  { date: '2026-10-06', dayLabel: 'Wk 3-7', small: 2950, medium: 9600, large: 15300, jumbo: 4900, henDayPct: 89.8 },
  { date: '2026-10-10', dayLabel: 'Wk 4-4', small: 3100, medium: 9750, large: 15500, jumbo: 5100, henDayPct: 90.9 },
  { date: '2026-10-15', dayLabel: 'Today', small: 3150, medium: 10100, large: 16100, jumbo: 5400, henDayPct: 93.1 },
];

interface Props {
  data?: EggProductionDataPoint[];
  isLoading?: boolean;
}

export default function EggProductionTrendChart({ data, isLoading }: Props) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  const activeData = data && data.length > 0 
    ? data 
    : timeRange === '7d' 
      ? DEFAULT_7D_DATA 
      : DEFAULT_30D_DATA;

  // Aggregate stats
  const totalEggs = activeData.reduce(
    (sum, d) => sum + d.small + d.medium + d.large + d.jumbo,
    0
  );
  const avgHenDay = (
    activeData.reduce((sum, d) => sum + d.henDayPct, 0) / (activeData.length || 1)
  ).toFixed(1);
  const peakDay = [...activeData].sort(
    (a, b) => (b.small + b.medium + b.large + b.jumbo) - (a.small + a.medium + a.large + a.jumbo)
  )[0];

  // Custom Dark Mode Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload as EggProductionDataPoint;
      const dayTotal = pData.small + pData.medium + pData.large + pData.jumbo;

      return (
        <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md text-xs z-50 min-w-52">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
            <span className="font-bold text-white text-sm">{label}</span>
            <span className="font-mono text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {pData.henDayPct.toFixed(1)}% Hen-Day
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#8B5CF6]" />
                <span>Jumbo:</span>
              </span>
              <span className="font-mono font-bold text-white">{pData.jumbo.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#06B6D4]" />
                <span>Large:</span>
              </span>
              <span className="font-mono font-bold text-white">{pData.large.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" />
                <span>Medium:</span>
              </span>
              <span className="font-mono font-bold text-white">{pData.medium.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" />
                <span>Small:</span>
              </span>
              <span className="font-mono font-bold text-white">{pData.small.toLocaleString()}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold text-white">
              <span>Total Harvest:</span>
              <span className="font-mono text-emerald-400 text-sm">{dayTotal.toLocaleString()} eggs</span>
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
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl" />
      
      {/* Top Header & Range Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-sm">
            <Egg size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Egg Production Trends</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/25">
                Dual Axis
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Harvested grade volume (stacked) & Hen-Day Production efficiency
            </p>
          </div>
        </div>

        {/* 7-day / 30-day Toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-800/90 p-1 border border-slate-700/80">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                timeRange === '7d'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                timeRange === '30d'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {/* Mini KPI Highlights Row */}
      <div className="grid grid-cols-3 gap-2.5 my-3.5">
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-2.5 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Harvest</span>
          <span className="text-base sm:text-lg font-black text-white font-mono mt-0.5">
            {totalEggs.toLocaleString()}
          </span>
          <span className="text-[10px] text-cyan-400 font-semibold mt-0.5">Grade Stacked</span>
        </div>
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-2.5 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Hen-Day</span>
          <span className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">
            {avgHenDay}%
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold mt-0.5">Target &gt; 85%</span>
        </div>
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-2.5 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peak Collection</span>
          <span className="text-base sm:text-lg font-black text-violet-400 font-mono mt-0.5">
            {peakDay ? (peakDay.small + peakDay.medium + peakDay.large + peakDay.jumbo).toLocaleString() : '—'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
            {peakDay?.dayLabel || 'Day peak'}
          </span>
        </div>
      </div>

      {/* Main Dual-Axis Chart */}
      <div className="h-64 sm:h-72 w-full mt-1">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-slate-400 text-sm font-semibold animate-pulse">
            Loading analytics trends...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={activeData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="henDayGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#334155" strokeDasharray="3 3" opacity={0.4} vertical={false} />
              
              <XAxis
                dataKey="dayLabel"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />

              {/* Primary Y-Axis (Left): Egg Volume */}
              <YAxis
                yAxisId="left"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />

              {/* Secondary Y-Axis (Right): Hen-Day % */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[70, 100]}
                stroke="#F43F5E"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}%`}
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

              {/* Stacked Bars for Egg Grades */}
              <Bar yAxisId="left" dataKey="small" name="Small" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} maxBarSize={36} />
              <Bar yAxisId="left" dataKey="medium" name="Medium" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} maxBarSize={36} />
              <Bar yAxisId="left" dataKey="large" name="Large" stackId="a" fill="#06B6D4" radius={[0, 0, 0, 0]} maxBarSize={36} />
              <Bar yAxisId="left" dataKey="jumbo" name="Jumbo" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={36} />

              {/* Smooth Hen-Day % Line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="henDayPct"
                name="Hen-Day %"
                stroke="#F43F5E"
                strokeWidth={3}
                dot={{ r: 4, fill: '#F43F5E', stroke: '#0F172A', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#F43F5E', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
