-- Views for NEWS FLOW.
--
-- Every view is created with security_invoker = on. Without it, a view runs
-- with the rights of its owner (the migration role), which bypasses row level
-- security on the underlying tables and exposes every row to any caller that
-- may select from the view. With security_invoker the policies of the calling
-- user apply, so RLS on the tables stays the only access boundary.


-- One row per soil moisture reading, joined to its sensor, the tree the sensor
-- is installed at, and the tree's irrigation area. Left joins keep readings of
-- sensors that are not (yet) assigned to a tree.
create view public.v_soil_moisture_readings_mapped
with (security_invoker = on)
as
select
	r.measured_at,
	r.kpa_ch1,
	r.kpa_ch2,
	r.kpa_ch3,
	r.kpa_ch4,
	r.resistance_ch1,
	r.resistance_ch2,
	r.resistance_ch3,
	r.resistance_ch4,
	s.id as sensor_id,
	s.name as sensor_name,
	t.id as tree_id,
	t.tree_number,
	t.site,
	t.district,
	t.type_species,
	t.planting_year,
	-- Years since planting at this site; the key of irrigation_targets_by_age.
	extract(year from current_date)::integer - t.planting_year as tree_site_age,
	t.is_archived,
	t.northing,
	t.easting,
	t.created_at,
	ia.area_name as irrigation_area_name
from public.sensor_data_soil_moisture r
	left join public.sensors s on r.sensor_id = s.id
	left join public.trees t on s.tree_id = t.id
	left join public.irrigation_areas ia on t.irrigation_area_id = ia.id;

comment on view public.v_soil_moisture_readings_mapped is
	'One row per soil moisture reading with sensor, tree and irrigation area attributes. Used by /dashboard.';
comment on column public.v_soil_moisture_readings_mapped.tree_site_age is
	'Computed as current year minus trees.planting_year; null when planting_year is null.';
comment on column public.v_soil_moisture_readings_mapped.created_at is
	'Creation time of the tree record, not of the reading.';


-- One row per sensor that has at least one reading: its latest reading, the
-- values of its earliest reading, and the tree and irrigation area it belongs
-- to. Used by the /overview map and table.
create view public.v_soil_moisture_latest_earliest_per_sensor
with (security_invoker = on)
as
with
	latest as (
		select distinct on (s.id)
			r.measured_at,
			r.kpa_ch1,
			r.kpa_ch2,
			r.kpa_ch3,
			r.kpa_ch4,
			r.resistance_ch1,
			r.resistance_ch2,
			r.resistance_ch3,
			r.resistance_ch4,
			s.id as sensor_id,
			s.name as sensor_name,
			s.tree_id,
			s.is_active
		from public.sensor_data_soil_moisture r
			join public.sensors s on r.sensor_id = s.id
		order by s.id, r.measured_at desc
	),
	earliest as (
		select distinct on (s.id)
			s.id as sensor_id,
			r.measured_at as measured_at_earliest,
			r.kpa_ch1 as kpa_ch1_earliest,
			r.kpa_ch2 as kpa_ch2_earliest,
			r.kpa_ch3 as kpa_ch3_earliest,
			r.kpa_ch4 as kpa_ch4_earliest
		from public.sensor_data_soil_moisture r
			join public.sensors s on r.sensor_id = s.id
		order by s.id, r.measured_at asc
	)
select
	l.measured_at,
	l.kpa_ch1,
	l.kpa_ch2,
	l.kpa_ch3,
	l.kpa_ch4,
	l.resistance_ch1,
	l.resistance_ch2,
	l.resistance_ch3,
	l.resistance_ch4,
	l.sensor_id,
	l.sensor_name,
	l.tree_id,
	t.tree_number,
	t.site,
	t.district,
	t.type_species,
	t.planting_year,
	extract(year from current_date)::integer - t.planting_year as tree_site_age,
	t.is_archived,
	t.northing,
	t.easting,
	t.created_at,
	ia.area_name as irrigation_area_name,
	e.measured_at_earliest,
	e.kpa_ch1_earliest,
	e.kpa_ch2_earliest,
	e.kpa_ch3_earliest,
	e.kpa_ch4_earliest,
	-- Irrigation history comes from the irrigation round tables, which are not
	-- part of this schema. The column is kept so the view contract stays stable
	-- once those tables are added.
	null::timestamptz as recently_irrigated_at,
	l.is_active
from latest l
	left join public.trees t on l.tree_id = t.id
	left join public.irrigation_areas ia on t.irrigation_area_id = ia.id
	left join earliest e on l.sensor_id = e.sensor_id
order by l.sensor_id;

comment on view public.v_soil_moisture_latest_earliest_per_sensor is
	'One row per sensor with readings: latest reading, earliest reading values, tree and irrigation area attributes. Used by /overview.';
comment on column public.v_soil_moisture_latest_earliest_per_sensor.recently_irrigated_at is
	'Always null in this build: irrigation rounds are not part of the schema yet.';
comment on column public.v_soil_moisture_latest_earliest_per_sensor.created_at is
	'Creation time of the tree record, not of the reading.';
