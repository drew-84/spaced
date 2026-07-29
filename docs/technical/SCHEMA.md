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
  'kitchen_in_home',
  -- ---- V2 (in enum, NOT enabled at launch) ----
  'commercial_office',   -- gated: commercial, not residential (see note)
  'conference_room',     -- gated: commercial, not residential (see note)
  'storage_facility',
  'medical',
  'parking',
  'rooftop'
);

create type property_kind as enum ('residential', 'commercial', 'mixed');

create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected', 'expired');

-- Host approval control. 4 modes (see §4.3a).
create type approval_mode as enum (
  'allow_all',              -- any verified user books instantly
  'auto_approve_above_score', -- instant only above spaces.min_score; unrated governed by allow_unrated_guests
  'manual_per_guest',       -- host reviews every request by hand
  'manual_above_score'      -- host reviews by hand, but only guests already above min_score reach them
);

create type access_type as enum ('digital_lock', 'lockbox', 'concierge');

create type booking_status as enum (
  'pending',        -- created, awaiting approval/payment
  'confirmed',      -- approved + payment hold placed
  'in_progress',    -- opening video passed, session active
  'completed',      -- closing video passed, session ended cleanly
  'ended_without_closing', -- session ran, closing video never completed (§4.6a) [G16]
  'cancelled',      -- cancelled before start (see cancelled_by / cancellation_reason)
  'no_show',        -- never started: opening gate missed (see cancellation_reason) [G14]
  'disputed'        -- a damage claim is open against it
);

-- Who cancelled, and why a booking terminated early. [G14][G20]
create type cancelled_by as enum ('guest', 'host', 'system', 'admin');
create type cancellation_reason as enum (
  'guest_cancelled',
  'host_cancelled',
  'opening_gate_missed',   -- auto-cancel: opening video not completed in the enforced window
  'host_fault',            -- access failed (broken lock/lockbox); guest must not be penalised
  'admin_action'           -- e.g. participant banned mid-flight
);

create type hold_type as enum ('hold', 'capture');   -- authorize-only vs. captured funds
-- 'partially_captured' supports claim awards below the deposit. [G18]
create type hold_status as enum (
  'pending', 'authorized', 'captured', 'partially_captured', 'released', 'failed'
);

-- Guest payment of the booking fare — distinct from the at-risk deposit. [G19]
create type payment_status as enum (
  'pending', 'authorized', 'paid', 'refunded', 'partially_refunded', 'failed'
);

create type video_kind as enum ('opening', 'closing');       -- per-booking 360° gate videos
-- Upload lifecycle: distinguishes "recorded but upload failed" from "never recorded". [G15]
create type video_upload_status as enum ('pending', 'uploading', 'stored', 'failed');

create type claim_status as enum ('open', 'under_review', 'resolved', 'rejected', 'withdrawn');
create type claim_outcome as enum ('guest_favor', 'host_favor', 'partial', 'no_fault');
create type rating_direction as enum ('guest_to_host', 'host_to_guest');

create type trust_tier as enum ('stranger', 'regular');   -- 2 tiers at launch; see §4.10

-- Manual verification review. [G1]
create type verification_kind as enum ('identity', 'criminal_record');

-- Severity of a violation; 'serious' is the ban threshold. [G8]
create type violation_severity as enum ('minor', 'moderate', 'serious');
```

> **V1 vs V2 gating.** V2 values are present in the enum so no schema change is needed to launch them, but a listing/config layer must reject V2 `space_type` values at creation time until enabled. Keeping them in the enum from day one avoids an `ALTER TYPE` migration later. `storage_facility` classifies **dedicated storage real estate only** — a storage room in a home is `room_in_home` (or similar) under a `residential` property.

> **The V1/V2 line is residential vs. commercial (decided).** V1 is **residential only**: whole units, and rooms or areas within them — exactly the `property → space` containment model in §1 and §4.5b. `commercial_office` and `conference_room` are gated because they are *commercial real estate*, serving a different market with different users and different intent (booked days ahead for work). They stay in the enum so enabling them later is a config change, not a migration.
>
> **`kitchen` was renamed `kitchen_in_home` and is V1.** The bare name was ambiguous — it could mean a commercial kitchen rented by a caterer, or the kitchen inside someone's home. Only the residential reading belongs in V1, and the explicit name removes the ambiguity, matching the convention already used by `home_office_in_home` and `room_in_home`. It sits in V1 for the same reason `home_office_in_home` does: it is an area within a residence, listed by the person who lives there.
>
> **Turnover caveat.** A kitchen can require more turnover than other residential spaces (grease, dishes, food waste, smells) and the platform does not coordinate cleaning — the host does (§3). `turnover_buffer_min` is configurable 15–30 per space, so hosts can set the ceiling; if 30 proves too tight for this type specifically, revisit the ceiling for `kitchen_in_home` rather than withdrawing the type.

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
| `approval_mode` | approval_mode | per-listing host approval mode (4 modes — see §4.3a) |
| `min_score` | numeric(3,2) null | required guest score when mode = `auto_approve_above_score` or `manual_above_score` |
| `allow_unrated_guests` | boolean | **default `true`** — may a guest with no ratings yet be auto-approved? Applies **only** to `auto_approve_above_score` (see §4.3a) [G7] |
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

### 4.3a Host approval control — the 4 modes (decided)

Hosts have genuinely different risk appetites. Forcing one policy on all of them either drives cautious hosts off the platform or destroys the instant booking that makes the product work. Four modes, set per listing:

| Mode | Behaviour | Unrated guests |
|---|---|---|
| `allow_all` | Any fully verified user books instantly. Maximum liquidity. | Allowed |
| `auto_approve_above_score` | Instant booking only for guests whose aggregate ≥ `min_score`. | Governed by `allow_unrated_guests` |
| `manual_per_guest` | Every request reviewed by hand. No score involved. | Reach the host; host decides |
| `manual_above_score` | Host reviews by hand, but only guests already ≥ `min_score` reach them. | **Excluded structurally** — see below |

**`manual_above_score` is the cautious-host mode**: the score filters out the obvious no's, and the host personally reviews everyone else. Without it a host wanting both a floor *and* personal review would have to pick one.

> **New users start UNRATED (decided).** A new profile has `rating = null` and `review_count = 0` — **not** a starting score of 5.00. A 5.00 default would mean brand-new accounts outrank a guest with 40 clean bookings averaging 4.8, so score-gating would filter out the platform's *best* users while admitting every stranger — and a banned user returning through a fresh account would arrive at the maximum score. Starting unrated makes "no track record" visible instead of disguising it as a perfect one.

> **Unrated guests under `manual_above_score` are excluded by construction.** They have no rating, so they cannot clear `min_score`, so they never reach manual review. `allow_unrated_guests` therefore applies **only** to `auto_approve_above_score`; under `manual_above_score` the answer is structurally *no*. This is deliberate — a host choosing that mode has opted into both filters — but it must not be discovered later as a surprise. A host wanting manual review *including* newcomers should choose `manual_per_guest`.

**Default for `allow_unrated_guests` is `true`** so that inaction does not lock new users out. Every user's first booking is made with no rating; a restrictive default would make the empty state of the platform its harshest.

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
| `approval_decision` | text null | how approval happened: `allow_all` \| `auto_score` \| `manual` — check constraint [G6] |
| `approved_by` | uuid null | → `profiles(id)`; set only for manual modes [G6] |
| `decline_reason` | text null | host's reason when a manual request is declined [G6] |
| `approval_expires_at` | timestamptz null | manual modes only: auto-decline deadline (§4.6b) [G11] |
| `cancelled_by` | cancelled_by null | guest / host / system / admin [G20] |
| `cancellation_reason` | cancellation_reason null | distinguishes auto-cancel from a real no-show and from host fault [G14][G20] |
| `opening_deadline_at` | timestamptz | **enforced** opening-gate deadline (§4.6a) [G13] |
| `closing_deadline_at` | timestamptz | end of the closing grace period; moves with `ends_at` on extension [G13] |
| `created_at`, `updated_at` | timestamptz | |

**Constraints to encode (proposed):**
- `base_duration_min in (45, 60)`.
- `extension_min % 15 = 0 and extension_min >= 0`.
- **Overlap prevention respecting the buffer**: no two non-terminal bookings for the same `space_id` may have `[starts_at, ends_at + buffer_min)` intervals that intersect. Implement via an exclusion constraint on a `tstzrange` (booking window extended by buffer) using `btree_gist`, or an equivalent server-side check. Terminal statuses (`cancelled`, `no_show`, `ended_without_closing`) are excluded from the conflict set — note `ended_without_closing` is terminal, so a session that never closed out stops blocking the calendar once its grace period lapses (§4.6a).
- **Containment-aware conflict**: the conflict set also includes the space's parents/children via `space_containment` (§4.5b) — a whole-unit booking blocks its rooms and vice-versa; sibling rooms don't collide.
- **Extension respects the next slot's buffer (decided)**: an extension increases `extension_min`/`ends_at` only if the extended `[starts_at, ends_at + buffer_min)` interval still clears the next booking. If it would collide with the following booking's turnover buffer, the extension is refused. Example: a 60-min booking extended to 1:26 must still leave the full buffer before the next guest.

RLS: guest reads own bookings; host reads bookings for their spaces; writes gated by role + status transitions.

### 4.6a Session gates — opening and closing deadlines (decided)

The 360° video protocol owns two lifecycle transitions. Both need persisted, queryable deadlines so a background job can act on them — a job cannot reliably recompute them from `starts_at` alone, especially after an extension moves `ends_at`. See `TRUST-ARCHITECTURE.md` §5 for the behavioural rationale.

**Opening gate — two separate values, deliberately.**

| Value | Minutes | Role |
|---|---|---|
| `OPENING_VIDEO_DISPLAY_DEADLINE_MIN` | **5** | What the guest is **told**. Creates urgency — the baseline video must be recorded on arrival, before the space is used. |
| `OPENING_VIDEO_ENFORCED_DEADLINE_MIN` | **8** | What the system **enforces**. `bookings.opening_deadline_at = starts_at + 8 min`. |

> **These must stay two separately named constants.** The gap is a deliberate grace buffer: a guest who starts recording at 4:50 on a weak connection, whose upload takes 90 seconds, has complied. If the two are ever collapsed into one value on the grounds that the inconsistency looks like a bug, the policy silently becomes materially harsher than designed. The grace only ever runs **more lenient** than the stated number, so no user is penalised earlier than they were told.

Missing the enforced deadline → `status = no_show`, `cancellation_reason = 'opening_gate_missed'`, `cancelled_by = 'system'`, deposit charged.

**Closing gate — grace, then terminate.**

| Value | Minutes | Role |
|---|---|---|
| `CLOSING_VIDEO_GRACE_MIN` | **10** | Grace after `ends_at` before penalties apply. `bookings.closing_deadline_at = ends_at + 10 min`, recomputed on extension. |

Missing the closing deadline → `status = ended_without_closing`. **No metered overstay billing at launch (decided):** the session clock stops at `ends_at`; the consequence is the deposit, not a running meter. A time-based meter was considered and deferred — it needs a cap, a background job ticking charges onto a live booking, and an explanation to the guest of a number that grew while they were not looking. The forgotten-video case is far more common than genuine overstay, and `ended_without_closing` counts will show whether metering is ever warranted.

**Deposit on `ended_without_closing`: captured, but refundable on review (decided).** Captured automatically so the host is protected immediately, with a path to refund if the guest explains and nothing was actually wrong. This distinguishes a dead phone battery from real damage — most platforms conflate the two and generate grievance. Requires admin review capacity (§4.14) and creates review load proportional to how often this happens.

> **GPS departure detection — V2 candidate, never a gate.** Detecting that the guest's device left the area could (a) trigger the closing-video prompt at the moment it is useful and (b) corroborate a guest's account during a refund review. It must **not** gate anything: it is trivially defeated (permission denied, airplane mode, phone left behind), and urban GPS accuracy (10–50m, worse indoors) cannot distinguish "left the apartment" from "in the lobby". If implemented, store **a departure event, not a track** — one timestamp, no continuous location history, only during an active booking. Continuous tracking is a materially heavier privacy commitment than the video protocol and a liability if breached.

### 4.6b Approval and cancellation policy (decided)

**Approval timeout.** Under `manual_per_guest` and `manual_above_score`, an unanswered request would otherwise hang indefinitely — blocking the guest and holding a slot, directly contrary to on-demand booking. `bookings.approval_expires_at` sets an auto-decline deadline; a scheduled job declines on lapse with `cancellation_reason = 'host_cancelled'`. **Timeout duration: open** (§6.9) — it must be short relative to short-notice bookings.

**Cancellation — asymmetric by design.** A guest cancelling costs a host one empty slot. A host cancelling can strand someone already travelling to a space, at short notice, with nowhere to go. The second harm is worse and the policy says so.

| Case | Policy |
|---|---|
| **Guest cancels** | Free until a cutoff before `starts_at`; after the cutoff, the deposit or a portion is retained. **Cutoff and retained amount: open** (§6.9) — tied to deposit amounts X/Y (§4.10). |
| **Host cancels** | Guest is **always** made whole: full refund, deposit released, no penalty to the guest. |
| **Repeat host cancellation** | Consequences escalate for hosts who cancel habitually. **Threshold and sanction: open** (§6.9) — candidates: visible on the listing, or suspension after N in a window. Requires per-host cancellation counts. |
| **Host fault at the gate** | Access fails (broken lock/lockbox) and the guest cannot record the opening video: `cancellation_reason = 'host_fault'`, no deposit capture, no mark against the guest. Distinguishing this from a genuine no-show requires a guest-reportable path — **open** (§6.9). |

### 4.7 `access_instructions` — per booking
`id`, `booking_id` → bookings (unique), `access_type` access_type, `payload` text (code / lockbox location / concierge note), `valid_from`, `valid_until` timestamptz, `created_at`. **Access must not depend on host presence** — instructions are delivered to a confirmed booking and retrievable only by the guest of that booking (strict RLS on booking ownership + confirmed status).

### 4.8 `booking_videos` — mandatory 360° gate videos
`id`, `booking_id` → bookings, `kind` video_kind (`opening` | `closing`), `storage_path` text null, `recorded_at` timestamptz, `expires_at` timestamptz null, `created_at`. Unique `(booking_id, kind)`. **The opening video gates `in_progress`; the closing video gates `completed`.** A dedicated **private** storage bucket (`booking-videos`) is proposed — these are evidence, not public media.

**Upload state [G15].** Added columns: `upload_status` video_upload_status, `upload_started_at` timestamptz null, `duration_sec` numeric null.

Without these, "recorded but the upload failed" is indistinguishable from "never recorded", so a guest who complied on a weak connection is penalised for a network failure. The gate passes on `upload_status = 'stored'`; a row in `uploading` past the deadline is a **retry/support case, not an automatic penalty**. `duration_sec` is a cheap sanity signal — a two-second clip is not a 360° pan — but note **no automated check verifies the video is actually a slow, complete pan of the space** (§6.9): the gate can pass on worthless evidence, a failure that only surfaces during adjudication, when it is too late.

**Retention (decided): videos expire.** They are retained while a claim is open or still possible, and expire after a clean `completed` booking once the claim window closes. `expires_at` is set at that point; a scheduled job deletes the underlying storage object. The claim-window duration (how long after completion a host may still file a claim) is still to be set — see §6.8.

### 4.9 `ratings` — two-sided
`id`, `booking_id` → bookings, `direction` rating_direction, `rater_id` → profiles, `ratee_id` → profiles, `space_id` → spaces null (set on guest→host/space direction), `score` int (1–5, one rating event), `comment` text, `created_at`. Unique `(booking_id, direction)`. Feeds the denormalized cache on `spaces` and drives approval-mode scoring.

> **Score scale (decided):** an *individual* rating is an integer 1–5. A person's/space's **aggregate** score is a `numeric(3,2)` from `0.00` to `5.00` (e.g. `4.98`) — the **pure arithmetic average** of their ratings, no other signals blended in (not a composite). The denormalized `spaces.rating` and any profile-level score use `numeric(3,2)`. `approval_mode = auto_approve_above_score` compares a guest's aggregate `numeric(3,2)` against `spaces.min_score`.

**Guest aggregate lives on `profiles` [G5].** Added: `profiles.rating numeric(3,2) null` and `profiles.review_count int default 0` — the denormalized cache of ratings *received* by that person. Without this, `auto_approve_above_score` and `manual_above_score` have nothing to compare against and **cannot be implemented as specified**; `spaces.rating` is the space's score, not the guest's.

`rating` is **null for a new user**, not `5.00` (see §4.3a). `null` means "no track record" and routes to `spaces.allow_unrated_guests`; it must never be coerced to `0.00`, which would read as a terrible guest rather than a new one.

> **Rating window and reveal [G12] — open (§6.9).** How long parties may rate, whether ratings reveal simultaneously (standard practice for suppressing retaliatory ratings), and whether cancelled bookings are rateable at all are undecided. Also unresolved: a pure average is volatile at low counts — one 2★ on a second booking drops a guest to 3.50 and below common thresholds — so a minimum `review_count` before the score gates approval is worth considering.

### 4.10 `deposits` — payment holds tied to bookings
`id`, `booking_id` → bookings, `amount` numeric, `type` hold_type (`hold` | `capture`), `status` hold_status, `trust_tier` trust_tier (snapshot of the guest's tier at booking — governs whether money is required and how), `provider_ref` text (PSP authorization id), `created_at`, `updated_at`.

**Trust tiers (decided: 2 tiers to launch).** A 3rd tier is deferred until real data exists to calibrate it.

| Tier | Rule | Money mechanic | `deposits.type` |
|---|---|---|---|
| `stranger` | < 1 completed booking | Real **deposit** — amount **X** actually charged/captured upfront, refunded after a clean session. | `capture` |
| `regular` | ≥ 1 completed booking | **Hold/freeze** — amount **Y** authorized but not captured, released after a clean session. | `hold` |

- **X and Y are undetermined** — they are a pricing/risk decision, not a schema one. The schema stores `amount`; the *policy* (equilibrium X, freeze Y) belongs in **TRUST-ARCHITECTURE.md** and is an explicit open item there. Note X and Y need not be equal: a captured deposit and a frozen hold have very different felt costs.
- Requires a payment provider that supports **auth-only holds** (for `regular`) — see §6.6.

> **Graduation counts `completed` bookings ONLY (decided) [G17].** A booking that reached `no_show` (opening gate missed), `ended_without_closing`, `cancelled`, or `disputed` does **not** count toward `stranger` → `regular`.
>
> This closes a real loophole. The trust doc states an auto-cancelled booking "still counts" — correct for *not letting a no-show erase the record*, but if it also counted toward graduation, **a guest who never entered a space could reach the cheaper deposit tier by failing to show up**: pay the captured deposit once, then hold-only forever after. Booking history and graduation eligibility are therefore two different things — the no-show stays visible on the record, it just does not promote.
>
> Graduation additionally requires **no claim filed against the guest** (the stricter form of the original caveat). Combined rule: `count(bookings where status = 'completed' and no upheld claim) >= 1`.

**Partial capture [G18].** `hold_status` gains `partially_captured`, and `deposits` gains `captured_amount numeric null` — `damage_claims.amount_awarded` implies awards below the deposit, but the lifecycle was otherwise all-or-nothing. Also required: **a `disputed` booking's deposit must not auto-release** while the claim is open; release is gated on claim resolution.

### 4.10a `payments` — the booking fare [G19]

`deposits` covers only the **at-risk** amount. The guest's payment of the booking price itself had no home: `bookings.price_total` records what is owed and `payout_accounts` records where host money goes, but nothing recorded the charge, its provider reference, its status, or refunds.

`id`, `booking_id` → bookings, `amount` numeric, `status` payment_status, `provider_ref` text (PSP charge id), `refunded_amount` numeric default 0, `created_at`, `updated_at`.

Kept separate from `deposits` deliberately: fare and deposit have different lifecycles (the fare is earned, the deposit is returned), different failure modes, and different refund rules under §4.6b cancellation policy.

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
| `national_id_hash` | text null **unique** | salted hash of the national identifier (RUT) — **ban-evasion detection** [G2] |
| `identity_verified_until` | timestamptz null | validity period; drives `expired` [G4] |
| `criminal_record_valid_until` | timestamptz null | certificates go stale — drives `expired` [G4] |
| `rating` | numeric(3,2) null | aggregate of ratings received; **null = unrated** (§4.9) [G5] |
| `review_count` | int default 0 | count behind `rating` [G5] |
| `is_banned` | boolean default false | denormalized enforcement flag, maintained from `bans` [G9] |

> **`national_id_hash` is what makes permanent bans permanent [G2].** Bans attach to a `profile_id`, but a banned person can register a new email and pass verification again — identity documents are stored as *file paths*, so nothing compares the person behind two accounts. A unique salted hash of the national identifier, set at identity verification, makes the collision detectable. Store the **hash only**, never the raw identifier. Without this, permanent bans are permanent only against users who do not try.

> **Eligibility is derived, not re-implemented [G21].** A view (or generated column) `can_transact` = `identity_kyc_status = 'verified' AND criminal_record_status = 'verified' AND NOT is_banned AND neither verification expired`. Every consumer would otherwise re-derive this from four sources, and the RLS policies that enforce it need a single authority to reference. Ban enforcement in particular is currently *documented but not structural* — nothing stops a banned profile from booking [G9].

**Mid-flight bans [G9].** A ban must also resolve bookings already in progress: `confirmed` bookings are cancelled (`cancelled_by = 'admin'`, `cancellation_reason = 'admin_action'`), the guest is refunded, and the host is notified. Whether an `in_progress` session is force-terminated is **open** (§6.9) — a session already underway cannot be stopped remotely, and the practical answer may be that it completes normally with the ban applying afterwards.

**Certificado de Antecedentes flow (decided).** No automated provider exists in Chile: the person downloads the certificate from the official site using their **Clave Única**, then **uploads it in the KYC modal**. So we store the *document*, not just a status:
- A new **private, owner-only** storage bucket **`antecedentes-docs`** (modeled on `id-photos`) holds the uploaded certificate; `criminal_record_doc_path` points to it.
- Verification is **manual admin review** of the uploaded doc → sets `criminal_record_status`.
- "Seamless" here is a **UX** goal (one modal, clear upload step, status feedback), *not* automation. The manual download + upload step is unavoidable given the Chilean system.

### 4.13 `bans` — permanent bans
`id`, `profile_id` → profiles, `reason` text, `severity` violation_severity, `is_permanent` boolean, `expires_at` timestamptz null, `issued_by` uuid (admin), `booking_id` uuid null (origin), `created_at`. A banned profile is blocked from booking/hosting — enforced via `profiles.is_banned` + `can_transact` (§4.12), **not** by documentation alone [G9].

**Severity classification [G8].** "Serious violations trigger permanent bans" needs a definition of serious — it is the line between a low rating and account termination. `severity` records which threshold was met; `serious` is the ban threshold. Working enumeration, **to be confirmed** (§6.9):

- Violence, threats, or non-consensual conduct
- Significant deliberate property damage
- Identity or payment fraud
- Using a space for activity exposing the host or platform to legal action
- Repeated serious violations of house rules or the session protocol

**Non-permanent bans [G10].** `is_permanent = false` requires `expires_at`. No policy yet defines when a lesser sanction applies or how it lifts — **open** (§6.9). Also open: **appeals**. Permanent removal on admin judgement with no recourse is a fairness and legal exposure.

### 4.14 `admins` and manual review [G23][G1][G3]

`bans.issued_by` and manual verification review both presuppose an admin, but **no admin concept exists in the schema** — the backend checklist's `guest/host/admin` role model was never built.

**`admins`** — `profile_id` PK → profiles, `granted_by` uuid null, `granted_at` timestamptz, `is_active` boolean. Admin-scoped RLS policies reference this table.

**`verification_reviews`** — `id`, `profile_id` → profiles, `kind` verification_kind (`identity` | `criminal_record`), `reviewer_id` → admins, `outcome` verification_status, `rejection_reason` text null, `notes` text null, `created_at`.

Manual admin review currently leaves **no audit trail**: who approved, when, and on what basis is unrecorded — a problem for internal accountability and for the legal review flagged in the trust doc. This table also supplies **rejection reasons and attempt history** [G3]: `verification_status` has `rejected` but nothing records why or whether re-submission is permitted. Multiple rows per `(profile_id, kind)` give the attempt history for free.

> **Review load is a real operational cost.** Manual verification review, plus `ended_without_closing` deposit-refund reviews (§4.6a), plus claim adjudication all land on the same unstaffed queue. Volume should be understood before launch — and note manual review means verification is **not instant**, which sits in tension with the on-demand promise for exactly the user who arrives with urgent need.

### 4.15 `trust_events` — unified timeline [G24]

`id`, `profile_id` → profiles null, `booking_id` → bookings null, `event_type` text, `actor_id` uuid null, `payload` jsonb, `created_at`. Append-only; no updates or deletes.

Verification outcomes, approvals and declines, gate passes and failures, deposit captures and releases, and bans are each recorded (where at all) in isolated tables with no common timeline. Adjudication needs **one ordered history per booking and per user** — reconstructing "what actually happened" by joining eight tables on timestamps is fragile and will not survive a dispute.

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
   │                                  ├──< payments                  │
   │                                  └──< damage_claims ────────────┘ (3 video refs)
   ├──< bans
   ├──< verification_reviews  >── admins
   ├──< admins
   └──< trust_events  >── bookings
```

---

## 5. Migration path (PROPOSAL — not executed)

Ordered proposal. **Nothing here has been run.** Each is a new migration file after `009`.

1. **`010_enums.sql`** — create all enums in §4.1 (`space_type` with V1+V2 values, etc.).
2. **`011_properties.sql`** — create `properties`; backfill one property per existing `spaces` row from that row's `host_id`/address/city/region/lat/lng.
3. **`012_spaces_restructure.sql`** —
   - Add `property_id`, `space_type`, `price_per_45m/60m`, `price_per_extra_15m`, `approval_mode`, `min_score` (`numeric(3,2)`), `allow_unrated_guests` (default `true`), `turnover_buffer_min`, `access_type`, `is_active`.
   - **Map old `type` → `space_type`** (explicit, proposed mapping): `studio`→`studio`; `apartment-1br`→`one_bedroom`; `private-room`→`room_in_home`; `house`→`whole_house`. Rows with unmappable free-text values are flagged for manual review, **not** silently dropped. *(The wider code-only `SpaceType` union values — `rest-room`, `office`, `meeting-room`, etc. — are treated as mock/leftover pending confirmation; see §6.1.)*
   - **Drop `type`** (free-text) — replaced by `space_type`.
   - **Drop `stay_type`** — deprecated flat-model artifact (§3).
   - **Drop/retire** `price_per_30m`, `price_per_night`, `min_nights` after price backfill to 45/60 fields.
   - **Move** `host_id`, address/geo columns to `properties` (drop from `spaces` once backfilled).
   - Update `src/lib/types.ts`: replace the hyphenated `SpaceType` union with the underscored `space_type` enum values; remove `stay_type`/`HourlySpace`/`NightlySpace` split.
4. **`013_space_media_availability.sql`** — create `space_media`, `space_availability`, and `space_containment` (§4.5b); migrate `image_url`/`video_urls[]`/`availability[]` into them.
5. **`014_bookings.sql`** — create `bookings` with duration/extension checks and the buffer-aware, containment-aware overlap exclusion constraint (`btree_gist`). Includes the gate deadlines (`opening_deadline_at`, `closing_deadline_at`), approval-decision columns (`approval_decision`, `approved_by`, `decline_reason`, `approval_expires_at`), and cancellation columns (`cancelled_by`, `cancellation_reason`). Terminal statuses for the conflict set: `cancelled`, `no_show`, `ended_without_closing`.
6. **`015_access_and_videos.sql`** — create `access_instructions`, `booking_videos` (with `expires_at`, `upload_status`, `upload_started_at`, `duration_sec`), and the private `booking-videos` storage bucket + owner/host RLS.
7. **`016_ratings_deposits_claims.sql`** — create `ratings`, `deposits` (with `captured_amount`), `payments` (§4.10a), `damage_claims`. `spaces.rating` widened to `numeric(3,2)`.
8. **`017_profiles_trust.sql`** — add `identity_kyc_status`, `criminal_record_status`, `criminal_record_doc_path`, `criminal_record_checked_at`, `trust_tier`, `national_id_hash` (unique), `identity_verified_until`, `criminal_record_valid_until`, `rating` (`numeric(3,2)` null), `review_count`, `is_banned`; create the private `antecedentes-docs` storage bucket + owner-only RLS; migrate existing `kyc_status` (`pending`/`verified`) into `identity_kyc_status`; then retire the old column.
9. **`018_bans.sql`** — create `bans` (with `severity`, `expires_at`).
10. **`019_admins_and_review.sql`** — create `admins`, `verification_reviews`, `trust_events` (§4.14, §4.15).
11. **`020_can_transact.sql`** — the derived eligibility view/column (§4.12) plus the triggers maintaining `profiles.is_banned` from `bans` and `profiles.rating`/`review_count` from `ratings`.
12. **RLS pass** — policies for every new table (guest/host/admin boundaries; confirmed-booking gating for access instructions and videos; admin-scoped policies referencing `admins`; `can_transact` gating on booking and listing creation).

**Background jobs implied by this schema** (not migrations, but required for the model to function): opening-gate auto-cancel at `opening_deadline_at`; closing-gate termination at `closing_deadline_at`; manual-approval auto-decline at `approval_expires_at`; `booking_videos` expiry/deletion once the claim window closes; `trust_tier` graduation recomputation.

**Frontend constants** (see §4.6a): `OPENING_VIDEO_DISPLAY_DEADLINE_MIN = 5` and `OPENING_VIDEO_ENFORCED_DEADLINE_MIN = 8` must be **two separate named constants** — collapsing them silently hardens the policy. Host settings UI must state plainly, when `manual_above_score` is selected, that guests with no rating yet cannot request the space (§4.3a).

Each migration is reversible-in-spirit: prefer additive columns + backfill + later drop, so no destructive step runs before its replacement is populated.

---

## 6. Open questions

Resolved items from the prior round are folded into §3–§5. What remains open, plus items promoted to "needs discussion":

**Resolved in the prior round** (now in the schema): rating scale → int 1–5 / aggregate `numeric(3,2)` pure average (§4.9); trust tiers → 2 (`stranger`/`regular`, §4.10); extension respects next slot's buffer → yes (§4.6); criminal record → manual upload + admin review, stored in `antecedentes-docs` (§4.12); video retention → expire (§4.8); buffer default → 20, ceiling 30 (§3).

**Resolved this round** — the 24 gaps surfaced by `TRUST-ARCHITECTURE.md` are folded in. Decisions taken:

| Decision | Outcome | Where |
|---|---|---|
| Host approval control | **4 modes**: `allow_all`, `auto_approve_above_score`, `manual_per_guest`, `manual_above_score` | §4.1, §4.3a |
| New-user rating | **Unrated** (`null`), not 5.00 | §4.3a, §4.9 |
| Unrated guests | Separate host toggle `allow_unrated_guests`, **default true**; excluded structurally under `manual_above_score` | §4.3a |
| Closing-gate grace | **10 min** after `ends_at` | §4.6a |
| Overstay billing | **No meter at launch** — deposit is the consequence | §4.6a |
| Deposit on no-close | **Captured, refundable on review** | §4.6a |
| Unclosed session status | New `ended_without_closing` (terminal) | §4.1, §4.6a |
| Tier graduation | **`completed` bookings only**, no upheld claim — closes the no-show loophole | §4.10 |
| Guest cancellation | Free until a cutoff, then partial retention | §4.6b |
| Host cancellation | Guest **always** made whole; escalating consequences for repeat cancellers | §4.6b |
| GPS departure detection | **V2 candidate, never a gate**; departure event only, never a track | §4.6a |

**Still open / needs your decision:**

1. **Code-only `SpaceType` values.** `rest-room`, `office`, `meeting-room`, `recording-studio`, `podcast-studio`, `coworking` in `src/lib/types.ts` have no V1 enum home. Assumed **mock/leftover → drop**. Confirm none are real listings you want to keep; if any are, we map (`office`→`commercial_office`, `meeting-room`→`conference_room`, etc.).

2. **Deposit amounts X and Y.** The equilibrium **X** (stranger deposit, captured) and freeze **Y** (regular hold) are undetermined — a pricing/risk decision for TRUST-ARCHITECTURE.md. Schema stores `amount`; policy is TBD. They need not be equal. **These block the cancellation-retention amount in §6.9 as well.**

3. ~~**`regular` graduation rule.**~~ **RESOLVED** — `completed` bookings only, and no upheld claim against the guest. Non-completed terminal statuses do not promote (§4.10 [G17]).

4. **Payments provider.** Leaning **Stripe** (you know it best), but must confirm it supports **CLP payouts to Chilean hosts** *and* **auth-only holds** (needed for the `regular` freeze). If not, fall back to a local gateway (Transbank/Webpay, Flow, Khipu). This is an operational verification, not a schema change — `provider_ref` is provider-agnostic.

5. **Containment model depth (needs discussion).** Direction is set (explicit `space_containment` + containment-aware conflict, §4.5b). Open: can a space have **multiple/nested parents**? How do partial-window whole-unit bookings interact with room availability? Let's work these edge cases through together.

6. **Claim window duration.** How long after a `completed` booking may a host still file a damage claim? This sets when `booking_videos.expires_at` triggers deletion (§4.8). Needs a concrete value (e.g. 24h? 72h?). Note it also constrains the payment hold duration required in §6.4.

### 6.9 Opened by this round's decisions

Values and policies the decisions above **require but do not yet supply**. Each has a home in the schema; only the number or rule is missing.

**Numbers to set**

| Item | Where | Blocked by |
|---|---|---|
| Guest-cancellation cutoff (how long before `starts_at` it stops being free) | §4.6b | — |
| Amount retained after that cutoff | §4.6b | X/Y (§6.2) |
| Manual-approval timeout (`approval_expires_at`) | §4.6b | Must be short relative to short-notice bookings |
| Repeat host-cancellation threshold + sanction | §4.6b | — |
| Verification validity periods (identity, criminal record) | §4.12 [G4] | Possibly legal/regulatory |
| Minimum `review_count` before a score gates approval, if any | §4.9 [G12] | — |

**Policies to define**

7. **Rating window and reveal [G12].** How long parties may rate; simultaneous reveal (mitigates retaliation) vs. as-submitted; whether cancelled bookings are rateable.
8. **Violation severity [G8].** Confirm the working enumeration in §4.13 — it is the line between a low rating and account termination.
9. **Non-permanent bans [G10] and appeals.** When does a lesser sanction apply, how does it lift, and is there any recourse against a permanent ban?
10. **Mid-flight ban handling [G9].** Is an `in_progress` session force-terminated, or does it complete with the ban applying afterwards? (Leaning the latter — a session underway cannot be stopped remotely.)
11. **Host-fault reporting [G14].** A guest who cannot enter because a lock or lockbox failed must not be penalised by the opening gate. `cancellation_reason = 'host_fault'` exists; the **guest-reportable path to reach it** does not.
12. **Video validity [G22].** Nothing verifies a recording is a slow, complete 360° pan. `duration_sec` is a weak signal. The gate can pass on worthless evidence — a failure that only surfaces during adjudication, when it is too late.
13. **Re-submission after rejected verification [G3].** `verification_reviews` gives the attempt history; the **policy** (how many attempts, cooling-off) is unset.
14. **Review capacity.** Manual verification + `ended_without_closing` refund reviews + claim adjudication all land on one unstaffed queue (§4.14). Volume and staffing are an operational unknown, and verification latency contradicts the on-demand promise for the user arriving with urgent need.
15. **Multi-occupant bookings.** `spaces.max_capacity` permits more than one person, but only the booking guest is screened, rated, and recorded. Everyone else in the space is unverified and unattributable.

> Items **7–15 are behavioural**, and several belong in `TRUST-ARCHITECTURE.md` rather than here — this schema carries the fields they will need either way. The larger unresolved systems named in that document (end-to-end damage adjudication, legal review, personal-safety mechanisms, insurance, and Chilean PSP hold support) are **not** repeated here; see `TRUST-ARCHITECTURE.md` §9.
