"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useTenant, useTenantLoading } from '@/components/providers/TenantProvider';
import { sidebarRoutes, Route } from '@/utils/routes';
import { ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const tenant = useTenant();
  const isLoading = useTenantLoading();

  // Recursive function to trace the route hierarchy and collect all feature keys
  const findFeatureKeys = (routes: Route[], path: string, currentKeys: string[] = []): string[] | null => {
    for (const route of routes) {
      const keys = route.featureKey ? [...currentKeys, route.featureKey] : currentKeys;
      
      if (route.pathname === path) return keys;
      
      if (route.children) {
        const found = findFeatureKeys(route.children, path, keys);
        if (found) return found;
      }
    }
    return null;
  };

  const featureKeys = findFeatureKeys(sidebarRoutes, pathname);

  // Only block the UI with a spinner if this route actually requires feature validation
  if (featureKeys && featureKeys.length > 0 && isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }



  if (featureKeys) {
    // If ANY feature key in the parent/child chain is disabled, block access.
    // E.g. if 'statements' (parent) is false, accessing /statements/cr-listing is blocked
    // even if 'statementCr' (child) is somehow true.
    const isBlocked = featureKeys.some(key => !(tenant?.features?.[key] ?? false));
    
    if (isBlocked) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center h-full text-center p-8 bg-card rounded-3xl border border-border shadow-sm m-2 md:m-0">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-3 text-foreground">Feature Disabled</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            This module has been disabled or is not supported by your current banking provider's configuration.
          </p>
          <Button asChild className="rounded-xl px-8">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      );
    }
  }

  return <>{children}</>;
}
