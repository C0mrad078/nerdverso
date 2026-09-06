import { prisma } from "@/lib/db/client";
import { Status } from "@/generated/prisma/client";

function toNumber(value: unknown): number | null {
  return value === null || value === undefined ? null : Number(value);
}

export async function getProductsAdmin(query?: string) {
  const products = await prisma.product.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      categories: { include: { category: true } },
      variants: { include: { inventory: true } },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    status: p.status,
    featured: p.featured,
    price: Number(p.price),
    image: p.images[0]?.url ?? null,
    categoryNames: p.categories.map((c) => c.category.name),
    totalStock: p.variants.reduce((sum, v) => sum + (v.inventory?.quantity ?? 0), 0),
    variantCount: p.variants.length,
  }));
}

export async function getAttributeDefinitionsAdmin() {
  return prisma.attributeDefinition.findMany({
    orderBy: { name: "asc" },
    include: { values: { orderBy: { position: "asc" } } },
  });
}

export async function getSizeGuidesAdmin() {
  return prisma.sizeGuide.findMany({ orderBy: { name: "asc" } });
}

export async function getCategoriesForSelect() {
  return prisma.category.findMany({
    where: { status: Status.ACTIVE },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function getCollectionsForSelect() {
  return prisma.collection.findMany({
    where: { status: Status.ACTIVE },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function getProductByIdAdmin(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      categories: { select: { categoryId: true } },
      collections: { select: { collectionId: true } },
      tags: { include: { tag: true } },
      attributes: { select: { attributeId: true } },
      variants: {
        orderBy: { position: "asc" },
        include: {
          inventory: true,
          values: { select: { attributeValueId: true } },
        },
      },
    },
  });
  if (!product) return null;

  return {
    ...product,
    price: Number(product.price),
    compareAtPrice: toNumber(product.compareAtPrice),
    costPrice: toNumber(product.costPrice),
    categoryIds: product.categories.map((c) => c.categoryId),
    collectionIds: product.collections.map((c) => c.collectionId),
    tagNames: product.tags.map((t) => t.tag.name),
    attributeIds: product.attributes.map((a) => a.attributeId),
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: toNumber(v.price),
      status: v.status,
      valueIds: v.values.map((vv) => vv.attributeValueId),
      quantity: v.inventory?.quantity ?? 0,
      minStock: v.inventory?.minStock ?? 0,
    })),
  };
}
