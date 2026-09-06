"use client";

import Image from "next/image";
import Link from "next/link";
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
import { formatMoney } from "@/lib/format";
import { deleteProductAction, duplicateProductAction } from "@/lib/actions/admin-products";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  status: string;
  featured: boolean;
  price: number;
  image: string | null;
  categoryNames: string[];
  totalStock: number;
  variantCount: number;
};

const STATUS_VARIANT: Record<string, "default" | "secondary"> = {
  ACTIVE: "default",
  DRAFT: "secondary",
  INACTIVE: "secondary",
  ARCHIVED: "secondary",
};

export function ProductTable({ products }: { products: ProductRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Produto</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="relative size-10 overflow-hidden rounded bg-surface">
                  {product.image && (
                    <Image src={product.image} alt="" fill sizes="40px" className="object-cover" />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                <Link href={`/admin/produtos/${product.id}`} className="hover:text-primary">
                  {product.name}
                </Link>
                {product.featured && (
                  <Badge variant="outline" className="ml-2">
                    Destaque
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{product.sku}</TableCell>
              <TableCell className="text-muted-foreground">
                {product.categoryNames.join(", ") || "—"}
              </TableCell>
              <TableCell className="tabular-nums">{formatMoney(product.price)}</TableCell>
              <TableCell className="tabular-nums">
                {product.totalStock} un. ({product.variantCount} var.)
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[product.status] ?? "secondary"}>{product.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/produtos/${product.id}`}>Editar</Link>
                  </Button>
                  <form action={duplicateProductAction}>
                    <input type="hidden" name="productId" value={product.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      Duplicar
                    </Button>
                  </form>
                  <form action={deleteProductAction}>
                    <input type="hidden" name="productId" value={product.id} />
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                      Excluir
                    </Button>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
