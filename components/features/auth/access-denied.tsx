// Shown by the layout when the current role may not open the current route.
// The middleware already redirects such requests server-side, so this is the
// fallback for the case where the role could not be resolved there.
export function AccessDenied() {
	return (
		<div className="flex items-center justify-center min-h-[200px]">
			<div className="text-center">
				<h2 className="text-xl font-semibold text-gray-900 mb-2">
					Zugriff verweigert
				</h2>
				<p className="text-gray-600">
					Sie haben keine Berechtigung für diese Seite.
				</p>
			</div>
		</div>
	);
}
