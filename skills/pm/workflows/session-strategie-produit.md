---
name: session-strategie-produit
description: Conduire une session de stratégie produit de bout en bout — positionnement, discovery, roadmap. À utiliser quand l'équipe a besoin d'une direction validée avant de s'engager dans l'exécution.
type: workflow
source: adapté de deanpeters/Product-Manager-Skills — product-strategy-session
---

## Objectif

Guider le PM à travers une session de stratégie produit complète en orchestrant le positionnement, le cadrage du problème, la discovery client et la planification de roadmap. L'objectif est de passer d'une direction stratégique vague à une stratégie produit concrète et validée — avec un positionnement clair, des personas cibles, des problem statements et une roadmap priorisée.

Ce n'est pas un atelier ponctuel : c'est un processus répétable pour établir ou rafraîchir la stratégie produit, typiquement sur 2 à 4 semaines.

---

## Concepts clés

### Qu'est-ce qu'une session de stratégie produit ?

Un processus structuré en plusieurs phases qui fait passer le produit de l'ambiguïté stratégique à une direction validée :

1. **Positionnement & contexte marché** — Définir à qui on s'adresse, quel problème on résout, comment on se différencie
2. **Discovery & validation du problème** — Cadrer et valider les problèmes clients via la recherche
3. **Exploration de solutions** — Générer des opportunités et prioriser selon l'impact
4. **Planification de roadmap** — Séquencer les epics et releases selon la stratégie

### Anti-patterns à éviter
- **Pas un brainstorming de features** : les sessions de stratégie cadrent des problèmes, elles ne listent pas des features
- **Pas du waterfall** : des boucles de feedback et d'itération sont intégrées
- **Pas un exercice solo du PM** : nécessite une participation cross-fonctionnelle

---

## Phases du workflow

### Phase 1 : Positionnement & contexte marché (Jours 1-2)

**Objectif :** Définir le client cible, l'espace problème et la différenciation.

**Activités :**
1. Utiliser le skill `enonce-positionnement` pour un atelier de 90 min avec PM, leadership produit, marketing, sales → **Output :** énoncé de positionnement
2. Définir les proto-personas (skill `proto-persona`) — 60 min → **Output :** 1 à 3 proto-personas
3. Cartographier les Jobs-to-be-Done (skill `jobs-to-be-done`) — 60 min → **Output :** énoncés JTBD par persona

**Point de décision :** Avons-nous suffisamment de contexte client ?
- **OUI** → Passer à la Phase 2
- **NON** → Utiliser le skill `preparation-interviews-decouverte`, planifier 5 à 10 interviews (+1 semaine)

---

### Phase 2 : Cadrage & validation du problème (Jours 3-5)

**Objectif :** Cadrer le problème client central et valider qu'il vaut la peine d'être résolu.

**Activités :**
1. Rédiger un problem statement structuré (skill `enonce-probleme`) — 60 min
2. Cartographier le parcours client si le problème couvre plusieurs touchpoints (skill `cartographie-parcours-client`) — 90 min

**Point de décision :** Le problème est-il validé ?
- **OUI** → Passer à la Phase 3
- **NON** → Mener des interviews de découverte (+1 semaine)

---

### Phase 3 : Exploration de solutions (Semaine 2, Jours 1-3)

**Objectif :** Générer des options de solutions, prioriser selon faisabilité/impact, sélectionner un POC.

**Activités :**
1. Construire un Opportunity Solution Tree (skill `arbre-opportunites-solutions`) — 90 min → 3 opportunités, 3 solutions par opportunité, recommandation de POC
2. Définir des hypothèses d'epics — 60 min par epic → énoncés d'hypothèses pour les 3 à 5 initiatives prioritaires

**Point de décision :** Faut-il tester les solutions avant de s'engager ?
- **OUI (forte incertitude)** → Concevoir des expériences POC, tester avec 10 à 20 clients (+1 à 2 semaines)
- **NON (faible incertitude)** → Passer à la Phase 4

---

### Phase 4 : Priorisation & planification de roadmap (Semaine 2, Jours 4-5)

**Objectif :** Prioriser les initiatives et les séquencer dans une roadmap exécutable.

**Activités :**
1. Choisir un framework de priorisation (skill `conseiller-priorisation`) — 30 min
2. Scorer et prioriser les epics — 90 min avec PM, lead engineering, leadership produit
3. Séquencer la roadmap par release — 60 min → roadmap trimestrielle

---

### Phase 5 : Alignement parties prenantes (Semaine 3)

**Objectif :** Présenter la stratégie, recueillir les feedbacks, affiner.

**Activités :**
1. Préparer une présentation de 60 min couvrant : positionnement, problem statement, options de solutions, priorisation, roadmap
2. Présenter aux parties prenantes (execs, leadership produit) → recueillir feedbacks
3. Affiner selon les retours (1 à 2 jours)

---

### Phase 6 : Planification de l'exécution (Semaine 4)

**Objectif :** Découper les epics en user stories, planifier le premier sprint/release.

**Activités :**
1. Découper l'epic prioritaire (skill `decoupeur-epics`) — 90 min
2. Rédiger les user stories (skill `user-story`) — 30 min par story
3. Planifier le premier sprint — 60 min

---

## Récapitulatif du workflow complet

```
Semaine 1 :
├─ Jours 1-2 : Positionnement & contexte marché
│  ├─ skills/enonce-positionnement (90 min)
│  ├─ skills/proto-persona (60 min)
│  └─ skills/jobs-to-be-done (60 min)
│
└─ Jours 3-5 : Cadrage & validation du problème
   ├─ skills/enonce-probleme (60 min)
   └─ [Optionnel] skills/cartographie-parcours-client (90 min)

Semaine 2 :
├─ Jours 1-3 : Exploration de solutions
│  └─ skills/arbre-opportunites-solutions (90 min)
│
└─ Jours 4-5 : Priorisation & roadmap
   └─ skills/conseiller-priorisation (30 min) + scoring epics (90 min)

Semaine 3 : Alignement parties prenantes

Semaine 4 : Planification de l'exécution
   ├─ skills/decoupeur-epics (90 min)
   └─ skills/user-story (30 min par story)
```

**Investissement temps :**
- **Minimum :** 2 semaines (sans discovery ni expériences)
- **Typique :** 3 semaines (avec 1 cycle de validation)
- **Maximum :** 4 à 6 semaines (avec interviews de discovery + expériences)

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Sauter la validation du problème | Passer du positionnement à la solution sans valider | Forcer le point de décision après la Phase 2 |
| Exercice solo du PM | PM présente une stratégie finie à l'équipe | Inclure des participants cross-fonctionnels dans les ateliers |
| Sans sponsorship exécutif | Les execs n'assistent pas à la Phase 5 | Sécuriser l'engagement exec avant de démarrer |
| Paralysie analytique | 6 semaines en mode stratégie sans exécution | Time-boxer à 2 à 4 semaines, puis exécuter |
