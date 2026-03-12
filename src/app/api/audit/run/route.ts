import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/hubspot/tokens";
import { runAudit } from "@/lib/audit/engine";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // 1. Authentification
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // 2. Lecture du body
  let connectionId: string;
  try {
    const body = await req.json();
    connectionId = body.connectionId;
    if (!connectionId) throw new Error("connectionId manquant");
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  // 3. Récupération de la connexion (RLS garantit l'appartenance)
  const { data: connection, error: connError } = await supabase
    .from("hubspot_connections")
    .select("id, access_token, refresh_token, token_expires_at")
    .eq("id", connectionId)
    .eq("user_id", user.id)
    .single();

  if (connError || !connection) {
    return NextResponse.json({ error: "Connexion introuvable" }, { status: 404 });
  }

  // 4. Création de l'audit run en status 'running'
  const { data: auditRun, error: insertError } = await supabase
    .from("audit_runs")
    .insert({
      connection_id: connectionId,
      user_id: user.id,
      status: "running",
    })
    .select("id")
    .single();

  if (insertError || !auditRun) {
    return NextResponse.json({ error: "Impossible de créer l'audit" }, { status: 500 });
  }

  const auditId = auditRun.id;

  // 5. Obtention du token valide
  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(connection);
  } catch (err) {
    await supabase
      .from("audit_runs")
      .update({ status: "failed", error: "Impossible de rafraîchir le token HubSpot" })
      .eq("id", auditId);
    return NextResponse.json({ error: "Erreur d'authentification HubSpot" }, { status: 500 });
  }

  // 6. Exécution de l'audit
  try {
    const results = await runAudit(accessToken);

    await supabase
      .from("audit_runs")
      .update({
        status: "completed",
        results,
        score: results.score,
        total_critiques: results.totalCritiques,
        total_avertissements: results.totalAvertissements,
        total_infos: results.totalInfos,
        completed_at: new Date().toISOString(),
      })
      .eq("id", auditId);

    return NextResponse.json({ auditId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    await supabase
      .from("audit_runs")
      .update({ status: "failed", error: message })
      .eq("id", auditId);
    return NextResponse.json({ error: "L'audit a échoué", detail: message }, { status: 500 });
  }
}
