import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/authorize";
import { getInventoryAdmin } from "@/lib/data/admin-inventory";
import { InventoryRow } from "./inventory-row";

export const metadata = { title: "Estoque" };

export default async function AdminInventoryPage(props: PageProps<"/admin/estoque">) {
  await requirePermission("inventory.view");
  const searchParams = await props.searchParams;
  const qParam = searchParams.q;
  const q = Array.isArray(qParam) ? qParam[0] : qParam;

  const inventory = await getInventoryAdmin(q);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Estoque</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {inventory.length} variantes. Toda entrada/saída fica registrada com motivo.
        </p>
      </div>

      <form method="GET" className="max-w-sm">
        <Input name="q" placeholder="Buscar por produto ou SKU…" defaultValue={q ?? ""} />
      </form>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Variante</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Disponível</TableHead>
              <TableHead>Mínimo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <InventoryRow key={item.id} item={item} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
