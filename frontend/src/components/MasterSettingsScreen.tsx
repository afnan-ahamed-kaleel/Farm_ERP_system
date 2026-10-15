import React, { useState } from 'react';
import { 
  Building2, 
  Package, 
  Users, 
  Layers, 
  Tag, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  X,
  Save,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useSpringCounter } from '../hooks/useSpringCounter';

/** Tiny inline component so each tab badge gets its own spring animation */
function AnimatedCount({ value }: { value: number }) {
  const n = useSpringCounter(value, 700);
  return <>{n}</>;
}

const API_BASE = 'http://localhost:3000/api/v1/master-data';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
});

type TabType = 'locations' | 'items' | 'partners' | 'flocks' | 'codes';

export default function MasterSettingsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('locations');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);


  // Queries for each master category
  const { data: locations = [], isLoading: loadingLocations, refetch: refetchLocations } = useQuery({
    queryKey: ['master-locations'],
    queryFn: async () => (await axios.get(`${API_BASE}/locations`)).data,
  });

  const { data: items = [], isLoading: loadingItems, refetch: refetchItems } = useQuery({
    queryKey: ['master-items'],
    queryFn: async () => (await axios.get(`${API_BASE}/items`)).data,
  });

  const { data: customers = [], isLoading: loadingCustomers, refetch: refetchCustomers } = useQuery({
    queryKey: ['master-customers'],
    queryFn: async () => (await axios.get(`${API_BASE}/customers`)).data,
  });

  const { data: suppliers = [], isLoading: loadingSuppliers, refetch: refetchSuppliers } = useQuery({
    queryKey: ['master-suppliers'],
    queryFn: async () => (await axios.get(`${API_BASE}/suppliers`)).data,
  });

  const { data: flocks = [], isLoading: loadingFlocks, refetch: refetchFlocks } = useQuery({
    queryKey: ['master-flocks'],
    queryFn: async () => (await axios.get(`${API_BASE}/flocks`)).data,
  });

  const { data: reasons = [], isLoading: loadingReasons, refetch: refetchReasons } = useQuery({
    queryKey: ['master-reasons'],
    queryFn: async () => (await axios.get(`${API_BASE}/reasons`)).data,
  });

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setModalMode('edit');
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleRefreshCurrent = () => {
    if (activeTab === 'locations') refetchLocations();
    else if (activeTab === 'items') refetchItems();
    else if (activeTab === 'partners') { refetchCustomers(); refetchSuppliers(); }
    else if (activeTab === 'flocks') refetchFlocks();
    else if (activeTab === 'codes') refetchReasons();
    Toast.fire({ icon: 'info', title: 'Data refreshed' });
  };

  const tabMetadata: Record<TabType, { label: string; shortTitle: string; icon: any; total: number }> = {
    locations: { label: 'Houses & Sheds', shortTitle: 'locations', icon: Building2, total: locations.length },
    items: { label: 'Items & Catalog', shortTitle: 'items', icon: Package, total: items.length },
    partners: { label: 'Customers & Vendors', shortTitle: 'partners', icon: Users, total: customers.length + suppliers.length },
    flocks: { label: 'Flock Profiles', shortTitle: 'flocks', icon: Layers, total: flocks.length },
    codes: { label: 'Operational Causes', shortTitle: 'causes', icon: Tag, total: reasons.length },
  };

  const currentTab = tabMetadata[activeTab];
  const CurrentIcon = currentTab.icon;

  const filteredLocations = locations.filter((l: any) => 
    (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (l.type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredItems = items.filter((i: any) => 
    (i.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.code || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter((c: any) => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.contactNumber && c.contactNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSuppliers = suppliers.filter((s: any) => 
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.type && s.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredFlocks = flocks.filter((f: any) => 
    (f.batchNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (f.breed || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReasons = reasons.filter((r: any) => 
    (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.code || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActiveCounts = () => {
    switch (activeTab) {
      case 'locations': return { visible: filteredLocations.length, total: locations.length };
      case 'items': return { visible: filteredItems.length, total: items.length };
      case 'partners': return { visible: filteredCustomers.length + filteredSuppliers.length, total: customers.length + suppliers.length };
      case 'flocks': return { visible: filteredFlocks.length, total: flocks.length };
      case 'codes': return { visible: filteredReasons.length, total: reasons.length };
    }
  };

  const activeCounts = getActiveCounts();

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-12 animate-in fade-in duration-300">
      {/* Compact Header Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 text-white shadow-md relative overflow-hidden border border-slate-700/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Top row: Title & Primary Actions */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <SlidersHorizontal size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">Master Settings & Catalog</h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Master Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Configure foundational master data, catalog definitions, and operational entities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handleRefreshCurrent}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
              title="Refresh Current View"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-md shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Add New Record</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Compact Pill Strip */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-700/60 flex flex-wrap items-center gap-1.5 sm:gap-2">
          {(Object.keys(tabMetadata) as TabType[]).map((tabKey) => {
            const tab = tabMetadata[tabKey];
            const Icon = tab.icon;
            const isActive = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => { setActiveTab(tabKey); setSearchTerm(''); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/40'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-700/90 text-slate-300'
                }`}>
                  <AnimatedCount value={tab.total} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dataset Table Card with Integrated Search Toolbar & Method */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Dataset Table Header Toolbar */}
        <div className="px-4 py-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <CurrentIcon size={17} className="text-indigo-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                {currentTab.label} Dataset
              </h2>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              {activeCounts.visible} {activeCounts.visible === 1 ? 'record' : 'records'}
              {searchTerm && ` (filtered from ${activeCounts.total})`}
            </span>
          </div>

          {/* Integrated Search Toolbar on top of Dataset Table */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={`Search in ${currentTab.shortTitle}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 transition-all placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={handleRefreshCurrent}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors shrink-0 cursor-pointer"
              title="Refresh this dataset"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Dataset Table Content */}
        {activeTab === 'locations' && (
          <LocationsTable 
            data={filteredLocations} 
            loading={loadingLocations}
            onEdit={openEditModal}
            refetch={refetchLocations}
            searchTerm={searchTerm}
            onClearSearch={() => setSearchTerm('')}
          />
        )}
        {activeTab === 'items' && (
          <ItemsTable 
            data={filteredItems} 
            loading={loadingItems}
            onEdit={openEditModal}
            refetch={refetchItems}
            searchTerm={searchTerm}
            onClearSearch={() => setSearchTerm('')}
          />
        )}
        {activeTab === 'partners' && (
          <PartnersTable 
            customers={filteredCustomers}
            suppliers={filteredSuppliers}
            loading={loadingCustomers || loadingSuppliers}
            onEdit={openEditModal}
            refetch={() => { refetchCustomers(); refetchSuppliers(); }}
            searchTerm={searchTerm}
            onClearSearch={() => setSearchTerm('')}
          />
        )}
        {activeTab === 'flocks' && (
          <FlocksTable 
            data={filteredFlocks} 
            loading={loadingFlocks}
            onEdit={openEditModal}
            refetch={refetchFlocks}
            searchTerm={searchTerm}
            onClearSearch={() => setSearchTerm('')}
          />
        )}
        {activeTab === 'codes' && (
          <OperationalReasonsTable 
            data={filteredReasons} 
            loading={loadingReasons}
            refetch={refetchReasons}
            searchTerm={searchTerm}
            onClearSearch={() => setSearchTerm('')}
          />
        )}

        {/* Dataset Table Footer */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Showing <span className="font-semibold text-slate-700">{activeCounts.visible}</span> of <span className="font-semibold text-slate-700">{activeCounts.total}</span> entries
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
            <span>Master Catalog Synchronized</span>
          </div>
        </div>
      </div>

      {/* Slide-in Modal for Add / Edit */}
      {isModalOpen && (
        <MasterEntityModal
          tab={activeTab}
          mode={modalMode}
          item={selectedItem}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            handleRefreshCurrent();
            Toast.fire({ icon: 'success', title: `Record ${modalMode === 'create' ? 'created' : 'updated'} successfully!` });
          }}
          locations={locations}
        />
      )}
    </div>
  );
}

/* =========================================================================
   1. LOCATIONS TABLE
   ========================================================================= */
function LocationsTable({ data, loading, onEdit, refetch, searchTerm, onClearSearch }: any) {
  const handleDelete = async (id: string, name: string) => {
    const res = await Swal.fire({
      title: 'Delete Location?',
      text: `Are you sure you want to remove "${name}"? If transactions exist, deletion will be rejected for data integrity.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete',
    });
    if (res.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/locations/${id}`);
        Swal.fire('Deleted', 'Location removed successfully', 'success');
        refetch();
      } catch (err: any) {
        Swal.fire('Cannot Delete', err.response?.data?.message || 'Location is linked to movements or transactions.', 'error');
      }
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
          <tr>
            <th className="py-2.5 px-4 sm:px-6">Location / House Name</th>
            <th className="py-2.5 px-4 sm:px-6">Facility Type</th>
            <th className="py-2.5 px-4 sm:px-6">Parent Facility</th>
            <th className="py-2.5 px-4 sm:px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-12 text-center text-slate-400">
                {searchTerm ? (
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <p className="text-slate-600 font-medium text-sm">No locations matching "<span className="text-slate-800 font-bold">{searchTerm}</span>" found.</p>
                    <button
                      onClick={onClearSearch}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-bold underline cursor-pointer"
                    >
                      Clear search filter
                    </button>
                  </div>
                ) : (
                  <p className="text-sm">No locations found. Click "+ Add New Record" to create one.</p>
                )}
              </td>
            </tr>
          ) : (
            data.map((loc: any) => (
              <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 sm:px-6 font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                    <Building2 size={15} />
                  </div>
                  <span>{loc.name}</span>
                </td>
                <td className="py-3 px-4 sm:px-6">
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {loc.type}
                  </span>
                </td>
                <td className="py-3 px-4 sm:px-6 text-slate-500 font-medium">
                  {loc.parent?.name || '— Top Level Farm —'}
                </td>
                <td className="py-3 px-4 sm:px-6 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button onClick={() => onEdit(loc)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => handleDelete(loc.id, loc.name)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================================
   2. ITEMS & CATALOG TABLE
   ========================================================================= */
function ItemsTable({ data, loading, onEdit, refetch, searchTerm, onClearSearch }: any) {
  const handleDelete = async (id: string, name: string) => {
    const res = await Swal.fire({
      title: 'Delete Item?',
      text: `Remove item "${name}" from catalog?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete',
    });
    if (res.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/items/${id}`);
        Swal.fire('Deleted', 'Item removed', 'success');
        refetch();
      } catch (err: any) {
        Swal.fire('Error', err.response?.data?.message || 'Item in use', 'error');
      }
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'RAW_MATERIAL': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'FEED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'EGG': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PACKAGING': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
          <tr>
            <th className="py-2.5 px-4 sm:px-6">Item Code</th>
            <th className="py-2.5 px-4 sm:px-6">Catalog Name</th>
            <th className="py-2.5 px-4 sm:px-6">Category</th>
            <th className="py-2.5 px-4 sm:px-6">Primary UOM</th>
            <th className="py-2.5 px-4 sm:px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-slate-400">
                {searchTerm ? (
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <p className="text-slate-600 font-medium text-sm">No items matching "<span className="text-slate-800 font-bold">{searchTerm}</span>" found.</p>
                    <button
                      onClick={onClearSearch}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-bold underline cursor-pointer"
                    >
                      Clear search filter
                    </button>
                  </div>
                ) : (
                  <p className="text-sm">No items found. Click "+ Add New Record" to create one.</p>
                )}
              </td>
            </tr>
          ) : (
            data.map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 sm:px-6 font-mono font-bold text-indigo-700">
                  {item.code}
                </td>
                <td className="py-3 px-4 sm:px-6 font-bold text-slate-900">
                  {item.name}
                </td>
                <td className="py-3 px-4 sm:px-6">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${getCategoryBadge(item.category)}`}>
                    {item.category}
                  </span>
                </td>
                <td className="py-3 px-4 sm:px-6 font-bold text-slate-600">
                  {item.primaryUom}
                </td>
                <td className="py-3 px-4 sm:px-6 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button onClick={() => onEdit(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => handleDelete(item.id, item.name)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================================
   3. PARTNERS (CUSTOMERS & SUPPLIERS) TABLE
   ========================================================================= */
function PartnersTable({ customers, suppliers, loading, onEdit, refetch, searchTerm, onClearSearch }: any) {
  const [partnerType, setPartnerType] = useState<'all' | 'customers' | 'suppliers'>('all');

  const handleDeleteCustomer = async (id: string, name: string) => {
    const res = await Swal.fire({ title: 'Delete Customer?', text: `Remove "${name}"?`, icon: 'warning', showCancelButton: true });
    if (res.isConfirmed) {
      await axios.delete(`${API_BASE}/customers/${id}`);
      refetch();
    }
  };

  const handleDeleteSupplier = async (id: string, name: string) => {
    const res = await Swal.fire({ title: 'Delete Supplier?', text: `Remove "${name}"?`, icon: 'warning', showCancelButton: true });
    if (res.isConfirmed) {
      await axios.delete(`${API_BASE}/suppliers/${id}`);
      refetch();
    }
  };

  if (loading) return <LoadingSkeleton />;

  const displayCustomers = (partnerType === 'all' || partnerType === 'customers') ? customers : [];
  const displaySuppliers = (partnerType === 'all' || partnerType === 'suppliers') ? suppliers : [];
  const totalVisiblePartners = displayCustomers.length + displaySuppliers.length;

  return (
    <div>
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Partner Filter:</span>
        <button 
          onClick={() => setPartnerType('all')}
          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${partnerType === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
        >
          All ({customers.length + suppliers.length})
        </button>
        <button 
          onClick={() => setPartnerType('customers')}
          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${partnerType === 'customers' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
        >
          Customers / Buyers ({customers.length})
        </button>
        <button 
          onClick={() => setPartnerType('suppliers')}
          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${partnerType === 'suppliers' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
        >
          Suppliers & Hatcheries ({suppliers.length})
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4 sm:px-6">Partner Name</th>
              <th className="py-2.5 px-4 sm:px-6">Role / Type</th>
              <th className="py-2.5 px-4 sm:px-6">Phone Number</th>
              <th className="py-2.5 px-4 sm:px-6">Address</th>
              <th className="py-2.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {totalVisiblePartners === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  {searchTerm ? (
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                      <p className="text-slate-600 font-medium text-sm">No partners matching "<span className="text-slate-800 font-bold">{searchTerm}</span>" found.</p>
                      <button
                        onClick={onClearSearch}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-bold underline cursor-pointer"
                      >
                        Clear search filter
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm">No partners found in this category. Click "+ Add New Record" to create one.</p>
                  )}
                </td>
              </tr>
            ) : (
              <>
                {/* Customers */}
                {displayCustomers.map((c: any) => (
                  <tr key={`cust-${c.id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 sm:px-6 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3 px-4 sm:px-6">
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        BUYER / CUSTOMER
                      </span>
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-slate-600 font-medium">{c.contactNumber || '—'}</td>
                    <td className="py-3 px-4 sm:px-6 text-slate-500">{c.address || '—'}</td>
                    <td className="py-3 px-4 sm:px-6 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => onEdit({ ...c, _entity: 'customer' })} className="p-1.5 text-slate-400 hover:text-indigo-600 cursor-pointer"><Edit3 size={15} /></button>
                        <button onClick={() => handleDeleteCustomer(c.id, c.name)} className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Suppliers */}
                {displaySuppliers.map((s: any) => (
                  <tr key={`supp-${s.id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 sm:px-6 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3 px-4 sm:px-6">
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        SUPPLIER ({s.type || 'HATCHERY'})
                      </span>
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-slate-600 font-medium">{s.contactNumber || '—'}</td>
                    <td className="py-3 px-4 sm:px-6 text-slate-500">{s.address || '—'}</td>
                    <td className="py-3 px-4 sm:px-6 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => onEdit({ ...s, _entity: 'supplier' })} className="p-1.5 text-slate-400 hover:text-indigo-600 cursor-pointer"><Edit3 size={15} /></button>
                        <button onClick={() => handleDeleteSupplier(s.id, s.name)} className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================================
   4. FLOCKS TABLE
   ========================================================================= */
function FlocksTable({ data, loading, onEdit, refetch, searchTerm, onClearSearch }: any) {
  const handleDelete = async (id: string, batchNumber: string) => {
    const res = await Swal.fire({
      title: 'Delete Flock?',
      text: `Remove Flock "${batchNumber}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete',
    });
    if (res.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/flocks/${id}`);
        refetch();
      } catch (err: any) {
        Swal.fire('Error', err.response?.data?.message || 'Flock has active logs', 'error');
      }
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
          <tr>
            <th className="py-2.5 px-4 sm:px-6">Batch Number</th>
            <th className="py-2.5 px-4 sm:px-6">Breed</th>
            <th className="py-2.5 px-4 sm:px-6">Hatch Date</th>
            <th className="py-2.5 px-4 sm:px-6">Intake Quantity</th>
            <th className="py-2.5 px-4 sm:px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-slate-400">
                {searchTerm ? (
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <p className="text-slate-600 font-medium text-sm">No flocks matching "<span className="text-slate-800 font-bold">{searchTerm}</span>" found.</p>
                    <button
                      onClick={onClearSearch}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-bold underline cursor-pointer"
                    >
                      Clear search filter
                    </button>
                  </div>
                ) : (
                  <p className="text-sm">No flocks found. Click "+ Add New Record" to create one.</p>
                )}
              </td>
            </tr>
          ) : (
            data.map((flock: any) => {
              const totalIntake = flock.movements?.reduce((acc: number, m: any) => acc + (m.pathway === 'INTAKE' ? m.quantity : 0), 0) || 0;
              return (
                <tr key={flock.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 sm:px-6 font-mono font-black text-slate-900">{flock.batchNumber}</td>
                  <td className="py-3 px-4 sm:px-6 font-bold text-slate-700">{flock.breed}</td>
                  <td className="py-3 px-4 sm:px-6 text-slate-600 font-medium">{new Date(flock.hatchDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4 sm:px-6 font-bold text-emerald-600">
                    {totalIntake > 0 ? `${totalIntake.toLocaleString()} Birds` : '— Fresh Batch —'}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => onEdit(flock)} className="p-1.5 text-slate-400 hover:text-indigo-600 cursor-pointer"><Edit3 size={15} /></button>
                      <button onClick={() => handleDelete(flock.id, flock.batchNumber)} className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================================
   5. OPERATIONAL REASONS TABLE
   ========================================================================= */
function OperationalReasonsTable({ data, loading, refetch, searchTerm, onClearSearch }: any) {
  const handleDelete = async (id: string, name: string) => {
    const res = await Swal.fire({ title: 'Remove Cause?', text: `Delete cause code "${name}"?`, icon: 'warning', showCancelButton: true });
    if (res.isConfirmed) {
      await axios.delete(`${API_BASE}/reasons/${id}`);
      refetch();
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
          <tr>
            <th className="py-2.5 px-4 sm:px-6">Reason Code</th>
            <th className="py-2.5 px-4 sm:px-6">Cause / Name</th>
            <th className="py-2.5 px-4 sm:px-6">Category</th>
            <th className="py-2.5 px-4 sm:px-6">Description</th>
            <th className="py-2.5 px-4 sm:px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-slate-400">
                {searchTerm ? (
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <p className="text-slate-600 font-medium text-sm">No operational causes matching "<span className="text-slate-800 font-bold">{searchTerm}</span>" found.</p>
                    <button
                      onClick={onClearSearch}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-bold underline cursor-pointer"
                    >
                      Clear search filter
                    </button>
                  </div>
                ) : (
                  <p className="text-sm">No operational causes found. Click "+ Add New Record" to create one.</p>
                )}
              </td>
            </tr>
          ) : (
            data.map((r: any) => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 sm:px-6 font-mono font-bold text-slate-900">{r.code}</td>
                <td className="py-3 px-4 sm:px-6 font-bold text-rose-700">{r.name}</td>
                <td className="py-3 px-4 sm:px-6">
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border">
                    {r.category}
                  </span>
                </td>
                <td className="py-3 px-4 sm:px-6 text-slate-500">{r.description || '—'}</td>
                <td className="py-3 px-4 sm:px-6 text-right">
                  <button onClick={() => handleDelete(r.id, r.name)} className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-8 space-y-4">
      <div className="h-8 bg-slate-100 animate-pulse rounded-lg w-full" />
      <div className="h-8 bg-slate-100 animate-pulse rounded-lg w-3/4" />
      <div className="h-8 bg-slate-100 animate-pulse rounded-lg w-5/6" />
    </div>
  );
}

/* =========================================================================
   ADD / EDIT MODAL
   ========================================================================= */
function MasterEntityModal({ tab, mode, item, onClose, onSuccess, locations }: any) {
  const [formData, setFormData] = useState<any>(() => {
    if (item) return { ...item };
    if (tab === 'locations') return { name: '', type: 'HOUSE', parentId: '' };
    if (tab === 'items') return { code: '', name: '', category: 'RAW_MATERIAL', primaryUom: 'KG' };
    if (tab === 'partners') return { partnerType: 'CUSTOMER', name: '', type: 'HATCHERY', contactNumber: '', address: '' };
    if (tab === 'flocks') return { batchNumber: '', breed: 'Cobb 500', hatchDate: new Date().toISOString().split('T')[0] };
    if (tab === 'codes') return { category: 'MORTALITY_CAUSE', code: '', name: '', description: '' };
    return {};
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'locations') {
        if (mode === 'create') await axios.post(`${API_BASE}/locations`, formData);
        else await axios.put(`${API_BASE}/locations/${item.id}`, formData);
      } else if (tab === 'items') {
        if (mode === 'create') await axios.post(`${API_BASE}/items`, formData);
        else await axios.put(`${API_BASE}/items/${item.id}`, formData);
      } else if (tab === 'partners') {
        const isSupplier = formData.partnerType === 'SUPPLIER' || item?._entity === 'supplier';
        const url = isSupplier ? `${API_BASE}/suppliers` : `${API_BASE}/customers`;
        if (mode === 'create') await axios.post(url, formData);
        else await axios.put(`${url}/${item.id}`, formData);
      } else if (tab === 'flocks') {
        if (mode === 'create') await axios.post(`${API_BASE}/flocks`, formData);
        else await axios.put(`${API_BASE}/flocks/${item.id}`, formData);
      } else if (tab === 'codes') {
        await axios.post(`${API_BASE}/reasons`, formData);
      }
      onSuccess();
    } catch (err: any) {
      Swal.fire('Failed', err.response?.data?.message || 'Could not save record', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base">{mode === 'create' ? 'Add New' : 'Edit'} Master Record</h2>
              <p className="text-xs text-slate-400">Configure master database entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* LOCATION FORM */}
          {tab === 'locations' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Location / House Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Brooder Shed 2, Layer House Bravo"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Facility Type</label>
                  <select
                    value={formData.type || 'HOUSE'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                  >
                    <option value="HOUSE">House / Shed</option>
                    <option value="BROODER">Brooder Facility</option>
                    <option value="GROWER">Grower Facility</option>
                    <option value="LAYER">Layer Facility</option>
                    <option value="SILO">Feed Silo</option>
                    <option value="WAREHOUSE">Warehouse</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Parent Location</label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                  >
                    <option value="">None (Top Level Farm)</option>
                    {locations.filter((l: any) => l.id !== item?.id).map((l: any) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ITEM FORM */}
          {tab === 'items' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Item Code</label>
                  <input
                    required
                    disabled={mode === 'edit'}
                    type="text"
                    placeholder="e.g. RM-MAIZE-01"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Primary UOM</label>
                  <select
                    value={formData.primaryUom || 'KG'}
                    onChange={(e) => setFormData({ ...formData, primaryUom: e.target.value })}
                    className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  >
                    <option value="KG">Kilogram (KG)</option>
                    <option value="BAG">Bag (50KG)</option>
                    <option value="UNIT">Unit / Piece</option>
                    <option value="TRAY">Tray (30 Eggs)</option>
                    <option value="LITER">Liter (L)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Item Catalog Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Yellow Grain Corn, Layer Concentrate"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Category</label>
                <select
                  value={formData.category || 'RAW_MATERIAL'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                >
                  <option value="RAW_MATERIAL">Raw Material (Feed Ingredient)</option>
                  <option value="FEED">Finished Poultry Feed</option>
                  <option value="EGG">Harvested Eggs</option>
                  <option value="PACKAGING">Packaging & Consumables</option>
                  <option value="OTHER">Other Farm Supplies</option>
                </select>
              </div>
            </>
          )}

          {/* PARTNERS FORM */}
          {tab === 'partners' && (
            <>
              {mode === 'create' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Partner Entity Type</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, partnerType: 'CUSTOMER' })}
                      className={`py-2 text-xs font-bold rounded-xl border ${formData.partnerType !== 'SUPPLIER' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'}`}
                    >
                      Customer (Buyer)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, partnerType: 'SUPPLIER' })}
                      className={`py-2 text-xs font-bold rounded-xl border ${formData.partnerType === 'SUPPLIER' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'}`}
                    >
                      Supplier / Hatchery
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Partner / Business Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ceylon Poultry Distributors, Supermarket Chain"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Phone / Mobile</label>
                  <input
                    type="text"
                    placeholder="+94 77 123 4567"
                    value={formData.contactNumber || ''}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                {(formData.partnerType === 'SUPPLIER' || item?._entity === 'supplier') && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Supplier Classification</label>
                    <select
                      value={formData.type || 'HATCHERY'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                    >
                      <option value="HATCHERY">Hatchery (Day-Old Chicks)</option>
                      <option value="FEED_INGREDIENT">Feed Ingredients</option>
                      <option value="PACKAGING">Packaging Supplies</option>
                      <option value="GENERAL">General Vendor</option>
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Address / Town</label>
                <input
                  type="text"
                  placeholder="e.g. Colombo 03, Matara Junction"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </>
          )}

          {/* FLOCKS FORM */}
          {tab === 'flocks' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Flock Batch Number</label>
                <input
                  required
                  disabled={mode === 'edit'}
                  type="text"
                  placeholder="e.g. BATCH-2026-C-COBB"
                  value={formData.batchNumber || ''}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Breed</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Cobb 500, Ross 308, Lohmann"
                    value={formData.breed || ''}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Hatch Date</label>
                  <input
                    required
                    type="date"
                    value={formData.hatchDate ? formData.hatchDate.split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, hatchDate: e.target.value })}
                    className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                  />
                </div>
              </div>
            </>
          )}

          {/* OPERATIONAL REASONS FORM */}
          {tab === 'codes' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Category</label>
                  <select
                    value={formData.category || 'MORTALITY_CAUSE'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  >
                    <option value="MORTALITY_CAUSE">Mortality Cause</option>
                    <option value="CULLING_REASON">Culling Reason</option>
                    <option value="REJECTION_REASON">Egg Rejection Reason</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Reason Code</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. PREDATOR, HEAT_STRESS"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Display Name / Cause</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Predator Attack, Cannibalism"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Description (Optional)</label>
                <textarea
                  placeholder="Additional context for farm operators..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
