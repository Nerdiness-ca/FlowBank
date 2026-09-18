"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Mail, Phone, MapPin, Building2, CreditCard } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { appStore } from "@/store";
import { changePassword } from "@/services/apiAuth";
import { useTenant } from "@/components/providers/TenantProvider";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const changePasswordSchema = z
  .object({
    userName: z.string().min(1, "Username is required"),
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ProfileHub() {
  const { userData } = appStore();
  const { toast } = useToast();
  const tenant = useTenant();

  const [activeTab, setActiveTab] = useState<"personal" | "security" | "limits" | "preferences">("personal");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      userName: "",
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const userRec = userData?.userRec as any;
  const actualUserName = userRec?.puserName || userRec?.pUserName || userRec?.userName || "USER";
  const fullName = userRec?.puserName || userRec?.pUserName || userRec?.name || userRec?.userName || "John Doe";
  const initials = fullName.split(' ').filter(Boolean).map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  useEffect(() => {
    if (actualUserName) {
      form.setValue("userName", actualUserName);
    }
  }, [actualUserName, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: ({ userName, oldPassword, newPassword }: any) => changePassword({ userName, oldPassword, newPassword }),
    onSuccess: (response: any) => {
      const success = response === true || response?.retMsg === "Password Changed Successfully";
      if (success) {
        toast({ title: "Success", description: "Your password has been changed successfully." });
        form.reset({ userName: actualUserName, oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast({ title: "Error", description: response?.message || "Failed to change password.", variant: "destructive" });
      }
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.message || "An unexpected error occurred.", variant: "destructive" });
    },
  });

  const onSubmit = (values: ChangePasswordFormValues) => mutate(values);

  return (
    <div className="max-w-6xl w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Profile Summary */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pt-4">
        <div className="w-24 h-24 rounded-full border-4 border-background shadow-md bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold flex-shrink-0">
          {initials}
        </div>
        
        <div className="text-center md:text-left pt-2 md:pt-4 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{fullName}</h1>
          <p className="text-muted-foreground font-mono mt-1 mb-3">@{actualUserName}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Personal Account
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Exact Dashboard Style) */}
      <div className="w-full mt-8">
        <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto hide-scrollbar pb-px">
          <div className="flex gap-6 text-sm font-semibold text-slate-400 whitespace-nowrap">
            {[
              { id: "personal", label: "Personal Details" },
              { id: "security", label: "Security" },
              // { id: "limits", label: "Account Limits" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 -mb-px transition-colors ${
                  activeTab === tab.id 
                    ? "text-primary border-b-2 border-primary" 
                    : "hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="mt-8">
        {/* Personal Details Tab */}
        {activeTab === "personal" && (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="bg-muted/30 border-b border-border px-6 py-4">
              <h2 className="text-lg font-bold text-foreground">Personal Information</h2>
              <p className="text-sm text-muted-foreground">Review the contact details associated with your profile.</p>
            </div>
            <div className="p-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4"/> Email Address</p>
                <p className="font-semibold text-foreground">{userRec?.email || userRec?.emailAddress || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4"/> Phone Number</p>
                <p className="font-semibold text-foreground">{userRec?.phoneNumber || userRec?.phone || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Building2 className="w-4 h-4"/> Branch</p>
                <p className="font-semibold text-foreground">{userRec?.branchName || "Main Branch"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4"/> Address</p>
                <p className="font-semibold text-foreground">{userRec?.address || "No address on file"}</p>
              </div>
            </div>
            <div className="bg-muted/10 border-t border-border p-4 text-xs text-muted-foreground text-center">
              To update your personal information, please contact customer support at {tenant.contactEmail || "support@flowbank.io"}.
            </div>
          </div>
        )}

        {/* Security / Password Tab */}
        {activeTab === "security" && (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden max-w-2xl">
            <div className="bg-muted/30 border-b border-border px-6 py-4">
              <h2 className="text-lg font-bold text-foreground">Change Password</h2>
              <p className="text-sm text-muted-foreground">Update your password to keep your account secure.</p>
            </div>
            <div className="p-6 sm:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="bg-muted/50 font-mono text-muted-foreground" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="oldPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showOldPassword ? "text" : "password"} {...field} className="pr-10 bg-background" />
                            <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground">
                              {showOldPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type={showNewPassword ? "text" : "password"} {...field} className="pr-10 bg-background" />
                              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground">
                                {showNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type={showConfirmPassword ? "text" : "password"} {...field} className="pr-10 bg-background" />
                              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground">
                                {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Updating Password..." : "Update Password"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        )}

        {/* Account Limits Tab */}
        {activeTab === "limits" && (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="bg-muted/30 border-b border-border px-6 py-4">
              <h2 className="text-lg font-bold text-foreground">Account Limits</h2>
              <p className="text-sm text-muted-foreground">View your daily transaction and transfer limits.</p>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <CreditCard className="w-8 h-8 text-primary/60" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Limits Overview</h3>
                <p className="max-w-md mx-auto text-sm">Your account limits are currently managed directly by the banking system. For limit upgrades, please contact your account manager.</p>
                <Button variant="outline" className="mt-4 border-border">Request Limit Increase</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
