"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  ChevronLeft, ChevronRight, Menu, Rocket, ShieldCheck, Cpu
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

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
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-8 right-8 z-50 p-5 bg-indigo-600 text-white rounded-[2rem] shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-90 transition-all border border-white/20 animate-in fade-in zoom-in duration-500"
      >
        <Menu size={24} />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-[70] lg:relative lg:z-0
          ${collapsed ? 'w-[100px]' : 'w-80'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-surface border-r border-border flex flex-col h-full shadow-lg transition-all duration-300
        `}
      >
        <div className={`flex items-center h-28 px-8 border-b border-border ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-4 animate-in slide-in-from-left-4 duration-1000">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary rounded-2xl rotate-6 animate-pulse opacity-20"></div>
              <div className="relative w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10 group-hover:rotate-0 transition-transform duration-500">
                <Rocket size={22} className="text-white" />
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-black text-foreground tracking-tighter uppercase leading-none italic">
                  ETHARA <span className="text-primary">AI</span>
                </span>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mt-2">Neural Hub V2</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2.5 rounded-xl hover:bg-background text-gray-500 hover:text-foreground transition-all border border-transparent hover:border-border"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

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
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                    : 'text-gray-500 hover:bg-background hover:text-foreground border border-transparent'
                  }
                  ${collapsed ? 'justify-center px-0' : ''}
                `}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-full ${active ? '' : 'group-hover:animate-shimmer'}`}></div>
                <Icon size={22} className={`flex-shrink-0 transition-all duration-500 ${active ? 'text-primary scale-110' : 'text-gray-400 group-hover:text-foreground group-hover:scale-110 group-hover:rotate-3'}`} />
                {!collapsed && <span className="relative z-10">{label}</span>}
                {!collapsed && active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-sm animate-pulse" />
                )}
                {collapsed && active && (
                   <div className="absolute right-0 w-1.5 h-8 bg-primary rounded-l-full shadow-sm" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-border space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {!collapsed ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-background p-4 rounded-[2rem] border border-border group hover:bg-background/80 transition-all cursor-default">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20 group-hover:rotate-12 transition-transform">
                   <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">System Protocol</p>
                  <p className="text-[10px] text-emerald-600 font-black italic mt-1">OPTIMAL_LINK</p>
                </div>
              </div>
              <div className="px-2">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] leading-loose">
                  Engineered by <span className="text-primary group-hover:text-blue-600 transition-colors">Harshank</span><br/>
                  <span className="text-gray-400">Neural Enterprise UI</span>
                </p>
                <div className="mt-4">
                  <div className="bg-background rounded-2xl p-1 border border-border">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center group">
               <Cpu size={24} className="text-primary/30 group-hover:text-primary group-hover:rotate-90 transition-all duration-700" />
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
