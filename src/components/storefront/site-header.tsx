import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { getCategories, getNiches } from "@/lib/data/storefront";
import { getCartItemCount } from "@/lib/data/cart";

export async function SiteHeader() {
  const [categories, niches, cartCount] = await Promise.all([
    getCategories(),
    getNiches(),
    getCartItemCount(),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <MobileNav categories={categories} niches={niches} />

        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Nerdverso">
          <Image
            src="/brand/logo/logo-white.png"
            alt="Nerdverso"
            width={36}
            height={36}
            className="hidden dark:block"
            priority
          />
          <Image
            src="/brand/logo/logo-black.png"
            alt="Nerdverso"
            width={36}
            height={36}
            className="dark:hidden"
            priority
          />
          <span className="font-display hidden text-lg tracking-tight text-foreground sm:block">
            nerdverso
          </span>
        </Link>

        <NavigationMenu className="hidden lg:flex" viewport={false}>
          <NavigationMenuList>
            {categories.map((category) => (
              <NavigationMenuItem key={category.id}>
                <NavigationMenuLink asChild>
                  <Link
                    href={`/categoria/${category.slug}`}
                    className="px-3 py-2 text-sm font-medium text-foreground/90 hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-sm font-medium">
                Coleções
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[520px] grid-cols-2 gap-1 p-3">
                  {niches.map((niche) => (
                    <li key={niche.id}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/colecao/${niche.slug}`}
                          className="block rounded-md px-3 py-2 text-sm text-foreground/90 hover:bg-accent hover:text-accent-foreground"
                        >
                          {niche.name}
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/produtos?promo=1"
                  className="px-3 py-2 text-sm font-medium text-primary hover:text-primary/80"
                >
                  Promoções
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" aria-label="Buscar" asChild>
            <Link href="/buscar">
              <Search className="size-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Minha conta" asChild>
            <Link href="/conta">
              <User className="size-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Carrinho" asChild className="relative">
            <Link href="/carrinho">
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function MobileNav({
  categories,
  niches,
}: {
  categories: { id: string; name: string; slug: string }[];
  niches: { id: string; name: string; slug: string }[];
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px]">
        <SheetHeader>
          <SheetTitle className="font-display text-left">nerdverso</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {categories.map((category) => (
            <SheetClose asChild key={category.id}>
              <Link
                href={`/categoria/${category.slug}`}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
              >
                {category.name}
              </Link>
            </SheetClose>
          ))}
          <p className="mt-4 px-2 text-xs uppercase tracking-wide text-muted-foreground">
            Coleções
          </p>
          {niches.map((niche) => (
            <SheetClose asChild key={niche.id}>
              <Link
                href={`/colecao/${niche.slug}`}
                className="rounded-md px-2 py-2.5 text-sm text-foreground hover:bg-accent"
              >
                {niche.name}
              </Link>
            </SheetClose>
          ))}
          <SheetClose asChild>
            <Link
              href="/produtos?promo=1"
              className="mt-4 rounded-md px-2 py-2.5 text-sm font-medium text-primary hover:bg-accent"
            >
              Promoções
            </Link>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
