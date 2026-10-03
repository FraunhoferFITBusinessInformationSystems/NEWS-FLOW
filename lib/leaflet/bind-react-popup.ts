import L from 'leaflet';
import type { ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

// Binds a Leaflet popup whose content is rendered by React. This replaces
// react-leaflet's <Popup>: it lazily mounts a React root into the popup's DOM
// node on first open and re-renders the content on every open, so popups keep
// their full React content (interactive buttons, recharts charts).
//
// The root is unmounted only when the marker is removed (e.g. when the layer
// group is cleared on a data change), and that unmount is deferred to a later
// task. Marker removal usually happens inside a React effect cleanup, and
// unmounting a root synchronously during React's render/commit phase throws
// "Attempted to synchronously unmount a root while React was already rendering".
export function bindReactPopup(
	marker: L.Marker,
	content: ReactNode,
	options?: L.PopupOptions,
): void {
	const container = document.createElement('div');
	let root: Root | null = null;

	marker.bindPopup(container, options);

	marker.on('popupopen', () => {
		if (!root) root = createRoot(container);
		root.render(content);
		// Once React has painted, let Leaflet recompute the popup size and
		// position. This matters for content that measures its container, such
		// as recharts' ResponsiveContainer.
		requestAnimationFrame(() => marker.getPopup()?.update());
	});

	marker.on('remove', () => {
		const currentRoot = root;
		root = null;
		// Defer so we never unmount during React's render/commit phase.
		if (currentRoot) setTimeout(() => currentRoot.unmount());
	});
}
