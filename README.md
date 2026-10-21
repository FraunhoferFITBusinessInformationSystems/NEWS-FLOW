# NEWS FLOW

NEWS FLOW helps municipal green space departments decide which street trees
need water. Soil moisture sensors measure the soil water tension at 30, 60 and
90 cm depth; the application compares these readings with target values for
each tree and shows the result on a map and in detailed charts.

This repository contains the open-source edition of NEWS FLOW, developed by
[Fraunhofer FIT](https://www.fit.fraunhofer.de/).

## Features

- **Overview** (`/overview`): live map and table of all trees with sensors,
  coloured by irrigation need.
- **Dashboard** (`/dashboard`): soil moisture history per tree, comparison
  with previous years, target values and tree notes.
- **Login** with email and password, password reset, and role-based access.

Not included in this edition: irrigation round planning and execution, tree
data maintenance and import, sensor administration, sensor data ingestion
(MQTT), weather forecasts and user administration.

## Tech stack

[Next.js](https://nextjs.org/) 15 (App Router) · TypeScript ·
[Supabase](https://supabase.com/) (PostgreSQL, Auth, row level security) ·
[Tailwind CSS](https://tailwindcss.com/) 4 · [shadcn/ui](https://ui.shadcn.com/) ·
[Leaflet](https://leafletjs.com/) · [Recharts](https://recharts.org/) ·
[Biome](https://biomejs.dev/) · [Lefthook](https://lefthook.dev/)

## Prerequisites

- [Node.js](https://nodejs.org/) **24** (see `.nvmrc`) and npm
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), running.
  The local Supabase stack runs in Docker containers.

The Supabase CLI is installed with the project dependencies; there is nothing
to install globally.

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/FraunhoferFITBusinessInformationSystems/NEWS-FLOW.git
cd NEWS-FLOW
npm install
```

`npm install` also installs the Git hooks (see [Git hooks](#git-hooks)).

### 2. Start the local database

```bash
npx supabase start
```

The first start downloads the Docker images and takes a few minutes. It then
creates the database from the migrations in `supabase/migrations/`: tables,
views, row level security policies and the four application roles. It then
loads fictional demo data from `supabase/seed.sql` (see [Demo data](#demo-data)).

If your local database was created before the demo data existed, load it with
`npx supabase db reset` (this deletes all other data).

At the end, the command prints the local URLs and keys. Show them again at any
time with `npx supabase status`.

### 3. Configure the environment

Copy `.env.example` to `.env.local` and fill in the values:

| Variable | Value for local development |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | "API URL" from `npx supabase status`, usually `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "anon key" or "Publishable key" from `npx supabase status` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_MAINTENANCE_MODE` | optional, `false` |

**The first three variables are required. Without them the application does
not start.** Never put the service role key into `.env.local`; the application
does not use it.

### 4. Sign in

The demo data includes a login with the role `Sachbearbeiter:in`:

| Email | Password |
|---|---|
| `demo@example.com` | `demo1234` |

To create a login of your own, follow the steps below. Logins are created by
an administrator; there is no self-registration.

1. Open Supabase Studio at `http://127.0.0.1:54323`.
2. Go to **Authentication → Users → Add user → Create new user**, enter an
   email and a password (at least 6 characters) and tick **Auto Confirm User**.
3. In the **SQL Editor**, link the login to a role:

   ```sql
   insert into public.users (id, email, first_name, last_name, role_id)
   select u.id, u.email, 'Max', 'Mustermann', r.id
   from auth.users u, public.roles r
   where u.email = '<your email>' and r.role_name = 'Sachbearbeiter:in';
   ```

The roles are `Super-Administrator`, `Administrator`, `Sachbearbeiter:in` and
`Gärtner:in`. The first three may open the overview and the dashboard. A login
without a row in `public.users` is sent to `/no-role`.

### 5. Run the application

```bash
npm run dev
```

Open `http://localhost:3000` and sign in.

If file changes are not picked up (for example in containers, on network
drives or in some VM setups), use `npm run dev:polling` instead.

## Demo data

`supabase/seed.sql` fills the local database with fictional data, so every
page can be tried out right after the setup:

- a login `demo@example.com` / `demo1234` with the role `Sachbearbeiter:in`
- four sites (Lindenallee, Am Stadtpark, Kastanienweg, Platanenring) with five
  trees each; trees 1 to 4 have a sensor, tree 5 has none and therefore does
  not appear on the overview or the dashboard
- two readings per day on the 30, 60 and 90 cm depths, from 1 January two
  years ago until the day of the reset, with seasonal drying cycles
- irrigation targets for site ages 1 to 10
- two notes on Lindenallee tree 2

The dates are relative to the day of the reset, so the latest readings are
always current. Run `npx supabase db reset` to bring them up to date again.

### Special cases

Some sensors deliberately carry incomplete or unusual data, so the filters and
UI states can be tested. Sensor ids follow the pattern `DEMO-<site>-<tree>`.

| Sensor | Site and tree | Data | Where to see it |
|---|---|---|---|
| `DEMO-LA-02` | Lindenallee 2 | 60 cm channel invalid (resistance above 1,000,000 Ω) from 1 to 20 July of every year and from 14 to 10 days ago | Dashboard: gaps in the chart and the gap hint |
| `DEMO-SP-01` | Am Stadtpark 1 | 30 cm channel invalid for the last 3 days | Overview: pin colour derived from 60 and 90 cm only |
| `DEMO-SP-03` | Am Stadtpark 3 | No readings for the last 5 days | Overview: grey pin (reading older than 2 days) |
| `DEMO-KW-02` | Kastanienweg 2 | About 5 % of the readings lack the 90 cm value (not in the last 7 days) | Dashboard: these readings are left out |
| `DEMO-KW-04` | Kastanienweg 4 | Sensor switched off (`is_active = false`) | Overview: missing on the live map, listed in the table |
| `DEMO-PR-04` | Platanenring 4 | Site age 15, no matching irrigation target | Overview: blue pin (no irrigation strategy) |

### Removing the demo data

To start with your own data, run `supabase/scripts/remove-demo-data.sql` in
the SQL editor of Supabase Studio. It deletes the demo rows only: they are
recognised by their ids (prefix `d0000000-0000-4000-` for the login,
irrigation areas and trees, `DEMO-` for sensors), so your own rows stay.
Irrigation targets are removed only while they still hold the demo values.

`npx supabase db reset` loads the demo data again. To stop that, set
`enabled = false` under `[db.seed]` in `supabase/config.toml`.

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run dev:polling` | Same, with polling file watching |
| `npm run build` / `npm start` | Production build / serves the build |
| `npm run lint` | Checks formatting, lint rules and import order with Biome |
| `npm run format` | Formats all files with Biome |
| `npm run typecheck` | Checks the TypeScript types |
| `npm run db:types` | Generates `lib/supabase/supabase.ts` from the local database |
| `npx supabase status` | Shows the local URLs and keys |
| `npx supabase db reset` | Rebuilds the local database from the migrations and reloads the [demo data](#demo-data) (deletes all other data) |
| `npx supabase stop` | Stops the local Supabase stack |

Emails sent by the local stack (for example password reset links) are not
delivered; they appear in the mail catcher at `http://127.0.0.1:54324`.

## Using a hosted Supabase project

`supabase/config.toml` only applies to the local stack. When you run NEWS FLOW
against a project on [supabase.com](https://supabase.com/), raise the row
limit there as well: in the Supabase dashboard, open the project's Data API
settings and set **Max rows** to `10000` (the default is `1000`, the local
stack uses `10000`).

The dashboard loads all readings of the selected period in one request.
With the default of 1000 rows, longer periods or several trees at once lose
their oldest readings without a warning, so the chart starts later than the
selected start date.

## Project structure

```
app/                 Routes (Next.js App Router)
  auth/              Login, callback, forgot and reset password
  overview/          Map and table
  dashboard/         Charts and details per tree
components/
  ui/                shadcn/ui primitives
  layout/            Header, navigation, footer
  features/          Larger reusable components (map, date picker, ...)
lib/
  supabase/          Supabase clients, middleware helper, generated types
  utils/             Shared helper functions
  types/             Types shared across files
  validations/       Zod schemas
providers/           React context providers
supabase/
  migrations/        Database schema, views and row level security
  scripts/           SQL scripts run by hand (removing the demo data)
  seed.sql           Fictional demo data for local development
  config.toml        Local Supabase configuration
```

Each route follows the same split: `page.tsx` as the entry point, an optional
client component for interactive logic, `action.ts` with the route's server
actions, and a `components/` folder for components used only by that route.
Code used by more than one route lives in the shared folders.

## Contributing

Coding conventions, naming rules and the contribution workflow are described in
[CONTRIBUTING.md](CONTRIBUTING.md). Please read it before you start developing.

## Git hooks

[Lefthook](https://lefthook.dev/) runs Biome on the staged files before every
commit. The commit is rejected if Biome reports a problem; nothing is changed
automatically. Run `npm run format` (or fix the reported issue) and commit
again.

The hooks are installed by `npm install`. If they are missing, run
`npx lefthook install`.

## License

NEWS FLOW is licensed under the
[GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0-only).
