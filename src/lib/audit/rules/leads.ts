import { HubSpotClient } from "@/lib/hubspot/api-client";
import {
  LeadIssue,
  LeadBlockedGroup,
  LeadDisqualificationResult,
  LeadDisqualificationPropertyResult,
  LeadHandoffResult,
} from "@/lib/audit/types";
import type { LeadPipelineData } from "./lead-pipelines";

interface SearchResponse {
  total: number;
  results: Record<string, unknown>[];
  paging?: { next?: { after: string } };
}

interface LeadPipelineStage {
  id: string;
  label: string;
  displayOrder: number;
  metadata?: {
    probability?: string;
    isClosed?: string;
  };
}

// ─── Shared data fetching ─────────────────────────────────────────────────

/** Fetch all lead pipelines and their stages */
export async function fetchLeadPipelines(client: HubSpotClient): Promise<LeadPipelineData[]> {
  const pipelinesData = await client.get<{ results: { id: string; label: string; stages: LeadPipelineStage[] }[] }>("/crm/v3/pipelines/leads");
  const result: LeadPipelineData[] = [];

  for (const pipeline of pipelinesData.results) {
    const stagesData = await client.get<{ results: LeadPipelineStage[] }>(
      `/crm/v3/pipelines/leads/${pipeline.id}/stages`
    );
    result.push({ pipeline, stages: stagesData.results });
  }

  return result;
}

/** Fetch all open leads with relevant properties including hs_date_entered_* for all stages */
export async function fetchOpenLeads(
  client: HubSpotClient,
  pipelines: LeadPipelineData[],
): Promise<Record<string, unknown>[]> {
  // Collect all hs_date_entered_* property names
  const dateEnteredProps: string[] = [];
  for (const p of pipelines) {
    for (const s of p.stages) {
      dateEnteredProps.push(`hs_date_entered_${s.id}`);
    }
  }

  const baseProps = [
    "hs_lead_label", "hs_lead_status", "hs_pipeline", "hs_pipeline_stage",
    "hubspot_owner_id", "createdate", "lastmodifieddate",
    "hs_analytics_source", "hs_lead_disqualification_reason",
  ];
  const allProps = [...baseProps, ...dateEnteredProps];

  const allLeads: Record<string, unknown>[] = [];
  let after: string | undefined;

  do {
    const body: Record<string, unknown> = {
      filterGroups: [
        {
          filters: [
            { propertyName: "hs_lead_status", operator: "EQ", value: "OPEN" },
          ],
        },
      ],
      limit: 100,
      properties: allProps,
      sorts: [{ propertyName: "createdate", direction: "ASCENDING" }],
    };
    if (after) body.after = after;

    const res = await client.post<SearchResponse>(
      "/crm/v3/objects/leads/search",
      body,
    );
    allLeads.push(...res.results);
    after = res.paging?.next?.after;
  } while (after);

  return allLeads;
}

/** Fetch leads in specific stages (for L-11, L-13 — includes non-open leads) */
export async function fetchLeadsInStages(
  client: HubSpotClient,
  stageIds: string[],
  pipelines: LeadPipelineData[],
): Promise<Record<string, unknown>[]> {
  if (stageIds.length === 0) return [];

  const dateEnteredProps: string[] = [];
  for (const p of pipelines) {
    for (const s of p.stages) {
      dateEnteredProps.push(`hs_date_entered_${s.id}`);
    }
  }

  const baseProps = [
    "hs_lead_label", "hs_lead_status", "hs_pipeline", "hs_pipeline_stage",
    "hubspot_owner_id", "createdate", "lastmodifieddate",
    "hs_analytics_source", "hs_lead_disqualification_reason",
  ];
  const allProps = [...baseProps, ...dateEnteredProps];

  const allLeads: Record<string, unknown>[] = [];

  // Fetch in batches per stage (search API supports OR via multiple filterGroups)
  // But to avoid huge filterGroups, do it per stage
  for (const stageId of stageIds) {
    let after: string | undefined;
    do {
      const body: Record<string, unknown> = {
        filterGroups: [
          {
            filters: [
              { propertyName: "hs_pipeline_stage", operator: "EQ", value: stageId },
            ],
          },
        ],
        limit: 100,
        properties: allProps,
        sorts: [{ propertyName: "createdate", direction: "ASCENDING" }],
      };
      if (after) body.after = after;

      const res = await client.post<SearchResponse>(
        "/crm/v3/objects/leads/search",
        body,
      );
      allLeads.push(...res.results);
      after = res.paging?.next?.after;
    } while (after);
  }

  // Deduplicate by lead ID (a lead could match multiple stage searches theoretically)
  const seen = new Set<string>();
  return allLeads.filter((l) => {
    const id = l.id as string;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/** Count total leads (all statuses) */
export async function countTotalLeads(client: HubSpotClient): Promise<number> {
  const res = await client.post<SearchResponse>("/crm/v3/objects/leads/search", {
    filterGroups: [],
    limit: 1,
    properties: [],
  });
  return res.total;
}

/** Fetch lead properties schema (for L-12) */
export async function fetchLeadProperties(client: HubSpotClient): Promise<{ name: string; label: string; type: string; fieldType: string }[]> {
  const res = await client.get<{ results: { name: string; label: string; type: string; fieldType: string }[] }>("/crm/v3/properties/leads");
  return res.results;
}

// ─── L-01 : Lead ouvert ancien 30j+ — Avertissement ─────────────────────

export function runL01(openLeads: Record<string, unknown>[]): LeadIssue[] {
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  return openLeads
    .filter((l) => {
      const props = l.properties as Record<string, string | null>;
      const createdAt = props.createdate;
      if (!createdAt) return false;
      return now - new Date(createdAt).getTime() > thirtyDaysMs;
    })
    .map((l) => toLeadIssue(l))
    .sort((a, b) => b.ageInDays - a.ageInDays);
}

// ─── L-02 : Lead bloqué dans un stage 30j+ — Avertissement ──────────────

export function runL02(
  openLeads: Record<string, unknown>[],
  pipelines: LeadPipelineData[],
): LeadBlockedGroup[] {
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  // Map pipeline → first stage id
  const firstStageByPipeline = new Map<string, string>();
  for (const p of pipelines) {
    const sorted = [...p.stages].sort((a, b) => a.displayOrder - b.displayOrder);
    if (sorted.length > 0) firstStageByPipeline.set(p.pipeline.id, sorted[0].id);
  }

  // Stage/pipeline label lookup
  const stageLabels = new Map<string, string>();
  const pipelineLabels = new Map<string, string>();
  for (const p of pipelines) {
    pipelineLabels.set(p.pipeline.id, p.pipeline.label);
    for (const s of p.stages) stageLabels.set(s.id, s.label);
  }

  const groups = new Map<string, LeadBlockedGroup>();

  for (const l of openLeads) {
    const props = l.properties as Record<string, string | null>;
    const pipelineId = props.hs_pipeline ?? "";
    const stageId = props.hs_pipeline_stage ?? "";

    // Get date entered current stage
    const dateEnteredProp = props[`hs_date_entered_${stageId}`];
    const dateEntered = dateEnteredProp ? new Date(dateEnteredProp).getTime() : null;
    const fallback = props.lastmodifieddate ? new Date(props.lastmodifieddate).getTime() : null;
    const stageEntryTime = dateEntered ?? fallback;

    if (!stageEntryTime) continue;
    if (now - stageEntryTime <= thirtyDaysMs) continue;

    // Grace period: new leads in first stage
    const firstStage = firstStageByPipeline.get(pipelineId);
    if (stageId === firstStage) {
      const createdAt = props.createdate ? new Date(props.createdate).getTime() : 0;
      if (now - createdAt < thirtyDaysMs) continue;
    }

    const key = `${pipelineId}:${stageId}`;
    if (!groups.has(key)) {
      groups.set(key, {
        pipelineId,
        pipelineLabel: pipelineLabels.get(pipelineId) ?? pipelineId,
        stageId,
        stageLabel: stageLabels.get(stageId) ?? stageId,
        leads: [],
      });
    }

    const lead = toLeadIssue(l);
    lead.daysInStage = Math.floor((now - stageEntryTime) / (1000 * 60 * 60 * 24));
    lead.dateEnteredStage = dateEnteredProp ?? props.lastmodifieddate ?? null;
    groups.get(key)!.leads.push(lead);
  }

  const result = Array.from(groups.values());
  for (const group of result) {
    group.leads.sort((a, b) => (b.daysInStage ?? 0) - (a.daysInStage ?? 0));
  }

  return result;
}

// ─── L-03 : Lead sans propriétaire — Info ────────────────────────────────

export function runL03(openLeads: Record<string, unknown>[]): LeadIssue[] {
  return openLeads
    .filter((l) => {
      const props = l.properties as Record<string, string | null>;
      return !props.hubspot_owner_id || props.hubspot_owner_id === "";
    })
    .map(toLeadIssue)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// ─── L-04 : Lead sans contact associé — Critique ─────────────────────────

export async function runL04(
  client: HubSpotClient,
  openLeads: Record<string, unknown>[],
): Promise<LeadIssue[]> {
  const leadIds = openLeads.map((l) => l.id as string);
  const contactCounts = await batchGetLeadAssociationCounts(client, leadIds, "contacts");

  return openLeads
    .filter((l) => (contactCounts.get(l.id as string) ?? 0) === 0)
    .map((l) => {
      const issue = toLeadIssue(l);
      issue.contactCount = 0;
      return issue;
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// ─── L-11 : Lead disqualifié sans motif — Avertissement ──────────────────

export function runL11(
  disqualifiedLeads: Record<string, unknown>[],
): LeadDisqualificationResult {
  const withoutReason = disqualifiedLeads.filter((l) => {
    const props = l.properties as Record<string, string | null>;
    const reason = props.hs_lead_disqualification_reason;
    return !reason || reason.trim() === "";
  });

  return {
    triggered: withoutReason.length > 0,
    totalDisqualified: disqualifiedLeads.length,
    withoutReason: withoutReason.length,
    rate: disqualifiedLeads.length > 0 ? withoutReason.length / disqualifiedLeads.length : 0,
    leads: withoutReason
      .map(toLeadIssue)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  };
}

// ─── L-12 : Motif de disqualification non structuré — Info ───────────────

export function runL12(
  leadProperties: { name: string; label: string; type: string; fieldType: string }[],
): LeadDisqualificationPropertyResult {
  // Try native property first
  const nativeProp = leadProperties.find((p) => p.name === "hs_lead_disqualification_reason");

  if (nativeProp) {
    const isStructured = nativeProp.type === "enumeration" || nativeProp.fieldType === "select" || nativeProp.fieldType === "radio";
    return {
      triggered: !isStructured,
      disabled: false,
      disabledReason: null,
      propertyName: nativeProp.name,
      propertyType: nativeProp.type,
    };
  }

  // Fallback: search custom properties
  const keywords = ["disqualification", "raison", "reason", "motif"];
  const customProp = leadProperties.find((p) =>
    keywords.some((kw) => p.label.toLowerCase().includes(kw))
  );

  if (customProp) {
    const isStructured = customProp.type === "enumeration" || customProp.fieldType === "select" || customProp.fieldType === "radio";
    return {
      triggered: !isStructured,
      disabled: false,
      disabledReason: null,
      propertyName: customProp.name,
      propertyType: customProp.type,
    };
  }

  // No property found
  return {
    triggered: false,
    disabled: true,
    disabledReason: "Propriété de disqualification non identifiée",
    propertyName: null,
    propertyType: null,
  };
}

// ─── L-13 : Lead qualifié/converti sans deal — Critique ──────────────────

export async function runL13(
  client: HubSpotClient,
  qualifiedLeads: Record<string, unknown>[],
): Promise<LeadHandoffResult> {
  if (qualifiedLeads.length === 0) {
    return { triggered: false, totalQualified: 0, withoutDeal: 0, rate: 0, leads: [] };
  }

  const leadIds = qualifiedLeads.map((l) => l.id as string);
  const dealCounts = await batchGetLeadAssociationCounts(client, leadIds, "deals");

  const withoutDeal = qualifiedLeads.filter((l) => (dealCounts.get(l.id as string) ?? 0) === 0);

  return {
    triggered: withoutDeal.length > 0,
    totalQualified: qualifiedLeads.length,
    withoutDeal: withoutDeal.length,
    rate: qualifiedLeads.length > 0 ? withoutDeal.length / qualifiedLeads.length : 0,
    leads: withoutDeal
      .map((l) => {
        const issue = toLeadIssue(l);
        issue.dealCount = 0;
        return issue;
      })
      // Sort by date of qualification descending (most recent = most actionable)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  };
}

// ─── L-14 : Lead sans source — Avertissement ─────────────────────────────

export function runL14(openLeads: Record<string, unknown>[]): LeadIssue[] {
  return openLeads
    .filter((l) => {
      const props = l.properties as Record<string, string | null>;
      const source = props.hs_analytics_source;
      return !source || source.trim() === "";
    })
    .map(toLeadIssue)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function toLeadIssue(l: Record<string, unknown>): LeadIssue {
  const props = l.properties as Record<string, string | null>;
  const createdAt = props.createdate ?? "";
  const ageInDays = createdAt
    ? Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    id: l.id as string,
    name: props.hs_lead_label ?? `Lead ${l.id}`,
    pipeline: props.hs_pipeline ?? "",
    pipelineLabel: props.hs_pipeline ?? "",
    stage: props.hs_pipeline_stage ?? "",
    stageLabel: props.hs_pipeline_stage ?? "",
    ownerId: props.hubspot_owner_id ?? null,
    createdAt,
    lastModifiedDate: props.lastmodifieddate ?? null,
    ageInDays,
    source: props.hs_analytics_source ?? null,
    disqualificationReason: props.hs_lead_disqualification_reason ?? null,
  };
}

/** Batch fetch association counts for leads → target object type */
async function batchGetLeadAssociationCounts(
  client: HubSpotClient,
  leadIds: string[],
  targetType: "contacts" | "deals",
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (leadIds.length === 0) return counts;

  for (let i = 0; i < leadIds.length; i += 100) {
    const batch = leadIds.slice(i, i + 100);
    try {
      const res = await client.post<{
        results: { from: { id: string }; to: { id: string }[] }[];
      }>(`/crm/v4/associations/leads/${targetType}/batch/read`, {
        inputs: batch.map((id) => ({ id })),
      });
      for (const item of res.results) {
        counts.set(item.from.id, (item.to ?? []).length);
      }
    } catch {
      // If batch associations fail, assume 0 for missing
    }

    for (const id of batch) {
      if (!counts.has(id)) counts.set(id, 0);
    }
  }

  return counts;
}

/** Enrich lead issues with pipeline/stage labels */
export function enrichLeadLabels(
  leads: LeadIssue[],
  pipelines: LeadPipelineData[],
): LeadIssue[] {
  const pipelineLabels = new Map<string, string>();
  const stageLabels = new Map<string, string>();
  for (const p of pipelines) {
    pipelineLabels.set(p.pipeline.id, p.pipeline.label);
    for (const s of p.stages) stageLabels.set(s.id, s.label);
  }

  return leads.map((l) => ({
    ...l,
    pipelineLabel: pipelineLabels.get(l.pipeline) ?? l.pipeline,
    stageLabel: stageLabels.get(l.stage) ?? l.stage,
  }));
}
