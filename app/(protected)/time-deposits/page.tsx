import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

import Link from "next/link";

export default function TimeDepositsPage() {
  return (
    <main className="h-full w-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Time Deposits</h2>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
          <Link href="/time-deposits/create">Open New Deposit</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Deposits
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently running deposits
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>My Time Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No active time deposits found</p>
            <p className="text-sm">You currently do not have any active time deposits.</p>
            
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
