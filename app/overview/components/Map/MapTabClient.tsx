'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Leaflet needs `window`, so the map is imported dynamically without SSR
const MapComponent = dynamic(() => import('./mapComponent'), { ssr: false });

export default function MapTabClient() {
	return (
		<Suspense fallback={<div>Karte wird geladen…</div>}>
			<MapComponent />
		</Suspense>
	);
}
