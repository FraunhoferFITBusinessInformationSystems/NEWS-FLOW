'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserRoleByUserId } from '@/lib/supabase/user-role';
import { ANONYMOUS_AUTH_STATE, type AuthState } from '@/lib/types/auth';
import type { SupabaseClient } from '@supabase/supabase-js';

// A failed role lookup must not read as "no session": the header would offer a
// login to someone who is already signed in. The middleware sends such a
// request to /error before the page renders, so this only covers the pages that
// render without the role check.
async function fetchRoleOrNull(
	supabase: SupabaseClient,
	userId: string,
): Promise<string | null> {
	try {
		return await getUserRoleByUserId(supabase, userId);
	} catch (error) {
		console.error(
			`Fehler in getAuthStateAction: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		return null;
	}
}

// Session and role in one round trip, because resolving the role needs the user
// anyway. Read by UserRoleProvider, which drives both the navigation and the
// login/logout button in the header.
export async function getAuthStateAction(): Promise<AuthState> {
	const supabase = await createClient();

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) return ANONYMOUS_AUTH_STATE;

	return {
		isAuthenticated: true,
		role: await fetchRoleOrNull(supabase, user.id),
	};
}

// Role only, for callers that have no use for the session flag. Never throws:
// pwdSignIn calls it to pick the landing page, where an exception would surface
// as a failed login even though the sign-in itself succeeded.
export async function getUserRoleAction(): Promise<string | null> {
	try {
		const { role } = await getAuthStateAction();
		return role;
	} catch (error) {
		console.error(
			`Fehler in getUserRoleAction: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		return null;
	}
}
