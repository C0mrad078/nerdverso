"use client";

import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteEmployeeAction } from "@/lib/actions/admin-team";
import { EmployeeForm } from "./employee-form";

type EmployeeRow = {
  id: string;
  name: string;
  email: string;
  position: string | null;
  status: string;
  isOwner: boolean;
  roleNames: string[];
  roleIds: string[];
};

export function EmployeeList({
  employees,
  roles,
}: {
  employees: EmployeeRow[];
  roles: { id: string; name: string }[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {creating && (
        <div className="rounded-lg border border-border p-5">
          <h3 className="font-display text-lg text-foreground">Novo funcionário</h3>
          <div className="mt-4">
            <EmployeeForm roles={roles} onDone={() => setCreating(false)} />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => (
              <Fragment key={emp.id}>
                <TableRow>
                  <TableCell className="font-medium">
                    {emp.name}
                    {emp.isOwner && (
                      <Badge variant="outline" className="ml-2">
                        Owner
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                  <TableCell className="text-muted-foreground">{emp.position ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {emp.roleNames.join(", ") || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={emp.status === "ACTIVE" ? "default" : "secondary"}>
                      {emp.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {!emp.isOwner && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(editingId === emp.id ? null : emp.id)}
                        >
                          {editingId === emp.id ? "Fechar" : "Editar"}
                        </Button>
                        <form action={deleteEmployeeAction}>
                          <input type="hidden" name="employeeId" value={emp.id} />
                          <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                            Desativar
                          </Button>
                        </form>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
                {editingId === emp.id && (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-surface">
                      <EmployeeForm
                        roles={roles}
                        employee={{
                          id: emp.id,
                          name: emp.name,
                          email: emp.email,
                          position: emp.position,
                          status: emp.status,
                          roleIds: emp.roleIds,
                        }}
                        onDone={() => setEditingId(null)}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {!creating && (
        <Button onClick={() => setCreating(true)} className="self-start rounded-full">
          Novo funcionário
        </Button>
      )}
    </div>
  );
}
