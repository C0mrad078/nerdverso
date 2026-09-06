import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar" };

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const callbackUrlParam = searchParams.callbackUrl;
  const callbackUrl = Array.isArray(callbackUrlParam)
    ? (callbackUrlParam[0] ?? "/conta")
    : (callbackUrlParam ?? "/conta");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-foreground">Entrar</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Acesse sua conta para ver pedidos, endereços e favoritos.
      </p>

      <div className="mt-8">
        <LoginForm callbackUrl={callbackUrl} />
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
