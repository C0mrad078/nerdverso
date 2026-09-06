"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PermissionKey } from "@/lib/rbac/permissions";

const NAV_GROUPS: {
  label: string;
  items: { href: string; label: string; permission: PermissionKey }[];
}[] = [
  {
    label: "Visão geral",
    items: [
      { href: "/admin", label: "Dashboard", permission: "dashboard.view" },
      { href: "/admin/relatorios", label: "Relatórios", permission: "reports.view" },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/produtos", label: "Produtos", permission: "products.view" },
      { href: "/admin/estoque", label: "Estoque", permission: "inventory.view" },
      { href: "/admin/categorias", label: "Categorias", permission: "categories.view" },
      { href: "/admin/colecoes", label: "Coleções", permission: "collections.view" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/banners", label: "Banners", permission: "banners.view" },
      { href: "/admin/promocoes", label: "Promoções", permission: "promotions.view" },
      { href: "/admin/cupons", label: "Cupons", permission: "coupons.view" },
      { href: "/admin/parceiros", label: "Parceiros", permission: "partners.view" },
    ],
  },
  {
    label: "Vendas",
    items: [
      { href: "/admin/pedidos", label: "Pedidos", permission: "orders.view" },
      { href: "/admin/clientes", label: "Clientes", permission: "customers.view" },
    ],
  },
  {
    label: "Loja",
    items: [
      { href: "/admin/funcionarios", label: "Funcionários", permission: "employees.view" },
      { href: "/admin/cargos", label: "Cargos", permission: "roles.view" },
      { href: "/admin/configuracoes", label: "Configurações", permission: "settings.view" },
    ],
  },
];

export function AdminNav({
  isOwner,
  permissions,
}: {
  isOwner: boolean;
  permissions: string[];
}) {
  const pathname = usePathname();
  const can = (permission: string) => isOwner || permissions.includes(permission);

  return (
    <nav className="flex flex-col gap-6">
      {NAV_GROUPS.map((group) => {
        const visibleItems = group.items.filter((item) => can(item.permission));
        if (visibleItems.length === 0) return null;
        return (
          <div key={group.label}>
            <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {group.label}
            </p>
            <div className="mt-1 flex flex-col gap-0.5">
              {visibleItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-md px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-foreground hover:bg-accent"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
