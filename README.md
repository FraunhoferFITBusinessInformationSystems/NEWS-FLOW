# NEWS FLOW

NEWS FLOW helps municipal green space departments decide which street trees
need water. Soil moisture sensors measure the soil water tension at 30, 60 and
90 cm depth; the application compares these readings with target values for
each tree and shows the result on a map and in detailed charts.

This repository contains the open-source edition of NEWS FLOW, developed by
[Fraunhofer FIT](https://www.fit.fraunhofer.de/).

> **Status: work in progress.** The code is being ported from the original
> project to a new, English database schema. Until that port is finished, the
> login works but every signed-in page ends on the error page, because the
> application code still queries the old table names. The database schema
> itself is complete and can already be set up locally.

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
views, row level security policies and the four application roles. The tables
start empty.

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

### 4. Create the first user

Logins are created by an administrator; there is no self-registration.

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
| `npx supabase db reset` | Rebuilds the local database from the migrations (deletes all data) |
| `npx supabase stop` | Stops the local Supabase stack |

Emails sent by the local stack (for example password reset links) are not
delivered; they appear in the mail catcher at `http://127.0.0.1:54324`.

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
