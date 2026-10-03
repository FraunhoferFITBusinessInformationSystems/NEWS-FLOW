'use client';

/**
 * SharedSections: Globale Sections (Wettervorhersage, Letzte Bewässerung).
 * Werden außerhalb des Carousels genau 1x angezeigt – gelten für alle Bäume im gleichen Objekt/Bezirk.
 * Die eigentliche Bewässerungsempfehlung wird baumspezifisch im Baum-Karussell angezeigt.
 */
import { WeatherForecastPanel } from '@/components/data-display/weather-forecast-panel';
import { exportToCSV } from '@/components/features/reports/data-reports';
import { Button } from '@/components/ui/button';
import { TreeDeciduous } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getTreeWaterings, getUser } from '../action';

interface SharedSectionsProps {
	bezirk: string;
	objekt: string;
	userOrg: string;
}

type PalmGardenWateringRound = {
	watered_at: string;
	water_amount: number;
	objekt_name: string;
	user_id: string;
};

export default function SharedSections({
	bezirk,
	objekt,
	userOrg,
}: SharedSectionsProps) {
	const [treeWaterings, setTreeWaterings] = useState<PalmGardenWateringRound[]>(
		[],
	);
	const [userNames, setUserNames] = useState<Record<string, string>>({});
	const [wateringPage, setWateringPage] = useState(1);
	const wateringPerPage = 5;

	const showPalmengarten =
		userOrg === 'Palmengarten' && bezirk === 'Palmengarten';

	useEffect(() => {
		if (!objekt) return;
		getTreeWaterings(objekt).then(setTreeWaterings);
	}, [objekt]);

	useEffect(() => {
		if (!treeWaterings?.length) return;
		const ids = [...new Set(treeWaterings.map((w) => w.user_id))];
		const load = async () => {
			const names: Record<string, string> = {};
			for (const id of ids) {
				try {
					const u = await getUser(id);
					if (u) names[id] = `${u.vorname} ${u.nachname}`;
					else names[id] = 'Unbekannter Benutzer';
				} catch {
					names[id] = 'Unbekannter Benutzer';
				}
			}
			setUserNames(names);
		};
		load();
	}, [treeWaterings]);

	const sortedWaterings = [...treeWaterings].sort(
		(a, b) =>
			new Date(b.watered_at).getTime() - new Date(a.watered_at).getTime(),
	);
	const paginatedWaterings = sortedWaterings.slice(
		(wateringPage - 1) * wateringPerPage,
		wateringPage * wateringPerPage,
	);
	const totalWateringPages = Math.max(
		1,
		Math.ceil(treeWaterings.length / wateringPerPage),
	);

	return (
		<div className="space-y-6">
			<WeatherForecastPanel bezirk={bezirk} />

			{showPalmengarten && (
				<div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner">
					<h3 className="text-2xl font-extrabold mb-6 text-green-900 flex items-center gap-3">
						<TreeDeciduous className="w-7 h-7 text-green-600" />
						Letzte Bewässerungen
					</h3>
					{treeWaterings && treeWaterings.length > 0 ? (
						<>
							<ul className="space-y-4">
								{paginatedWaterings.map((w, index) => (
									<li
										key={index}
										className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-lg transition-all duration-200"
									>
										<div className="flex justify-between items-start mb-3">
											<div className="flex flex-col gap-1">
												<span className="text-xs text-gray-500 font-medium">
													<strong>Datum:</strong>{' '}
													{new Date(w.watered_at).toLocaleString('de-DE', {
														day: '2-digit',
														month: '2-digit',
														year: 'numeric',
													})}
												</span>
												<span className="text-sm text-gray-700">
													<strong>Menge:</strong> {w.water_amount} Liter pro Qm
												</span>
											</div>
											<div className="text-sm text-gray-600">
												<span className="flex items-center gap-1">
													<span className="font-medium">Von:</span>{' '}
													{userNames[w.user_id] ?? 'Lädt...'}
												</span>
											</div>
										</div>
									</li>
								))}
							</ul>
							{totalWateringPages > 1 && (
								<div className="flex justify-center items-center gap-2 mt-4">
									<Button
										type="button"
										variant="secondary"
										size="sm"
										onClick={() =>
											setWateringPage((p) => Math.max(p - 1, 1))
										}
										disabled={wateringPage === 1}
										aria-label="Vorherige Seite"
									>
										&lt; Zurück
									</Button>
									<span className="text-sm">
										Seite {wateringPage} von {totalWateringPages}
									</span>
									<Button
										type="button"
										variant="secondary"
										size="sm"
										onClick={() =>
											setWateringPage((p) =>
												Math.min(p + 1, totalWateringPages),
											)
										}
										disabled={wateringPage === totalWateringPages}
										aria-label="Nächste Seite"
									>
										Weiter &gt;
									</Button>
								</div>
							)}
							<Button
								type="button"
								className="mt-4 bg-green-700 hover:bg-green-800 text-white"
								onClick={async () => {
									const translated = treeWaterings.map((w) => {
										const { user_id, ...rest } = w;
										return {
											Bewässert_am: rest.watered_at,
											Wassermenge: rest.water_amount,
											Objekt: rest.objekt_name,
											Benutzer: userNames[user_id] ?? 'Unbekannt',
										};
									});
									await exportToCSV(translated, 'watering_report_' + objekt);
									toast.info('Download wurde gestartet...');
								}}
							>
								Export CSV
							</Button>
						</>
					) : (
						<p className="text-gray-400 italic text-center mt-4">
							Noch keine Bewässerungen vorhanden.
						</p>
					)}
				</div>
			)}
		</div>
	);
}
