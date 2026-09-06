import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db/client";

export const PARTNER_REF_COOKIE = "nv_partner_ref";
export const VISITOR_COOKIE = "nv_visitor_id";
const ATTRIBUTION_WINDOW_DAYS = 30;

async function ensureVisitorId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const visitorId = randomUUID();
  store.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return visitorId;
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

/** Records a click for a `?ref=CODE` link and sets the attribution cookie.
 * Silently no-ops for unknown/inactive codes — this runs off untrusted
 * client input, so it must never throw. */
export async function trackReferralClick(code: string, landingPath: string): Promise<void> {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) return;

  const partner = await prisma.partner.findUnique({ where: { code: normalizedCode } });
  if (!partner || partner.status !== "ACTIVE") return;

  const store = await cookies();
  const previousCode = store.get(PARTNER_REF_COOKIE)?.value;

  store.set(PARTNER_REF_COOKIE, normalizedCode, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * ATTRIBUTION_WINDOW_DAYS,
  });

  if (previousCode === normalizedCode) return;

  const visitorId = await ensureVisitorId();
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";

  await prisma.partnerClick.create({
    data: {
      partnerId: partner.id,
      visitorId,
      landingPath,
      userAgent: headerList.get("user-agent"),
      ipHash: ip ? hashIp(ip) : null,
    },
  });
}

/** Read-only lookup of the currently attributed active partner, if any. */
export async function getAttributedPartner() {
  const store = await cookies();
  const code = store.get(PARTNER_REF_COOKIE)?.value;
  if (!code) return null;

  const partner = await prisma.partner.findUnique({ where: { code } });
  if (!partner || partner.status !== "ACTIVE") return null;
  return partner;
}
