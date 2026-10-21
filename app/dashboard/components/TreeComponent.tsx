'use client';

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
	periodEndsToday: boolean;
}

/**
 * Wrapper for the single-tree view: renders TreeSpecificContent, or nothing
 * while the tree overview is not loaded yet.
 */
export default function TreeComponent({
	treeId,
	currentValues,
	targetValues,
	lastData,
	treeOverview,
	periodEndsToday,
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
				periodEndsToday={periodEndsToday}
			/>
		</div>
	);
}
