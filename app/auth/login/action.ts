/**
 * Sign-in and sign-out as server actions. They run on the server only and talk
 * to Supabase Auth; no table is read except the caller's role.
 *
 * @packageDocumentation
 */
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getUserRoleAction } from '@/lib/actions/auth';
import { createClient } from '@/lib/supabase/server';
import { getHomeRouteForRole } from '@/lib/utils/route-access';

/**
 * Signs in with email and password and redirects to the start page of the
 * caller's role. Returns `{ error }` with a German message when the sign-in
 * fails; the message does not reveal whether the email exists.
 */
export async function pwdSignIn(username: string, password: string) {
	const sb = await createClient();

	const { data: user, error } = await sb.auth.signInWithPassword({
		email: username,
		password: password,
	});

	if (error) {
		console.error(
			`Fehler in pwdSignIn: ${error.message}${
				error.status ? ` (Status ${error.status})` : ''
			}`,
		);

		// Too many attempts: the credentials may well be correct, so saying
		// "check your credentials" would be misleading.
		if (error.status === 429) {
			return {
				error:
					'Zu viele Anmeldeversuche. Bitte warten Sie einen Moment und versuchen Sie es erneut.',
			};
		}

		// Anything that is not a rejected login is a problem on our side, not with
		// the credentials. Status 400 is what Supabase returns for wrong email or
		// wrong password.
		if (error.status && error.status !== 400) {
			return {
				error:
					'Anmeldung derzeit nicht möglich. Bitte versuchen Sie es später erneut.',
			};
		}

		// Deliberately the same message for unknown email and wrong password, so
		// the form does not reveal which accounts exist.
		return { error: 'Anmeldung fehlgeschlagen - Anmeldedaten überprüfen' };
	}

	if (!user.user) {
		console.error('Fehler in pwdSignIn: kein Benutzer zurückgegeben');
		return { error: 'Anmeldung fehlgeschlagen - Anmeldedaten überprüfen' };
	}

	revalidatePath('/', 'layout');

	// Land on the page the role starts on, using the same mapping the
	// middleware applies, so both cannot drift apart.
	const role = await getUserRoleAction();

	// An unresolved role right after sign-in can also be a cookie timing
	// issue. Redirect to "/" in that case and let the middleware decide on
	// the next request, instead of sending the user to /no-role now.
	const target = role ? getHomeRouteForRole(role) : '/';

	// refresh=true makes UserRoleProvider refetch the role after the redirect.
	redirect(`${target}?refresh=true`);
}

/** Ends the session and redirects to the login page. */
export async function signOut() {
	const sb = await createClient();

	await sb.auth.signOut();
	redirect('/auth/login');
}
