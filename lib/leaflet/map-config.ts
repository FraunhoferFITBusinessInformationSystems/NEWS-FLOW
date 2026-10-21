// Shared configuration for every Leaflet map in the app. Centralizing these
// values keeps the tile source, zoom limits and default view consistent across
// all map components.

/**
 * OpenStreetMap raster tiles. URL and attribution follow the OSM tile usage
 * policy: https://operations.osmfoundation.org/policies/tiles/
 */
export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

/** Attribution shown at the bottom right of every map, required by OSM. */
export const OSM_TILE_ATTRIBUTION =
	'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap-Mitwirkende</a>';

/** Highest zoom level the OSM tile server delivers tiles for. */
export const OSM_MAX_NATIVE_ZOOM = 19;

/**
 * Maximum zoom used consistently by every map. Beyond OSM_MAX_NATIVE_ZOOM,
 * Leaflet scales up the tiles of the highest native level.
 */
export const MAP_MAX_ZOOM = 20;

/**
 * Default map center (Frankfurt am Main) used when a map has no data to frame.
 */
export const DEFAULT_MAP_CENTER: [number, number] = [50.1109, 8.64];
