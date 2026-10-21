import proj4 from 'proj4';

// UTM Zone 32N projection string (used for Frankfurt/Germany)
const UTM32N = '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs';

// Technical bounds for UTM Zone 32N coordinates
const UTM32N_EASTING_MIN = 100000;
const UTM32N_EASTING_MAX = 900000;
const UTM32N_NORTHING_MIN = 0;
const UTM32N_NORTHING_MAX = 10000000;

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
