---
name: planification-roadmap
description: Planifier une roadmap stratégique — priorisation, définition des epics, alignement parties prenantes, séquençage. À utiliser pour transformer la stratégie en plan de release exécutable.
type: workflow
source: adapté de deanpeters/Product-Manager-Skills — roadmap-planning
---

## Objectif

Guider le PM à travers la planification stratégique de la roadmap en orchestrant priorisation, définition des epics, alignement des parties prenantes et séquençage des releases. L'objectif est de passer de feature requests disparates à une roadmap cohérente, orientée résultats, qui aligne les parties prenantes.

Ce n'est pas un diagramme de Gantt — c'est un outil de communication stratégique qui montre ce qu'on construit, pourquoi c'est important, et comment ça s'inscrit dans les objectifs business.

---

## Types de roadmaps

| Type | Description | Idéal pour |
|---|---|---|
| **Now/Next/Later** | Maintenant / Bientôt / Plus tard | Équipes agiles, forte incertitude |
| **Par thèmes stratégiques** | Organisé par thèmes (ex. Rétention, Croissance) | Communication exec, intention stratégique |
| **Par trimestres** | Q1 : Epics A, B ; Q2 : Epics C, D | Planification des ressources, communication parties prenantes |
| **Par features (anti-pattern)** | Liste de features sans contexte | ❌ Éviter — pas de narrative stratégique |

---

## Phases du workflow

### Phase 1 : Collecte des inputs (Jours 1-2)

**Objectif :** Rassembler objectifs business, problèmes clients, contraintes techniques, demandes des parties prenantes.

**1. Revoir les objectifs business (OKRs)**
- Quelles sont les 3 priorités clés de l'entreprise cette année ?
- Quelles métriques doit-on faire bouger ? (revenu, rétention, acquisition, efficacité)
- Y a-t-il des paris stratégiques ? (nouveaux marchés, partenariats, nouvelles lignes de produits)

**2. Revoir les problèmes clients (insights de discovery)**
- Quels sont les 3 à 5 principaux points de douleur clients ?
- Quels problèmes affectent le plus d'utilisateurs et avec quelle intensité ?

**3. Revoir les contraintes techniques**
- Quels sont les blockers techniques ? (scalabilité, sécurité, performance)
- Quels investissements techniques sont nécessaires ? (migrations, upgrades)

**4. Revoir les demandes des parties prenantes**
- Qu'est-ce que le Sales demande ? (features enterprise, intégrations)
- Qu'est-ce que le Marketing demande ? (initiatives de croissance)
- Qu'est-ce que le Customer Success remonte ? (risques de churn)

---

### Phase 2 : Définir les initiatives (epics) (Jours 3-4)

**Objectif :** Transformer les inputs en epics avec hypothèses, métriques de succès et estimations d'effort.

**1. Rédiger les hypothèses d'epics**

Format : "Nous croyons que [construire X] pour [persona] permettra d'atteindre [résultat] car [hypothèse]. Nous mesurerons le succès via [métrique]."

**2. Estimer l'effort (T-shirt sizing)**

| Taille | Durée | Équipe |
|---|---|---|
| S (Small) | 1 à 2 semaines | 1 à 2 ingénieurs |
| M (Medium) | 3 à 4 semaines | 2 à 3 ingénieurs |
| L (Large) | 2 à 3 mois | 3 à 5 ingénieurs |
| XL (Extra Large) | 3+ mois | 5+ ingénieurs |

**3. Mapper les epics aux objectifs business**
- Pour chaque epic, taguer avec le résultat business primaire (Rétention, Acquisition, Engagement, Efficacité)

---

### Phase 3 : Prioriser les initiatives (Jour 5)

**Objectif :** Classer les epics par impact, effort et alignement stratégique.

**1. Choisir un framework de priorisation** — Utiliser le skill `conseiller-priorisation`

**2. Scorer les epics** — Exemple avec RICE :

| Epic | Reach | Impact | Confidence | Effort | Score RICE |
|---|---|---|---|---|---|
| [Epic A] | [users/mois] | [1-3] | [%] | [mois] | [(R×I×C)/E] |

**3. Ajuster pour l'alignement stratégique** — Les scores RICE ne capturent pas tout. Promouvoir les epics qui s'alignent avec les paris stratégiques.

---

### Phase 4 : Séquencer la roadmap (Jours 6-7)

**Objectif :** Organiser les epics par trimestres/releases avec les dépendances logiques.

**1. Mapper les dépendances**
- L'Epic B dépend-il de l'Epic A ?
- Y a-t-il des blockers techniques ?

**2. Séquencer par trimestre**

```
Q1 (Maintenant — Engagé) :
├─ [Epic A] — [Résultat business]
└─ [Epic B] — [Résultat business]

Q2 (Bientôt — Forte confiance) :
├─ [Epic C] (dépend de Q1)
└─ [Epic D]

Q3 (Plus tard — Confiance modérée) :
├─ [Epic E]
└─ [Epic F]
```

**3. Valider avec l'engineering** — Le séquençage est-il réaliste en termes de capacité et de dépendances ?

---

### Phase 5 : Communiquer la roadmap (Semaine 2)

**Objectif :** Présenter la roadmap, recueillir les feedbacks, construire l'alignement.

**Structure de la présentation (30 à 45 min) :**
- Slide 1 : Contexte stratégique (objectifs business, problèmes clients)
- Slides 2-3 : Vue d'ensemble de la roadmap (Q1, Q2, Q3)
- Slides 4-6 : Deep dive par trimestre (epics, hypothèses, métriques)
- Slide 7 : Ce qui N'EST PAS dans la roadmap (et pourquoi)
- Slide 8 : Dépendances et risques

**Questions à poser aux parties prenantes :**
- Ces priorités s'alignent-elles avec les objectifs business ?
- Manque-t-il des problèmes clients critiques ?
- Les dépendances sont-elles claires ?

---

## Récapitulatif timeline

```
Semaine 1 :
├─ Jours 1-2 : Collecte des inputs
├─ Jours 3-4 : Définition des epics
├─ Jour 5 : Priorisation
└─ Jours 6-7 : Séquençage

Semaine 2 :
└─ Présentation, feedbacks, publication
```

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Roadmap par features (sans résultats) | Liste de features sans contexte | Cadrer les epics comme hypothèses avec métriques |
| Priorisation par HiPPO | Execs dictent la roadmap | Utiliser un framework (RICE) pour scorer transparemment |
| Roadmap comme engagement waterfall | Roadmap traitée comme un contrat | Communiquer : "plan stratégique, sujet à révision selon les apprentissages" |
| Pas de dépendances mappées | Séquençage sans vérification des dépendances | Mapper explicitement en Phase 4, valider avec l'engineering |
| Roadmap solo du PM | PM construit seul, présente le plan fini | Collecter les inputs (Phase 1) de toutes les parties prenantes |
