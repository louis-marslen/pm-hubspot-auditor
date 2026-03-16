import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/audit/{auditId}/status
 * Endpoint léger de polling pour la progression d'audit.
 * Retourne uniquement le statut et la progression, pas les résultats.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ auditId: string }> },
) {
  const { auditId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("audit_runs")
    .select("status, audit_progress, audit_domains, portal_name, error")
    .eq("id", auditId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Audit introuvable" }, { status: 404 });
  }

  const progress = data.audit_progress;

  return NextResponse.json({
    status: data.status,
    portalName: data.portal_name,
    error: data.error,
    domains: progress?.domains ?? null,
    llmSummary: progress?.llmSummary ?? null,
    globalProgress: progress?.globalProgress ?? 0,
    auditDomains: data.audit_domains ?? null,
  });
}
