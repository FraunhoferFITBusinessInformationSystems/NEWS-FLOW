/**
 * Shared types for the dashboard route (tree overview, sensor data, comparisons).
 */

/** Soil moisture data point (German date format DD.MM.YYYY, kPa per depth). */
export type SoilMoistureDataPoint = {
	date: string;
	cm30: number | null;
	cm60: number | null;
	cm90: number | null;
};

/** Target (Soll) values per depth in kPa. */
export type SollZustandData = {
	cm30: number;
	cm60: number;
	cm90: number;
};

/** Actual (Ist) sensor values per depth in kPa — individual depths may be null when sensor data is missing. */
export type IstZustandData = {
	cm30: number | null;
	cm60: number | null;
	cm90: number | null;
};

/** Latest sensor values per tree (for multi-tree view). */
export type LatestSensorPerTree = Record<
	string,
	{ cm30: number | null; cm60: number | null; cm90: number | null; date: string }
>;

/** Tree overview as returned by getTreeOverview (dashboard action). */
export type TreeOverview = {
	baum_id: string | null;
	baum_nr: string | null;
	baum: string | null;
	objekt: string | null;
	bezirk: string | null;
	stadtteil: string | null;
	pflegebereich: number | string | null;
	bewaesserungsgrund: string | null;
	gattung_art: string | null;
	entwicklungsphase: string | null;
	standalter: number | null;
	created_at: string | null;
	bewaesserungsbereich_name: string | null;
	bewaesserungsbereich_bereich: string | null;
	hochwert: number | null;
	rechtswert: number | null;
	bewaesserungsbereich?: {
		name: string | null;
		bereich: string | null;
	};
};

/** Option for comparison year select. */
export type ComparisonYearOption = {
	value: number;
	label: string;
};

/** Comparison series for chart (year + shifted data). */
export type ComparisonSeriesItem = {
	year: number;
	data: SoilMoistureDataPoint[];
};
