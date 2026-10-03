import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Helper to determine if a tree belongs to Palmengarten based on bezirk
export function isPalmengartenTree(bezirk?: string | null): boolean {
	return bezirk === 'Palmengarten';
}

// Re-export auth utilities
export type { NavigationItem, UserRole } from './auth';
export { filterNavigationByRole } from './auth';

// Re-export types and functions from the server actions for backwards compatibility
export type {
	StrategieValues,
	TreeWithTargetValues,
} from '@/lib/actions/tree-target-values';
export {
	getTreeTargetValues,
	getMultipleTreeTargetValues,
} from '@/lib/actions/tree-target-values';
