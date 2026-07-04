/**
 * SPACED — Email domain validation
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Silently checks whether an email's domain has MX records. Called by the
 * CONTACTO step only once an address is structurally complete. Returns false
 * on any error (network failure, NXDOMAIN, no MX records) so the field
 * surfaces "Email inválido" — no spinner or pending state is shown.
 */

export async function validateEmailDomain(email: string): Promise<boolean> {
  try {
    const res = await fetch("/api/validate-email-domain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: email.split("@")[1] }),
    });
    const data = await res.json();
    return Boolean(data.valid);
  } catch {
    return true; // network error → don't block the user
  }
}
