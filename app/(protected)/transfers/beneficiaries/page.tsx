'use client';

import { useToast } from '@/hooks/use-toast';

// form
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// query
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loading } from '@/components/Loader';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserPlus, Users, Building, ShieldCheck } from "lucide-react";

import { appStore } from '@/store';
import { returnGetBenefInfo, returnSaveBenefInfo } from '@/services/api';
import { getNeftBanks, returnNameEnquiry } from '@/services/apiAuth';
import { generateTransactionId } from "@/utils/generateTransactionId";

export default function Beneficiaries() {
	const { userData } = appStore();
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const [nameEnquiryResult, setNameEnquiryResult] = useState<any | null>(null);
	const [nameEnquiryError, setNameEnquiryError] = useState<string | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: ['beneficiaries'],
		queryFn: () => returnGetBenefInfo(userData?.userRec),
		enabled: !!userData,
	});

	const { data: neftBanks, isLoading: isLoadingNeftBanks } = useQuery({
		queryKey: ["neft-banks"],
		queryFn: getNeftBanks,
	});

	const beneficiariesSchema = z.object({
		bankCode: z.string().min(1, 'Please select a destination bank'),
		accountNumber: z.string()
			.regex(/^\d+$/, "Account number must contain only numeric values")
			.min(10, "Account number must be at least 10 digits long"),
		accountName: z.string().min(1, 'Account name is required'),
		nickname: z.string().optional(),
		currency: z.string().min(1, 'Please enter your beneficiary account currency'),
	});

	const defaultValues = {
		bankCode: '',
		accountNumber: '',
		accountName: '',
		nickname: '',
		currency: 'NGN',
	};

	const methods = useForm({
		defaultValues,
		resolver: zodResolver(beneficiariesSchema),
		mode: "onChange",
	});

	const { handleSubmit, watch, setValue } = methods;

	// Name Enquiry Logic
	const { data: nameEnquiryData, isLoading: isLoadingNameEnquiry, isError: isNameEnquiryError } = useQuery({
		queryKey: [
		  "name-enquiry",
		  watch("bankCode"),
		  watch("accountNumber"),
		],
		queryFn: () =>
		  returnNameEnquiry({
			channelCode: "1",
			accountNumber: watch("accountNumber"),
			destinationInstitutionCode: watch("bankCode"),
			transactionId: generateTransactionId(),
		  }),
		enabled:
		  !!watch("bankCode") &&
		  /^[0-9]+$/.test(watch("accountNumber")) &&
		  watch("accountNumber").length >= 10,
	});

	useEffect(() => {
		if (nameEnquiryData?.success) {
		  setNameEnquiryResult(nameEnquiryData);
		  setNameEnquiryError(null);
		  setValue(
			"accountName",
			nameEnquiryData?.data?.data?.accountName
		  );
		} else if (isNameEnquiryError) {
		  setNameEnquiryError("Invalid account number or bank. Please check your details.");
		  setNameEnquiryResult(null);
		  setValue("accountName", "");
		}
	}, [nameEnquiryData, isNameEnquiryError, setValue]);

	const { mutate, isPending } = useMutation({
		mutationFn: (payload: { user: any; data: any }) =>
			returnSaveBenefInfo(payload.user, payload.data),
		mutationKey: ['add-beneficiary'],
		onSuccess: (res: any) => {
			if (res.success && (res.data === "Beneficiary saved successfully" || res.retVal === 0)) {
				toast({ title: 'Beneficiary added successfully!' });
				methods.reset();
				setNameEnquiryResult(null);
			} else {
				toast({
					title: res.errorMessage || "Failed to add beneficiary",
					variant: 'destructive',
				});
			}

			queryClient.invalidateQueries({
				queryKey: ['beneficiaries'],
			});
		},
	});

	const onSubmit = async (formData: z.infer<typeof beneficiariesSchema>) => {
		if (!nameEnquiryResult?.success) {
			toast({
				title: "Verification Required",
				description: "Please enter a valid bank and account number.",
				variant: "destructive"
			});
			return;
		}

		// API only takes accountName, so if nickname is provided we format it, otherwise use actual name
		const finalName = formData.nickname 
			? `${formData.nickname} (${formData.accountName})` 
			: formData.accountName;

		mutate({
			user: userData?.userRec,
			data: { ...formData, accountName: finalName },
		});
	};

	const parsedBeneficiaries = data?.data?.slice(1).map((account: string) => {
		const [accountNumber, accountName, currency] = account.split('|');
		return { accountNumber, accountName, currency };
	});

	const banks = neftBanks?.data;

	if (isLoading || isLoadingNeftBanks) return <Loading />;

// ... existing code down to the return statement

	if (isLoading) return <Loading />;

	return (
		<div className='w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
			<div className="flex flex-col gap-2">
				<h1 className='text-3xl font-bold tracking-tight text-foreground'>
					Manage Beneficiaries
				</h1>
				<p className="text-muted-foreground">Save and manage accounts for quick and easy transfers.</p>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
				{/* Saved Beneficiaries Section */}
				<Card className="lg:col-span-7 border-border shadow-sm">
					<CardHeader className="bg-muted/30 border-b pb-4">
						<CardTitle className="text-xl flex items-center gap-2">
							<Users className="w-5 h-5 text-primary" />
							Saved Accounts
						</CardTitle>
						<CardDescription>Accounts you have saved for third-party transfers.</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						{!parsedBeneficiaries || parsedBeneficiaries.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
								<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
									<Users className="w-8 h-8 text-muted-foreground/50" />
								</div>
								<h3 className="text-lg font-medium">No beneficiaries found</h3>
								<p className="text-muted-foreground text-sm mt-1">Add a new beneficiary using the form.</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader className="bg-muted/10">
										<TableRow>
											<TableHead className="font-semibold">Account Details</TableHead>
											<TableHead className="font-semibold text-right">Currency</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{parsedBeneficiaries.map((account: any, index: number) => (
											<TableRow key={index} className='hover:bg-muted/20 transition-colors group'>
												<TableCell>
													<div className="font-medium text-foreground group-hover:text-primary transition-colors">{account.accountName}</div>
													<div className="text-xs text-muted-foreground font-mono mt-0.5">{account.accountNumber}</div>
												</TableCell>
												<TableCell className="text-right">
													<span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
														{account.currency}
													</span>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Add New Beneficiary Section */}
				<Card className="lg:col-span-5 border-border shadow-sm h-fit">
					<CardHeader className="bg-muted/30 border-b pb-4">
						<CardTitle className="text-[15px] flex items-center gap-2">
							<UserPlus className="w-4 h-4 text-primary" />
							Add New Beneficiary
						</CardTitle>
						<CardDescription>Save a new account to your beneficiaries list.</CardDescription>
					</CardHeader>
					<CardContent className="p-5">
						<Form {...methods}>
							<form
								onSubmit={handleSubmit(onSubmit)}
								className='space-y-2'
							>
								<FormField
									control={methods.control}
									name='bankCode'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Destination Bank</FormLabel>
											<FormControl>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select Destination Bank" />
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
									control={methods.control}
									name='accountNumber'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Account Number</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder='Enter 10-digit account number'
													className="font-mono"
													disabled={isLoadingNameEnquiry}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Read-only Verified Account Name */}
								<FormField
									control={methods.control}
									name='accountName'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Account Name</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														{...field}
														readOnly
														className="bg-muted/50 text-muted-foreground font-semibold"
														placeholder="Name will appear after verification"
													/>
													{nameEnquiryResult?.success && (
														<ShieldCheck className="absolute right-3 top-2.5 h-5 w-5 text-emerald-500" />
													)}
												</div>
											</FormControl>
											{nameEnquiryError && (
												<p className="text-sm font-medium text-destructive">{nameEnquiryError}</p>
											)}
										</FormItem>
									)}
								/>

								<FormField
									control={methods.control}
									name='nickname'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nickname (Optional)</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder='e.g. John Doe - Work'
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button className='w-full font-semibold' type='submit' size="lg" disabled={isPending || !nameEnquiryResult?.success}>
									{isPending ? 'Saving...' : 'Save Beneficiary'}
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
