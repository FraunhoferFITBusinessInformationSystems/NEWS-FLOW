export default function DatenschutzPage() {
	return (
		<main className="max-w-2xl mx-auto p-8">
			<h1 className="text-2xl font-bold mb-4">Datenschutz</h1>
			<section className="mt-6 text-sm text-gray-700 space-y-4">
				<div>
					<h2 className="font-semibold text-base mb-1">Allgemeine Hinweise</h2>
					<p>
						Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen.
						Wir behandeln Ihre personenbezogenen Daten vertraulich und
						entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser
						Datenschutzerklärung.
					</p>
				</div>
				<div>
					<h2 className="font-semibold text-base mb-1">
						Erhebung und Verarbeitung personenbezogener Daten
					</h2>
					<p>
						Die Nutzung dieser Anwendung ist grundsätzlich ohne Angabe
						personenbezogener Daten möglich. Soweit personenbezogene Daten (z.B.
						Name, E-Mail-Adresse, Organisation) erhoben werden, erfolgt dies
						stets auf freiwilliger Basis und nur im Rahmen der Nutzung durch
						berechtigte Mitarbeiterinnen und Mitarbeiter.
					</p>
				</div>
				<div>
					<h2 className="font-semibold text-base mb-1">
						Zweck der Datenverarbeitung
					</h2>
					<p>
						Die erhobenen Daten werden ausschließlich zur Bereitstellung und
						Verbesserung der Anwendung sowie zur Verwaltung der Nutzerkonten
						verwendet. Eine Weitergabe an Dritte erfolgt nicht ohne Ihre
						ausdrückliche Zustimmung.
					</p>
				</div>
				<div>
					<h2 className="font-semibold text-base mb-1">
						Speicherung und Löschung
					</h2>
					<p>
						Ihre personenbezogenen Daten werden nur so lange gespeichert, wie
						dies für die Nutzung der Anwendung erforderlich ist oder gesetzliche
						Aufbewahrungsfristen bestehen. Nach Wegfall des Verwendungszwecks
						oder Ablauf der Fristen werden die Daten gelöscht.
					</p>
				</div>
				<div>
					<h2 className="font-semibold text-base mb-1">Ihre Rechte</h2>
					<p>
						Sie haben das Recht auf Auskunft, Berichtigung, Löschung und
						Einschränkung der Verarbeitung Ihrer personenbezogenen Daten sowie
						das Recht auf Datenübertragbarkeit. Bei Fragen wenden Sie sich bitte
						an den Verantwortlichen Redakteur im Impressum.
					</p>
				</div>
				<div>
					<h2 className="font-semibold text-base mb-1">Kontakt</h2>
					<p>
						Für Fragen zum Datenschutz wenden Sie sich bitte an die im Impressum
						genannte Kontaktadresse.
					</p>
					<p className="mt-2 font-semibold">
						Verantwortlicher im Sinne von Art. 4 Nr. 7 DSGVO:
					</p>
					{/* Placeholder: replace with the data controller of the deployment. */}
					<address className="not-italic mt-1 space-y-1 text-sm">
						<div>[Name der Organisation]</div>
						<div>[Straße und Hausnummer]</div>
						<div>[PLZ Ort]</div>
					</address>
				</div>
			</section>
		</main>
	);
}
