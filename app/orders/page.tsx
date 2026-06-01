"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  ShoppingCart, Plus, Trash2, Eye, X, Search, Tag, TrendingUp, 
  AlertCircle, DollarSign, Package, User, Hash, Clock, ArrowRight,
  ChevronRight, Activity, Zap, PieChart as PieChartIcon, BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Cell, AreaChart, Area, LineChart, Line
} from 'recharts';

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
    } catch { setErrorMsg('Critical: Connection to central database failed.'); }
    finally { setTimeout(() => setLoading(false), 600); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() =>
    orders.filter(o => {
      const q = search.toLowerCase().trim();
      const name = (o.customers?.full_name || '').toLowerCase();
      return name.includes(q) || String(o.id).includes(q);
    }), [orders, search]);

  // Selected product stock info
  const selectedProduct = useMemo(() => 
    products.find(p => p.id === parseInt(form.product_id)), 
  [products, form.product_id]);

  const isStockError = selectedProduct && parseInt(form.quantity) > selectedProduct.quantity;

  // Analytics
  const revenueData = useMemo(() => {
    if (orders.length === 0) return [];
    const groups: any = {};
    [...orders].reverse().forEach(o => {
      const d = new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      groups[d] = (groups[d] || 0) + parseFloat(o.total_amount);
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStockError) {
      setErrorMsg(`Cannot place order: Requested ${form.quantity} but only ${selectedProduct.quantity} available.`);
      return;
    }
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
        setErrorMsg(d.error || 'The logistics system rejected the order.'); 
      }
    } catch { setErrorMsg('Network failure during order submission.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Cancel this transaction? Product inventory will be automatically replenished.')) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) { setActiveOrder(null); load(); }
      else { const d = await res.json(); setErrorMsg(d.error || 'Failed to roll back order.'); }
    } catch { setErrorMsg('Network error.'); }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse"></div>
          <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl relative z-10 border border-white/10">
            <ShoppingCart size={32} className="text-white" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-xl font-black text-white tracking-widest uppercase">Processing Logistics</h2>
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative p-8 rounded-3xl overflow-hidden bg-gray-900 border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-600/10 to-transparent"></div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <ShoppingCart className="text-emerald-400" size={24} />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Order Desk</h1>
            </div>
            <p className="text-gray-400 font-medium">Process transactions and monitor real-time revenue streams.</p>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-white/5 p-6 rounded-3xl flex flex-col justify-center">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Lifetime Revenue</div>
          <div className="text-2xl font-black text-white flex items-center gap-2">
            <DollarSign className="text-emerald-500" size={20} />
            {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-gray-900 border border-white/5 p-6 rounded-3xl flex flex-col justify-center">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Avg. Order Value</div>
          <div className="text-2xl font-black text-white flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={20} />
            ${avgOrderValue.toFixed(2)}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm flex gap-2 justify-between items-center animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-black uppercase tracking-wider text-[11px]"><AlertCircle size={16} />{errorMsg}</div>
          <button onClick={() => setErrorMsg('')} className="hover:bg-red-500/20 p-1 rounded-lg transition-all"><X size={15} /></button>
        </div>
      )}

      {/* Main Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Creation Panel */}
        <div className="lg:col-span-5 bg-gray-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 transition-all group-hover:w-2"></div>
          <h3 className="text-lg font-black text-white mb-8 flex items-center gap-2 tracking-tight">
            <Plus size={20} className="text-emerald-400" /> New Transaction
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Customer Selection</label>
                <select required value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}
                  className="w-full bg-white/5 text-gray-100 border border-white/10 px-4 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all hover:bg-white/[0.08] appearance-none">
                  <option value="" disabled className="bg-gray-900">Choose Subject…</option>
                  {customers.map((c: any) => <option key={c.id} value={c.id} className="bg-gray-900">{c.full_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Product Catalog</label>
                <select required value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })}
                  className="w-full bg-white/5 text-gray-100 border border-white/10 px-4 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all hover:bg-white/[0.08] appearance-none">
                  <option value="" disabled className="bg-gray-900">Select Asset…</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id} disabled={p.quantity < 1} className="bg-gray-900">
                      {p.name} — ${parseFloat(p.price).toFixed(2)} ({p.quantity} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Unit Quantity</label>
                  <input required type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
                    className={`w-full bg-white/5 text-gray-100 border ${isStockError ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-white/10'} px-4 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all`} />
                </div>
                <div className="flex flex-col justify-end pb-1">
                  {selectedProduct && (
                    <div className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center ${isStockError ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {isStockError ? 'Over Limit' : `${selectedProduct.quantity} Available`}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting || isStockError}
              className="w-full group relative flex items-center justify-center gap-3 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-black transition-all disabled:opacity-50 shadow-xl shadow-emerald-600/20 active:scale-95 overflow-hidden mt-4">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
              {isSubmitting ? <Activity className="animate-spin" size={18} /> : <Zap size={18} />}
              {isSubmitting ? 'SECURE PROCESSING...' : 'EXECUTE TRANSACTION'}
            </button>
          </form>
        </div>

        {/* Dynamic Analytics */}
        <div className="lg:col-span-7 bg-gray-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
              <BarChart3 size={20} className="text-blue-400" /> Revenue Flow
            </h3>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-white/10 rounded-lg">Growth</button>
              <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors">Volume</button>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="5 5" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }} 
                    itemStyle={{ color: '#10b981' }}
                    formatter={(v: any) => [`$${parseFloat(v).toFixed(2)}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} fill="url(#revGrad)" animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-4">
                <Activity size={48} className="opacity-10" />
                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-30">Waiting for Transaction Signal</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Search */}
      <div className="relative group">
        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-emerald-500" />
        <input placeholder="Global Lookup: Customer, Transaction ID, or Date Vector..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-white/5 text-gray-100 pl-14 pr-6 py-5 rounded-3xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none placeholder-gray-600 transition-all hover:bg-white/[0.02] shadow-xl" />
      </div>

      {/* Ledger Table */}
      <div className="bg-gray-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Transactor</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Financial Load</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center border border-white/5">
                      <Search size={24} className="text-gray-600" />
                    </div>
                    <p className="text-lg font-black text-white">No Matching Signals</p>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Refine search vector or initiate new transaction</p>
                  </div>
                </td></tr>
              ) : filtered.map((o: any) => {
                const cust = o.customers || customers.find((c: any) => c.id === o.customer_id);
                return (
                  <tr key={o.id} className="group hover:bg-white/[0.02] transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                           <Hash size={16} />
                         </div>
                         <span className="font-black text-white tracking-widest">#{o.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center text-[10px] font-black text-white uppercase">
                          {cust?.full_name?.split(' ').map((n:any)=>n[0]).join('') || '??'}
                        </div>
                        <div>
                          <div className="font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">{cust?.full_name || 'Anonymous Subject'}</div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{cust?.email || 'unlinked_endpoint'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                        <Tag size={12} /> ${parseFloat(o.total_amount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-500 text-[11px] font-bold uppercase tracking-widest">
                        <Clock size={12} className="text-gray-700" /> {new Date(o.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => setActiveOrder(o)} className="p-3 bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white rounded-xl transition-all"><Eye size={18} /></button>
                        <button onClick={() => handleDelete(o.id)} className="p-3 bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white rounded-xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Analysis Modal (Order Details) */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-gray-900 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-600/20">
                  <ShoppingCart size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">TRANSACTION #{activeOrder.id}</h3>
                  <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest mt-1">Confirmed & Validated</p>
                </div>
              </div>
              <button onClick={() => setActiveOrder(null)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto flex-1">
              {/* Subject Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <User size={12} className="text-blue-500" /> Origin Subject
                  </div>
                  <div>
                    <p className="text-lg font-black text-white tracking-tight">{activeOrder.customers?.full_name || 'Unknown'}</p>
                    <p className="text-xs font-bold text-gray-400">{activeOrder.customers?.email}</p>
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <Clock size={12} className="text-emerald-500" /> Timestamp Vector
                  </div>
                  <div>
                    <p className="text-lg font-black text-white tracking-tight">{new Date(activeOrder.created_at).toLocaleDateString()}</p>
                    <p className="text-xs font-bold text-gray-400">{new Date(activeOrder.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>

              {/* Asset Breakdown */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Manifest Breakdown</p>
                <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Unit Val</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Qty</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Sum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {activeOrder.order_items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="px-6 py-5">
                            <p className="font-black text-white tracking-tight">{item.products?.name || 'Asset Redacted'}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.products?.sku}</p>
                          </td>
                          <td className="px-6 py-5 text-right font-bold text-gray-400">${parseFloat(item.price_at_time).toFixed(2)}</td>
                          <td className="px-6 py-5 text-right"><span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-black text-white">{item.quantity}</span></td>
                          <td className="px-6 py-5 text-right font-black text-emerald-400">${(item.price_at_time * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
               <button onClick={() => handleDelete(activeOrder.id)}
                className="px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg hover:shadow-red-600/20 group">
                <Trash2 size={14} /> TERMINATE TRANSACTION
              </button>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Settlement Amount</p>
                <p className="text-4xl font-black text-white tracking-tighter shadow-emerald-500/20 shadow-2xl">${parseFloat(activeOrder.total_amount).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
