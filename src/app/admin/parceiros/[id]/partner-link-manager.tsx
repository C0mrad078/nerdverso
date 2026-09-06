"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPartnerLinkAction, deletePartnerLinkAction } from "@/lib/actions/admin-partners";
import type { FormState } from "@/lib/actions/auth";
import type { PartnerLink } from "@/generated/prisma/client";

const initialState: FormState = { status: "idle", message: "" };

export function PartnerLinkManager({
  partnerId,
  partnerCode,
  siteUrl,
  links,
}: {
  partnerId: string;
  partnerCode: string;
  siteUrl: string;
  links: PartnerLink[];
}) {
  const action = createPartnerLinkAction.bind(null, partnerId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <div className="flex flex-col gap-4">
      <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="path">Caminho</Label>
          <Input id="path" name="path" placeholder="/produtos" defaultValue="/" className="w-48" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="label">Rótulo</Label>
          <Input id="label" name="label" placeholder="Ex: Stories de lançamento" className="w-56" />
        </div>
        <Button type="submit" disabled={pending} className="rounded-full">
          {pending ? "Criando…" : "Criar link"}
        </Button>
      </form>
      {state.status === "error" && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {links.length === 0 && (
          <li className="text-sm text-muted-foreground">Nenhum link criado ainda.</li>
        )}
        {links.map((link) => {
          const url = `${siteUrl}${link.path}${link.path.includes("?") ? "&" : "?"}ref=${partnerCode}`;
          return (
            <li
              key={link.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
            >
              <div>
                {link.label && <p className="text-sm text-foreground">{link.label}</p>}
                <p className="break-all text-xs text-muted-foreground">{url}</p>
              </div>
              <form action={deletePartnerLinkAction}>
                <input type="hidden" name="linkId" value={link.id} />
                <input type="hidden" name="partnerId" value={partnerId} />
                <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                  Remover
                </Button>
              </form>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
