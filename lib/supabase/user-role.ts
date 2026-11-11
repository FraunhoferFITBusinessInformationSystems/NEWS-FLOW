import type { SupabaseClient } from '@supabase/supabase-js';

interface UserRoleRow {
	roles: { role_name: string } | { role_name: string }[] | null;
}

/**
 * Reads the role name of a user. Shared by the middleware and by
 * fetchUserRoleAction so both resolve the role with the same query.
 *
 * The left join plus maybeSingle keeps three cases apart: a user without an
 * assigned role and a user without a row both resolve to null, while only a
 * real database or policy failure throws. An inner join with single() would
 * report "no role assigned" as an error, because both produce zero rows.
 *
 * Deliberately without a success log: this runs on every request, including
 * client-side navigations, and would flood the log.
 *
 * @throws Error if the query fails.
 */
export async function getUserRoleByUserId(
	supabase: SupabaseClient,
	userId: string,
): Promise<string | null> {
	const { data, error } = await supabase
		.from('users')
		.select(`
      role_id,
      roles (
        role_name
      )
    `)
		.eq('id', userId)
		.maybeSingle();

	if (error) {
		console.error(`Fehler in getUserRoleByUserId: ${error.message}`);
		throw new Error(error.message);
	}

	const row = data as UserRoleRow | null;
	if (!row?.roles) return null;

	// Supabase returns the joined row either as an object or as an array.
	const role = Array.isArray(row.roles) ? row.roles[0] : row.roles;
	return role?.role_name ?? null;
}
