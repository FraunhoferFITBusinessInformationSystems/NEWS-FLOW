import { z } from 'zod';

/**
 * Schema for the "Neue Notiz" form (add note to tree) on the dashboard.
 */
export const treeNoteFormSchema = z.object({
	note: z
		.string()
		.min(1, 'Bitte geben Sie eine Notiz ein.')
		.max(2000, 'Die Notiz darf maximal 2000 Zeichen haben.')
		.trim(),
});

/** Values of the note form, inferred from treeNoteFormSchema. */
export type TreeNoteFormValues = z.infer<typeof treeNoteFormSchema>;
