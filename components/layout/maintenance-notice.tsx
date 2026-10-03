// Shown instead of the application while NEXT_PUBLIC_MAINTENANCE_MODE is set.
// Deliberately free of providers, navigation and theme classes: it has to work
// even when the rest of the application does not.
export function MaintenanceNotice() {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: '100vh',
				fontFamily: 'Arial, sans-serif',
				backgroundColor: '#f5f5f5',
				color: '#333',
			}}
		>
			<h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
				NEWS FLOW - In Bearbeitung
			</h1>
			<p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
				Die Anwendung wird weiterentwickelt und ist derzeit nicht verfügbar. Bei
				Fragen wenden Sie sich bitte an:
			</p>
			{/* Placeholder contact: replace with the operator's support address. */}
			<a
				href="mailto:support@example.org"
				style={{
					color: '#000000ff',
					textDecoration: 'none',
					fontSize: '1.2rem',
					fontWeight: 'bold',
				}}
			>
				support@example.org
			</a>
		</div>
	);
}
