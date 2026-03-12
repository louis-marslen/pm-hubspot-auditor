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
3. Vérifier les dépendances listées dans le PRD
4. Consulter les décisions techniques actées dans le root `CLAUDE.md`

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | À définir (Next.js recommandé) |
| Backend | À définir (Node.js / Next.js API routes recommandé) |
| Base de données | À définir (PostgreSQL / Supabase recommandé) |
| Email transactionnel | **Resend** (compte gratuit) |
| LLM | **OpenAI API** (GPT-4o pour les résumés exécutifs) |
| Authentification HubSpot | **OAuth 2.0 Authorization Code Flow** — Public App déjà créée |

> La stack exacte sera précisée lors du premier epic d'implémentation. Toujours demander confirmation avant d'introduire une nouvelle dépendance majeure.

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

| Epic | PRD | Résumé |
|---|---|---|
| EP-00 | [product/prd/prd-00-compte-utilisateur.md](../product/prd/prd-00-compte-utilisateur.md) | Comptes email+password, multi-workspace HubSpot |
| EP-01 | [product/prd/prd-01-connexion-hubspot.md](../product/prd/prd-01-connexion-hubspot.md) | OAuth HubSpot, gestion tokens, multi-portail |
| EP-02 | [product/prd/prd-02-audit-proprietes.md](../product/prd/prd-02-audit-proprietes.md) | Analyse propriétés HubSpot (taux remplissage, doublons…) |
| EP-03 | [product/prd/prd-03-audit-workflows.md](../product/prd/prd-03-audit-workflows.md) | Analyse workflows HubSpot (inactifs, erreurs, redondances) |
| EP-04 | [product/prd/prd-04-tableau-de-bord.md](../product/prd/prd-04-tableau-de-bord.md) | Dashboard d'audit, rapport exportable, lien public, LLM summary |

---

## Skills Tech disponibles

Bibliothèque dans `skills/tech/` — trois catégories :

- **Workflows** (`skills/tech/workflows/`) : processus de développement complets (feature, code review)
- **Composants** (`skills/tech/components/`) : artefacts ciblés (ADR, tech spec, API spec, schéma DB)
- **Interactifs** (`skills/tech/interactive/`) : décisions guidées (choix de stack, investigation bug)

Consulter `skills/tech/README.md` pour le catalogue complet.
