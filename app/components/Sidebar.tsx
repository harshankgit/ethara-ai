"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  ChevronLeft, ChevronRight, TrendingUp, Menu
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${collapsed ? 'w-[68px]' : 'w-60'} bg-gray-900 border-r border-gray-800/80 flex flex-col h-full shadow-xl transition-all duration-300 ease-in-out flex-shrink-0`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-gray-800/80 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={15} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white whitespace-nowrap">
              Inventory<span className="text-indigo-400">Pro</span>
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <TrendingUp size={15} className="text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors flex-shrink-0 ${collapsed ? 'hidden' : ''}`}
          title="Collapse sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-3 p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-2 pt-4 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group
                ${active
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-transparent'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon size={19} className={`flex-shrink-0 ${active ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-gray-800/80 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">System Online</span>
          </div>
          <div className="pt-1">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
              Created by <span className="text-indigo-400">Harshank</span><br/>
              for <span className="text-gray-400">Inventory Demo</span>
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
