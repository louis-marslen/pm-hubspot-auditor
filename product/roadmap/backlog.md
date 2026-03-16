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
| EP-06 | Audit des deals & pipelines | 40 | 2 | 70% | 1.5 | 37 | NOW | Spécifié |
| EP-09 | Audit utilisateurs & équipes | 30 | 2 | 60% | 1 | 36 | NOW | Spécifié |
| EP-10 | Audit des intégrations | 20 | 2 | 50% | 1.5 | 13 | NOW | À spécifier |
| EP-11 | Audit du reporting | 25 | 1 | 60% | 1 | 15 | NOW | À spécifier |
| EP-07 | Export du rapport (PDF) | 30 | 2 | 90% | 0.5 | 108 | NOW | À spécifier |
| EP-08 | Onboarding self-service | 50 | 3 | 70% | 1 | 105 | NOW | À spécifier |
| EP-12 | Historique & comparaison d'audits | 20 | 2 | 60% | 2 | 12 | LATER | Idée |
| EP-13 | Mode multi-workspace | 10 | 3 | 70% | 2 | 10.5 | LATER | Idée |
| EP-14 | Recommandations enrichies (IA) | 30 | 3 | 40% | 3 | 12 | LATER | Idée |
| EP-15 | Modèle de pricing & paywall | 50 | 3 | 60% | 1 | 90 | LATER | Idée |
| EP-16 | Profil business & audit contextuel | 40 | 3 | 50% | 2 | 30 | LATER | Idée |

> ⚠️ La priorisation NOW suit l'ordre : couverture d'audit complète d'abord (EP-06→11), puis packaging/distribution (EP-07, EP-08). Les scores RICE sur les epics LATER sont indicatifs.

---

## Ce qui a été livré en Phase 2

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
