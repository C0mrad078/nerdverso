export const ORDER_STATUS_LABELS: Record<string, string> = {
  AWAITING_PAYMENT: "Aguardando pagamento",
  PAID: "Pago",
  IN_SEPARATION: "Em separação",
  IN_PRODUCTION: "Em produção",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export const ORDER_STATUS_FLOW = [
  "AWAITING_PAYMENT",
  "PAID",
  "IN_SEPARATION",
  "IN_PRODUCTION",
  "SHIPPED",
  "DELIVERED",
] as const;

/** Controlled status graph — the admin can only move an order forward along
 * an edge listed here (or to a terminal state), never to an arbitrary status. */
export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  AWAITING_PAYMENT: ["PAID", "CANCELED"],
  PAID: ["IN_SEPARATION", "REFUNDED", "CANCELED"],
  IN_SEPARATION: ["IN_PRODUCTION", "SHIPPED", "CANCELED"],
  IN_PRODUCTION: ["SHIPPED", "CANCELED"],
  SHIPPED: ["DELIVERED", "REFUNDED"],
  DELIVERED: ["REFUNDED"],
  CANCELED: [],
  REFUNDED: [],
};

/** Statuses that should return items to sellable stock when entered. */
export const RESTOCKING_STATUSES = new Set(["CANCELED", "REFUNDED"]);
