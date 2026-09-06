import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || /^https?:\/\//.test(value), "Use uma URL começando com http(s)://");

export const storeSettingSchema = z.object({
  storeName: z.string().trim().min(2, "Informe o nome da loja."),
  email: z.string().trim().email("E-mail inválido.").optional().or(z.literal("")),
  whatsapp: z.string().trim().optional(),
  instagram: optionalUrl,
  tiktok: optionalUrl,
  addressLine: z.string().trim().optional(),
  freeShippingThreshold: z.coerce.number().min(0).optional().or(z.literal("")),
  seoTitle: z.string().trim().max(70, "Máximo de 70 caracteres.").optional(),
  seoDescription: z.string().trim().max(160, "Máximo de 160 caracteres.").optional(),
  termsUrl: optionalUrl,
  privacyUrl: optionalUrl,
});
