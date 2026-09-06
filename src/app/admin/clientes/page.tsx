import { Input } from "@/components/ui/input";
import { requirePermission } from "@/lib/auth/authorize";
import { getCustomersAdmin } from "@/lib/data/admin-customers";
import { CustomerTable } from "./customer-table";

export const metadata = { title: "Clientes" };

export default async function AdminCustomersPage(props: PageProps<"/admin/clientes">) {
  await requirePermission("customers.view");
  const searchParams = await props.searchParams;
  const qParam = searchParams.q;
  const q = Array.isArray(qParam) ? qParam[0] : qParam;

  const customers = await getCustomersAdmin(q);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Clientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">{customers.length} clientes cadastrados.</p>
      </div>

      <form method="GET" className="max-w-sm">
        <Input name="q" placeholder="Buscar por nome ou e-mail…" defaultValue={q ?? ""} />
      </form>

      <CustomerTable customers={customers} />
    </div>
  );
}
