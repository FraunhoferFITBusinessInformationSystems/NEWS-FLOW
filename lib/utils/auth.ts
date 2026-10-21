/**
 * One entry of the header navigation. An entry with `children` is a submenu
 * and needs no `href`. `roles` lists the role names that see the entry; the
 * value `'all'` shows it to every role.
 */
export interface NavigationItem {
	href?: string;
	label: string;
	roles: readonly string[];
	iconOnly?: boolean;
	children?: { href: string; label: string }[];
}

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
