-- Initial schema for NEWS FLOW.
--
-- Tables, constraints and indexes for the soil moisture overview (/overview),
-- the tree dashboard (/dashboard) and the login flow. Views are created in
-- 00000000000001_views.sql, row level security in 00000000000002_rls.sql.
--
-- The tables ship empty, with one exception: the four application roles are
-- inserted at the end of this file. lib/utils/route-access.ts matches them by
-- name, so they belong to the schema rather than to the data.


-- ---------------------------------------------------------------------------
-- 1. Users and roles
-- ---------------------------------------------------------------------------

create table public.roles (
	id uuid primary key default gen_random_uuid(),
	role_name text not null unique
);

comment on table public.roles is
	'Application roles. The names are matched in lib/utils/route-access.ts and in the RLS helper functions.';

-- One profile row per Supabase auth user. The id is the auth user id, so a
-- profile cannot exist without its login, and deleting the login removes it.
create table public.users (
	id uuid primary key references auth.users (id) on delete cascade,
	email text not null,
	first_name text,
	last_name text,
	role_id uuid not null references public.roles (id),
	created_at timestamptz not null default now()
);

comment on table public.users is
	'Application profile of a Supabase auth user. A login without a row here is sent to /no-role.';
comment on column public.users.role_id is
	'Decides which routes the user may open and which rows RLS lets them read.';


-- ---------------------------------------------------------------------------
-- 2. Trees and irrigation areas
-- ---------------------------------------------------------------------------

create table public.irrigation_areas (
	id uuid primary key default gen_random_uuid(),
	area_name text,
	is_active boolean not null default true
);

comment on table public.irrigation_areas is
	'Areas that group trees for irrigation planning.';

create table public.trees (
	id uuid primary key default gen_random_uuid(),
	tree_number text,
	site text,
	district text,
	type_species text,
	northing double precision,
	easting double precision,
	irrigation_area_id uuid references public.irrigation_areas (id) on delete set null,
	planting_year integer,
	is_archived boolean not null default false,
	archived_at timestamptz,
	archived_by uuid references public.users (id) on delete set null,
	archive_reason text,
	recently_edited_at timestamptz,
	recently_edited_by uuid references public.users (id) on delete set null,
	created_at timestamptz not null default now()
);

comment on table public.trees is
	'Tree register. Archived trees stay in the table and in the views; filter on is_archived where needed.';
comment on column public.trees.tree_number is
	'Tree number as used by the owning organisation, unique only within a site.';
comment on column public.trees.site is
	'Street or park the tree stands in. Shown as "Ort" in the UI.';
comment on column public.trees.type_species is
	'Genus and species of the tree.';
comment on column public.trees.northing is
	'Northing in UTM zone 32N (ETRS89), converted to WGS84 for the map by lib/utils/coordinates.ts.';
comment on column public.trees.easting is
	'Easting in UTM zone 32N (ETRS89), converted to WGS84 for the map by lib/utils/coordinates.ts.';
comment on column public.trees.planting_year is
	'Year the tree was planted at its site. The views derive tree_site_age from it.';

create index trees_site_idx on public.trees (site);
create index trees_irrigation_area_id_idx on public.trees (irrigation_area_id);


-- ---------------------------------------------------------------------------
-- 3. Sensors and readings
-- ---------------------------------------------------------------------------

create table public.sensors (
	id text primary key,
	name text,
	tree_id uuid references public.trees (id) on delete set null,
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	device_id text,
	source text,
	sensor_type text,
	first_seen_at timestamptz,
	recently_seen_at timestamptz,
	latitude double precision,
	longitude double precision,
	notes text,
	match_status text,
	matched_at timestamptz,
	matched_by uuid references public.users (id) on delete set null,
	matched_tree_number text,
	matched_site text
);

comment on table public.sensors is
	'Soil moisture sensors and the tree each one is installed at.';
comment on column public.sensors.id is
	'Sensor identifier as delivered by the data source; readings reference it.';
comment on column public.sensors.is_active is
	'Inactive sensors are hidden from the overview map.';
comment on column public.sensors.device_id is
	'Written by data ingestion, which is not part of this repository. Kept so ingestion can be added without a schema change.';
comment on column public.sensors.match_status is
	'State of matching the sensor to a tree. Written by sensor administration, which is not part of this repository.';

create index sensors_tree_id_idx on public.sensors (tree_id);

create table public.sensor_data_soil_moisture (
	id uuid primary key default gen_random_uuid(),
	sensor_id text not null references public.sensors (id),
	measured_at timestamptz not null,
	kpa_ch1 double precision,
	kpa_ch2 double precision,
	kpa_ch3 double precision,
	kpa_ch4 double precision,
	resistance_ch1 double precision,
	resistance_ch2 double precision,
	resistance_ch3 double precision,
	resistance_ch4 double precision
);

comment on table public.sensor_data_soil_moisture is
	'Soil moisture readings, one row per sensor and measurement time.';
comment on column public.sensor_data_soil_moisture.kpa_ch1 is
	'Soil water tension in kPa, channel 1. Channels 1 to 3 are the 30, 60 and 90 cm depths compared against irrigation_targets_by_age.';

-- Serves the per-sensor latest and earliest lookups in the views and every
-- time range query on the dashboard.
create index sensor_data_soil_moisture_sensor_id_measured_at_idx
	on public.sensor_data_soil_moisture (sensor_id, measured_at desc);


-- ---------------------------------------------------------------------------
-- 4. Irrigation targets
-- ---------------------------------------------------------------------------

create table public.irrigation_targets_by_age (
	tree_site_age integer primary key,
	target_max_30cm double precision,
	target_max_60cm double precision,
	target_max_90cm double precision,
	irrigation_litres double precision
);

comment on table public.irrigation_targets_by_age is
	'Target soil water tension per depth and irrigation amount, keyed on the years a tree has stood at its site.';
comment on column public.irrigation_targets_by_age.target_max_30cm is
	'Highest acceptable soil water tension in kPa at 30 cm depth.';
comment on column public.irrigation_targets_by_age.irrigation_litres is
	'Litres of water per irrigation for a tree of this age.';


-- ---------------------------------------------------------------------------
-- 5. Tree notes
-- ---------------------------------------------------------------------------

create table public.tree_notes (
	id uuid primary key default gen_random_uuid(),
	tree_id uuid not null references public.trees (id) on delete cascade,
	user_id uuid not null references public.users (id),
	note text not null,
	created_at timestamptz not null default now()
);

comment on table public.tree_notes is
	'Free-text notes on a tree, written from the dashboard.';

create index tree_notes_tree_id_idx on public.tree_notes (tree_id);


-- ---------------------------------------------------------------------------
-- 6. Application roles
--
-- Names stay German: they are shown in the UI and matched by name in
-- lib/utils/route-access.ts. The gardener role has no route in this build yet,
-- but it is part of the application's role model.
-- ---------------------------------------------------------------------------

insert into public.roles (role_name) values
	('Super-Administrator'),
	('Administrator'),
	('Sachbearbeiter:in'),
	('Gärtner:in');
