"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { assertPermission } from "@/lib/auth/authorize";
import { logAudit } from "@/lib/audit";
import { storeSettingSchema } from "@/lib/validation/settings";
import type { FormState } from "@/lib/actions/auth";

function optionalNumber(value: number | ""): number | null {
  return value === "" ? null : value;
}

export async function updateStoreSettingAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await assertPermission("settings.update");

  const parsed = storeSettingSchema.safeParse({
    storeName: formData.get("storeName"),
    email: formData.get("email") || "",
    whatsapp: formData.get("whatsapp") || undefined,
    instagram: formData.get("instagram") || undefined,
    tiktok: formData.get("tiktok") || undefined,
    addressLine: formData.get("addressLine") || undefined,
    freeShippingThreshold: formData.get("freeShippingThreshold") || "",
    seoTitle: formData.get("seoTitle") || undefined,
    seoDescription: formData.get("seoDescription") || undefined,
    termsUrl: formData.get("termsUrl") || undefined,
    privacyUrl: formData.get("privacyUrl") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const data = {
    storeName: parsed.data.storeName,
    email: parsed.data.email || null,
    whatsapp: parsed.data.whatsapp || null,
    instagram: parsed.data.instagram || null,
    tiktok: parsed.data.tiktok || null,
    addressLine: parsed.data.addressLine || null,
    freeShippingThreshold: optionalNumber(parsed.data.freeShippingThreshold ?? ""),
    seoTitle: parsed.data.seoTitle || null,
    seoDescription: parsed.data.seoDescription || null,
    termsUrl: parsed.data.termsUrl || null,
    privacyUrl: parsed.data.privacyUrl || null,
  };

  await prisma.storeSetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  await logAudit(session.user.id, "settings.updated", "StoreSetting", "singleton", data);

  revalidatePath("/admin/configuracoes");
  revalidatePath("/");
  return { status: "success", message: "Configurações salvas." };
}
