import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/hubspot/tokens";
import { runFullAudit } from "@/lib/audit/engine";
import { generateLlmSummary } from "@/lib/audit/llm-summary";

// Audit complet (propriétés + workflows + LLM) peut dépasser 30s — nécessite Vercel Pro
export const maxDuration = 300;

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
    .select("id, access_token, refresh_token, token_expires_at, portal_id, portal_name")
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
  const startedAt = Date.now();

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

  // 6. Exécution de l'audit complet
  try {
    const global = await runFullAudit(accessToken);
    const llmSummary = await generateLlmSummary(global);
    const executionDurationMs = Date.now() - startedAt;

    // Totaux combinés pour les 4 domaines
    const totalCritiques =
      global.propertyResults.totalCritiques +
      (global.contactResults?.totalCritiques ?? 0) +
      (global.companyResults?.totalCritiques ?? 0) +
      (global.workflowResults?.totalCritiques ?? 0);
    const totalAvertissements =
      global.propertyResults.totalAvertissements +
      (global.contactResults?.totalAvertissements ?? 0) +
      (global.companyResults?.totalAvertissements ?? 0) +
      (global.workflowResults?.totalAvertissements ?? 0);
    const totalInfos =
      global.propertyResults.totalInfos +
      (global.contactResults?.totalInfos ?? 0) +
      (global.companyResults?.totalInfos ?? 0) +
      (global.workflowResults?.totalInfos ?? 0);

    const { data: updated } = await supabase
      .from("audit_runs")
      .update({
        status: "completed",
        results: global.propertyResults,
        workflow_results: global.workflowResults,
        contact_results: global.contactResults,
        company_results: global.companyResults,
        llm_summary: llmSummary,
        score: global.propertyResults.score,
        property_score: global.propertyResults.score,
        workflow_score: global.workflowResults?.score ?? null,
        contact_score: global.contactResults?.score ?? null,
        company_score: global.companyResults?.score ?? null,
        global_score: global.globalScore,
        total_critiques: totalCritiques,
        total_avertissements: totalAvertissements,
        total_infos: totalInfos,
        portal_id: connection.portal_id ?? null,
        portal_name: connection.portal_name ?? null,
        execution_duration_ms: executionDurationMs,
        completed_at: new Date().toISOString(),
      })
      .eq("id", auditId)
      .select("share_token")
      .single();

    const shareToken = updated?.share_token ?? null;

    return NextResponse.json({ auditId, shareToken });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    await supabase
      .from("audit_runs")
      .update({ status: "failed", error: message })
      .eq("id", auditId);
    return NextResponse.json({ error: "L'audit a échoué", detail: message }, { status: 500 });
  }
}
