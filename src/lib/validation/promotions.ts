import { z } from "zod";

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, "Código muito curto.")
    .regex(/^[A-Z0-9]+$/, "Use apenas letras e números."),
  description: z.string().trim().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]),
  discountValue: z.coerce.number().min(0),
  minOrderValue: z.coerce.number().min(0).optional().or(z.literal("")),
  minQuantity: z.coerce.number().int().min(0).optional().or(z.literal("")),
  firstPurchaseOnly: z.boolean().default(false),
  usageLimit: z.coerce.number().int().min(0).optional().or(z.literal("")),
  usageLimitPerCustomer: z.coerce.number().int().min(0).optional().or(z.literal("")),
  startsAt: z.string().trim().optional(),
  endsAt: z.string().trim().optional(),
  active: z.boolean().default(true),
});

export const promotionSchema = z.object({
  name: z.string().trim().min(2, "Informe um nome."),
  type: z.enum(["PERCENTAGE", "FIXED_PRICE", "BUY_X_GET_Y", "QUANTITY_DISCOUNT", "FREE_SHIPPING"]),
  discountValue: z.coerce.number().min(0).optional().or(z.literal("")),
  buyQuantity: z.coerce.number().int().min(0).optional().or(z.literal("")),
  getQuantity: z.coerce.number().int().min(0).optional().or(z.literal("")),
  minQuantity: z.coerce.number().int().min(0).optional().or(z.literal("")),
  minOrderValue: z.coerce.number().min(0).optional().or(z.literal("")),
  priority: z.coerce.number().int().min(0).default(0),
  startsAt: z.string().trim().optional(),
  endsAt: z.string().trim().optional(),
  active: z.boolean().default(true),
  categoryIds: z.array(z.string()).default([]),
  collectionIds: z.array(z.string()).default([]),
});
