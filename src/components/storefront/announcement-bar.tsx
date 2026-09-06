import { getStoreSetting } from "@/lib/data/storefront";
import { formatMoney } from "@/lib/format";

export async function AnnouncementBar() {
  const settings = await getStoreSetting();
  const threshold = settings?.freeShippingThreshold
    ? Number(settings.freeShippingThreshold)
    : null;

  return (
    <div className="bg-primary py-2 text-center text-xs font-medium text-primary-foreground sm:text-sm">
      {threshold
        ? `Frete grátis para todo o Brasil acima de ${formatMoney(threshold)} • 10% off na primeira compra com o cupom BEMVINDO10`
        : "10% off na primeira compra com o cupom BEMVINDO10"}
    </div>
  );
}
