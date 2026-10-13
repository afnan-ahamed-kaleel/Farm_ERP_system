import { ArrowRightLeft, Activity, Home, Truck, PackageOpen, Beaker, Factory, Wheat, Egg, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'flock-pulse', label: 'Livestock Pulse', icon: Activity },
    { id: 'intake', label: 'Flock Intake', icon: Truck },
    { id: 'movement', label: 'Lifecycle Transitions', icon: ArrowRightLeft },
    { id: 'mortality', label: 'Daily Mortality', icon: Activity },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (window.innerWidth < 768 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 top-14 bg-black/60 backdrop-blur-xs z-30 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <aside 
        className={`bg-slate-900 text-slate-300 flex flex-col h-[calc(100vh-3.5rem)] fixed md:sticky top-14 left-0 z-40 md:z-10 transition-all duration-300 ease-in-out shadow-2xl md:shadow-xl overflow-hidden ${
          isOpen ? 'w-64 translate-x-0 opacity-100' : 'w-0 -translate-x-full md:translate-x-0 opacity-0'
        }`}
      >
        <div className="p-4 w-64 space-y-3 overflow-y-auto sidebar-scroll flex-1">
          <div>
            <nav className="space-y-1">
              {[ { id: 'dashboard', label: 'System Dashboard', icon: Home } ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 ${
                      isActive 
                        ? 'bg-indigo-500/10 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)]' 
                        : 'hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-blue-500/10 hover:text-indigo-400 hover:shadow-lg text-slate-400'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Flock Operations</p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 ${
                    isActive 
                      ? 'bg-green-500/10 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                      : 'hover:bg-gradient-to-r hover:from-green-500/20 hover:to-emerald-500/10 hover:text-green-400 hover:shadow-lg'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-green-400' : 'text-slate-400 group-hover:text-green-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Central Inventory</p>
          <nav className="space-y-1">
            {[
              { id: 'inventory-dashboard', label: 'Stock Ledger', icon: PackageOpen },
              { id: 'inventory-transfer', label: 'Stock Transfer', icon: ArrowRightLeft },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 ${
                    isActive 
                      ? 'bg-blue-500/10 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                      : 'hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/10 hover:text-blue-400 hover:shadow-lg'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Feed Operations</p>
          <nav className="space-y-1">
            {[
              { id: 'formula-manager', label: 'Feed Formulas', icon: Beaker },
              { id: 'feed-production', label: 'Production Run', icon: Factory },
              { id: 'feed-issue', label: 'Issue & Consume', icon: Wheat },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 ${
                    isActive 
                      ? 'bg-amber-500/10 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                      : 'hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-orange-500/10 hover:text-amber-500 hover:shadow-lg'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-amber-500' : 'text-slate-400 group-hover:text-amber-500'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Egg & Sales</p>
          <nav className="space-y-1">
            {[
              { id: 'daily-egg', label: 'Daily Collection', icon: Egg },
              { id: 'sales-dispatch', label: 'Sales Dispatch', icon: Truck },
              { id: 'iso-traceability', label: 'ISO Traceability', icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 ${
                    isActive 
                      ? 'bg-purple-500/10 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.1)]' 
                      : 'hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/10 hover:text-purple-400 hover:shadow-lg'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">System Administration</p>
          <nav className="space-y-1">
            <button
              onClick={() => handleTabClick('master-settings')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 ${
                activeTab === 'master-settings'
                  ? 'bg-indigo-500/15 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)] border border-indigo-500/30 font-bold' 
                  : 'hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-blue-500/10 hover:text-indigo-300 hover:shadow-lg text-slate-400'
              }`}
            >
              <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <span className="text-xs font-black">⚙</span>
              </div>
              <span className="flex-1 text-left">Master Settings</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">ADMIN</span>
            </button>
          </nav>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800 w-64">
        <div className="bg-slate-800 rounded-lg p-3 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
            OP
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white">Operator 1</p>
            <p className="text-xs text-slate-400">Ruhunu Farms</p>
          </div>
        </div>
      </div>
    </aside>
  </>
  );
}
