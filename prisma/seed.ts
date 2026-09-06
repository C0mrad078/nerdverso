/**
 * Development seed. Data here is illustrative only — it exists so the
 * storefront and admin have something real to render, not production content.
 * Run with `npx prisma db seed` (wired to `tsx prisma/seed.ts`).
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Status } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import {
  ALL_PERMISSION_KEYS,
  DEFAULT_ROLE_PRESETS,
  OWNER_ROLE_NAME,
} from "../src/lib/rbac/permissions";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seedPermissionsAndRoles() {
  for (const key of ALL_PERMISSION_KEYS) {
    const [module, action] = key.split(".");
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, module, action },
    });
  }

  const ownerRole = await prisma.role.upsert({
    where: { name: OWNER_ROLE_NAME },
    update: {},
    create: {
      name: OWNER_ROLE_NAME,
      description: "Acesso total à loja. Não pode ser removido ou editado.",
      isSystem: true,
    },
  });

  const allPermissions = await prisma.permission.findMany();
  await prisma.rolePermission.createMany({
    data: allPermissions.map((p) => ({ roleId: ownerRole.id, permissionId: p.id })),
    skipDuplicates: true,
  });

  for (const preset of DEFAULT_ROLE_PRESETS) {
    const role = await prisma.role.upsert({
      where: { name: preset.name },
      update: { description: preset.description },
      create: { name: preset.name, description: preset.description },
    });
    const permissions = await prisma.permission.findMany({
      where: { key: { in: preset.permissions } },
    });
    await prisma.rolePermission.createMany({
      data: permissions.map((p) => ({ roleId: role.id, permissionId: p.id })),
      skipDuplicates: true,
    });
  }

  return ownerRole;
}

async function seedOwnerUser(ownerRoleId: string) {
  const email = process.env.OWNER_EMAIL ?? "owner@nerdverso.dev";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const password = process.env.OWNER_PASSWORD ?? randomBytes(9).toString("base64url");
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name: "Owner Nerdverso",
      email,
      passwordHash,
      isOwner: true,
      roles: { create: [{ roleId: ownerRoleId }] },
      employee: { create: { position: "Owner" } },
    },
  });

  if (!process.env.OWNER_PASSWORD) {
    console.log("\n=== DEV SEED: credenciais do owner ===");
    console.log(`  email:    ${email}`);
    console.log(`  senha:    ${password}`);
    console.log("  (defina OWNER_EMAIL/OWNER_PASSWORD no .env para fixar as credenciais)\n");
  }

  return user;
}

async function seedAttributes() {
  const tamanho = await prisma.attributeDefinition.upsert({
    where: { key: "size" },
    update: {},
    create: { name: "Tamanho", key: "size" },
  });
  const cor = await prisma.attributeDefinition.upsert({
    where: { key: "color" },
    update: {},
    create: { name: "Cor", key: "color" },
  });
  const capacidade = await prisma.attributeDefinition.upsert({
    where: { key: "capacity" },
    update: {},
    create: { name: "Capacidade", key: "capacity" },
  });

  const sizeValues = ["PP", "P", "M", "G", "GG", "XG"];
  const colorValues = ["Preto", "Branco", "Cinza Mescla", "Vinho"];
  const capacityValues = ["325ml", "450ml"];

  const sizeMap = new Map<string, string>();
  for (const [i, value] of sizeValues.entries()) {
    const v = await prisma.attributeValue.upsert({
      where: { attributeId_value: { attributeId: tamanho.id, value } },
      update: {},
      create: { attributeId: tamanho.id, value, position: i },
    });
    sizeMap.set(value, v.id);
  }

  const colorMap = new Map<string, string>();
  for (const [i, value] of colorValues.entries()) {
    const v = await prisma.attributeValue.upsert({
      where: { attributeId_value: { attributeId: cor.id, value } },
      update: {},
      create: { attributeId: cor.id, value, position: i },
    });
    colorMap.set(value, v.id);
  }

  const capacityMap = new Map<string, string>();
  for (const [i, value] of capacityValues.entries()) {
    const v = await prisma.attributeValue.upsert({
      where: { attributeId_value: { attributeId: capacidade.id, value } },
      update: {},
      create: { attributeId: capacidade.id, value, position: i },
    });
    capacityMap.set(value, v.id);
  }

  return { tamanho, cor, capacidade, sizeMap, colorMap, capacityMap };
}

async function seedSizeGuide() {
  return prisma.sizeGuide.upsert({
    where: { id: "size-guide-camisetas" },
    update: {},
    create: {
      id: "size-guide-camisetas",
      name: "Camisetas unissex",
      description: "Medidas tiradas com a peça em superfície plana, em centímetros.",
      rows: [
        { tamanho: "PP", largura: 44, altura: 66, manga: 18 },
        { tamanho: "P", largura: 47, altura: 68, manga: 19 },
        { tamanho: "M", largura: 50, altura: 70, manga: 20 },
        { tamanho: "G", largura: 53, altura: 72, manga: 21 },
        { tamanho: "GG", largura: 56, altura: 74, manga: 22 },
        { tamanho: "XG", largura: 59, altura: 76, manga: 23 },
      ],
    },
  });
}

async function seedCategories() {
  const camisetas = await prisma.category.upsert({
    where: { slug: "camisetas" },
    update: {},
    create: {
      name: "Camisetas",
      slug: "camisetas",
      description: "Camisetas estampadas em algodão, unissex.",
      position: 0,
      status: Status.ACTIVE,
    },
  });
  const canecas = await prisma.category.upsert({
    where: { slug: "canecas" },
    update: {},
    create: {
      name: "Canecas",
      slug: "canecas",
      description: "Canecas de cerâmica para o dia a dia geek.",
      position: 1,
      status: Status.ACTIVE,
    },
  });
  return { camisetas, canecas };
}

const NICHES = [
  { slug: "games", name: "Games", image: "/seed/collections/games.svg" },
  { slug: "animes-manga", name: "Animes & Mangá", image: "/seed/collections/animes-manga.svg" },
  { slug: "k-pop", name: "K-pop", image: "/seed/collections/k-pop.svg" },
  { slug: "bandas-musica", name: "Bandas & Música", image: "/seed/collections/bandas-musica.svg" },
  { slug: "series-filmes", name: "Séries & Filmes", image: "/seed/collections/series-filmes.svg" },
  { slug: "programacao", name: "Programação", image: "/seed/collections/programacao.svg" },
  { slug: "retro-nostalgia", name: "Retrô & Nostalgia", image: "/seed/collections/retro-nostalgia.svg" },
] as const;

async function seedCollections() {
  const map = new Map<string, string>();
  for (const [i, niche] of NICHES.entries()) {
    const c = await prisma.collection.upsert({
      where: { slug: niche.slug },
      update: {},
      create: {
        name: niche.name,
        slug: niche.slug,
        image: niche.image,
        banner: niche.image,
        position: i,
        status: Status.ACTIVE,
      },
    });
    map.set(niche.slug, c.id);
  }
  return map;
}

type SeedVariant = { size?: string; color?: string; capacity?: string; stock: number };

type SeedProduct = {
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categorySlug: "camisetas" | "canecas";
  collectionSlugs: string[];
  image: string;
  featured?: boolean;
  variants: SeedVariant[];
  sizeGuide?: boolean;
};

const PRODUCTS: SeedProduct[] = [
  {
    name: "Camiseta Pixel Quest",
    slug: "camiseta-pixel-quest",
    sku: "NV-TEE-001",
    shortDescription: "Estampa pixelada para quem cresceu com joystick na mão.",
    description:
      "Camiseta 100% algodão penteado, estampa em silk de alta durabilidade. Modelagem unissex.",
    price: 89.9,
    compareAtPrice: 109.9,
    categorySlug: "camisetas",
    collectionSlugs: ["games", "retro-nostalgia"],
    image: "/seed/products/tee-01.svg",
    featured: true,
    sizeGuide: true,
    variants: [
      { size: "P", color: "Preto", stock: 12 },
      { size: "M", color: "Preto", stock: 18 },
      { size: "G", color: "Preto", stock: 15 },
      { size: "P", color: "Branco", stock: 8 },
      { size: "M", color: "Branco", stock: 10 },
      { size: "G", color: "Branco", stock: 6 },
    ],
  },
  {
    name: "Camiseta Retrô Console",
    slug: "camiseta-retro-console",
    sku: "NV-TEE-002",
    shortDescription: "Homenagem aos consoles clássicos dos anos 90.",
    description: "Camiseta 100% algodão, estampa localizada no peito. Modelagem unissex.",
    price: 84.9,
    categorySlug: "camisetas",
    collectionSlugs: ["games", "retro-nostalgia"],
    image: "/seed/products/tee-05.svg",
    sizeGuide: true,
    variants: [
      { size: "P", color: "Vinho", stock: 5 },
      { size: "M", color: "Vinho", stock: 9 },
      { size: "G", color: "Vinho", stock: 4 },
      { size: "GG", color: "Vinho", stock: 3 },
    ],
  },
  {
    name: "Camiseta Mangá Noir",
    slug: "camiseta-manga-noir",
    sku: "NV-TEE-003",
    shortDescription: "Traço em preto e branco inspirado nos clássicos do mangá.",
    description: "Camiseta 100% algodão penteado, estampa frente e costas.",
    price: 94.9,
    compareAtPrice: 119.9,
    categorySlug: "camisetas",
    collectionSlugs: ["animes-manga"],
    image: "/seed/products/tee-02.svg",
    featured: true,
    sizeGuide: true,
    variants: [
      { size: "P", color: "Branco", stock: 10 },
      { size: "M", color: "Branco", stock: 14 },
      { size: "G", color: "Branco", stock: 11 },
      { size: "GG", color: "Branco", stock: 5 },
    ],
  },
  {
    name: "Camiseta Sakura Punch",
    slug: "camiseta-sakura-punch",
    sku: "NV-TEE-004",
    shortDescription: "Cores vibrantes para os fãs de anime de ação.",
    description: "Camiseta 100% algodão, estampa em silk premium.",
    price: 89.9,
    categorySlug: "camisetas",
    collectionSlugs: ["animes-manga"],
    image: "/seed/products/tee-06.svg",
    sizeGuide: true,
    variants: [
      { size: "P", color: "Preto", stock: 7 },
      { size: "M", color: "Preto", stock: 13 },
      { size: "G", color: "Preto", stock: 9 },
    ],
  },
  {
    name: "Camiseta K-Pop Beat",
    slug: "camiseta-kpop-beat",
    sku: "NV-TEE-005",
    shortDescription: "Para curtir o show com estilo, do ensaio ao palco.",
    description: "Camiseta 100% algodão, corte streetwear, estampa resistente à lavagem.",
    price: 99.9,
    compareAtPrice: 129.9,
    categorySlug: "camisetas",
    collectionSlugs: ["k-pop"],
    image: "/seed/products/tee-03.svg",
    featured: true,
    sizeGuide: true,
    variants: [
      { size: "P", color: "Preto", stock: 6 },
      { size: "M", color: "Preto", stock: 11 },
      { size: "G", color: "Preto", stock: 8 },
      { size: "GG", color: "Preto", stock: 4 },
    ],
  },
  {
    name: "Camiseta Idol Wave",
    slug: "camiseta-idol-wave",
    sku: "NV-TEE-006",
    shortDescription: "Edição inspirada nos comebacks favoritos.",
    description: "Camiseta 100% algodão, modelagem oversized.",
    price: 99.9,
    categorySlug: "camisetas",
    collectionSlugs: ["k-pop", "bandas-musica"],
    image: "/seed/products/tee-07.svg",
    sizeGuide: true,
    variants: [
      { size: "M", color: "Cinza Mescla", stock: 9 },
      { size: "G", color: "Cinza Mescla", stock: 7 },
      { size: "GG", color: "Cinza Mescla", stock: 3 },
    ],
  },
  {
    name: "Camiseta Riff Legend",
    slug: "camiseta-riff-legend",
    sku: "NV-TEE-007",
    shortDescription: "Para quem vive no repeat com o volume no talo.",
    description: "Camiseta 100% algodão, gola careca reforçada.",
    price: 89.9,
    categorySlug: "camisetas",
    collectionSlugs: ["bandas-musica", "retro-nostalgia"],
    image: "/seed/products/tee-04.svg",
    sizeGuide: true,
    variants: [
      { size: "P", color: "Vinho", stock: 6 },
      { size: "M", color: "Vinho", stock: 10 },
      { size: "G", color: "Vinho", stock: 8 },
    ],
  },
  {
    name: "Camiseta Terminal Verde",
    slug: "camiseta-terminal-verde",
    sku: "NV-TEE-008",
    shortDescription: "Para quem debuga a vida em produção.",
    description: "Camiseta 100% algodão, estampa inspirada em terminal de código.",
    price: 84.9,
    categorySlug: "camisetas",
    collectionSlugs: ["programacao"],
    image: "/seed/products/tee-08.svg",
    sizeGuide: true,
    variants: [
      { size: "P", color: "Preto", stock: 14 },
      { size: "M", color: "Preto", stock: 20 },
      { size: "G", color: "Preto", stock: 16 },
      { size: "GG", color: "Preto", stock: 7 },
    ],
  },
  {
    name: "Caneca Nerdverso Since 2022",
    slug: "caneca-nerdverso-since-2022",
    sku: "NV-MUG-001",
    shortDescription: "A caneca clássica da casa, com o símbolo Nerdverso.",
    description: "Caneca de cerâmica, acabamento brilhante, própria para micro-ondas.",
    price: 54.9,
    categorySlug: "canecas",
    collectionSlugs: ["retro-nostalgia"],
    image: "/seed/products/mug-01.svg",
    featured: true,
    variants: [
      { capacity: "325ml", stock: 20 },
      { capacity: "450ml", stock: 14 },
    ],
  },
  {
    name: "Caneca Pixel Art",
    slug: "caneca-pixel-art",
    sku: "NV-MUG-002",
    shortDescription: "Arte pixelada para o café (ou o chá) de todo dia.",
    description: "Caneca de cerâmica, acabamento brilhante, própria para micro-ondas.",
    price: 54.9,
    categorySlug: "canecas",
    collectionSlugs: ["games"],
    image: "/seed/products/mug-02.svg",
    variants: [
      { capacity: "325ml", stock: 17 },
      { capacity: "450ml", stock: 9 },
    ],
  },
  {
    name: "Caneca K-drama Nights",
    slug: "caneca-kdrama-nights",
    sku: "NV-MUG-003",
    shortDescription: "Para as maratonas de série que vão até tarde.",
    description: "Caneca de cerâmica, acabamento brilhante, própria para micro-ondas.",
    price: 59.9,
    categorySlug: "canecas",
    collectionSlugs: ["series-filmes", "k-pop"],
    image: "/seed/products/mug-03.svg",
    variants: [
      { capacity: "325ml", stock: 11 },
      { capacity: "450ml", stock: 6 },
    ],
  },
  {
    name: "Caneca Byte Size",
    slug: "caneca-byte-size",
    sku: "NV-MUG-004",
    shortDescription: "Uma dose de cafeína a cada byte.",
    description: "Caneca de cerâmica, acabamento brilhante, própria para micro-ondas.",
    price: 54.9,
    categorySlug: "canecas",
    collectionSlugs: ["programacao"],
    image: "/seed/products/mug-04.svg",
    variants: [
      { capacity: "325ml", stock: 22 },
      { capacity: "450ml", stock: 13 },
    ],
  },
];

async function seedProducts(
  categories: { camisetas: { id: string }; canecas: { id: string } },
  collections: Map<string, string>,
  attrs: Awaited<ReturnType<typeof seedAttributes>>,
  sizeGuideId: string,
) {
  for (const p of PRODUCTS) {
    const category = categories[p.categorySlug];

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        status: Status.ACTIVE,
        featured: p.featured ?? false,
        materials: p.categorySlug === "camisetas" ? "100% algodão penteado" : "Cerâmica",
        careInstructions:
          p.categorySlug === "camisetas"
            ? "Lavar à mão ou máquina em ciclo delicado, não usar alvejante."
            : "Lavar à mão para preservar a estampa.",
        sizeGuideId: p.sizeGuide ? sizeGuideId : null,
        seoTitle: p.name,
        seoDescription: p.shortDescription,
        categories: { create: [{ categoryId: category.id }] },
        collections: {
          create: p.collectionSlugs.map((slug) => ({
            collectionId: collections.get(slug)!,
          })),
        },
        images: {
          create: [{ url: p.image, alt: p.name, position: 0, isPrimary: true }],
        },
      },
    });

    const attributeIds = new Set<string>();
    if (p.variants.some((v) => v.size)) attributeIds.add(attrs.tamanho.id);
    if (p.variants.some((v) => v.color)) attributeIds.add(attrs.cor.id);
    if (p.variants.some((v) => v.capacity)) attributeIds.add(attrs.capacidade.id);
    await prisma.productAttribute.createMany({
      data: [...attributeIds].map((attributeId) => ({ productId: product.id, attributeId })),
      skipDuplicates: true,
    });

    for (const [i, v] of p.variants.entries()) {
      const parts = [v.size, v.color, v.capacity].filter(Boolean);
      const variantSku = `${p.sku}-${i + 1}`;
      const variant = await prisma.productVariant.upsert({
        where: { sku: variantSku },
        update: {},
        create: {
          productId: product.id,
          sku: variantSku,
          position: i,
          status: Status.ACTIVE,
        },
      });

      const valueIds: string[] = [];
      if (v.size) valueIds.push(attrs.sizeMap.get(v.size)!);
      if (v.color) valueIds.push(attrs.colorMap.get(v.color)!);
      if (v.capacity) valueIds.push(attrs.capacityMap.get(v.capacity)!);

      await prisma.productVariantValue.createMany({
        data: valueIds.map((attributeValueId) => ({
          variantId: variant.id,
          attributeValueId,
        })),
        skipDuplicates: true,
      });

      await prisma.inventory.upsert({
        where: { variantId: variant.id },
        update: { quantity: v.stock },
        create: { variantId: variant.id, quantity: v.stock, minStock: 3 },
      });

      void parts;
    }
  }
}

async function seedBanners() {
  await prisma.banner.upsert({
    where: { id: "banner-home-hero" },
    update: {},
    create: {
      id: "banner-home-hero",
      internalTitle: "[DEV SEED] Home hero — nova coleção",
      title: "Nova coleção",
      subtitle: "Peças exclusivas de cultura geek. Edição limitada.",
      ctaLabel: "Ver coleção",
      ctaLink: "/colecao/games",
      imageDesktop: "/seed/banners/hero-desktop.svg",
      imageMobile: "/seed/banners/hero-mobile.svg",
      altText: "Banner de lançamento da nova coleção Nerdverso",
      position: "home_hero",
      order: 0,
      active: true,
    },
  });

  await prisma.banner.upsert({
    where: { id: "banner-home-middle" },
    update: {},
    create: {
      id: "banner-home-middle",
      internalTitle: "[DEV SEED] Home middle — promoção",
      title: "Até 30% off",
      subtitle: "Seleção de camisetas em promoção por tempo limitado.",
      ctaLabel: "Aproveitar",
      ctaLink: "/produtos?promo=1",
      imageDesktop: "/seed/banners/promo-desktop.svg",
      imageMobile: "/seed/banners/promo-mobile.svg",
      altText: "Banner de promoção com até 30% de desconto",
      position: "home_middle",
      order: 0,
      active: true,
    },
  });
}

async function seedCommerceExtras() {
  await prisma.coupon.upsert({
    where: { code: "BEMVINDO10" },
    update: {},
    create: {
      code: "BEMVINDO10",
      description: "10% de desconto na primeira compra",
      discountType: "PERCENTAGE",
      discountValue: 10,
      firstPurchaseOnly: true,
      usageLimitPerCustomer: 1,
      active: true,
    },
  });

  await prisma.shippingRate.upsert({
    where: { id: "shipping-standard-br" },
    update: {},
    create: {
      id: "shipping-standard-br",
      provider: "manual",
      name: "Envio padrão (todo o Brasil)",
      price: 19.9,
      estimatedDaysMin: 5,
      estimatedDaysMax: 10,
      active: true,
    },
  });

  await prisma.shippingRate.upsert({
    where: { id: "shipping-express-br" },
    update: {},
    create: {
      id: "shipping-express-br",
      provider: "manual",
      name: "Envio expresso",
      price: 34.9,
      estimatedDaysMin: 2,
      estimatedDaysMax: 4,
      active: true,
    },
  });

  await prisma.storeSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      storeName: "Nerdverso",
      email: "contato@nerdverso.dev",
      whatsapp: "",
      instagram: "https://instagram.com/",
      tiktok: "https://tiktok.com/",
      seoTitle: "Nerdverso — Cultura geek em camisetas e canecas",
      seoDescription:
        "Camisetas, canecas e produtos geek: games, animes, K-pop, bandas e cultura pop.",
    },
  });
}

async function main() {
  console.log("Seeding Nerdverso (dev data)...");
  const ownerRole = await seedPermissionsAndRoles();
  await seedOwnerUser(ownerRole.id);
  const attrs = await seedAttributes();
  const sizeGuide = await seedSizeGuide();
  const categories = await seedCategories();
  const collections = await seedCollections();
  await seedProducts(categories, collections, attrs, sizeGuide.id);
  await seedBanners();
  await seedCommerceExtras();
  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
