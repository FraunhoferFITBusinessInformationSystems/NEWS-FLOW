import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Re-export auth utilities
export type { NavigationItem } from './auth';
export { filterNavigationByRole } from './auth';
