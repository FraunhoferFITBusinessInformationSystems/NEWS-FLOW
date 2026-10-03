'use client';

import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import type { Column } from '@tanstack/react-table';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface DataTableFacetedFilterProps<TData, TValue> {
	column?: Column<TData, TValue>;
	title?: string;
}

export function DataTableFacetedFilter<TData, TValue>({
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
	}

	if (facets) {
		options.sort((a, b) => (facets.get(b) ?? 0) - (facets.get(a) ?? 0));
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button className="h-8 border-dashed" size="sm" variant="outline">
					<PlusCircledIcon className="mr-2 h-4 w-4" />
					{title}
					{facets && selectedValues?.size > 0 && (
						<>
							<Separator className="mx-2 h-4" orientation="vertical" />
							<Badge
								className="rounded-sm px-1 font-normal lg:hidden"
								variant="secondary"
							>
								{selectedValues.size}
							</Badge>
							<div className="hidden space-x-1 lg:flex">
								{selectedValues.size > 2 ? (
									<Badge
										className="rounded-sm px-1 font-normal"
										variant="secondary"
									>
										{selectedValues.size} selected
									</Badge>
								) : (
									options
										.filter((option) => selectedValues.has(option))
										.map((option) => (
											<Badge
												key={option}
												className="rounded-sm px-1 font-normal"
												variant="secondary"
											>
												{option}
											</Badge>
										))
								)}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder={title} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						{options.map((option) => {
							const isSelected = selectedValues.has(option);

							return (
								<CommandItem
									key={option}
									onSelect={() => {
										const val = option;

										if (isSelected) {
											selectedValues.delete(val);
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
									<span>{option}</span>
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
			</PopoverContent>
		</Popover>
	);
}
