import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Connexion — HubSpot Auditor" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
          <p className="mt-2 text-sm text-gray-600">
            Accédez à votre espace HubSpot Auditor
          </p>
        </div>
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          {params.reset === "success" && (
            <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
              Mot de passe mis à jour. Connectez-vous avec votre nouveau mot de
              passe.
            </div>
          )}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
