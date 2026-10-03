'use client';

import { cn } from '@/lib/utils';
import type * as React from 'react';

interface ResponsiveTableWrapperProps
	extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

export function ResponsiveTableWrapper({
	children,
	className,
	...props
}: ResponsiveTableWrapperProps) {
	return (
		<div
			className={cn(
				'w-full overflow-auto rounded-md border',
				'[-webkit-overflow-scrolling:touch] [overscroll-behavior:contain]', // Better mobile scrolling
				className,
			)}
			{...props}
		>
			<div className="min-w-full">{children}</div>
		</div>
	);
}

interface MobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	title?: string;
}

export function MobileCard({
	children,
	title,
	className,
	...props
}: MobileCardProps) {
	return (
		<div
			className={cn(
				'p-4 border rounded-lg space-y-3 bg-card',
				'min-h-[44px]', // Ensure touch targets
				className,
			)}
			{...props}
		>
			{title && <h3 className="font-medium text-base leading-none">{title}</h3>}
			{children}
		</div>
	);
}

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	cols?: {
		default?: number;
		sm?: number;
		md?: number;
		lg?: number;
		xl?: number;
	};
}

export function ResponsiveGrid({
	children,
	cols = { default: 1, sm: 1, md: 2, lg: 3, xl: 4 },
	className,
	...props
}: ResponsiveGridProps) {
	const gridClasses = [
		'grid',
		`grid-cols-${cols.default || 1}`,
		cols.sm && `sm:grid-cols-${cols.sm}`,
		cols.md && `md:grid-cols-${cols.md}`,
		cols.lg && `lg:grid-cols-${cols.lg}`,
		cols.xl && `xl:grid-cols-${cols.xl}`,
		'gap-4 sm:gap-6',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={cn(gridClasses, className)} {...props}>
			{children}
		</div>
	);
}
