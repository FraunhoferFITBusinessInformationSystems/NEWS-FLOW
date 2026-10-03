'use server';

import { getMultipleTreeTargetValues } from '@/lib/actions/tree-target-values';
import type { TreeWithTargetValues } from '@/lib/actions/tree-target-values';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/supabase';
import { filterTreesForLiveMap } from '@/lib/utils/live-map-sensors';
import { filterInvalidSensorKpaValues } from '@/lib/utils/sensor-data-validation';

export type TreeOverviewWithSensorRow =
	Database['public']['Views']['v_soilmoisture_latest_earliest_per_sensor']['Row'];

function isRelationMissingError(message: string): boolean {
	return message.includes('does not exist');
}

async function fetchTreeOverviewWithSensorsFallback(
	supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<TreeOverviewWithSensorRow[]> {
	const { data: rows, error } = await supabase
		.from('v_soilmoisture_latest_per_sensor')
		.select('*')
		.not('kpa_ch1', 'is', null)
		.not('kpa_ch2', 'is', null)
		.not('kpa_ch3', 'is', null);

	if (error) {
		throw new Error(error.message);
	}

	const cleaned = filterInvalidSensorKpaValues(rows ?? []);
	return cleaned.map((row) => ({
		...row,
		last_watering_at: null,
		measured_at_earliest: row.measured_at ?? null,
	})) as TreeOverviewWithSensorRow[];
}

/**
 * Lädt alle Bäume inklusive zugehörigem Bewässerungsbereich.
 *
 * @returns Liste aller Bäume oder `null`, falls keine vorhanden sind.
 * @throws Error, wenn das Supabase-Query fehlschlägt.
 */
export const getTreeOverview = async () => {
	const supabase = await createClient();

	const { data: baeume, error } = await supabase
		.from('baeume')
		.select('*, bewaesserungsbereich(*)');

	if (error) {
		throw new Error(error.message);
	}

	return baeume;
};

/**
 * Lädt alle Bäume mit Sensoren und den jeweils neuesten Messwerten inkl. letzter
 * abgeschlossener Bewässerung (`last_watering_at` aus der DB-View).
 *
 * @returns Liste der Bäume mit Sensordaten; nur Einträge mit vollständigen Messwerten kpa_ch1–3.
 * @throws Error, wenn das Supabase-Query fehlschlägt.
 */
export const getTreeOverviewWithSensors =
	async (): Promise<TreeOverviewWithSensorRow[]> => {
		const supabase = await createClient();

		const { data: baeumeMitSensorenUndDaten, error } = await supabase
			.from('v_soilmoisture_latest_earliest_per_sensor')
			.select('*')
			.not('kpa_ch1', 'is', null)
			.not('kpa_ch2', 'is', null)
			.not('kpa_ch3', 'is', null);

		if (error) {
			if (isRelationMissingError(error.message)) {
				console.warn(
					'getTreeOverviewWithSensors: view v_soilmoisture_latest_earliest_per_sensor missing; using v_soilmoisture_latest_per_sensor (last_watering_at null).',
				);
				return fetchTreeOverviewWithSensorsFallback(supabase);
			}
			throw new Error(error.message);
		}

		const cleaned = filterInvalidSensorKpaValues(baeumeMitSensorenUndDaten ?? []);
		return cleaned as TreeOverviewWithSensorRow[];
	};

/**
 * Loads sensor IDs that are marked active in `sensors`.
 */
async function getActiveSensorIds(): Promise<string[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('sensors')
		.select('id')
		.eq('active', true);

	if (error) {
		console.error(`Fehler in getActiveSensorIds: ${error.message}`);
		throw new Error(error.message);
	}

	console.log('getActiveSensorIds erfolgreich');
	return (data ?? []).map((row) => row.id);
}

/**
 * Same data as `getTreeOverviewWithSensors`, but excludes trees linked to
 * manually deactivated sensors (`sensors.active = false`). Used only by the Live map.
 */
export async function getTreeOverviewForLiveMap(): Promise<
	TreeOverviewWithSensorRow[]
> {
	try {
		const [rows, activeSensorIds] = await Promise.all([
			getTreeOverviewWithSensors(),
			getActiveSensorIds(),
		]);
		const filtered = filterTreesForLiveMap(
			rows,
			new Set(activeSensorIds),
		);
		console.log('getTreeOverviewForLiveMap erfolgreich');
		return filtered;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Fehler in getTreeOverviewForLiveMap: ${message}`);
		throw error;
	}
}

export type TreeOverview = Awaited<ReturnType<typeof getTreeOverview>>;
export type FirstTreeOverview = TreeOverview[0];
export type TreeOverviewWithSensors = TreeOverviewWithSensorRow[];
export type FirstTreeOverviewWithSensors = TreeOverviewWithSensors[0];

export type OverviewTableRow = TreeOverviewWithSensorRow & TreeWithTargetValues;

/**
 * Loads sensor overview rows for the table tab (same view as the map) plus strategy
 * target values (Sollwerte) for Gießempfehlung parity with the map.
 */
export async function getOverviewTableData(): Promise<OverviewTableRow[]> {
	try {
		const rows = await getTreeOverviewWithSensors();
		const enriched = await getMultipleTreeTargetValues(rows);
		console.log('getOverviewTableData erfolgreich');
		return enriched;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Fehler in getOverviewTableData: ${message}`);
		throw error;
	}
}

/**
 * Lädt alle Bewässerungsstrategien aus der Tabelle `bewaesserungsstrategien_gfa`.
 *
 * @returns Liste der Strategien oder `null`, falls keine vorhanden sind.
 * @throws Error, wenn das Supabase-Query fehlschlägt.
 */
export const fetchStrategieTabelle = async () => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('bewaesserungsstrategien_gfa')
		.select('*');

	if (error) {
		throw new Error(error.message);
	}

	return data;
};

export type SensorStatusData = {
	readonly measured_at: string;
	readonly kpa_ch1: number;
	readonly kpa_ch2: number;
	readonly kpa_ch3: number;
	readonly kpa_ch4: number;
};

/**
 * Holt alle verfügbaren Sensormessungen zu einem Baum.
 *
 * @param baumId ID des Baumes.
 * @returns Liste der Messungen oder `null`, wenn ein Fehler auftritt.
 */
export const getSensorDataByBaumId = async (
	baumId: string,
): Promise<SensorStatusData[] | null> => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('v_soilmoisture_with_mapping')
		.select('measured_at, kpa_ch1, kpa_ch2, kpa_ch3, kpa_ch4')
		.eq('baum_id', baumId)
		.order('measured_at', { ascending: false });

	if (error) {
		console.error('Fehler beim Abrufen der Sensordaten:', error);
		return null;
	}

	return data;
};
