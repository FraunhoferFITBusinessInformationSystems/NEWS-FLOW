'use client';

import {
	ArrowDownIcon,
	ArrowUpIcon,
	CaretSortIcon,
	Cross2Icon,
	EraserIcon,
	EyeNoneIcon,
	MixerHorizontalIcon,
} from '@radix-ui/react-icons';
import type { Column } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { DataTableColumnFilter } from './data-table-column-filter';

interface DataTableColumnHeaderProps<TData, TValue>
	extends React.HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>;
	title: string;
	isFilterable?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	isFilterable = false,
	className,
}: DataTableColumnHeaderProps<TData, TValue>) {
	if (!column.getCanSort()) {
		return (
			<div className={cn('max-w-[11rem] text-left leading-snug', className)} title={title}>
				{title}
			</div>
		);
	}

	return (
		<div className={cn('flex items-start space-x-2', className)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						className="-ml-3 inline-flex h-auto min-h-8 max-w-[13rem] items-start justify-start gap-1.5 py-1.5 text-left data-[state=open]:bg-accent"
						size="sm"
						title={title}
						variant="ghost"
					>
						<span className="min-w-0 flex-1 line-clamp-2 whitespace-normal leading-snug">
							{title}
						</span>
						{column.getIsSorted() === 'desc' ? (
							<ArrowDownIcon className="mt-0.5 h-4 w-4 shrink-0" />
						) : column.getIsSorted() === 'asc' ? (
							<ArrowUpIcon className="mt-0.5 h-4 w-4 shrink-0" />
						) : (
							<CaretSortIcon className="mt-0.5 h-4 w-4 shrink-0" />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					<DropdownMenuItem onClick={() => column.toggleSorting(false)}>
						<ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
						Asc
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => column.toggleSorting(true)}>
						<ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
						Desc
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					{isFilterable ? (
						<>
							<DropdownMenuItem
								onClick={() => column.setFilterValue(undefined)}
							>
								<EraserIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
								Reset Filter
							</DropdownMenuItem>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									<MixerHorizontalIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
									<span>Set Filter</span>
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="p-0">
									<DataTableColumnFilter column={column} title={title} />
								</DropdownMenuSubContent>
							</DropdownMenuSub>
							<DropdownMenuSeparator />
						</>
					) : null}
					<DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
						<EyeNoneIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
						Hide
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
