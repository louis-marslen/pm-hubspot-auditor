# EP-18 — Audit des leads & pipelines de prospection

**PRD associé :** [prd-18-audit-leads.md](../prd/prd-18-audit-leads.md)
**Date de création :** 2026-03-16
**Statut :** Spécifié

---

## Hypothèse

Si nous détectons automatiquement les leads bloqués, les disqualifications non tracées et les ruptures dans le handoff lead → deal, alors les SDR Managers et RevOps Managers pourront améliorer leur taux de conversion et réduire les fuites dans le funnel de prospection.

---

## Périmètre

### In scope
- 14 règles d'audit (L-01 à L-14) : 10 adaptées de EP-06 (deals) avec seuils ajustés + 4 nouvelles règles spécifiques leads
- Intégration dans la modale de sélection EP-17 (domaine **décoché par défaut**)
- Score de santé Leads (coefficient 1.0 dans le score global)
- Activation conditionnelle : sélectionné par l'utilisateur ET ≥ 1 lead
- Skipped reason `"no_leads"` si sélectionné mais 0 lead
- Gestion du scope OAuth `crm.objects.leads.read`
- Business impacts traduits pour chaque règle

### Out of scope
- Seuils configurables par l'utilisateur (EP-16)
- Vélocité de prospection (temps moyen par stage)
- Détection de leads en doublon
- Deep links vers les leads HubSpot
- Scoring prédictif de conversion lead → deal

---

## User Stories

### EP-18-S1 — Vue d'ensemble de l'audit leads & pipelines de prospection

**En tant que** RevOps Manager, **je veux** voir un score de santé global de mes leads et pipelines de prospection **afin de** évaluer rapidement la qualité de mon processus de qualification.

**Critères d'acceptance :**
- [ ] Étant donné un workspace avec au moins 1 lead et le domaine Leads sélectionné, quand l'audit s'exécute, alors un onglet "Leads" apparaît dans le rapport avec un score de santé (0-100), un label coloré et un décompte par sévérité (X critiques / Y avertissements / Z infos)
- [ ] Étant donné un workspace avec 0 lead et le domaine Leads sélectionné, quand l'audit s'exécute, alors l'onglet Leads affiche un état "Aucun lead détecté" avec skipped reason `"no_leads"`
- [ ] Étant donné un workspace sans le domaine Leads sélectionné, quand l'audit s'exécute, alors aucun onglet Leads n'apparaît dans le rapport
- [ ] Étant donné un workspace dont le scope OAuth `crm.objects.leads.read` n'est pas accordé, quand l'utilisateur coche le domaine Leads, alors un message explicite indique que l'accès nécessite ce scope

### EP-18-S2 — Détection des leads bloqués

**En tant que** SDR Manager, **je veux** identifier automatiquement tous les leads qui stagnent dans mon pipeline de prospection depuis plus de 30 jours **afin de** les relancer ou les disqualifier rapidement.

**Critères d'acceptance :**
- [ ] Étant donné un lead en statut `open` créé il y a plus de 30 jours, quand l'audit s'exécute, alors la règle L-01 le détecte comme "lead ouvert ancien"
- [ ] Étant donné un lead en statut `open` dont le stage n'a pas changé depuis plus de 30 jours, quand l'audit s'exécute, alors la règle L-02 le détecte comme "lead bloqué dans un stage"
- [ ] Étant donné un lead créé il y a 15 jours dans le premier stage d'un pipeline, quand l'audit s'exécute, alors ni L-01 ni L-02 ne le détectent (grace period)
- [ ] Étant donné des leads bloqués dans différents pipelines et stages, quand l'audit affiche les résultats de L-02, alors les leads sont regroupés par pipeline puis par stage, triés par ancienneté décroissante
- [ ] Étant donné un lead sans propriétaire, quand l'audit s'exécute, alors la règle L-03 le détecte comme "lead sans propriétaire" (Info)
- [ ] Étant donné un lead sans contact associé, quand l'audit s'exécute, alors la règle L-04 le détecte comme anomalie **critique**
- [ ] Étant donné un lead sans source d'origine (`hs_analytics_source` null), quand l'audit s'exécute, alors la règle L-14 le détecte comme "lead sans source"

### EP-18-S3 — Qualité du processus de disqualification

**En tant que** RevOps Manager, **je veux** vérifier que les leads disqualifiés ont un motif structuré et exploitable **afin de** pouvoir analyser les patterns de rejet et améliorer le ciblage marketing.

**Critères d'acceptance :**
- [ ] Étant donné un lead dans un stage de type "Disqualified" sans motif de disqualification renseigné, quand l'audit s'exécute, alors la règle L-11 le détecte avec le nombre total et le pourcentage de leads disqualifiés sans motif
- [ ] Étant donné une propriété de disqualification de type `text` (texte libre), quand l'audit s'exécute, alors la règle L-12 détecte que le motif n'est pas structuré et recommande de passer à un type `enumeration`
- [ ] Étant donné une propriété de disqualification de type `enumeration`, quand l'audit s'exécute, alors la règle L-12 ne déclenche aucun problème
- [ ] Étant donné un workspace sans propriété de disqualification identifiable, quand l'audit s'exécute, alors L-11 et L-12 sont désactivées avec mention "Propriété de disqualification non identifiée"

### EP-18-S4 — Intégrité du handoff lead → deal

**En tant que** SDR Manager, **je veux** identifier les leads qualifiés qui n'ont pas été convertis en deal **afin de** m'assurer que chaque opportunité qualifiée est prise en charge par l'équipe commerciale.

**Critères d'acceptance :**
- [ ] Étant donné un lead dans un stage de type "Qualified" (converti) sans aucun deal associé, quand l'audit s'exécute, alors la règle L-13 le détecte comme anomalie **critique** avec le nombre total et le pourcentage de leads qualifiés sans deal
- [ ] Étant donné un lead dans un stage "Qualified" avec un deal associé, quand l'audit s'exécute, alors la règle L-13 ne le signale pas
- [ ] Étant donné des leads qualifiés sans deal, quand l'audit affiche les résultats de L-13, alors les leads sont triés par date de qualification décroissante (les plus récents = les plus actionnables en premier)
- [ ] Étant donné un lead qualifié sans deal, quand le rapport affiche son impact business, alors le message mentionne la rupture du handoff SDR → AE et le coût d'acquisition gaspillé

### EP-18-S5 — Audit de la configuration des pipelines de prospection

**En tant que** RevOps Manager, **je veux** diagnostiquer la configuration de mes pipelines de prospection **afin de** identifier les problèmes structurels (pipelines obsolètes, trop de stages, phases sautées).

**Critères d'acceptance :**
- [ ] Étant donné un pipeline de leads sans aucun lead créé dans les 60 derniers jours et sans lead open, quand l'audit s'exécute, alors la règle L-05 le détecte comme "pipeline sans activité"
- [ ] Étant donné un pipeline de leads avec plus de 5 stages actifs (hors stages fermés), quand l'audit s'exécute, alors la règle L-06 le détecte comme "pipeline trop complexe"
- [ ] Étant donné un pipeline où plus de 20% des leads ont sauté au moins 1 stage, quand l'audit s'exécute, alors la règle L-07 le détecte avec le taux et le top 3 des stages sautés
- [ ] Étant donné un pipeline où plus de 20% des leads ont été créés dans un stage autre que le premier, quand l'audit s'exécute, alors la règle L-08 le détecte
- [ ] Étant donné un pipeline avec 2 stages de type "Qualified" ou 2 stages "Disqualified", quand l'audit s'exécute, alors la règle L-09 le détecte
- [ ] Étant donné un stage actif sans aucun lead open et sans lead passé dans les 60 derniers jours, quand l'audit s'exécute, alors la règle L-10 le détecte (sauf si le pipeline entier est déjà détecté par L-05)

### EP-18-S6 — Impact business par catégorie de problème

**En tant que** RevOps Manager, **je veux** voir l'impact business de chaque catégorie de problème détecté sur mes leads **afin de** prioriser les actions correctives et justifier les investissements auprès de ma direction.

**Critères d'acceptance :**
- [ ] Étant donné au moins une règle déclenchée, quand le rapport affiche la section Leads, alors chaque règle est accompagnée de son titre business, estimation d'impact et niveau d'urgence (cf. table 6.7 du PRD)
- [ ] Étant donné aucune règle déclenchée, quand le rapport affiche la section Leads, alors le bloc Impact business n'est pas affiché
- [ ] Étant donné des leads qualifiés sans deal (L-13), quand le rapport affiche l'impact business, alors le message mentionne explicitement le coût d'acquisition gaspillé et la rupture du funnel

---

## Spécifications fonctionnelles

### Récapitulatif des 14 règles

| ID | Titre | Sévérité | Type | Comptage | Seuil / Condition |
|---|---|---|---|---|---|
| L-01 | Lead ouvert ancien | Avertissement 🟡 | Lead unitaire | 1/lead | `createdate` > 30j, statut `open` |
| L-02 | Lead bloqué dans un stage | Avertissement 🟡 | Lead unitaire | 1/lead | Stage inchangé > 30j, statut `open` |
| L-03 | Lead sans propriétaire | Info 🔵 | Lead unitaire | 1/lead | `hubspot_owner_id` null, statut `open` |
| L-04 | Lead sans contact associé | Critique 🔴 | Lead unitaire | 1/lead | 0 contact associé, statut `open` |
| L-05 | Pipeline leads sans activité | Info 🔵 | Pipeline | 1/pipeline | 0 lead open + 0 lead créé < 60j |
| L-06 | Pipeline leads trop d'étapes | Info 🔵 | Pipeline | 1/pipeline | > 5 stages actifs |
| L-07 | Phases sautées | Avertissement 🟡 | Pipeline | 1/pipeline | > 20% leads avec ≥ 1 stage sauté |
| L-08 | Points d'entrée multiples | Avertissement 🟡 | Pipeline | 1/pipeline | > 20% leads créés hors 1er stage |
| L-09 | Stages fermés redondants | Avertissement 🟡 | Pipeline | 1/pipeline | > 1 Qualified OU > 1 Disqualified |
| L-10 | Stage sans activité | Info 🔵 | Stage | 1/stage | 0 lead open + 0 passage < 60j |
| L-11 | Disqualifié sans motif | Avertissement 🟡 | Lead disqualifié | 1/lead | Stage "Disqualified", motif null/vide |
| L-12 | Motif disqualification non structuré | Info 🔵 | Config workspace | 1 unique | Propriété de type `text` |
| L-13 | Qualifié sans deal | Critique 🔴 | Lead qualifié | 1/lead | Stage "Qualified", 0 deal associé |
| L-14 | Lead sans source | Avertissement 🟡 | Lead unitaire | 1/lead | `hs_analytics_source` null, statut `open` |

### Comparaison des seuils Leads vs Deals

| Paramètre | Deals (EP-06) | Leads (EP-18) | Justification |
|---|---|---|---|
| Ancienneté / blocage | 60 jours | **30 jours** | Cycles de prospection plus courts |
| Max stages pipeline | 8 stages | **5 stages** | Pipeline de prospection = simplicité |
| Inactivité pipeline/stage | 90 jours | **60 jours** | Vélocité de prospection supérieure |
| Phases sautées / entrées multiples | 20% | **20%** | Identique — même logique |
| Pondération score global | ×1.5 | **×1.0** | Leads = domaine secondaire optionnel |

### Intégration EP-17 (sélection des domaines)

```
AUDIT_DOMAINS mise à jour :

{
  id: "leads",
  label: "Leads & Prospection",
  icon: "UserPlus",  // Lucide icon
  description: "Analyse des leads, pipelines de prospection, disqualifications et handoff lead → deal",
  defaultSelected: false,  // ← DÉCOCHÉ par défaut
  implemented: true,
  activationCondition: "≥ 1 lead dans le workspace",
  requiredScope: "crm.objects.leads.read",
  tooltip: "Activez si votre équipe utilise l'objet Lead HubSpot pour gérer la prospection."
}
```

### Migration base de données

```sql
-- Migration 010_lead_audit.sql

-- Ajout des colonnes lead_results et lead_score à audit_runs
ALTER TABLE public.audit_runs
  ADD COLUMN IF NOT EXISTS lead_results jsonb,
  ADD COLUMN IF NOT EXISTS lead_score integer;

-- Mise à jour de AUDIT_DOMAINS pour inclure "leads"
-- (côté code, pas SQL — ajout dans src/lib/audit/types.ts)
```

### Architecture du moteur d'audit leads

```
src/lib/audit/
├── rules/
│   ├── leads.ts          ← L-01 à L-04, L-11 à L-14 (règles sur leads individuels)
│   └── lead-pipelines.ts ← L-05 à L-10 (règles sur pipelines de prospection)
├── lead-engine.ts        ← Orchestrateur du domaine Leads
└── lead-score.ts         ← Algorithme de scoring Leads
```

Pattern identique à l'architecture EP-06 (`deals.ts` + `pipelines.ts` + `deal-engine.ts` + `deal-score.ts`).

---

## Critères d'acceptance globaux

- [ ] Les 14 règles L-01 à L-14 sont détectées et affichées correctement
- [ ] Les seuils sont à 30j (L-01, L-02), 60j (L-05, L-10), 5 stages (L-06), 20% (L-07, L-08)
- [ ] L-04 et L-13 sont de sévérité Critique
- [ ] L-11 s'applique aux leads disqualifiés (pas seulement les `open`)
- [ ] L-12 vérifie le type de propriété, pas la valeur
- [ ] L-13 s'applique aux leads dans des stages Qualified/Converted (pas seulement les `open`)
- [ ] Le domaine Leads est décoché par défaut dans la modale EP-17
- [ ] Tooltip explicatif dans la modale de sélection
- [ ] Si le scope `crm.objects.leads.read` est absent, le domaine est désactivé avec message
- [ ] Si 0 lead dans le workspace, skipped reason `"no_leads"`
- [ ] Score Leads calculé avec coefficient 1.0 (pas de pondération renforcée)
- [ ] Score global recalculé correctement avec/sans le domaine Leads
- [ ] Chaque règle affiche son impact business
- [ ] Listes > 20 items paginées
- [ ] Non-destructif : aucune requête en écriture
- [ ] Labels UI : "Leads & Prospection" dans l'onglet, "Pipelines de prospection" vs "Pipelines de vente"
- [ ] Performance : < 30 secondes pour workspace < 5 000 leads
- [ ] Progression d'audit affiche l'étape Leads si le domaine est sélectionné

---

## Dépendances

| Dépendance | Statut |
|---|---|
| EP-01 — OAuth + scope `crm.objects.leads.read` | ✅ Livré (scope à ajouter) |
| EP-17 — Sélection des domaines | ✅ Livré |
| EP-06 — Architecture deals (code à réutiliser) | ✅ Livré |
| EP-04 — Tableau de bord (score global) | ✅ Livré |

---

## Questions ouvertes

| Question | Décision proposée |
|---|---|
| Nom exact de la propriété de disqualification HubSpot ? | À vérifier sur un portail réel — `hs_lead_disqualification_reason` en priorité |
| Les stages "Qualified" incluent-ils "Converted" ? | Oui — tout stage terminal positif doit être couvert par L-13 |
| Seuil 30j pour L-01 et L-02 ? | Proposé 30j — à valider en beta |
| Seuil 5 stages pour L-06 ? | Proposé 5 — à valider en beta |
| Le scope `crm.objects.leads.read` est-il disponible sur tous les plans HubSpot ? | À vérifier — probablement Sales Hub Pro+ uniquement |
| Faut-il ajouter une règle sur le taux de conversion lead → deal (trop faible) ? | Reporté — nécessite un benchmark par secteur |
