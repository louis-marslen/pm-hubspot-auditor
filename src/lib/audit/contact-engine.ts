import { HubSpotClient } from "@/lib/hubspot/api-client";
import { ContactAuditResults } from "@/lib/audit/types";
import { calculateContactScore } from "@/lib/audit/contact-score";
import {
  runC01, runC02, runC03, runC04a, runC04b, runC04c, runC04d, runC05,
  runC06, runC07, runC08, runC09, runC10, runC11, runC12,
  fetchAllContacts, enrichContactsWithCompanies,
} from "@/lib/audit/rules/contacts";
import { countTotal } from "@/lib/audit/rules/system-properties";

/**
 * Orchestrateur du domaine Contacts (EP-05).
 * Récupère les contacts, exécute C-01 à C-12, calcule le score.
 */
export async function runContactAudit(
  accessToken: string,
  totalContacts: number,
  totalCompanies: number,
  onFetchProgress?: (fetchedCount: number) => void,
  onStep?: (step: "fetching" | "analyzing" | "scoring") => void,
): Promise<ContactAuditResults | null> {
  if (totalContacts === 0) return null;

  const client = new HubSpotClient(accessToken);
  const t = (label: string, since: number) => console.log(`[audit:contacts] ${label}: ${Date.now() - since}ms`);
  const t0 = Date.now();

  // 1. Règles basées sur des comptages API (C-01, C-02, C-03, C-04a-d, C-05) en parallèle par groupes
  const [c01, c02, c03] = await Promise.all([
    runC01(client, totalContacts),
    runC02(client),
    runC03(client, totalContacts),
  ]);
  t("c01-c03", t0);

  const [c04a, c04b, c04c, c04d] = await Promise.all([
    runC04a(client),
    runC04b(client),
    runC04c(client),
    runC04d(client),
  ]);
  t("c04a-d", t0);

  const c05 = await runC05(client, totalContacts, totalCompanies);
  t("c05", t0);

  // 2. Récupération de tous les contacts pour les règles locales (C-06 à C-12)
  const allContacts = await fetchAllContacts(client, onFetchProgress);
  t(`fetch all contacts (${allContacts.length})`, t0);

  // 2b. Enrichir avec les associations company (nécessaire pour C-07)
  onStep?.("analyzing");
  if (totalCompanies > 0) {
    await enrichContactsWithCompanies(client, allContacts);
    t("enrich companies", t0);
  }

  // 3. Règles doublons (locales, pas d'API)
  const c06 = runC06(allContacts);
  const c07 = runC07(allContacts, totalCompanies);
  const c08 = runC08(allContacts);
  t("c06-c08 duplicates", t0);

  // 4. Règles qualité (locales)
  const c09 = runC09(allContacts);
  const c10 = runC10(allContacts);
  const c11 = runC11(allContacts);
  const c12 = runC12(allContacts);
  t("c09-c12 quality", t0);

  // 5. Calcul du score
  onStep?.("scoring");
  const partialResults: ContactAuditResults = {
    totalContacts,
    hasContacts: true,
    c01, c02, c03, c04a, c04b, c04c, c04d, c05,
    c06, c07, c08, c09, c10, c11, c12,
    score: 0,
    scoreLabel: "",
    totalCritiques: 0,
    totalAvertissements: 0,
    totalInfos: 0,
  };

  const { score, label, critiques, avertissements, infos } = calculateContactScore(partialResults);
  t("score calculated", t0);

  return {
    ...partialResults,
    score,
    scoreLabel: label,
    totalCritiques: critiques,
    totalAvertissements: avertissements,
    totalInfos: infos,
  };
}
