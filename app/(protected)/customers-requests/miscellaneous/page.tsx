'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { MessageSquareText } from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';

import { Loading } from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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

const miscellaneousSchema = z.object({
	messageTypeId: z.string().min(1, 'Please enter your message type id'),
	messageDate: z.string().min(1, 'Please enter your message date'),
	messageStatus: z.string().min(1, 'Please enter your message status'),
	messageSenderName: z.string().min(1, 'Please enter your message sender name'),
	messageSenderEmail: z.string().min(1, 'Please enter your message sender email'),
	messageSenderPhone: z.number().min(1, 'Please enter your message sender phone'),
	messageSenderCustId: z.number().min(1, 'Please enter your message sender cust id'),
	account: z.string().min(1, 'Please select an account'),
	message: z.string().min(1, 'Please enter your message'),
});

type MiscFormValues = z.infer<typeof miscellaneousSchema>;

export default function Miscellaneous() {
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
				title: "Message Sent",
				description: "Your miscellaneous request has been submitted securely.",
			});
		},
	});

	const methods = useForm<MiscFormValues>({
		defaultValues: {
			messageTypeId: '',
			messageDate: '',
			messageStatus: '',
			messageSenderName: '',
			messageSenderEmail: '',
			messageSenderPhone: 0,
			messageSenderCustId: 0,
			account: '',
			message: '',
		},
		resolver: zodResolver(miscellaneousSchema),
	});

	const { handleSubmit, setValue } = methods;

	useEffect(() => {
		if (data?.data && sessionID && userData?.acctCollection?.AcctStruct) {
			setValue('messageTypeId', `MiscRequest|${sessionID}`);
			setValue('messageDate', format(new Date(), 'dd-MM-yyyy'));
			setValue('messageStatus', 'Pending');
			setValue('messageSenderName', userData.acctCollection.AcctStruct[1].cod_acct_title as string);
			setValue('messageSenderEmail', userData.acctCollection.AcctStruct[1].Email as string);
			setValue('messageSenderPhone', userData.acctCollection.AcctStruct[1].Gsm as any);
			setValue('messageSenderCustId', userData.acctCollection.AcctStruct[1].CustomerID as any);
		}
	}, [data, sessionID, userData, setValue]);

	const onSubmit = async (formData: MiscFormValues) => {
		const newData = {
			...formData,
			messageBody: `Miscellaneous Request from User with Acct No:${formData.account}|.Details are as follows: ${formData.message}`,
		};
		mutate(newData);
	};

	if (isLoading) return <Loading />;

	return (
		<div className="max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold text-foreground tracking-tight">Miscellaneous Requests</h1>
				<p className="text-muted-foreground">Send a secure custom message or query to our customer support team.</p>
			</div>

			<Card className="border border-border shadow-sm overflow-hidden rounded-2xl">
				<CardHeader className="bg-muted/30 border-b border-border px-6 py-5">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
							<MessageSquareText className="w-5 h-5 text-primary" />
						</div>
						<div>
							<CardTitle className="text-lg">Secure Message</CardTitle>
							<CardDescription>Select the related account and draft your message.</CardDescription>
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
										<FormLabel>Related Account</FormLabel>
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

							<FormField
								control={methods.control}
								name='message'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Message Content</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												placeholder='Enter your detailed request or query here...'
												className='resize-none min-h-[150px] bg-background'
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="pt-4 flex justify-end">
								<Button className='w-full sm:w-auto min-w-[200px]' type='submit' disabled={isPending}>
									{isPending ? 'Sending...' : 'Send Secure Message'}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
