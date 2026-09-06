import Image from "next/image";
import Link from "next/link";
import { InstagramIcon, TikTokIcon } from "@/components/icons/social";
import { getStoreSetting } from "@/lib/data/storefront";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Comprar",
    links: [
      { label: "Todos os produtos", href: "/produtos" },
      { label: "Categorias", href: "/produtos" },
      { label: "Coleções", href: "/produtos" },
      { label: "Promoções", href: "/produtos?promo=1" },
    ],
  },
  {
    title: "Atendimento",
    links: [
      { label: "Fale conosco", href: "/atendimento" },
      { label: "Trocas e devoluções", href: "/atendimento/trocas" },
      { label: "Prazos de envio", href: "/atendimento/envios" },
      { label: "Perguntas frequentes", href: "/atendimento/faq" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { label: "Sobre a Nerdverso", href: "/sobre" },
      { label: "Política de privacidade", href: "/privacidade" },
      { label: "Termos de uso", href: "/termos" },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Minha conta", href: "/conta" },
      { label: "Meus pedidos", href: "/conta/pedidos" },
      { label: "Carrinho", href: "/carrinho" },
    ],
  },
];

export async function SiteFooter() {
  const settings = await getStoreSetting();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_repeat(4,1fr)] lg:px-8">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center" aria-label="Nerdverso">
            <Image
              src="/brand/logo/wordmark-orange.png"
              alt="Nerdverso"
              width={160}
              height={36}
              className="h-8 w-auto"
            />
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            Loja independente de camisetas, canecas e produtos geek. Games, animes, K-pop,
            bandas e cultura pop em coleções exclusivas.
          </p>
          <div className="flex gap-3">
            {settings?.instagram && (
              <Link
                href={settings.instagram}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Instagram"
              >
                <InstagramIcon className="size-5" />
              </Link>
            )}
            {settings?.tiktok && (
              <Link
                href={settings.tiktok}
                className="text-muted-foreground hover:text-foreground"
                aria-label="TikTok"
              >
                <TikTokIcon className="size-5" />
              </Link>
            )}
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-foreground">{column.title}</h3>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col-reverse items-center justify-between gap-4 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {settings?.storeName ?? "Nerdverso"}. Todos os
            direitos reservados.
          </p>
          <p>Pagamento via Pix, cartão e boleto — dados protegidos.</p>
        </div>
      </div>
    </footer>
  );
}
