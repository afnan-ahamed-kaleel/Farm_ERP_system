import { useState } from 'react';
import { Truck, Save, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import QuickAddModal from './QuickAddModal';

const API_BASE_DISPATCH = 'http://localhost:3000/api/v1/dispatch';
const API_BASE_INVENTORY = 'http://localhost:3000/api/v1/inventory';
const API_BASE_MASTER = 'http://localhost:3000/api/v1/master-data';

const GRADES = ['JUMBO', 'XL', 'LARGE', 'MEDIUM', 'SMALL', 'PULLET'];

export default function SalesDispatchScreen() {
  const [customerId, setCustomerId] = useState('');

  const [eggBatchId, setEggBatchId] = useState('');
  const [grade, setGrade] = useState('LARGE');
  const [quantity, setQuantity] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Fetch real master customers
  const { data: customers = [], refetch: refetchCustomers } = useQuery({
    queryKey: ['master-customers'],
    queryFn: async () => (await axios.get(`${API_BASE_MASTER}/customers`)).data,
  });


  const { data: balances = [], refetch } = useQuery({ queryKey: ['inventory-balance'], queryFn: async () => (await axios.get(`${API_BASE_INVENTORY}/balance`)).data });
  const eggBatches = balances.filter((b: any) => b.item.category === 'EGG');
  
  const selectedBatch = eggBatches.find((b: any) => b.batchId === eggBatchId);
  const availableQuantity = selectedBatch?.totalBalance || 0;

  const mutation = useMutation({
    mutationFn: async (payload: any) => axios.post(API_BASE_DISPATCH, payload),
    onSuccess: (res) => {
      Swal.fire('Success', `Dispatched ${quantity} eggs! Dispatch Number: ${res.data.dispatchNumber}`, 'success');
      setEggBatchId(''); setQuantity(''); setInvoiceNumber(''); refetch();
    },
    onError: (err: any) => Swal.fire('Error', err.response?.data?.message || 'Failed', 'error')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(quantity) > availableQuantity) {
      return Swal.fire('Stock Error', `Cannot dispatch ${quantity}. Only ${availableQuantity} available.`, 'error');
    }
    mutation.mutate({ customerId, eggBatchId, grade, quantity: Number(quantity), invoiceNumber, operatorId: 'Operator 1' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative overflow-hidden rounded-xl bg-blue-900 p-3.5 sm:p-4 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="flex items-center space-x-3 sm:space-x-5 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white shadow-xl shadow-blue-500/30 shrink-0">
            <Truck size={20} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight">Sales & Dispatch</h1>
            <p className="text-xs sm:text-sm font-medium text-blue-200 mt-0.5 sm:mt-1">Ship graded eggs to customers and deduct from warehouse stock</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden p-3.5 sm:p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase">Customer / Buyer</label>
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  <Plus size={12} />
                  <span>+ Quick Add Customer</span>
                </button>
              </div>
              <select required className="w-full p-2 text-sm bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                <option value="">Select Customer...</option>
                {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name} {c.contactNumber ? `(${c.contactNumber})` : ''}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Egg Batch (Stock Reference)</label>
              <select required className="w-full p-2 text-sm bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all" value={eggBatchId} onChange={e => setEggBatchId(e.target.value)}>
                <option value="">Select Egg Batch...</option>
                {eggBatches.map((b: any) => <option key={b.batchId} value={b.batchId}>{b.batchNumber || b.item.name} (Stock: {b.totalBalance})</option>)}
              </select>
            </div>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Egg Grade</label>
              <select required className="w-full p-2 text-sm bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all" value={grade} onChange={e => setGrade(e.target.value)}>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Dispatch Quantity (EA)</label>
              <input required type="number" min="1" max={availableQuantity} className="w-full p-2 text-lg text-center bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-black text-slate-900 transition-all tabular-nums shadow-sm" value={quantity} onChange={e => setQuantity(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Invoice / Ref No.</label>
              <input type="text" placeholder="Optional" className="w-full p-2 text-sm bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-t border-slate-100">
            <div>
              {eggBatchId && (
                <p className={`text-xs sm:text-sm font-bold ${Number(quantity) > availableQuantity ? 'text-red-500' : 'text-slate-500'}`}>
                  Available Batch Stock: <span className="tabular-nums font-black text-base sm:text-lg">{availableQuantity}</span>
                </p>
              )}
            </div>
            <button type="submit" disabled={mutation.isPending || !customerId || !eggBatchId || !quantity} className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-300 text-white font-black rounded-xl sm:rounded-2xl flex justify-center items-center space-x-2 transition-all shadow-lg shadow-blue-500/30">
              <Save size={18} /> <span>{mutation.isPending ? 'Processing...' : 'Confirm Dispatch'}</span>
            </button>
          </div>
        </form>
      </div>

      <QuickAddModal
        entityType="customer"
        title="Quick Add Customer / Buyer"
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onCreated={(newCustomer) => {
          refetchCustomers();
          if (newCustomer?.id) setCustomerId(newCustomer.id);
        }}
      />
    </div>
  );
}

