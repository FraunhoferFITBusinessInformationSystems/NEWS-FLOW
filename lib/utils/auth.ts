import type { NavigationItem } from '@/lib/types/navigation';

/**
 * Returns the navigation entries the role may see. Without a role, only the
 * entries marked `'all'` remain. Hiding an entry does not protect its route;
 * that is done by the middleware.
 */
export function filterNavigationByRole(
	navigationItems: NavigationItem[],
	userRole: string | null,
): NavigationItem[] {
	if (!userRole) {
		return navigationItems.filter((item) => item.roles.includes('all'));
	}

	return navigationItems.filter(
		(item) => item.roles.includes('all') || item.roles.includes(userRole),
	);
}
