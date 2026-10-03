import { Suspense } from 'react';
import DashboardClient from './client';

function DashboardLoadingFallback() {
	return (
		<main className="max-w-6xl w-full mr-auto ml-0 pl-4 pr-4 py-8 bg-gray-50 min-h-screen">
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
		</main>
	);
}

export default function DashboardPage() {
	return (
		<Suspense fallback={<DashboardLoadingFallback />}>
			<DashboardClient />
		</Suspense>
	);
}
