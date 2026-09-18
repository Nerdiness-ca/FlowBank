"use client";

import { format } from "date-fns";
import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";

// form
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// icons
import { Save } from "lucide-react";

// query
import { useMutation, useQuery } from "@tanstack/react-query";

// components
import { Loading } from "@/components/Loader";
import { Paginate } from "@/components/Paginate";
import { StatementPDF } from "@/components/StatementPDF";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

// utils
import { formatCurrency } from "@/utils/formatNumber";

// store
import { appStore } from "@/store";

// services
import { getAccountHistory, ReturnAcctDetails2 } from "@/services/apiAuth";

export default function CRListing() {
  const { userData } = appStore();
  const [accountHistory, setAccountHistory] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  const { data: accountData, isLoading } = useQuery({
    queryKey: ["my-accounts"],
    queryFn: async () => {
      if (!userData?.userRec || !userData?.acctCollection?.length) {
        return { success: false, data: [] };
      }

      const userRec = {
        accCode: (userData.userRec as any).accCode || userData.userRec.pAcessCode || "",
        puserName: (userData.userRec as any).puserName || userData.userRec.pUserName || "",
      };

      const accountPromises = userData.acctCollection.map(
        async (account: any) => {
          const payload = [
            {
              customerId: account.customerID,
              accountNumber: account.accountNumber,
            },
          ];
          const response = await ReturnAcctDetails2(userRec, payload);
          return response;
        }
      );

      const responses = await Promise.all(accountPromises);

      const accounts = responses.flatMap((response, index) => {
        if (response.success && response.data) {
          return response.data.map((account: any) => ({
            accountNumber: account.accountNumber,
            accountName: account.description,
            availBal: account.availBal,
            namCurrency: account.currency,
            codAcctType: account.type === "Current" ? "CK" : "SV",
            CustomerID: userData.acctCollection[index].CustomerID,
          }));
        }
        console.error(
          `Failed to fetch details for account ${userData.acctCollection[index].accountNumber}:`,
          response.errorMessage
        );
        return [userData.acctCollection[index]];
      });

      return { success: true, data: accounts };
    },
    enabled: !!userData?.userRec && !!userData?.acctCollection?.length,
  });

  const accounts = accountData?.success
    ? accountData.data
    : userData?.acctCollection || [];

  const crListingSchema = z.object({
    accountNumber: z.string().min(1, "Please enter your account"),
    startDate: z.string({
      required_error: "Please enter the start date",
    }),
    endDate: z.string({
      required_error: "Please enter the end date",
    }),
  });

  const defaultValues = {
    accountNumber: "",
    startDate: "",
    endDate: "",
  };

  const methods = useForm({
    defaultValues,
    resolver: zodResolver(crListingSchema),
    mode: "onChange",
  });

  const { handleSubmit, control } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) =>
      getAccountHistory(data.accountNumber, data.startDate, data.endDate),
    onSuccess: (res: any) => {
      console.log("STATEMENT!", res);
      setError(""); // Clear any previous errors

      // Check if the response was successful
      if (res.success && res.data) {
        if (res.data.length === 0) {
          setError("No transactions found for the selected date range.");
          setAccountHistory([]);
          setItems([]);
          return;
        }

        const creditData = res.data.filter(
          (data: any) => data.COD_DRCR === "CR"
        );

        if (creditData.length === 0) {
          setError("No credit transactions found for the selected date range.");
          setAccountHistory([]);
          setItems([]);
          return;
        }

        setAccountHistory(creditData);
        setItems(creditData.slice(0, 10));
      } else {
        // Handle error case
        console.error("Failed to fetch account history:", res.errorMessage);
        setError(
          res.errorMessage ||
            "Failed to fetch account history. Please try again."
        );
        setAccountHistory([]);
        setItems([]);
      }
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      setError(
        "An error occurred while fetching account history. Please try again."
      );
      setAccountHistory([]);
      setItems([]);
    },
  });

  const handlePageChange = (page: number) => {
    const offset = (page - 1) * 10;
    const newItems = accountHistory?.slice(offset, offset + 10);
    setItems(newItems);
  };

  const onSubmit = async (data: z.infer<typeof crListingSchema>) => {
    const formattedData = {
      ...data,
      startDate: format(new Date(data.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(data.endDate), "yyyy-MM-dd"),
    };
    mutate(formattedData);
  };

  if (isLoading) return <Loading />;

  return (
    <main className="h-full w-full flex flex-col gap-6">
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="w-full shadow-sm border-border">
          <CardHeader className="bg-muted/30 border-b pb-6">
            <CardTitle className="text-2xl">CR Listing</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {accountHistory.length === 0 && (
              <Form {...methods}>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source Account</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-12 bg-background">
                                <SelectValue placeholder="Select Source Account" />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts?.map((account: any, index: number) => (
                                  <SelectItem key={index} value={account.accountNumber}>
                                    <div className="flex justify-between items-center w-full min-w-[200px]">
                                      <span>{account.accountNumber}</span>
                                      <span className="font-semibold text-primary ml-4">
                                        {formatCurrency(Number(account.availBal) || 0)}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <DatePicker 
                              value={field.value} 
                              onChange={field.onChange} 
                              placeholder="Enter start date" 
                              className="h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <DatePicker 
                              value={field.value} 
                              onChange={field.onChange} 
                              placeholder="Enter end date" 
                              className="h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" className="w-40 font-semibold h-12" size="lg" disabled={isPending}>
                      {isPending ? "Loading..." : "Generate"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>

      {accountHistory.length > 0 && (
        <div className="w-full text-center mb-4">
          <Card>
            <CardHeader>
              <CardTitle>Statement Details</CardTitle>
              {/* <PDFDownloadLink
                document={<StatementPDF accountHistory={accountHistory} />}
                fileName={`Statement ${accountHistory[0].COD_ACCT_NO}.pdf`}
                className="w-36"
              >
                <Button className="flex gap-2 items-center font-bold w-full">
                  Download
                  <Save className="h-4 w-4" />
                </Button>
              </PDFDownloadLink> */}
            </CardHeader>
            <CardContent>
              <Separator className="my-4" />
              <div className="w-full flex justify-between my-6">
                <div className="flex flex-col items-start">
                  <p>Account No: {accountHistory[0].COD_ACCT_NO}</p>
                  <p>
                    Opening Balance:{" "}
                    {formatCurrency(Number(accountHistory[0].OPENING_BAL) || 0)}
                  </p>
                  <p>
                    Available Balance:{" "}
                    {formatCurrency(Number(accountHistory[0].CLOSING_BAL) || 0)}
                  </p>
                  <p>Account Type: {accountHistory[0].NAM_PRODUCT}</p>
                  <p>
                    Statement Period: {accountHistory[0].pSTART_DATE} -{" "}
                    {accountHistory[0].END_DATE}
                  </p>
                  <p>Total Transactions: {accountHistory.length}</p>
                </div>
                <div className="flex flex-col items-end">
                  <p>{accountHistory[0].NAM_CUST_FULL}</p>
                  <p>{accountHistory[0].address}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <Table>
                <TableHeader className="bg-background">
                  <TableRow>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Transaction Date</TableHead>
                    <TableHead>Credit Amount</TableHead>
                    <TableHead>Narration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-left">
                  {items.map((account: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{account.COD_ACCT_NO}</TableCell>
                      <TableCell>{account.DAT_TXN}</TableCell>
                      <TableCell>
                        {formatCurrency(Number(account.AMT_TXN) || 0)}
                      </TableCell>
                      <TableCell>{account.TXT_TXN_DESC}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <div className="float-right my-3">
            <Paginate
              totalItems={accountHistory?.length}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </main>
  );
}
