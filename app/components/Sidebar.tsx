"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  ChevronLeft, ChevronRight, TrendingUp, Menu, X,
  ShieldCheck, Zap, Box, Rocket, Cpu
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Intelligence Core', icon: LayoutDashboard },
  { href: '/products', label: 'Asset Catalog', icon: Package },
  { href: '/customers', label: 'Neural Identity', icon: Users },
  { href: '/orders', label: 'Transaction Hub', icon: ShoppingCart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMobileOpen(false);
  }, [pathname]);

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-8 right-8 z-50 p-5 bg-indigo-600 text-white rounded-[2rem] shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-90 transition-all border border-white/20 animate-in fade-in zoom-in duration-500"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[70] lg:relative lg:z-0
          ${collapsed ? 'w-[100px]' : 'w-80'} 
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-[#020617] border-r border-white/5 flex flex-col h-full shadow-2xl transition-all duration-700 ease-in-out
        `}
      >
        {/* Branding Header */}
        <div className={`flex items-center h-28 px-8 border-b border-white/5 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-4 overflow-hidden animate-in slide-in-from-left-4 duration-1000">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500 rounded-2xl rotate-6 animate-pulse opacity-20"></div>
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-xl border border-white/10 group-hover:rotate-0 transition-transform duration-500">
                <Rocket size={22} className="text-white" />
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-black text-white tracking-tighter uppercase leading-none italic">
                  ETHARA <span className="text-indigo-500">AI</span>
                </span>
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mt-2">Neural Hub V2</span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2.5 rounded-xl hover:bg-white/5 text-gray-600 hover:text-white transition-all border border-transparent hover:border-white/10"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex flex-col gap-3 px-6 pt-12 flex-1 overflow-y-auto custom-scrollbar">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-5 px-5 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.25em] transition-all duration-500 group relative overflow-hidden
                  ${active
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-2xl'
                    : 'text-gray-600 hover:bg-white/[0.03] hover:text-gray-300 border border-transparent'
                  }
                  ${collapsed ? 'justify-center px-0' : ''}
                `}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/5 to-indigo-600/0 -translate-x-full ${active ? '' : 'group-hover:animate-shimmer'}`}></div>
                <Icon size={22} className={`flex-shrink-0 transition-all duration-500 ${active ? 'text-indigo-400 scale-110' : 'text-gray-700 group-hover:text-gray-500 group-hover:scale-110 group-hover:rotate-3'}`} />
                {!collapsed && <span className="relative z-10">{label}</span>}
                {!collapsed && active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] animate-pulse" />
                )}
                {collapsed && active && (
                   <div className="absolute right-0 w-1.5 h-8 bg-indigo-500 rounded-l-full shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Credits & Footer */}
        <div className="p-8 border-t border-white/5 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {!collapsed ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-[2rem] border border-white/5 group hover:bg-white/[0.04] transition-all cursor-default">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:rotate-12 transition-transform">
                   <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">System Protocol</p>
                  <p className="text-[10px] text-emerald-500 font-black italic mt-1">OPTIMAL_LINK</p>
                </div>
              </div>
              <div className="px-2">
                <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.3em] leading-loose">
                  Engineered by <span className="text-indigo-500 group-hover:text-indigo-400 transition-colors">Harshank</span><br/>
                  <span className="text-gray-800">Neural Enterprise UI</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center group">
               <Cpu size={24} className="text-indigo-600/30 group-hover:text-indigo-500 group-hover:rotate-90 transition-all duration-700" />
            </div>
          )}
        </div>
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
    </>
  );
}
