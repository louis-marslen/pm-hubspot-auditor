# EP-03 — Audit des workflows

## Hypothèse

Nous croyons que détecter automatiquement les workflows HubSpot problématiques (en erreur, zombies, mal nommés, non organisés) avec leur traduction en impact business permettra aux RevOps Managers et consultants d'identifier les automatisations cassées ou obsolètes qui font perdre des opportunités commerciales silencieusement — parce qu'aujourd'hui ces problèmes passent inaperçus jusqu'à ce qu'un incident client les révèle.

Nous mesurerons le succès via : pourcentage d'utilisateurs qui ont corrigé au moins un workflow dans les 14 jours suivant leur premier audit (cible : > 40%).

---

## Périmètre

### In scope
- Audit de tous les types de workflows HubSpot du workspace : Contact-based, Company-based, Deal-based, Ticket-based, Quote-based, Custom Object-based
- Détection des 7 règles définies (W1 à W7)
- Présentation des résultats en deux niveaux : détail opérationnel + impact business
- Calcul d'un score de santé pour le domaine Workflows (contribue à 50% du score global en phase NOW)

### Out of scope
- Modification, activation ou désactivation de workflows (l'outil est non-destructif)
- Analyse du contenu des actions de workflow (vérifier si les actions sont "bien configurées")
- Détection de workflows redondants (même logique métier dans deux workflows différents) — trop complexe à détecter de façon fiable en phase NOW
- Analyse des délais entre étapes de workflow
- Historique d'exécution au-delà de 90 jours (limite API HubSpot)

---

## User stories

### Story 1 — Vue d'ensemble de l'audit workflows

**En tant que** RevOps Manager ou consultant
**je veux** voir un résumé consolidé de l'état de tous les workflows de mon workspace
**afin de** comprendre en 30 secondes l'ampleur des problèmes avant de plonger dans le détail

**Critères d'acceptance :**

*Scénario : Affichage du résumé de l'audit workflows*
**Étant donné** que l'audit du workspace est terminé
**Quand** j'accède à la section Workflows du rapport
**Alors** je vois :
- Le nombre total de workflows analysés, ventilé par type (Contact-based : X, Deal-based : Y, …)
- Le nombre total de workflows actifs vs inactifs
- Le décompte des problèmes par criticité : 🔴 X critiques / 🟡 Y avertissements / 🔵 Z informations
- Le score de santé du domaine Workflows sur 100
- Un bandeau de statut global : Critique / À améliorer / Bon / Excellent

---

### Story 2 — Détection des workflows critiques

**En tant que** RevOps Manager
**je veux** voir immédiatement quels workflows sont en erreur ou mal configurés
**afin de** corriger en priorité les automatisations qui ne fonctionnent pas et qui peuvent faire perdre des leads ou des opportunités

**Critères d'acceptance :**

*Scénario : Workflows en erreur active (W1)*
**Étant donné** que certains workflows ont un taux d'erreur > 10% sur les 30 derniers jours
**Quand** je consulte la règle W1
**Alors** je vois pour chaque workflow concerné : nom, type, taux d'erreur (%), nombre d'erreurs sur 30 jours, date de la dernière erreur
**Et** les workflows sont triés par taux d'erreur décroissant

*Scénario : Workflows sans action configurée (W2)*
**Étant donné** que certains workflows actifs n'ont aucune action dans leurs branches
**Quand** je consulte la règle W2
**Alors** je vois la liste des workflows concernés avec : nom, type, date de création, nombre d'enrôlements totaux
**Et** un message d'explication : "Ce workflow se déclenche mais n'exécute aucune action — les contacts/records enrôlés ne sont pas traités"

*Scénario : Aucun workflow critique*
**Étant donné** qu'aucun workflow ne déclenche W1 ou W2
**Quand** je consulte la section critique du rapport workflows
**Alors** je vois "✅ Aucun workflow en erreur active ni sans action"

---

### Story 3 — Détection des workflows obsolètes

**En tant que** RevOps Manager
**je veux** voir les workflows qui semblent inactifs ou abandonnés
**afin de** faire le ménage dans mon workspace et réduire la complexité de ma configuration

**Critères d'acceptance :**

*Scénario : Workflows zombies (W3)*
**Étant donné** que certains workflows actifs n'ont eu aucun enrôlement dans les 90 derniers jours
**Quand** je consulte la règle W3
**Alors** je vois pour chaque workflow : nom, type, date de dernière activation, dernier enrôlement connu, nombre total d'enrôlements depuis la création
**Et** un indicateur visuel différencie les workflows "jamais utilisés" (0 enrôlement total) des workflows "anciennement actifs" (enrôlements historiques mais plus récents)

*Scénario : Workflows désactivés depuis longtemps (W4)*
**Étant donné** que certains workflows sont en statut inactif depuis plus de 90 jours
**Quand** je consulte la règle W4
**Alors** je vois pour chaque workflow : nom, type, date de désactivation, ancienneté de l'inactivité en jours
**Et** les workflows sont triés par ancienneté de désactivation décroissante

*Scénario : Workflows désactivés récemment (W5)*
**Étant donné** que certains workflows ont été désactivés dans les 90 derniers jours
**Quand** je consulte la règle W5
**Alors** je vois la liste avec la date de désactivation
**Et** le message indique : "Ces workflows ont été désactivés récemment — vérifiez s'il s'agit d'une pause intentionnelle"

---

### Story 4 — Détection des problèmes de gouvernance workflows

**En tant que** RevOps Manager
**je veux** voir les workflows mal nommés ou non organisés en dossiers
**afin d'** améliorer la lisibilité et la maintenabilité de ma configuration HubSpot

**Critères d'acceptance :**

*Scénario : Workflows avec nom non compréhensible (W6)*
**Étant donné** que certains workflows ont un nom générique ou peu descriptif
**Quand** je consulte la règle W6
**Alors** je vois la liste des workflows concernés avec leur nom actuel et le pattern détecté (ex. "Nom générique : 'Copy of…'")
**Et** les patterns détectés sont : noms contenant "Copy of", "New workflow", "Workflow" suivi d'un chiffre seul, noms de moins de 5 caractères

*Scénario : Workflows non rangés dans un dossier (W7)*
**Étant donné** que certains workflows ne sont pas assignés à un dossier
**Quand** je consulte la règle W7
**Alors** je vois le pourcentage de workflows sans dossier sur le total
**Et** la liste des workflows concernés avec leur type et leur statut (actif/inactif)

---

### Story 5 — Impact business des problèmes de workflows

**En tant que** RevOps Manager ou consultant
**je veux** voir l'impact business estimé de chaque catégorie de problème de workflow détecté
**afin de** pouvoir justifier une intervention corrective auprès de ma direction ou de mon client sans avoir à reformuler moi-même les enjeux techniques

**Critères d'acceptance :**

*Scénario : Affichage de l'impact business*
**Étant donné** que des problèmes de workflows ont été détectés
**Quand** je consulte la section "Impact business" du domaine Workflows
**Alors** pour chaque règle ayant au moins un problème détecté, je vois un encart avec un titre en langage business, une estimation d'impact qualitative, et un niveau d'urgence business

---

## Spécifications fonctionnelles

### Règles de détection complètes

| ID | Règle | Condition précise | Criticité |
|---|---|---|---|
| W1 | En erreur active | `error_rate` > 10% calculé sur les 30 derniers jours d'exécution ET workflow en statut `active` | 🔴 Critique |
| W2 | Sans action configurée | Workflow en statut `active` ET 0 action dans toutes les branches (enrollment trigger présent mais branches vides ou uniquement des conditions sans actions) | 🔴 Critique |
| W3 | Zombie | Statut `active` ET `last_enrollment_date` > 90 jours (ou null) ET `created_at` > 30 jours | 🟡 Avertissement |
| W4 | Inactif depuis longtemps | Statut `inactive` ET date de désactivation > 90 jours | 🟡 Avertissement |
| W5 | Inactif récent | Statut `inactive` ET date de désactivation ≤ 90 jours | 🔵 Info |
| W6 | Nom non compréhensible | Nom correspond à l'un des patterns : `/^copy of /i`, `/^new workflow/i`, `/^workflow\s*\d+$/i`, longueur < 5 caractères | 🔵 Info |
| W7 | Non rangé dans un dossier | `folderId` = null | 🔵 Info |

### Cas particuliers et exclusions

| Cas | Traitement |
|---|---|
| Workflow de type "Simple" (ancienne génération HubSpot) | Inclus dans l'audit, signalé avec une mention "Workflow ancienne génération" |
| Workflow créé il y a moins de 7 jours | Exclu des règles W2, W3, W6, W7 (délai de grâce post-création) |
| Workspace sans aucun workflow | Afficher "Aucun workflow trouvé dans ce workspace" — pas de score calculé pour ce domaine, le score global est recalculé sur les domaines disponibles |
| Erreurs API sur un workflow spécifique | Le workflow est marqué "Non analysé" et exclu du score — un avertissement est affiché dans le rapport |

### Calcul du score Workflows

```
Score_workflows = 100
  - (nb_critiques × 5), plafonné à -30
  - (nb_avertissements × 2), plafonné à -15
  - (nb_infos × 0.5), plafonné à -5

Score_workflows = max(0, Score_workflows)
```

Le score workflows contribue à **50% du score global** en phase NOW.

### Traductions business par règle

| Règle(s) | Titre business | Impact estimé | Urgence |
|---|---|---|---|
| W1 | **Automatisations cassées en production** | Des actions censées se déclencher automatiquement (assignation de leads, relances, notifications) ne s'exécutent pas. Chaque erreur peut représenter un lead non traité ou une opportunité commerciale manquée. | Élevé |
| W2 | **Workflows actifs qui ne font rien** | Des contacts ou deals entrent dans un workflow, consomment des ressources, et ne reçoivent aucun traitement. Ces workflows créent une fausse impression d'automatisation sans aucun bénéfice réel. | Élevé |
| W3 | **Automatisations fantômes — actives mais sans effet** | Des workflows restent actifs alors qu'aucun record n'y entre. Soit le trigger ne correspond plus à la réalité du business, soit les données ont évolué. Risque de déclenchement massif non intentionnel si les données changent. | Moyen |
| W4 | **Dette de configuration non traitée** | Des workflows désactivés depuis plus de 3 mois encombrent la configuration et compliquent la compréhension du système. Ils représentent une charge cognitive pour toute personne qui doit intervenir sur le CRM. | Moyen |
| W6, W7 | **Configuration illisible et non maintenable** | Des workflows mal nommés et non organisés ralentissent chaque intervention sur le CRM. En cas de départ ou d'onboarding, personne ne comprend ce que font les automatisations sans investir plusieurs heures d'investigation. | Moyen |

---

## Critères d'acceptance de l'epic

- [ ] Toutes les règles W1 à W7 sont détectées correctement sur un workspace de test avec des workflows de chaque type
- [ ] Le délai de grâce de 7 jours post-création est respecté pour les règles concernées
- [ ] Les workflows de l'ancienne génération HubSpot sont inclus et correctement identifiés
- [ ] Si le workspace ne contient aucun workflow, un message approprié s'affiche sans erreur
- [ ] Le score Workflows est calculé et cohérent avec les problèmes détectés
- [ ] Chaque problème détecté affiche son impact business correspondant
- [ ] Le temps d'exécution de l'audit workflows est < 30 secondes sur un workspace avec jusqu'à 200 workflows
- [ ] L'audit est non-destructif : aucune écriture ni modification dans HubSpot

---

## Dépendances

- **EP-01** (Connexion HubSpot OAuth) : doit être complété — nécessite un token d'accès valide avec les scopes workflows
- **EP-04** (Tableau de bord) : consomme le score et les résultats produits par cet epic

---

## Questions ouvertes

| # | Question | Impact | Statut |
|---|---|---|---|
| Q1 | Comment calculer le `error_rate` (W1) si l'API HubSpot ne retourne pas directement ce ratio ? | Impacte la faisabilité technique de W1 | ✅ **Décision :** Calculer `error_rate = (nb_erreurs / nb_enrôlements) × 100` sur les 30 derniers jours. Si l'API ne fournit pas directement ces données agrégées, l'équipe tech doit trouver le endpoint approprié et documenter l'approche dans les specs d'implémentation. |
| Q2 | Pour W3 (zombie), doit-on exclure les workflows dont le trigger est un événement rare par nature ? | Impacte la pertinence des résultats | ✅ **Décision PO :** Pas d'exclusion automatique en phase NOW. Les faux positifs éventuels seront traités lors de la beta. L'utilisateur peut ignorer manuellement un résultat (NEXT phase). |
| Q3 | Faut-il afficher un lien direct vers le workflow dans HubSpot depuis le rapport (deep link) ? | UX — facilite la correction | ✅ **Décision PO :** Hors scope pour la v1. À ajouter en phase NEXT une fois le pattern d'URL HubSpot confirmé. |
