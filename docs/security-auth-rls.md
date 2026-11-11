# Authentication, roles and row level security

This document explains who may sign in, who may open which page, and who may
read or write which rows. The short version: the middleware decides which
pages a user may open, and row level security (RLS) in the database decides
which rows they see. The database is the boundary that counts, because it
also applies to requests that bypass the application.

## Authentication

- **Sign-in** with email and password through Supabase Auth, implemented as
  the server action `pwdSignIn` in `app/auth/login/action.ts`. After sign-in,
  the user lands on the start page of their role (`getHomeRouteForRole` in
  `lib/utils/route-access.ts`).
- **No self-registration.** Logins are created by an administrator in
  Supabase Studio (see "Sign in" in the README). On a hosted project, also
  switch off "Allow new users to sign up"; otherwise anyone with the public
  key could create a login through the Auth API. RLS would still show such a
  login no data, because it has no profile row and therefore no role.
- **Password reset** in `app/auth/forgot-password/` and
  `app/auth/reset-password/`. Both pages only call auth endpoints
  (`resetPasswordForEmail`, `verifyOtp`, `updateUser`) and read no table, so
  they work without table privileges for anonymous visitors. The email
  template in `supabase/templates/recovery.html` links to the reset page with
  a `token_hash` that is only redeemed after a click, so link scanners in mail
  systems cannot use it up.
- **Callback** in `app/auth/callback/route.ts` exchanges an auth code for a
  session.

## Roles

The four roles live in the `roles` table and are assigned through
`users.role_id`:

| Role | Pages in this edition |
|---|---|
| `Super-Administrator` | `/overview`, `/dashboard` |
| `Administrator` | `/overview`, `/dashboard` |
| `Sachbearbeiter:in` | `/overview`, `/dashboard` |
| `Gärtner:in` | none yet; sent to `/no-role` |

The gardener role stays in the role model because its pages (irrigation
rounds in the field) belong to the full application and may be added later.

`lib/utils/route-access.ts` is the single definition of roles and route
rules. The middleware, the route gate in the layout and the navigation all
read it. `PLANNING_ROLES` there and `is_app_planner()` in the database (see
below) describe the same group and have to be changed together.

## Middleware

The page-level check runs in `lib/supabase/middleware.ts` before a page
renders. See "Request flow" in [architecture.md](architecture.md) for the
order of the steps. The rules:

- Without a session, only `/auth/…`, `/impressum` and `/datenschutz` are
  reachable (`isAnonymousRoute`). The legal pages have to be available
  without a login.
- `/hilfe`, `/error` and `/no-role` are open to every role, but still need a
  session (`isPublicRoute`).
- Every other route has to be listed in `ROUTE_ACCESS_RULES`. A route that is
  not listed is denied for every role, so a new page cannot ship without a
  rule by accident.
- If the role lookup fails, the request is refused and sent to `/error`
  ("fail closed"). Letting it through would render the page and send its
  data to the browser, and a lookup can fail permanently, for example
  because of a broken policy on `users`.

### What the middleware does not cover

The middleware only looks at the path. A server action is called through the
path of the page that is currently open, so the middleware lets it through
regardless of which action runs. Every export of a `'use server'` file is a
public HTTP endpoint.

In this edition that is safe, because every server action uses the user's
session and therefore runs under RLS: an action called without the right role
reads no rows and writes none. If you ever add an action that uses the
service role key (which bypasses RLS), that action has to check the caller's
role itself.

## Row level security

All policies are in `supabase/migrations/00000000000002_rls.sql`. Three
Postgres roles are involved:

| Postgres role | Meaning |
|---|---|
| `anon` | No session. Has **no** table privileges at all, including tables created later (default privileges are revoked too). Reaches only the auth endpoints. |
| `authenticated` | Signed in. Every access goes through the policies below. |
| `service_role` | Bypasses RLS. Not used anywhere in this application. |

A table with RLS switched on and no matching policy returns zero rows, not an
error. A missing policy therefore shows up as an empty list in the UI.

### Helper functions

The policies do not name roles directly; they call two functions:

| Function | Returns |
|---|---|
| `current_user_role()` | The role name of the caller, or `null` without a session or profile row |
| `is_app_planner()` | `true` for `Sachbearbeiter:in`, `Administrator` and `Super-Administrator`; mirrors `PLANNING_ROLES` |

`current_user_role()` is `SECURITY DEFINER`, so the policy on `users` can call
it without recursing into itself. Both functions are `STABLE`, pin
`search_path` to the empty string and use schema-qualified table names, so a
caller cannot shadow `public`. `is_app_planner()` wraps its check in
`coalesce(…, false)`: for a user without a role, `null in (…)` would be
`null`, not `false`.

### Access rules

| Table | Read | Write |
|---|---|---|
| `roles` | every signed-in user (the middleware needs it on every request) | none |
| `users` | own row; planning roles read all rows (the dashboard shows note authors) | none |
| `trees`, `irrigation_areas`, `sensors`, `sensor_data_soil_moisture`, `irrigation_targets_by_age` | planning roles | none |
| `tree_notes` | planning roles | planning roles insert notes in their own name and delete only their own |

`users` has no write policy on purpose: a user who could update their own row
could raise their own `role_id`. Profiles are managed outside the
application. The data tables have no write policy because nothing in this
application writes them; data ingestion and administration are not part of
this repository.

### Views

Both views are created with `security_invoker = on`. Without it, a view runs
with the rights of its owner, which bypasses RLS on the underlying tables and
exposes every row to anyone allowed to select from the view. With it, the
caller's policies apply.

The setting is not inherited: if a view reads another view, both need it.
Keep it on every view you add.

### Adding a table

1. Create the table in a new migration and switch on RLS
   (`alter table … enable row level security`).
2. Add a `select` policy for the roles that need it, usually
   `(select public.is_app_planner())`. Wrapping the call in a sub-select lets
   Postgres evaluate it once per statement instead of once per row.
3. Add write policies only for what the application actually writes, and
   check ownership in `with check` where rows belong to a user.
4. Test with a login of each role. A missing policy does not raise an error;
   the page simply shows no data.

## Limits

- **RLS works on rows, not on columns.** A role that may read a table reads
  all of its columns. Keep this in mind before adding columns with sensitive
  data to a table that planning roles can read.
- **Logging.** Errors are written to the server console with the function
  name (`Fehler in <functionName>: …`). There is no central logging or
  tracing in this repository.
