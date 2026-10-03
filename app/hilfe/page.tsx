export default function HilfePage() {
	return (
		<main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
			<h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
				Willkommen bei News Flow
			</h1>

			<section className="space-y-4">
				<h2 className="text-lg sm:text-xl font-semibold">Überblick</h2>
				<p className="text-sm sm:text-base leading-relaxed">
					News Flow ist eine webbasierte Anwendung zur Planung, Durchführung und
					Auswertung von Baum- und Flächenbewässerungen. Sie verbindet
					Sensordaten, Wetterprognosen und festgelegte Bewässerungsstrategien,
					um den Wasserbedarf präzise zu ermitteln. Rollenbasierte Bereiche
					unterstützen Administrator:innen, Sachbearbeiter:innen und
					Gärtner:innen bei Verwaltung, Einsatzplanung und mobiler Durchführung.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="text-lg sm:text-xl font-semibold text-blue-600">
					Changelog
				</h2>
				<div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
					<div className="space-y-3">
												<div>
							<h3 className="font-semibold text-blue-800">
								Version 0.9.2 (aktuell)
							</h3>
							<p className="text-sm text-blue-700">
								Mehrere neue Funktionen und Verbesserungen, s. vergangene Mails
							</p>

						</div>
						<div>
							<h3 className="font-semibold text-blue-800">
								Version 0.9.1 (aktuell)
							</h3>
							<p className="text-sm text-blue-700">
								• Automatische Erkennung neuer Sensoren aus der UDP-Bereitstellung und Übernahme in die Datenbank
							</p>
							<p className="text-sm text-blue-700">
								• Automatischer Download der Sensordaten für neu erkannte Sensoren
							</p>
							<p className="text-sm text-blue-700">
								• Navigationsleiste überarbeitet mit verbesserter Struktur und rollenspezifischer Gruppierung (u. a. Bereich „Administration“)
							</p>
							<p className="text-sm text-blue-700">
								• Details und Analysen: Vergleich der Bodenwasserspannung mit entsprechenden Zeiträumen aus Vorjahren möglich
							</p>
							<p className="text-sm text-blue-700">
								• Details und Analysen: Mehrere Bäume können in der Detailansicht gemeinsam angezeigt werden
							</p>
							<p className="text-sm text-blue-700">
								• Details und Analysen: Bewässerungsempfehlung wird nun direkt in der Detailansicht angezeigt
							</p>
							<p className="text-sm text-blue-700">
								• Neue Ansicht „Sensorverwaltung“ mit Zuordnung/Neuzuordnung von Sensoren zu Bäumen sowie Umbenennen und Aktiv-/Inaktiv-Setzen von Sensoren
							</p>
						</div>
						<div>
							<h3 className="font-semibold text-blue-800">
								Version 0.9.0
							</h3>
							<p className="text-sm text-blue-700">
								• Backend: Datenbank überarbeitet und bereinigt
							</p>
							<p className="text-sm text-blue-700">
								• Backend: Regelmäßige Datenbank-Backups zur Datensicherung eingerichtet
							</p>
							<p className="text-sm text-blue-700">
								• Backend: Historische Daten (vor Juni 2025) in die Datenbank integriert
							</p>
							<p className="text-sm text-blue-700">
								• Live-Karte: Sortierung der Baumdetails und der Tabellenbereiche angepasst (z. B. Spielwiese 01, Spielwiese 02), Datum in Baumdetails entfernt
							</p>
							<p className="text-sm text-blue-700">
								• Details und Analysen: Vorfilter für Palmengarten/GFA ergänzt; Feinfilter zeigt entsprechend nur PG- oder GFA-Objekte
							</p>
							<p className="text-sm text-blue-700">
								• Details und Analysen: Palmengarten-Einzelbäume um Gattung ergänzt und über Suche auffindbar
							</p>
							<p className="text-sm text-blue-700">
								• Details und Analysen: Dank historischer Daten sind längere Zeiträume in der Sensordaten-Zeitreihe darstellbar
							</p>
							<p className="text-sm text-blue-700">
								• Meine Bewässerungen: Archiv zeitlich geordnet und monatlich dargestellt
							</p>
							<p className="text-sm text-blue-700">
								• Meine Bewässerungen: Fehlermeldung bei nicht speicherbarer Bewässerung ergänzt
							</p>
							<p className="text-sm text-blue-700">
								• Meine Bewässerungen: Gesamte Leiste anklickbar für Objektdetailansicht; Gießkannensymbole vergrößert und besser anklickbar
							</p>
							<p className="text-sm text-blue-700">
								• Meine Bewässerungen: Farbzuordnung angepasst (offene Gänge rot, abgeschlossene Gänge grün)
							</p>
							<p className="text-sm text-blue-700">
								• Bewässerungsplanung: Formulierung des Startzeitpunkts beim Anlegen eines Bewässerungsgangs von „am“ auf „ab“ geändert
							</p>
							<p className="text-sm text-blue-700">
								• Bewässerungsplanung: Bereich „Unbekannt“ entfernt und durch „sonstige Sensoren“ ersetzt, um Fehlplanungen zu vermeiden
							</p>
							<p className="text-sm text-blue-700">
								• Zusätzlich kleinere UI/UX-Anpassungen und Bug-Fixes (u. a. bessere Darstellung der Bodenwasserspannung, Sortierung der Baumdaten)
							</p>
						</div>
						<div>
							<h3 className="font-semibold text-blue-800">
								Version 0.8.7
							</h3>
							<p className="text-sm text-blue-700">
								• Notiz Funktion zu Palmengarten und GFA hinzugefügt
							</p>
							<p className="text-sm text-blue-700">
								• Bericht export hinzugefügt
							</p>
							<p className="text-sm text-blue-700">
								• Kleiner Fixes (Sortierungen in "Bewässerungsplanung GFA" und "Meine Bewässerungen", Button-Design in Live‑Karte)
							</p>
						</div>
						<div>
							<h3 className="font-semibold text-blue-800">
								Version 0.8.6 
							</h3>
							<p className="text-sm text-blue-700">
								• Erweiterter Zoom zu den Karten (Live-Karte und Meine Bewässerungen) hinzugefügt
							</p>
							<p className="text-sm text-blue-700">
								• Angepasste Farbgebung in Meine Bewässerungen
							</p>
						</div>
						<div>
							<h3 className="font-semibold text-blue-800">
								Version 0.8.5
							</h3>
							<p className="text-sm text-blue-700">
								• Bewässerungsüberwachung für Sachbearbeiter:innen hinzugefügt - Überwachung des Fortschritts von erstellten Bewässerungsgängen
							</p>
							<p className="text-sm text-blue-700">
								• Detaillierte Fortschrittsanzeige mit Baum- und Objektebene
							</p>
							<p className="text-sm text-blue-700">
								• Navigation erweitert um Monitoring-Bereich
							</p>
							<p className="text-sm text-blue-700">
								• Nur Gärtner:innen können als Bearbeiter:innen für Bewässerungsgänge ausgewählt werden
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-blue-800">
								Version 0.8.4
							</h3>
							<p className="text-sm text-blue-700">
								• Verbesserte Wetterprognose-Anzeige unter Verwendung von Daten des Deutschen Wetterdienstes
							</p>
							<p className="text-sm text-blue-700">
								• Erstellung einer regelbasierten Handlungsempfehlung basierend auf der Wetterprognose und aktueller Sensorikdaten in der Detailansicht, Regeln noch weiter in Ausarbeitung
							</p>
							<p className="text-sm text-blue-700">
								• Verwendung von dynamischen Schwellenwerten in der Grafik zur Bodenwasserspannung basierend auf den Soll-Werten
							</p>
							<p className="text-sm text-blue-700">
								• Bug-Fixes
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-blue-800">
								Version 0.8.3
							</h3>
							<p className="text-sm text-blue-700">
								• Daten von West hinzugefügt, inklusive Anlegung von Bewässerungsgängen
							</p>
							<p className="text-sm text-blue-700">
								• Layout-Neugestaltung: Hilfe-Seite überarbeitet
							</p>
							<p className="text-sm text-blue-700">
								• Live-Karte ist jetzt die neue Homepage
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-blue-800">Version 0.8.2</h3>
							<p className="text-sm text-blue-700">
								• Rollenbasiertes Zugriffsmanagement implementiert
							</p>
							<p className="text-sm text-blue-700">
								• Super-Administrator Rolle hinzugefügt
							</p>
							<p className="text-sm text-blue-700">
								• Automatische Navigation-Filterung nach Benutzerrolle
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-blue-800">Version 0.8.1</h3>
							<p className="text-sm text-blue-700">
								• Zusätzliche Wetterkomponenten hinzugefügt
							</p>
							<p className="text-sm text-blue-700">
								• Verbesserte Wetterprognose-Anzeige
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-blue-800">Version 0.8.0</h3>
							<p className="text-sm text-blue-700">
								• Alpha-Version Veröffentlichung
							</p>
							<p className="text-sm text-blue-700">
								• Grundlegende Funktionalitäten implementiert
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="space-y-4">
				<h2 className="text-lg sm:text-xl font-semibold">Funktionen</h2>

				<ul className="list-disc pl-4 sm:pl-6 space-y-2 text-sm sm:text-base">
					<li>
						<strong>Live‑Karte:</strong> Kartenansicht aller Sensoren mit
						aktuellem Status. Filtern nach
						Bezirk/Bewässerungsbereich/Sensorstatus, Sprung zur Detailansicht;
						optional umschaltbar auf Tabellenansicht.
					</li>

					<li>
						<strong>Details &amp; Analysen:</strong> Tiefenanalyse je
						Baum/Sensor mit Zeitreihen (z.&nbsp;B. Bodenwasserspannung),
						Wetterprognosen und Stammdaten. Auswahl des Zeitraums, Vergleich IST
						vs. SOLL.
					</li>

					<li>
						<strong>Bewässerungsstrategien:</strong> Definition und Verwaltung
						von SOLL‑Werten (kPa‑Maximalwerte je Tiefe) pro Bereich
						(PG)/Standalter (GFA).
					</li>

					<li>
						<strong>Bewässerungsplanung (Sachbearbeiter/Admin):</strong> Stand
						(14.08.2025): Primär für GFA; Sensorenübersicht je nach
						Bewässerungsbereich; Planung von Bewässerungsgängen, Zuteilung an
						Gärtner:innen.
					</li>

					<li>
						<strong>Bewässerungsüberwachung (Sachbearbeiter/Admin):</strong> Überwachung des Fortschritts von erstellten Bewässerungsgängen. 
						Anzeige offener und abgeschlossener Gänge mit detaillierter 
						Fortschrittsanzeige pro Objekt und Baum.
					</li>

					<li>
						<strong>Meine Bewässerungen (Gärtner):</strong> Übersicht der
						geplanten Gänge für die Durchführung vor Ort. Aufträge öffnen,
						Schritte abhaken und Abschluss quittieren.
					</li>

					<li>
						<strong>Nutzerverwaltung (Admin):</strong> Benutzer‑, Rollen‑ und
						Organisationsverwaltung (Anlegen, Bearbeiten und Löschen).
					</li>

					<li>
						<strong>Hilfe:</strong> Diese Übersichtsseite mit Funktionen und
						Nutzungshinweisen.
					</li>

					<li>
						<strong>Impressum &amp; Datenschutz:</strong> Rechtliche Hinweise
						und Datenschutzbestimmungen.
					</li>
				</ul>
			</section>

			<section className="space-y-4">
				<h2 className="text-lg sm:text-xl font-semibold">
					Farblogik für den Bewässerungsbedarf
				</h2>
				<p className="text-sm sm:text-base leading-relaxed">
					Die Farben zeigen an, wie dringend ein Baum oder Bereich bewässert
					werden sollte. Grundlage ist der Vergleich zwischen dem aktuellen
					Messwert (IST) und dem festgelegten Sollwert (SOLL) der
					Bodenwasserspannung. Hier ist die Logik, die hinter den Farben steht:
				</p>
				<ul className="list-disc pl-4 sm:pl-6 space-y-2 text-sm sm:text-base">
					<li>
						<span className="font-bold text-green-600">🟢 Grün:</span> Kein Handlungsbedarf - Der IST-Wert liegt mindestens 10 % unter dem maximal erlaubten SOLL-Wert. Dies bedeutet, dass der Boden ausreichend feucht ist und kein Handlungsbedarf besteht.
					</li>
					<li>
						<span className="font-bold text-yellow-500">🟡 Gelb:</span> Leichter Handlungsbedarf - Der IST-Wert weicht höchstens 20 % vom SOLL ab (mindestens 20 kPa Differenz). Hier sollte man beobachten, ob eine Bewässerung bald nötig wird.
					</li>
					<li>
						<span className="font-bold text-orange-500">🟠 Orange:</span>{' '}
						Mittlerer Handlungsbedarf - Die Abweichung des IST-Wertes beträgt höchstens 30 % vom SOLL (mindestens 40 kPa Differenz). In diesem Fall sollte die Bewässerung bald eingeplant werden.
					</li>
					<li>
						<span className="font-bold text-red-600">🔴 Rot:</span> Hoher Handlungsbedarf - Die Abweichung ist größer als in den genannten Bereichen. Hier ist sofortige Bewässerung erforderlich, um Schäden zu vermeiden.
					</li>
					<li>
						<span className="font-bold text-gray-500">🔘 Grau:</span>{' '}
						Sensordaten sind älter als 2 Tage - der Sensor könnte defekt sein oder keine aktuellen Werte übertragen.
					</li>
					<li>
						<span className="font-bold text-blue-600">🔵 Blau:</span> Es sind keine SOLL-Werte für diesen Standort verfügbar.
					</li>
				</ul>
				<p className="text-sm sm:text-base italic">
					In einfachen Worten: Grün = genug Wasser, Gelb = im Auge behalten,
					Orange = bald gießen, Rot = sofort gießen.

				</p>
				<p> Beispiele:
					<br></br>
					Ein Standort, der einen Wert von <strong>45 kPa</strong> hat und einen SOLL-Wert von maximal <strong>60 kPa</strong>, wird beispielsweise als{' '}
					<span className="font-bold text-green-600">🟢 Grün</span> angezeigt,
					da der IST-Wert unter dem SOLL-Wert liegt.
					<br></br>
					Ein Standort mit einem IST-Wert von <strong>120 kPa</strong> und einem
					SOLL-Wert von <strong>90 kPa</strong> wird als{' '}
					<span className="font-bold text-orange-600">🟠 Orange</span> angezeigt,
					da der IST-Wert den SOLL-Wert deutlich überschreitet, die Abweichung jedoch noch innerhalb des definierten Orange-Bereichs liegt (unterhalb von 40 kPa).
				</p>
				<p className="text-xs sm:text-sm text-gray-600 italic">
					Hinweis: Der Wert <strong>201,42</strong> kPa ist das Messmaximum. Er
					sollte mit Vorsicht interpretiert werden – er kann entweder bedeuten,
					dass der tatsächliche Wert darüber liegt, oder auf einen fehlerhaften
					Sensor hinweisen.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="text-lg sm:text-xl font-semibold">Nutzungshinweise</h2>
				<ul className="list-disc pl-4 sm:pl-6 space-y-2 text-sm sm:text-base">
					<li>
						Melden Sie sich mit Ihren Zugangsdaten an, um auf die Funktionen
						zuzugreifen.
					</li>
					<li>
						Über das Menü können Sie zwischen Benutzerverwaltung, Übersicht und
						weiteren Bereichen wechseln.
					</li>
					<li>
						Neue Benutzer:innen können im Benutzerverwaltungsbereich hinzugefügt
						werden.
					</li>
					<li>
						Die Sensordaten werden automatisch aktualisiert und farblich
						hervorgehoben.
					</li>
					<li>
						Weitere Informationen finden Sie im{' '}
						<a
							href="/impressum"
							className="underline text-blue-600 hover:text-blue-800 touch-manipulation"
						>
							Impressum
						</a>{' '}
						und in den{' '}
						<a
							href="/datenschutz"
							className="underline text-blue-600 hover:text-blue-800 touch-manipulation"
						>
							Datenschutzbedingungen
						</a>
						.
					</li>
				</ul>
			</section>
		</main>
	);
}
