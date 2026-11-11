/**
 * Page /error. The middleware sends a request here when the role lookup fails,
 * which points to a database or policy problem rather than a missing
 * permission.
 */
export default function ErrorPage() {
	return <p>Etwas ist schiefgegangen</p>;
}
