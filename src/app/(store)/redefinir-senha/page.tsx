import { ResetPasswordForm } from "./reset-password-form";

export const metadata = { title: "Redefinir senha" };

export default async function ResetPasswordPage(props: PageProps<"/redefinir-senha">) {
  const searchParams = await props.searchParams;
  const tokenParam = searchParams.token;
  const token = Array.isArray(tokenParam) ? (tokenParam[0] ?? "") : (tokenParam ?? "");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-foreground">Redefinir senha</h1>
      <p className="mt-2 text-sm text-muted-foreground">Escolha uma nova senha para sua conta.</p>

      <div className="mt-8">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-sm text-destructive">Link de redefinição inválido.</p>
        )}
      </div>
    </div>
  );
}
