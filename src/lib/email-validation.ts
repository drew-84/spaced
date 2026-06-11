/**
 * SPACED — Email domain validation
 * ─────────────────────────────────────────────────────────────────────────
 *
 * ⚠️  MOCK IMPLEMENTATION — awaiting backend integration (owner: Arturo).
 *
 * Silently checks whether an email's *domain* actually exists. The CONTACTO
 * screen calls this only once an address is structurally complete, and shows
 * "EMAIL INVÁLIDO" exclusively on a `false` result — there is deliberately no
 * spinner / loading / "verificando…" state. The user sees nothing unless the
 * check fails.
 *
 * TODO(Arturo): replace the MOCK body below with the real DNS / MX-record
 * check. Swapping is a one-liner — drop in the fetch and delete the mock:
 *
 *     export async function validateEmailDomain(email: string): Promise<boolean> {
 *       const res = await fetch("/api/validate-email-domain", {
 *         method: "POST",
 *         headers: { "Content-Type": "application/json" },
 *         body: JSON.stringify({ domain: email.split("@")[1] }),
 *       });
 *       const data = await res.json();
 *       return data.valid;
 *     }
 *
 * The mock rejects the reserved `.test` TLD (RFC 6761 — `.test` never resolves
 * in real DNS), so when the real MX check lands, `.test` addresses keep
 * failing and observed behavior stays continuous across the swap.
 */

/** Simulated network latency so the mock behaves like a real round-trip. */
const MOCK_LATENCY_MS = 300;

export async function validateEmailDomain(email: string): Promise<boolean> {
  // ── MOCK START — remove this block when the backend endpoint above is wired.
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return !domain.endsWith(".test");
  // ── MOCK END ───────────────────────────────────────────────────────────
}
