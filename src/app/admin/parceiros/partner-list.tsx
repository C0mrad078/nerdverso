"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deletePartnerAction } from "@/lib/actions/admin-partners";
import { formatMoney } from "@/lib/format";
import { PartnerForm } from "./partner-form";
import type { Partner } from "@/generated/prisma/client";

type PartnerRow = Omit<Partner, "commissionPercent"> & {
  commissionPercent: number;
  clickCount: number;
  conversionCount: number;
  totalCommission: number;
};

export function PartnerList({ partners }: { partners: PartnerRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {creating && (
        <div className="rounded-lg border border-border p-5">
          <h3 className="font-display text-lg text-foreground">Novo parceiro</h3>
          <div className="mt-4">
            <PartnerForm onDone={() => setCreating(false)} />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parceiro</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Comissão</TableHead>
              <TableHead>Cliques</TableHead>
              <TableHead>Conversões</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.map((partner) => (
              <Fragment key={partner.id}>
                <TableRow>
                  <TableCell className="font-medium">
                    <Link href={`/admin/parceiros/${partner.id}`} className="hover:underline">
                      {partner.name}
                    </Link>
                    <span className="block text-xs text-muted-foreground">{partner.email}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{partner.code}</TableCell>
                  <TableCell className="tabular-nums">{partner.commissionPercent}%</TableCell>
                  <TableCell className="tabular-nums">{partner.clickCount}</TableCell>
                  <TableCell className="tabular-nums">
                    {partner.conversionCount} · {formatMoney(partner.totalCommission)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={partner.status === "ACTIVE" ? "default" : "secondary"}>
                      {partner.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(editingId === partner.id ? null : partner.id)}
                      >
                        {editingId === partner.id ? "Fechar" : "Editar"}
                      </Button>
                      <form action={deletePartnerAction}>
                        <input type="hidden" name="partnerId" value={partner.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                          Excluir
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
                {editingId === partner.id && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-surface">
                      <PartnerForm partner={partner} onDone={() => setEditingId(null)} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {!creating && (
        <Button onClick={() => setCreating(true)} className="self-start rounded-full">
          Novo parceiro
        </Button>
      )}
    </div>
  );
}
