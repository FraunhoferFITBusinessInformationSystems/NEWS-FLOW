'use client';

/**
 * TreeComponent: wrapper for the single-tree view.
 * Shows TreeSpecificContent (state, tree data, notes, new note).
 */
import type {
	CurrentValues,
	TargetValues,
	TreeOverview,
} from '@/lib/types/dashboard';
import TreeSpecificContent from './TreeSpecificContent';

interface TreeComponentProps {
	treeId: string;
	currentValues?: CurrentValues;
	targetValues?: TargetValues;
	lastData?: Date | undefined;
	treeOverview?: TreeOverview | null;
}

export default function TreeComponent({
	treeId,
	currentValues,
	targetValues,
	lastData,
	treeOverview,
}: TreeComponentProps) {
	if (!treeOverview) return null;

	return (
		<div className="space-y-6">
			<TreeSpecificContent
				treeId={treeId}
				treeOverview={treeOverview}
				currentValues={currentValues}
				targetValues={targetValues}
				lastData={lastData}
			/>
		</div>
	);
}
