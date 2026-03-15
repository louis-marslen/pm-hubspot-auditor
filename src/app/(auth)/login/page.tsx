import { LoginForm } from "@/components/auth/login-form";
import { Alert } from "@/components/ui/alert";

export const metadata = { title: "Connexion — HubSpot Auditor" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-100">
          Connectez-vous à HubSpot Auditor
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Accédez à votre espace d&apos;audit
        </p>
      </div>
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-8">
        {params.reset === "success" && (
          <div className="mb-4">
            <Alert type="success">
              Mot de passe mis à jour. Connectez-vous avec votre nouveau mot de passe.
            </Alert>
          </div>
        )}
        <LoginForm />
      </div>
    </>
  );
}
