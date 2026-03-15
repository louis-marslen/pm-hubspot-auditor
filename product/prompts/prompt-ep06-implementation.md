# Prompt d'implémentation — EP-06 : Audit des deals & pipelines

> Copier-coller ce prompt dans une session Claude en mode Dev.

---

## Contexte

Tu vas implémenter l'epic EP-06 qui ajoute un nouveau domaine d'audit à HubSpot Auditor : l'audit des deals et pipelines. C'est le troisième epic de couverture Phase 2 (après EP-05 Contacts et EP-05b Companies). Il introduit 15 règles (D-01 à D-15), dont 4 migrées depuis le domaine Propriétés (ex-P13 à P16) et 11 nouvelles, incluant deux features phares : la détection de deals bloqués par stage et l'audit structurel des pipelines.

L'app est fonctionnelle (EP-00 à EP-04 + EP-UX + EP-05 + EP-05b livrés). Le moteur d'audit existant (`src/lib/audit/`) gère déjà les propriétés (P1-P6 + P12), les contacts (C-01 à C-12), les companies (CO-01 à CO-08) et les workflows (W1-W7). Tu vas ajouter un cinquième domaine d'audit en suivant les mêmes patterns.

**Changements structurants :**
- Les règles P13-P16 (propriétés système deals) sont retirées de EP-02 et migrées vers EP-06 sous les IDs D-01 à D-04
- Le calcul du score global passe à une pondération renforcée pour les Deals (coefficient 1.5, les autres domaines restent à 1.0)
- L'analyse de l'historique de stages utilise les propriétés HubSpot `hs_date_entered_{stage_id}` (pas l'API d'historique)

## Documents de référence — à lire AVANT de coder

Lis ces documents intégralement avant de commencer :

1. **`product/prd/prd-06-audit-deals.md`** — le PRD complet : problème, specs fonctionnelles (15 règles, algorithmes, scoring, comptage), critères d'acceptance
2. **`product/epics/ep06-audit-deals.md`** — l'epic : hypothèse, user stories Gherkin, edge cases, traductions business
3. **`product/prd/design-system-guidelines.md`** — tokens et composants UI (pour l'affichage des résultats)
4. **`product/prd/screens-and-flows.md`** — architecture de navigation, maquettes d'écrans, section Deals

Consulte aussi `src/CLAUDE.md` pour les conventions et le skill `feature-implementation` dans `skills/tech/workflows/feature-implementation.md` pour le workflow à suivre.

**Fichiers à étudier impérativement avant de coder :**
- `src/lib/audit/engine.ts` — orchestrateur principal (comprendre comment les domaines sont appelés)
- `src/lib/audit/types.ts` — toutes les interfaces TypeScript
- `src/lib/audit/rules/system-properties.ts` — les règles P13-P16 actuelles (à migrer)
- `src/lib/audit/rules/contacts.ts` — pattern de référence pour un domaine d'audit
- `src/lib/audit/rules/companies.ts` — second pattern de référence
- `src/lib/audit/score.ts` — formule de scoring propriétés (à mettre à jour pour retirer P13-P16)
- `src/lib/audit/global-score.ts` — formule du score global (à modifier : pondération renforcée)
- `src/lib/audit/business-impact.ts` — impacts business statiques
- `src/app/api/audit/run/route.ts` — endpoint API d'exécution
- `src/components/audit/audit-results-view.tsx` — composant d'affichage des résultats

## Plan d'implémentation

Procéder dans cet ordre strict. Chaque phase doit être fonctionnelle avant de passer à la suivante.

### Phase 1 — Types et structure de données

**Objectif :** définir les interfaces TypeScript pour le domaine Deals sans casser l'existant.

1. **Créer `src/lib/audit/rules/deals.ts`** — fichier vide pour les futures règles deals
2. **Créer `src/lib/audit/rules/pipelines.ts`** — fichier séparé pour les règles de configuration pipeline
3. **Étendre `src/lib/audit/types.ts`** avec les nouvelles interfaces :
   - `DealIssue` — problème unitaire sur un deal (Hub ID, nom, pipeline, stage, amount, owner, etc.)
   - `PipelineIssue` — problème sur un pipeline (nom, nombre stages, taux phases sautées, etc.)
   - `StageIssue` — problème sur un stage (nom, pipeline, position, dernière activité)
   - `BlockedDealGroup` — groupe de deals bloqués (pipeline > stage > deals)
   - `DealAuditResults` — résultat complet du domaine Deals (par règle D-01 à D-15)
   - Étendre `GlobalAuditResults` pour inclure `dealResults` et `dealScore`
4. **Créer `src/lib/audit/deal-score.ts`** — même formule standard (critiques×5 cap -30, avertissements×2 cap -15, infos×0.5 cap -5)

### Phase 2 — Migration P13-P16 → D-01 à D-04

**Objectif :** déplacer les règles deals de `system-properties.ts` vers `deals.ts` sans changer la logique de détection.

1. **Copier** la logique des fonctions P13, P14, P15, P16 depuis `system-properties.ts` vers `deals.ts`, en les renommant `runD01`, `runD02`, `runD03`, `runD04`
2. **Adapter les noms et IDs** (P13→D-01, P14→D-02, P15→D-03, P16→D-04) dans les résultats retournés
3. **Retirer** les fonctions P13-P16 de `system-properties.ts` — elles ne doivent plus être appelées par le moteur propriétés
4. **Mettre à jour `score.ts`** pour ne plus compter P13-P16 dans le score Propriétés
5. **Tests de regression** : vérifier que l'ancien comportement est préservé (même logique, juste un domaine différent)

> ⚠️ **Point critique :** après cette phase, le score Propriétés va baisser mécaniquement (moins de règles). C'est attendu — le score Deals compensera. Ne pas ajuster artificiellement le score Propriétés.

### Phase 3 — Nouvelle règle feature phare : deals bloqués (D-05)

**Objectif :** implémenter la détection de deals dont le stage n'a pas changé depuis > 60 jours.

1. **Récupérer les propriétés `hs_date_entered_{stage_id}`** pour chaque deal open
   - Pour chaque pipeline actif, récupérer la liste des stages → identifier les propriétés `hs_date_entered_*` correspondantes
   - Inclure ces propriétés dans la requête de recherche des deals (champ `properties` du POST search)
2. **Implémenter la logique de détection** :
   - Pour chaque deal open, trouver la date d'entrée dans son stage actuel via `hs_date_entered_{current_stage_id}`
   - Si cette date est absente, utiliser `lastmodifieddate` comme fallback
   - Si (date_audit - date_entrée) > 60 jours → deal bloqué
3. **Regrouper** les résultats par pipeline > stage > deals (structure `BlockedDealGroup`)
4. **Trier** par ancienneté dans le stage décroissante

### Phase 4 — Règles qualité données deals (D-08 à D-11)

**Objectif :** implémenter les 4 règles de qualité des données deals.

1. **D-08 — Deal sans owner** : `hubspot_owner_id` null/vide sur deals open
2. **D-09 — Deal sans contact associé** : récupérer les associations deal→contacts en batch, signaler les deals open avec 0 association. Trier par montant décroissant (null en dernier)
3. **D-10 — Deal sans company associée** : idem avec associations deal→companies. Désactiver si 0 company dans le workspace
4. **D-11 — Deal avec montant à 0** : deals open avec `amount` exactement = 0 (distinct de null)

### Phase 5 — Règles audit configuration pipeline (D-06, D-07, D-12 à D-15)

**Objectif :** implémenter les 6 règles d'audit structurel des pipelines. C'est la phase la plus complexe.

1. **D-06 — Pipeline sans activité récente** : 0 deal open ET 0 deal créé dans les 90 derniers jours
2. **D-07 — Pipeline avec trop de stages** : > 8 stages actifs (hors stages avec `metadata.isClosed = true`)
3. **D-12 — Phases sautées** :
   - Récupérer l'ordre séquentiel des stages par pipeline (`displayOrder`)
   - Pour chaque deal (ayant traversé ≥ 2 stages via `hs_date_entered_*`), comparer le parcours réel à l'ordre attendu
   - Calculer le taux de deals avec ≥ 1 phase sautée par pipeline
   - Déclencher si taux > 20%
4. **D-13 — Points d'entrée multiples** :
   - Identifier le premier stage de chaque pipeline (displayOrder le plus bas)
   - Pour chaque deal, identifier le premier stage traversé chronologiquement via `hs_date_entered_*`
   - Calculer le taux d'entrées non standard par pipeline
   - Déclencher si taux > 20%
5. **D-14 — Stages fermés redondants** :
   - Pour chaque pipeline, compter les stages avec `metadata.probability` = 1.0 (won) et 0.0 (lost)
   - Déclencher si count > 1 pour won OU lost
6. **D-15 — Stage sans activité 90j** :
   - Pour chaque stage actif (non fermé), vérifier s'il y a un deal open OU un deal avec `hs_date_entered_{stage_id}` dans les 90 derniers jours
   - Exclure les pipelines déjà détectés par D-06

### Phase 6 — Scoring et intégration score global

**Objectif :** calculer le score Deals et modifier la formule du score global.

1. **Implémenter `deal-score.ts`** : formule standard (100 − critiques×5 − avertissements×2 − infos×0.5, avec plafonds)
2. **Modifier `global-score.ts`** :
   - Passer de la moyenne simple à la moyenne pondérée
   - Deals : coefficient 1.5
   - Tous les autres domaines : coefficient 1.0
   - Si un domaine est inactif, retirer son poids du dénominateur
3. **Comptage des problèmes** — respecter strictement la table du PRD section 6.6 :
   - D-01, D-02 : 1 problème unique si seuil franchi
   - D-03, D-05, D-08, D-09, D-10, D-11 : 1 par deal
   - D-04 : 1 par deal
   - D-06, D-07, D-12, D-13, D-14 : 1 par pipeline
   - D-15 : 1 par stage
4. **Activation conditionnelle** : domaine actif si ≥ 1 deal dans le workspace

### Phase 7 — Intégration moteur d'audit

**Objectif :** brancher le domaine Deals dans l'orchestrateur d'audit existant.

1. **Modifier `engine.ts`** :
   - Ajouter l'appel au module deals dans `runFullAudit`
   - Placer l'exécution après companies, avant workflows
   - Passer les pipelines et stages récupérés en amont (pour éviter les appels redondants)
2. **Modifier `route.ts`** (endpoint API) : inclure `dealResults` et `dealScore` dans la réponse
3. **Ajouter les impacts business** dans `business-impact.ts` selon la table du PRD section 6.8
4. **Mettre à jour la progression d'audit** : ajouter l'étape "Analyse des deals & pipelines"

### Phase 8 — Affichage des résultats (frontend)

**Objectif :** afficher les résultats deals dans l'interface avec les patterns UI existants.

1. **Ajouter l'onglet "Deals"** dans la navigation intra-page (entre Contacts et Companies)
2. **Créer le composant de section Deals** en suivant le pattern des sections Contacts/Companies :
   - Header de section avec ScoreCircle + décompte
   - Bloc "Complétude données" : barres de progression pour D-01/D-02, listes paginées pour D-03/D-04/D-11
   - Bloc "Deals bloqués" (D-05) : pattern hiérarchique pipeline > stage > deals
   - Bloc "Qualité associations" (D-08, D-09, D-10) : listes paginées standard
   - Bloc "Santé des pipelines" (D-06, D-07, D-12-D-15) : regroupement par pipeline
3. **Mettre à jour le Hero** : ajouter le sous-score Deals entre Contacts et Companies
4. **Mettre à jour la progression** : ajouter l'étape "Analyse des deals & pipelines"
5. **Empty state** : si 0 deal, ne pas afficher l'onglet

### Phase 9 — Polish et edge cases

**Objectif :** gérer les cas limites et valider la qualité.

1. **Edge cases à tester** :
   - Workspace avec 1 seul pipeline → pas de regroupement par pipeline dans le bloc santé
   - Workspace avec 0 company → D-10 désactivée
   - Pipeline avec stages réorganisés récemment → vérifier D-12 ne produit pas de faux positifs
   - Deals très anciens sans propriétés `hs_date_entered_*` → fallback `lastmodifieddate`
   - Pipeline avec tous les deals closed → D-06 se déclenche, D-05 ne se déclenche pas (0 deal open)
2. **Pagination** : vérifier que toutes les listes > 20 items sont paginées
3. **Rapport public** : vérifier que la section Deals s'affiche correctement dans le rapport partagé
4. **Performance** : vérifier que l'audit deals < 60s sur un workspace < 10 000 deals

## Règles à respecter pendant toute l'implémentation

- **Non-destructif absolu** : aucune requête POST/PUT/DELETE/PATCH vers l'API HubSpot. Uniquement GET et POST search (lecture)
- **Ne pas toucher** les règles des autres domaines (contacts, companies, workflows, propriétés custom P1-P6)
- **Retirer P13-P16** de `system-properties.ts` et du scoring propriétés — c'est la seule modification autorisée sur EP-02
- **Convention de commit** : `feat(EP-06): phase N — description`
- **Respecter le design system** : utiliser les composants existants (ScoreCircle, SeverityBadge, RuleCard, ProgressBar, PaginatedList)
- **Batch les appels API** : récupérer les propriétés `hs_date_entered_*` en une seule requête search, pas un appel par deal
- **Pas de nouvelle dépendance npm** sauf si absolument nécessaire
