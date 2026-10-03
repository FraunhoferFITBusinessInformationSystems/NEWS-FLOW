// Shared configuration for every Leaflet map in the app. Centralizing these
// values keeps the tile source, zoom limits, default view, and route colors
// consistent across all map components.

// OpenStreetMap raster tiles.
export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_TILE_ATTRIBUTION =
	'&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>';

// Maximum zoom used consistently by every map (native tiles cap at 20).
export const MAP_MAX_ZOOM = 20;

// Default map center (Frankfurt am Main) used when a map has no data to frame.
export const DEFAULT_MAP_CENTER: [number, number] = [50.1109, 8.64];

// Route and route-endpoint colors shared by the route maps.
export const ROUTE_COLOR = '#006E3F';
export const START_COLOR = '#B45309';
export const END_COLOR = '#1D4ED8';
