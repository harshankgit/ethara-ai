"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  Users, Plus, Trash2, X, Search, Filter, Mail, Phone, TrendingUp, 
  UserPlus, Award, Calendar, ChevronRight, Activity, Sparkles,
  ArrowUpRight, Target, Zap, AlertTriangle, PieChart as PieIcon,
  MousePointer2, UserCheck, Heart, BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

// Custom CRM Logo
const CRMLogo = ({ className = "w-10 h-10" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-blue-500 rounded-xl rotate-6 animate-pulse opacity-20"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl -rotate-3 transition-transform hover:rotate-0 flex items-center justify-center shadow-lg border border-white/10">
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

  // Analytics 1: Enrollment Growth
  const growthData = useMemo(() => {
    if (customers.length === 0) return [];
    const groups: any = {};
    [...customers].reverse().forEach(c => {
      const date = new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      groups[date] = (groups[date] || 0) + 1;
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [customers]);

  // Analytics 2: Retention Index (Mock calculation based on join date)
  const retentionData = useMemo(() => [
    { name: 'Core Clients', value: Math.ceil(customers.length * 0.7), color: '#3b82f6' },
    { name: 'New Arrivals', value: Math.floor(customers.length * 0.3), color: '#10b981' }
  ], [customers]);

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
    if (!confirm('Delete this identity? This protocol is permanent.')) return;
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
        <CRMLogo className="w-20 h-20 mb-8" />
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-black text-white tracking-widest uppercase">Syncing CRM Core</h2>
          <div className="flex gap-2 mt-4">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
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
        <div className="absolute top-0 right-0 w-full lg:w-1/3 h-full bg-gradient-to-l from-blue-600/10 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <CRMLogo className="w-12 h-12" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic leading-none">CRM Identity</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Customer Intelligence Core Active</p>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-xs font-medium max-w-lg leading-relaxed hidden sm:block">
              Manage subject identities, track enrollment velocity, and maintain high-integrity contact vectors across the enterprise network.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center gap-6 shadow-xl">
               <div className="text-center">
                 <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Subjects</div>
                 <div className="text-xl font-black text-white">{customers.length}</div>
               </div>
               <div className="text-center pl-6 border-l border-white/10">
                 <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Growth Index</div>
                 <div className="text-xl font-black text-emerald-400">+{growthData.length > 0 ? (growthData[growthData.length-1] as any).value : 0}</div>
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
        
        {/* Registration Form - Left */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-900 border border-white/5 p-6 sm:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 transition-all group-hover:w-2"></div>
            <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3 tracking-tight uppercase">
              <UserPlus size={20} className="text-blue-400" /> Subject Enrollment
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Full Identity</label>
                  <input required placeholder="Legal Nomenclature..." value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                    className="w-full bg-white/5 text-gray-100 border border-white/10 px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all hover:bg-white/[0.08]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Email Endpoint</label>
                  <input required type="email" placeholder="identity@protocol.net" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white/5 text-gray-100 border border-white/10 px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all hover:bg-white/[0.08]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Contact Line</label>
                  <input required placeholder="+X XXX-XXX-XXXX" value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })}
                    className="w-full bg-white/5 text-gray-100 border border-white/10 px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all hover:bg-white/[0.08]" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full group relative flex items-center justify-center gap-3 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl shadow-blue-600/20 active:scale-95 overflow-hidden mt-4">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                {isSubmitting ? <Activity className="animate-spin" size={18} /> : <Zap size={18} />}
                {isSubmitting ? 'PROCESSING' : 'ESTABLISH CONNECTION'}
              </button>
            </form>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 transition-transform group-hover:rotate-0">
               <Heart size={80} className="text-white" />
             </div>
             <div className="relative z-10">
               <h4 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2">Retention Factor</h4>
               <p className="text-blue-100 text-xs font-medium mb-6">High-integrity subjects are currently indexed at optimal stability.</p>
               <div className="text-4xl font-black text-white tracking-tighter italic">98.4%</div>
             </div>
          </div>
        </div>

        {/* Analytics Hub - Right */}
        <div className="lg:col-span-7 space-y-8">
           {/* Chart 1: Enrollment velocity */}
           <div className="bg-gray-900 border border-white/5 p-8 rounded-[3rem] shadow-2xl flex flex-col h-[320px]">
              <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-widest mb-8">
                <TrendingUp size={16} className="text-blue-400" /> Enrollment Velocity
              </h3>
              <div className="flex-1 w-full text-[9px] font-black">
                {growthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <defs>
                        <linearGradient id="growthVel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="6 6" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fill="url(#growthVel)" animationDuration={2000} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                   <div className="h-full flex items-center justify-center text-gray-700 uppercase tracking-widest">No Signals</div>
                )}
              </div>
           </div>

           {/* Chart 2: Client Status Distribution */}
           <div className="bg-gray-900 border border-white/5 p-8 rounded-[3rem] shadow-2xl flex flex-col h-[320px]">
              <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-widest mb-4">
                <PieIcon size={16} className="text-indigo-400" /> Status Allocation
              </h3>
              <div className="flex-1 flex flex-col sm:flex-row items-center gap-8">
                 <div className="flex-1 w-full h-full min-h-[160px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={retentionData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={10} dataKey="value">
                          {retentionData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
                      </PieChart>
                   </ResponsiveContainer>
                 </div>
                 <div className="grid grid-cols-1 gap-3 w-full sm:w-auto">
                    {retentionData.map((item, i) => (
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

      {/* Interactive Controls */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full group">
          <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            placeholder="Search Intelligence: Name, Endpoint, or Identity ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-white/5 text-gray-100 pl-16 pr-6 py-6 rounded-[2rem] text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all hover:bg-white/[0.02] shadow-xl"
          />
        </div>
        <div className="flex bg-gray-900 p-2 rounded-[1.5rem] border border-white/5 self-stretch md:self-auto gap-2">
          <button onClick={() => setViewMode('table')} className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Ledger</button>
          <button onClick={() => setViewMode('grid')} className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Matrix</button>
        </div>
      </div>

      {/* Main Ledger Area */}
      <div className="bg-gray-900 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
        {filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 bg-gray-800 rounded-[2rem] flex items-center justify-center border border-white/5 animate-pulse">
               <Search size={32} className="text-gray-600" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-black text-white uppercase italic tracking-tighter">No Subjects Identified</p>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Adjust search vector or establish new connection protocol</p>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Identity Protocol</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Endpoint Signal</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Enrollment</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((c: any, idx: number) => (
                  <tr key={c.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${['from-blue-600 to-indigo-600', 'from-purple-600 to-pink-600', 'from-emerald-600 to-teal-600', 'from-orange-600 to-red-600'][idx % 4]} flex items-center justify-center text-white text-sm font-black transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                            {getInitials(c.full_name)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-gray-900 rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-black text-white tracking-tight group-hover:text-blue-400 transition-colors uppercase italic">{c.full_name}</div>
                          <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1">ID: #0{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                          <Mail size={14} className="text-gray-600" /> {c.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                          <Phone size={12} className="text-gray-700" /> {c.phone_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                       <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                         <Calendar size={14} className="text-gray-700" /> {new Date(c.created_at).toLocaleDateString()}
                       </div>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                         <button className="p-3.5 bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white rounded-2xl transition-all"><ChevronRight size={18} /></button>
                         <button onClick={() => handleDelete(c.id)} className="p-3.5 bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white rounded-2xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
            {filtered.map((c: any, idx: number) => (
              <div key={c.id} className="group bg-white/5 border border-white/5 p-8 rounded-[3rem] hover:bg-white/[0.08] transition-all hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleDelete(c.id)} className="p-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                </div>
                <div className="flex items-center gap-5 mb-8">
                   <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${['from-blue-600 to-indigo-600', 'from-purple-600 to-pink-600', 'from-emerald-600 to-teal-600', 'from-orange-600 to-red-600'][idx % 4]} flex items-center justify-center text-white text-xl font-black shadow-xl group-hover:rotate-6 transition-transform`}>
                      {getInitials(c.full_name)}
                   </div>
                   <div>
                     <h4 className="text-lg font-black text-white tracking-tight uppercase italic">{c.full_name}</h4>
                     <div className="flex items-center gap-1.5 mt-1">
                        <Award size={12} className="text-amber-500" />
                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Verified Priority</span>
                     </div>
                   </div>
                </div>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 bg-black/20 p-4 rounded-2xl border border-white/5">
                    <Mail size={16} className="text-blue-500" /> {c.email}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 bg-black/20 p-4 rounded-2xl border border-white/5">
                    <Phone size={16} className="text-indigo-500" /> {c.phone_number}
                  </div>
                </div>
                <button className="w-full py-4 bg-white/5 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl group-hover:shadow-blue-600/20">Deep Analysis</button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
