"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  Users, Plus, Trash2, X, Search, Filter, Mail, Phone, TrendingUp, 
  UserPlus, Award, Calendar, ChevronRight, Activity, Sparkles,
  ArrowUpRight, Target, Zap, AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar
} from 'recharts';

// Custom Logo Component
const BrandLogo = ({ className = "w-10 h-10" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-blue-500 rounded-xl rotate-6 animate-pulse opacity-20"></div>
    <div className="absolute inset-0 bg-indigo-600 rounded-xl -rotate-3 transition-transform hover:rotate-0 flex items-center justify-center shadow-lg border border-white/10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
      <Users size={20} className="text-white relative z-10" />
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
      // Simulate a slightly longer loading for "fantastic" animation experience
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

  // Insights Data
  const stats = useMemo(() => {
    const total = customers.length;
    const recent = customers.filter(c => {
      const date = new Date(c.created_at);
      const now = new Date();
      return (now.getTime() - date.getTime()) < (7 * 24 * 60 * 60 * 1000); // last 7 days
    }).length;
    
    return { total, recent, rate: total > 0 ? Math.round((recent / total) * 100) : 0 };
  }, [customers]);

  const growthData = useMemo(() => {
    if (customers.length === 0) return [];
    // Group by date
    const groups: any = {};
    customers.forEach(c => {
      const date = new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      groups[date] = (groups[date] || 0) + 1;
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value })).reverse();
  }, [customers]);

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
    if (!confirm('Delete this customer? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) load();
      else {
        const d = await res.json();
        setErrorMsg(d.error || 'Failed to delete.');
      }
    } catch {
      setErrorMsg('Network error.');
    }
  };

  const getInitials = (name: string) => 
    (name || '').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse"></div>
          <BrandLogo className="w-20 h-20 relative z-10" />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Syncing Customer Data</h2>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Dynamic Glass Header */}
      <div className="relative p-8 rounded-3xl overflow-hidden bg-gray-900 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Users className="text-blue-400" size={24} />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">CRM Hub</h1>
            </div>
            <p className="text-gray-400 font-medium max-w-md">Manage your network, track growth trends, and cultivate lasting relationships.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4">
              <div className="text-center px-4 border-r border-white/10">
                <div className="text-2xl font-black text-white">{stats.total}</div>
                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Total</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-black text-emerald-400 flex items-center gap-1">
                  <ArrowUpRight size={18} /> {stats.recent}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">New (7d)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm flex justify-between items-center animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-medium">
             <AlertTriangle size={16} /> {errorMsg}
          </div>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"><X size={16} /></button>
        </div>
      )}

      {/* Main Grid: Form + Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Registration Form - Left */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900 border border-white/5 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 transition-all group-hover:w-2"></div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <UserPlus size={20} className="text-blue-400" /> New Connection
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Full Identity</label>
                <div className="relative group/input">
                  <input required placeholder="Full Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                    className="w-full bg-white/5 text-gray-100 border border-white/10 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none placeholder-gray-600 transition-all hover:bg-white/[0.07]" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Email Endpoint</label>
                  <input required type="email" placeholder="email@address.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white/5 text-gray-100 border border-white/10 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none placeholder-gray-600 transition-all hover:bg-white/[0.07]" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Contact Line</label>
                  <input required placeholder="Phone Number" value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })}
                    className="w-full bg-white/5 text-gray-100 border border-white/10 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none placeholder-gray-600 transition-all hover:bg-white/[0.07]" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full group relative flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-black transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20 active:scale-95 overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                {isSubmitting ? <Activity className="animate-spin" size={18} /> : <Zap size={18} />}
                {isSubmitting ? 'PROCESSING' : 'ESTABLISH CONNECTION'}
              </button>
            </form>
          </div>

          {/* Quick Insight Card */}
          <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-3xl relative overflow-hidden">
             <div className="relative z-10">
               <div className="flex items-center gap-2 text-indigo-400 mb-2">
                 <Sparkles size={16} /> <span className="text-[11px] font-black uppercase tracking-widest">Growth Factor</span>
               </div>
               <div className="text-3xl font-black text-white mb-1">{stats.rate}%</div>
               <p className="text-xs text-indigo-300 font-medium">Weekly expansion rate relative to total network volume.</p>
             </div>
             <Target className="absolute -bottom-4 -right-4 text-indigo-500/10 w-24 h-24 rotate-12" />
          </div>
        </div>

        {/* Dynamic Visualizer - Right */}
        <div className="lg:col-span-8 bg-gray-900 border border-white/5 p-8 rounded-3xl shadow-xl flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-400" /> Retention Visualizer
            </h3>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button className="px-3 py-1 text-[10px] font-black uppercase tracking-tighter text-white bg-white/10 rounded-lg">Realtime</button>
              <button className="px-3 py-1 text-[10px] font-black uppercase tracking-tighter text-gray-500 hover:text-gray-300 transition-colors">Historical</button>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="5 5" stroke="#ffffff08" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }} 
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fill="url(#growthGrad)" animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-3">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-800 flex items-center justify-center">
                   <Activity size={24} className="opacity-20" />
                </div>
                <p className="text-xs font-bold tracking-widest uppercase opacity-50">Awaiting Signal Data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            placeholder="Global Search: Name, Email, UUID, or Contact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-white/5 text-gray-100 pl-12 pr-4 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none placeholder-gray-600 transition-all hover:bg-white/[0.02]"
          />
        </div>
        
        <div className="flex bg-gray-900 p-1.5 rounded-2xl border border-white/5 self-stretch md:self-auto">
          <button onClick={() => setViewMode('table')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Table</button>
          <button onClick={() => setViewMode('grid')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Grid</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-gray-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        {filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center border border-white/5 animate-bounce">
               <Search size={32} className="text-gray-600" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xl font-black text-white">No Subjects Identified</p>
              <p className="text-gray-500 text-sm font-medium">Refine your search parameters or establish a new connection.</p>
            </div>
            {search && (
              <button onClick={() => setSearch('')} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">Clear Search</button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Primary Identity</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Contact Vector</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Join Date</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((c: any, idx: number) => (
                  <tr key={c.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${['from-blue-600 to-indigo-600', 'from-purple-600 to-pink-600', 'from-emerald-600 to-teal-600', 'from-orange-600 to-red-600'][idx % 4]} flex items-center justify-center text-white text-sm font-black shadow-lg transition-transform group-hover:scale-110`}>
                            {getInitials(c.full_name)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-gray-900 rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">{c.full_name}</div>
                          <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">ID: {c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                          <Mail size={14} className="text-gray-600" /> {c.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                          <Phone size={12} className="text-gray-700" /> {c.phone_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                         <Calendar size={14} className="text-gray-700" /> {new Date(c.created_at).toLocaleDateString()}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                         <button className="p-3 bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white rounded-xl transition-all"><ChevronRight size={18} /></button>
                         <button onClick={() => handleDelete(c.id)} className="p-3 bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white rounded-xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
            {filtered.map((c: any, idx: number) => (
              <div key={c.id} className="group bg-white/5 border border-white/5 p-6 rounded-[2rem] hover:bg-white/[0.08] transition-all hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                </div>
                <div className="flex items-center gap-4 mb-6">
                   <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${['from-blue-600 to-indigo-600', 'from-purple-600 to-pink-600', 'from-emerald-600 to-teal-600', 'from-orange-600 to-red-600'][idx % 4]} flex items-center justify-center text-white text-lg font-black shadow-xl group-hover:rotate-6 transition-transform`}>
                      {getInitials(c.full_name)}
                   </div>
                   <div>
                     <h4 className="text-white font-black tracking-tight">{c.full_name}</h4>
                     <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Client Rank: Gold</p>
                   </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-400 bg-black/20 p-3 rounded-xl">
                    <Mail size={14} className="text-blue-500" /> {c.email}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-400 bg-black/20 p-3 rounded-xl">
                    <Phone size={14} className="text-indigo-500" /> {c.phone_number}
                  </div>
                </div>
                <button className="w-full py-3 bg-white/5 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all">Deep Analysis</button>
              </div>
            ))}
          </div>
        )}
        
        {filtered.length > 0 && (
          <div className="px-8 py-6 bg-white/[0.01] border-t border-white/5 flex justify-between items-center">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Processing <span className="text-blue-400">{filtered.length}</span> of <span className="text-white">{customers.length}</span> active records
            </div>
            <div className="flex gap-2">
               {[1, 2, 3].map(p => (
                 <button key={p} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${p === 1 ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}>{p}</button>
               ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
