import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/authorize";
import { getCustomerDetail } from "@/lib/data/admin-customers";
import { formatMoney, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/orders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Detalhe do cliente" };

export default async function CustomerDetailPage(props: PageProps<"/admin/clientes/[id]">) {
  await requirePermission("customers.view");
  const { id } = await props.params;

  const customer = await getCustomerDetail(id);
  if (!customer) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/clientes" className="text-sm text-muted-foreground hover:text-foreground">
          ← Voltar para clientes
        </Link>
        <h1 className="mt-2 font-display text-2xl text-foreground">{customer.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {customer.email}
          {customer.phone ? ` · ${customer.phone}` : ""} · Cliente desde {formatDate(customer.createdAt)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Pedidos</p>
          <p className="mt-1 font-display text-xl text-foreground">{customer.orders.length}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Total gasto</p>
          <p className="mt-1 font-display text-xl text-foreground">{formatMoney(customer.totalSpent)}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Aceita marketing</p>
          <p className="mt-1 font-display text-xl text-foreground">
            {customer.acceptsMarketing ? "Sim" : "Não"}
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-foreground">Endereços</h2>
        {customer.addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {customer.addresses.map((address) => (
              <div key={address.id} className="rounded-lg border border-border p-4 text-sm">
                <p className="font-medium text-foreground">
                  {address.label ?? "Endereço"} {address.isDefault && "· Padrão"}
                </p>
                <p className="text-muted-foreground">{address.recipientName}</p>
                <p className="text-muted-foreground">
                  {address.street}, {address.number}
                  {address.complement ? ` — ${address.complement}` : ""}
                </p>
                <p className="text-muted-foreground">
                  {address.neighborhood}, {address.city}/{address.state} · {address.zipCode}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-foreground">Pedidos</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum pedido ainda.
                  </TableCell>
                </TableRow>
              )}
              {customer.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/pedidos/${order.id}`} className="hover:underline">
                      {order.number}
                    </Link>
                  </TableCell>
                  <TableCell>{ORDER_STATUS_LABELS[order.status]}</TableCell>
                  <TableCell>{formatMoney(order.total)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
