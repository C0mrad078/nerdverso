"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { assertPermission } from "@/lib/auth/authorize";
import { logAudit } from "@/lib/audit";
import { slugify } from "@/lib/slugify";
import {
  imagesPayloadSchema,
  productBaseSchema,
  variantsPayloadSchema,
} from "@/lib/validation/product";
import { InventoryMovementType } from "@/generated/prisma/client";
import type { FormState } from "@/lib/actions/auth";

export async function upsertProductAction(
  productId: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await assertPermission(productId ? "products.update" : "products.create");

  const base = productBaseSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    description: formData.get("description"),
    shortDescription: formData.get("shortDescription"),
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || "",
    costPrice: formData.get("costPrice") || "",
    weightGrams: formData.get("weightGrams") || "",
    widthCm: formData.get("widthCm") || "",
    heightCm: formData.get("heightCm") || "",
    lengthCm: formData.get("lengthCm") || "",
    materials: formData.get("materials"),
    careInstructions: formData.get("careInstructions"),
    sizeGuideId: formData.get("sizeGuideId"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    categoryIds: formData.getAll("categoryIds"),
    collectionIds: formData.getAll("collectionIds"),
    tagNames: String(formData.get("tagNames") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    attributeIds: formData.getAll("attributeIds"),
  });

  if (!base.success) {
    return { status: "error", message: base.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = base.data;

  let variantsPayload: z.infer<typeof variantsPayloadSchema>;
  let imagesPayload: z.infer<typeof imagesPayloadSchema>;
  try {
    variantsPayload = variantsPayloadSchema.parse(JSON.parse(String(formData.get("variantsJson") ?? "[]")));
    imagesPayload = imagesPayloadSchema.parse(JSON.parse(String(formData.get("imagesJson") ?? "[]")));
  } catch {
    return { status: "error", message: "Dados de variantes/imagens inválidos." };
  }

  if (variantsPayload.length === 0) {
    return { status: "error", message: "Adicione ao menos uma variante." };
  }

  const [slugConflict, skuConflict] = await Promise.all([
    prisma.product.findUnique({ where: { slug: data.slug } }),
    prisma.product.findUnique({ where: { sku: data.sku } }),
  ]);
  if (slugConflict && slugConflict.id !== productId) {
    return { status: "error", message: "Já existe um produto com esse slug." };
  }
  if (skuConflict && skuConflict.id !== productId) {
    return { status: "error", message: "Já existe um produto com esse SKU." };
  }

  const productData = {
    name: data.name,
    slug: data.slug,
    sku: data.sku,
    description: data.description || null,
    shortDescription: data.shortDescription || null,
    status: data.status,
    featured: data.featured,
    price: data.price,
    compareAtPrice: data.compareAtPrice === "" ? null : data.compareAtPrice,
    costPrice: data.costPrice === "" ? null : data.costPrice,
    weightGrams: data.weightGrams === "" ? null : data.weightGrams,
    widthCm: data.widthCm === "" ? null : data.widthCm,
    heightCm: data.heightCm === "" ? null : data.heightCm,
    lengthCm: data.lengthCm === "" ? null : data.lengthCm,
    materials: data.materials || null,
    careInstructions: data.careInstructions || null,
    sizeGuideId: data.sizeGuideId && data.sizeGuideId !== "none" ? data.sizeGuideId : null,
  };

  const seoData = {
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
  };

  let productIdFinal: string;
  try {
    productIdFinal = await runProductTransaction();
  } catch (error) {
    // Never let an unexpected DB error crash the component tree here — that
    // would reset every field, including the images/variants the admin just
    // built up in local state, and they'd have to redo all of it.
    console.error(error);
    return {
      status: "error",
      message: "Não foi possível salvar o produto. Verifique os dados e tente novamente.",
    };
  }

  async function runProductTransaction() {
    return prisma.$transaction(async (tx) => {
    const product = productId
      ? await tx.product.update({
          where: { id: productId },
          data: { ...productData, ...seoData },
        })
      : await tx.product.create({ data: { ...productData, ...seoData } });

    // Categories / collections / attributes: simple full replace, no history concern.
    await tx.productCategory.deleteMany({ where: { productId: product.id } });
    await tx.productCategory.createMany({
      data: data.categoryIds.map((categoryId) => ({ productId: product.id, categoryId })),
    });

    await tx.productCollection.deleteMany({ where: { productId: product.id } });
    await tx.productCollection.createMany({
      data: data.collectionIds.map((collectionId) => ({ productId: product.id, collectionId })),
    });

    await tx.productAttribute.deleteMany({ where: { productId: product.id } });
    await tx.productAttribute.createMany({
      data: data.attributeIds.map((attributeId) => ({ productId: product.id, attributeId })),
    });

    // Tags: find-or-create by name, then replace links.
    const tagIds: string[] = [];
    for (const name of data.tagNames) {
      const slug = slugify(name);
      const tag = await tx.tag.upsert({
        where: { slug },
        update: {},
        create: { name, slug },
      });
      tagIds.push(tag.id);
    }
    await tx.productTag.deleteMany({ where: { productId: product.id } });
    await tx.productTag.createMany({ data: tagIds.map((tagId) => ({ productId: product.id, tagId })) });

    // Images: full replace.
    await tx.productImage.deleteMany({ where: { productId: product.id } });
    if (imagesPayload.length > 0) {
      await tx.productImage.createMany({
        data: imagesPayload.map((img, index) => ({
          productId: product.id,
          url: img.url,
          alt: img.alt || product.name,
          position: index,
          isPrimary: img.isPrimary,
        })),
      });
    }

    // Variants: update existing, create new (with initial inventory + movement),
    // and retire ones removed from the form (delete if never ordered, else archive).
    const existingVariants = await tx.productVariant.findMany({
      where: { productId: product.id },
      select: { id: true },
    });
    const payloadIds = new Set(variantsPayload.filter((v) => v.id).map((v) => v.id));

    for (const existing of existingVariants) {
      if (!payloadIds.has(existing.id)) {
        try {
          await tx.productVariant.delete({ where: { id: existing.id } });
        } catch {
          await tx.productVariant.update({ where: { id: existing.id }, data: { status: "ARCHIVED" } });
        }
      }
    }

    for (const v of variantsPayload) {
      if (v.id) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: { sku: v.sku, price: v.price },
        });
        await tx.productVariantValue.deleteMany({ where: { variantId: v.id } });
        await tx.productVariantValue.createMany({
          data: v.valueIds.map((attributeValueId) => ({ variantId: v.id!, attributeValueId })),
        });
      } else {
        const created = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: v.sku,
            price: v.price,
            values: { create: v.valueIds.map((attributeValueId) => ({ attributeValueId })) },
          },
        });
        const inventory = await tx.inventory.create({
          data: { variantId: created.id, quantity: v.quantity, minStock: v.minStock },
        });
        if (v.quantity > 0) {
          await tx.inventoryMovement.create({
            data: {
              inventoryId: inventory.id,
              type: InventoryMovementType.IN,
              quantity: v.quantity,
              reason: "Estoque inicial",
              referenceType: "product_create",
              userId: session.user.id,
            },
          });
        }
      }
    }

      return product.id;
    });
  }

  await logAudit(
    session.user.id,
    productId ? "product.updated" : "product.created",
    "Product",
    productIdFinal,
    { name: data.name, sku: data.sku },
  );

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  revalidatePath(`/produto/${data.slug}`);
  redirect(`/admin/produtos/${productIdFinal}`);
}

export async function deleteProductAction(formData: FormData) {
  const session = await assertPermission("products.delete");
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;

  try {
    await prisma.product.delete({ where: { id: productId } });
    await logAudit(session.user.id, "product.deleted", "Product", productId);
  } catch {
    await prisma.product.update({ where: { id: productId }, data: { status: "ARCHIVED" } });
    await logAudit(session.user.id, "product.archived", "Product", productId);
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
}

export async function duplicateProductAction(formData: FormData) {
  const session = await assertPermission("products.create");
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;

  const original = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
      categories: true,
      collections: true,
      tags: true,
      attributes: true,
      variants: { include: { values: true, inventory: true } },
    },
  });
  if (!original) return;

  const copy = await prisma.product.create({
    data: {
      name: `${original.name} (cópia)`,
      slug: `${original.slug}-copia-${Date.now().toString(36)}`,
      sku: `${original.sku}-COPY-${Date.now().toString(36).toUpperCase()}`,
      description: original.description,
      shortDescription: original.shortDescription,
      status: "DRAFT",
      featured: false,
      price: original.price,
      compareAtPrice: original.compareAtPrice,
      costPrice: original.costPrice,
      weightGrams: original.weightGrams,
      widthCm: original.widthCm,
      heightCm: original.heightCm,
      lengthCm: original.lengthCm,
      materials: original.materials,
      careInstructions: original.careInstructions,
      sizeGuideId: original.sizeGuideId,
      categories: { create: original.categories.map((c) => ({ categoryId: c.categoryId })) },
      collections: { create: original.collections.map((c) => ({ collectionId: c.collectionId })) },
      tags: { create: original.tags.map((t) => ({ tagId: t.tagId })) },
      attributes: { create: original.attributes.map((a) => ({ attributeId: a.attributeId })) },
      images: {
        create: original.images.map((img) => ({
          url: img.url,
          alt: img.alt,
          position: img.position,
          isPrimary: img.isPrimary,
        })),
      },
    },
  });

  for (const v of original.variants) {
    const newVariant = await prisma.productVariant.create({
      data: {
        productId: copy.id,
        sku: `${v.sku}-COPY-${Date.now().toString(36).toUpperCase()}`,
        price: v.price,
        position: v.position,
        values: { create: v.values.map((vv) => ({ attributeValueId: vv.attributeValueId })) },
      },
    });
    await prisma.inventory.create({
      data: { variantId: newVariant.id, quantity: 0, minStock: v.inventory?.minStock ?? 0 },
    });
  }

  await logAudit(session.user.id, "product.duplicated", "Product", copy.id, { from: productId });
  revalidatePath("/admin/produtos");
  redirect(`/admin/produtos/${copy.id}`);
}

