import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

/**
 * SPACED — AI-assisted email-domain typo suggestion
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Called ONLY as the hybrid fallback: the client hits this after the DNS/MX
 * check said the domain is dead AND the local keyboard-heuristic found no
 * correction. Asks Claude Haiku whether the domain looks like a misspelling
 * of a real, well-known email provider, and if so what the correction is.
 *
 * Degrades gracefully in every failure mode — missing API key, malformed
 * body, model error, or "no plausible correction" — by returning
 * { suggestion: null }. It never blocks signup and never throws to the client.
 *
 * ⚠️  Requires ANTHROPIC_API_KEY in the environment (.env.local). Until that
 *     key is present this route returns { suggestion: null } on every call and
 *     the AI layer is effectively dormant — the DNS check + local heuristics
 *     still work.
 */

const MODEL = "claude-haiku-4-5";

/* Structured-output schema — forces Claude to answer with exactly this shape,
 * so no free-text parsing is needed. `suggestion` is the corrected domain, or
 * null when the input is already fine / unrecognizable. */
const SUGGESTION_SCHEMA = {
  type: "object" as const,
  properties: {
    suggestion: {
      type: ["string", "null"] as const,
      description:
        "The corrected email domain (e.g. 'gmail.com') if the input is a likely misspelling of a well-known email provider; otherwise null.",
    },
  },
  required: ["suggestion"],
  additionalProperties: false,
};

function isValidDomainShape(domain: string): boolean {
  return (
    domain.length > 0 &&
    domain.length <= 253 &&
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)
  );
}

export async function POST(req: NextRequest) {
  // No key → the AI layer is dormant. Return cleanly so the client falls back
  // to "no suggestion" without ever seeing an error.
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ suggestion: null });
  }

  let domain: string;
  try {
    const body = await req.json();
    domain = typeof body.domain === "string" ? body.domain.trim().toLowerCase() : "";
  } catch {
    return Response.json({ suggestion: null });
  }

  if (!isValidDomainShape(domain)) {
    return Response.json({ suggestion: null });
  }

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 128,
      system:
        "You correct misspelled email domains. Given a domain, decide if it is a likely typo of a well-known email provider (Gmail, Outlook, Hotmail, Yahoo, iCloud, Proton, etc.) or a well-known company domain. If it clearly is, return the corrected domain. If it is already valid, obscure, or you are not confident, return null. Only correct genuine misspellings — never change a plausibly-real domain.",
      messages: [{ role: "user", content: `Domain: ${domain}` }],
      output_config: { format: { type: "json_schema", schema: SUGGESTION_SCHEMA } },
    });

    const block = response.content.find((b) => b.type === "text");
    const raw = block && block.type === "text" ? block.text : "{}";
    const parsed = JSON.parse(raw);
    const suggestion =
      typeof parsed.suggestion === "string" && parsed.suggestion !== domain
        ? parsed.suggestion
        : null;

    return Response.json({ suggestion });
  } catch {
    // Model error, rate limit, bad key, etc. — degrade to no suggestion.
    return Response.json({ suggestion: null });
  }
}
