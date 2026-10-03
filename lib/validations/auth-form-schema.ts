import { z } from 'zod';

/**
 * Schema for the "Passwort vergessen" form where the user requests a
 * password reset e-mail.
 */
export const forgotPasswordFormSchema = z.object({
	email: z
		.string()
		.min(1, 'Bitte geben Sie Ihre E-Mail-Adresse ein.')
		.email('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
		.trim(),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

/**
 * Schema for the "Neues Passwort" form where the user sets a new password
 * after following the recovery link.
 */
export const resetPasswordFormSchema = z
	.object({
		password: z
			.string()
			.min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.'),
		confirmPassword: z.string().min(1, 'Bitte bestätigen Sie das Passwort.'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Die Passwörter stimmen nicht überein.',
		path: ['confirmPassword'],
	});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
