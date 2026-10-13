'use client';

/**
 * TreeComponent: wrapper for the single-tree view.
 * Shows TreeSpecificContent (state, tree data, notes, new note).
 */
import type {
	IstZustandData,
	SollZustandData,
	TreeOverview,
} from '@/lib/types/dashboard';
import TreeSpecificContent from './TreeSpecificContent';

interface TreeComponentProps {
	treeId: string;
	istZustandData?: IstZustandData;
	sollZustandData?: SollZustandData;
	lastData?: Date | undefined;
	treeOverview?: TreeOverview | null;
}

export default function TreeComponent({
	treeId,
	istZustandData,
	sollZustandData,
	lastData,
	treeOverview,
}: TreeComponentProps) {
	if (!treeOverview) return null;

	return (
		<div className="space-y-6">
			<TreeSpecificContent
				treeId={treeId}
				treeOverview={treeOverview}
				istZustandData={istZustandData}
				sollZustandData={sollZustandData}
				lastData={lastData}
			/>
		</div>
	);
}
