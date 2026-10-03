'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

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
import { createClient } from '@/lib/supabase/client';
import {
	type ForgotPasswordFormValues,
	forgotPasswordFormSchema,
} from '@/lib/validations/auth-form-schema';

export function ForgotPasswordForm() {
	const [submitted, setSubmitted] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordFormSchema),
		defaultValues: { email: '' },
	});

	async function onSubmit(values: ForgotPasswordFormValues) {
		const supabase = createClient();

		// The custom recovery template builds its own link to /auth/reset-password
		// with a token_hash. redirectTo is only relevant if GoTrue falls back to
		// its default template, which uses ConfirmationURL.
		await supabase.auth.resetPasswordForEmail(values.email, {
			redirectTo: `${window.location.origin}/auth/reset-password`,
		});

		// Always show the same confirmation to avoid leaking whether an
		// account exists for the given e-mail address.
		setSubmitted(true);
	}

	if (submitted) {
		return (
			<Card className="mx-auto mt-6 max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">E-Mail versendet</CardTitle>
					<CardDescription>
						Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir Ihnen
						einen Link zum Zurücksetzen des Passworts geschickt. Bitte prüfen
						Sie Ihr Postfach.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild className="w-full" variant="outline">
						<Link href="/auth/login">Zurück zur Anmeldung</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="mx-auto mt-6 max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Passwort vergessen</CardTitle>
				<CardDescription>
					Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum
					Zurücksetzen Ihres Passworts.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
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
					<Button className="w-full" type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Wird gesendet…' : 'Link anfordern'}
					</Button>
					<div className="mt-2 text-center text-sm text-muted-foreground">
						<Link href="/auth/login" className="underline">
							Zurück zur Anmeldung
						</Link>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
