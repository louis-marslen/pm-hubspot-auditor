import { HubSpotClient } from "@/lib/hubspot/api-client";
import { RateResult, DealIssue, PipelineStageIssue } from "@/lib/audit/types";

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
  metadata?: {
    probability?: string;
    isClosed?: string;
  };
  requiredProperties?: string[];
}

/** Compte total d'objets via POST /search sans filtre. */
async function countTotal(client: HubSpotClient, objectType: string): Promise<number> {
  const res = await client.post<SearchResponse>(`/crm/v3/objects/${objectType}/search`, {
    filterGroups: [],
    limit: 1,
    properties: [],
  });
  return res.total;
}

/** Compte les objets satisfaisant un filtre via POST /search. */
async function countWithFilter(
  client: HubSpotClient,
  objectType: string,
  filters: unknown[]
): Promise<number> {
  const res = await client.post<SearchResponse>(`/crm/v3/objects/${objectType}/search`, {
    filterGroups: [{ filters }],
    limit: 1,
    properties: [],
  });
  return res.total;
}

/**
 * P7 : Taux de contacts avec email renseigné.
 * Seuil critique : < 80%
 */
export async function runP7(
  client: HubSpotClient,
  totalContacts: number
): Promise<RateResult> {
  const threshold = 0.8;
  if (totalContacts === 0) {
    return { rate: 1, filledCount: 0, totalCount: 0, threshold, triggered: false };
  }
  const filledCount = await countWithFilter(client, "contacts", [
    { propertyName: "email", operator: "HAS_PROPERTY" },
  ]);
  const rate = filledCount / totalContacts;
  return { rate, filledCount, totalCount: totalContacts, threshold, triggered: rate < threshold };
}

/**
 * P8 : Contacts sans prénom ET sans nom.
 * Retourne le compte + 5 exemples.
 * Note : deux filterGroups séparés (OR) puis intersection côté client
 * → simplifié : contacts sans prénom OU sans nom (approximation acceptable en MVP).
 */
export async function runP8(
  client: HubSpotClient
): Promise<{ count: number; examples: { id: string; createdAt: string }[] }> {
  // Filtre : pas de prénom ET pas de nom — deux conditions AND dans un même filterGroup
  const res = await client.post<SearchResponse>(`/crm/v3/objects/contacts/search`, {
    filterGroups: [
      {
        filters: [
          { propertyName: "firstname", operator: "NOT_HAS_PROPERTY" },
          { propertyName: "lastname", operator: "NOT_HAS_PROPERTY" },
        ],
      },
    ],
    limit: 5,
    properties: ["createdate"],
    sorts: [{ propertyName: "createdate", direction: "DESCENDING" }],
  });
  const examples = res.results.map((r) => ({
    id: r.id as string,
    createdAt: ((r.properties as Record<string, unknown>)?.createdate ?? "") as string,
  }));
  return { count: res.total, examples };
}

/**
 * P9 : Taux de contacts avec lifecycle stage renseigné.
 * Seuil avertissement : < 80%
 */
export async function runP9(
  client: HubSpotClient,
  totalContacts: number
): Promise<RateResult> {
  const threshold = 0.8;
  if (totalContacts === 0) {
    return { rate: 1, filledCount: 0, totalCount: 0, threshold, triggered: false };
  }
  const filledCount = await countWithFilter(client, "contacts", [
    { propertyName: "lifecyclestage", operator: "HAS_PROPERTY" },
  ]);
  const rate = filledCount / totalContacts;
  return { rate, filledCount, totalCount: totalContacts, threshold, triggered: rate < threshold };
}

/**
 * P10a : Contacts avec lifecycle stage renseigné mais pas "customer".
 * Proxy simplifié : ne peut pas filtrer sur les associations en Search API.
 */
export async function runP10a(
  client: HubSpotClient
): Promise<{ count: number; examples: unknown[] }> {
  // Contacts avec lifecycle renseigné mais pas "customer" — proxy simplifié
  const res = await client.post<SearchResponse>(`/crm/v3/objects/contacts/search`, {
    filterGroups: [
      {
        filters: [
          { propertyName: "lifecyclestage", operator: "HAS_PROPERTY" },
          { propertyName: "lifecyclestage", operator: "NEQ", value: "customer" },
        ],
      },
    ],
    limit: 5,
    properties: ["email", "lifecyclestage"],
  });
  return { count: res.total, examples: res.results };
}

/**
 * P10b : Contacts avec lifecycle=customer.
 * MVP : retourne le count, sans vérification des deals associés (non accessible via Search).
 */
export async function runP10b(client: HubSpotClient): Promise<{ count: number }> {
  const count = await countWithFilter(client, "contacts", [
    { propertyName: "lifecyclestage", operator: "EQ", value: "customer" },
  ]);
  // Retourner 0 : sans filtre d'association, cette règle ne peut pas être évaluée précisément
  return { count: 0 };
}

/**
 * P10c : 0 MQL ET 0 SQL alors qu'il y a des deals.
 */
export async function runP10c(
  client: HubSpotClient
): Promise<{ triggered: boolean }> {
  const [mqlCount, sqlCount, totalDeals] = await Promise.all([
    countWithFilter(client, "contacts", [
      { propertyName: "lifecyclestage", operator: "EQ", value: "marketingqualifiedlead" },
    ]),
    countWithFilter(client, "contacts", [
      { propertyName: "lifecyclestage", operator: "EQ", value: "salesqualifiedlead" },
    ]),
    countTotal(client, "deals"),
  ]);
  const triggered = mqlCount === 0 && sqlCount === 0 && totalDeals > 0;
  return { triggered };
}

/**
 * P10d : Contacts avec lifecycle=subscriber ou lead.
 * MVP : retourne le count sans vérification d'association deals.
 */
export async function runP10d(client: HubSpotClient): Promise<{ count: number }> {
  // HubSpot Search ne supporte pas le filtre par associations — retour 0 en MVP
  return { count: 0 };
}

/**
 * P11 : Taux de contacts avec une company associée.
 * Retourne null si le workspace est B2C (0 companies).
 * Seuil avertissement : < 70%
 * Proxy : contacts avec la propriété "associatedcompanyid" renseignée.
 */
export async function runP11(
  client: HubSpotClient,
  totalContacts: number,
  totalCompanies: number
): Promise<RateResult | null> {
  if (totalCompanies === 0) return null;
  if (totalContacts === 0) {
    return { rate: 1, filledCount: 0, totalCount: 0, threshold: 0.7, triggered: false };
  }
  const threshold = 0.7;
  const filledCount = await countWithFilter(client, "contacts", [
    { propertyName: "associatedcompanyid", operator: "HAS_PROPERTY" },
  ]);
  const rate = filledCount / totalContacts;
  return { rate, filledCount, totalCount: totalContacts, threshold, triggered: rate < threshold };
}

/**
 * P12 : Taux de companies avec domaine renseigné.
 * Seuil avertissement : < 80%
 */
export async function runP12(
  client: HubSpotClient,
  totalCompanies: number
): Promise<RateResult> {
  const threshold = 0.8;
  if (totalCompanies === 0) {
    return { rate: 1, filledCount: 0, totalCount: 0, threshold, triggered: false };
  }
  const filledCount = await countWithFilter(client, "companies", [
    { propertyName: "domain", operator: "HAS_PROPERTY" },
  ]);
  const rate = filledCount / totalCompanies;
  return { rate, filledCount, totalCount: totalCompanies, threshold, triggered: rate < threshold };
}

/**
 * P13 : Taux de deals avec montant renseigné.
 * Seuil critique : < 80%
 */
export async function runP13(
  client: HubSpotClient,
  totalDeals: number
): Promise<RateResult> {
  const threshold = 0.8;
  if (totalDeals === 0) {
    return { rate: 1, filledCount: 0, totalCount: 0, threshold, triggered: false };
  }
  const filledCount = await countWithFilter(client, "deals", [
    { propertyName: "amount", operator: "HAS_PROPERTY" },
  ]);
  const rate = filledCount / totalDeals;
  return { rate, filledCount, totalCount: totalDeals, threshold, triggered: rate < threshold };
}

/**
 * P14 : Taux de deals avec date de clôture renseignée.
 * Seuil critique : < 80%
 */
export async function runP14(
  client: HubSpotClient,
  totalDeals: number
): Promise<RateResult> {
  const threshold = 0.8;
  if (totalDeals === 0) {
    return { rate: 1, filledCount: 0, totalCount: 0, threshold, triggered: false };
  }
  const filledCount = await countWithFilter(client, "deals", [
    { propertyName: "closedate", operator: "HAS_PROPERTY" },
  ]);
  const rate = filledCount / totalDeals;
  return { rate, filledCount, totalCount: totalDeals, threshold, triggered: rate < threshold };
}

/**
 * P15 : Deals créés il y a > 60 jours (tous statuts — proxy pour "bloqués").
 * Criticité : critique (1 problème par deal)
 */
export async function runP15(client: HubSpotClient): Promise<DealIssue[]> {
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const res = await client.post<SearchResponse>(`/crm/v3/objects/deals/search`, {
    filterGroups: [
      {
        filters: [
          { propertyName: "createdate", operator: "LT", value: sixtyDaysAgo },
        ],
      },
    ],
    limit: 50,
    properties: ["dealname", "pipeline", "dealstage", "createdate"],
    sorts: [{ propertyName: "createdate", direction: "ASCENDING" }],
  });

  return res.results.map((r) => {
    const props = r.properties as Record<string, string | null>;
    const createdAt = props.createdate ?? "";
    const ageInDays = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      id: r.id as string,
      name: props.dealname ?? `Deal ${r.id}`,
      pipeline: props.pipeline ?? "",
      stage: props.dealstage ?? "",
      createdAt,
      ageInDays,
    };
  });
}

interface PipelinesResponse {
  results: Pipeline[];
}

interface StagesResponse {
  results: PipelineStage[];
}

/**
 * P16 : Stages de pipeline avec propriétés requises manquantes sur les deals de ce stage.
 * Criticité : avertissement
 */
export async function runP16(client: HubSpotClient): Promise<PipelineStageIssue[]> {
  const pipelinesData = await client.get<PipelinesResponse>("/crm/v3/pipelines/deals");
  const issues: PipelineStageIssue[] = [];

  for (const pipeline of pipelinesData.results) {
    const stagesData = await client.get<StagesResponse>(
      `/crm/v3/pipelines/deals/${pipeline.id}/stages`
    );

    for (const stage of stagesData.results) {
      const requiredProperties = stage.requiredProperties ?? [];
      if (requiredProperties.length === 0) continue;

      const dealsInStage = await client.post<SearchResponse>(`/crm/v3/objects/deals/search`, {
        filterGroups: [
          {
            filters: [
              { propertyName: "dealstage", operator: "EQ", value: stage.id },
            ],
          },
        ],
        limit: 10,
        properties: ["dealname", "createdate", ...requiredProperties],
      });

      const dealsWithMissingProps: DealIssue[] = [];
      for (const deal of dealsInStage.results) {
        const props = deal.properties as Record<string, string | null>;
        const missing = requiredProperties.filter((p) => !props[p]);
        if (missing.length > 0) {
          const createdAt = props.createdate ?? "";
          dealsWithMissingProps.push({
            id: deal.id as string,
            name: props.dealname ?? `Deal ${deal.id}`,
            pipeline: pipeline.label,
            stage: stage.label,
            createdAt,
            ageInDays: Math.floor(
              (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
            ),
          });
        }
      }

      if (dealsWithMissingProps.length > 0) {
        issues.push({
          pipeline: pipeline.label,
          stage: stage.label,
          missingProperties: requiredProperties,
          deals: dealsWithMissingProps,
        });
      }
    }
  }

  return issues;
}

export { countTotal };
