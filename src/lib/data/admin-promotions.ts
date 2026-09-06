import { prisma } from "@/lib/db/client";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export async function getCouponsAdmin() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { usages: true } } },
  });
  return coupons.map((c) => ({
    ...c,
    discountValue: toNumber(c.discountValue),
    minOrderValue: c.minOrderValue ? toNumber(c.minOrderValue) : null,
  }));
}

export async function getCouponReport(couponId: string) {
  const usages = await prisma.couponUsage.findMany({
    where: { couponId },
    include: {
      order: { select: { number: true, total: true, createdAt: true } },
      customer: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalDiscount = usages.reduce((sum, u) => sum + toNumber(u.discountAmount), 0);
  const totalRevenue = usages.reduce((sum, u) => sum + toNumber(u.order.total), 0);

  return {
    usages: usages.map((u) => ({
      id: u.id,
      orderNumber: u.order.number,
      orderTotal: toNumber(u.order.total),
      discountAmount: toNumber(u.discountAmount),
      customerName: u.customer.user.name,
      customerEmail: u.customer.user.email,
      createdAt: u.createdAt,
    })),
    count: usages.length,
    totalDiscount,
    totalRevenue,
    averageTicket: usages.length > 0 ? totalRevenue / usages.length : 0,
  };
}

export async function getPromotionsAdmin() {
  const promotions = await prisma.promotion.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: {
      categories: { include: { category: true } },
      collections: { include: { collection: true } },
    },
  });
  return promotions.map((p) => ({
    ...p,
    discountValue: p.discountValue ? toNumber(p.discountValue) : null,
    minOrderValue: p.minOrderValue ? toNumber(p.minOrderValue) : null,
  }));
}
