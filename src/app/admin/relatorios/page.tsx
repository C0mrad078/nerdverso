import Link from "next/link";
import { requirePermission } from "@/lib/auth/authorize";
import { resolveDateRange, getSalesSummary, getTopSellingProducts } from "@/lib/data/admin-dashboard";
import {
  getItemsSoldCount,
  getSalesByCategory,
  getTopCustomers,
  getCouponPerformance,
  getPartnerPerformance,
} from "@/lib/data/admin-reports";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Relatórios" };

const PERIODS = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "month", label: "Este mês" },
];

export default async function AdminReportsPage(props: PageProps<"/admin/relatorios">) {
  await requirePermission("reports.view");
  const searchParams = await props.searchParams;
  const periodParam = searchParams.period;
  const period = (Array.isArray(periodParam) ? periodParam[0] : periodParam) ?? "30d";

  const range = resolveDateRange(period);

  const [sales, itemsSold, topProducts, salesByCategory, topCustomers, coupons, partners] = await Promise.all([
    getSalesSummary(range),
    getItemsSoldCount(range),
    getTopSellingProducts(range, 10),
    getSalesByCategory(range),
    getTopCustomers(range),
    getCouponPerformance(range),
    getPartnerPerformance(range),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-foreground">Relatórios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Desempenho de vendas, catálogo, cupons e parceiros no período selecionado.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <a href={`/admin/relatorios/export?period=${period}`}>Exportar pedidos (CSV)</a>
        </Button>
      </div>

      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <Button
            key={p.value}
            asChild
            variant={p.value === period ? "default" : "outline"}
            size="sm"
            className="rounded-full"
          >
            <Link href={`/admin/relatorios?period=${p.value}`}>{p.label}</Link>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Receita</p>
          <p className="mt-1 font-display text-xl text-foreground">{formatMoney(sales.revenue)}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Pedidos</p>
          <p className="mt-1 font-display text-xl text-foreground">{sales.count}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Ticket médio</p>
          <p className="mt-1 font-display text-xl text-foreground">{formatMoney(sales.averageTicket)}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Itens vendidos</p>
          <p className="mt-1 font-display text-xl text-foreground">{itemsSold}</p>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-foreground">Produtos mais vendidos</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Receita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Nenhuma venda no período.
                  </TableCell>
                </TableRow>
              )}
              {topProducts.map((p) => (
                <TableRow key={p.productId}>
                  <TableCell className="font-medium">{p.productName}</TableCell>
                  <TableCell className="tabular-nums">{p.quantity}</TableCell>
                  <TableCell>{formatMoney(p.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-lg text-foreground">Vendas por categoria</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Qtd.</TableHead>
                  <TableHead>Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesByCategory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Sem dados.
                    </TableCell>
                  </TableRow>
                )}
                {salesByCategory.map((c) => (
                  <TableRow key={c.name}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="tabular-nums">{c.quantity}</TableCell>
                    <TableCell>{formatMoney(c.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-display text-lg text-foreground">Melhores clientes</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Pedidos</TableHead>
                  <TableHead>Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Sem dados.
                    </TableCell>
                  </TableRow>
                )}
                {topCustomers.map((c) => (
                  <TableRow key={c.email}>
                    <TableCell className="font-medium">
                      {c.name}
                      <span className="block text-xs text-muted-foreground">{c.email}</span>
                    </TableCell>
                    <TableCell className="tabular-nums">{c.orders}</TableCell>
                    <TableCell>{formatMoney(c.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-lg text-foreground">Cupons</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Desconto total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhum cupom usado no período.
                    </TableCell>
                  </TableRow>
                )}
                {coupons.map((c) => (
                  <TableRow key={c.code}>
                    <TableCell className="font-medium">{c.code}</TableCell>
                    <TableCell className="tabular-nums">{c.uses}</TableCell>
                    <TableCell>{formatMoney(c.totalDiscount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-display text-lg text-foreground">Parceiros</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Conversões</TableHead>
                  <TableHead>Comissão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhuma conversão no período.
                    </TableCell>
                  </TableRow>
                )}
                {partners.map((p) => (
                  <TableRow key={p.code}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="tabular-nums">{p.conversions}</TableCell>
                    <TableCell>{formatMoney(p.commission)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
}
