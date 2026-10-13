export function exportToCSV<T extends object>(data: T[], filename: string) {
	if (!data || data.length === 0) {
		console.warn('Keine Daten zum exportieren');
		return;
	}

	// Use the keys of the first row as the CSV header.
	const headers = Object.keys(data[0]);

	// Build one CSV line per row.
	const csvRows = [
		headers.join(','),
		...data.map((row) =>
			headers
				.map((key) => {
					let value: unknown = row[key as keyof T];

					if (value instanceof Date) {
						value = value.toISOString();
					}

					if (typeof value === 'string') {
						const escaped = value.replace(/"/g, '""'); // escape double quotes
						value = escaped.match(/([",\n])/) ? `"${escaped}"` : escaped;
					}

					return value ?? '';
				})
				.join(','),
		),
	];

	const csvContent = csvRows.join('\n');

	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = `${filename}.csv`;
	link.click();

	URL.revokeObjectURL(url);
}
