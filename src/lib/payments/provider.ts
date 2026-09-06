import type { PaymentMethod } from "@/generated/prisma/client";

export type PaymentIntentResult = {
  provider: string;
  externalId: string;
  status: "PENDING" | "PAID";
  instructions?: string;
};

export interface PaymentProvider {
  createIntent(args: { method: PaymentMethod; amount: number; orderNumber: string }): Promise<PaymentIntentResult>;
}

/**
 * Sandbox provider: no real gateway is wired up (Stripe/Mercado Pago/PagSeguro
 * all need account credentials this project doesn't have). It exists so the
 * checkout flow, order creation, and stock/coupon validation are all real and
 * testable end-to-end; swap this for a real PaymentProvider implementation
 * (same interface) once a gateway account is available — nothing else in the
 * checkout/order code needs to change.
 */
class ManualPaymentProvider implements PaymentProvider {
  async createIntent({
    method,
  }: {
    method: PaymentMethod;
    amount: number;
    orderNumber: string;
  }): Promise<PaymentIntentResult> {
    const externalId = `sandbox_${Date.now().toString(36)}`;
    if (method === "PIX") {
      return {
        provider: "sandbox",
        externalId,
        status: "PENDING",
        instructions: "Pagamento via Pix simulado (ambiente de desenvolvimento).",
      };
    }
    if (method === "BOLETO") {
      return {
        provider: "sandbox",
        externalId,
        status: "PENDING",
        instructions: "Boleto simulado (ambiente de desenvolvimento).",
      };
    }
    return {
      provider: "sandbox",
      externalId,
      status: "PENDING",
      instructions: "Pagamento com cartão simulado (ambiente de desenvolvimento).",
    };
  }
}

export const paymentProvider: PaymentProvider = new ManualPaymentProvider();
