"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";

import { appStore } from "@/store";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatNumber";
import { generateISWPaymentRef } from "@/utils/generateISWpaymentref";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

import {
  getMobileRechargeBillers,
  getBillerPaymentItems,
  BuyAirtimeData,
  getServices,
  validateOtp,
  ReturnAcctDetails2,
} from "@/services/apiAuth";

import AirtimeHistory from "@/components/AirtimeHistory";

// --- SCHEMAS ---
const baseSchema = {
  account: z.string().min(1, "Please select an account"),
  networkProvider: z.string().min(1, "Please select a network"),
  customerMobile: z.string().regex(/^0[789][01]\d{8}$/, "Valid Nigerian mobile number (e.g. 08012345678)"),
};

const airtimeSchema = z.object({
  ...baseSchema,
  amount: z
    .string()
    .min(1, "Amount required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 50, "Minimum ₦50")
    .refine((val) => !isNaN(Number(val)) && Number(val) <= 100000, "Maximum ₦100,000"),
});

const dataSchema = z.object({
  ...baseSchema,
  dataPlan: z.string().min(1, "Please select a data plan"),
});

type AirtimeFormValues = z.infer<typeof airtimeSchema>;
type DataFormValues = z.infer<typeof dataSchema>;

export default function AirtimeAndData() {
  const { toast } = useToast();
  const { userData } = appStore();
  const userName = (userData?.userRec as any)?.puserName || userData?.userRec?.pUserName || "";

  const [activeTab, setActiveTab] = useState<"airtime" | "data" | "history">("airtime");

  // State
  const [nibssServices, setNibssServices] = useState<any[]>([]);
  const [billers, setBillers] = useState<any[]>([]);
  const [loadingBillers, setLoadingBillers] = useState(true);
  
  // Data plans specific
  const [dataPlans, setDataPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Airtime specific items
  const [airtimeItems, setAirtimeItems] = useState<any[]>([]);

  // OTP & Payment State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isValidatingOtp, setIsValidatingOtp] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [pendingTransaction, setPendingTransaction] = useState<any | null>(null);

  // Forms
  const airtimeForm = useForm<AirtimeFormValues>({
    resolver: zodResolver(airtimeSchema),
    defaultValues: { account: "", networkProvider: "", customerMobile: "", amount: "" },
  });

  const dataForm = useForm<DataFormValues>({
    resolver: zodResolver(dataSchema),
    defaultValues: { account: "", networkProvider: "", customerMobile: "", dataPlan: "" },
  });

  const selectedAirtimeProvider = airtimeForm.watch("networkProvider");
  const selectedDataProvider = dataForm.watch("networkProvider");

  // Load Services & Billers
  useEffect(() => {
    const initData = async () => {
      try {
        const [servicesRes, billersRes] = await Promise.all([
          getServices(),
          getMobileRechargeBillers(),
        ]);
        setNibssServices(servicesRes || []);
        
        if (billersRes.ResponseCode === "90000") {
          const rawBillers = billersRes.BillerList.Category[0].Billers || [];
          setBillers(rawBillers);
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to load providers", variant: "destructive" });
      } finally {
        setLoadingBillers(false);
      }
    };
    initData();
  }, [toast]);

  // Derive network lists based on tab
  const getAirtimeBillers = () => {
    const excludeKeywords = ["data", "bundle", "waec", "postpaid", "pin", "voucher"];
    return billers.filter((b) => !excludeKeywords.some((kw) => b.Name.toLowerCase().includes(kw)));
  };

  const getDataBillers = () => {
    return billers.filter((b) => /data|bundle/i.test(b.Name));
  };

  const activeBillers = activeTab === "airtime" ? getAirtimeBillers() : getDataBillers();

  // Network selection UI
  const handleNetworkSelect = (billerId: string) => {
    if (activeTab === "airtime") {
      airtimeForm.setValue("networkProvider", billerId, { shouldValidate: true });
    } else {
      dataForm.setValue("networkProvider", billerId, { shouldValidate: true });
      dataForm.setValue("dataPlan", "", { shouldValidate: true });
    }
  };

  // Fetch Items when provider changes
  useEffect(() => {
    const fetchItemsForAirtime = async () => {
      if (!selectedAirtimeProvider) return;
      try {
        const res = await getBillerPaymentItems(selectedAirtimeProvider);
        if (res.ResponseCode === "90000") setAirtimeItems(res.PaymentItems || []);
      } catch (e) {}
    };
    fetchItemsForAirtime();
  }, [selectedAirtimeProvider]);

  useEffect(() => {
    const fetchPlansForData = async () => {
      if (!selectedDataProvider) {
        setDataPlans([]);
        return;
      }
      setLoadingPlans(true);
      try {
        const res = await getBillerPaymentItems(selectedDataProvider);
        if (res.ResponseCode === "90000") {
          setDataPlans(res.PaymentItems?.filter((item: any) => /data|gb|mb|bundle/i.test(item.Name)) || []);
        }
      } catch (e) {
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlansForData();
  }, [selectedDataProvider]);

  // Fetch Accounts
  const { data: accountData } = useQuery({
    queryKey: ["my-accounts"],
    queryFn: async () => {
      if (!userData?.userRec || !userData?.acctCollection?.length) return { success: false, data: [] };
      const userRec = {
        accCode: (userData.userRec as any).accCode || userData.userRec.pAcessCode || "",
        puserName: userName,
      };
      const accountPromises = userData.acctCollection.map(async (account: any) => 
        ReturnAcctDetails2(userRec, [{ customerId: account.customerID, accountNumber: account.accountNumber }])
      );
      const responses = await Promise.all(accountPromises);
      return { 
        success: true, 
        data: responses.flatMap((r, i) => r.success && r.data ? r.data.map((acct: any) => ({
          accountNumber: acct.accountNumber,
          availBal: acct.availBal,
        })) : [userData.acctCollection[i]])
      };
    },
    enabled: !!userData?.userRec && !!userData?.acctCollection?.length,
  });
  const accounts = accountData?.success ? accountData.data : userData?.acctCollection || [];

  // OTP handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d{6}$/.test(pasted)) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const onAirtimeSubmit = (values: AirtimeFormValues) => {
    const preferredPaymentCode = airtimeItems.find((item: any) => item.Amount === "0" || !item.IsAmountFixed)?.PaymentCode || airtimeItems[0]?.PaymentCode;
    if (!preferredPaymentCode) {
      toast({ title: "Error", description: "No valid airtime options found.", variant: "destructive" });
      return;
    }
    setPendingTransaction({ ...values, paymentCode: preferredPaymentCode, amountKobo: Number(values.amount) * 100, type: "airtime" });
    setShowOtpModal(true);
    setOtp(["", "", "", "", "", ""]);
  };

  const onDataSubmit = (values: DataFormValues) => {
    const selectedPlan = dataPlans.find((p: any) => p.PaymentCode === values.dataPlan);
    if (!selectedPlan) return;
    setPendingTransaction({ ...values, paymentCode: selectedPlan.PaymentCode, amountKobo: Number(selectedPlan.Amount), type: "data" });
    setShowOtpModal(true);
    setOtp(["", "", "", "", "", ""]);
  };

  const handleValidateOtp = async () => {
    const token = otp.join("");
    if (token.length !== 6) return;
    setIsValidatingOtp(true);
    try {
      const otpResponse = await validateOtp({ token, userName });
      if (otpResponse.success || otpResponse.retVal === 0 || otpResponse.retMsg === "Code verified successfully") {
        await processPurchase();
      } else {
        toast({ title: "Invalid Token", description: otpResponse.message || "Incorrect token", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Validation Failed", description: err?.response?.data?.message, variant: "destructive" });
    } finally {
      setIsValidatingOtp(false);
    }
  };

  const processPurchase = async () => {
    if (!pendingTransaction) return;
    setIsProcessingPayment(true);
    try {
      const isData = pendingTransaction.type === "data";
      const service = nibssServices.find((s: any) => s.service_name?.toLowerCase().includes(isData ? "data" : "airtime"));
      if (!service || service.status !== "A") throw new Error("Service is currently unavailable");

      const payload = {
        debitAccountNumber: pendingTransaction.account,
        serviceCode: service.service_code,
        mobileNumber: pendingTransaction.customerMobile,
        paymentCode: pendingTransaction.paymentCode,
        customerId: pendingTransaction.customerMobile,
        customerMobile: pendingTransaction.customerMobile,
        customerEmail: (userData?.userRec as any)?.email || "noemail@gmail.com",
        amount: pendingTransaction.amountKobo,
        requestReference: generateISWPaymentRef(),
        createdAt: new Date().toISOString(),
        status: service.status,
      };

      const response = await BuyAirtimeData(payload);
      if (response.success || response.ResponseCode === "90000" || response.responseCode === "00" || response.status?.toLowerCase() === "success") {
        toast({
          title: "Success!",
          description: isData 
            ? "Data bundle purchased successfully." 
            : `₦${pendingTransaction.amount} airtime sent to ${pendingTransaction.customerMobile}`,
        });
        isData ? dataForm.reset() : airtimeForm.reset();
        setShowOtpModal(false);
      } else {
        throw new Error(response.message || response.responseMessage || "Transaction failed");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Purchase failed", variant: "destructive" });
    } finally {
      setIsProcessingPayment(false);
      setPendingTransaction(null);
    }
  };

  // Helper to map biller names to colored circular icons
  const getNetworkIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("mtn")) return { bg: "bg-[#FFCC00]", text: "text-black", label: "MTN" };
    if (n.includes("airtel")) return { bg: "bg-[#FF0000]", text: "text-white", label: "Airtel" };
    if (n.includes("glo")) return { bg: "bg-[#009900]", text: "text-white", label: "GLO" };
    if (n.includes("9mobile") || n.includes("etisalat")) return { bg: "bg-[#006600]", text: "text-white", label: "9mobile" };
    return { bg: "bg-muted", text: "text-foreground", label: name.slice(0, 3).toUpperCase() };
  };

  return (
    <div className="max-w-5xl w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-foreground tracking-tight">Airtime and Data</h1>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Nav */}
        <Card className="w-full md:w-72 shrink-0 p-3 flex flex-col gap-2 rounded-2xl border bg-card">
          <button 
            onClick={() => { setActiveTab("airtime"); dataForm.reset(); }}
            className={`flex items-center justify-between p-4 rounded-xl text-left font-medium transition-colors ${activeTab === "airtime" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
          >
            Buy Airtime
            {activeTab === "airtime" && <ChevronRight className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => { setActiveTab("data"); airtimeForm.reset(); }}
            className={`flex items-center justify-between p-4 rounded-xl text-left font-medium transition-colors ${activeTab === "data" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
          >
            Buy Data Bundle
            {activeTab === "data" && <ChevronRight className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => { setActiveTab("history"); }}
            className={`flex items-center justify-between p-4 rounded-xl text-left font-medium transition-colors ${activeTab === "history" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
          >
            History
            {activeTab === "history" && <ChevronRight className="w-4 h-4" />}
          </button>
        </Card>

        {/* Right Form Area */}
        {activeTab === "history" ? (
          <AirtimeHistory />
        ) : (
          <Card className="flex-1 rounded-2xl border p-6 md:p-10 shadow-sm bg-card">
            <h2 className="text-xl font-bold mb-1">{activeTab === "airtime" ? "Buy Airtime" : "Buy Data Bundle"}</h2>
            <p className="text-sm text-muted-foreground mb-8">Select network to continue</p>

            <div className="flex flex-wrap gap-6 mb-10">
              {loadingBillers ? (
               <p className="text-sm text-muted-foreground animate-pulse">Loading networks...</p>
            ) : (
              activeBillers.slice(0, 4).map((biller) => {
                const icon = getNetworkIcon(biller.Name);
                const isSelected = activeTab === "airtime" 
                  ? selectedAirtimeProvider === biller.Id.toString()
                  : selectedDataProvider === biller.Id.toString();

                return (
                  <div key={biller.Id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleNetworkSelect(biller.Id.toString())}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-transform ${icon.bg} ${icon.text} ${isSelected ? 'ring-4 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'}`}>
                      {icon.label}
                    </div>
                    <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>{biller.Name.split(' ')[0]}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Form Content */}
          {activeTab === "airtime" ? (
            <Form {...airtimeForm}>
              <form onSubmit={airtimeForm.handleSubmit(onAirtimeSubmit)} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <FormField
                    control={airtimeForm.control}
                    name="account"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-background h-12">
                              <SelectValue placeholder="Select Account to Debit" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts?.map((acct: any) => (
                                <SelectItem key={acct.accountNumber} value={acct.accountNumber}>
                                  {acct.accountNumber} - {formatCurrency(Number(acct.availBal))}
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
                    control={airtimeForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                            <Input className="pl-9 h-12 bg-background" type="number" {...field} placeholder="Enter amount" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={airtimeForm.control}
                  name="customerMobile"
                  render={({ field }) => (
                    <FormItem className="sm:w-[calc(50%-12px)]">
                      <FormControl>
                        <Input className="h-12 bg-background" {...field} placeholder="Phone Number" maxLength={11} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="h-12 px-8 min-w-[140px]" disabled={!selectedAirtimeProvider}>Buy Airtime</Button>
                  <Button type="button" variant="outline" className="h-12 px-8 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600" onClick={() => airtimeForm.reset()}>Cancel</Button>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...dataForm}>
              <form onSubmit={dataForm.handleSubmit(onDataSubmit)} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <FormField
                    control={dataForm.control}
                    name="account"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-background h-12">
                              <SelectValue placeholder="Select Account to Debit" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts?.map((acct: any) => (
                                <SelectItem key={acct.accountNumber} value={acct.accountNumber}>
                                  {acct.accountNumber} - {formatCurrency(Number(acct.availBal))}
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
                    control={dataForm.control}
                    name="dataPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value} disabled={loadingPlans || dataPlans.length === 0}>
                            <SelectTrigger className="bg-background h-12">
                              <SelectValue placeholder={loadingPlans ? "Loading plans..." : dataPlans.length === 0 ? "Select network first" : "Select Data Plan"} />
                            </SelectTrigger>
                            <SelectContent>
                              {dataPlans.map((plan: any) => (
                                <SelectItem key={plan.PaymentCode} value={plan.PaymentCode}>
                                  {plan.Name} • ₦{Number(plan.Amount / 100).toLocaleString()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={dataForm.control}
                  name="customerMobile"
                  render={({ field }) => (
                    <FormItem className="sm:w-[calc(50%-12px)]">
                      <FormControl>
                        <Input className="h-12 bg-background" {...field} placeholder="Phone Number" maxLength={11} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="h-12 px-8 min-w-[140px]" disabled={!selectedDataProvider}>Buy Data Bundle</Button>
                  <Button type="button" variant="outline" className="h-12 px-8 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600" onClick={() => dataForm.reset()}>Cancel</Button>
                </div>
              </form>
            </Form>
          )}

          </Card>
        )}
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-8 rounded-xl shadow-2xl max-w-md w-full">
            <h3 className="text-2xl font-bold text-center mb-3">Enter OTP</h3>
            <p className="text-center text-muted-foreground mb-8">A 6-digit code has been sent to your registered phone</p>
            <div className="flex gap-4 justify-center mb-10">
              {otp.map((digit, i) => (
                <Input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  maxLength={1}
                  className="w-14 h-14 text-2xl font-bold text-center"
                  type="text"
                  inputMode="numeric"
                  disabled={isValidatingOtp || isProcessingPayment}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => setShowOtpModal(false)} disabled={isValidatingOtp || isProcessingPayment}>Cancel</Button>
              <Button onClick={handleValidateOtp} disabled={otp.join("").length !== 6 || isValidatingOtp || isProcessingPayment}>
                {isValidatingOtp ? "Validating..." : isProcessingPayment ? "Processing..." : "Confirm & Buy"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
