import {
  PipelineRuleResult,
  StageRuleResult,
} from "@/lib/audit/types";
import type { PipelineData } from "./deals";

// ─── D-06 : Pipeline sans activité récente — Info ─────────────────────────

export function runD06(
  pipelines: PipelineData[],
  openDeals: Record<string, unknown>[],
  allDealsCount: number,
): PipelineRuleResult[] {
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  // Count open deals per pipeline
  const openCountByPipeline = new Map<string, number>();
  for (const d of openDeals) {
    const props = d.properties as Record<string, string | null>;
    const pid = props.pipeline ?? "";
    openCountByPipeline.set(pid, (openCountByPipeline.get(pid) ?? 0) + 1);
  }

  // Count recently created deals per pipeline (from open deals — approximation)
  // We'll check all open deals for recent creation, which is a subset
  const recentByPipeline = new Map<string, number>();
  for (const d of openDeals) {
    const props = d.properties as Record<string, string | null>;
    const pid = props.pipeline ?? "";
    const createdAt = props.createdate ? new Date(props.createdate).getTime() : 0;
    if (now - createdAt < ninetyDaysMs) {
      recentByPipeline.set(pid, (recentByPipeline.get(pid) ?? 0) + 1);
    }
  }

  return pipelines.map((p) => {
    const openCount = openCountByPipeline.get(p.pipeline.id) ?? 0;
    const recentCount = recentByPipeline.get(p.pipeline.id) ?? 0;
    const triggered = openCount === 0 && recentCount === 0;

    return {
      pipelineId: p.pipeline.id,
      pipelineLabel: p.pipeline.label,
      triggered,
      totalDeals: allDealsCount, // approximation at pipeline level
      lastDealCreatedAt: null,
      stageCount: p.stages.length,
    };
  }).filter((r) => r.triggered);
}

// ─── D-07 : Pipeline avec trop de stages — Info ──────────────────────────

export function runD07(
  pipelines: PipelineData[],
  openDeals: Record<string, unknown>[],
): PipelineRuleResult[] {
  const MAX_STAGES = 8;

  // Count open deals per pipeline+stage
  const openCountByStage = new Map<string, number>();
  for (const d of openDeals) {
    const props = d.properties as Record<string, string | null>;
    const key = `${props.pipeline}:${props.dealstage}`;
    openCountByStage.set(key, (openCountByStage.get(key) ?? 0) + 1);
  }

  return pipelines
    .map((p) => {
      const activeStages = p.stages.filter(
        (s) => s.metadata?.isClosed !== "true"
      );

      const stages = p.stages.map((s) => ({
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

// ─── D-12 : Phases sautées — Avertissement ────────────────────────────────

export function runD12(
  pipelines: PipelineData[],
  openDeals: Record<string, unknown>[],
): PipelineRuleResult[] {
  const THRESHOLD = 0.2;
  const results: PipelineRuleResult[] = [];

  for (const p of pipelines) {
    // Get ordered stages
    const orderedStages = [...p.stages].sort((a, b) => a.displayOrder - b.displayOrder);
    const stageOrderMap = new Map<string, number>();
    orderedStages.forEach((s, i) => stageOrderMap.set(s.id, i));
    const stageLabels = new Map(orderedStages.map((s) => [s.id, s.label]));

    // Get deals in this pipeline
    const pipelineDeals = openDeals.filter((d) => {
      const props = d.properties as Record<string, string | null>;
      return props.pipeline === p.pipeline.id;
    });

    let dealsWithSkips = 0;
    let totalAnalyzed = 0;
    const skipCountByStage = new Map<string, number>();

    for (const d of pipelineDeals) {
      const props = d.properties as Record<string, string | null>;

      // Reconstruct traversal path from hs_date_entered_*
      const traversedStages: { stageId: string; dateEntered: number }[] = [];
      for (const s of orderedStages) {
        const dateStr = props[`hs_date_entered_${s.id}`];
        if (dateStr) {
          traversedStages.push({ stageId: s.id, dateEntered: new Date(dateStr).getTime() });
        }
      }

      if (traversedStages.length < 2) continue;
      totalAnalyzed++;

      // Sort by date entered
      traversedStages.sort((a, b) => a.dateEntered - b.dateEntered);

      // Check for skipped stages
      let hasSkip = false;
      for (let i = 1; i < traversedStages.length; i++) {
        const prevOrder = stageOrderMap.get(traversedStages[i - 1].stageId) ?? 0;
        const currOrder = stageOrderMap.get(traversedStages[i].stageId) ?? 0;

        if (currOrder > prevOrder + 1) {
          hasSkip = true;
          // Record skipped stages
          for (let j = prevOrder + 1; j < currOrder; j++) {
            const skippedStageId = orderedStages[j]?.id;
            if (skippedStageId) {
              skipCountByStage.set(skippedStageId, (skipCountByStage.get(skippedStageId) ?? 0) + 1);
            }
          }
        }
      }

      if (hasSkip) dealsWithSkips++;
    }

    if (totalAnalyzed === 0) continue;

    const skippedRate = dealsWithSkips / totalAnalyzed;
    if (skippedRate <= THRESHOLD) continue;

    // Top 3 most skipped stages
    const topSkippedStages = Array.from(skipCountByStage.entries())
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
      dealsWithSkips,
      totalAnalyzed,
      topSkippedStages,
    });
  }

  return results;
}

// ─── D-13 : Points d'entrée multiples — Avertissement ────────────────────

export function runD13(
  pipelines: PipelineData[],
  openDeals: Record<string, unknown>[],
): PipelineRuleResult[] {
  const THRESHOLD = 0.2;
  const results: PipelineRuleResult[] = [];

  for (const p of pipelines) {
    const orderedStages = [...p.stages].sort((a, b) => a.displayOrder - b.displayOrder);
    const firstStageId = orderedStages[0]?.id;
    if (!firstStageId) continue;

    const stageLabels = new Map(orderedStages.map((s) => [s.id, s.label]));

    const pipelineDeals = openDeals.filter((d) => {
      const props = d.properties as Record<string, string | null>;
      return props.pipeline === p.pipeline.id;
    });

    let nonStandardEntries = 0;
    let totalAnalyzed = 0;
    const entryCountByStage = new Map<string, number>();

    for (const d of pipelineDeals) {
      const props = d.properties as Record<string, string | null>;

      // Find first stage traversed chronologically
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

// ─── D-14 : Stages fermés redondants — Avertissement ─────────────────────

export function runD14(
  pipelines: PipelineData[],
  openDeals: Record<string, unknown>[],
): PipelineRuleResult[] {
  // Count deals per stage
  const dealCountByStage = new Map<string, number>();
  for (const d of openDeals) {
    const props = d.properties as Record<string, string | null>;
    const key = `${props.pipeline}:${props.dealstage}`;
    dealCountByStage.set(key, (dealCountByStage.get(key) ?? 0) + 1);
  }

  return pipelines
    .map((p) => {
      const closedWonStages = p.stages
        .filter((s) => parseFloat(s.metadata?.probability ?? "0") === 1.0)
        .map((s) => ({
          id: s.id,
          label: s.label,
          dealCount: dealCountByStage.get(`${p.pipeline.id}:${s.id}`) ?? 0,
        }));

      const closedLostStages = p.stages
        .filter((s) =>
          s.metadata?.isClosed === "true" &&
          parseFloat(s.metadata?.probability ?? "1") === 0
        )
        .map((s) => ({
          id: s.id,
          label: s.label,
          dealCount: dealCountByStage.get(`${p.pipeline.id}:${s.id}`) ?? 0,
        }));

      const triggered = closedWonStages.length > 1 || closedLostStages.length > 1;

      return {
        pipelineId: p.pipeline.id,
        pipelineLabel: p.pipeline.label,
        triggered,
        closedWonStages,
        closedLostStages,
      };
    })
    .filter((r) => r.triggered);
}

// ─── D-15 : Stage sans activité 90j — Info ────────────────────────────────

export function runD15(
  pipelines: PipelineData[],
  openDeals: Record<string, unknown>[],
  inactivePipelineIds: Set<string>,
): StageRuleResult[] {
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const results: StageRuleResult[] = [];

  // Count open deals per stage
  const openCountByStage = new Map<string, number>();
  for (const d of openDeals) {
    const props = d.properties as Record<string, string | null>;
    const key = `${props.pipeline}:${props.dealstage}`;
    openCountByStage.set(key, (openCountByStage.get(key) ?? 0) + 1);
  }

  for (const p of pipelines) {
    // Exclude pipelines already flagged by D-06
    if (inactivePipelineIds.has(p.pipeline.id)) continue;

    for (const s of p.stages) {
      // Only active stages (non-closed)
      if (s.metadata?.isClosed === "true") continue;

      const stageKey = `${p.pipeline.id}:${s.id}`;
      const openCount = openCountByStage.get(stageKey) ?? 0;

      if (openCount > 0) continue;

      // Check if any deal has hs_date_entered for this stage in last 90 days
      let hasRecentActivity = false;
      for (const d of openDeals) {
        const props = d.properties as Record<string, string | null>;
        if (props.pipeline !== p.pipeline.id) continue;
        const dateStr = props[`hs_date_entered_${s.id}`];
        if (dateStr && now - new Date(dateStr).getTime() < ninetyDaysMs) {
          hasRecentActivity = true;
          break;
        }
      }

      if (!hasRecentActivity) {
        // Find last activity date for this stage
        let lastActivity: string | null = null;
        for (const d of openDeals) {
          const props = d.properties as Record<string, string | null>;
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
