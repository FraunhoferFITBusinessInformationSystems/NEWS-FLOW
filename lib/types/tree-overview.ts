/**
 * One row of the view `v_soil_moisture_latest_earliest_per_sensor`: a sensor
 * with its latest reading, the values of its earliest reading, and the tree and
 * irrigation area it belongs to. Used by the /overview map and table.
 *
 * Every field is nullable because PostgreSQL reports all view columns as
 * nullable, and the left joins leave tree fields empty for unassigned sensors.
 */
export interface TreeOverviewWithSensorRow {
	measured_at: string | null;
	kpa_ch1: number | null;
	kpa_ch2: number | null;
	kpa_ch3: number | null;
	kpa_ch4: number | null;
	resistance_ch1: number | null;
	resistance_ch2: number | null;
	resistance_ch3: number | null;
	resistance_ch4: number | null;
	sensor_id: string | null;
	sensor_name: string | null;
	tree_id: string | null;
	tree_number: string | null;
	site: string | null;
	district: string | null;
	type_species: string | null;
	planting_year: number | null;
	/** Years since planting at this site; key of `irrigation_targets_by_age`. */
	tree_site_age: number | null;
	is_archived: boolean | null;
	northing: number | null;
	easting: number | null;
	/** Creation time of the tree record, not of the reading. */
	created_at: string | null;
	irrigation_area_name: string | null;
	measured_at_earliest: string | null;
	kpa_ch1_earliest: number | null;
	kpa_ch2_earliest: number | null;
	kpa_ch3_earliest: number | null;
	kpa_ch4_earliest: number | null;
	/** Always null in this build: irrigation rounds are not part of the schema. */
	recently_irrigated_at: string | null;
	is_active: boolean | null;
}
