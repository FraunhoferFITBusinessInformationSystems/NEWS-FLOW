/**
 * Formats a date as DD.MM.YYYY in local time. Returns "–" for an empty value.
 */
export default function formatDate(dateValue: string | Date | null): string {
	if (!dateValue) return '–';
	const d = new Date(dateValue);
	const day = String(d.getDate()).padStart(2, '0');
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const year = d.getFullYear();
	return `${day}.${month}.${year}`;
}
