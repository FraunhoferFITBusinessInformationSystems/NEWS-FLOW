'use client';

import { AccessDenied } from '@/components/features/auth/access-denied';
import { AppHeader } from '@/components/layout/app-header';
import { Footer } from '@/components/layout/footer';
import { type NavigationItem, filterNavigationByRole } from '@/lib/utils';
import {
	ADMIN_ROLES,
	GARDENING_ROLES,
	PLANNING_ROLES,
	isRouteAllowedForRole,
} from '@/lib/utils/route-access';
import { UserRoleProvider, useUserRole } from '@/providers/UserRoleContext';
import { usePathname } from 'next/navigation';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Suspense } from 'react';
import { Toaster } from 'sonner';

// Placeholder for the content area while the role is being resolved and while
// the page below streams in.
function ContentSpinner() {
	return (
		<div className="flex items-center justify-center min-h-[200px]">
			<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
		</div>
	);
}

interface MainContentProps {
	isLoading: boolean;
	hasAccess: boolean;
	children: React.ReactNode;
}

// The page mounts only once the role is known, so a client page cannot fetch
// its data before the access check has run.
function MainContent({ isLoading, hasAccess, children }: MainContentProps) {
	if (isLoading) return <ContentSpinner />;
	if (!hasAccess) return <AccessDenied />;

	// The page gets a boundary of its own, so that a suspending page falls back
	// to a spinner in the content area rather than to the boundary around the
	// whole layout.
	return <Suspense fallback={<ContentSpinner />}>{children}</Suspense>;
}

// Header, page and footer, plus everything that decides what the header may
// show. Rendered inside <body>, so no fallback below this point can take the
// document with it.
function AppLayoutContent({ children }: { children: React.ReactNode }) {
	const { userRole, isAuthenticated, isLoading } = useUserRole();
	const pathname = usePathname();

	// Client-side counterpart of the role check in the middleware. Both read the
	// same rules, so a route that is denied server-side is also denied here.
	const hasAccess = isRouteAllowedForRole(pathname, userRole);

	const allNavigationItems: NavigationItem[] = [
		{
			href: '/overview',
			label: 'Live-Karte',
			roles: PLANNING_ROLES,
		},
		{
			href: '/dashboard',
			label: 'Details & Analysen',
			roles: PLANNING_ROLES,
		},
		{
			label: 'Administration',
			roles: ADMIN_ROLES,
			children: [
				{ href: '/admin', label: 'Nutzerverwaltung' },
				{ href: '/baumdatenpflege', label: 'Baumverwaltung' },
				{ href: '/wateringstrategies', label: 'Bewässerungsstrategien' },
				{ href: '/sensorverwaltung', label: 'Sensorverwaltung' },
				{ href: '/waterextractionpoints', label: 'Wasserentnahmestellen' },
				{ href: '/pointofinterests', label: 'Points of Interest' },
			],
		},
		{
			label: 'Bewässerungsplanung',
			roles: PLANNING_ROLES,
			children: [
				{ href: '/wateringrounds', label: 'GFA' },
				{ href: '/wateringrounds-palmengarten', label: 'PG' },
			],
		},
		{
			href: '/wateringrounds-monitoring',
			label: 'Bewässerungsüberwachung',
			roles: PLANNING_ROLES,
		},
		{
			href: '/wateringrounds-user-overview',
			label: 'Meine Bewässerungen',
			roles: GARDENING_ROLES,
		},
		{ href: '/hilfe', label: 'Hilfe', iconOnly: true, roles: ['all'] },
	];

	// An anonymous visitor may only open the page they are on, so an otherwise
	// role-less navigation would offer nothing but links back to the login page.
	const navigationItems = isAuthenticated
		? filterNavigationByRole(allNavigationItems, userRole)
		: [];

	// The auth pages carry their own login form; a second entry point in the
	// header would only compete with it.
	const showAuthButton = isAuthenticated || !pathname.startsWith('/auth');

	return (
		<>
			<AppHeader
				navigationItems={navigationItems}
				isAuthenticated={isAuthenticated}
				showAuthButton={showAuthButton}
				isLoading={isLoading}
			/>

			{/* Main content with responsive padding */}
			<main className="pt-16 px-4 sm:px-6 lg:px-8 pb-6">
				<div className="max-w-7xl mx-auto">
					<MainContent isLoading={isLoading} hasAccess={hasAccess}>
						{children}
					</MainContent>
				</div>
			</main>

			<Footer />
		</>
	);
}

// Everything the application needs around a page: the query-state adapter, the
// role provider and the toaster.
//
// The Suspense boundary belongs to UserRoleProvider, which reads the search
// params and therefore suspends until the client takes over. It sits inside
// <body> on purpose: the document is rendered by the root layout above, so a
// fallback can only ever replace the content area, never the document itself.
export function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<NuqsAdapter>
			<Suspense fallback={<ContentSpinner />}>
				<UserRoleProvider>
					<AppLayoutContent>{children}</AppLayoutContent>
				</UserRoleProvider>
			</Suspense>

			<Toaster richColors position="top-right" />
		</NuqsAdapter>
	);
}
