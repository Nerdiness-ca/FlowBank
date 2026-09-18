import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// icons
import { Menu, LogOut, HeadphonesIcon, ChevronRight } from 'lucide-react';
import { useTenant } from "@/components/providers/TenantProvider";

// components
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

// utils
import { sidebarRoutes, renderRoutes } from '@/utils';

// store
import { appStore } from '@/store';

export const SidebarMobile = () => {
	const pathname = usePathname();
	const { logout, userData } = appStore();
	const tenant = useTenant();

	const [openItems, setOpenItems] = useState<string[]>([]);
	const [isOpen, setIsOpen] = useState(false);

	// Close the sidebar when the route changes
	useEffect(() => {
		setIsOpen(false);
	}, [pathname]);

	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const name = (userData?.userRec as any)?.puserName || userData?.userRec?.pUserName || (userData?.userRec as any)?.name || (userData?.userRec as any)?.userName || "John Doe";
	const initials = name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button variant='outline' size='icon' className='shrink-0 lg:hidden'>
					<Menu className='h-5 w-5' />
					<span className='sr-only'>Toggle navigation menu</span>
				</Button>
			</SheetTrigger>

			<SheetContent side='left' className='flex flex-col bg-primary text-primary-foreground border-none p-0 w-80'>
				<SheetTitle className="sr-only">Navigation Menu</SheetTitle>
				
				{/* Brand Header */}
				<div className="px-6 py-6 border-b border-primary-foreground/10 flex items-center gap-3">
					{tenant.logo ? (
						<img src={tenant.logo} alt={tenant.name} className="h-8 object-contain" />
					) : (
						<div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center font-black text-sm">
							{tenant.name?.[0] || 'F'}
						</div>
					)}
					<div>
						<p className="font-bold text-primary-foreground text-base leading-tight">{tenant.name}</p>
						<p className="text-[11px] text-primary-foreground/50 uppercase tracking-widest">Online Banking</p>
					</div>
				</div>

				{/* User Badge */}
				<div className="px-5 py-4 mx-4 mt-5 mb-2 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10">
					{mounted ? (
						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-lg bg-primary-foreground/20 border border-primary-foreground/20 flex items-center justify-center font-bold text-sm flex-shrink-0 text-primary-foreground">
								{initials}
							</div>
							<div className="overflow-hidden">
								<p className="text-primary-foreground text-sm font-semibold truncate">{name}</p>
								<p className="text-primary-foreground/40 text-[11px] truncate">
									{userData?.acctCollection?.[0]?.accountNumber || 'Personal Account'}
								</p>
							</div>
						</div>
					) : (
						<div className="flex items-center gap-3 animate-pulse">
							<div className="w-9 h-9 rounded-lg bg-primary-foreground/20 flex-shrink-0" />
							<div className="overflow-hidden space-y-2">
								<div className="h-4 w-24 bg-primary-foreground/20 rounded" />
								<div className="h-3 w-16 bg-primary-foreground/10 rounded" />
							</div>
						</div>
					)}
				</div>

				<div className="px-4 mb-2 mt-1">
					<p className="text-[10px] uppercase font-bold tracking-widest text-primary-foreground/30 px-3 py-2">Navigation</p>
				</div>

				{/* Navigation Links */}
				<div className="flex-1 overflow-y-auto hide-scrollbar px-2">
					{renderRoutes({
						routes: sidebarRoutes,
						level: 0,
						pathname,
						openItems,
						setOpenItems,
					})}
				</div>

				{/* Logout */}
				<div className="px-4 pb-2 border-t border-primary-foreground/10 pt-4 mt-auto">
					<button
						onClick={logout}
						className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all group text-sm"
					>
						<div className="flex items-center gap-3">
							<LogOut className="h-4 w-4" />
							<span>Sign Out</span>
						</div>
						<ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
					</button>
				</div>

				{/* Support */}
				<div className="px-4 pb-5">
					<Link
						href={`mailto:${tenant.contactEmail}`}
						className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-colors"
					>
						<HeadphonesIcon className="h-4 w-4 text-primary-foreground/70 flex-shrink-0" />
						<div>
							<p className="text-xs font-semibold text-primary-foreground/90">Need Support?</p>
							<p className="text-[10px] text-primary-foreground/50 truncate">{tenant.contactEmail}</p>
						</div>
					</Link>
				</div>
			</SheetContent>
		</Sheet>
	);
};
