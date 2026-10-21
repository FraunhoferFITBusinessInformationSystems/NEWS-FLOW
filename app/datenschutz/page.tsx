/**
 * Page /datenschutz; reachable without a session. Placeholder privacy policy:
 * every operator of a public deployment has to replace the bracketed values
 * with their own details and have the text checked before going live.
 */
export default function DatenschutzPage() {
	return (
		<div className="max-w-2xl mx-auto p-8">
			<h1 className="text-2xl font-bold mb-4">Datenschutz</h1>
			<section className="mt-6 text-sm text-gray-700 space-y-4">
				<p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
					Dies ist ein Platzhalter. Die Angaben in eckigen Klammern müssen vom
					Betreiber dieser Instanz ersetzt und der Text vor dem Betrieb geprüft
					werden.
				</p>
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
						Die Anwendung steht nur angemeldeten, berechtigten Mitarbeiterinnen
						und Mitarbeitern zur Verfügung. Dabei werden folgende Daten
						verarbeitet:
					</p>
					<ul className="list-disc pl-5 mt-1 space-y-1">
						<li>
							E-Mail-Adresse, Vor- und Nachname sowie die zugewiesene Rolle
						</li>
						<li>
							Anmeldedaten; das Passwort wird ausschließlich verschlüsselt
							(gehasht) gespeichert
						</li>
						<li>
							Notizen, die Sie zu Bäumen verfassen, zusammen mit Ihrem Konto und
							dem Zeitpunkt der Erstellung
						</li>
					</ul>
				</div>
				<div>
					<h2 className="font-semibold text-base mb-1">
						Zweck der Datenverarbeitung
					</h2>
					<p>
						Die erhobenen Daten werden ausschließlich zur Bereitstellung und
						Verbesserung der Anwendung sowie zur Verwaltung der Nutzerkonten
						verwendet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b und lit. f
						DSGVO.
					</p>
				</div>
				<div>
					<h2 className="font-semibold text-base mb-1">Cookies</h2>
					<p>
						Diese Anwendung verwendet ausschließlich technisch notwendige
						Cookies. Für die Anmeldung und die Aufrechterhaltung Ihrer Sitzung
						wird ein Sitzungscookie gesetzt, das erforderlich ist, um Sie
						während der Nutzung angemeldet zu halten. Die Speicherung ist nach §
						25 Abs. 2 Nr. 2 TDDDG ohne Einwilligung zulässig. Rechtsgrundlage
						für die damit verbundene Verarbeitung ist Art. 6 Abs. 1 lit. b und
						lit. f DSGVO. Cookies zu Analyse-, Tracking- oder Werbezwecken
						werden nicht eingesetzt.
					</p>
				</div>
				<div>
					<h2 className="font-semibold text-base mb-1">
						Kartendarstellung (OpenStreetMap)
					</h2>
					<p>
						Zur Darstellung von Karten nutzt diese Anwendung das Kartenmaterial
						von OpenStreetMap. Anbieter ist die OpenStreetMap Foundation (OSMF),
						St John&apos;s Innovation Centre, Cowley Road, Cambridge, CB4 0WS,
						Vereinigtes Königreich. Wenn Sie eine Seite mit einer Karte
						aufrufen, lädt Ihr Browser die benötigten Kartenkacheln direkt von
						den Servern der OSMF. Dabei wird Ihre IP-Adresse an die OSMF
						übermittelt; dies ist technisch erforderlich, damit die Kacheln an
						Ihren Browser ausgeliefert werden können. Rechtsgrundlage ist das
						berechtigte Interesse an einer funktionsfähigen Kartendarstellung
						(Art. 6 Abs. 1 lit. f DSGVO). Für das Vereinigte Königreich besteht
						ein Angemessenheitsbeschluss der Europäischen Kommission. Weitere
						Informationen finden Sie in der{' '}
						<a
							href="https://wiki.osmfoundation.org/wiki/Privacy_Policy"
							target="_blank"
							rel="noopener noreferrer"
							className="underline"
						>
							Datenschutzerklärung von OpenStreetMap
						</a>
						.
					</p>
				</div>
				<div>
					<h2 className="font-semibold text-base mb-1">Kartenmarkierungen</h2>
					<p>
						Die Symbole der Kartenmarkierungen lädt Ihr Browser von
						raw.githubusercontent.com (GitHub) und unpkg.com. Dabei werden Ihre
						IP-Adresse und technische Angaben zu Ihrem Browser an diese Anbieter
						übermittelt. Rechtsgrundlage ist das berechtigte Interesse an einer
						funktionsfähigen Kartendarstellung (Art. 6 Abs. 1 lit. f DSGVO).
						[Angaben zur Übermittlung in Drittländer ergänzen.]
					</p>
				</div>
				<div>
					<h2 className="font-semibold text-base mb-1">
						Betrieb der Anwendung und Datenspeicherung
					</h2>
					<p>
						Die Datenbank und die Anmeldung werden betrieben von: [Betreiber
						bzw. Hosting-Anbieter, Serverstandort und gegebenenfalls Hinweis auf
						einen Auftragsverarbeitungsvertrag]. Rechtsgrundlage für die
						Verarbeitung ist Art. 6 Abs. 1 lit. b und lit. f DSGVO.
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
						an den unten genannten Verantwortlichen. Außerdem haben Sie das
						Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
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
					<p className="mt-2 font-semibold">Datenschutzbeauftragte:r:</p>
					{/* Placeholder: name the data protection officer or remove this block. */}
					<p className="mt-1">[Name und Kontakt, falls vorhanden]</p>
				</div>
			</section>
		</div>
	);
}
