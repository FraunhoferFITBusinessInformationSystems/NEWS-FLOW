/**
 * Helpers for showing only active sensors on the Live map (/overview).
 * Detail views, analysis, and the overview table are not filtered here.
 *
 * @packageDocumentation
 */

/** The sensor reference of an overview row; either field may be set. */
export interface LiveMapSensorRow {
	sid?: string | null;
	sensor_id?: string | null;
}

/**
 * Returns the sensor id of an overview row, preferring `sid` over
 * `sensor_id`, or null when neither is set.
 */
export function getSensorKeyFromOverviewRow(
	row: LiveMapSensorRow,
): string | null {
	const sid = row.sid?.trim();
	if (sid) return sid;

	const sensorId = row.sensor_id?.trim();
	if (sensorId) return sensorId;

	return null;
}

/**
 * Returns false when the row is linked to a sensor marked inactive in `sensors.is_active`.
 * Rows without a resolvable sensor key are kept (unchanged legacy behavior).
 */
export function isTreeVisibleOnLiveMap(
	row: LiveMapSensorRow,
	activeSensorIds: ReadonlySet<string>,
): boolean {
	const key = getSensorKeyFromOverviewRow(row);
	if (!key) return true;
	return activeSensorIds.has(key);
}

/**
 * Removes the trees whose sensor is inactive, for the live map only. See
 * isTreeVisibleOnLiveMap for the rule.
 */
export function filterTreesForLiveMap<T extends LiveMapSensorRow>(
	trees: T[],
	activeSensorIds: ReadonlySet<string>,
): T[] {
	return trees.filter((tree) => isTreeVisibleOnLiveMap(tree, activeSensorIds));
}
