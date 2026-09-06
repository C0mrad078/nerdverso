import { prisma } from "@/lib/db/client";

export async function getCategoriesAdmin() {
  return prisma.category.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
}

export async function getCategoryByIdAdmin(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export async function getCollectionsAdmin() {
  return prisma.collection.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
}

export async function getCollectionByIdAdmin(id: string) {
  return prisma.collection.findUnique({ where: { id } });
}

export async function getBannersAdmin() {
  return prisma.banner.findMany({
    orderBy: [{ position: "asc" }, { order: "asc" }],
  });
}

export async function getBannerByIdAdmin(id: string) {
  return prisma.banner.findUnique({ where: { id } });
}
