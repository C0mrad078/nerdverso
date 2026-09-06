"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordResetAction } from "@/lib/actions/auth";

const initialState = { status: "idle" as const, message: "" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" spellCheck={false} />
      </div>

      {state.message && (
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {state.message}
        </p>
      )}

      {"devResetUrl" in state && state.devResetUrl && (
        <p className="rounded-md border border-dashed border-border bg-surface p-3 text-xs text-muted-foreground">
          Ambiente de desenvolvimento (sem envio de e-mail configurado):{" "}
          <Link href={state.devResetUrl} className="text-primary underline">
            abrir link de redefinição
          </Link>
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="mt-2 rounded-full">
        {pending ? "Enviando…" : "Enviar link de redefinição"}
      </Button>

      <Link href="/login" className="text-center text-sm text-muted-foreground hover:text-foreground">
        Voltar para o login
      </Link>
    </form>
  );
}
