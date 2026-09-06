import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = { title: "Esqueci minha senha" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-foreground">Esqueci minha senha</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Informe seu e-mail e enviaremos um link para você criar uma nova senha.
      </p>

      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
