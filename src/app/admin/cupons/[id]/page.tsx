import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/authorize";
import { prisma } from "@/lib/db/client";
import { getCouponReport } from "@/lib/data/admin-promotions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Relatório de cupom" };

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date) {
  return new Date(date).toLocaleString("pt-BR");
}

export default async function CouponReportPage(props: PageProps<"/admin/cupons/[id]">) {
  await requirePermission("coupons.view");
  const { id } = await props.params;

  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) notFound();

  const report = await getCouponReport(id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/cupons" className="text-sm text-muted-foreground hover:text-foreground">
          ← Voltar para cupons
        </Link>
        <h1 className="mt-2 font-display text-2xl text-foreground">Relatório — {coupon.code}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{coupon.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Usos</p>
          <p className="mt-1 font-display text-xl text-foreground">{report.count}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Desconto total</p>
          <p className="mt-1 font-display text-xl text-foreground">{formatCurrency(report.totalDiscount)}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Receita gerada</p>
          <p className="mt-1 font-display text-xl text-foreground">{formatCurrency(report.totalRevenue)}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Ticket médio</p>
          <p className="mt-1 font-display text-xl text-foreground">{formatCurrency(report.averageTicket)}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Total do pedido</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.usages.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum uso registrado ainda.
                </TableCell>
              </TableRow>
            )}
            {report.usages.map((usage) => (
              <TableRow key={usage.id}>
                <TableCell className="font-medium">{usage.orderNumber}</TableCell>
                <TableCell>
                  {usage.customerName}
                  <span className="block text-xs text-muted-foreground">{usage.customerEmail}</span>
                </TableCell>
                <TableCell>{formatCurrency(usage.discountAmount)}</TableCell>
                <TableCell>{formatCurrency(usage.orderTotal)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(usage.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
