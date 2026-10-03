'use client';

import Link from 'next/link';

import { pwdSignIn, signup, ssoSignIn } from './action';

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
import { useState } from 'react';

export function LoginForm() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);
		const result = await pwdSignIn(username, password);
		// On success the server action redirects, so we only reset on error.
		if (result?.error) {
			setError(result.error);
			setIsSubmitting(false);
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
				<form className="grid gap-4" onSubmit={handleSubmit}>
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							required
							id="email"
							placeholder="max.mustermann@beispiel.de"
							type="email"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
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
						<Input
							required
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						{error && <p className="mt-1 text-xs text-red-500">{error}</p>}
					</div>
					<Button className="w-full" type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Anmeldung läuft…' : 'Anmelden'}
					</Button>
					{/* <form action={signup}>
            <input type="hidden" name="email" value={username} />
            <input type="hidden" name="password" value={password} />
            <Button className="w-full" variant="outline" type="submit">
              Registrieren
            </Button>
          </form> */}
					<div className="mt-6 text-center text-sm text-muted-foreground">
						Noch kein Zugang? Bitte wenden Sie sich an Ihren Administrator.
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
