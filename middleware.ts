import type { NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

/**
 * Next.js middleware: session refresh, session guard and role check for every
 * matched request. The logic lives in updateSession.
 */
export async function middleware(request: NextRequest) {
	return await updateSession(request);
}

/** Paths the middleware runs on: everything except static assets. */
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
		 * Feel free to modify this pattern to include more paths.
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
