import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Créer un compte — HubSpot Auditor" };

export default function RegisterPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-100">
          Créez votre compte
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Auditez votre workspace HubSpot en quelques minutes
        </p>
      </div>
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-8">
        <RegisterForm />
      </div>
    </>
  );
}
