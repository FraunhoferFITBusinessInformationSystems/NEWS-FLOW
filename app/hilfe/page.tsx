import Link from 'next/link';

/** Page /hilfe: features, colour logic and usage notes; open to every role. */
export default function HilfePage() {
	return (
		<div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
			<h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
				Willkommen bei News Flow
			</h1>

			<section className="space-y-4">
				<h2 className="text-lg sm:text-xl font-semibold">Überblick</h2>
				<p className="text-sm sm:text-base leading-relaxed">
					News Flow zeigt, welche Stadtbäume Wasser brauchen.
					Bodenfeuchtesensoren messen die Bodenwasserspannung in 30, 60 und 90
					cm Tiefe; die Anwendung vergleicht die Messwerte mit Sollwerten je
					Baum und stellt das Ergebnis auf einer Karte und in Diagrammen dar.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="text-lg sm:text-xl font-semibold">Funktionen</h2>
				<ul className="list-disc pl-4 sm:pl-6 space-y-2 text-sm sm:text-base">
					<li>
						<strong>Live-Karte:</strong> Karte und Tabelle aller Bäume mit
						Sensor, eingefärbt nach Bewässerungsbedarf. Suche nach Objekt,
						Filter nach Bewässerungsbedarf, Bezirk und Bewässerungsbereich,
						CSV-Export der Tabelle und Sprung in die Detailansicht eines Baums.
					</li>
					<li>
						<strong>Details &amp; Analysen:</strong> Auswahl von Objekt, Bäumen
						und Zeitraum. Verlauf der Bodenwasserspannung mit Sollwert-Linien,
						Vergleich mit Vorjahren, Ist-Soll-Tabelle, Baumdaten und Notizen zum
						Baum.
					</li>
					<li>
						<strong>Hilfe:</strong> Diese Seite mit Funktionen und
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
					Die Farben zeigen an, wie dringend ein Baum bewässert werden sollte.
					Grundlage ist der Vergleich zwischen dem aktuellen Messwert (IST) und
					dem festgelegten maximalen Sollwert (SOLL) der Bodenwasserspannung je
					Tiefe. Auf der Karte erhält ein Baum die Farbe der ungünstigsten der
					drei Tiefen: Ist eine Tiefe rot, ist der ganze Baum rot.
				</p>
				<ul className="list-disc pl-4 sm:pl-6 space-y-2 text-sm sm:text-base">
					<li>
						<span className="font-bold text-green-600">🟢 Grün:</span> Kein
						Handlungsbedarf. Der IST-Wert liegt mindestens 10 % unter dem SOLL;
						der Boden ist ausreichend feucht.
					</li>
					<li>
						<span className="font-bold text-yellow-500">🟡 Gelb:</span> Leichter
						Handlungsbedarf. Der IST-Wert weicht höchstens 20 % des SOLL oder
						höchstens 20 kPa ab (der größere Wert gilt). Beobachten, ob bald
						bewässert werden muss.
					</li>
					<li>
						<span className="font-bold text-orange-500">🟠 Orange:</span>{' '}
						Mittlerer Handlungsbedarf. Der IST-Wert weicht höchstens 30 % des
						SOLL oder höchstens 40 kPa ab (der größere Wert gilt). Die
						Bewässerung sollte bald eingeplant werden.
					</li>
					<li>
						<span className="font-bold text-red-600">🔴 Rot:</span> Hoher
						Handlungsbedarf. Die Abweichung ist größer als bei Orange; der Baum
						sollte sofort bewässert werden.
					</li>
					<li>
						<span className="font-bold text-gray-500">🔘 Grau:</span> Die
						Messung ist älter als 2 Tage oder die Werte sind ungültig. Der
						Sensor könnte defekt sein oder keine aktuellen Werte übertragen.
					</li>
					<li>
						<span className="font-bold text-blue-600">🔵 Blau:</span> Für diesen
						Baum sind keine SOLL-Werte hinterlegt.
					</li>
				</ul>
				<p className="text-sm sm:text-base italic">
					In einfachen Worten: Grün = genug Wasser, Gelb = im Auge behalten,
					Orange = bald gießen, Rot = sofort gießen.
				</p>
				<p className="text-sm sm:text-base leading-relaxed">
					Beispiele:
					<br />
					Ein IST-Wert von <strong>45 kPa</strong> bei einem SOLL von maximal{' '}
					<strong>60 kPa</strong> wird als{' '}
					<span className="font-bold text-green-600">🟢 Grün</span> angezeigt,
					da er mehr als 10 % unter dem SOLL liegt.
					<br />
					Ein IST-Wert von <strong>120 kPa</strong> bei einem SOLL von{' '}
					<strong>90 kPa</strong> wird als{' '}
					<span className="font-bold text-orange-600">🟠 Orange</span>{' '}
					angezeigt: Die Abweichung von 30 kPa liegt über der Gelb-Grenze von 20
					kPa, aber unter der Orange-Grenze von 40 kPa.
				</p>
				<p className="text-xs sm:text-sm text-gray-600 italic">
					Hinweis: Bei den eingesetzten Sensoren ist <strong>201,42 kPa</strong>{' '}
					das Messmaximum. Dieser Wert sollte mit Vorsicht interpretiert werden:
					Der tatsächliche Wert kann darüber liegen, oder der Sensor ist
					fehlerhaft.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="text-lg sm:text-xl font-semibold">Nutzungshinweise</h2>
				<ul className="list-disc pl-4 sm:pl-6 space-y-2 text-sm sm:text-base">
					<li>
						Melden Sie sich mit Ihren Zugangsdaten an, um auf die Funktionen
						zuzugreifen. Zugänge werden von einer Administratorin oder einem
						Administrator angelegt.
					</li>
					<li>
						Über das Menü wechseln Sie zwischen Live-Karte und Details &amp;
						Analysen.
					</li>
					<li>Neue Messwerte erscheinen nach dem Neuladen der Seite.</li>
					<li>
						Weitere Informationen finden Sie im{' '}
						<Link
							href="/impressum"
							className="underline text-blue-600 hover:text-blue-800 touch-manipulation"
						>
							Impressum
						</Link>{' '}
						und in der{' '}
						<Link
							href="/datenschutz"
							className="underline text-blue-600 hover:text-blue-800 touch-manipulation"
						>
							Datenschutzerklärung
						</Link>
						.
					</li>
				</ul>
			</section>
		</div>
	);
}
