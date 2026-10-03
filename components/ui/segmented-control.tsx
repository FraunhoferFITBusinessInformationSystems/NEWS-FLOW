'use client';

import { cn } from '@/lib/utils';

export interface SegmentedControlOption<TValue extends string | boolean> {
	readonly value: TValue;
	readonly label: string;
}

interface SegmentedControlProps<TValue extends string | boolean> {
	/**
	 * Visible caption shown in front of the segments. Doubles as the accessible
	 * name of the button group.
	 */
	readonly label: string;

	/**
	 * Selectable segments in display order.
	 */
	readonly options: readonly SegmentedControlOption<TValue>[];

	/**
	 * Currently selected value.
	 */
	readonly value: TValue;

	/**
	 * Called with the pressed segment's value.
	 */
	readonly onChange: (value: TValue) => void;

	/**
	 * Optional additional classes for the wrapper.
	 */
	readonly className?: string;
}

/**
 * Compact group of mutually exclusive options rendered as one connected bar.
 * Use it where a handful of named choices should stay visible at a glance, for
 * example the layer toggles of a map.
 */
export function SegmentedControl<TValue extends string | boolean>({
	label,
	options,
	value,
	onChange,
	className,
}: SegmentedControlProps<TValue>) {
	return (
		<div
			role="group"
			aria-label={label}
			className={cn('flex items-center gap-2', className)}
		>
			<span className="text-sm text-gray-700">{label}</span>
			<div className="inline-flex rounded-md border border-gray-300 p-0.5">
				{options.map((option) => {
					const isSelected = value === option.value;
					return (
						<button
							key={String(option.value)}
							type="button"
							aria-pressed={isSelected}
							onClick={() => onChange(option.value)}
							className={cn(
								'rounded px-2.5 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-1 focus-visible:ring-green-600',
								isSelected
									? 'bg-green-600 text-white'
									: 'text-gray-700 hover:bg-gray-100',
							)}
						>
							{option.label}
						</button>
					);
				})}
			</div>
		</div>
	);
}
