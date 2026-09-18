"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { BookText } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Loading } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { appStore } from "@/store";
import { formatCurrency } from "@/utils/formatNumber";
import { saveMessageDetails, ReturnAcctDetails2 } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const chequeBookSchema = z.object({
  messageTypeId: z.string().min(1, "Please enter your message type id"),
  messageDate: z.string().min(1, "Please enter your message date"),
  messageStatus: z.string().min(1, "Please enter your message status"),
  messageSenderName: z.string().min(1, "Please enter your message sender name"),
  messageSenderEmail: z.string().min(1, "Please enter your message sender email"),
  messageSenderPhone: z.number().min(1, "Please enter your message sender phone"),
  messageSenderCustId: z.number().min(1, "Please enter your message sender cust id"),
  account: z.string().min(1, "Please enter your source account"),
  leaves: z.string().min(1, "Please enter your leaves"),
  deliveryOption: z.string().min(1, "Please enter your delivery option"),
});

type ChequeBookFormValues = z.infer<typeof chequeBookSchema>;

export default function ChequeBook() {
  const { userData } = appStore();
  const { toast } = useToast();
  const [sessionID, setSessionID] = useState(null);

  useEffect(() => {
    async function fetchSessionID() {
      const res = await fetch("/api/getSessionId");
      if (res.ok) {
        const data = await res.json();
        setSessionID(data.sessionID);
      }
    }
    fetchSessionID();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["my-accounts"],
    queryFn: () => ReturnAcctDetails2(2, userData?.userRec, userData?.acctCollection?.AcctStruct),
    enabled: !!userData?.acctCollection?.AcctStruct,
  });

  const accounts = userData?.acctCollection || [];

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => saveMessageDetails(data),
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "Your cheque book request has been received.",
      });
    },
  });

  const methods = useForm<ChequeBookFormValues>({
    defaultValues: {
      messageTypeId: "",
      messageDate: "",
      messageStatus: "",
      messageSenderName: "",
      messageSenderEmail: "",
      messageSenderPhone: 0,
      messageSenderCustId: 0,
      account: "",
      leaves: "",
      deliveryOption: "",
    },
    resolver: zodResolver(chequeBookSchema),
  });

  const { handleSubmit, setValue } = methods;

  useEffect(() => {
    if (data?.data && sessionID && userData?.acctCollection?.AcctStruct) {
      setValue("messageTypeId", `ChequeRequest|${sessionID}`);
      setValue("messageDate", format(new Date(), "dd-MM-yyyy"));
      setValue("messageStatus", "Pending");
      setValue("messageSenderName", userData.acctCollection.AcctStruct[1].cod_acct_title as string);
      setValue("messageSenderEmail", userData.acctCollection.AcctStruct[1].Email as string);
      setValue("messageSenderPhone", userData.acctCollection.AcctStruct[1].Gsm as any);
      setValue("messageSenderCustId", userData.acctCollection.AcctStruct[1].CustomerID as any);
    }
  }, [data, sessionID, userData, setValue]);

  const onSubmit = async (formData: ChequeBookFormValues) => {
    const newData = {
      ...formData,
      messageBody:
        "Cheque Book request from User with Account Number: " +
        formData.account + "|." + "Details are as follows: " +
        "Number of requested leaves is " + formData.leaves + "," +
        "Requested Delivery Option is: " + formData.deliveryOption,
    };
    mutate(newData);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Cheque Book Request</h1>
        <p className="text-muted-foreground">Order a new cheque book for your selected account.</p>
      </div>

      <Card className="border border-border shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="bg-muted/30 border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Request Form</CardTitle>
              <CardDescription>Select delivery options and booklet size.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <Form {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={methods.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Account</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select Source Account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts?.map((account: any, index: number) => (
                            <SelectItem key={index} value={account.accountNumber}>
                              {account.accountNumber} - {formatCurrency(Number(account.availBalance) || 0)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid sm:grid-cols-2 gap-6">
                <FormField
                  control={methods.control}
                  name="leaves"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. of Leaves</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select No. of Leaves" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="25">25 Leaves</SelectItem>
                            <SelectItem value="50">50 Leaves</SelectItem>
                            <SelectItem value="100">100 Leaves</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="deliveryOption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Option</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select Delivery Option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="branch">Pick up at Branch</SelectItem>
                            <SelectItem value="centralLocation">Deliver to Central Location</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button className="w-full sm:w-auto min-w-[200px]" type="submit" disabled={isPending}>
                  {isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
