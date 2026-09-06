import { prisma } from "@/lib/db/client";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export async function getPartnersAdmin() {
  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { clicks: true, conversions: true } },
      conversions: { select: { commissionAmount: true } },
    },
  });

  return partners.map((p) => ({
    ...p,
    commissionPercent: toNumber(p.commissionPercent),
    clickCount: p._count.clicks,
    conversionCount: p._count.conversions,
    totalCommission: p.conversions.reduce((sum, c) => sum + toNumber(c.commissionAmount), 0),
  }));
}

export async function getPartnerDetail(partnerId: string) {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    include: {
      links: { orderBy: { createdAt: "desc" } },
      commissions: { orderBy: { period: "desc" } },
    },
  });
  if (!partner) return null;

  const conversions = await prisma.partnerConversion.findMany({
    where: { partnerId },
    include: {
      order: { select: { number: true, total: true, createdAt: true } },
      customer: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const clickCount = await prisma.partnerClick.count({ where: { partnerId } });
  const totalCommission = conversions.reduce((sum, c) => sum + toNumber(c.commissionAmount), 0);
  const totalSales = conversions.reduce((sum, c) => sum + toNumber(c.order.total), 0);
  const paidCommission = partner.commissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + toNumber(c.totalCommission), 0);

  return {
    partner: { ...partner, commissionPercent: toNumber(partner.commissionPercent) },
    clickCount,
    conversionCount: conversions.length,
    totalCommission,
    totalSales,
    pendingCommission: totalCommission - paidCommission,
    conversions: conversions.map((c) => ({
      id: c.id,
      orderNumber: c.order.number,
      orderTotal: toNumber(c.order.total),
      commissionAmount: toNumber(c.commissionAmount),
      customerName: c.customer?.user.name ?? "—",
      customerEmail: c.customer?.user.email ?? "—",
      createdAt: c.createdAt,
    })),
    commissions: partner.commissions.map((c) => ({
      ...c,
      totalSales: toNumber(c.totalSales),
      totalCommission: toNumber(c.totalCommission),
    })),
  };
}
