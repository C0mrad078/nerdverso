import { prisma } from "@/lib/db/client";
import { OrderStatus } from "@/generated/prisma/client";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

const EXCLUDED_FROM_SPEND: OrderStatus[] = [OrderStatus.CANCELED, OrderStatus.REFUNDED];

export async function getCustomersAdmin(query?: string) {
  const customers = await prisma.customer.findMany({
    where: query
      ? {
          user: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          orders: { select: { total: true, status: true, createdAt: true } },
        },
      },
    },
  });

  return customers.map((c) => {
    const validOrders = c.user.orders.filter((o) => !EXCLUDED_FROM_SPEND.includes(o.status));
    const lastOrderAt = c.user.orders.reduce<Date | null>(
      (latest, o) => (!latest || o.createdAt > latest ? o.createdAt : latest),
      null,
    );
    return {
      id: c.id,
      userId: c.user.id,
      name: c.user.name,
      email: c.user.email,
      phone: c.user.phone,
      status: c.user.status,
      createdAt: c.user.createdAt,
      orderCount: c.user.orders.length,
      totalSpent: validOrders.reduce((sum, o) => sum + toNumber(o.total), 0),
      lastOrderAt,
    };
  });
}

export async function getCustomerDetail(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      user: {
        include: {
          addresses: { orderBy: { isDefault: "desc" } },
          orders: { orderBy: { createdAt: "desc" } },
        },
      },
    },
  });
  if (!customer) return null;

  const validOrders = customer.user.orders.filter((o) => !EXCLUDED_FROM_SPEND.includes(o.status));

  return {
    id: customer.id,
    userId: customer.user.id,
    name: customer.user.name,
    email: customer.user.email,
    phone: customer.user.phone,
    status: customer.user.status,
    cpf: customer.cpf,
    birthDate: customer.birthDate,
    acceptsMarketing: customer.acceptsMarketing,
    createdAt: customer.user.createdAt,
    totalSpent: validOrders.reduce((sum, o) => sum + toNumber(o.total), 0),
    addresses: customer.user.addresses,
    orders: customer.user.orders.map((o) => ({
      id: o.id,
      number: o.number,
      status: o.status,
      total: toNumber(o.total),
      createdAt: o.createdAt,
    })),
  };
}
