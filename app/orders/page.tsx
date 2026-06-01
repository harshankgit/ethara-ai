"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  ShoppingCart, Plus, Trash2, Eye, X, Search, Tag, TrendingUp, 
  AlertCircle, DollarSign, Package, User, Hash, Clock, ArrowRight,
  ChevronRight, Activity, Zap, PieChart as PieIcon, BarChart3,
  ShieldCheck, ArrowUpRight, MousePointer2, Briefcase, FileText, Box
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Cell, AreaChart, Area, LineChart, Line, PieChart, Pie
} from 'recharts';

// Custom Order Logo
const OrderLogo = ({ className = "w-10 h-10" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-emerald-500 rounded-xl rotate-6 animate-pulse opacity-20"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl -rotate-3 transition-transform hover:rotate-0 flex items-center justify-center shadow-lg border border-white/10">
      <ShoppingCart size={20} className="text-white relative z-10" />
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

  // Analytics 1: Revenue Timeline
  const revenueData = useMemo(() => {
    if (orders.length === 0) return [];
    const groups: any = {};
    [...orders].reverse().forEach(o => {
      const d = new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      groups[d] = (groups[d] || 0) + parseFloat(o.total_amount);
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Analytics 2: Ticket Value Ratios
  const ticketData = useMemo(() => [
    { name: 'Standard', value: orders.filter(o => parseFloat(o.total_amount) < 500).length, color: '#10b981' },
    { name: 'Enterprise', value: orders.filter(o => parseFloat(o.total_amount) >= 500).length, color: '#3b82f6' }
  ], [orders]);

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
      if (res.ok) { 
        setForm({ customer_id: '', product_id: '', quantity: '1' }); 
        load(); 
      }
      else { 
        const d = await res.json(); 
        setErrorMsg(d.error || 'Logistics hub rejected the protocol.'); 
      }
    } catch { setErrorMsg('Network collision during submission.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Roll back this transaction? Asset quantities will be restored.')) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) { setActiveOrder(null); load(); }
      else { const d = await res.json(); setErrorMsg(d.error || 'Failed to roll back.'); }
    } catch { setErrorMsg('Network error.'); }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
        <OrderLogo className="w-20 h-20 mb-8" />
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-black text-white tracking-widest uppercase">Parsing Transaction Ledger</h2>
          <div className="flex gap-2 mt-4">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">

      {/* Hero Header */}
      <div className="relative p-6 sm:p-10 rounded-[3rem] overflow-hidden bg-gray-900 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-full lg:w-1/3 h-full bg-gradient-to-l from-emerald-600/10 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-600/10 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <OrderLogo className="w-12 h-12" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Order Ledger</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Live Transaction Throughput Active</p>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-xs font-medium max-w-lg leading-relaxed hidden sm:block">
              Monitor transaction velocity, manage fulfillment protocols, and track enterprise-scale revenue signals across the global network.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center gap-6 shadow-xl">
               <div className="text-center">
                 <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Lifetime Vol</div>
                 <div className="text-xl font-black text-white">${(totalRevenue / 1000).toFixed(1)}k</div>
               </div>
               <div className="text-center pl-6 border-l border-white/10">
                 <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Protocols</div>
                 <div className="text-xl font-black text-emerald-400">{orders.length}</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-between items-center animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2"><AlertCircle size={16} /> {errorMsg}</div>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"><X size={16} /></button>
        </div>
      )}

      {/* Main Control Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Creation Panel - Left */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-900 border border-white/5 p-6 sm:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 transition-all group-hover:w-2"></div>
            <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3 tracking-tight uppercase">
              <Plus size={20} className="text-emerald-400" /> New Protocol
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Subject Vector</label>
                  <select required value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}
                    className="w-full bg-white/5 text-gray-100 border border-white/10 px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all hover:bg-white/[0.08] appearance-none">
                    <option value="" disabled className="bg-gray-950 text-gray-500">Choose Transactor…</option>
                    {customers.map((c: any) => <option key={c.id} value={c.id} className="bg-gray-950 text-gray-100">{c.full_name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Asset Allocation</label>
                  <select required value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })}
                    className="w-full bg-white/5 text-gray-100 border border-white/10 px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all hover:bg-white/[0.08] appearance-none">
                    <option value="" disabled className="bg-gray-950 text-gray-500">Select Target…</option>
                    {products.map((p: any) => (
                      <option key={p.id} value={p.id} disabled={p.quantity < 1} className="bg-gray-950 text-gray-100">
                        {p.name} — ${parseFloat(p.price).toFixed(2)} ({p.quantity} indexed)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Unit Count</label>
                    <input required type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
                      className={`w-full bg-white/5 text-gray-100 border ${isStockError ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-white/10'} px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all`} />
                  </div>
                  <div className="flex flex-col justify-end">
                    {selectedProduct && (
                      <div className={`px-4 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-center border ${isStockError ? 'bg-red-500/5 text-red-400 border-red-500/20' : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'}`}>
                        {isStockError ? 'OVER CAPACITY' : `${selectedProduct.quantity} IN RESERVE`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting || isStockError}
                className="w-full group relative flex items-center justify-center gap-3 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl shadow-emerald-600/20 active:scale-95 overflow-hidden mt-4">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                {isSubmitting ? <Activity className="animate-spin" size={18} /> : <Zap size={18} />}
                {isSubmitting ? 'PROCESSING' : 'EXECUTE TRANSACTION'}
              </button>
            </form>
          </div>

          <div className="bg-gray-900 border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 transition-transform group-hover:rotate-0">
               <ShieldCheck size={80} className="text-emerald-500" />
             </div>
             <div className="relative z-10">
               <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Protocol Health</h4>
               <p className="text-white text-lg font-black italic tracking-tighter">ALL SYSTEMS OPERATIONAL</p>
               <div className="mt-4 flex gap-1">
                 {[1,2,3,4,5,6].map(i => <div key={i} className="h-1 w-4 bg-emerald-500/40 rounded-full animate-pulse" style={{animationDelay: `${i*0.2}s`}}></div>)}
               </div>
             </div>
          </div>
        </div>

        {/* Analytics Hub - Right */}
        <div className="lg:col-span-7 space-y-8">
           {/* Chart 1: Revenue Velocity */}
           <div className="bg-gray-900 border border-white/5 p-8 rounded-[3rem] shadow-2xl flex flex-col h-[320px]">
              <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-widest mb-8">
                <TrendingUp size={16} className="text-emerald-400" /> Revenue Velocity
              </h3>
              <div className="flex-1 w-full text-[9px] font-black">
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="revVel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="6 6" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} fill="url(#revVel)" animationDuration={2000} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                   <div className="h-full flex items-center justify-center text-gray-700 uppercase tracking-widest">No Signals</div>
                )}
              </div>
           </div>

           {/* Chart 2: Protocol Breakdown */}
           <div className="bg-gray-900 border border-white/5 p-8 rounded-[3rem] shadow-2xl flex flex-col h-[320px]">
              <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-widest mb-4">
                <PieIcon size={16} className="text-emerald-400" /> Protocol Breakdown
              </h3>
              <div className="flex-1 flex flex-col sm:flex-row items-center gap-8">
                 <div className="flex-1 w-full h-full min-h-[160px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={ticketData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={10} dataKey="value">
                          {ticketData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
                      </PieChart>
                   </ResponsiveContainer>
                 </div>
                 <div className="grid grid-cols-1 gap-3 w-full sm:w-auto">
                    {ticketData.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{item.name} Ticket</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Global Search */}
      <div className="relative group">
        <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
        <input placeholder="Global Transaction Lookup: Transactor, Protocol ID, or Date..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-white/5 text-gray-100 pl-16 pr-6 py-6 rounded-[2rem] text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all hover:bg-white/[0.02] shadow-xl" />
      </div>

      {/* Main Ledger Table */}
      <div className="bg-gray-900 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Protocol ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Transactor Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Financial Load</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-32 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-gray-800 rounded-[2rem] flex items-center justify-center border border-white/5 animate-pulse">
                      <Search size={32} className="text-gray-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-black text-white uppercase italic tracking-tighter">No Protocols Identified</p>
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Adjust search vector or initiate new transaction protocol</p>
                    </div>
                  </div>
                </td></tr>
              ) : filtered.map((o: any) => {
                const cust = o.customers || customers.find((c: any) => c.id === o.customer_id);
                return (
                  <tr key={o.id} className="group hover:bg-white/[0.02] transition-all">
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                           <Hash size={16} />
                         </div>
                         <span className="font-black text-white tracking-[0.3em] font-mono text-[10px]">#0{o.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center text-[10px] font-black text-white uppercase group-hover:rotate-6 transition-transform">
                          {cust?.full_name?.split(' ').map((n:any)=>n[0]).join('') || '??'}
                        </div>
                        <div>
                          <div className="font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors uppercase italic">{cust?.full_name || 'Anonymous Subject'}</div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{cust?.email || 'unlinked_endpoint'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="font-black text-white tracking-tighter text-xl">${parseFloat(o.total_amount).toLocaleString()}</div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-3 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                        <Clock size={14} className="text-gray-700" /> {new Date(o.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => setActiveOrder(o)} className="p-3.5 bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white rounded-2xl transition-all"><Eye size={18} /></button>
                        <button onClick={() => handleDelete(o.id)} className="p-3.5 bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white rounded-2xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Analysis Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-3xl bg-gray-900 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-emerald-600/20">
                  <ShoppingCart size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">PROTOCOL ANALYSIS</h3>
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mt-2">Validated Ledger Entry #0{activeOrder.id}</p>
                </div>
              </div>
              <button onClick={() => setActiveOrder(null)} className="p-4 rounded-[1.5rem] bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                <X size={28} />
              </button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <User size={14} className="text-blue-500" /> Origin Transactor
                  </div>
                  <div>
                    <p className="text-xl font-black text-white tracking-tight uppercase italic">{activeOrder.customers?.full_name || 'Unknown'}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{activeOrder.customers?.email}</p>
                  </div>
                </div>
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <Clock size={14} className="text-emerald-500" /> Signal Timestamp
                  </div>
                  <div>
                    <p className="text-xl font-black text-white tracking-tight uppercase italic">{new Date(activeOrder.created_at).toLocaleDateString()}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{new Date(activeOrder.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Asset Manifest Breakdown</p>
                   <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                      <Box size={10} className="text-indigo-400" />
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Verified Assets</span>
                   </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Target Asset</th>
                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Unit Val</th>
                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Signal Qty</th>
                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Financial Sum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {activeOrder.order_items?.map((item: any) => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-6">
                            <p className="font-black text-white tracking-tight uppercase italic text-sm">{item.products?.name || 'Protocol Redacted'}</p>
                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">{item.products?.sku}</p>
                          </td>
                          <td className="px-8 py-6 text-right font-black text-gray-400 font-mono">${parseFloat(item.price_at_time).toFixed(2)}</td>
                          <td className="px-8 py-6 text-right"><span className="px-4 py-1.5 bg-white/10 rounded-xl text-[10px] font-black text-white font-mono">{item.quantity}</span></td>
                          <td className="px-8 py-6 text-right font-black text-emerald-400 text-lg tracking-tighter">${(item.price_at_time * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
               <button onClick={() => handleDelete(activeOrder.id)}
                className="w-full sm:w-auto px-8 py-4 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-red-600/20 group">
                <Trash2 size={16} /> TERMINATE PROTOCOL
              </button>
              <div className="text-right w-full sm:w-auto">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Settlement Valuation</p>
                <p className="text-5xl font-black text-white tracking-tighter shadow-emerald-500/20 shadow-2xl italic leading-none">${parseFloat(activeOrder.total_amount).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
