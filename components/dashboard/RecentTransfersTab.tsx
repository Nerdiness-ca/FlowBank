"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Send, Wallet, Smartphone, FileText, TrendingUp, 
  ChevronRight, Search, Filter, Download, ArrowDownLeft, ArrowUpRight
} from "lucide-react";
import { formatCurrency } from "@/utils/formatNumber";

const mockTransactions = [
  { id: 1, title: "Transfer to James Adeyemi", type: "debit", category: "Transfer", amount: 45000, time: "09:14 AM", group: "Today", icon: Send, status: "Successful", ref: "TRF/982374" },
  { id: 2, title: "Salary - RUBICON LTD", type: "credit", category: "Salary", amount: 450000, time: "08:30 AM", group: "Today", icon: Wallet, status: "Successful", ref: "SAL/119302" },
  { id: 3, title: "Airtime - 08033012345", type: "debit", category: "Utility", amount: 2000, time: "06:22 PM", group: "Yesterday", icon: Smartphone, status: "Successful", ref: "UTL/449211" },
  { id: 4, title: "Account Statement Fee", type: "debit", category: "Bank Fee", amount: 50, time: "10:10 AM", group: "Yesterday", icon: FileText, status: "Successful", ref: "FEE/001928" },
  { id: 5, title: "Interest Credit", type: "credit", category: "Interest", amount: 3240, time: "12:00 AM", group: "12 Sep 2026", icon: TrendingUp, status: "Successful", ref: "INT/883719" },
  { id: 6, title: "Netflix Subscription", type: "debit", category: "Entertainment", amount: 4800, time: "02:15 PM", group: "10 Sep 2026", icon: Smartphone, status: "Successful", ref: "SUB/992817" },
];

export const RecentTransfersTab = () => {
  const [filter, setFilter] = useState("All");

  const filteredTransactions = mockTransactions.filter(tx => 
    filter === "All" ? true : filter === "Credit" ? tx.type === "credit" : tx.type === "debit"
  );

  // Group by date
  const grouped = filteredTransactions.reduce((acc: any, tx) => {
    if (!acc[tx.group]) acc[tx.group] = [];
    acc[tx.group].push(tx);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm max-w-5xl">
      
      {/* ── HEADER & TOOLBAR ── */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Transaction History</h3>
          <p className="text-sm text-slate-400 mt-1">View and manage your recent activity</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Quick Filters */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {["All", "Credit", "Debit"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button className="w-9 h-9 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
            <Search className="w-4 h-4" />
          </button>
          
          <button className="w-9 h-9 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── TRANSACTION LIST ── */}
      <div className="p-2 sm:p-4">
        {Object.entries(grouped).length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No transactions found for the selected filter.
          </div>
        ) : (
          Object.entries(grouped).map(([dateGroup, txs]: [string, any]) => (
            <div key={dateGroup} className="mb-6 last:mb-0">
              
              {/* Date Header */}
              <div className="px-4 py-2 flex items-center gap-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{dateGroup}</h4>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              {/* Transactions */}
              <div className="mt-2 space-y-1">
                {txs.map((tx: any) => (
                  <div 
                    key={tx.id} 
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer"
                  >
                    
                    {/* Left: Icon & Details */}
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                          tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          <tx.icon className="w-5 h-5" />
                        </div>
                        {/* Tiny direction indicator overlay */}
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${
                          tx.type === 'credit' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}>
                          {tx.type === 'credit' 
                            ? <ArrowDownLeft className="w-3 h-3 text-white" /> 
                            : <ArrowUpRight className="w-3 h-3 text-white" />
                          }
                        </div>
                      </div>

                      {/* Text */}
                      <div>
                        <p className="text-sm font-bold text-slate-800 mb-0.5">{tx.title}</p>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                          <span>{tx.time}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>{tx.category}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="font-mono text-slate-500">{tx.ref}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Status */}
                    <div className="mt-3 sm:mt-0 flex sm:flex-col items-center sm:items-end justify-between pl-16 sm:pl-0">
                      <p className={`text-base font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{tx.status}</span>
                      </div>
                    </div>
                    
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* ── FOOTER LINK ── */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
        <Link href="/transfers/history" className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1">
          View Detailed Statement <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

    </div>
  );
};
