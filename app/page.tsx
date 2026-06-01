"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  Package, Users, ShoppingCart, AlertTriangle, TrendingUp, 
  ArrowUpRight, DollarSign, Calendar, Clock, Activity, 
  Layers, Zap, Sparkles, BarChart3, PieChart as PieIcon,
  ShieldCheck, Globe, Server, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Cell, PieChart, Pie
} from 'recharts';

// Professional Dashboard Logo
const DashLogo = ({ className = "w-10 h-10" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-indigo-500 rounded-xl rotate-6 animate-pulse opacity-20"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl -rotate-3 transition-transform hover:rotate-0 flex items-center justify-center shadow-lg border border-white/10">
      <TrendingUp size={20} className="text-white relative z-10" />
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState<{
    products: any[],
    customers: any[],
    orders: any[]
  }>({ products: [], customers: [], orders: [] });
  
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      setLoading(true);
      try {
        const [pRes, cRes, oRes] = await Promise.all([
          fetch('/api/products').then(r => r.ok ? r.json() : []),
          fetch('/api/customers').then(r => r.ok ? r.json() : []),
          fetch('/api/orders').then(r => r.ok ? r.json() : [])
        ]);
        setData({ products: pRes, customers: cRes, orders: oRes });
      } catch (e) {
        console.error("Dashboard Data Sync Failed:", e);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    }
    fetchData();
  }, []);

  // Compute stats with robust fallbacks
  const stats = useMemo(() => {
    const products = data.products || [];
    const orders = data.orders || [];
    
    const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
    const inventoryVal = products.reduce((s, p) => s + (parseFloat(p.price || 0) * (p.quantity || 0)), 0);
    const lowStockCount = products.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) < 10).length;
    const outOfStockCount = products.filter(p => (p.quantity || 0) === 0).length;

    return {
      revenue: totalRevenue,
      inventoryValue: inventoryVal,
      orderCount: orders.length,
      customerCount: (data.customers || []).length,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      productCount: products.length
    };
  }, [data]);

  const salesTrend = useMemo(() => {
    if (!data.orders.length) return [];
    const groups: any = {};
    [...data.orders].reverse().forEach(o => {
      const d = new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      groups[d] = (groups[d] || 0) + parseFloat(o.total_amount);
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value })).slice(-7);
  }, [data.orders]);

  const stockHealth = useMemo(() => {
    return [
      { name: 'Stable', value: stats.productCount - stats.lowStock - stats.outOfStock, color: '#10b981' },
      { name: 'Critical', value: stats.lowStock, color: '#f59e0b' },
      { name: 'Depleted', value: stats.outOfStock, color: '#ef4444' }
    ].filter(i => i.value > 0);
  }, [stats]);

  if (!mounted) return null; // Prevent hydration mismatch

  if (loading) {
    return (
      <div className="h-[85vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
        <DashLogo className="w-20 h-20 mb-8" />
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-black text-white tracking-widest uppercase">Initializing Core Dashboard</h2>
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Dynamic Command Header */}
      <div className="relative p-10 rounded-[3rem] overflow-hidden bg-gray-900 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/10 to-transparent"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <DashLogo className="w-12 h-12" />
              <div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Business Overview</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Real-time Enterprise Intelligence</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] flex items-center gap-4 shadow-xl">
               <div className="text-center px-4 border-r border-white/10">
                 <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Operational</div>
                 <div className="text-lg font-black text-white flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-500" /> ACTIVE</div>
               </div>
               <div className="text-center px-4">
                 <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Region</div>
                 <div className="text-lg font-black text-white flex items-center gap-1.5"><Globe size={16} className="text-blue-500" /> GLOBAL</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* High-Impact Stat Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', val: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, col: 'text-emerald-400', bg: 'bg-emerald-500/10', desc: 'Total realized sales' },
          { label: 'Inventory Val', val: `$${stats.inventoryValue.toLocaleString()}`, icon: Layers, col: 'text-indigo-400', bg: 'bg-indigo-500/10', desc: 'Active asset valuation' },
          { label: 'Total Bookings', val: stats.orderCount, icon: ShoppingCart, col: 'text-blue-400', bg: 'bg-blue-500/10', desc: 'Successful transactions' },
          { label: 'System Health', val: stats.lowStock > 0 ? 'CRITICAL' : 'OPTIMAL', icon: Zap, col: stats.lowStock > 0 ? 'text-amber-400' : 'text-sky-400', bg: stats.lowStock > 0 ? 'bg-amber-500/10' : 'bg-sky-500/10', desc: `${stats.lowStock} items need attention` }
        ].map((s, i) => (
          <div key={i} className="group bg-gray-900 border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.02] transition-all relative overflow-hidden shadow-xl">
            <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity`}>
               <s.icon size={64} />
            </div>
            <div className={`w-12 h-12 ${s.bg} ${s.col} rounded-2xl flex items-center justify-center mb-6 border border-white/5 shadow-inner`}>
              <s.icon size={20} />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{s.label}</p>
            <h3 className="text-3xl font-black text-white tracking-tighter mb-2">{s.val}</h3>
            <p className="text-xs text-gray-500 font-medium">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Analytics Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sales Velocity Chart */}
        <div className="lg:col-span-8 bg-gray-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl flex flex-col h-[450px] relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-5">
              <TrendingUp size={120} />
           </div>
           <div className="flex justify-between items-center mb-10 relative z-10">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                  <Activity size={20} className="text-indigo-500" /> Sales Velocity
                </h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Daily revenue signal throughput</p>
              </div>
              <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
                 <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-white/10 rounded-xl shadow-lg">Realtime</button>
                 <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors">Historical</button>
              </div>
           </div>

           <div className="flex-1 w-full relative z-10">
             {salesTrend.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={salesTrend}>
                    <defs>
                      <linearGradient id="salesVel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="6 6" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '20px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#6366f1' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={5} fill="url(#salesVel)" animationDuration={2000} />
                 </AreaChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem]">
                  <p className="text-xs font-black text-gray-600 uppercase tracking-[0.3em]">Awaiting Sales Signal...</p>
               </div>
             )}
           </div>
        </div>

        {/* Stock Allocation Pie */}
        <div className="lg:col-span-4 bg-gray-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl flex flex-col h-[450px]">
           <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight mb-2">
              <PieIcon size={20} className="text-blue-500" /> Stock Ratios
           </h3>
           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-8">Catalog health distribution</p>

           <div className="flex-1 relative flex items-center justify-center">
             {stockHealth.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stockHealth} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                        {stockHealth.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    <p className="text-3xl font-black text-white tracking-tighter">{stats.productCount}</p>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total SKUs</p>
                  </div>
                </>
             ) : (
                <p className="text-xs font-black text-gray-600 uppercase tracking-[0.2em]">Zero Records</p>
             )}
           </div>

           <div className="grid grid-cols-3 gap-2 mt-8 pt-8 border-t border-white/5">
             {stockHealth.map((h, i) => (
               <div key={i} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }}></div>
                    <span className="text-sm font-black text-white">{h.value}</span>
                  </div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{h.name}</p>
               </div>
             ))}
           </div>
        </div>

      </div>

      {/* Direct Action Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Rapid Actions */}
        <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 transition-transform group-hover:rotate-0">
             <Zap size={100} className="text-white" />
          </div>
          <div className="relative z-10 space-y-6">
            <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">Control Center</h3>
            <p className="text-indigo-100 text-sm font-medium leading-relaxed">Rapidly deploy inventory updates, process client bookings, or enroll new subjects.</p>
            
            <div className="space-y-3 pt-4">
              {[
                { label: 'Asset Management', link: '/products', icon: Package },
                { label: 'Booking Protocol', link: '/orders', icon: ShoppingCart },
                { label: 'CRM Enrollment', link: '/customers', icon: Users }
              ].map((act, i) => (
                <Link key={i} href={act.link} className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group/btn">
                  <div className="flex items-center gap-3">
                    <act.icon size={18} className="text-white" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">{act.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-white/40 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Data Stream (Recent Orders) */}
        <div className="lg:col-span-2 bg-gray-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <div>
               <h3 className="text-xl font-black text-white uppercase tracking-tight">Recent Signals</h3>
               <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Live transaction throughput</p>
            </div>
            <Link href="/orders" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
               <ArrowUpRight size={20} className="text-indigo-400" />
            </Link>
          </div>

          <div className="space-y-4">
             {data.orders.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                   <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No Active Signals</p>
                </div>
             ) : (
               data.orders.slice(0, 4).map((o: any) => (
                 <div key={o.id} className="group flex items-center justify-between p-5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 font-black text-xs border border-indigo-500/20">
                          #{o.id}
                       </div>
                       <div>
                          <p className="text-sm font-black text-white tracking-tight">{o.customers?.full_name || 'Anonymous'}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(o.created_at).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black text-emerald-400 tracking-tighter">${parseFloat(o.total_amount).toFixed(2)}</p>
                       <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Verified</p>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>

      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
