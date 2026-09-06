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
