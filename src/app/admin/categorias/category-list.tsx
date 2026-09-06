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
import { deleteCategoryAction } from "@/lib/actions/admin-catalog";
import { CategoryForm } from "./category-form";
import type { Category } from "@/generated/prisma/client";

type CategoryWithCount = Category & { _count: { products: number } };

export function CategoryList({ categories }: { categories: CategoryWithCount[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {creating && (
        <div className="rounded-lg border border-border p-5">
          <h3 className="font-display text-lg text-foreground">Nova categoria</h3>
          <div className="mt-4">
            <CategoryForm onDone={() => setCreating(false)} />
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
            {categories.map((category) => (
              <Fragment key={category.id}>
                <TableRow>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell className="tabular-nums">{category._count.products}</TableCell>
                  <TableCell>
                    <Badge variant={category.status === "ACTIVE" ? "default" : "secondary"}>
                      {category.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(editingId === category.id ? null : category.id)}
                      >
                        {editingId === category.id ? "Fechar" : "Editar"}
                      </Button>
                      <form action={deleteCategoryAction}>
                        <input type="hidden" name="categoryId" value={category.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                          Excluir
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
                {editingId === category.id && (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-surface">
                      <CategoryForm category={category} onDone={() => setEditingId(null)} />
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
          Nova categoria
        </Button>
      )}
    </div>
  );
}
