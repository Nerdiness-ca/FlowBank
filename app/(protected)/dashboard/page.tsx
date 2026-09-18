"use client";

import { useEffect, useState } from "react";
import { appStore } from "@/store";
import { ReturnAcctDetails2 } from "@/services/apiAuth";
import { useTenant } from "@/components/providers/TenantProvider";

// Components
import { HomeTab } from "@/components/dashboard/HomeTab";
import { RecentTransfersTab } from "@/components/dashboard/RecentTransfersTab";
import Link from 'next/link';

// Static fallback accounts shown when the API returns nothing
const FALLBACK_ACCOUNTS = [
  {
    accountNumber: "0021582319",
    accountName: "Demo User",
    availBal: 1254300.5,
    namCurrency: "NGN",
    codAcctType: "SV",
  },
  {
    accountNumber: "0031094782",
    accountName: "Demo User",
    availBal: 380000.0,
    namCurrency: "NGN",
    codAcctType: "CK",
  },
];

export default function Dashboard() {
  const { userData } = appStore();
  const tenant = useTenant();

  const [activeTab, setActiveTab] = useState<"home" | "transfers">("home");

  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatedAccounts, setUpdatedAccounts] = useState<any[]>([]);
  const [showBalance, setShowBalance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAccounts = async () => {
    if (!userData?.userRec || !userData?.acctCollection?.length) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const userRec = {
        accCode: (userData.userRec as any).accCode || userData.userRec.pAcessCode || "",
        puserName: (userData.userRec as any).puserName || userData.userRec.pUserName || "",
      };
      const responses = await Promise.all(
        userData.acctCollection.map(async (account: any) =>
          ReturnAcctDetails2(userRec, [{ customerID: account.customerID, accountNumber: account.accountNumber }])
        )
      );
      const newAccounts = responses.flatMap((response, index) => {
        if (response.success && response.data) {
          return response.data.map((account: any) => ({
            accountNumber: account.accountNumber,
            accountName: account.description,
            availBal: account.availBal,
            namCurrency: account.currency || "NGN",
            codAcctType: account.type === "Current" ? "CK" : "SV",
            CustomerID: userData.acctCollection[index].customerID,
          }));
        }
        return [userData.acctCollection[index]];
      });
      setUpdatedAccounts(newAccounts);
      if (newAccounts.length > 0) setSelectedAccount(newAccounts[0]);
    } catch {
      // silently fall through to fallback
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, [userData]);

  const handleRefresh = () => { setRefreshing(true); fetchAccounts(); };

  // Use fetched accounts, then user's raw collection, then static fallback
  const accountsToDisplay =
    updatedAccounts.length ? updatedAccounts :
    userData?.acctCollection?.length ? userData.acctCollection :
    FALLBACK_ACCOUNTS;

  const activeAcct = selectedAccount || accountsToDisplay[0];

  return (
    <div className="space-y-5 pb-8">
      {/* ── TOP NAV TABS ── */}
      <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto hide-scrollbar pb-px">
        <div className="flex gap-6 text-sm font-semibold text-slate-400 whitespace-nowrap">
          <button
            onClick={() => setActiveTab("home")}
            className={`pb-3 -mb-px transition-colors ${
              activeTab === "home" 
                ? "text-primary border-b-2 border-primary" 
                : "hover:text-slate-700"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab("transfers")}
            className={`pb-3 -mb-px transition-colors ${
              activeTab === "transfers" 
                ? "text-primary border-b-2 border-primary" 
                : "hover:text-slate-700"
            }`}
          >
            Recent Transactions
          </button>
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === "home" && (
        <HomeTab
          tenant={tenant}
          userData={userData}
          accountsToDisplay={accountsToDisplay}
          activeAcct={activeAcct}
          isLoading={isLoading}
          showBalance={showBalance}
          setShowBalance={setShowBalance}
          handleRefresh={handleRefresh}
          refreshing={refreshing}
          setSelectedAccount={setSelectedAccount}
        />
      )}
      
      {activeTab === "transfers" && (
        <RecentTransfersTab />
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}