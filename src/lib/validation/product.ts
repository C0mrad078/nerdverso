import { z } from "zod";

export const productBaseSchema = z.object({
  name: z.string().trim().min(2, "Informe um nome."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug muito curto.")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens."),
  sku: z.string().trim().min(1, "Informe um SKU."),
  description: z.string().trim().optional(),
  shortDescription: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED", "DRAFT"]),
  featured: z.boolean().default(false),
  price: z.coerce.number().min(0, "Preço inválido."),
  compareAtPrice: z.coerce.number().min(0).optional().or(z.literal("")),
  costPrice: z.coerce.number().min(0).optional().or(z.literal("")),
  weightGrams: z.coerce.number().int().min(0).optional().or(z.literal("")),
  widthCm: z.coerce.number().min(0).optional().or(z.literal("")),
  heightCm: z.coerce.number().min(0).optional().or(z.literal("")),
  lengthCm: z.coerce.number().min(0).optional().or(z.literal("")),
  materials: z.string().trim().optional(),
  careInstructions: z.string().trim().optional(),
  sizeGuideId: z.string().trim().optional(),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
  categoryIds: z.array(z.string()).min(1, "Selecione ao menos uma categoria."),
  collectionIds: z.array(z.string()).default([]),
  tagNames: z.array(z.string()).default([]),
  attributeIds: z.array(z.string()).default([]),
});

const variantInputSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1),
  price: z.number().nullable(),
  valueIds: z.array(z.string()),
  quantity: z.number().int().min(0),
  minStock: z.number().int().min(0),
});

const imageInputSchema = z.object({
  url: z.string().trim().min(1),
  alt: z.string().trim().optional(),
  isPrimary: z.boolean(),
});

export const variantsPayloadSchema = z.array(variantInputSchema);
export const imagesPayloadSchema = z.array(imageInputSchema);
