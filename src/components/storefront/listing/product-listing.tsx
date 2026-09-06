import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { getAvailableFilterValues, getProductListing } from "@/lib/data/product-listing";
import type { ProductListingParams } from "@/lib/data/product-listing";
import { ListingFilters } from "./listing-filters";

export async function ProductListingPage({
  title,
  description,
  breadcrumbLabel,
  params,
  basePath,
}: {
  title: string;
  description?: string;
  breadcrumbLabel: string;
  params: ProductListingParams;
  basePath: string;
}) {
  const [{ items, total, page, pageCount }, filterValues] = await Promise.all([
    getProductListing(params),
    getAvailableFilterValues(),
  ]);

  const filtersEl = (
    <ListingFilters
      sizes={filterValues.sizes}
      colors={filterValues.colors}
      selectedSizes={params.sizes ?? []}
      selectedColors={params.colors ?? []}
      sort={params.sort ?? "relevancia"}
      promoOnly={params.promoOnly ?? false}
      searchQuery={params.search}
    />
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Início
        </Link>
        <span>/</span>
        <span className="text-foreground">{breadcrumbLabel}</span>
      </nav>

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">{title}</h1>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}
          <p className="mt-1 text-sm text-muted-foreground">{total} produtos</p>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="shrink-0 lg:hidden">
              <SlidersHorizontal className="mr-2 size-4" aria-hidden="true" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 overflow-y-auto overscroll-contain">
            <SheetHeader>
              <SheetTitle className="text-left">Filtros</SheetTitle>
            </SheetHeader>
            <div className="px-4">{filtersEl}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">{filtersEl}</aside>

        <div>
          {items.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">
              Nenhum produto encontrado com esses filtros.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`${basePath}?${buildQuery(params, p)}`}
                  className={`flex size-9 items-center justify-center rounded-full text-sm ${
                    p === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildQuery(params: ProductListingParams, page: number): string {
  const search = new URLSearchParams();
  if (params.sort) search.set("sort", params.sort);
  if (params.promoOnly) search.set("promo", "1");
  if (params.search) search.set("q", params.search);
  for (const size of params.sizes ?? []) search.append("tamanho", size);
  for (const color of params.colors ?? []) search.append("cor", color);
  search.set("page", String(page));
  return search.toString();
}
