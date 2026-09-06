import { prisma } from "@/lib/db/client";
import { OrderStatus } from "@/generated/prisma/client";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

const REVENUE_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.IN_SEPARATION,
  OrderStatus.IN_PRODUCTION,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

export type DateRange = { from: Date; to: Date };

export function resolveDateRange(period: string | undefined): DateRange {
  const now = new Date();
  const to = now;
  const from = new Date(now);

  switch (period) {
    case "7d":
      from.setDate(from.getDate() - 7);
      break;
    case "30d":
      from.setDate(from.getDate() - 30);
      break;
    case "month":
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
      break;
    case "today":
    default:
      from.setHours(0, 0, 0, 0);
      break;
  }
  return { from, to };
}

export async function getSalesSummary(range: DateRange) {
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: range.from, lte: range.to }, status: { in: REVENUE_STATUSES } },
    select: { total: true },
  });
  const revenue = orders.reduce((sum, o) => sum + toNumber(o.total), 0);
  const count = orders.length;
  return { revenue, count, averageTicket: count > 0 ? revenue / count : 0 };
}

export async function getPendingOrdersCount() {
  return prisma.order.count({ where: { status: OrderStatus.AWAITING_PAYMENT } });
}

export async function getRecentOrders(limit = 8) {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true, email: true } } },
  });
  return orders.map((o) => ({
    id: o.id,
    number: o.number,
    createdAt: o.createdAt,
    status: o.status,
    total: toNumber(o.total),
    customerName: o.user?.name ?? "Convidado",
  }));
}

export async function getLowStockVariants(limit = 8) {
  const inventories = await prisma.inventory.findMany({
    where: { quantity: { gt: 0 } },
    include: { variant: { include: { product: true, values: { include: { attributeValue: true } } } } },
    orderBy: { quantity: "asc" },
    take: limit * 3,
  });
  return inventories
    .filter((inv) => inv.quantity <= inv.minStock)
    .slice(0, limit)
    .map((inv) => ({
      id: inv.id,
      productName: inv.variant.product.name,
      variantLabel: inv.variant.values.map((v) => v.attributeValue.value).join(" / "),
      quantity: inv.quantity,
      minStock: inv.minStock,
    }));
}

export async function getOutOfStockCount() {
  return prisma.inventory.count({ where: { quantity: { lte: 0 } } });
}

export async function getTopSellingProducts(range: DateRange, limit = 5) {
  const items = await prisma.orderItem.groupBy({
    by: ["productId", "productName"],
    where: { order: { createdAt: { gte: range.from, lte: range.to }, status: { in: REVENUE_STATUSES } } },
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });
  return items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    quantity: item._sum.quantity ?? 0,
    revenue: toNumber(item._sum.total),
  }));
}

export async function getCustomerCount() {
  return prisma.customer.count();
}
