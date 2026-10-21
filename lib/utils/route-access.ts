// Single source of truth for the application roles and the routes they may
// open. Used by the middleware (server-side enforcement before a page renders),
// by the route gate in components/layout/app-layout.tsx and by the navigation
// filter, so all three stay in sync.

/**
 * The application roles. The values must match `roles.role_name` in the
 * database exactly.
 */
export const USER_ROLES = {
	superAdministrator: 'Super-Administrator',
	administrator: 'Administrator',
	officeClerk: 'Sachbearbeiter:in',
	gardener: 'Gärtner:in',
} as const;

/** One of the role names in USER_ROLES. */
export type UserRoleName = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Roles that may open the overview and the dashboard. Mirrored by
 * is_app_planner() in supabase/migrations/00000000000002_rls.sql.
 */
export const PLANNING_ROLES: readonly UserRoleName[] = [
	USER_ROLES.officeClerk,
	USER_ROLES.administrator,
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
];

// Matches whole path segments, so "/overview" does not also match
// "/overview-archive", while "/overview/123" still matches.
function matchesPrefix(pathname: string, prefix: string): boolean {
	return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Whether a path may be opened without an authenticated session. Checked by the
 * middleware before the session guard, so these routes never reach the role
 * check either.
 */
export function isAnonymousRoute(pathname: string): boolean {
	return ANONYMOUS_ROUTE_PREFIXES.some((prefix) =>
		matchesPrefix(pathname, prefix),
	);
}

/**
 * Whether a path is open to every role, including a signed-in user without a
 * role. Apart from the anonymous routes, these still need a session.
 */
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

/**
 * Whether a role may open a path. Public routes are always allowed; any other
 * route needs a rule in ROUTE_ACCESS_RULES that lists the role, so unlisted
 * routes are denied. Used by the middleware and by the route gate in the
 * layout.
 */
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

/**
 * Landing page for a role: used after login and whenever a role opens a route
 * it may not see. Always returns a route the role is allowed to open, so no
 * redirect loop can occur.
 */
export function getHomeRouteForRole(role: string | null): string {
	if (
		role === USER_ROLES.officeClerk ||
		role === USER_ROLES.administrator ||
		role === USER_ROLES.superAdministrator
	) {
		return '/overview';
	}

	// Either no role at all, or a role without a route in this build. That
	// includes the gardener role: it is part of the role model, but its pages
	// (irrigation rounds in the field) are not part of this edition yet. Both
	// mean the account cannot use the application, so explain that instead of
	// bouncing the user back to the login form. The page is public, and the
	// layout still offers the logout button.
	return '/no-role';
}
