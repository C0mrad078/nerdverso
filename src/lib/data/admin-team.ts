import { prisma } from "@/lib/db/client";

export async function getRolesAdmin() {
  return prisma.role.findMany({
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    include: {
      permissions: { include: { permission: true } },
      _count: { select: { users: true } },
    },
  });
}

export async function getRoleByIdAdmin(id: string) {
  return prisma.role.findUnique({
    where: { id },
    include: { permissions: { select: { permissionId: true } } },
  });
}

export async function getEmployeesAdmin() {
  return prisma.employee.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        include: { roles: { include: { role: true } } },
      },
    },
  });
}

export async function getEmployeeByIdAdmin(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      user: { include: { roles: { select: { roleId: true } } } },
    },
  });
}
