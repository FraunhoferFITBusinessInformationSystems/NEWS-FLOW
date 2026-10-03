'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamischer Import von Leaflet mit deaktiviertem SSR
const MapComponent = dynamic(() => import('./mapComponent'), { ssr: false });

export default function MapTabClient() {
	return (
		<Suspense fallback={<div>Karte wird geladen…</div>}>
			<MapComponent />
		</Suspense>
	);
}
