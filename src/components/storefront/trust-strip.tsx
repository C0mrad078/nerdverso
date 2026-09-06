import { CreditCard, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";

const BENEFITS = [
  { icon: ShieldCheck, label: "Pagamento seguro" },
  { icon: PackageCheck, label: "Envio para todo o Brasil" },
  { icon: Sparkles, label: "Produtos exclusivos" },
  { icon: CreditCard, label: "Compra protegida" },
] as const;

export function TrustStrip() {
  return (
    <section className="border-y border-border">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8">
        {BENEFITS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon className="size-5 shrink-0 text-primary" aria-hidden />
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
