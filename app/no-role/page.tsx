// Landing page for an authenticated user whose account has no usable role.
// Reached through getHomeRouteForRole() in lib/utils/route-access.ts. Public,
// so the middleware does not redirect it to itself.
export default function NoRolePage() {
	return (
		<main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
			<h1 className="text-xl sm:text-2xl font-bold">Keine Rolle zugeordnet</h1>
			<p className="text-sm sm:text-base leading-relaxed text-gray-700">
				Sie sind angemeldet, Ihrem Konto ist aber keine Rolle zugeordnet. Ohne
				Rolle können die Bereiche der Anwendung nicht geöffnet werden.
			</p>
			<p className="text-sm sm:text-base leading-relaxed text-gray-700">
				Bitte wenden Sie sich an eine Administratorin oder einen Administrator,
				damit Ihrem Konto eine Rolle zugewiesen wird. Melden Sie sich danach
				bitte erneut an, damit die Änderung wirksam wird.
			</p>
		</main>
	);
}
