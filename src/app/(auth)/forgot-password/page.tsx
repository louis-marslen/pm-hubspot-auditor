import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = { title: "Mot de passe oublié — HubSpot Auditor" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Mot de passe oublié
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Nous vous enverrons un lien de réinitialisation
          </p>
        </div>
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
