'use client';

import { getStatusColor } from '@/components/data-display/StatusColoring';
import { Button } from '@/components/ui/button';
import { HelpHint } from '@/components/ui/help-hint';
import type { TreeNoteFormValues } from '@/lib/validations/tree-note';
import { treeNoteFormSchema } from '@/lib/validations/tree-note';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	AlertTriangle,
	Droplet,
	Home,
	Info,
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
	getCurrentUser,
	getTreeNotes,
} from '../action';

import type {
	CurrentValues,
	TargetValues,
	TreeNote,
	TreeOverview,
} from '@/lib/types/dashboard';

interface TreeSpecificContentProps {
	treeId: string;
	treeOverview: TreeOverview;
	currentValues?: CurrentValues;
	targetValues?: TargetValues;
	lastData?: Date;
	/** True when the selected period ends today; only then can a sensor be stale. */
	periodEndsToday: boolean;
}

function formatLastDataDate(date: Date): string {
	return date.toLocaleDateString('de-DE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
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

/**
 * Tree-specific sections: state (Ist vs. Soll), tree data, notes and the form
 * for a new note. Used directly in the single-tree view and once per tab in the
 * multi-tree view. Client component that loads and changes the notes through
 * the server actions in ../action.ts.
 */
export default function TreeSpecificContent({
	treeId,
	treeOverview,
	currentValues,
	targetValues,
	lastData,
	periodEndsToday,
}: TreeSpecificContentProps) {
	const depths = [30, 60, 90];
	const [creatorId, setCreatorId] = useState('');
	const [treeNotes, setTreeNotes] = useState<TreeNote[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const notesPerPage = 5;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<TreeNoteFormValues>({
		resolver: zodResolver(treeNoteFormSchema),
		defaultValues: { note: '' },
	});

	const isOutdated = (date: Date) => {
		const diffDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
		return diffDays > 2;
	};

	useEffect(() => {
		getTreeNotes(treeId).then(setTreeNotes);
	}, [treeId]);

	useEffect(() => {
		getCurrentUser().then(({ data, error }) => {
			if (!error && data?.user?.id) setCreatorId(data.user.id);
		});
	}, []);

	const sortedNotes = [...treeNotes].sort(
		(a, b) =>
			new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
	);
	const paginatedNotes = sortedNotes.slice(
		(currentPage - 1) * notesPerPage,
		currentPage * notesPerPage,
	);
	const totalPages = Math.max(1, Math.ceil(treeNotes.length / notesPerPage));

	return (
		<div className="space-y-6 min-w-0 flex-shrink-0 w-full">
			{/* Current vs. target state */}
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
								const key = `cm${depth}` as keyof TargetValues;
								const current = currentValues?.[key];
								const target = targetValues?.[key];
								const bgColor = getStatusColor(current, target);
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
											{current !== undefined && current !== null
												? `${current.toFixed(1)}`
												: 'n/a'}
										</td>
										<td
											className={`px-4 py-2 ${index === 0 ? 'rounded-tr-xl' : ''} ${index === depths.length - 1 ? 'rounded-br-xl' : ''}`}
											style={{ backgroundColor: bgColor }}
										>
											{target ? `${target}` : '–'}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
				{/* The values above are the last reading in the selected period */}
				{lastData &&
					(periodEndsToday && isOutdated(lastData) ? (
						<div className="mt-4 text-center text-red-600 text-sm font-semibold flex items-center justify-center gap-2">
							<AlertTriangle className="w-5 h-5" />
							Letztes Sensor-Update: {formatLastDataDate(lastData)}
						</div>
					) : (
						<p className="mt-4 text-center text-sm text-gray-500">
							Letzter Wert im Zeitraum: {formatLastDataDate(lastData)}
						</p>
					))}
			</div>

			{/* Tree data */}
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
							value={treeOverview.district ?? '–'}
						/>
						<InfoPair
							icon={<Home className="text-green-600 w-4 h-4" />}
							label="Objekt"
							value={treeOverview.site ?? '–'}
						/>
						<InfoPair
							icon={<TreeDeciduous className="text-green-600 w-4 h-4" />}
							label="Baum"
							value={treeOverview.tree_number ?? '–'}
						/>
						<InfoPair
							icon={<Leaf className="text-green-600 w-4 h-4" />}
							label="Art"
							value={treeOverview.type_species ?? '–'}
						/>
						<InfoPair
							icon={<Droplet className="text-green-600 w-4 h-4" />}
							label="Bewässerungsbereich"
							value={treeOverview.irrigation_area_name ?? '–'}
						/>
						<InfoPair
							icon={<Info className="text-green-600 w-4 h-4" />}
							label="Alter in Jahren"
							value={`${treeOverview.tree_site_age ?? '–'}`}
						/>
					</dl>
				) : (
					<p className="text-center text-gray-400 italic">
						Keine Daten verfügbar
					</p>
				)}
			</div>

			{/* Notes on the tree */}
			<div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner">
				<h3 className="text-2xl font-bold mb-6 text-green-900 flex items-center gap-2">
					<TreeDeciduous className="w-6 h-6 text-green-700" />
					Notizen zum Baum
				</h3>
				{treeNotes && treeNotes.length > 0 ? (
					<>
						<ul className="space-y-4">
							{paginatedNotes.map((n) => (
								<li
									key={n.id}
									className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition"
								>
									<div className="flex justify-between items-start mb-2">
										<span className="text-xs text-gray-500">
											{new Date(n.created_at).toLocaleString('de-DE', {
												day: '2-digit',
												month: '2-digit',
												year: 'numeric',
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
										{/* RLS only allows deleting one's own notes, so the button
										    is only shown for them. */}
										{n.user_id === creatorId && (
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
										)}
									</div>
									<p className="text-gray-800 text-sm whitespace-pre-line break-words border-t border-gray-100 pt-2">
										{n.note}
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

			{/* New note, always bound to the active tree via treeId */}
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
						await addNoteToTree(treeId, data.note, creatorId);
						toast.success('Notiz wurde hinzugefügt!');
						reset();
						const updated = await getTreeNotes(treeId);
						setTreeNotes(updated);
					})}
					className="space-y-3"
				>
					<div>
						<textarea
							{...register('note')}
							className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-green-400 focus:outline-none transition aria-invalid:border-red-500"
							rows={3}
							placeholder="Kommentar eingeben..."
							aria-label="Neue Notiz"
							aria-invalid={Boolean(errors.note)}
							aria-describedby={errors.note ? 'note-error' : undefined}
						/>
						{errors.note && (
							<p
								id="note-error"
								className="mt-1 text-sm text-red-600"
								role="alert"
							>
								{errors.note.message}
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
		</div>
	);
}
