import { skip } from "node:test";

const RESISTANCE_INVALID_THRESHOLD = 1_000_000;

const KPA_RESISTANCE_MAPPING = {
	kpa_ch1: 'resistance_ch1',
	kpa_ch2: 'resistance_ch2',
	kpa_ch3: 'resistance_ch3',
	kpa_ch4: 'resistance_ch4',
} as const;

/**
 * Filters invalid kPa values in sensor data.
 * If resistance > 1,000,000, the corresponding kPa value is set to null.
 * Accepts any object type with resistance and kpa properties.
 * @param data - Array of sensor data rows
 * @returns Array with invalid kPa values nullified
 */
export function filterInvalidSensorKpaValues<T extends Record<string, unknown>>(
	data: T[],
): T[] {
	const cleanedData = data.map((row) => {
		const cleaned = { ...row } as Record<string, unknown>;

		Object.entries(KPA_RESISTANCE_MAPPING).forEach(([kpaKey, resistanceKey]) => {
			const resistance = cleaned[resistanceKey];
			const kpa = cleaned[kpaKey];

			if (
				typeof resistance === 'number' &&
				resistance > RESISTANCE_INVALID_THRESHOLD &&
				kpa !== null
			) {
				cleaned[kpaKey] = null;
			}
		});
		return cleaned as T;
	});
	return cleanedData;
}
