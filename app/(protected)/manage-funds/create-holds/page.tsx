'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ShieldAlert } from 'lucide-react';
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

const createHoldSchema = z.object({
	account: z.string().min(1, 'Please enter your account'),
	balance: z.string().min(1, 'Please enter your balance'),
	holdAmount: z.string().min(1, 'Please enter your hold amount'),
	holdReason: z.string().min(1, 'Please enter your hold reason'),
	holdExpiryDate: z.string({
		required_error: 'Please enter the date',
	}),
});

type CreateHoldFormValues = z.infer<typeof createHoldSchema>;

export default function CreateHolds() {
    const { toast } = useToast();

	const methods = useForm<CreateHoldFormValues>({
		defaultValues: {
			account: '',
			balance: '',
			holdAmount: '',
			holdReason: '',
			holdExpiryDate: '',
		},
		resolver: zodResolver(createHoldSchema),
	});

	const { handleSubmit, formState: { isSubmitting } } = methods;

	const onSubmit = async (data: CreateHoldFormValues) => {
        await new Promise(resolve => setTimeout(resolve, 800));
		console.log(data);
        toast({
            title: "Hold Request Submitted",
            description: "Your account hold request has been processed.",
        });
	};

	return (
		<div className="max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold text-foreground tracking-tight">Accounts Hold Maintenance</h1>
				<p className="text-muted-foreground">Submit a request to place a temporary hold on specific funds within an account.</p>
			</div>

			<Card className="border border-border shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="bg-muted/30 border-b border-border px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <ShieldAlert className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Hold Request Form</CardTitle>
                            <CardDescription>Specify the amount and reason for the hold.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
				
                <CardContent className="p-6 sm:p-8">
                    <Form {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            
                            <div className="grid sm:grid-cols-2 gap-6">
                                <FormField
                                    control={methods.control}
                                    name='account'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select Account</FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="bg-background">
                                                        <SelectValue placeholder='Select account' />
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
                                    name='balance'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Available Balance</FormLabel>
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
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <FormField
                                    control={methods.control}
                                    name='holdAmount'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hold Amount</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                                                    <Input type='number' className="pl-8 bg-background" {...field} placeholder='0.00' required />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={methods.control}
                                    name='holdExpiryDate'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-col w-full justify-end'>
                                            <FormLabel>Hold Expiry Date</FormLabel>
                                            <FormControl>
                                                <DatePicker 
                                                    value={field.value} 
                                                    onChange={field.onChange} 
                                                    placeholder='Select expiry date' 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={methods.control}
                                name='holdReason'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reason for Hold</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="resize-none min-h-[100px] bg-background"
                                                {...field}
                                                placeholder='Explain why these funds need to be held...'
                                                required
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-4 flex justify-end">
                                <Button className='w-full sm:w-auto min-w-[200px]' type='submit' disabled={isSubmitting}>
                                    {isSubmitting ? "Processing..." : "Submit Hold Request"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
			</Card>
		</div>
	);
}
