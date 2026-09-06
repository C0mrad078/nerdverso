"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction, type FormState } from "@/lib/actions/auth";

const initialState: FormState = { status: "idle", message: "" };

export function ProfileForm({ name, email, phone }: { name: string; email: string; phone: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" name="name" required autoComplete="name" defaultValue={name} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" defaultValue={email} disabled />
        <p className="text-xs text-muted-foreground">
          O e-mail não pode ser alterado por aqui. Fale com o suporte se precisar mudar.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={phone} />
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {state.message}
      </p>

      <Button type="submit" disabled={pending} className="self-start rounded-full">
        {pending ? "Salvando…" : "Salvar dados"}
      </Button>
    </form>
  );
}
