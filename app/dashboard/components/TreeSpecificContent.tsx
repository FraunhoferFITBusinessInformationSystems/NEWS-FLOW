'use client';

/**
 * TreeSpecificContent: Baumspezifische Sections (Zustand, Baumdaten, Notizen, Neue Notiz).
 * Wird im Single-Tree-Flow direkt genutzt und im Multi-Tree-Flow pro Carousel-Slide.
 * Immer dem aktiven Baum zugeordnet (treeId/treeOverview).
 */
import { getStatusColor } from '@/components/data-display/StatusColoring';
import {
	type WeatherData,
	WeatherForecast,
} from '@/components/data-display/WeatherForecast';
import { Button } from '@/components/ui/button';
import { HelpHint } from '@/components/ui/help-hint';
import type { TreeNoteFormValues } from '@/lib/validations/tree-note';
import { treeNoteFormSchema } from '@/lib/validations/tree-note';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	AlertTriangle,
	CloudRain,
	Droplet,
	Home,
	Info,
	Landmark,
	Leaf,
	MapPin,
	Trash2,
	TreeDeciduous,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
	addNoteToTree,
	deleteNote,
	getBewaesserungLiterPalmengarten,
	getCurrentUser,
	getTreeNotes,
} from '../action';

import type {
	IstZustandData,
	SollZustandData,
	TreeOverview,
} from '@/lib/types/dashboard';

interface TreeSpecificContentProps {
	treeId: string;
	treeOverview: TreeOverview;
	istZustandData?: IstZustandData;
	sollZustandData?: SollZustandData;
	lastData?: Date;
	userOrg: string;
}

function InfoPair({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
}) {
	return (
		<>
			<dt className="flex items-center gap-2 font-semibold text-green-700">
				{icon}
				{label}:
			</dt>
			<dd className="truncate">{value ?? '–'}</dd>
		</>
	);
}

export default function TreeSpecificContent({
	treeId,
	treeOverview,
	istZustandData,
	sollZustandData,
	lastData,
	userOrg,
}: TreeSpecificContentProps) {
	const depths = [30, 60, 90];
	const [creatorId, setCreatorId] = useState('');
	const [treeNotes, setTreeNotes] = useState<
		{ id: string; notiz: string; erstellt_am: string }[]
	>([]);
	const [bewaesserungLiter, setBewaesserungLiter] = useState<number | null>(
		null,
	);
	const [currentPage, setCurrentPage] = useState(1);
	const notesPerPage = 5;
	const [wateringRecommendation, setWateringRecommendation] = useState<{
		text: string;
		type: 'warning' | 'moderate' | 'info';
	} | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<TreeNoteFormValues>({
		resolver: zodResolver(treeNoteFormSchema),
		defaultValues: { notiz: '' },
	});

	const isOutdated = (date: Date) => {
		const diffDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
		return diffDays > 2;
	};

	useEffect(() => {
		getTreeNotes(treeId).then(setTreeNotes);
	}, [treeId]);

	useEffect(() => {
		if (treeOverview?.bezirk !== 'Palmengarten' || !treeOverview?.objekt) {
			setBewaesserungLiter(null);
			return;
		}
		getBewaesserungLiterPalmengarten(treeOverview.objekt).then(
			setBewaesserungLiter,
		);
	}, [treeOverview?.bezirk, treeOverview?.objekt]);

	useEffect(() => {
		getCurrentUser().then(({ data, error }) => {
			if (!error && data?.user?.id) setCreatorId(data.user.id);
		});
	}, []);

	useEffect(() => {
		if (!treeOverview?.bezirk || !istZustandData || !sollZustandData) {
			setWateringRecommendation(null);
			return;
		}

		const load = async () => {
			try {
				const bezirk = treeOverview?.bezirk ?? '';
				if (!bezirk) {
					setWateringRecommendation(null);
					return;
				}
				const dailyData: WeatherData[] = await WeatherForecast(bezirk);
				const todayStr = new Date().toISOString().slice(0, 10);
				const daysToShow = dailyData
					.filter((d) => d.date >= todayStr)
					.slice(0, 7);
				const rec = getWateringRecommendation(
					daysToShow,
					istZustandData,
					sollZustandData,
				);
				setWateringRecommendation(rec);
			} catch {
				setWateringRecommendation(null);
			}
		};

		load();
	}, [treeOverview?.bezirk, istZustandData, sollZustandData]);

	const sortedNotes = [...treeNotes].sort(
		(a, b) =>
			new Date(b.erstellt_am).getTime() - new Date(a.erstellt_am).getTime(),
	);
	const paginatedNotes = sortedNotes.slice(
		(currentPage - 1) * notesPerPage,
		currentPage * notesPerPage,
	);
	const totalPages = Math.max(1, Math.ceil(treeNotes.length / notesPerPage));

	const showPalmengartenSections =
		userOrg === 'Palmengarten' && treeOverview?.bezirk === 'Palmengarten';

	function getWateringRecommendation(
		daysToShow: WeatherData[],
		ist: IstZustandData | undefined,
		soll: SollZustandData | undefined,
	) {
		if (!daysToShow?.length || !ist || !soll) return null;

		const next5Days = daysToShow.slice(0, 5);
		const totalRainSum = next5Days.reduce(
			(sum, day) => sum + (day.totalPrecipitation ?? 0),
			0,
		);
		const totalSunHours = next5Days.reduce(
			(sum, day) => sum + (day.sunshineHours ?? 0),
			0,
		);

		const needsWater = (['cm30', 'cm60', 'cm90'] as const).some((key) => {
			const istVal = ist[key];
			const sollVal = soll[key];
			return istVal != null && istVal > sollVal;
		});

		const highSunThreshold = 25;
		const lowRainThreshold = 5;

		if (
			totalRainSum < lowRainThreshold &&
			needsWater &&
			totalSunHours >= highSunThreshold
		)
			return {
				text: 'In den nächsten Tagen wird wenig Regen erwartet und viel Sonne prognostiziert. Gießen wird dringend empfohlen.',
				type: 'warning' as const,
			};
		if (totalRainSum < lowRainThreshold && needsWater)
			return {
				text: 'In den nächsten Tagen wird wenig Regen erwartet. Gießen wird empfohlen.',
				type: 'warning' as const,
			};
		if (totalRainSum >= lowRainThreshold && totalRainSum < 15 && needsWater)
			return {
				text: 'Leichter bis moderater Regen für die kommenden Tage erwartet. Bewässerungsbedarf beobachten.',
				type: 'moderate' as const,
			};
		if (totalRainSum >= 15 && needsWater)
			return {
				text: 'Ausreichend Regen für die kommenden Tage erwartet.',
				type: 'info' as const,
			};
		return null;
	}

	return (
		<div className="space-y-6 min-w-0 flex-shrink-0 w-full">
			{/* Zustand */}
			<div>
				<h3 className="text-2xl font-bold mb-5 text-green-900 flex items-center gap-2">
					<Droplet className="w-6 h-6 text-green-700" />
					Zustand (Ist vs. Soll)
				</h3>
				<div className="overflow-x-auto bg-gray-50 p-5 rounded-xl shadow-inner border border-gray-100 text-sm">
					<table className="min-w-full table-auto border-collapse">
						<thead>
							<tr className="text-left text-gray-600">
								<th className="px-4 py-2">Tiefe</th>
								<th className="px-4 py-2">Ist-Wert (kPa)</th>
								<th className="px-4 py-2">max. Soll-Wert (kPa)</th>
							</tr>
						</thead>
						<tbody>
							{depths.map((depth, index) => {
								const key = `cm${depth}` as keyof SollZustandData;
								const ist = istZustandData?.[key];
								const soll = sollZustandData?.[key];
								const bgColor = getStatusColor(ist, soll);
								return (
									<tr key={depth} className="text-white font-medium">
										<td
											className={`px-4 py-2 ${index === 0 ? 'rounded-tl-xl' : ''} ${index === depths.length - 1 ? 'rounded-bl-xl' : ''}`}
											style={{ backgroundColor: bgColor }}
										>
											{depth} cm
										</td>
										<td
											className="px-4 py-2"
											style={{ backgroundColor: bgColor }}
										>
											{ist !== undefined && ist !== null
												? `${ist.toFixed(1)}`
												: 'n/a'}
										</td>
										<td
											className={`px-4 py-2 ${index === 0 ? 'rounded-tr-xl' : ''} ${index === depths.length - 1 ? 'rounded-br-xl' : ''}`}
											style={{ backgroundColor: bgColor }}
										>
											{soll ? `${soll}` : '–'}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
				{lastData && isOutdated(new Date(lastData)) && (
					<div className="mt-4 text-center text-red-600 text-sm font-semibold flex items-center justify-center gap-2">
						<AlertTriangle className="w-5 h-5" />
						Letztes Sensor-Update:{' '}
						{lastData.toLocaleDateString('de-DE', {
							day: '2-digit',
							month: '2-digit',
							year: 'numeric',
						})}
					</div>
				)}
			</div>

			{/* Baumdaten */}
			<div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner">
				<h3 className="text-2xl font-bold mb-6 text-green-900 flex items-center gap-2">
					<TreeDeciduous className="w-6 h-6 text-green-700" />
					Baumdaten
				</h3>
				{treeOverview ? (
					<dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-gray-700 text-sm">
						<InfoPair
							icon={<MapPin className="text-green-600 w-4 h-4" />}
							label="Bezirk"
							value={treeOverview.bezirk ?? '–'}
						/>
						<InfoPair
							icon={<Home className="text-green-600 w-4 h-4" />}
							label="Objekt"
							value={treeOverview.objekt ?? '–'}
						/>
						<InfoPair
							icon={<TreeDeciduous className="text-green-600 w-4 h-4" />}
							label="Baum"
							value={treeOverview.baum ?? '–'}
						/>
						<InfoPair
							icon={<Leaf className="text-green-600 w-4 h-4" />}
							label="Art"
							value={treeOverview.gattung_art ?? '–'}
						/>
						{treeOverview.bezirk !== 'Palmengarten' && (
							<>
								<InfoPair
									icon={<MapPin className="text-green-600 w-4 h-4" />}
									label="Stadtteil"
									value={treeOverview.stadtteil ?? '–'}
								/>
								<InfoPair
									icon={<Landmark className="text-green-600 w-4 h-4" />}
									label="Pflegebereich"
									value={treeOverview.pflegebereich ?? '–'}
								/>
								<InfoPair
									icon={<Droplet className="text-green-600 w-4 h-4" />}
									label="Bewässerungsbereich"
									value={treeOverview.bewaesserungsbereich?.name ?? '–'}
								/>
								<InfoPair
									icon={<Info className="text-green-600 w-4 h-4" />}
									label="Alter in Jahren"
									value={`${treeOverview.standalter ?? '–'}`}
								/>
							</>
						)}
						{treeOverview.bezirk === 'Palmengarten' && (
							<InfoPair
								icon={<Droplet className="text-green-600 w-4 h-4" />}
								label="Bewässerung (laut Strategie)"
								value={
									bewaesserungLiter != null ? `${bewaesserungLiter} Liter` : '–'
								}
							/>
						)}
					</dl>
				) : (
					<p className="text-center text-gray-400 italic">
						Keine Daten verfügbar
					</p>
				)}
			</div>

			{/* Baumspezifische Bewässerungsempfehlung auf Basis Wetter + Ist/Soll */}
			{wateringRecommendation && (
				<div
					className={`bg-blue-50 border rounded-2xl px-4 py-3 flex items-center gap-2 ${
						wateringRecommendation.type === 'warning'
							? 'bg-yellow-50 border-yellow-300 text-yellow-800'
							: wateringRecommendation.type === 'moderate'
								? 'bg-orange-50 border-orange-300 text-orange-800'
								: 'bg-blue-50 border-blue-300 text-blue-800'
					}`}
				>
					{wateringRecommendation.type === 'warning' ? (
						<AlertTriangle className="w-5 h-5" />
					) : wateringRecommendation.type === 'moderate' ? (
						<Info className="w-5 h-5" />
					) : (
						<CloudRain className="w-5 h-5" />
					)}
					<span className="text-sm font-medium">
						{wateringRecommendation.text}
					</span>
				</div>
			)}

			{/* Notizen zum Baum */}
			{showPalmengartenSections && (
				<div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner">
					<h3 className="text-2xl font-bold mb-6 text-green-900 flex items-center gap-2">
						<TreeDeciduous className="w-6 h-6 text-green-700" />
						Notizen zum Baum
					</h3>
					{treeNotes && treeNotes.length > 0 ? (
						<>
							<ul className="space-y-4">
								{paginatedNotes.map((n, index) => (
									<li
										key={n.id || index}
										className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition"
									>
										<div className="flex justify-between items-start mb-2">
											<span className="text-xs text-gray-500">
												{new Date(n.erstellt_am).toLocaleString('de-DE', {
													day: '2-digit',
													month: '2-digit',
													year: 'numeric',
													hour: '2-digit',
													minute: '2-digit',
												})}
											</span>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="text-gray-400 hover:text-red-600 hover:bg-red-50"
												onClick={async () => {
													if (
														confirm('Willst du diese Notiz wirklich löschen?')
													) {
														await deleteNote(n.id);
														const updated = await getTreeNotes(treeId);
														setTreeNotes(updated);
													}
												}}
												title="Notiz löschen"
												aria-label="Notiz löschen"
											>
												<Trash2 className="w-4 h-4" strokeWidth={1.8} />
											</Button>
										</div>
										<p className="text-gray-800 text-sm whitespace-pre-line break-words border-t border-gray-100 pt-2">
											{n.notiz}
										</p>
									</li>
								))}
							</ul>
							{totalPages > 1 && (
								<div className="flex justify-center items-center gap-2 mt-4">
									<Button
										type="button"
										variant="secondary"
										size="sm"
										onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
										disabled={currentPage === 1}
										aria-label="Vorherige Seite"
									>
										&lt; Zurück
									</Button>
									<span className="text-sm">
										Seite {currentPage} von {totalPages}
									</span>
									<Button
										type="button"
										variant="secondary"
										size="sm"
										onClick={() =>
											setCurrentPage((p) => Math.min(p + 1, totalPages))
										}
										disabled={currentPage === totalPages}
										aria-label="Nächste Seite"
									>
										Weiter &gt;
									</Button>
								</div>
							)}
						</>
					) : (
						<p className="text-gray-400 italic text-center">
							Noch keine Notizen vorhanden.
						</p>
					)}
				</div>
			)}

			{/* Neue Notiz (immer dem aktiven Baum zugeordnet via treeId) */}
			{showPalmengartenSections && (
				<div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner">
					<h3 className="text-xl font-bold mb-4 text-green-900 flex items-center gap-2">
						<Info className="w-5 h-5 text-green-700" />
						Neue Notiz hinzufügen
						<HelpHint label="Neue Notiz hinzufügen" side="bottom">
							Die Notiz (bis 2000 Zeichen) wird immer dem Baum zugeordnet, der
							gerade aktiv ist – bei mehreren ausgewählten Bäumen also dem Baum
							des geöffneten Reiters. Prüfen Sie daher vor dem Speichern, welcher
							Reiter aktiv ist.
						</HelpHint>
					</h3>
					<form
						onSubmit={handleSubmit(async (data) => {
							const currentTime = new Date().toISOString();
							await addNoteToTree(treeId, data.notiz, creatorId, currentTime);
							toast.success('Notiz wurde hinzugefügt!');
							reset();
							const updated = await getTreeNotes(treeId);
							setTreeNotes(updated);
						})}
						className="space-y-3"
					>
						<div>
							<textarea
								{...register('notiz')}
								className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-green-400 focus:outline-none transition aria-invalid:border-red-500"
								rows={3}
								placeholder="Kommentar eingeben..."
								aria-label="Neue Notiz"
								aria-invalid={Boolean(errors.notiz)}
								aria-describedby={errors.notiz ? 'notiz-error' : undefined}
							/>
							{errors.notiz && (
								<p
									id="notiz-error"
									className="mt-1 text-sm text-red-600"
									role="alert"
								>
									{errors.notiz.message}
								</p>
							)}
						</div>
						<div className="flex justify-end">
							<Button
								type="submit"
								className="bg-green-700 hover:bg-green-800 text-white"
								disabled={isSubmitting || !creatorId}
							>
								{isSubmitting ? 'Wird gespeichert…' : 'Notiz hinzufügen'}
							</Button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
}
