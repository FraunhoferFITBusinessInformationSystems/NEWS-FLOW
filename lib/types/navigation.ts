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
