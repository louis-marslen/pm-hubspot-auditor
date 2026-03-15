# Prompt d'implémentation — EP-05b : Audit des companies

> Copier-coller ce prompt dans une session Claude en mode Dev.

---

## Contexte

Tu vas implémenter l'epic EP-05b qui ajoute un quatrième domaine d'audit à HubSpot Auditor : l'audit des companies. Il introduit 8 règles (CO-01 à CO-08), dont 1 migrée depuis le domaine Propriétés (ex-P12) et 7 nouvelles, incluant la détection de doublons par domain et par nom d'entreprise avec normalisation des suffixes juridiques.

**Prérequis :** EP-05 (Audit des contacts) doit être livré. Le moteur d'audit gère déjà 3 domaines (Propriétés, Contacts, Workflows) avec pondération égale du score global. Tu vas ajouter un quatrième domaine en suivant les mêmes patterns.

**Changement structurant :** la règle P12 (taux domain insuffisant) est retirée de EP-02 et migrée vers EP-05b sous l'ID CO-01.

## Documents de référence — à lire AVANT de coder

Lis ces documents intégralement avant de commencer :

1. **`product/prd/prd-05b-audit-companies.md`** — le PRD complet : problème, specs fonctionnelles (8 règles, algorithmes de normalisation, scoring), critères d'acceptance
2. **`product/epics/ep05b-audit-companies.md`** — l'epic : hypothèse, user stories Gherkin, edge cases, traductions business
3. **`product/prd/design-system-guidelines.md`** — tokens et composants UI
4. **`product/prd/screens-and-flows.md`** — architecture de navigation et maquettes d'écrans

Consulte aussi `src/CLAUDE.md` pour les conventions et le skill `feature-implementation` dans `skills/tech/workflows/feature-implementation.md` pour le workflow à suivre.

**Fichiers à étudier impérativement avant de coder (patterns à réutiliser de EP-05) :**
- `src/lib/audit/rules/contacts.ts` — pattern des règles contacts (doublons, qualité, normalisation)
- `src/lib/audit/contact-score.ts` — pattern du scoring par domaine
- `src/lib/audit/types.ts` — interfaces ContactAuditResults (à dupliquer pour Companies)
- `src/lib/audit/engine.ts` — orchestrateur (voir comment Contacts a été intégré)
- `src/lib/audit/global-score.ts` — pondération égale (déjà en place, ajouter le 4e domaine)
- `src/lib/audit/rules/system-properties.ts` — règle P12 actuelle (à migrer)

## Plan d'implémentation

Procéder dans cet ordre strict. Chaque phase doit être fonctionnelle avant de passer à la suivante.

### Phase 1 — Types et structure de données

**Objectif :** définir les interfaces TypeScript pour le domaine Companies.

1. **Créer `src/lib/audit/rules/companies.ts`** — fichier vide pour les futures règles
2. **Étendre `src/lib/audit/types.ts`** avec les nouvelles interfaces :
   - `CompanyIssue` — problème unitaire (Hub ID, nom, domain, etc.)
   - `CompanyDuplicateCluster` — cluster de doublons companies (critère, membres, taille, contacts/deals associés)
   - `CompanyAuditResults` — résultat complet du domaine Companies (par règle CO-01 à CO-08)
   - Étendre `GlobalAuditResults` pour inclure `companyResults` et `companyScore`
3. **Créer `src/lib/audit/company-score.ts`** — même formule standard (réutiliser le pattern de `contact-score.ts`)

### Phase 2 — Migration P12 → CO-01

**Objectif :** déplacer la règle P12 de `system-properties.ts` vers `companies.ts`.

1. **Copier** la logique de P12 depuis `system-properties.ts` vers `companies.ts`, en la renommant `runCO01`
2. **Adapter les noms et IDs** (P12→CO-01) dans les résultats retournés
3. **Retirer** la fonction P12 de `system-properties.ts`
4. **Mettre à jour `score.ts`** pour ne plus compter P12 dans le score Propriétés
5. **Tests de regression** : vérifier que CO-01 produit les mêmes résultats que P12

### Phase 3 — Règles doublons (CO-02, CO-03)

**Objectif :** implémenter la normalisation domain et la normalisation noms d'entreprise avec strip des suffixes juridiques.

1. **CO-02 — Doublons domain exact** :
   - Normaliser les domains : `lowercase → trim → strip "www." au début`
   - Exclure les companies sans domain
   - Grouper par domain normalisé
   - Créer un cluster pour chaque domain ayant ≥ 2 companies
   - Pour chaque company dans un cluster : inclure le nombre de contacts et deals associés
   - Comptage : 1 problème = 1 cluster (critique)

2. **CO-03 — Doublons nom entreprise** :
   - Normaliser les noms : `lowercase → trim → strip suffixes juridiques → re-trim`
   - Suffixes à supprimer (regex insensible à la casse, en fin de chaîne) :
     - `\b(sas|sarl|sa|eurl|sasu|sci)\b` (FR)
     - `\b(ltd|limited|inc|incorporated|corp|corporation)\b` (UK/US)
     - `\b(gmbh|ag|ug)\b` (DE)
     - `\b(llc|llp|lp)\b` (US)
     - `\b(bv|nv)\b` (NL)
     - Points et virgules associés (ex. "Ltd." → supprimé)
   - Exclure les companies sans nom
   - Calculer similarité Levenshtein normalisée entre toutes les paires, seuil > 0.85
   - Fusionner les clusters transitifs
   - Réutiliser la fonction Levenshtein de EP-05 (C-07)
   - Comptage : 1 problème = 1 cluster (avertissement)

### Phase 4 — Règles qualité (CO-04 à CO-08)

**Objectif :** implémenter les 5 règles de qualité companies.

1. **CO-04 — Company sans contact** : 0 contact associé ET `createdate` > 90 jours. Comptage : 1 par company (avertissement)
2. **CO-05 — Company sans owner** : `hubspot_owner_id` null. Comptage : 1 par company (info)
3. **CO-06 — Company sans industrie** : `industry` null. Comptage : 1 par company (info)
4. **CO-07 — Company sans dimensionnement** : `numberofemployees` ET `annualrevenue` tous deux null. Comptage : 1 par company (info)
5. **CO-08 — Company stale** : `lastmodifieddate` > 365j ET 0 deal open ET 0 contact avec `lastmodifieddate` < 365j. Nécessite les associations company→contacts et company→deals. Comptage : 1 par company (info)

### Phase 5 — Orchestration et scoring

**Objectif :** intégrer le domaine Companies dans le moteur d'audit.

1. **Créer `src/lib/audit/company-engine.ts`** (ou ajouter dans `engine.ts`) — orchestrateur du domaine Companies :
   - Vérifier le nombre de companies (condition d'activation : ≥ 1)
   - Récupérer les companies via l'API HubSpot (propriétés : name, domain, industry, numberofemployees, annualrevenue, hubspot_owner_id, lastmodifieddate, createdate)
   - Récupérer les associations companies→contacts et companies→deals en batch
   - Exécuter CO-01 à CO-08
   - Calculer le score Companies
   - Retourner `CompanyAuditResults` (ou null si 0 company)

2. **Modifier `engine.ts`** — ajouter l'appel à l'audit companies dans `runFullAudit`

3. **Modifier `global-score.ts`** — ajouter le domaine Companies dans la pondération égale :
   ```
   domaines actifs = [propriétés, contacts, companies, workflows].filter(score !== null)
   score_global = somme(scores) / nombre_domaines_actifs
   ```

4. **Mettre à jour `business-impact.ts`** avec les impacts business de CO-01 à CO-08 (voir epic section "Traductions business")

### Phase 6 — Stockage et API

**Objectif :** persister les résultats companies et les exposer via l'API.

1. **Migration Supabase** — ajouter les colonnes à `audit_runs` :
   - `company_results` (jsonb) — résultats complets CO-01 à CO-08
   - `company_score` (integer) — score du domaine Companies
   - Recalculer `global_score` avec 4 domaines

2. **Modifier `src/app/api/audit/run/route.ts`** — stocker les résultats companies, recalculer `global_score`

3. **Mettre à jour les requêtes de lecture** (page audit results, dashboard, rapport public) pour inclure `company_results` et `company_score`

### Phase 7 — Affichage des résultats

**Objectif :** ajouter la section Companies dans l'interface de résultats d'audit.

1. **Étendre `audit-results-view.tsx`** — ajouter un onglet/section "Companies" dans la navigation intra-page
2. **Créer les sous-composants** (réutiliser les patterns de EP-05) :
   - Clusters de doublons (triés par taille décroissante) : pour chaque company dans un cluster, afficher le nombre de contacts et deals associés (aide à décider laquelle conserver)
   - Règle de taux CO-01 : barre de progression avec seuil marker (réutiliser `ProgressBar`)
   - Règles qualité CO-04 à CO-08 : listes paginées (réutiliser `PaginatedList`)
3. **Section Impact business** — encarts par thème business
4. **Score circle Companies** — dans l'en-tête de section
5. **Mettre à jour le rapport public** pour inclure la section Companies

### Phase 8 — Edge cases et polish

**Objectif :** gérer tous les cas limites documentés dans le PRD.

1. **Workspace avec 0 company** : domaine non affiché, poids redistribué, mention dans les métadonnées
2. **CO-04 grace period 90j** : vérifier que les companies récentes sont exclues
3. **CO-08 activité contacts** : vérifier que la logique d'activité récente des contacts associés fonctionne
4. **CO-03 suffixes juridiques** : tester les variantes (SAS, S.A.S., sas, Ltd., LLC, GmbH, etc.)
5. **CO-02 normalisation domain** : tester www.acme.com → acme.com, WWW.Acme.com → acme.com
6. **Pagination** : vérifier que les listes > 20 items sont paginées
7. **Score global à 4 domaines** : vérifier que la redistribution fonctionne correctement quand un domaine est absent

## Règles à respecter pendant toute l'implémentation

- **Réutiliser les patterns de EP-05** — le domaine Companies doit suivre exactement la même architecture que Contacts (types, rules, score, engine, business-impact)
- **Réutiliser les utilitaires de EP-05** — fonction Levenshtein, composants UI de clusters, patterns de normalisation
- **Non-destructif absolu** — aucune requête en écriture à l'API HubSpot
- **Regression testing** — CO-01 doit produire exactement les mêmes résultats que l'ancienne P12
- **Zéro couleur hex en dur** — uniquement les classes Tailwind du design system
- **Ne pas modifier la logique des autres domaines** au-delà du retrait de P12 et de l'ajout du 4e domaine dans le score global
- **Ne pas créer de fichiers dans `product/`**
- **Commiter à chaque phase** avec le format : `feat(EP-05b): phase N — [description]`
