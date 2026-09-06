"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { assertPermission } from "@/lib/auth/authorize";
import { logAudit } from "@/lib/audit";
import { InventoryMovementType } from "@/generated/prisma/client";
import type { FormState } from "@/lib/actions/auth";

const movementSchema = z.object({
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.coerce.number().int().positive("Informe uma quantidade maior que zero."),
  reason: z.string().trim().min(2, "Descreva o motivo do ajuste."),
});

export async function adjustInventoryAction(
  inventoryId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await assertPermission("inventory.update");

  const parsed = movementSchema.safeParse({
    type: formData.get("type"),
    quantity: formData.get("quantity"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const inventory = await prisma.inventory.findUnique({ where: { id: inventoryId } });
  if (!inventory) return { status: "error", message: "Item de estoque não encontrado." };

  const delta =
    parsed.data.type === "OUT"
      ? -parsed.data.quantity
      : parsed.data.type === "IN"
        ? parsed.data.quantity
        : parsed.data.quantity - inventory.quantity; // ADJUSTMENT sets an absolute target

  const nextQuantity = inventory.quantity + delta;
  if (nextQuantity < 0) {
    return { status: "error", message: "Isso deixaria o estoque negativo." };
  }

  await prisma.$transaction([
    prisma.inventory.update({ where: { id: inventoryId }, data: { quantity: nextQuantity } }),
    prisma.inventoryMovement.create({
      data: {
        inventoryId,
        type: parsed.data.type as InventoryMovementType,
        quantity: delta,
        reason: parsed.data.reason,
        referenceType: "manual",
        userId: session.user.id,
      },
    }),
  ]);

  await logAudit(session.user.id, "inventory.adjusted", "Inventory", inventoryId, {
    type: parsed.data.type,
    delta,
    reason: parsed.data.reason,
  });

  revalidatePath("/admin/estoque");
  return { status: "success", message: "Estoque atualizado." };
}

export async function updateMinStockAction(formData: FormData) {
  const session = await assertPermission("inventory.update");
  const inventoryId = String(formData.get("inventoryId") ?? "");
  const minStock = Number(formData.get("minStock") ?? 0);
  if (!inventoryId || Number.isNaN(minStock) || minStock < 0) return;

  await prisma.inventory.update({ where: { id: inventoryId }, data: { minStock } });
  await logAudit(session.user.id, "inventory.min_stock_updated", "Inventory", inventoryId, { minStock });
  revalidatePath("/admin/estoque");
}
