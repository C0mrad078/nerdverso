"use client";

import { Fragment, useState } from "react";
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
import { deletePromotionAction } from "@/lib/actions/admin-promotions";
import { PromotionForm } from "./promotion-form";
import type { Promotion, PromotionType } from "@/generated/prisma/client";

const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  PERCENTAGE: "Percentual",
  FIXED_PRICE: "Preço fixo",
  BUY_X_GET_Y: "Compre X, leve Y",
  QUANTITY_DISCOUNT: "Desconto por quantidade",
  FREE_SHIPPING: "Frete grátis",
};

type PromotionRow = Omit<Promotion, "discountValue" | "minOrderValue"> & {
  discountValue: number | null;
  minOrderValue: number | null;
  categories: { category: { id: string; name: string } }[];
  collections: { collection: { id: string; name: string } }[];
};

export function PromotionList({
  promotions,
  categories,
  collections,
}: {
  promotions: PromotionRow[];
  categories: { id: string; name: string }[];
  collections: { id: string; name: string }[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {creating && (
        <div className="rounded-lg border border-border p-5">
          <h3 className="font-display text-lg text-foreground">Nova promoção</h3>
          <div className="mt-4">
            <PromotionForm categories={categories} collections={collections} onDone={() => setCreating(false)} />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Escopo</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((promotion) => (
              <Fragment key={promotion.id}>
                <TableRow>
                  <TableCell className="font-medium">{promotion.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {PROMOTION_TYPE_LABELS[promotion.type]}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {promotion.categories.length === 0 && promotion.collections.length === 0
                      ? "Todo o catálogo"
                      : [
                          ...promotion.categories.map((c) => c.category.name),
                          ...promotion.collections.map((c) => c.collection.name),
                        ].join(", ")}
                  </TableCell>
                  <TableCell className="tabular-nums">{promotion.priority}</TableCell>
                  <TableCell>
                    <Badge variant={promotion.active ? "default" : "secondary"}>
                      {promotion.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(editingId === promotion.id ? null : promotion.id)}
                      >
                        {editingId === promotion.id ? "Fechar" : "Editar"}
                      </Button>
                      <form action={deletePromotionAction}>
                        <input type="hidden" name="promotionId" value={promotion.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                          Excluir
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
                {editingId === promotion.id && (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-surface">
                      <PromotionForm
                        promotion={promotion}
                        categories={categories}
                        collections={collections}
                        onDone={() => setEditingId(null)}
                      />
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
          Nova promoção
        </Button>
      )}
    </div>
  );
}
