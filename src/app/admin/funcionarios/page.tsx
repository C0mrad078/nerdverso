import { requirePermission } from "@/lib/auth/authorize";
import { getEmployeesAdmin, getRolesAdmin } from "@/lib/data/admin-team";
import { EmployeeList } from "./employee-list";

export const metadata = { title: "Funcionários" };

export default async function AdminEmployeesPage() {
  await requirePermission("employees.view");
  const [employees, roles] = await Promise.all([getEmployeesAdmin(), getRolesAdmin()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Funcionários</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie contas de funcionários e defina exatamente o que cada um pode acessar.
        </p>
      </div>
      <EmployeeList
        employees={employees.map((e) => ({
          id: e.id,
          name: e.user.name,
          email: e.user.email,
          position: e.position,
          status: e.status,
          isOwner: e.user.isOwner,
          roleNames: e.user.roles.map((r) => r.role.name),
          roleIds: e.user.roles.map((r) => r.roleId),
        }))}
        roles={roles.filter((r) => !r.isSystem).map((r) => ({ id: r.id, name: r.name }))}
      />
    </div>
  );
}
