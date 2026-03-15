# Prompt d'implémentation — EP-05 : Audit des contacts & doublons

> Copier-coller ce prompt dans une session Claude en mode Dev.

---

## Contexte

Tu vas implémenter l'epic EP-05 qui ajoute un nouveau domaine d'audit à HubSpot Auditor : l'audit des contacts. C'est le premier epic de couverture Phase 2. Il introduit 12 règles (C-01 à C-12), dont 8 migrées depuis le domaine Propriétés (ex-P7 à P11) et 4 nouvelles, incluant la feature phare de détection de doublons multi-critères.

L'app est fonctionnelle (EP-00 à EP-04 + EP-UX livrés). Le moteur d'audit existant (`src/lib/audit/`) gère déjà les propriétés (P1-P16) et les workflows (W1-W7). Tu vas ajouter un troisième domaine d'audit en suivant les mêmes patterns.

**Changement structurant :** les règles P7-P11 (propriétés système contacts) sont retirées de EP-02 et migrées vers EP-05 sous les IDs C-01 à C-05. La règle P12 reste dans EP-02 en attendant EP-05b.

## Documents de référence — à lire AVANT de coder

Lis ces documents intégralement avant de commencer :

1. **`product/prd/prd-05-audit-contacts.md`** — le PRD complet : problème, specs fonctionnelles (12 règles, algorithmes de normalisation, scoring, comptage), critères d'acceptance
2. **`product/epics/ep05-audit-contacts.md`** — l'epic : hypothèse, user stories Gherkin, edge cases, traductions business
3. **`product/prd/design-system-guidelines.md`** — tokens et composants UI (pour l'affichage des résultats)
4. **`product/prd/screens-and-flows.md`** — architecture de navigation et maquettes d'écrans

Consulte aussi `src/CLAUDE.md` pour les conventions et le skill `feature-implementation` dans `skills/tech/workflows/feature-implementation.md` pour le workflow à suivre.

**Fichiers à étudier impérativement avant de coder :**
- `src/lib/audit/engine.ts` — orchestrateur principal (comprendre `runAudit`, `runFullAudit`)
- `src/lib/audit/types.ts` — toutes les interfaces TypeScript
- `src/lib/audit/rules/system-properties.ts` — les règles P7-P11 actuelles (à migrer)
- `src/lib/audit/score.ts` — formule de scoring propriétés
- `src/lib/audit/global-score.ts` — formule du score global (à modifier : passer de 50/50 à pondération égale)
- `src/lib/audit/business-impact.ts` — impacts business statiques
- `src/app/api/audit/run/route.ts` — endpoint API d'exécution
- `src/components/audit/audit-results-view.tsx` — composant d'affichage des résultats

## Plan d'implémentation

Procéder dans cet ordre strict. Chaque phase doit être fonctionnelle avant de passer à la suivante.

### Phase 1 — Types et structure de données

**Objectif :** définir les interfaces TypeScript pour le domaine Contacts sans casser l'existant.

1. **Créer `src/lib/audit/rules/contacts.ts`** — fichier vide pour les futures règles
2. **Étendre `src/lib/audit/types.ts`** avec les nouvelles interfaces :
   - `ContactIssue` — problème unitaire (Hub ID, nom, email, etc.)
   - `DuplicateCluster` — cluster de doublons (critère, membres, taille)
   - `ContactAuditResults` — résultat complet du domaine Contacts (par règle C-01 à C-12)
   - Étendre `GlobalAuditResults` pour inclure `contactResults` et `contactScore`
3. **Créer `src/lib/audit/contact-score.ts`** — même formule standard que properties/workflows (critiques×5 cap -30, avertissements×2 cap -15, infos×0.5 cap -5)

### Phase 2 — Migration P7-P11 → C-01 à C-05

**Objectif :** déplacer les règles contacts de `system-properties.ts` vers `contacts.ts` sans changer la logique de détection.

1. **Copier** la logique des fonctions P7, P8, P9, P10a-d, P11 depuis `system-properties.ts` vers `contacts.ts`, en les renommant `runC01`, `runC02`, ..., `runC05`
2. **Adapter les noms et IDs** (P7→C-01, P8→C-02, etc.) dans les résultats retournés
3. **Changement de criticité C-05** (ex-P11) : passer de Critique à Info
4. **Retirer** les fonctions P7-P11 de `system-properties.ts` — elles ne doivent plus être appelées par le moteur propriétés
5. **Mettre à jour `score.ts`** pour ne plus compter P7-P11 dans le score Propriétés
6. **Tests de regression** : vérifier que l'ancien comportement est préservé (même logique, juste un domaine différent)

> ⚠️ **Point critique :** après cette phase, le score Propriétés va baisser mécaniquement (moins de règles). C'est attendu — le score Contacts compensera. Ne pas ajuster artificiellement le score Propriétés.

### Phase 3 — Nouvelles règles doublons (C-06, C-07, C-08)

**Objectif :** implémenter les algorithmes de normalisation et de clustering pour la détection de doublons.

1. **C-06 — Doublons email exact** :
   - Normaliser les emails : `lowercase → trim → strip sous-adressage (+alias avant @)`
   - Grouper par email normalisé
   - Créer un cluster pour chaque email ayant ≥ 2 contacts
   - Comptage : 1 problème = 1 cluster (critique)

2. **C-07 — Doublons nom+company** :
   - Concaténer firstname + lastname, lowercase, trim
   - Pour les contacts ayant la même company (par Hub ID) : calculer similarité Levenshtein normalisée
   - Seuil : similarité > 0.85
   - Fusionner les clusters transitifs (A~B, B~C → {A,B,C})
   - Désactiver si 0 company dans le workspace
   - Comptage : 1 problème = 1 cluster (avertissement)

3. **C-08 — Doublons téléphone** :
   - Normaliser les champs `phone` ET `mobilephone`
   - Supprimer caractères non-numériques (garder + initial), convertir +33→0, supprimer + restant
   - Filtrer les numéros < 8 chiffres (anti-faux-positifs)
   - Grouper par numéro normalisé (pool phone+mobilephone)
   - Comptage : 1 problème = 1 cluster (avertissement)

4. **Implémenter une fonction Levenshtein** (ou utiliser une lib légère) — vérifier s'il n'y en a pas déjà une dans le projet (P3 utilise Levenshtein pour les labels de propriétés)

### Phase 4 — Nouvelles règles qualité (C-09 à C-12)

**Objectif :** implémenter les 4 règles de qualité unitaires.

1. **C-09 — Email invalide** : regex de validation (voir PRD section 6.4), retourner les contacts avec email non-null mais format invalide
2. **C-10 — Contact stale** : `lastmodifieddate` > 365j ET lifecycle ≠ customer ET 0 deal open. Exclure contacts créés < 7j
3. **C-11 — Contact sans owner** : `hubspot_owner_id` null. Exclure contacts créés < 7j
4. **C-12 — Contact sans source** : `hs_analytics_source` null. Exclure contacts créés < 7j
5. Comptage : 1 problème par contact concerné (info pour C-10, C-11, C-12 ; avertissement pour C-09)

### Phase 5 — Orchestration et scoring

**Objectif :** intégrer le domaine Contacts dans le moteur d'audit et modifier le score global.

1. **Créer `src/lib/audit/contact-engine.ts`** (ou ajouter dans `engine.ts`) — orchestrateur du domaine Contacts :
   - Récupérer les contacts via l'API HubSpot (avec les propriétés nécessaires : email, firstname, lastname, lifecyclestage, hubspot_owner_id, hs_analytics_source, phone, mobilephone, lastmodifieddate, createdate)
   - Récupérer les associations contacts→deals et contacts→companies en batch
   - Vérifier le nombre de companies (activation/désactivation C-05, C-07)
   - Exécuter C-01 à C-12
   - Calculer le score Contacts
   - Retourner `ContactAuditResults`

2. **Modifier `engine.ts`** — ajouter l'appel à l'audit contacts dans `runFullAudit`

3. **Modifier `global-score.ts`** — passer de la pondération fixe 50/50 à pondération égale :
   ```
   domaines actifs = [propriétés, contacts, workflows].filter(score !== null)
   score_global = somme(scores) / nombre_domaines_actifs
   ```

4. **Mettre à jour `business-impact.ts`** avec les impacts business de C-01 à C-12 (voir epic section "Traductions business")

### Phase 6 — Stockage et API

**Objectif :** persister les résultats contacts et les exposer via l'API.

1. **Migration Supabase** — ajouter les colonnes à `audit_runs` :
   - `contact_results` (jsonb) — résultats complets C-01 à C-12
   - `contact_score` (integer) — score du domaine Contacts
   - Mettre à jour le calcul de `global_score` dans le code serveur

2. **Modifier `src/app/api/audit/run/route.ts`** — stocker les résultats contacts dans les nouvelles colonnes, recalculer `global_score`

3. **Mettre à jour les requêtes de lecture** (page audit results, page dashboard, rapport public) pour inclure `contact_results` et `contact_score`

### Phase 7 — Affichage des résultats

**Objectif :** ajouter la section Contacts dans l'interface de résultats d'audit.

1. **Étendre `audit-results-view.tsx`** — ajouter un onglet/section "Contacts" dans la navigation intra-page
2. **Créer les sous-composants spécifiques** :
   - Affichage des clusters de doublons (triés par taille décroissante) : tableau avec email/nom/phone normalisé, membres du cluster, taille
   - Affichage des règles de taux (C-01, C-03, C-05) : barre de progression avec seuil marker (réutiliser `ProgressBar`)
   - Affichage des règles lifecycle (C-04a-d) : preview 5 exemples + "Voir tous les N cas"
   - Affichage des règles qualité (C-09 à C-12) : listes paginées (réutiliser `PaginatedList`)
3. **Section Impact business** — encarts par thème business (réutiliser le pattern existant de EP-02/EP-03)
4. **Score circle Contacts** — dans l'en-tête de section (réutiliser `ScoreCircle`)
5. **Mettre à jour le rapport public** pour inclure la section Contacts

### Phase 8 — Edge cases et polish

**Objectif :** gérer tous les cas limites documentés dans le PRD.

1. **Workspace avec 0 contact** : domaine non affiché, poids redistribué, mention dans les métadonnées
2. **Workspace B2C (0 company)** : C-05 et C-07 désactivées avec message explicatif
3. **Grace period 7j** : vérifier que C-10, C-11, C-12 excluent bien les contacts récents
4. **C-06 normalisation** : tester le strip du sous-adressage (+alias)
5. **C-08 normalisation** : tester le minimum 8 chiffres, la conversion +33→0
6. **Pagination** : vérifier que les listes > 20 items sont paginées
7. **Performance** : tester sur un workspace de taille conséquente, optimiser les appels batch si nécessaire

## Règles à respecter pendant toute l'implémentation

- **Suivre les patterns existants** — le domaine Contacts doit suivre la même architecture que Propriétés et Workflows (types, rules, score, engine, business-impact)
- **Non-destructif absolu** — aucune requête en écriture à l'API HubSpot (GET et POST search uniquement)
- **Regression testing** — les règles C-01 à C-05 doivent produire exactement les mêmes résultats que les anciennes P7-P11
- **Zéro couleur hex en dur** — uniquement les classes Tailwind du design system
- **Ne pas modifier la logique des domaines Propriétés et Workflows** au-delà du retrait de P7-P11 et de la modification du score global
- **Ne pas créer de fichiers dans `product/`**
- **Commiter à chaque phase** avec le format : `feat(EP-05): phase N — [description]`
