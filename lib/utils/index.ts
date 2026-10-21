import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Joins class names and resolves conflicting Tailwind classes, so the last one
 * wins (shadcn/ui helper).
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Re-export auth utilities
export type { NavigationItem } from './auth';
export { filterNavigationByRole } from './auth';
