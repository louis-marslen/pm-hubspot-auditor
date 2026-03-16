import { HubSpotClient } from "@/lib/hubspot/api-client";
import {
  RateResult,
  DealDetailIssue,
  PipelineStageIssue,
  BlockedDealGroup,
  PipelineStageInfo,
} from "@/lib/audit/types";

interface SearchResponse {
  total: number;
  results: Record<string, unknown>[];
}

interface Pipeline {
  id: string;
  label: string;
  stages: PipelineStage[];
}

interface PipelineStage {
  id: string;
  label: string;
  displayOrder: number;
  metadata?: {
    probability?: string;
    isClosed?: string;
  };
  requiredProperties?: string[];
}

interface PipelinesResponse {
  results: Pipeline[];
}

interface StagesResponse {
  results: PipelineStage[];
}

// ─── Shared data fetching ─────────────────────────────────────────────────

export interface PipelineData {
  pipeline: Pipeline;
  stages: PipelineStage[];
}

export async function fetchPipelines(client: HubSpotClient): Promise<PipelineData[]> {
  const pipelinesData = await client.get<PipelinesResponse>("/crm/v3/pipelines/deals");
  const result: PipelineData[] = [];

  for (const pipeline of pipelinesData.results) {
    const stagesData = await client.get<StagesResponse>(
      `/crm/v3/pipelines/deals/${pipeline.id}/stages`
    );
    result.push({ pipeline, stages: stagesData.results });
  }

  return result;
}

/** Fetch all open deals with relevant properties including hs_date_entered_* for all stages */
export async function fetchOpenDeals(
  client: HubSpotClient,
  pipelines: PipelineData[],
): Promise<Record<string, unknown>[]> {
  // Collect all hs_date_entered_* property names
  const dateEnteredProps: string[] = [];
  for (const p of pipelines) {
    for (const s of p.stages) {
      dateEnteredProps.push(`hs_date_entered_${s.id}`);
    }
  }

  const baseProps = [
    "dealname", "amount", "closedate", "dealstage", "pipeline",
    "hubspot_owner_id", "createdate", "lastmodifieddate",
  ];
  const allProps = [...baseProps, ...dateEnteredProps];

  // Fetch open deals in batches using search (max 100 per page, paginate with after)
  const allDeals: Record<string, unknown>[] = [];
  let after: string | undefined;

  do {
    const body: Record<string, unknown> = {
      filterGroups: [
        {
          filters: [
            { propertyName: "hs_is_closed", operator: "EQ", value: "false" },
          ],
        },
      ],
      limit: 100,
      properties: allProps,
      sorts: [{ propertyName: "createdate", direction: "ASCENDING" }],
    };
    if (after) body.after = after;

    const res = await client.post<SearchResponse & { paging?: { next?: { after: string } } }>(
      "/crm/v3/objects/deals/search",
      body,
    );
    allDeals.push(...res.results);
    after = res.paging?.next?.after;
  } while (after);

  return allDeals;
}

/** Count total deals (all statuses) */
export async function countTotalDeals(client: HubSpotClient): Promise<number> {
  const res = await client.post<SearchResponse>("/crm/v3/objects/deals/search", {
    filterGroups: [],
    limit: 1,
    properties: [],
  });
  return res.total;
}

// ─── D-01 : Taux montant insuffisant (deals open) — Critique ─────────────

export function runD01(openDeals: Record<string, unknown>[]): RateResult {
  const threshold = 0.7;
  if (openDeals.length === 0) {
    return { rate: 1, filledCount: 0, totalCount: 0, threshold, triggered: false };
  }

  const filledCount = openDeals.filter((d) => {
    const props = d.properties as Record<string, string | null>;
    const amount = props.amount;
    return amount !== null && amount !== undefined && amount !== "" && parseFloat(amount) > 0;
  }).length;

  const rate = filledCount / openDeals.length;
  return { rate, filledCount, totalCount: openDeals.length, threshold, triggered: rate < threshold };
}

// ─── D-02 : Taux date de clôture insuffisant (deals open) — Critique ─────

export function runD02(openDeals: Record<string, unknown>[]): RateResult {
  const threshold = 0.7;
  if (openDeals.length === 0) {
    return { rate: 1, filledCount: 0, totalCount: 0, threshold, triggered: false };
  }

  const filledCount = openDeals.filter((d) => {
    const props = d.properties as Record<string, string | null>;
    return props.closedate !== null && props.closedate !== undefined && props.closedate !== "";
  }).length;

  const rate = filledCount / openDeals.length;
  return { rate, filledCount, totalCount: openDeals.length, threshold, triggered: rate < threshold };
}

// ─── D-03 : Deal open ancien 60j+ — Avertissement ────────────────────────

export function runD03(openDeals: Record<string, unknown>[]): DealDetailIssue[] {
  const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  return openDeals
    .filter((d) => {
      const props = d.properties as Record<string, string | null>;
      const createdAt = props.createdate;
      if (!createdAt) return false;
      return now - new Date(createdAt).getTime() > sixtyDaysMs;
    })
    .map((d) => toDealDetailIssue(d))
    .sort((a, b) => b.ageInDays - a.ageInDays);
}

// ─── D-04 : Propriétés obligatoires de stage manquantes — Critique ───────

export function runD04(
  openDeals: Record<string, unknown>[],
  pipelines: PipelineData[],
): PipelineStageIssue[] {
  const issues: PipelineStageIssue[] = [];

  // Build lookup: pipelineId+stageId → required properties
  const stageRequiredProps = new Map<string, { pipelineLabel: string; stageLabel: string; requiredProperties: string[] }>();
  for (const p of pipelines) {
    for (const s of p.stages) {
      const required = s.requiredProperties ?? [];
      if (required.length > 0) {
        stageRequiredProps.set(`${p.pipeline.id}:${s.id}`, {
          pipelineLabel: p.pipeline.label,
          stageLabel: s.label,
          requiredProperties: required,
        });
      }
    }
  }

  // Group deals by pipeline+stage
  const dealsByStage = new Map<string, Record<string, unknown>[]>();
  for (const d of openDeals) {
    const props = d.properties as Record<string, string | null>;
    const key = `${props.pipeline}:${props.dealstage}`;
    if (stageRequiredProps.has(key)) {
      const arr = dealsByStage.get(key) ?? [];
      arr.push(d);
      dealsByStage.set(key, arr);
    }
  }

  for (const [key, deals] of dealsByStage) {
    const meta = stageRequiredProps.get(key)!;
    const dealsWithMissing: DealDetailIssue[] = [];

    for (const d of deals) {
      const props = d.properties as Record<string, string | null>;
      const missing = meta.requiredProperties.filter((p) => !props[p] || props[p] === "");
      if (missing.length > 0) {
        const issue = toDealDetailIssue(d);
        issue.missingProperties = missing;
        dealsWithMissing.push(issue);
      }
    }

    if (dealsWithMissing.length > 0) {
      dealsWithMissing.sort((a, b) => b.ageInDays - a.ageInDays);
      issues.push({
        pipeline: meta.pipelineLabel,
        stage: meta.stageLabel,
        missingProperties: meta.requiredProperties,
        deals: dealsWithMissing.map((d) => ({
          id: d.id,
          name: d.name,
          pipeline: d.pipelineLabel,
          stage: d.stageLabel,
          createdAt: d.createdAt,
          ageInDays: d.ageInDays,
        })),
      });
    }
  }

  return issues;
}

// ─── D-05 : Deal bloqué dans un stage — Avertissement ────────────────────

export function runD05(
  openDeals: Record<string, unknown>[],
  pipelines: PipelineData[],
): BlockedDealGroup[] {
  const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  // Map pipeline → first stage id
  const firstStageByPipeline = new Map<string, string>();
  for (const p of pipelines) {
    const sorted = [...p.stages].sort((a, b) => a.displayOrder - b.displayOrder);
    if (sorted.length > 0) firstStageByPipeline.set(p.pipeline.id, sorted[0].id);
  }

  // Stage label lookup
  const stageLabels = new Map<string, string>();
  const pipelineLabels = new Map<string, string>();
  for (const p of pipelines) {
    pipelineLabels.set(p.pipeline.id, p.pipeline.label);
    for (const s of p.stages) stageLabels.set(s.id, s.label);
  }

  // Group blocked deals by pipeline+stage
  const groups = new Map<string, BlockedDealGroup>();

  for (const d of openDeals) {
    const props = d.properties as Record<string, string | null>;
    const pipelineId = props.pipeline ?? "";
    const stageId = props.dealstage ?? "";

    // Get date entered current stage
    const dateEnteredProp = props[`hs_date_entered_${stageId}`];
    const dateEntered = dateEnteredProp ? new Date(dateEnteredProp).getTime() : null;
    const fallback = props.lastmodifieddate ? new Date(props.lastmodifieddate).getTime() : null;
    const stageEntryTime = dateEntered ?? fallback;

    if (!stageEntryTime) continue;
    if (now - stageEntryTime <= sixtyDaysMs) continue;

    // Grace period: new deals in first stage
    const firstStage = firstStageByPipeline.get(pipelineId);
    if (stageId === firstStage) {
      const createdAt = props.createdate ? new Date(props.createdate).getTime() : 0;
      if (now - createdAt < sixtyDaysMs) continue;
    }

    const key = `${pipelineId}:${stageId}`;
    if (!groups.has(key)) {
      groups.set(key, {
        pipelineId,
        pipelineLabel: pipelineLabels.get(pipelineId) ?? pipelineId,
        stageId,
        stageLabel: stageLabels.get(stageId) ?? stageId,
        deals: [],
      });
    }

    const deal = toDealDetailIssue(d);
    deal.daysInStage = Math.floor((now - stageEntryTime) / (1000 * 60 * 60 * 24));
    deal.dateEnteredStage = dateEnteredProp ?? props.lastmodifieddate ?? null;
    groups.get(key)!.deals.push(deal);
  }

  // Sort deals within each group by days in stage descending
  const result = Array.from(groups.values());
  for (const group of result) {
    group.deals.sort((a, b) => (b.daysInStage ?? 0) - (a.daysInStage ?? 0));
  }

  return result;
}

// ─── D-08 : Deal open sans owner — Info ───────────────────────────────────

export function runD08(openDeals: Record<string, unknown>[]): DealDetailIssue[] {
  return openDeals
    .filter((d) => {
      const props = d.properties as Record<string, string | null>;
      return !props.hubspot_owner_id || props.hubspot_owner_id === "";
    })
    .map(toDealDetailIssue)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// ─── D-09 : Deal open sans contact associé — Avertissement ───────────────

export async function runD09(
  client: HubSpotClient,
  openDeals: Record<string, unknown>[],
): Promise<DealDetailIssue[]> {
  // Batch fetch associations deal → contacts
  const dealIds = openDeals.map((d) => d.id as string);
  const contactCounts = await batchGetAssociationCounts(client, dealIds, "contacts");

  return openDeals
    .filter((d) => (contactCounts.get(d.id as string) ?? 0) === 0)
    .map((d) => {
      const issue = toDealDetailIssue(d);
      issue.contactCount = 0;
      return issue;
    })
    .sort((a, b) => {
      // Sort by amount descending, null last
      if (a.amount === null && b.amount === null) return 0;
      if (a.amount === null) return 1;
      if (b.amount === null) return -1;
      return b.amount - a.amount;
    });
}

// ─── D-10 : Deal open sans company associée — Info ────────────────────────

export async function runD10(
  client: HubSpotClient,
  openDeals: Record<string, unknown>[],
  totalCompanies: number,
): Promise<{ disabled: boolean; disabledReason: string | null; deals: DealDetailIssue[] }> {
  if (totalCompanies === 0) {
    return { disabled: true, disabledReason: "Aucune company détectée dans ce workspace", deals: [] };
  }

  const dealIds = openDeals.map((d) => d.id as string);
  const companyCounts = await batchGetAssociationCounts(client, dealIds, "companies");

  const deals = openDeals
    .filter((d) => (companyCounts.get(d.id as string) ?? 0) === 0)
    .map((d) => {
      const issue = toDealDetailIssue(d);
      issue.companyCount = 0;
      return issue;
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return { disabled: false, disabledReason: null, deals };
}

// ─── D-11 : Deal open avec montant à 0 — Avertissement ───────────────────

export function runD11(openDeals: Record<string, unknown>[]): DealDetailIssue[] {
  return openDeals
    .filter((d) => {
      const props = d.properties as Record<string, string | null>;
      const amount = props.amount;
      return amount !== null && amount !== undefined && amount !== "" && parseFloat(amount) === 0;
    })
    .map(toDealDetailIssue)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function toDealDetailIssue(d: Record<string, unknown>): DealDetailIssue {
  const props = d.properties as Record<string, string | null>;
  const createdAt = props.createdate ?? "";
  const ageInDays = createdAt
    ? Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    id: d.id as string,
    name: props.dealname ?? `Deal ${d.id}`,
    pipeline: props.pipeline ?? "",
    pipelineLabel: props.pipeline ?? "",
    stage: props.dealstage ?? "",
    stageLabel: props.dealstage ?? "",
    amount: props.amount !== null && props.amount !== undefined && props.amount !== ""
      ? parseFloat(props.amount)
      : null,
    closedate: props.closedate ?? null,
    ownerId: props.hubspot_owner_id ?? null,
    createdAt,
    lastModifiedDate: props.lastmodifieddate ?? null,
    ageInDays,
  };
}

/** Batch fetch association counts for a list of deal IDs → target object type */
async function batchGetAssociationCounts(
  client: HubSpotClient,
  dealIds: string[],
  targetType: "contacts" | "companies",
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (dealIds.length === 0) return counts;

  // Process in batches of 100
  for (let i = 0; i < dealIds.length; i += 100) {
    const batch = dealIds.slice(i, i + 100);
    try {
      const res = await client.post<{
        results: { from: { id: string }; to: { id: string }[] }[];
      }>("/crm/v4/associations/deals/" + targetType + "/batch/read", {
        inputs: batch.map((id) => ({ id })),
      });
      for (const item of res.results) {
        counts.set(item.from.id, (item.to ?? []).length);
      }
    } catch {
      // If batch associations fail, assume 0 for missing
    }

    // Set 0 for deals not in response
    for (const id of batch) {
      if (!counts.has(id)) counts.set(id, 0);
    }
  }

  return counts;
}
