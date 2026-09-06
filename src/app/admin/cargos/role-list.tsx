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
import { deleteRoleAction } from "@/lib/actions/admin-team";
import { RoleForm } from "./role-form";

type RoleRow = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissionKeys: string[];
  userCount: number;
};

export function RoleList({ roles }: { roles: RoleRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {creating && (
        <div className="rounded-lg border border-border p-5">
          <h3 className="font-display text-lg text-foreground">Novo cargo</h3>
          <div className="mt-4">
            <RoleForm onDone={() => setCreating(false)} />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cargo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead>Funcionários</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <Fragment key={role.id}>
                <TableRow>
                  <TableCell className="font-medium">
                    {role.name}
                    {role.isSystem && (
                      <Badge variant="outline" className="ml-2">
                        Protegido
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{role.description}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {role.isSystem ? "Todas" : role.permissionKeys.length}
                  </TableCell>
                  <TableCell className="tabular-nums">{role.userCount}</TableCell>
                  <TableCell className="text-right">
                    {!role.isSystem && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(editingId === role.id ? null : role.id)}
                        >
                          {editingId === role.id ? "Fechar" : "Editar"}
                        </Button>
                        <form action={deleteRoleAction}>
                          <input type="hidden" name="roleId" value={role.id} />
                          <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                            Excluir
                          </Button>
                        </form>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
                {editingId === role.id && (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-surface">
                      <RoleForm role={role} onDone={() => setEditingId(null)} />
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
          Novo cargo
        </Button>
      )}
    </div>
  );
}
