"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  Package, Plus, Trash2, Edit, X, Save, Search, Filter, 
  BarChart2, AlertTriangle, ArrowUpRight, DollarSign, 
  Layers, Activity, Zap, ChevronRight, TrendingUp, Sparkles, Box
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  AreaChart, Area
} from 'recharts';

// Custom Product Logo
const ProductLogo = ({ className = "w-10 h-10" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-indigo-500 rounded-xl rotate-6 animate-pulse opacity-20"></div>
    <div className="absolute inset-0 bg-indigo-600 rounded-xl -rotate-3 transition-transform hover:rotate-0 flex items-center justify-center shadow-lg border border-white/10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
      <Package size={20} className="text-white relative z-10" />
    </div>
  </div>
);

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) setProducts(await res.json());
      else { const d = await res.json(); setErrorMsg(d.error || 'Failed to load.'); }
    } catch { setErrorMsg('Cannot connect to backend.'); }
    finally { setTimeout(() => setLoading(false), 800); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return products
      .filter(p => {
        const q = (search || '').toLowerCase().trim();
        if (!q) return true;
        return (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
      })
      .filter(p => {
        if (stockFilter === 'low') return (p.quantity || 0) > 0 && (p.quantity || 0) < 10;
        if (stockFilter === 'out') return (p.quantity || 0) === 0;
        return true;
      });
  }, [products, search, stockFilter]);

  const chartData = useMemo(() =>
    products.slice(0, 8).map(p => ({
      name: (p.name || '').length > 8 ? (p.name || '').slice(0, 8) + '…' : (p.name || 'Unnamed'),
      Stock: p.quantity || 0,
      Value: (p.price || 0) * (p.quantity || 0),
      color: (p.quantity || 0) === 0 ? '#ef4444' : (p.quantity || 0) < 10 ? '#f59e0b' : '#6366f1'
    })), [products]);

  const stats = useMemo(() => {
    const totalVal = products.reduce((s, p) => s + (parseFloat(p.price) * p.quantity), 0);
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity < 10).length;
    const outStock = products.filter(p => p.quantity === 0).length;
    return { totalVal, lowStock, outStock };
  }, [products]);

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setForm({ name: p.name, sku: p.sku, price: p.price.toString(), quantity: p.quantity.toString() });
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setEditingId(null); setForm({ name: '', sku: '', price: '', quantity: '' }); setErrorMsg(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setErrorMsg('');
    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify({ name: form.name, sku: form.sku, price: parseFloat(form.price), quantity: parseInt(form.quantity) }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) { setForm({ name: '', sku: '', price: '', quantity: '' }); setEditingId(null); load(); }
      else { const d = await res.json(); setErrorMsg(d.error || d.detail || 'Operation failed.'); }
    } catch { setErrorMsg('Network error.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently delete this product asset from catalog?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) load();
      else { const d = await res.json(); setErrorMsg(d.error || d.detail || 'Failed to delete.'); }
    } catch { setErrorMsg('Network error.'); }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse"></div>
          <ProductLogo className="w-20 h-20 relative z-10" />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight uppercase">Catalog Indexing</h2>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Hero Header */}
      <div className="relative p-8 rounded-3xl overflow-hidden bg-gray-900 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-600/10 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Package className="text-indigo-400" size={24} />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight uppercase">Product Catalog</h1>
            </div>
            <p className="text-gray-400 font-medium max-w-md">Index, monitor and manage enterprise inventory assets.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4">
              <div className="text-center px-4 border-r border-white/10">
                <div className="text-2xl font-black text-white">{products.length}</div>
                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Total SKUs</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-black text-indigo-400">
                  ${(stats.totalVal / 1000).toFixed(1)}k
                </div>
                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Total Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm flex justify-between items-center animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[11px]"><AlertTriangle size={16} /> {errorMsg}</div>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"><X size={16} /></button>
        </div>
      )}

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form - Left */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-900 border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full transition-all group-hover:w-2 ${editingId ? 'bg-amber-500' : 'bg-indigo-600'}`}></div>
            <h3 className="text-lg font-black text-white mb-8 flex items-center gap-2 tracking-tight uppercase">
              {editingId ? <><Edit size={18} className="text-amber-400" /> Edit Entry #{editingId}</> : <><Plus size={18} className="text-indigo-400" /> Catalog New Asset</>}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Asset Nomenclature</label>
                  <input required placeholder="e.g. Quantum Processor" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/5 text-gray-100 border border-white/10 px-4 py-3.5 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none placeholder-gray-700 transition-all hover:bg-white/[0.08]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Universal SKU</label>
                  <input required placeholder="UPC-000-X" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })}
                    className="w-full bg-white/5 text-gray-100 border border-white/10 px-4 py-3.5 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none placeholder-gray-700 transition-all hover:bg-white/[0.08]" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Unit Valuation ($)</label>
                  <input required type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-white/5 text-gray-100 border border-white/10 px-4 py-3.5 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none placeholder-gray-700 transition-all hover:bg-white/[0.08]" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Stock Quantifier</label>
                  <input required type="number" min="0" placeholder="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
                    className="w-full bg-white/5 text-gray-100 border border-white/10 px-4 py-3.5 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none placeholder-gray-700 transition-all hover:bg-white/[0.08]" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSubmitting}
                  className={`flex-1 group relative flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg active:scale-95 overflow-hidden ${editingId ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'}`}>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                  {editingId ? <Save size={18} /> : <Zap size={18} />}
                  {isSubmitting ? 'PROCESSING...' : editingId ? 'UPDATE RECORD' : 'COMMIT TO CATALOG'}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-2xl transition-all">
                    <X size={20} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Visualizer - Right */}
        <div className="lg:col-span-7 bg-gray-900 border border-white/5 p-8 rounded-[2.5rem] shadow-xl flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-tight uppercase">
              <BarChart2 size={20} className="text-indigo-400" /> Stock Visualization
            </h3>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-white/10 rounded-lg">Quantity</button>
              <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors">Valuation</button>
            </div>
          </div>
          
          <div className="flex-1 w-full mt-2">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="5 5" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }} 
                    itemStyle={{ color: '#6366f1' }}
                  />
                  <Bar dataKey="Stock" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-4">
                <Box size={48} className="opacity-10" />
                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-30">No catalog data mapped</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            placeholder="Global Search: Asset Name, SKU Code, or Identifier..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-white/5 text-gray-100 pl-14 pr-6 py-5 rounded-3xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none placeholder-gray-600 transition-all hover:bg-white/[0.02] shadow-xl"
          />
        </div>
        <div className="flex bg-gray-900 p-1.5 rounded-2xl border border-white/5 self-stretch md:self-auto overflow-x-auto">
          {(['all', 'low', 'out'] as const).map(f => (
            <button key={f} onClick={() => setStockFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${stockFilter === f
                ? f === 'out' ? 'bg-red-600 text-white shadow-lg' : f === 'low' ? 'bg-amber-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-500 hover:text-gray-300'}`}>
              {f === 'all' ? 'Unified Catalog' : f === 'low' ? 'Critical (Low)' : 'Depleted (Out)'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Ledger */}
      <div className="bg-gray-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Asset Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Valuation</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Inventory Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-3xl flex items-center justify-center border border-white/5">
                       <Box size={32} className="text-gray-600" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-xl font-black text-white">No Assets Found</p>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Refine search vector or commit a new asset to the catalog.</p>
                    </div>
                    {(search || stockFilter !== 'all') && (
                      <button onClick={() => { setSearch(''); setStockFilter('all'); }} 
                        className="mt-4 px-6 py-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        Reset Data Signal
                      </button>
                    )}
                  </div>
                </td></tr>
              ) : filtered.map((p: any) => (
                <tr key={p.id} className={`group hover:bg-white/[0.02] transition-colors ${editingId === p.id ? 'bg-amber-500/5' : ''}`}>
                  <td className="px-8 py-6">
                     <span className="font-black text-gray-500 font-mono tracking-widest text-xs uppercase">#{p.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.quantity === 0 ? 'from-red-600/20 to-red-600/5 text-red-400 border-red-500/20' : 'from-indigo-600/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20'} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                         <Box size={18} />
                       </div>
                       <div>
                         <div className="font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors">{p.name}</div>
                         <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">{p.sku}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-white tracking-tight text-lg">${parseFloat(p.price).toFixed(2)}</td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-lg
                      ${p.quantity >= 10 ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5'
                        : p.quantity > 0 ? 'bg-amber-500/5 text-amber-400 border-amber-500/20 shadow-amber-500/5'
                          : 'bg-red-500/5 text-red-400 border-red-500/20 shadow-red-500/5'}`}>
                      {p.quantity === 0 && <AlertTriangle size={12} />}
                      <span className="opacity-60">Status:</span> {p.quantity === 0 ? 'DEPLETED' : p.quantity < 10 ? 'CRITICAL' : 'STABLE'} 
                      <span className="ml-1 opacity-100">[{p.quantity}]</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button onClick={() => startEdit(p)} title="Edit Record"
                        className="p-3 bg-white/5 hover:bg-amber-600 text-gray-400 hover:text-white rounded-xl transition-all">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} title="Purge Record"
                        className="p-3 bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-8 py-6 bg-white/[0.01] border-t border-white/5 flex justify-between items-center">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Processing <span className="text-indigo-400">{filtered.length}</span> of <span className="text-white">{products.length}</span> catalog items
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">High Integrity Mode</span>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
