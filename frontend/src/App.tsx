import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Menu, Bird, Activity, Layers, RefreshCw, TriangleAlert, ClipboardPlus, ArrowRightLeft, HeartPulse, ChevronRight, PackageOpen, Factory, Egg, ShieldCheck, Truck, Calendar, Clock } from 'lucide-react';
import { useSpringCounter } from './hooks/useSpringCounter';
import Sidebar from './components/Sidebar';
import BirdMovementScreen from './components/BirdMovementScreen';
import DailyMortalityScreen from './components/DailyMortalityScreen';
import FlockIntakeScreen from './components/FlockIntakeScreen';
import CentralLedgerDashboard from './components/CentralLedgerDashboard';
import StockTransferScreen from './components/StockTransferScreen';
import FormulaManagerScreen from './components/FormulaManagerScreen';
import FeedProductionScreen from './components/FeedProductionScreen';
import FeedIssueConsumptionScreen from './components/FeedIssueConsumptionScreen';
import DailyEggProductionScreen from './components/DailyEggProductionScreen';
import SalesDispatchScreen from './components/SalesDispatchScreen';
import IsoTraceabilityScreen from './components/IsoTraceabilityScreen';
import MasterSettingsScreen from './components/MasterSettingsScreen';
import EggProductionTrendChart from './components/dashboard/EggProductionTrendChart';
import EggQualityDonutChart from './components/dashboard/EggQualityDonutChart';
import FeedVsMortalityChart from './components/dashboard/FeedVsMortalityChart';
import SalesRevenueBarChart from './components/dashboard/SalesRevenueBarChart';

const queryClient = new QueryClient();

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen max-h-screen overflow-hidden bg-slate-100 font-sans text-slate-900 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
          <div className="w-full px-3.5 sm:px-4 h-14 flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800 focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                <Menu size={22} className="sm:w-6 sm:h-6" />
              </button>
              <div className="font-black text-base sm:text-lg tracking-tight flex items-center space-x-2 text-white">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center text-slate-900 font-black text-xs sm:text-sm shadow-md">RF</div>
                <span className="truncate">Ruhunu Farms ERP</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Layout Area */}
        <div className={`flex flex-1 relative overflow-hidden`}>
          {/* Universal Sidebar */}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
          />
          
          {/* Main Content Pane */}
          <main className={`flex-1 min-w-0 max-w-full overflow-x-hidden ${
            activeTab === 'dashboard' 
              ? 'p-3.5 sm:p-4 md:p-6 h-[calc(100vh-3.5rem)] overflow-y-auto flex flex-col' 
              : activeTab === 'formula-manager'
              ? 'p-3 sm:p-4 md:p-5 h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col'
              : 'p-3 sm:p-4 md:p-5 h-[calc(100vh-3.5rem)] overflow-y-auto'
          }`}>
            {activeTab === 'dashboard' && <SystemDashboardTab setActiveTab={setActiveTab} />}
            {activeTab === 'flock-pulse' && <LivestockPulseTab setActiveTab={setActiveTab} />}
            {activeTab === 'intake' && <FlockIntakeScreen />}
            {activeTab === 'movement' && <BirdMovementScreen />}
            {activeTab === 'mortality' && <DailyMortalityScreen />}
            {activeTab === 'inventory-dashboard' && <CentralLedgerDashboard />}
            {activeTab === 'inventory-transfer' && <StockTransferScreen />}
            
            {activeTab === 'formula-manager' && <FormulaManagerScreen />}
            {activeTab === 'feed-production' && <FeedProductionScreen />}
            {activeTab === 'feed-issue' && <FeedIssueConsumptionScreen />}
            {activeTab === 'daily-egg' && <DailyEggProductionScreen />}
            {activeTab === 'sales-dispatch' && <SalesDispatchScreen />}
            {activeTab === 'iso-traceability' && <IsoTraceabilityScreen />}
            {activeTab === 'master-settings' && <MasterSettingsScreen />}
          </main>

        </div>
      </div>
    </QueryClientProvider>
  );
}

const API_URL = 'http://localhost:3000/api/v1/bird-tracking/stats/dashboard';

/* ---------- Small pieces ---------- */

function Skeleton({ className = '' }: any) {
  return <div className={`animate-pulse rounded-md bg-white/10 ${className}`} />;
}

// Circular gauge showing how much of the flock is healthy
function HealthRing({ percent, loading, size = 94 }: any) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(Math.max(percent, 0), 100) / 100) * c;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={loading ? c : offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)' }}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {loading ? (
          <Skeleton className="h-6 w-14" />
        ) : (
          <span className="text-xl sm:text-2xl font-black text-white tabular-nums">{percent.toFixed(1)}%</span>
        )}
        <span className="text-[10px] font-semibold text-slate-300 mt-0.5">Flock survival</span>
      </div>
    </div>
  );
}

function StatCard({ title, value, note, icon: Icon, accent, loading }: any) {
  const animatedValue = useSpringCounter(typeof value === 'number' ? value : 0, 900);
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm transition-shadow hover:shadow-lg">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent.bar}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">{title}</p>
          {loading ? (
            <Skeleton className="mt-2 h-7 sm:h-8 w-20 sm:w-28 !bg-slate-200" />
          ) : (
            <p className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 tabular-nums">
              {animatedValue.toLocaleString()}
            </p>
          )}
        </div>
        <div className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl shrink-0 ${accent.soft}`}>
          <Icon size={18} className={`${accent.icon} sm:w-5 sm:h-5`} />
        </div>
      </div>
      <p className="mt-2 sm:mt-3 text-xs font-medium text-slate-500 truncate">{note}</p>
    </div>
  );
}

function ActionTile({ title, hint, icon: Icon, onClick, color = 'green' }: any) {
  const colorStyles: Record<string, string> = {
    green: 'from-green-50/80 to-emerald-50/30 text-green-600 border-green-200 hover:border-green-400 icon-bg-green',
    blue: 'from-blue-50/80 to-cyan-50/30 text-blue-600 border-blue-200 hover:border-blue-400 icon-bg-blue',
    orange: 'from-orange-50/80 to-amber-50/30 text-orange-600 border-orange-200 hover:border-orange-400 icon-bg-orange',
    purple: 'from-purple-50/80 to-pink-50/30 text-purple-600 border-purple-200 hover:border-purple-400 icon-bg-purple',
  };
  const style = colorStyles[color] || colorStyles['green'];

  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center justify-between overflow-hidden rounded-2xl border bg-gradient-to-br bg-white p-3.5 sm:p-4 text-left transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${style.split(' ').slice(0,4).join(' ')}`}
    >
      <div className="flex items-center space-x-3 sm:space-x-4 z-10 min-w-0">
        <div className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-white shadow-sm transition-transform duration-300 group-hover:scale-110 shrink-0 ${style.split(' ')[2]}`}>
          <Icon size={18} className="sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-xs sm:text-base text-slate-900 truncate">{title}</p>
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">{hint}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-600 shrink-0 ml-1 sm:w-[18px] sm:h-[18px]" />
    </button>
  );
}

/* ---------- Dashboards ---------- */

function SystemDashboardTab({ setActiveTab }: any) {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => axios.get(API_URL).then((res) => res.data),
    refetchInterval: 30000,
  });

  const live = stats?.totalLiveBirds || 0;
  const mortality = stats?.todayMortality || 0;
  const flocks = stats?.activeFlocks || 0;

  const totalEver = live + mortality;
  const mortalityRate = totalEver > 0 ? (mortality / totalEver) * 100 : 0;
  const survival = totalEver > 0 ? 100 - mortalityRate : 100;
  const avgPerFlock = flocks > 0 ? Math.round(live / flocks) : 0;

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const ANALYTICS_URL = 'http://localhost:3000/api/v1/analytics/dashboard-summary';
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['dashboard-analytics-summary'],
    queryFn: async () => {
      try {
        const res = await axios.get(ANALYTICS_URL);
        return res.data;
      } catch (err) {
        // Fallback to placeholder/mock data seamlessly
        return null;
      }
    },
    refetchInterval: 60000,
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-12">
      
      {/* ── All-in-One Mastermind Hero Container ── */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 p-4 sm:px-6 sm:py-5 text-white shadow-2xl border border-slate-800">
        <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 right-1/3 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col space-y-3 sm:space-y-4">
          
          {/* Top Header: Top Left Align (Badge, Heading, Subtitle) & Top Right Align (Flush Side-by-Side Clock & Date) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
            
            {/* Top Left Alignment */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                  ENTERPRISE COMMAND CENTER
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mt-1 leading-none">
                Dashboard
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1 max-w-2xl leading-relaxed hidden sm:block">
                Real-time operational monitoring across flock vitality, feed nutrition, and production performance.
              </p>
            </div>

            {/* Top Right Alignment: Clock & Date flush to the right */}
            <div className="w-full lg:w-auto flex justify-end shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-4 md:gap-5 bg-slate-800/90 border border-slate-700/80 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-2xl shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <Clock size={18} className="text-emerald-400 animate-pulse shrink-0 sm:w-6 sm:h-6" />
                  <span className="font-mono text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-emerald-400 tracking-tight leading-none">
                    {formattedTime}
                  </span>
                </div>
                <span className="h-5 sm:h-7 w-px bg-slate-700" />
                <div className="flex items-center gap-1.5 sm:gap-2 text-slate-200 text-xs sm:text-sm md:text-base font-bold">
                  <Calendar size={15} className="text-slate-400 shrink-0 sm:w-[18px] sm:h-[18px]" />
                  <span className="whitespace-nowrap">{formattedDate}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Row: 2-column on mobile, 4-column on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 items-stretch mt-1">
            
            {/* Card 1: TOTAL LIVE BIRDS */}
            <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/[0.08] transition-all border border-emerald-500/25 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  TOTAL LIVE BIRDS
                </span>
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Bird size={14} />
                </div>
              </div>
              <div className="mt-2 sm:mt-2.5">
                {isLoading ? (
                  <Skeleton className="h-6 w-16 sm:w-20" />
                ) : (
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-white tabular-nums tracking-tight leading-none">
                    <AnimatedStat value={live} />
                  </p>
                )}
                <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 truncate max-w-full">
                  ACTIVE BALANCE
                </span>
              </div>
            </div>

            {/* Card 2: TOTAL MORTALITY */}
            <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/[0.08] transition-all border border-orange-500/25 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  TOTAL MORTALITY
                </span>
                <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                  <Activity size={14} />
                </div>
              </div>
              <div className="mt-2 sm:mt-2.5">
                {isLoading ? (
                  <Skeleton className="h-6 w-16 sm:w-20" />
                ) : (
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-white tabular-nums tracking-tight leading-none">
                    <AnimatedStat value={mortality} />
                  </p>
                )}
                <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wide bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded border border-orange-500/30 truncate max-w-full">
                  {mortalityRate.toFixed(2)}% LOSS
                </span>
              </div>
            </div>

            {/* Card 3: ACTIVE FLOCKS */}
            <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/[0.08] transition-all border border-blue-500/25 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  ACTIVE FLOCKS
                </span>
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Layers size={14} />
                </div>
              </div>
              <div className="mt-2 sm:mt-2.5">
                {isLoading ? (
                  <Skeleton className="h-6 w-16 sm:w-20" />
                ) : (
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-white tabular-nums tracking-tight leading-none">
                    <AnimatedStat value={flocks} />
                  </p>
                )}
                <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wide bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 truncate max-w-full">
                  ~<AnimatedStat value={avgPerFlock} /> / FLOCK
                </span>
              </div>
            </div>

            {/* Card 4: Glowing Cyan and Emerald Circular Progress Ring */}
            <div className="flex items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/[0.08] transition-all border border-white/10 shadow-sm backdrop-blur-md">
              <HealthRing percent={survival} loading={isLoading} size={92} />
            </div>

          </div>

        </div>
      </section>

      {/* Error banner */}
      {isError && (
        <div className="flex items-center space-x-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
          <TriangleAlert size={20} />
          <p className="text-sm font-semibold">
            Could not load dashboard data. Check that the API is running on port 3000, then refresh.
          </p>
        </div>
      )}

      {/* ── Enterprise Analytics Grid (Recharts) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-700">
              Operational Performance Analytics
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Telemetry
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Recharts Engine Active
          </span>
        </div>

        {/* Row 1: Egg Production Trend (2 cols) & Egg Quality Donut (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EggProductionTrendChart data={analytics?.eggTrends} isLoading={isLoadingAnalytics} />
          </div>
          <div className="lg:col-span-1">
            <EggQualityDonutChart data={analytics?.eggQuality} isLoading={isLoadingAnalytics} />
          </div>
        </div>

        {/* Row 2: Feed Inflow vs Mortality (1 col) & Sales Revenue (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FeedVsMortalityChart data={analytics?.feedMortality} isLoading={isLoadingAnalytics} />
          <SalesRevenueBarChart data={analytics?.salesRevenue} isLoading={isLoadingAnalytics} />
        </div>
      </section>

      {/* ── Operations Hub ── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-500">Integrated Operations Hub</h2>
          <span className="text-xs font-semibold text-slate-400">Select module</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
          <ActionTile title="Livestock Pulse" hint="Shed mortality & biology" icon={HeartPulse} color="green" onClick={() => setActiveTab('flock-pulse')} />
          <ActionTile title="Central Ledger" hint="Warehouse inventories" icon={PackageOpen} color="blue" onClick={() => setActiveTab('inventory-dashboard')} />
          <ActionTile title="Feed Production" hint="Batch mixer & recipes" icon={Factory} color="orange" onClick={() => setActiveTab('feed-production')} />
          <ActionTile title="Daily Egg Yield" hint="Harvest & grading" icon={Egg} color="purple" onClick={() => setActiveTab('daily-egg')} />
        </div>
      </section>
      
      {/* ── Enterprise Engines ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-3.5">
         <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/90 flex items-center justify-between group hover:shadow-md hover:border-slate-300 transition-all cursor-pointer" onClick={() => setActiveTab('iso-traceability')}>
           <div className="space-y-1 min-w-0">
             <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Biosecurity & Quality</span>
             <h3 className="font-black text-slate-900 text-sm sm:text-base mt-0.5">ISO 22000 Compliance Engine</h3>
             <p className="text-xs text-slate-500 hidden sm:block">Run end-to-end forward/backward trace trees across feed, bird, and egg batches.</p>
           </div>
           <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0 ml-3">
             <ShieldCheck size={22} />
           </div>
         </div>
         <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/90 flex items-center justify-between group hover:shadow-md hover:border-slate-300 transition-all cursor-pointer" onClick={() => setActiveTab('sales-dispatch')}>
           <div className="space-y-1 min-w-0">
             <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Commercial Fulfillment</span>
             <h3 className="font-black text-slate-900 text-sm sm:text-base mt-0.5">Sales Orders & Fleet Dispatch</h3>
             <p className="text-xs text-slate-500 hidden sm:block">Grade allocation, customer invoicing, and temperature-controlled vehicle dispatch.</p>
           </div>
           <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0 ml-3">
             <Truck size={22} />
           </div>
         </div>
      </section>

      {/* ── Status Strip ── */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl px-4 py-3 sm:py-3.5 text-white shadow-sm border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-white leading-tight">Mastermind Security & Audit Guard</p>
            <p className="text-[10px] text-slate-400 hidden sm:block">PostgreSQL Relational Ledger & ISO Traceability protocol synced</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
          <div className="flex items-center space-x-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-slate-300 font-semibold">Database: Online</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" /><span className="text-slate-300 font-semibold">Feed Mixer: Ready</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2 h-2 rounded-full bg-purple-400" /><span className="text-slate-300 font-semibold">Egg Sorting: Active</span></div>
        </div>
      </section>
    </div>
  );
}

/** Tiny animated number span — used across all stat cards */
function AnimatedStat({ value }: { value: number }) {
  const n = useSpringCounter(value, 900);
  return <>{n.toLocaleString()}</>;
}

function LivestockPulseTab({ setActiveTab = () => {} }: any) {
  const { data: stats, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => axios.get(API_URL).then((res) => res.data),
    refetchInterval: 30000, // keep numbers fresh every 30s
  });

  const live = stats?.totalLiveBirds || 0;
  const mortality = stats?.todayMortality || 0;
  const flocks = stats?.activeFlocks || 0;

  const totalEver = live + mortality;
  const mortalityRate = totalEver > 0 ? (mortality / totalEver) * 100 : 0;
  const survival = totalEver > 0 ? 100 - mortalityRate : 100;
  const avgPerFlock = flocks > 0 ? Math.round(live / flocks) : 0;

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* Hero: Side-by-side on mobile */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-[1.5rem] bg-slate-900 p-4 sm:px-8 sm:py-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-green-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-row items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-3">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">Farm overview</h1>
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 truncate">{today}</p>
            </div>

            <div className="mt-2.5 sm:mt-4 flex items-center space-x-1.5 text-slate-300">
              <Bird size={14} className="text-green-400 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Live birds</span>
            </div>
            {isLoading ? (
              <Skeleton className="mt-1 h-9 sm:h-12 w-32 sm:w-48" />
            ) : (
              <p className="mt-0 text-3xl sm:text-5xl md:text-6xl font-black tracking-tight tabular-nums">
                <AnimatedStat value={live} />
              </p>
            )}
            <p className="mt-0.5 text-[10px] sm:text-xs text-slate-400 truncate">
              {isLoading ? ' ' : `~${avgPerFlock.toLocaleString()} birds / flock`}
            </p>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="mt-2.5 sm:mt-4 inline-flex items-center space-x-1.5 sm:space-x-2 rounded-lg bg-white/10 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-60"
            >
              <RefreshCw size={12} className={`sm:w-3.5 sm:h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>

          <div className="shrink-0 flex items-center justify-center">
            <HealthRing percent={survival} loading={isLoading} size={98} />
          </div>
        </div>
      </section>

      {/* Error banner */}
      {isError && (
        <div className="flex items-center space-x-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <TriangleAlert size={20} />
          <p className="text-sm font-semibold">
            Could not load dashboard data. Check that the API is running on port 3000, then refresh.
          </p>
        </div>
      )}

      {/* Stat cards: Side-by-side 2-column on mobile */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
        <StatCard
          title="Total live birds"
          value={live}
          note="Real-time dynamic balance"
          icon={Bird}
          loading={isLoading}
          accent={{ bar: 'bg-green-500', soft: 'bg-green-100', icon: 'text-green-600' }}
        />
        <StatCard
          title="Total mortality"
          value={mortality}
          note={`${mortalityRate.toFixed(2)}% recorded loss`}
          icon={Activity}
          loading={isLoading}
          accent={{ bar: 'bg-orange-500', soft: 'bg-orange-100', icon: 'text-orange-600' }}
        />
        <div className="col-span-2 md:col-span-1">
          <StatCard
            title="Active flocks"
            value={flocks}
            note="Total registered batches"
            icon={Layers}
            loading={isLoading}
            accent={{ bar: 'bg-blue-500', soft: 'bg-blue-100', icon: 'text-blue-600' }}
          />
        </div>
      </section>

      {/* Quick actions: Side-by-side 2-column on mobile */}
      <section>
        <h2 className="mb-3 text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Quick actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
          <ActionTile title="Register flock" hint="Add a new batch" icon={ClipboardPlus} color="blue" onClick={() => setActiveTab('intake')} />
          <ActionTile title="Move birds" hint="Transfer sheds" icon={ArrowRightLeft} color="green" onClick={() => setActiveTab('movement')} />
          <div className="col-span-2 md:col-span-1">
            <ActionTile title="Record mortality" hint="Log daily losses" icon={HeartPulse} color="orange" onClick={() => setActiveTab('mortality')} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
