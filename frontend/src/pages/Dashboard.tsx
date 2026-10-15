import EggProductionTrendChart from '../components/dashboard/EggProductionTrendChart';
import EggQualityDonutChart from '../components/dashboard/EggQualityDonutChart';
import FeedVsMortalityChart from '../components/dashboard/FeedVsMortalityChart';
import SalesRevenueBarChart from '../components/dashboard/SalesRevenueBarChart';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const ANALYTICS_URL = 'http://localhost:3000/api/v1/analytics/dashboard-summary';

export default function Dashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['dashboard-analytics-summary'],
    queryFn: async () => {
      try {
        const res = await axios.get(ANALYTICS_URL);
        return res.data;
      } catch (err) {
        return null;
      }
    },
    refetchInterval: 60000,
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* ── Enterprise Analytics Grid (Recharts) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
              Operational Performance Analytics
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Telemetry
            </span>
          </div>
        </div>

        {/* Row 1: Egg Production Trend (2 cols) & Egg Quality Donut (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EggProductionTrendChart data={analytics?.eggTrends} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-1">
            <EggQualityDonutChart data={analytics?.eggQuality} isLoading={isLoading} />
          </div>
        </div>

        {/* Row 2: Feed Inflow vs Mortality (1 col) & Sales Revenue (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FeedVsMortalityChart data={analytics?.feedMortality} isLoading={isLoading} />
          <SalesRevenueBarChart data={analytics?.salesRevenue} isLoading={isLoading} />
        </div>
      </section>
    </div>
  );
}
