/**
 * Helpers for showing only active sensors on the Live map (/overview).
 * Detail views, analysis, and the overview table are not filtered here.
 */

export interface LiveMapSensorRow {
	sid?: string | null;
	sensor_id?: string | null;
}

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
 * Returns false when the row is linked to a sensor marked inactive in `sensors.active`.
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

export function filterTreesForLiveMap<T extends LiveMapSensorRow>(
	trees: T[],
	activeSensorIds: ReadonlySet<string>,
): T[] {
	return trees.filter((tree) => isTreeVisibleOnLiveMap(tree, activeSensorIds));
}
