# Prompt d'implémentation — EP-18 : Audit des leads & pipelines de prospection

> Copier-coller ce prompt dans une session Claude en mode Dev.

---

## Contexte

Tu vas implémenter l'epic EP-18 qui ajoute un nouveau domaine d'audit à HubSpot Auditor : l'audit des leads et pipelines de prospection. C'est le premier domaine **optionnel par défaut** (décoché dans la modale de sélection EP-17). Il introduit 14 règles (L-01 à L-14), dont 10 adaptées de EP-06 (deals) avec des seuils réduits pour la prospection et 4 nouvelles règles spécifiques aux leads (disqualification, handoff lead → deal, source).

L'app est fonctionnelle (EP-00 à EP-04 + EP-UX + EP-05 + EP-05b + EP-09 + EP-06 + EP-17 livrés). Le moteur d'audit existant (`src/lib/audit/`) gère déjà 6 domaines : propriétés, contacts, companies, workflows, utilisateurs, deals. Tu vas ajouter un septième domaine en suivant les mêmes patterns — l'architecture EP-06 (deals) est le modèle direct à réutiliser.

**Changements structurants :**
- Le domaine Leads est **décoché par défaut** dans la modale de sélection EP-17 (`defaultSelected: false`) — c'est le premier domaine opt-in du produit
- Les seuils sont réduits par rapport aux deals : **30j** (pas 60j) pour l'inactivité/blocage, **5 stages** max (pas 8), **60j** (pas 90j) pour l'inactivité pipeline/stage
- Le coefficient dans le score global est **1.0** (pas 1.5 comme les deals)
- Deux règles sont **critiques** : L-04 (lead sans contact) et L-13 (lead qualifié sans deal)
- Les règles L-11 et L-13 s'appliquent aux leads **disqualifiés/qualifiés** (pas seulement `open`)
- Le scope OAuth `crm.objects.leads.read` est requis — gérer gracieusement son absence

## Documents de référence — à lire AVANT de coder

Lis ces documents intégralement avant de commencer :

1. **`product/prd/prd-18-audit-leads.md`** — le PRD complet : problème, specs fonctionnelles (14 règles, algorithmes, scoring, comptage), critères d'acceptance
2. **`product/epics/ep18-audit-leads.md`** — l'epic : hypothèse, user stories Gherkin, table récapitulative, specs techniques
3. **`product/prd/design-system-guidelines.md`** — tokens et composants UI (pour l'affichage des résultats)
4. **`product/prd/screens-and-flows.md`** — architecture de navigation, maquettes d'écrans

Consulte aussi `src/CLAUDE.md` pour les conventions et le skill `feature-implementation` dans `skills/tech/workflows/feature-implementation.md` pour le workflow à suivre.

**Fichiers à étudier impérativement avant de coder :**
- `src/lib/audit/engine.ts` — orchestrateur principal (comprendre comment les domaines sont appelés)
- `src/lib/audit/types.ts` — toutes les interfaces TypeScript + `AUDIT_DOMAINS`
- `src/lib/audit/rules/deals.ts` — **modèle direct** pour `leads.ts` (L-01 à L-04, L-11 à L-14)
- `src/lib/audit/rules/pipelines.ts` — **modèle direct** pour `lead-pipelines.ts` (L-05 à L-10)
- `src/lib/audit/deal-engine.ts` — modèle pour `lead-engine.ts`
- `src/lib/audit/deal-score.ts` — modèle pour `lead-score.ts`
- `src/lib/audit/global-score.ts` — formule du score global (ajouter leads avec coefficient 1.0)
- `src/lib/audit/business-impact.ts` — impacts business statiques (ajouter les 14 entrées leads)
- `src/components/audit/audit-domain-selector.tsx` — modale de sélection (ajouter leads décoché)
- `src/components/audit/audit-results-view.tsx` — composant d'affichage (ajouter onglet Leads)
- `src/app/api/audit/run/route.ts` — endpoint API d'exécution

## Plan d'implémentation

Procéder dans cet ordre strict. Chaque phase doit être fonctionnelle avant de passer à la suivante.

### Phase 1 — Migration DB et types

**Objectif :** définir les interfaces TypeScript et la structure de données pour le domaine Leads.

1. **Créer `src/supabase/migrations/010_lead_audit.sql`** :
   ```sql
   ALTER TABLE public.audit_runs
     ADD COLUMN IF NOT EXISTS lead_results jsonb,
     ADD COLUMN IF NOT EXISTS lead_score integer;
   ```
2. **Étendre `src/lib/audit/types.ts`** :
   - Ajouter `"leads"` au type `AuditDomainId`
   - Ajouter l'entrée leads dans `AUDIT_DOMAINS` avec `defaultSelected: false`, `icon: "UserPlus"`, `tooltip: "Activez si votre équipe utilise l'objet Lead HubSpot pour gérer la prospection."`
   - Créer les interfaces : `LeadIssue`, `LeadPipelineIssue`, `LeadStageIssue`, `LeadDisqualificationIssue`, `LeadHandoffIssue`, `LeadAuditResults`
   - Étendre `GlobalAuditResults` pour inclure `leadResults` et `leadScore`
3. **Créer `src/lib/audit/lead-score.ts`** — formule standard, coefficient **1.0** :
   ```
   Score = max(0, 100 - (critiques×5 cap -30) - (avertissements×2 cap -15) - (infos×0.5 cap -5))
   ```

### Phase 2 — Règles sur leads individuels (L-01 à L-04, L-14)

**Objectif :** implémenter les 5 règles de qualité des données leads.

Créer **`src/lib/audit/rules/leads.ts`** en s'inspirant directement de `deals.ts` :

1. **L-01 — Lead ouvert ancien** : lead `open` avec `createdate` > **30j** (pas 60j comme D-03)
2. **L-02 — Lead bloqué dans un stage** : lead `open` dont le stage n'a pas changé depuis > **30j** via `hs_date_entered_{stage_id}` (pas 60j comme D-05). Fallback `lastmodifieddate`. Grace period 30j sur premier stage pour les nouveaux leads
3. **L-03 — Lead sans propriétaire** : `hubspot_owner_id` null/vide, statut `open` (Info)
4. **L-04 — Lead sans contact associé** : 0 contact associé via batch associations. Sévérité **Critique** (pas Avertissement comme D-09 — un lead sans contact est une anomalie structurelle)
5. **L-14 — Lead sans source** : `hs_analytics_source` null/vide, statut `open` (Avertissement)

### Phase 3 — Règles spécifiques leads (L-11 à L-13)

**Objectif :** implémenter les 3 règles nouvelles qui n'ont pas d'équivalent dans EP-06.

Ajouter dans **`src/lib/audit/rules/leads.ts`** :

1. **L-11 — Lead disqualifié sans motif** :
   - Identifier les stages de type "Disqualified" dans chaque pipeline de leads
   - Récupérer tous les leads dans ces stages (⚠️ pas seulement les `open`)
   - Vérifier la propriété `hs_lead_disqualification_reason` — si null/vide → problème
   - Afficher : nombre + pourcentage des leads disqualifiés sans motif
   - Sévérité : Avertissement

2. **L-12 — Motif de disqualification non structuré** :
   - Récupérer le schéma des propriétés de l'objet lead via `GET /crm/v3/properties/leads`
   - Chercher la propriété `hs_lead_disqualification_reason` — si elle est de type `string`/`text` au lieu de `enumeration` → problème
   - Fallback : chercher parmi les propriétés custom (label contient "disqualification", "raison", "reason", "motif")
   - Si aucune propriété trouvée → L-11 et L-12 désactivées avec mention
   - Règle de config workspace : **1 seule évaluation** (pas par lead)
   - Sévérité : Info

3. **L-13 — Lead qualifié/converti non rattaché à un deal** :
   - Identifier les stages de type "Qualified"/"Converted" dans chaque pipeline de leads
   - Récupérer tous les leads dans ces stages (⚠️ pas seulement les `open`)
   - Vérifier l'association lead → deal en batch — si 0 deal associé → problème
   - Trier par date de qualification décroissante (les plus récents = plus actionnables)
   - Sévérité : **Critique**

### Phase 4 — Règles audit configuration pipeline (L-05 à L-10)

**Objectif :** implémenter les 6 règles d'audit structurel des pipelines de prospection.

Créer **`src/lib/audit/rules/lead-pipelines.ts`** en s'inspirant directement de `pipelines.ts` :

1. **L-05 — Pipeline sans activité** : 0 lead open ET 0 lead créé < **60j** (pas 90j comme D-06)
2. **L-06 — Trop d'étapes** : > **5** stages actifs hors fermés (pas 8 comme D-07)
3. **L-07 — Phases sautées** : > 20% leads avec ≥ 1 stage sauté — logique identique à D-12 via `hs_date_entered_*`
4. **L-08 — Points d'entrée multiples** : > 20% leads créés hors 1er stage — logique identique à D-13
5. **L-09 — Stages fermés redondants** : > 1 stage **Qualified** OU > 1 stage **Disqualified** (⚠️ pas Won/Lost comme D-14)
6. **L-10 — Stage sans activité** : 0 lead open + 0 passage < **60j** (pas 90j comme D-15). Exclure les pipelines détectés par L-05

**Important :** les endpoints API sont `GET /crm/v3/pipelines/leads` (pas `/deals`).

### Phase 5 — Moteur d'audit leads

**Objectif :** créer l'orchestrateur du domaine Leads et l'intégrer dans le moteur global.

1. **Créer `src/lib/audit/lead-engine.ts`** (modèle : `deal-engine.ts`) :
   - Fetch leads via `POST /crm/v3/objects/leads/search` avec pagination (max 100/page)
   - Propriétés à récupérer : `hs_lead_label`, `hs_lead_status`, `hs_pipeline`, `hs_pipeline_stage`, `hubspot_owner_id`, `createdate`, `lastmodifieddate`, `hs_date_entered_*`, `hs_analytics_source`, `hs_lead_disqualification_reason`
   - Fetch pipelines via `GET /crm/v3/pipelines/leads`
   - Fetch propriétés lead via `GET /crm/v3/properties/leads` (pour L-12)
   - Batch associations : leads → contacts (L-04) et leads → deals (L-13) en chunks de 100
   - **Gestion scope manquant** : si 403 sur l'API leads, retourner erreur explicite "L'accès aux leads nécessite le scope crm.objects.leads.read"

2. **Modifier `src/lib/audit/engine.ts`** (`runFullAudit`) :
   - Ajouter le domaine `"leads"` dans le flow conditionnel
   - Condition d'exécution : `selectedDomains.includes("leads") && leadsCount >= 1`
   - Skipped reason si 0 lead : `"no_leads"`
   - Stocker résultats dans `lead_results` et `lead_score`

3. **Modifier `src/lib/audit/global-score.ts`** :
   - Inclure le score leads dans le calcul du score global avec coefficient **1.0**
   - Si le domaine leads est inactif, retirer son poids du dénominateur

4. **Ajouter les 14 impacts business** dans `src/lib/audit/business-impact.ts` (cf. section 6.7 du PRD pour les textes exacts)

5. **Modifier `src/app/api/audit/run/route.ts`** : inclure `leadResults` et `leadScore` dans la réponse

### Phase 6 — Affichage des résultats (frontend)

**Objectif :** afficher les résultats leads dans l'interface avec les patterns UI existants.

1. **Modifier `src/components/audit/audit-domain-selector.tsx`** :
   - Ajouter le domaine Leads **décoché par défaut**
   - Icône : `UserPlus` (Lucide)
   - Tooltip : "Activez si votre équipe utilise l'objet Lead HubSpot pour gérer la prospection."

2. **Modifier `src/components/audit/audit-results-view.tsx`** :
   - Nouvel onglet "Leads & Prospection" après "Deals & Pipelines"
   - Badge avec nombre de problèmes
   - Hero : `{totalLeads} leads · {totalLeadPipelines} pipelines de prospection`
   - ScoreCircle + décompte sévérités dans le header de section
   - Blocs dans cet ordre :
     - **Qualité données leads** : L-01, L-03, L-04, L-14 (RuleCards standard)
     - **Leads bloqués** : L-02 (pattern hiérarchique pipeline > stage > leads)
     - **Processus de disqualification** : L-11, L-12 (nouveau bloc)
     - **Handoff lead → deal** : L-13 (nouveau bloc, sévérité critique mise en avant)
     - **Santé des pipelines de prospection** : L-05 à L-10 (regroupement par pipeline)
   - Empty state si 0 lead : "Aucun lead détecté dans ce workspace"

3. **Mettre à jour le Hero du rapport** : ajouter le sous-score Leads (si domaine actif)

4. **Mettre à jour la progression d'audit** : ajouter l'étape "Analyse des leads & pipelines de prospection" avec sous-étapes (fetch, analyse, scoring) — uniquement si le domaine est sélectionné

### Phase 7 — Polish et edge cases

**Objectif :** gérer les cas limites et valider la qualité.

1. **Edge cases à tester** :
   - Workspace sans leads (0 lead) → skipped reason `"no_leads"`, onglet grisé
   - Scope OAuth absent → domaine désactivé avec message explicite
   - Workspace avec 1 seul pipeline de leads → pas de regroupement par pipeline
   - Leads très anciens sans propriétés `hs_date_entered_*` → fallback `lastmodifieddate`
   - Pas de propriété de disqualification trouvée → L-11 et L-12 désactivées avec mention
   - Pipeline avec tous les leads disqualifiés → L-05 se déclenche, L-02 ne se déclenche pas (0 lead open)
   - Domaine Leads non sélectionné → rien n'apparaît (pas d'onglet, pas de score, pas de progression)
   - L-13 sur des leads qualifiés depuis longtemps → tri par date décroissante, les plus récents en premier
2. **Pagination** : vérifier que toutes les listes > 20 items sont paginées
3. **Rapport public** : vérifier que la section Leads s'affiche correctement dans le rapport partagé (si domaine actif)
4. **Performance** : vérifier que l'audit leads < 30s sur un workspace < 5 000 leads
5. **Labels UI** : s'assurer que "Pipelines de prospection" et "Pipelines de vente" sont bien distincts partout

## Règles à respecter pendant toute l'implémentation

- **Non-destructif absolu** : aucune requête POST/PUT/DELETE/PATCH vers l'API HubSpot. Uniquement GET et POST search (lecture)
- **Ne pas toucher** les règles des autres domaines (contacts, companies, workflows, propriétés, utilisateurs, deals)
- **Convention de commit** : `feat(EP-18): phase N — description`
- **Respecter le design system** : utiliser les composants existants (ScoreCircle, SeverityBadge, RuleCard, ProgressBar, PaginatedList, Badge, EmptyState) — aucun nouveau composant nécessaire
- **Batch les appels API** : associations en chunks de 100, propriétés `hs_date_entered_*` en une seule requête search
- **Pas de nouvelle dépendance npm** sauf si absolument nécessaire
- **Ne pas confondre les seuils leads et deals** — récapitulatif :

| Paramètre | Deals (EP-06) | Leads (EP-18) |
|---|---|---|
| Ancienneté / blocage | 60 jours | **30 jours** |
| Max stages pipeline | 8 stages | **5 stages** |
| Inactivité pipeline/stage | 90 jours | **60 jours** |
| Coefficient score global | 1.5 | **1.0** |
| Stages fermés | Won / Lost | **Qualified / Disqualified** |
| `defaultSelected` EP-17 | true | **false** |
| Lead sans contact | Avertissement | **Critique** |
