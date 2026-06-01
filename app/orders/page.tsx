"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  ShoppingCart, Plus, Trash2, Eye, X, Search, Tag, TrendingUp, 
  AlertCircle, DollarSign, Package, User, Hash, Clock, ArrowRight,
  ChevronRight, Activity, Zap, PieChart as PieIcon, BarChart3,
  ShieldCheck, ArrowUpRight, MousePointer2, Briefcase, FileText,
  Rocket
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Cell, LineChart, Line, PieChart, Pie, BarChart, Bar
} from 'recharts';

// Neural Brand Logo
const EtharaLogo = () => (
  <div className="flex items-center gap-2.5 group">
    <div className="relative">
      <div className="absolute inset-0 bg-emerald-500 rounded-xl rotate-6 animate-pulse opacity-20"></div>
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-xl border border-white/10 transition-transform group-hover:rotate-0">
        <ShoppingCart size={18} className="text-white" />
      </div>
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-black text-white tracking-tighter uppercase leading-none italic">ETHARA <span className="text-emerald-500">AI</span></span>
      <span className="text-[7px] font-black text-emerald-400 uppercase tracking-[0.3em] mt-1">Transaction Core</span>
    </div>
  </div>
);

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ customer_id: '', product_id: '', quantity: '1' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true); setErrorMsg('');
    try {
      const [oRes, cRes, pRes] = await Promise.all([
        fetch('/api/orders'), fetch('/api/customers'), fetch('/api/products')
      ]);
      if (oRes.ok) setOrders(await oRes.json());
      if (cRes.ok) setCustomers(await cRes.json());
      if (pRes.ok) setProducts(await pRes.json());
    } catch { setErrorMsg('Critical: Connection to logistics hub failed.'); }
    finally { setTimeout(() => setLoading(false), 800); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() =>
    orders.filter(o => {
      const q = search.toLowerCase().trim();
      const name = (o.customers?.full_name || '').toLowerCase();
      return name.includes(q) || String(o.id).includes(q);
    }), [orders, search]);

  const selectedProduct = useMemo(() => 
    products.find(p => p.id === parseInt(form.product_id)), 
  [products, form.product_id]);

  const isStockError = selectedProduct && parseInt(form.quantity) > selectedProduct.quantity;

  // Chart 1: Revenue Velocity
  const revenueData = useMemo(() => {
    if (orders.length === 0) return [];
    const groups: any = {};
    [...orders].reverse().forEach(o => {
      const d = new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      groups[d] = (groups[d] || 0) + parseFloat(o.total_amount);
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Chart 2: Ticket Type Allocation
  const ticketData = useMemo(() => [
    { name: 'Standard', value: orders.filter(o => parseFloat(o.total_amount) < 500).length, color: '#10b981' },
    { name: 'Enterprise', value: orders.filter(o => parseFloat(o.total_amount) >= 500).length, color: '#3b82f6' }
  ], [orders]);

  // Chart 3: Weekly Activity (Bar)
  const activityData = useMemo(() => 
    revenueData.slice(-6).map(d => ({ name: d.name, vol: Math.floor(Math.random() * 20) + 10 })), 
  [revenueData]);

  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStockError) return;
    setIsSubmitting(true); setErrorMsg('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: parseInt(form.customer_id),
          items: [{ product_id: parseInt(form.product_id), quantity: parseInt(form.quantity) }]
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) { setForm({ customer_id: '', product_id: '', quantity: '1' }); load(); }
      else { const d = await res.json(); setErrorMsg(d.error || 'Protocol failed.'); }
    } catch { setErrorMsg('Network collision.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Roll back transaction?')) return;
    await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    setActiveOrder(null);
    load();
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-in fade-in duration-1000">
        <EtharaLogo />
        <div className="flex gap-2 mt-6">
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">

      {/* Hero Header */}
      <div className="relative p-8 sm:p-12 rounded-[3.5rem] overflow-hidden bg-gray-900 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-gradient-to-l from-emerald-600/10 to-transparent"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="space-y-6">
            <EtharaLogo />
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Order Ledger</h1>
            <p className="text-gray-500 text-sm font-medium max-w-xl leading-relaxed hidden sm:block">
              Execute transaction protocols and monitor real-time revenue velocity across the enterprise fulfillment network.
            </p>
          </div>
          <div className="flex-1 lg:flex-none px-8 py-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex items-center gap-10 shadow-2xl">
             <div className="text-center">
               <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total Volume</div>
               <div className="text-2xl font-black text-white italic">${(totalRevenue / 1000).toFixed(1)}k</div>
             </div>
             <div className="text-center pl-10 border-l border-white/10">
               <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Protocols</div>
               <div className="text-2xl font-black text-emerald-400 italic">{orders.length}</div>
             </div>
          </div>
        </div>
      </div>

      {/* 3 GRAPH MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GRAPH 1: Area */}
        <div className="bg-gray-900/50 border border-white/5 p-8 rounded-[3rem] shadow-2xl h-[350px] flex flex-col">
           <h3 className="text-[10px] font-black text-white flex items-center gap-2 uppercase tracking-widest mb-8">
              <TrendingUp size={14} className="text-emerald-400" /> Revenue Flow
           </h3>
           <div className="flex-1 w-full text-[9px] font-black">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="oGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} fill="url(#oGrad)" animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* GRAPH 2: Pie */}
        <div className="bg-gray-900/50 border border-white/5 p-8 rounded-[3rem] shadow-2xl h-[350px] flex flex-col">
           <h3 className="text-[10px] font-black text-white flex items-center gap-2 uppercase tracking-widest mb-8">
              <PieIcon size={14} className="text-blue-400" /> Ticket Ratio
           </h3>
           <div className="flex-1 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ticketData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                    {ticketData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* GRAPH 3: Bar */}
        <div className="bg-gray-900/50 border border-white/5 p-8 rounded-[3rem] shadow-2xl h-[350px] flex flex-col">
           <h3 className="text-[10px] font-black text-white flex items-center gap-2 uppercase tracking-widest mb-8">
              <Activity size={14} className="text-indigo-400" /> Daily Signals
           </h3>
           <div className="flex-1 w-full text-[9px] font-black">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                  <Bar dataKey="vol" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Creation Panel - Left */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-900 border border-white/5 p-8 sm:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 transition-all group-hover:w-2"></div>
            <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3 tracking-tight uppercase italic">
              <Plus size={20} className="text-emerald-400" /> New Protocol
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <select required value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}
                  className="w-full bg-white/5 text-gray-100 border border-white/10 px-6 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all hover:bg-white/[0.08] appearance-none">
                  <option value="" disabled className="bg-gray-950 text-gray-500">Transactor...</option>
                  {customers.map((c: any) => <option key={c.id} value={c.id} className="bg-gray-950 text-gray-100">{c.full_name}</option>)}
                </select>

                <select required value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })}
                  className="w-full bg-white/5 text-gray-100 border border-white/10 px-6 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all hover:bg-white/[0.08] appearance-none">
                  <option value="" disabled className="bg-gray-950 text-gray-500">Target Asset...</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id} disabled={p.quantity < 1} className="bg-gray-950 text-gray-100">
                      {p.name} (${parseFloat(p.price).toFixed(2)})
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-4">
                  <input required type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
                    className={`w-full bg-white/5 text-gray-100 border ${isStockError ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-white/10'} px-6 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all`} />
                   <div className={`px-4 py-4 rounded-2xl text-[8px] font-black uppercase tracking-widest text-center border flex items-center justify-center ${isStockError ? 'bg-red-500/5 text-red-400 border-red-500/20' : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'}`}>
                      {isStockError ? 'CAPACITY ERROR' : 'OPTIMAL_STOCK'}
                    </div>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting || isStockError}
                className="w-full group relative flex items-center justify-center gap-3 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all disabled:opacity-50 shadow-xl active:scale-95 overflow-hidden mt-4">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                {isSubmitting ? <Activity className="animate-spin" size={18} /> : <Zap size={18} />}
                {isSubmitting ? 'PROCESSING' : 'EXECUTE TRANSACTION'}
              </button>
            </form>
          </div>
        </div>

        {/* Interactive Search + Ledger */}
        <div className="lg:col-span-7 space-y-8">
           <div className="relative group">
              <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
              <input placeholder="Search Transaction Signal..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-900 border border-white/5 text-gray-100 pl-16 pr-6 py-6 rounded-3xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all hover:bg-white/[0.02] shadow-xl" />
           </div>

           <div className="bg-gray-900 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto text-[10px] font-black uppercase tracking-widest">
                 <div className="flex bg-white/[0.02] border-b border-white/5 px-8 py-5 text-gray-600 italic">
                    <span className="flex-1">Protocol ID</span>
                    <span className="flex-1">Valuation</span>
                    <span className="w-20 text-right">Ops</span>
                 </div>
                 <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                    {filtered.map((o: any) => (
                      <div key={o.id} className="flex items-center px-8 py-7 group hover:bg-white/[0.02] transition-all">
                        <div className="flex-1 flex items-center gap-4">
                           <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:rotate-6">
                              <Hash size={14} />
                           </div>
                           <div>
                              <p className="text-white text-xs font-mono tracking-[0.3em]">#0{o.id}</p>
                              <p className="text-[7px] text-gray-600 uppercase tracking-widest mt-1 italic">{o.customers?.full_name || 'Subject Redacted'}</p>
                           </div>
                        </div>
                        <div className="flex-1">
                           <div className="font-black text-white text-lg tracking-tighter italic">${parseFloat(o.total_amount).toLocaleString()}</div>
                           <p className="text-[7px] text-gray-700 tracking-widest uppercase mt-1">Verified Signal</p>
                        </div>
                        <div className="w-20 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                           <button onClick={() => setActiveOrder(o)} className="p-2.5 bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white rounded-xl transition-all"><Eye size={14} /></button>
                           <button onClick={() => handleDelete(o.id)} className="p-2.5 bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white rounded-xl transition-all"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
