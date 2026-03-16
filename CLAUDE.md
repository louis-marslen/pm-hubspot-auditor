# CLAUDE.md — HubSpot Auditor

Ce dépôt contient **à la fois les artefacts de product management et le code source** de HubSpot Auditor. Il est conçu pour un travail hybride : une instance Claude peut opérer en mode PM ou en mode Dev selon le contexte, avec un accès complet aux deux dimensions.

---

## Description du produit

**HubSpot Auditor** est un outil SaaS permettant aux utilisateurs d'auditer leur workspace HubSpot. Il analyse la qualité, la cohérence et les bonnes pratiques d'un compte HubSpot (contacts, deals, propriétés, workflows, pipelines, équipes, intégrations, etc.) et restitue un rapport d'audit actionnable avec des recommandations priorisées.

---

## Structure du dépôt

```
pm-hubspot-auditor/
├── product/          ← Artefacts PM (epics, PRDs, stratégie, roadmap)
│   ├── CLAUDE.md     ← Instructions mode PM
│   ├── strategy/
│   ├── roadmap/
│   ├── prd/
│   ├── epics/
│   └── research/
├── src/              ← Code source de l'application
│   └── CLAUDE.md     ← Instructions mode Dev
└── skills/           ← Bibliothèque de skills Claude (PM + Tech)
    ├── pm/           ← Skills product management
    └── tech/         ← Skills développement
```

---

## Deux modes de travail

### Mode PM

Actif quand on travaille dans `product/`. Objectif : définir, raffiner et documenter le produit.

- Lire `product/CLAUDE.md` pour les instructions détaillées
- Ne jamais créer ni modifier de fichiers dans `src/`
- Skills disponibles : `skills/pm/`

### Mode Dev

Actif quand on travaille dans `src/`. Objectif : implémenter les features spécifiées dans les PRDs.

- Lire `src/CLAUDE.md` pour les instructions détaillées
- Ne jamais créer ni modifier de fichiers dans `product/`
- Toujours lire le PRD correspondant dans `product/prd/` avant d'implémenter une feature
- Skills disponibles : `skills/tech/`

---

## Contexte partagé (applicable dans les deux modes)

### Personas principaux

| Persona | Description |
|---|---|
| **RevOps Manager** | Responsable de l'hygiène et de la gouvernance du CRM. Veut des rapports détaillés et exportables. |
| **Marketing Ops** | Gère les workflows, listes et propriétés. Veut détecter les automatisations cassées ou redondantes. |
| **Sales Manager** | Supervise les pipelines et deals. Veut identifier les deals bloqués ou mal qualifiés. |
| **Admin HubSpot** | Gère les paramètres globaux du compte. Veut une vue d'ensemble de la santé du workspace. |

### Domaines d'audit couverts

1. **Contacts & Companies** — doublons, champs vides, segmentation
2. **Deals & Pipelines** — deals bloqués, étapes mal configurées, taux de conversion
3. **Propriétés** — propriétés inutilisées, non mappées, redondantes
4. **Workflows** — workflows inactifs, en erreur, redondants
5. **Équipes & Utilisateurs** — utilisateurs inactifs, rôles mal attribués, Super Admins en excès

### Principes produit

- **Actionnable avant tout** : chaque problème détecté doit être accompagné d'une recommandation concrète
- **Non-destructif** : l'outil lit et analyse, il ne modifie jamais les données HubSpot
- **Priorisé** : les problèmes sont classés par criticité (critique / warning / info)
- **Accessible** : les résultats doivent être compréhensibles sans expertise technique HubSpot

### Décisions techniques actées

| Décision | Choix retenu |
|---|---|
| Email transactionnel | Resend (compte gratuit) |
| LLM (résumés exécutifs) | OpenAI API (crédits disponibles, switchable plus tard) |
| Authentification HubSpot | OAuth 2.0 Authorization Code Flow — Public App déjà créée |
| Partage de rapports | Lien public unique (style Notion), sans authentification requête |
| Rétention des données | Indéfinie (pas de purge automatique en v1) |
| Comptes utilisateurs | Email + mot de passe, multi-workspace HubSpot |

---

## Conventions globales

- Langue : **français** pour tous les documents, termes HubSpot/techniques en anglais
- Fichiers : Markdown `.md`, noms en `kebab-case`, H1 en titre de fichier
- Commits : descriptifs, en français ou anglais selon le contexte
