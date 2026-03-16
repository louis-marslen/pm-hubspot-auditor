import {
  LeadPipelineRuleResult,
  LeadStageRuleResult,
  PipelineStageInfo,
  SkippedStageInfo,
} from "@/lib/audit/types";

export interface LeadPipelineData {
  pipeline: { id: string; label: string };
  stages: LeadPipelineStage[];
}

interface LeadPipelineStage {
  id: string;
  label: string;
  displayOrder: number;
  metadata?: {
    probability?: string;
    isClosed?: string;
    leadState?: string; // NEW, IN_PROGRESS, QUALIFIED, UNQUALIFIED
  };
}

// ─── L-05 : Pipeline leads sans activité récente 60j — Info ──────────────

export function runL05(
  pipelines: LeadPipelineData[],
  openLeads: Record<string, unknown>[],
): LeadPipelineRuleResult[] {
  const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const openCountByPipeline = new Map<string, number>();
  for (const l of openLeads) {
    const props = l.properties as Record<string, string | null>;
    const pid = props.hs_pipeline ?? "";
    openCountByPipeline.set(pid, (openCountByPipeline.get(pid) ?? 0) + 1);
  }

  const recentByPipeline = new Map<string, number>();
  for (const l of openLeads) {
    const props = l.properties as Record<string, string | null>;
    const pid = props.hs_pipeline ?? "";
    const createdAt = props.createdate ? new Date(props.createdate).getTime() : 0;
    if (now - createdAt < sixtyDaysMs) {
      recentByPipeline.set(pid, (recentByPipeline.get(pid) ?? 0) + 1);
    }
  }

  return pipelines
    .map((p) => {
      const openCount = openCountByPipeline.get(p.pipeline.id) ?? 0;
      const recentCount = recentByPipeline.get(p.pipeline.id) ?? 0;
      const triggered = openCount === 0 && recentCount === 0;

      return {
        pipelineId: p.pipeline.id,
        pipelineLabel: p.pipeline.label,
        triggered,
        totalLeads: openCount,
        lastLeadCreatedAt: null as string | null,
        stageCount: p.stages.length,
      };
    })
    .filter((r) => r.triggered);
}

// ─── L-06 : Pipeline leads avec trop d'étapes (> 5) — Info ──────────────

export function runL06(
  pipelines: LeadPipelineData[],
  openLeads: Record<string, unknown>[],
): LeadPipelineRuleResult[] {
  const MAX_STAGES = 5;

  const openCountByStage = new Map<string, number>();
  for (const l of openLeads) {
    const props = l.properties as Record<string, string | null>;
    const key = `${props.hs_pipeline}:${props.hs_pipeline_stage}`;
    openCountByStage.set(key, (openCountByStage.get(key) ?? 0) + 1);
  }

  return pipelines
    .map((p) => {
      const activeStages = p.stages.filter(
        (s) => s.metadata?.isClosed !== "true"
      );

      const stages: PipelineStageInfo[] = p.stages.map((s) => ({
        id: s.id,
        label: s.label,
        displayOrder: s.displayOrder,
        isClosed: s.metadata?.isClosed === "true",
        probability: parseFloat(s.metadata?.probability ?? "0"),
        openDealCount: openCountByStage.get(`${p.pipeline.id}:${s.id}`) ?? 0,
        lastActivity: null,
      }));

      return {
        pipelineId: p.pipeline.id,
        pipelineLabel: p.pipeline.label,
        triggered: activeStages.length > MAX_STAGES,
        activeStageCount: activeStages.length,
        stages,
      };
    })
    .filter((r) => r.triggered);
}

// ─── L-07 : Phases sautées — Avertissement ───────────────────────────────

export function runL07(
  pipelines: LeadPipelineData[],
  openLeads: Record<string, unknown>[],
): LeadPipelineRuleResult[] {
  const THRESHOLD = 0.2;
  const results: LeadPipelineRuleResult[] = [];

  for (const p of pipelines) {
    const orderedStages = [...p.stages].sort((a, b) => a.displayOrder - b.displayOrder);
    const stageOrderMap = new Map<string, number>();
    orderedStages.forEach((s, i) => stageOrderMap.set(s.id, i));
    const stageLabels = new Map(orderedStages.map((s) => [s.id, s.label]));

    const pipelineLeads = openLeads.filter((l) => {
      const props = l.properties as Record<string, string | null>;
      return props.hs_pipeline === p.pipeline.id;
    });

    let leadsWithSkips = 0;
    let totalAnalyzed = 0;
    const skipCountByStage = new Map<string, number>();

    for (const l of pipelineLeads) {
      const props = l.properties as Record<string, string | null>;

      const traversedStages: { stageId: string; dateEntered: number }[] = [];
      for (const s of orderedStages) {
        const dateStr = props[`hs_date_entered_${s.id}`];
        if (dateStr) {
          traversedStages.push({ stageId: s.id, dateEntered: new Date(dateStr).getTime() });
        }
      }

      if (traversedStages.length < 2) continue;
      totalAnalyzed++;

      traversedStages.sort((a, b) => a.dateEntered - b.dateEntered);

      let hasSkip = false;
      for (let i = 1; i < traversedStages.length; i++) {
        const prevOrder = stageOrderMap.get(traversedStages[i - 1].stageId) ?? 0;
        const currOrder = stageOrderMap.get(traversedStages[i].stageId) ?? 0;

        if (currOrder > prevOrder + 1) {
          hasSkip = true;
          for (let j = prevOrder + 1; j < currOrder; j++) {
            const skippedStageId = orderedStages[j]?.id;
            if (skippedStageId) {
              skipCountByStage.set(skippedStageId, (skipCountByStage.get(skippedStageId) ?? 0) + 1);
            }
          }
        }
      }

      if (hasSkip) leadsWithSkips++;
    }

    if (totalAnalyzed === 0) continue;

    const skippedRate = leadsWithSkips / totalAnalyzed;
    if (skippedRate <= THRESHOLD) continue;

    const topSkippedStages: SkippedStageInfo[] = Array.from(skipCountByStage.entries())
      .map(([stageId, skipCount]) => ({
        stageId,
        stageLabel: stageLabels.get(stageId) ?? stageId,
        skipCount,
      }))
      .sort((a, b) => b.skipCount - a.skipCount)
      .slice(0, 3);

    results.push({
      pipelineId: p.pipeline.id,
      pipelineLabel: p.pipeline.label,
      triggered: true,
      skippedRate,
      leadsWithSkips,
      totalAnalyzed,
      topSkippedStages,
    });
  }

  return results;
}

// ─── L-08 : Points d'entrée multiples — Avertissement ────────────────────

export function runL08(
  pipelines: LeadPipelineData[],
  openLeads: Record<string, unknown>[],
): LeadPipelineRuleResult[] {
  const THRESHOLD = 0.2;
  const results: LeadPipelineRuleResult[] = [];

  for (const p of pipelines) {
    const orderedStages = [...p.stages].sort((a, b) => a.displayOrder - b.displayOrder);
    const firstStageId = orderedStages[0]?.id;
    if (!firstStageId) continue;

    const stageLabels = new Map(orderedStages.map((s) => [s.id, s.label]));

    const pipelineLeads = openLeads.filter((l) => {
      const props = l.properties as Record<string, string | null>;
      return props.hs_pipeline === p.pipeline.id;
    });

    let nonStandardEntries = 0;
    let totalAnalyzed = 0;
    const entryCountByStage = new Map<string, number>();

    for (const l of pipelineLeads) {
      const props = l.properties as Record<string, string | null>;

      let firstTraversed: { stageId: string; dateEntered: number } | null = null;
      for (const s of orderedStages) {
        const dateStr = props[`hs_date_entered_${s.id}`];
        if (dateStr) {
          const dateEntered = new Date(dateStr).getTime();
          if (!firstTraversed || dateEntered < firstTraversed.dateEntered) {
            firstTraversed = { stageId: s.id, dateEntered };
          }
        }
      }

      if (!firstTraversed) continue;
      totalAnalyzed++;

      entryCountByStage.set(firstTraversed.stageId, (entryCountByStage.get(firstTraversed.stageId) ?? 0) + 1);

      if (firstTraversed.stageId !== firstStageId) {
        nonStandardEntries++;
      }
    }

    if (totalAnalyzed === 0) continue;

    const rate = nonStandardEntries / totalAnalyzed;
    if (rate <= THRESHOLD) continue;

    const entryDistribution = Array.from(entryCountByStage.entries())
      .map(([stageId, count]) => ({
        stageId,
        stageLabel: stageLabels.get(stageId) ?? stageId,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    results.push({
      pipelineId: p.pipeline.id,
      pipelineLabel: p.pipeline.label,
      triggered: true,
      nonStandardEntryRate: rate,
      nonStandardEntries,
      totalAnalyzed,
      entryDistribution,
    });
  }

  return results;
}

// ─── L-09 : Stages fermés redondants (Qualified / Disqualified) — Avert ─

export function runL09(
  pipelines: LeadPipelineData[],
  openLeads: Record<string, unknown>[],
): LeadPipelineRuleResult[] {
  const leadCountByStage = new Map<string, number>();
  for (const l of openLeads) {
    const props = l.properties as Record<string, string | null>;
    const key = `${props.hs_pipeline}:${props.hs_pipeline_stage}`;
    leadCountByStage.set(key, (leadCountByStage.get(key) ?? 0) + 1);
  }

  return pipelines
    .map((p) => {
      // For lead pipelines: use metadata.leadState to identify qualified/disqualified stages
      const qualifiedStages = p.stages
        .filter((s) => s.metadata?.leadState?.toUpperCase() === "QUALIFIED" || (!s.metadata?.leadState && parseFloat(s.metadata?.probability ?? "0") === 1.0))
        .map((s) => ({
          id: s.id,
          label: s.label,
          leadCount: leadCountByStage.get(`${p.pipeline.id}:${s.id}`) ?? 0,
        }));

      const disqualifiedStages = p.stages
        .filter((s) =>
          s.metadata?.leadState?.toUpperCase() === "UNQUALIFIED" ||
          (!s.metadata?.leadState && s.metadata?.isClosed === "true" && parseFloat(s.metadata?.probability ?? "1") === 0)
        )
        .map((s) => ({
          id: s.id,
          label: s.label,
          leadCount: leadCountByStage.get(`${p.pipeline.id}:${s.id}`) ?? 0,
        }));

      const triggered = qualifiedStages.length > 1 || disqualifiedStages.length > 1;

      return {
        pipelineId: p.pipeline.id,
        pipelineLabel: p.pipeline.label,
        triggered,
        qualifiedStages,
        disqualifiedStages,
      };
    })
    .filter((r) => r.triggered);
}

// ─── L-10 : Stage sans activité 60j — Info ───────────────────────────────

export function runL10(
  pipelines: LeadPipelineData[],
  openLeads: Record<string, unknown>[],
  inactivePipelineIds: Set<string>,
): LeadStageRuleResult[] {
  const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const results: LeadStageRuleResult[] = [];

  const openCountByStage = new Map<string, number>();
  for (const l of openLeads) {
    const props = l.properties as Record<string, string | null>;
    const key = `${props.hs_pipeline}:${props.hs_pipeline_stage}`;
    openCountByStage.set(key, (openCountByStage.get(key) ?? 0) + 1);
  }

  for (const p of pipelines) {
    if (inactivePipelineIds.has(p.pipeline.id)) continue;

    for (const s of p.stages) {
      if (s.metadata?.isClosed === "true") continue;

      const stageKey = `${p.pipeline.id}:${s.id}`;
      const openCount = openCountByStage.get(stageKey) ?? 0;

      if (openCount > 0) continue;

      let hasRecentActivity = false;
      for (const l of openLeads) {
        const props = l.properties as Record<string, string | null>;
        if (props.hs_pipeline !== p.pipeline.id) continue;
        const dateStr = props[`hs_date_entered_${s.id}`];
        if (dateStr && now - new Date(dateStr).getTime() < sixtyDaysMs) {
          hasRecentActivity = true;
          break;
        }
      }

      if (!hasRecentActivity) {
        let lastActivity: string | null = null;
        for (const l of openLeads) {
          const props = l.properties as Record<string, string | null>;
          const dateStr = props[`hs_date_entered_${s.id}`];
          if (dateStr) {
            if (!lastActivity || dateStr > lastActivity) lastActivity = dateStr;
          }
        }

        results.push({
          pipelineId: p.pipeline.id,
          pipelineLabel: p.pipeline.label,
          stageId: s.id,
          stageLabel: s.label,
          displayOrder: s.displayOrder,
          lastActivity,
        });
      }
    }
  }

  return results;
}

/** Helper to get stage IDs by type (qualified/disqualified) from pipelines.
 *  Uses metadata.leadState (QUALIFIED / UNQUALIFIED) which is specific to lead pipelines.
 *  Falls back to probability-based detection for compatibility. */
export function getStageIdsByType(
  pipelines: LeadPipelineData[],
  type: "qualified" | "disqualified",
): string[] {
  const stageIds: string[] = [];
  for (const p of pipelines) {
    for (const s of p.stages) {
      const leadState = s.metadata?.leadState?.toUpperCase();
      if (type === "qualified") {
        if (leadState === "QUALIFIED" || (!leadState && parseFloat(s.metadata?.probability ?? "0") === 1.0)) {
          stageIds.push(s.id);
        }
      } else {
        if (leadState === "UNQUALIFIED" || (!leadState && s.metadata?.isClosed === "true" && parseFloat(s.metadata?.probability ?? "1") === 0)) {
          stageIds.push(s.id);
        }
      }
    }
  }
  return stageIds;
}
