'use server';

import { createClient, getCurrentUserOrganisation } from '@/lib/supabase/server';
import type { Organisation } from '@/lib/types/user';
import { getCurrentUser as getUserCurrent } from '@/lib/supabase/server';
import { filterInvalidSensorKpaValues } from '@/lib/utils/sensor-data-validation';

type GetFilteredTreeSensorDataParams = {
	objekt: string;
	baum?: string | string[];
	vonDatum: string;
	bisDatum: string;
};

export const getCurrentUser = getUserCurrent;

/**
 * Fetches filtered soil moisture sensor data for the given objekt, date range and optional tree(s).
 * @param params objekt, vonDatum, bisDatum (ISO), optional baum (single or array of baum_nr)
 * @returns Raw sensor rows from v_soilmoisture_with_mapping
 */
export async function getFilteredTreeSensorData({
	objekt,
	vonDatum,
	bisDatum,
	baum,
}: GetFilteredTreeSensorDataParams) {
	const supabase = await createClient();

	let query = supabase
		.from('v_soilmoisture_with_mapping')
		.select(
			'measured_at, kpa_ch1, kpa_ch2, kpa_ch3, kpa_ch4, resistance_ch1, resistance_ch2, resistance_ch3, resistance_ch4, objekt, baum_nr, baum_id, sensor_id, sensor_name',
		)
		.eq('objekt', objekt)
		.gte('measured_at', vonDatum)
		.lte('measured_at', bisDatum)
		.not('kpa_ch1', 'is', null) // Ensure we have actual sensor data
		.not('kpa_ch2', 'is', null)
		.not('kpa_ch3', 'is', null)
		.order('measured_at', { ascending: false });

	if (baum !== undefined) {
		if (Array.isArray(baum)) {
			if (baum.length > 0) {
				// Use the baum_nr strings directly as they come from the database
				query = query.in('baum_nr', baum);
			}
			// Bei leerem Array keine Einschränkung auf baum (alle Bäume)
		} else {
			// Use the baum_nr string directly as it comes from the database
			query = query.eq('baum_nr', baum);
		}
	}

	const { data, error } = await query;

	if (error) {
		console.error('Database error in getFilteredTreeSensorData:', error);
		throw new Error(error.message);
	}

	return filterInvalidSensorKpaValues(data ?? []);
};

/**
 * Resolves organisation (Palmengarten or GFA) for a given objekt from v_soilmoisture_with_mapping.
 * @param objekt Objekt identifier
 * @returns Organisation or null if not found
 */
export async function getOrganisationByObjekt(
	objekt: string,
): Promise<Organisation | null> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('v_soilmoisture_with_mapping')
		.select('bezirk')
		.eq('objekt', objekt)
		.limit(1)
		.maybeSingle();

	if (error) {
		console.error('Error in getOrganisationByObjekt:', error);
		return null;
	}

	if (!data?.bezirk) {
		return null;
	}

	// Determine organisation based on bezirk
	return data.bezirk === 'Palmengarten' ? 'Palmengarten' : 'GFA';
}

/**
 * Returns distinct objekte (locations) that have at least one sensor with data,
 * optionally filtered by organisation. Uses v_soilmoisture_latest_earliest_per_sensor
 * (one row per sensor) to avoid hitting PostgREST's row limit on the full measurements view.
 * @param organisation If set, only objekte for that organisation (by bezirk) are returned
 * @returns Sorted array of unique objekt strings
 */
export async function getDistinctObjekte(organisation?: Organisation) {
	const supabase = await createClient();

	let query = supabase
		.from('v_soilmoisture_latest_earliest_per_sensor')
		.select('objekt, bezirk')
		.eq('active', true)
		.not('objekt', 'is', null)
		.not('objekt', 'eq', '');

	if (organisation === 'Palmengarten') {
		query = query.eq('bezirk', 'Palmengarten');
	} else if (organisation === 'GFA') {
		query = query.neq('bezirk', 'Palmengarten');
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error in getDistinctObjekte:', error);
		throw new Error(error.message);
	}

	return [...new Set(data.map((item) => item.objekt).filter(Boolean))]
		.sort((a, b) => (a as string).localeCompare(b as string, 'de')) as string[];
}

/**
 * Returns the current user's organisation (from profile/role).
 * @returns Organisation for the current user
 */
export async function getUserOrganisation(): Promise<Organisation> {
	return getCurrentUserOrganisation();
}

/**
 * Returns distinct baum_nr values for a given objekt.
 * @param objekt Objekt identifier
 * @returns Sorted array of baum_nr strings
 */
export async function getDistinctBaumIdsByObjekt(
	objekt: string,
): Promise<string[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('v_soilmoisture_with_mapping')
		.select('baum_nr')
		.eq('objekt', objekt)
		.neq('baum_nr', null);

	if (error) throw new Error(error.message);
	if (!data) return [];

	// Keep the original string format from database, don't convert to integers
	const uniqueBaumIds = [...new Set(data.map((item) => item.baum_nr))]
		.filter(Boolean) // Remove any falsy values
		.sort((a, b) => {
			// Sort numerically if both are numeric, otherwise alphabetically
			const numA = Number.parseInt(a, 10);
			const numB = Number.parseInt(b, 10);
			if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
				return numA - numB;
			}
			return a.localeCompare(b);
		});

	return uniqueBaumIds;
}

/**
 * Returns latest sensor values per tree for the given objekt and baum list.
 * Without date range, uses last 60 days.
 * @param objekt Objekt identifier
 * @param baumNrs Array of baum_nr
 * @param vonDatum Optional start date (ISO)
 * @param bisDatum Optional end date (ISO)
 * @returns Map of baum_nr to { cm30, cm60, cm90, date }
 */
export async function getLatestSensorValuesPerTree(
	objekt: string,
	baumNrs: string[],
	vonDatum?: string,
	bisDatum?: string,
): Promise<Record<string, { cm30: number; cm60: number; cm90: number; date: string }>> {
	if (!objekt || !baumNrs?.length) return {};
	const supabase = await createClient();
	const sixtyDaysAgo = new Date();
	sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
	const fallbackFrom = sixtyDaysAgo.toISOString();

	let query = supabase
		.from('v_soilmoisture_with_mapping')
		.select('measured_at, kpa_ch1, kpa_ch2, kpa_ch3, resistance_ch1, resistance_ch2, resistance_ch3, resistance_ch4, objekt, baum_nr')
		.eq('objekt', objekt)
		.in('baum_nr', baumNrs)
		.not('kpa_ch1', 'is', null)
		.order('measured_at', { ascending: false });

	// Wenn ein Zeitintervall übergeben wurde, dieses verwenden – sonst letzten 60 Tage
	query = query.gte('measured_at', vonDatum ?? fallbackFrom);
	if (bisDatum) {
		query = query.lte('measured_at', bisDatum);
	}

	const { data, error } = await query;

	if (error) return {};
	
	// Filter invalid kPa values
	const cleanedData = filterInvalidSensorKpaValues(data ?? []);
	
	const result: Record<string, { cm30: number; cm60: number; cm90: number; date: string }> = {};
	const seen = new Set<string>();
	for (const row of cleanedData) {
		const bn = row.baum_nr;
		if (!bn || seen.has(bn)) continue;
		seen.add(bn);
		const dateObj = new Date(row.measured_at);
		const d = String(dateObj.getDate()).padStart(2, '0');
		const m = String(dateObj.getMonth() + 1).padStart(2, '0');
		const y = dateObj.getFullYear();
		result[bn] = {
			cm30: row.kpa_ch1 ?? 0,
			cm60: row.kpa_ch2 ?? 0,
			cm90: row.kpa_ch3 ?? 0,
			date: `${d}.${m}.${y}`,
		};
	}
	return result;
}

/**
 * Fetches tree overview (metadata) for one tree at the given objekt.
 * @param objekt Objekt identifier
 * @param baumNummer Baum number (baum_nr)
 * @returns Tree overview with baum_id, bezirk, bewaesserungsbereich, etc., or null
 */
export async function getTreeOverview(objekt: string, baumNummer: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('v_soilmoisture_with_mapping')
		.select(
			'baum_id, baum_nr, objekt, bezirk, stadtteil, pflegebereich, bewaesserungsgrund, gattung_art, entwicklungsphase, standalter, created_at, bewaesserungsbereich_name, bewaesserungsbereich_bereich, hochwert, rechtswert',
		)
		.eq('objekt', objekt)
		.eq('baum_nr', baumNummer)
		.limit(1)
		.maybeSingle();

	if (error) throw new Error(error.message);

	// Transform the data to match the expected structure
	if (data) {
		return {
			...data,
			baum: data.baum_nr, // Map baum_nr back to baum for compatibility
			bewaesserungsbereich: {
				name: data.bewaesserungsbereich_name,
				bereich: data.bewaesserungsbereich_bereich,
			},
		};
	}

	return data;
};

/** Liefert bewaesserung_liter aus bewaesserungsstrategien_pg für ein Objekt (nur Palmengarten). */
export const getBewaesserungLiterPalmengarten = async (
	objekt: string | null | undefined,
): Promise<number | null> => {
	if (!objekt) return null;
	const supabase = await createClient();
	const { data, error } = await supabase
		.from('bewaesserungsstrategien_pg')
		.select('bewaesserung_liter')
		.eq('objekt', objekt)
		.maybeSingle();
	if (error || !data) return null;
	return data.bewaesserung_liter ?? null;
};

export const getStatusByAge = async (age: number | null | undefined) => {
	const supabase = await createClient();

	// Return empty array if age is not provided
	if (age === null || age === undefined) {
		return [];
	}

	const { data, error } = await supabase
		.from('bewaesserungsstrategien_gfa')
		.select('*')
		.eq('standalter', age);

	if (error) throw new Error(error.message);
	return data;
};

export const getTreeNotes = async (id: string) => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('baum_notiz')
		.select('*')
		.eq('baum_id', id);

	if (error) throw new Error(error.message);
	return data;
};

export const getTreeWaterings = async (objekt: string) => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('bewaesserungsgang_palmengarten')
		.select('*')
		.eq('objekt', objekt);

	if (error) throw new Error(error.message);
	return data;
};

export const getUser = async (user_id: string | undefined) => {
  if (!user_id) return null; 

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, vorname, nachname')
    .eq('id', user_id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};


export async function addNoteToTree(
    baum_id: string,
    note: string,
    user_id: string,
    currentTime: string
) {
    if (!baum_id) throw new Error('Baum-ID fehlt');
    if (!user_id) throw new Error('Benutzer-ID fehlt');

    const supabase = await createClient();

    const { error } = await supabase
        .from('baum_notiz')
        .insert([
            {
                baum_id,
                user_id,
                notiz: note || '',
                erstellt_am: currentTime
            },
        ]);

    if (error) {
        console.error('Fehler beim Hinzufügen der Notiz:', error);
        throw error;
    }
}

export async function deleteNote(noteId: string
) {
    if (!noteId) throw new Error('Notiz-ID fehlt');

    const supabase = await createClient();

    const { error } = await supabase
        .from("baum_notiz")
		.delete()
		.eq("id", noteId);

    if (error) {
        console.error('Fehler beim Löschen der Notiz:', error);
        throw error;
    }
}


export type FilteredTreeSensorData = Awaited<
	ReturnType<typeof getFilteredTreeSensorData>
>;
export type FirstFilteredTreeSensorData = FilteredTreeSensorData[0];
