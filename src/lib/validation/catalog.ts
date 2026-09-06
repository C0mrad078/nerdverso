import { z } from "zod";

const statusEnum = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED", "DRAFT"]);
const slugValue = z
  .string()
  .trim()
  .min(2, "Slug muito curto.")
  .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens.");

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Informe um nome."),
  slug: slugValue,
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  banner: z.string().trim().optional(),
  position: z.coerce.number().int().min(0).default(0),
  status: statusEnum,
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
});

export const collectionSchema = z.object({
  name: z.string().trim().min(2, "Informe um nome."),
  slug: slugValue,
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  banner: z.string().trim().optional(),
  position: z.coerce.number().int().min(0).default(0),
  status: statusEnum,
  startsAt: z.string().trim().optional(),
  endsAt: z.string().trim().optional(),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
});

export const bannerSchema = z.object({
  internalTitle: z.string().trim().min(2, "Informe um título interno."),
  title: z.string().trim().optional(),
  subtitle: z.string().trim().optional(),
  ctaLabel: z.string().trim().optional(),
  ctaLink: z.string().trim().optional(),
  imageDesktop: z.string().trim().min(1, "Informe a imagem desktop."),
  imageMobile: z.string().trim().optional(),
  altText: z.string().trim().optional(),
  position: z.string().trim().min(1, "Informe a posição."),
  order: z.coerce.number().int().min(0).default(0),
  startsAt: z.string().trim().optional(),
  endsAt: z.string().trim().optional(),
  active: z.boolean().default(true),
});
