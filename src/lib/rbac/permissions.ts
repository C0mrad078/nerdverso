/**
 * Single source of truth for RBAC permission keys.
 * Every key is "<module>.<action>". Roles are free-form (created in /admin/cargos);
 * this list is what the admin UI offers as checkboxes when building a role.
 */
export const PERMISSION_MODULES = {
  dashboard: ["view"],
  products: ["view", "create", "update", "delete"],
  categories: ["view", "create", "update", "delete"],
  collections: ["view", "create", "update", "delete"],
  inventory: ["view", "update"],
  banners: ["view", "create", "update", "delete"],
  promotions: ["view", "create", "update", "delete"],
  coupons: ["view", "create", "update", "delete"],
  orders: ["view", "update"],
  customers: ["view"],
  partners: ["view", "create", "update", "delete"],
  employees: ["view", "create", "update", "delete"],
  roles: ["view", "create", "update", "delete"],
  reports: ["view"],
  settings: ["view", "update"],
} as const;

export type PermissionModule = keyof typeof PERMISSION_MODULES;

export type PermissionKey = {
  [M in PermissionModule]: `${M}.${(typeof PERMISSION_MODULES)[M][number]}`;
}[PermissionModule];

export const ALL_PERMISSION_KEYS: PermissionKey[] = Object.entries(
  PERMISSION_MODULES,
).flatMap(([module, actions]) =>
  actions.map((action) => `${module}.${action}` as PermissionKey),
);

export const PERMISSION_LABELS: Record<PermissionModule, string> = {
  dashboard: "Dashboard",
  products: "Produtos",
  categories: "Categorias",
  collections: "Coleções",
  inventory: "Estoque",
  banners: "Banners",
  promotions: "Promoções",
  coupons: "Cupons",
  orders: "Pedidos",
  customers: "Clientes",
  partners: "Parceiros",
  employees: "Funcionários",
  roles: "Cargos e permissões",
  reports: "Relatórios",
  settings: "Configurações",
};

/** System roles seeded on install. Owner is protected and cannot be edited or removed. */
export const OWNER_ROLE_NAME = "Owner";

export const DEFAULT_ROLE_PRESETS: Array<{
  name: string;
  description: string;
  permissions: PermissionKey[];
}> = [
  {
    name: "Gerente",
    description: "Acesso amplo à operação da loja, sem gestão de cargos.",
    permissions: ALL_PERMISSION_KEYS.filter(
      (key) => !key.startsWith("roles."),
    ),
  },
  {
    name: "Estoque",
    description: "Controle de produtos, variantes e inventário.",
    permissions: [
      "dashboard.view",
      "products.view",
      "products.update",
      "inventory.view",
      "inventory.update",
      "categories.view",
      "collections.view",
    ],
  },
  {
    name: "Marketing",
    description: "Banners, promoções, cupons e coleções.",
    permissions: [
      "dashboard.view",
      "banners.view",
      "banners.create",
      "banners.update",
      "banners.delete",
      "promotions.view",
      "promotions.create",
      "promotions.update",
      "promotions.delete",
      "coupons.view",
      "coupons.create",
      "coupons.update",
      "coupons.delete",
      "collections.view",
      "collections.create",
      "collections.update",
      "partners.view",
      "reports.view",
    ],
  },
  {
    name: "Atendimento",
    description: "Pedidos e clientes, sem edição de catálogo.",
    permissions: [
      "dashboard.view",
      "orders.view",
      "orders.update",
      "customers.view",
      "products.view",
      "inventory.view",
    ],
  },
  {
    name: "Financeiro",
    description: "Relatórios, pedidos e comissões de parceiros.",
    permissions: [
      "dashboard.view",
      "orders.view",
      "reports.view",
      "partners.view",
      "coupons.view",
      "promotions.view",
    ],
  },
];
