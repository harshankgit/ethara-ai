"use client";

import { useEffect, useState, useMemo } from 'react';
import { Users, Plus, Trash2, X, Search, Filter, Mail, Phone, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ full_name: '', email: '', phone_number: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      if (res.ok) setCustomers(await res.json());
      else { const d = await res.json(); setErrorMsg(d.error || d.detail || 'Failed to load customers.'); }
    } catch { setErrorMsg('Cannot connect to backend.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() =>
    customers.filter(c => {
      const q = search.toLowerCase();
      return c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone_number?.includes(q);
    }), [customers, search]);

  // Growth chart: customers joined by index (simulate trend)
  const growthData = useMemo(() => {
    return [...customers].reverse().map((_, i) => ({ index: i + 1, Customers: i + 1 }));
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
      if (res.ok) { setForm({ full_name: '', email: '', phone_number: '' }); load(); }
      else { const d = await res.json(); setErrorMsg(d.error || d.detail || 'Failed to create customer.'); }
    } catch { setErrorMsg('Network error.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this customer? Their orders will also be removed.')) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) load();
      else { const d = await res.json(); setErrorMsg(d.error || d.detail || 'Failed to delete.'); }
    } catch { setErrorMsg('Network error.'); }
  };

  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const avatarColors = ['bg-indigo-600', 'bg-blue-600', 'bg-violet-600', 'bg-sky-600', 'bg-cyan-600'];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Users className="text-blue-400" size={26} /> Customers
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage customer relationships and contact details</p>
        </div>
        <span className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 text-xs font-semibold">
          {customers.length} registered
        </span>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl text-sm flex justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')}><X size={15} /></button>
        </div>
      )}

      {/* Form + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-gray-900 p-5 rounded-2xl border border-gray-800">
          <h3 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
            <Plus size={15} className="text-blue-400" /> Add New Customer
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Full Name</label>
              <input required placeholder="e.g. Jane Doe" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="w-full bg-gray-800 text-gray-100 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-600 transition-all" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email Address</label>
              <input required type="email" placeholder="jane@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-800 text-gray-100 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-600 transition-all" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Phone Number</label>
              <input required placeholder="+1 555 000 0000" value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })}
                className="w-full bg-gray-800 text-gray-100 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-600 transition-all" />
            </div>
            <div className="col-span-2">
              <button type="submit" disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60">
                <Plus size={15} /> {isSubmitting ? 'Adding…' : 'Add Customer'}
              </button>
            </div>
          </form>
        </div>

        {/* Growth chart */}
        <div className="lg:col-span-2 bg-gray-900 p-5 rounded-2xl border border-gray-800 flex flex-col">
          <h3 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-blue-400" /> Customer Growth
          </h3>
          <div className="flex-1 min-h-[160px]">
            {growthData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="index" tick={{ fontSize: 9, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '10px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="Customers" stroke="#3b82f6" strokeWidth={2} fill="url(#custGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600 text-xs">Add customers to see growth</div>
            )}
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          placeholder="Search by name, email, or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 text-gray-100 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-600 transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={3} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-12 text-center text-gray-500 text-sm">
                  {search ? 'No customers match your search.' : 'No customers yet — add one above.'}
                </td></tr>
              ) : filtered.map((c: any, idx: number) => (
                <tr key={c.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {getInitials(c.full_name)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-200">{c.full_name}</div>
                        <div className="text-xs text-gray-500 font-mono">#{c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-gray-300 text-sm">
                      <Mail size={13} className="text-gray-500 flex-shrink-0" /> {c.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                      <Phone size={11} className="flex-shrink-0" /> {c.phone_number}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => handleDelete(c.id)} title="Delete"
                      className="p-2 rounded-lg text-red-400 hover:bg-red-900/30 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-800/60">
            <span className="text-xs text-gray-500">{filtered.length} of {customers.length} customers shown</span>
          </div>
        )}
      </div>
    </div>
  );
}
