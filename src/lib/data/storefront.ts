import { cache } from "react";
import { prisma } from "@/lib/db/client";
import { Status } from "@/generated/prisma/client";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  imageAlt: string;
  inStock: boolean;
  collection: string | null;
};

function mapProductCard(product: {
  id: string;
  name: string;
  slug: string;
  price: unknown;
  compareAtPrice: unknown;
  images: { url: string; alt: string | null }[];
  variants: { inventory: { quantity: number; reserved: number } | null }[];
  collections: { collection: { name: string } }[];
}): ProductCardData {
  const totalAvailable = product.variants.reduce((sum, v) => {
    if (!v.inventory) return sum;
    return sum + Math.max(v.inventory.quantity - v.inventory.reserved, 0);
  }, 0);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: toNumber(product.price),
    compareAtPrice: product.compareAtPrice ? toNumber(product.compareAtPrice) : null,
    image: product.images[0]?.url ?? null,
    imageAlt: product.images[0]?.alt ?? product.name,
    inStock: totalAvailable > 0,
    collection: product.collections[0]?.collection.name ?? null,
  };
}

const cardInclude = {
  images: { orderBy: { position: "asc" as const }, take: 1 },
  variants: { include: { inventory: true } },
  collections: { include: { collection: true }, take: 1 },
};

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: { status: Status.ACTIVE, featured: true },
    include: cardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return products.map(mapProductCard);
}

export async function getNewProducts(limit = 8): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: { status: Status.ACTIVE },
    include: cardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return products.map(mapProductCard);
}

export async function getPromoProducts(limit = 8): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: { status: Status.ACTIVE, compareAtPrice: { not: null } },
    include: cardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return products.map(mapProductCard);
}

export type NicheData = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
};

export async function getNiches(): Promise<NicheData[]> {
  const collections = await prisma.collection.findMany({
    where: { status: Status.ACTIVE },
    orderBy: { position: "asc" },
    select: { id: true, name: true, slug: true, image: true },
  });
  return collections;
}

export const getStoreSetting = cache(async () => {
  return prisma.storeSetting.findUnique({ where: { id: "singleton" } });
});

export type CategoryData = {
  id: string;
  name: string;
  slug: string;
};

export async function getCategories(): Promise<CategoryData[]> {
  return prisma.category.findMany({
    where: { status: Status.ACTIVE, parentId: null },
    orderBy: { position: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

export type BannerData = {
  id: string;
  title: string | null;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaLink: string | null;
  imageDesktop: string;
  imageMobile: string | null;
  altText: string | null;
};

export async function getActiveBanners(position: string): Promise<BannerData[]> {
  const now = new Date();
  const banners = await prisma.banner.findMany({
    where: {
      position,
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      subtitle: true,
      ctaLabel: true,
      ctaLink: true,
      imageDesktop: true,
      imageMobile: true,
      altText: true,
    },
  });
  return banners;
}

export type ProductDetailData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  materials: string | null;
  careInstructions: string | null;
  images: { url: string; alt: string | null }[];
  sizeGuide: { name: string; rows: unknown } | null;
  attributes: { id: string; name: string; key: string }[];
  variants: {
    id: string;
    sku: string;
    price: number | null;
    available: number;
    values: { attributeId: string; valueId: string; value: string }[];
  }[];
  collectionSlugs: string[];
};

export async function getProductBySlug(slug: string): Promise<ProductDetailData | null> {
  const product = await prisma.product.findUnique({
    where: { slug, status: Status.ACTIVE },
    include: {
      images: { orderBy: { position: "asc" } },
      sizeGuide: true,
      attributes: { include: { attribute: true } },
      collections: { select: { collection: { select: { slug: true } } } },
      variants: {
        orderBy: { position: "asc" },
        include: {
          inventory: true,
          values: { include: { attributeValue: true } },
        },
      },
    },
  });
  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    price: toNumber(product.price),
    compareAtPrice: product.compareAtPrice ? toNumber(product.compareAtPrice) : null,
    materials: product.materials,
    careInstructions: product.careInstructions,
    images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
    sizeGuide: product.sizeGuide
      ? { name: product.sizeGuide.name, rows: product.sizeGuide.rows }
      : null,
    attributes: product.attributes.map((a) => ({
      id: a.attribute.id,
      name: a.attribute.name,
      key: a.attribute.key,
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: v.price ? toNumber(v.price) : null,
      available: v.inventory ? Math.max(v.inventory.quantity - v.inventory.reserved, 0) : 0,
      values: v.values.map((vv) => ({
        attributeId: vv.attributeValue.attributeId,
        valueId: vv.attributeValue.id,
        value: vv.attributeValue.value,
      })),
    })),
    collectionSlugs: product.collections.map((c) => c.collection.slug),
  };
}

export async function getRelatedProducts(
  collectionSlugs: string[],
  excludeProductId: string,
  limit = 4,
): Promise<ProductCardData[]> {
  if (collectionSlugs.length === 0) return [];
  const products = await prisma.product.findMany({
    where: {
      status: Status.ACTIVE,
      id: { not: excludeProductId },
      collections: { some: { collection: { slug: { in: collectionSlugs } } } },
    },
    include: cardInclude,
    take: limit,
  });
  return products.map(mapProductCard);
}
