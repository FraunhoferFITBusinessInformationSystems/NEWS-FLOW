'use client';

import { CheckIcon } from '@radix-ui/react-icons';
import type { Column } from '@tanstack/react-table';
import * as React from 'react';

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface DataTableFacetedFilterProps<TData, TValue> {
	column?: Column<TData, TValue>;
	title?: string;
}

type DateFilterOptions = {
	label: string;
	start: number;
	end: number;
};

export function DataTableColumnFilter<TData, TValue>({
	column,
	title,
}: DataTableFacetedFilterProps<TData, TValue>) {
	const facets = column?.getFacetedUniqueValues();
	const selectedValues = new Set(column?.getFilterValue() as any[]);

	let options = Array.from(facets?.keys() ?? [])
		.sort()
		.slice(0, 5000);

	if (options[0] && options[0].constructor === Array) {
		options = options
			.filter((option) => option.length > 0)
			.flat()
			.filter((x, i, a) => a.indexOf(x) === i);
	} else if (options[0] && options[0] instanceof Date) {
		const today = new Date();

		const startToday = new Date(today.setHours(0, 0, 0, 0));
		const endToday = new Date(today.setHours(23, 59, 59, 999));

		const startOfWeek = new Date(today.setDate(today.getDate() - 7)).setHours(
			0,
			0,
			0,
			0,
		);

		const startOfMonth = new Date(today.setDate(today.getDate() - 30)).setHours(
			0,
			0,
			0,
			0,
		);

		const startOfYear = new Date(today.getFullYear(), 0, 1).setHours(
			0,
			0,
			0,
			0,
		);

		const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1).setHours(
			0,
			0,
			0,
			0,
		);

		options = [
			{ label: 'Heute', start: startToday, end: endToday },
			{ label: 'Letzte 7 Tage', start: startOfWeek, end: endToday },
			{ label: 'Letzte 30 Tage', start: startOfMonth, end: endToday },
			{ label: 'Dieses Jahr', start: startOfYear, end: endToday },
			{ label: 'Letztes Jahr', start: startOfLastYear, end: startOfYear },
		] as DateFilterOptions[];
	}

	if (facets) {
		options.sort((a, b) => (facets.get(b) ?? 0) - (facets.get(a) ?? 0));
	}

	return (
		<Command>
			<CommandInput placeholder={title} />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				{options.map((option) => {
					let isSelected = false;

					if (
						Array.isArray(option) &&
						typeof option === 'object' &&
						'label' in option &&
						'start' in option &&
						'end' in option
					) {
						const labels = Array.from(
							new Set(column?.getFilterValue() as DateFilterOptions[]),
						);

						isSelected = labels.some((val) => val.label === option.label);
					} else {
						isSelected = selectedValues.has(option);
					}

					return (
						<CommandItem
							key={option}
							onSelect={() => {
								const val = option;

								if (isSelected) {
									const obj = Array.from(selectedValues).find(
										(v) => v.label === val.label,
									);
									selectedValues.delete(obj);
								} else {
									selectedValues.add(val);
								}
								const filterValues = Array.from(selectedValues);

								column?.setFilterValue(
									filterValues.length ? filterValues : undefined,
								);
							}}
						>
							<div
								className={cn(
									'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
									isSelected
										? 'bg-primary text-primary-foreground'
										: 'opacity-50 [&_svg]:invisible',
								)}
							>
								<CheckIcon className={cn('h-4 w-4')} />
							</div>
							<span>{option instanceof Object ? option.label : option}</span>
							{facets?.get(option) && (
								<span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
									{facets.get(option)}
								</span>
							)}
						</CommandItem>
					);
				})}
				{selectedValues.size > 0 && (
					<>
						<CommandSeparator />
						<CommandGroup>
							<CommandItem
								className="justify-center text-center"
								onSelect={() => column?.setFilterValue(undefined)}
							>
								Clear filters
							</CommandItem>
						</CommandGroup>
					</>
				)}
			</CommandList>
		</Command>
	);
}
