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
| EP-UX | Design System & Rattrapage UX/UI | 50 | 3 | 80% | 1.5 | 80 | NOW | À spécifier |
| EP-07 | Export du rapport (PDF) | 30 | 2 | 90% | 0.5 | 108 | NOW | À spécifier |
| EP-08 | Onboarding self-service | 50 | 3 | 70% | 1 | 105 | NOW | À spécifier |
| EP-05 | Audit des contacts & doublons | 40 | 3 | 70% | 1.5 | 56 | NOW | À spécifier |
| EP-06 | Audit des deals & pipelines | 40 | 2 | 70% | 1.5 | 37 | NOW | À spécifier |
| EP-09 | Audit utilisateurs & équipes | 30 | 2 | 60% | 1 | 36 | LATER | Idée |
| EP-11 | Audit du reporting | 25 | 1 | 60% | 1 | 15 | LATER | Idée |
| EP-10 | Audit des intégrations | 20 | 2 | 50% | 1.5 | 13 | LATER | Idée |
| EP-14 | Recommandations enrichies (IA) | 30 | 3 | 40% | 3 | 12 | LATER | Idée |
| EP-12 | Historique & comparaison d'audits | 20 | 2 | 60% | 2 | 12 | LATER | Idée |
| EP-13 | Mode multi-workspace | 10 | 3 | 70% | 2 | 10.5 | LATER | Idée |
| EP-15 | Modèle de pricing & paywall | 50 | 3 | 60% | 1 | 90 | LATER | Idée |

> ⚠️ Les scores RICE sur les epics LATER sont indicatifs — à recalibrer quand la phase NOW (phase 2) sera mieux connue.

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
