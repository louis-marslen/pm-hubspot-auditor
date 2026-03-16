import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getValidAccessToken } from "@/lib/hubspot/tokens";
import { runFullAudit } from "@/lib/audit/engine";
import { generateLlmSummary } from "@/lib/audit/llm-summary";
import { initProgress, persistProgress } from "@/lib/audit/progress";
import { AUDIT_DOMAINS, type AuditDomainId, type AuditDomainSelection } from "@/lib/audit/types";

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
  let selectedDomains: AuditDomainId[] | undefined;
  try {
    const body = await req.json();
    connectionId = body.connectionId;
    if (!connectionId) throw new Error("connectionId manquant");

    // Validation des domaines sélectionnés
    if (body.selectedDomains && Array.isArray(body.selectedDomains) && body.selectedDomains.length > 0) {
      const validIds = new Set(AUDIT_DOMAINS.map((d) => d.id));
      const implementedIds = new Set(AUDIT_DOMAINS.filter((d) => d.implemented).map((d) => d.id));
      const filtered = (body.selectedDomains as string[]).filter((id) => validIds.has(id as AuditDomainId) && implementedIds.has(id as AuditDomainId)) as AuditDomainId[];

      // properties est obligatoire
      if (!filtered.includes("properties")) {
        filtered.unshift("properties");
      }
      selectedDomains = filtered;
    }
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

  // 4. Création de l'audit run en status 'running' avec progression initiale
  const domainsToInit = selectedDomains ?? ["properties", "contacts", "companies", "deals", "workflows", "users"];
  const initialProgress = initProgress(domainsToInit);

  // Construire la sélection persistée (null si tous les domaines = rétrocompatibilité)
  const allImplemented = AUDIT_DOMAINS.filter((d) => d.implemented).map((d) => d.id);
  const isFullAudit = !selectedDomains || selectedDomains.length === allImplemented.length;
  const auditDomainsPayload: AuditDomainSelection | null = isFullAudit
    ? null
    : {
        selected: selectedDomains!,
        available: allImplemented,
      };

  const { data: auditRun, error: insertError } = await supabase
    .from("audit_runs")
    .insert({
      connection_id: connectionId,
      user_id: user.id,
      status: "running",
      portal_id: connection.portal_id ?? null,
      portal_name: connection.portal_name ?? null,
      audit_progress: initialProgress,
      audit_domains: auditDomainsPayload,
    })
    .select("id, share_token")
    .single();

  if (insertError || !auditRun) {
    return NextResponse.json({ error: "Impossible de créer l'audit" }, { status: 500 });
  }

  const auditId = auditRun.id;
  const shareToken = auditRun.share_token ?? null;

  // 5. Obtention du token valide
  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(connection);
  } catch {
    await supabase
      .from("audit_runs")
      .update({ status: "failed", error: "Impossible de rafraîchir le token HubSpot" })
      .eq("id", auditId);
    return NextResponse.json({ error: "Erreur d'authentification HubSpot" }, { status: 500 });
  }

  // 6. Lancer l'audit en arrière-plan (fire-and-forget)
  // Le client admin est utilisé car la réponse HTTP sera envoyée avant la fin
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  runAuditInBackground(accessToken, auditId, adminSupabase, connection, selectedDomains);

  // 7. Retour immédiat — le frontend navigue vers /audit/{auditId}
  return NextResponse.json({ auditId, shareToken });
}

/**
 * Exécute l'audit complet en arrière-plan et met à jour la base une fois terminé.
 * Utilise le client admin Supabase (service role) pour écrire sans cookies.
 */
async function runAuditInBackground(
  accessToken: string,
  auditId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  connection: { portal_id?: string | null; portal_name?: string | null },
  selectedDomains?: AuditDomainId[],
) {
  const startedAt = Date.now();
  const domainsToInit = selectedDomains ?? ["properties", "contacts", "companies", "deals", "workflows", "users"];

  try {
    const global = await runFullAudit(accessToken, auditId, selectedDomains);

    // Émettre progression LLM
    const currentProgress = initProgress(domainsToInit);
    // On recrée la progression "tout completed" + llm running
    const allCompleted = { ...currentProgress };
    for (const key of Object.keys(allCompleted.domains)) {
      allCompleted.domains[key] = {
        status: "completed",
        currentStep: null,
        completedSteps: ["fetching", "analyzing", "scoring"],
        itemCount: allCompleted.domains[key].itemCount,
        error: null,
      };
    }
    allCompleted.llmSummary = { status: "running" };
    allCompleted.globalProgress = Object.keys(allCompleted.domains).length * 3 / (Object.keys(allCompleted.domains).length * 3 + 1);
    await persistProgress(auditId, allCompleted);

    const llmSummary = await generateLlmSummary(global, selectedDomains);

    // Progression LLM terminée
    allCompleted.llmSummary = { status: "completed" };
    allCompleted.globalProgress = 1;
    await persistProgress(auditId, allCompleted);

    const executionDurationMs = Date.now() - startedAt;

    // Totaux combinés pour les 4 domaines
    const totalCritiques =
      global.propertyResults.totalCritiques +
      (global.contactResults?.totalCritiques ?? 0) +
      (global.companyResults?.totalCritiques ?? 0) +
      (global.dealResults?.totalCritiques ?? 0) +
      (global.workflowResults?.totalCritiques ?? 0) +
      (global.userResults?.totalCritiques ?? 0);
    const totalAvertissements =
      global.propertyResults.totalAvertissements +
      (global.contactResults?.totalAvertissements ?? 0) +
      (global.companyResults?.totalAvertissements ?? 0) +
      (global.dealResults?.totalAvertissements ?? 0) +
      (global.workflowResults?.totalAvertissements ?? 0) +
      (global.userResults?.totalAvertissements ?? 0);
    const totalInfos =
      global.propertyResults.totalInfos +
      (global.contactResults?.totalInfos ?? 0) +
      (global.companyResults?.totalInfos ?? 0) +
      (global.dealResults?.totalInfos ?? 0) +
      (global.workflowResults?.totalInfos ?? 0) +
      (global.userResults?.totalInfos ?? 0);

    // Build skipped_reasons for domains that were selected but returned no results
    const skippedReasons: Record<string, string> = {};
    if (selectedDomains?.includes("contacts") && !global.contactResults) {
      skippedReasons.contacts = "no_contacts";
    }
    if (selectedDomains?.includes("companies") && !global.companyResults) {
      skippedReasons.companies = "no_companies";
    }
    if (selectedDomains?.includes("users") && !global.userResults) {
      skippedReasons.users = "less_than_2_users";
    }
    if (selectedDomains?.includes("deals") && !global.dealResults) {
      skippedReasons.deals = "no_deals";
    }
    if (selectedDomains?.includes("workflows") && !global.workflowResults) {
      skippedReasons.workflows = "no_workflows";
    }

    // Update audit_domains with skipped_reasons if any
    const updatedAuditDomains = selectedDomains && Object.keys(skippedReasons).length > 0
      ? {
          selected: selectedDomains,
          available: AUDIT_DOMAINS.filter((d) => d.implemented).map((d) => d.id),
          skipped_reasons: skippedReasons,
        }
      : undefined; // Don't overwrite if no skips

    await supabase
      .from("audit_runs")
      .update({
        status: "completed",
        results: global.propertyResults,
        workflow_results: global.workflowResults,
        contact_results: global.contactResults,
        company_results: global.companyResults,
        user_results: global.userResults,
        deal_results: global.dealResults,
        llm_summary: llmSummary,
        score: global.propertyResults.score,
        property_score: global.propertyResults.score,
        workflow_score: global.workflowResults?.score ?? null,
        contact_score: global.contactResults?.score ?? null,
        company_score: global.companyResults?.score ?? null,
        user_score: global.userResults?.score ?? null,
        deal_score: global.dealResults?.score ?? null,
        global_score: global.globalScore,
        total_critiques: totalCritiques,
        total_avertissements: totalAvertissements,
        total_infos: totalInfos,
        portal_id: connection.portal_id ?? null,
        portal_name: connection.portal_name ?? null,
        execution_duration_ms: executionDurationMs,
        completed_at: new Date().toISOString(),
        ...(updatedAuditDomains ? { audit_domains: updatedAuditDomains } : {}),
      })
      .eq("id", auditId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error(`[audit] background audit failed for ${auditId}:`, message);
    await supabase
      .from("audit_runs")
      .update({ status: "failed", error: message })
      .eq("id", auditId);
  }
}
