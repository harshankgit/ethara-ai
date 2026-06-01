"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  Package, Users, ShoppingCart, AlertTriangle, TrendingUp, 
  ArrowUpRight, DollarSign, Calendar, Clock, Activity, 
  Layers, Zap, Sparkles, BarChart3, PieChart as PieIcon,
  ShieldCheck, Globe, Server, ChevronRight, LayoutDashboard,
  Box, Target, ArrowDownRight, MousePointer2
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Cell, PieChart, Pie, LineChart, Line
} from 'recharts';

// Professional Dashboard Logo
const DashLogo = ({ className = "w-10 h-10" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-indigo-500 rounded-xl rotate-6 animate-pulse opacity-20"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl -rotate-3 transition-transform hover:rotate-0 flex items-center justify-center shadow-lg border border-white/10">
      <LayoutDashboard size={20} className="text-white relative z-10" />
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

  const salesVelocity = useMemo(() => {
    if (!data.orders.length) return [];
    const groups: any = {};
    [...data.orders].reverse().forEach(o => {
      const d = new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      groups[d] = (groups[d] || 0) + parseFloat(o.total_amount);
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value })).slice(-8);
  }, [data.orders]);

  const stockAllocation = useMemo(() => {
    return [
      { name: 'Stable Assets', value: stats.productCount - stats.lowStock - stats.outOfStock, color: '#10b981' },
      { name: 'Critical Status', value: stats.lowStock, color: '#f59e0b' },
      { name: 'Depleted Stock', value: stats.outOfStock, color: '#ef4444' }
    ].filter(i => i.value > 0);
  }, [stats]);

  const topProducts = useMemo(() => {
    return [...data.products]
      .sort((a, b) => (b.quantity * b.price) - (a.quantity * a.price))
      .slice(0, 5)
      .map(p => ({
        name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
        Value: parseFloat(p.price) * p.quantity
      }));
  }, [data.products]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
        <DashLogo className="w-20 h-20 mb-8" />
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-black text-white tracking-widest uppercase">Syncing Enterprise Signals</h2>
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Unified Hero Section */}
      <div className="relative p-6 sm:p-10 rounded-[2.5rem] overflow-hidden bg-gray-900 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-gradient-to-l from-indigo-600/10 to-transparent"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <DashLogo className="w-12 h-12" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Command Center</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Live Intelligence Protocol Active</p>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-xs font-medium max-w-lg leading-relaxed hidden sm:block">
              Welcome to your enterprise core. Monitor real-time sales velocity, asset distribution, and global inventory status from a single unified interface.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center gap-4 shadow-xl">
               <div className="text-center px-4 border-r border-white/10">
                 <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</div>
                 <div className="text-sm font-black text-white flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> SECURE</div>
               </div>
               <div className="text-center px-4">
                 <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Node</div>
                 <div className="text-sm font-black text-white flex items-center gap-2"><Server size={14} className="text-blue-500" /> GLOBAL</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Matrix - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Network Revenue', val: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, col: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+12.4%', up: true },
          { label: 'Asset Valuation', val: `$${stats.inventoryValue.toLocaleString()}`, icon: Layers, col: 'text-indigo-400', bg: 'bg-indigo-500/10', trend: '+5.2%', up: true },
          { label: 'Total Bookings', val: stats.orderCount, icon: ShoppingCart, col: 'text-blue-400', bg: 'bg-blue-500/10', trend: '-2.1%', up: false },
          { label: 'Health Index', val: stats.lowStock > 0 ? 'CRITICAL' : 'OPTIMAL', icon: Zap, col: stats.lowStock > 0 ? 'text-amber-400' : 'text-sky-400', bg: stats.lowStock > 0 ? 'bg-amber-500/10' : 'bg-sky-500/10', trend: 'STABLE', up: true }
        ].map((s, i) => (
          <div key={i} className="group bg-gray-900 border border-white/5 p-8 rounded-[2rem] hover:bg-white/[0.02] transition-all relative overflow-hidden shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 ${s.bg} ${s.col} rounded-2xl flex items-center justify-center border border-white/5 shadow-inner`}>
                <s.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black ${s.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {s.trend}
              </div>
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{s.label}</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">{s.val}</h3>
            <div className="mt-4 flex items-center gap-2">
               <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${s.col.replace('text', 'bg')} w-[70%] opacity-50`}></div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Command Center - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Sales Velocity Chart */}
        <div className="lg:col-span-8 bg-gray-900 border border-white/5 p-6 sm:p-10 rounded-[3rem] shadow-2xl flex flex-col min-h-[480px]">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                  <Activity size={20} className="text-indigo-500" /> Revenue Flow
                </h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-2">Real-time transaction signal velocity</p>
              </div>
              <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-full sm:w-auto">
                 <button className="flex-1 sm:flex-none px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-white/10 rounded-xl shadow-lg">Signal</button>
                 <button className="flex-1 sm:flex-none px-6 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors">Historical</button>
              </div>
           </div>

           <div className="flex-1 w-full text-xs font-bold">
             {salesVelocity.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={salesVelocity}>
                    <defs>
                      <linearGradient id="salesVel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="6 6" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '24px', fontWeight: '900' }}
                      itemStyle={{ color: '#6366f1' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={5} fill="url(#salesVel)" animationDuration={2000} />
                 </AreaChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] text-gray-700">
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Sales Data</p>
               </div>
             )}
           </div>
        </div>

        {/* Multi-Insight Panel - Right */}
        <div className="lg:col-span-4 space-y-8">
          {/* Pie Chart: Stock Health */}
          <div className="bg-gray-900 border border-white/5 p-8 rounded-[3rem] shadow-2xl flex flex-col h-[300px]">
             <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest mb-6">
                <PieIcon size={16} className="text-blue-500" /> Stock Ratios
             </h3>
             <div className="flex-1 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stockAllocation} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={8} dataKey="value">
                      {stockAllocation.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <p className="text-2xl font-black text-white">{stats.productCount}</p>
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">SKUs</p>
                </div>
             </div>
          </div>

          {/* Bar Chart: Top Assets */}
          <div className="bg-gray-900 border border-white/5 p-8 rounded-[3rem] shadow-2xl flex flex-col h-[300px]">
             <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest mb-6">
                <BarChart3 size={16} className="text-emerald-500" /> High Value Assets
             </h3>
             <div className="flex-1 w-full text-[9px] font-black">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ left: -20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                    <Bar dataKey="Value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Layout - Table + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        
        {/* Rapid Deployment Control */}
        <div className="bg-indigo-600 p-8 sm:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 transition-transform group-hover:rotate-0">
             <Zap size={120} className="text-white" />
          </div>
          <div className="relative z-10 space-y-8">
            <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">Global Control</h3>
            <p className="text-indigo-100 text-xs font-medium leading-relaxed">Instantly manage inventory flows, process client bookings, or enroll new subjects into the network.</p>
            
            <div className="space-y-3">
              {[
                { label: 'Catalog Control', link: '/products', icon: Package, col: 'bg-white/10' },
                { label: 'Transaction Hub', link: '/orders', icon: ShoppingCart, col: 'bg-white/10' },
                { label: 'CRM Identity', link: '/customers', icon: Users, col: 'bg-white/10' }
              ].map((act, i) => (
                <Link key={i} href={act.link} className={`flex items-center justify-between p-4 ${act.col} hover:bg-white/20 rounded-2xl border border-white/10 transition-all group/btn`}>
                  <div className="flex items-center gap-4">
                    <act.icon size={20} className="text-white" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{act.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-white/40 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Live Signal Stream */}
        <div className="lg:col-span-2 bg-gray-900 border border-white/5 p-6 sm:p-10 rounded-[3rem] shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <div>
               <h3 className="text-xl font-black text-white uppercase tracking-tight">Recent Signals</h3>
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-2">Active transaction stream throughput</p>
            </div>
            <Link href="/orders" className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
               <ArrowUpRight size={20} className="text-indigo-400" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">Protocol</th>
                  <th className="px-4 py-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">Transactor</th>
                  <th className="px-4 py-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">Valuation</th>
                  <th className="px-4 py-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.orders.slice(0, 5).map((o: any) => (
                  <tr key={o.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-5 font-black text-white text-xs tracking-widest">#{o.id}</td>
                    <td className="px-4 py-5">
                       <div className="text-xs font-black text-gray-200 tracking-tight">{o.customers?.full_name || 'Anonymous'}</div>
                    </td>
                    <td className="px-4 py-5 font-black text-emerald-400 text-sm tracking-tighter">${parseFloat(o.total_amount).toFixed(2)}</td>
                    <td className="px-4 py-5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {data.orders.length === 0 && (
                   <tr>
                     <td colSpan={4} className="py-20 text-center text-gray-700 text-[10px] font-black uppercase tracking-[0.3em]">No Active Signals Found</td>
                   </tr>
                )}
              </tbody>
            </table>
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
