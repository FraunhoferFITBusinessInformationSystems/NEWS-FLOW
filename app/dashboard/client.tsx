'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import LineChartComponent from './components/LineChartComponent';
import SiteSelect from './components/SiteSelect';
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
	SoilMoistureReading,
	TargetValues,
	TreeOverview,
} from '@/lib/types/dashboard';
import {
	formatDate,
	getDashboardComparisonCandidateYears,
	getDefaultDateRange,
	parseGermanDate,
	shiftGermanDateSeriesByYears,
	shiftIsoDateByYears,
	transformSensorData,
} from '@/lib/utils/dashboard';
import { getFilteredTreeSensorData, getTreeOverview } from './action';
import ComparisonYearSelect from './components/ComparisonYearSelect';
import TreeSelect from './components/TreeSelect';
import TreeSpecificContent from './components/TreeSpecificContent';

export default function DashboardClient() {
	const searchParams = useSearchParams();
	const siteParam = searchParams.get('site');
	const treesParam = searchParams.get('trees');

	const [startDate, setStartDate] = useState<string | undefined>();
	const [endDate, setEndDate] = useState<string | undefined>();
	const [manuallySetDate, setManuallySetDate] = useState(false);
	const [selectedSite, setSelectedSite] = useState<string | undefined>();
	const [selectedTree, setSelectedTree] = useState<string[] | undefined>();
	const [chartData, setChartData] = useState<SoilMoistureDataPoint[]>([]);
	const [treeOverview, setTreeOverview] = useState<TreeOverview | null>(null);
	const [treeOverviews, setTreeOverviews] = useState<TreeOverview[]>([]);
	const [latestSensorPerTree, setLatestSensorPerTree] =
		useState<LatestSensorPerTree>({});
	const [targetValuesPerTree, setTargetValuesPerTree] = useState<
		Record<string, TargetValues>
	>({});
	const [targetValues, setTargetValues] = useState<TargetValues | undefined>();
	const [comparisonYearOptions, setComparisonYearOptions] = useState<
		ComparisonYearOption[]
	>([]);
	const [selectedComparisonYears, setSelectedComparisonYears] = useState<
		number[]
	>([]);
	const [comparisonDataByYear, setComparisonDataByYear] = useState<
		Record<number, SoilMoistureDataPoint[]>
	>({});

	const siteChangeCount = useRef(0); // Tracks how many times the site has been changed

	// Most recent chart entry (aggregated over the selected trees)
	const currentValues =
		chartData.length > 0 ? chartData[chartData.length - 1] : undefined;

	useEffect(() => {
		if (!treeOverview) return;

		getTreeTargetValues(treeOverview)
			.then((treeTargets) => {
				// Only set data if all values are available
				if (
					treeTargets.target_30cm !== null &&
					treeTargets.target_60cm !== null &&
					treeTargets.target_90cm !== null
				) {
					setTargetValues({
						cm30: treeTargets.target_30cm,
						cm60: treeTargets.target_60cm,
						cm90: treeTargets.target_90cm,
					});
				} else {
					setTargetValues(undefined);
				}
			})
			.catch((err: unknown) => {
				console.error('Error loading tree target values:', err);
				setTargetValues(undefined);
			});
	}, [treeOverview]);

	// Read selected trees from URL query string (e.g. trees=1,2,3)
	useEffect(() => {
		if (treesParam) {
			const treeNumbers = treesParam
				.split(',')
				.map((s) => s.trim())
				.filter((s) => s.length > 0);
			setSelectedTree(treeNumbers);
		} else {
			setSelectedTree(undefined);
		}
	}, [treesParam]);

	// Fetch tree overview(s): one overview for a single tree, all overviews for several
	useEffect(() => {
		if (!selectedSite || !selectedTree || selectedTree.length === 0) return;

		if (selectedTree.length === 1) {
			setTreeOverviews([]);
			getTreeOverview(selectedSite, selectedTree[0])
				.then(setTreeOverview)
				.catch((err) => {
					console.error('Error loading tree profile:', err);
					setTreeOverview(null);
				});
		} else {
			setTreeOverview(null);
			Promise.all(
				selectedTree.map((treeNumber) =>
					getTreeOverview(selectedSite, treeNumber),
				),
			)
				.then((overviews) =>
					setTreeOverviews(overviews.filter((o) => o != null)),
				)
				.catch((err) => {
					console.error('Error loading tree profiles:', err);
					setTreeOverviews([]);
				});
		}
	}, [selectedSite, selectedTree]);

	// Set selected site from URL param
	useEffect(() => {
		if (siteParam) {
			setSelectedSite(siteParam);
		}
	}, [siteParam]);

	// Track how often the site was changed — after 3x reset selected tree
	// biome-ignore lint/correctness/useExhaustiveDependencies: selectedSite is the trigger (run on every site change), not a value read inside the effect. Removing it would run the effect only once.
	useEffect(() => {
		siteChangeCount.current += 1;
		if (siteChangeCount.current > 3) {
			setSelectedTree(undefined);
		}
	}, [selectedSite]);

	// If no date range selected, use default range (last 30 days)
	// biome-ignore lint/correctness/useExhaustiveDependencies: selectedSite is the trigger: the default range is applied when the site changes. startDate and endDate are deliberately not dependencies, otherwise clearing a date in the picker would immediately refill it.
	useEffect(() => {
		if (!startDate || !endDate) {
			const { start, end } = getDefaultDateRange();
			setStartDate(start);
			setEndDate(end);
		}
	}, [selectedSite]);

	// No trees selected: reset everything
	useEffect(() => {
		if (!selectedTree || selectedTree.length === 0) {
			setChartData([]);
			setTreeOverview(null);
			setTreeOverviews([]);
			setLatestSensorPerTree({});
			setTargetValuesPerTree({});
		}
	}, [selectedTree]);

	// Target values per tree (multi-tree view), as soon as the overviews are loaded
	useEffect(() => {
		if (!selectedTree || selectedTree.length <= 1) return;
		if (treeOverviews.length === 0) return;
		getMultipleTreeTargetValues(treeOverviews)
			.then((treesWithTargets) => {
				const map: Record<string, TargetValues> = {};
				for (const t of treesWithTargets) {
					const key = t.tree_number;
					if (
						key &&
						t.target_30cm != null &&
						t.target_60cm != null &&
						t.target_90cm != null
					) {
						map[key] = {
							cm30: t.target_30cm,
							cm60: t.target_60cm,
							cm90: t.target_90cm,
						};
					}
				}
				setTargetValuesPerTree(map);
			})
			.catch(() => setTargetValuesPerTree({}));
	}, [selectedTree, treeOverviews]);

	/**
	 * Target lines for the line chart:
	 * – one tree: targetValues from getTreeTargetValues
	 * – several trees: treeOverview is null and targetValues is not set; the
	 *   targets only exist in targetValuesPerTree, so the chart shows their mean.
	 */
	const chartTargetValues = useMemo((): TargetValues | undefined => {
		if (!selectedTree || selectedTree.length === 0) return undefined;
		if (selectedTree.length === 1) {
			return targetValues;
		}
		const parts: TargetValues[] = [];
		for (const treeNumber of selectedTree) {
			const s = targetValuesPerTree[treeNumber];
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
	}, [selectedTree, targetValues, targetValuesPerTree]);

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
		if (!selectedSite || !selectedTree || selectedTree.length === 0) {
			setComparisonYearOptions([]);
			setSelectedComparisonYears([]);
			setComparisonDataByYear({});
		}
	}, [selectedSite, selectedTree]);

	// Fetch and transform sensor data when all filters are set
	useEffect(() => {
		if (
			!startDate ||
			!endDate ||
			!selectedSite ||
			!selectedTree ||
			selectedTree.length === 0
		)
			return;

		getFilteredTreeSensorData({
			treeNumbers: selectedTree,
			site: selectedSite,
			fromDate: startDate,
			toDate: endDate,
		})
			.then((data: SoilMoistureReading[]) => {
				const transformed = transformSensorData(data ?? []);
				setChartData(transformed);
			})
			.catch((err: unknown) => {
				console.error('Error loading sensor data:', err);
				setChartData([]);
			});
	}, [startDate, endDate, selectedSite, selectedTree]);

	// Latest sensor values per tree (multi-tree view): same logic as the
	// single-tree view, but computed for each tree separately.
	useEffect(() => {
		if (
			!startDate ||
			!endDate ||
			!selectedSite ||
			!selectedTree ||
			selectedTree.length <= 1
		)
			return;

		const loadPerTree = async () => {
			try {
				const results = await Promise.all(
					selectedTree.map(async (treeNumber) => {
						const data = await getFilteredTreeSensorData({
							treeNumbers: [treeNumber],
							site: selectedSite,
							fromDate: startDate,
							toDate: endDate,
						});
						const transformed = transformSensorData(data);
						if (transformed.length === 0) return null;
						const last = transformed[transformed.length - 1];
						return {
							treeNumber,
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
					map[res.treeNumber] = {
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
	}, [startDate, endDate, selectedSite, selectedTree]);

	// Load comparison data: same relative ISO window per calendar year (past & future)
	useEffect(() => {
		if (
			!isComparisonEligible ||
			!startDate ||
			!endDate ||
			!selectedSite ||
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
							treeNumbers: selectedTree,
							site: selectedSite,
							fromDate: compareStart,
							toDate: compareEnd,
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
	}, [isComparisonEligible, startDate, endDate, selectedSite, selectedTree]);

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
		<div className="w-full px-4 py-8 text-left">
			<h1 className="text-3xl font-bold text-gray-800 mb-10">
				Baumdaten Übersicht
			</h1>
			<div className="space-y-6 text-left">
				{/* Date, site and tree selection */}
				<section className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl shadow border items-start justify-items-start w-full">
					{/* Site and tree selection */}
					<div className="flex flex-col w-full">
						<h2 className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
							<span>
								{selectedSite ? 'Objekt ändern:' : 'Objekt auswählen:'}
							</span>
							<HelpHint label="Objekt und Baum wählen" side="bottom">
								Erst nach Auswahl eines Objekts stehen dessen Bäume zur Auswahl.
								Bei mehreren Bäumen werden die Werte gemeinsam im Diagramm
								dargestellt und je Baum in eigenen Reitern aufgeschlüsselt; die
								Sollwert-Linien zeigen dann den Mittelwert der gewählten Bäume.
							</HelpHint>
						</h2>
						<div className="mt-0">
							<SiteSelect
								selectedSite={selectedSite}
								onChange={setSelectedSite}
							/>
						</div>
						<div className="mt-2">
							<TreeSelect
								site={selectedSite}
								onChange={setSelectedTree}
								selectedTrees={selectedTree}
							/>
						</div>
					</div>
					{/*Date selection*/}
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
					{/* Comparison years */}
					<div className="flex flex-col w-full">
						<h2 className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
							<span>Vergleichsjahre:</span>
							<HelpHint label="Vergleichsjahre" side="bottom">
								Angeboten werden nur Jahre, für die im selben Kalenderfenster
								tatsächlich Messdaten vorliegen (vergangene wie kommende). Die
								gewählten Jahre werden zeitlich auf Ihren aktuellen Zeitraum
								gelegt und als zusätzliche Linien im Diagramm dargestellt.
							</HelpHint>
						</h2>
						{!isComparisonEligible ? (
							<p className="text-sm text-gray-500 italic">
								Nur für Zeiträume bis zu einem Jahr verfügbar.
							</p>
						) : comparisonYearOptions.length > 0 ? (
							<ComparisonYearSelect
								options={comparisonYearOptions}
								selectedYears={selectedComparisonYears}
								onChange={setSelectedComparisonYears}
							/>
						) : (
							<p className="text-sm text-gray-500 italic">
								Keine Vergleichsdaten vorhanden.
							</p>
						)}
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
						targetValues={chartTargetValues}
						comparisonSeries={comparisonSeries}
					/>
				</section>
			</div>
			{/* Tree overview: one tree directly, several trees as tabs */}
			{selectedSite && selectedTree && selectedTree.length >= 1 && (
				<section className="mt-10">
					<h2 className="text-2xl font-semibold text-gray-800 mb-4">
						Baumübersicht: {selectedSite}
					</h2>
					<div className="bg-white border rounded-xl shadow p-6">
						{selectedTree.length === 1 && treeOverview ? (
							<TreeComponent
								treeId={treeOverview.tree_id ?? ''}
								currentValues={
									currentValues
										? {
												cm30: currentValues.cm30,
												cm60: currentValues.cm60,
												cm90: currentValues.cm90,
											}
										: undefined
								}
								targetValues={targetValues}
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
										const treeNumber = overview.tree_number ?? `tree-${idx}`;
										const label = `Baum ${treeNumber}`;
										return (
											<TabsTrigger
												key={`${overview.tree_id ?? treeNumber}-${idx}`}
												value={String(idx)}
												className="shrink-0 data-[state=active]:bg-green-700 data-[state=active]:text-white"
											>
												{label}
											</TabsTrigger>
										);
									})}
								</TabsList>
								{treeOverviews.map((overview, idx) => {
									const treeNumber = overview.tree_number ?? `tree-${idx}`;
									const latestReading = latestSensorPerTree[treeNumber];
									const currentData = latestReading
										? {
												cm30: latestReading.cm30,
												cm60: latestReading.cm60,
												cm90: latestReading.cm90,
											}
										: undefined;
									const targetData = targetValuesPerTree[treeNumber];
									const lastData = latestReading?.date
										? parseGermanDate(latestReading.date)
										: undefined;
									return (
										<TabsContent
											key={`${overview.tree_id ?? treeNumber}-${idx}`}
											value={String(idx)}
											className="mt-4"
										>
											<TreeSpecificContent
												treeId={overview.tree_id ?? ''}
												treeOverview={overview}
												currentValues={currentData}
												targetValues={targetData}
												lastData={lastData}
											/>
										</TabsContent>
									);
								})}
							</Tabs>
						) : null}
					</div>
				</section>
			)}
		</div>
	);
}
