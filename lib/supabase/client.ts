import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './supabase';

export const createClient = () =>
	createBrowserClient<Database>(
		// biome-ignore lint/style/noNonNullAssertion: Required variable, documented in .env.example and docs/setup.md
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		// biome-ignore lint/style/noNonNullAssertion: Required variable, documented in .env.example and docs/setup.md
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);
