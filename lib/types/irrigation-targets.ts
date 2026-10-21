/**
 * Target soil water tension per depth in kPa; null when the tree has no target.
 */
export interface TreeWithTargetValues {
	target_30cm: number | null;
	target_60cm: number | null;
	target_90cm: number | null;
}
