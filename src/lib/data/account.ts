import { prisma } from "@/lib/db/client";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export async function getAddressesForUser(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function getAddressForUser(userId: string, addressId: string) {
  return prisma.address.findFirst({ where: { id: addressId, userId } });
}

export type OrderSummary = {
  id: string;
  number: string;
  createdAt: Date;
  status: string;
  total: number;
  itemCount: number;
};

export async function getOrdersForUser(userId: string): Promise<OrderSummary[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return orders.map((order) => ({
    id: order.id,
    number: order.number,
    createdAt: order.createdAt,
    status: order.status,
    total: toNumber(order.total),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  }));
}

export async function getOrderForUser(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: true,
      shippingAddress: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      payments: true,
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
  };
}
