/**
 * Shared types for the dashboard route (tree overview, sensor data, comparisons).
 *
 * @packageDocumentation
 */

/** Soil moisture data point (German date format DD.MM.YYYY, kPa per depth). */
export type SoilMoistureDataPoint = {
	date: string;
	cm30: number | null;
	cm60: number | null;
	cm90: number | null;
};

/** Target values per depth in kPa. */
export type TargetValues = {
	cm30: number;
	cm60: number;
	cm90: number;
};

/** Current sensor values per depth in kPa — individual depths may be null when sensor data is missing. */
export type CurrentValues = {
	cm30: number | null;
	cm60: number | null;
	cm90: number | null;
};

/** Latest sensor values per tree (for multi-tree view). */
export type LatestSensorPerTree = Record<
	string,
	{
		cm30: number | null;
		cm60: number | null;
		cm90: number | null;
		date: string;
	}
>;

/** Tree metadata as returned by getTreeOverview (dashboard action). */
export interface TreeOverview {
	tree_id: string | null;
	tree_number: string | null;
	site: string | null;
	district: string | null;
	type_species: string | null;
	/** Years since planting at this site; key of `irrigation_targets_by_age`. */
	tree_site_age: number | null;
	/** Creation time of the tree record. */
	created_at: string | null;
	irrigation_area_name: string | null;
	northing: number | null;
	easting: number | null;
}

/**
 * One soil moisture reading as returned by getFilteredTreeSensorData, a subset
 * of the view `v_soil_moisture_readings_mapped`.
 */
export interface SoilMoistureReading {
	measured_at: string;
	kpa_ch1: number | null;
	kpa_ch2: number | null;
	kpa_ch3: number | null;
	kpa_ch4: number | null;
	resistance_ch1: number | null;
	resistance_ch2: number | null;
	resistance_ch3: number | null;
	resistance_ch4: number | null;
	site: string | null;
	tree_number: string | null;
	tree_id: string | null;
	sensor_id: string | null;
	sensor_name: string | null;
}

/** One row of `tree_notes`. */
export interface TreeNote {
	id: string;
	tree_id: string;
	user_id: string;
	note: string;
	created_at: string;
}

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
