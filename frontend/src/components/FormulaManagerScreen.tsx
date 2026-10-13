import { useState } from 'react';
import { Beaker, Plus, Save, History, Scale, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import QuickAddModal from './QuickAddModal';

const API_BASE_FEED = 'http://localhost:3000/api/v1/feed';

export default function FormulaManagerScreen() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [targetStage, setTargetStage] = useState('GROWER');
  const [baseQuantityKg, setBaseQuantityKg] = useState(1000);
  const [ingredients, setIngredients] = useState([{ rawMaterialItemId: '', inclusionKg: 0 }]);
  const [isQuickAddItemOpen, setIsQuickAddItemOpen] = useState(false);

  const { data: formulas = [], refetch } = useQuery({ 
    queryKey: ['formulas'], 
    queryFn: async () => (await axios.get(`${API_BASE_FEED}/formula`)).data 
  });

  const { data: rawMaterials = [], refetch: refetchItems } = useQuery({ 
    queryKey: ['master-raw-materials'], 
    queryFn: async () => (await axios.get(`http://localhost:3000/api/v1/master-data/items?category=RAW_MATERIAL`)).data 
  });

  const totalInclusion = ingredients.reduce((sum, item) => sum + (Number(item.inclusionKg) || 0), 0);
  const diff = baseQuantityKg - totalInclusion;
  const isBalanced = Math.abs(diff) < 0.1 && totalInclusion > 0;

  const mutation = useMutation({
    mutationFn: async (payload: any) => axios.post(`${API_BASE_FEED}/formula`, payload),
    onSuccess: () => {
      Swal.fire({
        title: 'Formula Saved',
        text: 'Formula version locked and saved successfully.',
        icon: 'success',
        confirmButtonColor: '#0f172a'
      });
      setCode(''); 
      setName(''); 
      setIngredients([{ rawMaterialItemId: '', inclusionKg: 0 }]);
      refetch();
    },
    onError: (err: any) => Swal.fire('Error', err.response?.data?.message || 'Failed to save', 'error')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return Swal.fire('Imbalanced', `Total ingredients must equal exactly ${baseQuantityKg}kg`, 'warning');
    
    mutation.mutate({
      code,
      name,
      targetStage,
      baseQuantityKg,
      ingredients: ingredients.map(i => ({ 
        rawMaterialItemId: i.rawMaterialItemId, 
        inclusionKg: Number(i.inclusionKg) 
      }))
    });
  };

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col space-y-3 animate-in fade-in duration-200">
      
      {/* Simple, Clean Top Banner */}
      <div className="relative overflow-hidden rounded-xl bg-amber-900 px-4 py-3 text-white shadow-md shrink-0">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-500/15 blur-2xl" />
        <div className="flex items-center space-x-3.5 relative z-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30 shrink-0">
            <Beaker size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Feed Formula Manager</h1>
            <p className="text-xs font-medium text-amber-200/90 mt-0.5">Design, validate, and version control nutrition recipes</p>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Clean Cards Sized Evenly to the Screen (Zero Page Scroll) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        
        {/* LEFT CARD: Create New Version */}
        <div className="lg:col-span-2 h-full min-h-0 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-4 h-full flex flex-col overflow-hidden">
            <h2 className="text-base font-black text-slate-800 mb-3 shrink-0">Create New Version</h2>
            
            <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col justify-between">
              
              <div className="flex-1 min-h-0 flex flex-col space-y-3">
                
                {/* 4 Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Formula Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g. GF-01" 
                      className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold text-slate-800 transition-all" 
                      value={code} 
                      onChange={e => setCode(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Formula Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Standard Grower" 
                      className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold text-slate-800 transition-all" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Target Stage</label>
                    <select 
                      className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold text-slate-800 transition-all cursor-pointer" 
                      value={targetStage} 
                      onChange={e => setTargetStage(e.target.value)}
                    >
                      <option value="GROWER">Grower</option>
                      <option value="LAYER">Layer</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Base Batch (KG)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold text-slate-800 transition-all" 
                      value={baseQuantityKg} 
                      onChange={e => setBaseQuantityKg(Number(e.target.value))} 
                      required 
                    />
                  </div>
                </div>

                {/* Ingredients Recipe Section */}
                <div className="flex-1 min-h-0 flex flex-col pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2.5 shrink-0">
                    <h3 className="text-sm font-bold text-slate-700">Ingredients Recipe</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => setIsQuickAddItemOpen(true)}
                        className="flex items-center space-x-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus size={14} /> <span>+ Add Raw Material</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIngredients([...ingredients, { rawMaterialItemId: '', inclusionKg: 0 }])} 
                        className="flex items-center space-x-1 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus size={14} /> <span>Add Row</span>
                      </button>
                    </div>
                  </div>

                  {/* Clean rows list */}
                  <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1">
                    {ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-1.5 bg-slate-50/70 rounded-xl border border-slate-100">
                        <select 
                          required
                          className="flex-1 min-w-[140px] p-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-semibold text-slate-700 cursor-pointer"
                          value={ing.rawMaterialItemId} 
                          onChange={e => {
                            const newIng = [...ingredients];
                            newIng[idx].rawMaterialItemId = e.target.value;
                            setIngredients(newIng);
                          }}
                        >
                          <option value="">Select Raw Material...</option>
                          {rawMaterials.map((rm: any) => (
                            <option key={rm.id} value={rm.id}>{rm.name} ({rm.code})</option>
                          ))}
                        </select>

                        <div className="relative w-28 sm:w-32 shrink-0">
                          <input 
                            type="number" 
                            step="0.01" 
                            required 
                            placeholder="0.0"
                            className="w-full p-2 pr-9 text-right bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-bold tabular-nums"
                            value={ing.inclusionKg || ''}
                            onChange={e => {
                              const newIng = [...ingredients];
                              newIng[idx].inclusionKg = parseFloat(e.target.value) || 0;
                              setIngredients(newIng);
                            }}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">KG</span>
                        </div>

                        <div className="w-14 text-right shrink-0">
                          <span className="text-xs font-bold text-slate-500 tabular-nums">
                            {(((Number(ing.inclusionKg) || 0) / (baseQuantityKg || 1)) * 100).toFixed(1)}%
                          </span>
                        </div>

                        {ingredients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                            className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                            title="Remove row"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Clean Validation Footer */}
              <div className={`mt-3 p-3 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border transition-colors shrink-0 ${
                isBalanced ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg shrink-0 ${isBalanced ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    <Scale size={18} />
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wide ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                      {isBalanced ? 'Perfectly Balanced' : 'Weight Mismatch'}
                    </p>
                    <p className={`text-xs font-semibold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                      Total: {totalInclusion.toFixed(1)}kg / {baseQuantityKg}kg
                    </p>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={!isBalanced || mutation.isPending} 
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex justify-center items-center space-x-2 transition-all shadow cursor-pointer disabled:cursor-not-allowed"
                >
                  <Save size={15} /> 
                  <span>{mutation.isPending ? 'Saving...' : 'Save & Lock Version'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* RIGHT CARD: Version History */}
        <div className="h-full min-h-0 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-4 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between space-x-2 mb-3 pb-2.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center space-x-2">
                <History className="text-amber-500" size={18} />
                <h2 className="font-bold text-slate-800 text-sm">Version History</h2>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {formulas.length} {formulas.length === 1 ? 'recipe' : 'recipes'}
              </span>
            </div>
            
            {/* Scrollable list inside the card - clean, simple, un-cluttered */}
            <div className="space-y-3 overflow-y-auto flex-1 min-h-0 pr-1 focus:outline-none">
              {formulas.map((f: any) => (
                <div key={f.id} className="space-y-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <div className="border-b border-slate-200/60 pb-1.5 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-800 text-sm">{f.name}</p>
                      <p className="text-[11px] font-bold text-slate-400">{f.code} • {f.targetStage}</p>
                    </div>
                  </div>
                  <div className="space-y-2 pl-3 border-l-2 border-amber-300">
                    {f.versions?.map((v: any) => (
                      <div key={v.id} className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs relative">
                        {v.isLocked && (
                          <div className="absolute top-2 right-2 text-[9px] font-extrabold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md border border-slate-200">
                            LOCKED
                          </div>
                        )}
                        <p className="text-xs font-black text-amber-600 mb-0.5">v{v.versionNumber}</p>
                        <p className="text-[11px] text-slate-500 mb-2">Base: {v.baseQuantityKg}kg</p>
                        <div className="space-y-1">
                          {v.ingredients?.map((ing: any) => {
                            const itemName = ing.rawMaterialItem?.name || 
                              rawMaterials.find((rm: any) => rm.id === ing.rawMaterialItemId)?.name || 
                              'Item';
                            return (
                              <div key={ing.id} className="flex justify-between text-xs">
                                <span className="font-medium text-slate-700">{itemName}</span>
                                <span className="font-bold text-slate-900 tabular-nums">{ing.inclusionKg}kg</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {formulas.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center my-auto">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-2 text-slate-400">
                    <History size={18} />
                  </div>
                  <p className="text-xs font-bold text-slate-500">No formulas created yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Saved recipes will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <QuickAddModal
        entityType="item"
        title="Quick Add Feed Raw Material"
        isOpen={isQuickAddItemOpen}
        onClose={() => setIsQuickAddItemOpen(false)}
        onCreated={() => {
          refetchItems();
        }}
      />
    </div>
  );
}
