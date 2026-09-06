"use client";

import { useActionState, useEffect } from "react";
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
import { upsertCouponAction } from "@/lib/actions/admin-promotions";
import type { FormState } from "@/lib/actions/auth";
import type { Coupon } from "@/generated/prisma/client";

const initialState: FormState = { status: "idle", message: "" };

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function CouponForm({
  coupon,
  onDone,
}: {
  coupon?: Omit<Coupon, "discountValue" | "minOrderValue"> & {
    discountValue: number;
    minOrderValue: number | null;
  };
  onDone?: () => void;
}) {
  const action = upsertCouponAction.bind(null, coupon?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success") onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">Código</Label>
        <Input id="code" name="code" required defaultValue={coupon?.code ?? ""} className="uppercase" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Input id="description" name="description" defaultValue={coupon?.description ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="discountType">Tipo de desconto</Label>
        <Select name="discountType" defaultValue={coupon?.discountType ?? "PERCENTAGE"}>
          <SelectTrigger id="discountType" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PERCENTAGE">Percentual</SelectItem>
            <SelectItem value="FIXED">Valor fixo</SelectItem>
            <SelectItem value="FREE_SHIPPING">Frete grátis</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="discountValue">Valor do desconto</Label>
        <Input
          id="discountValue"
          name="discountValue"
          type="number"
          step="0.01"
          min={0}
          required
          defaultValue={coupon?.discountValue ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="minOrderValue">Valor mínimo do pedido</Label>
        <Input
          id="minOrderValue"
          name="minOrderValue"
          type="number"
          step="0.01"
          min={0}
          defaultValue={coupon?.minOrderValue ?? ""}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="minQuantity">Quantidade mínima</Label>
        <Input
          id="minQuantity"
          name="minQuantity"
          type="number"
          min={0}
          defaultValue={coupon?.minQuantity ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="usageLimit">Limite global de usos</Label>
        <Input id="usageLimit" name="usageLimit" type="number" min={0} defaultValue={coupon?.usageLimit ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="usageLimitPerCustomer">Limite por cliente</Label>
        <Input
          id="usageLimitPerCustomer"
          name="usageLimitPerCustomer"
          type="number"
          min={0}
          defaultValue={coupon?.usageLimitPerCustomer ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="startsAt">Início da validade</Label>
        <Input id="startsAt" name="startsAt" type="date" defaultValue={toDateInputValue(coupon?.startsAt)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="endsAt">Fim da validade</Label>
        <Input id="endsAt" name="endsAt" type="date" defaultValue={toDateInputValue(coupon?.endsAt)} />
      </div>

      <label className="flex items-center gap-2 sm:col-span-2">
        <Switch name="firstPurchaseOnly" defaultChecked={coupon?.firstPurchaseOnly ?? false} />
        <span className="text-sm text-foreground">Somente primeira compra</span>
      </label>
      <label className="flex items-center gap-2 sm:col-span-2">
        <Switch name="active" defaultChecked={coupon?.active ?? true} />
        <span className="text-sm text-foreground">Cupom ativo</span>
      </label>

      {state.status === "error" && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive sm:col-span-2">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="rounded-full sm:col-span-2">
        {pending ? "Salvando…" : "Salvar cupom"}
      </Button>
    </form>
  );
}
