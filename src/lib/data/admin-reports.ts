import { prisma } from "@/lib/db/client";
import { OrderStatus } from "@/generated/prisma/client";
import { type DateRange } from "@/lib/data/admin-dashboard";

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

export async function getItemsSoldCount(range: DateRange) {
  const result = await prisma.orderItem.aggregate({
    where: { order: { createdAt: { gte: range.from, lte: range.to }, status: { in: REVENUE_STATUSES } } },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}

export async function getSalesByCategory(range: DateRange, limit = 10) {
  const items = await prisma.orderItem.findMany({
    where: { order: { createdAt: { gte: range.from, lte: range.to }, status: { in: REVENUE_STATUSES } } },
    select: {
      quantity: true,
      total: true,
      product: { select: { categories: { select: { category: { select: { name: true } } } } } },
    },
  });

  const byCategory = new Map<string, { quantity: number; revenue: number }>();
  for (const item of items) {
    const categoryNames = item.product.categories.map((c) => c.category.name);
    const names = categoryNames.length > 0 ? categoryNames : ["Sem categoria"];
    for (const name of names) {
      const entry = byCategory.get(name) ?? { quantity: 0, revenue: 0 };
      entry.quantity += item.quantity;
      entry.revenue += toNumber(item.total);
      byCategory.set(name, entry);
    }
  }

  return Array.from(byCategory.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export async function getTopCustomers(range: DateRange, limit = 10) {
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: range.from, lte: range.to }, status: { in: REVENUE_STATUSES }, userId: { not: null } },
    select: { total: true, userId: true, user: { select: { name: true, email: true } } },
  });

  const byCustomer = new Map<string, { name: string; email: string; orders: number; revenue: number }>();
  for (const order of orders) {
    if (!order.userId || !order.user) continue;
    const entry = byCustomer.get(order.userId) ?? {
      name: order.user.name,
      email: order.user.email,
      orders: 0,
      revenue: 0,
    };
    entry.orders += 1;
    entry.revenue += toNumber(order.total);
    byCustomer.set(order.userId, entry);
  }

  return Array.from(byCustomer.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export async function getCouponPerformance(range: DateRange, limit = 10) {
  const usages = await prisma.couponUsage.findMany({
    where: { createdAt: { gte: range.from, lte: range.to } },
    select: { discountAmount: true, coupon: { select: { code: true } } },
  });

  const byCoupon = new Map<string, { code: string; uses: number; totalDiscount: number }>();
  for (const usage of usages) {
    const entry = byCoupon.get(usage.coupon.code) ?? { code: usage.coupon.code, uses: 0, totalDiscount: 0 };
    entry.uses += 1;
    entry.totalDiscount += toNumber(usage.discountAmount);
    byCoupon.set(usage.coupon.code, entry);
  }

  return Array.from(byCoupon.values())
    .sort((a, b) => b.uses - a.uses)
    .slice(0, limit);
}

export async function getPartnerPerformance(range: DateRange, limit = 10) {
  const conversions = await prisma.partnerConversion.findMany({
    where: { createdAt: { gte: range.from, lte: range.to } },
    select: { commissionAmount: true, partner: { select: { name: true, code: true } } },
  });

  const byPartner = new Map<string, { name: string; code: string; conversions: number; commission: number }>();
  for (const conversion of conversions) {
    const entry = byPartner.get(conversion.partner.code) ?? {
      name: conversion.partner.name,
      code: conversion.partner.code,
      conversions: 0,
      commission: 0,
    };
    entry.conversions += 1;
    entry.commission += toNumber(conversion.commissionAmount);
    byPartner.set(conversion.partner.code, entry);
  }

  return Array.from(byPartner.values())
    .sort((a, b) => b.commission - a.commission)
    .slice(0, limit);
}

export async function getOrdersForExport(range: DateRange) {
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: range.from, lte: range.to } },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return orders.map((o) => ({
    number: o.number,
    status: o.status,
    customerName: o.user?.name ?? "Convidado",
    customerEmail: o.user?.email ?? "",
    subtotal: toNumber(o.subtotal),
    discountTotal: toNumber(o.discountTotal),
    shippingTotal: toNumber(o.shippingTotal),
    total: toNumber(o.total),
    createdAt: o.createdAt,
  }));
}
