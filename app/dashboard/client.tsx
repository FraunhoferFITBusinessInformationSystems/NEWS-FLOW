'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import LineChartComponent from './components/LineChartComponent';
import ObjektSelect from './components/ObjektSelect';
import OrganisationSelect from './components/OrganisationSelect';
import TreeComponent from './components/TreeComponent';
import './styles.css';
import DateRangePicker from '@/components/features/datePicker/DatePicker';
import { HelpHint } from '@/components/ui/help-hint';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	getMultipleTreeTargetValues,
	getTreeTargetValues,
} from '@/lib/actions/tree-target-values';
import type {
	ComparisonYearOption,
	LatestSensorPerTree,
	SoilMoistureDataPoint,
	SollZustandData,
	TreeOverview,
} from '@/lib/types/dashboard';
import type { Organisation } from '@/lib/types/user';
import {
	formatDate,
	getDashboardComparisonCandidateYears,
	getDefaultDateRange,
	parseGermanDate,
	shiftGermanDateSeriesByYears,
	shiftIsoDateByYears,
	transformSensorData,
} from '@/lib/utils/dashboard';
import type { FilteredTreeSensorData } from './action';
import {
	getFilteredTreeSensorData,
	getOrganisationByObjekt,
	getTreeOverview,
	getUserOrganisation,
} from './action';
import ComparisonYearSelect from './components/ComparisonYearSelect';
import SharedSections from './components/SharedSections';
import TreeSelect from './components/TreeSelect';
import TreeSpecificContent from './components/TreeSpecificContent';

export default function DashboardClient() {
	const searchParams = useSearchParams();
	const selectedTreeId = searchParams.get('id');
	const selectedStreetObjekt = searchParams.get('objekt');
	const selectedBaumNumber = searchParams.get('baum');

	const [treeId, setTreeId] = useState<string | undefined>(
		selectedTreeId ?? undefined,
	);
	const [selectedOrganisation, setSelectedOrganisation] = useState<
		Organisation | undefined
	>();
	const [startDate, setStartDate] = useState<string | undefined>();
	const [endDate, setEndDate] = useState<string | undefined>();
	const [manuallySetDate, setManuallySetDate] = useState(false);
	const [selectedObjekt, setSelectedObjekt] = useState<string | undefined>();
	const [selectedTree, setSelectedTree] = useState<string[] | undefined>();
	const [chartData, setChartData] = useState<SoilMoistureDataPoint[]>([]);
	const [treeOverview, setTreeOverview] = useState<TreeOverview | null>(null);
	const [treeOverviews, setTreeOverviews] = useState<TreeOverview[]>([]);
	const [latestSensorPerTree, setLatestSensorPerTree] =
		useState<LatestSensorPerTree>({});
	const [sollZustandDataPerTree, setSollZustandDataPerTree] = useState<
		Record<string, SollZustandData>
	>({});
	const [userOrg, setUserOrg] = useState<string>('');
	const [sollZustandData, setSollZustandData] = useState<
		SollZustandData | undefined
	>();
	const [comparisonYearOptions, setComparisonYearOptions] = useState<
		ComparisonYearOption[]
	>([]);
	const [selectedComparisonYears, setSelectedComparisonYears] = useState<
		number[]
	>([]);
	const [comparisonDataByYear, setComparisonDataByYear] = useState<
		Record<number, SoilMoistureDataPoint[]>
	>({});

	// Fetch user organisation on mount and pre-select
	// If objekt is provided in URL, determine organisation from it
	useEffect(() => {
		const initOrganisation = async () => {
			try {
				// If objekt is provided in URL, determine organisation from it
				if (selectedStreetObjekt) {
					const orgFromObjekt =
						await getOrganisationByObjekt(selectedStreetObjekt);
					if (orgFromObjekt) {
						setSelectedOrganisation(orgFromObjekt);
						return;
					}
				}
				// Otherwise, use user's default organisation
				const userOrg = await getUserOrganisation();
				setSelectedOrganisation(userOrg);
			} catch (err) {
				console.error('Error fetching organisation:', err);
				// Default to undefined, user can still select manually
			}
		};

		initOrganisation();
	}, [selectedStreetObjekt]);

	const objektSetCount = useRef(0); // Tracks how many times the object has been changed

	// Most recent chart entry (aggregiert über Zeitraum)
	const istZustandData =
		chartData.length > 0 ? chartData[chartData.length - 1] : undefined;

	useEffect(() => {
		if (!treeOverview) return;

		getTreeTargetValues(treeOverview)
			.then((targetValues) => {
				// Only set data if all values are available
				if (
					targetValues.sollwert_30cm !== null &&
					targetValues.sollwert_60cm !== null &&
					targetValues.sollwert_90cm !== null
				) {
					const changedData: SollZustandData = {
						cm30: targetValues.sollwert_30cm,
						cm60: targetValues.sollwert_60cm,
						cm90: targetValues.sollwert_90cm,
					};
					setSollZustandData(changedData);
				} else {
					setSollZustandData(undefined);
				}
			})
			.catch((err: unknown) => {
				console.error('Error loading tree target values:', err);
				setSollZustandData(undefined);
			});
	}, [treeOverview]);

	// Read selected trees from URL query string (e.g. baum=1,2,3)
	useEffect(() => {
		if (selectedBaumNumber) {
			const baumNrs = selectedBaumNumber
				.split(',')
				.map((s) => s.trim())
				.filter((s) => s.length > 0);
			setSelectedTree(baumNrs);
		} else {
			setSelectedTree(undefined);
		}
	}, [selectedBaumNumber]);

	// Fetch user organisation (für SharedSections / Multi-Tree)
	useEffect(() => {
		getUserOrganisation().then(setUserOrg);
	}, []);

	// Fetch tree overview(s): Single = 1 Overview, Multi = alle Overviews
	useEffect(() => {
		if (!selectedObjekt || !selectedTree || selectedTree.length === 0) return;

		if (selectedTree.length === 1) {
			setTreeOverviews([]);
			getTreeOverview(selectedObjekt, selectedTree[0])
				.then(setTreeOverview)
				.catch((err) => {
					console.error('Error loading tree profile:', err);
					setTreeOverview(null);
				});
		} else {
			setTreeOverview(null);
			Promise.all(
				selectedTree.map((baumNr) => getTreeOverview(selectedObjekt, baumNr)),
			)
				.then((overviews) =>
					setTreeOverviews(overviews.filter((o) => o != null)),
				)
				.catch((err) => {
					console.error('Error loading tree profiles:', err);
					setTreeOverviews([]);
				});
		}
	}, [selectedObjekt, selectedTree]);

	// Set selected tree ID (used for profile, not multi-selection)
	useEffect(() => {
		if (selectedTreeId) setTreeId(selectedTreeId);
	}, [selectedTreeId]);

	// Set selected object from URL param
	useEffect(() => {
		if (selectedStreetObjekt) {
			setSelectedObjekt(selectedStreetObjekt);
		}
	}, [selectedStreetObjekt]);

	// Track how often object was changed — after 3x reset selected tree
	useEffect(() => {
		objektSetCount.current += 1;
		if (objektSetCount.current > 3) {
			setSelectedTree(undefined);
		}
	}, [selectedObjekt]);

	// Reset objekt and tree when organisation changes
	const handleOrganisationChange = (org: Organisation) => {
		setSelectedOrganisation(org);
		setSelectedObjekt(undefined);
		setSelectedTree(undefined);
	};

	// If no date range selected, use default range (last 30 days)
	useEffect(() => {
		if (!startDate || !endDate) {
			const { start, end } = getDefaultDateRange();
			setStartDate(start);
			setEndDate(end);
		}
	}, [selectedObjekt]);

	// Keine Bäume: alles zurücksetzen
	useEffect(() => {
		if (!selectedTree || selectedTree.length === 0) {
			setChartData([]);
			setTreeOverview(null);
			setTreeOverviews([]);
			setLatestSensorPerTree({});
			setSollZustandDataPerTree({});
		}
	}, [selectedTree]);

	// Soll-Zustand pro Baum (Multi-Tree): bei mehreren gewählten Bäumen, sobald Overviews da sind
	useEffect(() => {
		if (!selectedTree || selectedTree.length <= 1) return;
		if (treeOverviews.length === 0) return;
		getMultipleTreeTargetValues(treeOverviews)
			.then((treesWithTargets) => {
				const map: Record<string, SollZustandData> = {};
				for (const t of treesWithTargets) {
					const key = t.baum ?? t.baum_nr ?? null;
					if (
						key &&
						t.sollwert_30cm != null &&
						t.sollwert_60cm != null &&
						t.sollwert_90cm != null
					) {
						map[key] = {
							cm30: t.sollwert_30cm,
							cm60: t.sollwert_60cm,
							cm90: t.sollwert_90cm,
						};
					}
				}
				setSollZustandDataPerTree(map);
			})
			.catch(() => setSollZustandDataPerTree({}));
	}, [selectedTree, treeOverviews]);

	/**
	 * Schwellenwerte für das Liniendiagramm:
	 * – ein Baum: wie bisher aus getTreeTargetValues → sollZustandData
	 * – mehrere Bäume: treeOverview ist null, sollZustandData wird nicht gesetzt;
	 *   Sollwerte liegen nur in sollZustandDataPerTree → für die Chart aggregieren (Mittelwert).
	 */
	const lineChartSollZustandData = useMemo((): SollZustandData | undefined => {
		if (!selectedTree || selectedTree.length === 0) return undefined;
		if (selectedTree.length === 1) {
			return sollZustandData;
		}
		const parts: SollZustandData[] = [];
		for (const baumNr of selectedTree) {
			const s = sollZustandDataPerTree[baumNr];
			if (
				s &&
				Number.isFinite(s.cm30) &&
				Number.isFinite(s.cm60) &&
				Number.isFinite(s.cm90)
			) {
				parts.push(s);
			}
		}
		if (parts.length === 0) return undefined;
		const n = parts.length;
		return {
			cm30: parts.reduce((acc, p) => acc + p.cm30, 0) / n,
			cm60: parts.reduce((acc, p) => acc + p.cm60, 0) / n,
			cm90: parts.reduce((acc, p) => acc + p.cm90, 0) / n,
		};
	}, [selectedTree, sollZustandData, sollZustandDataPerTree]);

	const isComparisonEligible = useMemo(() => {
		if (!startDate || !endDate) return false;
		const start = new Date(startDate);
		const end = new Date(endDate);
		const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
		return diffDays <= 366;
	}, [startDate, endDate]);

	useEffect(() => {
		if (!isComparisonEligible) {
			setComparisonYearOptions([]);
			setSelectedComparisonYears([]);
			setComparisonDataByYear({});
		}
	}, [isComparisonEligible]);

	useEffect(() => {
		if (!selectedObjekt || !selectedTree || selectedTree.length === 0) {
			setComparisonYearOptions([]);
			setSelectedComparisonYears([]);
			setComparisonDataByYear({});
		}
	}, [selectedObjekt, selectedTree]);

	// Fetch and transform sensor data when all filters are set
	useEffect(() => {
		if (
			!startDate ||
			!endDate ||
			!selectedObjekt ||
			!selectedTree ||
			selectedTree.length === 0
		)
			return;

		getFilteredTreeSensorData({
			baum: selectedTree,
			objekt: selectedObjekt,
			vonDatum: startDate,
			bisDatum: endDate,
		})
			.then((data: FilteredTreeSensorData) => {
				const transformed = transformSensorData(data ?? []);
				setChartData(transformed);
			})
			.catch((err: unknown) => {
				console.error('Error loading sensor data:', err);
				setChartData([]);
			});
	}, [startDate, endDate, selectedObjekt, selectedTree]);

	// Latest sensor values pro Baum (Multi-Tree) – gleiche Logik wie Single-Tree,
	// aber pro Baum separat berechnet.
	useEffect(() => {
		if (
			!startDate ||
			!endDate ||
			!selectedObjekt ||
			!selectedTree ||
			selectedTree.length <= 1
		)
			return;

		const loadPerTree = async () => {
			try {
				const results = await Promise.all(
					selectedTree.map(async (baumNr) => {
						const data = await getFilteredTreeSensorData({
							baum: [baumNr],
							objekt: selectedObjekt,
							vonDatum: startDate,
							bisDatum: endDate,
						});
						const transformed = transformSensorData(data);
						if (transformed.length === 0) return null;
						const last = transformed[transformed.length - 1];
						return {
							baumNr,
							cm30: last.cm30,
							cm60: last.cm60,
							cm90: last.cm90,
							date: last.date,
						};
					}),
				);

				const map: Record<
					string,
					{
						cm30: number | null;
						cm60: number | null;
						cm90: number | null;
						date: string;
					}
				> = {};
				for (const res of results) {
					if (!res) continue;
					map[res.baumNr] = {
						cm30: res.cm30,
						cm60: res.cm60,
						cm90: res.cm90,
						date: res.date,
					};
				}
				setLatestSensorPerTree(map);
			} catch {
				setLatestSensorPerTree({});
			}
		};

		loadPerTree();
	}, [startDate, endDate, selectedObjekt, selectedTree]);

	// Load comparison data: same relative ISO window per calendar year (past & future)
	useEffect(() => {
		if (
			!isComparisonEligible ||
			!startDate ||
			!endDate ||
			!selectedObjekt ||
			!selectedTree ||
			selectedTree.length === 0
		)
			return;

		let isCancelled = false;

		// Defer comparison fetch slightly so main chart can render first
		const loadComparisonData = async () => {
			if (isCancelled) return;
			const baseYear = new Date(startDate).getFullYear();
			const candidateYears = getDashboardComparisonCandidateYears(baseYear);

			const startYear = new Date(startDate).getFullYear();
			const endYear = new Date(endDate).getFullYear();
			const isCrossYearRange = startYear !== endYear;

			const buildLabel = (year: number): string => {
				if (isCrossYearRange) {
					const shortStart = String(year).slice(2);
					const shortEnd = String(year + 1).slice(2);
					return `${shortStart}/${shortEnd}`;
				}
				return String(year);
			};

			const results = await Promise.all(
				candidateYears.map(async (year) => {
					const yearDelta = year - baseYear;
					const compareStart = shiftIsoDateByYears(startDate, yearDelta);
					const compareEnd = shiftIsoDateByYears(endDate, yearDelta);

					try {
						const data = await getFilteredTreeSensorData({
							baum: selectedTree,
							objekt: selectedObjekt,
							vonDatum: compareStart,
							bisDatum: compareEnd,
						});
						const transformed = transformSensorData(data ?? []);
						// Same rule as main chart: only offer years with at least one daily point
						if (transformed.length === 0) return null;
						return {
							year,
							label: buildLabel(year),
							transformed,
						};
					} catch (err) {
						console.error('Error loading comparison data:', err);
						return null;
					}
				}),
			);

			if (isCancelled) return;

			const options: ComparisonYearOption[] = [];
			const dataByYear: Record<number, SoilMoistureDataPoint[]> = {};

			for (const r of results) {
				if (!r) continue;
				options.push({ value: r.year, label: r.label });
				dataByYear[r.year] = r.transformed;
			}
			options.sort((a, b) => a.value - b.value);

			setComparisonYearOptions(options);
			setComparisonDataByYear(dataByYear);
			setSelectedComparisonYears((prev) => {
				const validPrev = prev.filter((year) =>
					options.some((opt) => opt.value === year),
				);
				return validPrev.length > 0 ? validPrev : [];
			});
		};

		const timeoutId = setTimeout(() => {
			if (isCancelled) return;
			loadComparisonData();
		}, 50);

		return () => {
			isCancelled = true;
			clearTimeout(timeoutId);
		};
	}, [isComparisonEligible, startDate, endDate, selectedObjekt, selectedTree]);

	const comparisonSeries = useMemo(() => {
		if (!isComparisonEligible || selectedComparisonYears.length === 0)
			return [];
		if (!startDate) return [];
		const baseYear = new Date(startDate).getFullYear();
		return selectedComparisonYears.map((year) => {
			const data = comparisonDataByYear[year] ?? [];
			const yearDelta = baseYear - year;
			return {
				year,
				data: shiftGermanDateSeriesByYears(data, yearDelta),
			};
		});
	}, [
		isComparisonEligible,
		selectedComparisonYears,
		comparisonDataByYear,
		startDate,
	]);

	// Render the UI
	return (
		<main className="max-w-6xl w-full mr-auto ml-0 pl-4 pr-4 py-8 bg-gray-50 min-h-screen text-left">
			<h1 className="text-3xl font-bold text-gray-800 mb-10">
				Baumdaten Übersicht
			</h1>
			<div className="space-y-6 text-left">
				{/* Date, Objekt, Tree selection */}
				<section className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl shadow border items-start justify-items-start w-full">
					<div className="flex flex-col w-full">
						<h2 className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
							<span>Zeitraum wählen:</span>
							<HelpHint label="Zeitraum wählen" side="bottom">
								Ohne eigene Auswahl werden automatisch die letzten 30 Tage
								angezeigt. Nur bei Zeiträumen bis zu einem Jahr lässt sich
								zusätzlich ein Jahresvergleich einblenden – bei längeren
								Zeiträumen entfällt diese Option.
							</HelpHint>
						</h2>
						<DateRangePicker
							startDate={startDate}
							endDate={endDate}
							onChange={(start, end) => {
								setStartDate(start);
								setEndDate(end);
								setManuallySetDate(true);
							}}
						/>
						{startDate && endDate && (
							<p className="text-sm text-gray-500 mt-1">
								Zeitraum: {formatDate(startDate)} – {formatDate(endDate)}
								{!manuallySetDate && (
									<span className="italic"> (automatisch-ausgewählt)</span>
								)}
							</p>
						)}
					</div>

					{/* Organisation Selection */}
					<div className="flex flex-col w-full">
						<h2 className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
							<span>Organisation:</span>
							<HelpHint label="Organisation wählen" side="bottom">
								Die Organisation wird beim Öffnen automatisch aus dem
								aufgerufenen Objekt oder Ihrer Standardorganisation vorbelegt.
								Wechseln Sie sie manuell, werden die bisherige Ort- und
								Baumauswahl verworfen.
							</HelpHint>
						</h2>
						<div className="mt-0">
							<OrganisationSelect
								value={selectedOrganisation}
								onChange={handleOrganisationChange}
							/>
						</div>
						{isComparisonEligible && (
							<div className="mt-3">
								<h3 className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
									<span>Vergleichsjahre:</span>
									<HelpHint label="Vergleichsjahre" side="bottom">
										Angeboten werden nur Jahre, für die im selben Kalenderfenster
										tatsächlich Messdaten vorliegen (vergangene wie kommende). Die
										gewählten Jahre werden zeitlich auf Ihren aktuellen Zeitraum
										gelegt und als zusätzliche Linien im Diagramm dargestellt.
									</HelpHint>
								</h3>
								{comparisonYearOptions.length > 0 ? (
									<>
										<ComparisonYearSelect
											options={comparisonYearOptions}
											selectedYears={selectedComparisonYears}
											onChange={setSelectedComparisonYears}
										/>
									</>
								) : (
									<p className="text-sm text-gray-500 italic">
										Keine Vergleichsdaten vorhanden.
									</p>
								)}
							</div>
						)}
					</div>

					{/* Objekt + Tree Selection */}
					<div className="flex flex-col w-full">
						<h2 className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
							<span>{selectedObjekt ? 'Ort ändern:' : 'Ort auswählen:'}</span>
							<HelpHint label="Ort und Baum wählen" side="bottom">
								Erst nach Auswahl eines Orts stehen dessen Bäume zur Auswahl. Bei
								mehreren Bäumen werden die Werte gemeinsam im Diagramm dargestellt
								und je Baum in eigenen Reitern aufgeschlüsselt; die
								Sollwert-Linien zeigen dann den Mittelwert der gewählten Bäume.
							</HelpHint>
						</h2>
						<div className="mt-0">
							<ObjektSelect
								selectedStreetObjekt={selectedObjekt}
								onChange={setSelectedObjekt}
								organisation={selectedOrganisation}
							/>
						</div>
						<div className="mt-2">
							<TreeSelect
								objekt={selectedObjekt}
								onChange={setSelectedTree}
								selectedBaum={selectedTree}
							/>
						</div>
					</div>
				</section>

				{/* Line Chart */}
				<section
					className="bg-white border rounded-xl shadow p-6"
					style={{ minHeight: '500px' }}
				>
					<LineChartComponent
						data={chartData}
						startDate={startDate}
						endDate={endDate}
						sollZustandData={lineChartSollZustandData}
						comparisonSeries={comparisonSeries}
					/>
				</section>
			</div>

			{/* Baumübersicht: Box 1 = baumspezifisch, Box 2 = global (Wetter, Bewässerung) */}
			{selectedObjekt && selectedTree && selectedTree.length >= 1 && (
				<>
					<section className="mt-10">
						<h2 className="text-2xl font-semibold text-gray-800 mb-4">
							Baumübersicht: {selectedObjekt}
						</h2>
						<div className="bg-white border rounded-xl shadow p-6">
							{selectedTree.length === 1 && treeOverview ? (
								<TreeComponent
									treeId={
										treeId ?? treeOverview.baum_id ?? treeOverview.baum_nr ?? ''
									}
									istZustandData={
										istZustandData
											? {
													cm30: istZustandData.cm30,
													cm60: istZustandData.cm60,
													cm90: istZustandData.cm90,
												}
											: undefined
									}
									sollZustandData={sollZustandData}
									lastData={
										chartData?.length
											? parseGermanDate(chartData[chartData.length - 1].date)
											: undefined
									}
									treeOverview={treeOverview}
								/>
							) : treeOverviews.length > 1 ? (
								<Tabs defaultValue="0" className="w-full">
									<TabsList className="flex w-full overflow-x-auto h-auto flex-wrap gap-1 bg-gray-100 p-1">
										{treeOverviews.map((overview, idx) => {
											const baumNr =
												overview.baum ?? overview.baum_nr ?? `baum-${idx}`;
											const label = `Baum ${baumNr}`;
											return (
												<TabsTrigger
													key={`${overview.baum_id ?? baumNr}-${idx}`}
													value={String(idx)}
													className="shrink-0 data-[state=active]:bg-green-700 data-[state=active]:text-white"
												>
													{label}
												</TabsTrigger>
											);
										})}
									</TabsList>
									{treeOverviews.map((overview, idx) => {
										const baumNr =
											overview.baum ?? overview.baum_nr ?? `baum-${idx}`;
										const rawIst = latestSensorPerTree[baumNr];
										const istData = rawIst
											? {
													cm30: rawIst.cm30,
													cm60: rawIst.cm60,
													cm90: rawIst.cm90,
												}
											: undefined;
										const sollData = sollZustandDataPerTree[baumNr];
										const lastData = rawIst?.date
											? parseGermanDate(rawIst.date)
											: undefined;
										return (
											<TabsContent
												key={`${overview.baum_id ?? baumNr}-${idx}`}
												value={String(idx)}
												className="mt-4"
											>
												<TreeSpecificContent
													treeId={overview.baum_id ?? overview.baum_nr ?? ''}
													treeOverview={overview}
													istZustandData={istData}
													sollZustandData={sollData}
													lastData={lastData}
													userOrg={userOrg}
												/>
											</TabsContent>
										);
									})}
								</Tabs>
							) : null}
						</div>
					</section>

					{/* Eigenes Kasten: Wettervorhersage + Letzte Bewässerung (nicht baumspezifisch) */}
					<section className="mt-6">
						<h2 className="text-2xl font-semibold text-gray-800 mb-4">
							Wetter & Bewässerung
						</h2>
						<div className="bg-white border rounded-xl shadow p-6">
							<SharedSections
								bezirk={(treeOverview ?? treeOverviews[0])?.bezirk ?? ''}
								objekt={
									(treeOverview ?? treeOverviews[0])?.objekt ??
									selectedObjekt ??
									''
								}
								userOrg={userOrg}
							/>
						</div>
					</section>
				</>
			)}
		</main>
	);
}
