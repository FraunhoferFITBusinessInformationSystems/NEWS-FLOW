'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
	type ResetPasswordFormValues,
	resetPasswordFormSchema,
} from '@/lib/validations/auth-form-schema';

// 'confirm' shows an explicit button so e-mail link scanners (which only issue
// GET requests) cannot consume the one-time token before the user clicks.
type RecoveryPhase = 'checking' | 'confirm' | 'ready' | 'invalid';

export function ResetPasswordForm() {
	const router = useRouter();
	const [phase, setPhase] = useState<RecoveryPhase>('checking');
	const [tokenHash, setTokenHash] = useState<string | null>(null);
	const [verifying, setVerifying] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordFormSchema),
		defaultValues: { password: '', confirmPassword: '' },
	});

	useEffect(() => {
		const supabase = createClient();
		const url = new URL(window.location.href);
		const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));

		// GoTrue reports rejected/expired links via error params in the URL.
		const errorCode =
			url.searchParams.get('error_code') ?? hashParams.get('error_code');
		if (errorCode) {
			setPhase('invalid');
			return;
		}

		// Scanner-resistant flow: the e-mail links to this page with a token_hash
		// that is only redeemed after an explicit user action.
		const hash = url.searchParams.get('token_hash');
		const type = url.searchParams.get('type');
		if (hash && type) {
			setTokenHash(hash);
			setPhase('confirm');
			return;
		}

		// Fallback for the implicit flow, where the session is delivered directly
		// in the URL and processed by the browser client.
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'PASSWORD_RECOVERY' || session) {
				setPhase('ready');
			}
		});

		supabase.auth.getSession().then(({ data }) => {
			if (data.session) {
				setPhase('ready');
			}
		});

		const timeout = setTimeout(() => {
			setPhase((current) => (current === 'checking' ? 'invalid' : current));
		}, 3000);

		return () => {
			subscription.unsubscribe();
			clearTimeout(timeout);
		};
	}, []);

	async function handleVerify() {
		if (!tokenHash) return;

		setVerifying(true);
		const supabase = createClient();
		const { error } = await supabase.auth.verifyOtp({
			token_hash: tokenHash,
			type: 'recovery',
		});
		setVerifying(false);

		if (error) {
			toast.error(`Fehler: ${error.message}`);
			setPhase('invalid');
			return;
		}

		setPhase('ready');
	}

	async function onSubmit(values: ResetPasswordFormValues) {
		const supabase = createClient();

		const { error } = await supabase.auth.updateUser({
			password: values.password,
		});

		if (error) {
			toast.error(`Fehler: ${error.message}`);
			return;
		}

		// Sign out so the user logs in fresh with the new password.
		await supabase.auth.signOut();
		toast.success(
			'Passwort erfolgreich geändert. Bitte melden Sie sich neu an.',
		);
		router.push('/auth/login');
	}

	if (phase === 'checking') {
		return (
			<Card className="mx-auto mt-6 max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Passwort zurücksetzen</CardTitle>
					<CardDescription>Link wird geprüft…</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (phase === 'invalid') {
		return (
			<Card className="mx-auto mt-6 max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Link ungültig</CardTitle>
					<CardDescription>
						Der Link zum Zurücksetzen ist ungültig oder abgelaufen. Bitte
						fordern Sie einen neuen Link an.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild className="w-full" variant="outline">
						<Link href="/auth/forgot-password">Neuen Link anfordern</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (phase === 'confirm') {
		return (
			<Card className="mx-auto mt-6 max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Passwort zurücksetzen</CardTitle>
					<CardDescription>
						Klicken Sie auf den Button, um mit dem Zurücksetzen Ihres Passworts
						fortzufahren.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						className="w-full"
						type="button"
						onClick={handleVerify}
						disabled={verifying}
					>
						{verifying ? 'Wird geprüft…' : 'Passwort zurücksetzen'}
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="mx-auto mt-6 max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Neues Passwort</CardTitle>
				<CardDescription>
					Bitte vergeben Sie ein neues Passwort für Ihr Konto.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
					<div className="grid gap-2">
						<Label htmlFor="password">Neues Passwort</Label>
						<Input
							id="password"
							type="password"
							autoComplete="new-password"
							{...register('password')}
						/>
						{errors.password && (
							<p className="mt-1 text-xs text-red-500">
								{errors.password.message}
							</p>
						)}
					</div>
					<div className="grid gap-2">
						<Label htmlFor="confirmPassword">Passwort bestätigen</Label>
						<Input
							id="confirmPassword"
							type="password"
							autoComplete="new-password"
							{...register('confirmPassword')}
						/>
						{errors.confirmPassword && (
							<p className="mt-1 text-xs text-red-500">
								{errors.confirmPassword.message}
							</p>
						)}
					</div>
					<Button className="w-full" type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Wird gespeichert…' : 'Passwort speichern'}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
