const STANDARD_SHIPPING_RATE = 19.9;

export function estimateShipping(subtotal: number, freeShippingThreshold: number | null): number {
  if (freeShippingThreshold !== null && subtotal >= freeShippingThreshold) return 0;
  return STANDARD_SHIPPING_RATE;
}
