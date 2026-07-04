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

/* ─── Domain typo suggestions ────────────────────────────────────────────────
 *
 * suggestDomainLocally — instant, free, client-side. Keyboard-adjacency-aware
 * distance against a small list of the most common providers. Catches the
 * obvious cases (gmial→gmail, hotmial→hotmail). Hint-only — never blocks the
 * user; called only after the DNS check says the domain is dead.
 */

export type DomainSuggestion = {
  correctedEmail: string;
  /** Local part + "@" + everything up to and including the last dot. */
  beforeTld: string;
  /** The corrected TLD — rendered slightly brighter. */
  tld: string;
} | null;

/* The handful of providers a local heuristic can confidently correct toward.
 * Kept deliberately small — only the domains that dominate real typo traffic. */
const COMMON_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "live.com",
  "proton.me",
  "protonmail.com",
];

/* Adjacency map (QWERTY) — a substitution between adjacent keys counts as a
 * "cheaper" error than a substitution between distant keys, so genuine fat-
 * finger typos score lower distance than coincidental letter overlap. */
const KEY_NEIGHBORS: Record<string, string> = {
  q: "wa", w: "qeas", e: "wrds", r: "etdf", t: "rygf", y: "tuhg", u: "yijh",
  i: "uokj", o: "iplk", p: "ol", a: "qwsz", s: "awedxz", d: "serfcx",
  f: "drtgvc", g: "ftyhbv", h: "gyujnb", j: "huikmn", k: "jiolm", l: "kop",
  z: "asx", x: "zsdc", c: "xdfv", v: "cfgb", b: "vghn", n: "bhjm", m: "njk",
};

/** Substitution cost: 0 if same, ~0.5 if adjacent keys, 1 otherwise. */
function subCost(a: string, b: string): number {
  if (a === b) return 0;
  if (KEY_NEIGHBORS[a]?.includes(b)) return 0.5;
  return 1;
}

/**
 * Keyboard-adjacency-weighted Damerau-Levenshtein. Lower = more plausible
 * typo. Includes an adjacent-transposition case (Damerau) so a swapped pair
 * like "gmial"→"gmail" costs ~1, not 2 — transpositions are among the most
 * common email typos. Needs three rows (not two) because the transposition
 * term reaches back two rows.
 */
function weightedDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  let prev2 = new Array(n + 1); // row i-2
  let prev = new Array(n + 1);  // row i-1
  const curr = new Array(n + 1); // row i
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      let best = Math.min(
        prev[j] + 1,                              // deletion
        curr[j - 1] + 1,                          // insertion
        prev[j - 1] + subCost(a[i - 1], b[j - 1]), // substitution (weighted)
      );
      // Adjacent transposition (Damerau): a[i-1]a[i-2] == b[j-2]b[j-1].
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        best = Math.min(best, prev2[j - 2] + 1);
      }
      curr[j] = best;
    }
    prev2 = prev.slice();
    prev = curr.slice();
  }
  return prev[n];
}

function buildSuggestion(email: string, correctedDomain: string): DomainSuggestion {
  const atIdx = email.indexOf("@");
  const correctedEmail = email.slice(0, atIdx + 1) + correctedDomain;
  const lastDot = correctedEmail.lastIndexOf(".");
  return {
    correctedEmail,
    beforeTld: correctedEmail.slice(0, lastDot + 1),
    tld: correctedEmail.slice(lastDot + 1),
  };
}

/**
 * Local heuristic. Returns a suggestion only when the typed domain is a close
 * (weighted distance ≤ 1.5) match to a common provider but isn't itself one.
 * Tight threshold → very few false positives.
 */
export function suggestDomainLocally(email: string): DomainSuggestion {
  const atIdx = email.indexOf("@");
  if (atIdx < 0) return null;
  const domain = email.slice(atIdx + 1).toLowerCase();
  if (!domain.includes(".")) return null;
  if (COMMON_DOMAINS.includes(domain)) return null;

  let best: string | null = null;
  let bestDist = Infinity;
  for (const known of COMMON_DOMAINS) {
    const d = weightedDistance(domain, known);
    if (d < bestDist) { bestDist = d; best = known; }
  }

  if (best === null || bestDist > 1.5) return null;
  return buildSuggestion(email, best);
}
