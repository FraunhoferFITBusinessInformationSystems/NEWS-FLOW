import Link from 'next/link';

export function Footer() {
	return (
		<footer className="w-full border-t mt-8 py-6 sm:py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
					<span className="text-center">
						&copy; {new Date().getFullYear()} Fraunhofer FIT
					</span>
					<div className="flex gap-4 items-center">
						<Link
							href="/impressum"
							className="underline hover:text-foreground transition-colors min-h-[44px] flex items-center justify-center touch-manipulation"
						>
							Impressum
						</Link>
						<span>|</span>
						<Link
							href="/datenschutz"
							className="underline hover:text-foreground transition-colors min-h-[44px] flex items-center justify-center touch-manipulation"
						>
							Datenschutz
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
