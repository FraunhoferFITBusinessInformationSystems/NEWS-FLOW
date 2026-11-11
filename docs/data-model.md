# Data model

This document describes the database behind NEWS FLOW: what each table and
view holds, how they connect, and the assumptions that are easy to miss when
you load your own data. The schema itself lives in `supabase/migrations/`:

| File | Content |
|---|---|
| `00000000000000_initial_schema.sql` | Tables, indexes and the four application roles |
| `00000000000001_views.sql` | The two views the application reads |
| `00000000000002_rls.sql` | Row level security policies |

Every table and most columns carry a `comment`, so Supabase Studio shows the
same explanations as this document.

## Overview

```
auth.users ──1:1── users ──n:1── roles
                     │
                     └──1:n── tree_notes ──n:1──┐
                                                │
irrigation_areas ──1:n── trees ─────────────────┘
                           │
                           └──1:n── sensors ──1:n── sensor_data_soil_moisture

irrigation_targets_by_age   (matched by tree_site_age, no foreign key)
```

A tree can have several sensors, but in practice it has one. A sensor without
a tree is allowed; its readings are stored but do not appear in the
application, because both pages select trees by site.

## Tables

### `roles` and `users`

`roles` holds the four application roles: `Super-Administrator`,
`Administrator`, `Sachbearbeiter:in` and `Gärtner:in`. The names stay German
because they are shown in the UI and matched by name in
`lib/utils/route-access.ts` and in the RLS helper functions. They are inserted
by the initial migration, not by the demo data.

`users` is the application profile of a Supabase login. Its `id` is the id of
the row in `auth.users`, so a profile cannot exist without its login, and
deleting the login deletes the profile. A login without a profile row is sent
to `/no-role`. `role_id` decides which pages a user may open and which rows
RLS returns. The application never writes this table; profiles are created by
an administrator (see "Sign in" in the README).

### `trees` and `irrigation_areas`

`trees` is the tree register. The columns the application uses:

| Column | Meaning |
|---|---|
| `tree_number` | Number used by the owning organisation; unique only within a site |
| `site` | Street or park the tree stands in, shown as "Objekt" in the UI |
| `district` | District, used as a filter on the overview |
| `type_species` | Genus and species |
| `easting`, `northing` | Position in UTM zone 32N, see [Coordinates](#coordinates) |
| `planting_year` | Year the tree was planted at its site, see [Site age and targets](#site-age-and-targets) |
| `irrigation_area_id` | Optional irrigation area, used as a filter on the overview |
| `is_archived` | Archived trees stay in the table and in the views |

The archive and edit columns (`archived_at`, `recently_edited_by` and so on)
are not written by this edition; they are kept so tree maintenance can be
added without a schema change.

`irrigation_areas` groups trees for irrigation planning. The overview shows
the area name and filters by it.

### `sensors` and `sensor_data_soil_moisture`

`sensors.id` is the identifier delivered by the data source, so it is `text`,
not a generated uuid. `tree_id` links the sensor to the tree it is installed
at. `is_active = false` hides the sensor from the overview map; the table and
the dashboard still list it.

The columns `device_id`, `source`, `sensor_type`, `first_seen_at`,
`recently_seen_at`, `latitude`, `longitude`, `notes` and the `match*` columns
are written by data ingestion and sensor administration in the full
application. Neither is part of this repository; the columns are kept so they
can be added without a schema change.

`sensor_data_soil_moisture` holds one row per sensor and measurement time:

| Column | Meaning |
|---|---|
| `measured_at` | Time of the measurement |
| `kpa_ch1`, `kpa_ch2`, `kpa_ch3` | Soil water tension in kPa at 30, 60 and 90 cm depth |
| `resistance_ch1` … `resistance_ch3` | Raw resistance of the same channels, used for validation |
| `kpa_ch4`, `resistance_ch4` | Fourth channel; stored but not used by the application |

Higher soil water tension means drier soil. The index on
`(sensor_id, measured_at desc)` serves both views and every time range query.

This repository contains no data ingestion. Readings have to reach this table
by other means, for example a scheduled import from the sensor platform.

### `irrigation_targets_by_age`

One row per site age (`tree_site_age`, the primary key) with the highest
acceptable soil water tension per depth (`target_max_30cm`, `target_max_60cm`,
`target_max_90cm`) and the water amount per irrigation (`irrigation_litres`,
not used by the application yet). See
[Site age and targets](#site-age-and-targets).

### `tree_notes`

Free-text notes on a tree, written from the dashboard. `user_id` is the
author. RLS lets planning roles read all notes, add notes only in their own
name and delete only their own notes. `user_id` has no `on delete` rule, so a
login that has written notes cannot be deleted until its notes are removed.

## Views

Both views are created with `security_invoker = on`. Without it, a view runs
with the rights of its owner and bypasses row level security on the
underlying tables. With it, the policies of the calling user apply, so RLS on
the tables stays the only access boundary. Keep this option on any view you
add.

### `v_soil_moisture_readings_mapped`

One row per reading, joined to its sensor, tree and irrigation area. The
dashboard reads it for the chart and the comparison years, filtered by site,
tree numbers and time range.

### `v_soil_moisture_latest_earliest_per_sensor`

One row per sensor that has at least one reading: the values of its latest
reading, the values and time of its earliest reading, and the tree and
irrigation area attributes. The overview map and table read it, and the
dashboard uses it for the site and tree lists.

`recently_irrigated_at` is always `null` in this edition. Irrigation history
comes from the irrigation round tables of the full application, which are not
part of this schema; the column keeps the view's shape stable for when they
are added.

## Coordinates

Trees are stored in **UTM zone 32N** (`easting`, `northing`, in metres), the
system German surveying offices use for most of western and central Germany.
`lib/utils/coordinates.ts` converts them to WGS84 latitude and longitude for
the map with `proj4`. Coordinates outside the technical UTM zone 32N range are
skipped, so such trees do not appear on the map.

If your tree register uses a different system, for example UTM zone 33N in
eastern Germany or plain latitude and longitude, change the projection in
`lib/utils/coordinates.ts`, or convert the coordinates before loading them.
The map's default centre (Frankfurt am Main) is set in
`lib/leaflet/map-config.ts` as `DEFAULT_MAP_CENTER`.

## Site age and targets

The target values depend on how long a tree has stood at its site. The views
compute this as `tree_site_age = current year − planting_year`. The value
changes on 1 January without any update to the data, and it is `null` when
`planting_year` is empty.

The application looks up the targets by exact match on `tree_site_age`. A
tree whose age has no row in `irrigation_targets_by_age`, or whose
`planting_year` is empty, has no targets: the overview shows it with a blue
pin and the dashboard shows no target lines. Make sure the table covers every
age that occurs in your data.

## Data quality rules

These rules are applied in the application, not in the database:

- **Invalid values.** A kPa value counts as invalid when the resistance of the
  same channel is above 1,000,000 Ω
  (`lib/utils/sensor-data-validation.ts`). Invalid values are treated as
  missing. The dashboard also leaves out readings where one of the three kPa
  values is `null`.
- **Stale sensors.** A sensor whose latest reading is older than two days is
  shown in grey on the overview, regardless of its values
  (`lib/utils/watering-need-category.ts`).
- **Colour per tree.** The overview colours a tree by the worst of its three
  depths compared with the targets. The thresholds are described on the help
  page (`/hilfe`) and implemented in
  `components/data-display/status-coloring.ts`.

## Demo data

`supabase/seed.sql` fills every table with fictional data for local
development. The README section "Demo data" lists its special cases and how to
remove it.
