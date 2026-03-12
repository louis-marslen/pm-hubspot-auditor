import { HubSpotClient } from "@/lib/hubspot/api-client";
import { PropertyIssue, PropertyPair, TypingIssue } from "@/lib/audit/types";

// Groupes par défaut HubSpot à ignorer pour P5
const DEFAULT_GROUPS: Record<string, string> = {
  contacts: "contactinformation",
  companies: "companyinformation",
  deals: "dealinformation",
};

interface HubSpotProperty {
  name: string;
  label: string;
  type: string;
  fieldType: string;
  groupName: string;
  description: string;
  createdAt: string;
  hubspotDefined: boolean;
  calculated: boolean;
  externalOptions: boolean;
}

interface PropertiesResponse {
  results: HubSpotProperty[];
}

interface SearchResponse {
  total: number;
  results: { id: string; createdAt: string }[];
}

/** Récupère les propriétés custom (non natives HubSpot) d'un type d'objet. */
export async function getCustomProperties(
  client: HubSpotClient,
  objectType: string
): Promise<HubSpotProperty[]> {
  const data = await client.get<PropertiesResponse>(
    `/crm/v3/properties/${objectType}?dataSensitivity=non_sensitive`
  );
  return data.results.filter((p) => !p.hubspotDefined && !p.calculated);
}

/** Calcule le fill rate de chaque propriété via l'API Search. */
export async function computeFillRates(
  client: HubSpotClient,
  objectType: string,
  properties: HubSpotProperty[],
  totalCount: number
): Promise<Map<string, { fillRate: number; filledCount: number }>> {
  const map = new Map<string, { fillRate: number; filledCount: number }>();

  if (totalCount === 0) {
    for (const p of properties) {
      map.set(p.name, { fillRate: 0, filledCount: 0 });
    }
    return map;
  }

  await client.batch(properties, async (prop) => {
    const res = await client.post<SearchResponse>(
      `/crm/v3/objects/${objectType}/search`,
      {
        filterGroups: [
          {
            filters: [
              { propertyName: prop.name, operator: "HAS_PROPERTY" },
            ],
          },
        ],
        limit: 1,
        properties: [],
      }
    );
    const filledCount = res.total;
    map.set(prop.name, {
      filledCount,
      fillRate: filledCount / totalCount,
    });
    return res;
  });

  return map;
}

/**
 * P1 : Propriétés custom créées il y a > 90j avec 0 enregistrement renseigné.
 * Criticité : critique
 */
export function runP1(
  properties: HubSpotProperty[],
  fillRates: Map<string, { fillRate: number; filledCount: number }>,
  objectType: string
): PropertyIssue[] {
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  return properties
    .filter((p) => {
      const age = new Date(p.createdAt).getTime();
      const rate = fillRates.get(p.name);
      return age < ninetyDaysAgo && rate?.filledCount === 0;
    })
    .map((p) => ({
      label: p.label,
      name: p.name,
      objectType,
      groupName: p.groupName,
      description: p.description,
      createdAt: p.createdAt,
      fillRate: 0,
      filledCount: 0,
    }));
}

/**
 * P2 : Propriétés custom créées il y a > 90j avec fill rate entre 0% et 5% exclus.
 * Criticité : avertissement
 */
export function runP2(
  properties: HubSpotProperty[],
  fillRates: Map<string, { fillRate: number; filledCount: number }>,
  totalCount: number,
  objectType: string
): PropertyIssue[] {
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  return properties
    .filter((p) => {
      const age = new Date(p.createdAt).getTime();
      const rate = fillRates.get(p.name);
      return (
        age < ninetyDaysAgo &&
        rate !== undefined &&
        rate.filledCount > 0 &&
        rate.fillRate < 0.05
      );
    })
    .map((p) => {
      const rate = fillRates.get(p.name)!;
      return {
        label: p.label,
        name: p.name,
        objectType,
        groupName: p.groupName,
        description: p.description,
        createdAt: p.createdAt,
        fillRate: rate.fillRate,
        filledCount: rate.filledCount,
        totalCount,
      };
    });
}

// Distance de Levenshtein entre deux chaînes
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a.toLowerCase(), b.toLowerCase()) / maxLen;
}

/**
 * P3 : Paires de propriétés avec labels très similaires (> 80%) dans le même objet.
 * Criticité : avertissement
 */
export function runP3(
  properties: HubSpotProperty[],
  objectType: string
): PropertyPair[] {
  const pairs: PropertyPair[] = [];
  for (let i = 0; i < properties.length; i++) {
    for (let j = i + 1; j < properties.length; j++) {
      const sim = similarity(properties[i].label, properties[j].label);
      if (sim > 0.8) {
        pairs.push({
          a: { label: properties[i].label, name: properties[i].name, objectType },
          b: { label: properties[j].label, name: properties[j].name, objectType },
          similarity: Math.round(sim * 100) / 100,
        });
      }
    }
  }
  return pairs;
}

/**
 * P4 : Propriétés custom sans description.
 * Criticité : info
 */
export function runP4(properties: HubSpotProperty[], objectType: string): PropertyIssue[] {
  return properties
    .filter((p) => !p.description || p.description.trim() === "")
    .map((p) => ({
      label: p.label,
      name: p.name,
      objectType,
      groupName: p.groupName,
      description: p.description,
    }));
}

/**
 * P5 : Propriétés dans le groupe par défaut HubSpot (non organisées).
 * Criticité : info
 */
export function runP5(properties: HubSpotProperty[], objectType: string): PropertyIssue[] {
  const defaultGroup = DEFAULT_GROUPS[objectType] ?? "";
  return properties
    .filter((p) => !p.groupName || p.groupName === defaultGroup)
    .map((p) => ({
      label: p.label,
      name: p.name,
      objectType,
      groupName: p.groupName,
    }));
}

// Patterns pour détecter un mauvais typage (P6)
const TYPING_PATTERNS: Array<{
  labelPattern: RegExp;
  namePattern: RegExp;
  expectedType: string;
  suggestedType: string;
  reason: string;
}> = [
  {
    labelPattern: /date|Date|DATE/,
    namePattern: /date|_at|_on/i,
    expectedType: "string",
    suggestedType: "date",
    reason: "Le nom ou label suggère une date, mais la propriété est de type texte",
  },
  {
    labelPattern: /montant|amount|prix|price|revenu|revenue|chiffre/i,
    namePattern: /amount|price|revenue|montant|chiffre/i,
    expectedType: "string",
    suggestedType: "number",
    reason: "Le nom ou label suggère un montant, mais la propriété est de type texte",
  },
  {
    labelPattern: /nombre|count|total|nb_|num_/i,
    namePattern: /count|total|nb_|num_/i,
    expectedType: "string",
    suggestedType: "number",
    reason: "Le nom ou label suggère un nombre, mais la propriété est de type texte",
  },
];

/**
 * P6 : Propriétés dont le type semble inadapté au contenu (ex: date stockée en texte).
 * Criticité : avertissement
 */
export function runP6(properties: HubSpotProperty[], objectType: string): TypingIssue[] {
  const issues: TypingIssue[] = [];
  for (const p of properties) {
    if (p.type !== "string") continue; // On ne vérifie que les propriétés texte
    for (const pattern of TYPING_PATTERNS) {
      if (
        (pattern.labelPattern.test(p.label) || pattern.namePattern.test(p.name)) &&
        p.type === pattern.expectedType
      ) {
        issues.push({
          label: p.label,
          name: p.name,
          objectType,
          groupName: p.groupName,
          currentType: p.type,
          suggestedType: pattern.suggestedType,
          reason: pattern.reason,
        });
        break; // Une seule règle par propriété
      }
    }
  }
  return issues;
}
