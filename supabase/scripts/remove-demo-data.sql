-- Removes the demo data that supabase/seed.sql inserts, and nothing else.
--
-- Run it in the SQL editor of Supabase Studio (local or hosted) when you want
-- to start with your own data. Everything runs in one transaction: either all
-- demo rows are removed or none.
--
-- Demo rows are found by their marking, not by names:
--   - login, irrigation areas and trees: ids starting with d0000000-0000-4000-
--   - sensors and their readings: sensor ids starting with DEMO-
--   - irrigation targets: only rows that still hold the exact demo values, so
--     targets you have changed or added yourself stay.
--
-- Your own rows keep working: a tree of yours that points to a demo irrigation
-- area loses only that link (on delete set null).

begin;

delete from public.sensor_data_soil_moisture
where sensor_id like 'DEMO-%';

-- Notes on demo trees, and notes the demo login wrote on other trees. The
-- latter would otherwise block deleting the demo login.
delete from public.tree_notes
where tree_id::text like 'd0000000-0000-4000-%'
	or user_id = 'd0000000-0000-4000-8000-000000000001';

delete from public.sensors
where id like 'DEMO-%';

delete from public.trees
where id::text like 'd0000000-0000-4000-%';

delete from public.irrigation_areas
where id::text like 'd0000000-0000-4000-%';

-- The values must match section 2 of supabase/seed.sql.
delete from public.irrigation_targets_by_age t
using (
	select
		age,
		case when age <= 3 then 60 when age <= 6 then 80 else 100 end as target_max_30cm,
		case when age <= 3 then 80 when age <= 6 then 100 else 120 end as target_max_60cm,
		case when age <= 3 then 100 when age <= 6 then 120 else 150 end as target_max_90cm,
		case when age <= 3 then 100 when age <= 6 then 150 else 200 end as irrigation_litres
	from generate_series(1, 10) as age
) demo
where t.tree_site_age = demo.age
	and t.target_max_30cm = demo.target_max_30cm
	and t.target_max_60cm = demo.target_max_60cm
	and t.target_max_90cm = demo.target_max_90cm
	and t.irrigation_litres = demo.irrigation_litres;

-- Deleting the auth user also deletes its identity and its public.users
-- profile (on delete cascade).
delete from auth.users
where id = 'd0000000-0000-4000-8000-000000000001';

commit;
