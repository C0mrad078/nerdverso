import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-foreground">Criar conta</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Acompanhe pedidos e finalize compras mais rápido.
      </p>

      <div className="mt-8">
        <RegisterForm />
      </div>

      <Link
        href="/"
        className="mt-8 text-center text-sm text-muted-foreground hover:text-foreground"
      >
        Voltar para a loja
      </Link>
    </div>
  );
}
