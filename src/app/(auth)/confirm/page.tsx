import Link from "next/link";

export const metadata = { title: "Confirmez votre email — HubSpot Auditor" };

export default function ConfirmPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <svg
              className="h-8 w-8 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Vérifiez votre email
        </h1>
        <p className="mt-3 text-gray-600">
          Un lien de confirmation a été envoyé à votre adresse email. Cliquez
          dessus pour activer votre compte.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Le lien est valable 24 heures.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="text-sm font-medium text-orange-600 hover:text-orange-500"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
