import { promises as dns } from "dns";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  let domain: string;

  try {
    const body = await req.json();
    domain = typeof body.domain === "string" ? body.domain.trim().toLowerCase() : "";
  } catch {
    return Response.json({ valid: false }, { status: 400 });
  }

  if (!domain || domain.length > 253 || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
    return Response.json({ valid: false });
  }

  try {
    const records = await dns.resolveMx(domain);
    return Response.json({ valid: records.length > 0 });
  } catch {
    /* ENOTFOUND, ENODATA, SERVFAIL, etc. — domain has no MX records or doesn't exist. */
    return Response.json({ valid: false });
  }
}
