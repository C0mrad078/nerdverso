import { z } from "zod";

export const partnerSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do parceiro."),
  email: z.string().trim().email("E-mail inválido."),
  phone: z.string().trim().optional(),
  commissionPercent: z.coerce.number().min(0).max(100),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  notes: z.string().trim().optional(),
});

export const partnerLinkSchema = z.object({
  path: z
    .string()
    .trim()
    .min(1, "Informe o caminho de destino.")
    .regex(/^\//, "O caminho deve começar com /."),
  label: z.string().trim().optional(),
});
