import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { MaintenanceNotice } from '@/components/layout/maintenance-notice';
import type { Metadata, Viewport } from 'next';

// A server component on purpose. Only a server component may export metadata,
// and <html> and <body> have to be rendered here, once and unconditionally: any
// Suspense fallback below this file can then replace the content area, never
// the document.
const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

/** Page title; shows the maintenance state while maintenance mode is on. */
export const metadata: Metadata = {
	title: isMaintenanceMode ? 'Wartung - News Flow' : 'News Flow',
};

/** Viewport for mobile devices; zooming stays possible up to 5x. */
export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 5,
};

/**
 * Root layout: renders the document and wraps every page in AppLayout, or
 * shows MaintenanceNotice instead while NEXT_PUBLIC_MAINTENANCE_MODE is true.
 */
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="de">
			<body className="min-h-screen bg-background text-foreground">
				{isMaintenanceMode ? (
					<MaintenanceNotice />
				) : (
					<AppLayout>{children}</AppLayout>
				)}
			</body>
		</html>
	);
}
