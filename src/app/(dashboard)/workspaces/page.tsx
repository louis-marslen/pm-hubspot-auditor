import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface HubspotConnection {
  id: string;
  portal_id: string;
  portal_name: string | null;
  hub_domain: string | null;
  connected_at: string;
  token_expires_at: string | null;
}

export const metadata = { title: "Mes workspaces — HubSpot Auditor" };

export default async function WorkspacesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: connections } = await supabase
    .from("hubspot_connections")
    .select("id, portal_id, portal_name, hub_domain, connected_at, token_expires_at")
    .eq("user_id", user!.id)
    .order("connected_at", { ascending: false });

  const workspaces = (connections as HubspotConnection[]) ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold text-gray-900">
            HubSpot Auditor
          </Link>
          <span className="text-sm text-gray-600">{user!.email}</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mes workspaces</h2>
            <p className="mt-1 text-gray-600">
              Gérez vos connexions HubSpot
            </p>
          </div>
          {/* EP-01 : ce bouton déclenchera le flux OAuth HubSpot */}
          <button
            disabled
            title="Disponible dans EP-01"
            className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
          >
            + Ajouter un workspace
          </button>
        </div>

        {workspaces.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-white p-12 text-center">
            <p className="text-gray-600">
              Aucun workspace connecté.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              La connexion OAuth HubSpot sera disponible dans la prochaine version.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {workspaces.map((ws) => {
              const isExpired =
                ws.token_expires_at && new Date(ws.token_expires_at) < new Date();
              return (
                <div
                  key={ws.id}
                  className="flex items-center justify-between rounded-lg border bg-white p-5 shadow-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {ws.portal_name ?? `Portal ${ws.portal_id}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      Hub ID : {ws.portal_id}
                      {ws.hub_domain && ` · ${ws.hub_domain}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      Connecté le{" "}
                      {new Date(ws.connected_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isExpired
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {isExpired ? "Expiré" : "Actif"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
