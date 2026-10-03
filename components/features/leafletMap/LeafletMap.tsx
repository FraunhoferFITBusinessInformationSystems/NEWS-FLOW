'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize, Minimize } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
	MAP_MAX_ZOOM,
	OSM_TILE_ATTRIBUTION,
	OSM_TILE_URL,
} from '@/lib/leaflet/map-config';
import { cn } from '@/lib/utils';

// The single vanilla-Leaflet map container used by every map in the app. It
// owns map creation, the OpenStreetMap tile layer, resize handling, the
// fullscreen toggle and teardown, and hands the live map instance back to the
// parent via onMapReady. Consumers draw their own markers/layers imperatively
// against that instance.

// Fullscreen is served by the browser Fullscreen API where available and falls
// back to a fixed-position overlay on browsers that reject it for non-video
// elements (iOS Safari), so the control works on every device.
type FullscreenMode = 'off' | 'native' | 'css';

interface LeafletMapProps {
	// Initial view. Omit when the consumer frames the map itself (e.g. by
	// fitting bounds once its data is available). Applied only on creation,
	// matching react-leaflet's center/zoom semantics.
	initialView?: { center: [number, number]; zoom: number };
	scrollWheelZoom?: boolean;
	// Merged onto the map wrapper, e.g. for z-index stacking or borders.
	className?: string;
	// Tailwind height class for the map wrapper.
	heightClassName?: string;
	// Called once with the created map so the parent can drive its layers.
	onMapReady?: (map: L.Map) => void;
	// Shows the fullscreen toggle in the top right corner of the map.
	fullscreenControl?: boolean;
	// Overlay elements rendered above the map (legends, floating controls).
	children?: ReactNode;
}

export default function LeafletMap({
	initialView,
	scrollWheelZoom = true,
	className,
	heightClassName = 'h-[60vh]',
	onMapReady,
	fullscreenControl = true,
	children,
}: LeafletMapProps) {
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<L.Map | null>(null);
	const [fullscreenMode, setFullscreenMode] = useState<FullscreenMode>('off');
	const isFullscreen = fullscreenMode !== 'off';
	// Keep the latest onMapReady without recreating the map when it changes.
	const onMapReadyRef = useRef(onMapReady);
	onMapReadyRef.current = onMapReady;

	// Create the Leaflet map once.
	useEffect(() => {
		if (!containerRef.current || mapRef.current) return;

		const map = L.map(containerRef.current, { scrollWheelZoom });
		L.tileLayer(OSM_TILE_URL, {
			attribution: OSM_TILE_ATTRIBUTION,
			maxZoom: MAP_MAX_ZOOM,
			maxNativeZoom: MAP_MAX_ZOOM,
		}).addTo(map);

		if (initialView) {
			map.setView(initialView.center, initialView.zoom);
		}

		mapRef.current = map;

		// Keep the map sized to its container (tabs, responsive layouts).
		const resizeObserver = new ResizeObserver(() => map.invalidateSize());
		resizeObserver.observe(containerRef.current);

		onMapReadyRef.current?.(map);

		return () => {
			resizeObserver.disconnect();
			map.remove();
			mapRef.current = null;
		};
		// Created once on mount; later view changes are driven by the parent.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Keep the button state in sync when the user leaves native fullscreen via
	// Escape or the browser UI instead of the button.
	useEffect(() => {
		function handleFullscreenChange() {
			if (document.fullscreenElement !== wrapperRef.current) {
				setFullscreenMode((mode) => (mode === 'native' ? 'off' : mode));
			}
		}

		document.addEventListener('fullscreenchange', handleFullscreenChange);
		return () =>
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
	}, []);

	// The CSS fallback has no browser-provided exit, so Escape is handled here.
	useEffect(() => {
		if (fullscreenMode !== 'css') return;

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') setFullscreenMode('off');
		}

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [fullscreenMode]);

	async function toggleFullscreen() {
		const wrapper = wrapperRef.current;
		if (!wrapper) return;

		if (fullscreenMode !== 'off') {
			if (fullscreenMode === 'native' && document.fullscreenElement) {
				await document.exitFullscreen();
			}
			setFullscreenMode('off');
			return;
		}

		if (typeof wrapper.requestFullscreen !== 'function') {
			setFullscreenMode('css');
			return;
		}

		try {
			await wrapper.requestFullscreen();
			setFullscreenMode('native');
		} catch (error) {
			console.error(
				`Fehler in toggleFullscreen: ${error instanceof Error ? error.message : String(error)}`,
			);
			setFullscreenMode('css');
		}
	}

	return (
		<div
			ref={wrapperRef}
			className={cn(
				'relative w-full',
				heightClassName,
				className,
				// Applied after className so the consumer's height, rounding and
				// stacking classes do not fight the fullscreen layout.
				fullscreenMode === 'native' && 'h-full w-full rounded-none',
				fullscreenMode === 'css' &&
					'fixed inset-0 z-[2000] h-full w-full rounded-none',
			)}
		>
			<div ref={containerRef} className="h-full w-full" />
			{fullscreenControl && (
				<Button
					type="button"
					variant="outline"
					size="icon"
					className="absolute top-2 right-2 z-[1000] shadow-md"
					onClick={() => void toggleFullscreen()}
					aria-label={isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
					title={isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
				>
					{isFullscreen ? (
						<Minimize aria-hidden />
					) : (
						<Maximize aria-hidden />
					)}
				</Button>
			)}
			{children}
		</div>
	);
}
