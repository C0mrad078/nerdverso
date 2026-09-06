"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { assertPermission } from "@/lib/auth/authorize";
import { logAudit } from "@/lib/audit";
import { categorySchema, collectionSchema, bannerSchema } from "@/lib/validation/catalog";
import type { FormState } from "@/lib/actions/auth";

function issues(error: { issues: { message: string }[] }): FormState {
  return { status: "error", message: error.issues[0]?.message ?? "Dados inválidos." };
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function upsertCategoryAction(
  categoryId: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await assertPermission(categoryId ? "categories.update" : "categories.create");

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image: formData.get("image"),
    banner: formData.get("banner"),
    position: formData.get("position"),
    status: formData.get("status"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
  });
  if (!parsed.success) return issues(parsed.error);

  const existingSlug = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existingSlug && existingSlug.id !== categoryId) {
    return { status: "error", message: "Já existe uma categoria com esse slug." };
  }

  const data = {
    ...parsed.data,
    description: parsed.data.description || null,
    image: parsed.data.image || null,
    banner: parsed.data.banner || null,
    seoTitle: parsed.data.seoTitle || null,
    seoDescription: parsed.data.seoDescription || null,
  };

  if (categoryId) {
    await prisma.category.update({ where: { id: categoryId }, data });
    await logAudit(session.user.id, "category.updated", "Category", categoryId, data);
  } else {
    const created = await prisma.category.create({ data });
    await logAudit(session.user.id, "category.created", "Category", created.id, data);
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return { status: "success", message: "Categoria salva." };
}

export async function deleteCategoryAction(formData: FormData) {
  const session = await assertPermission("categories.delete");
  const categoryId = String(formData.get("categoryId") ?? "");
  if (!categoryId) return;

  await prisma.category.delete({ where: { id: categoryId } });
  await logAudit(session.user.id, "category.deleted", "Category", categoryId);
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export async function upsertCollectionAction(
  collectionId: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await assertPermission(collectionId ? "collections.update" : "collections.create");

  const parsed = collectionSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image: formData.get("image"),
    banner: formData.get("banner"),
    position: formData.get("position"),
    status: formData.get("status"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
  });
  if (!parsed.success) return issues(parsed.error);

  const existingSlug = await prisma.collection.findUnique({ where: { slug: parsed.data.slug } });
  if (existingSlug && existingSlug.id !== collectionId) {
    return { status: "error", message: "Já existe uma coleção com esse slug." };
  }

  const data = {
    ...parsed.data,
    description: parsed.data.description || null,
    image: parsed.data.image || null,
    banner: parsed.data.banner || null,
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
    endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
    seoTitle: parsed.data.seoTitle || null,
    seoDescription: parsed.data.seoDescription || null,
  };

  if (collectionId) {
    await prisma.collection.update({ where: { id: collectionId }, data });
    await logAudit(session.user.id, "collection.updated", "Collection", collectionId, data);
  } else {
    const created = await prisma.collection.create({ data });
    await logAudit(session.user.id, "collection.created", "Collection", created.id, data);
  }

  revalidatePath("/admin/colecoes");
  revalidatePath("/");
  return { status: "success", message: "Coleção salva." };
}

export async function deleteCollectionAction(formData: FormData) {
  const session = await assertPermission("collections.delete");
  const collectionId = String(formData.get("collectionId") ?? "");
  if (!collectionId) return;

  await prisma.collection.delete({ where: { id: collectionId } });
  await logAudit(session.user.id, "collection.deleted", "Collection", collectionId);
  revalidatePath("/admin/colecoes");
  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// Banners
// ---------------------------------------------------------------------------

export async function upsertBannerAction(
  bannerId: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await assertPermission(bannerId ? "banners.update" : "banners.create");

  const parsed = bannerSchema.safeParse({
    internalTitle: formData.get("internalTitle"),
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    ctaLabel: formData.get("ctaLabel"),
    ctaLink: formData.get("ctaLink"),
    imageDesktop: formData.get("imageDesktop"),
    imageMobile: formData.get("imageMobile"),
    altText: formData.get("altText"),
    position: formData.get("position"),
    order: formData.get("order"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return issues(parsed.error);

  const data = {
    ...parsed.data,
    title: parsed.data.title || null,
    subtitle: parsed.data.subtitle || null,
    ctaLabel: parsed.data.ctaLabel || null,
    ctaLink: parsed.data.ctaLink || null,
    imageMobile: parsed.data.imageMobile || null,
    altText: parsed.data.altText || null,
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
    endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
  };

  if (bannerId) {
    await prisma.banner.update({ where: { id: bannerId }, data });
    await logAudit(session.user.id, "banner.updated", "Banner", bannerId, data);
  } else {
    const created = await prisma.banner.create({ data });
    await logAudit(session.user.id, "banner.created", "Banner", created.id, data);
  }

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { status: "success", message: "Banner salvo." };
}

export async function deleteBannerAction(formData: FormData) {
  const session = await assertPermission("banners.delete");
  const bannerId = String(formData.get("bannerId") ?? "");
  if (!bannerId) return;

  await prisma.banner.delete({ where: { id: bannerId } });
  await logAudit(session.user.id, "banner.deleted", "Banner", bannerId);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function toggleBannerActiveAction(formData: FormData) {
  const session = await assertPermission("banners.update");
  const bannerId = String(formData.get("bannerId") ?? "");
  const nextActive = formData.get("active") === "true";
  if (!bannerId) return;

  await prisma.banner.update({ where: { id: bannerId }, data: { active: nextActive } });
  await logAudit(session.user.id, "banner.toggled", "Banner", bannerId, { active: nextActive });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}
