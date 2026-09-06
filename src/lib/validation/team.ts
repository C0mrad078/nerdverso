import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().trim().min(2, "Informe um nome para o cargo."),
  description: z.string().trim().optional(),
  permissionKeys: z.array(z.string()).default([]),
});

export const createEmployeeSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome completo."),
  email: z.string().trim().toLowerCase().email("Digite um e-mail válido."),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
  position: z.string().trim().optional(),
  roleIds: z.array(z.string()).default([]),
});

export const updateEmployeeSchema = z.object({
  position: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  roleIds: z.array(z.string()).default([]),
});
