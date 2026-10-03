import proj4 from 'proj4';

// UTM Zone 32N projection string (used for Frankfurt/Germany)
const UTM32N = '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs';

// Technical bounds for UTM Zone 32N coordinates
const UTM32N_EASTING_MIN = 100000;
const UTM32N_EASTING_MAX = 900000;
const UTM32N_NORTHING_MIN = 0;
const UTM32N_NORTHING_MAX = 10000000;

// City bounding boxes for plausibility checks (UTM32N coordinates).
// Buffer is added around the box to allow for slight deviations.
interface CityBounds {
	name: string;
	eastingMin: number;
	eastingMax: number;
	northingMin: number;
	northingMax: number;
	buffer: number;
}

const CITY_BOUNDS_FRANKFURT: CityBounds = {
	name: 'Frankfurt am Main',
	eastingMin: 465000,
	eastingMax: 485000,
	northingMin: 5545000,
	northingMax: 5570000,
	buffer: 5000,
};

// Default city bounds used for plausibility checks. Change this to support other cities.
const DEFAULT_CITY_BOUNDS = CITY_BOUNDS_FRANKFURT;

interface CoordinateValidationResult {
	valid: boolean;
	error: string | null;
	warning: string | null;
}

/**
 * Checks whether a pair of UTM32N coordinates is technically valid and plausible.
 *
 * Returns an error when the values fall outside the UTM32N zone entirely,
 * and a warning when they are technically valid but outside the expected city area.
 */
export function validateCoordinates(
	rechtswert: number | null | undefined,
	hochwert: number | null | undefined,
	cityBounds: CityBounds = DEFAULT_CITY_BOUNDS,
): CoordinateValidationResult {
	if (rechtswert == null || hochwert == null) {
		return { valid: false, error: 'Koordinaten fehlen', warning: null };
	}

	if (typeof rechtswert !== 'number' || typeof hochwert !== 'number') {
		return { valid: false, error: 'Koordinaten müssen Zahlen sein', warning: null };
	}

	if (Number.isNaN(rechtswert) || Number.isNaN(hochwert)) {
		return { valid: false, error: 'Koordinaten sind ungültig (NaN)', warning: null };
	}

	// Technical UTM32N bounds check
	if (
		rechtswert < UTM32N_EASTING_MIN ||
		rechtswert > UTM32N_EASTING_MAX ||
		hochwert < UTM32N_NORTHING_MIN ||
		hochwert > UTM32N_NORTHING_MAX
	) {
		return {
			valid: false,
			error: `Koordinaten außerhalb des gültigen UTM32N-Bereichs (Rechtswert: ${UTM32N_EASTING_MIN}–${UTM32N_EASTING_MAX}, Hochwert: ${UTM32N_NORTHING_MIN}–${UTM32N_NORTHING_MAX})`,
			warning: null,
		};
	}

	// City plausibility check (with buffer)
	const inCityArea =
		rechtswert >= cityBounds.eastingMin - cityBounds.buffer &&
		rechtswert <= cityBounds.eastingMax + cityBounds.buffer &&
		hochwert >= cityBounds.northingMin - cityBounds.buffer &&
		hochwert <= cityBounds.northingMax + cityBounds.buffer;

	if (!inCityArea) {
		return {
			valid: true,
			error: null,
			warning: `Koordinaten liegen außerhalb von ${cityBounds.name} (Rechtswert: ${rechtswert}, Hochwert: ${hochwert})`,
		};
	}

	return { valid: true, error: null, warning: null };
}

/**
 * Converts UTM32N coordinates (Rechtswert/Hochwert) to WGS84 (longitude/latitude).
 * Returns null if the input coordinates are technically invalid.
 */
export function utmToWgs84(
	rechtswert: number,
	hochwert: number,
): { longitude: number; latitude: number } | null {
	if (
		typeof rechtswert !== 'number' ||
		typeof hochwert !== 'number' ||
		Number.isNaN(rechtswert) ||
		Number.isNaN(hochwert) ||
		rechtswert < UTM32N_EASTING_MIN ||
		rechtswert > UTM32N_EASTING_MAX ||
		hochwert < UTM32N_NORTHING_MIN ||
		hochwert > UTM32N_NORTHING_MAX
	) {
		return null;
	}

	const [longitude, latitude] = proj4(UTM32N, 'WGS84', [rechtswert, hochwert]);
	return { longitude, latitude };
}
