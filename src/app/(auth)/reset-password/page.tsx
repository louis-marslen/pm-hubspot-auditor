import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = { title: "Nouveau mot de passe — HubSpot Auditor" };

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-100">
          Nouveau mot de passe
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Choisissez un mot de passe sécurisé
        </p>
      </div>
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-8">
        <ResetPasswordForm />
      </div>
    </>
  );
}
