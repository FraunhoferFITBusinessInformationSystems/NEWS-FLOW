'use server';

import { HelpHint } from '@/components/ui/help-hint';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getOverviewTableData } from './actions';
import MapTabClient from './components/Map/MapTabClient';
import { TreeList } from './components/Table/baumliste';

export default async function Page() {
	const tableRows = await getOverviewTableData();

	return (
		<div className="p-4">
			<Tabs defaultValue="map">
				<TabsList className="mb-3">
					<TabsTrigger value="map">Karte</TabsTrigger>
					<TabsTrigger value="table">Tabelle</TabsTrigger>
				</TabsList>
				<TabsContent value="table" className="mt-0">
					<div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
						<div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground">
							<span>Hier finden Sie alle Informationen zu den Bäumen.</span>
							<HelpHint label="Sortieren, Filtern & Export" side="bottom">
								Jeder Spaltenkopf hat ein eigenes Menü zum Sortieren und zum
								Filtern nach einzelnen Werten – mehrere Filter wirken gemeinsam.
								Der CSV-Export übernimmt genau die aktuell gefilterten Zeilen.
								Veraltete Messungen (älter als 2 Tage) sind in der Spalte
								„Letzte Messung“ mit „veraltet“ gekennzeichnet.
							</HelpHint>
						</div>
						<div className="flex justify-end" />
					</div>
					<div className="min-w-0 overflow-x-auto">
						<TreeList rows={tableRows} />
					</div>
				</TabsContent>
				<TabsContent value="map" className="mt-0">
					<div className="w-full">
						<MapTabClient />
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
