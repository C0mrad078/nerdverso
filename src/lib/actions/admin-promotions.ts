"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { assertPermission } from "@/lib/auth/authorize";
import { logAudit } from "@/lib/audit";
import { couponSchema, promotionSchema } from "@/lib/validation/promotions";
import type { FormState } from "@/lib/actions/auth";

function optionalNumber(value: number | ""): number | null {
  return value === "" ? null : value;
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export async function upsertCouponAction(
  couponId: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await assertPermission(couponId ? "coupons.update" : "coupons.create");

  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    description: formData.get("description"),
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    minOrderValue: formData.get("minOrderValue") || "",
    minQuantity: formData.get("minQuantity") || "",
    firstPurchaseOnly: formData.get("firstPurchaseOnly") === "on",
    usageLimit: formData.get("usageLimit") || "",
    usageLimitPerCustomer: formData.get("usageLimitPerCustomer") || "",
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
  if (existing && existing.id !== couponId) {
    return { status: "error", message: "Já existe um cupom com esse código." };
  }

  const data = {
    code: parsed.data.code,
    description: parsed.data.description || null,
    discountType: parsed.data.discountType,
    discountValue: parsed.data.discountValue,
    minOrderValue: optionalNumber(parsed.data.minOrderValue ?? ""),
    minQuantity: optionalNumber(parsed.data.minQuantity ?? ""),
    firstPurchaseOnly: parsed.data.firstPurchaseOnly,
    usageLimit: optionalNumber(parsed.data.usageLimit ?? ""),
    usageLimitPerCustomer: optionalNumber(parsed.data.usageLimitPerCustomer ?? ""),
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
    endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
    active: parsed.data.active,
  };

  if (couponId) {
    await prisma.coupon.update({ where: { id: couponId }, data });
    await logAudit(session.user.id, "coupon.updated", "Coupon", couponId, data);
  } else {
    const created = await prisma.coupon.create({ data });
    await logAudit(session.user.id, "coupon.created", "Coupon", created.id, data);
  }

  revalidatePath("/admin/cupons");
  return { status: "success", message: "Cupom salvo." };
}

export async function deleteCouponAction(formData: FormData) {
  const session = await assertPermission("coupons.delete");
  const couponId = String(formData.get("couponId") ?? "");
  if (!couponId) return;

  await prisma.coupon.delete({ where: { id: couponId } }).catch(async () => {
    await prisma.coupon.update({ where: { id: couponId }, data: { active: false } });
  });
  await logAudit(session.user.id, "coupon.deleted", "Coupon", couponId);
  revalidatePath("/admin/cupons");
}

// ---------------------------------------------------------------------------
// Promotions
// ---------------------------------------------------------------------------

export async function upsertPromotionAction(
  promotionId: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await assertPermission(promotionId ? "promotions.update" : "promotions.create");

  const parsed = promotionSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    discountValue: formData.get("discountValue") || "",
    buyQuantity: formData.get("buyQuantity") || "",
    getQuantity: formData.get("getQuantity") || "",
    minQuantity: formData.get("minQuantity") || "",
    minOrderValue: formData.get("minOrderValue") || "",
    priority: formData.get("priority"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    active: formData.get("active") === "on",
    categoryIds: formData.getAll("categoryIds"),
    collectionIds: formData.getAll("collectionIds"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const data = {
    name: parsed.data.name,
    type: parsed.data.type,
    discountValue: optionalNumber(parsed.data.discountValue ?? ""),
    buyQuantity: optionalNumber(parsed.data.buyQuantity ?? ""),
    getQuantity: optionalNumber(parsed.data.getQuantity ?? ""),
    minQuantity: optionalNumber(parsed.data.minQuantity ?? ""),
    minOrderValue: optionalNumber(parsed.data.minOrderValue ?? ""),
    priority: parsed.data.priority,
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
    endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
    active: parsed.data.active,
  };

  const promotion = promotionId
    ? await prisma.promotion.update({ where: { id: promotionId }, data })
    : await prisma.promotion.create({ data });

  await prisma.promotionCategory.deleteMany({ where: { promotionId: promotion.id } });
  await prisma.promotionCategory.createMany({
    data: parsed.data.categoryIds.map((categoryId) => ({ promotionId: promotion.id, categoryId })),
  });
  await prisma.promotionCollection.deleteMany({ where: { promotionId: promotion.id } });
  await prisma.promotionCollection.createMany({
    data: parsed.data.collectionIds.map((collectionId) => ({ promotionId: promotion.id, collectionId })),
  });

  await logAudit(
    session.user.id,
    promotionId ? "promotion.updated" : "promotion.created",
    "Promotion",
    promotion.id,
    { name: parsed.data.name },
  );

  revalidatePath("/admin/promocoes");
  return { status: "success", message: "Promoção salva." };
}

export async function deletePromotionAction(formData: FormData) {
  const session = await assertPermission("promotions.delete");
  const promotionId = String(formData.get("promotionId") ?? "");
  if (!promotionId) return;

  await prisma.promotion.delete({ where: { id: promotionId } });
  await logAudit(session.user.id, "promotion.deleted", "Promotion", promotionId);
  revalidatePath("/admin/promocoes");
}
