# CLAUDE.md — pm-hubspot-auditor

## Contexte du projet

Ce dépôt contient **uniquement des artefacts de product management** — pas de code source.
L'objectif est de définir, structurer et documenter le produit **HubSpot Auditor** de manière exhaustive, du cadrage stratégique jusqu'aux spécifications techniques prêtes à passer en développement.

---

## Description du produit

**HubSpot Auditor** est un outil SaaS permettant aux utilisateurs d'auditer leur workspace HubSpot. Il analyse la qualité, la cohérence et les bonnes pratiques d'un compte HubSpot (contacts, deals, propriétés, workflows, pipelines, équipes, intégrations, etc.) et restitue un rapport d'audit actionnable.

---

## Ce que contient ce dépôt

| Dossier | Contenu attendu |
|---|---|
| `strategy/` | Vision produit, positionnement, analyse marché, personas |
| `roadmap/` | Roadmap trimestrielle, priorisation, thèmes stratégiques |
| `prd/` | Product Requirements Documents par feature ou epic |
| `user-stories/` | User stories et critères d'acceptance par epic |
| `specs/` | Spécifications fonctionnelles et techniques (wireframes textuels, flux, règles métier) |
| `research/` | Insights utilisateurs, benchmarks, hypothèses |

---

## Ce que ce dépôt ne contient pas

- Aucun code source (frontend, backend, scripts)
- Aucune configuration d'infrastructure
- Aucun fichier de déploiement

---

## Conventions de travail

### Langue
- Tous les documents sont rédigés en **français**, sauf les termes HubSpot/techniques qui restent en anglais (ex : "workflow", "pipeline", "deal stage").

### Format des fichiers
- Tout est en **Markdown** (`.md`)
- Les noms de fichiers sont en `kebab-case`
- Chaque fichier commence par un en-tête H1 avec le titre du document

### Structure des PRD
Chaque PRD suit ce plan :
1. Résumé exécutif
2. Problème utilisateur
3. Objectifs & métriques de succès (OKRs / KPIs)
4. Périmètre (in scope / out of scope)
5. User stories associées
6. Spécifications fonctionnelles
7. Dépendances & risques
8. Critères d'acceptance

### Structure des User Stories
```
En tant que [persona], je veux [action] afin de [bénéfice].

Critères d'acceptance :
- [ ] ...
- [ ] ...
```

### Priorisation
Framework utilisé : **RICE** (Reach, Impact, Confidence, Effort)

---

## Personas principaux

| Persona | Description |
|---|---|
| **RevOps Manager** | Responsable de l'hygiène et de la gouvernance du CRM. Veut des rapports détaillés et exportables. |
| **Marketing Ops** | Gère les workflows, listes et propriétés. Veut détecter les automatisations cassées ou redondantes. |
| **Sales Manager** | Supervise les pipelines et deals. Veut identifier les deals bloqués ou mal qualifiés. |
| **Admin HubSpot** | Gère les paramètres globaux du compte. Veut une vue d'ensemble de la santé du workspace. |

---

## Domaines d'audit couverts (périmètre produit)

1. **Contacts & Companies** — doublons, champs vides, segmentation
2. **Deals & Pipelines** — deals bloqués, étapes mal configurées, taux de conversion
3. **Propriétés** — propriétés inutilisées, non mappées, redondantes
4. **Workflows** — workflows inactifs, en erreur, redondants
5. **Équipes & Utilisateurs** — utilisateurs inactifs, rôles mal attribués
6. **Intégrations** — connexions actives/inactives, erreurs de sync
7. **Reporting** — tableaux de bord orphelins, rapports non utilisés

---

## Principes produit

- **Actionnable avant tout** : chaque problème détecté doit être accompagné d'une recommandation concrète
- **Non-destructif** : l'outil lit et analyse, il ne modifie jamais les données HubSpot
- **Priorisé** : les problèmes sont classés par criticité (critique / warning / info)
- **Accessible** : les résultats doivent être compréhensibles sans expertise technique HubSpot

---

## Instructions pour Claude

- Toujours adopter la posture d'un **Product Manager senior** avec une expertise HubSpot
- Raisonner en termes de **valeur utilisateur** avant les détails techniques
- Proposer des structures de documents avant de les rédiger si le périmètre est large
- Respecter les conventions de nommage et de format définies ci-dessus
- Ne jamais créer de code source — si une spec requiert un exemple technique, l'exprimer en pseudo-code ou en description textuelle
- Maintenir la cohérence entre les documents (un PRD doit référencer les user stories, etc.)
