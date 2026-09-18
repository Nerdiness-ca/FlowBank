'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Repeat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
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

const standingInstructionSchema = z.object({
	fromAccount: z.string().min(1, 'Please enter your from account'),
	availableBalance: z.string().min(1, 'Please enter your available balance'),
	toAccount: z.string().min(1, 'Please enter your to account'),
	amount: z.string().min(1, 'Please enter your amount'),
	startDate: z.string({ required_error: 'Please enter the start date' }),
	endDate: z.string({ required_error: 'Please enter the end date' }),
	frequency: z.string().min(1, 'Please enter your frequency'),
	narration: z.string().min(1, 'Please enter your narration'),
});

type StandingInstructionFormValues = z.infer<typeof standingInstructionSchema>;

export default function StandingInstruction() {
    const { toast } = useToast();

	const methods = useForm<StandingInstructionFormValues>({
		defaultValues: {
			fromAccount: '',
			availableBalance: '',
			toAccount: '',
			amount: '',
			startDate: '',
			endDate: '',
			frequency: '',
			narration: '',
		},
		resolver: zodResolver(standingInstructionSchema),
	});

	const { handleSubmit, formState: { isSubmitting } } = methods;

	const onSubmit = async (data: StandingInstructionFormValues) => {
        await new Promise(resolve => setTimeout(resolve, 800));
		console.log(data);
        toast({
            title: "Standing Instruction Created",
            description: "Your automated recurring transfer has been scheduled successfully.",
        });
	};

	return (
		<div className="max-w-4xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold text-foreground tracking-tight">Standing Instruction Maintenance</h1>
				<p className="text-muted-foreground">Setup automated recurring transfers between your accounts or to third parties.</p>
			</div>

			<Card className="border border-border shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="bg-muted/30 border-b border-border px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Repeat className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Recurring Transfer Setup</CardTitle>
                            <CardDescription>Configure the source, destination, frequency, and duration limits.</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Form {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                            
                            {/* Left Column: Account Details */}
                            <div className="p-6 sm:p-8 space-y-6 bg-muted/5">
                                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">Account Routing</h3>
                                
                                <FormField
                                    control={methods.control}
                                    name='fromAccount'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Source Account</FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="bg-background">
                                                        <SelectValue placeholder='Select account to debit' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='account1'>Account 1</SelectItem>
                                                        <SelectItem value='account2'>Account 2</SelectItem>
                                                        <SelectItem value='account3'>Account 3</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={methods.control}
                                    name='toAccount'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Destination Account</FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="bg-background">
                                                        <SelectValue placeholder='Select receiving account' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='account1'>Account 1</SelectItem>
                                                        <SelectItem value='account2'>Account 2</SelectItem>
                                                        <SelectItem value='account3'>Account 3</SelectItem>
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
                                            <FormLabel>Transfer Amount</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                                                    <Input className="pl-8 bg-background" {...field} placeholder='0.00' required />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                {/* Hidden but required field from original logic */}
                                <div className="hidden">
                                    <FormField
                                        control={methods.control}
                                        name='availableBalance'
                                        render={({ field }) => <Input {...field} value="dummy" />}
                                    />
                                </div>
                            </div>

                            {/* Right Column: Duration & Frequency */}
                            <div className="p-6 sm:p-8 space-y-6">
                                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">Schedule Parameters</h3>
                                
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={methods.control}
                                        name='startDate'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-col w-full'>
                                                <FormLabel>Start Date</FormLabel>
                                                <FormControl>
                                                    <DatePicker value={field.value} onChange={field.onChange} placeholder='Select date' />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={methods.control}
                                        name='endDate'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-col w-full'>
                                                <FormLabel>End Date</FormLabel>
                                                <FormControl>
                                                    <DatePicker value={field.value} onChange={field.onChange} placeholder='Select date' />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={methods.control}
                                    name='frequency'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Execution Frequency</FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="bg-background">
                                                        <SelectValue placeholder='Select how often to transfer' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='weekly'>Weekly</SelectItem>
                                                        <SelectItem value='monthly'>Monthly</SelectItem>
                                                        <SelectItem value='quarterly'>Quarterly</SelectItem>
                                                        <SelectItem value='yearly'>Yearly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={methods.control}
                                    name='narration'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Transaction Narration</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="resize-none min-h-[80px] bg-background"
                                                    {...field}
                                                    placeholder='Enter a description for these transfers...'
                                                    required
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <div className="pt-2">
                                    <Button className='w-full' type='submit' disabled={isSubmitting}>
                                        {isSubmitting ? "Saving..." : "Create Standing Instruction"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
			</Card>
		</div>
	);
}
