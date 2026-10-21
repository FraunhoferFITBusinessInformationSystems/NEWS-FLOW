import proj4 from 'proj4';

// UTM Zone 32N projection string (used for Frankfurt/Germany)
const UTM32N = '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs';

// Technical bounds for UTM Zone 32N coordinates
const UTM32N_EASTING_MIN = 100000;
const UTM32N_EASTING_MAX = 900000;
const UTM32N_NORTHING_MIN = 0;
const UTM32N_NORTHING_MAX = 10000000;

/**
 * Converts UTM32N coordinates (easting/northing in metres) to WGS84
 * (longitude/latitude). Returns null if the input coordinates are technically
 * invalid.
 */
export function utmToWgs84(
	easting: number,
	northing: number,
): { longitude: number; latitude: number } | null {
	if (
		typeof easting !== 'number' ||
		typeof northing !== 'number' ||
		Number.isNaN(easting) ||
		Number.isNaN(northing) ||
		easting < UTM32N_EASTING_MIN ||
		easting > UTM32N_EASTING_MAX ||
		northing < UTM32N_NORTHING_MIN ||
		northing > UTM32N_NORTHING_MAX
	) {
		return null;
	}

	const [longitude, latitude] = proj4(UTM32N, 'WGS84', [easting, northing]);
	return { longitude, latitude };
}
