import { createClient } from "@/lib/supabase/server";

/**
 * Fetches the score delta between the current audit and the previous one
 * for the same connection (workspace). Returns null if no previous audit exists.
 */
export async function fetchScoreDelta(
  connectionId: string,
  currentAuditId: string,
  currentScore: number,
): Promise<number | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("audit_runs")
    .select("global_score")
    .eq("connection_id", connectionId)
    .eq("status", "completed")
    .neq("id", currentAuditId)
    .order("started_at", { ascending: false })
    .limit(1)
    .single<{ global_score: number | null }>();

  if (!data || data.global_score == null) return null;

  return currentScore - data.global_score;
}
