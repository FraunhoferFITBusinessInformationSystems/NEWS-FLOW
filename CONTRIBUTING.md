# Contributing to NEWS FLOW

This document describes how the
code is organised and which conventions apply. Please read it before you start
developing; the [README](README.md) explains how to set up the project locally.

## Workflow

1. Create a branch from `main` (or fork the repository if you do not have write
   access).
2. Keep each change small and focused on one topic. Avoid unrelated refactors
   in the same change.
3. Before committing, make sure the checks pass:

   ```bash
   npm run lint
   npm run typecheck
   ```

   The pre-commit hook runs Biome on the staged files automatically (see
   [Tooling](#tooling)).
4. Open a pull request against `main` and describe what changed and why.

### Commit messages

Commit messages follow the
[Conventional Commits](https://www.conventionalcommits.org/) format:
`<type>(<optional scope>): <summary>`, written in English and in the imperative
mood.

| Type | Use for |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `style` | Formatting only, no change in behaviour |
| `docs` | Documentation only |
| `chore` | Tooling, dependencies, configuration |

Examples: `feat(dashboard): add comparison year selection`,
`fix(db): restrict tree note deletion to the author`.

## Project structure

Each route in `app/` follows the same split:

| File or folder | Purpose |
|---|---|
| `page.tsx` | Entry point of the route (server component) |
| `client.tsx` | Optional client component with the interactive logic |
| `action.ts` | Server actions of the route, including its database queries |
| `components/` | Components used only by this route |

Code used by more than one route lives in the shared folders:
`components/` (with `components/ui/` for shadcn/ui primitives), `lib/utils/`,
`lib/types/`, `lib/validations/` and `providers/`. Route-specific code stays
inside its route.

Keep the server/client boundary explicit: server actions stay on the server,
and only components that need interactivity are marked `'use client'`.

## Language

- Code, comments, types and database names are written in **English**.
- Texts visible in the user interface (labels, messages, toasts) are written in
  **German**.
- Log messages use the German format described under
  [Error handling and logging](#error-handling-and-logging-in-get-functions);
  the function names in them stay English.

## Naming

| What | Style | Example |
|---|---|---|
| Files | kebab-case | `tree-target-values.ts` |
| Variables and functions | camelCase | `selectedTree`, `getTreeById` |
| Types, interfaces, classes, enums, components | PascalCase | `TreeNote`, `LineChartComponent` |

Use normal function declarations (`function foo() {}`) for named functions,
not arrow functions assigned to a constant (`const foo = () => {}`).

### `get` and `fetch` functions

- **`get` functions** read directly from the database and live in `action.ts`
  files. Name them by what they return:
  - `getAllTrees` returns all records of a type,
  - `getTreeById` returns one record by its primary key,
  - `getTreesBySite` returns records filtered by another attribute.
- **`fetch` functions** call one or more `get` functions, for example in a
  client component or in a server action that combines several queries.

### Error handling and logging in `get` functions

- Throw an error when a database call fails.
- Log errors as `Fehler in <functionName>: <errorMessage>`.
- Log success as `<functionName> erfolgreich`.
- Always include the function name, so a log line can be traced to its source.

## TypeScript

- Strict mode; do not use `any`. Prefer explicit types and types inferred from
  Zod schemas.
- Prefer `interface` over `type` where possible.
- Types used in more than one file belong in a dedicated file in `lib/types/`
  (for example `lib/types/tree.ts`).
- Database rows use snake_case column names. Where the application works with
  a camelCase interface, put a mapping function next to the interface that
  converts the raw row.
- Generated database types live in `lib/supabase/supabase.ts`. Do not edit
  this file by hand; regenerate it with `npm run db:types` after a schema
  change.

## UI

- Use [shadcn/ui](https://ui.shadcn.com/) components for UI primitives
  (buttons, inputs, selects, dialogs, …).
- Reuse the existing theme tokens, spacing, typography and component variants;
  avoid ad-hoc styles.
- Provide loading, error and empty states where data is loaded.
- Keep the UI accessible: labels linked to their fields, semantic HTML elements
  instead of `div` with a `role`, keyboard-friendly interactions.

## Forms and validation

Use [Zod](https://zod.dev/) for validation and
[react-hook-form](https://react-hook-form.com/) with `zodResolver` for forms.
Shared schemas live in `lib/validations/`.

## Database

- Every schema change is a new migration file in `supabase/migrations/`.
  Apply it locally with `npx supabase db reset`.
- The application reads all data with the signed-in user's session, so row
  level security is the access boundary. Every new table needs RLS enabled and
  policies in a migration; without a matching policy, a query returns no rows
  rather than an error.
- Create every view with `security_invoker = on`. Otherwise the view runs with
  its owner's rights and bypasses row level security.
- Add a `comment on` to every new table and to every column whose meaning is
  not obvious.

## Comments and documentation

- Write comments in plain English, without emojis.
- Explain *why* something is done, not what the next line does.
- Document exported functions, types and components with a short TSDoc block.
- A comment that describes a whole file is a TSDoc block tagged
  `@packageDocumentation`. It is the first comment in the file, above
  `'use client'` or `'use server'`.
- Documentation describes the current state of the code, not the history of
  how it got there.

## Tooling

- [Biome](https://biomejs.dev/) checks formatting, lint rules and import order:
  `npm run lint` checks, `npm run format` formats.
- [Lefthook](https://lefthook.dev/) runs Biome on the staged files before every
  commit. A commit with Biome findings is rejected; fix the findings and commit
  again. The hooks are installed by `npm install`.
- If a Biome rule has to be suppressed in a single place, use a
  `biome-ignore` comment that states the reason.
- `forEach` is allowed, but not with `async` callbacks: `forEach` does not wait
  for them. Use `for … of` with `await` instead.
- `react-hooks` dependencies: list every value an effect, memo or callback
  reads. If a value is deliberately left out (for example a value that only
  triggers the effect), add a `biome-ignore` comment explaining why.

## Do not commit

- `.env.local` or any other file with keys or passwords. Only `.env.example`
  belongs in the repository.
- Personal data, real addresses or data exported from a production database.
- Files of your local tools (editor settings, Supabase Studio snippets).

## License

By contributing, you agree that your contributions are licensed under the
[GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0-only), the license
of this project.
