// Single source of truth for the application roles and the routes they may
// open. Used by the middleware (server-side enforcement before a page renders),
// by the route gate in components/layout/app-layout.tsx and by the navigation
// filter, so all three stay in sync.

export const USER_ROLES = {
	superAdministrator: 'Super-Administrator',
	administrator: 'Administrator',
	officeClerk: 'Sachbearbeiter:in',
	gardener: 'Gärtner:in',
} as const;

export type UserRoleName = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Administration of master data: users, trees, sensors, strategies, POIs.
export const ADMIN_ROLES: readonly UserRoleName[] = [
	USER_ROLES.administrator,
	USER_ROLES.superAdministrator,
];

// Planning and monitoring of watering rounds.
export const PLANNING_ROLES: readonly UserRoleName[] = [
	USER_ROLES.officeClerk,
	USER_ROLES.administrator,
	USER_ROLES.superAdministrator,
];

// Execution of watering rounds in the field.
export const GARDENING_ROLES: readonly UserRoleName[] = [
	USER_ROLES.gardener,
	USER_ROLES.superAdministrator,
];

// Routes reachable without a session at all: the login and password-reset flow
// itself, plus the two legal pages that have to be served to anonymous visitors
// (Impressumspflicht).
const ANONYMOUS_ROUTE_PREFIXES: readonly string[] = [
	'/auth',
	'/impressum',
	'/datenschutz',
];

// Routes reachable with any role, including a user whose role cannot be
// resolved. Everything reachable without a session is reachable with one, so
// this list builds on the one above. The entries added here still require an
// authenticated session, which the middleware checks before the role.
const PUBLIC_ROUTE_PREFIXES: readonly string[] = [
	...ANONYMOUS_ROUTE_PREFIXES,
	'/hilfe',
	'/error',
	'/no-role',
];

interface RouteAccessRule {
	prefix: string;
	roles: readonly UserRoleName[];
}

// Every page route of the application. Routes that are not listed are denied,
// so a new page has to opt in explicitly instead of silently shipping without a
// restriction.
const ROUTE_ACCESS_RULES: readonly RouteAccessRule[] = [
	{ prefix: '/overview', roles: PLANNING_ROLES },
	{ prefix: '/dashboard', roles: PLANNING_ROLES },
	{ prefix: '/wateringrounds', roles: PLANNING_ROLES },
	{ prefix: '/wateringrounds-palmengarten', roles: PLANNING_ROLES },
	{ prefix: '/wateringrounds-monitoring', roles: PLANNING_ROLES },
	{ prefix: '/wateringrounds-user-overview', roles: GARDENING_ROLES },
	{ prefix: '/admin', roles: ADMIN_ROLES },
	{ prefix: '/baumdatenpflege', roles: ADMIN_ROLES },
	{ prefix: '/baumimport', roles: ADMIN_ROLES },
	{ prefix: '/wateringstrategies', roles: ADMIN_ROLES },
	{ prefix: '/sensorverwaltung', roles: ADMIN_ROLES },
	{ prefix: '/waterextractionpoints', roles: ADMIN_ROLES },
	{ prefix: '/pointofinterests', roles: ADMIN_ROLES },
	{ prefix: '/ors-test', roles: ADMIN_ROLES },
];

// Matches whole path segments, so "/wateringrounds" does not also match
// "/wateringrounds-monitoring", while "/wateringrounds/123" still matches.
function matchesPrefix(pathname: string, prefix: string): boolean {
	return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

// Whether a path may be opened without an authenticated session. Checked by the
// middleware before the session guard, so these routes never reach the role
// check either.
export function isAnonymousRoute(pathname: string): boolean {
	return ANONYMOUS_ROUTE_PREFIXES.some((prefix) =>
		matchesPrefix(pathname, prefix),
	);
}

export function isPublicRoute(pathname: string): boolean {
	return PUBLIC_ROUTE_PREFIXES.some((prefix) =>
		matchesPrefix(pathname, prefix),
	);
}

// Returns the most specific rule for a path, so nested routes inherit the
// restriction of their parent unless they define a stricter one.
function findRouteAccessRule(pathname: string): RouteAccessRule | undefined {
	let match: RouteAccessRule | undefined;

	for (const rule of ROUTE_ACCESS_RULES) {
		if (
			matchesPrefix(pathname, rule.prefix) &&
			(!match || rule.prefix.length > match.prefix.length)
		) {
			match = rule;
		}
	}

	return match;
}

export function isRouteAllowedForRole(
	pathname: string,
	role: string | null,
): boolean {
	if (isPublicRoute(pathname)) return true;
	if (!role) return false;

	const rule = findRouteAccessRule(pathname);
	if (!rule) return false;

	return (rule.roles as readonly string[]).includes(role);
}

// Landing page for a role: used after login and whenever a role opens a route
// it may not see. Always returns a route the role is allowed to open, so no
// redirect loop can occur.
export function getHomeRouteForRole(role: string | null): string {
	if (role === USER_ROLES.gardener) return '/wateringrounds-user-overview';

	if (
		role === USER_ROLES.officeClerk ||
		role === USER_ROLES.administrator ||
		role === USER_ROLES.superAdministrator
	) {
		return '/overview';
	}

	// Either no role at all, or a role that exists in the database but is not
	// mapped here. Both mean the account cannot use the application, so explain
	// that instead of bouncing the user back to the login form. The page is
	// public, and the layout still offers the logout button.
	return '/no-role';
}
