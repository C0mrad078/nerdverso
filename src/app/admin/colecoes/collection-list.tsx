"use client";

import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { deleteCollectionAction } from "@/lib/actions/admin-catalog";
import { CollectionForm } from "./collection-form";
import type { Collection } from "@/generated/prisma/client";

type CollectionWithCount = Collection & { _count: { products: number } };

export function CollectionList({ collections }: { collections: CollectionWithCount[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {creating && (
        <div className="rounded-lg border border-border p-5">
          <h3 className="font-display text-lg text-foreground">Nova coleção</h3>
          <div className="mt-4">
            <CollectionForm onDone={() => setCreating(false)} />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.map((collection) => (
              <Fragment key={collection.id}>
                <TableRow>
                  <TableCell className="font-medium">{collection.name}</TableCell>
                  <TableCell className="text-muted-foreground">{collection.slug}</TableCell>
                  <TableCell className="tabular-nums">{collection._count.products}</TableCell>
                  <TableCell>
                    <Badge variant={collection.status === "ACTIVE" ? "default" : "secondary"}>
                      {collection.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(editingId === collection.id ? null : collection.id)}
                      >
                        {editingId === collection.id ? "Fechar" : "Editar"}
                      </Button>
                      <form action={deleteCollectionAction}>
                        <input type="hidden" name="collectionId" value={collection.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                          Excluir
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
                {editingId === collection.id && (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-surface">
                      <CollectionForm collection={collection} onDone={() => setEditingId(null)} />
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
          Nova coleção
        </Button>
      )}
    </div>
  );
}
