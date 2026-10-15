import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  PackageOpen, 
  Wheat, 
  Egg, 
  Boxes, 
  Search, 
  X, 
  RefreshCw, 
  Layers 
} from 'lucide-react';
import { useSpringCounter } from '../hooks/useSpringCounter';

const API_INVENTORY = 'http://localhost:3000/api/v1/inventory';


// 60fps Interactive Spotlight KPI Card Component
function KpiCard({ 
  title, 
  value, 
  unit = '', 
  subtitle, 
  badge, 
  icon: Icon, 
  accentColor, 
  iconBg, 
  iconColor,
  isActive = false,
  onClick 
}: any) {
  const animatedValue = useSpringCounter(value);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, isHovered: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setMousePos(prev => ({ ...prev, isHovered: false }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-white p-3 sm:px-4 sm:py-3 shadow-xs transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-lg active:scale-[0.985] cursor-pointer select-none border ${
        isActive 
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' 
          : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      {/* 60fps Spotlight Radial Glow Layer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: mousePos.isHovered
            ? `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, ${accentColor}, transparent 80%)`
            : 'none',
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-2.5">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums font-mono">
              {animatedValue.toLocaleString()}
            </span>
            {unit && <span className="text-xs font-bold text-slate-500">{unit}</span>}
          </div>
        </div>

        <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:rotate-3 shrink-0`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="relative z-10 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium truncate max-w-[150px] text-[11px]">{subtitle}</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
      </div>
    </div>
  );
}

export default function CentralLedgerDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Inventory Balances Query
  const { data: balances = [], isLoading: loadingBalances, refetch: refetchBalances, isFetching: isFetchingBalances } = useQuery({
    queryKey: ['inventory-balance'],
    queryFn: async () => (await axios.get(`${API_INVENTORY}/balance`)).data,
  });

  const handleRefreshAll = () => {
    refetchBalances();
  };

  const isRefreshing = isFetchingBalances;

  // Category Totals Computation
  const feedTotal = balances
    .filter((b: any) => b.item.category === 'FEED')
    .reduce((acc: number, b: any) => acc + (b.totalBalance || 0), 0);

  const eggTotal = balances
    .filter((b: any) => b.item.category === 'EGG')
    .reduce((acc: number, b: any) => acc + (b.totalBalance || 0), 0);

  const rawTotal = balances
    .filter((b: any) => b.item.category === 'RAW_MATERIAL')
    .reduce((acc: number, b: any) => acc + (b.totalBalance || 0), 0);

  // Category Counts
  const feedCount = balances.filter((b: any) => b.item.category === 'FEED').length;
  const eggCount = balances.filter((b: any) => b.item.category === 'EGG').length;
  const rawCount = balances.filter((b: any) => b.item.category === 'RAW_MATERIAL').length;
  const packCount = balances.filter((b: any) => b.item.category === 'PACKAGING').length;

  // Filtered List
  const filteredBalances = balances.filter((b: any) => {
    const matchesCategory = selectedCategory === 'ALL' || b.item.category === selectedCategory;
    const matchesSearch = 
      (b.item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.item.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.item.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'FEED': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'EGG': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'RAW_MATERIAL': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PACKAGING': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getStockStatus = (balance: number) => {
    if (balance > 1000) return { label: 'Optimal Stock', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (balance > 0) return { label: 'Normal', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    return { label: 'Zero Stock', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-12 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-4 py-3 sm:px-5 sm:py-3.5 text-white shadow-md border border-slate-700/50">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <PackageOpen size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight">Central Stock & Operational Ledger</h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Telemetry Active
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Real-time inventory balances, live flock populations, and feed silo levels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Ledger Stream</span>
            </div>
            <button
              onClick={handleRefreshAll}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
              title="Refresh All Ledger Balances"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-indigo-400' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 60fps Interactive Spotlight KPI Grid — 3 inventory cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Finished Feed in Silos */}
        <KpiCard
          title="Finished Feed Stock"
          value={feedTotal}
          unit="KG"
          subtitle={`${feedCount} Finished Formula Rations`}
          badge={{ label: 'In Silos & Stores', bg: 'bg-amber-100', text: 'text-amber-800' }}
          icon={Wheat}
          iconBg="bg-amber-500"
          iconColor="text-white"
          accentColor="rgba(245, 158, 11, 0.14)"
          isActive={selectedCategory === 'FEED'}
          onClick={() => setSelectedCategory(selectedCategory === 'FEED' ? 'ALL' : 'FEED')}
        />

        {/* Card 2: Fresh Egg Stock */}
        <KpiCard
          title="Fresh Egg Inventory"
          value={eggTotal}
          unit="Units"
          subtitle={`${eggCount} Egg Quality Grades`}
          badge={{ label: 'Ready for Dispatch', bg: 'bg-purple-100', text: 'text-purple-800' }}
          icon={Egg}
          iconBg="bg-purple-600"
          iconColor="text-white"
          accentColor="rgba(147, 51, 234, 0.14)"
          isActive={selectedCategory === 'EGG'}
          onClick={() => setSelectedCategory(selectedCategory === 'EGG' ? 'ALL' : 'EGG')}
        />

        {/* Card 3: Raw Material Stock */}
        <KpiCard
          title="Raw Materials Stock"
          value={rawTotal}
          unit="KG"
          subtitle={`${rawCount} Milling Ingredients`}
          badge={{ label: 'Production Inflow', bg: 'bg-blue-100', text: 'text-blue-800' }}
          icon={Boxes}
          iconBg="bg-blue-600"
          iconColor="text-white"
          accentColor="rgba(37, 99, 235, 0.14)"
          isActive={selectedCategory === 'RAW_MATERIAL'}
          onClick={() => setSelectedCategory(selectedCategory === 'RAW_MATERIAL' ? 'ALL' : 'RAW_MATERIAL')}
        />
      </div>

      {/* 3. Dataset Table Container (filter tabs merged inside toolbar) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Dataset Table Toolbar — Single row: [Icon+Title+Count] [FilterPills] [Search+Refresh] */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center gap-x-4 gap-y-2.5">
          {/* Left: Icon + Title + Count badge */}
          <div className="flex items-center gap-2 shrink-0">
            <Layers size={16} className="text-indigo-600 shrink-0" />
            <h2 className="text-sm font-bold text-slate-800 whitespace-nowrap">
              {selectedCategory === 'ALL' ? 'Complete Inventory' : `${selectedCategory} Inventory`} Dataset
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
              {filteredBalances.length}/{balances.length}
            </span>
          </div>

          {/* Center: Category Filter Pills with generous spacing */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
            {[
              { id: 'ALL', label: 'All', count: balances.length },
              { id: 'FEED', label: 'Feed', count: feedCount },
              { id: 'RAW_MATERIAL', label: 'Raw Mat.', count: rawCount },
              { id: 'EGG', label: 'Eggs', count: eggCount },
              { id: 'PACKAGING', label: 'Packaging', count: packCount },
            ].map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                  }`}
                >
                  {tab.label}
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
            {selectedCategory !== 'ALL' && (
              <button
                onClick={() => setSelectedCategory('ALL')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer px-1.5 py-0.5 hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          {/* Right: Search + Refresh */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <div className="relative w-52 sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search catalog or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 transition-all placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              onClick={handleRefreshAll}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors shrink-0 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Mobile View: High-Density Slots — scrollable inside the card */}
        <div className="block md:hidden overflow-y-auto" style={{ maxHeight: '400px' }}>
          <div className="p-3 space-y-2.5">
            {loadingBalances ? (
              <div className="p-8 text-center text-slate-400 text-sm font-semibold animate-pulse">
                Loading dynamic balances...
              </div>
            ) : filteredBalances.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                {searchTerm ? (
                  <div>
                    <p className="font-semibold text-slate-600">No items matching "{searchTerm}" found.</p>
                    <button onClick={() => setSearchTerm('')} className="mt-1.5 text-xs font-bold text-indigo-600 underline">
                      Clear search
                    </button>
                  </div>
                ) : (
                  <p>No stock records found in the ledger.</p>
                )}
              </div>
            ) : (
              filteredBalances.map((b: any) => {
                const status = getStockStatus(b.totalBalance);
                return (
                  <div 
                    key={b.item.id} 
                    className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/60 shadow-xs flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {b.item.code}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(b.item.category)}`}>
                          {b.item.category}
                        </span>
                      </div>
                      <p className="mt-1 font-bold text-slate-800 text-sm truncate">{b.item.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${status.bg}`}>
                        {status.label}
                      </span>
                      <p className="mt-0.5 text-sm font-black text-slate-900 tabular-nums">
                        {b.totalBalance.toLocaleString()} <span className="text-xs font-bold text-slate-500">{b.item.primaryUom}</span>
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Desktop View: Full Dataset Table — rows scroll inside, page stays still */}
        <div className="hidden md:flex md:flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 315px)', minHeight: '300px' }}>
          <div className="overflow-y-auto overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-6 whitespace-nowrap">Item Code</th>
                  <th className="py-2.5 px-6 whitespace-nowrap">Item Catalog Name</th>
                  <th className="py-2.5 px-6 whitespace-nowrap">Category</th>
                  <th className="py-2.5 px-6 whitespace-nowrap">Stock Status</th>
                  <th className="py-2.5 px-6 text-right whitespace-nowrap">Calculated Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingBalances ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw size={16} className="animate-spin text-indigo-600" />
                        <span>Loading dynamic ledger balances...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredBalances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      {searchTerm ? (
                        <div className="flex flex-col items-center justify-center space-y-1.5">
                          <p className="text-slate-600 font-medium text-sm">
                            No items matching "<span className="text-slate-800 font-bold">{searchTerm}</span>" found.
                          </p>
                          <button
                            onClick={() => setSearchTerm('')}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold underline cursor-pointer"
                          >
                            Clear search filter
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm">No stock items found in this category.</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredBalances.map((b: any) => {
                    const status = getStockStatus(b.totalBalance);
                    return (
                      <tr 
                        key={b.item.id} 
                        className="hover:bg-indigo-50/30 transition-colors duration-150"
                      >
                        <td className="py-3 px-6 font-mono text-xs font-bold text-indigo-700 whitespace-nowrap">
                          {b.item.code}
                        </td>
                        <td className="py-3 px-6 font-bold text-slate-800 text-sm">
                          {b.item.name}
                        </td>
                        <td className="py-3 px-6">
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getCategoryBadgeClass(b.item.category)}`}>
                            {b.item.category}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${status.bg}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 px-6 font-black text-slate-900 text-right tabular-nums text-sm whitespace-nowrap">
                          {b.totalBalance.toLocaleString()} <span className="text-xs font-bold text-slate-500">{b.item.primaryUom}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dataset Table Footer */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Showing <span className="font-semibold text-slate-700">{filteredBalances.length}</span> of <span className="font-semibold text-slate-700">{balances.length}</span> items
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="ml-2 font-medium text-indigo-600 hover:underline cursor-pointer"
              >
                (Clear filter)
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetry & Ledger Synchronized</span>
          </div>
        </div>
      </div>
    </div>
  );
}
