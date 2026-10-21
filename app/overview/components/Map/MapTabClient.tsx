'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Leaflet needs `window`, so the map is imported dynamically without SSR
const MapComponent = dynamic(() => import('./mapComponent'), { ssr: false });

/** Map tab of the overview; loads the map component in the browser only. */
export default function MapTabClient() {
	return (
		<Suspense fallback={<div>Karte wird geladen…</div>}>
			<MapComponent />
		</Suspense>
	);
}
