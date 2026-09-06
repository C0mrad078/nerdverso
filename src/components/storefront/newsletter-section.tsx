import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-surface px-6 py-12 text-center sm:px-12">
        <h2 className="font-display text-2xl text-foreground sm:text-3xl">
          Não perca os próximos lançamentos
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Assine a newsletter e receba primeiro as novas coleções e promoções da Nerdverso.
        </p>
        <form className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            required
            placeholder="seu@email.com"
            aria-label="Seu e-mail"
            className="h-11 bg-background"
          />
          <Button type="submit" className="h-11 shrink-0 rounded-full px-6">
            Quero receber
          </Button>
        </form>
      </div>
    </section>
  );
}
