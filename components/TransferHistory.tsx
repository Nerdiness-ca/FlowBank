"use client";

import { useMemo, useState } from "react";
import { appStore } from "@/store";
import { getTransferHistory } from "@/services/apiAuth";
import { useQueries } from "@tanstack/react-query";
import { formatCurrency } from "@/utils/formatNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loading } from "@/components/Loader";

interface TransferItem {
  valueDate?: number[];
  amount: number;
  originatorAccountNumber?: string;
  originatorAccountName?: string;
  beneficiaryAccountNumber?: string;
  beneficiaryAccountName?: string;
  paymentReference?: string;
  originatorNarration?: string;
  beneficiaryNarration?: string;
  responseCode?: string;
  sourceAccountNumber?: string;
}

const formatValueDate = (valueDate: number[] | undefined) => {
  if (!valueDate || valueDate.length < 6) return "—";

  const [year, month, day, hour, minute, second] = valueDate;

  let date = new Date(year, month - 1, day, hour, minute, second || 0);

  if (isNaN(date.getTime())) {
    return "—";
  }

  const now = new Date();

  // Correct future dates to 2025 (for display)
  if (date > now) {
    date = new Date(2025, month - 1, day, hour, minute, second || 0);
  }

  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// Helper to get corrected timestamp for sorting
const getCorrectedTimestamp = (valueDate?: number[]): number => {
  if (!valueDate || valueDate.length < 6) return 0;

  const [year, month, day, hour, minute, second] = valueDate;
  let date = new Date(year, month - 1, day, hour, minute, second || 0);

  if (isNaN(date.getTime())) return 0;

  const now = new Date();
  if (date > now) {
    date = new Date(2025, month - 1, day, hour, minute, second || 0);
  }

  return date.getTime();
};

const TransferHistory = () => {
  const { userData } = appStore();

  const accounts = userData?.acctCollection || [];
  const accountNumbers = accounts
    .map((acc: any) => acc?.accountNumber)
    .filter(Boolean);

  const queries = useQueries({
    queries: accountNumbers.map((accountNumber: string) => ({
      queryKey: ["transfer-history", accountNumber],
      queryFn: () => getTransferHistory(accountNumber as any),
      enabled: !!accountNumber,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const error = queries.find((q) => q.isError)?.error;

  const [removedRefs, setRemovedRefs] = useState<Set<string>>(new Set());

  const allTransfers = useMemo(() => {
    const combined: TransferItem[] = [
      {
        valueDate: [2026, 9, 18, 10, 30, 0],
        amount: 50000,
        originatorAccountNumber: "0021582319",
        originatorAccountName: "Demo User",
        beneficiaryAccountNumber: "1234567890",
        beneficiaryAccountName: "John Doe",
        paymentReference: "MOCK-REF-1",
        originatorNarration: "Rent Payment",
        responseCode: "Posted",
        sourceAccountNumber: "0021582319"
      },
      {
        valueDate: [2026, 9, 15, 14, 45, 0],
        amount: 15000,
        originatorAccountNumber: "0021582319",
        originatorAccountName: "Demo User",
        beneficiaryAccountNumber: "9876543210",
        beneficiaryAccountName: "Jane Smith",
        paymentReference: "MOCK-REF-2",
        originatorNarration: "Dinner refund",
        responseCode: "Posted",
        sourceAccountNumber: "0021582319"
      },
      {
        valueDate: [2026, 9, 10, 9, 0, 0],
        amount: 100000,
        originatorAccountNumber: "0021582319",
        originatorAccountName: "Demo User",
        beneficiaryAccountNumber: "0000111122",
        beneficiaryAccountName: "University of Tech",
        paymentReference: "MOCK-REF-3",
        originatorNarration: "Tuition",
        responseCode: "Failed",
        sourceAccountNumber: "0021582319"
      }
    ];

    queries.forEach((query, index) => {
      if (query.isSuccess && (query.data as any)?.data) {
        const accountNumber = accountNumbers[index];
        const transfers = (query.data as any).data;

        if (Array.isArray(transfers)) {
          const enriched = transfers.map((t: any) => ({
            ...t,
            sourceAccountNumber: accountNumber,
          }));

          combined.push(...enriched);
        }
      }
    });

    // Sort using the CORRECTED date (after applying 2025 fix)
    return combined.sort((a, b) => {
        const timeA = getCorrectedTimestamp(a.valueDate);
        const timeB = getCorrectedTimestamp(b.valueDate);
        return timeB - timeA; // newest first
      });
  }, [queries, accountNumbers]);

  if (isLoading) return <Loading />;

  if (isError) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertDescription>
          Failed to load transfer history: {error?.message || "Unknown error"}
        </AlertDescription>
      </Alert>
    );
  }

  if (allTransfers.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-10 text-foreground">
            Transfer History
          </h2>
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground py-12">
              No transfer history found across all your accounts.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <Card className="border border-border shadow-sm overflow-hidden rounded-2xl">
        <div className="bg-muted/30 border-b border-border px-6 py-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Recent Transfers</h3>
            <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-md border">{allTransfers.length} records found</span>
        </div>
        
        <div className="divide-y divide-border">
          {allTransfers.map((transfer: TransferItem, index: number) => {
              const accountNumber = transfer.sourceAccountNumber || "";
              const isOutgoing = transfer.originatorAccountNumber === accountNumber;
              const isSuccessful = transfer.responseCode === "Posted";
              
              const counterpartyName = isOutgoing ? (transfer.beneficiaryAccountName || "Unknown") : (transfer.originatorAccountName || "Unknown");
              const narration = transfer.originatorNarration || transfer.beneficiaryNarration || "No narration provided";

              return (
              <div 
                  key={transfer.paymentReference || index} 
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-muted/20 transition-colors"
              >
                  <div className="flex items-start gap-4">
                      <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isOutgoing ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {isOutgoing ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
                          ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 17H7V7"/><path d="M17 7 7 17"/></svg>
                          )}
                      </div>
                      
                      <div className="space-y-1">
                          <p className="font-semibold text-foreground">{counterpartyName}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-xs">{narration}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 font-mono">
                              <span>Ref: {transfer.paymentReference || "—"}</span>
                              <span>•</span>
                              <span>{formatValueDate(transfer.valueDate)}</span>
                          </div>
                      </div>
                  </div>

                  <div className="mt-4 sm:mt-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pl-14 sm:pl-0">
                      <span className={`text-lg font-bold tracking-tight ${isOutgoing ? 'text-foreground' : 'text-emerald-600'}`}>
                          {isOutgoing ? "-" : "+"}{formatCurrency(transfer.amount)}
                      </span>
                      
                      <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                          isSuccessful ? 'bg-emerald-100/50 text-emerald-700' : 
                          transfer.responseCode === 'Failed' ? 'bg-red-100/50 text-red-700' : 
                          'bg-amber-100/50 text-amber-700'
                      }`}>
                          {isSuccessful ? "Successful" : transfer.responseCode || "Pending"}
                      </div>
                  </div>
              </div>
              );
          })}
        </div>
      </Card>
    </div>
  );
};

export default TransferHistory;