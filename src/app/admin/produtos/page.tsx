import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requirePermission } from "@/lib/auth/authorize";
import { getProductsAdmin } from "@/lib/data/admin-products";
import { ProductTable } from "./product-table";

export const metadata = { title: "Produtos" };

export default async function AdminProductsPage(props: PageProps<"/admin/produtos">) {
  await requirePermission("products.view");
  const searchParams = await props.searchParams;
  const qParam = searchParams.q;
  const q = Array.isArray(qParam) ? qParam[0] : qParam;

  const products = await getProductsAdmin(q);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-foreground">Produtos</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} produtos.</p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/admin/produtos/novo">Novo produto</Link>
        </Button>
      </div>

      <form method="GET" className="max-w-sm">
        <Input name="q" placeholder="Buscar por nome ou SKU…" defaultValue={q ?? ""} />
      </form>

      <ProductTable products={products} />
    </div>
  );
}
