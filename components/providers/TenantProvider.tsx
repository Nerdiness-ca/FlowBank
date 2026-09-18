"use client";

import React, { createContext, useContext } from "react";
import { TenantConfig } from "@/lib/tenants";
import { getCookie, setCookie } from "@/utils/cookies";

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
  const [isLoadingFeatures, setIsLoadingFeatures] = React.useState(!config.features || Object.keys(config.features).length === 0);

  React.useEffect(() => {
    if (config.features && Object.keys(config.features).length > 0) {
      return;
    }

    const loadFeatures = async () => {
      // 1. Check if features are already cached in cookies
      const cachedFeaturesStr = getCookie("flowbank_features");
      if (cachedFeaturesStr) {
        try {
          const cachedFeatures = JSON.parse(cachedFeaturesStr);
          if (Object.keys(cachedFeatures).length > 0 && cachedFeatures.airtimeData !== undefined) {
            setTenantConfig(prev => ({ ...prev, features: cachedFeatures }));
            setIsLoadingFeatures(false);
            return; // Skip network request!
          }
        } catch (e) {
          console.warn("Failed to parse cached features", e);
        }
      }

      // 2. Otherwise, fetch dynamic feature flags from our new API
      try {
        const res = await fetch(`/api/features?tenantId=${config?.id || 'default'}`);
        if (!res.ok) throw new Error("API returned non-200 status");
        
        const features = await res.json();
        setTenantConfig(prev => ({
          ...prev,
          features: features
        }));
        
        // Cache the result in a cookie for 7 days (7 * 24 * 3600 seconds = 604800)
        setCookie("flowbank_features", JSON.stringify(features), 604800);

      } catch (err) {
        console.warn("Failed to fetch features from API, falling back to default.", err);
        // Fallback features to prevent the app from breaking if the API is unreachable
        const fallbackFeatures = {
            "dashboard": true,
            "profile": true,
            "accountInformation": true,
            "myAccounts": true,
            "accountSummary": true,
            "timeDeposits": true,
            "statements": true,
            "statementCr": true,
            "statementDr": true,
            "statementFull": true,
            "transfers": true,
            "transferOtherBanks": true,
            "transferInternal": true,
            "transferHistory": true,
            "airtimeData": true,
            "billPayments": true,
            "billAirtime": true,
            "billData": true,
            "customerRequests": true,
            "reqChequeBook": true,
            "reqStopPayment": true,
            "reqMiscellaneous": true,
            "standingInstructions": true,
            "manageFunds": true,
            "createHolds": true,
            "loans": true
        };
        
        setTenantConfig(prev => ({ ...prev, features: fallbackFeatures }));
        setCookie("flowbank_features", JSON.stringify(fallbackFeatures), 604800);
      } finally {
        setIsLoadingFeatures(false);
      }
    };

    loadFeatures();
  }, [config?.id]);

  return (
    <TenantContext.Provider value={{ config: tenantConfig, isLoadingFeatures }}>
      {children}
    </TenantContext.Provider>
  );
};
