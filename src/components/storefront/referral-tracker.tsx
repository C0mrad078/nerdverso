"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackReferralAction } from "@/lib/actions/partners";

export function ReferralTracker() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (!ref) return;
    trackReferralAction(ref, window.location.pathname).catch(() => {});
  }, [ref]);

  return null;
}
