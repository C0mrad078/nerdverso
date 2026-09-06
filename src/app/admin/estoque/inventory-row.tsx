"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adjustInventoryAction, updateMinStockAction } from "@/lib/actions/admin-inventory";
import type { FormState } from "@/lib/actions/auth";

const initialState: FormState = { status: "idle", message: "" };

type InventoryRowData = {
  id: string;
  sku: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  reserved: number;
  minStock: number;
};

export function InventoryRow({ item }: { item: InventoryRowData }) {
  const [open, setOpen] = useState(false);
  const action = adjustInventoryAction.bind(null, item.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  const available = item.quantity - item.reserved;
  const low = available > 0 && available <= item.minStock;
  const out = available <= 0;

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{item.productName}</TableCell>
        <TableCell className="text-muted-foreground">{item.variantLabel}</TableCell>
        <TableCell className="text-muted-foreground">{item.sku}</TableCell>
        <TableCell className="tabular-nums">{available}</TableCell>
        <TableCell>
          <form action={updateMinStockAction} className="flex items-center gap-1">
            <input type="hidden" name="inventoryId" value={item.id} />
            <Input
              name="minStock"
              type="number"
              min={0}
              defaultValue={item.minStock}
              onBlur={(e) => e.currentTarget.form?.requestSubmit()}
              className="h-8 w-20"
            />
          </form>
        </TableCell>
        <TableCell>
          {out ? (
            <Badge variant="secondary" className="text-destructive">
              Esgotado
            </Badge>
          ) : low ? (
            <Badge variant="secondary" className="text-warning">
              Baixo
            </Badge>
          ) : (
            <Badge variant="default">OK</Badge>
          )}
        </TableCell>
        <TableCell className="text-right">
          <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
            {open ? "Fechar" : "Ajustar"}
          </Button>
        </TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell colSpan={7} className="bg-surface">
            <form action={formAction} className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`type-${item.id}`}>Tipo</Label>
                <Select name="type" defaultValue="IN">
                  <SelectTrigger id={`type-${item.id}`} className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">Entrada</SelectItem>
                    <SelectItem value="OUT">Saída</SelectItem>
                    <SelectItem value="ADJUSTMENT">Ajuste (definir total)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`quantity-${item.id}`}>Quantidade</Label>
                <Input id={`quantity-${item.id}`} name="quantity" type="number" min={1} required className="w-28" />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor={`reason-${item.id}`}>Motivo</Label>
                <Input id={`reason-${item.id}`} name="reason" required placeholder="Ex: recebimento de fornecedor" />
              </div>
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando…" : "Confirmar"}
              </Button>
              {state.status === "error" && (
                <p role="alert" className="w-full text-sm text-destructive">
                  {state.message}
                </p>
              )}
            </form>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
