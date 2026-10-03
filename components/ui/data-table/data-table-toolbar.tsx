'use client';

import { CalendarIcon, Cross2Icon } from '@radix-ui/react-icons';
import type { Table } from '@tanstack/react-table';

// import { Input } from "@/components/ui/input"
// import { DataTableViewOptions } from "./data-table-view-options";

import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import type React from 'react';
import { useEffect, useId } from 'react';
//import { DateRange } from "react-day-picker";
//import { format, set, sub } from "date-fns";

//import { Calendar } from "../calendar";
//import { Popover, PopoverContent, PopoverTrigger } from "../popover";

import { DataTableFacetedFilter } from './data-table-faceted-filter';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useQueryState } from 'nuqs';

type filterColumnOptions = {
	label: string;
	value: string | number | boolean;
	icon?: React.ComponentType<{ className?: string }>;
}[];

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	data: TData[];
	globalFilterValue: string;
	setGlobalFilterValue: React.Dispatch<React.SetStateAction<string>>;
	/** When set, CSV export uses these keys/values instead of flattening raw row objects. */
	csvExportRowMapper?: (row: TData) => Record<string, string | number | boolean | null>;
	csvExportFilename?: string;
	/** Rendered to the right of the CSV export button, same toolbar row (e.g. primary actions). */
	toolbarTrailing?: React.ReactNode;
}

export function DataTableToolbar<TData>({
	table,
	data,
	globalFilterValue,
	setGlobalFilterValue,
	csvExportRowMapper,
	csvExportFilename,
	toolbarTrailing,
}: DataTableToolbarProps<TData>) {
	const [search, setSearch] = useQueryState('search');

	useEffect(() => {
		if (search) {
			setGlobalFilterValue(search ?? '');
		}
	}, [search]);

	useEffect(() => {
		if (globalFilterValue) {
			setSearch(globalFilterValue);
		} else if (search && !globalFilterValue) {
			setSearch(null);
		}
	}, [globalFilterValue]);

	const isFiltered = table.getState().columnFilters.length > 0;

	const flattenObject = (obj: any, delimiter = '.', prefix = '') =>
		Object.keys(obj).reduce((acc, k) => {
			const pre = prefix.length ? `${prefix}${delimiter}` : '';

			if (
				typeof obj[k] === 'object' &&
				obj[k] !== null &&
				Object.keys(obj[k]).length > 0
			)
				Object.assign(acc, flattenObject(obj[k], delimiter, pre + k));
			// eslint-disable-next-line
			// @ts-ignore
			else acc[pre + k] = obj[k];

			return acc;
		}, {});

	const saveAction = () => {
		// Export all rows matching current filters/sort, not only the current page.
		const flatRows = table.getPrePaginationRowModel().flatRows;
		const res = csvExportRowMapper
			? flatRows.map((v) => csvExportRowMapper(v.original))
			: flatRows.map((v) => flattenObject(v.original));

		const csv = Papa.unparse(res);

		const file = new Blob([csv], { type: 'text/plain;charset=utf-8' });

		saveAs(file, csvExportFilename ?? 'export.csv');
	};

	// Filter

	const facetedFilter = ({
		column,
		label,
	}: { column: string; label: string }) => {
		return (
			<DataTableFacetedFilter
				key={useId()}
				column={table.getColumn(column)}
				title={label}
			/>
		);
	};

	// const [date, setDate] = React.useState<DateRange | undefined>({
	//   from: sub(new Date(), { months: 2 }),
	//   to: new Date(),
	// });

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
				<div className="flex flex-1 items-center gap-2">
					<Input
						className="h-9 min-w-0 flex-1 sm:max-w-[280px]"
						placeholder="Suche…"
						value={globalFilterValue ?? ''}
						onChange={(value) =>
							setGlobalFilterValue(String(value.target.value))
						}
					/>
					<p className="hidden text-xs text-muted-foreground md:inline lg:max-w-md lg:text-sm">
						Filter können über die einzelnen Spalten gesetzt werden.
					</p>
				</div>
					{/* {filterColumns.map(({ column, label, isDate }) => {
            if (isDate) {
              return dateFilter({ column, label });
            }
            else {
              let opt: filterColumnOptions = [
                { label: "asdf", value: "asdf" }
              ]

              return facetedFilter({ column, label })
            };
          })} */}

				{isFiltered && (
					<Button
						className="h-9 shrink-0 px-3"
						variant="outline"
						onClick={() => table.resetColumnFilters()}
					>
						Filter zurücksetzen
						<Cross2Icon className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>

			<div className="flex shrink-0 flex-row flex-wrap items-center gap-2 self-stretch sm:self-auto">
				<Button
					type="button"
					variant="outline"
					className="h-9 shrink-0 self-stretch rounded-lg border-green-800 px-3 text-green-900 shadow-sm hover:border-green-900 hover:bg-green-950/5 hover:text-green-950 focus-visible:ring-2 focus-visible:ring-green-800/40 focus-visible:ring-offset-2 sm:self-auto"
					onClick={saveAction}
				>
					Export als csv
				</Button>
				{toolbarTrailing}
			</div>
			{/* <DataTableViewOptions table={table} /> */}
		</div>
	);
}
