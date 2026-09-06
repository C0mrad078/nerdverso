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
import { deleteCouponAction } from "@/lib/actions/admin-promotions";
import { formatMoney } from "@/lib/format";
import { CouponForm } from "./coupon-form";
import type { Coupon } from "@/generated/prisma/client";

type CouponRow = Omit<Coupon, "discountValue" | "minOrderValue"> & {
  discountValue: number;
  minOrderValue: number | null;
  _count: { usages: number };
};

const DISCOUNT_LABELS: Record<string, (value: number) => string> = {
  PERCENTAGE: (v) => `${v}%`,
  FIXED: (v) => formatMoney(v),
  FREE_SHIPPING: () => "Frete grátis",
};

export function CouponList({ coupons }: { coupons: CouponRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {creating && (
        <div className="rounded-lg border border-border p-5">
          <h3 className="font-display text-lg text-foreground">Novo cupom</h3>
          <div className="mt-4">
            <CouponForm onDone={() => setCreating(false)} />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Usos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <Fragment key={coupon.id}>
                <TableRow>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {DISCOUNT_LABELS[coupon.discountType]?.(coupon.discountValue)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    <Link href={`/admin/cupons/${coupon.id}`} className="text-primary hover:underline">
                      {coupon._count.usages}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.active ? "default" : "secondary"}>
                      {coupon.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(editingId === coupon.id ? null : coupon.id)}
                      >
                        {editingId === coupon.id ? "Fechar" : "Editar"}
                      </Button>
                      <form action={deleteCouponAction}>
                        <input type="hidden" name="couponId" value={coupon.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                          Excluir
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
                {editingId === coupon.id && (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-surface">
                      <CouponForm coupon={coupon} onDone={() => setEditingId(null)} />
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
          Novo cupom
        </Button>
      )}
    </div>
  );
}
