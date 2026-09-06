import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductGallery } from "@/components/storefront/product/product-gallery";
import { VariantSelector } from "@/components/storefront/product/variant-selector";
import { SizeGuideTable } from "@/components/storefront/product/size-guide";
import { ProductRail } from "@/components/storefront/product-rail";
import { formatDiscountPercent, formatMoney } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/storefront";
import { jsonLdScript } from "@/lib/json-ld";

export async function generateMetadata(
  props: PageProps<"/produto/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage(props: PageProps<"/produto/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.collectionSlugs, product.id);
  const discount = product.compareAtPrice
    ? formatDiscountPercent(product.price, product.compareAtPrice)
    : 0;
  const installments = Math.max(1, Math.min(3, Math.floor(product.price / 30)));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: product.price,
      availability: product.variants.some((v) => v.available > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />

      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Início
        </Link>
        <span>/</span>
        <Link href="/produtos" className="hover:text-foreground">
          Produtos
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-display text-3xl text-foreground sm:text-4xl">
              {product.name}
            </h1>
            {product.shortDescription && (
              <p className="mt-2 text-muted-foreground">{product.shortDescription}</p>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl text-foreground">
              {formatMoney(product.price)}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-muted-foreground line-through">
                  {formatMoney(product.compareAtPrice)}
                </span>
                <span className="text-sm font-medium text-primary">-{discount}%</span>
              </>
            )}
          </div>
          {installments > 1 && (
            <p className="-mt-4 text-sm text-muted-foreground">
              ou {installments}x de {formatMoney(product.price / installments)} sem juros
            </p>
          )}

          <VariantSelector
            attributes={product.attributes}
            variants={product.variants}
            fallbackPrice={product.price}
          />

          <Accordion type="multiple" defaultValue={["descricao"]} className="mt-4">
            {product.description && (
              <AccordionItem value="descricao">
                <AccordionTrigger className="font-display text-base">
                  Descrição
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {product.description}
                </AccordionContent>
              </AccordionItem>
            )}
            {(product.materials || product.careInstructions) && (
              <AccordionItem value="detalhes">
                <AccordionTrigger className="font-display text-base">
                  Materiais e cuidados
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-1 text-muted-foreground">
                  {product.materials && <p>Material: {product.materials}</p>}
                  {product.careInstructions && <p>{product.careInstructions}</p>}
                </AccordionContent>
              </AccordionItem>
            )}
            {product.sizeGuide && (
              <AccordionItem value="medidas">
                <AccordionTrigger className="font-display text-base">
                  Guia de tamanhos
                </AccordionTrigger>
                <AccordionContent>
                  <SizeGuideTable rows={product.sizeGuide.rows} />
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="trocas">
              <AccordionTrigger className="font-display text-base">
                Envio e trocas
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Envio para todo o Brasil. Trocas em até 30 dias após o recebimento, com a
                peça sem uso e na embalagem original.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <ProductRail title="Você também pode gostar" products={related} />
    </div>
  );
}
