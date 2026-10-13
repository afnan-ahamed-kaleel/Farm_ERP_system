import React, { useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE = 'http://localhost:3000/api/v1/master-data';

interface QuickAddModalProps {
  entityType: 'customer' | 'supplier' | 'location' | 'flock' | 'item' | 'cause';
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newRecord: any) => void;
}

export default function QuickAddModal({
  entityType,
  title,
  isOpen,
  onClose,
  onCreated,
}: QuickAddModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [extraField, setExtraField] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (entityType === 'customer') {
        res = await axios.post(`${API_BASE}/customers`, {
          name,
          contactNumber: extraField || null,
        });
      } else if (entityType === 'supplier') {
        res = await axios.post(`${API_BASE}/suppliers`, {
          name,
          type: 'HATCHERY',
          contactNumber: extraField || null,
        });
      } else if (entityType === 'location') {
        res = await axios.post(`${API_BASE}/locations`, {
          name,
          type: extraField || 'HOUSE',
        });
      } else if (entityType === 'flock') {
        res = await axios.post(`${API_BASE}/flocks`, {
          batchNumber: code.toUpperCase(),
          breed: name || 'Cobb 500',
          hatchDate: new Date().toISOString(),
        });
      } else if (entityType === 'item') {
        res = await axios.post(`${API_BASE}/items`, {
          code: code.toUpperCase(),
          name,
          category: extraField || 'RAW_MATERIAL',
          primaryUom: 'KG',
        });
      } else if (entityType === 'cause') {
        res = await axios.post(`${API_BASE}/reasons`, {
          category: 'MORTALITY_CAUSE',
          code: (name.replace(/\s+/g, '_')).toUpperCase(),
          name,
          description: extraField || null,
        });
      }

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Quick added: ${name || code}`,
        showConfirmButton: false,
        timer: 2000,
      });

      onCreated(res?.data);
      onClose();
    } catch (err: any) {
      Swal.fire('Failed', err.response?.data?.message || 'Could not quick-add record', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getEntityLabel = () => {
    switch (entityType) {
      case 'customer': return 'New Customer / Buyer';
      case 'supplier': return 'New Hatchery / Supplier';
      case 'location': return 'New House / Shed';
      case 'flock': return 'New Flock Batch';
      case 'item': return 'New Item';
      case 'cause': return 'New Mortality Cause';
      default: return 'New Record';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Plus size={16} />
            </div>
            <h3 className="font-bold text-sm">{title || `Quick Add: ${getEntityLabel()}`}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {entityType === 'flock' && (
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Batch Number</label>
              <input
                required
                type="text"
                placeholder="e.g. BATCH-2026-X"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">
              {entityType === 'flock' ? 'Breed' : 'Name / Label'}
            </label>
            <input
              required
              type="text"
              placeholder={entityType === 'flock' ? 'e.g. Cobb 500, Ross 308' : 'e.g. Supreme Hatchery, Shed 4'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-800"
            />
          </div>

          {(entityType === 'customer' || entityType === 'supplier') && (
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +94 77 123 4567"
                value={extraField}
                onChange={(e) => setExtraField(e.target.value)}
                className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          )}

          {entityType === 'location' && (
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Facility Type</label>
              <select
                value={extraField || 'HOUSE'}
                onChange={(e) => setExtraField(e.target.value)}
                className="mt-1 w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
              >
                <option value="HOUSE">House / Shed</option>
                <option value="BROODER">Brooder Facility</option>
                <option value="GROWER">Grower Facility</option>
                <option value="LAYER">Layer Facility</option>
              </select>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Save size={14} />
              <span>{loading ? 'Adding...' : 'Save & Select'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
