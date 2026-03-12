---
name: developpement-prd
description: Construire un PRD structuré qui connecte problème, utilisateurs, solution et critères de succès. À utiliser pour transformer des notes de discovery en document prêt pour l'ingénierie.
type: workflow
source: adapté de deanpeters/Product-Manager-Skills — prd-development
---

## Objectif

Guider le PM à travers la création d'un PRD (Product Requirements Document) structuré en orchestrant le cadrage du problème, la synthèse de la recherche utilisateur, la définition de la solution et les critères de succès. L'objectif est de passer de notes éparses à un PRD clair et complet qui aligne les parties prenantes, fournit le contexte à l'engineering et sert de source de vérité.

Ce n'est pas une spec waterfall — c'est un document vivant qui évolue au fil de la livraison.

---

## Structure standard d'un PRD

```markdown
# [Nom de la feature/du produit] — PRD

## 1. Résumé exécutif
- Vue d'ensemble en un paragraphe (problème + solution + impact)

## 2. Problem statement
- Qui a ce problème ? Quel est le problème ? Pourquoi est-il douloureux ?
- Preuves (verbatims clients, données, recherche)

## 3. Utilisateurs cibles & personas
- Persona(s) primaire(s) et secondaire(s)
- Jobs-to-be-Done

## 4. Contexte stratégique
- Objectifs business (OKRs)
- Opportunité marché
- Paysage concurrentiel
- Pourquoi maintenant ?

## 5. Vue d'ensemble de la solution
- Description haut niveau
- Flux utilisateur
- Features clés

## 6. Métriques de succès
- Métrique primaire (ce qu'on optimise)
- Métriques secondaires
- Cibles (actuel → objectif)

## 7. User stories & requirements
- Hypothèse d'epic
- User stories avec critères d'acceptance
- Cas limites, contraintes

## 8. Out of scope
- Ce qu'on ne construit PAS (et pourquoi)

## 9. Dépendances & risques
- Dépendances techniques
- Dépendances externes (intégrations, partenariats)
- Risques et mitigations

## 10. Questions ouvertes
- Décisions non résolues
- Zones nécessitant plus de discovery
```

---

## Phases du workflow

### Phase 1 : Résumé exécutif (30 min)

Rédiger un paragraphe d'introduction pour les lecteurs pressés.

**Format :** "Nous construisons [solution] pour [persona] afin de résoudre [problème], ce qui aura pour résultat [impact]."

**Conseil :** Écrire en premier (force la clarté), affiner en dernier (après les autres sections).

---

### Phase 2 : Problem statement (60 min)

**Utiliser le skill `enonce-probleme`** pour cadrer le problème client avec des preuves.

**Exemple de structure :**
```markdown
### Qui a ce problème ?
[Persona spécifique avec contexte]

### Quel est le problème ?
[Description précise avec données]

### Pourquoi est-il douloureux ?
- Impact utilisateur : [...]
- Impact business : [...]

### Preuves
- Interviews : [...]
- Analytics : [...]
- Tickets support : [...]
```

---

### Phase 3 : Utilisateurs cibles & personas (30 min)

**Utiliser l'output du skill `proto-persona`.**

Pour chaque persona, documenter : rôle, taille d'entreprise, maturité technique, objectifs, points de douleur, comportements actuels.

---

### Phase 4 : Contexte stratégique (45 min)

1. **Objectifs business** — Lier la feature aux OKRs de l'entreprise
2. **Opportunité marché** — TAM/SAM/SOM si pertinent pour les présentations exec
3. **Paysage concurrentiel** — Comment les concurrents adressent ce besoin
4. **Pourquoi maintenant ?** — Justifier la priorité de cette feature à ce moment

---

### Phase 5 : Vue d'ensemble de la solution (60 min)

Décrire ce qu'on construit à un niveau élevé — pas de spec UI pixel par pixel.

**Format :**
```markdown
## Solution overview

Nous construisons [description haut niveau de la solution].

**Comment ça fonctionne :**
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]

**Features clés :**
- [Feature A]
- [Feature B]
```

---

### Phase 6 : Métriques de succès (30 min)

```markdown
### Métrique primaire
**[Nom]** (ce qu'on optimise)
- Actuel : [X]
- Cible : [Y]
- Délai de mesure : [Z jours après le lancement]

### Métriques secondaires
- [Métrique 2] : [cible]
- [Métrique 3] : [cible]

### Métriques garde-fou
- [Métriques qui ne doivent pas régresser]
```

---

### Phase 7 : User stories & requirements (90 à 120 min)

1. **Hypothèse d'epic** — "Nous croyons que [construire X] pour [persona] permettra d'atteindre [résultat] car [hypothèse]. Nous mesurerons le succès via [métrique]."
2. **Découper l'epic en user stories** — Utiliser le skill `decoupeur-epics`
3. **Rédiger les user stories** — Utiliser le skill `user-story` (format + critères d'acceptance)
4. **Documenter les contraintes & cas limites**

---

### Phase 8 : Out of scope & dépendances (30 min)

```markdown
## Out of scope
- [Feature A] — Raison de l'exclusion
- [Feature B] — Raison de l'exclusion

## Dépendances & risques
### Dépendances
- Design : [livrable, ETA]
- Engineering : [dépendances techniques]

### Risques & mitigations
- Risque : [description] → Mitigation : [action]

## Questions ouvertes
- [Question non résolue 1]
- [Question non résolue 2]
```

---

## Récapitulatif timeline

```
Jour 1 :
├─ Phase 1 : Résumé exécutif (30 min)
├─ Phase 2 : Problem statement (60 min)
├─ Phase 3 : Personas (30 min)
└─ Phase 4 : Contexte stratégique (45 min)

Jour 2 :
├─ Phase 5 : Solution overview (60 min)
├─ Phase 6 : Métriques de succès (30 min)
└─ Phase 7 : User stories (90-120 min)

Jour 3 :
├─ Phase 8 : Out of scope & dépendances (30 min)
└─ Relecture & affinage (60 min)

Jour 4 (optionnel) :
└─ Revue parties prenantes & approbation
```

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| PRD rédigé en isolation | PM présente un doc fini à l'équipe | Collaborer sur la Phase 7 avec design + engineering |
| Pas de preuves dans le problem statement | "Nous pensons que les utilisateurs ont ce problème" | Inclure verbatims, analytics, tickets support |
| Solution trop prescriptive | Spec UI au pixel près | Garder la Phase 5 à haut niveau, laisser le design propriétaire des détails UI |
| Pas de métriques de succès | PRD sans mesure du succès | Toujours définir la métrique primaire en Phase 6 |
| Out of scope non documenté | Créep de scope | Explicitement documenter ce qu'on ne construit PAS |
