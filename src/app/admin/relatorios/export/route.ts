import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/authorize";
import { resolveDateRange } from "@/lib/data/admin-dashboard";
import { getOrdersForExport } from "@/lib/data/admin-reports";
import { ORDER_STATUS_LABELS } from "@/lib/orders";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(request: Request) {
  await requirePermission("reports.view");

  const url = new URL(request.url);
  const period = url.searchParams.get("period") ?? undefined;
  const range = resolveDateRange(period);
  const orders = await getOrdersForExport(range);

  const header = [
    "Número",
    "Status",
    "Cliente",
    "E-mail",
    "Subtotal",
    "Desconto",
    "Frete",
    "Total",
    "Data",
  ];
  const rows = orders.map((o) =>
    [
      o.number,
      ORDER_STATUS_LABELS[o.status] ?? o.status,
      o.customerName,
      o.customerEmail,
      o.subtotal.toFixed(2),
      o.discountTotal.toFixed(2),
      o.shippingTotal.toFixed(2),
      o.total.toFixed(2),
      o.createdAt.toISOString(),
    ]
      .map((field) => csvEscape(String(field)))
      .join(","),
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedidos-${period ?? "today"}.csv"`,
    },
  });
}
