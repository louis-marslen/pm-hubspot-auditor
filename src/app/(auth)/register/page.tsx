import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Créer un compte — HubSpot Auditor" };

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="mt-2 text-sm text-gray-600">
            Commencez à auditer votre workspace HubSpot
          </p>
        </div>
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
