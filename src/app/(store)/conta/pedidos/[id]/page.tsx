import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getOrderForUser } from "@/lib/data/account";
import { formatDate, formatMoney } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/orders";

export const metadata = { title: "Detalhes do pedido" };

export default async function OrderDetailPage(props: PageProps<"/conta/pedidos/[id]">) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await props.params;
  const order = await getOrderForUser(session.user.id, id);
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-foreground">Pedido #{order.number}</h2>
          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <span className="rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <div>
        <h3 className="font-display text-base text-foreground">Itens</h3>
        <ul className="mt-3 divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <div>
                <p className="text-foreground">{item.productName}</p>
                <p className="text-muted-foreground">
                  {item.variantLabel} • {item.quantity}x
                </p>
              </div>
              <span className="tabular-nums text-foreground">{formatMoney(item.total)}</span>
            </li>
          ))}
        </ul>
      </div>

      {order.shippingAddress && (
        <div>
          <h3 className="font-display text-base text-foreground">Endereço de entrega</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {order.shippingAddress.street}, {order.shippingAddress.number}
            {order.shippingAddress.complement ? ` — ${order.shippingAddress.complement}` : ""}
            <br />
            {order.shippingAddress.neighborhood}, {order.shippingAddress.city} -{" "}
            {order.shippingAddress.state}
            <br />
            CEP {order.shippingAddress.zipCode}
          </p>
        </div>
      )}

      {order.trackingCode && (
        <div>
          <h3 className="font-display text-base text-foreground">Rastreamento</h3>
          <p className="mt-2 text-sm text-muted-foreground">{order.trackingCode}</p>
        </div>
      )}

      <dl className="flex flex-col gap-2 rounded-lg bg-surface p-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums text-foreground">{formatMoney(order.subtotal)}</dd>
        </div>
        {order.discountTotal > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Desconto</dt>
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

      <Link href="/conta/pedidos" className="text-sm text-muted-foreground hover:text-foreground">
        Voltar para meus pedidos
      </Link>
    </div>
  );
}
