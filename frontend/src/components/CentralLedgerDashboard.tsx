import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PackageOpen } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api/v1/inventory';

export default function CentralLedgerDashboard() {
  const { data: balances = [], isLoading } = useQuery({
    queryKey: ['inventory-balance'],
    queryFn: async () => (await axios.get(`${API_BASE}/balance`)).data,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative overflow-hidden rounded-xl bg-slate-900 p-4 sm:p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="flex items-center space-x-3 sm:space-x-4 relative z-10">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/30 shrink-0">
            <PackageOpen size={22} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">Central Stock Ledger</h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Real-time dynamic inventory balances</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-700 text-sm sm:text-base">All Items</h2>
          <span className="text-xs font-semibold text-slate-400">{balances.length} items registered</span>
        </div>

        {/* Mobile View: Cards / Slots (hidden on md and above) */}
        <div className="block md:hidden p-3 space-y-2.5">
          {isLoading ? (
            <div className="p-6 text-center text-slate-400 text-sm font-semibold">Loading dynamic balances...</div>
          ) : balances.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm font-semibold">No stock found in the ledger.</div>
          ) : (
            balances.map((b: any) => (
              <div key={b.item.id} className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/50 shadow-xs flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {b.item.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      {b.item.category}
                    </span>
                  </div>
                  <p className="mt-1 font-bold text-slate-800 text-sm truncate">{b.item.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Balance</p>
                  <p className="text-sm font-black text-slate-900 tabular-nums">
                    {b.totalBalance.toLocaleString()} <span className="text-xs font-bold text-slate-500">{b.item.primaryUom}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Table (hidden on mobile, visible md and above) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-500 font-semibold text-xs sm:text-sm">
              <tr>
                <th className="px-6 py-2.5 sm:py-2 border-b border-slate-200">Item Code</th>
                <th className="px-6 py-2.5 sm:py-2 border-b border-slate-200">Item Name</th>
                <th className="px-6 py-2.5 sm:py-2 border-b border-slate-200">Category</th>
                <th className="px-6 py-2.5 sm:py-2 border-b border-slate-200 text-right">Calculated Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={4} className="p-6 text-center text-slate-500">Loading dynamic balances...</td></tr>
              ) : balances.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-slate-500">No stock found in the ledger.</td></tr>
              ) : (
                balances.map((b: any) => (
                  <tr key={b.item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-2.5 sm:py-2 font-mono text-xs text-slate-500">{b.item.code}</td>
                    <td className="px-6 py-2.5 sm:py-2 font-bold text-slate-800 text-sm">{b.item.name}</td>
                    <td className="px-6 py-2.5 sm:py-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 whitespace-nowrap">
                        {b.item.category}
                      </span>
                    </td>
                    <td className="px-6 py-2.5 sm:py-2 font-black text-slate-900 text-right tabular-nums text-sm whitespace-nowrap">
                      {b.totalBalance.toLocaleString()} {b.item.primaryUom}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
