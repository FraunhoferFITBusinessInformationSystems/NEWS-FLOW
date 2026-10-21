# Architecture

This document explains how a request travels through NEWS FLOW: from the
middleware through the layout to the page and its data. For the tables and
views, see [data-model.md](data-model.md); for authentication and row level
security, see [security-auth-rls.md](security-auth-rls.md).

## Building blocks

| Part | File |
|---|---|
| Root layout (server component, `metadata` and `viewport`) | `app/layout.tsx` |
| Application frame (providers, header, main, footer, route gate) | `components/layout/app-layout.tsx` |
| Header and navigation | `components/layout/app-header.tsx`, `components/layout/mobile-nav.tsx` |
| Roles and route rules, the single source of truth | `lib/utils/route-access.ts` |
| Session and role on the client | `providers/UserRoleContext.tsx`, `lib/actions/auth.ts` |
| Role lookup shared by middleware and server actions | `lib/supabase/user-role.ts` |
| Supabase clients | `lib/supabase/server.ts` (server), `lib/supabase/client.ts` (browser) |
| Middleware | `middleware.ts`, `lib/supabase/middleware.ts` |

There is no service role client: every query runs with the signed-in user's
session, so row level security applies to all of them.

## Request flow

### 1. Middleware: session and role check

Every request except static assets passes through `middleware.ts`, which
calls `updateSession` in `lib/supabase/middleware.ts`:

1. It refreshes the Supabase session from the cookies.
2. **Session guard.** Without a session, only the login and password reset
   flow (`/auth/…`) and the legal pages (`/impressum`, `/datenschutz`) are
   reachable. Everything else redirects to `/auth/login`.
3. **Role check.** With a session, the user's role is looked up and checked
   against the rules in `lib/utils/route-access.ts`. A route the role may not
   open redirects to the role's start page. `/` has no page of its own and
   always redirects there as well.
4. If the role lookup fails (a database or policy error, not a missing role),
   the request is refused and sent to `/error`. A user without a role is not
   an error; they are sent to `/no-role`.

Because this check runs before the page renders, a server component never
loads data for a request it would refuse.

### 2. Root layout

`app/layout.tsx` is a server component. It renders `<html>` and `<body>`
once and unconditionally, sets the title and viewport through `metadata` and
`viewport`, and shows the maintenance notice instead of the application when
`NEXT_PUBLIC_MAINTENANCE_MODE` is `true`.

### 3. Application frame and role context

Everything interactive lives below the root layout in
`components/layout/app-layout.tsx`, a client component:

- `NuqsAdapter` for query state in the URL (used by the overview table).
- A Suspense boundary around `UserRoleProvider`. It sits inside `<body>`, so
  its fallback can only replace the content area, never the document.
- `UserRoleProvider` loads session and role in one call
  (`fetchAuthStateAction` in `lib/actions/auth.ts`) and reloads them after
  login, which redirects with `?refresh=true`.
- Header, `<main>` and footer. The navigation is filtered by role.
  `isAuthenticated` separates "not signed in" (login link, no navigation)
  from "signed in without a role" (logout button).

### 4. Route gate in the layout

The layout runs the same check as the middleware on the client
(`isRouteAllowedForRole`). While the role is loading, it shows a spinner
instead of the page, so a client page cannot fetch data before the check has
run. If the check fails, it shows `components/features/auth/access-denied.tsx`.

The middleware is the actual protection; the gate covers client-side
navigation and keeps the UI consistent. Pages contain no role logic of their
own.

### Adding a page

1. Create the route under `app/`.
2. Add it to `ROUTE_ACCESS_RULES` in `lib/utils/route-access.ts`. Routes that
   are not listed there are denied for every role.
3. Add a navigation entry in `components/layout/app-layout.tsx` if it should
   appear in the menu.
4. Make sure the RLS policies let the role read the data the page needs
   (see [security-auth-rls.md](security-auth-rls.md)).

## Data access

- **Server actions** in `app/**/action.ts` or `app/**/actions.ts` (route
  specific) and in `lib/actions/` (shared). They use the server client from
  `lib/supabase/server.ts`, which carries the user's session.
- **`/overview`** is a server component: `app/overview/page.tsx` loads the
  table data on the server and passes it to the client components.
- **`/dashboard`** is a client component (`app/dashboard/client.tsx`) that
  calls the server actions in `app/dashboard/action.ts` whenever the site,
  trees or period change.
- **Views.** Both pages read sensor data through the views described in
  [data-model.md](data-model.md), not through the tables directly.
- **Targets** come from `irrigation_targets_by_age` via
  `lib/actions/tree-target-values.ts`.

## UI

- shadcn/ui components in `components/ui/`, including the data table with
  sorting and filters kept in the URL (`components/ui/data-table/`).
- Maps use plain Leaflet through one shared container,
  `components/features/leafletMap/LeafletMap.tsx`. The map component is
  loaded with `next/dynamic` and `ssr: false`, because Leaflet needs the
  browser. Tile source, zoom limits and the default centre are set in
  `lib/leaflet/map-config.ts`.
- Charts use Recharts (`app/dashboard/components/LineChartComponent.tsx`).


