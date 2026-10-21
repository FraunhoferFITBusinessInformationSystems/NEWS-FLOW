import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './supabase';

/**
 * Supabase client for client components. Uses the session from the browser's
 * cookies, so row level security applies to every query.
 */
export function createClient() {
	return createBrowserClient<Database>(
		// biome-ignore lint/style/noNonNullAssertion: Required variable, documented in .env.example and the README
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		// biome-ignore lint/style/noNonNullAssertion: Required variable, documented in .env.example and the README
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);
}
