import { prisma } from "@/lib/db/client";

const PAGE_SIZE = 50;

export async function getAuditLogAdmin(params: { entityType?: string; page?: number }) {
  const page = Math.max(params.page ?? 1, 1);

  const where = params.entityType ? { entityType: params.entityType } : undefined;

  const [entries, total, entityTypes] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      distinct: ["entityType"],
      select: { entityType: true },
      orderBy: { entityType: "asc" },
    }),
  ]);

  return {
    entries,
    total,
    page,
    pageCount: Math.max(Math.ceil(total / PAGE_SIZE), 1),
    entityTypes: entityTypes.map((e) => e.entityType),
  };
}
