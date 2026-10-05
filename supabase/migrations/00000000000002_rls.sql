-- Row level security for NEWS FLOW.
--
-- The application reads every table with the user-scoped Supabase client, so
-- the policies in this file are the access boundary. There is no service role
-- in the application code.
--
-- Rules in short:
--   - anon (requests without a session) gets no table access at all.
--   - roles is readable by every signed-in user, because the middleware looks
--     up the caller's role on every request.
--   - users: each user reads their own row; planning roles read all rows, which
--     the dashboard needs to show the author of a tree note.
--   - Trees, sensors, readings, irrigation areas and targets: read-only for
--     planning roles. Nothing in the application writes them.
--   - tree_notes: planning roles read all notes, add notes in their own name and
--     delete only their own notes.
--
-- A table with RLS on and no matching policy returns zero rows rather than an
-- error. A missing policy therefore shows up as an empty list in the UI.


-- ---------------------------------------------------------------------------
-- 1. No access without a session
--
-- Supabase grants table privileges to anon by default. Login and password
-- reset use the auth endpoints, not tables, so nothing needs them. The default
-- privileges line keeps tables created later by the same role closed as well.
-- ---------------------------------------------------------------------------

revoke all privileges on all tables in schema public from anon;

alter default privileges in schema public revoke all on tables from anon;


-- ---------------------------------------------------------------------------
-- 2. Role helpers
--
-- current_user_role is SECURITY DEFINER so policies on users can call it
-- without recursing into themselves: it runs as its owner, so RLS is not
-- evaluated again inside it.
--
-- search_path is pinned to the empty string and every table is written
-- schema-qualified, so a caller cannot shadow public and influence what runs
-- with the owner's rights.
--
-- STABLE lets Postgres evaluate the helpers once per statement when a policy
-- wraps the call in a sub-select, instead of once per row.
-- ---------------------------------------------------------------------------

create function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
	select r.role_name
	from public.users u
	join public.roles r on r.id = u.role_id
	where u.id = auth.uid()
$$;

comment on function public.current_user_role() is
	'Role name of the calling user, or null without a session or profile row. SECURITY DEFINER so policies on users can call it without recursing.';

create function public.is_app_planner()
returns boolean
language sql
stable
set search_path = ''
as $$
	select coalesce(
		public.current_user_role() in (
			'Sachbearbeiter:in',
			'Administrator',
			'Super-Administrator'
		),
		false
	)
$$;

comment on function public.is_app_planner() is
	'True for the roles that may open /overview and /dashboard. Mirrors PLANNING_ROLES in lib/utils/route-access.ts.';

-- Functions are executable by PUBLIC on creation, anon included. Only signed-in
-- users evaluate these policies.
revoke all on function public.current_user_role() from public;
revoke all on function public.is_app_planner() from public;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_app_planner() to authenticated;


-- ---------------------------------------------------------------------------
-- 3. Users and roles
--
-- No write policy on either table: profiles and role assignments are managed
-- outside the application (see docs/setup.md). A write policy on users would
-- let a user change their own role_id.
-- ---------------------------------------------------------------------------

alter table public.roles enable row level security;

create policy roles_select_authenticated
	on public.roles
	for select
	to authenticated
	using (true);

alter table public.users enable row level security;

create policy users_select_own_or_planner
	on public.users
	for select
	to authenticated
	using (
		id = (select auth.uid())
		or (select public.is_app_planner())
	);


-- ---------------------------------------------------------------------------
-- 4. Read-only data
--
-- The views read these tables as the caller (security_invoker), so the same
-- policies decide what the views return. Writes come from data ingestion or
-- administration, neither of which is part of this repository; without a
-- write policy, signed-in users cannot change these rows.
-- ---------------------------------------------------------------------------

alter table public.irrigation_areas enable row level security;

create policy irrigation_areas_select_planner
	on public.irrigation_areas
	for select
	to authenticated
	using ((select public.is_app_planner()));

alter table public.trees enable row level security;

create policy trees_select_planner
	on public.trees
	for select
	to authenticated
	using ((select public.is_app_planner()));

alter table public.sensors enable row level security;

create policy sensors_select_planner
	on public.sensors
	for select
	to authenticated
	using ((select public.is_app_planner()));

alter table public.sensor_data_soil_moisture enable row level security;

create policy sensor_data_soil_moisture_select_planner
	on public.sensor_data_soil_moisture
	for select
	to authenticated
	using ((select public.is_app_planner()));

alter table public.irrigation_targets_by_age enable row level security;

create policy irrigation_targets_by_age_select_planner
	on public.irrigation_targets_by_age
	for select
	to authenticated
	using ((select public.is_app_planner()));


-- ---------------------------------------------------------------------------
-- 5. Tree notes
--
-- The only table the application writes. A note is always created in the
-- caller's own name, and only its author may delete it. Notes are not edited,
-- so there is no update policy.
-- ---------------------------------------------------------------------------

alter table public.tree_notes enable row level security;

create policy tree_notes_select_planner
	on public.tree_notes
	for select
	to authenticated
	using ((select public.is_app_planner()));

create policy tree_notes_insert_own_planner
	on public.tree_notes
	for insert
	to authenticated
	with check (
		(select public.is_app_planner())
		and user_id = (select auth.uid())
	);

create policy tree_notes_delete_own
	on public.tree_notes
	for delete
	to authenticated
	using (
		(select public.is_app_planner())
		and user_id = (select auth.uid())
	);
