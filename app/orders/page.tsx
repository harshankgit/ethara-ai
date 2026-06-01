"use client";

import { useEffect, useState, useMemo } from 'react';
import { ShoppingCart, Plus, Trash2, Eye, X, Search, Tag, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
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
    } catch { setErrorMsg('Cannot connect to backend.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() =>
    orders.filter(o => {
      const q = search.toLowerCase();
      const name = (o.customers?.full_name || '').toLowerCase();
      return name.includes(q) || String(o.id).includes(q);
    }), [orders, search]);

  // Revenue per order chart
  const chartData = useMemo(() =>
    [...orders].reverse().slice(-8).map((o, i) => ({
      label: `#${o.id}`,
      Revenue: parseFloat(o.total_amount || 0)
    })), [orders]);

  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      if (res.ok) { setForm({ customer_id: '', product_id: '', quantity: '1' }); load(); }
      else { const d = await res.json(); setErrorMsg(d.error || d.detail || 'Failed to place order.'); }
    } catch { setErrorMsg('Network error.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Cancel and delete this order? Stock will be restored.')) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) { setActiveOrder(null); load(); }
      else { const d = await res.json(); setErrorMsg(d.error || d.detail || 'Failed to cancel order.'); }
    } catch { setErrorMsg('Network error.'); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <ShoppingCart className="text-emerald-400" size={26} /> Orders
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Track and manage customer purchase orders</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-300">{orders.length} orders</span>
          <span className="px-3 py-1.5 bg-emerald-950/50 border border-emerald-500/30 rounded-lg text-emerald-400">
            ${totalRevenue.toFixed(2)} revenue
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl text-sm flex gap-2 justify-between">
          <div className="flex items-center gap-2"><AlertCircle size={15} />{errorMsg}</div>
          <button onClick={() => setErrorMsg('')}><X size={15} /></button>
        </div>
      )}

      {/* Form + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-gray-900 p-5 rounded-2xl border border-gray-800">
          <h3 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
            <Plus size={15} className="text-emerald-400" /> Create New Order
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Customer</label>
              <select required value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}
                className="w-full bg-gray-800 text-gray-100 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                <option value="" disabled>Select customer…</option>
                {customers.map((c: any) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Product</label>
              <select required value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })}
                className="w-full bg-gray-800 text-gray-100 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                <option value="" disabled>Select product…</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id} disabled={p.quantity < 1}>
                    {p.name} — ${parseFloat(p.price).toFixed(2)} ({p.quantity} left)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Quantity</label>
              <input required type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
                className="w-full bg-gray-800 text-gray-100 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60">
                <Plus size={15} /> {isSubmitting ? 'Processing…' : 'Create Order'}
              </button>
            </div>
          </form>
        </div>

        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-gray-900 p-5 rounded-2xl border border-gray-800 flex flex-col">
          <h3 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
            <DollarSign size={15} className="text-emerald-400" /> Order Revenue
          </h3>
          <div className="flex-1 min-h-[160px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '10px', fontSize: '12px' }}
                    formatter={(v: any) => [`$${parseFloat(v).toFixed(2)}`, 'Revenue']} />
                  <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600 text-xs">No orders yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input placeholder="Search by customer name or order ID…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 text-gray-100 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none placeholder-gray-600 transition-all" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"><X size={14} /></button>}
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500 text-sm">
                  {search ? 'No orders match your search.' : 'No orders yet — create one above.'}
                </td></tr>
              ) : filtered.map((o: any) => {
                const cust = o.customers || customers.find((c: any) => c.id === o.customer_id);
                return (
                  <tr key={o.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-gray-200 font-mono">#{o.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-200">{cust?.full_name || `Customer #${o.customer_id}`}</div>
                      <div className="text-xs text-gray-500">{cust?.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Tag size={11} /> ${parseFloat(o.total_amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {new Date(o.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => setActiveOrder(o)} title="View details"
                          className="p-2 rounded-lg text-blue-400 hover:bg-blue-900/30 transition-colors">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => handleDelete(o.id)} title="Cancel order"
                          className="p-2 rounded-lg text-red-400 hover:bg-red-900/30 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-800/60">
            <span className="text-xs text-gray-500">{filtered.length} of {orders.length} orders shown</span>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            <div className="p-5 border-b border-gray-800 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-100 flex items-center gap-2">
                  <ShoppingCart size={16} className="text-emerald-400" /> Order #{activeOrder.id}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{new Date(activeOrder.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setActiveOrder(null)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              {/* Customer */}
              <div className="bg-gray-800/50 rounded-xl p-4 grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Customer</p><p className="font-semibold text-gray-200">{activeOrder.customers?.full_name || '—'}</p></div>
                <div><p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Email</p><p className="text-gray-300 truncate">{activeOrder.customers?.email || '—'}</p></div>
                <div><p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Phone</p><p className="text-gray-300">{activeOrder.customers?.phone_number || '—'}</p></div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Line Items</p>
                <div className="border border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-800/60 text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-semibold">Product</th>
                        <th className="px-4 py-2.5 text-right font-semibold">Price</th>
                        <th className="px-4 py-2.5 text-right font-semibold">Qty</th>
                        <th className="px-4 py-2.5 text-right font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {activeOrder.order_items?.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-800/20">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-200">{item.products?.name || `#${item.product_id}`}</p>
                            <p className="text-gray-500">{item.products?.sku}</p>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-300">${parseFloat(item.price_at_time).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-gray-300">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-100">${(item.price_at_time * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-800 flex justify-between items-center">
              <button onClick={() => handleDelete(activeOrder.id)}
                className="px-4 py-2 bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all">
                <Trash2 size={13} /> Cancel Order
              </button>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Grand Total</p>
                <p className="text-xl font-extrabold text-emerald-400">${parseFloat(activeOrder.total_amount).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
