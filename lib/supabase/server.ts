import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Organisation } from '../types/user';

export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient(
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
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

// Get current user - shared utility function
export const getCurrentUser = async () => {
	const supabase = await createClient();

	const { data, error } = await supabase.auth.getUser();

	if (error) {
		console.error('Error fetching user:', error.message);
		return { data: null, error };
	}

	return { data, error: null };
};

// Get current session - shared utility function
export const getCurrentSession = async () => {
	const supabase = await createClient();

	const { data, error } = await supabase.auth.getSession();

	if (error) {
		console.error('Error fetching session:', error.message);
		return { data: null, error };
	}

	return { data, error: null };
};

// Get current user's organization - shared utility function
export const getCurrentUserOrganisation = async (): Promise<Organisation> => {
	const supabase = await createClient();

	const { data: user, error: userError } = await supabase.auth.getUser();
	if (userError || !user.user) throw new Error('Nicht authentifiziert');

	const { data: profile, error: profileError } = await supabase
		.from('users')
		.select('organisation')
		.eq('id', user.user.id)
		.single();

	if (profileError || !profile)
		throw new Error('Benutzerprofil nicht gefunden');

	return profile.organisation as Organisation;
};
