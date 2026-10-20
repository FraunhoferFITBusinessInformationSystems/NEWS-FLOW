'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser as getUserCurrent } from '@/lib/supabase/server';
import type {
	SoilMoistureReading,
	TreeNote,
	TreeOverview,
} from '@/lib/types/dashboard';
import { filterInvalidSensorKpaValues } from '@/lib/utils/sensor-data-validation';

interface GetFilteredTreeSensorDataParams {
	site: string;
	/** One tree number or several; an empty array means all trees of the site. */
	treeNumbers?: string | string[];
	/** ISO date */
	fromDate: string;
	/** ISO date */
	toDate: string;
}

export const getCurrentUser = getUserCurrent;

/**
 * Fetches soil moisture readings for the given site, date range and optional tree(s).
 * Only readings with values for all of kpa_ch1–3 are returned.
 *
 * @throws Error if the Supabase query fails.
 */
export async function getFilteredTreeSensorData({
	site,
	fromDate,
	toDate,
	treeNumbers,
}: GetFilteredTreeSensorDataParams): Promise<SoilMoistureReading[]> {
	const supabase = await createClient();

	let query = supabase
		.from('v_soil_moisture_readings_mapped')
		.select(
			'measured_at, kpa_ch1, kpa_ch2, kpa_ch3, kpa_ch4, resistance_ch1, resistance_ch2, resistance_ch3, resistance_ch4, site, tree_number, tree_id, sensor_id, sensor_name',
		)
		.eq('site', site)
		.gte('measured_at', fromDate)
		.lte('measured_at', toDate)
		.not('kpa_ch1', 'is', null)
		.not('kpa_ch2', 'is', null)
		.not('kpa_ch3', 'is', null)
		.order('measured_at', { ascending: false });

	if (treeNumbers !== undefined) {
		if (Array.isArray(treeNumbers)) {
			// An empty array applies no tree filter (all trees of the site).
			if (treeNumbers.length > 0) {
				query = query.in('tree_number', treeNumbers);
			}
		} else {
			query = query.eq('tree_number', treeNumbers);
		}
	}

	const { data, error } = await query;

	if (error) {
		console.error(`Fehler in getFilteredTreeSensorData: ${error.message}`);
		throw new Error(error.message);
	}

	console.log('getFilteredTreeSensorData erfolgreich');
	return filterInvalidSensorKpaValues(data ?? []);
}

/**
 * Returns the distinct sites that have at least one active sensor with data.
 * Uses v_soil_moisture_latest_earliest_per_sensor (one row per sensor) to
 * avoid hitting PostgREST's row limit on the full readings view.
 *
 * @returns Sites sorted alphabetically (German collation).
 * @throws Error if the Supabase query fails.
 */
export async function getDistinctSites(): Promise<string[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('v_soil_moisture_latest_earliest_per_sensor')
		.select('site')
		.eq('is_active', true)
		.not('site', 'is', null)
		.not('site', 'eq', '');

	if (error) {
		console.error(`Fehler in getDistinctSites: ${error.message}`);
		throw new Error(error.message);
	}

	console.log('getDistinctSites erfolgreich');
	const sites: string[] = (data ?? [])
		.map((item: { site: string | null }) => item.site)
		.filter((site: string | null): site is string => Boolean(site));
	return [...new Set(sites)].sort((a, b) => a.localeCompare(b, 'de'));
}

/**
 * Returns the distinct tree numbers of a site that have at least one reading,
 * including trees whose sensor is inactive. Uses
 * v_soil_moisture_latest_earliest_per_sensor (one row per sensor) to avoid
 * hitting PostgREST's row limit on the full readings view.
 *
 * @returns Tree numbers sorted numerically where possible, otherwise alphabetically.
 * @throws Error if the Supabase query fails.
 */
export async function getDistinctTreeNumbersBySite(
	site: string,
): Promise<string[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('v_soil_moisture_latest_earliest_per_sensor')
		.select('tree_number')
		.eq('site', site)
		.not('tree_number', 'is', null);

	if (error) {
		console.error(`Fehler in getDistinctTreeNumbersBySite: ${error.message}`);
		throw new Error(error.message);
	}

	console.log('getDistinctTreeNumbersBySite erfolgreich');
	// Tree numbers are text in the database and stay strings here.
	const treeNumbers: string[] = (data ?? [])
		.map((item: { tree_number: string | null }) => item.tree_number)
		.filter((treeNumber: string | null): treeNumber is string =>
			Boolean(treeNumber),
		);
	return [...new Set(treeNumbers)].sort((a, b) => {
		const numA = Number.parseInt(a, 10);
		const numB = Number.parseInt(b, 10);
		if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
			return numA - numB;
		}
		return a.localeCompare(b);
	});
}

/**
 * Fetches the metadata of one tree, found by site and tree number.
 *
 * @returns The tree, or null if no reading row exists for it.
 * @throws Error if the Supabase query fails.
 */
export async function getTreeOverview(
	site: string,
	treeNumber: string,
): Promise<TreeOverview | null> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('v_soil_moisture_readings_mapped')
		.select(
			'tree_id, tree_number, site, district, type_species, tree_site_age, created_at, irrigation_area_name, northing, easting',
		)
		.eq('site', site)
		.eq('tree_number', treeNumber)
		.limit(1)
		.maybeSingle();

	if (error) {
		console.error(`Fehler in getTreeOverview: ${error.message}`);
		throw new Error(error.message);
	}

	console.log('getTreeOverview erfolgreich');
	return data;
}

/**
 * Fetches all notes of a tree.
 *
 * @throws Error if the Supabase query fails.
 */
export async function getTreeNotes(treeId: string): Promise<TreeNote[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('tree_notes')
		.select('id, tree_id, user_id, note, created_at')
		.eq('tree_id', treeId);

	if (error) {
		console.error(`Fehler in getTreeNotes: ${error.message}`);
		throw new Error(error.message);
	}

	console.log('getTreeNotes erfolgreich');
	return data ?? [];
}

/**
 * Adds a note to a tree. `created_at` is set by the database.
 *
 * @throws Error if an ID is missing or the insert fails.
 */
export async function addNoteToTree(
	treeId: string,
	note: string,
	userId: string,
): Promise<void> {
	if (!treeId) throw new Error('Baum-ID fehlt');
	if (!userId) throw new Error('Benutzer-ID fehlt');

	const supabase = await createClient();

	const { error } = await supabase.from('tree_notes').insert([
		{
			tree_id: treeId,
			user_id: userId,
			note: note || '',
		},
	]);

	if (error) {
		console.error(`Fehler in addNoteToTree: ${error.message}`);
		throw new Error(error.message);
	}

	console.log('addNoteToTree erfolgreich');
}

/**
 * Deletes a note. RLS only allows deleting one's own notes.
 *
 * @throws Error if the ID is missing or the delete fails.
 */
export async function deleteNote(noteId: string): Promise<void> {
	if (!noteId) throw new Error('Notiz-ID fehlt');

	const supabase = await createClient();

	const { error } = await supabase.from('tree_notes').delete().eq('id', noteId);

	if (error) {
		console.error(`Fehler in deleteNote: ${error.message}`);
		throw new Error(error.message);
	}

	console.log('deleteNote erfolgreich');
}
