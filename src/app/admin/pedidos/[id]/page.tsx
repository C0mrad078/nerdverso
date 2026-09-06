import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { requirePermission } from "@/lib/auth/authorize";
import { getOrderByIdAdmin } from "@/lib/data/admin-orders";
import { formatDate, formatMoney } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/orders";
import { OrderStatusForm } from "./order-status-form";

export const metadata = { title: "Detalhes do pedido" };

export default async function AdminOrderDetailPage(props: PageProps<"/admin/pedidos/[id]">) {
  await requirePermission("orders.view");
  const { id } = await props.params;
  const order = await getOrderByIdAdmin(id);
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-foreground">Pedido #{order.number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <Badge>{ORDER_STATUS_LABELS[order.status] ?? order.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <section className="rounded-lg border border-border p-5">
            <h2 className="font-display text-lg text-foreground">Cliente</h2>
            <p className="mt-2 text-sm text-foreground">{order.user?.name ?? "Convidado"}</p>
            <p className="text-sm text-muted-foreground">{order.user?.email}</p>
            {order.user?.phone && <p className="text-sm text-muted-foreground">{order.user.phone}</p>}
          </section>

          {order.shippingAddress && (
            <section className="rounded-lg border border-border p-5">
              <h2 className="font-display text-lg text-foreground">Endereço de entrega</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {order.shippingAddress.street}, {order.shippingAddress.number}
                {order.shippingAddress.complement ? ` — ${order.shippingAddress.complement}` : ""}
                <br />
                {order.shippingAddress.neighborhood}, {order.shippingAddress.city} -{" "}
                {order.shippingAddress.state}
                <br />
                CEP {order.shippingAddress.zipCode}
              </p>
              {order.shippingMethod && (
                <p className="mt-2 text-sm text-muted-foreground">Frete: {order.shippingMethod}</p>
              )}
            </section>
          )}

          <section className="rounded-lg border border-border p-5">
            <h2 className="font-display text-lg text-foreground">Itens</h2>
            <ul className="mt-3 divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-2.5 text-sm">
                  <div>
                    <p className="text-foreground">{item.productName}</p>
                    <p className="text-muted-foreground">
                      {item.variantLabel} • {item.sku} • {item.quantity}x
                    </p>
                  </div>
                  <span className="tabular-nums text-foreground">{formatMoney(item.total)}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-3" />
            <dl className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums text-foreground">{formatMoney(order.subtotal)}</dd>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Desconto {order.coupon ? `(${order.coupon.code})` : ""}
                  </dt>
                  <dd className="tabular-nums text-primary">-{formatMoney(order.discountTotal)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Frete</dt>
                <dd className="tabular-nums text-foreground">{formatMoney(order.shippingTotal)}</dd>
              </div>
              <div className="flex justify-between text-base font-medium">
                <dt className="text-foreground">Total</dt>
                <dd className="tabular-nums text-foreground">{formatMoney(order.total)}</dd>
              </div>
            </dl>
          </section>

          {order.payments.length > 0 && (
            <section className="rounded-lg border border-border p-5">
              <h2 className="font-display text-lg text-foreground">Pagamentos</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {order.payments.map((payment) => (
                  <li key={payment.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {payment.method} • {payment.provider}
                    </span>
                    <span className="text-foreground">{payment.status}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {order.partner && (
            <section className="rounded-lg border border-border p-5">
              <h2 className="font-display text-lg text-foreground">Parceiro</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {order.partner.name} ({order.partner.code})
              </p>
            </section>
          )}

          <section className="rounded-lg border border-border p-5">
            <h2 className="font-display text-lg text-foreground">Histórico</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {order.statusHistory.map((h) => (
                <li key={h.id} className="text-sm">
                  <span className="font-medium text-foreground">
                    {ORDER_STATUS_LABELS[h.status] ?? h.status}
                  </span>{" "}
                  <span className="text-muted-foreground">— {formatDate(h.createdAt)}</span>
                  {h.note && <p className="text-muted-foreground">{h.note}</p>}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="rounded-lg border border-border p-5 lg:sticky lg:top-6 lg:h-fit">
          <h2 className="font-display text-lg text-foreground">Alterar status</h2>
          <div className="mt-4">
            <OrderStatusForm
              orderId={order.id}
              currentStatus={order.status}
              trackingCode={order.trackingCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
