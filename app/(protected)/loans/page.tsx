'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Banknote, TrendingUp, Clock } from 'lucide-react';
import { formatCurrency } from "@/utils/formatNumber";

export default function LoansPage() {
	return (
		<main className='h-full w-full flex flex-col gap-6 p-6'>
			<div className='flex items-center justify-between'>
				<h2 className='text-2xl font-bold'>Loan Management</h2>
				<Link href='/loans/apply'>
					<Button className='font-semibold'>Apply for Loan</Button>
				</Link>
			</div>

			<div className='grid gap-4 md:grid-cols-3'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Active Loans</CardTitle>
						<Banknote className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>0</div>
						<p className='text-xs text-muted-foreground'>
							Total number of active loans
						</p>
					</CardContent>
				</Card>
				
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Total Outstanding</CardTitle>
						<TrendingUp className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{formatCurrency(0)}</div>
						<p className='text-xs text-muted-foreground'>
							Total balance to be paid
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Next Payment</CardTitle>
						<Clock className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>-</div>
						<p className='text-xs text-muted-foreground'>
							Upcoming due date
						</p>
					</CardContent>
				</Card>
			</div>

			<div className='mt-4'>
				<h3 className='text-lg font-semibold mb-4'>Loan History</h3>
				<div className='border rounded-md'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Reference ID</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Date Applied</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{/* Empty state for now */}
							<TableRow>
								<TableCell colSpan={5} className='h-24 text-center text-muted-foreground'>
									No loans found.
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</div>
			</div>
		</main>
	);
}
