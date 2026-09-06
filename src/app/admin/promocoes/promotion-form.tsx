"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertPromotionAction } from "@/lib/actions/admin-promotions";
import type { FormState } from "@/lib/actions/auth";
import type { Promotion, PromotionType } from "@/generated/prisma/client";

const initialState: FormState = { status: "idle", message: "" };

const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  PERCENTAGE: "Percentual sobre o pedido",
  FIXED_PRICE: "Preço fixo",
  BUY_X_GET_Y: "Compre X, leve Y",
  QUANTITY_DISCOUNT: "Desconto por quantidade",
  FREE_SHIPPING: "Frete grátis",
};

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

type PromotionRow = Omit<Promotion, "discountValue" | "minOrderValue"> & {
  discountValue: number | null;
  minOrderValue: number | null;
  categories: { category: { id: string; name: string } }[];
  collections: { collection: { id: string; name: string } }[];
};

export function PromotionForm({
  promotion,
  categories,
  collections,
  onDone,
}: {
  promotion?: PromotionRow;
  categories: { id: string; name: string }[];
  collections: { id: string; name: string }[];
  onDone?: () => void;
}) {
  const action = upsertPromotionAction.bind(null, promotion?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [type, setType] = useState<PromotionType>(promotion?.type ?? "PERCENTAGE");

  useEffect(() => {
    if (state.status === "success") onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const selectedCategoryIds = new Set(promotion?.categories.map((c) => c.category.id) ?? []);
  const selectedCollectionIds = new Set(promotion?.collections.map((c) => c.collection.id) ?? []);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required defaultValue={promotion?.name ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="type">Tipo</Label>
        <Select name="type" value={type} onValueChange={(v) => setType(v as PromotionType)}>
          <SelectTrigger id="type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PROMOTION_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(type === "PERCENTAGE" || type === "FIXED_PRICE" || type === "QUANTITY_DISCOUNT") && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="discountValue">Valor do desconto</Label>
          <Input
            id="discountValue"
            name="discountValue"
            type="number"
            step="0.01"
            min={0}
            defaultValue={promotion?.discountValue ?? ""}
          />
        </div>
      )}

      {type === "BUY_X_GET_Y" && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="buyQuantity">Quantidade comprada</Label>
            <Input id="buyQuantity" name="buyQuantity" type="number" min={1} defaultValue={promotion?.buyQuantity ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="getQuantity">Quantidade grátis</Label>
            <Input id="getQuantity" name="getQuantity" type="number" min={1} defaultValue={promotion?.getQuantity ?? ""} />
          </div>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="minQuantity">Quantidade mínima</Label>
        <Input id="minQuantity" name="minQuantity" type="number" min={0} defaultValue={promotion?.minQuantity ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="minOrderValue">Valor mínimo do pedido</Label>
        <Input
          id="minOrderValue"
          name="minOrderValue"
          type="number"
          step="0.01"
          min={0}
          defaultValue={promotion?.minOrderValue ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="priority">Prioridade</Label>
        <Input id="priority" name="priority" type="number" min={0} defaultValue={promotion?.priority ?? 0} />
      </div>
      <div />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="startsAt">Início da validade</Label>
        <Input id="startsAt" name="startsAt" type="date" defaultValue={toDateInputValue(promotion?.startsAt)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="endsAt">Fim da validade</Label>
        <Input id="endsAt" name="endsAt" type="date" defaultValue={toDateInputValue(promotion?.endsAt)} />
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label>Categorias aplicáveis</Label>
        <div className="flex flex-wrap gap-3 rounded-md border border-border p-3">
          {categories.length === 0 && <span className="text-sm text-muted-foreground">Nenhuma categoria cadastrada.</span>}
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                name="categoryIds"
                value={category.id}
                defaultChecked={selectedCategoryIds.has(category.id)}
                className="size-4 rounded border-border"
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label>Coleções aplicáveis</Label>
        <div className="flex flex-wrap gap-3 rounded-md border border-border p-3">
          {collections.length === 0 && <span className="text-sm text-muted-foreground">Nenhuma coleção cadastrada.</span>}
          {collections.map((collection) => (
            <label key={collection.id} className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                name="collectionIds"
                value={collection.id}
                defaultChecked={selectedCollectionIds.has(collection.id)}
                className="size-4 rounded border-border"
              />
              {collection.name}
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 sm:col-span-2">
        <Switch name="active" defaultChecked={promotion?.active ?? true} />
        <span className="text-sm text-foreground">Promoção ativa</span>
      </label>

      {state.status === "error" && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive sm:col-span-2">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="rounded-full sm:col-span-2">
        {pending ? "Salvando…" : "Salvar promoção"}
      </Button>
    </form>
  );
}
