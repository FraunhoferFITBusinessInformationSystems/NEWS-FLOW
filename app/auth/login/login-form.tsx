'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { pwdSignIn } from './action';

import { PasswordInput } from '@/components/features/auth/password-input';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	type LoginFormValues,
	loginFormSchema,
} from '@/lib/validations/auth-form-schema';

/**
 * Email and password form; submits to the pwdSignIn server action and shows
 * its error message.
 */
export function LoginForm() {
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: { email: '', password: '' },
	});

	async function onSubmit(values: LoginFormValues) {
		const result = await pwdSignIn(values.email, values.password);
		// On success the server action redirects, so only a failed sign-in
		// returns here. The message is shown below the password field.
		if (result?.error) {
			setError('root.serverError', { message: result.error });
		}
	}

	return (
		<Card className="mx-auto mt-6 max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Anmeldung</CardTitle>
				<CardDescription>
					Zum Anmelden bitte die Anmeldedaten eingeben.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{/* noValidate: validation messages come from the Zod schema, not from
				    the browser's own pop-ups. */}
				<form
					className="grid gap-4"
					onSubmit={handleSubmit(onSubmit)}
					noValidate
				>
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="max.mustermann@beispiel.de"
							autoComplete="email"
							{...register('email')}
						/>
						{errors.email && (
							<p className="mt-1 text-xs text-red-500">
								{errors.email.message}
							</p>
						)}
					</div>
					<div className="grid gap-2">
						<div className="flex items-center">
							<Label htmlFor="password">Passwort</Label>
							<Link
								href="/auth/forgot-password"
								className="ml-auto text-sm underline"
							>
								Passwort vergessen?
							</Link>
						</div>
						<PasswordInput
							id="password"
							autoComplete="current-password"
							{...register('password')}
						/>
						{errors.password && (
							<p className="mt-1 text-xs text-red-500">
								{errors.password.message}
							</p>
						)}
						{errors.root?.serverError && (
							<p className="mt-1 text-xs text-red-500">
								{errors.root.serverError.message}
							</p>
						)}
					</div>
					<Button className="w-full" type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Anmeldung läuft…' : 'Anmelden'}
					</Button>
					<div className="mt-6 text-center text-sm text-muted-foreground">
						Noch kein Zugang? Bitte wenden Sie sich an Ihren Administrator.
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
