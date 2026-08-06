# Lugarmi — Trust Architecture

**Status:** Proposal (V1)
**Scope:** The *logic* of trust — screening, ratings, host control, session gating, and money at risk. This document defines behaviour and policy. It does **not** define storage; [`docs/technical/SCHEMA.md`](../technical/SCHEMA.md) owns the data model.
**Relationship to SCHEMA.md:** Where a pillar needs a field, table, status, or relationship that SCHEMA.md does not yet contain, this document does **not** assume it exists. Every such element is flagged inline and collected in [§8 Schema gaps surfaced by this document](#8-schema-gaps-surfaced-by-this-document) for folding back into SCHEMA.md.

**Framing note.** Trust mechanisms in this document apply uniformly to **all space rentals on the platform**, regardless of space type, duration, or the guest's purpose. Nothing here is conditioned on why a space is booked. The platform does not classify bookings by intent, and no mechanism described below branches on it.

---

## 1. Why trust architecture exists

Lugarmi's core transaction has a structural property that most marketplaces do not share:

> **A stranger is given private, unsupervised physical access to someone else's real property, and by design the owner is not present.**

"Access must not depend on host presence" is an MVP constraint, not an accident — it is what makes short-duration, on-demand booking work at all. A host who must be physically present to hand over a key cannot support a booking that starts twenty minutes from now. But removing the host from the transaction also removes the informal supervision that every other short-stay model quietly relies on. Hotels have a front desk. Long-lease rentals have a screening process measured in weeks and a contract with a signature on it. Lugarmi has neither, and compresses the whole transaction into under an hour.

That combination — **anonymous by default, unsupervised by design, fast by requirement, and physical in consequence** — is what the four pillars exist to counteract. Each pillar addresses a failure that the absent host would otherwise have caught.

### The trust failures the system must prevent

| # | Failure | What it looks like | Who bears it today |
|---|---|---|---|
| F1 | **Identity fraud** | Guest is not who they claim; no recourse exists after the fact because there is no real person to pursue. | Host, platform |
| F2 | **Property damage** | Space is returned damaged; no evidence of prior condition, so it is one party's word against the other's. | Host |
| F3 | **Dangerous actor** | A person with a history of violent or property crime is granted private access to a space, and potentially to another person. | Host, other guests, platform |
| F4 | **Non-consensual or unsafe conduct on-site** | Harm occurring inside a booked space between parties. | Guests, platform |
| F5 | **Payment fraud / chargeback** | Booking made on a stolen instrument, or charge reversed after the session is consumed. | Host, platform |
| F6 | **Listing fraud** | Space does not exist, is misrepresented, or is not actually controlled by the person listing it. | Guest |
| F7 | **Overstay / non-exit** | Guest does not leave, cascading into every subsequent booking on that space. | Host, next guest |
| F8 | **Unbounded liability** | A serious incident with no screening record, no evidence trail, and no money at risk exposes the platform directly. | Platform |

No single pillar addresses more than a few of these, and several failures are only *partially* covered even by all four together — F4 in particular is addressed weakly and is called out as an open item in [§9](#9-open-questions--todo).

### Design principle: defence in depth, each pillar independently load-bearing

The pillars are deliberately redundant. Identity screening deters the fraudster who would fail it; the deposit deters the verified user who would risk a small loss; the video protocol makes damage attributable; ratings make repeat bad behaviour costly. A determined bad actor who defeats one pillar still faces the others. Correspondingly, **no pillar should be weakened on the argument that another one covers the case** — that reasoning, applied twice, removes the redundancy entirely.

---

## 2. The four pillars at a glance

| Pillar | Prevents | Enforcement point | Blocking? | Money at risk? |
|---|---|---|---|---|
| **1 — Identity & background screening** | F1, F3, F8 | Account activation (before any booking or listing) | **Yes** — hard gate | No |
| **2 — Two-sided ratings & host control** | F1, F3, F6, F8 | Booking request → approval | **Conditionally** — depends on host's approval mode | No |
| **3 — Session-gating 360° video protocol** | F2, F7, F8 | Session start and session end | **Yes** — both gates | Indirectly — failure to complete a gate moves money |
| **4 — Deposit / payment hold** | F2, F5, F7 | Booking confirmation → session completion | **Yes** — no hold, no confirmation | **Yes** — directly |

**Reading the table.** Pillars 1 and 2 are *screening* — they act before anyone is in a room. Pillars 3 and 4 are *accountability* — they act once the transaction is live and create consequences for what happens inside it. A booking that reaches `in_progress` has cleared all four.

---

## 3. Pillar 1 — Identity & background screening

### 3.1 What it is

Two independent verifications, **both mandatory from launch, for every user, in both roles**:

1. **KYC identity verification** — the person is a real, identifiable individual, matched to a government-issued document.
2. **Criminal-record screening** — via the Chilean **Certificado de Antecedentes**, reviewed before the account is activated.

There is no guest-only or host-only tier of verification, and no grace period. A user who has completed neither can browse; a user who has completed both can transact. There is no state in between that permits booking or listing.

> **Decision recorded:** both checks are required at launch for all users. This is stricter than most marketplaces, which typically screen hosts more heavily than guests. The asymmetry does not fit Lugarmi: the guest is the party who gains unsupervised access to someone's property, so screening the guest is at least as important as screening the host.

### 3.2 Why it exists — failures prevented

- **F1 (identity fraud).** Every other pillar depends on there being a real, traceable person behind the account. A ban (Pillar 2) is meaningless against an anonymous account that can be recreated in thirty seconds. A deposit (Pillar 4) is meaningless against a stolen payment instrument attached to no verified identity. **Pillar 1 is the foundation the other three stand on** — it is the only pillar whose failure invalidates the rest.
- **F3 (dangerous actor).** The criminal-record check is the platform's only pre-emptive filter on who is granted private, unsupervised physical access. It is the one mechanism that acts *before* harm rather than after.
- **F8 (unbounded liability).** A platform that grants unsupervised property access with no screening record has a materially different legal and reputational exposure than one that screens every user. This is also the pillar most likely to be examined in the legal review flagged in [§9](#9-open-questions--todo).

### 3.3 How it works from the user's point of view

Both checks are presented in a **single KYC modal** during onboarding, as one continuous flow with clear per-step status. The user should experience this as *one* verification task, not two bureaucratic errands.

**Step 1 — Identity.** User photographs or uploads the front and back of a government ID. Images go to the private `id-photos` bucket, owner-readable only.

**Step 2 — Certificado de Antecedentes.** There is **no automated provider for this in Chile.** The flow is necessarily manual:

1. The modal explains what the certificate is and why it is needed.
2. The user is directed to the official government site, where they authenticate with their **Clave Única** and download the certificate as a PDF.
3. The user returns to the modal and uploads that PDF.
4. The document lands in a private, owner-only bucket (`antecedentes-docs`) and is queued for **manual admin review**.

**Step 3 — Waiting.** The account sits in a pending state. Both statuses are visible with plain-language explanations of what is happening and what remains.

**Step 4 — Outcome.** On approval, the account activates for booking and listing. On rejection, the user is informed; re-submission rules are an open item ([§9](#9-open-questions--todo)).

> **"Seamless" here means UX, not automation.** The manual download-and-upload step is unavoidable given how the Chilean system works. What the platform controls is that it happens **once**, inside **one modal**, with **clear status feedback** and no ambiguity about what the user must do next. Design effort should go into making the manual step feel handled rather than into pretending it is automatic.

**Latency consequence.** Manual admin review means verification is **not instant**, which sits in tension with the platform's on-demand promise. A user who discovers Lugarmi because they need a space *now* cannot transact now. Mitigating this — batching review, staffing it, or setting expectations at signup — is an operational problem flagged in [§9](#9-open-questions--todo).

### 3.4 Where it touches the data model

Covered by SCHEMA.md §4.12 (`profiles` trust fields):

| Element | Status |
|---|---|
| `profiles.identity_kyc_status` (`verification_status`) | ✅ In SCHEMA.md |
| `profiles.criminal_record_status` (`verification_status`) | ✅ In SCHEMA.md |
| `profiles.criminal_record_doc_path` | ✅ In SCHEMA.md |
| `profiles.criminal_record_checked_at` | ✅ In SCHEMA.md |
| `antecedentes-docs` private bucket | ✅ In SCHEMA.md |
| `id-photos` private bucket | ✅ Exists (migration 002/003) |

**Gaps →** the *review process itself* has no representation. Who reviewed, when, why a rejection happened, and whether the user may re-submit are all unmodelled. There is also no derived "may this account transact?" concept — every consumer would have to re-implement the two-status AND. See [G1–G4](#8-schema-gaps-surfaced-by-this-document).

### 3.5 Where it touches the booking lifecycle

**Before the lifecycle begins.** This pillar gates account activation, not any individual booking. Both statuses must be `verified` before a user can create a booking or publish a listing.

- **Booking creation** — rejected outright if the guest is not fully verified. This precedes `pending`; the booking row should never be created.
- **Listing publication** — rejected if the host is not fully verified.
- **Re-verification** — `verification_status` includes `expired`, implying certificates go stale. Nothing currently defines a validity period or what happens to an active listing when a host's screening expires ([G4](#8-schema-gaps-surfaced-by-this-document)).

### 3.6 Edge cases and failure modes

| Case | Handling | Status |
|---|---|---|
| Identity verified, criminal record rejected | Account cannot transact. Both are required. | Defined |
| Certificate expires while user is active | Undefined — no validity period is set. | **Open** ([G4](#8-schema-gaps-surfaced-by-this-document)) |
| User re-submits after rejection | Undefined — no attempt history, no retry policy. | **Open** ([G3](#8-schema-gaps-surfaced-by-this-document)) |
| Uploaded certificate is forged | Manual review is the only defence. Detection quality is a staffing question. | **Open** ([§9](#9-open-questions--todo)) |
| Host verified, then banned | Ban must supersede verification. See [§4.4](#44-bans--permanent-removal). | Defined, enforcement unmodelled ([G9](#8-schema-gaps-surfaced-by-this-document)) |
| Verification pending when user tries to book | Blocked with clear status messaging. | Defined |

---

## 4. Pillar 2 — Two-sided ratings & host control

### 4.1 What it is

Three connected mechanisms:

1. **Two-sided ratings** — after every completed session, guest rates host/space and host rates guest. Both directions are first-class; neither is optional decoration.
2. **Permanent bans** — serious violations remove a user from the platform entirely, in both roles, permanently.
3. **Tiered host approval control** — hosts choose, per listing, how much control they exercise over who books:
   - **`allow_all`** — any fully verified user books instantly. Maximum liquidity, minimum friction.
   - **`auto_approve_above_score`** — instant booking only for guests whose aggregate rating meets the host's threshold. A separate toggle decides whether guests with **no rating yet** are allowed through (default: yes).
   - **`manual_per_guest`** — every request is reviewed and approved by hand.
   - **`manual_above_score`** — manual review, but only guests already above the threshold reach the host. The cautious-host mode: the score filters the obvious no's, the host judges the rest. Unrated guests are excluded structurally (see SCHEMA.md §4.3a).

The tiering matters because hosts have genuinely different risk appetites, and forcing one policy on all of them either drives cautious hosts off the platform or destroys the instant-booking experience that makes the product work. Letting each host choose keeps both populations.

### 4.2 Why it exists — failures prevented

- **F1/F3 residual risk.** Screening (Pillar 1) is a point-in-time check that catches recorded history. It cannot catch someone with no record who behaves badly on the platform. Ratings capture *behaviour observed on Lugarmi itself* — the signal screening structurally cannot produce.
- **F6 (listing fraud).** Guest→host ratings are the mechanism by which a misrepresented or non-existent space becomes visible. Without them, a fraudulent listing degrades silently, one disappointed guest at a time.
- **F8 (liability).** Bans are how a known-bad actor is durably removed. Their effectiveness depends entirely on Pillar 1 — a ban is only as strong as the identity it is attached to.
- **Host retention.** Approval control is as much a supply-side feature as a trust mechanism. A host who cannot control who enters their property will not list it.

### 4.3 How it works from the user's point of view

**Rating (both parties).** After a session reaches `completed`, both parties are prompted for an integer score **1–5** plus an optional comment. Per SCHEMA.md §4.9, an aggregate is the **pure arithmetic average** of received ratings, `numeric(3,2)` from `0.00` to `5.00` — no other signals blended in. That simplicity is deliberate: a score that is a plain average is one a host can reason about when setting a threshold. A composite score would make `min_score` meaningless.

**Rating windows are unmodelled.** How long a party has to rate, and whether ratings are revealed simultaneously or as submitted, are undefined ([G12](#8-schema-gaps-surfaced-by-this-document)). Simultaneous reveal is standard practice for suppressing retaliatory ratings and is worth adopting, but it is not yet a decision.

**Host — choosing an approval mode.** Set per listing, with the trade-off stated plainly (more control, fewer instant bookings). Under `auto_approve_above_score` the host picks the numeric threshold.

**Guest — requesting a booking.** Under auto-approve modes, booking is instant and the guest need not know an approval mode exists. Under `manual_per_guest` the request enters a pending state awaiting host action — a materially different experience, and the one place where the on-demand promise is suspended. **What the guest sees while waiting, and how long they wait before the request expires, is unmodelled** ([G11](#8-schema-gaps-surfaced-by-this-document)) — a request that hangs indefinitely is worse than one that is declined quickly.

### 4.4 Bans — permanent removal

A **serious violation** triggers permanent removal from the platform, in both roles.

**What counts as serious** is not yet enumerated, and the boundary matters — it is the difference between a low rating and account termination. A working starting point, **to be confirmed**:

- Violence, threats, or non-consensual conduct
- Significant deliberate property damage
- Identity or payment fraud
- Using a space for activity that exposes the host or platform to legal action
- Repeated serious violations of house rules or the session protocol

**Properties of a ban:**

- **Permanent** — `bans.is_permanent` exists in SCHEMA.md, implying non-permanent bans are possible, but no policy defines when a lesser sanction applies ([G10](#8-schema-gaps-surfaced-by-this-document)).
- **Both roles** — a banned host cannot re-enter as a guest.
- **Admin-issued** — `bans.issued_by` records the admin. No appeal process is defined ([§9](#9-open-questions--todo)).
- **Traceable to origin** — `bans.booking_id` links to the triggering booking where one exists.

**Enforcement is the gap.** SCHEMA.md defines the `bans` table and states a banned profile is blocked from booking and hosting, but *nothing enforces it structurally* — no derived flag on `profiles`, no RLS predicate, no constraint. Enforcement currently lives in application code that does not yet exist ([G9](#8-schema-gaps-surfaced-by-this-document)).

**Ban evasion.** A banned person re-registering with a new email is defeated only by Pillar 1 — the same identity document and the same certificate should collide. **Nothing currently detects that collision**, because verified identity documents are stored as file paths, not as comparable identifiers ([G2](#8-schema-gaps-surfaced-by-this-document)). This is the single most important unaddressed weakness in Pillar 2: without it, permanent bans are permanent only against users who do not try.

### 4.5 Where it touches the data model

| Element | Status |
|---|---|
| `ratings` (two-sided, `rating_direction`, unique per booking+direction) | ✅ In SCHEMA.md §4.9 |
| `spaces.approval_mode`, `spaces.min_score` | ✅ In SCHEMA.md §4.3 |
| `bans` (profile, reason, permanence, issuer, origin booking) | ✅ In SCHEMA.md §4.13 |
| `spaces.rating` / `review_count` denormalized cache | ✅ In SCHEMA.md §4.3 |
| **Guest aggregate score** | ⚠️ **Referenced, not stored** — `auto_approve_above_score` compares against a guest aggregate that has no home on `profiles` ([G5](#8-schema-gaps-surfaced-by-this-document)) |
| Approval decision record | ❌ Missing ([G6](#8-schema-gaps-surfaced-by-this-document)) |
| Ban enforcement mechanism | ❌ Missing ([G9](#8-schema-gaps-surfaced-by-this-document)) |

### 4.6 Where it touches the booking lifecycle

**Approval gate: `pending` → `confirmed`.**

1. Guest requests a booking. Pillar 1 has already gated account access; the guest is verified.
2. The listing's `approval_mode` is evaluated:
   - `allow_all` → approved immediately.
   - `auto_approve_above_score` → guest aggregate compared to `spaces.min_score`; unrated guests routed by `spaces.allow_unrated_guests` (default allow) — resolved, [G7](#8-schema-gaps-surfaced-by-this-document).
   - `manual_per_guest` / `manual_above_score` → awaits host action, auto-declining at `approval_expires_at`; the timeout duration is still open ([G11](#8-schema-gaps-surfaced-by-this-document)).
3. On approval, `bookings.approved_at` is set and Pillar 4 places the hold.

**Rating window: after `completed`.** Both parties are prompted. Ratings feed aggregates, which feed future approval decisions — closing the loop.

**Ban: any point.** A ban should invalidate future bookings and may need to cancel active ones. **What happens to a booking already `confirmed` or `in_progress` when a participant is banned mid-flight is undefined** ([G9](#8-schema-gaps-surfaced-by-this-document)).

### 4.7 Edge cases and failure modes

| Case | Handling | Status |
|---|---|---|
| New guest, no ratings, `auto_approve_above_score` listing | Undefined. Affects every new user. | **Open** ([G7](#8-schema-gaps-surfaced-by-this-document)) |
| Retaliatory rating after a dispute | Simultaneous reveal would mitigate. Not decided. | **Open** ([G12](#8-schema-gaps-surfaced-by-this-document)) |
| Banned user re-registers with new email | Should collide at Pillar 1. No detection exists. | **Open** ([G2](#8-schema-gaps-surfaced-by-this-document)) |
| Host never responds to a manual request | No timeout. Request hangs. | **Open** ([G11](#8-schema-gaps-surfaced-by-this-document)) |
| Single bad rating drops a guest below threshold | Pure average is volatile at low counts — one 2★ on two bookings is severe. | **Open** ([§9](#9-open-questions--todo)) |
| Host uses manual approval to discriminate | Manual approval is opaque by construction. No detection. | **Open** ([§9](#9-open-questions--todo)) |
| Booking cancelled before session — can parties rate? | Should be no; not stated. | **Open** ([G12](#8-schema-gaps-surfaced-by-this-document)) |

---

## 5. Pillar 3 — Session-gating 360° video protocol

### 5.1 What it is

Every session is bracketed by two mandatory videos recorded by the guest:

- **Opening video** — a slow 360° pan of the space, required to **start** the session. Without it the session does not begin.
- **Closing video** — the same pan, required to **end** the session cleanly. Without it, charges and the deposit accrue.

The word **slow** is a functional requirement, not a stylistic one. A fast pan produces motion-blurred footage that is useless as evidence, which defeats the entire purpose. Guidance on pace belongs in the capture UI.

These are **not** the marketing walkthrough clips in the existing public `space-videos` bucket. They are per-booking evidence, stored privately.

### 5.2 Why it exists — failures prevented

- **F2 (property damage) — the primary purpose.** Two timestamped recordings bracketing the session convert "your word against mine" into a documented before-and-after. This is the only mechanism that makes a damage claim adjudicable at all; without it, [§9](#9-open-questions--todo)'s adjudication flow has no evidence to adjudicate.
- **F7 (overstay).** The closing video is the platform's signal that the guest has actually left. Without it there is no way to distinguish "session ended" from "guest is still there," and the next booking walks into an occupied space.
- **Deterrence.** Knowing the space is recorded on entry and exit changes behaviour before anything happens. This is plausibly the pillar's largest real-world effect and the one that never shows up in the data.
- **Protects both parties symmetrically.** The opening video protects the *guest* from being blamed for pre-existing damage exactly as much as it protects the host. Framing it as guest-surveillance would be wrong and would make it feel adversarial when it is the guest's own best evidence.

### 5.3 How it works from the user's point of view

#### Opening the session

1. Booking is `confirmed`, start time arrives, guest has access instructions and enters.
2. The app requires the opening 360° video before anything else. **The session cannot start without it.**
3. Guest records a slow 360° pan.
4. On successful upload, the booking moves to `in_progress` and the session clock starts.

#### The opening deadline — stated 5 minutes, enforced at ~8

**The user is told they have 5 minutes. The system actually auto-cancels at approximately 8.**

This is deliberate and should not be "fixed." The two numbers serve different jobs:

- **The stated 5 minutes** creates urgency. The video must be recorded on arrival, before the space has been used — a video recorded twenty minutes in is worthless as a baseline. A tight stated deadline is what makes people record immediately.
- **The enforced ~8 minutes** absorbs reality. A guest who starts recording at 4:50 on a weak mobile connection, whose upload takes ninety seconds, has done everything right. Cancelling that booking and charging the deposit would be a system failure charged to a compliant user. The buffer exists so that the *stated* deadline can be strict without the *enforced* one being unjust.

> **Implementation requirement.** These must be **two separately named constants** — something like `OPENING_VIDEO_DISPLAY_DEADLINE_MIN = 5` and `OPENING_VIDEO_ENFORCED_DEADLINE_MIN = 8` — with a comment pointing back to this section. If they are ever collapsed into one value on the grounds that the inconsistency looks like a bug, the policy silently becomes materially harsher than designed. The grace is only ever **more lenient** than the stated number, which is the safe direction: no user is penalised earlier than they were told.

**Consequences of missing the deadline** (three simultaneous effects):

1. **The session auto-cancels.** No access, no session.
2. **The deposit is charged.** The host held the space and lost the slot.
3. **The booking still counts.** It remains in the guest's history and toward booking counts — including, as currently written, the `stranger` → `regular` graduation in SCHEMA.md §4.10.

The third item deserves scrutiny. "Still counts" is correct for *not letting a no-show erase the record*, but as written it means **a guest who never entered a space could graduate to the more favourable deposit tier by failing to show up.** That is almost certainly not intended, and it is exactly the gaming vector SCHEMA.md §4.10's own "graduation caveat" worries about. See [G17](#8-schema-gaps-surfaced-by-this-document) — this is the highest-priority gap in the document.

**What the guest is told, when.** Because the deposit is charged and the booking counts, this consequence must be disclosed **at booking time**, not discovered at minute 8. The stated-vs-enforced gap is safe in this respect: the user is warned at a stricter threshold than the one enforced against them, so no one is charged earlier than they were told.

#### Closing the session

1. As the end approaches, the guest is prompted for the closing video.
2. Guest records the same slow 360° pan.
3. On successful upload, the booking moves to `completed`, and the deposit or hold releases (Pillar 4).

**If the closing video is not completed**, charges and the deposit accrue. The precise mechanics are underspecified: whether time continues billing at the extension rate, whether the deposit is captured in full or in part, and whether there is a grace period mirroring the opening gate ([G16](#8-schema-gaps-surfaced-by-this-document)). The *intent* is clear — leaving without closing out is not free, because it destroys the evidence trail and leaves the space in an unknown state before the next guest.

**Asymmetry, deliberate.** The opening gate is **blocking** (no video, no session). The closing gate is **financial** (no video, money accrues). This is correct: a guest who cannot record on entry has not yet consumed anything, so blocking is the cheap remedy. A guest already inside cannot be blocked from leaving, so the only available lever is money.

### 5.4 Where it touches the data model

| Element | Status |
|---|---|
| `booking_videos` (booking, `kind`, path, `recorded_at`, `expires_at`) | ✅ In SCHEMA.md §4.8 |
| Unique `(booking_id, kind)` | ✅ In SCHEMA.md |
| `video_kind` enum (`opening`/`closing`) | ✅ In SCHEMA.md |
| Private `booking-videos` bucket | ✅ Proposed in SCHEMA.md |
| `booking_status` values `in_progress` / `completed` / `no_show` | ✅ In SCHEMA.md §4.6 |
| Retention: expire after clean completion once claim window closes | ✅ Decided in SCHEMA.md §4.8 |
| Gate deadline timestamps | ❌ Missing ([G13](#8-schema-gaps-surfaced-by-this-document)) |
| Auto-cancel as a distinct outcome | ❌ Missing ([G14](#8-schema-gaps-surfaced-by-this-document)) |
| Upload state (recording vs. uploading vs. stored) | ❌ Missing ([G15](#8-schema-gaps-surfaced-by-this-document)) |
| Closing-failure accrual | ❌ Missing ([G16](#8-schema-gaps-surfaced-by-this-document)) |

**A note on `no_show`.** SCHEMA.md defines `no_show` as "never started," which is where an auto-cancelled booking naturally lands. But `no_show` is a **terminal status excluded from the conflict set** (§4.6) — appropriate for freeing the slot, yet it makes auto-cancellation indistinguishable from a guest who simply never arrived. Those two cases have different deposit consequences and different implications for the guest's record. See [G14](#8-schema-gaps-surfaced-by-this-document).

### 5.5 Where it touches the booking lifecycle

This pillar **owns two of the state machine's transitions.**

```
confirmed
   │
   ├── opening video uploaded within enforced window ──► in_progress
   │                                                          │
   │                                                          ├── closing video uploaded ──► completed
   │                                                          │        └─► deposit/hold released (Pillar 4)
   │                                                          │
   │                                                          └── closing video NOT uploaded
   │                                                                   └─► charges + deposit accrue (Pillar 4)
   │                                                                       └─► terminal status?  ◄── G16
   │
   └── opening video NOT uploaded by ~8 min ──► auto-cancel
                                                    ├─► deposit charged (Pillar 4)
                                                    ├─► booking still counts  ◄── G17
                                                    └─► status = no_show?      ◄── G14
```

Two branches terminate in an unresolved question. Both need answering before the state machine can be implemented.

### 5.6 Edge cases and failure modes

| Case | Handling | Status |
|---|---|---|
| Upload fails on poor connectivity | Recorded-but-not-uploaded is not representable; guest may be penalised for a network failure. | **Open** ([G15](#8-schema-gaps-surfaced-by-this-document)) |
| Guest records a useless video (dark, fast, ceiling-only) | No quality check. Evidence value is zero but the gate passes. | **Open** ([§9](#9-open-questions--todo)) |
| Guest records the closing video elsewhere | No location or liveness binding. | **Open** ([§9](#9-open-questions--todo)) |
| Guest arrives on time but cannot enter (lock fails) | Guest is penalised for a host-side failure. No override. | **Open** ([G14](#8-schema-gaps-surfaced-by-this-document)) |
| Session extended mid-way | Closing deadline must follow the new `ends_at`. Not stated. | **Open** ([G13](#8-schema-gaps-surfaced-by-this-document)) |
| Guest completes opening at 7:30 (past stated, within enforced) | Session starts normally. Working as designed. | Defined |
| Video expires while a claim is open | SCHEMA.md retains during the claim window. Correct. | Defined |
| Two guests, one booking | Only the booking guest records. Others unmodelled. | **Open** ([§9](#9-open-questions--todo)) |

---

## 6. Pillar 4 — Deposit / payment hold

### 6.1 What it is

Every booking carries **money at risk** beyond the booking price — either a captured deposit or an authorization hold on the guest's payment method — released after a clean session.

Per SCHEMA.md §4.10, the mechanic is **conditioned on the guest's trust tier**:

| Tier | Rule | Mechanic | `deposits.type` |
|---|---|---|---|
| `stranger` | < 1 completed booking | **Deposit** — amount **X** actually charged upfront, refunded after a clean session | `capture` |
| `regular` | ≥ 1 completed booking | **Hold** — amount **Y** authorized but not captured, released after a clean session | `hold` |

> **Reconciliation note.** The pillar is sometimes described as "a deposit *or* a pre-authorization hold," which reads as a single either/or mechanism. SCHEMA.md's tiered model is the canonical form: **which** of the two applies is determined by tier, not chosen per booking. Both are the same pillar — money at risk — with the tier controlling how aggressively it is taken. Unverified strangers pay real money that is refunded; users with a track record have funds frozen but never moved.

### 6.2 Why it exists — failures prevented

- **F2 (property damage).** Ratings punish damage slowly and socially; a deposit does so immediately and financially. It is also the only pillar that produces **actual funds** to make a wronged host whole — Pillar 3 produces evidence, but evidence without a recoverable sum leaves the host with a well-documented loss.
- **F5 (payment fraud).** Authorizing a hold exercises the payment instrument before the session. An instrument that cannot sustain a hold is a signal available *before* access is granted.
- **F7 (overstay).** Money accruing against a live deposit is a continuous incentive to leave, present throughout the session in a way no post-hoc penalty is.
- **Behavioural, not just recuperative.** The deposit's main value is that it changes conduct in the room. Its recuperative function is a fallback for when deterrence fails.

### 6.3 How it works from the user's point of view

**At booking.** The guest sees the booking price *and* the deposit or hold amount, clearly separated, with plain language on which applies and when it comes back. Tier language should never be user-facing — no one should be labelled a "stranger." Phrase it in terms of the mechanic ("held" vs. "charged and refunded"), not the tier.

**On confirmation.** The deposit is captured (`stranger`) or the hold authorized (`regular`). **No confirmation without it** — this is a hard gate, which means Pillar 4 failures surface as booking failures and need clear error handling.

**During the session.** Nothing moves. The amount sits.

**On clean completion.** Closing video accepted → booking `completed` → hold released or deposit refunded. **Release timing should be stated up front**, since refund settlement is typically days, not seconds, and an unexplained delay reads as the platform keeping the money.

**On a bad outcome.** Auto-cancel, missing closing video, or an upheld claim results in capture instead of release, in whole or in part.

### 6.4 What triggers capture rather than release

| Trigger | Effect | Source |
|---|---|---|
| Clean completion | Full release / refund | Pillar 3 closing gate |
| Opening-gate auto-cancel | Deposit charged | [§5.3](#the-opening-deadline--stated-5-minutes-enforced-at-8) |
| Closing video missing | Charges + deposit accrue | [§5.3](#closing-the-session) — mechanics open ([G16](#8-schema-gaps-surfaced-by-this-document)) |
| Damage claim upheld | Partial or full capture up to `amount_awarded` | Adjudication ([§9](#9-open-questions--todo)) |
| Guest cancels before start | Undefined — no cancellation policy exists | **Open** ([G20](#8-schema-gaps-surfaced-by-this-document)) |
| Host cancels before start | Undefined — guest should not lose money | **Open** ([G20](#8-schema-gaps-surfaced-by-this-document)) |

**Partial capture is required, not optional.** `damage_claims.amount_awarded` implies awards smaller than the deposit, and `hold_status` (`pending`/`authorized`/`captured`/`released`/`failed`) has no partial-capture state ([G18](#8-schema-gaps-surfaced-by-this-document)).

**A deposit is a ceiling, not a guarantee.** Damage exceeding X or Y is simply not covered — the platform has no mechanism to recover the excess. This is the boundary where deposits stop and insurance begins, and it is why insurance is an explicit open item in [§9](#9-open-questions--todo).

### 6.5 Where it touches the data model

| Element | Status |
|---|---|
| `deposits` (booking, amount, type, status, tier snapshot, `provider_ref`) | ✅ In SCHEMA.md §4.10 |
| `hold_type` / `hold_status` enums | ✅ In SCHEMA.md §4.1 |
| `profiles.trust_tier` | ✅ In SCHEMA.md §4.12 |
| Tier snapshot on the deposit row | ✅ In SCHEMA.md §4.10 |
| **Amounts X and Y** | ⚠️ **Undetermined** — a pricing/risk decision explicitly deferred to this document, still open ([§9](#9-open-questions--todo)) |
| Booking-price payment (distinct from deposit) | ❌ Missing ([G19](#8-schema-gaps-surfaced-by-this-document)) |
| Partial capture | ❌ Missing ([G18](#8-schema-gaps-surfaced-by-this-document)) |
| Cancellation/refund policy | ❌ Missing ([G20](#8-schema-gaps-surfaced-by-this-document)) |

> **`deposits` covers the deposit, not the fare.** SCHEMA.md has `bookings.price_total` and `payout_accounts` for hosts, but **no table records the guest's payment of the booking price** — its provider reference, status, or refunds. `deposits` is explicitly the at-risk amount. The actual money for the session has no home ([G19](#8-schema-gaps-surfaced-by-this-document)).

### 6.6 Where it touches the booking lifecycle

- **`pending` → `confirmed`** — hold placed or deposit captured. Failure blocks confirmation; the booking cannot proceed.
- **`in_progress`** — amount held throughout; the live incentive to exit on time.
- **`completed`** — released on a clean close.
- **auto-cancel / missing close / `disputed`** — capture in whole or part; a `disputed` booking's deposit must **not** release while the claim is open ([G18](#8-schema-gaps-surfaced-by-this-document)).

### 6.7 Dependency on payment-provider capability

**This pillar does not work unless the payment processor supports authorization-only holds.** The `regular` tier is *defined* as an auth-without-capture. If no available Chilean processor supports it, either every user pays a real captured deposit — worse UX, more refund volume, more friction on exactly the repeat users the platform most wants — or the tier model collapses to one tier.

Confirming this is listed in [§9](#9-open-questions--todo). It is the **highest-risk unknown in this document**: it is external, unverifiable from inside the codebase, and it invalidates a designed mechanism rather than merely leaving a detail open. It should be verified early, because a negative answer changes Pillar 4's design rather than its parameters.

---

## 7. How the pillars compose across the booking lifecycle

A single booking, start to finish, with the acting pillar marked.

| # | Step | Pillar | What happens | Gate? |
|---|---|---|---|---|
| 1 | Sign up | — | Account created. Cannot transact. | — |
| 2 | Identity KYC | **P1** | ID uploaded → `identity_kyc_status` | Blocking |
| 3 | Criminal record | **P1** | Certificate uploaded → admin review → `criminal_record_status` | Blocking |
| 4 | Activation | **P1** | Both `verified` → may book and list | Blocking |
| 5 | Discovery | — | Guest browses available spaces | — |
| 6 | Request | **P2** | Booking created as `pending` | — |
| 7 | Approval | **P2** | `approval_mode` evaluated; `approved_at` set | Conditional |
| 8 | Payment hold | **P4** | Deposit captured or hold authorized by tier | Blocking |
| 9 | Confirmed | — | `confirmed`; access instructions released to guest | — |
| 10 | Arrival | — | Guest enters using digital lock / lockbox / concierge | — |
| 11 | **Opening video** | **P3** | Slow 360° pan → `in_progress`. Stated 5 min, enforced ~8. | **Blocking** |
| 12 | Session | **P3+P4** | Clock runs; deposit held; extension respects next buffer | — |
| 13 | **Closing video** | **P3** | Slow 360° pan → `completed` | **Blocking** |
| 14 | Release | **P4** | Hold released / deposit refunded | — |
| 15 | Ratings | **P2** | Both parties rate; aggregates update | — |
| 16 | Tier update | **P4** | `stranger` → `regular` on qualifying history | — |
| 17 | Retention | **P3** | Videos expire once the claim window closes | — |

### Failure branches

| Branch | Trigger | Pillars | Result |
|---|---|---|---|
| **No-show / auto-cancel** | Opening video missing at ~8 min | P3 → P4 | Cancelled; deposit charged; booking counts ([G17](#8-schema-gaps-surfaced-by-this-document)) |
| **Unclean exit** | Closing video missing | P3 → P4 | Charges + deposit accrue ([G16](#8-schema-gaps-surfaced-by-this-document)) |
| **Damage claim** | Host files after session | P3 → P4 → P2 | `disputed`; videos as evidence; deposit held; possible ban ([§9](#9-open-questions--todo)) |
| **Serious violation** | Either party | P2 → P1 | Permanent ban; only durable if identity re-registration is detected ([G2](#8-schema-gaps-surfaced-by-this-document)) |
| **Cancellation** | Either party pre-session | P4 | **Entirely undefined** ([G20](#8-schema-gaps-surfaced-by-this-document)) |

### What the composition reveals

1. **Pillar 1 is the substrate.** Bans, tiers, and ratings all attach to a verified identity. Weak identity verification silently weakens all three other pillars — and the one place it is currently weak (re-registration detection, [G2](#8-schema-gaps-surfaced-by-this-document)) undermines permanent bans specifically.
2. **Pillars 3 and 4 are coupled at every failure branch.** Every video-protocol failure resolves into a money movement. They cannot be specified independently — [G16](#8-schema-gaps-surfaced-by-this-document) and [G17](#8-schema-gaps-surfaced-by-this-document) are Pillar 3 questions with Pillar 4 answers.
3. **The trust loop closes at step 15.** Ratings from this booking govern approval for the next. The system gets more discriminating over time only because two-sided ratings feed back into the approval gate.
4. **Steps 11 and 13 are where the model is thinnest.** They are the only steps that gate on a *user physically doing something in a room in real time* — no other step can fail because of a weak mobile signal. Most of [§8](#8-schema-gaps-surfaced-by-this-document)'s gaps cluster here for that reason.

---

## 8. Schema gaps surfaced by this document

Elements required by the pillars above that **SCHEMA.md does not currently contain.** Grouped by where they would land, so folding back is mechanical. Nothing here is assumed to exist.

> **✅ STATUS: ALL 24 GAPS FOLDED INTO SCHEMA.md.** This section is retained as the record of what was surfaced and why. The gap IDs (G1–G24) are referenced inline throughout SCHEMA.md at the point each was resolved. Where a gap needed a product decision rather than a column, the decision is recorded in SCHEMA.md §6 ("Resolved this round"); where it opened a new question, it is in SCHEMA.md §6.9.
>
> **Decisions taken while folding back**, which supersede the phrasing of the pillars above:
> - **Host approval is 4 modes**, not 3: `allow_all`, `auto_approve_above_score`, `manual_per_guest`, and `manual_above_score` (manual review restricted to guests already above the threshold). §4.3a.
> - **New users start unrated** (`rating = null`), not at a maximum score — a 5.00 default would rank new accounts above the platform's best repeat guests.
> - **`allow_unrated_guests`** is a separate host toggle (default *true*), applying only to `auto_approve_above_score`. Under `manual_above_score` unrated guests are excluded structurally.
> - **Tier graduation counts `completed` bookings only** — closing the [G17](#84-money-schemamd-410) loophole where a no-show could promote a guest to the cheaper deposit tier.
> - **No metered overstay billing at launch.** A missing closing video terminates the booking as `ended_without_closing` after a 10-minute grace; the deposit is captured but refundable on review.
> - **GPS departure detection** is a V2 candidate for prompting and dispute evidence — never a gate, and a departure event only, never a continuous track.

### 8.1 `profiles` / verification (SCHEMA.md §4.12)

| ID | Missing element | Shape | Pillar | Why needed |
|---|---|---|---|---|
| **G1** | Verification review record | New table `verification_reviews`: profile, kind (`identity`/`criminal_record`), reviewer admin id, outcome, notes, timestamp | P1 | Manual admin review has no audit trail. Who approved, when, and on what basis is unrecorded — a problem for both internal accountability and the legal review in §9. |
| **G2** | Identity-collision detection | Hashed/normalized national identifier on `profiles`, unique or indexed | P1, P2 | **Permanent bans are not permanent without it.** A banned user re-registers with a new email; documents are stored as file paths, so nothing detects the same person returning. Highest-value gap for ban durability. |
| **G3** | Rejection reason + resubmission policy | `rejection_reason` text, `attempt_count` int, or full history via G1 | P1 | `verification_status` has `rejected` but nothing records why or whether re-submission is permitted. |
| **G4** | Verification validity period | `identity_verified_until`, `criminal_record_valid_until` timestamptz | P1 | `verification_status` includes `expired` but nothing sets it. Also undefined: what happens to active listings and future bookings when a host's screening lapses. |
| **G5** | Guest aggregate rating | `profiles.rating numeric(3,2)`, `profiles.review_count int` | P2 | `approval_mode = auto_approve_above_score` compares a guest aggregate against `spaces.min_score`, but `spaces` is the only place a denormalized aggregate exists. **The mode cannot be implemented as specified.** |
| **G21** | Derived "can transact" concept | Generated column or view combining both statuses AND no active ban | P1, P2 | Every consumer must otherwise re-derive eligibility from three sources. A single authority prevents drift and makes RLS enforceable. |

### 8.2 Approval & bans (SCHEMA.md §4.3, §4.13)

| ID | Missing element | Shape | Pillar | Why needed |
|---|---|---|---|---|
| **G6** | Approval decision record | `bookings.approval_decision` (`auto_verified`/`auto_score`/`manual`), `approved_by`, decline reason | P2 | `approved_at` records *when* but not *how* or *by whom*, and there is no representation of a declined request. Needed for dispute context and to detect discriminatory manual approval. |
| **G7** | No-rating fallback for score gate | Policy + field (e.g. `spaces.allow_unrated_guests boolean`) | P2 | Undefined behaviour for a guest with no ratings under `auto_approve_above_score`. **This is every new user's first booking**, not an edge case — a null aggregate either blocks all new users or silently passes them. |
| **G8** | Violation severity classification | `violation_severity` enum; `bans.severity`; possibly a `violations` table | P2 | "Serious violations trigger permanent bans" requires a definition of serious. Currently the line between a low rating and account termination is undocumented. |
| **G9** | Ban enforcement mechanism | `profiles.is_banned` (or via G21) + RLS predicates + mid-flight booking policy | P2 | The `bans` table records bans but nothing enforces them structurally. Also undefined: what happens to a `confirmed` or `in_progress` booking when a participant is banned. |
| **G10** | Non-permanent ban policy | Duration/expiry on `bans`, or confirmation that `is_permanent` is always true | P2 | `is_permanent` implies temporary bans exist; no policy describes when a lesser sanction applies or how it lifts. |
| **G11** | Manual-approval timeout | `bookings.approval_expires_at` + auto-decline job | P2 | Under `manual_per_guest` an unanswered request hangs indefinitely, blocking the guest and holding a slot — directly contrary to on-demand booking. |
| **G12** | Rating window & reveal policy | `ratings_open_until` or policy; simultaneous-reveal flag | P2 | Undefined: how long parties may rate, whether ratings reveal simultaneously (mitigates retaliation), and whether cancelled bookings are rateable. |

### 8.3 Video protocol (SCHEMA.md §4.8, §4.6)

| ID | Missing element | Shape | Pillar | Why needed |
|---|---|---|---|---|
| **G13** | Gate deadline timestamps | `bookings.opening_deadline_at`, `bookings.closing_deadline_at` timestamptz | P3 | Auto-cancel needs a persisted, queryable deadline — a background job cannot recompute it reliably from `starts_at` alone, especially after an extension moves `ends_at`. Must reflect the **enforced** (~8 min) value, with the stated 5 min as a display constant (see §5.3). |
| **G14** | Auto-cancel as a distinct outcome | `booking_status` value `auto_cancelled`, or `cancellation_reason` enum | P3 | `no_show` cannot distinguish "guest never arrived" from "guest arrived but the gate failed" from "lock was broken." These have different deposit and record consequences. |
| **G15** | Video upload state | `booking_videos.upload_status` (`recording`/`uploading`/`stored`/`failed`), `upload_started_at` | P3 | Recorded-but-not-yet-uploaded is not representable, so a guest who complied on a weak connection is indistinguishable from one who never recorded — and may be penalised for a network failure. |
| **G16** | Closing-failure accrual mechanics | Policy + fields for accrued charges; terminal status for an unclosed session | P3, P4 | "Charges and deposit accrue" is undefined: at what rate, capped where, full or partial capture, grace period, and what terminal status the booking reaches. A booking with no closing video currently has **no path out of `in_progress`.** |
| **G22** | Video quality/validity check | `booking_videos.validity_status` or duration/pan metadata | P3 | Nothing distinguishes a compliant slow 360° pan from a two-second ceiling shot. The gate passes either way, and the evidence value — the pillar's entire purpose — is zero. |

### 8.4 Money (SCHEMA.md §4.10)

| ID | Missing element | Shape | Pillar | Why needed |
|---|---|---|---|---|
| **G17** | Graduation eligibility rule | Explicit criteria for `stranger` → `regular`; exclude non-`completed` bookings | P3, P4 | **Highest-priority gap.** "The booking still counts" after an auto-cancel means a guest who never entered a space could graduate to the more favourable deposit tier by not showing up. Directly enables the gaming SCHEMA.md §4.10's own graduation caveat anticipates. |
| **G18** | Partial capture | `hold_status` value `partially_captured`; `captured_amount numeric` | P4 | `damage_claims.amount_awarded` implies awards below the deposit, but the deposit lifecycle is all-or-nothing. Also needed: a rule that a `disputed` booking's deposit does not auto-release. |
| **G19** | Booking-price payment record | New table `payments`: booking, amount, `provider_ref`, status, refunds | P4 | `deposits` covers only the at-risk amount. **The guest's payment of the booking price itself has no home** — no provider reference, status, or refund path. |
| **G20** | Cancellation & refund policy | `cancellation_reason` enum, `cancelled_by`, refund rules by actor and timing | P2, P4 | `bookings.cancelled_at` exists but nothing records who cancelled or what happens to the money. Host-side cancellation must not cost the guest; guest-side needs a stated policy. |

### 8.5 Cross-cutting

| ID | Missing element | Shape | Pillar | Why needed |
|---|---|---|---|---|
| **G23** | Admin role | Explicit admin role/table + admin-scoped RLS | P1, P2 | `bans.issued_by` and manual verification review both presuppose admins. No admin concept exists in the schema, and the backend checklist's `guest/host/admin` role model was never built. |
| **G24** | Trust event log | Append-only `trust_events`: profile, booking, event type, actor, timestamp, payload | P1–P4 | Verification outcomes, approvals, gate failures, captures, and bans are each recorded (where at all) in isolated tables with no common timeline. Adjudication (§9) needs one ordered history per booking and per user. |

### 8.6 Summary by priority

| Priority | IDs | Rationale |
|---|---|---|
| **Blocking for launch** | G2, G5, G7, G13, G16, G17, G19 | Each blocks a specified mechanism from being implementable at all: bans are evadable, `auto_approve_above_score` has no data to read, new users have undefined approval, auto-cancel has no deadline to fire on, unclosed sessions have no exit from `in_progress`, no-shows can farm tier graduation, and the booking fare is unrecorded. |
| **Needed before real users** | G1, G3, G6, G8, G9, G11, G14, G15, G18, G20, G21, G23 | Enforcement, auditability, and fairness. The system runs without them but behaves unpredictably at edges and cannot explain its own decisions. |
| **Important, can follow** | G4, G10, G12, G22, G24 | Refinements to mechanisms that otherwise function. |

---

## 9. Open questions / TODO

**Explicitly unresolved.** Flagged here rather than answered, and not to be treated as settled by omission.

### 9.1 Damage-claim and adjudication flow (end-to-end)

SCHEMA.md §4.11 defines `damage_claims` with three evidence video references, claim statuses, and outcomes — but **the process is entirely unspecified.** Open:

- Who files, within what window? (SCHEMA.md §6.8 flags the claim-window duration as open — it also determines when `booking_videos.expires_at` fires.)
- What evidence must a host provide beyond the claim video?
- Who adjudicates — platform staff, an automated rule, a third party? Against what standard of proof?
- Can the guest respond or contest? What does the guest see?
- How does an outcome map to money, given partial capture does not yet exist ([G18](#83-money-schemamd-410))?
- What if damage exceeds the deposit? (See insurance, below.)
- Is there an appeal? Does an upheld claim automatically feed a ban ([G8](#82-approval--bans-schemamd-43-413))?
- Timelines at each stage, and what the booking's `disputed` status blocks meanwhile.

**This is the largest unspecified system in the trust architecture.** Pillars 3 and 4 both terminate in it: the video protocol produces evidence *for* adjudication, and the deposit is the fund adjudication *draws on*. Without it, evidence is collected for a process that does not exist, and the deposit has no defined path to a wronged host.

### 9.2 Legal review

Requires qualified Chilean counsel. Not resolvable internally.

- **Lease and reglamento sublet limits.** Many residential leases prohibit subletting, and building *reglamentos de copropiedad* frequently restrict commercial use of residential units. A host may be structurally unable to list lawfully. Open: whether the platform requires hosts to attest to their right to list, whether it verifies it, and where liability sits when a host lists in violation.
- **The casa-de-citas line.** Chilean law regulates establishments in specific categories. Where a short-duration space-rental platform sits relative to that line — and what operational facts move it — needs a legal opinion, not an engineering judgement. This bears directly on how the platform describes itself, what it may require or prohibit of hosts, and what the trust architecture must be able to demonstrate.
- **Tax treatment.** Host income classification and reporting obligations; VAT/IVA on platform fees and on bookings; withholding obligations. Affects `payout_accounts`, and may require tax-identity fields not currently in the schema.

**Legal outcomes can invalidate design decisions.** This should be commissioned early rather than at launch.

### 9.3 Personal-safety mechanisms beyond identity

Pillar 1 screens who may enter; Pillars 3 and 4 address property and money. **No pillar addresses a person's physical safety during a session.** Screening filters recorded history only. Not designed:

- In-session emergency mechanism (panic action, emergency contact, escalation path)
- Whether anyone can be reached during a session, and how fast
- Reporting of unsafe conduct that is not property damage — currently only surfaceable as a rating or an ad-hoc ban
- Whether hosts are warned of on-site risks; whether guests are
- What happens on a credible in-session safety report: who acts, on what authority, how quickly

This is **F4 in [§1](#the-trust-failures-the-system-must-prevent)** — a named failure with no assigned pillar. Given that the product's defining property is a stranger alone in a private space, this is the most significant substantive gap in the architecture, distinct from the schema gaps in §8 because no amount of schema fixes it.

> **Host presence (SCHEMA.md §4.3b) partially touches this, but does not close it.** Listings declare whether the host is on-site (`host_present` / `host_absent` / `host_flexible`, resolved per booking), and a present host is a witness — meaningful supervision that an absent one cannot provide. But it cuts both ways: a present host is also personally exposed to the guest, so presence redistributes the risk rather than removing it. And `host_absent` is precisely the configuration a guest seeking privacy will filter for, meaning the sessions with the least supervision are the ones this mechanism selects for. Presence is a useful signal, not a safety mechanism.

### 9.4 Insurance beyond deposits

Deposits cap liability at X or Y. Damage above that is uncovered, and the platform has no recovery mechanism. Open:

- Is host-damage insurance or a guarantee offered? Underwritten by whom?
- Is liability insurance available for injury occurring in a booked space?
- Does the platform's own liability exposure require coverage?
- Does insurance interact with adjudication (§9.1) — does an upheld claim above the deposit trigger a claim against a policy?
- Do Chilean insurers write policies for this use case at all?

Without this, **the deposit is the ceiling on host protection**, and hosts should be told so plainly rather than discovering it after an incident.

### 9.5 Chilean payment processor — holds and pre-authorizations

**Must be confirmed before Pillar 4 is built.** Required capabilities:

1. **Authorization-only holds** — authorize without capture, hold for the session, release or capture later. **The `regular` tier is defined as this operation.**
2. **Partial capture** — capture less than the authorized amount, for claim awards below the deposit ([G18](#83-money-schemamd-410)).
3. **CLP payouts to Chilean host bank accounts** — SCHEMA.md §6.4 flags this alongside the holds question.
4. **Hold duration** — long enough to cover session plus claim window, which constrains how long the claim window in §9.1 can be.

SCHEMA.md leans Stripe on familiarity grounds, with Transbank/Webpay, Flow, and Khipu as local fallbacks. **This is an external dependency that cannot be verified from inside the codebase, and a negative answer changes Pillar 4's design rather than its parameters** — every user would pay a captured deposit, and the tier model would collapse. Verify early.

### 9.6 Additional unknowns surfaced while writing

*Not on the original list; raised by working through the pillars.*

- **Deposit amounts X and Y.** SCHEMA.md §4.10 explicitly defers these to this document, and they remain open here. A pricing/risk decision: too low and the deterrent fails, too high and booking friction kills conversion. Note X and Y need not be equal — a captured deposit and a frozen hold have very different felt costs.
- **Verification latency vs. the on-demand promise.** Manual admin review means a new user cannot book immediately, which contradicts the core value proposition for exactly the user who arrives with urgent need. Operational: batching, staffing, expectation-setting at signup.
- **Video quality enforcement.** Nothing distinguishes a compliant slow pan from a useless one ([G22](#83-video-protocol-schemamd-48-46)). The gate passes and the evidence is worthless — a failure that only becomes visible during adjudication, when it is too late.
- **Video location/liveness binding.** No guarantee a closing video was recorded in the booked space at the stated time.
- **Rating volatility at low counts.** A pure average over few ratings is severe — one 2★ on two bookings drops a guest to 3.50 and may push them below common thresholds. Consider a minimum count before the score gates approval, or a confidence-adjusted display.
- **Manual approval as a discrimination surface.** `manual_per_guest` lets hosts decline for any reason, with no recorded reason ([G6](#82-approval--bans-schemamd-43-413)). Both a legal and a fairness exposure; currently undetectable.
- **Multi-occupant bookings.** `spaces.max_capacity` permits more than one person, but only the booking guest is screened, rated, and recorded. Everyone else in the space is unverified and unattributable.
- **Ban appeals.** No process. Permanent removal on admin judgement with no recourse is a fairness and legal exposure.
- **Host-side session failures.** A guest who arrives on time and cannot enter because a lock or lockbox fails is currently penalised by the opening gate for a host-side failure ([G14](#83-video-protocol-schemamd-48-46)). Needs a host-fault path.

---

## Appendix — Document relationships

| Document | Owns |
|---|---|
| [`docs/technical/SCHEMA.md`](../technical/SCHEMA.md) | Data model: tables, columns, enums, constraints, RLS, migration path |
| **This document** | Trust logic: what each pillar does, why, user-facing behaviour, lifecycle placement |
| *(future)* Booking lifecycle spec | Full state machine, transition authority, background jobs |
| *(future)* Adjudication spec | §9.1 — the damage-claim process end to end |

**Feedback loop.** Schema gaps in [§8](#8-schema-gaps-surfaced-by-this-document) are inputs to SCHEMA.md. As they are folded in, this document's inline ✅/⚠️/❌ markers should be updated so the two stay consistent.
