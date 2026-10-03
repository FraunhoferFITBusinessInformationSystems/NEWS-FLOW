import { parseGermanDate } from '@/lib/utils/dashboard';

/** Inclusive calendar range for map blue dot: from this local midnight through now (today + 4 days back = 5 dates). */
export const RECENT_WATERING_CALENDAR_DAYS_BACK = 4;

const DE_DATE: Intl.DateTimeFormatOptions = {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
};

function startOfLocalDay(reference: Date): Date {
	return new Date(
		reference.getFullYear(),
		reference.getMonth(),
		reference.getDate(),
		0,
		0,
		0,
		0,
	);
}

/**
 * Local midnight on the calendar day that is `days` before `startOfDay` (e.g. 01.04. → minus 4 → 28.03. 00:00).
 */
function subtractCalendarDaysFromStartOfDay(startOfDay: Date, days: number): Date {
	const result = new Date(startOfDay);
	result.setDate(result.getDate() - days);
	result.setHours(0, 0, 0, 0);
	return result;
}

/**
 * Inclusive lower bound for “kürzlich bewässert” (blauer Punkt): local midnight on the
 * 4th calendar day before today, so the window covers today and the four previous days
 * (e.g. heute 01.04.26 → ab 28.03.26 00:00 lokal).
 */
export function getRecentWateringWindowStart(referenceNow: Date = new Date()): Date {
	const todayStart = startOfLocalDay(referenceNow);
	return subtractCalendarDaysFromStartOfDay(
		todayStart,
		RECENT_WATERING_CALENDAR_DAYS_BACK,
	);
}

/** Short German label for map debug (range from oldest included day through today). */
export function formatRecentWateringWindowLabelDe(referenceNow: Date = new Date()): string {
	const start = getRecentWateringWindowStart(referenceNow);
	const todayStart = startOfLocalDay(referenceNow);
	const startStr = start.toLocaleDateString('de-DE', DE_DATE);
	const todayStr = todayStart.toLocaleDateString('de-DE', DE_DATE);
	return `seit ${startStr} bis ${todayStr} einschließlich (${RECENT_WATERING_CALENDAR_DAYS_BACK} Kalendertage zurück ab heute)`;
}

/**
 * Parses overview-style date strings. Supports ISO and German calendar dates (DD.MM.YYYY).
 */
function parseDurchfuehrungVonToTime(value: string): number | null {
	const trimmed = value.trim();
	if (trimmed === '') return null;

	const isoMs = Date.parse(trimmed);
	if (!Number.isNaN(isoMs)) return isoMs;

	const datePart = trimmed.split(/[\sT]/)[0] ?? trimmed;
	if (!/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(datePart)) return null;

	const parsed = parseGermanDate(datePart);
	const ms = parsed.getTime();
	return Number.isNaN(ms) ? null : ms;
}

/**
 * True when the timestamp falls in [getRecentWateringWindowStart, now] (local calendar window)
 * and is not in the future.
 */
export function hasRecordedLastWatering(
	value: string | null | undefined,
	referenceNow: Date = new Date(),
): boolean {
	if (value == null) return false;
	const ms = parseDurchfuehrungVonToTime(String(value));
	if (ms == null) return false;
	const now = referenceNow.getTime();
	if (ms > now) return false;
	const windowStart = getRecentWateringWindowStart(referenceNow).getTime();
	return ms >= windowStart;
}

/**
 * `last_watering_at` from `v_soilmoisture_latest_earliest_per_sensor_copy`. Blue dot when set and
 * inside the same window as {@link getRecentWateringWindowStart}.
 */
export function isRecentCompletedWateringAt(
	lastWateringAt: string | null | undefined,
	referenceNow: Date = new Date(),
): boolean {
	if (lastWateringAt == null || String(lastWateringAt).trim() === '') {
		return false;
	}
	return hasRecordedLastWatering(lastWateringAt, referenceNow);
}
