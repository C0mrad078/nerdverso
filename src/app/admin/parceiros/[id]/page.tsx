import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/authorize";
import { getPartnerDetail } from "@/lib/data/admin-partners";
import { closeCommissionPeriodAction } from "@/lib/actions/admin-partners";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PartnerLinkManager } from "./partner-link-manager";

export const metadata = { title: "Detalhe do parceiro" };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date) {
  return new Date(date).toLocaleString("pt-BR");
}

function currentPeriod() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function PartnerDetailPage(props: PageProps<"/admin/parceiros/[id]">) {
  await requirePermission("partners.view");
  const { id } = await props.params;

  const detail = await getPartnerDetail(id);
  if (!detail) notFound();

  const { partner, clickCount, conversionCount, totalSales, pendingCommission, conversions, commissions } = detail;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/parceiros" className="text-sm text-muted-foreground hover:text-foreground">
          ← Voltar para parceiros
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="font-display text-2xl text-foreground">{partner.name}</h1>
          <Badge variant={partner.status === "ACTIVE" ? "default" : "secondary"}>
            {partner.status === "ACTIVE" ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {partner.email} · Código <span className="font-mono">{partner.code}</span> · Comissão{" "}
          {partner.commissionPercent}%
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Cliques</p>
          <p className="mt-1 font-display text-xl text-foreground">{clickCount}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Conversões</p>
          <p className="mt-1 font-display text-xl text-foreground">{conversionCount}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Vendas geradas</p>
          <p className="mt-1 font-display text-xl text-foreground">{formatCurrency(totalSales)}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Comissão pendente</p>
          <p className="mt-1 font-display text-xl text-foreground">{formatCurrency(pendingCommission)}</p>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-foreground">Links de indicação</h2>
        <PartnerLinkManager
          partnerId={partner.id}
          partnerCode={partner.code}
          siteUrl={siteUrl}
          links={partner.links}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-foreground">Conversões</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Total do pedido</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhuma conversão registrada ainda.
                  </TableCell>
                </TableRow>
              )}
              {conversions.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.orderNumber}</TableCell>
                  <TableCell>
                    {c.customerName}
                    <span className="block text-xs text-muted-foreground">{c.customerEmail}</span>
                  </TableCell>
                  <TableCell>{formatCurrency(c.commissionAmount)}</TableCell>
                  <TableCell>{formatCurrency(c.orderTotal)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-foreground">Comissões por período</h2>
        <form action={closeCommissionPeriodAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="partnerId" value={partner.id} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="period">Período (AAAA-MM)</Label>
            <Input id="period" name="period" defaultValue={currentPeriod()} className="w-36" />
          </div>
          <Button type="submit" variant="outline" className="rounded-full">
            Fechar período como pago
          </Button>
        </form>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Vendas</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pago em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum período fechado ainda.
                  </TableCell>
                </TableRow>
              )}
              {commissions.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.period}</TableCell>
                  <TableCell>{formatCurrency(c.totalSales)}</TableCell>
                  <TableCell>{formatCurrency(c.totalCommission)}</TableCell>
                  <TableCell>{c.status === "paid" ? "Pago" : "Pendente"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.paidAt ? formatDate(c.paidAt) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
