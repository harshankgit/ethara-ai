"use client";

import { useEffect, useState } from 'react';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  Calendar, 
  Clock, 
  Activity, 
  Layers 
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    orders: 0,
    lowStock: 0,
    totalRevenue: 0,
    inventoryValue: 0
  });
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      try {
        const [productsRes, customersRes, ordersRes] = await Promise.all([
          fetch('/api/products').then(r => r.ok ? r.json() : []),
          fetch('/api/customers').then(r => r.ok ? r.json() : []),
          fetch('/api/orders').then(r => r.ok ? r.json() : [])
        ]);

        const lowStock = productsRes.filter((p: any) => p.quantity < 10).length;
        const totalRevenue = ordersRes.reduce((sum: number, o: any) => sum + parseFloat(o.total_amount || 0), 0);
        const inventoryValue = productsRes.reduce((sum: number, p: any) => sum + (parseFloat(p.price || 0) * parseInt(p.quantity || 0)), 0);

        setProducts(productsRes);
        setOrders(ordersRes);
        setCustomers(customersRes);
        setStats({
          products: productsRes.length,
          customers: customersRes.length,
          orders: ordersRes.length,
          lowStock,
          totalRevenue,
          inventoryValue
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  // Prepare chart data for Sales Trend
  const getSalesTrendData = () => {
    if (orders.length === 0) return [];
    
    // Group orders by date (last 7 entries)
    const grouped: { [key: string]: { date: string; sales: number; count: number } } = {};
    
    orders.forEach((o: any) => {
      const date = new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!grouped[date]) {
        grouped[date] = { date, sales: 0, count: 0 };
      }
      grouped[date].sales += parseFloat(o.total_amount || 0);
      grouped[date].count += 1;
    });

    return Object.values(grouped).reverse().slice(-7);
  };

  // Prepare chart data for Inventory Stock Level
  const getInventoryData = () => {
    if (products.length === 0) return [];
    return products
      .slice(0, 8)
      .map((p: any) => ({
        name: p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name,
        Stock: p.quantity,
        Value: parseFloat(p.price) * p.quantity
      }));
  };

  // Prepare Pie Chart data for Stock Status
  const getStockStatusData = () => {
    if (products.length === 0) return [];
    
    const outOfStock = products.filter((p: any) => p.quantity === 0).length;
    const lowStock = products.filter((p: any) => p.quantity > 0 && p.quantity < 10).length;
    const healthyStock = products.filter((p: any) => p.quantity >= 10).length;

    return [
      { name: 'Healthy (10+)', value: healthyStock, color: '#10b981' },
      { name: 'Low Stock (<10)', value: lowStock, color: '#f59e0b' },
      { name: 'Out of Stock', value: outOfStock, color: '#ef4444' }
    ].filter(item => item.value > 0);
  };

  const salesData = getSalesTrendData();
  const inventoryData = getInventoryData();
  const stockStatusData = getStockStatusData();

  const StatCard = ({ title, value, icon: Icon, colorClass, desc, linkTo }: any) => (
    <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-800/80 hover:border-indigo-500/30 hover:shadow-indigo-500/5 transition-all relative overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-5 group-hover:scale-110 transition-transform ${colorClass.split(' ')[0]}`}></div>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-gray-800 border border-gray-700/50 text-gray-100`}>
          <Icon size={22} className={colorClass} />
        </div>
        {linkTo && (
          <Link href={linkTo} className="text-gray-500 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
            <ArrowUpRight size={18} />
          </Link>
        )}
      </div>
      <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-100 mb-1">{loading ? '...' : value}</p>
      <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">{desc}</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-100 to-indigo-400 flex items-center gap-2">
            <TrendingUp className="text-indigo-400" /> Business Overview
          </h1>
          <p className="text-gray-400 text-sm mt-1">Real-time enterprise dashboard & stock metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl flex items-center gap-2 text-xs font-medium text-gray-400">
            <Clock size={14} className="text-indigo-400" />
            <span>Updated Just Now</span>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={DollarSign} 
          colorClass="text-emerald-400" 
          desc="Cumulative sales volume"
          linkTo="/orders"
        />
        <StatCard 
          title="Inventory Value" 
          value={formatCurrency(stats.inventoryValue)} 
          icon={Layers} 
          colorClass="text-indigo-400" 
          desc="Assets at retail price"
          linkTo="/products"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders} 
          icon={ShoppingCart} 
          colorClass="text-blue-400" 
          desc="Successful client bookings"
          linkTo="/orders"
        />
        <StatCard 
          title="Low Stock items" 
          value={stats.lowStock} 
          icon={AlertTriangle} 
          colorClass={stats.lowStock > 0 ? "text-rose-400 animate-pulse" : "text-amber-400"} 
          desc={stats.lowStock > 0 ? "Needs immediate reorder" : "All products healthy"}
          linkTo="/products"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Sales Area Chart */}
        <div className="bg-gray-900/40 border border-gray-800/80 p-6 rounded-2xl shadow-xl lg:col-span-2 flex flex-col h-[380px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <Activity size={18} className="text-indigo-400" /> Sales Trend
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Earnings velocity over the last few active days.</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Live Flow
            </span>
          </div>

          <div className="flex-1 w-full text-xs">
            {mounted && salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="date" stroke="#9ca3af" tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} 
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area type="monotone" dataKey="sales" name="Sales ($)" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 font-medium border border-dashed border-gray-800 rounded-xl">
                No orders recorded yet to show sales trend.
              </div>
            )}
          </div>
        </div>

        {/* Stock Status Pie Chart */}
        <div className="bg-gray-900/40 border border-gray-800/80 p-6 rounded-2xl shadow-xl flex flex-col h-[380px]">
          <div>
            <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
              <Layers size={18} className="text-indigo-400" /> Catalog Stock Health
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Summary of product stock ratios.</p>
          </div>

          <div className="flex-1 flex items-center justify-center relative my-2">
            {mounted && stockStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500 text-xs font-medium">No stock records yet.</div>
            )}
            
            {/* Center Summary */}
            {mounted && stockStatusData.length > 0 && (
              <div className="absolute text-center">
                <span className="text-2xl font-black text-gray-100">{stats.products}</span>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">SKUs Total</p>
              </div>
            )}
          </div>

          {/* Custom Legends */}
          <div className="grid grid-cols-3 gap-2 border-t border-gray-800/50 pt-4">
            {stockStatusData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="flex items-center gap-1.5 text-xs text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
                  <span className="font-bold">{item.value}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium truncate w-full mt-0.5">{item.name.split(' ')[0]}</span>
              </div>
            ))}
            {stockStatusData.length === 0 && (
              <div className="col-span-3 text-center text-xs text-gray-500">No items available</div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Grid: Inventory Bar & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Stock Level Bar Chart */}
        <div className="bg-gray-900/40 border border-gray-800/80 p-6 rounded-2xl shadow-xl lg:col-span-2 flex flex-col h-[380px]">
          <div>
            <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
              <Package size={18} className="text-indigo-400" /> Stock Level (Top Catalog Items)
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Quantity of item stock loaded in database.</p>
          </div>

          <div className="flex-1 w-full text-xs mt-6">
            {mounted && inventoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryData} margin={{ top: 0, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#6366f1' }}
                  />
                  <Bar dataKey="Stock" name="Stock Count" fill="#4f46e5" radius={[6, 6, 0, 0]}>
                    {inventoryData.map((entry: any, index: number) => {
                      const color = entry.Stock < 10 ? '#f59e0b' : '#6366f1';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 font-medium border border-dashed border-gray-800 rounded-xl">
                No products found in database.
              </div>
            )}
          </div>
        </div>

        {/* Quick Setup / Help Panel */}
        <div className="bg-gray-900/40 border border-gray-800/80 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
              <Layers size={18} className="text-indigo-400" /> Fast Execution Panel
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Instantly run inventory processes, create fast bookings, or enroll customers directly. The system automatically reduces product quantity and calculates aggregates.
            </p>
            
            <div className="space-y-3.5 pt-2">
              <Link href="/products" className="flex items-center justify-between p-3.5 bg-gray-800/50 hover:bg-indigo-900/20 rounded-xl border border-gray-800 hover:border-indigo-500/20 transition-all group">
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-indigo-400" />
                  <span className="text-xs font-semibold text-gray-200">Catalog Catalog</span>
                </div>
                <ArrowUpRight size={16} className="text-gray-500 group-hover:text-indigo-400 transition-colors" />
              </Link>

              <Link href="/orders" className="flex items-center justify-between p-3.5 bg-gray-800/50 hover:bg-emerald-900/20 rounded-xl border border-gray-800 hover:border-emerald-500/20 transition-all group">
                <div className="flex items-center gap-3">
                  <ShoppingCart size={18} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-gray-200">Book Client Order</span>
                </div>
                <ArrowUpRight size={16} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
              </Link>

              <Link href="/customers" className="flex items-center justify-between p-3.5 bg-gray-800/50 hover:bg-blue-900/20 rounded-xl border border-gray-800 hover:border-blue-500/20 transition-all group">
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-blue-400" />
                  <span className="text-xs font-semibold text-gray-200">Enroll Customer</span>
                </div>
                <ArrowUpRight size={16} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
              </Link>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-800/60 pt-4 flex items-center justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Operational Health</span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block"></span>
              Secure Database Link
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Table: Recent Orders */}
      <div className="bg-gray-900/40 border border-gray-800/80 p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
              <ShoppingCart size={18} className="text-indigo-400" /> Recent Bookings
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Most recent business transaction orders.</p>
          </div>
          <Link href="/orders" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
            View All Orders
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900 text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-850">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="th p-4">Total Amount</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500 font-medium">
                    Loading recent orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500 font-medium">
                    No orders registered in database.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((o: any) => (
                  <tr key={o.id} className="hover:bg-gray-850/30 transition-colors">
                    <td className="p-4 font-bold text-gray-200">#{o.id}</td>
                    <td className="p-4 text-gray-300">
                      {o.customers?.full_name || `Customer ID #${o.customer_id}`}
                    </td>
                    <td className="p-4 font-bold text-emerald-400">
                      {formatCurrency(o.total_amount)}
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(o.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
