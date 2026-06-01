"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  Package, Plus, Trash2, Edit, X, Save, Search, Filter, 
  BarChart2, AlertTriangle, ArrowUpRight, DollarSign, 
  Layers, Activity, Zap, ChevronRight, TrendingUp, Sparkles, Box,
  PieChart as PieIcon, BarChart3, Target, MousePointer2,
  RefreshCw, Rocket, ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  AreaChart, Area, PieChart, Pie, LineChart, Line
} from 'recharts';

// Neural Brand Animation
const EtharaLogo = () => (
  <div className="flex items-center gap-2.5 group">
    <div className="relative">
      <div className="absolute inset-0 bg-indigo-500 rounded-xl rotate-6 animate-pulse opacity-20"></div>
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-xl border border-white/10 transition-transform group-hover:rotate-0">
        <Rocket size={18} className="text-white" />
      </div>
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-black text-white tracking-tighter uppercase leading-none italic">ETHARA <span className="text-indigo-500">AI</span></span>
      <span className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-1">Neural Catalog</span>
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
    products.slice(0, 8).map(p => ({
      name: (p.name || '').slice(0, 8) + '…',
      Stock: p.quantity || 0,
      color: (p.quantity || 0) === 0 ? '#ef4444' : (p.quantity || 0) < 10 ? '#f59e0b' : '#6366f1'
    })), [products]);

  // Chart 2: Value distribution (Pie)
  const valuePieData = useMemo(() => [
    { name: 'Stable', value: products.filter(p => p.quantity >= 10).length, color: '#10b981' },
    { name: 'Warning', value: products.filter(p => p.quantity < 10 && p.quantity > 0).length, color: '#f59e0b' },
    { name: 'Depleted', value: products.filter(p => p.quantity === 0).length, color: '#ef4444' }
  ].filter(v => v.value > 0), [products]);

  // Chart 3: Price Matrix (Line)
  const priceData = useMemo(() => 
    products.slice(0, 10).map(p => ({ name: p.sku.slice(-4), price: p.price })), 
  [products]);

  const stats = useMemo(() => {
    const totalVal = products.reduce((s, p) => s + (parseFloat(p.price) * p.quantity), 0);
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity < 10).length;
    return { totalVal, lowStock };
  }, [products]);

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
      else { const d = await res.json(); setErrorMsg(d.error || 'Operation failed.'); }
    } catch { setErrorMsg('Network error.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Purge asset from neural catalog?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    load();
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-in fade-in duration-1000">
        <EtharaLogo />
        <div className="flex gap-2 mt-6">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 bg-sky-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">

      {/* Hero Header */}
      <div className="relative p-8 sm:p-12 rounded-[3.5rem] overflow-hidden bg-gray-900 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-gradient-to-l from-indigo-600/10 to-transparent"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="space-y-6">
            <EtharaLogo />
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Asset Catalog</h1>
            <p className="text-gray-500 text-sm font-medium max-w-xl leading-relaxed hidden sm:block">
              Manage enterprise assets with neural-link precision. Monitor stock quantifier signals and global inventory valuations in real-time.
            </p>
          </div>
          <div className="flex-1 lg:flex-none px-8 py-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex items-center gap-10 shadow-2xl">
             <div className="text-center">
               <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total Assets</div>
               <div className="text-2xl font-black text-white italic">{products.length}</div>
             </div>
             <div className="text-center pl-10 border-l border-white/10">
               <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Valuation</div>
               <div className="text-2xl font-black text-indigo-400 italic">${(stats.totalVal / 1000).toFixed(1)}k</div>
             </div>
          </div>
        </div>
      </div>

      {/* 3 GRAPH MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GRAPH 1: Bar */}
        <div className="bg-gray-900/50 border border-white/5 p-8 rounded-[3rem] shadow-2xl h-[350px] flex flex-col">
           <h3 className="text-[10px] font-black text-white flex items-center gap-2 uppercase tracking-widest mb-8">
              <BarChart2 size={14} className="text-indigo-400" /> Stock Quantifier
           </h3>
           <div className="flex-1 w-full text-[9px] font-black">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockChartData}>
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                  <Bar dataKey="Stock" radius={[4, 4, 0, 0]} barSize={16}>
                    {stockChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* GRAPH 2: Pie */}
        <div className="bg-gray-900/50 border border-white/5 p-8 rounded-[3rem] shadow-2xl h-[350px] flex flex-col">
           <h3 className="text-[10px] font-black text-white flex items-center gap-2 uppercase tracking-widest mb-8">
              <PieIcon size={14} className="text-blue-400" /> Health Ratio
           </h3>
           <div className="flex-1 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={valuePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                    {valuePieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* GRAPH 3: Line */}
        <div className="bg-gray-900/50 border border-white/5 p-8 rounded-[3rem] shadow-2xl h-[350px] flex flex-col">
           <h3 className="text-[10px] font-black text-white flex items-center gap-2 uppercase tracking-widest mb-8">
              <TrendingUp size={14} className="text-emerald-400" /> Price Vector
           </h3>
           <div className="flex-1 w-full text-[9px] font-black">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="6 6" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form - Left */}
        <div className="lg:col-span-5 bg-gray-900 border border-white/5 p-8 sm:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full transition-all group-hover:w-2 ${editingId ? 'bg-amber-500' : 'bg-indigo-600'}`}></div>
            <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3 tracking-tight uppercase italic">
              {editingId ? <><Edit size={20} className="text-amber-400" /> Modify Record</> : <><Plus size={20} className="text-indigo-400" /> Commit Asset</>}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <input required placeholder="Asset Identity..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 text-gray-100 border border-white/10 px-6 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all hover:bg-white/[0.08]" />
                <input required placeholder="UPC-XXX-SIGNAL" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })}
                  className="w-full bg-white/5 text-gray-100 border border-white/10 px-6 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all hover:bg-white/[0.08]" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="number" step="0.01" min="0" placeholder="Valuation ($)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-white/5 text-gray-100 border border-white/10 px-6 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                  <input required type="number" min="0" placeholder="Quantifier" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
                    className="w-full bg-white/5 text-gray-100 border border-white/10 px-6 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting}
                className={`w-full group relative flex items-center justify-center gap-3 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all disabled:opacity-50 shadow-xl active:scale-95 overflow-hidden ${editingId ? 'bg-amber-600' : 'bg-indigo-600'}`}>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                {isSubmitting ? 'PROCESSING' : editingId ? 'UPDATE SIGNAL' : 'DECODE & COMMIT'}
              </button>
            </form>
        </div>

        {/* Interactive Search + Ledger */}
        <div className="lg:col-span-7 space-y-8">
           <div className="relative group">
              <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                placeholder="Search Catalog Intelligence..."
                value={search}
                onChange={e => setSearch(search)}
                className="w-full bg-gray-900 border border-white/5 text-gray-100 pl-16 pr-6 py-6 rounded-3xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all hover:bg-white/[0.02] shadow-xl"
              />
           </div>

           <div className="bg-gray-900 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">
                    <tr>
                      <th className="px-8 py-5">Protocol</th>
                      <th className="px-8 py-5">Valuation</th>
                      <th className="px-8 py-5">Quantifier</th>
                      <th className="px-8 py-5 text-right">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.slice(0, 6).map((p: any) => (
                      <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-6">
                           <p className="font-black text-white text-xs uppercase italic tracking-tight">{p.name}</p>
                           <p className="text-[8px] text-gray-600 font-black tracking-widest mt-1">{p.sku}</p>
                        </td>
                        <td className="px-8 py-6 font-black text-white text-sm italic">${parseFloat(p.price).toLocaleString()}</td>
                        <td className="px-8 py-6">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${p.quantity < 10 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                              {p.quantity} Units
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => startEdit(p)} className="p-2.5 bg-white/5 hover:bg-amber-600 text-gray-500 hover:text-white rounded-xl transition-all"><Edit size={14} /></button>
                              <button onClick={() => handleDelete(p.id)} className="p-2.5 bg-white/5 hover:bg-red-600 text-gray-500 hover:text-white rounded-xl transition-all"><Trash2 size={14} /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
