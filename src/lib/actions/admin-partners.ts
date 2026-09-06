"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { assertPermission } from "@/lib/auth/authorize";
import { logAudit } from "@/lib/audit";
import { slugify } from "@/lib/slugify";
import { partnerLinkSchema, partnerSchema } from "@/lib/validation/partners";
import type { FormState } from "@/lib/actions/auth";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

async function generatePartnerCode(name: string): Promise<string> {
  const base = slugify(name).toUpperCase().replace(/-/g, "").slice(0, 10) || "PARCEIRO";
  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = attempt === 0 ? "" : randomBytes(2).toString("hex").toUpperCase();
    const code = `${base}${suffix}`;
    const existing = await prisma.partner.findUnique({ where: { code } });
    if (!existing) return code;
  }
  return `${base}${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function upsertPartnerAction(
  partnerId: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await assertPermission(partnerId ? "partners.update" : "partners.create");

  const parsed = partnerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    commissionPercent: formData.get("commissionPercent"),
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existingEmail = await prisma.partner.findUnique({ where: { email: parsed.data.email } });
  if (existingEmail && existingEmail.id !== partnerId) {
    return { status: "error", message: "Já existe um parceiro com esse e-mail." };
  }

  const data = {
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    commissionPercent: parsed.data.commissionPercent,
    status: parsed.data.status,
    notes: parsed.data.notes || null,
  };

  if (partnerId) {
    await prisma.partner.update({ where: { id: partnerId }, data });
    await logAudit(session.user.id, "partner.updated", "Partner", partnerId, data);
  } else {
    const code = await generatePartnerCode(parsed.data.name);
    const created = await prisma.partner.create({ data: { ...data, code } });
    await logAudit(session.user.id, "partner.created", "Partner", created.id, { ...data, code });
  }

  revalidatePath("/admin/parceiros");
  return { status: "success", message: "Parceiro salvo." };
}

export async function deletePartnerAction(formData: FormData) {
  const session = await assertPermission("partners.delete");
  const partnerId = String(formData.get("partnerId") ?? "");
  if (!partnerId) return;

  await prisma.partner.delete({ where: { id: partnerId } }).catch(async () => {
    await prisma.partner.update({ where: { id: partnerId }, data: { status: "INACTIVE" } });
  });
  await logAudit(session.user.id, "partner.deleted", "Partner", partnerId);
  revalidatePath("/admin/parceiros");
}

export async function createPartnerLinkAction(
  partnerId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await assertPermission("partners.update");

  const parsed = partnerLinkSchema.safeParse({
    path: formData.get("path"),
    label: formData.get("label") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const link = await prisma.partnerLink.create({
    data: { partnerId, path: parsed.data.path, label: parsed.data.label || null },
  });
  await logAudit(session.user.id, "partner_link.created", "PartnerLink", link.id, parsed.data);

  revalidatePath(`/admin/parceiros/${partnerId}`);
  return { status: "success", message: "Link criado." };
}

export async function deletePartnerLinkAction(formData: FormData) {
  const session = await assertPermission("partners.update");
  const linkId = String(formData.get("linkId") ?? "");
  const partnerId = String(formData.get("partnerId") ?? "");
  if (!linkId || !partnerId) return;

  await prisma.partnerLink.delete({ where: { id: linkId } });
  await logAudit(session.user.id, "partner_link.deleted", "PartnerLink", linkId);
  revalidatePath(`/admin/parceiros/${partnerId}`);
}

export async function closeCommissionPeriodAction(formData: FormData) {
  const session = await assertPermission("partners.update");
  const partnerId = String(formData.get("partnerId") ?? "");
  const period = String(formData.get("period") ?? "");
  if (!partnerId || !/^\d{4}-\d{2}$/.test(period)) return;

  const [year, month] = period.split("-").map(Number);
  const periodStart = new Date(Date.UTC(year, month - 1, 1));
  const periodEnd = new Date(Date.UTC(year, month, 1));

  const conversions = await prisma.partnerConversion.findMany({
    where: { partnerId, createdAt: { gte: periodStart, lt: periodEnd } },
    include: { order: { select: { total: true } } },
  });

  const totalSales = conversions.reduce((sum, c) => sum + toNumber(c.order.total), 0);
  const totalCommission = conversions.reduce((sum, c) => sum + toNumber(c.commissionAmount), 0);

  await prisma.partnerCommission.upsert({
    where: { partnerId_period: { partnerId, period } },
    create: { partnerId, period, totalSales, totalCommission, status: "paid", paidAt: new Date() },
    update: { totalSales, totalCommission, status: "paid", paidAt: new Date() },
  });

  await logAudit(session.user.id, "partner_commission.closed", "PartnerCommission", partnerId, {
    period,
    totalCommission,
  });

  revalidatePath(`/admin/parceiros/${partnerId}`);
}
