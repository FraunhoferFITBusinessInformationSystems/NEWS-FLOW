import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import { getUserRoleByUserId } from '@/lib/supabase/user-role';
import {
	getHomeRouteForRole,
	isAnonymousRoute,
	isPublicRoute,
	isRouteAllowedForRole,
} from '@/lib/utils/route-access';

export async function updateSession(request: NextRequest) {
	// === ALLOW CRON JOB BYPASS ===
	if (
		(request.nextUrl.pathname.startsWith('/api/fetch-urbanpulse-data') ||
			request.nextUrl.pathname.startsWith('/api/fetch-weather-data') ||
			request.nextUrl.pathname.startsWith(
				'/api/discover-urbanpulse-sensors',
			)) &&
		request.headers.get('x-cron-secret') === process.env.CRON_JOB_SECRET
	) {
		return NextResponse.next();
	}

	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabase = createServerClient(
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					for (const { name, value, options } of cookiesToSet) {
						request.cookies.set(name, value);
					}
					supabaseResponse = NextResponse.next({
						request,
					});
					for (const { name, value, options } of cookiesToSet) {
						supabaseResponse.cookies.set(name, value, options);
					}
				},
			},
		},
	);

	// Do not run code between createServerClient and
	// supabase.auth.getUser(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.

	// IMPORTANT: DO NOT REMOVE auth.getUser()

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { pathname } = request.nextUrl;

	// Session guard. Only the routes that have to work without a login are
	// exempt: the auth flow itself and the legal pages. Everything else needs a
	// session before the role check below can run.
	if (!user && !isAnonymousRoute(pathname)) {
		const url = request.nextUrl.clone();
		url.pathname = '/auth/login';
		return NextResponse.redirect(url);
	}

	// Role check. Runs before the page renders, so a user without the required
	// role never reaches the page and its data is never fetched. API routes
	// authenticate themselves via the cron secret and are skipped here.
	if (user && !pathname.startsWith('/api') && !isPublicRoute(pathname)) {
		// Denied unless the check actively proves otherwise. A lookup that throws
		// leaves isAllowed false and the request is blocked, instead of continuing
		// as if the check had passed.
		let role: string | null = null;
		let isAllowed = false;
		let lookupFailed = false;

		try {
			role = await getUserRoleByUserId(supabase, user.id);
			// The start page has no content of its own and always forwards to the
			// page the role actually starts on.
			isAllowed = pathname !== '/' && isRouteAllowedForRole(pathname, role);
		} catch (error) {
			lookupFailed = true;
			console.error(
				`Fehler in updateSession: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}

		if (!isAllowed) {
			const url = request.nextUrl.clone();
			// A failed lookup is a database or policy problem, not a missing
			// permission. Sending the user to the start page of their role would
			// only fail the same way, so show the error page instead.
			url.pathname = lookupFailed ? '/error' : getHomeRouteForRole(role);
			url.search = '';
			return NextResponse.redirect(url);
		}
	}

	// IMPORTANT: You *must* return the supabaseResponse object as it is.
	// If you're creating a new response object with NextResponse.next() make sure to:
	// 1. Pass the request in it, like so:
	//    const myNewResponse = NextResponse.next({ request })
	// 2. Copy over the cookies, like so:
	//    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
	// 3. Change the myNewResponse object to fit your needs, but avoid changing
	//    the cookies!
	// 4. Finally:
	//    return myNewResponse
	// If this is not done, you may be causing the browser and server to go out
	// of sync and terminate the user's session prematurely!

	return supabaseResponse;
}
