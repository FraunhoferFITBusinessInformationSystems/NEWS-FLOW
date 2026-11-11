import type L from 'leaflet';

/**
 * Pin colour of a tree; the meaning of each colour is in
 * WATERING_NEED_LABEL_DE.
 */
export type TreeMapPinColor =
	| 'green'
	| 'red'
	| 'blue'
	| 'yellow'
	| 'orange'
	| 'grey';

/**
 * Shape of a pin: the plain marker, the marker with a "recently watered" dot,
 * a diamond for sensors, and a smaller marker for the tree control map.
 */
export type TreeMapPinVariant =
	| 'default'
	| 'recentWatering'
	| 'sensor'
	| 'treeControlMap';

/** Every pin icon, created once per map, by variant and colour. */
export interface TreeMapIconRegistry {
	base: Record<TreeMapPinColor, L.Icon>;
	recentWatering: Record<TreeMapPinColor, L.DivIcon>;
	sensor: Record<TreeMapPinColor, L.DivIcon>;
	treeControlMap: Record<TreeMapPinColor, L.Icon>;
}
