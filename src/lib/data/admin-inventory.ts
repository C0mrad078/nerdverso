import { prisma } from "@/lib/db/client";

export async function getInventoryAdmin(query?: string) {
  const inventories = await prisma.inventory.findMany({
    where: query
      ? {
          variant: {
            OR: [
              { sku: { contains: query, mode: "insensitive" } },
              { product: { name: { contains: query, mode: "insensitive" } } },
            ],
          },
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      variant: {
        include: {
          product: { select: { name: true, slug: true } },
          values: { include: { attributeValue: true } },
        },
      },
    },
  });

  return inventories.map((inv) => ({
    id: inv.id,
    variantId: inv.variantId,
    sku: inv.variant.sku,
    productName: inv.variant.product.name,
    variantLabel: inv.variant.values.map((v) => v.attributeValue.value).join(" / "),
    quantity: inv.quantity,
    reserved: inv.reserved,
    minStock: inv.minStock,
  }));
}

export async function getInventoryMovements(inventoryId: string, limit = 10) {
  return prisma.inventoryMovement.findMany({
    where: { inventoryId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
