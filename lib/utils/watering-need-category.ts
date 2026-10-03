import { getStatusColor } from '@/components/data-display/StatusColoring';
import type { TreeMapPinColor } from '@/lib/leaflet/map-icons';

export interface WateringNeedCategoryInput {
	readonly kpa_ch1: number | null | undefined;
	readonly kpa_ch2: number | null | undefined;
	readonly kpa_ch3: number | null | undefined;
	readonly measured_at: string | null | undefined;
	readonly sollwert_30cm: number | null | undefined;
	readonly sollwert_60cm: number | null | undefined;
	readonly sollwert_90cm: number | null | undefined;
}

/**
 * Same rule as the map (`assignIcon`): `measured_at` older than two calendar days back
 * from today → stale. Matches `new Date(measured_at as string) < twoDaysAgo` (including
 * `null` → epoch, which counts as stale).
 */
export function isSoilMeasurementStale(
	measuredAt: string | null | undefined,
): boolean {
	const sensorDate = new Date(measuredAt as string);
	const twoDaysAgo = new Date();
	twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
	return sensorDate < twoDaysAgo;
}

export const WATERING_NEED_LABEL_DE: Record<TreeMapPinColor, string> = {
	green: 'Kein Bewässerungsbedarf',
	yellow: 'Geringer Bewässerungsbedarf',
	orange: 'Deutlicher Bewässerungsbedarf',
	red: 'Hoher Bewässerungsbedarf',
	grey: 'Messung älter als 2 Tage / ungültige Werte',
	blue: 'Keine Bewässerungsstrategie vorhanden',
};

/**
 * Derives the same map pin color / Bewässerungsbedarf category as the overview map
 * (`assignIcon` in mapComponent): sensor age (2 calendar days), then worst depth vs. Soll.
 */
export function getWateringNeedCategory(
	input: WateringNeedCategoryInput,
): TreeMapPinColor {
	let iconKey: TreeMapPinColor = 'grey';

	const hasSensorData =
		input.kpa_ch1 != null ||
		input.kpa_ch2 != null ||
		input.kpa_ch3 != null;

	if (hasSensorData) {
		if (isSoilMeasurementStale(input.measured_at)) {
			return 'grey';
		}

		const color30cm = getStatusColor(input.kpa_ch1, input.sollwert_30cm);
		const color60cm = getStatusColor(input.kpa_ch2, input.sollwert_60cm);
		const color90cm = getStatusColor(input.kpa_ch3, input.sollwert_90cm);

		if (
			color30cm === 'rgb(255,0,0)' ||
			color60cm === 'rgb(255,0,0)' ||
			color90cm === 'rgb(255,0,0)'
		) {
			iconKey = 'red';
		} else if (
			color30cm === 'rgb(255,128,0)' ||
			color60cm === 'rgb(255,128,0)' ||
			color90cm === 'rgb(255,128,0)'
		) {
			iconKey = 'orange';
		} else if (
			color30cm === 'rgb(255,204,0)' ||
			color60cm === 'rgb(255,204,0)' ||
			color90cm === 'rgb(255,204,0)'
		) {
			iconKey = 'yellow';
		} else if (
			color30cm === 'rgb(0,200,0)' ||
			color60cm === 'rgb(0,200,0)' ||
			color90cm === 'rgb(0,200,0)'
		) {
			iconKey = 'green';
		} else if (
			color30cm === 'rgb(0, 0, 255)' ||
			color60cm === 'rgb(0, 0, 255)' ||
			color90cm === 'rgb(0, 0, 255)'
		) {
			iconKey = 'blue';
		}
	}

	return iconKey;
}
