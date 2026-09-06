"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEmployeeAction, updateEmployeeAction } from "@/lib/actions/admin-team";
import type { FormState } from "@/lib/actions/auth";

const initialState: FormState = { status: "idle", message: "" };

type Role = { id: string; name: string };

export function EmployeeForm({
  roles,
  employee,
  onDone,
}: {
  roles: Role[];
  employee?: {
    id: string;
    name: string;
    email: string;
    position: string | null;
    status: string;
    roleIds: string[];
  };
  onDone?: () => void;
}) {
  const action = employee
    ? updateEmployeeAction.bind(null, employee.id)
    : createEmployeeAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success") onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {!employee && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Senha inicial</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
          </>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="position">Cargo/função (texto livre)</Label>
          <Input id="position" name="position" defaultValue={employee?.position ?? ""} />
        </div>
        {employee && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={employee.status}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="INACTIVE">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div>
        <Label>Cargos (permissões)</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {roles.map((role) => (
            <label
              key={role.id}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm text-foreground has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary"
            >
              <input
                type="checkbox"
                name="roleIds"
                value={role.id}
                defaultChecked={employee?.roleIds.includes(role.id) ?? false}
                className="sr-only"
              />
              {role.name}
            </label>
          ))}
        </div>
      </div>

      {state.status === "error" && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start rounded-full">
        {pending ? "Salvando…" : employee ? "Salvar alterações" : "Criar funcionário"}
      </Button>
    </form>
  );
}
