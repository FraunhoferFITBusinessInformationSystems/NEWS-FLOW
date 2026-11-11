import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase client for server components and server actions. Reads and writes
 * the session cookies of the current request, so row level security applies
 * to every query with the signed-in user's rights.
 */
export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient(
		// biome-ignore lint/style/noNonNullAssertion: Required variable, documented in .env.example and the README
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		// biome-ignore lint/style/noNonNullAssertion: Required variable, documented in .env.example and the README
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						for (const { name, value, options } of cookiesToSet) {
							cookieStore.set(name, value, options);
						}
					} catch {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
					}
				},
			},
		},
	);
}

/**
 * Returns the signed-in user, validated against Supabase Auth. Returns the
 * error instead of throwing, so callers can treat "no user" as a normal case.
 */
export async function getCurrentUser() {
	const supabase = await createClient();

	const { data, error } = await supabase.auth.getUser();

	if (error) {
		console.error('Error fetching user:', error.message);
		return { data: null, error };
	}

	return { data, error: null };
}

/**
 * Returns the session from the request cookies without validating it against
 * Supabase Auth. Use getCurrentUser for anything that decides about access.
 */
export async function getCurrentSession() {
	const supabase = await createClient();

	const { data, error } = await supabase.auth.getSession();

	if (error) {
		console.error('Error fetching session:', error.message);
		return { data: null, error };
	}

	return { data, error: null };
}
