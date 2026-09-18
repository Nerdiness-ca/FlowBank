"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import Image from "next/image";
import { formatCurrency } from "@/utils/formatNumber";

import {
  Eye, EyeOff, Send, FileText, Smartphone,
  ChevronRight, Landmark, RefreshCw,
  Zap, Briefcase, Sliders, CreditCard, ChevronLeft,
  Wifi, PiggyBank
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeatureGuard } from "@/components/guards/FeatureGuard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const quickActions = [
  { label: "Transfer",  href: "/transfers/other-banks-transfers",                        icon: Send,       color: "bg-primary/10 text-primary", featureKey: "transfers" },
  { label: "Airtime",   href: "/airtime-data",                     icon: Smartphone, color: "bg-orange-50 text-orange-600", featureKey: "airtimeData" },
  { label: "Data",      href: "/airtime-data",                     icon: Wifi,       color: "bg-sky-50 text-sky-600", featureKey: "airtimeData" },
  { label: "Statement", href: "/statements",                       icon: FileText,   color: "bg-emerald-50 text-emerald-600", featureKey: "statements" },
  { label: "Loans",     href: "/loans",                            icon: Landmark,   color: "bg-purple-50 text-purple-600", featureKey: "loans" },
  { label: "Deposits",  href: "/time-deposits",                    icon: PiggyBank,  color: "bg-yellow-50 text-yellow-600", featureKey: "timeDeposits" },
  { label: "Cheque Bk", href: "/customers-requests/cheque-book",   icon: Briefcase,  color: "bg-indigo-50 text-indigo-600", featureKey: "reqChequeBook" },
  { label: "Profile",   href: "/profile",                          icon: Sliders,    color: "bg-pink-50 text-pink-600", featureKey: "profile" },
];

export const HomeTab = ({
  tenant,
  userData,
  accountsToDisplay,
  activeAcct,
  isLoading,
  showBalance,
  setShowBalance,
  handleRefresh,
  refreshing,
  setSelectedAccount
}: any) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<any>(null);

  // Auto-advance image slider
  useEffect(() => {
    if (!carouselApi || !tenant.advert?.images?.length) return;
    const interval = setInterval(() => carouselApi.scrollNext(), 4000);
    return () => clearInterval(interval);
  }, [carouselApi, tenant.advert?.images?.length]);

  useEffect(() => {
    if (!carouselApi) return;
    carouselApi.on("select", () => setActiveSlide(carouselApi.selectedScrollSnap()));
  }, [carouselApi]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* ── LEFT COLUMN ── */}
      <div className="lg:col-span-7 flex flex-col gap-5">

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-[11px] uppercase font-bold tracking-widest text-slate-400 mb-4">Quick Links</p>
          <div className="grid grid-cols-4 gap-y-4">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="w-14 h-14 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))
            ) : quickActions.map((action) => {
              const content = (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${action.color} group-hover:scale-105 transition-transform shadow-sm`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 text-center leading-tight">{action.label}</span>
                </Link>
              );
              if ('featureKey' in action && action.featureKey) {
                return <FeatureGuard key={action.label} featureKey={action.featureKey as any}>{content}</FeatureGuard>;
              }
              return content;
            })}
          </div>
        </div>

        {/* Image Slider (advert.images) */}
        {isLoading ? (
          <Skeleton className="w-full h-52 rounded-2xl" />
        ) : tenant.advert?.images?.length ? (
          <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative">
            <Carousel setApi={setCarouselApi} opts={{ loop: true }} className="w-full">
              <CarouselContent>
                {tenant.advert.images.map((img: string, i: number) => (
                  <CarouselItem key={i} className="relative h-52">
                    <Image src={img} alt={`promo-${i}`} fill className="object-cover" />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {tenant.advert.images.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => carouselApi?.scrollTo(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeSlide ? 'bg-white w-4' : 'bg-white/50'}`}
                />
              ))}
            </div>

            {/* Prev/Next arrows */}
            <button onClick={() => carouselApi?.scrollPrev()} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => carouselApi?.scrollNext()} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : null}

        {/* Advert CTA card (text + button) */}
        {isLoading ? (
          <Skeleton className="w-full h-36 rounded-2xl" />
        ) : tenant.advert ? (
          <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-5 text-primary-foreground relative overflow-hidden shadow-sm">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-primary-foreground/10 rounded-full blur-xl" />
            <h4 className="font-bold text-lg mb-1 relative z-10">{tenant.advert.title}</h4>
            <p className="text-xs text-primary-foreground/70 mb-5 leading-relaxed relative z-10 max-w-xs">{tenant.advert.description}</p>
            <Button asChild variant="outline" className="bg-primary-foreground/10 border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/20 rounded-xl font-bold relative z-10">
              <Link href={tenant.advert.link}>{tenant.advert.buttonText} <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        ) : null}
      </div>

      {/* ── RIGHT COLUMN: Account Card ── */}
      <div className="lg:col-span-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className={`text-slate-400 hover:text-slate-700 transition-colors ${refreshing ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            {/* Account switcher pills */}
            <div className="flex items-center gap-1">
              {accountsToDisplay.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedAccount(accountsToDisplay[i])}
                  className={`w-5 h-2 rounded-full transition-all ${activeAcct === accountsToDisplay[i] ? 'bg-primary w-8' : 'bg-slate-200 hover:bg-slate-300'}`}
                />
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4 flex-1">
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-10 w-3/4 mt-4" />
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : activeAcct ? (
            <>
              {/* Account Name */}
              <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide mb-1">
                {activeAcct.accountName || (userData?.userRec as any)?.pUserName || "Account Holder"}
              </h2>

              {/* Account Number + Type */}
              <p className="text-xs font-mono text-slate-400 mb-6 tracking-widest uppercase">
                {activeAcct.accountNumber} &middot; {activeAcct.codAcctType === "CK" ? "Current" : "Savings"}
              </p>

              {/* Balance */}
              <div className="flex items-center gap-3 mb-2">
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {showBalance ? formatCurrency(Number(activeAcct.availBal) || 0) : "₦ XXX-XXX.XX"}
                </p>
                <button onClick={() => setShowBalance(!showBalance)} className="text-slate-400 hover:text-slate-700 transition-colors mt-1">
                  {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="space-y-0.5 mb-8">
                <p className="text-xs text-slate-400">Available balance</p>
                <p className="text-xs text-slate-400">
                  Effective balance{" "}
                  <span className="font-medium text-slate-500">
                    {showBalance ? formatCurrency(Number(activeAcct.availBal) || 0) : "₦ XXX-XXX.XX"}
                  </span>
                </p>
              </div>

              {/* Account switcher list */}
              <div className="flex-1 space-y-2 mb-6">
                {accountsToDisplay.map((acct: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAccount(acct)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left text-sm transition-all ${
                      activeAcct?.accountNumber === acct.accountNumber
                        ? 'border-primary bg-primary/5 text-primary font-semibold'
                        : 'border-slate-100 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="font-mono text-xs tracking-wider">{acct.accountNumber}</span>
                    <span className="text-xs font-medium">
                      {showBalance ? formatCurrency(Number(acct.availBal) || 0) : "₦ •••••"}
                    </span>
                  </button>
                ))}
              </div>

              <Button asChild className="w-full rounded-xl font-bold h-11 mt-auto">
                <Link href="/statements/full">GET ACCOUNT STATEMENTS</Link>
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
