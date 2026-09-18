'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Hand } from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';

import { Loading } from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import { appStore } from '@/store';
import { formatCurrency } from '@/utils/formatNumber';
import { saveMessageDetails, ReturnAcctDetails2 } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const stopPaymentSchema = z.object({
	messageTypeId: z.string().min(1, 'Please enter your message type id'),
	messageDate: z.string().min(1, 'Please enter a date'),
	messageStatus: z.string().min(1, 'Please enter your message status'),
	messageSenderName: z.string().min(1, 'Please enter your message sender name'),
	messageSenderEmail: z.string().min(1, 'Please enter your message sender email'),
	messageSenderPhone: z.number().min(1, 'Please enter your message sender phone'),
	messageSenderCustId: z.number().min(1, 'Please enter your message sender cust id'),
	account: z.string().min(1, 'Please select an account'),
	startChequeNumber: z.string().min(1, 'Please enter start cheque number'),
	endChequeNumber: z.string().min(1, 'Please enter end cheque number'),
	amount: z.string().min(1, 'Please enter amount'),
});

type StopPaymentFormValues = z.infer<typeof stopPaymentSchema>;

export default function StopPayment() {
	const { userData } = appStore();
	const { toast } = useToast();
	const [sessionID, setSessionID] = useState(null);

	useEffect(() => {
		async function fetchSessionID() {
			const res = await fetch('/api/getSessionId');
			if (res.ok) {
				const data = await res.json();
				setSessionID(data.sessionID);
			}
		}
		fetchSessionID();
	}, []);

	const { data, isLoading } = useQuery({
		queryKey: ['my-accounts'],
		queryFn: () => ReturnAcctDetails2(2, userData?.userRec, userData?.acctCollection?.AcctStruct),
		enabled: !!userData?.acctCollection?.AcctStruct,
	});

	const { mutate, isPending } = useMutation({
		mutationFn: (data: any) => saveMessageDetails(data),
		onSuccess: () => {
			toast({
				title: "Stop Payment Initiated",
				description: "Your stop payment request has been logged successfully.",
			});
		},
	});

	const methods = useForm<StopPaymentFormValues>({
		defaultValues: {
			messageTypeId: '',
			messageDate: '',
			messageStatus: '',
			messageSenderName: '',
			messageSenderEmail: '',
			messageSenderPhone: 0,
			messageSenderCustId: 0,
			account: '',
			startChequeNumber: '',
			endChequeNumber: '',
			amount: '',
		},
		resolver: zodResolver(stopPaymentSchema),
	});

	const { handleSubmit, setValue } = methods;

	useEffect(() => {
		if (data?.data && sessionID && userData?.acctCollection?.AcctStruct) {
			setValue('messageTypeId', `StopPayment|${sessionID}`);
			setValue('messageStatus', 'Pending');
			setValue('messageSenderName', userData.acctCollection.AcctStruct[1].cod_acct_title as string);
			setValue('messageSenderEmail', userData.acctCollection.AcctStruct[1].Email as string);
			setValue('messageSenderPhone', userData.acctCollection.AcctStruct[1].Gsm as any);
			setValue('messageSenderCustId', userData.acctCollection.AcctStruct[1].CustomerID as any);
		}
	}, [data, sessionID, userData, setValue]);

	const onSubmit = async (formData: StopPaymentFormValues) => {
		const newData = {
			...formData,
			messageDate: format(new Date(formData.messageDate), 'dd-MM-yyyy'),
			messageBody: `Cheque Bk Stop Request from User with Acct No:${formData.account}|.Details are as follows: Range of requested leaves is from ${formData.startChequeNumber} to ${formData.endChequeNumber}|. The amount is ${formData.amount}|.Cheque Date is ${formData.messageDate}`,
		};
		mutate(newData);
	};

	if (isLoading) return <Loading />;

	return (
		<div className="max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold text-foreground tracking-tight">Stop Cheque Payment Request</h1>
				<p className="text-muted-foreground">Submit a formal request to cancel processing on a specific cheque or range of cheques.</p>
			</div>

			<Card className="border border-border shadow-sm overflow-hidden rounded-2xl">
				<CardHeader className="bg-muted/30 border-b border-border px-6 py-5">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
							<Hand className="w-5 h-5 text-primary" />
						</div>
						<div>
							<CardTitle className="text-lg">Stop Payment Form</CardTitle>
							<CardDescription>Provide exact cheque numbers to ensure accurate cancellation.</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="p-6 sm:p-8">
					<Form {...methods}>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							
							<FormField
								control={methods.control}
								name='account'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Select Account</FormLabel>
										<FormControl>
											<Select onValueChange={field.onChange} value={field.value}>
												<SelectTrigger className="bg-background">
													<SelectValue placeholder='Select Source Account' />
												</SelectTrigger>
												<SelectContent>
													{data?.data?.map((account: any, index: number) => (
														<SelectItem key={index} value={account.accountNumber}>
															{account.accountNumber} - {formatCurrency(account.bookBalance)}
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
									name='startChequeNumber'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Start Cheque Number</FormLabel>
											<FormControl>
												<Input className="bg-background font-mono" {...field} placeholder='000000' />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={methods.control}
									name='endChequeNumber'
									render={({ field }) => (
										<FormItem>
											<FormLabel>End Cheque Number</FormLabel>
											<FormControl>
												<Input className="bg-background font-mono" {...field} placeholder='000000' />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid sm:grid-cols-2 gap-6">
								<FormField
									control={methods.control}
									name='amount'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Amount</FormLabel>
											<FormControl>
												<div className="relative">
													<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
													<Input className="pl-8 bg-background" {...field} placeholder='0.00' />
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={methods.control}
									name='messageDate'
									render={({ field }) => (
										<FormItem className='flex flex-col w-full justify-end'>
											<FormLabel>Cheque Date</FormLabel>
											<FormControl>
												<DatePicker 
													value={field.value} 
													onChange={field.onChange} 
													placeholder='Select cheque date' 
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="pt-4 flex justify-end">
								<Button className='w-full sm:w-auto min-w-[200px]' type='submit' disabled={isPending}>
									{isPending ? 'Processing...' : 'Submit Request'}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
