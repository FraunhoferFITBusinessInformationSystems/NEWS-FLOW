'use client';

import LeafletMap from '@/components/features/leafletMap/LeafletMap';
import { getMultipleTreeTargetValues } from '@/lib/actions/tree-target-values';
import { utmToWgs84 } from '@/lib/utils/coordinates';
import L from 'leaflet';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTreeOverviewForLiveMap } from '../../actions';
import './../../styles.css';
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from '@/components/ui/combobox';
import { HelpHint } from '@/components/ui/help-hint';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	DEFAULT_MAP_CENTER,
	type TreeMapIconRegistry,
	type TreeMapPinColor,
	type TreeMapPinVariant,
	bindReactPopup,
	createTreeMapIconRegistry,
	getTreeMapPinIcon,
} from '@/lib/leaflet';
import { cn } from '@/lib/utils';
import { getFuzzyMatches } from '@/lib/utils/fuzzy';
import {
	formatRecentWateringWindowLabelDe,
	isRecentCompletedWateringAt,
} from '@/lib/utils/tree-last-watering';
import { getWateringNeedCategory } from '@/lib/utils/watering-need-category';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { OverviewTableRow } from '../../actions';

type AllOrValue<T extends string> = T | 'all';

const colorOptions: {
	value: TreeMapPinColor;
	label: string;
	dotClass: string;
}[] = [
	{ value: 'green', label: 'Grün', dotClass: 'bg-green-600' },
	{ value: 'yellow', label: 'Gelb', dotClass: 'bg-yellow-400' },
	{ value: 'orange', label: 'Orange', dotClass: 'bg-orange-500' },
	{ value: 'red', label: 'Rot', dotClass: 'bg-red-600' },
	{ value: 'blue', label: 'Blau', dotClass: 'bg-blue-600' },
	{ value: 'grey', label: 'Grau', dotClass: 'bg-gray-400' },
];

function summarizeMapWateringForDebug(trees: OverviewTableRow[]) {
	const wateringWindowLabel = formatRecentWateringWindowLabelDe();
	let withLastWateringAt = 0;
	let recentDot = 0;
	const staleSamples: string[] = [];
	const recentSamples: string[] = [];

	for (const t of trees) {
		const hasW =
			t.recently_irrigated_at != null &&
			String(t.recently_irrigated_at).trim() !== '';
		if (hasW) withLastWateringAt++;
		const recent = isRecentCompletedWateringAt(t.recently_irrigated_at);
		if (recent) {
			recentDot++;
			if (recentSamples.length < 5) {
				recentSamples.push(
					`${t.tree_number ?? '?'} (${t.district ?? '—'}, Objekt ${t.site ?? '—'}): recently_irrigated_at im Fenster`,
				);
			}
		} else if (hasW && staleSamples.length < 6) {
			const raw = String(t.recently_irrigated_at);
			const shortened = raw.length > 28 ? `${raw.slice(0, 28)}…` : raw;
			staleSamples.push(
				`${t.tree_number ?? '?'}: recently_irrigated_at=${shortened} (außerhalb ${wateringWindowLabel} oder ungültig)`,
			);
		}
	}

	return {
		total: trees.length,
		withLastWateringAt,
		recentDot,
		staleSamples,
		recentSamples,
	};
}

interface MapWateringDebugDetailRow {
	category: string;
	treeNumber: string | null;
	treeId: string | null;
	district: string | null;
	site: string | null;
	pinColor: TreeMapPinColor;
	pinVariant: TreeMapPinVariant;
	recentlyIrrigatedAt: string | null;
	recentWatering: boolean;
}

function buildMapWateringDebugDetailRows(
	trees: OverviewTableRow[],
	assignIconColor: (tree: OverviewTableRow) => TreeMapPinColor,
	limit: number,
): MapWateringDebugDetailRow[] {
	const rowFor = (
		tree: OverviewTableRow,
		category: string,
	): MapWateringDebugDetailRow => {
		const recentWatering = isRecentCompletedWateringAt(
			tree.recently_irrigated_at,
		);
		return {
			category,
			treeNumber: tree.tree_number ?? null,
			treeId: tree.tree_id ?? null,
			district: tree.district ?? null,
			site: tree.site ?? null,
			pinColor: assignIconColor(tree),
			pinVariant: recentWatering ? 'recentWatering' : 'default',
			recentlyIrrigatedAt: tree.recently_irrigated_at ?? null,
			recentWatering,
		};
	};

	const withDot = trees.filter((t) =>
		isRecentCompletedWateringAt(t.recently_irrigated_at),
	);
	const stale = trees.filter((t) => {
		const hasW =
			t.recently_irrigated_at != null &&
			String(t.recently_irrigated_at).trim() !== '';
		return hasW && !isRecentCompletedWateringAt(t.recently_irrigated_at);
	});
	const none = trees.filter((t) => {
		const hasW =
			t.recently_irrigated_at != null &&
			String(t.recently_irrigated_at).trim() !== '';
		return !hasW;
	});

	const out: MapWateringDebugDetailRow[] = [];
	for (const t of withDot.slice(0, 2)) {
		out.push(rowFor(t, 'Blauer Punkt (im Zeitfenster)'));
	}
	for (const t of stale.slice(0, 2)) {
		out.push(rowFor(t, 'Rohdaten, außerhalb / ungültig'));
	}
	for (const t of none.slice(0, 2)) {
		out.push(rowFor(t, 'Keine Bewässerungsdaten'));
	}

	return out.slice(0, limit);
}

export default function MapComponent() {
	const [trees, setTrees] = useState<OverviewTableRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadFailed, setLoadFailed] = useState(false);
	const [searchObject, setSearchObject] = useState('');
	const [searchText, setSearchText] = useState('');
	const [filterColor, setFilterColor] =
		useState<AllOrValue<TreeMapPinColor>>('all');
	const [filterIrrigationArea, setFilterIrrigationArea] =
		useState<AllOrValue<string>>('all');
	const [filterDistrict, setFilterDistrict] =
		useState<AllOrValue<string>>('all');

	const router = useRouter();
	const [map, setMap] = useState<L.Map | null>(null);

	const [mapWateringDebug, setMapWateringDebug] = useState(false);
	const [legendMobileOpen, setLegendMobileOpen] = useState(false);
	useEffect(() => {
		setMapWateringDebug(
			new URLSearchParams(window.location.search).get('mapWateringDebug') ===
				'1',
		);
	}, []);

	const mapWateringDebugStats = useMemo(
		() => (trees.length > 0 ? summarizeMapWateringForDebug(trees) : null),
		[trees],
	);

	/**
	 * Map pin color from sensor data age and kPa vs. target values. The
	 * "recently irrigated" dot is hidden in this build (see the marker loop).
	 */
	const assignIcon = useCallback((tree: OverviewTableRow): TreeMapPinColor => {
		return getWateringNeedCategory({
			kpa_ch1: tree.kpa_ch1,
			kpa_ch2: tree.kpa_ch2,
			kpa_ch3: tree.kpa_ch3,
			measured_at: tree.measured_at,
			target_30cm: tree.target_30cm,
			target_60cm: tree.target_60cm,
			target_90cm: tree.target_90cm,
		});
	}, []);

	const mapWateringDebugDetailRows = useMemo(
		() =>
			trees.length > 0 && mapWateringDebug
				? buildMapWateringDebugDetailRows(trees, assignIcon, 8)
				: [],
		[trees, mapWateringDebug, assignIcon],
	);

	useEffect(() => {
		if (mapWateringDebug && mapWateringDebugStats) {
			console.info(
				'[Karte Bewässerung Debug] Zusammenfassung',
				mapWateringDebugStats,
			);
			console.info(
				'[Karte Bewässerung Debug] Beispiele (Pin-Farbe + Punkt-Logik)',
				mapWateringDebugDetailRows,
			);
		}
	}, [mapWateringDebug, mapWateringDebugStats, mapWateringDebugDetailRows]);

	const treeMapIcons = useMemo((): TreeMapIconRegistry | undefined => {
		if (typeof window === 'undefined') return undefined;
		return createTreeMapIconRegistry();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const treeData = await getTreeOverviewForLiveMap();
				const treesWithTargets = await getMultipleTreeTargetValues(treeData);
				setTrees(treesWithTargets);
			} catch (error) {
				console.error('Fehler beim Laden der Bäume:', error);
				setLoadFailed(true);
			} finally {
				setIsLoading(false);
			}
		};

		void fetchData();
	}, []);

	const treesFilteredByRightFilters = useMemo(() => {
		return trees.filter((tree) => {
			const colorMatch =
				filterColor === 'all' || assignIcon(tree) === filterColor;
			const districtMatch =
				filterDistrict === 'all' || tree.district === filterDistrict;
			const irrigationAreaMatch =
				filterIrrigationArea === 'all' ||
				tree.irrigation_area_name === filterIrrigationArea;
			return colorMatch && districtMatch && irrigationAreaMatch;
		});
	}, [trees, filterColor, filterDistrict, filterIrrigationArea, assignIcon]);

	const uniqueDistricts = [
		...new Set(trees.map((t) => t.district).filter(Boolean)),
	] as string[];
	const uniqueIrrigationAreas = [
		...new Set(trees.map((t) => t.irrigation_area_name).filter(Boolean)),
	] as string[];

	const uniqueObjects = useMemo(
		() =>
			[
				...new Set(
					treesFilteredByRightFilters.map((t) => t.site).filter(Boolean),
				),
			] as string[],
		[treesFilteredByRightFilters],
	);

	useEffect(() => {
		if (
			searchObject &&
			searchObject.length > 0 &&
			!uniqueObjects.includes(searchObject)
		) {
			setSearchObject('');
			setSearchText('');
		}
	}, [uniqueObjects, searchObject]);

	const fuzzyObjectMatches = useMemo(
		() =>
			searchText ? getFuzzyMatches(searchText, uniqueObjects) : uniqueObjects,
		[searchText, uniqueObjects],
	);

	const fuzzyObjectMatchSet = useMemo(
		() => new Set(fuzzyObjectMatches),
		[fuzzyObjectMatches],
	);

	const filteredTrees = useMemo(() => {
		return trees.filter((tree) => {
			const colorMatch =
				filterColor === 'all' || assignIcon(tree) === filterColor;
			const districtMatch =
				filterDistrict === 'all' || tree.district === filterDistrict;
			const irrigationAreaMatch =
				filterIrrigationArea === 'all' ||
				tree.irrigation_area_name === filterIrrigationArea;
			const objectMatch =
				searchObject && searchObject.length > 0
					? tree.site === searchObject
					: !searchText || fuzzyObjectMatchSet.has(tree.site ?? '');

			return colorMatch && districtMatch && irrigationAreaMatch && objectMatch;
		});
	}, [
		trees,
		searchObject,
		searchText,
		filterColor,
		filterDistrict,
		filterIrrigationArea,
		assignIcon,
		fuzzyObjectMatchSet,
	]);

	// Draw the tree markers whenever the map, filtered data or icons change.
	useEffect(() => {
		if (!map || !treeMapIcons) return;

		const layer = L.layerGroup().addTo(map);

		for (const tree of filteredTrees) {
			const wgs = utmToWgs84(tree.easting as number, tree.northing as number);
			if (!wgs) continue;

			// The "recently irrigated" dot ('recentWatering' variant) is hidden in
			// this build: irrigation rounds are not part of the schema, so
			// recently_irrigated_at is always null.
			const markerIcon = getTreeMapPinIcon(
				treeMapIcons,
				assignIcon(tree),
				'default',
			);

			const marker = L.marker([wgs.latitude, wgs.longitude], {
				icon: markerIcon,
			}).addTo(layer);
			bindReactPopup(
				marker,
				<div className="p-2 text-body-small space-y-1">
					<h2 className="text-heading-5 mb-2">🌳 Baumdetails</h2>
					<div>
						<strong>Objekt:</strong> {tree.site}
					</div>
					<div>
						<strong>Baum Nummer:</strong> {tree.tree_number}
					</div>
					<div>
						<strong>Bezirk:</strong> {tree.district}
					</div>
					<div>
						<strong>Bewässerungsbereich:</strong>{' '}
						{tree.irrigation_area_name ?? '—'}
					</div>
					<div>
						<strong>Art:</strong> {tree.type_species}
					</div>
					<div>
						<strong>Alter:</strong> {tree.tree_site_age}
					</div>
					<button
						type="button"
						onClick={() =>
							router.push(
								`/dashboard?id=${tree.tree_id}&objekt=${encodeURIComponent(tree.site ?? '')}&baum=${encodeURIComponent(tree.tree_number ?? '')}`,
							)
						}
						className="mt-2 block w-full rounded-lg bg-green-600 px-4 py-2 text-white text-sm font-medium hover:bg-green-700 active:bg-green-800 transition shadow-md hover:shadow-lg"
					>
						Details anzeigen
					</button>
				</div>,
			);
		}

		return () => {
			layer.remove();
		};
	}, [map, filteredTrees, treeMapIcons, router, assignIcon]);

	if (isLoading || !treeMapIcons) {
		return (
			<div className="text-center py-10 text-body-small text-muted-foreground">
				Lädt...
			</div>
		);
	}

	if (loadFailed) {
		return (
			<p className="p-4 text-sm text-muted-foreground">
				Bäume konnten nicht geladen werden.
			</p>
		);
	}

	return (
		<div className="space-y-4">
			{trees.length === 0 && (
				<p className="text-sm text-muted-foreground">
					Keine Bäume mit Sensordaten gefunden.
				</p>
			)}
			{mapWateringDebug && mapWateringDebugStats && (
				<section
					className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950 font-mono space-y-1 z-20 relative"
					aria-label="Debug Infos Bewässerungspins"
				>
					<p className="font-sans font-semibold text-sm">
						Debug: Nadel mit blauem Punkt (URL-Parameter{' '}
						<code className="rounded bg-white/80 px-1">mapWateringDebug=1</code>
						, Fenster: {formatRecentWateringWindowLabelDe()})
					</p>
					<p className="font-sans text-[11px] leading-snug text-amber-950 bg-amber-100/90 border border-amber-200 rounded px-2 py-1.5">
						<strong>Wichtig:</strong> Kartenlage und Pin-Farbe kommen aus{' '}
						<code className="rounded bg-white/80 px-0.5">
							v_soil_moisture_latest_earliest_per_sensor
						</code>{' '}
						(nur Zeilen mit kpa_ch1–3). Der blaue Punkt nutzt ausschließlich{' '}
						<code className="rounded bg-white/80 px-0.5">
							recently_irrigated_at
						</code>{' '}
						(letzter abgeschlossener Bewässerungsgang laut View, aus{' '}
						<code className="rounded bg-white/80 px-0.5">abgeschlossen_am</code>
						).
					</p>
					<ol className="font-sans list-decimal pl-5 space-y-0.5 text-amber-900 pb-1 border-b border-amber-200/60">
						<li>
							<strong>Pin-Farbe:</strong> unverändert aus Sensorik / Soll (
							<code className="rounded bg-white/80 px-0.5">assignIcon</code>
							).
						</li>
						<li>
							<strong>Blauer Punkt:</strong> nur wenn{' '}
							<code className="rounded bg-white/80 px-0.5">
								recently_irrigated_at
							</code>{' '}
							nicht null ist und im Kalenderfenster „heute einschließlich vier
							Tage zurück“ liegt (nur Karte; Dashboard „Letzte Bewässerungen“
							bleibt ungefiltert).
						</li>
						<li>
							Konsole:{' '}
							<code className="rounded bg-white/80 px-0.5">
								[Karte Bewässerung Debug]
							</code>{' '}
							→ Zusammenfassung + Beispielobjekte.
						</li>
					</ol>
					<p>
						Bäume gesamt: {mapWateringDebugStats.total} · mit gesetzem{' '}
						<code className="rounded bg-white/80 px-0.5">
							recently_irrigated_at
						</code>
						: {mapWateringDebugStats.withLastWateringAt}
					</p>
					<p>
						Davon „kürzlich“ (blauer Punkt): {mapWateringDebugStats.recentDot}
					</p>
					{mapWateringDebugStats.recentDot === 0 &&
						mapWateringDebugStats.withLastWateringAt === 0 && (
							<p className="font-sans text-amber-900">
								Kein <code>recently_irrigated_at</code> in den geladenen Zeilen:
								View / RLS / abgeschlossene Gänge prüfen.
							</p>
						)}
					{mapWateringDebugStats.recentDot === 0 &&
						mapWateringDebugStats.withLastWateringAt > 0 && (
							<p className="font-sans text-amber-900">
								Es gibt Daten, aber keine im Fenster{' '}
								{formatRecentWateringWindowLabelDe()} (oder ungültiges
								Datumsformat). Beispiele:
							</p>
						)}
					{mapWateringDebugStats.staleSamples.length > 0 && (
						<ul className="list-disc pl-4 space-y-0.5">
							{mapWateringDebugStats.staleSamples.map((s) => (
								<li key={s}>{s}</li>
							))}
						</ul>
					)}
					{mapWateringDebugStats.recentSamples.length > 0 && (
						<>
							<p className="font-sans font-medium pt-1">
								Bäume mit blauem Punkt (Auszug):
							</p>
							<ul className="list-disc pl-4 space-y-0.5">
								{mapWateringDebugStats.recentSamples.map((s) => (
									<li key={s}>{s}</li>
								))}
							</ul>
						</>
					)}
					{mapWateringDebugDetailRows.length > 0 && (
						<div className="font-sans text-[11px] pt-2 overflow-x-auto">
							<p className="font-medium mb-1 text-amber-950">
								Beispielzeilen (Pin-Farbe + Varianten wie auf der Karte):
							</p>
							<table className="w-full border-collapse border border-amber-300/70 text-left">
								<thead>
									<tr className="bg-amber-100/90">
										<th className="border border-amber-200 p-1 font-medium">
											Fall
										</th>
										<th className="border border-amber-200 p-1 font-medium">
											Nr
										</th>
										<th className="border border-amber-200 p-1 font-medium">
											Farbe
										</th>
										<th className="border border-amber-200 p-1 font-medium">
											Variante
										</th>
										<th className="border border-amber-200 p-1 font-medium">
											Bez.
										</th>
										<th className="border border-amber-200 p-1 font-medium">
											Punkt ok
										</th>
										<th className="border border-amber-200 p-1 font-medium max-w-[140px]">
											recently_irrigated_at
										</th>
									</tr>
								</thead>
								<tbody>
									{mapWateringDebugDetailRows.map((r) => (
										<tr key={`${r.category}-${r.treeId}`} className="align-top">
											<td className="border border-amber-200 p-1">
												{r.category}
											</td>
											<td className="border border-amber-200 p-1 whitespace-nowrap">
												{r.treeNumber ?? '—'}
											</td>
											<td className="border border-amber-200 p-1">
												{r.pinColor}
											</td>
											<td className="border border-amber-200 p-1">
												{r.pinVariant}
											</td>
											<td className="border border-amber-200 p-1 max-w-[72px]">
												{r.district ?? '—'}
											</td>
											<td className="border border-amber-200 p-1">
												{r.recentWatering ? 'ja' : 'nein'}
											</td>
											<td
												className="border border-amber-200 p-1 break-all max-w-[140px]"
												title={r.recentlyIrrigatedAt ?? ''}
											>
												{r.recentlyIrrigatedAt
													? r.recentlyIrrigatedAt.length > 28
														? `${r.recentlyIrrigatedAt.slice(0, 28)}…`
														: r.recentlyIrrigatedAt
													: '—'}
											</td>
										</tr>
									))}
								</tbody>
							</table>
							<p className="text-amber-800/90 mt-1">
								Spalte „Punkt ok“:{' '}
								<code className="rounded bg-white/70 px-0.5">
									recently_irrigated_at
								</code>{' '}
								im Fenster {formatRecentWateringWindowLabelDe()}.
							</p>
						</div>
					)}
				</section>
			)}
			<div className="relative z-20 p-4 bg-gray-100 rounded-md shadow-md space-y-2">
				<div className="flex items-center gap-2 text-sm font-medium text-gray-700">
					<span>Filter</span>
					<HelpHint label="Bäume filtern" side="bottom">
						Die Suche vergleicht unscharf (Tippfehler werden toleriert) und
						zeigt nur Objekte, die zu den übrigen Filtern passen; wählen Sie ein
						Objekt, das dadurch wegfällt, wird die Suche zurückgesetzt. Der
						Filter <strong>Bewässerungsbedarf</strong> nutzt dieselbe Farblogik
						wie die Kartennadeln (IST-Wert gegen Sollwert, Grau bei Messungen
						älter als 2 Tage).
					</HelpHint>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
					<Combobox
						items={uniqueObjects}
						filteredItems={fuzzyObjectMatches}
						value={searchObject || null}
						inputValue={searchText}
						onInputValueChange={(value) => setSearchText(value ?? '')}
						onValueChange={(value) => {
							setSearchObject(value ?? '');
							setSearchText(value ?? '');
						}}
					>
						<ComboboxInput
							placeholder="Suche"
							aria-label="Bäume nach Objekt suchen"
							className="w-full h-10 border-2 border-[#006E3F] bg-white px-3 py-2 text-sm rounded-md cursor-pointer hover:border-green-600 hover:bg-green-50/50 focus:ring-2 focus:ring-green-500/40 focus:border-green-600 transition-colors"
						/>
						<ComboboxContent sideOffset={4} align="start" className="">
							<ComboboxEmpty>Keine Ergebnisse gefunden.</ComboboxEmpty>
							<ComboboxList className="max-h-60 overflow-auto">
								{(item) => (
									<ComboboxItem key={item} value={item}>
										{item}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
					<Select
						value={filterColor}
						onValueChange={(value) =>
							setFilterColor(value as AllOrValue<TreeMapPinColor>)
						}
					>
						<SelectTrigger className="w-full text-sm border-2 border-[#006E3F] focus-visible:ring-[#006E3F] bg-white">
							<SelectValue placeholder="Bewässerungsbedarf" />
						</SelectTrigger>
						<SelectContent className="z-[1000]">
							<SelectItem value="all">
								<span className="inline-flex items-center gap-2">
									<span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
									<span>Bewässerungsbedarf</span>
								</span>
							</SelectItem>
							{colorOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									<span className="inline-flex items-center gap-2">
										<span
											className={`h-2.5 w-2.5 rounded-full ${option.dotClass}`}
										/>
										<span>{option.label}</span>
									</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={filterDistrict}
						onValueChange={(value) =>
							setFilterDistrict(value as AllOrValue<string>)
						}
					>
						<SelectTrigger className="w-full text-sm border-2 border-[#006E3F] focus-visible:ring-[#006E3F] bg-white">
							<SelectValue placeholder="Alle Bezirke" />
						</SelectTrigger>
						<SelectContent className="z-[1000]">
							<SelectItem value="all">Alle Bezirke</SelectItem>
							{uniqueDistricts.map((district) => (
								<SelectItem key={district} value={district}>
									{district}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={filterIrrigationArea}
						onValueChange={(value) =>
							setFilterIrrigationArea(value as AllOrValue<string>)
						}
					>
						<SelectTrigger className="w-full text-sm border-2 border-[#006E3F] focus-visible:ring-[#006E3F] bg-white">
							<SelectValue placeholder="Alle Bewässerungsbereiche" />
						</SelectTrigger>
						<SelectContent className="z-[1000]">
							<SelectItem value="all">Alle Bewässerungsbereiche</SelectItem>
							{uniqueIrrigationAreas.map((area) => (
								<SelectItem key={area} value={area}>
									{area}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<LeafletMap
				initialView={{ center: DEFAULT_MAP_CENTER, zoom: 13 }}
				heightClassName="h-[50vh] md:h-[70vh]"
				className="z-10 rounded-lg overflow-hidden border"
				onMapReady={setMap}
			>
				<div className="pointer-events-none absolute bottom-2 right-2 z-[1000] max-w-[min(18.5rem,calc(100%-1rem))]">
					<section
						className={cn(
							'pointer-events-auto rounded-2xl bg-white shadow-lg text-left text-gray-800',
							legendMobileOpen ? 'px-4 py-3.5' : 'px-2.5 py-1',
							'md:px-4 md:py-3.5',
						)}
						aria-label="Legende Kartenmarkierungen"
					>
						<button
							type="button"
							className={cn(
								'md:hidden flex w-full min-h-0 items-center justify-between gap-2 rounded-md text-left text-sm font-semibold leading-none text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E3F] focus-visible:ring-offset-2',
								legendMobileOpen && 'mb-2 border-b border-gray-200 pb-2',
							)}
							onClick={() => setLegendMobileOpen((open) => !open)}
							aria-expanded={legendMobileOpen}
							aria-controls="map-legend-content"
							id="map-legend-toggle"
						>
							<span className="inline-flex items-center gap-1.5 whitespace-nowrap">
								<span aria-hidden>🌳</span>
								<span>Legende</span>
							</span>
							<ChevronDown
								className={cn(
									'h-4 w-4 shrink-0 text-gray-600 transition-transform',
									legendMobileOpen && 'rotate-180',
								)}
								aria-hidden
							/>
						</button>
						<h2 className="hidden md:flex md:items-center md:gap-1.5 md:whitespace-nowrap text-base font-semibold leading-tight mb-2 pb-2 border-b border-gray-200">
							<span aria-hidden>🌳</span>
							<span>Legende</span>
						</h2>
						<div
							id="map-legend-content"
							className={cn(legendMobileOpen ? 'block' : 'hidden', 'md:block')}
						>
							<p className="text-muted-foreground text-[12px] leading-snug mb-2">
								Pin-Farbe: Bodenfeuchte vs. Soll-Werte
							</p>
							<ul className="text-[12px] leading-snug space-y-1.5">
								<li className="flex gap-2 items-start">
									<span
										className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-green-600 shadow-sm"
										aria-hidden
									/>
									<span>
										<strong>Grün:</strong> kein Bewässerungsbedarf
									</span>
								</li>
								<li className="flex gap-2 items-start">
									<span
										className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-yellow-400 shadow-sm"
										aria-hidden
									/>
									<span>
										<strong>Gelb:</strong> geringer Bewässerungsbedarf
									</span>
								</li>
								<li className="flex gap-2 items-start">
									<span
										className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-orange-500 shadow-sm"
										aria-hidden
									/>
									<span>
										<strong>Orange:</strong> deutlicher Bewässerungsbedarf
									</span>
								</li>
								<li className="flex gap-2 items-start">
									<span
										className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-red-600 shadow-sm"
										aria-hidden
									/>
									<span>
										<strong>Rot:</strong> hoher Bewässerungsbedarf
									</span>
								</li>
								<li className="flex gap-2 items-start">
									<span
										className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-gray-400 shadow-sm"
										aria-hidden
									/>
									<span>
										<strong>Grau:</strong> Messung älter als 2 Tage / ungültige
										Werte
									</span>
								</li>
								<li className="flex gap-2 items-start">
									<span
										className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-blue-600 shadow-sm"
										aria-hidden
									/>
									<span>
										<strong>Blau:</strong> keine Bewässerungsstrategie vorhanden
									</span>
								</li>
							</ul>
						</div>
					</section>
				</div>
			</LeafletMap>
		</div>
	);
}
