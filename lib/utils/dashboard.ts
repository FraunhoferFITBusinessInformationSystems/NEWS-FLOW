/**
 * Dashboard utilities: sensor data transformation and date helpers for German date format.
 */

import type { SoilMoistureDataPoint } from '@/lib/types/dashboard';

/** Raw sensor row from v_soilmoisture_with_mapping (fields used by transformSensorData). */
export type RawSensorRow = {
	measured_at: string;
	kpa_ch1: number | null;
	kpa_ch2: number | null;
	kpa_ch3: number | null;
	[key: string]: unknown;
};

/**
 * Groups sensor rows by date (DD.MM.YYYY) and returns averaged kPa per depth.
 * @param data Raw sensor data from getFilteredTreeSensorData
 * @returns Sorted array of data points per date
 */
export function transformSensorData(data: RawSensorRow[]): SoilMoistureDataPoint[] {
	const grouped: Record<string, RawSensorRow[]> = {};

	for (const entry of data) {
		const dateObj = new Date(entry.measured_at);
		const day = String(dateObj.getDate()).padStart(2, '0');
		const month = String(dateObj.getMonth() + 1).padStart(2, '0');
		const year = dateObj.getFullYear();
		const dateKey = `${day}.${month}.${year}`;
		if (!grouped[dateKey]) grouped[dateKey] = [];
		grouped[dateKey].push(entry);
	}

	const result: SoilMoistureDataPoint[] = Object.entries(grouped).map(
		([date, entries]) => {
			const avg = (field: keyof RawSensorRow) => {
				const validValues = entries
					.map(cur => cur[field])
					.filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
					.map(v => Number(v));
				
				if (validValues.length === 0) return null; // or NaN?
				return validValues.reduce((a, b) => a + b, 0) / validValues.length;
			};
			return {
				date,
				cm30: avg('kpa_ch1'),
				cm60: avg('kpa_ch2'),
				cm90: avg('kpa_ch3'),
			};
		},
	);

	result.sort((a, b) => {
		const [dayA, monthA, yearA] = a.date.split('.').map(Number);
		const [dayB, monthB, yearB] = b.date.split('.').map(Number);
		return (
			new Date(yearA, monthA - 1, dayA).getTime() -
			new Date(yearB, monthB - 1, dayB).getTime()
		);
	});

	return result;
}

/**
 * Default date range for chart: last 30 days (start/end of day in ISO).
 * @returns Object with start and end ISO date strings
 */
export function getDefaultDateRange(): { start: string; end: string } {
	const end = new Date();
	const start = new Date();
	start.setDate(end.getDate() - 30);
	start.setHours(0, 0, 0, 0);
	end.setHours(23, 59, 59, 999);
	return {
		start: start.toISOString(),
		end: end.toISOString(),
	};
}

/** Formats an ISO date string to German locale (e.g. "24.02.2025"). */
export function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString('de-DE');
}

/**
 * Parses German date string (DD.MM.YYYY) to Date.
 * @param dateStr Date in format DD.MM.YYYY
 */
export function parseGermanDate(dateStr: string): Date {
	const [day, month, year] = dateStr.split('.').map(Number);
	return new Date(year, month - 1, day);
}

/** Formats a Date to German date string DD.MM.YYYY. */
export function formatGermanDate(dateObj: Date): string {
	const day = String(dateObj.getDate()).padStart(2, '0');
	const month = String(dateObj.getMonth() + 1).padStart(2, '0');
	const year = dateObj.getFullYear();
	return `${day}.${month}.${year}`;
}

/**
 * Shifts an ISO date string by a number of years.
 * @param dateStr ISO date string
 * @param yearDelta Number of years to add (negative to go back)
 */
export function shiftIsoDateByYears(dateStr: string, yearDelta: number): string {
	const date = new Date(dateStr);
	date.setFullYear(date.getFullYear() + yearDelta);
	return date.toISOString();
}

/**
 * Shifts each data point's date by yearDelta (for comparison overlay).
 * @param data Series of soil moisture points with German dates
 * @param yearDelta Years to add to each date
 */
export function shiftGermanDateSeriesByYears(
	data: SoilMoistureDataPoint[],
	yearDelta: number,
): SoilMoistureDataPoint[] {
	if (yearDelta === 0) return data;
	return data.map((entry) => {
		const dateObj = parseGermanDate(entry.date);
		dateObj.setFullYear(dateObj.getFullYear() + yearDelta);
		return {
			...entry,
			date: formatGermanDate(dateObj),
		};
	});
}

/** Hard lower bound for comparison-year probes (avoid unbounded API load). */
export const DASHBOARD_COMPARISON_ABS_MIN_YEAR = 2000;

/**
 * How many calendar years before/after `baseYear` to probe (excluding baseYear itself).
 * Smaller span = fewer parallel API calls → faster option loading in dashboard.
 * Span 5 → max ~10 candidates; Span 7 → ~14.
 */
export const DASHBOARD_COMPARISON_YEAR_SPAN = 5;

/**
 * Upper calendar year (inclusive) to probe for comparison data.
 * Allows future years when the main range is in the past or near-present.
 */
export function getDashboardComparisonMaxProbeYear(baseYear: number): number {
	const current = new Date().getFullYear();
	return Math.max(current + 2, baseYear + 5);
}

/**
 * Calendar years to fetch for Bodenwasserspannung comparison overlay.
 * Excludes `baseYear` (same ISO window as the main chart — would duplicate the main series).
 * Past and future years: symmetric span around baseYear, clamped to [ABS_MIN_YEAR, maxProbeYear].
 */
export function getDashboardComparisonCandidateYears(baseYear: number): number[] {
	const maxY = getDashboardComparisonMaxProbeYear(baseYear);
	const years: number[] = [];
	for (
		let delta = -DASHBOARD_COMPARISON_YEAR_SPAN;
		delta <= DASHBOARD_COMPARISON_YEAR_SPAN;
		delta++
	) {
		if (delta === 0) continue;
		const y = baseYear + delta;
		if (y < DASHBOARD_COMPARISON_ABS_MIN_YEAR || y > maxY) continue;
		years.push(y);
	}
	return years.sort((a, b) => a - b);
}
