import L from 'leaflet';

// Single home for every Leaflet marker icon used across the app's maps: the
// tree "pin" icons (colored markers, with sensor and recent-watering variants).
//
// The route markers (ordered stops, route endpoints) and the water extraction
// point markers were removed together with irrigation route planning, which is
// not part of this build. When those features return, the original functions
// (createStopIcon, createRouteEndpointIcon, createWaterPointIcon,
// createDynamicWaterPointIcon) and the route colors from map-config.ts can be
// restored from commit 00b219b.

// ---------------------------------------------------------------------------
// Tree pin icons
// ---------------------------------------------------------------------------

export type TreeMapPinColor =
	| 'green'
	| 'red'
	| 'blue'
	| 'yellow'
	| 'orange'
	| 'grey';

export type TreeMapPinVariant =
	| 'default'
	| 'recentWatering'
	| 'sensor'
	| 'treeControlMap';

export interface TreeMapIconRegistry {
	base: Record<TreeMapPinColor, L.Icon>;
	recentWatering: Record<TreeMapPinColor, L.DivIcon>;
	sensor: Record<TreeMapPinColor, L.DivIcon>;
	treeControlMap: Record<TreeMapPinColor, L.Icon>;
}

const LEAFLET_COLOR_MARKERS_BASE =
	'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img';

export const TREE_MAP_SHADOW_URL =
	'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

export const TREE_MAP_PIN_ICON_URLS: Record<TreeMapPinColor, string> = {
	green: `${LEAFLET_COLOR_MARKERS_BASE}/marker-icon-2x-green.png`,
	red: `${LEAFLET_COLOR_MARKERS_BASE}/marker-icon-2x-red.png`,
	blue: `${LEAFLET_COLOR_MARKERS_BASE}/marker-icon-2x-blue.png`,
	yellow: `${LEAFLET_COLOR_MARKERS_BASE}/marker-icon-2x-yellow.png`,
	orange: `${LEAFLET_COLOR_MARKERS_BASE}/marker-icon-2x-orange.png`,
	grey: `${LEAFLET_COLOR_MARKERS_BASE}/marker-icon-2x-grey.png`,
};

const TREE_MAP_ICON_LAYOUT = {
	iconSize: [25, 41] as [number, number],
	iconAnchor: [12, 41] as [number, number],
	popupAnchor: [1, -34] as [number, number],
	shadowSize: [41, 41] as [number, number],
};

function createBaseTreeMapIcon(iconUrl: string): L.Icon {
	return new L.Icon({
		iconUrl,
		shadowUrl: TREE_MAP_SHADOW_URL,
		...TREE_MAP_ICON_LAYOUT,
	});
}

function createRecentWateringDivIcon(iconUrl: string): L.DivIcon {
	// biome-ignore lint/style/useTemplate: One concatenated string per HTML tag reads better than a single long template literal
	const html =
		'<div class="tree-map-pin-recent-watering__frame">' +
		`<img src="${iconUrl}" alt="" role="presentation" class="tree-map-pin-recent-watering__img" />` +
		'<span class="tree-map-pin-recent-watering__dot" title="Kürzlich bewässert" aria-hidden="true"></span>' +
		'</div>';

	return new L.DivIcon({
		className: 'tree-map-pin-recent-watering',
		html,
		iconSize: TREE_MAP_ICON_LAYOUT.iconSize,
		iconAnchor: TREE_MAP_ICON_LAYOUT.iconAnchor,
		popupAnchor: TREE_MAP_ICON_LAYOUT.popupAnchor,
	});
}

function createSensorDiamondIcon(color: TreeMapPinColor): L.DivIcon {
	const fillMap: Record<TreeMapPinColor, string> = {
		green: '#2AAD27',
		red: '#CB2B3E',
		blue: '#2A81CB',
		yellow: '#FFD326',
		orange: '#CB8427',
		grey: '#7B7B7B',
	};

	const strokeMap: Record<TreeMapPinColor, string> = {
		green: '#1A7D24',
		red: '#9C0F1E',
		blue: '#1A6BA0',
		yellow: '#C9A800',
		orange: '#9C5E1A',
		grey: '#4A4A4A',
	};

	const html = `
		<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42">
			<polygon
				points="15,0 30,21 15,42 0,21"
				fill="${strokeMap[color]}"
			/>
			<polygon
				points="15,1.5 28.5,21 15,40.5 1.5,21"
				fill="${fillMap[color]}"
			/>
		</svg>
	`;

	return new L.DivIcon({
		className: 'tree-map-sensor-diamond',
		html,
		iconSize: [30, 42] as [number, number],
		iconAnchor: [15, 42] as [number, number],
		popupAnchor: [0, -38] as [number, number],
	});
}
function createTreeControlMapIcon(iconUrl: string): L.Icon {
	return new L.Icon({
		iconUrl,
		shadowUrl: TREE_MAP_SHADOW_URL,
		iconSize: [18, 30] as [number, number],
		iconAnchor: [9, 30] as [number, number],
		popupAnchor: [1, -15] as [number, number],
		shadowSize: [30, 30] as [number, number],
	});
}
/**
 * Builds standard L.Icon markers plus L.DivIcon variants that reuse the same
 * images with a small “recent watering” indicator overlay.
 */
export function createTreeMapIconRegistry(): TreeMapIconRegistry {
	const base = {} as Record<TreeMapPinColor, L.Icon>;
	const recentWatering = {} as Record<TreeMapPinColor, L.DivIcon>;
	const sensor = {} as Record<TreeMapPinColor, L.DivIcon>;
	const treeControlMap = {} as Record<TreeMapPinColor, L.Icon>;

	for (const color of Object.keys(
		TREE_MAP_PIN_ICON_URLS,
	) as TreeMapPinColor[]) {
		const url = TREE_MAP_PIN_ICON_URLS[color];
		base[color] = createBaseTreeMapIcon(url);
		recentWatering[color] = createRecentWateringDivIcon(url);
		sensor[color] = createSensorDiamondIcon(color);
		treeControlMap[color] = createTreeControlMapIcon(url);
	}

	return { base, recentWatering, sensor, treeControlMap };
}

export function getTreeMapPinIcon(
	registry: TreeMapIconRegistry,
	color: TreeMapPinColor,
	variant: TreeMapPinVariant = 'default',
): L.Icon | L.DivIcon {
	if (variant === 'sensor') return registry.sensor[color];
	if (variant === 'treeControlMap') return registry.treeControlMap[color];
	return variant === 'default'
		? registry.base[color]
		: registry.recentWatering[color];
}
