import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { BannerData } from "@/lib/data/storefront";

export function HeroBanner({
  banner,
  size = "large",
  priority = true,
}: {
  banner: BannerData;
  size?: "large" | "compact";
  priority?: boolean;
}) {
  const aspect =
    size === "large"
      ? "aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]"
      : "aspect-[4/5] sm:aspect-[21/9]";
  const titleClass =
    size === "large"
      ? "font-display uppercase tracking-tight text-balance leading-[0.95] text-white text-5xl sm:text-6xl lg:text-7xl"
      : "font-display uppercase tracking-tight text-balance leading-[0.95] text-white text-4xl sm:text-5xl";

  return (
    <section className="relative mx-auto w-full max-w-[1920px] overflow-hidden">
      <div className={`relative w-full ${aspect}`}>
        <Image
          src={banner.imageMobile ?? banner.imageDesktop}
          alt={banner.altText ?? banner.title ?? "Nerdverso"}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover sm:hidden"
        />
        <Image
          src={banner.imageDesktop}
          alt={banner.altText ?? banner.title ?? "Nerdverso"}
          fill
          priority={priority}
          sizes="100vw"
          className="hidden object-cover sm:block"
        />
        <div className="absolute inset-0 flex flex-col justify-end gap-4 p-6 sm:justify-center sm:p-12 lg:p-20">
          <div className="max-w-xl">
            {banner.title && <h1 className={titleClass}>{banner.title}</h1>}
            {banner.subtitle && (
              <p className="mt-4 max-w-md text-base text-white/85 sm:text-lg">
                {banner.subtitle}
              </p>
            )}
            {banner.ctaLabel && banner.ctaLink && (
              <Button asChild size="lg" className="mt-6 rounded-full px-8">
                <Link href={banner.ctaLink}>{banner.ctaLabel}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
