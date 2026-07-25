# Spacio — Data Model & Schema

**Status:** Proposal (V1)
**Scope:** Data model only. No migrations are executed by this document. Every schema change described in the Migration Path is a **proposal** to be reviewed and run separately.
**Related (future):** `docs/trust/TRUST-ARCHITECTURE.md` — the *logic* of trust, KYC, ratings, bans, deposits, and adjudication. This document defines only the *data* those systems store.

---

## 1. Data-model philosophy: property → space → space_type

The current schema treats **a listing as a single flat row** (`spaces`): an apartment, a room, and a house are all just rows in one table with a free-text `type`. This does not scale to the trust, booking, and multi-unit requirements ahead, and it makes "add a new kind of space" a schema problem instead of a config problem.

The target model separates three concepts:

| Concept | Definition | Example |
|---|---|---|
| **property** | The physical real estate. Has an address, an owner/host, location. | A 3-bedroom apartment in Roma Norte; an office building in Polanco. |
| **space** | The **bookable unit**. Belongs to a property. Has a `space_type`, pricing, availability, access. | One bedroom in that apartment; the whole apartment; a conference room in that office building. |
| **space_type** | An **enum value** classifying the space. Drives UI, filtering, rules — never structure. | `room_in_home`, `whole_apartment`, `conference_room`. |

### Why

- **New space types are added by config, not by restructuring.** Adding `parking` or `medical` in V2 is enabling an enum value plus config — not creating a table or migrating rows.
- **One property can expose multiple bookable spaces.** "Whole apartment on weekends, single room on weekdays" is two `space` rows under one `property`, not two duplicated listings with copy-pasted addresses.
- **Trust, verification, and legal attach at the right level.** Identity/criminal verification lives on the **person** (`profiles`). Address and ownership live on the **property**. Ratings, bookings, deposits, videos, and access all attach to the **space** and the **booking** — the units that actually transact.
- **A "storage room inside a home" is just a `space` with a residential `space_type` under a residential `property`** — *not* a `storage_facility`. The `storage_facility` V2 type is reserved for dedicated storage real estate, not a room someone rents out of their house. The hierarchy makes this distinction structural instead of relying on naming discipline.

---

## 2. Current state (honest snapshot)

The real schema **is committed in the repo** under [`supabase/migrations/`](../../supabase/migrations/) (001–009). It is *not* live-only. What exists today:

### `profiles` (001)
1:1 with `auth.users` (shared UUID PK).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | → `auth.users(id)` on delete cascade |
| `phone` | text | |
| `country_code`, `country_name` | text | |
| `user_type` | text | check (`guest` \| `host`) |
| `kyc_status` | text | check (`pending` \| `verified`) — **identity KYC only** |
| `id_front_url`, `id_back_url` | text | pointers into private `id-photos` bucket |
| `created_at`, `updated_at` | timestamptz | |

RLS: owner-only select/insert/update.
**Missing vs. target:** no criminal-record (Certificado de Antecedentes) status; no trust tier; no ban support.

### `spaces` (004, extended by 007) — the current flat listing model
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `host_id` | uuid | → `profiles(id)` on delete set null |
| `title`, `description` | text | |
| `type` | text | **free-text, no constraint** |
| `stay_type` | text | check (`hourly` \| `nightly`) — **flat-model artifact** |
| `area`, `city`, `address`, `region` | text | |
| `lat`, `lng` | numeric | |
| `price_per_30m`, `price_per_night` | numeric | |
| `min_nights`, `min_booking_min` | int | |
| `instant_access` | boolean | |
| `amenities`, `video_urls`, `availability` | text[] | `availability` is a loose text array of slots |
| `image_url` | text | single cover image |
| `max_capacity` | int | |
| `house_rules` | text | |
| `rating`, `review_count` | numeric/int | **denormalized; no ratings table behind them** |
| `created_at` | timestamptz | |

RLS: public read; host insert/update of own rows.

### `payout_accounts` (009)
1:1 with host: `host_id` PK → profiles, `titular`, `banco`, `numero_cuenta`, timestamps. Owner-only RLS.

### Storage buckets
- `id-photos` (002/003) — **private**, KYC documents, owner-only.
- `space-images` (006) — public, listing covers.
- `space-videos` (008) — public, host walkthrough clips (marketing, *not* the 360° booking videos in the target model).

### Two divergent type vocabularies (neither enforced)
- **DB `spaces.type`** (free text). Seed values in use: `studio`, `private-room`, `apartment-1br`, `house`.
- **Code `SpaceType`** union in [`src/lib/types.ts`](../../src/lib/types.ts): `private-room`, `studio`, `apartment-1br`, `house`, `rest-room`, `kitchen`, `office`, `meeting-room`, `recording-studio`, `podcast-studio`, `coworking`.

These use hyphenated naming and match neither each other nor the target enum. Both are replaced in the target model (see §4).

### What does NOT exist yet (all greenfield)
No `properties`, no `bookings`, no ratings table, no deposits/payment-holds, no session 360° videos, no damage claims/adjudication, no `access_instructions`, no bans, no host approval mode, no criminal-record field.

---

## 3. Resolved decisions (recorded so they don't get re-litigated)

- **Base booking durations are 45 and 60 minutes.** The old root todos and current frontend say "30/60" — that is **superseded**. 45/60 is the decision; 30 is not a base duration. (This is settled, not an open question.)
- **`spaces.type` free-text and the `SpaceType` union are both replaced** by a single Postgres enum `space_type` with underscored naming (see §4).
- **`spaces.stay_type` (`hourly`|`nightly`) is deprecated** and removed in the target model — it is a flat-model artifact. Booking cadence is expressed by `space_type` + pricing fields, not a stay-mode flag.
- **Turnover buffer: 15–30 min configurable per space, default 20.** 30 is the ceiling — going higher erodes the on-demand promise; 20 turns over a single room without deep cleaning (which the platform doesn't coordinate). Larger/whole units may set 30. Revisit only if real turnover proves too tight.
- **Ratings: individual = int 1–5; aggregate = `numeric(3,2)` 0.00–5.00, pure average** (not a composite). See §4.9.
- **Trust: 2 tiers at launch** — `stranger` (deposit captured) / `regular` (hold/freeze). See §4.10. (Amounts X/Y deferred to TRUST-ARCHITECTURE.md.)
- **Criminal record: manual upload + admin review** (no Chilean automated provider). Stored as a document in a private bucket. See §4.12.
- **Mid-session extension respects the next slot's buffer.** An extension that would collide with the following booking's turnover buffer is refused. See §4.6.
- **Booking `booking_videos` retention: expire** after clean completion once the claim window closes. See §4.8.

---

## 4. Target schema

Naming: `snake_case`, underscored enum values, singular type names. All tables get `created_at`/`updated_at` and RLS. FKs shown inline.

### 4.1 Enums

```sql
-- Space classification. V1 values are ENABLED at launch.
-- V2 values exist in the enum but are gated OFF by config at launch.
create type space_type as enum (
  -- ---- V1 (enabled at launch) ----
  'whole_apartment',
  'studio',
  'one_bedroom',
  'room_in_home',
  'home_office_in_home',
  'whole_house',
  'room_in_house',
  'commercial_office',
  'conference_room',
  'kitchen',
  -- ---- V2 (in enum, NOT enabled at launch) ----
  'storage_facility',
  'medical',
  'parking',
  'rooftop'
);

create type property_kind as enum ('residential', 'commercial', 'mixed');

create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected', 'expired');

create type approval_mode as enum ('auto_approve_verified', 'auto_approve_above_score', 'manual_per_guest');

create type access_type as enum ('digital_lock', 'lockbox', 'concierge');

create type booking_status as enum (
  'pending',        -- created, awaiting approval/payment
  'confirmed',      -- approved + payment hold placed
  'in_progress',    -- opening video passed, session active
  'completed',      -- closing video passed, session ended cleanly
  'cancelled',      -- cancelled before start
  'no_show',        -- never started
  'disputed'        -- a damage claim is open against it
);

create type hold_type as enum ('hold', 'capture');   -- authorize-only vs. captured funds
create type hold_status as enum ('pending', 'authorized', 'captured', 'released', 'failed');

create type video_kind as enum ('opening', 'closing');       -- per-booking 360° gate videos
create type claim_status as enum ('open', 'under_review', 'resolved', 'rejected', 'withdrawn');
create type claim_outcome as enum ('guest_favor', 'host_favor', 'partial', 'no_fault');
create type rating_direction as enum ('guest_to_host', 'host_to_guest');

create type trust_tier as enum ('stranger', 'regular');   -- 2 tiers at launch; see §4.10
```

> **V1 vs V2 gating.** V2 values are present in the enum so no schema change is needed to launch them, but a listing/config layer must reject V2 `space_type` values at creation time until enabled. Keeping them in the enum from day one avoids an `ALTER TYPE` migration later. `storage_facility` classifies **dedicated storage real estate only** — a storage room in a home is `room_in_home` (or similar) under a `residential` property.

### 4.2 `properties` — physical real estate

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `host_id` | uuid | → `profiles(id)` on delete restrict |
| `kind` | property_kind | residential / commercial / mixed |
| `title` | text | internal label for the host |
| `address`, `area`, `city`, `region` | text | |
| `lat`, `lng` | numeric | |
| `created_at`, `updated_at` | timestamptz | |

RLS: host-owns-property write; read scoped (public listing read joins through `spaces`, not raw `properties`).

### 4.3 `spaces` — the bookable unit (restructured)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `property_id` | uuid | → `properties(id)` on delete cascade |
| `space_type` | space_type | **replaces** old `type` free-text + `SpaceType` union |
| `title`, `description` | text | |
| `price_per_45m`, `price_per_60m` | numeric | base durations (see §3) |
| `price_per_extra_15m` | numeric | extension increment price |
| `instant_access` | boolean | |
| `approval_mode` | approval_mode | per-listing host approval mode |
| `min_score` | numeric null | required guest score when mode = `auto_approve_above_score` |
| `turnover_buffer_min` | int | configurable 15–30; **default 20** (see §3) |
| `access_type` | access_type | digital_lock / lockbox / concierge |
| `amenities` | text[] | |
| `max_capacity` | int | |
| `house_rules` | text | |
| `rating`, `review_count` | numeric/int | denormalized cache of `ratings` (§4.9) |
| `is_active` | boolean | |
| `created_at`, `updated_at` | timestamptz | |

**Removed vs. current:** `type` (→ `space_type`), `stay_type` (deprecated, dropped), `price_per_30m`/`price_per_night`/`min_nights` (replaced by 45/60 + extension pricing), `host_id` (moves to `properties`), `address`/`city`/`region`/`lat`/`lng` (move to `properties`).

RLS: public read of active spaces; host writes spaces under properties they own.

### 4.4 `space_media` — images/videos per space
`id`, `space_id` → spaces, `kind` (`image`|`video`), `storage_path` text, `sort_order` int, `created_at`. Replaces single `image_url` and the `video_urls[]` marketing array.

### 4.5 `space_availability` — bookable windows
`id`, `space_id` → spaces, `starts_at` timestamptz, `ends_at` timestamptz, `is_open` boolean, `created_at`. Replaces the loose `availability text[]`. Real windows enable overlap/conflict checks.

### 4.5b `space_containment` — whole-unit vs. sub-unit blocking

A single property can expose both a whole unit and the rooms inside it (e.g. `whole_apartment` = Space A, plus `room_in_home` = Spaces B, C under the same property). Booking the whole unit must block its rooms, and booking any room must block the whole unit.

**Direction (leaning): model containment explicitly *and* make the conflict logic containment-aware.** These are complementary, not alternatives.

`id`, `parent_space_id` → spaces (the containing unit), `child_space_id` → spaces (the contained sub-unit), `created_at`. Unique `(parent_space_id, child_space_id)`.

- **Explicit:** the parent↔child relationship is real data, not inferred from `space_type`.
- **Conflict-aware:** the booking-overlap check (§4.6) expands the conflict set to include a space's parents and children — a booking on A blocks overlapping bookings on B/C and vice-versa. Two *sibling* rooms (B and C) can still be booked simultaneously; only whole↔part collides.

> Still to resolve in discussion: whether a single space can have multiple parents (nested containment), and how partial-day whole-unit bookings interact with room availability windows. See §6.5.

### 4.6 `bookings` — the session record

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `space_id` | uuid | → `spaces(id)` on delete restrict |
| `guest_id` | uuid | → `profiles(id)` |
| `status` | booking_status | lifecycle enum |
| `starts_at`, `ends_at` | timestamptz | `ends_at` reflects base + any extensions |
| `base_duration_min` | int | check in (45, 60) |
| `extension_min` | int | multiple of 15; default 0 |
| `buffer_min` | int | snapshot of space's turnover buffer at booking time |
| `price_total` | numeric | |
| `approved_at`, `cancelled_at` | timestamptz null | |
| `created_at`, `updated_at` | timestamptz | |

**Constraints to encode (proposed):**
- `base_duration_min in (45, 60)`.
- `extension_min % 15 = 0 and extension_min >= 0`.
- **Overlap prevention respecting the buffer**: no two non-terminal bookings for the same `space_id` may have `[starts_at, ends_at + buffer_min)` intervals that intersect. Implement via an exclusion constraint on a `tstzrange` (booking window extended by buffer) using `btree_gist`, or an equivalent server-side check. Terminal statuses (`cancelled`, `no_show`) are excluded from the conflict set.
- **Containment-aware conflict**: the conflict set also includes the space's parents/children via `space_containment` (§4.5b) — a whole-unit booking blocks its rooms and vice-versa; sibling rooms don't collide.
- **Extension respects the next slot's buffer (decided)**: an extension increases `extension_min`/`ends_at` only if the extended `[starts_at, ends_at + buffer_min)` interval still clears the next booking. If it would collide with the following booking's turnover buffer, the extension is refused. Example: a 60-min booking extended to 1:26 must still leave the full buffer before the next guest.

RLS: guest reads own bookings; host reads bookings for their spaces; writes gated by role + status transitions.

### 4.7 `access_instructions` — per booking
`id`, `booking_id` → bookings (unique), `access_type` access_type, `payload` text (code / lockbox location / concierge note), `valid_from`, `valid_until` timestamptz, `created_at`. **Access must not depend on host presence** — instructions are delivered to a confirmed booking and retrievable only by the guest of that booking (strict RLS on booking ownership + confirmed status).

### 4.8 `booking_videos` — mandatory 360° gate videos
`id`, `booking_id` → bookings, `kind` video_kind (`opening` | `closing`), `storage_path` text, `recorded_at` timestamptz, `expires_at` timestamptz null, `created_at`. Unique `(booking_id, kind)`. **The opening video gates `in_progress`; the closing video gates `completed`.** A dedicated **private** storage bucket (`booking-videos`) is proposed — these are evidence, not public media.

**Retention (decided): videos expire.** They are retained while a claim is open or still possible, and expire after a clean `completed` booking once the claim window closes. `expires_at` is set at that point; a scheduled job deletes the underlying storage object. The claim-window duration (how long after completion a host may still file a claim) is still to be set — see §6.8.

### 4.9 `ratings` — two-sided
`id`, `booking_id` → bookings, `direction` rating_direction, `rater_id` → profiles, `ratee_id` → profiles, `space_id` → spaces null (set on guest→host/space direction), `score` int (1–5, one rating event), `comment` text, `created_at`. Unique `(booking_id, direction)`. Feeds the denormalized cache on `spaces` and drives approval-mode scoring.

> **Score scale (decided):** an *individual* rating is an integer 1–5. A person's/space's **aggregate** score is a `numeric(3,2)` from `0.00` to `5.00` (e.g. `4.98`) — the **pure arithmetic average** of their ratings, no other signals blended in (not a composite). The denormalized `spaces.rating` and any profile-level score use `numeric(3,2)`. `approval_mode = auto_approve_above_score` compares a guest's aggregate `numeric(3,2)` against `spaces.min_score`.

### 4.10 `deposits` — payment holds tied to bookings
`id`, `booking_id` → bookings, `amount` numeric, `type` hold_type (`hold` | `capture`), `status` hold_status, `trust_tier` trust_tier (snapshot of the guest's tier at booking — governs whether money is required and how), `provider_ref` text (PSP authorization id), `created_at`, `updated_at`.

**Trust tiers (decided: 2 tiers to launch).** A 3rd tier is deferred until real data exists to calibrate it.

| Tier | Rule | Money mechanic | `deposits.type` |
|---|---|---|---|
| `stranger` | < 1 completed booking | Real **deposit** — amount **X** actually charged/captured upfront, refunded after a clean session. | `capture` |
| `regular` | ≥ 1 completed booking | **Hold/freeze** — amount **Y** authorized but not captured, released after a clean session. | `hold` |

- **X and Y are undetermined** — they are a pricing/risk decision, not a schema one. The schema stores `amount`; the *policy* (equilibrium X, freeze Y) belongs in **TRUST-ARCHITECTURE.md** and is an explicit open item there.
- **Graduation caveat to confirm:** "≥ 1 completed booking" promotes a guest on a single clean session. Consider tightening to "≥ 1 completed **and no claim filed against them**" so one clean booking isn't gamed. Recorded, not blocking.
- Requires a payment provider that supports **auth-only holds** (for `regular`) — see §6.6.

### 4.11 `damage_claims` — adjudication
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `booking_id` | uuid | → `bookings(id)` |
| `status` | claim_status | open → under_review → resolved/rejected/withdrawn |
| `outcome` | claim_outcome null | set on resolution |
| `guest_opening_video_id` | uuid | → `booking_videos(id)` |
| `guest_closing_video_id` | uuid | → `booking_videos(id)` |
| `host_claim_video_id` | uuid | → `booking_videos(id)` (host's evidence of damage) |
| `amount_claimed`, `amount_awarded` | numeric | |
| `created_at`, `updated_at` | timestamptz | |

References the **three evidence videos** (guest opening, guest closing, host claim). A booking with an open claim sits in `disputed` status.

### 4.12 Trust fields on `profiles` (added)
| Column | Type | Notes |
|---|---|---|
| `identity_kyc_status` | verification_status | supersedes the current 2-value `kyc_status` |
| `criminal_record_status` | verification_status | Certificado de Antecedentes — **admin-reviewed** |
| `criminal_record_doc_path` | text null | pointer into private `antecedentes-docs` bucket |
| `criminal_record_checked_at` | timestamptz null | |
| `trust_tier` | trust_tier | drives deposit rules (see §4.10) |

**Certificado de Antecedentes flow (decided).** No automated provider exists in Chile: the person downloads the certificate from the official site using their **Clave Única**, then **uploads it in the KYC modal**. So we store the *document*, not just a status:
- A new **private, owner-only** storage bucket **`antecedentes-docs`** (modeled on `id-photos`) holds the uploaded certificate; `criminal_record_doc_path` points to it.
- Verification is **manual admin review** of the uploaded doc → sets `criminal_record_status`.
- "Seamless" here is a **UX** goal (one modal, clear upload step, status feedback), *not* automation. The manual download + upload step is unavoidable given the Chilean system.

### 4.13 `bans` — permanent bans
`id`, `profile_id` → profiles, `reason` text, `is_permanent` boolean, `issued_by` uuid (admin), `booking_id` uuid null (origin), `created_at`. A banned profile is blocked from booking/hosting.

### Relationship summary

```
profiles ──< properties ──< spaces ──< space_media
   │                          │  ├──< space_availability
   │                          │  └──< space_containment (parent_space ↔ child_space)
   │                          │
   │                          └──< bookings ──< access_instructions
   │                                  │        └──< booking_videos ──┐
   │                                  ├──< ratings                   │
   │                                  ├──< deposits                  │
   │                                  └──< damage_claims ────────────┘ (3 video refs)
   └──< bans
```

---

## 5. Migration path (PROPOSAL — not executed)

Ordered proposal. **Nothing here has been run.** Each is a new migration file after `009`.

1. **`010_enums.sql`** — create all enums in §4.1 (`space_type` with V1+V2 values, etc.).
2. **`011_properties.sql`** — create `properties`; backfill one property per existing `spaces` row from that row's `host_id`/address/city/region/lat/lng.
3. **`012_spaces_restructure.sql`** —
   - Add `property_id`, `space_type`, `price_per_45m/60m`, `price_per_extra_15m`, `approval_mode`, `min_score`, `turnover_buffer_min`, `access_type`, `is_active`.
   - **Map old `type` → `space_type`** (explicit, proposed mapping): `studio`→`studio`; `apartment-1br`→`one_bedroom`; `private-room`→`room_in_home`; `house`→`whole_house`. Rows with unmappable free-text values are flagged for manual review, **not** silently dropped. *(The wider code-only `SpaceType` union values — `rest-room`, `office`, `meeting-room`, etc. — are treated as mock/leftover pending confirmation; see §6.1.)*
   - **Drop `type`** (free-text) — replaced by `space_type`.
   - **Drop `stay_type`** — deprecated flat-model artifact (§3).
   - **Drop/retire** `price_per_30m`, `price_per_night`, `min_nights` after price backfill to 45/60 fields.
   - **Move** `host_id`, address/geo columns to `properties` (drop from `spaces` once backfilled).
   - Update `src/lib/types.ts`: replace the hyphenated `SpaceType` union with the underscored `space_type` enum values; remove `stay_type`/`HourlySpace`/`NightlySpace` split.
4. **`013_space_media_availability.sql`** — create `space_media`, `space_availability`, and `space_containment` (§4.5b); migrate `image_url`/`video_urls[]`/`availability[]` into them.
5. **`014_bookings.sql`** — create `bookings` with duration/extension checks and the buffer-aware, containment-aware overlap exclusion constraint (`btree_gist`).
6. **`015_access_and_videos.sql`** — create `access_instructions`, `booking_videos` (with `expires_at`), and the private `booking-videos` storage bucket + owner/host RLS.
7. **`016_ratings_deposits_claims.sql`** — create `ratings`, `deposits`, `damage_claims`. `spaces.rating` widened to `numeric(3,2)`.
8. **`017_profiles_trust.sql`** — add `identity_kyc_status`, `criminal_record_status`, `criminal_record_doc_path`, `criminal_record_checked_at`, `trust_tier`; create the private `antecedentes-docs` storage bucket + owner-only RLS; migrate existing `kyc_status` (`pending`/`verified`) into `identity_kyc_status`; then retire the old column.
9. **`018_bans.sql`** — create `bans`.
10. **RLS pass** — policies for every new table (guest/host/admin boundaries; confirmed-booking gating for access instructions and videos).

Each migration is reversible-in-spirit: prefer additive columns + backfill + later drop, so no destructive step runs before its replacement is populated.

---

## 6. Open questions

Resolved items from the prior round are folded into §3–§5. What remains open, plus items promoted to "needs discussion":

**Resolved this round** (now in the schema): rating scale → int 1–5 / aggregate `numeric(3,2)` pure average (§4.9); trust tiers → 2 (`stranger`/`regular`, §4.10); extension respects next slot's buffer → yes (§4.6); criminal record → manual upload + admin review, stored in `antecedentes-docs` (§4.12); video retention → expire (§4.8); buffer default → 20, ceiling 30 (§3).

**Still open / needs your decision:**

1. **Code-only `SpaceType` values.** `rest-room`, `office`, `meeting-room`, `recording-studio`, `podcast-studio`, `coworking` in `src/lib/types.ts` have no V1 enum home. Assumed **mock/leftover → drop**. Confirm none are real listings you want to keep; if any are, we map (`office`→`commercial_office`, `meeting-room`→`conference_room`, etc.).

2. **Deposit amounts X and Y.** The equilibrium **X** (stranger deposit, captured) and freeze **Y** (regular hold) are undetermined — a pricing/risk decision for TRUST-ARCHITECTURE.md. Schema stores `amount`; policy is TBD.

3. **`regular` graduation rule.** Promote after "≥ 1 completed booking", or the stricter "≥ 1 completed **and no claim filed against them**"? (Leaning stricter to prevent gaming.)

4. **Payments provider.** Leaning **Stripe** (you know it best), but must confirm it supports **CLP payouts to Chilean hosts** *and* **auth-only holds** (needed for the `regular` freeze). If not, fall back to a local gateway (Transbank/Webpay, Flow, Khipu). This is an operational verification, not a schema change — `provider_ref` is provider-agnostic.

5. **Containment model depth (needs discussion).** Direction is set (explicit `space_containment` + containment-aware conflict, §4.5b). Open: can a space have **multiple/nested parents**? How do partial-window whole-unit bookings interact with room availability? Let's work these edge cases through together.

6. **Claim window duration.** How long after a `completed` booking may a host still file a damage claim? This sets when `booking_videos.expires_at` triggers deletion (§4.8). Needs a concrete value (e.g. 24h? 72h?).
