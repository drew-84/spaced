# TRUST-ARCHITECTURE.md

> The trust and safety architecture for Lugarmi — an on-demand marketplace for booking
> real private spaces by the hour in Santiago, Chile. This document defines the principles
> and mechanisms by which the platform earns and protects the trust of both hosts and guests.
> Strategy and product direction are settled elsewhere; this document translates the
> trust-relevant parts of that strategy into an architecture the codebase can implement.

Status: **living document.** Section 10 (Payments & Compliance) is stubbed pending input from
a Chilean payments/regulatory advisor — see the open questions in that section.

---

## 0. Purpose & scope

This document covers **how Lugarmi becomes trustworthy enough that a person will let a stranger
into a private space, on demand.** It is the reference for every product and engineering
decision that touches identity, safety, money-holding, reputation, content, incidents, or
abuse. It is deliberately about *trust mechanisms*, not features — features are built to serve
the principles here, not the other way around.

Out of scope: the strategic wedge, category architecture, and brand positioning (settled
separately). This document assumes those as fixed inputs.

---

## 1. Why trust is load-bearing (the core premise)

Lugarmi's core action — **book a private space near you, right now** — places two strangers in
close contact around someone's real physical space, often a residential one, frequently on
short notice. That is a fundamentally different risk surface from a purely digital marketplace:

- The **host's** downside is not a bad review; it is something happening in a space they own.
- The **guest's** downside is entering an unfamiliar private space arranged by a stranger.
- The **platform's** exposure is the duty of care created by having introduced them.

Because of this, trust is not a feature bolted on later — it is the product's licence to exist.
Supply (hosts saying "yes") collapses on the first serious incident, and supply is the binding
constraint on the whole business. Therefore **every trust mechanism below is treated as
load-bearing infrastructure, not polish.**

---

## 2. Foundational principle: the neutral intermediary

Lugarmi is a **neutral intermediary that sells access to space and time.** The platform
facilitates a booking between a host and a guest; it is not the merchant-of-record for whatever
activity occurs inside the space, and it does not resell the space as its own inventory.

This single principle is load-bearing in three directions at once:

1. **Trust** — the platform's role is clear and limited: it verifies, holds funds, mediates
   disputes, and enforces policy. It does not pretend to supervise what it cannot.
2. **Legal / payments** — as a facilitator taking a service commission (not a principal
   reselling a service it owns), the platform sits in a cleaner regulatory and tax position.
   This is the spine of Section 10.
3. **Expansion** — the same neutral "space + time + purpose" model extends to new booking
   categories without re-architecture.

**Design rule:** the platform charges for *bookings*; listings describe the *space*; the use
case is defined by the guest and host. Nothing in the product's copy, taxonomy, take-rate
structure, or payment descriptors should imply the platform is selling the *activity* rather
than *access to the space*.

---

## 3. Identity & verification

Trust on both sides starts with knowing who the counterparty is. Verification is tiered so that
onboarding friction scales with the trust required.

**Guests**
- Verified email and phone (OTP) at minimum before a first booking.
- Payment instrument on file (itself a soft identity and accountability signal).
- Escalating verification (e.g. government ID) gated to higher-risk or higher-value bookings.

**Hosts**
- Verified email, phone, and identity before a listing can go live.
- Bank/payout details verified before any payout (ties into Section 10 payouts to individuals).
- Proof-of-control of the space where feasible.

**Principle:** verification data is collected for safety and accountability, stored minimally,
and never exposed across the two sides beyond what a booking requires (see Section 9).

---

## 4. The two-sided trust model

The platform must protect **both** parties, whose risks are asymmetric:

| Party | Primary fear | Primary protection |
|---|---|---|
| Host | Damage, misuse, or an incident in their space | Guest verification, reviews, held funds/deposit, incident response, clear house rules per listing |
| Guest | Unsafe or misrepresented space, mistreatment | Host verification, accurate listings, reviews, held funds released only after the booking, incident response |

Neither side is the "customer" at the other's expense. Policy, dispute resolution, and product
defaults are designed to be **even-handed**, because losing trust on *either* side kills
liquidity.

---

## 5. Booking & fund-holding (the escrow trust mechanism)

The central trust mechanism is **holding the guest's payment and releasing it to the host only
after the booking has taken place**, rather than paying the host up front.

Why this matters:
- It protects the **guest** — money isn't gone before they've received what they booked.
- It protects the **host** — payment is committed and guaranteed at booking time.
- It gives the platform a **window to mediate** disputes, no-shows, and incidents before funds
  move.
- It underpins any **deposit / damage-hold** model for higher-risk bookings.

**This mechanism is dependent on the payments and regulatory answers in Section 10** — in
particular, whether the platform may legally hold client funds in Chile without triggering
financial-services regulation, and which processor supports delayed release / split payouts.
Until those answers arrive, treat fund-holding as the *intended* design, implemented behind a
payments interface that can adapt to the advisor's guidance.

---

## 6. Reviews, reputation & ratings

Reputation is how trust compounds over time and how the platform's verification burden decreases
as the network matures.

- **Two-sided reviews:** hosts review guests and guests review hosts, revealed simultaneously
  (or after both submit / a window closes) to reduce retaliation bias.
- Reputation signals feed verification tiering (Section 3) and risk scoring (Section 11).
- Reviews are tied to *completed, paid bookings only* — no reviews without a real transaction,
  to prevent fake reputation.

---

## 7. Content & listing policy (the clean-frame discipline)

The platform's trustworthiness is partly a function of how it *reads*. Listing content is
therefore actively curated and moderated:

- Listings describe the **space** — its features, capacity, rules, and availability — in a
  clean, aspirational, and accurate register. Imagery quality is a hard gate.
- Misrepresentation (inaccurate photos, false availability, bait listings) is a policy
  violation with escalating consequences.
- The platform maintains an acceptable-use policy for listings and bookings. As a neutral
  intermediary it does not police lawful private use, but it **does not market to, design
  around, or depend on** any illicit or policy-violating use, and it removes content or
  accounts that break policy.
- Moderation combines automated checks (at listing creation and edit) with human review of
  flags and escalations.

---

## 8. Incident handling & safety response

Trust survives incidents only if there is a credible response when something goes wrong.

- **Reporting:** an in-product path for either party to report a problem during or after a
  booking, with severity levels.
- **Response:** defined playbooks for the common cases — no-show, damage, misrepresentation,
  safety concern — including who is contacted, what evidence is gathered, and how held funds
  (Section 5) are handled.
- **Escalation:** a clear line from in-product report to human intervention, and, where
  warranted, to authorities — with the platform's role and limits stated honestly (it does not
  over-promise confidentiality or outcomes it cannot guarantee).
- **Insurance / liability:** an open item — what coverage (host-damage protection, liability)
  the platform provides or requires is to be defined; flagged in Section 12.

---

## 9. Data protection & privacy

The platform holds sensitive data: identities, home addresses, payment details, booking
histories, and location.

- **Minimization:** collect only what a booking or safety obligation requires; retain only as
  long as needed.
- **Separation:** the two sides see only what a booking requires (e.g. precise address released
  to a confirmed guest at the appropriate time, not before).
- **Compliance:** align with Chilean personal-data law and payment-data handling standards
  (the latter tied to Section 10). Payment credentials are handled by the processor, not stored
  by the platform, wherever possible.
- **Secrets:** application secrets and keys are never committed to the repo; managed via
  environment configuration.

---

## 10. Payments & compliance — ⚠️ PENDING ADVISOR INPUT

This section is **stubbed.** It defines the payment and regulatory backbone that Sections 2, 5,
and 9 depend on, and it is waiting on input from a Chilean payments/regulatory advisor. Do not
finalize payment architecture until these are answered; build payments behind an interface so
the answers can be slotted in without disrupting the booking loop.

**The intended shape (to be confirmed or corrected by the advisor):** a neutral-intermediary
marketplace that takes a service commission, holds the guest's funds until the booking
completes, and pays out to individual hosts — sitting in the lowest-risk merchant and tax
category that this model allows.

**Open questions sent to the advisor (answers to be recorded here as they arrive):**

1. **Money-flow model** — Should the platform collect payment and then pay hosts out
   (merchant-of-record), or use a split-payment marketplace model where hosts are paid directly?
   Which is cleaner for a Chilean marketplace paying many individual hosts (natural persons)?
2. **Processor** — Which Chilean processor supports that split/marketplace model with payouts to
   natural persons (Transbank/Webpay, Mercado Pago, Kushki, Fintoc, other)?
3. **Fund-holding / escrow** — Can the platform hold the booking payment and release it to the
   host only after the booking occurs (the Section 5 trust mechanism)? Does holding client funds
   trigger any CMF/regulatory requirement?
4. **Tax** — Who is responsible for IVA and the boleta, the platform or the host? Are there
   withholding obligations on payouts to hosts?

Downstream decisions blocked on the above: escrow implementation (§5), deposit/damage holds
(§4), payment-data handling specifics (§9), and the platform's take-rate mechanics.

---

## 11. Abuse & fraud prevention

- **Fake listings / hosts:** verification gates (§3), moderation (§7), and reputation (§6).
- **Payment fraud & chargebacks:** to be defined with the processor once Section 10 resolves;
  held funds (§5) provide a mediation window.
- **No-shows & cancellations:** clear policy, tied to the fund-holding flow, even-handed across
  both parties.
- **Risk scoring:** verification level, reputation, and behavioral signals combine into a risk
  signal that gates higher verification or blocks bad actors.

---

## 12. Open questions / decisions log

- [ ] **Payments & compliance (§10)** — awaiting advisor answers to the four questions above.
- [ ] **Insurance / liability (§8)** — what host-damage / liability coverage the platform
      provides or requires.
- [ ] **Deposit / damage-hold model (§4/§5)** — whether and how deposits are held, dependent on §10.
- [ ] **Verification tiers (§3)** — exact thresholds at which government-ID verification is required.
- [ ] **Review reveal mechanics (§6)** — simultaneous reveal vs. double-blind window.

**Decisions settled (from strategy):**
- Neutral-intermediary model — platform sells access to space + time, not the activity (§2).
- Fund-holding / release-after-booking is the intended core trust mechanism (§5), pending §10.
- Even-handed, two-sided trust and policy design (§4).
- Clean, curated listing content with a hard imagery-quality gate (§7).
