# Undergraduate Business Student Food Preferences Survey

## Description

A short, accessible web-based survey that collects food preference data from undergraduate business students and displays aggregated, anonymized results in real time. It was built for BAIS:3300 (spring 2026) at the University of Iowa to practice full-stack web development with modern tooling. The app stores every submission in a Supabase PostgreSQL database and renders live charts on a public results page — no login required.

## Badges

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Azure Static Web Apps](https://img.shields.io/badge/Azure-Static_Web_Apps-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

## Features

- **Four-question survey** covering favorite food, preferred cuisine type, eating frequency, and foods enjoyed most
- **Conditional "Other" input** — a text box appears automatically when "Other" is checked and receives focus immediately, keeping the form keyboard-accessible
- **Inline validation** with WCAG 2.1 AA–compliant error messages linked to fields via `aria-describedby`
- **Thank-you confirmation screen** that summarizes the respondent's own answers before they leave
- **Live results page** at `/results` showing three Recharts visualizations: cuisine breakdown (vertical bar), most popular foods (horizontal bar, sorted by count, with user-entered "Other" foods expanded as individual bars), and eating frequency (horizontal bar)
- **Fully anonymous** — only aggregated group-level data is displayed; individual responses are never shown
- **Responsive layout** that works on mobile, tablet, and desktop without any separate breakpoint logic
- **Azure-ready** — ships with `staticwebapp.config.json` so client-side routing works correctly after deployment

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI component library |
| TypeScript 5.9 | Static typing across the entire codebase |
| Vite 6 | Development server and production build tool |
| Tailwind CSS 4 | Utility-first styling |
| Wouter | Lightweight client-side routing (`/`, `/survey`, `/results`) |
| Supabase (PostgreSQL) | Cloud database — stores and serves survey responses |
| `@supabase/supabase-js` | Supabase client SDK for inserts and selects |
| Recharts | Bar chart visualizations on the results page |
| pnpm workspaces | Monorepo package management |
| Azure Static Web Apps | Production hosting with SPA routing support |

## Getting Started

### Prerequisites

| Tool | Version | Download |
|---|---|---|
| Node.js | 20 or later | https://nodejs.org |
| pnpm | 9 or later | https://pnpm.io/installation |
| Supabase account | — | https://supabase.com |

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. Install all workspace dependencies:
   ```bash
   pnpm install
   ```

3. Create a Supabase project at https://supabase.com and open the **SQL Editor**. Paste and run the following to create the table and enable Row Level Security:
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

4. Copy your Supabase project URL and anon key from **Project Settings → API**. Create a `.env` file in `artifacts/survey/`:
   ```bash
   cp artifacts/survey/.env.example artifacts/survey/.env
   ```
   Then set the values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Start the development server:
   ```bash
   pnpm --filter @workspace/survey run dev
   ```

6. Open your browser at the URL shown in the terminal (e.g. `http://localhost:5173`).

## Usage

| Route | Description |
|---|---|
| `/` | Landing page — links to the survey and results |
| `/survey` | The four-question form; submits to Supabase on completion |
| `/results` | Aggregated charts pulled live from Supabase |

**Environment variables** (all `VITE_` prefixed so Vite embeds them at build time):

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

To build for production:
```bash
pnpm --filter @workspace/survey run build
```
The output is written to `artifacts/survey/dist/public/` and is ready to deploy as a static site.

## Project Structure

```
.
├── artifacts/
│   ├── api-server/                  # Express 5 API server (shared backend)
│   │   ├── src/
│   │   │   ├── app.ts               # Express app setup, middleware, route mounting
│   │   │   ├── index.ts             # Server entry point — reads PORT and listens
│   │   │   ├── lib/logger.ts        # Pino structured logger singleton
│   │   │   └── routes/
│   │   │       ├── health.ts        # GET /api/healthz — health check endpoint
│   │   │       └── index.ts         # Route barrel — mounts all sub-routers
│   │   ├── build.mjs                # esbuild script for production bundle
│   │   └── package.json
│   └── survey/                      # Food Preferences Survey (React + Vite)
│       ├── public/
│       │   └── staticwebapp.config.json  # Azure SWA routing fallback config
│       ├── src/
│       │   ├── components/
│       │   │   └── Footer.tsx       # Shared footer with course attribution
│       │   ├── lib/
│       │   │   └── supabase.ts      # Supabase client init + shared TypeScript types
│       │   ├── pages/
│       │   │   ├── Home.tsx         # Landing page with navigation buttons
│       │   │   ├── Survey.tsx       # Four-question form with validation + thank-you screen
│       │   │   └── Results.tsx      # Aggregated results with three Recharts bar charts
│       │   ├── App.tsx              # Wouter router — maps routes to page components
│       │   ├── index.css            # Tailwind CSS theme and global base styles
│       │   └── main.tsx             # React DOM entry point
│       ├── vite.config.ts           # Vite config — reads PORT and BASE_PATH env vars
│       └── package.json
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml             # OpenAPI 3.1 spec (source of truth for API contracts)
│   ├── api-client-react/            # Generated React Query hooks (from Orval codegen)
│   ├── api-zod/                     # Generated Zod schemas (from Orval codegen)
│   └── db/
│       └── src/schema/index.ts      # Drizzle ORM table definitions
├── scripts/                         # One-off utility scripts (run via pnpm --filter scripts)
├── pnpm-workspace.yaml              # Workspace package discovery and catalog version pins
├── tsconfig.base.json               # Shared TypeScript compiler options (composite, bundler)
├── tsconfig.json                    # Root solution file listing all composite lib packages
├── package.json                     # Root scripts: build, typecheck
└── README.md                        # This file
```

## Changelog

### v1.0.0 — 2026-04-06

- Initial release
- Home page with navigation to survey and results
- Four-question survey form (text input, dropdown, radio buttons, checkboxes with conditional "Other" text field)
- Client-side validation with WCAG 2.1 AA–compliant inline error messages
- Thank-you confirmation screen with answer summary
- Results page with total response count and three Recharts bar charts
- Supabase PostgreSQL integration with Row Level Security
- `staticwebapp.config.json` for Azure Static Web Apps deployment

## Known Issues / To-Do

- [ ] The results page fetches all rows from Supabase on every load; for large datasets this should be replaced with server-side aggregation queries
- [ ] No rate limiting on form submissions — a single user can submit the survey multiple times without restriction
- [ ] The "Other" cuisine option is counted as its own bar rather than being expanded like "Other" foods; free-text cuisine entries are not normalized

## Roadmap

- Add a server-side aggregate endpoint so the results page never downloads raw response rows to the browser
- Implement a submission guard (e.g. localStorage flag or Supabase fingerprinting) to discourage duplicate responses
- Export results as a CSV download directly from the results page
- Add a password-protected admin view showing response volume over time
- Internationalize the form labels and error messages for non-English respondents

## Contributing

Contributions that improve accessibility, fix bugs, or extend the chart visualizations are welcome. Please open an issue before starting significant work so we can discuss the approach.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes with a descriptive message: `git commit -m "feat: describe your change"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request against the `main` branch and describe what you changed and why

## License

This project is licensed under the [MIT License](LICENSE).

## Author

**Benjamin Sheehan**  
University of Iowa  
BAIS:3300 — Business Analytics and Information Systems, spring 2026

## Contact

GitHub: [https://github.com/bensheehan11](https://github.com/your-username)

## Acknowledgements

- [Supabase Docs](https://supabase.com/docs) — database setup, Row Level Security policies, and JavaScript client reference
- [Recharts Documentation](https://recharts.org/en-US) — `BarChart`, `ResponsiveContainer`, and `Cell` API reference
- [Tailwind CSS Docs](https://tailwindcss.com/docs) — utility class reference and responsive design guidance
- [Wouter](https://github.com/molefrog/wouter) — lightweight React router used for client-side navigation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) — accessibility requirements for form labels, error messages, and color contrast
- [shields.io](https://shields.io) — badge generation
- [Replit Agent](https://replit.com) — AI assistant used to scaffold and build this project
- [Vite](https://vitejs.dev) — build tooling and development server
