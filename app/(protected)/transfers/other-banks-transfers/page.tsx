"use client";

import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loading } from "@/components/Loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";

import { appStore } from "@/store";
import { formatCurrency } from "@/utils/formatNumber";
import {
  ReturnAcctDetails2,
  getNeftBanks,
  returnNameEnquiry,
  fundTransfer,
  validateOtp,
} from "@/services/apiAuth";
import { generateTransactionId } from "@/utils/generateTransactionId";
import { generatePaymentReference } from "@/utils/paymentReference";
import TransactionModal from "@/components/TransactionModal";
import TransferHistory from "@/components/TransferHistory";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Send, ShieldCheck, Landmark } from "lucide-react";

export default function ThirdPartyTransfers() {
  const { toast } = useToast();
  const { userData } = appStore();

  const [activeTab, setActiveTab] = useState("transfer");
  const [step, setStep] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [nameEnquiryResult, setNameEnquiryResult] = useState<any | null>(null);
  const [nameEnquiryError, setNameEnquiryError] = useState<string | null>(null);

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isValidatingOtp, setIsValidatingOtp] = useState(false);
  const [isProcessingTransfer, setIsProcessingTransfer] = useState(false);

  // Store pending transfer payload
  const [pendingTransferPayload, setPendingTransferPayload] =
    useState<any>(null);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "success" | "failed";
    transactionData?: any;
  }>({
    isOpen: false,
    type: "success",
  });

  // Fetch accounts
  const {
    data: accountData,
    isLoading: isLoadingAccounts,
    error: accountsError,
  } = useQuery({
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
        },
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
          response.errorMessage,
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

  const { data: neftBanks, isLoading: isLoadingNeftBanks } = useQuery({
    queryKey: ["neft-banks"],
    queryFn: getNeftBanks,
  });

  // Transfer mutation - called only after OTP success
  const { mutate } = useMutation({
    mutationFn: fundTransfer,
    onSuccess: (data: any) => {
      if (data?.responseCode === "00" || data?.responseCode === "0") {
        toast({
          title: "Transfer Successful!",
          description: `₦${formatCurrency(
            data.amount || data.transferAmount,
          )} sent successfully`,
        });

        setIsProcessingTransfer(false);
        setShowOtpModal(false);

        setModalState({
          isOpen: true,
          type: "success",
          transactionData: {
            amount: data.amount || data.transferAmount,
            beneficiaryAccountName:
              data.beneficiaryAccountName || data.accountName,
            beneficiaryAccountNumber:
              data.beneficiaryAccountNumber || data.accountNumber,
            paymentReference: data.paymentReference,
            transactionId: data.transactionId || data.transactionReference,
          },
        });

        resetForm();
      } else {
        const errorMessage =
          data?.responseMessage || data?.message || "Transaction failed";
        toast({
          title: "Transfer Failed",
          description: errorMessage,
          variant: "destructive",
        });

        setModalState({
          isOpen: true,
          type: "failed",
          transactionData: { errorMessage },
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Network error. Please try again.";
      toast({
        title: "Transfer Failed",
        description: errorMessage,
        variant: "destructive",
      });

      setModalState({
        isOpen: true,
        type: "failed",
        transactionData: { errorMessage },
      });
    },
    onSettled: () => {
      setIsProcessingTransfer(false);
      setShowOtpModal(false);
    },
  });

  const thirdPartyTransfersSchema = z.object({
    sourceAccount: z.string().min(1, "Please select your source account"),
    dailyTransferLimit: z.number().min(0, "Daily transfer limit required"),
    bankCode: z.string().min(1, "Please select a destination bank"),
    destinationAccountNumber: z
      .string()
      .regex(/^\d+$/, "Account number must contain only numeric values")
      .min(10, "Account number must be at least 10 digits long"),
    destinationAccountName: z.string().optional(),
    transferAmount: z.coerce.number().min(1, "Please enter a transfer amount"),
    narration: z.string().optional(),
  });

  const defaultValues = {
    sourceAccount: "",
    dailyTransferLimit: 0,
    bankCode: "",
    destinationAccountNumber: "",
    destinationAccountName: "",
    transferAmount: 0,
    narration: "",
  };

  const methods = useForm({
    defaultValues,
    resolver: zodResolver(thirdPartyTransfersSchema),
    mode: "onChange",
  });

  const { handleSubmit, control, trigger, getValues, setValue, watch } =
    methods;

  useEffect(() => {
    const sourceAccount = watch("sourceAccount");
    if (sourceAccount && sourceAccount.length >= 10) {
      const limit = (userData?.pLimitsObject as any)?.find(
        (limit: any) => limit.accountnumber === sourceAccount,
      )?.interBankLimit;
      setValue("dailyTransferLimit", Number(limit) || 0);
    }
  }, [watch("sourceAccount"), userData, setValue]);

  const { data: nameEnquiryData, isLoading: isLoadingNameEnquiry, isError: isNameEnquiryError } = useQuery({
    queryKey: [
      "name-enquiry",
      watch("bankCode"),
      watch("destinationAccountNumber"),
    ],
    queryFn: () =>
      returnNameEnquiry({
        channelCode: "1",
        accountNumber: watch("destinationAccountNumber"),
        destinationInstitutionCode: watch("bankCode"),
        transactionId: generateTransactionId(),
      }),
    enabled:
      !!watch("bankCode") &&
      /^[0-9]+$/.test(watch("destinationAccountNumber")) &&
      watch("destinationAccountNumber").length >= 10,
  });

  useEffect(() => {
    if (nameEnquiryData?.success) {
      setNameEnquiryResult(nameEnquiryData);
      setNameEnquiryError(null);
      setValue(
        "destinationAccountName",
        nameEnquiryData?.data?.data?.accountName
      );
    } else if (isNameEnquiryError) {
      setNameEnquiryError("Invalid account number or bank. Please try again.");
    }
  }, [nameEnquiryData, isNameEnquiryError, setValue]);

  useEffect(() => {
    const sourceAccount = watch("sourceAccount");
    if (sourceAccount && sourceAccount.length >= 10) {
      const selected = accounts?.find(
        (account: any) => account.accountNumber?.toString() === sourceAccount,
      );
      if (selected) {
        setSelectedAccount({
          ...selected,
          accountName: selected.accountName,
        });
      } else {
        setSelectedAccount(null);
      }
    } else {
      setSelectedAccount(null);
    }
  }, [watch("sourceAccount"), accounts]);

  const nextStep = async () => {
    const fields = {
      1: ["sourceAccount", "dailyTransferLimit"],
      2: ["bankCode", "destinationAccountNumber"],
      3: ["transferAmount"],
    }[step];

    const isValid = await trigger(fields as any);
    if (!isValid) return;

    if (step === 3) {
      const amount = getValues("transferAmount") as number;
      const limit = getValues("dailyTransferLimit") as number;
      if (amount > limit) {
        methods.setError("transferAmount", {
          type: "manual",
          message: "Amount exceeds daily transfer limit",
        });
        return;
      }
    }

    if (step !== 2 || nameEnquiryResult?.success) {
      setStep((prev) => Math.min(prev + 1, 4));
    } else if (step === 2 && !nameEnquiryResult?.success) {
      setNameEnquiryError(
        "Please wait for account verification or correct the details.",
      );
    }
  };

  const previousStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const resetForm = () => {
    setStep(1);
    methods.reset();
    setNameEnquiryResult(null);
    setNameEnquiryError(null);
    setPendingTransferPayload(null);
    setOtp(["", "", "", "", "", ""]);
  };

  // Step 4: Confirm → Show OTP Modal
  const handleConfirmTransfer = (
    data: z.infer<typeof thirdPartyTransfersSchema>,
  ) => {
    if (!nameEnquiryResult?.success || !selectedAccount) {
      setModalState({
        isOpen: true,
        type: "failed",
        transactionData: {
          errorMessage: "Please verify beneficiary account first.",
        },
      });
      return;
    }

    if (data.transferAmount > data.dailyTransferLimit) {
      setModalState({
        isOpen: true,
        type: "failed",
        transactionData: { errorMessage: "Amount exceeds daily limit" },
      });
      return;
    }

    const cleanedAccountName = selectedAccount.accountName
      .replace(/\s+/g, " ")
      .trim();

    const payload = {
      sourceInstitutionCode: "000017",
      clientId: "090736",
      // sessionID: null,
      amount: data.transferAmount,
      beneficiaryAccountName: nameEnquiryResult.data?.accountName,
      beneficiaryAccountNumber:
        nameEnquiryResult.data?.accountNumber || data.destinationAccountNumber,
      beneficiaryBankVerificationNumber:
        nameEnquiryResult.data?.bankVerificationNumber,
      beneficiaryKYCLevel: 1,
      channelCode: 1,
      // ------------------------------------------------------------------
      originatorAccountName: "NOMASE MICROFINANCE BANK LIMITED",
      originatorAccountNumber: "0124003581",
      originatorBankVerificationNumber: "",
      // originatorBankVerificationNumber: "22000000083",
      // originatorAccountName: cleanedAccountName,
      // originatorAccountNumber: selectedAccount.accountNumber,
      // originatorBankVerificationNumber: "33333333333",
      // ------------------------------------------------------------------
      originatorKYCLevel: 1,
      destinationInstitutionCode: watch("bankCode"),
      mandateReferenceNumber: "RC0220310/1349/0015468292",
      nameEnquiryRef: nameEnquiryResult.data?.sessionID,
      originatorNarration:
        data.narration || `Transfer to ${nameEnquiryResult.data?.accountName}`,
      paymentReference: generatePaymentReference(),
      transactionId: generateTransactionId(),
      transactionLocation: "1.38716,3.05117",
      beneficiaryNarration:
        data.narration || `Transfer from ${cleanedAccountName}`,
      billerId: "362",
      initiatorAccountName: cleanedAccountName,
      initiatorAccountNumber: selectedAccount.accountNumber,
    };

    setPendingTransferPayload(payload);
    setShowOtpModal(true);
    setOtp(["", "", "", "", "", ""]);
  };

  // OTP Handlers
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

  // Validate OTP then transfer
  const handleValidateAndTransfer = async () => {
    const token = otp.join("");
    if (token.length !== 6) {
      toast({
        title: "Invalid Token",
        description: "Please enter all 6 digits",
        variant: "destructive",
      });
      return;
    }

    setIsValidatingOtp(true);

    try {
      const response = await validateOtp({
        token,
        userName: (userData?.userRec as any)?.puserName || userData?.userRec?.pUserName || "",
      });

      if (
        response.success ||
        response.retVal === 0 ||
        response.retMsg === "Code verified successfully"
      ) {
        toast({
          title: "Token Validated",
          description: "Processing your transfer...",
        });

        setIsProcessingTransfer(true);
        mutate(pendingTransferPayload);
      } else {
        toast({
          title: "Invalid Token",
          description:
            response.message || response.retMsg || "Token is incorrect",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Validation Failed",
        description: "Unable to validate token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidatingOtp(false);
    }
  };

  const banks = neftBanks?.data;

  if (isLoadingAccounts || isLoadingNeftBanks) return <Loading />;
  if (accountsError)
    return (
      <div className="text-red-500">
        Error fetching accounts: {accountsError.message}
      </div>
    );

  return (
    <main className="h-full w-full flex flex-col">
      <div className="w-full max-w-4xl border-b border-slate-200 mb-6 flex gap-6 text-sm font-semibold text-slate-400">
          <button
            onClick={() => setActiveTab("transfer")}
            className={`pb-3 border-b-2 transition-colors ${activeTab === "transfer" ? "border-primary text-primary" : "border-transparent hover:text-slate-700"}`}
          >
            Transfer
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 border-b-2 transition-colors ${activeTab === "history" ? "border-primary text-primary" : "border-transparent hover:text-slate-700"}`}
          >
            History
          </button>
      </div>

      {activeTab === "history" ? (
        <TransferHistory />
      ) : (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="w-full max-w-2xl shadow-sm border-border">
            <CardHeader className="bg-muted/30 border-b pb-6">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Landmark className="w-6 h-6 text-primary" />
                  Send to Other Banks
                </CardTitle>
                <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  Step {step} of 4
                </span>
              </div>
              <CardDescription className="text-base">
                {step === 1 && "Select your source account and verify your daily transfer limit."}
                {step === 2 && "Enter the beneficiary's bank and account details."}
                {step === 3 && "Specify the transfer amount and narration."}
                {step === 4 && "Review and confirm your transfer details."}
              </CardDescription>

              {/* Progress Bar */}
              <div className="w-full bg-secondary h-1.5 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {nameEnquiryError && step === 2 && (
                <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-md mb-6 border border-destructive/20">
                  {nameEnquiryError}
                </div>
              )}

              <Form {...methods}>
                <form
                  onSubmit={handleSubmit(handleConfirmTransfer)}
                  className="space-y-6"
                >
                  {step === 1 && (
                    <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                      <FormField
                        control={control}
                        name="sourceAccount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Source Account</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger className="h-12 text-base">
                                  <SelectValue placeholder="Select an account to debit" />
                                </SelectTrigger>
                                <SelectContent>
                                  {accounts?.map((account: any) => (
                                    <SelectItem
                                      key={account.accountNumber?.toString() || Math.random().toString()}
                                      value={account.accountNumber?.toString()}
                                    >
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
                        name="dailyTransferLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base text-muted-foreground">Daily Transfer Limit</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-3 text-muted-foreground">₦</span>
                                <Input
                                  {...field}
                                  className="pl-8 h-12 bg-muted/50 font-mono text-lg"
                                  disabled
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                      <FormField
                        control={control}
                        name="bankCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Destination Bank</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger className="h-12 text-base">
                                  <SelectValue placeholder="Select destination bank" />
                                </SelectTrigger>
                                <SelectContent>
                                  {banks?.map((bank: any) => (
                                    <SelectItem
                                      key={bank.bankCode}
                                      value={bank.bankCode}
                                    >
                                      {bank.bankName}
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
                        name="destinationAccountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Account Number</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter 10-digit account number"
                                disabled={isLoadingNameEnquiry}
                                className="h-12 font-mono text-lg"
                                maxLength={10}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="destinationAccountName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Verified Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  value={nameEnquiryResult?.data?.accountName || ""}
                                  readOnly
                                  className="h-12 bg-muted/50 text-muted-foreground font-semibold"
                                  placeholder="Name will appear after verification"
                                />
                                {nameEnquiryResult?.success && (
                                  <ShieldCheck className="absolute right-3 top-3 h-6 w-6 text-emerald-500" />
                                )}
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                      <FormField
                        control={control}
                        name="transferAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Amount to Transfer</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-4 top-3 text-lg font-medium text-foreground">₦</span>
                                <Input
                                  {...field}
                                  placeholder="0.00"
                                  type="number"
                                  className="h-14 pl-9 text-2xl font-bold"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="narration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Remark / Narration</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="What is this transfer for?" className="h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <div className="bg-muted/30 p-6 rounded-xl border border-border space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-border/50">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="text-3xl font-bold text-primary">
                            ₦{formatCurrency(getValues("transferAmount"))}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2">
                          <span className="text-muted-foreground">To</span>
                          <div className="text-right">
                            <p className="font-semibold">{nameEnquiryResult?.data?.accountName}</p>
                            <p className="text-sm font-mono text-muted-foreground">
                              {getValues("destinationAccountNumber")} • {banks?.find((b: any) => b.bankCode === getValues("bankCode"))?.bankName}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center py-2 border-t border-border/50 pt-4">
                          <span className="text-muted-foreground">From</span>
                          <div className="text-right">
                            <p className="font-semibold">{selectedAccount?.accountName || "My Account"}</p>
                            <p className="text-sm font-mono text-muted-foreground">{getValues("sourceAccount")}</p>
                          </div>
                        </div>

                        {getValues("narration") && (
                          <div className="flex justify-between items-center py-2 border-t border-border/50 pt-4">
                            <span className="text-muted-foreground">Remark</span>
                            <span className="font-medium">{getValues("narration")}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-blue-500/10 text-blue-700 dark:text-blue-400 p-4 rounded-lg flex gap-3 text-sm">
                        <ShieldCheck className="w-5 h-5 shrink-0" />
                        <p>Please review the details carefully. Transfers cannot be reversed once confirmed.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-6 mt-6 border-t border-border">
                    {step > 1 ? (
                      <Button
                        type="button"
                        onClick={previousStep}
                        variant="outline"
                        className="w-32"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                    ) : (
                      <div></div>
                    )}

                    {step < 4 && (
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={isLoadingNameEnquiry}
                        className="w-32"
                      >
                        {isLoadingNameEnquiry ? "Verifying..." : "Next"}
                        {!isLoadingNameEnquiry && <ArrowRight className="w-4 h-4 ml-2" />}
                      </Button>
                    )}

                    {step === 4 && (
                      <Button type="submit" className="w-40 font-semibold" size="lg">
                        Confirm <Send className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-8 rounded-xl shadow-2xl max-w-md w-full">
            <h3 className="text-2xl font-bold text-center mb-4">
              Token Required
            </h3>
            <p className="text-center text-muted-foreground mb-8">
              Enter the 6-digit token from your bank's token app
            </p>

            <div className="flex gap-3 justify-center mb-10">
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
                  disabled={isValidatingOtp || isProcessingTransfer}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp(["", "", "", "", "", ""]);
                  setPendingTransferPayload(null);
                }}
                disabled={isValidatingOtp || isProcessingTransfer}
              >
                Cancel
              </Button>
              <Button
                onClick={handleValidateAndTransfer}
                disabled={
                  otp.join("").length !== 6 ||
                  isValidatingOtp ||
                  isProcessingTransfer
                }
              >
                {isValidatingOtp
                  ? "Validating..."
                  : isProcessingTransfer
                    ? "Processing..."
                    : "Validate & Transfer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <TransactionModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        type={modalState.type}
        transactionData={modalState.transactionData}
      />
    </main>
  );
}
