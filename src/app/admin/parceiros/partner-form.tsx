"use client";

import { useActionState, useEffect } from "react";
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
import { upsertPartnerAction } from "@/lib/actions/admin-partners";
import type { FormState } from "@/lib/actions/auth";
import type { Partner } from "@/generated/prisma/client";

const initialState: FormState = { status: "idle", message: "" };

export function PartnerForm({
  partner,
  onDone,
}: {
  partner?: Omit<Partner, "commissionPercent"> & { commissionPercent: number };
  onDone?: () => void;
}) {
  const action = upsertPartnerAction.bind(null, partner?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success") onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required defaultValue={partner?.name ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required defaultValue={partner?.email ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" name="phone" defaultValue={partner?.phone ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="commissionPercent">Comissão (%)</Label>
        <Input
          id="commissionPercent"
          name="commissionPercent"
          type="number"
          step="0.01"
          min={0}
          max={100}
          required
          defaultValue={partner?.commissionPercent ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={partner?.status ?? "ACTIVE"}>
          <SelectTrigger id="status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Ativo</SelectItem>
            <SelectItem value="INACTIVE">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={partner?.notes ?? ""} />
      </div>

      {state.status === "error" && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive sm:col-span-2">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="rounded-full sm:col-span-2">
        {pending ? "Salvando…" : "Salvar parceiro"}
      </Button>
    </form>
  );
}
