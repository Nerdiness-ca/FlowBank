import React from 'react';
import Link from 'next/link';

import { ChevronDown, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { Route } from './routes';

import { cn } from '@/lib/utils';
import { FeatureGuard } from '@/components/guards/FeatureGuard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// All colours use CSS-variable-backed Tailwind classes (text-primary-foreground, etc.)
// so they automatically react to the theme switcher throughout the entire app.

export const renderRoutes = ({
	routes,
	level,
	pathname,
	openItems,
	setOpenItems,
	collapsed = false,
}: {
	routes: Route[];
	level: number;
	pathname: string;
	openItems: string[];
	setOpenItems: React.Dispatch<React.SetStateAction<string[]>>;
	collapsed?: boolean;
}) => {
	const toggleItem = (pathname: string) => {
		setOpenItems((prevOpenItems) =>
			prevOpenItems.includes(pathname)
				? prevOpenItems.filter((item) => item !== pathname)
				: [...prevOpenItems, pathname]
		);
	};

	const baseClass = cn(
		'rounded-none transition-all duration-200 border-l-4 border-transparent',
		'text-primary-foreground/70 h-12',
		'hover:bg-primary-foreground/10 hover:text-primary-foreground hover:!text-primary-foreground',
	);

	const activeClass = 'bg-primary-foreground/15 text-primary-foreground border-primary-foreground font-bold';

	return routes.map((route) => {
		const isOpen = openItems.includes(route.pathname);

		const isActive =
			pathname === route.pathname || pathname.startsWith(route.pathname + '/');

		let element;

		if (route.children) {
			const btn = (
				<Button
					variant='ghost'
					className={cn(
						'w-full justify-between',
						baseClass,
						isActive && activeClass,
						level > 0 && 'pl-8 h-10 text-sm',
						collapsed && 'justify-center px-0'
					)}
				>
					<span className={cn('flex items-center gap-3', collapsed && 'justify-center [&>svg]:w-5 [&>svg]:h-5')}>
						{route.icon}
						{!collapsed && <span className="text-sm">{route.label}</span>}
					</span>

					{!collapsed && (isOpen ? (
						<ChevronDown className='h-4 w-4' />
					) : (
						<ChevronRight className='h-4 w-4' />
					))}
				</Button>
			);

			element = (
				<Collapsible
					key={route.pathname}
					open={isOpen}
					onOpenChange={() => toggleItem(route.pathname)}
					className='space-y-1.5'
				>
					<CollapsibleTrigger asChild>
						{collapsed ? (
							<TooltipProvider delayDuration={0}>
								<Tooltip>
									<TooltipTrigger asChild>{btn}</TooltipTrigger>
									<TooltipContent side="right" className="font-semibold">{route.label}</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						) : btn}
					</CollapsibleTrigger>

					<CollapsibleContent className="bg-black/10 pb-1">
						{renderRoutes({
							routes: route.children,
							level: level + 1,
							pathname,
							openItems,
							setOpenItems,
							collapsed,
						})}
					</CollapsibleContent>
				</Collapsible>
			);
		} else {
			const btn = (
				<Button
					variant='ghost'
					className={cn(
						'w-full justify-start',
						baseClass,
						isActive && activeClass,
						level > 0 && 'pl-8 h-10 text-sm',
						collapsed && 'justify-center px-0'
					)}
					asChild
				>
					<Link href={route.pathname}>
						<span className={cn('flex items-center gap-3', collapsed && 'justify-center [&>svg]:w-5 [&>svg]:h-5')}>
							{route.icon}
							{!collapsed && <span className="text-sm">{route.label}</span>}
						</span>
					</Link>
				</Button>
			);

			element = collapsed ? (
				<TooltipProvider delayDuration={0} key={route.pathname}>
					<Tooltip>
						<TooltipTrigger asChild>{btn}</TooltipTrigger>
						<TooltipContent side="right" className="font-semibold">{route.label}</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			) : (
				<React.Fragment key={route.pathname}>{btn}</React.Fragment>
			);
		}

		if (route.featureKey) {
			return (
				<FeatureGuard key={route.pathname} featureKey={route.featureKey}>
					{element}
				</FeatureGuard>
			);
		}

		return element;
	});
};
