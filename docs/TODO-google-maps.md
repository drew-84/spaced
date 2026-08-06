# TODO — Google Maps setup (unfinished)

**Status as of 2026-08-05:** billing fixed, one step remaining.

## What happened

The site looked broken locally. Two unrelated causes, neither related to the
Spacio → Lugarmi rename:

1. **Supabase project was paused** (free tier auto-pauses after inactivity).
   Its hostname stopped resolving, so all data fetches failed.
   **Resolved** — project restored, spaces load again.
2. **Google Cloud billing account was closed** (free trial expired).
   Maps returned `BillingNotEnabledMapError`.
   **Resolved** — account activated via Billing → Upgrade.

## The one step left

The Maps API key is restricted to **Maps JavaScript API only**, but the app
calls three Google APIs. The other two currently fail with `REQUEST_DENIED`.

| API | Used by |
|---|---|
| Maps JavaScript | `src/components/hero-location-map.tsx`, `src/components/property-detail/property-map.tsx`, `src/components/landing/host-cards-section.tsx` |
| Distance Matrix | `src/components/landing/host-cards-section.tsx` (~line 126) |
| Geocoding | `src/components/list-space/list-space-experience.tsx` (~line 122) |

**Fix:** open
<https://console.cloud.google.com/apis/credentials?project=airy-gate-493718-v3>
→ click "Maps Platform API Key" → **API restrictions** → check all three APIs
above → Save. Takes up to 5 min to propagate.

Also confirm all three are enabled under APIs & Services → Library.

## Optional, not required

- **Budget alert** — Billing → Budgets & alerts. Set to `5` (not `0` — that
  errors). Emails only; does not cap spending.
- **Quota cap** — the real hard stop. APIs & Services → Maps JavaScript API →
  Quotas → set requests/day to ~1000. Raise before production traffic.

Current spend is $0 with $0 forecast. The key is referrer-restricted to
`localhost:3000`, so it can't be used from elsewhere.

## Reference

- GCP project: `My Maps Project` / `airy-gate-493718-v3`
- Billing account: `01B9F4-875508-2AD133`
- Supabase project: `xabvczxsuifivkqimmlc`
- Free-trial resources are deleted if not upgraded by **2026-08-17** (already
  upgraded, so this deadline no longer applies)
