"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { assertPermission } from "@/lib/auth/authorize";
import { logAudit } from "@/lib/audit";
import { ORDER_STATUS_TRANSITIONS, RESTOCKING_STATUSES } from "@/lib/orders";
import { InventoryMovementType, OrderStatus } from "@/generated/prisma/client";
import type { FormState } from "@/lib/actions/auth";

export async function updateOrderStatusAction(
  orderId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await assertPermission("orders.update");

  const nextStatus = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const trackingCode = String(formData.get("trackingCode") ?? "").trim();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { variant: { include: { inventory: true } } } } },
  });
  if (!order) return { status: "error", message: "Pedido não encontrado." };

  const allowed = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    return {
      status: "error",
      message: `Não é possível mudar de "${order.status}" para "${nextStatus}".`,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus as OrderStatus,
        trackingCode: trackingCode || order.trackingCode,
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: nextStatus as OrderStatus,
        note: note || null,
        changedById: session.user.id,
      },
    });

    if (RESTOCKING_STATUSES.has(nextStatus)) {
      for (const item of order.items) {
        if (!item.variant.inventory) continue;
        await tx.inventory.update({
          where: { id: item.variant.inventory.id },
          data: { quantity: { increment: item.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            inventoryId: item.variant.inventory.id,
            type: InventoryMovementType.IN,
            quantity: item.quantity,
            reason: `Pedido ${order.number} — ${nextStatus === "CANCELED" ? "cancelado" : "reembolsado"}`,
            referenceType: "order",
            referenceId: orderId,
            userId: session.user.id,
          },
        });
      }
    }
  });

  await logAudit(session.user.id, "order.status_changed", "Order", orderId, {
    from: order.status,
    to: nextStatus,
  });

  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
  revalidatePath("/conta/pedidos");
  return { status: "success", message: "Status atualizado." };
}
