@AGENTS.md

# Lugarmi (repo: `spaced`)

## Product

**Lugarmi** is an on-demand marketplace for booking real private spaces by the hour in
Santiago, Chile. Hosts list a space; guests book it for a block of hours. Supply spans
space types — kitchen, home office, a room, a whole apartment, a whole house.

**Positioning is in flux (as of 2026-08-25).** The wedge is being redefined: broad supply
across space types, with an intentional demand-mix strategy rather than a single launch
category. [docs/lugarmi-wedge-memo.md](docs/lugarmi-wedge-memo.md) documents the *previous*
shoots-first wedge and is **superseded** — do not treat it as current.

Until the new positioning is written down: **do not generate marketing copy, category
taxonomy, or positioning language. Ask the owner.** In particular, do not frame the product
as "a space near you, right now" — geolocation and instant availability are features of the
booking flow, not the positioning.

**The platform is a neutral intermediary: it sells access to space + time, not the
activity.** Listings describe the *space*; the use case is defined by the host and guest.
Nothing in copy, taxonomy, take-rate structure, or payment descriptors should imply the
platform sells the *activity* rather than *access to the space*.

**Trust and safety are load-bearing, not polish.** A stranger is given private,
unsupervised access to someone's real property. Supply collapses on the first serious
incident, and supply is the binding constraint on the business. Treat trust mechanisms as
infrastructure.

→ **[docs/trust/TRUST-ARCHITECTURE.md](docs/trust/TRUST-ARCHITECTURE.md) is the canonical
trust reference.** Read it before touching identity, verification, deposits, ratings,
incidents, or anything money-adjacent.

## Naming — important

The **product** is "Lugarmi". The **repo, folder, and code identifiers** are still
"spaced" / "Spacio".

**Do not rename code identifiers.** That is a separate, deliberate pass. Only docs and
user-facing copy use "Lugarmi". Deliberately left as-is:

- the repo name, the `C:\Projects\spaced` folder, and `package.json`'s `"name": "frontend"`
- the `kycSpacioBreath` keyframe and its `data-kyc-spacio` selector
- the `spacio_email_hint` / `spacio_redirect_after_auth` localStorage keys
  (renaming would log out anyone mid-flow)
- the `spaced.cx` domain

Where "Spacio" appears in docs as a *historical reference* ("Formerly Spacio",
"Spacio → Lugarmi rename"), that is correct and should stay.

## Stack

- **Next.js 16.2.1** (App Router, Turbopack) + **React 19.2.4** + **TypeScript 5**
- **Supabase** for auth, database, and storage — `@supabase/supabase-js`.
  **There is no Prisma.** Schema changes are hand-written SQL migrations in
  `supabase/migrations/`, applied in order. There is no generated type-safe DB client.
- **Tailwind CSS 4** via `@tailwindcss/postcss`
- **Google Maps** via `@react-google-maps/api`
- **react-hook-form** + **zod** for forms and validation
- **zustand** for client state

## Commands

```bash
npm install      # install dependencies
npm run dev      # dev server → http://localhost:3000
npm run build    # production build
npm run lint     # eslint
```

**There is no test script and no test framework installed.** Adding one is a from-scratch
setup, not a config tweak.

## Layout

```
src/app/            App Router routes
  page.tsx            landing
  explore/            browse spaces
  spaces/, spaces/[id]/   space list + detail
  book/               booking flow
  ofrecer/            "offer your space" — host listing flow
  login/, register/, auth/callback/   auth
  api/                route handlers
src/components/     kyc/, landing/, list-space/, login/,
                    property-detail/, spatial-home/
src/lib/            supabase.ts, spaces.ts, geo.ts, booking-schema.ts,
                    types.ts, kyc/
src/hooks/          use-viewer-location.ts
src/store/          booking-store.ts (zustand)
supabase/migrations/  001–009, hand-written SQL
docs/               see below
```

## Docs

| Doc | What it owns |
|---|---|
| [docs/trust/TRUST-ARCHITECTURE.md](docs/trust/TRUST-ARCHITECTURE.md) | **Canonical.** Trust behaviour and policy — four pillars, booking lifecycle, schema gaps |
| [docs/technical/SCHEMA.md](docs/technical/SCHEMA.md) | The data model. Trust doc defines behaviour; this owns storage |
| [TRUST-ARCHITECTURE.md](TRUST-ARCHITECTURE.md) (root) | Strategic summary + the payments questions sent to the advisor. To be folded into the canonical doc once answers arrive |
| [docs/lugarmi-wedge-memo.md](docs/lugarmi-wedge-memo.md) | Strategic wedge / positioning |
| [docs/TODO-google-maps.md](docs/TODO-google-maps.md) | Open Google Cloud API-key issue |

**Two files named TRUST-ARCHITECTURE.md exist.** `docs/trust/` is canonical; the root copy
is a shorter strategic summary awaiting a merge. Do not treat them as duplicates and do not
delete either without asking.

## Payments — do not hard-wire a provider

Payment specifics are **pending advisor input** (see the root TRUST-ARCHITECTURE.md §10 and
`docs/trust/TRUST-ARCHITECTURE.md` §6.7, §9). Open: money-flow model, which Chilean
processor, whether fund-holding is legal without triggering CMF requirements, IVA/boleta
responsibility, and whether authorization-only holds are supported.

**Build payments behind an interface** so the answers slot in without disrupting the
booking loop. Do not integrate a specific processor yet. The booking loop is *not* blocked
by this — model the states (`pending → confirmed → completed`, funds released on
completion) and stub the money movement.

Known gap: `deposits` covers the at-risk amount only. **The guest's payment of the booking
price has no home in the schema** — no provider reference, status, or refund path
(gap G19 in the trust doc).

## Branch discipline

- **Never commit directly to `main`.** Vercel auto-deploys `main`.
- **Docs work** goes on the docs branch (currently `docs/initial-documentation`).
- **Features** go on their own feature branch off `main`.
- Remote is `origin` → `github.com/drew-84/spaced`.

## Secrets

`.env.local` holds `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. It is gitignored (`.env*`). **Never print, commit, or
move `.env` or `.env.local`.** There is no `.env` file and none is needed —
Next.js loads `.env.local`.

Note: `.env.example` is missing the two Supabase keys.

## Working style with the owner

The owner is still learning. Work accordingly:

- **Explain what a command does, in plain language, before running it.** Then wait.
- **One step at a time.** Do not chain several changes and present them as a fait accompli.
- **Confirm before anything destructive or irreversible** — deleting, overwriting, moving
  files, `git reset`, branch switches, force-push.
- **If something errors, stop.** Show the full error and explain the likely cause first;
  do not silently retry or work around it.
- **Make the safe, reversible call yourself** and say what you decided and why. Reserve
  blocking questions for things only the owner can answer (branch strategy, product
  decisions, what a document should say).
- **Verify before asserting.** Check both sides of a comparison before calling one better.
