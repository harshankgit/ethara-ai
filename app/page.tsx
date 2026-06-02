"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  Package, Users, ShoppingCart, AlertTriangle, TrendingUp, 
  ArrowUpRight, DollarSign, Calendar, Clock, Activity, 
  Layers, Zap, Sparkles, BarChart3, 
  ShieldCheck, Globe, Server, ChevronRight, LayoutDashboard,
  Target, Rocket, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Cell, PieChart, Pie, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

// Premium Brand Animation Component
const EtharaAnimation = () => (
  <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-1000 slide-in-from-left-4">
    <div className="relative group">
      <div className="absolute inset-0 bg-indigo-500 rounded-2xl rotate-6 animate-pulse opacity-20 group-hover:rotate-12 transition-transform"></div>
      <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 group-hover:scale-105 transition-all">
        <Rocket size={28} className="text-white" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#020617] animate-ping"></div>
      </div>
    </div>
    <div className="flex flex-col">
      <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none italic">
        ETHARA <span className="text-indigo-500">AI</span>
      </h1>
      <div className="flex items-center gap-2 mt-1.5">
        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-500/20">
          Neural Core Active
        </span>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [hasMounted, setHasMounted] = useState(false);
  const [data, setData] = useState<{
    products: any[],
    customers: any[],
    orders: any[]
  }>({ products: [], customers: [], orders: [] });
  
  const [loading, setLoading] = useState(true);

  const load = async () => {
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
      setLoading(false);
    }
  };

  useEffect(() => {
    setHasMounted(true);
    load();
  }, []);

  const salesVelocity = useMemo(() => {
    if (!data.orders.length) return [];
    const groups: any = {};
    [...data.orders].reverse().forEach(o => {
      const d = new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      groups[d] = (groups[d] || 0) + parseFloat(o.total_amount || 0);
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value })).slice(-7);
  }, [data.orders]);

  const stats = useMemo(() => {
    const p = data.products || [];
    const low = p.filter(i => (i.quantity || 0) > 0 && (i.quantity || 0) < 10).length;
    const out = p.filter(i => (i.quantity || 0) === 0).length;
    const stable = p.length - low - out;
    return { stable, low, out, total: p.length };
  }, [data.products]);

  const stockDistribution = [
    { name: 'Stable Assets', value: stats.stable, color: '#10b981' },
    { name: 'Critical Status', value: stats.low, color: '#f59e0b' },
    { name: 'Depleted Stock', value: stats.out, color: '#ef4444' }
  ].filter(i => i.value > 0);

  const radarData = useMemo(() => [
    { subject: 'Electronics', A: 120, B: 110, fullMark: 150 },
    { subject: 'Hardware', A: 98, B: 130, fullMark: 150 },
    { subject: 'Logistics', A: 86, B: 130, fullMark: 150 },
    { subject: 'Compute', A: 99, B: 100, fullMark: 150 },
    { subject: 'Cloud', A: 85, B: 90, fullMark: 150 },
    { subject: 'Neural', A: 65, B: 85, fullMark: 150 },
  ], []);

  const topAssets = useMemo(() => {
    return [...data.products]
      .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
      .slice(0, 6)
      .map(p => ({
        name: p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name,
        value: p.price * p.quantity
      }));
  }, [data.products]);

  const forecastData = useMemo(() => [
    { name: 'Jan', revenue: 4000, target: 4500 },
    { name: 'Feb', revenue: 3000, target: 4200 },
    { name: 'Mar', revenue: 2000, target: 4800 },
    { name: 'Apr', revenue: 2780, target: 5000 },
    { name: 'May', revenue: 1890, target: 5100 },
    { name: 'Jun', revenue: 2390, target: 5500 },
  ], []);

  if (!hasMounted || loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse"></div>
          <EtharaAnimation />
        </div>
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-xl font-black text-white tracking-[0.4em] uppercase opacity-80 italic">Establishing Neural Link</h2>
          <div className="flex gap-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Dynamic Command Header */}
      <div className="relative p-8 sm:p-12 rounded-[4rem] overflow-hidden bg-gray-900 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-full lg:w-2/3 h-full bg-gradient-to-l from-indigo-600/10 to-transparent"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="space-y-6">
            <EtharaAnimation />
            <p className="text-gray-500 text-sm font-medium max-w-2xl leading-relaxed hidden sm:block">
              Welcome to the Ethara AI intelligence core. Monitoring <span className="text-indigo-400 font-black">{data.products.length} active assets</span> and global transaction streams.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none px-8 py-5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex items-center gap-8 shadow-2xl">
               <div className="text-center px-4 border-r border-white/10">
                 <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Protocol</div>
                 <div className="text-lg font-black text-white flex items-center gap-2 italic"><ShieldCheck size={18} className="text-emerald-500" /> SECURE</div>
               </div>
               <div className="text-center px-4">
                 <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Throughput</div>
                 <div className="text-lg font-black text-white flex items-center gap-2 italic"><RefreshCw size={18} className="text-blue-500 animate-spin-slow" /> SYNCED</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 GRAPH INTELLIGENCE MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-gray-900/50 border border-white/5 p-8 rounded-[3.5rem] shadow-2xl min-h-[450px] flex flex-col relative group overflow-hidden">
           <div className="flex justify-between items-center mb-10 relative z-10">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase italic tracking-tighter">
                  <Activity size={20} className="text-indigo-500" /> Revenue Velocity
                </h3>
              </div>
           </div>
           <div className="flex-1 w-full text-[10px] font-black">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesVelocity}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" stroke="#ffffff05" vertical={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '24px' }} />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={6} fill="url(#salesGrad)" animationDuration={2500} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-4 bg-gray-900/50 border border-white/5 p-8 rounded-[3.5rem] shadow-2xl min-h-[450px] flex flex-col items-center">
           <div className="flex-1 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stockDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                    {stockDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-4xl font-black text-white tracking-tighter italic">{stats.total}</p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global SKUs</p>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 bg-gray-900/50 border border-white/5 p-8 rounded-[3.5rem] shadow-2xl h-[400px] flex flex-col relative overflow-hidden">
           <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest mb-6"><Target size={16} className="text-amber-500" /> System Allocation</h3>
           <div className="flex-1 w-full text-[9px] font-black">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280' }} />
                  <Radar name="Internal" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                  <Radar name="Network" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-4 bg-gray-900/50 border border-white/5 p-8 rounded-[3.5rem] shadow-2xl h-[400px] flex flex-col">
           <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest mb-6"><BarChart3 size={16} className="text-emerald-500" /> Value Matrix</h3>
           <div className="flex-1 w-full text-[9px] font-black uppercase italic">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topAssets} layout="vertical" margin={{ left: -10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 10, 10, 0]} barSize={16}>
                    {topAssets.map((entry, i) => <Cell key={i} fillOpacity={1 - (i*0.1)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-4 bg-gray-900/50 border border-white/5 p-8 rounded-[3.5rem] shadow-2xl h-[400px] flex flex-col group overflow-hidden">
           <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest mb-6"><Sparkles size={16} className="text-sky-400" /> Growth Projection</h3>
           <div className="flex-1 w-full text-[9px] font-black">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="6 6" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Global Revenue', val: `$${(data.orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0) / 1000).toFixed(1)}k`, icon: DollarSign, col: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Asset Valuation', val: `$${(data.products.reduce((s, p) => s + (p.price * p.quantity), 0) / 1000).toFixed(1)}k`, icon: Layers, col: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Active Identity', val: data.customers.length, icon: Users, col: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Neural Health', val: stats.low > 0 ? 'CRITICAL' : 'OPTIMAL', icon: Activity, col: stats.low > 0 ? 'text-amber-400 animate-pulse' : 'text-sky-400', bg: stats.low > 0 ? 'bg-amber-500/10' : 'bg-sky-500/10' }
        ].map((s, i) => (
          <div key={i} className="group bg-gray-900 border border-white/5 p-8 rounded-[3rem] hover:bg-white/[0.02] transition-all relative overflow-hidden shadow-2xl">
            <div className={`w-14 h-14 ${s.bg} ${s.col} rounded-2xl flex items-center justify-center mb-6 border border-white/5 shadow-inner`}>
              <s.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">{s.label}</p>
            <h3 className="text-4xl font-black text-white tracking-tighter italic">{s.val}</h3>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
