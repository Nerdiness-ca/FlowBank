"use client";

import React, { createContext, useContext } from "react";
import { TenantConfig } from "@/lib/tenants";

type TenantContextType = {
  config: TenantConfig;
  isLoadingFeatures: boolean;
};

const TenantContext = createContext<TenantContextType | null>(null);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context.config;
};

export const useTenantLoading = () => {
  const context = useContext(TenantContext);
  return context?.isLoadingFeatures ?? false;
};

export const TenantProvider = ({
  children,
  config,
}: {
  children: React.ReactNode;
  config: TenantConfig;
}) => {
  const [tenantConfig, setTenantConfig] = React.useState<TenantConfig>(config);
  const [isLoadingFeatures, setIsLoadingFeatures] = React.useState(true);

  React.useEffect(() => {
    // Fetch dynamic feature flags from our new API, passing the tenant ID
    fetch(`/api/features?tenantId=${config.id}`)
      .then(res => res.json())
      .then(features => {
        setTenantConfig(prev => ({
          ...prev,
          features: features
        }));
        setIsLoadingFeatures(false);
      })
      .catch(err => {
        console.error("Failed to load dynamic features", err);
        setIsLoadingFeatures(false);
      });
  }, []);

  return (
    <TenantContext.Provider value={{ config: tenantConfig, isLoadingFeatures }}>
      {children}
    </TenantContext.Provider>
  );
};
