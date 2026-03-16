---
name: developpement-prd
description: Construire un PRD structuré qui connecte problème, utilisateurs, solution et critères de succès, puis mettre à jour les références design et produire le prompt d'implémentation. À utiliser pour transformer des notes de discovery en document prêt pour l'ingénierie.
type: workflow
source: adapté de deanpeters/Product-Manager-Skills — prd-development
---

## Objectif

Guider le PM à travers la création d'un PRD (Product Requirements Document) structuré en orchestrant le cadrage du problème, la synthèse de la recherche utilisateur, la définition de la solution et les critères de succès. L'objectif est de passer de notes éparses à un PRD clair et complet qui aligne les parties prenantes, fournit le contexte à l'engineering et sert de source de vérité.

Ce n'est pas une spec waterfall — c'est un document vivant qui évolue au fil de la livraison.

> **Ordre de création :** L'epic (périmètre, user stories, critères d'acceptance) doit être rédigé AVANT le PRD. Le PRD enrichit l'epic avec le contexte business (problème, personas, métriques, design) et produit le prompt d'implémentation. Voir la Phase 7 pour le détail.

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
- Considérations UX (parcours, états, feedback visuel)

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

Décrire ce qu'on construit à un niveau élevé — pas de spec UI pixel par pixel, mais inclure les considérations UX.

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

**Considérations UX :**
- Parcours utilisateur : [flux principal, du point d'entrée au résultat]
- États clés : [empty state, loading, erreur, succès — comment l'utilisateur est informé]
- Composants UI : [composants existants du design system à réutiliser, ou nouveaux à créer]
```

> **Note :** Si le parcours utilisateur est complexe ou que l'epic touche plusieurs écrans, utiliser le skill `audit-ux` en amont pour diagnostiquer les frictions existantes, ou `cartographie-parcours-client` pour mapper le flux complet.

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

> **Prérequis :** L'epic doit exister dans `product/epics/` AVANT de rédiger cette phase. Si l'epic n'existe pas encore, le créer d'abord en utilisant le skill `decoupeur-epics` pour le découpage et le skill `user-story` pour les stories. Le PRD importe ensuite les stories depuis l'epic — il ne les crée pas.

1. **Vérifier que l'epic existe** — Lire le fichier `product/epics/ep-XX-slug.md` correspondant. S'il n'existe pas, le créer maintenant (hypothèse, périmètre, user stories, critères d'acceptance, dépendances).
2. **Importer les user stories depuis l'epic** — Reprendre les stories de l'epic dans le PRD, en les enrichissant si nécessaire du contexte business et des preuves de la Phase 2
3. **Documenter les contraintes & cas limites** — Compléter avec les edge cases identifiés pendant le travail du PRD
4. **Vérifier la cohérence** — Les stories du PRD et de l'epic doivent être alignées. Si le PRD révèle des stories manquantes, les ajouter dans l'epic ET dans le PRD.

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

### Phase 9 : Mise à jour des références design (30-60 min)

**Cette phase est obligatoire.** Un PRD n'est pas terminé tant que les documents de design n'intègrent pas les nouveaux écrans et composants de la feature.

#### 9a — Mettre à jour `product/prd/screens-and-flows.md`

Pour chaque nouvel écran ou modification d'écran existant introduit par la feature :

- [ ] Ajouter l'écran dans la carte des écrans (section 1)
- [ ] Définir la place de l'écran dans la navigation (section 2)
- [ ] Ajouter ou mettre à jour le parcours utilisateur concerné (section 3)
- [ ] Décrire l'écran en détail : layout, contenu de chaque zone, variantes d'état (section 4)
- [ ] Mettre à jour le système d'états si de nouveaux patterns émergent (section 5)
- [ ] Mettre à jour le diff vs. existant si des écrans actuels sont modifiés (section 6)

**Format de description d'écran** (reprendre le pattern existant dans le doc) :

```markdown
### X.X — Nom de l'écran (`/url`)

[Schéma ASCII du layout]

#### Zones de contenu

| Zone | Contenu |
|---|---|
| ... | ... |

#### Variantes d'état

| État | Visuel |
|---|---|
| Empty | ... |
| Loading | ... |
| Error | ... |
| Success | ... |
```

#### 9b — Mettre à jour `product/prd/design-system-guidelines.md` (si nécessaire)

Si la feature nécessite un **nouveau composant UI** ou une **nouvelle variante** d'un composant existant :

- [ ] Vérifier si un composant existant couvre le besoin (ne pas créer de doublon)
- [ ] Si nouveau composant nécessaire : l'ajouter dans la section 2 du design system avec props, variants, états
- [ ] Si nouvelle variante d'un composant existant : l'ajouter dans le tableau des variants du composant
- [ ] Si nouveau token (couleur, icône) : l'ajouter dans la section 1

> **Principe : le design system et les specs d'écrans sont toujours à jour avec le dernier PRD écrit.** Un dev qui lit ces docs doit y trouver tout ce dont il a besoin pour implémenter la feature, sans avoir à deviner.

---

### Phase 10 : Rédaction du prompt d'implémentation (30-45 min)

**Cette phase est obligatoire.** Chaque PRD terminé produit un prompt prêt à l'emploi que le mode Dev peut exécuter directement.

**Output :** `product/prompts/prompt-ep-XX-slug.md`

#### Structure du prompt

```markdown
# Prompt d'implémentation — EP-XX : [Nom de l'epic]

> Copier-coller ce prompt dans une session Claude en mode Dev.

---

## Contexte

[1-3 phrases : ce que la feature fait, pourquoi on la construit, ce qui existe déjà]

## Documents de référence — à lire AVANT de coder

Lis ces documents intégralement avant de commencer :

1. **`product/prd/prd-XX-slug.md`** — le PRD : problème, user stories, critères d'acceptance
2. **`product/prd/design-system-guidelines.md`** — tokens, composants UI, patterns
3. **`product/prd/screens-and-flows.md`** — maquettes d'écrans, parcours utilisateurs
4. [Autres docs spécifiques si nécessaire]

Consulte aussi `src/CLAUDE.md` pour les conventions et le skill `feature-implementation` pour le workflow.

## Plan d'implémentation

Procéder dans cet ordre strict. Chaque phase doit être fonctionnelle avant de passer à la suivante.

### Phase 1 — [Titre]

**Objectif :** [1 phrase]

[Liste numérotée des tâches concrètes]

### Phase 2 — [Titre]

...

### Phase N — [Titre]

...

## Règles à respecter pendant toute l'implémentation

- [Contraintes techniques non négociables]
- [Ce qu'il ne faut PAS toucher]
- [Convention de commit : `feat(EP-XX): phase N — description`]
```

#### Principes de rédaction du prompt

1. **Séquencer en phases indépendantes** — chaque phase produit un état fonctionnel de l'app. Le dev peut commiter et s'arrêter entre deux phases
2. **Commencer par le backend / données, finir par le frontend** — migrations DB → API → composants → pages → polish
3. **Être directif sur l'ordre, pas sur le "comment"** — dire quoi faire, dans quel ordre, mais laisser le dev choisir l'implémentation
4. **Référencer les documents, ne pas les recopier** — le prompt pointe vers les specs, il ne les duplique pas
5. **Lister les fichiers à créer/modifier/supprimer** quand c'est connu — ça réduit l'ambiguïté
6. **Inclure les garde-fous explicites** — ce qu'il ne faut pas toucher (logique métier, API existantes, etc.)
7. **Prévoir la convention de commit** pour tracer l'avancement phase par phase

#### Checklist de validation du prompt

Avant de considérer le prompt terminé, vérifier :

- [ ] Le contexte est suffisant pour un dev qui ne connaît pas l'historique
- [ ] Tous les docs de référence nécessaires sont listés
- [ ] Le plan couvre 100% du scope du PRD (chaque user story a au moins une phase)
- [ ] L'ordre des phases respecte les dépendances (pas de frontend avant les composants UI, pas d'API avant la DB)
- [ ] Les règles rappellent les contraintes critiques (design system, ne pas toucher la logique métier, etc.)
- [ ] Le prompt est auto-suffisant — un dev peut l'exécuter sans poser de questions

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
├─ Phase 9 : Mise à jour des références design (30-60 min)
├─ Phase 10 : Rédaction du prompt d'implémentation (30-45 min)
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
| PRD écrit sans mettre à jour les docs design | Le dev implémente sans spec d'écran, l'UI diverge | Toujours exécuter la Phase 9 — un PRD sans mise à jour des refs design n'est pas terminé |
| PRD sans prompt d'implémentation | Le dev doit interpréter le PRD lui-même, perd du temps, oublie des choses | Toujours exécuter la Phase 10 — le prompt dans `product/prompts/` est le livrable final du PM |
| PRD rédigé avant l'epic | Les user stories sont créées dans le PRD au lieu d'être importées depuis l'epic — l'epic devient un sous-produit du PRD | Toujours créer l'epic d'abord (`product/epics/`), puis le PRD importe et enrichit les stories |
