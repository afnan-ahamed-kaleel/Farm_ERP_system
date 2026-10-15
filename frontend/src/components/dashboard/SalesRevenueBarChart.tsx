import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Truck } from 'lucide-react';

export interface SalesRevenueDataPoint {
  week: string;
  cratesDispatched: number;
  revenueLkr: number;
}

const DEFAULT_SALES_DATA: SalesRevenueDataPoint[] = [
  { week: 'Wk 37', cratesDispatched: 820, revenueLkr: 2952000 },
  { week: 'Wk 38', cratesDispatched: 890, revenueLkr: 3204000 },
  { week: 'Wk 39', cratesDispatched: 940, revenueLkr: 3478000 },
  { week: 'Wk 40', cratesDispatched: 910, revenueLkr: 3367000 },
  { week: 'Wk 41', cratesDispatched: 1020, revenueLkr: 3876000 },
  { week: 'Wk 42', cratesDispatched: 1150, revenueLkr: 4485000 },
];

interface Props {
  data?: SalesRevenueDataPoint[];
  isLoading?: boolean;
}

export default function SalesRevenueBarChart({ data, isLoading }: Props) {
  const chartData = data && data.length > 0 ? data : DEFAULT_SALES_DATA;

  const totalCrates = chartData.reduce((acc, curr) => acc + curr.cratesDispatched, 0);
  const totalRevenue = chartData.reduce((acc, curr) => acc + curr.revenueLkr, 0);
  const avgPricePerCrate = totalCrates > 0 ? Math.round(totalRevenue / totalCrates) : 0;

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload as SalesRevenueDataPoint;

      return (
        <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md text-xs z-50 min-w-52">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-white text-sm">{label} Commercial</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Dispatched
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#8B5CF6]" />
                <span>Crates Dispatched:</span>
              </span>
              <span className="font-mono font-bold text-white">{pData.cratesDispatched.toLocaleString()} crates</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" />
                <span>Gross Revenue:</span>
              </span>
              <span className="font-mono font-bold text-emerald-400">
                LKR {(pData.revenueLkr / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-slate-400 text-[11px]">
              <span>Realized Price/Crate:</span>
              <span className="font-mono font-semibold text-white">
                LKR {Math.round(pData.revenueLkr / (pData.cratesDispatched || 1)).toLocaleString()}
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
      <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 shadow-sm">
            <Truck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Sales Dispatch & Commercial Revenue</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/15 px-2 py-0.5 rounded-full border border-violet-500/25">
                Fleet Fulfillment
              </span>
            </div>
            <p className="text-xs text-slate-400">Weekly crates delivered and gross realized cashflow (LKR)</p>
          </div>
        </div>
      </div>

      {/* Mini Metric Badges at Top */}
      <div className="grid grid-cols-3 gap-2.5 my-3.5">
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-2.5 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Dispatch Volume</span>
          <span className="text-base sm:text-lg font-black text-white font-mono mt-0.5">
            {totalCrates.toLocaleString()} <span className="text-xs font-bold text-slate-400">crates</span>
          </span>
          <span className="text-[10px] text-violet-400 font-semibold mt-0.5">360 eggs / crate</span>
        </div>
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-2.5 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Price/Crate</span>
          <span className="text-base sm:text-lg font-black text-cyan-400 font-mono mt-0.5">
            LKR {avgPricePerCrate.toLocaleString()}
          </span>
          <span className="text-[10px] text-cyan-400 font-semibold mt-0.5">Wholesale average</span>
        </div>
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-2.5 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Period Revenue</span>
          <span className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">
            LKR {(totalRevenue / 1000000).toFixed(2)}M
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold mt-0.5">Realized Inflow</span>
        </div>
      </div>

      {/* Main Dual Bar Chart */}
      <div className="h-64 sm:h-72 w-full mt-1">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-slate-400 text-sm font-semibold animate-pulse">
            Loading sales dispatch analytics...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" opacity={0.4} vertical={false} />
              
              <XAxis
                dataKey="week"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />

              {/* Y-Axis (Left): Crates Dispatched */}
              <YAxis
                yAxisId="crates"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}`}
              />

              {/* Y-Axis (Right): Revenue LKR in Millions */}
              <YAxis
                yAxisId="revenue"
                orientation="right"
                stroke="#10B981"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
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

              <Bar yAxisId="crates" dataKey="cratesDispatched" name="Crates Dispatched" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar yAxisId="revenue" dataKey="revenueLkr" name="Revenue (LKR)" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
