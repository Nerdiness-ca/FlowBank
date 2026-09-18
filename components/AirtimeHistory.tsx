"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/utils/formatNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, Phone } from "lucide-react";

interface AirtimeHistoryItem {
  id: string;
  date: string;
  type: "Airtime" | "Data";
  network: string;
  phoneNumber: string;
  amount: number;
  status: "Successful" | "Failed" | "Pending";
  reference: string;
}

const mockHistory: AirtimeHistoryItem[] = [
  {
    id: "1",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    type: "Airtime",
    network: "MTN",
    phoneNumber: "08012345678",
    amount: 1000,
    status: "Successful",
    reference: "MOCK-AIR-001",
  },
  {
    id: "2",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    type: "Data",
    network: "Airtel",
    phoneNumber: "09087654321",
    amount: 5000,
    status: "Successful",
    reference: "MOCK-DAT-002",
  },
  {
    id: "3",
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    type: "Airtime",
    network: "Glo",
    phoneNumber: "07011223344",
    amount: 500,
    status: "Successful",
    reference: "MOCK-AIR-003",
  },
  {
    id: "4",
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    type: "Data",
    network: "9Mobile",
    phoneNumber: "08199887766",
    amount: 2000,
    status: "Failed",
    reference: "MOCK-DAT-004",
  },
];

const AirtimeHistory = () => {
  const sortedHistory = useMemo(() => {
    return [...mockHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, []);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="w-full max-w-4xl shadow-sm border-border">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <CardTitle className="text-xl">Purchase History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Service</th>
                  <th className="px-6 py-4 font-semibold">Recipient</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sortedHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {new Date(item.date).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.type === "Airtime" ? (
                          <Phone className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Wifi className="w-4 h-4 text-emerald-500" />
                        )}
                        <span className="font-medium">{item.network} {item.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-muted-foreground">
                      {item.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-foreground">
                      ₦{formatCurrency(item.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${
                          item.status === "Successful"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : item.status === "Failed"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {sortedHistory.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No purchase history found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AirtimeHistory;
