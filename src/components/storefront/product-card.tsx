import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDiscountPercent, formatMoney } from "@/lib/format";
import type { ProductCardData } from "@/lib/data/storefront";

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount = product.compareAtPrice
    ? formatDiscountPercent(product.price, product.compareAtPrice)
    : 0;

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group flex flex-col rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            Sem imagem
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <Badge className="bg-primary text-primary-foreground border-0">
              -{discount}%
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="secondary" className="border-0">
              Esgotado
            </Badge>
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 transition-shadow group-hover:ring-white/20" />
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {product.collection && (
          <span className="text-xs font-medium text-primary">{product.collection}</span>
        )}
        <h3 className="font-display line-clamp-2 text-base leading-snug text-foreground">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-medium tabular-nums text-foreground">
            {formatMoney(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm tabular-nums text-muted-foreground line-through">
              {formatMoney(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
