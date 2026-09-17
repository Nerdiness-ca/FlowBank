"use client";

import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { formatCurrency } from "@/utils/formatNumber";
import { appStore } from "@/store";
import { ReturnAcctDetails2 } from "@/services/apiAuth";

// Icons
import {
  Eye,
  EyeOff,
  Send,
  CreditCard,
  Smartphone,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Wifi
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/Loader";
import { useTenant } from "@/components/providers/TenantProvider";
import Link from 'next/link'
import { FeatureGuard } from "@/components/guards/FeatureGuard";

export default function Dashboard() {
  const tenant = useTenant();
  const { userData } = appStore();
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAccounts, setUpdatedAccounts] = useState<any[]>([]);

  // UI State
  const [showBalance, setShowBalance] = useState(true);

  // Fetch account details for all accounts on mount
  useEffect(() => {
    const fetchAllAccountDetails = async () => {
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

        const accountPromises = userData.acctCollection.map(async (account: any) => {
          const payload = [{
            customerID: account.customerID,
            accountNumber: account.accountNumber,
          }];
          const response = await ReturnAcctDetails2(userRec, payload);
          return response;
        });

        const responses = await Promise.all(accountPromises);

        const newAccounts = responses.flatMap((response, index) => {
          if (response.success && response.data) {
            return response.data.map((account: any) => ({
              accountNumber: account.accountNumber,
              accountName: account.description,
              availBal: account.availBal,
              namCurrency: account.currency,
              codAcctType: account.type === "Current" ? "CK" : "SV",
              CustomerID: userData.acctCollection[index].customerID,
            }));
          } else {
            return [userData.acctCollection[index]];
          }
        });

        setUpdatedAccounts(newAccounts);

        if (newAccounts.length > 0) {
          setSelectedAccount(newAccounts[0]);
        }
      } catch (err) {
        setError("Something went wrong while fetching account details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllAccountDetails();
  }, [userData]);

  useEffect(() => {
    if (userData?.acctCollection && !selectedAccount && !updatedAccounts.length) {
      setSelectedAccount(userData.acctCollection[0] || null);
    }
  }, [userData, selectedAccount, updatedAccounts]);

  const selectAccountByNumber = (accountNumber: string) => {
    const selected = (updatedAccounts.length ? updatedAccounts : (userData?.acctCollection || [])).find(
      (account: { accountNumber: string }) => account.accountNumber === accountNumber
    );
    setSelectedAccount(selected);
  };

  if (isLoading) return <Loading />;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  const accountsToDisplay = updatedAccounts.length ? updatedAccounts : (userData?.acctCollection || []);
  const advertData = tenant.advert;
  // Calculate total balance across all accounts
  const totalBalance = accountsToDisplay.reduce((acc: number, curr: any) => acc + (Number(curr.availBal) || 0), 0);
  const primaryCurrency = accountsToDisplay[0]?.namCurrency || "NGN";

  // Mock Transactions
  const mockTransactions = [
    { id: 1, title: "Spotify Subscription", type: "debit", amount: 1300.00, date: "Today" },
    { id: 2, title: "Transfer to JOHN DOE", type: "debit", amount: 45000.00, date: "Yesterday" },
    { id: 3, title: "EMTL Charges", type: "debit", amount: 50.00, date: "Yesterday" },
    { id: 4, title: "Transfer to Savings", type: "debit", amount: 5300.00, date: "Oct 12" },
    { id: 5, title: "POS Withdrawal", type: "debit", amount: 2400.50, date: "Oct 10" },
  ];

  return (
    <main className="h-full w-full flex flex-col xl:flex-row gap-8 p-2 md:p-6 lg:p-8">
      
      {/* Left Column - Main Dashboard Area */}
      <div className="flex-1 flex flex-col gap-10">
        
        {/* 1. Greeting & Total Balance Hero */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-card p-8 rounded-3xl border border-border shadow-sm">
          <div>
            <h2 className="text-muted-foreground text-lg mb-1">
              Welcome back, <span className="text-foreground font-semibold">{userData?.acctCollection?.[0]?.accountName || "User"}</span>
            </h2>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {showBalance ? formatCurrency(totalBalance) : "••••••••"}
              </h1>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-muted"
              >
                {showBalance ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Total combined balance in {primaryCurrency}</p>
          </div>
        </section>

        {/* 2. Quick Actions */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href='/statements/full' className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <span className="font-semibold text-sm text-foreground">Statement</span>
            </Link>
            <Link href='/transfers/other-banks-transfers' className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6 text-primary" />
              </div>
              <span className="font-semibold text-sm text-foreground">Transfer</span>
            </Link>
            <Link href='/payments/data' className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <span className="font-semibold text-sm text-foreground">Buy Data</span>
            </Link>
            <FeatureGuard featureKey="loans">
              <Link href='/loans' className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <span className="font-semibold text-sm text-foreground">Loans</span>
              </Link>
            </FeatureGuard>
          </div>
        </section>

        {/* 3. My Accounts (Virtual Cards) */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-bold text-foreground">My Accounts</h3>
            {/* <Link href='/account-information/my-accounts' variant="ghost" className="text-primary hover:bg-primary/10 font-medium hover:text-black">View All</Link> */}
          </div>
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x hide-scrollbar">
            {accountsToDisplay.length === 0 ? (
              <div className="w-full min-h-[200px] bg-card border-2 border-border border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
                <CreditCard className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-lg font-bold text-foreground mb-1">No Account found</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  We couldn't find any active accounts for your profile. Please contact support or wait while your account is being set up.
                </p>
              </div>
            ) : (
              accountsToDisplay.map((account: any, index: number) => {
                const isSelected = selectedAccount?.accountNumber === account.accountNumber;
                return (
                  <div 
                    key={index}
                    onClick={() => selectAccountByNumber(account.accountNumber)}
                    className={`min-w-[320px] h-[200px] rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all snap-center relative overflow-hidden shadow-lg ${
                      isSelected 
                        ? "bg-gradient-to-br from-primary to-accent text-white scale-100 ring-4 ring-primary/20" 
                        : "bg-card border border-border text-foreground scale-95 hover:scale-100 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* Decorative background circle */}
                    <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full mix-blend-overlay opacity-20 ${isSelected ? 'bg-white' : 'bg-primary'}`} />
                    
                    <div className="flex justify-between items-center z-10">
                      <div>
                        <p className={`text-sm font-medium ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {account.codAcctType === "CK" ? "Current Account" : "Savings Account"}
                        </p>
                        <h4 className="font-bold tracking-wider mt-1">{account.accountNumber}</h4>
                      </div>
                      <Wifi className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-muted-foreground'} rotate-90`} />
                    </div>

                    <div className="z-10">
                      <p className={`text-sm mb-1 ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>Available Balance</p>
                      <p className="text-3xl font-extrabold tracking-tight">
                        {showBalance ? formatCurrency(Number(account.availBal) || 0) : "••••••••"}
                      </p>
                      <p className={`text-xs mt-1 font-medium ${isSelected ? 'text-white/60' : 'text-muted-foreground/60'}`}>
                        Total Balance: {showBalance ? formatCurrency(Number(account.totalBal || account.availBal) || 0) : "••••••••"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* 4. Recent Transactions */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-bold text-foreground">Recent Transfers</h3>
            <Link href='/transfers/history' className="text-primary hover:bg-primary/10 font-medium px-4 py-2 rounded-md transition-colors">See Full History</Link>
          </div>
          <Card className="rounded-3xl border-border shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {mockTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-500/10`}>
                      <ArrowUpRight className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors">{tx.title}</p>
                      <p className="text-sm text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'credit' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">{tx.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

      </div>

      {/* Right Column - Sidebar / Promos */}
      <div className="w-full xl:w-[350px] flex flex-col gap-8">
        
        {/* Promotional Banner */}
        {advertData && (
          <>
            <Card className="bg-gradient-to-br from-primary to-accent border-0 shadow-lg rounded-3xl overflow-hidden relative text-white p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10 blur-2xl" ></div>
              <h3 className="text-2xl font-bold mb-3 relative z-10">{advertData.title}</h3>
              <p className="text-white/80 mb-6 relative z-10 text-sm leading-relaxed">
                {advertData.description}
              </p>
              <Button asChild className="w-full bg-white text-primary hover:bg-white/90 rounded-xl font-bold h-12 relative z-10">
                <Link href={advertData.link}>
                  {advertData.buttonText}
                </Link>
              </Button>
            </Card>

            {/* Carousel Banner */}
            <Carousel
              className="w-full rounded-3xl overflow-hidden shadow-sm"
              opts={{ loop: true }}
              plugins={[
                Autoplay({
                  delay: 5000,
                }),
              ]}
            >
              <CarouselContent>
                {advertData.images.map((image, index) => (
                  <CarouselItem className="relative w-full h-[250px]" key={index}>
                    <div className="w-full h-full">
                      <Image
                        src={image}
                        fill
                        alt={`advertisement ${index + 1}`}
                        className="object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </>
        )}
      </div>

      {/* Add some custom styles for hiding scrollbar */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}