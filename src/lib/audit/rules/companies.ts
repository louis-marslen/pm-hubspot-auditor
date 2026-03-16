import { HubSpotClient } from "@/lib/hubspot/api-client";
import { RateResult, CompanyIssue, CompanyDuplicateCluster } from "@/lib/audit/types";

interface SearchResponse {
  total: number;
  results: Record<string, unknown>[];
}

interface ListResponse {
  results: Record<string, unknown>[];
  paging?: { next?: { after: string } };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Compte les objets satisfaisant un filtre via POST /search. */
async function countWithFilter(
  client: HubSpotClient,
  filters: unknown[]
): Promise<number> {
  const res = await client.post<SearchResponse>(`/crm/v3/objects/companies/search`, {
    filterGroups: [{ filters }],
    limit: 1,
    properties: [],
  });
  return res.total;
}

/** Propriétés récupérées pour chaque company. */
const COMPANY_PROPERTIES = [
  "name", "domain", "industry", "numberofemployees", "annualrevenue",
  "hubspot_owner_id", "lastmodifieddate", "createdate",
];

/** Construit un CompanyIssue à partir d'un résultat HubSpot brut. */
function toCompanyIssue(r: Record<string, unknown>): CompanyIssue {
  const props = (r.properties ?? {}) as Record<string, string | null>;
  return {
    id: r.id as string,
    name: (props.name ?? "").trim() || "Sans nom",
    domain: props.domain ?? null,
    industry: props.industry ?? null,
    numberOfEmployees: props.numberofemployees ?? null,
    annualRevenue: props.annualrevenue ?? null,
    ownerId: props.hubspot_owner_id ?? null,
    lastModifiedDate: props.lastmodifieddate ?? null,
    createdAt: props.createdate ?? "",
    contactCount: 0, // enrichi plus tard via associations
    dealCount: 0,     // enrichi plus tard via associations
  };
}

// ─── Fetch all companies ─────────────────────────────────────────────────────

/**
 * Récupère toutes les companies via GET /crm/v3/objects/companies (list endpoint).
 * Même pattern que fetchAllContacts — le Search API ne supporte pas bien les requêtes sans filtre.
 */
export async function fetchAllCompanies(client: HubSpotClient): Promise<CompanyIssue[]> {
  const propsParam = COMPANY_PROPERTIES.join(",");
  const allCompanies: CompanyIssue[] = [];
  let after: string | undefined;
  const limit = 100;

  do {
    const url = after
      ? `/crm/v3/objects/companies?limit=${limit}&properties=${propsParam}&after=${after}`
      : `/crm/v3/objects/companies?limit=${limit}&properties=${propsParam}`;

    const res = await client.get<ListResponse>(url);
    allCompanies.push(...res.results.map(toCompanyIssue));
    after = res.paging?.next?.after;
  } while (after);

  return allCompanies;
}

// ─── Associations batch (company → contacts, company → deals) ────────────────

interface AssociationResult {
  from: { id: string };
  to: { toObjectId: number }[];
}

interface BatchAssociationResponse {
  results: AssociationResult[];
}

/**
 * Récupère les associations company→contacts et company→deals en batch.
 * Peuple contactCount et dealCount sur chaque company in-place.
 */
export async function enrichCompaniesWithAssociations(
  client: HubSpotClient,
  companies: CompanyIssue[],
): Promise<void> {
  const batchSize = 100;

  for (let i = 0; i < companies.length; i += batchSize) {
    const batch = companies.slice(i, i + batchSize);
    const inputs = batch.map((c) => ({ id: c.id }));

    // Contacts et deals en parallèle pour chaque batch
    try {
      const [contactRes, dealRes] = await Promise.all([
        client.post<BatchAssociationResponse>(
          `/crm/v4/associations/companies/contacts/batch/read`,
          { inputs },
        ),
        client.post<BatchAssociationResponse>(
          `/crm/v4/associations/companies/deals/batch/read`,
          { inputs },
        ),
      ]);

      const contactMap = new Map<string, number>();
      for (const result of contactRes.results) {
        contactMap.set(result.from.id, result.to?.length ?? 0);
      }

      const dealMap = new Map<string, number>();
      for (const result of dealRes.results) {
        dealMap.set(result.from.id, result.to?.length ?? 0);
      }

      for (const company of batch) {
        company.contactCount = contactMap.get(company.id) ?? 0;
        company.dealCount = dealMap.get(company.id) ?? 0;
      }
    } catch {
      console.warn(`[audit:companies] Erreur batch associations (batch ${i})`);
    }

    // Rate limiting
    if (i + batchSize < companies.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
}

// ─── CO-01 : Taux domain (ex-P12) ───────────────────────────────────────────

/**
 * CO-01 (ex-P12) : Taux de companies avec domain renseigné.
 * Seuil critique : < 70% (changement vs P12 qui était < 80%, avertissement → critique)
 */
export async function runCO01(
  client: HubSpotClient,
  totalCompanies: number
): Promise<RateResult> {
  const threshold = 0.7;
  if (totalCompanies === 0) {
    return { rate: 1, filledCount: 0, totalCount: 0, threshold, triggered: false };
  }
  const filledCount = await countWithFilter(client, [
    { propertyName: "domain", operator: "HAS_PROPERTY" },
  ]);
  const rate = filledCount / totalCompanies;
  return { rate, filledCount, totalCount: totalCompanies, threshold, triggered: rate < threshold };
}

// ─── CO-02 : Doublons domain exact ──────────────────────────────────────────

/** Normalise un domain pour la détection de doublons : lowercase, trim, strip www. */
export function normalizeDomain(domain: string): string {
  let d = domain.toLowerCase().trim();
  // Strip www. au début
  d = d.replace(/^www\./, "");
  return d;
}

/**
 * CO-02 : Doublons domain exact après normalisation.
 * Criticité : critique (1 problème par cluster)
 */
export function runCO02(companies: CompanyIssue[]): CompanyDuplicateCluster[] {
  const domainMap = new Map<string, CompanyIssue[]>();

  for (const c of companies) {
    if (!c.domain) continue;
    const normalized = normalizeDomain(c.domain);
    if (!normalized) continue;

    const group = domainMap.get(normalized);
    if (group) {
      group.push(c);
    } else {
      domainMap.set(normalized, [c]);
    }
  }

  const clusters: CompanyDuplicateCluster[] = [];
  for (const [normalizedValue, members] of domainMap) {
    if (members.length >= 2) {
      clusters.push({
        criterion: "domain",
        normalizedValue,
        members,
        size: members.length,
      });
    }
  }

  clusters.sort((a, b) => b.size - a.size);
  return clusters;
}

// ─── CO-03 : Doublons nom entreprise ─────────────────────────────────────────

/**
 * Suffixes juridiques à supprimer pour la normalisation des noms d'entreprise.
 * Couvre FR, UK, US, DE, NL.
 */
const LEGAL_SUFFIXES_REGEX = /\b(sas|sarl|sa|eurl|sasu|sci|ltd|limited|inc|incorporated|corp|corporation|gmbh|ag|ug|llc|llp|lp|bv|nv)\.?\s*$/i;

/** Normalise un nom d'entreprise : lowercase, trim, strip suffixes juridiques. */
export function normalizeCompanyName(name: string): string {
  let n = name.toLowerCase().trim();
  // Strip suffixes juridiques (peut nécessiter plusieurs passes)
  n = n.replace(LEGAL_SUFFIXES_REGEX, "").trim();
  // Deuxième passe au cas où il y aurait des points/virgules restants
  n = n.replace(/[.,;]+$/, "").trim();
  return n;
}

/** Distance de Levenshtein entre deux chaînes. Réutilise le même algorithme que contacts.ts. */
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

/** Similarité normalisée (0-1) basée sur Levenshtein. */
function nameSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/**
 * CO-03 : Doublons nom entreprise (Levenshtein > 0.85 après normalisation).
 * Criticité : avertissement (1 problème par cluster)
 * Utilise Union-Find pour fusionner les clusters transitifs.
 */
export function runCO03(companies: CompanyIssue[]): CompanyDuplicateCluster[] {
  const SIMILARITY_THRESHOLD = 0.85;

  // Filtrer les companies avec un nom valide
  const withName = companies.filter((c) => c.name && c.name !== "Sans nom");
  if (withName.length < 2) return [];

  // Union-Find
  const parent = new Map<string, string>();
  function find(x: string): string {
    let root = x;
    while (parent.get(root) !== root) root = parent.get(root)!;
    let curr = x;
    while (curr !== root) {
      const next = parent.get(curr)!;
      parent.set(curr, root);
      curr = next;
    }
    return root;
  }
  function union(a: string, b: string) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }

  // Pré-calculer les noms normalisés
  const normalizedNames = new Map<string, string>();
  for (const c of withName) {
    parent.set(c.id, c.id);
    normalizedNames.set(c.id, normalizeCompanyName(c.name));
  }

  // Comparer toutes les paires
  for (let i = 0; i < withName.length; i++) {
    for (let j = i + 1; j < withName.length; j++) {
      const nameA = normalizedNames.get(withName[i].id)!;
      const nameB = normalizedNames.get(withName[j].id)!;
      if (!nameA || !nameB) continue;

      if (nameSimilarity(nameA, nameB) > SIMILARITY_THRESHOLD) {
        union(withName[i].id, withName[j].id);
      }
    }
  }

  // Construire les clusters
  const clusterMap = new Map<string, CompanyIssue[]>();
  const companyMap = new Map<string, CompanyIssue>();
  for (const c of withName) {
    companyMap.set(c.id, c);
  }

  for (const [id] of parent) {
    const root = find(id);
    const cluster = clusterMap.get(root);
    const company = companyMap.get(id)!;
    if (cluster) {
      cluster.push(company);
    } else {
      clusterMap.set(root, [company]);
    }
  }

  const clusters: CompanyDuplicateCluster[] = [];
  for (const [, members] of clusterMap) {
    if (members.length >= 2) {
      clusters.push({
        criterion: "name",
        normalizedValue: normalizeCompanyName(members[0].name),
        members,
        size: members.length,
      });
    }
  }

  clusters.sort((a, b) => b.size - a.size);
  return clusters;
}

// ─── CO-04 : Company sans contact ────────────────────────────────────────────

/**
 * CO-04 : Companies sans contact associé, créées il y a plus de 90 jours.
 * Criticité : avertissement (1 par company)
 */
export function runCO04(companies: CompanyIssue[]): CompanyIssue[] {
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  return companies.filter((c) => {
    // Grace period : créée < 90j
    if (new Date(c.createdAt).getTime() > ninetyDaysAgo) return false;
    return c.contactCount === 0;
  });
}

// ─── CO-05 : Company sans owner ──────────────────────────────────────────────

/**
 * CO-05 : Companies sans owner assigné.
 * Criticité : info (1 par company)
 */
export function runCO05(companies: CompanyIssue[]): CompanyIssue[] {
  return companies.filter((c) => !c.ownerId);
}

// ─── CO-06 : Company sans industrie ──────────────────────────────────────────

/**
 * CO-06 : Companies sans industrie renseignée.
 * Criticité : info (1 par company)
 */
export function runCO06(companies: CompanyIssue[]): CompanyIssue[] {
  return companies.filter((c) => !c.industry);
}

// ─── CO-07 : Company sans dimensionnement ────────────────────────────────────

/**
 * CO-07 : Companies sans numberofemployees ET sans annualrevenue.
 * Criticité : info (1 par company)
 */
export function runCO07(companies: CompanyIssue[]): CompanyIssue[] {
  return companies.filter((c) => !c.numberOfEmployees && !c.annualRevenue);
}

// ─── CO-08 : Company stale ───────────────────────────────────────────────────

/**
 * CO-08 : Companies inactives depuis > 365 jours.
 * Condition : lastmodifieddate > 365j ET 0 deal open ET 0 contact actif récent.
 * MVP : on utilise dealCount === 0 comme proxy pour "0 deal open"
 * et contactCount === 0 comme proxy pour "0 contact actif récent".
 * (Les associations enrichies ne distinguent pas open/closed ni activité récente.)
 * Criticité : info (1 par company)
 */
export function runCO08(companies: CompanyIssue[]): CompanyIssue[] {
  const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

  return companies.filter((c) => {
    // Company modifiée récemment → pas stale
    if (c.lastModifiedDate && new Date(c.lastModifiedDate).getTime() > oneYearAgo) return false;
    if (!c.lastModifiedDate) {
      // Jamais modifiée : stale si créée > 365j
      if (new Date(c.createdAt).getTime() > oneYearAgo) return false;
    }
    // A des deals → pas stale (proxy: deals associés)
    if (c.dealCount > 0) return false;
    // A des contacts → pas stale (proxy: contacts associés)
    if (c.contactCount > 0) return false;
    return true;
  });
}
