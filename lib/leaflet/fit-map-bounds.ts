import L from 'leaflet';

// Fits a Leaflet map to a set of [lat, lng] positions. Centralizes the
// auto-zoom logic that was duplicated across the map components: no positions
// is a no-op, a single position centers at a close zoom (a zero-size bounding
// box cannot be fitted), and multiple positions fit the bounding box with padding.
export function fitMapToPositions(
	map: L.Map,
	positions: [number, number][],
	options: L.FitBoundsOptions = { padding: [40, 40] },
): void {
	if (positions.length === 0) return;
	if (positions.length === 1) {
		map.setView(positions[0], 16);
		return;
	}
	map.fitBounds(L.latLngBounds(positions), options);
}
