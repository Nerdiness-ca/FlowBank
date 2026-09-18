'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Landmark } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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

const applyLoanSchema = z.object({
	loanType: z.string().min(1, 'Please select a loan type'),
	amount: z.string().min(1, 'Please enter loan amount'),
	duration: z.string().min(1, 'Please enter loan duration in months'),
	purpose: z.string().min(1, 'Please describe the purpose of the loan'),
});

type ApplyLoanFormValues = z.infer<typeof applyLoanSchema>;

export default function ApplyLoanPage() {
    const { toast } = useToast();
    const router = useRouter();

	const methods = useForm<ApplyLoanFormValues>({
		defaultValues: {
			loanType: '',
			amount: '',
			duration: '',
			purpose: '',
		},
		resolver: zodResolver(applyLoanSchema),
	});

	const { handleSubmit, formState: { isSubmitting } } = methods;

	const onSubmit = async (data: ApplyLoanFormValues) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        toast({
            title: "Loan Application Submitted",
            description: "Your application has been received and is under review.",
        });
        router.push('/loans');
	};

	return (
		<div className="max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold text-foreground tracking-tight">Apply for a Loan</h1>
				<p className="text-muted-foreground">Select a loan type and provide details to begin your application process.</p>
			</div>

			<Card className="border border-border shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="bg-muted/30 border-b border-border px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Landmark className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Loan Application Form</CardTitle>
                            <CardDescription>All fields are mandatory unless marked optional.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
				
                <CardContent className="p-6 sm:p-8">
                    <Form {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            
                            <div className="grid sm:grid-cols-2 gap-6">
                                <FormField
                                    control={methods.control}
                                    name='loanType'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Loan Type</FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="bg-background">
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
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                                                    <Input type='number' className="pl-8 bg-background" {...field} placeholder='0.00' />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={methods.control}
                                name='duration'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration (Months)</FormLabel>
                                        <FormControl>
                                            <Input type='number' className="bg-background" {...field} placeholder='e.g. 12, 24, 36' />
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
                                                className="resize-none min-h-[120px] bg-background"
                                                {...field}
                                                placeholder='Briefly explain why you need this loan and how you plan to use it...'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-4 flex justify-end">
                                <Button className='w-full sm:w-auto min-w-[200px]' type='submit' disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit Application"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
			</Card>
		</div>
	);
}
