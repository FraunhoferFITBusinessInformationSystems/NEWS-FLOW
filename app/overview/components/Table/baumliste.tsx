'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import type { TreeMapPinColor } from '@/lib/leaflet/map-icons';
import { cn } from '@/lib/utils';
import {
	getWateringNeedCategory,
	isSoilMeasurementStale,
	WATERING_NEED_LABEL_DE,
} from '@/lib/utils/watering-need-category';
import {
	createColumnHelper,
	type ColumnDef,
	type Row,
} from '@tanstack/react-table';
import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { OverviewTableRow } from '../../actions';

interface TreeListProps {
	rows: OverviewTableRow[];
}

/** Empty / null / literal "null" last when sorting ascending (multi-sort friendly). */
function sortGermanTextEmptyLast(
	rowA: Row<OverviewTableRow>,
	rowB: Row<OverviewTableRow>,
	columnId: string,
): number {
	const a = rowA.getValue(columnId) as string | null | undefined;
	const b = rowB.getValue(columnId) as string | null | undefined;
	const emptyA =
		a == null ||
		String(a).trim() === '' ||
		String(a).trim().toLowerCase() === 'null';
	const emptyB =
		b == null ||
		String(b).trim() === '' ||
		String(b).trim().toLowerCase() === 'null';
	if (emptyA && emptyB) return 0;
	if (emptyA) return 1;
	if (emptyB) return -1;
	return String(a).localeCompare(String(b), 'de', { sensitivity: 'base' });
}

function sortNumberEmptyLast(
	rowA: Row<OverviewTableRow>,
	rowB: Row<OverviewTableRow>,
	columnId: string,
): number {
	const a = rowA.getValue(columnId) as number | null | undefined;
	const b = rowB.getValue(columnId) as number | null | undefined;
	const emptyA = a == null || Number.isNaN(Number(a));
	const emptyB = b == null || Number.isNaN(Number(b));
	if (emptyA && emptyB) return 0;
	if (emptyA) return 1;
	if (emptyB) return -1;
	return Number(a) - Number(b);
}

function sortIsoDateEmptyLast(
	rowA: Row<OverviewTableRow>,
	rowB: Row<OverviewTableRow>,
	columnId: string,
): number {
	const a = rowA.getValue(columnId) as string | null | undefined;
	const b = rowB.getValue(columnId) as string | null | undefined;
	const emptyA =
		a == null ||
		String(a).trim() === '' ||
		String(a).trim().toLowerCase() === 'null';
	const emptyB =
		b == null ||
		String(b).trim() === '' ||
		String(b).trim().toLowerCase() === 'null';
	if (emptyA && emptyB) return 0;
	if (emptyA) return 1;
	if (emptyB) return -1;
	const ta = new Date(String(a)).getTime();
	const tb = new Date(String(b)).getTime();
	const na = Number.isNaN(ta);
	const nb = Number.isNaN(tb);
	if (na && nb) return 0;
	if (na) return 1;
	if (nb) return -1;
	return ta - tb;
}

function cellText(value: unknown): string {
	if (value == null) return '—';
	const s = String(value).trim();
	if (s === '' || s.toLowerCase() === 'null') return '—';
	return String(value);
}

function formatKpa(value: number | null | undefined): string {
	if (value == null || Number.isNaN(Number(value))) {
		return '—';
	}
	return `${Math.round(Number(value))} kPa`;
}

function formatSollPart(v: number | null | undefined): string {
	return v == null || Number.isNaN(Number(v)) ? '—' : String(Math.round(Number(v)));
}

function formatSollTriple(
	s30: number | null | undefined,
	s60: number | null | undefined,
	s90: number | null | undefined,
): string {
	return `${formatSollPart(s30)} / ${formatSollPart(s60)} / ${formatSollPart(s90)}`;
}

function formatDateTimeDe(value: string | null | undefined): string {
	if (value == null || String(value).trim() === '') {
		return '—';
	}
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) {
		return '—';
	}
	return d.toLocaleString('de-DE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

function formatDateDe(value: string | null | undefined): string {
	if (value == null || String(value).trim() === '') {
		return '—';
	}
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) {
		return '—';
	}
	return d.toLocaleDateString('de-DE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
}

function wateringNeedBadgeClassName(category: TreeMapPinColor): string {
	const map: Record<TreeMapPinColor, string> = {
		green:
			'border-green-600 bg-green-600/10 text-green-900 hover:bg-green-600/15',
		yellow:
			'border-yellow-500 bg-yellow-400/15 text-yellow-950 hover:bg-yellow-400/25',
		orange:
			'border-orange-500 bg-orange-500/10 text-orange-950 hover:bg-orange-500/15',
		red: 'border-red-600 bg-red-600/10 text-red-900 hover:bg-red-600/15',
		grey: 'border-gray-400 bg-gray-400/10 text-gray-900 hover:bg-gray-400/15',
		blue: 'border-blue-600 bg-blue-600/10 text-blue-950 hover:bg-blue-600/15',
	};
	return map[category];
}

function formatSensorCell(row: OverviewTableRow): string {
	const name = row.sensor_name;
	if (name != null && String(name).trim() !== '') {
		return name;
	}
	return row.sensor_id ?? '—';
}

/**
 * CSV rows aligned with visible table columns (German headers, formatted values).
 */
function mapOverviewTableRowToCsvRecord(
	row: OverviewTableRow,
): Record<string, string | number | boolean | null> {
	const measuredRaw = row.measured_at;
	const measuredFormatted = formatDateTimeDe(measuredRaw);
	const staleLabel =
		measuredRaw != null &&
		measuredFormatted !== '—' &&
		isSoilMeasurementStale(measuredRaw)
			? 'ja'
			: 'nein';

	const category = getWateringNeedCategory({
		kpa_ch1: row.kpa_ch1,
		kpa_ch2: row.kpa_ch2,
		kpa_ch3: row.kpa_ch3,
		measured_at: row.measured_at,
		sollwert_30cm: row.sollwert_30cm,
		sollwert_60cm: row.sollwert_60cm,
		sollwert_90cm: row.sollwert_90cm,
	});

	return {
		id: row.id ?? '',
		baum_id: row.baum_id ?? '',
		Bereich: cellText(row.objekt),
		Baum: cellText(row.baum_nr),
		'Gattung/Art': cellText(row.gattung_art),
		Bezirk: cellText(row.bezirk),
		Bewässerungsbereich: cellText(row.bewaesserungsbereich_name),
		'Bereich (BB)': cellText(row.bewaesserungsbereich_bereich),
		Standalter: row.standalter == null ? '' : String(row.standalter),
		Entwicklungsphase: cellText(row.entwicklungsphase),
		'Letzte Messung': measuredFormatted,
		'Messung veraltet': staleLabel,
		'kPa 30 cm': formatKpa(row.kpa_ch1),
		'kPa 60 cm': formatKpa(row.kpa_ch2),
		'kPa 90 cm': formatKpa(row.kpa_ch3),
		'Sollwerte kPa (30/60/90)': formatSollTriple(
			row.sollwert_30cm,
			row.sollwert_60cm,
			row.sollwert_90cm,
		),
		'Letzte Bewässerung': formatDateDe(row.last_watering_at),
		sensor_id: row.sensor_id ?? '',
		Sensor: formatSensorCell(row),
		Gießempfehlung: WATERING_NEED_LABEL_DE[category],
		Stadtteil: cellText(row.stadtteil),
		Pflegebereich:
			row.pflegebereich == null ? '' : String(row.pflegebereich),
		Bewässerungsgrund: cellText(row.bewaesserungsgrund),
	};
}

export function TreeList({ rows }: TreeListProps) {
	const router = useRouter();
	const columnHelper = createColumnHelper<OverviewTableRow>();

	const columns = [
		columnHelper.display({
			id: 'details',
			header: '',
			cell: ({ row }) => {
				const original = row.original;
				const id = original.baum_id ?? '';
				const objekt = original.objekt ?? '';
				const baum = original.baum_nr ?? '';
				return (
					<Button
						variant="outline"
						size="sm"
						className="shrink-0 gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-muted"
						onClick={() =>
							router.push(
								`/dashboard?id=${id}&objekt=${encodeURIComponent(objekt)}&baum=${encodeURIComponent(baum)}`,
							)
						}
					>
						<Info className="w-4 h-4" />
						Details
					</Button>
				);
			},
		}),
		columnHelper.accessor('objekt', {
			cell: (m) => cellText(m.getValue()),
			sortingFn: sortGermanTextEmptyLast,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="Objekt"
					isFilterable={true}
				/>
			),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor('baum_nr', {
			cell: (m) => cellText(m.getValue()),
			sortingFn: sortGermanTextEmptyLast,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="Baum"
					isFilterable={true}
				/>
			),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor('bezirk', {
			cell: (m) => cellText(m.getValue()),
			sortingFn: sortGermanTextEmptyLast,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="Bezirk"
					isFilterable={true}
				/>
			),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor(
			(row) =>
				getWateringNeedCategory({
					kpa_ch1: row.kpa_ch1,
					kpa_ch2: row.kpa_ch2,
					kpa_ch3: row.kpa_ch3,
					measured_at: row.measured_at,
					sollwert_30cm: row.sollwert_30cm,
					sollwert_60cm: row.sollwert_60cm,
					sollwert_90cm: row.sollwert_90cm,
				}),
			{
				id: 'giessbedarf',
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title="Gießempfehlung"
						isFilterable={true}
					/>
				),
				cell: (info) => {
					const category = info.getValue() as TreeMapPinColor;
					return (
						<Badge
							className={cn(
								'max-w-[14rem] whitespace-normal text-left font-normal',
								wateringNeedBadgeClassName(category),
							)}
						>
							{WATERING_NEED_LABEL_DE[category]}
						</Badge>
					);
				},
				filterFn: (row, id, value) => {
					return value.includes(row.getValue(id));
				},
			},
		),
		columnHelper.accessor('kpa_ch1', {
			cell: (info) => formatKpa(info.getValue() as number | null),
			sortingFn: sortNumberEmptyLast,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="kPa 30 cm"
					isFilterable={true}
				/>
			),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor('kpa_ch2', {
			cell: (info) => formatKpa(info.getValue() as number | null),
			sortingFn: sortNumberEmptyLast,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="kPa 60 cm"
					isFilterable={true}
				/>
			),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor('kpa_ch3', {
			cell: (info) => formatKpa(info.getValue() as number | null),
			sortingFn: sortNumberEmptyLast,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="kPa 90 cm"
					isFilterable={true}
				/>
			),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.display({
			id: 'sollwerte',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="Soll (kPa) 30/60/90"
					isFilterable={false}
				/>
			),
			cell: ({ row }) => (
				<span className="tabular-nums whitespace-nowrap">
					{formatSollTriple(
						row.original.sollwert_30cm,
						row.original.sollwert_60cm,
						row.original.sollwert_90cm,
					)}
				</span>
			),
		}),
		columnHelper.accessor('measured_at', {
			cell: (info) => {
				const raw = info.getValue() as string | null | undefined;
				const formatted = formatDateTimeDe(raw);
				const stale = raw != null && isSoilMeasurementStale(raw);
				return (
					<div
						className={cn(
							'flex min-w-[8rem] flex-col gap-0.5 rounded px-2 py-1',
							stale && formatted !== '—' && 'bg-muted',
						)}
					>
						<span>{formatted}</span>
						{stale && formatted !== '—' && (
							<span className="text-xs text-muted-foreground">veraltet</span>
						)}
					</div>
				);
			},
			sortingFn: sortIsoDateEmptyLast,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="Letzte Messung"
					isFilterable={true}
				/>
			),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor('last_watering_at', {
			cell: (info) => formatDateDe(info.getValue() as string | null),
			sortingFn: sortIsoDateEmptyLast,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="Letzte Bewässerung"
					isFilterable={true}
				/>
			),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor('gattung_art', {
			cell: (m) => cellText(m.getValue()),
			sortingFn: sortGermanTextEmptyLast,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="Gattung/Art"
					isFilterable={true}
				/>
			),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor('bewaesserungsbereich_name', {
			cell: (m) => cellText(m.getValue()),
			sortingFn: sortGermanTextEmptyLast,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="Bewässerungsbereich"
					isFilterable={true}
				/>
			),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor('bewaesserungsbereich_bereich', {
			cell: (m) => cellText(m.getValue()),
			sortingFn: sortGermanTextEmptyLast,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="Bereich (BB)"
					isFilterable={true}
				/>
			),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor('standalter', {
			cell: (m) => {
				const v = m.getValue();
				return v == null ? '—' : String(v);
			},
			sortingFn: sortNumberEmptyLast,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="Standalter"
					isFilterable={true}
				/>
			),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor('entwicklungsphase', {
			cell: (m) => cellText(m.getValue()),
			sortingFn: sortGermanTextEmptyLast,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="Entwicklungsphase"
					isFilterable={true}
				/>
			),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor('stadtteil', {
			cell: (m) => cellText(m.getValue()),
			sortingFn: sortGermanTextEmptyLast,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="Stadtteil"
					isFilterable={true}
				/>
			),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor('pflegebereich', {
			cell: (m) => {
				const v = m.getValue();
				return v == null ? '—' : String(v);
			},
			sortingFn: sortNumberEmptyLast,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="Pflegebereich"
					isFilterable={true}
				/>
			),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor('bewaesserungsgrund', {
			cell: (m) => cellText(m.getValue()),
			sortingFn: sortGermanTextEmptyLast,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="Bewässerungsgrund"
					isFilterable={true}
				/>
			),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.display({
			id: 'sensor',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title="Sensor"
					isFilterable={true}
				/>
			),
			cell: ({ row }) => {
				const name = row.original.sensor_name;
				const id = row.original.sensor_id;
				if (name && String(name).trim() !== '') {
					return name;
				}
				return id ?? '—';
			},
			filterFn: (row, _columnId, value) => {
				const name = row.original.sensor_name ?? '';
				const sid = row.original.sensor_id ?? '';
				return value.includes(name) || value.includes(sid);
			},
		}),
	] as ColumnDef<OverviewTableRow>[];

	if (!rows || rows.length === 0) {
		return (
			<p className="p-4 text-sm text-muted-foreground">
				Keine Bäume mit Sensordaten gefunden.
			</p>
		);
	}

	return (
		<DataTable<OverviewTableRow, unknown>
			data={rows}
			columns={columns}
			initialSorting={[
				{ id: 'objekt', desc: false },
				{ id: 'baum_nr', desc: false },
			]}
			sortingQueryParamKey="overviewTableSorting"
			persistSortingInQuery={false}
			csvExportRowMapper={mapOverviewTableRowToCsvRecord}
			csvExportFilename="overview-tabelle.csv"
		/>
	);
}
