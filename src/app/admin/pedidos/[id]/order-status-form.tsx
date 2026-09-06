"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatusAction } from "@/lib/actions/admin-orders";
import type { FormState } from "@/lib/actions/auth";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TRANSITIONS } from "@/lib/orders";

const initialState: FormState = { status: "idle", message: "" };

export function OrderStatusForm({
  orderId,
  currentStatus,
  trackingCode,
}: {
  orderId: string;
  currentStatus: string;
  trackingCode: string | null;
}) {
  const action = updateOrderStatusAction.bind(null, orderId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const options = ORDER_STATUS_TRANSITIONS[currentStatus] ?? [];

  if (options.length === 0) {
    return <p className="text-sm text-muted-foreground">Este pedido está em um status final.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Novo status</Label>
        <Select name="status" defaultValue={options[0]}>
          <SelectTrigger id="status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((value) => (
              <SelectItem key={value} value={value}>
                {ORDER_STATUS_LABELS[value] ?? value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="trackingCode">Código de rastreamento (opcional)</Label>
        <Input id="trackingCode" name="trackingCode" defaultValue={trackingCode ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="note">Observação (opcional)</Label>
        <Textarea id="note" name="note" rows={2} />
      </div>

      {state.message && (
        <p
          role="status"
          aria-live="polite"
          className={`text-sm ${state.status === "error" ? "text-destructive" : "text-muted-foreground"}`}
        >
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start rounded-full">
        {pending ? "Atualizando…" : "Atualizar status"}
      </Button>
    </form>
  );
}
