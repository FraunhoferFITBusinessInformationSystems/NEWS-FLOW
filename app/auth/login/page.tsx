import { LoginForm } from './login-form';

/** Page /auth/login; reachable without a session. */
export default async function Page() {
	return <LoginForm />;
}
