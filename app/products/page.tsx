"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  Package, Plus, Trash2, Edit, X, Save, Search, Filter, 
  BarChart2, AlertTriangle, ArrowUpRight, DollarSign, 
  Layers, Activity, Zap, ChevronRight, TrendingUp, Sparkles, Box,
  PieChart as PieIcon, BarChart3, Target, MousePointer2
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  AreaChart, Area, PieChart, Pie
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

  // Chart 1: Stock distribution
  const stockChartData = useMemo(() =>
    products.slice(0, 10).map(p => ({
      name: (p.name || '').length > 8 ? (p.name || '').slice(0, 8) + '…' : (p.name || 'Unnamed'),
      Stock: p.quantity || 0,
      color: (p.quantity || 0) === 0 ? '#ef4444' : (p.quantity || 0) < 10 ? '#f59e0b' : '#6366f1'
    })), [products]);

  // Chart 2: Value distribution (Pie)
  const valuePieData = useMemo(() => {
    const total = products.reduce((s, p) => s + (p.price * p.quantity), 0);
    if (total === 0) return [];
    
    const low = products.filter(p => p.price < 100).reduce((s, p) => s + (p.price * p.quantity), 0);
    const mid = products.filter(p => p.price >= 100 && p.price < 1000).reduce((s, p) => s + (p.price * p.quantity), 0);
    const high = products.filter(p => p.price >= 1000).reduce((s, p) => s + (p.price * p.quantity), 0);

    return [
      { name: 'Standard (<$100)', value: low, color: '#6366f1' },
      { name: 'Premium (<$1k)', value: mid, color: '#3b82f6' },
      { name: 'Enterprise (>$1k)', value: high, color: '#10b981' }
    ].filter(v => v.value > 0);
  }, [products]);

  const stats = useMemo(() => {
    const totalVal = products.reduce((s, p) => s + (parseFloat(p.price) * p.quantity), 0);
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity < 10).length;
    return { totalVal, lowStock };
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
    if (!confirm('Permanently purge this asset from catalog?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) load();
      else { const d = await res.json(); setErrorMsg(d.error || d.detail || 'Failed to delete.'); }
    } catch { setErrorMsg('Network error.'); }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
        <ProductLogo className="w-20 h-20 mb-8" />
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-black text-white tracking-widest uppercase">Indexing Catalog</h2>
          <div className="flex gap-2 mt-4">
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">

      {/* Hero Header */}
      <div className="relative p-6 sm:p-10 rounded-[3rem] overflow-hidden bg-gray-900 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-full lg:w-1/3 h-full bg-gradient-to-l from-indigo-600/10 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <ProductLogo className="w-12 h-12" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Asset Catalog</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Universal Product Indexing Active</p>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-xs font-medium max-w-lg leading-relaxed hidden sm:block">
              Deploy new assets, monitor stock quantifier signals, and manage enterprise-grade inventory valuations from the centralized product ledger.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center gap-6 shadow-xl">
               <div className="text-center">
                 <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Assets</div>
                 <div className="text-xl font-black text-white">{products.length}</div>
               </div>
               <div className="text-center pl-6 border-l border-white/10">
                 <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Value</div>
                 <div className="text-xl font-black text-indigo-400">${(stats.totalVal / 1000).toFixed(1)}k</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-between items-center animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2"><AlertTriangle size={16} /> {errorMsg}</div>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"><X size={16} /></button>
        </div>
      )}

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form - Left */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-900 border border-white/5 p-6 sm:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full transition-all group-hover:w-2 ${editingId ? 'bg-amber-500' : 'bg-indigo-600'}`}></div>
            <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3 tracking-tight uppercase">
              {editingId ? <><Edit size={20} className="text-amber-400" /> Edit Record</> : <><Plus size={20} className="text-indigo-400" /> New Entry</>}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Asset Identity</label>
                  <input required placeholder="Universal nomenclature..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/5 text-gray-100 border border-white/10 px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all hover:bg-white/[0.08]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Universal SKU</label>
                  <input required placeholder="UPC-XXX-SIGNAL" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })}
                    className="w-full bg-white/5 text-gray-100 border border-white/10 px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all hover:bg-white/[0.08]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Valuation ($)</label>
                    <input required type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                      className="w-full bg-white/5 text-gray-100 border border-white/10 px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all hover:bg-white/[0.08]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Quantifier</label>
                    <input required type="number" min="0" placeholder="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
                      className="w-full bg-white/5 text-gray-100 border border-white/10 px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all hover:bg-white/[0.08]" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={isSubmitting}
                  className={`flex-1 group relative flex items-center justify-center gap-3 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl active:scale-95 overflow-hidden ${editingId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                  {editingId ? <Save size={18} /> : <Zap size={18} />}
                  {isSubmitting ? 'PROCESSING' : editingId ? 'SAVE CHANGES' : 'COMMIT ASSET'}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-2xl transition-all">
                    <X size={24} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Analytics Hub - Right */}
        <div className="lg:col-span-7 space-y-8">
           {/* Chart 1: Stock Level Bar */}
           <div className="bg-gray-900 border border-white/5 p-8 rounded-[3rem] shadow-2xl flex flex-col h-[320px]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-widest">
                  <BarChart2 size={16} className="text-indigo-400" /> Stock quantifier
                </h3>
              </div>
              <div className="flex-1 w-full text-[9px] font-black">
                {stockChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockChartData} margin={{ left: -30 }}>
                      <CartesianGrid strokeDasharray="6 6" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
                      <Bar dataKey="Stock" radius={[4, 4, 0, 0]} barSize={20}>
                        {stockChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                   <div className="h-full flex items-center justify-center text-gray-700 uppercase tracking-widest">No Signals</div>
                )}
              </div>
           </div>

           {/* Chart 2: Value Distribution Pie */}
           <div className="bg-gray-900 border border-white/5 p-8 rounded-[3rem] shadow-2xl flex flex-col h-[320px]">
              <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-widest mb-4">
                <PieIcon size={16} className="text-blue-500" /> Valuation Ratios
              </h3>
              <div className="flex-1 flex flex-col sm:flex-row items-center gap-8">
                 <div className="flex-1 w-full h-full min-h-[160px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={valuePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={10} dataKey="value">
                          {valuePieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
                      </PieChart>
                   </ResponsiveContainer>
                 </div>
                 <div className="grid grid-cols-1 gap-3 w-full sm:w-auto">
                    {valuePieData.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{item.name}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Interactive Toolbar */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full group">
          <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            placeholder="Global Asset Lookup: SKU, Identity, or Protocol ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-white/5 text-gray-100 pl-16 pr-6 py-6 rounded-[2rem] text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all hover:bg-white/[0.02] shadow-xl"
          />
        </div>
        <div className="flex bg-gray-900 p-2 rounded-[1.5rem] border border-white/5 self-stretch md:self-auto overflow-x-auto gap-2">
          {(['all', 'low', 'out'] as const).map(f => (
            <button key={f} onClick={() => setStockFilter(f)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${stockFilter === f
                ? f === 'out' ? 'bg-red-600 text-white shadow-lg' : f === 'low' ? 'bg-amber-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
              {f === 'all' ? 'Unified' : f === 'low' ? 'Critical' : 'Depleted'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-gray-900 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Protocol</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Asset Core</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Valuation</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Inventory Signal</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-32 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-gray-800 rounded-[2rem] flex items-center justify-center border border-white/5 animate-pulse">
                       <Box size={32} className="text-gray-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-black text-white uppercase italic tracking-tighter">No Subjects Identified</p>
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Adjust search parameters or establish new asset protocol</p>
                    </div>
                  </div>
                </td></tr>
              ) : filtered.map((p: any) => (
                <tr key={p.id} className={`group hover:bg-white/[0.02] transition-colors ${editingId === p.id ? 'bg-amber-500/5' : ''}`}>
                  <td className="px-8 py-7">
                     <span className="font-black text-gray-500 font-mono tracking-[0.3em] text-[10px]">#0{p.id}</span>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-5">
                       <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.quantity === 0 ? 'from-red-600/20 to-red-600/5 text-red-400 border-red-500/20' : 'from-indigo-600/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20'} border flex items-center justify-center transition-transform group-hover:rotate-6`}>
                         <Package size={20} />
                       </div>
                       <div>
                         <div className="font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors uppercase italic">{p.name}</div>
                         <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">{p.sku}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                     <div className="font-black text-white tracking-tighter text-xl">${parseFloat(p.price).toLocaleString()}</div>
                  </td>
                  <td className="px-8 py-7">
                    <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all
                      ${p.quantity >= 10 ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'
                        : p.quantity > 0 ? 'bg-amber-500/5 text-amber-400 border-amber-500/20'
                          : 'bg-red-500/5 text-red-400 border-red-500/20'}`}>
                      {p.quantity === 0 && <AlertTriangle size={14} />}
                      {p.quantity === 0 ? 'DEPLETED' : p.quantity < 10 ? 'CRITICAL' : 'STABLE'} 
                      <span className="ml-1 opacity-100 font-mono">[{p.quantity}]</span>
                    </div>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button onClick={() => startEdit(p)} className="p-3.5 bg-white/5 hover:bg-amber-600 text-gray-400 hover:text-white rounded-2xl transition-all"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-3.5 bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white rounded-2xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
