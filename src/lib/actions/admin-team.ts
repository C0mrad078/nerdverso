"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { assertPermission } from "@/lib/auth/authorize";
import { logAudit } from "@/lib/audit";
import { hashPassword } from "@/lib/auth/password";
import { roleSchema, createEmployeeSchema, updateEmployeeSchema } from "@/lib/validation/team";
import type { FormState } from "@/lib/actions/auth";

// ---------------------------------------------------------------------------
// Roles (cargos)
// ---------------------------------------------------------------------------

export async function upsertRoleAction(
  roleId: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await assertPermission(roleId ? "roles.update" : "roles.create");

  if (roleId) {
    const existing = await prisma.role.findUnique({ where: { id: roleId } });
    if (existing?.isSystem) {
      return { status: "error", message: "O cargo Owner não pode ser editado." };
    }
  }

  const parsed = roleSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    permissionKeys: formData.getAll("permissionKeys"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existingName = await prisma.role.findUnique({ where: { name: parsed.data.name } });
  if (existingName && existingName.id !== roleId) {
    return { status: "error", message: "Já existe um cargo com esse nome." };
  }

  const permissions = await prisma.permission.findMany({
    where: { key: { in: parsed.data.permissionKeys } },
  });

  const role = roleId
    ? await prisma.role.update({
        where: { id: roleId },
        data: { name: parsed.data.name, description: parsed.data.description || null },
      })
    : await prisma.role.create({
        data: { name: parsed.data.name, description: parsed.data.description || null },
      });

  await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
  await prisma.rolePermission.createMany({
    data: permissions.map((p) => ({ roleId: role.id, permissionId: p.id })),
  });

  await logAudit(session.user.id, roleId ? "role.updated" : "role.created", "Role", role.id, {
    name: parsed.data.name,
    permissions: parsed.data.permissionKeys,
  });

  revalidatePath("/admin/cargos");
  return { status: "success", message: "Cargo salvo." };
}

export async function deleteRoleAction(formData: FormData) {
  const session = await assertPermission("roles.delete");
  const roleId = String(formData.get("roleId") ?? "");
  if (!roleId) return;

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role || role.isSystem) return;

  await prisma.role.delete({ where: { id: roleId } });
  await logAudit(session.user.id, "role.deleted", "Role", roleId);
  revalidatePath("/admin/cargos");
}

// ---------------------------------------------------------------------------
// Employees (funcionários)
// ---------------------------------------------------------------------------

export async function createEmployeeAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await assertPermission("employees.create");

  const parsed = createEmployeeSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    position: formData.get("position"),
    roleIds: formData.getAll("roleIds"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { status: "error", message: "Já existe uma conta com este e-mail." };

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      employee: { create: { position: parsed.data.position || null } },
      roles: { create: parsed.data.roleIds.map((roleId) => ({ roleId })) },
    },
  });

  await logAudit(session.user.id, "employee.created", "User", user.id, {
    name: parsed.data.name,
    email: parsed.data.email,
  });

  revalidatePath("/admin/funcionarios");
  return { status: "success", message: "Funcionário criado." };
}

export async function updateEmployeeAction(
  employeeId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await assertPermission("employees.update");

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { user: true },
  });
  if (!employee) return { status: "error", message: "Funcionário não encontrado." };
  if (employee.user.isOwner) {
    return { status: "error", message: "O Owner não pode ser editado por aqui." };
  }

  const parsed = updateEmployeeSchema.safeParse({
    position: formData.get("position"),
    status: formData.get("status"),
    roleIds: formData.getAll("roleIds"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.employee.update({
    where: { id: employeeId },
    data: { position: parsed.data.position || null, status: parsed.data.status },
  });
  await prisma.userRole.deleteMany({ where: { userId: employee.userId } });
  await prisma.userRole.createMany({
    data: parsed.data.roleIds.map((roleId) => ({ userId: employee.userId, roleId })),
  });

  await logAudit(session.user.id, "employee.updated", "User", employee.userId, {
    status: parsed.data.status,
    roleIds: parsed.data.roleIds,
  });

  revalidatePath("/admin/funcionarios");
  return { status: "success", message: "Funcionário atualizado." };
}

export async function deleteEmployeeAction(formData: FormData) {
  const session = await assertPermission("employees.delete");
  const employeeId = String(formData.get("employeeId") ?? "");
  if (!employeeId) return;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { user: true },
  });
  if (!employee || employee.user.isOwner) return;

  await prisma.user.update({ where: { id: employee.userId }, data: { status: "INACTIVE" } });
  await logAudit(session.user.id, "employee.deactivated", "User", employee.userId);
  revalidatePath("/admin/funcionarios");
}
