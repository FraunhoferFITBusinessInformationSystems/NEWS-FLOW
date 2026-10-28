import Link from 'next/link';

const COPYRIGHT_START_YEAR = 2026;

const LICENSE_URL = 'https://www.gnu.org/licenses/agpl-3.0.html';

// AGPL-3.0 section 13 requires offering the source code to every user of the
// running application. Deployments of a modified version must point this to
// their own source code.
const SOURCE_CODE_URL =
	process.env.NEXT_PUBLIC_SOURCE_CODE_URL ||
	'https://github.com/FraunhoferFITBusinessInformationSystems/NEWS-FLOW';

const footerLinkClassName =
	'underline hover:text-foreground transition-colors min-h-[44px] flex items-center justify-center touch-manipulation';

/** Returns the start year, or a range up to the current year once it differs. */
function formatCopyrightYears(): string {
	const currentYear = new Date().getFullYear();
	return currentYear > COPYRIGHT_START_YEAR
		? `${COPYRIGHT_START_YEAR}–${currentYear}`
		: `${COPYRIGHT_START_YEAR}`;
}

/**
 * Page footer with the legal notices required by AGPL-3.0 (copyright, license
 * and warranty disclaimer) and the links to the source code, Impressum and
 * Datenschutz.
 */
export function Footer() {
	return (
		<footer className="w-full border-t mt-8 py-6 sm:py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
					<span className="text-center">
						&copy; {formatCopyrightYears()} Fraunhofer-Gesellschaft, Fraunhofer
						FIT
					</span>
					<span className="text-center">
						Lizenziert unter{' '}
						<a
							href={LICENSE_URL}
							className="underline hover:text-foreground transition-colors"
						>
							AGPL-3.0
						</a>{' '}
						· Ohne Gewährleistung
					</span>
					<div className="flex gap-4 items-center">
						<a href={SOURCE_CODE_URL} className={footerLinkClassName}>
							Quellcode
						</a>
						<span>|</span>
						<Link href="/impressum" className={footerLinkClassName}>
							Impressum
						</Link>
						<span>|</span>
						<Link href="/datenschutz" className={footerLinkClassName}>
							Datenschutz
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
