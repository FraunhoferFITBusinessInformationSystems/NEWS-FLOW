import { Suspense } from 'react';
import DashboardClient from './client';

function DashboardLoadingFallback() {
	return (
		<div className="w-full px-4 py-8">
			<div
				className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-10"
				aria-hidden
			/>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="h-32 bg-white rounded-xl border shadow animate-pulse"
						aria-hidden
					/>
				))}
			</div>
			<div
				className="mt-6 h-[500px] bg-white rounded-xl border shadow animate-pulse"
				aria-hidden
			/>
		</div>
	);
}

/**
 * Page /dashboard. The content is the client component DashboardClient, which
 * reads the URL parameters and therefore needs a Suspense boundary.
 */
export default function DashboardPage() {
	return (
		<Suspense fallback={<DashboardLoadingFallback />}>
			<DashboardClient />
		</Suspense>
	);
}
