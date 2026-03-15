import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = { title: "Mot de passe oublié — HubSpot Auditor" };

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-100">
          Réinitialiser votre mot de passe
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Entrez votre email, nous vous enverrons un lien de réinitialisation.
        </p>
      </div>
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-8">
        <ForgotPasswordForm />
      </div>
    </>
  );
}
