"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  ChevronLeft, ChevronRight, TrendingUp, Menu, X,
  ShieldCheck, Zap, Box
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Command Center', icon: LayoutDashboard },
  { href: '/products', label: 'Asset Catalog', icon: Package },
  { href: '/customers', label: 'CRM Identity', icon: Users },
  { href: '/orders', label: 'Order Ledger', icon: ShoppingCart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 text-white rounded-2xl shadow-2xl active:scale-90 transition-all border border-white/20"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[70] lg:relative lg:z-0
          ${collapsed ? 'w-[80px]' : 'w-72'} 
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-gray-950 border-r border-white/5 flex flex-col h-full shadow-2xl transition-all duration-500 ease-in-out
        `}
      >
        {/* Branding Header */}
        <div className={`flex items-center h-24 px-6 border-b border-white/5 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-600/20 border border-white/10">
              <TrendingUp size={20} className="text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-black text-white tracking-tighter uppercase leading-none">
                  Inventory<span className="text-indigo-500">PRO</span>
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Enterprise UI</span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-all border border-transparent hover:border-white/10"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          
          {/* Mobile Close */}
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-2 text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex flex-col gap-2 px-4 pt-8 flex-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-4 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 group relative
                  ${active
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-600/5'
                    : 'text-gray-500 hover:bg-white/5 hover:text-gray-300 border border-transparent'
                  }
                  ${collapsed ? 'justify-center px-0' : ''}
                `}
              >
                <Icon size={20} className={`flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-indigo-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                {!collapsed && <span>{label}</span>}
                {!collapsed && active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}
                {collapsed && active && (
                   <div className="absolute right-0 w-1 h-6 bg-indigo-500 rounded-l-full shadow-lg" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Credits & Footer */}
        <div className="p-6 border-t border-white/5 space-y-6">
          {!collapsed ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                   <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Protocol V2.0</p>
                  <p className="text-[9px] text-emerald-500/60 font-bold">NODE STATUS: OPTIMAL</p>
                </div>
              </div>
              <div className="px-1">
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] leading-relaxed">
                  Developed by <span className="text-indigo-400">Harshank</span><br/>
                  <span className="text-gray-500">Live Demo Environment</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
               <Zap size={20} className="text-indigo-600 opacity-50" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
