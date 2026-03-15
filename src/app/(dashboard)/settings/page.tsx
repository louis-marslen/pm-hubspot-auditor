"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";

interface Workspace {
  id: string;
  portal_id: string;
  portal_name: string | null;
  hub_domain: string | null;
  connected_at: string;
  token_expires_at: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email ?? "");
      setUserId(user.id);

      const { data } = await supabase
        .from("hubspot_connections")
        .select("id, portal_id, portal_name, hub_domain, connected_at, token_expires_at")
        .eq("user_id", user.id)
        .order("connected_at", { ascending: false });

      setWorkspaces((data as Workspace[]) ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleDisconnect(connectionId: string) {
    setDisconnecting(connectionId);
    try {
      const res = await fetch("/api/hubspot/oauth/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });
      if (res.ok) {
        setWorkspaces((prev) => prev.filter((ws) => ws.id !== connectionId));
      }
    } finally {
      setDisconnecting(null);
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteError(null);

    if (confirmEmail !== userEmail) {
      setDeleteError("L'email saisi ne correspond pas à votre compte.");
      return;
    }

    setDeleteLoading(true);
    const response = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    setDeleteLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setDeleteError(data.error ?? "Une erreur est survenue. Réessayez.");
      return;
    }

    router.push("/?deleted=true");
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-100">Paramètres</h1>

      {/* Profile */}
      <Card>
        <h2 className="text-[15px] font-semibold text-gray-100 mb-4">Mon profil</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm text-gray-200">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Mot de passe</p>
              <p className="text-sm text-gray-500">••••••••</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push("/forgot-password")}
            >
              Modifier le mot de passe
            </Button>
          </div>
        </div>
      </Card>

      {/* Workspaces */}
      <Card>
        <h2 className="text-[15px] font-semibold text-gray-100 mb-4">Workspaces HubSpot</h2>
        {workspaces.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun workspace connecté.</p>
        ) : (
          <div className="space-y-3">
            {workspaces.map((ws) => {
              const isExpired = ws.token_expires_at && new Date(ws.token_expires_at) < new Date();
              return (
                <div key={ws.id} className="flex items-center justify-between rounded-md border border-gray-700 bg-gray-800/50 p-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-200">
                        {ws.portal_name ?? `Portal ${ws.portal_id}`}
                      </p>
                      <Badge variant={isExpired ? "critique" : "succes"}>
                        {isExpired ? "Expiré" : "Actif"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      Hub {ws.portal_id}{ws.hub_domain && ` · ${ws.hub_domain}`} · Connecté le{" "}
                      {new Date(ws.connected_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(ws.id)}
                    loading={disconnecting === ws.id}
                  >
                    Déconnecter
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4">
          <a href="/api/hubspot/oauth/initiate">
            <Button variant="secondary" size="sm">+ Connecter un workspace</Button>
          </a>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-500/30">
        <h2 className="text-[15px] font-semibold text-red-400 mb-2">Danger zone</h2>
        <p className="text-sm text-gray-400 mb-4">
          Cette action est irréversible. Toutes vos données et audits seront définitivement supprimés.
        </p>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowDeleteModal(true)}
        >
          Supprimer mon compte
        </Button>
      </Card>

      {/* Delete account modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setConfirmEmail(""); setDeleteError(null); }}
        title="Supprimer mon compte"
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleteLoading}
              disabled={confirmEmail !== userEmail}
              onClick={handleDeleteAccount}
            >
              Supprimer définitivement
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert type="warning">
            <div className="flex items-start gap-2">
              <div>
                <p className="font-medium">Cette action supprimera :</p>
                <ul className="mt-1 space-y-1 text-sm">
                  <li>· Votre compte</li>
                  <li>· Tous vos workspaces connectés</li>
                  <li>· Tout votre historique d&apos;audit</li>
                </ul>
              </div>
            </div>
          </Alert>

          <div>
            <p className="text-sm text-gray-300 mb-2">
              Tapez votre email pour confirmer : <strong>{userEmail}</strong>
            </p>
            <Input
              id="delete-confirm-email"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={userEmail}
            />
          </div>

          {deleteError && <Alert type="error">{deleteError}</Alert>}
        </div>
      </Modal>
    </div>
  );
}
