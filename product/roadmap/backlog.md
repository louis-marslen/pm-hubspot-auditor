# Backlog des epics — HubSpot Auditor

Tous les epics identifiés avec leur scoring RICE indicatif et leur statut.

> **RICE reminder :** Score = (Reach × Impact × Confidence) / Effort
> - Reach : utilisateurs touchés / mois (estimé)
> - Impact : 1 = minimal, 2 = élevé, 3 = massif
> - Confidence : % de certitude sur les estimations
> - Effort : mois-personne

---

## Epics scorés

| ID | Nom | Reach | Impact | Conf. | Effort | RICE | Phase | Statut |
|---|---|---|---|---|---|---|---|---|
| EP-00 | Compte utilisateur | — | — | — | — | — | LIVRÉ | ✅ Livré |
| EP-01 | Connexion HubSpot (OAuth) | — | — | — | — | — | LIVRÉ | ✅ Livré |
| EP-02 | Audit des propriétés | 50 | 3 | 80% | 1 | 120 | LIVRÉ | ✅ Livré |
| EP-03 | Audit des workflows | 50 | 3 | 80% | 1 | 120 | LIVRÉ | ✅ Livré |
| EP-04 | Tableau de bord & score de santé | 50 | 3 | 90% | 0.5 | 270 | LIVRÉ | ✅ Livré |
| EP-UX | Design System & Rattrapage UX/UI | 50 | 3 | 80% | 1.5 | 80 | LIVRÉ | ✅ Livré |
| EP-05 | Audit des contacts & doublons | 40 | 3 | 70% | 1.5 | 56 | LIVRÉ | ✅ Livré |
| EP-05b | Audit des companies | 35 | 2 | 70% | 1 | 49 | LIVRÉ | ✅ Livré |
| EP-UX-02 | Progression d'audit en temps réel | 50 | 3 | 90% | 1 | 135 | LIVRÉ | ✅ Livré |
| EP-06 | Audit des deals & pipelines | 40 | 2 | 70% | 1.5 | 37 | LIVRÉ | ✅ Livré |
| EP-09 | Audit utilisateurs & équipes | 30 | 2 | 60% | 1 | 36 | LIVRÉ | ✅ Livré |
| EP-17 | Sélection des domaines d'audit | 50 | 2 | 90% | 0.5 | 180 | LIVRÉ | ✅ Livré |
| EP-UX-03 | Refonte page rapport d'audit | 50 | 3 | 90% | 1 | 135 | LIVRÉ | ✅ Livré |
| EP-UX-04 | Refonte UX Diagnostic & Recommandations | 50 | 2 | 90% | 0.5 | 180 | NOW | Spécifié |
| EP-08 | Onboarding self-service | 50 | 3 | 70% | 1 | 105 | NOW | À spécifier |
| EP-18 | Audit des leads & pipelines de prospection | 25 | 2 | 70% | 1 | 35 | LIVRÉ | ✅ Livré |
| ~~EP-10~~ | ~~Audit des intégrations~~ | — | — | — | — | — | — | Abandonné |
| ~~EP-11~~ | ~~Audit du reporting~~ | — | — | — | — | — | — | Abandonné |
| ~~EP-07~~ | ~~Export du rapport (PDF)~~ | — | — | — | — | — | — | Abandonné |
| EP-12 | Historique & comparaison d'audits | 20 | 2 | 60% | 2 | 12 | LATER | Idée |
| EP-13 | Mode multi-workspace | 10 | 3 | 70% | 2 | 10.5 | LATER | Idée |
| EP-14 | Diagnostic global IA & Recommandations | 50 | 3 | 70% | 1.5 | 70 | LIVRÉ | ✅ Livré |
| EP-15 | Modèle de pricing & paywall | 50 | 3 | 60% | 1 | 90 | LATER | Idée |
| EP-16 | Profil business & audit contextuel | 40 | 3 | 50% | 2 | 30 | LATER | Idée |

> ⚠️ EP-10, EP-11 et EP-07 ont été abandonnés — EP-10/EP-11 car les API HubSpot n'exposent pas les données nécessaires, EP-07 car le lien de partage public suffit. Les scores RICE sur les epics LATER sont indicatifs.

---

## Ce qui a été livré en Phase 2 (fin)

### EP-14 — Diagnostic global IA & Recommandations
- **Diagnostic structuré** : génération IA (gpt-5.4, OpenAI Responses API, structured outputs) de clusters forces / faiblesses / risques à partir des résultats d'audit croisés inter-domaines
- **Roadmap de recommandations** : top 5 projets prioritaires + backlog (5-10 projets), avec impact (Fort/Moyen/Faible), taille (XS à XL), priorité (P1/P2/P3), domaines concernés et 3-5 actions clés expandables
- **Knowledge base** : 4 fichiers markdown injectés dans le system prompt (best practices HubSpot, maturité CRM, patterns inter-domaines, templates projets)
- **Hero summary IA** : remplacement du résumé LLM (gpt-4.1, 3-5 phrases) par un extrait du diagnostic (2-3 phrases contextuelles)
- **Intégration rapport** : 2 nouvelles sections (Diagnostic, Recommandations) + 2 items sidebar entre "Vue d'ensemble" et les domaines
- **Suppression Quick Wins** : remplacés par les recommandations IA quand le diagnostic est disponible (fallback déterministe sinon)
- **Rapport public** : même rendu complet (diagnostic + recommandations visibles sans auth)
- **4 nouveaux composants** : DiagnosticSection, DiagnosticClusterCard, RecommandationsSection, ProjectCard
- **Migration DB** : colonne `ai_diagnostic` (jsonb) dans `audit_runs` (migration 011)
- **Fallback silencieux** : rapport sans diagnostic si erreur API OpenAI

### EP-UX-03 — Refonte de la page rapport d'audit
- **Layout sidebar** : navigation latérale fixe (200px) avec scores par domaine (dot coloré + score numérique), remplace les tabs horizontaux
- **Vue par sévérité cross-domaine** : règles groupées par sévérité (critiques → avertissements → infos → conformes) au lieu de par domaine, tri par count décroissant
- **Hero simplifié** : ScoreCircle 80px + résumé texte + métadonnées, bascule en vue domaine (score domaine, label, résumé contextuel)
- **Delta score** : comparaison avec l'audit précédent (+X pts vert / -X pts rouge)
- **Grille de scores** : mini-cards par domaine avec barres de progression colorées (rouge/orange/vert)
- **Quick wins** : bloc de 2-4 recommandations actionnables, logique déterministe (top critiques + avertissements)
- **Cartes de règles redesignées** : dot + titre + description + badge sévérité + tag domaine + count, détail au clic
- **Section "Conformes"** : règles sans problème, opacité réduite, badge OK vert
- **Rapport public** : même layout redesigné, sidebar adaptée avec CTA "Lancer votre audit"
- **6 nouveaux composants** : ReportSidebar, ReportLayout, DomainScoreGrid, QuickWinsCallout, RuleListItem, SeveritySection
- **4 nouveaux utilitaires** : transform-rules, group-by-severity, generate-quick-wins, compute-score-delta
- Refonte majeure d'`audit-results-view.tsx` (−1689 / +2857 lignes sur l'ensemble)
- **Navigation applicative** : remplacement de la navbar (topbar) par une `AppSidebar` sur toutes les pages authentifiées (logo, navigation, paramètres, avatar), sections rapport injectées via `ReportSidebarContext`, unification des styles sidebar, renommage "Tableau de bord" → "Vue d'ensemble", cards workspace compactées

---

### EP-18 — Audit des leads & pipelines de prospection
- **14 règles (L-01 à L-14)** : 10 adaptées de EP-06 (deals) avec seuils ajustés + 4 nouvelles règles spécifiques leads
- **Qualité des leads (L-01 à L-04, L-14)** : leads ouverts anciens (>30j), leads bloqués dans un stage (>30j), leads sans propriétaire, leads sans contact associé (critique), leads sans source
- **Configuration pipeline (L-05 à L-10)** : pipeline inactif (60j), trop de stages (>5), phases sautées (>20%), points d'entrée multiples (>20%), stages fermés redondants, stages sans activité (60j)
- **Processus de qualification (L-11 à L-13)** : disqualifié sans motif, motif non structuré (text vs enumeration), qualifié sans deal associé (critique)
- **Domaine optionnel** : décoché par défaut dans la modale EP-17 (beaucoup d'entreprises n'utilisent pas l'objet Lead)
- **Scoring** : coefficient ×1.0 (standard, pas de pondération renforcée)
- **Activation conditionnelle** : domaine sélectionné par l'utilisateur ET ≥ 1 lead dans le workspace
- **Skipped reason** : `"no_leads"` si sélectionné mais 0 lead
- Score Leads (0-100) intégré au score global du dashboard — **7 domaines actifs**

---

## Ce qui a été livré en Phase 2 (suite)

### EP-06 — Audit des deals & pipelines
- **15 règles (D-01 à D-15)** : 4 migrées depuis Properties (D-01 à D-04 ex-P13 à P16), 1 feature phare deals bloqués (D-05), 4 qualité données (D-08 à D-11), 6 audit structurel pipeline (D-06, D-07, D-12 à D-15)
- **Règles pipeline structurelles** : phases sautées (>20%), points d'entrée multiples (>20%), stages fermés redondants, pipelines inactifs (90j), trop de stages (>8), stages sans activité (90j)
- **Scoring pondéré** : score Deals avec coefficient ×1.5 dans le score global (domaine le plus lié au CA)
- **Associations batch** : deals → contacts et deals → companies en chunks de 100 pour performance
- **Activation conditionnelle** : domaine actif uniquement si ≥ 1 deal dans le workspace
- Score Deals (0-100) intégré au score global du dashboard — **6 domaines actifs**

### EP-17 — Sélection des domaines d'audit
- **Livré en 7 phases** : migration DB → modale de sélection → API filtering → LLM scope-aware → progress tracker filtré → bandeau périmètre + tabs filtrés + historique partiel → edge cases + skipped_reasons
- **Modale de sélection** : 6 domaines (Properties obligatoire, 5 optionnels), opt-out par défaut (tous cochés)
- **Score global adapté** : recalculé sur les domaines sélectionnés uniquement
- **Skipped reasons** : domaines sélectionnés mais sans données (`no_contacts`, `no_companies`, `less_than_2_users`, `no_deals`, `no_workflows`)
- **Bandeau de périmètre** : indication visible dans le rapport si l'audit est partiel
- **Rétrocompatibilité** : `audit_domains = null` → comportement identique à "tous les domaines"
- Colonne `audit_domains` jsonb dans `audit_runs` (migration 008)

---

## Ce qui a été livré en Phase 2 (début)

### EP-09 — Audit des utilisateurs & équipes
- **7 règles (U-01 à U-07)** : Super Admins en excès (>25% ou >3), rôles non différenciés (tous identiques), utilisateurs sans équipe, équipes vides, utilisateurs inactifs (fallback owners sans objet CRM si non-Enterprise), comptes email générique (admin@, info@…), utilisateurs sans rôle assigné
- **2 recommandations non scorées (R1/R2)** : permissions granulaires, optimisation licences
- **Activation conditionnelle** : domaine actif uniquement si ≥ 2 utilisateurs dans le workspace
- **Grace period** de 30 jours sur U-05 (comptes récents exclus)
- **Détection Enterprise** pour enrichir U-05 avec l'historique de connexion (`lastLoginAt`)
- **Exclusion automatique** des apps de service (comptes techniques HubSpot)
- Score utilisateurs (0-100) intégré au score global du dashboard — **5 domaines actifs**
- **Parallélisation** des 4 domaines post-Properties (Workflows, Contacts, Companies, Users) via `Promise.all`

### EP-05 — Audit des contacts & doublons
- **12 règles (C-01 à C-12)** : doublons par email exact, doublons par nom+company, doublons par téléphone, emails invalides, contacts sans email, contacts sans nom, contacts stale (>1 an sans activité), contacts sans attribution (owner), incohérence lifecycle ↔ deal status, contacts sans entreprise (B2B), contacts sans lifecycle stage, contacts créés sans source
- Score contacts (0-100) intégré au score global du dashboard

### EP-05b — Audit des companies
- **8 règles (CO-01 à CO-08)** : doublons par domaine, doublons par nom, companies sans domaine, companies orphelines (0 contacts), companies sans industrie, companies sans owner, companies stale, companies sans pays/ville
- Score companies (0-100) intégré au score global du dashboard

### EP-UX-02 — Progression d'audit en temps réel
- **Navigation immédiate** vers `/audit/{auditId}` au clic sur "Lancer un audit"
- **Tracker de progression** domaine par domaine (Propriétés, Contacts, Companies, Workflows) avec 3 sous-étapes chacun (fetch, analyse, scoring) + étape transverse LLM
- **Barre de progression globale** avec pourcentage calculé sur les sous-étapes
- **Polling temps réel** via endpoint `GET /api/audit/{auditId}/status` (intervalle 2s)
- **Persistance en base** (colonne `audit_progress` jsonb) — survie au rafraîchissement
- **Transition fluide** tracker → rapport complet une fois l'audit terminé
- **Edge cases** : gestion 0 éléments, `prefers-reduced-motion`, lien vers audit en cours depuis l'historique
- **Audit en arrière-plan** : l'endpoint POST retourne immédiatement, l'audit s'exécute en background

### EP-UX — Design System & Rattrapage UX/UI
- **Design tokens** : palette gray (13 niveaux, gris bleutés), palette brand (orange, 6 niveaux), typographie Geist Sans, spacing, radius, ombres
- **Dark mode complet** : fond `gray-950`, fond élevé `gray-900`, surfaces `gray-850/gray-800`
- **13 composants UI** : Button, Input, Alert, Badge, Card, Modal, Toast, Topbar, Skeleton, ProgressBar, EmptyState, Breadcrumb, Tabs, Dropdown
- **Composants domaine extraits** : ScoreCircle (arc SVG animé), SeverityBadge, WorkspaceCard, RuleCard
- **Topbar contextuelle** : 3 variantes (connectée avec menu utilisateur dropdown, non-auth, publique)
- **Retrofit de tous les écrans** : auth (login, register, forgot/reset password, confirm), dashboard, audit results, settings, rapport public
- **Page settings unifiée** : profil, gestion workspaces, danger zone avec modale (remplace `/account/delete`)

---

## Ce qui a été livré en Phase 1

### EP-00 — Compte utilisateur
- Inscription email + password avec confirmation email
- Reset password via email (Resend)
- Suppression de compte (cascade sur toutes les données)
- Session management via Supabase Auth

### EP-01 — Connexion HubSpot (OAuth)
- Authorization Code Flow avec protection CSRF (state token)
- Multi-portail (un compte = plusieurs workspaces HubSpot)
- Tokens chiffrés en base (AES-256-GCM)
- Refresh automatique avec seuil proactif de 10 min
- Rate limiting : 2 req / 700ms, batch processing

### EP-02 — Audit des propriétés
- **Règles custom (P1-P6)** : propriétés inutilisées, sous-utilisées (<5%), doublons de label, non documentées, mal groupées, mauvais type
- **Règles système (P7-P16)** : contacts sans email/nom/lifecycle, cohérence lifecycle ↔ deal status, contacts sans entreprise (B2B), companies sans domaine, deals sans montant/close date, deals bloqués (>60j), stages sans champs requis

### EP-03 — Audit des workflows
- **Règles (W1-W7)** : mauvais nommage, workflows zombies (0 enrollment >90j), inactifs, sans actions, format legacy
- Score workflows (0-100) avec même barème que les propriétés

### EP-04 — Tableau de bord & score de santé
- Score global (50/50 propriétés + workflows, ou 100% propriétés si pas de workflows)
- Résumé exécutif LLM (GPT-4.1) avec fallback silencieux
- Lien de partage public (UUID unique, lecture seule sans auth)
- Dashboard multi-workspace avec historique des audits
- Visualisation scores avec codes couleur (0-49 Critique / 50-69 À améliorer / 70-89 Bon / 90-100 Excellent)

---

## Statuts possibles

| Statut | Signification |
|---|---|
| **Infrastructure requise** | Prérequis technique, pas de scoring RICE pertinent |
| **À spécifier** | Priorité confirmée, epic file à créer |
| **En cours** | Epic file créé, spécification en cours |
| **Spécifié** | Epic file complet, prêt pour le développement |
| **✅ Livré** | Développé et déployé |
| **Idée** | Dans le backlog, pas encore priorisé formellement |
| **Abandonné** | Déprioritisé avec justification |
