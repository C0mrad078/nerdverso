import { HeroBanner } from "@/components/storefront/hero-banner";
import { NicheStrip } from "@/components/storefront/niche-strip";
import { ProductRail } from "@/components/storefront/product-rail";
import { TrustStrip } from "@/components/storefront/trust-strip";
import { NewsletterSection } from "@/components/storefront/newsletter-section";
import {
  getActiveBanners,
  getFeaturedProducts,
  getNewProducts,
  getNiches,
  getPromoProducts,
} from "@/lib/data/storefront";

export default async function HomePage() {
  const [heroBanners, middleBanners, niches, featured, newProducts, promoProducts] =
    await Promise.all([
      getActiveBanners("home_hero"),
      getActiveBanners("home_middle"),
      getNiches(),
      getFeaturedProducts(),
      getNewProducts(),
      getPromoProducts(),
    ]);

  return (
    <>
      {heroBanners[0] && <HeroBanner banner={heroBanners[0]} />}

      <NicheStrip niches={niches} />

      <ProductRail
        title="Em destaque"
        subtitle="Seleção da casa para você começar por aqui"
        products={featured}
        viewAllHref="/produtos"
      />

      {middleBanners[0] && <HeroBanner banner={middleBanners[0]} size="compact" priority={false} />}

      <ProductRail
        title="Em promoção"
        subtitle="Aproveite enquanto durar o estoque"
        products={promoProducts}
        viewAllHref="/produtos?promo=1"
      />

      <ProductRail
        title="Novidades"
        subtitle="Acabou de chegar na loja"
        products={newProducts}
        viewAllHref="/produtos"
      />

      <TrustStrip />
      <NewsletterSection />
    </>
  );
}
