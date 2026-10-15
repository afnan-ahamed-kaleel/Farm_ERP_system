import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { ShieldCheck } from 'lucide-react';

export interface EggQualityDataPoint {
  name: string;
  value: number;
  color: string;
  condition: 'GOOD' | 'DIRTY' | 'DAMAGE' | 'REJECT';
}

const DEFAULT_QUALITY_DATA: EggQualityDataPoint[] = [
  { name: 'Good / Prime', value: 34200, color: '#10B981', condition: 'GOOD' },        // Emerald
  { name: 'Dirty (Washable)', value: 1650, color: '#F59E0B', condition: 'DIRTY' },     // Amber
  { name: 'Cracked / Damaged', value: 720, color: '#F43F5E', condition: 'DAMAGE' },    // Rose
  { name: 'Rejection / Leaker', value: 230, color: '#EF4444', condition: 'REJECT' },   // Red
];

interface Props {
  data?: EggQualityDataPoint[];
  isLoading?: boolean;
}

export default function EggQualityDonutChart({ data, isLoading }: Props) {
  const chartData = data && data.length > 0 ? data : DEFAULT_QUALITY_DATA;

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);
  const goodCount = chartData.find((d) => d.condition === 'GOOD')?.value || 0;
  const marketableRate = total > 0 ? ((goodCount / total) * 100).toFixed(1) : '0';

  // Custom Dark Mode Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as EggQualityDataPoint;
      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';

      return (
        <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md text-xs min-w-44 z-50">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-bold text-white text-sm">{item.name}</span>
          </div>
          <div className="flex justify-between items-baseline pt-1 border-t border-slate-800 text-slate-300">
            <span className="font-mono text-base font-black text-white">{item.value.toLocaleString()}</span>
            <span className="font-bold text-emerald-400 font-mono">{pct}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 text-white shadow-xl flex flex-col justify-between transition-all hover:border-slate-700 relative overflow-hidden group">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-sm">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Egg Quality Grading</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25">
                ISO 22000
              </span>
            </div>
            <p className="text-xs text-slate-400">Condition classification breakdown</p>
          </div>
        </div>
      </div>

      {/* Donut Chart with Centered KPI Label */}
      <div className="relative h-56 sm:h-60 w-full flex items-center justify-center my-2">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-slate-400 text-sm font-semibold animate-pulse">
            Loading quality distribution...
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Donut Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Marketable
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight leading-none mt-0.5">
                {marketableRate}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                Quality Grade A
              </span>
            </div>
          </>
        )}
      </div>

      {/* Legend & Breakdown Badges */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs"
          >
            <div className="flex items-center gap-1.5 truncate mr-1">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-300 font-medium truncate text-[11px]">{item.name}</span>
            </div>
            <span className="font-mono font-bold text-white text-[11px] shrink-0">
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
