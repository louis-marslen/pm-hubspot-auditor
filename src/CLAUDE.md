# CLAUDE.md — Mode Dev

Tu opères en **mode Développeur**. Ton rôle est d'implémenter le produit HubSpot Auditor selon les spécifications définies dans `product/`.

---

## Guardrail strict

**Ne jamais créer, modifier ou supprimer de fichiers dans `product/`.**

Les artefacts PM sont en lecture seule depuis ce mode. Si tu identifies une incohérence ou un manque dans les specs, le signaler à l'utilisateur — ne pas le corriger directement.

---

## Avant d'implémenter une feature

1. Lire le PRD correspondant dans `product/prd/`
2. Lire l'epic correspondant dans `product/epics/`
3. **Lire les références design :**
   - `product/prd/design-system-guidelines.md` — tokens (couleurs, typo, spacing), composants UI, patterns d'interaction
   - `product/prd/screens-and-flows.md` — maquettes d'écrans, parcours utilisateurs, architecture de navigation
4. Vérifier les dépendances listées dans le PRD
5. Consulter les décisions techniques actées dans le root `CLAUDE.md`

> **Règle UI/UX non négociable :** tout frontend doit utiliser les composants et tokens du design system. Zéro couleur hex en dur, zéro spacing arbitraire, zéro composant ad hoc quand un composant réutilisable existe. Voir le skill `feature-implementation` pour la checklist complète.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | **Next.js 16** (App Router) + **React 19** + **Tailwind CSS 3** |
| Backend | **Next.js API routes** (Node.js) |
| Base de données | **Supabase** (PostgreSQL + Auth + RLS) |
| Email transactionnel | **Resend** (compte gratuit) |
| LLM | **OpenAI API** (GPT-4.1 pour les résumés exécutifs) |
| Authentification HubSpot | **OAuth 2.0 Authorization Code Flow** — Public App déjà créée |
| Design system | **Tailwind tokens custom** (dark mode natif) + **Lucide Icons** + **Geist Sans** |

> Toujours demander confirmation avant d'introduire une nouvelle dépendance majeure.

---

## Intégration HubSpot

- **Type d'app** : Public App (déjà créée dans le portail développeur HubSpot)
- **Flow OAuth** : Authorization Code Flow avec refresh token
- **Scopes requis** : à définir par epic (cf. PRDs)
- **Principe non-destructif** : l'app ne fait que des appels GET à l'API HubSpot — jamais de création, modification ou suppression de données

---

## Conventions de code

- Nommer les fichiers en `kebab-case` (composants en `PascalCase` si React)
- Commenter les règles métier complexes (seuils d'audit, scores, formules)
- Chaque endpoint API doit avoir une gestion d'erreur explicite
- Les secrets (API keys, tokens) exclusivement en variables d'environnement — jamais dans le code
- Écrire des messages d'erreur compréhensibles pour l'utilisateur final

---

## PRDs de référence

### Documents transverses (lecture obligatoire)

| Document | Contenu |
|---|---|
| [design-system-guidelines.md](../product/prd/design-system-guidelines.md) | Tokens, composants UI, patterns, dark mode, accessibilité |
| [screens-and-flows.md](../product/prd/screens-and-flows.md) | Maquettes d'écrans, parcours utilisateurs, architecture navigation |

### PRDs par epic

| Epic | PRD | Résumé | Statut |
|---|---|---|---|
| EP-00 | [prd-00-compte-utilisateur.md](../product/prd/prd-00-compte-utilisateur.md) | Comptes email+password, multi-workspace HubSpot | ✅ Livré |
| EP-01 | [prd-01-connexion-hubspot.md](../product/prd/prd-01-connexion-hubspot.md) | OAuth HubSpot, gestion tokens, multi-portail | ✅ Livré |
| EP-02 | [prd-02-audit-proprietes.md](../product/prd/prd-02-audit-proprietes.md) | Analyse propriétés HubSpot (taux remplissage, doublons…) | ✅ Livré |
| EP-03 | [prd-03-audit-workflows.md](../product/prd/prd-03-audit-workflows.md) | Analyse workflows HubSpot (inactifs, erreurs, redondances) | ✅ Livré |
| EP-04 | [prd-04-tableau-de-bord.md](../product/prd/prd-04-tableau-de-bord.md) | Dashboard d'audit, rapport exportable, lien public, LLM summary | ✅ Livré |
| EP-05 | [prd-05-audit-contacts.md](../product/prd/prd-05-audit-contacts.md) | Audit contacts & doublons (12 règles) | ✅ Livré |
| EP-05b | [prd-05b-audit-companies.md](../product/prd/prd-05b-audit-companies.md) | Audit companies (8 règles) | ✅ Livré |
| EP-UX | [prd-ux-design-system.md](../product/prd/prd-ux-design-system.md) | Design system, rattrapage UI/UX, parcours utilisateur | ✅ Livré |
| EP-UX-02 | [prd-progression-audit.md](../product/prd/prd-progression-audit.md) | Progression d'audit en temps réel | ✅ Livré |
| EP-09 | [prd-09-audit-utilisateurs-equipes.md](../product/prd/prd-09-audit-utilisateurs-equipes.md) | Audit utilisateurs & équipes (7 règles) | ✅ Livré |
| EP-06 | [prd-06-audit-deals.md](../product/prd/prd-06-audit-deals.md) | Audit deals & pipelines (15 règles, scoring pondéré) | ✅ Livré |
| EP-17 | [prd-17-selection-domaines-audit.md](../product/prd/prd-17-selection-domaines-audit.md) | Sélection des domaines d'audit, modale pré-launch | ✅ Livré |
| EP-18 | [prd-18-audit-leads.md](../product/prd/prd-18-audit-leads.md) | Audit leads & pipelines de prospection (14 règles, domaine optionnel) | ✅ Livré |
| EP-UX-03 | [prd-ux-03-refonte-rapport.md](../product/prd/prd-ux-03-refonte-rapport.md) | Refonte rapport : sidebar, vue par sévérité, hero simplifié, quick wins | Spécifié |
| EP-14 | [prd-14-diagnostic-ia.md](../product/prd/prd-14-diagnostic-ia.md) | Diagnostic IA structuré (forces/faiblesses/risques) + roadmap recommandations, gpt-5.4 structured outputs | ✅ Livré |
| EP-UX-04 | [prd-ux-04-refonte-diagnostic-recommandations.md](../product/prd/prd-ux-04-refonte-diagnostic-recommandations.md) | Refonte UX diagnostic (grille 3 colonnes) + recommandations (tableau + side panel) | Spécifié |
| EP-19 | [prd-19-patch-regles-v1.md](../product/prd/prd-19-patch-regles-v1.md) | Patch règles v1 : LLM validation (P3, P6, W6, C-06), refonte contacts, suppression règles obsolètes | Spécifié |

---

## Skills Tech disponibles

Bibliothèque dans `skills/tech/` — trois catégories :

- **Workflows** (`skills/tech/workflows/`) : processus de développement complets (feature, code review)
- **Composants** (`skills/tech/components/`) : artefacts ciblés (ADR, tech spec, API spec, schéma DB, UI component spec)
- **Interactifs** (`skills/tech/interactive/`) : décisions guidées (choix de stack, investigation bug)

Consulter `skills/tech/README.md` pour le catalogue complet.
