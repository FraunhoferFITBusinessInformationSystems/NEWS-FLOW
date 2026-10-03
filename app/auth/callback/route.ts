import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
	// The `/auth/callback` route is required for the server-side auth flow implemented
	// by the SSR package. It exchanges an auth code for the user's session.
	// https://supabase.com/docs/guides/auth/server-side/nextjs
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get('code');
	const origin = process.env.NEXT_PUBLIC_SITE_URL;

	if (code) {
		const supabase = await createClient();

		await supabase.auth.exchangeCodeForSession(code);
	}

	// URL to redirect to after sign up process completes
	return NextResponse.redirect(`${origin}/`);
}
