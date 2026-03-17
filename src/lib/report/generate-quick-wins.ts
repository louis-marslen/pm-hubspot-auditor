import type { FlatRule } from "./transform-rules";

// Mapping ruleKey → template function for actionable text
const quickWinTemplates: Record<string, (count: number) => string> = {
  p1: (c) => `Supprimer les ${c} propriétés vides depuis plus de 90 jours`,
  p2: (c) => `Examiner les ${c} propriétés sous-utilisées (fill rate < 5%) pour les supprimer ou les intégrer aux processus`,
  p3: (c) => `Fusionner les ${c} paires de propriétés en doublon`,
  p4: (c) => `Renseigner les descriptions manquantes sur ${c} propriétés`,
  p6: (c) => `Corriger le type de données de ${c} propriétés mal typées`,
  c01: () => `Enrichir les contacts sans email pour améliorer votre capacité d'emailing`,
  c02: (c) => `Identifier les ${c} contacts anonymes (sans prénom ni nom) pour les enrichir ou les supprimer`,
  c06: (c) => `Fusionner les ${c} clusters de doublons email dans vos contacts`,
  c09: (c) => `Corriger ou supprimer les ${c} contacts avec un email invalide`,
  co01: () => `Renseigner les domaines manquants sur vos companies pour activer l'enrichissement automatique`,
  co02: (c) => `Fusionner les ${c} clusters de companies en doublon`,
  co04: (c) => `Nettoyer les ${c} companies orphelines (sans contact depuis 90 jours)`,
  w1: (c) => `Corriger les ${c} workflows actifs avec un fort taux d'erreur`,
  w2: (c) => `Désactiver ou configurer les ${c} workflows actifs sans actions`,
  w3: (c) => `Archiver les ${c} workflows actifs sans enrôlement récent`,
  u02: (c) => `Réduire le nombre de Super Admins (${c} actuellement) au strict nécessaire`,
  u05: (c) => `Désactiver les ${c} comptes utilisateurs potentiellement inactifs`,
  d01: () => `Renseigner les montants manquants sur vos deals pour fiabiliser le forecast`,
  d02: () => `Renseigner les dates de clôture manquantes pour prioriser le pipeline`,
  d03: (c) => `Clôturer ou mettre à jour les ${c} deals ouverts depuis plus de 60 jours`,
  d05: (c) => `Relancer ou clôturer les ${c} deals bloqués dans un stage`,
  d09: (c) => `Associer un contact aux ${c} deals sans contact`,
  d11: (c) => `Qualifier ou fermer les ${c} deals avec un montant à 0€`,
  l04: (c) => `Associer un contact aux ${c} leads sans prospect identifié`,
  l13: (c) => `Créer des deals pour les ${c} leads qualifiés sans opportunité associée`,
  l01: (c) => `Traiter ou clôturer les ${c} leads en stagnation (> 30 jours)`,
  l14: (c) => `Renseigner la source d'origine des ${c} leads non attribués`,
};

export function generateQuickWins(rules: FlatRule[]): string[] {
  // Filter to triggered rules only
  const triggered = rules.filter((r) => !r.isEmpty);

  // Sort: critiques first (by count desc), then avertissements (by count desc)
  const sorted = [...triggered].sort((a, b) => {
    const sevOrder = { critique: 0, avertissement: 1, info: 2 };
    const aDiff = sevOrder[a.severity] - sevOrder[b.severity];
    if (aDiff !== 0) return aDiff;
    return b.count - a.count;
  });

  const wins: string[] = [];
  const maxWins = 4;

  for (const rule of sorted) {
    if (wins.length >= maxWins) break;
    // Only critiques and avertissements for quick wins
    if (rule.severity === "info") continue;

    const template = quickWinTemplates[rule.ruleKey];
    if (template) {
      wins.push(template(rule.count));
    } else {
      // Fallback generic
      wins.push(`Corriger les ${rule.count} occurrences de « ${rule.title} »`);
    }
  }

  return wins;
}
