-- Demo data for local development, applied by `supabase start` on a fresh
-- database and by `supabase db reset` after the migrations.
--
-- Every row here is fictional: sites, trees, sensors, readings and the target
-- values are invented, never exported from a real deployment. The application
-- roles are not seed data; they are inserted by the initial schema migration.
--
-- Contents:
--   1. Demo login (demo@example.com / Demo1234, role Sachbearbeiter:in)
--   2. Irrigation areas and irrigation targets
--   3. Four sites with five trees each; trees 1 to 4 have a sensor, tree 5 not
--   4. Two readings per day per sensor from 1 January two years ago until now
--   5. Special cases for testing the filters and UI states
--   6. Tree notes
--
-- Readings are computed, not random: the noise is derived from a hash of the
-- sensor id and the timestamp, so every reset produces the same values. The
-- dates are relative to the day of the reset, so the latest readings are
-- always fresh.
--
-- Demo rows are marked so supabase/scripts/remove-demo-data.sql can delete
-- them without touching other data: ids of the login, irrigation areas and
-- trees start with d0000000-0000-4000-, sensor ids start with DEMO-. Keep
-- this marking when adding rows here.


-- ---------------------------------------------------------------------------
-- 1. Demo login
--
-- Inserted directly into the auth schema, which only works on the local stack.
-- The token columns must be empty strings rather than null, otherwise the auth
-- server fails to load the user at login.
-- ---------------------------------------------------------------------------

insert into auth.users (
	instance_id,
	id,
	aud,
	role,
	email,
	encrypted_password,
	email_confirmed_at,
	raw_app_meta_data,
	raw_user_meta_data,
	created_at,
	updated_at,
	confirmation_token,
	recovery_token,
	email_change_token_new,
	email_change
) values (
	'00000000-0000-0000-0000-000000000000',
	'd0000000-0000-4000-8000-000000000001',
	'authenticated',
	'authenticated',
	'demo@example.com',
	extensions.crypt('Demo1234', extensions.gen_salt('bf')),
	now(),
	'{"provider": "email", "providers": ["email"]}',
	'{}',
	now(),
	now(),
	'',
	'',
	'',
	''
);

insert into auth.identities (
	id,
	user_id,
	provider_id,
	provider,
	identity_data,
	last_sign_in_at,
	created_at,
	updated_at
) values (
	'd0000000-0000-4000-8000-000000000002',
	'd0000000-0000-4000-8000-000000000001',
	'd0000000-0000-4000-8000-000000000001',
	'email',
	jsonb_build_object(
		'sub', 'd0000000-0000-4000-8000-000000000001',
		'email', 'demo@example.com',
		'email_verified', true
	),
	now(),
	now(),
	now()
);

insert into public.users (id, email, first_name, last_name, role_id)
select
	'd0000000-0000-4000-8000-000000000001',
	'demo@example.com',
	'Erika',
	'Mustermann',
	r.id
from public.roles r
where r.role_name = 'Sachbearbeiter:in';


-- ---------------------------------------------------------------------------
-- 2. Irrigation areas and irrigation targets
--
-- Targets are the highest acceptable soil water tension in kPa per depth.
-- Rows exist for site ages 1 to 10 only; a tree outside that range has no
-- irrigation strategy (blue pin on the map).
-- ---------------------------------------------------------------------------

insert into public.irrigation_areas (id, area_name) values
	('d0000000-0000-4000-8001-000000000001', 'Bewässerungsgebiet Nord'),
	('d0000000-0000-4000-8001-000000000002', 'Bewässerungsgebiet Süd'),
	('d0000000-0000-4000-8001-000000000003', 'Bewässerungsgebiet West');

insert into public.irrigation_targets_by_age (
	tree_site_age,
	target_max_30cm,
	target_max_60cm,
	target_max_90cm,
	irrigation_litres
)
select
	age,
	case when age <= 3 then 60 when age <= 6 then 80 else 100 end,
	case when age <= 3 then 80 when age <= 6 then 100 else 120 end,
	case when age <= 3 then 100 when age <= 6 then 120 else 150 end,
	case when age <= 3 then 100 when age <= 6 then 150 else 200 end
from generate_series(1, 10) as age;


-- ---------------------------------------------------------------------------
-- 3. Sites, trees and sensors
--
-- The two temporary tables hold the demo layout; trees and sensors are
-- inserted from them. Coordinates are UTM zone 32N around the default map
-- center; the trees of a site stand in a row about 15 m apart.
--
-- site_age is the number of years the tree has stood at its site. The planting
-- year is computed from it, so the ages (and the matching targets) stay the
-- same no matter in which year the seed runs.
--
-- base_kpa is the soil water tension of the site outside the growing season.
-- It decides the tree's current pin colour: roughly green up to 40, yellow
-- around 55, orange around 75 and red from 100 for the youngest trees. A null
-- base_kpa means the tree has no sensor. Such trees exist only in the trees
-- table; the views start from readings, so the pages do not show them.
-- ---------------------------------------------------------------------------

create temporary table demo_sites (
	site_code text primary key,
	-- Part of the tree ids, which must be hex digits.
	site_index integer not null unique,
	site text not null,
	district text not null,
	area_name text not null,
	base_easting double precision not null,
	base_northing double precision not null
);

insert into demo_sites values
	('LA', 1, 'Lindenallee', 'Nordstadt', 'Bewässerungsgebiet Nord', 474200, 5552300),
	('SP', 2, 'Am Stadtpark', 'Oststadt', 'Bewässerungsgebiet Nord', 475400, 5551800),
	('KW', 3, 'Kastanienweg', 'Südstadt', 'Bewässerungsgebiet Süd', 474800, 5550600),
	('PR', 4, 'Platanenring', 'Weststadt', 'Bewässerungsgebiet West', 473600, 5551200);

create temporary table demo_trees (
	site_code text not null references demo_sites (site_code),
	tree_number integer not null,
	type_species text not null,
	site_age integer not null,
	base_kpa double precision
);

insert into demo_trees values
	('LA', 1, 'Tilia cordata', 3, 20),
	('LA', 2, 'Tilia cordata', 3, 30),
	('LA', 3, 'Tilia cordata', 5, 55),
	('LA', 4, 'Tilia × europaea', 8, 25),
	('LA', 5, 'Tilia cordata', 2, null),
	('SP', 1, 'Acer platanoides', 4, 35),
	('SP', 2, 'Acer campestre', 6, 75),
	('SP', 3, 'Quercus robur', 9, 30),
	('SP', 4, 'Acer platanoides', 1, 20),
	('SP', 5, 'Quercus robur', 10, null),
	('KW', 1, 'Aesculus hippocastanum', 7, 40),
	('KW', 2, 'Aesculus × carnea', 2, 100),
	('KW', 3, 'Carpinus betulus', 5, 15),
	('KW', 4, 'Aesculus hippocastanum', 3, 45),
	('KW', 5, 'Carpinus betulus', 6, null),
	('PR', 1, 'Platanus × hispanica', 8, 60),
	('PR', 2, 'Platanus × hispanica', 4, 25),
	('PR', 3, 'Gleditsia triacanthos', 1, 65),
	-- Site age 15 has no row in irrigation_targets_by_age: blue pin.
	('PR', 4, 'Platanus × hispanica', 15, 30),
	('PR', 5, 'Gleditsia triacanthos', 2, null);

-- Tree ids end in the site index and the tree number, for example
-- d0000000-0000-4000-8002-000000000102 for Lindenallee tree 2.
insert into public.trees (
	id,
	tree_number,
	site,
	district,
	type_species,
	easting,
	northing,
	irrigation_area_id,
	planting_year
)
select
	(
		'd0000000-0000-4000-8002-'
		|| lpad((ds.site_index * 100 + dt.tree_number)::text, 12, '0')
	)::uuid,
	dt.tree_number::text,
	ds.site,
	ds.district,
	dt.type_species,
	ds.base_easting + dt.tree_number * 15,
	ds.base_northing + dt.tree_number * 4,
	ia.id,
	extract(year from current_date)::integer - dt.site_age
from demo_trees dt
	join demo_sites ds on ds.site_code = dt.site_code
	join public.irrigation_areas ia on ia.area_name = ds.area_name;

-- Sensor ids follow the pattern DEMO-<site code>-<tree number>, for example
-- DEMO-LA-02, so the special cases below can name them directly.
insert into public.sensors (id, name, tree_id, source, first_seen_at)
select
	'DEMO-' || dt.site_code || '-' || lpad(dt.tree_number::text, 2, '0'),
	'Bodenfeuchtesensor ' || ds.site || ' ' || dt.tree_number,
	t.id,
	'demo',
	date_trunc('year', current_date) - interval '2 years'
from demo_trees dt
	join demo_sites ds on ds.site_code = dt.site_code
	join public.trees t
		on t.site = ds.site and t.tree_number = dt.tree_number::text
where dt.base_kpa is not null;


-- ---------------------------------------------------------------------------
-- 4. Readings
--
-- Two readings per day (06:00 and 18:00 UTC) on channels 1 to 3, the 30, 60
-- and 90 cm depths. Channel 4 stays empty.
--
-- The model per reading:
--   - season_weight is 0.15 in winter and rises to 1 in mid-July, so the soil
--     dries out much further in summer.
--   - The soil dries out over a 10-day cycle (rain or irrigation resets it).
--     Deeper channels follow with a lag of 2 and 4 days and a smaller swing.
--   - year_factor makes the years differ by up to 15 %, so the comparison
--     years on the dashboard do not overlap.
--   - Values are capped at 239 kPa, the upper limit of common soil water
--     tension sensors, and kept above 5 kPa (0 counts as "no value" in the UI).
--   - Resistance is derived from kPa and stays far below the 1,000,000 ohm
--     threshold that marks a reading as invalid.
-- ---------------------------------------------------------------------------

insert into public.sensor_data_soil_moisture (
	sensor_id,
	measured_at,
	kpa_ch1,
	kpa_ch2,
	kpa_ch3,
	resistance_ch1,
	resistance_ch2,
	resistance_ch3
)
with
	reading_inputs as (
		select
			s.id as sensor_id,
			ts as measured_at,
			dt.base_kpa,
			0.15 + 0.85 * greatest(
				0,
				sin(pi() * (extract(doy from ts)::double precision - 90) / 200)
			) as season_weight,
			1 + 0.15 * (mod(extract(year from ts)::integer, 3) - 1) as year_factor,
			-- Shifted per sensor so the trees do not all dry out in step.
			extract(epoch from ts)::double precision / 86400
				+ mod(abs(hashtext(s.id)::bigint), 10) as day_index,
			-- Between -0.5 and 0.5, the same for every reset.
			mod(abs(hashtext(s.id || ts::text)::bigint), 1000) / 1000.0 - 0.5 as noise
		from public.sensors s
			join public.trees t on t.id = s.tree_id
			join demo_sites ds on ds.site = t.site
			join demo_trees dt
				on dt.site_code = ds.site_code
				and dt.tree_number::text = t.tree_number
			cross join generate_series(
				date_trunc('year', current_date) - interval '2 years' + interval '6 hours',
				now(),
				interval '12 hours'
			) as ts
	),
	drying_phases as (
		select
			*,
			-- Position in the 10-day drying cycle, from 0 (wet) to 1 (dry).
			(day_index - 10 * floor(day_index / 10)) / 10 as phase_30cm,
			(day_index - 2 - 10 * floor((day_index - 2) / 10)) / 10 as phase_60cm,
			(day_index - 4 - 10 * floor((day_index - 4) / 10)) / 10 as phase_90cm
		from reading_inputs
	),
	kpa_values as (
		select
			sensor_id,
			measured_at,
			least(239, greatest(5,
				(base_kpa + season_weight * (20 + 120 * phase_30cm)) * year_factor
					+ noise * 10
			)) as kpa_30cm,
			least(239, greatest(5,
				(base_kpa * 1.1 + season_weight * (15 + 90 * phase_60cm)) * year_factor
					+ noise * 6
			)) as kpa_60cm,
			least(239, greatest(5,
				(base_kpa * 1.2 + season_weight * (10 + 60 * phase_90cm)) * year_factor
					+ noise * 4
			)) as kpa_90cm
		from drying_phases
	)
select
	sensor_id,
	measured_at,
	round(kpa_30cm::numeric, 1),
	round(kpa_60cm::numeric, 1),
	round(kpa_90cm::numeric, 1),
	round((kpa_30cm * 120 + 500)::numeric),
	round((kpa_60cm * 120 + 500)::numeric),
	round((kpa_90cm * 120 + 500)::numeric)
from kpa_values;


-- ---------------------------------------------------------------------------
-- 5. Special cases
--
-- A resistance above 1,000,000 ohm marks a channel as invalid;
-- filterInvalidSensorKpaValues in lib/utils/sensor-data-validation.ts then
-- sets its kPa value to null in the application.
-- ---------------------------------------------------------------------------

-- DEMO-LA-02: 60 cm channel invalid from 1 to 20 July of every year and from
-- 14 to 10 days ago. The dashboard chart shows gaps and the gap hint.
update public.sensor_data_soil_moisture
set resistance_ch2 = 2000000
where sensor_id = 'DEMO-LA-02'
	and (
		(extract(month from measured_at) = 7 and extract(day from measured_at) <= 20)
		or measured_at between now() - interval '14 days' and now() - interval '10 days'
	);

-- DEMO-SP-01: 30 cm channel invalid for the last 3 days, so the latest
-- reading has only two valid depths. The overview derives the pin colour from
-- the remaining depths.
update public.sensor_data_soil_moisture
set resistance_ch1 = 2000000
where sensor_id = 'DEMO-SP-01'
	and measured_at > now() - interval '3 days';

-- DEMO-SP-03: the sensor stopped sending 5 days ago. The latest reading is
-- older than two days, so the pin is grey.
delete from public.sensor_data_soil_moisture
where sensor_id = 'DEMO-SP-03'
	and measured_at > now() - interval '5 days';

-- DEMO-KW-02: about 5 % of the readings lack the 90 cm channel in the
-- database. The queries drop such rows (kpa_ch3 is null). The last 7 days stay
-- complete, otherwise the sensor could vanish from the overview.
update public.sensor_data_soil_moisture
set kpa_ch3 = null, resistance_ch3 = null
where sensor_id = 'DEMO-KW-02'
	and measured_at < now() - interval '7 days'
	and mod(abs(hashtext(sensor_id || measured_at::text)::bigint), 20) = 0;

-- DEMO-KW-04: switched off by hand. Hidden on the live map, still listed in
-- the overview table.
update public.sensors
set is_active = false
where id = 'DEMO-KW-04';

-- Last contact of every sensor, as data ingestion would record it.
update public.sensors s
set recently_seen_at = (
	select max(r.measured_at)
	from public.sensor_data_soil_moisture r
	where r.sensor_id = s.id
);


-- ---------------------------------------------------------------------------
-- 6. Tree notes
--
-- Written by the demo login, so it may also delete them on the dashboard.
-- ---------------------------------------------------------------------------

insert into public.tree_notes (tree_id, user_id, note, created_at)
select
	t.id,
	'd0000000-0000-4000-8000-000000000001',
	n.note,
	now() - n.age
from public.trees t
	cross join (values
		('Sensor in 60 cm Tiefe liefert zeitweise keine gültigen Werte, Kabel prüfen.', interval '9 days'),
		('Baumscheibe gemulcht und Gießrand erneuert.', interval '30 days')
	) as n (note, age)
where t.site = 'Lindenallee' and t.tree_number = '2';


drop table demo_trees;
drop table demo_sites;
