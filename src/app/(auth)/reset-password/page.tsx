import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = { title: "Nouveau mot de passe — HubSpot Auditor" };

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Nouveau mot de passe
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Choisissez un mot de passe sécurisé
          </p>
        </div>
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
