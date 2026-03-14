---
name: audit-ux
description: Auditer l'UX d'un parcours utilisateur existant pour identifier les frictions, incohérences et améliorations prioritaires. À utiliser pour évaluer un produit en place avant un redesign.
type: component
---

## Objectif

Produire un diagnostic structuré de l'expérience utilisateur d'un parcours existant. L'audit UX identifie les frictions, les ruptures de parcours et les incohérences visuelles, puis les priorise en recommandations actionnables.

Ce n'est pas un audit d'accessibilité complet (WCAG) ni un test utilisateur — c'est une évaluation heuristique experte.

---

## Quand utiliser

- Avant un redesign ou un epic UX
- Quand des utilisateurs signalent des problèmes de compréhension ou d'adoption
- Après une phase de développement "function first" sans pass design
- Pour alimenter un PRD de rattrapage UX

---

## Structure de l'audit

### Étape 1 : Définir le périmètre

Identifier :
- **Le parcours à auditer** (ex. inscription → premier audit → lecture des résultats)
- **Le persona cible** (ex. RevOps Manager, nouvel utilisateur)
- **Les écrans concernés** (liste exhaustive)

### Étape 2 : Évaluer par heuristique

Pour chaque écran du parcours, évaluer selon ces 8 critères (adaptés des heuristiques de Nielsen) :

| # | Heuristique | Question clé |
|---|---|---|
| H1 | **Visibilité de l'état** | L'utilisateur sait-il où il en est et ce qui se passe ? |
| H2 | **Correspondance monde réel** | Le vocabulaire et les concepts sont-ils familiers pour le persona ? |
| H3 | **Contrôle utilisateur** | L'utilisateur peut-il annuler, revenir en arrière, corriger ? |
| H4 | **Cohérence** | Les éléments visuels et interactions sont-ils cohérents d'un écran à l'autre ? |
| H5 | **Prévention d'erreurs** | Les erreurs courantes sont-elles prévenues plutôt que signalées après coup ? |
| H6 | **Reconnaissance plutôt que rappel** | Les options et actions sont-elles visibles sans mémorisation ? |
| H7 | **Flexibilité et efficacité** | Le parcours s'adapte-t-il aux utilisateurs novices ET expérimentés ? |
| H8 | **Design minimaliste** | Chaque élément à l'écran a-t-il une raison d'être ? |

### Étape 3 : Documenter les findings

Pour chaque problème identifié :

```markdown
### [ID] — [Titre court du problème]

**Écran :** [Nom de la page / de l'étape]
**Heuristique violée :** H[X] — [Nom]
**Sévérité :** Critique | Majeur | Mineur | Cosmétique
**Description :** [Ce qui se passe]
**Impact utilisateur :** [Conséquence sur l'expérience]
**Recommandation :** [Correction suggérée]
```

**Échelle de sévérité :**

| Niveau | Définition |
|---|---|
| **Critique** | L'utilisateur est bloqué ou abandonne le parcours |
| **Majeur** | L'utilisateur est ralenti ou frustré significativement |
| **Mineur** | L'utilisateur est gêné mais peut continuer |
| **Cosmétique** | Incohérence visuelle sans impact fonctionnel |

### Étape 4 : Prioriser et synthétiser

Produire un tableau récapitulatif :

```markdown
| ID | Problème | Sévérité | Écran | Effort estimé | Priorité |
|---|---|---|---|---|---|
| UX-01 | ... | Critique | ... | S | P0 |
| UX-02 | ... | Majeur | ... | M | P1 |
```

Et une synthèse en 3 points :
1. **Le problème principal** du parcours (celui qui cause le plus de friction)
2. **Les quick wins** (cosmétiques ou mineurs à faible effort)
3. **La recommandation structurelle** (si le parcours doit être repensé en profondeur)

---

## Output attendu

Un document structuré contenant :
1. Périmètre de l'audit (parcours, persona, écrans)
2. Findings détaillés (avec heuristique, sévérité, recommandation)
3. Tableau récapitulatif priorisé
4. Synthèse et prochaines étapes

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Auditer sans persona | "C'est moche" sans contexte | Toujours évaluer par rapport à un persona et son job-to-be-done |
| Tout noter | 50 findings cosmétiques noient les critiques | Se concentrer sur les critiques et majeurs, grouper les cosmétiques |
| Prescrire des solutions UI | "Mettre un bouton bleu ici" | Recommander des principes, pas des pixels |
| Oublier les états | Audit des écrans "remplis" uniquement | Tester aussi : empty states, loading, erreurs, cas limites |
| Ignorer le parcours | Auditer écran par écran sans flux | Évaluer les transitions entre écrans, pas juste chaque écran isolé |

---

## Skills liés

- `cartographie-parcours-client` — pour mapper le parcours avant de l'auditer
- `user-story` — pour reformuler les findings en stories actionnables
- `proto-persona` — pour contextualiser l'audit par rapport au persona cible
