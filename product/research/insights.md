# Insights — Discovery & Recherche

Fichier vivant pour capturer les apprentissages terrain au fil de l'eau.
Les insights structurés alimentent les problem statements et les epic files.

---

## Insights fondateurs (hypothèses initiales de Louis)

*Source : expérience directe en tant que consultant RevOps freelance*

### Sur la douleur des admins HubSpot

- Les workspaces HubSpot accumulent de la dette de configuration : propriétés créées et jamais utilisées, workflows qui tournent dans le vide, doublons non traités
- L'audit manuel d'un workspace prend entre 4 heures et 2 jours selon sa taille et sa complexité
- HubSpot ne propose aucun rapport natif sur l'état de la gouvernance d'un workspace
- Les admins découvrent souvent les problèmes lors d'un incident (mauvaise segmentation envoyée, workflow qui a déclenché sur les mauvais contacts, etc.)

### Sur le cas d'usage consultant

- En début de mission, le premier livrable attendu par le client est un "état des lieux" — sans outil, ce travail prend 1 à 2 jours
- Les clients perçoivent cet audit initial comme de la valeur ajoutée s'il est bien présenté
- Un rapport structuré en début de mission légitime les recommandations qui suivent

### Sur les domaines les plus problématiques

Classement subjectif par fréquence et sévérité observées en mission :
1. 🔴 **Propriétés** — Prolifération de custom properties inutilisées ou redondantes
2. 🔴 **Workflows** — Automatisations en erreur silencieuse ou inactives depuis des mois
3. 🟡 **Contacts & doublons** — Bases dupliquées, champs clés vides
4. 🟡 **Deals & pipelines** — Deals bloqués, stages mal configurés
5. 🔵 **Utilisateurs** — Licences attribuées à d'anciens employés
6. 🔵 **Reporting** — Tableaux de bord orphelins ou basés sur des données incorrectes

---

## Interviews clients

*Ajouter les résumés d'interviews dans le dossier `interviews/` et les insights clés ici.*

| Date | Profil interviewé | Fichier | Insights clés |
|---|---|---|---|
| — | — | — | Aucune interview réalisée pour le moment |

---

## À valider (hypothèses non confirmées)

- [ ] Les prospects sont prêts à connecter leur HubSpot à un outil tiers sans friction excessive
- [ ] Le score de santé global est un KPI parlant pour justifier un budget de nettoyage en interne
- [ ] Le cas d'usage "consultant" justifie un plan tarifaire dédié (multi-workspace)
- [ ] L'audit des propriétés seul délivre suffisamment de valeur pour justifier l'inscription
- [ ] La traduction business des problèmes CRM est suffisamment précise pour être crédible aux yeux d'un CEO (sans données financières réelles du workspace)
- [ ] Les RevOps en interne ont effectivement du mal à traduire les problèmes CRM en langage dirigeant — ou savent le faire mais manquent simplement de données structurées
- [ ] La vue "executive summary" du rapport est ce qui débloque l'action côté client (vs. le détail technique)
