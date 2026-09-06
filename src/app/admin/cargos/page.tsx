import { requirePermission } from "@/lib/auth/authorize";
import { getRolesAdmin } from "@/lib/data/admin-team";
import { RoleList } from "./role-list";

export const metadata = { title: "Cargos" };

export default async function AdminRolesPage() {
  await requirePermission("roles.view");
  const roles = await getRolesAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Cargos e permissões</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie cargos personalizados e escolha exatamente o que cada um pode acessar.
        </p>
      </div>
      <RoleList
        roles={roles.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          isSystem: r.isSystem,
          permissionKeys: r.permissions.map((p) => p.permission.key),
          userCount: r._count.users,
        }))}
      />
    </div>
  );
}
