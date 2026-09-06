"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
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
import { deleteBannerAction, toggleBannerActiveAction } from "@/lib/actions/admin-catalog";
import { BannerForm } from "./banner-form";
import type { Banner } from "@/generated/prisma/client";

export function BannerList({ banners }: { banners: Banner[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {creating && (
        <div className="rounded-lg border border-border p-5">
          <h3 className="font-display text-lg text-foreground">Novo banner</h3>
          <div className="mt-4">
            <BannerForm onDone={() => setCreating(false)} />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Título interno</TableHead>
              <TableHead>Posição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((banner) => (
              <Fragment key={banner.id}>
                <TableRow>
                  <TableCell>
                    <div className="relative h-10 w-20 overflow-hidden rounded bg-surface">
                      <Image
                        src={banner.imageDesktop}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{banner.internalTitle}</TableCell>
                  <TableCell className="text-muted-foreground">{banner.position}</TableCell>
                  <TableCell>
                    <form action={toggleBannerActiveAction}>
                      <input type="hidden" name="bannerId" value={banner.id} />
                      <input type="hidden" name="active" value={String(!banner.active)} />
                      <button type="submit">
                        <Badge variant={banner.active ? "default" : "secondary"}>
                          {banner.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </button>
                    </form>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(editingId === banner.id ? null : banner.id)}
                      >
                        {editingId === banner.id ? "Fechar" : "Editar"}
                      </Button>
                      <form action={deleteBannerAction}>
                        <input type="hidden" name="bannerId" value={banner.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                          Excluir
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
                {editingId === banner.id && (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-surface">
                      <BannerForm banner={banner} onDone={() => setEditingId(null)} />
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
          Novo banner
        </Button>
      )}
    </div>
  );
}
