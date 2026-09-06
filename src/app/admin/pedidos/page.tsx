import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/authorize";
import { getOrdersAdmin } from "@/lib/data/admin-orders";
import { formatDate, formatMoney } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/orders";

export const metadata = { title: "Pedidos" };

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export default async function AdminOrdersPage(props: PageProps<"/admin/pedidos">) {
  await requirePermission("orders.view");
  const searchParams = await props.searchParams;
  const statusParam = searchParams.status;
  const status = Array.isArray(statusParam) ? statusParam[0] : statusParam;

  const orders = await getOrdersAdmin({ status: status || undefined });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Pedidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">{orders.length} pedidos.</p>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg bg-surface p-1 self-start">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={opt.value ? `/admin/pedidos?status=${opt.value}` : "/admin/pedidos"}
            className={`rounded-md px-3 py-1.5 text-sm ${
              (status || "") === opt.value
                ? "bg-background font-medium text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/pedidos/${order.id}`} className="hover:text-primary">
                    #{order.number}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {order.customerName}
                  <br />
                  <span className="text-xs">{order.customerEmail}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                <TableCell className="tabular-nums">{formatMoney(order.total)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {order.paymentMethod ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{ORDER_STATUS_LABELS[order.status] ?? order.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
