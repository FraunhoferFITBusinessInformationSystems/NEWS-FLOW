'use client';

import type {
	ComparisonSeriesItem,
	SoilMoistureDataPoint,
	SollZustandData,
} from '@/lib/types/dashboard';
import { parseGermanDate } from '@/lib/utils/dashboard';
import { useCallback, useMemo, useState } from 'react';
import {
	CartesianGrid,
	ComposedChart,
	DefaultTooltipContent,
	Legend,
	Line,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';

interface LineChartComponentProps {
	data: SoilMoistureDataPoint[];
	startDate?: string;
	endDate?: string;
	sollZustandData?: SollZustandData;
	comparisonSeries?: ComparisonSeriesItem[];
}

/** Hauptserie (ohne Vergleich): ursprüngliche Farben beibehalten. */
const DEPTH_COLORS = {
	cm30: '#3B82F6',
	cm60: '#10B981',
	cm90: '#F59E0B',
} as const;

/**
 * Vergleichslinien: feste Farbfamilie pro Mess-Tiefe. Wir verwenden ausschließlich
 * bereits im Projekt genutzte Vergleichsfarben (ohne die Hauptserienfarben) und ordnen
 * sie als 4-stufigen Verlauf von dunkel → hell an. Die eigentliche Zuordnung pro Jahr
 * erfolgt dynamisch in Abhängigkeit von der Anzahl gewählter Vergleichsjahre.
 */
const COMPARISON_DEPTH_GRADIENT_COLORS: Record<
	DepthKey,
	readonly [string, string, string, string]
> = {
	// 30 cm: bestehende Vergleichs-Blautöne, ohne Überschneidung mit der Hauptserie
	cm30: ['#1E3A8A', '#0369A1', '#38BDF8', '#2DD4BF'],
	// 60 cm: bestehende Vergleichs-Grüntöne, ohne Überschneidung mit der Hauptserie
	cm60: ['#14532D', '#15803D', '#65A30D', '#A3E635'],
	// 90 cm: bestehende Warmtöne, ohne Überschneidung mit der Hauptserie
	cm90: ['#DC2626', '#EA580C', '#EC4899', '#FB7185'],
};

/** Einheitliche Strichelung für alle Vergleichslinien — Farbe ist Hauptunterscheidung. */
const COMPARISON_DASH = '6 4' as const;

type DepthKey = keyof typeof DEPTH_COLORS;

function getComparisonLineColor(
	depthKey: DepthKey,
	yearIndex: number,
	comparisonYearCount: number,
): string {
	const palette = COMPARISON_DEPTH_GRADIENT_COLORS[depthKey];
	const totalYears = Math.max(1, Math.min(comparisonYearCount, 4));

	// Ältestes Jahr soll innerhalb der genutzten Stufen den hellsten, das jüngste den
	// dunkelsten Ton bekommen. Die hellste Stufe (Index 3) wird nur bei >= 4 Jahren benutzt.
	let indexFromOldest: number;
	switch (totalYears) {
		case 1: {
			// Nur der dunkelste Ton.
			indexFromOldest = 0;
			break;
		}
		case 2: {
			// Zwei dunklere Töne.
			const mapping = [1, 0] as const;
			indexFromOldest = mapping[yearIndex] ?? mapping[mapping.length - 1];
			break;
		}
		case 3: {
			// Drei Töne, aber noch nicht der allerdhellste:
			// nutzen Stufen 0–2 und verteilen hell → dunkel.
			const mapping = [2, 1, 0] as const;
			indexFromOldest = mapping[yearIndex] ?? mapping[mapping.length - 1];
			break;
		}
		default: {
			// Ab 4 Jahren: voller Verlauf (Index 0–3), ältestes = hellstes (3), jüngstes = dunkelstes (0).
			const mapping = [3, 2, 1, 0] as const;
			const safeIndex =
				yearIndex >= mapping.length ? mapping.length - 1 : yearIndex;
			indexFromOldest = mapping[safeIndex];
			break;
		}
	}

	return palette[indexFromOldest]!;
}

function depthKeyFromDataKey(dataKey: string | undefined): DepthKey | null {
	if (!dataKey) return null;
	if (dataKey === 'cm30' || dataKey.endsWith('_30')) return 'cm30';
	if (dataKey === 'cm60' || dataKey.endsWith('_60')) return 'cm60';
	if (dataKey === 'cm90' || dataKey.endsWith('_90')) return 'cm90';
	return null;
}

/**
 * Tooltip/Legende-Logik: 30 → 60 → 90, innerhalb jeder Tiefe nach Kalenderjahr absteigend
 * (Hauptserie nutzt dasselbe Sortierjahr wie der gewählte Hauptzeitraum).
 */
function tooltipSeriesSortKey(
	dataKey: string,
	mainPeriodSortYear: number,
): [number, number] {
	if (dataKey === 'cm30') return [0, mainPeriodSortYear];
	if (dataKey === 'cm60') return [1, mainPeriodSortYear];
	if (dataKey === 'cm90') return [2, mainPeriodSortYear];
	const m = /^y(\d+)_(30|60|90)$/.exec(dataKey);
	if (m) {
		const depthRank = m[2] === '30' ? 0 : m[2] === '60' ? 1 : 2;
		return [depthRank, Number.parseInt(m[1], 10)];
	}
	return [99, 0];
}

/** Einmal pro merged chart table: welche dataKeys haben mindestens einen endlichen Zahlenwert. */
function buildDataKeysWithPoints(rows: Record<string, unknown>[]): Set<string> {
	const s = new Set<string>();
	for (const row of rows) {
		for (const [k, v] of Object.entries(row)) {
			if (k === 'date') continue;
			if (typeof v === 'number' && Number.isFinite(v)) s.add(k);
		}
	}
	return s;
}

type VisibleDepths = Record<DepthKey, boolean>;

const defaultVisibleDepths: VisibleDepths = {
	cm30: true,
	cm60: true,
	cm90: true,
};

/**
 * Gleiche Struktur wie Recharts-Standard-Tooltip (DefaultTooltipContent), plus Filter/Sortierung
 * nach sichtbaren Tiefen — für Hauptserie und Vergleich identisch.
 */
function SoilMoistureTooltipBody(
	props: TooltipProps<number, string> & {
		visibleDepths: VisibleDepths;
		mainPeriodSortYear: number;
	},
) {
	const {
		active,
		payload,
		label,
		visibleDepths,
		mainPeriodSortYear,
		contentStyle,
		itemStyle,
		labelStyle,
		separator,
		formatter: propsFormatter,
	} = props;

	if (!active || !payload?.length) return null;

	const filtered = payload.filter((item) => {
		const key = item.dataKey?.toString();
		const depth = depthKeyFromDataKey(key);
		return depth !== null && visibleDepths[depth];
	});

	if (filtered.length === 0) return null;

	const sortedPayload = [...filtered].sort((a, b) => {
		const ka = String(a.dataKey ?? '');
		const kb = String(b.dataKey ?? '');
		const [da, ya] = tooltipSeriesSortKey(ka, mainPeriodSortYear);
		const [db, yb] = tooltipSeriesSortKey(kb, mainPeriodSortYear);
		if (da !== db) return da - db;
		return yb - ya;
	});

	const kpaFormatter: NonNullable<TooltipProps<number, string>['formatter']> = (
		value,
		name,
		item,
		index,
		p,
	) => {
		if (typeof value === 'number') {
			return [`${value.toFixed(2)} kPa`, name];
		}
		if (propsFormatter) {
			return propsFormatter(value, name, item, index, p);
		}
		return [String(value), name];
	};

	const formattedLabel =
		typeof label === 'number'
			? new Date(label).toLocaleDateString('de-DE', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
				})
			: label;

	return (
		<DefaultTooltipContent
			contentStyle={contentStyle}
			itemStyle={itemStyle}
			labelStyle={labelStyle}
			label={formattedLabel}
			payload={sortedPayload}
			formatter={kpaFormatter}
			separator={separator ?? ' : '}
		/>
	);
}

export default function LineChartComponent({
	data,
	startDate,
	endDate,
	sollZustandData,
	comparisonSeries = [],
}: LineChartComponentProps) {
	const [showThresholds, setShowThresholds] = useState(true);
	const [showHint, setShowHint] = useState(false);
	const [visibleDepths, setVisibleDepths] =
		useState<VisibleDepths>(defaultVisibleDepths);

	const thresholds = useMemo(() => {
		if (!sollZustandData) return [];
		return Object.values(sollZustandData);
	}, [sollZustandData]);

	const parseDate = (str: string) => {
		const [day, month, year] = str.split('.').map(Number);
		return new Date(year, month - 1, day);
	};

	const toDateOnly = (date: Date) =>
		new Date(date.getFullYear(), date.getMonth(), date.getDate());

	const filterByDateRange = useCallback(
		(arr: SoilMoistureDataPoint[]) => {
			if (!startDate || !endDate) return arr;
			const start = toDateOnly(new Date(startDate));
			const end = toDateOnly(new Date(endDate));
			return arr.filter((d) => {
				const date = toDateOnly(parseDate(d.date));
				return date >= start && date <= end;
			});
		},
		[startDate, endDate],
	);

	const germanDateInMainRange = useCallback(
		(dateStr: string) => {
			if (!startDate || !endDate) return true;
			const start = toDateOnly(new Date(startDate));
			const end = toDateOnly(new Date(endDate));
			const t = toDateOnly(parseDate(dateStr));
			return t >= start && t <= end;
		},
		[startDate, endDate],
	);

	/** Sortierte Vergleichsjahre für stabile Farben / Legende. */
	const comparisonSorted = useMemo(
		() => [...comparisonSeries].sort((a, b) => a.year - b.year),
		[comparisonSeries],
	);

	const comparisonYearStyleIndex = useMemo(() => {
		const m = new Map<number, number>();
		comparisonSorted.forEach((s, i) => m.set(s.year, i));
		return m;
	}, [comparisonSorted]);

	const hasComparisonOverlay = comparisonSorted.length > 0;

	/**
	 * Base chart (no comparison): mergedData = filterByDateRange(data) only.
	 * With comparison: union of main + shifted comparison dates, same relative window.
	 */
	const mergedData = useMemo(() => {
		const mainFiltered = filterByDateRange(data);

		if (!hasComparisonOverlay) {
			return mainFiltered;
		}

		const mainByDate = new Map(mainFiltered.map((d) => [d.date, d]));
		const dateSet = new Set<string>();
		for (const d of mainFiltered) dateSet.add(d.date);
		for (const s of comparisonSorted) {
			for (const p of s.data) dateSet.add(p.date);
		}

		const comparisonMaps = comparisonSorted.map((s) => ({
			year: s.year,
			map: new Map(s.data.map((e) => [e.date, e])),
		}));

		const sortedDates = [...dateSet]
			.filter(germanDateInMainRange)
			.sort(
				(a, b) =>
					parseGermanDate(a).getTime() - parseGermanDate(b).getTime(),
			);

		return sortedDates.map((date) => {
			const out: Record<string, unknown> = { date };
			const main = mainByDate.get(date);
			if (main) {
				out.cm30 = main.cm30;
				out.cm60 = main.cm60;
				out.cm90 = main.cm90;
			}
			for (const { year, map } of comparisonMaps) {
				const cmp = map.get(date);
				if (cmp) {
					out[`y${year}_30`] = cmp.cm30;
					out[`y${year}_60`] = cmp.cm60;
					out[`y${year}_90`] = cmp.cm90;
				}
			}
			return out;
		});
	}, [
		data,
		comparisonSorted,
		filterByDateRange,
		germanDateInMainRange,
		hasComparisonOverlay,
	]);

	const filteredData = useMemo(
		(): Record<string, unknown>[] =>
			mergedData.map((row) => ({
				...row,
				date: parseGermanDate(row.date as string).getTime(),
			})),
		[mergedData],
	);

	useMemo(() => {
		return filteredData.map((row) => {
			const cleaned: Record<string, unknown> = {};
			for (const [key, value] of Object.entries(row)) {
				if (value === null) {
					setShowHint(true);
				} 
			}
			return cleaned;
		});
	}, [filteredData]);

	const dataKeysWithPoints = useMemo(
		() => buildDataKeysWithPoints(filteredData),
		[filteredData],
	);

	const comparisonYears = useMemo(
		() => comparisonSorted.map((s) => s.year),
		[comparisonSorted],
	);

	const isCrossYearRange =
		!!startDate &&
		!!endDate &&
		new Date(startDate).getFullYear() !== new Date(endDate).getFullYear();

	const formatYearLabel = (year: number) => {
		if (!isCrossYearRange) return String(year);
		const shortStart = String(year).slice(2);
		const shortEnd = String(year + 1).slice(2);
		return `${shortStart}/${shortEnd}`;
	};

	const mainPeriodLabel = useMemo(() => {
		if (!startDate) return 'Hauptzeitraum';
		const y = new Date(startDate).getFullYear();
		return formatYearLabel(y);
	}, [startDate, isCrossYearRange]);

	/** Gleiches Basisjahr wie die Hauptserie-Bezeichnung — für Tooltip-Sortierung nach Jahr. */
	const mainPeriodSortYear = useMemo(() => {
		if (!startDate) return new Date().getFullYear();
		return new Date(startDate).getFullYear();
	}, [startDate]);

	/** Nur für Render-Reihenfolge (Legende): Vergleichsjahre absteigend — Farben/Merge nutzen weiter ascending. */
	const comparisonSortedDesc = useMemo(
		() => [...comparisonSorted].sort((a, b) => b.year - a.year),
		[comparisonSorted],
	);

	const numericValues = useMemo(() => {
		const values: number[] = [];
		for (const row of filteredData) {
			if (visibleDepths.cm30 && typeof row.cm30 === 'number' && row.cm30 !== 0)
				values.push(row.cm30);
			if (visibleDepths.cm60 && typeof row.cm60 === 'number' && row.cm60 !== 0)
				values.push(row.cm60);
			if (visibleDepths.cm90 && typeof row.cm90 === 'number' && row.cm90 !== 0)
				values.push(row.cm90);
			for (const year of comparisonYears) {
				const k30 = `y${year}_30`;
				const k60 = `y${year}_60`;
				const k90 = `y${year}_90`;
				if (visibleDepths.cm30 && typeof row[k30] === 'number')
					values.push(row[k30] as number);
				if (visibleDepths.cm60 && typeof row[k60] === 'number')
					values.push(row[k60] as number);
				if (visibleDepths.cm90 && typeof row[k90] === 'number')
					values.push(row[k90] as number);
			}
		}
		return values;
	}, [filteredData, visibleDepths, comparisonYears]);

	const anyDepthVisible =
		visibleDepths.cm30 || visibleDepths.cm60 || visibleDepths.cm90;

	const isEmpty = numericValues.length === 0 && filteredData.length === 0;
	const noVisibleSeries =
		filteredData.length > 0 && numericValues.length === 0 && anyDepthVisible;

	const { minY, maxY } = useMemo(() => {
		const threshPart = showThresholds ? thresholds : [];
		const combined = [...numericValues, ...threshPart];
		if (combined.length === 0) return { minY: 0, maxY: 10 };
		const rawMin = Math.min(...combined);
		const rawMax = Math.max(...combined);
		const span = rawMax - rawMin || 1;
		const pad = Math.max(5, span * 0.06);
		return {
			minY: rawMin - pad * 0.35,
			maxY: rawMax + pad,
		};
	}, [numericValues, thresholds, showThresholds]);

	const toggleDepth = (key: DepthKey) => {
		setVisibleDepths((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const tooltipContent = useCallback(
		(props: TooltipProps<number, string>) => (
			<SoilMoistureTooltipBody
				{...props}
				visibleDepths={visibleDepths}
				mainPeriodSortYear={mainPeriodSortYear}
			/>
		),
		[visibleDepths, mainPeriodSortYear],
	);

	const chartAreaClassName =
		'h-[300px] w-full min-h-0 sm:h-auto sm:flex-1';

	return (
		<div className="flex w-full flex-col sm:h-[400px]">
			<div className="mb-2 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-lg font-semibold text-gray-800">
					Bodenwasserspannung (kPa)
				</h2>
				<div className="flex flex-wrap items-center gap-4">
					<fieldset className="flex flex-wrap items-center gap-3 border-0 p-0">
						<legend className="sr-only">Mess-Tiefen ein- und ausblenden</legend>
						{(['cm30', 'cm60', 'cm90'] as const).map((key) => (
							<label
								key={key}
								className="flex cursor-pointer items-center gap-1.5 text-sm text-black"
							>
								<input
									type="checkbox"
									checked={visibleDepths[key]}
									onChange={() => toggleDepth(key)}
									className="accent-green-600"
									aria-label={
										key === 'cm30'
											? '30 cm anzeigen'
											: key === 'cm60'
												? '60 cm anzeigen'
												: '90 cm anzeigen'
									}
								/>
								<span className="inline-flex items-center gap-1 text-black">
									{key === 'cm30' ? '30 cm' : key === 'cm60' ? '60 cm' : '90 cm'}
								</span>
							</label>
						))}
					</fieldset>
					<label className="flex items-center text-sm text-gray-600">
						<input
							type="checkbox"
							checked={showThresholds}
							onChange={() => setShowThresholds(!showThresholds)}
							className="mr-2 accent-green-600"
						/>
						Schwellenwerte anzeigen
					</label>
				</div>
			</div>

			{isEmpty ? (
				<div
					className={`flex items-center justify-center text-gray-500 italic ${chartAreaClassName}`}
				>
					Keine Daten allgemein oder für den gewählten Zeitraum vorhanden.
				</div>
			) : !anyDepthVisible ? (
				<div
					className={`flex items-center justify-center text-gray-500 italic ${chartAreaClassName}`}
				>
					Bitte mindestens eine Mess-Tiefe (30 / 60 / 90 cm) aktivieren.
				</div>
			) : noVisibleSeries ? (
				<div
					className={`flex items-center justify-center text-gray-500 italic ${chartAreaClassName}`}
				>
					Für die gewählten Tiefen liegen im Zeitraum keine Messwerte vor.
				</div>
			) : (
				<div className={chartAreaClassName}>
					<ResponsiveContainer
						width="100%"
						height="100%"
					>
					<ComposedChart
						data={filteredData}
						margin={{ top: 20, right: 50, left: 0, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
						<XAxis
							dataKey="date"
							type="number"
							scale="time"
							domain={['dataMin', 'dataMax']}
							tickFormatter={(ts: number) =>
								new Date(ts).toLocaleDateString('de-DE', {
									day: '2-digit',
									month: '2-digit',
								})
							}
							tick={{ fontSize: 12, fill: '#4B5563' }}
						/>
						<YAxis
							yAxisId={0}
							unit=" kPa"
							tick={{ fontSize: 12, fill: '#4B5563' }}
							domain={[minY, maxY]}
							tickFormatter={(value) => Math.round(value).toString()}
						/>
						<Tooltip content={tooltipContent} />
						<Legend
							verticalAlign="top"
							align="right"
							wrapperStyle={{ fontSize: 12 }}
						/>
						{visibleDepths.cm30 && dataKeysWithPoints.has('cm30') && (
							<Line
								yAxisId={0}
								type="monotone"
								dataKey="cm30"
								stroke={DEPTH_COLORS.cm30}
								name={`30 cm (${mainPeriodLabel})`}
								strokeWidth={2.5}
								dot={false}
								connectNulls={hasComparisonOverlay}
							/>
						)}
						{comparisonSortedDesc.map(({ year }) => {
							const yearIndex =
								comparisonYearStyleIndex.get(year) ?? 0;
							const yLabel = formatYearLabel(year);
							const n = comparisonSorted.length;
							const stroke = getComparisonLineColor(
								'cm30',
								yearIndex,
								n,
							);
							return (
								visibleDepths.cm30 &&
								dataKeysWithPoints.has(`y${year}_30`) && (
									<Line
										key={`y${year}_30`}
										yAxisId={0}
										type="monotone"
										dataKey={`y${year}_30`}
										stroke={stroke}
										name={`30 cm (${yLabel})`}
										strokeWidth={2}
										strokeDasharray={COMPARISON_DASH}
										dot={false}
										connectNulls
									/>
								)
							);
						})}
						{visibleDepths.cm60 && dataKeysWithPoints.has('cm60') && (
							<Line
								yAxisId={0}
								type="monotone"
								dataKey="cm60"
								stroke={DEPTH_COLORS.cm60}
								name={`60 cm (${mainPeriodLabel})`}
								strokeWidth={2.5}
								dot={false}
								connectNulls={hasComparisonOverlay}
							/>
						)}
						{comparisonSortedDesc.map(({ year }) => {
							const yearIndex =
								comparisonYearStyleIndex.get(year) ?? 0;
							const yLabel = formatYearLabel(year);
							const n = comparisonSorted.length;
							const stroke = getComparisonLineColor(
								'cm60',
								yearIndex,
								n,
							);
							return (
								visibleDepths.cm60 &&
								dataKeysWithPoints.has(`y${year}_60`) && (
									<Line
										key={`y${year}_60`}
										yAxisId={0}
										type="monotone"
										dataKey={`y${year}_60`}
										stroke={stroke}
										name={`60 cm (${yLabel})`}
										strokeWidth={2}
										strokeDasharray={COMPARISON_DASH}
										dot={false}
										connectNulls
									/>
								)
							);
						})}
						{visibleDepths.cm90 && dataKeysWithPoints.has('cm90') && (
							<Line
								yAxisId={0}
								type="monotone"
								dataKey="cm90"
								stroke={DEPTH_COLORS.cm90}
								name={`90 cm (${mainPeriodLabel})`}
								strokeWidth={2.5}
								dot={false}
								connectNulls={hasComparisonOverlay}
							/>
						)}
						{comparisonSortedDesc.map(({ year }) => {
							const yearIndex =
								comparisonYearStyleIndex.get(year) ?? 0;
							const yLabel = formatYearLabel(year);
							const n = comparisonSorted.length;
							const stroke = getComparisonLineColor(
								'cm90',
								yearIndex,
								n,
							);
							return (
								visibleDepths.cm90 &&
								dataKeysWithPoints.has(`y${year}_90`) && (
									<Line
										key={`y${year}_90`}
										yAxisId={0}
										type="monotone"
										dataKey={`y${year}_90`}
										stroke={stroke}
										name={`90 cm (${yLabel})`}
										strokeWidth={2}
										strokeDasharray={COMPARISON_DASH}
										dot={false}
										connectNulls
									/>
								)
							);
						})}
						{showThresholds &&
							thresholds.map((val, idx) => (
								<ReferenceLine
									key={`threshold-${idx}-${val}`}
									y={val}
									yAxisId={0}
									isFront
									ifOverflow="visible"
									stroke="#9333EA"
									strokeWidth={3}
									strokeDasharray="4 4"
									label={{
										value: `${val} kPa`,
										position: 'right',
										fill: '#7C3AED',
										fontSize: 12,
									}}
								/>
							))}
					</ComposedChart>
					</ResponsiveContainer>
					{showHint  && (
						<div className="flex items-center justify-center text-gray-500 italic">
							Fehlende Linien im Graphen sind auf fehlerhafte Sensorwerte zurückzuführen.
						</div>
					)}
				</div>
			)}
		</div>
	);
}
