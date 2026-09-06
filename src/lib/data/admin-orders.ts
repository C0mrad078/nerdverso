import { prisma } from "@/lib/db/client";
import type { OrderStatus } from "@/generated/prisma/client";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export type OrderFilters = {
  status?: string;
  from?: Date;
  to?: Date;
};

export async function getOrdersAdmin(filters: OrderFilters) {
  const orders = await prisma.order.findMany({
    where: {
      status: filters.status ? (filters.status as OrderStatus) : undefined,
      createdAt:
        filters.from || filters.to
          ? { gte: filters.from, lte: filters.to }
          : undefined,
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return orders.map((o) => ({
    id: o.id,
    number: o.number,
    createdAt: o.createdAt,
    status: o.status,
    total: toNumber(o.total),
    customerName: o.user?.name ?? "Convidado",
    customerEmail: o.user?.email ?? "",
    paymentMethod: o.payments[0]?.method ?? null,
    paymentStatus: o.payments[0]?.status ?? null,
  }));
}

export async function getOrderByIdAdmin(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: true,
      shippingAddress: true,
      billingAddress: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { createdAt: "desc" } },
      coupon: { select: { code: true } },
      partner: { select: { name: true, code: true } },
    },
  });
  if (!order) return null;

  return {
    ...order,
    subtotal: toNumber(order.subtotal),
    discountTotal: toNumber(order.discountTotal),
    shippingTotal: toNumber(order.shippingTotal),
    total: toNumber(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: toNumber(item.unitPrice),
      total: toNumber(item.total),
    })),
    payments: order.payments.map((p) => ({ ...p, amount: toNumber(p.amount) })),
  };
}
