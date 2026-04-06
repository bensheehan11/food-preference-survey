# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (shared backend), Supabase (survey frontend)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── survey/             # Undergraduate Business Student Hobbies Survey (React + Vite + Supabase)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Survey App (`artifacts/survey`)

A public-facing food preferences survey for undergraduate business students.

### Pages
- `/` — Home page with "Take the Survey" and "View Results" buttons
- `/survey` — 4-question survey form
- `/results` — Aggregated results with Recharts bar charts

### Database
Uses **Supabase** (not Replit's built-in DB). Environment variables required:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key

### Supabase Table SQL
Run this in the Supabase SQL Editor before using the app:
```sql
CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  favorite_food text NOT NULL,
  cuisine_type text NOT NULL,
  eating_frequency text NOT NULL,
  enjoyed_foods text[] NOT NULL,
  other_food text
);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts" ON survey_responses
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public reads" ON survey_responses
  FOR SELECT TO anon USING (true);
```

### Deployment
Configured for Azure Static Web Apps. `public/staticwebapp.config.json` handles client-side routing fallback.

### Design
- Primary accent: `#8A3BDB`
- Font: Inter, system-ui
- WCAG 2.1 AA compliant form with `aria-describedby`, `aria-invalid`, `role="alert"` error messages

## API Server (`artifacts/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation.

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only `.d.ts` files during typecheck; JS bundled by esbuild/tsx/vite

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
