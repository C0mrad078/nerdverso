import Link from "next/link";
import { requirePermission } from "@/lib/auth/authorize";
import {
  getCustomerCount,
  getLowStockVariants,
  getOutOfStockCount,
  getPendingOrdersCount,
  getRecentOrders,
  getSalesSummary,
  getTopSellingProducts,
  resolveDateRange,
} from "@/lib/data/admin-dashboard";
import { formatDate, formatMoney } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/orders";

export const metadata = { title: "Dashboard" };

const PERIODS = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "month", label: "Este mês" },
] as const;

export default async function AdminDashboardPage(props: PageProps<"/admin">) {
  await requirePermission("dashboard.view");

  const searchParams = await props.searchParams;
  const periodParam = searchParams.period;
  const period = Array.isArray(periodParam) ? periodParam[0] : (periodParam ?? "today");
  const range = resolveDateRange(period);

  const [sales, pendingOrders, recentOrders, lowStock, outOfStockCount, topProducts, customerCount] =
    await Promise.all([
      getSalesSummary(range),
      getPendingOrdersCount(),
      getRecentOrders(),
      getLowStockVariants(),
      getOutOfStockCount(),
      getTopSellingProducts(range),
      getCustomerCount(),
    ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-foreground">Dashboard</h1>
        <div className="flex gap-1 rounded-lg bg-surface p-1">
          {PERIODS.map((p) => (
            <Link
              key={p.value}
              href={`/admin?period=${p.value}`}
              className={`rounded-md px-3 py-1.5 text-sm ${
                period === p.value
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Receita no período" value={formatMoney(sales.revenue)} />
        <KpiCard label="Pedidos no período" value={String(sales.count)} />
        <KpiCard label="Ticket médio" value={formatMoney(sales.averageTicket)} />
        <KpiCard
          label="Pedidos aguardando pagamento"
          value={String(pendingOrders)}
          href="/admin/pedidos?status=AWAITING_PAYMENT"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-foreground">Pedidos recentes</h2>
            <Link href="/admin/pedidos" className="text-sm text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Nenhum pedido ainda.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <div>
                    <Link href={`/admin/pedidos/${order.id}`} className="text-foreground hover:text-primary">
                      #{order.number}
                    </Link>
                    <p className="text-muted-foreground">
                      {order.customerName} • {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="tabular-nums text-foreground">{formatMoney(order.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-border p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-foreground">Produtos mais vendidos</h2>
          </div>
          {topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Nenhuma venda no período selecionado.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {topProducts.map((product) => (
                <li key={product.productId} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <span className="text-foreground">{product.productName}</span>
                  <span className="tabular-nums text-muted-foreground">{product.quantity} un.</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-border p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-foreground">Estoque baixo</h2>
            <Link href="/admin/estoque" className="text-sm text-primary hover:underline">
              Ver estoque
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Nenhuma variante com estoque baixo.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {lowStock.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <div>
                    <p className="text-foreground">{item.productName}</p>
                    <p className="text-muted-foreground">{item.variantLabel}</p>
                  </div>
                  <span className="tabular-nums text-warning">
                    {item.quantity} / {item.minStock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-border p-5">
          <h2 className="font-display text-lg text-foreground">Outros indicadores</h2>
          <dl className="mt-4 flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Variantes esgotadas</dt>
              <dd className="tabular-nums text-foreground">{outOfStockCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Clientes cadastrados</dt>
              <dd className="tabular-nums text-foreground">{customerCount}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

function KpiCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="rounded-lg border border-border p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl tabular-nums text-foreground">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
