import "server-only";
import { prisma } from "@/lib/db/client";

export async function logAudit(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: unknown,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
    },
  });
}
