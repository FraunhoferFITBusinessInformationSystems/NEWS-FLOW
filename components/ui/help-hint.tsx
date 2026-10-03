'use client';

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';
import type { ReactNode } from 'react';

interface HelpHintProps {
	/**
	 * Short accessible name describing the function that is explained.
	 * Used as the popover heading and for the trigger's aria-label.
	 */
	readonly label: string;

	/**
	 * Explanation content shown inside the popover when toggled open.
	 */
	readonly children: ReactNode;

	/**
	 * Preferred side the popover opens towards.
	 */
	readonly side?: 'top' | 'right' | 'bottom' | 'left';

	/**
	 * Alignment of the popover relative to the trigger.
	 */
	readonly align?: 'start' | 'center' | 'end';

	/**
	 * Optional additional classes for the trigger button.
	 */
	readonly className?: string;
}

/**
 * Context-sensitive help toggle. Renders a small question mark next to a user
 * action; clicking it toggles a popover that explains what the action does.
 */
export function HelpHint({
	label,
	children,
	side = 'top',
	align = 'start',
	className,
}: HelpHintProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label={`Hilfe: ${label}`}
					className={cn(
						'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
						className,
					)}
				>
					<HelpCircle className="h-4 w-4" aria-hidden />
				</button>
			</PopoverTrigger>
			<PopoverContent
				side={side}
				align={align}
				className="z-[1100] w-72 space-y-1.5 text-sm"
			>
				<p className="font-semibold leading-none">{label}</p>
				<div className="leading-relaxed text-muted-foreground">{children}</div>
			</PopoverContent>
		</Popover>
	);
}
