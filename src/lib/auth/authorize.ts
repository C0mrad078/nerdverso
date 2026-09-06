import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";
import { UserStatus } from "@/generated/prisma/client";
import type { PermissionKey } from "@/lib/rbac/permissions";

/**
 * Re-reads owner/employee/permission state from the database on every call
 * instead of trusting the JWT's cached claims. The session cookie can stay
 * valid for hours after an admin revokes access, changes a role, or bans a
 * user — for the admin surface specifically, that staleness window is not
 * acceptable, so this is the source of truth for authorization decisions
 * even though it costs a query per request.
 */
async function getFreshStaffContext(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      employee: true,
      roles: {
        include: { role: { include: { permissions: { include: { permission: true } } } } },
      },
    },
  });

  if (!user || user.status !== UserStatus.ACTIVE) return null;
  if (!user.isOwner && !user.employee) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isOwner: user.isOwner,
    permissions: [
      ...new Set(
        user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.key)),
      ),
    ],
  };
}

/** Redirects anonymous or non-staff visitors away. Use at the top of every
 * admin page/layout — hiding a nav link is not access control. */
export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin");

  const staff = await getFreshStaffContext(session.user.id);
  if (!staff) redirect("/");

  return { user: staff };
}

/** Same as requireAdminSession, plus a specific permission check. Owner
 * always passes. Use in every admin page that renders sensitive data or
 * write controls, not just to decide what to show. */
export async function requirePermission(key: PermissionKey) {
  const session = await requireAdminSession();
  if (session.user.isOwner) return session;
  if (!session.user.permissions.includes(key)) {
    // Never redirect to /admin here: the dashboard itself requires
    // dashboard.view, so a role without it would bounce straight back and
    // loop forever. This page only requires being staff, not a permission.
    redirect("/admin/sem-permissao");
  }
  return session;
}

/** For Server Actions: throws instead of redirecting, since actions can't
 * navigate on their own. Never trust a hidden button — call this at the top
 * of every admin mutation. */
export async function assertPermission(key: PermissionKey) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado.");

  const staff = await getFreshStaffContext(session.user.id);
  if (!staff) throw new Error("Acesso revogado.");
  if (staff.isOwner) return { user: staff };
  if (!staff.permissions.includes(key)) {
    throw new Error("Você não tem permissão para esta ação.");
  }
  return { user: staff };
}
