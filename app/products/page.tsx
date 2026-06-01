"use client";

import { useEffect, useState, useMemo } from 'react';
import { Package, Plus, Trash2, Edit, X, Save, Search, Filter, BarChart2, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) setProducts(await res.json());
      else { const d = await res.json(); setErrorMsg(d.error || 'Failed to load.'); }
    } catch { setErrorMsg('Cannot connect to backend.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return products
      .filter(p => {
        const q = search.toLowerCase();
        return p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
      })
      .filter(p => {
        if (stockFilter === 'low') return p.quantity > 0 && p.quantity < 10;
        if (stockFilter === 'out') return p.quantity === 0;
        return true;
      });
  }, [products, search, stockFilter]);

  const chartData = useMemo(() =>
    products.slice(0, 8).map(p => ({
      name: p.name.length > 9 ? p.name.slice(0, 9) + '…' : p.name,
      Stock: p.quantity,
      color: p.quantity === 0 ? '#ef4444' : p.quantity < 10 ? '#f59e0b' : '#6366f1'
    })), [products]);

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setForm({ name: p.name, sku: p.sku, price: p.price.toString(), quantity: p.quantity.toString() });
    setErrorMsg('');
  };

  const cancelEdit = () => { setEditingId(null); setForm({ name: '', sku: '', price: '', quantity: '' }); setErrorMsg(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setErrorMsg('');
    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify({ name: form.name, sku: form.sku, price: parseFloat(form.price), quantity: parseInt(form.quantity) }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) { setForm({ name: '', sku: '', price: '', quantity: '' }); setEditingId(null); load(); }
      else { const d = await res.json(); setErrorMsg(d.error || d.detail || 'Operation failed.'); }
    } catch { setErrorMsg('Network error.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) load();
      else { const d = await res.json(); setErrorMsg(d.error || d.detail || 'Failed to delete.'); }
    } catch { setErrorMsg('Network error.'); }
  };

  const lowStock = products.filter(p => p.quantity > 0 && p.quantity < 10).length;
  const outOfStock = products.filter(p => p.quantity === 0).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Package className="text-indigo-400" size={26} /> Products Catalog
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage inventory, pricing and stock levels</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-300">{products.length} total</span>
          {lowStock > 0 && <span className="px-3 py-1.5 bg-yellow-950/50 border border-yellow-500/30 rounded-lg text-yellow-400">{lowStock} low</span>}
          {outOfStock > 0 && <span className="px-3 py-1.5 bg-red-950/50 border border-red-500/30 rounded-lg text-red-400">{outOfStock} out</span>}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl text-sm flex justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')}><X size={15} /></button>
        </div>
      )}

      {/* Two column: form + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Form */}
        <div className="lg:col-span-3 bg-gray-900 p-5 rounded-2xl border border-gray-800">
          <h3 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
            {editingId ? <><Edit size={15} className="text-amber-400" /> Editing Product #{editingId}</> : <><Plus size={15} className="text-indigo-400" /> Add New Product</>}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Product Name</label>
              <input required placeholder="e.g. MacBook Pro" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-800 text-gray-100 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-600 transition-all" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">SKU Code</label>
              <input required placeholder="e.g. MBP-001" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })}
                className="w-full bg-gray-800 text-gray-100 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-600 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Price ($)</label>
              <input required type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full bg-gray-800 text-gray-100 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-600 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Quantity</label>
              <input required type="number" min="0" placeholder="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
                className="w-full bg-gray-800 text-gray-100 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-600 transition-all" />
            </div>
            <div className="col-span-2 flex gap-2 pt-1">
              <button type="submit" disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${editingId ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                {editingId ? <Save size={15} /> : <Plus size={15} />}
                {isSubmitting ? 'Processing…' : editingId ? 'Save Changes' : 'Add Product'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-xl text-sm transition-all">
                  <X size={15} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Stock Chart */}
        <div className="lg:col-span-2 bg-gray-900 p-5 rounded-2xl border border-gray-800 flex flex-col">
          <h3 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
            <BarChart2 size={15} className="text-indigo-400" /> Stock Levels
          </h3>
          <div className="flex-1 min-h-[160px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '10px', fontSize: '12px' }} />
                  <Bar dataKey="Stock" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600 text-xs">No data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            placeholder="Search by name or SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 text-gray-100 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-600 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-500 flex-shrink-0" />
          {(['all', 'low', 'out'] as const).map(f => (
            <button key={f} onClick={() => setStockFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${stockFilter === f
                ? f === 'out' ? 'bg-red-600 text-white' : f === 'low' ? 'bg-yellow-600 text-white' : 'bg-indigo-600 text-white'
                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-700'}`}>
              {f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/80">
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500 text-sm">
                  {search || stockFilter !== 'all' ? 'No products match your filters.' : 'No products yet — add one above.'}
                </td></tr>
              ) : filtered.map((p: any) => (
                <tr key={p.id} className={`hover:bg-gray-800/40 transition-colors ${editingId === p.id ? 'bg-amber-950/20' : ''}`}>
                  <td className="px-5 py-3.5 text-gray-500 text-xs font-mono">#{p.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-gray-200">{p.name}</div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{p.sku}</div>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-gray-200">${parseFloat(p.price).toFixed(2)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border
                      ${p.quantity >= 10 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : p.quantity > 0 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {p.quantity === 0 && <AlertTriangle size={11} />}
                      {p.quantity} in stock
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => startEdit(p)} title="Edit"
                        className="p-2 rounded-lg text-indigo-400 hover:bg-indigo-900/30 transition-colors">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} title="Delete"
                        className="p-2 rounded-lg text-red-400 hover:bg-red-900/30 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-800/60 flex justify-between items-center">
            <span className="text-xs text-gray-500">{filtered.length} of {products.length} products shown</span>
          </div>
        )}
      </div>
    </div>
  );
}
