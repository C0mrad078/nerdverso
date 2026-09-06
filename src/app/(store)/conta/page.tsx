import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { getAddressesForUser, getOrdersForUser } from "@/lib/data/account";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Minha conta" };

export default async function AccountDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [orders, addresses] = await Promise.all([
    getOrdersForUser(session.user.id),
    getAddressesForUser(session.user.id),
  ]);

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-surface p-5">
          <p className="text-sm text-muted-foreground">Pedidos</p>
          <p className="mt-1 font-display text-2xl text-foreground">{orders.length}</p>
        </div>
        <div className="rounded-lg bg-surface p-5">
          <p className="text-sm text-muted-foreground">Total gasto</p>
          <p className="mt-1 font-display text-2xl tabular-nums text-foreground">
            {formatMoney(totalSpent)}
          </p>
        </div>
        <div className="rounded-lg bg-surface p-5">
          <p className="text-sm text-muted-foreground">Endereços salvos</p>
          <p className="mt-1 font-display text-2xl text-foreground">{addresses.length}</p>
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg text-foreground">Últimos pedidos</h2>
        {orders.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Você ainda não fez nenhum pedido.{" "}
            <Link href="/produtos" className="text-primary underline underline-offset-4">
              Começar a comprar
            </Link>
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {orders.slice(0, 5).map((order) => (
              <li key={order.id} className="flex items-center justify-between py-3 text-sm">
                <Link href={`/conta/pedidos/${order.id}`} className="text-foreground hover:text-primary">
                  Pedido #{order.number}
                </Link>
                <span className="tabular-nums text-muted-foreground">
                  {formatMoney(order.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
