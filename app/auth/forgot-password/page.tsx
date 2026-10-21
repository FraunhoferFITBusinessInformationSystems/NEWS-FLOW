import { ForgotPasswordForm } from './forgot-password-form';

/** Page /auth/forgot-password; reachable without a session. */
export default async function Page() {
	return <ForgotPasswordForm />;
}
