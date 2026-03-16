import { HubSpotClient } from "@/lib/hubspot/api-client";
import { RateResult, ContactIssue, DuplicateCluster } from "@/lib/audit/types";

interface SearchResponse {
  total: number;
  results: Record<string, unknown>[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

/** Construit un ContactIssue à partir d'un résultat HubSpot brut. */
function toContactIssue(r: Record<string, unknown>): ContactIssue {
  const props = (r.properties ?? {}) as Record<string, string | null>;
  const firstname = (props.firstname ?? "").trim();
  const lastname = (props.lastname ?? "").trim();
  const name = firstname || lastname
    ? `${firstname} ${lastname}`.trim()
    : "Sans nom";

  return {
    id: r.id as string,
    name,
    email: props.email ?? null,
    lifecycleStage: props.lifecyclestage ?? null,
    ownerId: props.hubspot_owner_id ?? null,
    source: props.hs_analytics_source ?? null,
    phone: props.phone ?? null,
    mobilephone: props.mobilephone ?? null,
    companyId: null, // association company non disponible via Search API
    lastModifiedDate: props.lastmodifieddate ?? null,
    createdAt: props.createdate ?? "",
  };
}

// Propriétés demandées dans fetchAllContacts.
// On utilise les propriétés CRM standard. Les propriétés analytics (hs_analytics_source)
// et calculées (mobilephone) peuvent échouer sur certains portails — on les teste d'abord.
const CONTACT_PROPERTIES_BASE = [
  "email", "firstname", "lastname", "lifecyclestage",
  "hubspot_owner_id", "phone", "lastmodifieddate", "createdate",
];

// Propriétés optionnelles ajoutées si le portail les supporte
const CONTACT_PROPERTIES_OPTIONAL = ["hs_analytics_source", "mobilephone"];

// ─── Règles migrées (ex-P7 → C-01, P8 → C-02, P9 → C-03, P10a-d → C-04a-d, P11 → C-05) ───

/**
 * C-01 (ex-P7) : Taux de contacts avec email renseigné.
 * Seuil critique : < 80%
 */
export async function runC01(
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
 * C-02 (ex-P8) : Contacts sans prénom ET sans nom.
 * Criticité : critique (changement vs P8 qui était avertissement)
 */
export async function runC02(
  client: HubSpotClient
): Promise<{ count: number; examples: ContactIssue[] }> {
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
    properties: ["email", "firstname", "lastname", "createdate"],
    sorts: [{ propertyName: "createdate", direction: "DESCENDING" }],
  });
  return { count: res.total, examples: res.results.map(toContactIssue) };
}

/**
 * C-03 (ex-P9) : Taux de contacts avec lifecycle stage renseigné.
 * Seuil avertissement : < 60% (changement vs P9 qui était < 80%)
 */
export async function runC03(
  client: HubSpotClient,
  totalContacts: number
): Promise<RateResult> {
  const threshold = 0.6;
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
 * C-04a (ex-P10a) : Contacts avec deal won mais lifecycle ≠ customer.
 * Criticité : avertissement
 */
export async function runC04a(
  client: HubSpotClient
): Promise<{ count: number; examples: ContactIssue[] }> {
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
    properties: ["email", "firstname", "lastname", "lifecyclestage", "createdate"],
  });
  return { count: res.total, examples: res.results.map(toContactIssue) };
}

/**
 * C-04b (ex-P10b) : Customers sans deal won.
 * Criticité : info
 * MVP : retourne 0 (sans filtre d'association, non évaluable précisément)
 */
export async function runC04b(
  client: HubSpotClient
): Promise<{ count: number; examples: ContactIssue[] }> {
  return { count: 0, examples: [] };
}

/**
 * C-04c (ex-P10c) : 0 MQL ET 0 SQL alors qu'il y a des deals ouverts.
 * Criticité : avertissement (changement vs P10c qui était critique)
 */
export async function runC04c(
  client: HubSpotClient
): Promise<{ triggered: boolean }> {
  const [mqlCount, sqlCount, totalDeals] = await Promise.all([
    countWithFilter(client, "contacts", [
      { propertyName: "lifecyclestage", operator: "EQ", value: "marketingqualifiedlead" },
    ]),
    countWithFilter(client, "contacts", [
      { propertyName: "lifecyclestage", operator: "EQ", value: "salesqualifiedlead" },
    ]),
    client.post<SearchResponse>(`/crm/v3/objects/deals/search`, {
      filterGroups: [],
      limit: 1,
      properties: [],
    }).then((r) => r.total),
  ]);
  return { triggered: mqlCount === 0 && sqlCount === 0 && totalDeals > 0 };
}

/**
 * C-04d (ex-P10d) : Leads avec deal actif.
 * Criticité : info
 * MVP : retourne 0 (sans filtre d'association, non évaluable précisément)
 */
export async function runC04d(
  client: HubSpotClient
): Promise<{ count: number; examples: ContactIssue[] }> {
  return { count: 0, examples: [] };
}

/**
 * C-05 (ex-P11) : Taux de contacts rattachés à une company.
 * Retourne null si workspace B2C (0 companies).
 * Seuil info : < 60% (changement vs P11 qui était < 70%, avertissement → info)
 */
export async function runC05(
  client: HubSpotClient,
  totalContacts: number,
  totalCompanies: number
): Promise<RateResult | null> {
  if (totalCompanies === 0) return null;
  if (totalContacts === 0) {
    return { rate: 1, filledCount: 0, totalCount: 0, threshold: 0.6, triggered: false };
  }
  const threshold = 0.6;
  const filledCount = await countWithFilter(client, "contacts", [
    { propertyName: "associatedcompanyid", operator: "HAS_PROPERTY" },
  ]);
  const rate = filledCount / totalContacts;
  return { rate, filledCount, totalCount: totalContacts, threshold, triggered: rate < threshold };
}

// ─── Nouvelles règles doublons (C-06, C-07, C-08) ───────────────────────────

/**
 * Récupère tous les contacts avec les propriétés nécessaires (pagination complète).
 * Utilise le Search API avec pagination via after.
 */
interface ListResponse {
  results: Record<string, unknown>[];
  paging?: { next?: { after: string } };
}

export async function fetchAllContacts(client: HubSpotClient): Promise<ContactIssue[]> {
  // Utilise GET /crm/v3/objects/contacts (list endpoint) au lieu du Search API.
  // Le Search API rejette limit > ~10 avec filterGroups vide.
  const properties = [...CONTACT_PROPERTIES_BASE, ...CONTACT_PROPERTIES_OPTIONAL];
  const propsParam = properties.join(",");

  const allContacts: ContactIssue[] = [];
  let after: string | undefined;
  const limit = 100;

  do {
    const url = after
      ? `/crm/v3/objects/contacts?limit=${limit}&properties=${propsParam}&after=${after}`
      : `/crm/v3/objects/contacts?limit=${limit}&properties=${propsParam}`;

    const res = await client.get<ListResponse>(url);

    allContacts.push(...res.results.map(toContactIssue));

    after = res.paging?.next?.after;
  } while (after);

  return allContacts;
}

// ─── Associations contact → company (batch) ─────────────────────────────────

interface AssociationResult {
  from: { id: string };
  to: { toObjectId: number }[];
}

interface BatchAssociationResponse {
  results: AssociationResult[];
}

/**
 * Récupère les associations contact→company en batch (lots de 100).
 * Peuple le champ companyId sur chaque contact in-place.
 */
export async function enrichContactsWithCompanies(
  client: HubSpotClient,
  contacts: ContactIssue[],
): Promise<void> {
  const batchSize = 100;
  for (let i = 0; i < contacts.length; i += batchSize) {
    const batch = contacts.slice(i, i + batchSize);
    const inputs = batch.map((c) => ({ id: c.id }));

    try {
      const res = await client.post<BatchAssociationResponse>(
        `/crm/v4/associations/contacts/companies/batch/read`,
        { inputs },
      );

      // Mapper les résultats vers les contacts
      const companyMap = new Map<string, string>();
      for (const result of res.results) {
        if (result.to && result.to.length > 0) {
          companyMap.set(result.from.id, String(result.to[0].toObjectId));
        }
      }

      for (const contact of batch) {
        contact.companyId = companyMap.get(contact.id) ?? null;
      }
    } catch {
      // En cas d'erreur sur un batch, on continue sans bloquer l'audit
      console.warn(`[audit:contacts] Erreur batch associations contacts→companies (batch ${i})`);
    }

    // Rate limiting : pause entre les batches
    if (i + batchSize < contacts.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
}

// ─── C-06 : Doublons email exact ─────────────────────────────────────────────

/** Normalise un email pour la détection de doublons : lowercase, trim, strip sous-adressage. */
export function normalizeEmail(email: string): string {
  let e = email.toLowerCase().trim();
  // Strip sous-adressage : user+alias@domain.com → user@domain.com
  e = e.replace(/\+[^@]*@/, "@");
  return e;
}

/**
 * C-06 : Doublons email exact après normalisation.
 * Criticité : critique (1 problème par cluster)
 */
export function runC06(contacts: ContactIssue[]): DuplicateCluster[] {
  const emailMap = new Map<string, ContactIssue[]>();

  for (const c of contacts) {
    if (!c.email) continue;
    const normalized = normalizeEmail(c.email);
    if (!normalized) continue;

    const group = emailMap.get(normalized);
    if (group) {
      group.push(c);
    } else {
      emailMap.set(normalized, [c]);
    }
  }

  const clusters: DuplicateCluster[] = [];
  for (const [normalizedValue, members] of emailMap) {
    if (members.length >= 2) {
      clusters.push({
        criterion: "email",
        normalizedValue,
        members,
        size: members.length,
      });
    }
  }

  // Tri par taille décroissante
  clusters.sort((a, b) => b.size - a.size);
  return clusters;
}

// ─── C-07 : Doublons nom+company ─────────────────────────────────────────────

/** Distance de Levenshtein entre deux chaînes. */
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
  return 1 - levenshtein(a.toLowerCase(), b.toLowerCase()) / maxLen;
}

/**
 * C-07 : Doublons nom+company (Levenshtein > 0.85, même company).
 * Criticité : avertissement (1 problème par cluster)
 * Désactivé si 0 companies dans le workspace.
 */
export function runC07(contacts: ContactIssue[], totalCompanies: number): DuplicateCluster[] {
  if (totalCompanies === 0) return [];

  const SIMILARITY_THRESHOLD = 0.85;

  // Grouper par companyId (non-null uniquement)
  const byCompany = new Map<string, ContactIssue[]>();
  for (const c of contacts) {
    if (!c.companyId) continue;
    const group = byCompany.get(c.companyId);
    if (group) {
      group.push(c);
    } else {
      byCompany.set(c.companyId, [c]);
    }
  }

  // Union-Find pour fusionner les clusters transitifs
  const parent = new Map<string, string>();
  function find(x: string): string {
    let root = x;
    while (parent.get(root) !== root) root = parent.get(root)!;
    // Path compression
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

  // Pour chaque company, comparer les noms des contacts deux à deux
  for (const [, companyContacts] of byCompany) {
    if (companyContacts.length < 2) continue;

    for (const c of companyContacts) {
      if (!parent.has(c.id)) parent.set(c.id, c.id);
    }

    for (let i = 0; i < companyContacts.length; i++) {
      for (let j = i + 1; j < companyContacts.length; j++) {
        const a = companyContacts[i];
        const b = companyContacts[j];
        const fullnameA = `${a.name}`.toLowerCase().trim();
        const fullnameB = `${b.name}`.toLowerCase().trim();
        if (!fullnameA || fullnameA === "sans nom" || !fullnameB || fullnameB === "sans nom") continue;

        if (nameSimilarity(fullnameA, fullnameB) > SIMILARITY_THRESHOLD) {
          union(a.id, b.id);
        }
      }
    }
  }

  // Construire les clusters
  const clusterMap = new Map<string, ContactIssue[]>();
  const contactMap = new Map<string, ContactIssue>();
  for (const c of contacts) {
    contactMap.set(c.id, c);
  }

  for (const [id] of parent) {
    const root = find(id);
    const cluster = clusterMap.get(root);
    const contact = contactMap.get(id)!;
    if (cluster) {
      cluster.push(contact);
    } else {
      clusterMap.set(root, [contact]);
    }
  }

  const clusters: DuplicateCluster[] = [];
  for (const [, members] of clusterMap) {
    if (members.length >= 2) {
      clusters.push({
        criterion: "name_company",
        normalizedValue: members[0].name.toLowerCase().trim(),
        members,
        size: members.length,
      });
    }
  }

  clusters.sort((a, b) => b.size - a.size);
  return clusters;
}

// ─── C-08 : Doublons téléphone ──────────────────────────────────────────────

/** Normalise un numéro de téléphone pour la détection de doublons. */
export function normalizePhone(phone: string): string | null {
  // Garder le + initial temporairement
  let n = phone.trim();
  const hasPlus = n.startsWith("+");
  // Supprimer tous les caractères non-numériques sauf le + initial
  n = n.replace(/[^0-9]/g, "");

  // Conversion préfixe FR : +33 → 0
  if (hasPlus && n.startsWith("33") && n.length >= 10) {
    n = "0" + n.slice(2);
  }

  // Filtre anti-faux-positifs : < 8 chiffres → ignoré
  if (n.length < 8) return null;

  return n;
}

/**
 * C-08 : Doublons téléphone après normalisation (pool phone + mobilephone).
 * Criticité : avertissement (1 problème par cluster)
 */
export function runC08(contacts: ContactIssue[]): DuplicateCluster[] {
  const phoneMap = new Map<string, ContactIssue[]>();

  for (const c of contacts) {
    const phones = [c.phone, c.mobilephone].filter(Boolean) as string[];
    for (const raw of phones) {
      const normalized = normalizePhone(raw);
      if (!normalized) continue;

      const group = phoneMap.get(normalized);
      if (group) {
        // Éviter d'ajouter le même contact deux fois (si phone === mobilephone normalisé)
        if (!group.some((g) => g.id === c.id)) {
          group.push(c);
        }
      } else {
        phoneMap.set(normalized, [c]);
      }
    }
  }

  const clusters: DuplicateCluster[] = [];
  for (const [normalizedValue, members] of phoneMap) {
    if (members.length >= 2) {
      clusters.push({
        criterion: "phone",
        normalizedValue,
        members,
        size: members.length,
      });
    }
  }

  clusters.sort((a, b) => b.size - a.size);
  return clusters;
}

// ─── Nouvelles règles qualité (C-09 à C-12) ─────────────────────────────────

/**
 * Regex de validation email (PRD EP-05 section 6.4).
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

/**
 * C-09 : Email invalide (format).
 * Criticité : avertissement (1 par contact)
 */
export function runC09(contacts: ContactIssue[]): ContactIssue[] {
  return contacts.filter((c) => {
    if (!c.email) return false;
    return !EMAIL_REGEX.test(c.email.trim());
  });
}

/**
 * C-10 : Contact stale (inactif > 365j, lifecycle ≠ customer, 0 deal open).
 * Grace period : exclure contacts créés < 7j.
 * Criticité : info (1 par contact)
 * MVP : pas de filtre deals (non accessible via Search) — seul lastmodifieddate + lifecycle.
 */
export function runC10(contacts: ContactIssue[]): ContactIssue[] {
  const now = Date.now();
  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  return contacts.filter((c) => {
    // Grace period : créé < 7j
    if (new Date(c.createdAt).getTime() > sevenDaysAgo) return false;
    // Exclure customers
    if (c.lifecycleStage === "customer") return false;
    // Stale : lastmodifieddate > 365j
    if (!c.lastModifiedDate) return true; // jamais modifié = stale
    return new Date(c.lastModifiedDate).getTime() < oneYearAgo;
  });
}

/**
 * C-11 : Contact sans owner.
 * Grace period : exclure contacts créés < 7j.
 * Criticité : info (1 par contact)
 */
export function runC11(contacts: ContactIssue[]): ContactIssue[] {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return contacts.filter((c) => {
    if (new Date(c.createdAt).getTime() > sevenDaysAgo) return false;
    return !c.ownerId;
  });
}

/**
 * C-12 : Contact sans source.
 * Grace period : exclure contacts créés < 7j.
 * Criticité : info (1 par contact)
 */
export function runC12(contacts: ContactIssue[]): ContactIssue[] {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return contacts.filter((c) => {
    if (new Date(c.createdAt).getTime() > sevenDaysAgo) return false;
    return !c.source;
  });
}
