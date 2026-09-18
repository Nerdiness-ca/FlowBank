'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTenant } from '@/components/providers/TenantProvider';
import { appStore } from '@/store';
import Link from 'next/link';

// icons
import { LogOut, HeadphonesIcon, ChevronRight } from 'lucide-react';

// utils
import { renderRoutes, sidebarRoutes } from '@/utils';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  const pathname = usePathname();
  const { logout, userData } = appStore();
  const tenant = useTenant();

  const [openItems, setOpenItems] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const name = (userData?.userRec as any)?.puserName || userData?.userRec?.pUserName || (userData?.userRec as any)?.name || (userData?.userRec as any)?.userName || "John Doe";
  const initials = name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <nav className={cn(
      "flex flex-col h-full bg-primary text-primary-foreground shadow-2xl transition-all duration-300 relative",
      collapsed ? "w-20" : "w-64"
    )}>

      {/* Collapse Toggle */}
      <button 
        onClick={() => {
          const nextState = !collapsed;
          setCollapsed(nextState);
          if (nextState) {
            setOpenItems([]); // Close all open children menus
          }
        }}
        className="absolute -right-3 top-8 bg-primary text-primary-foreground border border-primary-foreground/20 rounded-full p-1 z-50 hover:bg-primary-foreground/10 shadow-md"
      >
        <ChevronRight className={cn("w-3 h-3 transition-transform", !collapsed && "rotate-180")} />
      </button>

      {/* Brand Header */}
      <div className={cn("py-6 border-b border-primary-foreground/10 flex items-center gap-3", collapsed ? "px-6 justify-center" : "px-6")}>
        {tenant.logo ? (
          <img src={tenant.logo} alt={tenant.name} className="h-8 object-contain flex-shrink-0" />
        ) : (
          <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0">
            {tenant.name?.[0] || 'F'}
          </div>
        )}
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-primary-foreground text-base leading-tight truncate">{tenant.name}</p>
            <p className="text-[11px] text-primary-foreground/50 uppercase tracking-widest truncate">Online Banking</p>
          </div>
        )}
      </div>

      {/* User Badge */}
      <div className={cn("mb-2 rounded-xl transition-all duration-300", collapsed ? "mx-3 mt-5 flex justify-center" : "py-4 mx-4 mt-5 px-5 bg-primary-foreground/5 border border-primary-foreground/10")}>
        {mounted ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-foreground/20 border border-primary-foreground/20 flex items-center justify-center font-bold text-sm flex-shrink-0 text-primary-foreground" title={name}>
              {initials}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-primary-foreground text-sm font-semibold truncate">{name}</p>
                <p className="text-primary-foreground/40 text-[11px] truncate">
                  {userData?.acctCollection?.[0]?.accountNumber || 'Personal Account'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex-shrink-0" />
            {!collapsed && (
              <div className="overflow-hidden space-y-2">
                <div className="h-4 w-24 bg-white/20 rounded" />
                <div className="h-3 w-16 bg-white/10 rounded" />
              </div>
            )}
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-4 mb-2 mt-1">
          <p className="text-[10px] uppercase font-bold tracking-widest text-primary-foreground/30 px-3 py-2">Navigation</p>
        </div>
      )}

      {/* Navigation Links */}
      <div className={cn("flex-1 overflow-y-auto custom-scrollbar", collapsed ? "px-3 mt-4" : "px-2")}>
        {renderRoutes({
          routes: sidebarRoutes,
          level: 0,
          pathname,
          openItems,
          setOpenItems,
          collapsed,
        })}
      </div>

      {/* Logout */}
      <div className={cn("pb-2 border-t border-primary-foreground/10 pt-4", collapsed ? "px-3" : "px-4")}>
        <button
          onClick={logout}
          className={cn("w-full flex items-center rounded-xl text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all group text-sm", collapsed ? "justify-center py-3" : "justify-between px-4 py-3")}
          title="Sign Out"
        >
          <div className={cn("flex items-center gap-3", collapsed && "[&>svg]:w-5 [&>svg]:h-5")}>
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </div>
          {!collapsed && <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </button>
      </div>

      {/* Support */}
      <div className={cn("pb-5", collapsed ? "px-3" : "px-4")}>
        <Link
          href={`mailto:${tenant.contactEmail}`}
          className={cn("flex items-center gap-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-colors", collapsed ? "justify-center py-3 [&>svg]:w-5 [&>svg]:h-5" : "px-4 py-3")}
          title={`Support: ${tenant.contactEmail}`}
        >
          <HeadphonesIcon className="h-4 w-4 text-primary-foreground/70 flex-shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-primary-foreground/90 truncate">Need Support?</p>
              <p className="text-[10px] text-primary-foreground/50 truncate">{tenant.contactEmail}</p>
            </div>
          )}
        </Link>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { 
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(255, 255, 255, 0.2); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4); 
        }
        .custom-scrollbar { 
          scrollbar-width: thin; 
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
      `}</style>
    </nav>
  );
};
