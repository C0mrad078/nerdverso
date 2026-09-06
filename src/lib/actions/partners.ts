"use server";

import { trackReferralClick } from "@/lib/partners/attribution";

export async function trackReferralAction(code: string, landingPath: string): Promise<void> {
  await trackReferralClick(code, landingPath);
}
