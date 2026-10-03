import type { SupabaseClient } from '@supabase/supabase-js';

interface UserRoleRow {
	rollen: { name: string } | { name: string }[] | null;
}

// Reads the role name of a user. Shared by the middleware and by
// getUserRoleAction so both resolve the role with the same query.
//
// The left join plus maybeSingle keeps three cases apart: a user without an
// assigned role and a user without a row both resolve to null, while only a
// real database or policy failure throws. An inner join with single() would
// report "no role assigned" as an error, because both produce zero rows.
//
// Deliberately without a success log: this runs on every request, including
// client-side navigations, and would flood the log.
export async function getUserRoleByUserId(
	supabase: SupabaseClient,
	userId: string,
): Promise<string | null> {
	const { data, error } = await supabase
		.from('users')
		.select(`
      rollen_id,
      rollen (
        name
      )
    `)
		.eq('id', userId)
		.maybeSingle();

	if (error) {
		console.error(`Fehler in getUserRoleByUserId: ${error.message}`);
		throw new Error(error.message);
	}

	const row = data as UserRoleRow | null;
	if (!row?.rollen) return null;

	// Supabase returns the joined row either as an object or as an array.
	const rolle = Array.isArray(row.rollen) ? row.rollen[0] : row.rollen;
	return rolle?.name ?? null;
}
