import { prisma } from "@/lib/db/client";
import { Status } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";

export type SortOption = "relevancia" | "novidades" | "menor-preco" | "maior-preco" | "desconto";

export type ProductListingParams = {
  categorySlug?: string;
  collectionSlug?: string;
  search?: string;
  sort?: SortOption;
  promoOnly?: boolean;
  sizes?: string[];
  colors?: string[];
  page?: number;
};

const PAGE_SIZE = 24;

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export async function getProductListing(params: ProductListingParams) {
  const page = Math.max(1, params.page ?? 1);

  const where: Prisma.ProductWhereInput = {
    status: Status.ACTIVE,
  };

  if (params.categorySlug) {
    where.categories = { some: { category: { slug: params.categorySlug } } };
  }
  if (params.collectionSlug) {
    where.collections = { some: { collection: { slug: params.collectionSlug } } };
  }
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { shortDescription: { contains: params.search, mode: "insensitive" } },
      { sku: { contains: params.search, mode: "insensitive" } },
      { tags: { some: { tag: { name: { contains: params.search, mode: "insensitive" } } } } },
    ];
  }
  if (params.promoOnly) {
    where.compareAtPrice = { not: null };
  }
  if (params.sizes?.length || params.colors?.length) {
    const valueFilters = [...(params.sizes ?? []), ...(params.colors ?? [])];
    where.variants = {
      some: { values: { some: { attributeValue: { value: { in: valueFilters } } } } },
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.sort === "novidades"
      ? { createdAt: "desc" }
      : params.sort === "menor-preco"
        ? { price: "asc" }
        : params.sort === "maior-preco"
          ? { price: "desc" }
          : { featured: "desc" };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: { include: { inventory: true } },
        collections: { include: { collection: true }, take: 1 },
      },
    }),
  ]);

  let items = products.map((p) => {
    const totalAvailable = p.variants.reduce((sum, v) => {
      if (!v.inventory) return sum;
      return sum + Math.max(v.inventory.quantity - v.inventory.reserved, 0);
    }, 0);
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: toNumber(p.price),
      compareAtPrice: p.compareAtPrice ? toNumber(p.compareAtPrice) : null,
      image: p.images[0]?.url ?? null,
      imageAlt: p.images[0]?.alt ?? p.name,
      inStock: totalAvailable > 0,
      collection: p.collections[0]?.collection.name ?? null,
    };
  });

  if (params.sort === "desconto") {
    items = items.sort((a, b) => {
      const discountA = a.compareAtPrice ? (a.compareAtPrice - a.price) / a.compareAtPrice : 0;
      const discountB = b.compareAtPrice ? (b.compareAtPrice - b.price) / b.compareAtPrice : 0;
      return discountB - discountA;
    });
  }

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getAvailableFilterValues() {
  const [sizes, colors] = await Promise.all([
    prisma.attributeValue.findMany({
      where: { attribute: { key: "size" } },
      orderBy: { position: "asc" },
      select: { value: true },
    }),
    prisma.attributeValue.findMany({
      where: { attribute: { key: "color" } },
      orderBy: { position: "asc" },
      select: { value: true },
    }),
  ]);
  return {
    sizes: sizes.map((s) => s.value),
    colors: colors.map((c) => c.value),
  };
}
