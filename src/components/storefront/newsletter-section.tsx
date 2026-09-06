"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";

const initialState = { status: "idle" as const, message: "" };

export function NewsletterSection() {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-surface px-6 py-12 text-center sm:px-12">
        <h2 className="font-display uppercase tracking-tight text-balance text-2xl text-foreground sm:text-3xl">
          Não perca os próximos lançamentos
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Assine a newsletter e receba primeiro as novas coleções e promoções da Nerdverso.
        </p>
        <form action={formAction} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            name="email"
            required
            placeholder="seu@email.com"
            aria-label="Seu e-mail"
            autoComplete="email"
            spellCheck={false}
            className="h-11 bg-background"
          />
          <Button type="submit" disabled={pending} className="h-11 shrink-0 rounded-full px-6">
            {pending ? "Enviando…" : "Quero receber"}
          </Button>
        </form>
        {state.message && (
          <p
            role="status"
            aria-live="polite"
            className={`mt-3 text-sm ${state.status === "error" ? "text-destructive" : "text-muted-foreground"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </section>
  );
}
