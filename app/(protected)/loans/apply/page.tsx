'use client';

// form
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

// utils
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function ApplyLoanPage() {
    const { toast } = useToast();
    const router = useRouter();

	const applyLoanSchema = z.object({
		loanType: z.string().min(1, 'Please select a loan type'),
		amount: z.string().min(1, 'Please enter loan amount'),
		duration: z.string().min(1, 'Please enter loan duration in months'),
		purpose: z.string().min(1, 'Please describe the purpose of the loan'),
	});

	const defaultValues = {
		loanType: '',
		amount: '',
		duration: '',
		purpose: '',
	};

	const methods = useForm({
		defaultValues,
		resolver: zodResolver(applyLoanSchema),
	});

	const { handleSubmit } = methods;

	const onSubmit = async (data: z.infer<typeof applyLoanSchema>) => {
		console.log(data);
        toast({
            title: "Loan Application Submitted",
            description: "Your application has been received and is under review.",
        });
        router.push('/loans');
	};

	return (
		<main className='h-full w-full flex flex-col gap-6 items-center mt-6 md:justify-center'>
			<h2 className='text-2xl font-bold'>Apply for a Loan</h2>
            <p className='text-muted-foreground text-center mb-4'>Fill out the details below to request a new loan.</p>

			<Form {...methods}>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className='space-y-3 w-[90%] md:w-1/2 border border-border rounded-md p-6'
				>
					<FormField
						control={methods.control}
						name='loanType'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Loan Type</FormLabel>
								<FormControl>
									<Select
										value={field.value}
										onValueChange={(value) => field.onChange(value)}
									>
										<SelectTrigger>
											<SelectValue placeholder='Select loan type' />
										</SelectTrigger>

										<SelectContent>
											<SelectItem value='personal'>Personal Loan</SelectItem>
											<SelectItem value='business'>Business Loan</SelectItem>
											<SelectItem value='mortgage'>Mortgage</SelectItem>
                                            <SelectItem value='auto'>Auto Loan</SelectItem>
										</SelectContent>
									</Select>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={methods.control}
						name='amount'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Loan Amount</FormLabel>
								<FormControl>
									<Input type='number' {...field} placeholder='Enter amount' required />
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={methods.control}
						name='duration'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Duration (Months)</FormLabel>
								<FormControl>
									<Input type='number' {...field} placeholder='e.g. 12, 24, 36' required />
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={methods.control}
						name='purpose'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Purpose of Loan</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										placeholder='Briefly explain why you need this loan'
										required
									/>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>

					<Button className='w-full font-semibold mt-6' type='submit'>
						Submit Application
					</Button>
				</form>
			</Form>
		</main>
	);
}
