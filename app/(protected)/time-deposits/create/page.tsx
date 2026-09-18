'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

import { Loading } from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ReturnAcctDetails2 } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const timeDepositSchema = z.object({
	account: z.string().min(1, 'Please select a source account'),
	amount: z.string().min(1, 'Please enter deposit amount'),
	tenor: z.string().min(1, 'Please select a tenor'),
	maturityInstruction: z.string().min(1, 'Please select a maturity instruction'),
});

type TimeDepositFormValues = z.infer<typeof timeDepositSchema>;

export default function CreateTimeDeposit() {
	const { userData } = appStore();
	const { toast } = useToast();
    const router = useRouter();

	const { data, isLoading } = useQuery({
		queryKey: ['my-accounts'],
		queryFn: () => ReturnAcctDetails2(2, userData?.userRec, userData?.acctCollection?.AcctStruct),
		enabled: !!userData?.acctCollection?.AcctStruct,
	});

	const methods = useForm<TimeDepositFormValues>({
		defaultValues: {
			account: '',
			amount: '',
			tenor: '',
			maturityInstruction: '',
		},
		resolver: zodResolver(timeDepositSchema),
	});

	const { handleSubmit, formState: { isSubmitting }, watch } = methods;
    const selectedTenor = watch('tenor');

    // Calculate mock interest rate based on tenor
    const interestRate = selectedTenor === '30' ? '4.5%' 
                       : selectedTenor === '90' ? '6.0%' 
                       : selectedTenor === '180' ? '8.5%' 
                       : selectedTenor === '365' ? '12.0%' 
                       : '0.0%';

	const onSubmit = async (formData: TimeDepositFormValues) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast({
            title: "Time Deposit Created",
            description: `Successfully booked ₦${formData.amount} for ${formData.tenor} days.`,
        });

        router.push('/time-deposits');
	};

	if (isLoading) return <Loading />;

	return (
		<div className="max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold text-foreground tracking-tight">Open Time Deposit</h1>
				<p className="text-muted-foreground">Secure your funds in a fixed deposit account and earn competitive interest.</p>
			</div>

			<Card className="border border-border shadow-sm overflow-hidden rounded-2xl">
				<CardHeader className="bg-muted/30 border-b border-border px-6 py-5">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
							<Clock className="w-5 h-5 text-primary" />
						</div>
						<div>
							<CardTitle className="text-lg">Investment Details</CardTitle>
							<CardDescription>Select your terms and maturity instructions.</CardDescription>
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
										<FormLabel>Source Account</FormLabel>
										<FormControl>
											<Select onValueChange={field.onChange} value={field.value}>
												<SelectTrigger className="bg-background">
													<SelectValue placeholder='Select account to debit' />
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
                                    name='amount'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Principal Amount</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                                                    <Input className="pl-8 bg-background" type="number" {...field} placeholder='0.00' min="10000" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={methods.control}
                                    name='tenor'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tenor (Duration)</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="bg-background">
                                                        <SelectValue placeholder='Select duration' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='30'>30 Days</SelectItem>
                                                        <SelectItem value='90'>90 Days</SelectItem>
                                                        <SelectItem value='180'>180 Days</SelectItem>
                                                        <SelectItem value='365'>365 Days</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Interest Rate Preview (Read-only) */}
                            {selectedTenor && (
                                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-primary">Estimated Interest Rate</p>
                                        <p className="text-xs text-muted-foreground">Rates are annualized</p>
                                    </div>
                                    <div className="text-2xl font-bold text-primary">
                                        {interestRate}
                                    </div>
                                </div>
                            )}

							<FormField
								control={methods.control}
								name='maturityInstruction'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Maturity Instruction</FormLabel>
										<FormControl>
											<Select onValueChange={field.onChange} value={field.value}>
												<SelectTrigger className="bg-background">
													<SelectValue placeholder='What happens when it matures?' />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='payout'>Liquidate to Source Account</SelectItem>
													<SelectItem value='rollover_principal'>Rollover Principal Only</SelectItem>
													<SelectItem value='rollover_both'>Rollover Principal + Interest</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="pt-4 flex justify-between items-center">
                                <Button variant="ghost" asChild>
                                    <Link href="/time-deposits">Cancel</Link>
                                </Button>
								<Button className='w-full sm:w-auto min-w-[200px]' type='submit' disabled={isSubmitting}>
									{isSubmitting ? 'Processing...' : 'Book Deposit'}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
