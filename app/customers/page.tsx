"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  Users, Plus, Trash2, X, Search, Filter, Mail, Phone, TrendingUp, 
  UserPlus, Award, Calendar, ChevronRight, Activity, Sparkles,
  ArrowUpRight, Target, Zap, AlertTriangle, PieChart as PieIcon,
  MousePointer2, UserCheck, Heart, BarChart3, Rocket, BarChart, Bar
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// Neural Brand Logo
const EtharaLogo = () => (
  <div className="flex items-center gap-2.5 group">
    <div className="relative">
      <div className="absolute inset-0 bg-blue-500 rounded-xl rotate-6 animate-pulse opacity-20"></div>
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl border border-white/10 transition-transform group-hover:rotate-0">
        <Users size={18} className="text-white" />
      </div>
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-black text-white tracking-tighter uppercase leading-none italic">ETHARA <span className="text-indigo-500">AI</span></span>
      <span className="text-[7px] font-black text-blue-400 uppercase tracking-[0.3em] mt-1">Neural Identity</span>
    </div>
  </div>
);

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ full_name: '', email: '', phone_number: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(Array.isArray(data) ? data : []);
      } else {
        const d = await res.json();
        setErrorMsg(d.error || 'Failed to load customers.');
      }
    } catch {
      setErrorMsg('Cannot connect to backend.');
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = (search || '').toLowerCase().trim();
    return customers.filter(c => {
      if (!q) return true;
      return (
        (c.full_name || '').toLowerCase().includes(q) || 
        (c.email || '').toLowerCase().includes(q) || 
        (c.phone_number || '').includes(q)
      );
    });
  }, [customers, search]);

  // Chart 1: Enrollment Growth
  const growthData = useMemo(() => {
    if (customers.length === 0) return [];
    const groups: any = {};
    [...customers].reverse().forEach(c => {
      const date = new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      groups[date] = (groups[date] || 0) + 1;
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [customers]);

  // Chart 2: Status Allocation
  const statusData = useMemo(() => [
    { name: 'Core', value: Math.ceil(customers.length * 0.7), color: '#3b82f6' },
    { name: 'Elite', value: Math.floor(customers.length * 0.2), color: '#10b981' },
    { name: 'New', value: Math.floor(customers.length * 0.1), color: '#6366f1' }
  ].filter(s => s.value > 0), [customers]);

  // Chart 3: Weekly Velocity (Bar)
  const velocityData = useMemo(() => 
    growthData.slice(-5), 
  [growthData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setErrorMsg('');
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setForm({ full_name: '', email: '', phone_number: '' });
        load();
      } else {
        const d = await res.json();
        setErrorMsg(d.error || 'Failed to create customer.');
      }
    } catch {
      setErrorMsg('Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this identity?')) return;
    await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    load();
  };

  const getInitials = (name: string) => 
    (name || '').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-in fade-in duration-1000">
        <EtharaLogo />
        <div className="flex gap-2 mt-6">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 bg-sky-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Hero Header */}
      <div className="relative p-8 sm:p-12 rounded-[3.5rem] overflow-hidden bg-gray-900 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="space-y-6">
            <EtharaLogo />
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic leading-none">CRM Identity</h1>
            <p className="text-gray-500 text-sm font-medium max-w-xl leading-relaxed hidden sm:block">
              Manage subject identities and neural contact vectors. Track enrollment growth and relationship stability across the network.
            </p>
          </div>
          <div className="flex-1 lg:flex-none px-8 py-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex items-center gap-10 shadow-2xl">
             <div className="text-center">
               <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total Identity</div>
               <div className="text-2xl font-black text-white italic">{customers.length}</div>
             </div>
             <div className="text-center pl-10 border-l border-white/10">
               <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Growth</div>
               <div className="text-2xl font-black text-emerald-400 italic">+{growthData.length > 0 ? (growthData[growthData.length-1] as any).value : 0}</div>
             </div>
          </div>
        </div>
      </div>

      {/* 3 GRAPH MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GRAPH 1: Area */}
        <div className="bg-gray-900/50 border border-white/5 p-8 rounded-[3rem] shadow-2xl h-[350px] flex flex-col">
           <h3 className="text-[10px] font-black text-white flex items-center gap-2 uppercase tracking-widest mb-8">
              <TrendingUp size={14} className="text-blue-400" /> Enrollment Velocity
           </h3>
           <div className="flex-1 w-full text-[9px] font-black">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fill="url(#cGrad)" animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* GRAPH 2: Pie */}
        <div className="bg-gray-900/50 border border-white/5 p-8 rounded-[3rem] shadow-2xl h-[350px] flex flex-col">
           <h3 className="text-[10px] font-black text-white flex items-center gap-2 uppercase tracking-widest mb-8">
              <PieIcon size={14} className="text-indigo-400" /> Status Allocation
           </h3>
           <div className="flex-1 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* GRAPH 3: Bar */}
        <div className="bg-gray-900/50 border border-white/5 p-8 rounded-[3rem] shadow-2xl h-[350px] flex flex-col">
           <h3 className="text-[10px] font-black text-white flex items-center gap-2 uppercase tracking-widest mb-8">
              <BarChart3 size={14} className="text-emerald-400" /> Weekly Signals
           </h3>
           <div className="flex-1 w-full text-[9px] font-black">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocityData}>
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form - Left */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-900 border border-white/5 p-8 sm:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 transition-all group-hover:w-2"></div>
            <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3 tracking-tight uppercase italic">
              <UserPlus size={20} className="text-blue-400" /> Subject Enrollment
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <input required placeholder="Legal Identity..." value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="w-full bg-white/5 text-gray-100 border border-white/10 px-6 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all hover:bg-white/[0.08]" />
              <input required type="email" placeholder="Endpoint Email..." value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/5 text-gray-100 border border-white/10 px-6 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all hover:bg-white/[0.08]" />
              <input required placeholder="Contact Vector..." value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })}
                className="w-full bg-white/5 text-gray-100 border border-white/10 px-6 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all hover:bg-white/[0.08]" />

              <button type="submit" disabled={isSubmitting}
                className="w-full group relative flex items-center justify-center gap-3 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all disabled:opacity-50 shadow-xl active:scale-95 overflow-hidden mt-4">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                {isSubmitting ? <Activity className="animate-spin" size={18} /> : <Zap size={18} />}
                {isSubmitting ? 'PROCESSING' : 'ESTABLISH LINK'}
              </button>
            </form>
          </div>
        </div>

        {/* Search + Ledger */}
        <div className="lg:col-span-7 space-y-8">
           <div className="relative group">
              <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                placeholder="Search Identity Core..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-900 border border-white/5 text-gray-100 pl-16 pr-6 py-6 rounded-3xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all hover:bg-white/[0.02] shadow-xl"
              />
           </div>

           <div className="bg-gray-900 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto text-[10px] font-black uppercase tracking-widest">
                 <div className="flex bg-white/[0.02] border-b border-white/5 px-8 py-5 text-gray-600">
                    <span className="flex-1">Identity Protocol</span>
                    <span className="flex-1">Endpoint</span>
                    <span className="w-20 text-right">Ops</span>
                 </div>
                 <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                    {filtered.map((c, idx) => (
                      <div key={c.id} className="flex items-center px-8 py-6 group hover:bg-white/[0.02] transition-colors">
                        <div className="flex-1 flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${['from-blue-600 to-indigo-600', 'from-purple-600 to-pink-600', 'from-emerald-600 to-teal-600'][idx % 3]} flex items-center justify-center text-white font-black italic shadow-lg`}>
                              {getInitials(c.full_name)}
                           </div>
                           <div>
                              <p className="text-white text-xs italic tracking-tight">{c.full_name}</p>
                              <p className="text-[7px] text-gray-600 tracking-[0.2em] mt-1">ID: #0{c.id}</p>
                           </div>
                        </div>
                        <div className="flex-1 text-gray-400">
                           <p className="lowercase font-bold tracking-tight">{c.email}</p>
                           <p className="text-[8px] text-gray-600 mt-1">{c.phone_number}</p>
                        </div>
                        <div className="w-20 text-right">
                           <button onClick={() => handleDelete(c.id)} className="p-2.5 bg-white/5 hover:bg-red-600 text-gray-600 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 size={14} />
                           </button>
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
