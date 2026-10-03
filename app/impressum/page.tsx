// Placeholder legal notice. Every operator of a public deployment has to
// replace the bracketed values with their own details before going live.
export default function ImpressumPage() {
	return (
		<main className="max-w-2xl mx-auto p-8">
			<h1 className="text-2xl font-bold mb-4">Impressum</h1>

			<section className="mt-6 text-sm text-gray-700 space-y-4">
				<p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
					Dies ist ein Platzhalter. Die Angaben in eckigen Klammern müssen vom
					Betreiber dieser Instanz ersetzt werden.
				</p>

				<div>
					<h3 className="font-semibold text-base mb-1">Anbieter</h3>
					<p>
						[Name der Organisation]
						<br />
						[Straße und Hausnummer]
						<br />
						[PLZ Ort]
						<br />
						E-Mail: [E-Mail-Adresse]
					</p>
				</div>

				<div>
					<h3 className="font-semibold text-base mb-1">Vertreten durch</h3>
					<p>[Name der vertretungsberechtigten Person]</p>
				</div>

				<div>
					<h3 className="font-semibold text-base mb-1">
						Verantwortlich für den Inhalt
					</h3>
					<p>[Name, Anschrift]</p>
				</div>

				<div>
					<h3 className="font-semibold text-base mb-1">Haftungshinweis</h3>
					<p>
						Wir übernehmen keine Haftung für die Inhalte externer Links. Für den
						Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber
						verantwortlich.
					</p>
				</div>
			</section>
		</main>
	);
}
