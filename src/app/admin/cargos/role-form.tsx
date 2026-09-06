"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertRoleAction } from "@/lib/actions/admin-team";
import type { FormState } from "@/lib/actions/auth";
import { PERMISSION_LABELS, PERMISSION_MODULES, type PermissionModule } from "@/lib/rbac/permissions";

const initialState: FormState = { status: "idle", message: "" };

const ACTION_LABELS: Record<string, string> = {
  view: "Ver",
  create: "Criar",
  update: "Editar",
  delete: "Excluir",
};

export function RoleForm({
  role,
  onDone,
}: {
  role?: { id: string; name: string; description: string | null; permissionKeys: string[] };
  onDone?: () => void;
}) {
  const action = upsertRoleAction.bind(null, role?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success") onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nome do cargo</Label>
          <Input id="name" name="name" required defaultValue={role?.name ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Descrição</Label>
          <Input id="description" name="description" defaultValue={role?.description ?? ""} />
        </div>
      </div>

      <div>
        <Label>Permissões</Label>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(PERMISSION_MODULES) as PermissionModule[]).map((module) => (
            <div key={module} className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium text-foreground">{PERMISSION_LABELS[module]}</p>
              <div className="mt-2 flex flex-col gap-1.5">
                {PERMISSION_MODULES[module].map((permAction) => {
                  const key = `${module}.${permAction}`;
                  return (
                    <label key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        name="permissionKeys"
                        value={key}
                        defaultChecked={role?.permissionKeys.includes(key) ?? false}
                        className="size-4 rounded border-border"
                      />
                      {ACTION_LABELS[permAction] ?? permAction}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {state.status === "error" && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start rounded-full">
        {pending ? "Salvando…" : "Salvar cargo"}
      </Button>
    </form>
  );
}
