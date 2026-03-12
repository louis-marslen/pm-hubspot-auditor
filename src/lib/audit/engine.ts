import { HubSpotClient } from "@/lib/hubspot/api-client";
import { AuditResults } from "@/lib/audit/types";
import {
  getCustomProperties,
  computeFillRates,
  runP1,
  runP2,
  runP3,
  runP4,
  runP5,
  runP6,
} from "@/lib/audit/rules/custom-properties";
import {
  countTotal,
  runP7,
  runP8,
  runP9,
  runP10a,
  runP10b,
  runP10c,
  runP10d,
  runP11,
  runP12,
  runP13,
  runP14,
  runP15,
  runP16,
} from "@/lib/audit/rules/system-properties";
import { calculateScore } from "@/lib/audit/score";

const OBJECT_TYPES = ["contacts", "companies", "deals"] as const;

/**
 * Orchestrateur principal de l'audit.
 * Appelle toutes les règles P1-P16 et retourne les résultats consolidés.
 */
export async function runAudit(accessToken: string): Promise<AuditResults> {
  const client = new HubSpotClient(accessToken);

  // 1. Comptes totaux en parallèle
  const [totalContacts, totalCompanies, totalDeals] = await Promise.all([
    countTotal(client, "contacts"),
    countTotal(client, "companies"),
    countTotal(client, "deals"),
  ]);

  const objectCounts = {
    contacts: totalContacts,
    companies: totalCompanies,
    deals: totalDeals,
  };

  // 2. Propriétés custom pour chaque type d'objet
  const [contactsProps, companiesProps, dealsProps] = await Promise.all([
    getCustomProperties(client, "contacts"),
    getCustomProperties(client, "companies"),
    getCustomProperties(client, "deals"),
  ]);

  const customPropertyCounts = {
    contacts: contactsProps.length,
    companies: companiesProps.length,
    deals: dealsProps.length,
  };

  // 3. Fill rates séquentiels par type d'objet pour éviter de dépasser la limite secondaire HubSpot
  const contactsFillRates = await computeFillRates(client, "contacts", contactsProps, totalContacts);
  const companiesFillRates = await computeFillRates(client, "companies", companiesProps, totalCompanies);
  const dealsFillRates = await computeFillRates(client, "deals", dealsProps, totalDeals);

  // 4. Règles P1-P6 sur les propriétés custom
  const p1 = [
    ...runP1(contactsProps, contactsFillRates, "contacts"),
    ...runP1(companiesProps, companiesFillRates, "companies"),
    ...runP1(dealsProps, dealsFillRates, "deals"),
  ];

  const p2 = [
    ...runP2(contactsProps, contactsFillRates, totalContacts, "contacts"),
    ...runP2(companiesProps, companiesFillRates, totalCompanies, "companies"),
    ...runP2(dealsProps, dealsFillRates, totalDeals, "deals"),
  ];

  const p3 = [
    ...runP3(contactsProps, "contacts"),
    ...runP3(companiesProps, "companies"),
    ...runP3(dealsProps, "deals"),
  ];

  const p4 = [
    ...runP4(contactsProps, "contacts"),
    ...runP4(companiesProps, "companies"),
    ...runP4(dealsProps, "deals"),
  ];

  const p5 = [
    ...runP5(contactsProps, "contacts"),
    ...runP5(companiesProps, "companies"),
    ...runP5(dealsProps, "deals"),
  ];

  const p6 = [
    ...runP6(contactsProps, "contacts"),
    ...runP6(companiesProps, "companies"),
    ...runP6(dealsProps, "deals"),
  ];

  // Deals ouverts : nécessaire pour P13/P14
  // On utilise le total deals comme proxy (MVP : pas de filtre open/closed supplémentaire)
  const totalDealsOpen = totalDeals;

  // 5. Règles système en petits groupes parallèles pour respecter le rate limit HubSpot
  const [p7, p8, p9] = await Promise.all([
    runP7(client, totalContacts),
    runP8(client),
    runP9(client, totalContacts),
  ]);
  const [p10a, p10b, p10c, p10d] = await Promise.all([
    runP10a(client),
    runP10b(client),
    runP10c(client),
    runP10d(client),
  ]);
  const [p11, p12] = await Promise.all([
    runP11(client, totalContacts, totalCompanies),
    runP12(client, totalCompanies),
  ]);
  const [p13, p14] = await Promise.all([
    runP13(client, totalDealsOpen),
    runP14(client, totalDealsOpen),
  ]);
  const p15 = await runP15(client);
  const p16 = await runP16(client);

  // 6. Calcul du score
  const partialResults = {
    objectCounts,
    customPropertyCounts,
    p1, p2, p3, p4, p5, p6,
    p7, p8, p9, p10a, p10b, p10c, p10d,
    p11, p12, p13, p14, p15, p16,
    score: 0,
    scoreLabel: "",
    totalCritiques: 0,
    totalAvertissements: 0,
    totalInfos: 0,
  };

  const { score, label, critiques, avertissements, infos } = calculateScore(partialResults as AuditResults);

  return {
    ...partialResults,
    score,
    scoreLabel: label,
    totalCritiques: critiques,
    totalAvertissements: avertissements,
    totalInfos: infos,
  };
}
