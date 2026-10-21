'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import type { Table } from '@tanstack/react-table';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import type React from 'react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQueryState } from 'nuqs';

// Flattens nested objects into a single level for the CSV export, joining the
// keys with the delimiter, e.g. { tree: { site: 'A' } } becomes
// { 'tree.site': 'A' }.
function flattenObject(
	obj: Record<string, unknown>,
	delimiter = '.',
	prefix = '',
): Record<string, unknown> {
	return Object.keys(obj).reduce<Record<string, unknown>>((acc, key) => {
		const pre = prefix.length ? `${prefix}${delimiter}` : '';
		const value = obj[key];

		if (
			typeof value === 'object' &&
			value !== null &&
			Object.keys(value).length > 0
		) {
			Object.assign(
				acc,
				flattenObject(value as Record<string, unknown>, delimiter, pre + key),
			);
		} else {
			acc[pre + key] = value;
		}

		return acc;
	}, {});
}

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	data: TData[];
	globalFilterValue: string;
	setGlobalFilterValue: React.Dispatch<React.SetStateAction<string>>;
	/** When set, CSV export uses these keys/values instead of flattening raw row objects. */
	csvExportRowMapper?: (
		row: TData,
	) => Record<string, string | number | boolean | null>;
	csvExportFilename?: string;
	/** Rendered to the right of the CSV export button, same toolbar row (e.g. primary actions). */
	toolbarTrailing?: React.ReactNode;
}

/**
 * Search field, reset button and CSV export above the data table. The search
 * term is kept in the URL as `?search=`. The export contains the rows that
 * match the current filters, mapped by csvExportRowMapper when given and
 * flattened otherwise.
 */
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

	// URL -> search field: a shared link with ?search=… fills the search field.
	useEffect(() => {
		if (search) {
			setGlobalFilterValue(search ?? '');
		}
	}, [search, setGlobalFilterValue]);

	// Search field -> URL: typing updates ?search=, clearing the field removes it.
	// biome-ignore lint/correctness/useExhaustiveDependencies: search is read but must not trigger this effect. On a page load with ?search=… the field is still empty in the first render, so re-running on search would delete the URL value before the effect above can copy it into the field.
	useEffect(() => {
		if (globalFilterValue) {
			setSearch(globalFilterValue);
		} else if (search && !globalFilterValue) {
			setSearch(null);
		}
	}, [globalFilterValue, setSearch]);

	const isFiltered = table.getState().columnFilters.length > 0;

	const saveAction = () => {
		// Export all rows matching current filters/sort, not only the current page.
		const flatRows = table.getPrePaginationRowModel().flatRows;
		const res = csvExportRowMapper
			? flatRows.map((v) => csvExportRowMapper(v.original))
			: flatRows.map((v) =>
					flattenObject(v.original as Record<string, unknown>),
				);

		const csv = Papa.unparse(res);

		const file = new Blob([csv], { type: 'text/plain;charset=utf-8' });

		saveAs(file, csvExportFilename ?? 'export.csv');
	};

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
		</div>
	);
}
