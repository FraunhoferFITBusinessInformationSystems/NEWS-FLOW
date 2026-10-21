/**
 * Server actions of the overview. They run on the server only; the page calls
 * them while rendering and the map calls them from the client. All queries use
 * the caller's session, so row level security decides what they may read.
 *
 * @packageDocumentation
 */
'use server';

import { getMultipleTreeTargetValues } from '@/lib/actions/tree-target-values';
import { createClient } from '@/lib/supabase/server';
import type {
	OverviewTableRow,
	TreeOverviewWithSensorRow,
} from '@/lib/types/tree-overview';
import { filterTreesForLiveMap } from '@/lib/utils/live-map-sensors';
import { filterInvalidSensorKpaValues } from '@/lib/utils/sensor-data-validation';

/**
 * Loads all trees with sensors, each with its latest and earliest reading,
 * from v_soil_moisture_latest_earliest_per_sensor. Invalid values are set to
 * null.
 *
 * @returns One row per sensor; only rows with complete readings kpa_ch1–3.
 * @throws Error if the Supabase query fails.
 */
export async function getTreeOverviewWithSensors(): Promise<
	TreeOverviewWithSensorRow[]
> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('v_soil_moisture_latest_earliest_per_sensor')
		.select('*')
		.not('kpa_ch1', 'is', null)
		.not('kpa_ch2', 'is', null)
		.not('kpa_ch3', 'is', null);

	if (error) {
		console.error(`Fehler in getTreeOverviewWithSensors: ${error.message}`);
		throw new Error(error.message);
	}

	console.log('getTreeOverviewWithSensors erfolgreich');
	return filterInvalidSensorKpaValues(data ?? []);
}

/**
 * Loads sensor IDs that are marked active in `sensors`.
 */
async function getActiveSensorIds(): Promise<string[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('sensors')
		.select('id')
		.eq('is_active', true);

	if (error) {
		console.error(`Fehler in getActiveSensorIds: ${error.message}`);
		throw new Error(error.message);
	}

	console.log('getActiveSensorIds erfolgreich');
	return (data ?? []).map((row) => row.id);
}

/**
 * Same data as `getTreeOverviewWithSensors`, but excludes trees linked to
 * manually deactivated sensors (`sensors.is_active = false`). Used only by the Live map.
 */
export async function fetchTreeOverviewForLiveMap(): Promise<
	TreeOverviewWithSensorRow[]
> {
	try {
		const [rows, activeSensorIds] = await Promise.all([
			getTreeOverviewWithSensors(),
			getActiveSensorIds(),
		]);
		const filtered = filterTreesForLiveMap(rows, new Set(activeSensorIds));
		console.log('fetchTreeOverviewForLiveMap erfolgreich');
		return filtered;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Fehler in fetchTreeOverviewForLiveMap: ${message}`);
		throw error;
	}
}

/**
 * Loads sensor overview rows for the table tab (same view as the map) plus the
 * target values, so the watering recommendation matches the map.
 */
export async function fetchOverviewTableData(): Promise<OverviewTableRow[]> {
	try {
		const rows = await getTreeOverviewWithSensors();
		const enriched = await getMultipleTreeTargetValues(rows);
		console.log('fetchOverviewTableData erfolgreich');
		return enriched;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Fehler in fetchOverviewTableData: ${message}`);
		throw error;
	}
}
