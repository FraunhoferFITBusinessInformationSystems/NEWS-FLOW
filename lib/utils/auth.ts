export interface UserRole {
	id: string;
	name: string;
}

export interface NavigationItem {
	href?: string;
	label: string;
	roles: readonly string[];
	icon?: 'help' | 'user';
	iconOnly?: boolean;
	children?: { href: string; label: string }[];
}

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
