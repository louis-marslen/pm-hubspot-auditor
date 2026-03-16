# Prompt d'implémentation — EP-09 : Audit des utilisateurs & équipes

> Copier-coller ce prompt dans une session Claude en mode Dev.

---

## Contexte

Tu vas implémenter l'epic EP-09 qui ajoute un cinquième domaine d'audit à HubSpot Auditor : l'audit des utilisateurs et des équipes. C'est le premier domaine orienté **gouvernance/sécurité** (vs qualité des données pour les 4 précédents). Il introduit 7 règles scorées (U-01 à U-07) et 2 recommandations non scorées (R1, R2).

**Prérequis :** EP-05, EP-05b et EP-UX-02 sont livrés. Le moteur d'audit gère déjà 4 domaines (Propriétés, Contacts, Companies, Workflows) avec pondération égale du score global et progression temps réel. Tu vas ajouter un cinquième domaine en suivant les mêmes patterns.

**Spécificités de ce domaine :**
- Utilise les API **Settings** (`/settings/v3/users/`, `/settings/v3/users/teams`, `/settings/v3/users/roles`) et **Owners** (`/crm/v3/owners/`) — ce sont des API différentes de celles utilisées jusqu'ici (CRM objects)
- U-05 (utilisateurs inactifs) a un **dual mode** : Enterprise (login history API) avec fallback automatique en mode standard (owners sans objet CRM)
- Inclut une **section "Recommandations complémentaires"** non scorée — un nouveau pattern UI (encart informatif distinct des règles)
- Les scopes OAuth `settings.users.read` et `account-info.security.read` doivent être ajoutés à la configuration OAuth (EP-01)

## Documents de référence — à lire AVANT de coder

Lis ces documents intégralement avant de commencer :

1. **`product/prd/prd-09-audit-utilisateurs-equipes.md`** — le PRD complet : specs fonctionnelles (7 règles, seuils adaptatifs U-02, dual mode U-05, recommandations R1/R2, scoring), critères d'acceptance
2. **`product/epics/ep09-audit-utilisateurs-equipes.md`** — l'epic : hypothèse, user stories Gherkin, edge cases, traductions business, appels API détaillés
3. **`product/prd/design-system-guidelines.md`** — tokens et composants UI
4. **`product/prd/screens-and-flows.md`** — architecture de navigation et maquettes d'écrans

Consulte aussi `src/CLAUDE.md` pour les conventions et le skill `feature-implementation` dans `skills/tech/workflows/feature-implementation.md` pour le workflow à suivre.

**Fichiers à étudier impérativement avant de coder (patterns à réutiliser) :**
- `src/lib/audit/engine.ts` — orchestrateur principal (voir comment les 4 domaines sont intégrés dans `runFullAudit`)
- `src/lib/audit/types.ts` — interfaces TypeScript (dupliquer le pattern pour Users)
- `src/lib/audit/contact-engine.ts` — pattern d'orchestrateur par domaine (le plus proche de ce que tu vas créer)
- `src/lib/audit/contact-score.ts` — pattern du scoring par domaine
- `src/lib/audit/global-score.ts` — pondération égale (ajouter le 5e domaine)
- `src/lib/audit/progress.ts` — progression temps réel (ajouter le domaine "users")
- `src/lib/audit/business-impact.ts` — impacts business statiques
- `src/lib/audit/rules/contacts.ts` — pattern des règles (structure, retour)
- `src/app/api/audit/run/route.ts` — endpoint API d'exécution (fire-and-forget)
- `src/app/api/audit/[auditId]/status/route.ts` — endpoint de polling
- `src/components/audit/audit-results-view.tsx` — composant d'affichage des résultats
- `src/components/audit/audit-progress-tracker.tsx` — tracker de progression (ajouter le domaine)

## Plan d'implémentation

Procéder dans cet ordre strict. Chaque phase doit être fonctionnelle avant de passer à la suivante.

### Phase 1 — Types et structure de données

**Objectif :** définir les interfaces TypeScript pour le domaine Utilisateurs & Équipes.

1. **Créer `src/lib/audit/rules/users.ts`** — fichier vide pour les futures règles
2. **Étendre `src/lib/audit/types.ts`** avec les nouvelles interfaces :
   - `UserIssue` — problème unitaire (userId, email, nom, rôle, équipe, date de création)
   - `TeamIssue` — problème unitaire équipe (teamId, nom)
   - `RoleDistribution` — répartition des rôles (roleId, roleName, count, percentage)
   - `UserAuditResults` — résultat complet du domaine (par règle U-01 à U-07, avec champs pour R1 et R2)
   - Étendre `GlobalAuditResults` pour inclure `userResults` et `userScore`
3. **Créer `src/lib/audit/user-score.ts`** — même formule standard que les autres domaines :
   ```
   score = 100 - (critiques×5 cap -30) - (avertissements×2 cap -15) - (infos×0.5 cap -5)
   score = max(0, score)
   ```

### Phase 2 — Client API Settings & Owners

**Objectif :** créer les fonctions d'appel aux API HubSpot Settings et Owners (nouvelles API, pas encore utilisées dans le projet).

1. **Créer `src/lib/hubspot/settings-api.ts`** — client pour les API Settings :
   - `fetchUsers(accessToken)` → liste tous les utilisateurs (paginated) avec userId, email, firstName, lastName, roleId, roleIds, superAdmin, primaryTeamId, secondaryTeamIds
   - `fetchTeams(accessToken)` → liste toutes les équipes avec id, name, userIds, secondaryUserIds
   - `fetchRoles(accessToken)` → liste tous les rôles avec id, name
   - `fetchLoginHistory(accessToken)` → tente `GET /account-info/v3/activity/login` ; si 403/404, retourne `null` (mode non-Enterprise détecté)

2. **Réutiliser le client Owners existant** ou l'étendre :
   - `fetchOwners(accessToken, archived=false)` → liste les owners actifs avec id, email, firstName, lastName, createdAt, updatedAt, archived

3. **Gestion des erreurs** :
   - Si `settings.users.read` scope manquant → 403 attendu → retourner une erreur typée `SCOPE_MISSING`
   - Si `account-info.security.read` non disponible → 403 → fallback silencieux (pas d'erreur visible)
   - Rate limiting : réutiliser le pattern existant (backoff exponentiel)

### Phase 3 — Règles de gouvernance (U-01 à U-04)

**Objectif :** implémenter les 4 règles de gouvernance des accès et de structure des équipes.

1. **U-01 — Utilisateur sans équipe** (🟡 Avertissement) :
   - Condition : `primaryTeamId` null ET `secondaryTeamIds` vide
   - Retour : liste des utilisateurs concernés (email, nom, rôle, date création)
   - Comptage : 1 problème par utilisateur

2. **U-02 — Super Admins en excès** (🔴 Critique) :
   - Seuils adaptatifs :
     - ≤ 5 utilisateurs : > 2 Super Admins
     - 6-15 utilisateurs : > 3 Super Admins OU > 20%
     - > 15 utilisateurs : > 20% OU > 5 Super Admins
   - Retour : nombre SA, total users, taux, seuil applicable, liste des SA
   - Comptage : 1 problème unique si seuil franchi

3. **U-03 — Utilisateur sans rôle** (🟡 Avertissement) :
   - Condition : `roleId` null ET `superAdmin` false
   - Retour : liste des utilisateurs concernés
   - Comptage : 1 problème par utilisateur

4. **U-04 — Absence de différenciation des rôles** (🟡 Avertissement) :
   - Exclure les Super Admins du calcul
   - Grouper par roleId (null = un groupe)
   - Déclencher si > 80% dans le même groupe
   - Désactivée si ≤ 3 utilisateurs non-SA
   - Retour : répartition complète des rôles (nom, count, %)
   - Comptage : 1 problème unique si seuil franchi

### Phase 4 — Règles d'hygiène des comptes (U-05 à U-07)

**Objectif :** implémenter la détection d'inactivité (dual mode) et les rules d'équipes/owners.

1. **U-05 — Utilisateur inactif** (🔴 Critique) :

   **Mode Enterprise** (si `fetchLoginHistory` retourne des données) :
   - Pour chaque utilisateur actif, vérifier s'il a une connexion réussie (`loginSucceeded: true`) dans les 90 derniers jours
   - Si aucune connexion → inactif
   - Grace period : exclure les comptes créés < 30 jours

   **Mode standard** (si `fetchLoginHistory` retourne `null`) :
   - Pour chaque owner non-archived avec `createdAt` > 90 jours :
     - Vérifier s'il possède au moins 1 contact, deal ou company (via search API avec `hubspot_owner_id` filter, limit=1)
     - Si 0 objets CRM → potentiellement inactif
   - Court-circuiter : dès qu'un objet est trouvé, passer au owner suivant
   - Grace period : exclure les comptes créés < 30 jours
   - **Optimisation** : batcher les appels search. Maximum 100 owners vérifiés (au-delà, tronquer et mentionner)

   **Important :** stocker un flag `isEnterprise: boolean` dans les résultats pour que le frontend affiche le bon disclaimer.

2. **U-06 — Équipe vide** (🔵 Info) :
   - Condition : `userIds.length === 0 && secondaryUserIds.length === 0`
   - Retour : liste des équipes vides (nom, id)
   - Comptage : 1 problème par équipe

3. **U-07 — Owner sans objet CRM** (🔵 Info) :
   - Condition : owner non-archived + 0 contacts + 0 deals + 0 companies assignés
   - Réutiliser la même vérification que U-05 mode standard (factoriser la logique)
   - Retour : liste des owners concernés (email, nom, rôle, équipe, date création)
   - Comptage : 1 problème par owner

### Phase 5 — Orchestration et scoring

**Objectif :** intégrer le domaine Utilisateurs & Équipes dans le moteur d'audit.

1. **Créer `src/lib/audit/user-engine.ts`** — orchestrateur du domaine :
   - Vérifier la condition d'activation : ≥ 2 utilisateurs
   - Appeler `fetchUsers`, `fetchTeams`, `fetchRoles`
   - Tenter `fetchLoginHistory` (fallback silencieux si non-Enterprise)
   - Appeler `fetchOwners` (pour U-05 standard et U-07)
   - Exécuter U-01 à U-07
   - Calculer le score via `user-score.ts`
   - Retourner `UserAuditResults` (ou null si < 2 utilisateurs)
   - Gestion d'erreur : si scope manquant, retourner une erreur typée (pas un crash)

2. **Modifier `src/lib/audit/engine.ts`** — ajouter l'appel à l'audit utilisateurs dans `runFullAudit` :
   - Exécuter le domaine Users après les domaines existants (ou en parallèle si indépendant)
   - Intégrer dans la gestion de progression (substeps: fetching → analyzing → scoring)

3. **Modifier `src/lib/audit/global-score.ts`** — ajouter le 5e domaine :
   ```
   domaines actifs = [propriétés, contacts, companies, workflows, utilisateurs].filter(score !== null)
   score_global = somme(scores) / nombre_domaines_actifs
   ```

4. **Modifier `src/lib/audit/progress.ts`** — ajouter le domaine "users" :
   - Ajouter un domaine dans `initProgress()` avec les 3 substeps (fetching, analyzing, scoring)
   - Recalculer `globalProgress` avec le nouveau nombre de domaines

5. **Mettre à jour `src/lib/audit/business-impact.ts`** avec les impacts business de U-01 à U-07 (voir epic section "Traductions business")

### Phase 6 — Scopes OAuth

**Objectif :** ajouter les scopes nécessaires à la configuration OAuth.

1. **Identifier le fichier de configuration OAuth** (probablement dans `src/lib/hubspot/` ou `src/app/api/hubspot/`) — ajouter les scopes :
   - `settings.users.read` — obligatoire pour le domaine
   - `crm.objects.owners.read` — probablement déjà présent
   - `account-info.security.read` — optionnel (Enterprise)

2. **Important :** l'ajout de scopes signifie que les workspaces déjà connectés devront se re-autoriser. Gérer ce cas gracieusement : si le scope est manquant au moment de l'audit, afficher une alert explicative (pas un crash).

### Phase 7 — Stockage et API

**Objectif :** persister les résultats utilisateurs et les exposer via l'API.

1. **Migration Supabase** — créer `src/supabase/migrations/007_user_audit.sql` :
   ```sql
   -- EP-09 : Ajout des résultats d'audit utilisateurs & équipes
   ALTER TABLE public.audit_runs
     ADD COLUMN user_results jsonb,
     ADD COLUMN user_score integer;
   ```

2. **Modifier `src/app/api/audit/run/route.ts`** — stocker `user_results` et `user_score`, recalculer `global_score` avec 5 domaines

3. **Modifier `src/app/api/audit/[auditId]/status/route.ts`** — inclure le domaine "users" dans la réponse de polling

4. **Mettre à jour les requêtes de lecture** (page audit results, dashboard, rapport public) pour inclure `user_results` et `user_score`

### Phase 8 — Affichage des résultats

**Objectif :** ajouter la section Utilisateurs & Équipes dans l'interface de résultats d'audit.

1. **Étendre `src/components/audit/audit-results-view.tsx`** — ajouter un onglet/section "Utilisateurs & Équipes" dans la navigation intra-page sticky

2. **Créer les sous-composants** (réutiliser les patterns existants) :
   - **Bloc Sécurité** (U-02, U-05) — les règles critiques en premier :
     - U-02 : taux de Super Admins + seuil recommandé + liste des SA
     - U-05 : liste des utilisateurs inactifs + disclaimer mode standard si applicable
   - **Bloc Gouvernance** (U-03, U-04) :
     - U-03 : liste des utilisateurs sans rôle
     - U-04 : tableau de répartition des rôles (nom, effectif, %) avec rôle dominant en évidence
   - **Bloc Équipes** (U-01, U-06) :
     - U-01 : liste des utilisateurs sans équipe
     - U-06 : liste des équipes vides
   - **Bloc Activité** (U-07) :
     - U-07 : liste des owners sans objet CRM

3. **Section Impact business** — encarts par thème business (réutiliser le pattern existant)

4. **Score circle Utilisateurs** — dans l'en-tête de section (réutiliser `ScoreCircle`)

5. **Nouveau composant : Encart Recommandation** — un bloc visuellement distinct des RuleCards :
   - Fond légèrement différencié (ex: `bg-gray-850` au lieu de `bg-gray-900`, ou une bordure left colorée)
   - Icône ℹ️ + titre "Recommandations — vérifications manuelles"
   - Pas de badge de criticité
   - Contenu riche (markdown-like) avec les textes R1 et R2 du PRD
   - Réutilisable pour de futures recommandations dans d'autres domaines

6. **Mettre à jour `audit-progress-tracker.tsx`** — ajouter l'icône et le label "Utilisateurs & Équipes" dans le tracker de progression

7. **Mettre à jour le rapport public** pour inclure la section Utilisateurs & Équipes

### Phase 9 — Edge cases et polish

**Objectif :** gérer tous les cas limites documentés dans le PRD.

1. **Workspace < 2 utilisateurs** : domaine non affiché, poids redistribué, mention dans les métadonnées
2. **Scope `settings.users.read` manquant** : alert rouge avec message clair + instructions de re-autorisation (pas de crash)
3. **Scope `account-info.security.read` manquant** : fallback silencieux vers mode standard (pas d'erreur visible)
4. **U-04 : ≤ 3 utilisateurs non-SA** : règle désactivée avec message explicatif
5. **U-05 grace period** : vérifier que les comptes créés < 30 jours sont exclus
6. **U-05 disclaimer** : vérifier l'affichage en mode standard (non-Enterprise)
7. **U-07 / U-05 overlap** : un même owner peut apparaître dans les deux règles (c'est correct)
8. **Workspace sans équipes** : U-01 signale tous les utilisateurs, U-06 affiche ✅
9. **Pagination** : vérifier que les listes > 20 items sont paginées
10. **Score global à 5 domaines** : vérifier la redistribution quand des domaines sont absents

## Règles à respecter pendant toute l'implémentation

- **Réutiliser les patterns existants** — le domaine Utilisateurs doit suivre exactement la même architecture que Contacts/Companies (types, rules, score, engine, business-impact)
- **Non-destructif absolu** — aucune requête en écriture à l'API HubSpot. Les API Settings sont en lecture seule
- **Fallback gracieux** — le scope Enterprise est optionnel, le domaine doit fonctionner sans
- **Zéro couleur hex en dur** — uniquement les classes Tailwind du design system
- **Ne pas modifier la logique des autres domaines** au-delà de l'ajout du 5e domaine dans le score global et la progression
- **Distinguer clairement les recommandations des règles** — R1/R2 ne sont jamais scorées, jamais comptées dans les problèmes
- **Ne pas créer de fichiers dans `product/`**
- **Commiter à chaque phase** avec le format : `feat(EP-09): phase N — [description]`
