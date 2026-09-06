import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { getOrdersForUser } from "@/lib/data/account";
import { formatDate, formatMoney } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/orders";

export const metadata = { title: "Meus pedidos" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const orders = await getOrdersForUser(session.user.id);

  if (orders.length === 0) {
    return (
      <div className="rounded-lg bg-surface p-8 text-center">
        <p className="text-foreground">Você ainda não fez nenhum pedido.</p>
        <Link
          href="/produtos"
          className="mt-2 inline-block text-sm text-primary underline underline-offset-4"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {orders.map((order) => (
        <li key={order.id} className="flex items-center justify-between gap-4 py-4">
          <div>
            <Link
              href={`/conta/pedidos/${order.id}`}
              className="font-display text-base text-foreground hover:text-primary"
            >
              Pedido #{order.number}
            </Link>
            <p className="text-sm text-muted-foreground">
              {formatDate(order.createdAt)} • {order.itemCount}{" "}
              {order.itemCount === 1 ? "item" : "itens"} •{" "}
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </p>
          </div>
          <span className="shrink-0 font-medium tabular-nums text-foreground">
            {formatMoney(order.total)}
          </span>
        </li>
      ))}
    </ul>
  );
}
