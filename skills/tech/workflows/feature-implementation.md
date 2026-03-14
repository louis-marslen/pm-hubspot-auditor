---
name: feature-implementation
description: Workflow complet d'implémentation d'une feature — du PRD au code livrable et testé
type: workflow
---

# Feature Implementation

## Objectif

Orchestrer tout le processus de développement d'une feature, de la lecture du PRD jusqu'au code prêt à merger. Ce workflow garantit que chaque feature est spécifiée avant d'être codée, et testée avant d'être livrée.

## Vue d'ensemble

```
PRD + Design Refs → Tech Spec → Backend → Frontend (design system) → Tests → Code Review → Merge
```

---

## Étape 1 — Lire et comprendre le PRD + les références design

**Inputs obligatoires :**
- `product/prd/prd-XX-slug.md` — la spec fonctionnelle de la feature
- `product/prd/design-system-guidelines.md` — les tokens, composants et patterns UI
- `product/prd/screens-and-flows.md` — les maquettes d'écrans et parcours utilisateurs

Vérifier :
- [ ] Les user stories sont comprises (persona, action, bénéfice)
- [ ] Les critères d'acceptance sont clairs et testables
- [ ] Les dépendances sont identifiées (autres epics, services externes)
- [ ] Les cas "out of scope" sont notés
- [ ] Les décisions techniques actées dans `CLAUDE.md` sont prises en compte
- [ ] Les écrans concernés par la feature sont identifiés dans `screens-and-flows.md`
- [ ] Les composants UI nécessaires sont identifiés dans `design-system-guidelines.md` (existants à réutiliser ou nouveaux à créer)

Si une ambiguïté bloque : signaler à l'utilisateur avant de continuer.

---

## Étape 2 — Rédiger la Technical Design Doc

**Skill** : `technical-design-doc`

Produire avant tout code :
- [ ] Flux de données de bout en bout (pseudo-code)
- [ ] Entités de données et schéma DB (si nouvelles tables)
- [ ] Endpoints API à créer ou modifier
- [ ] Dépendances et variables d'environnement requises
- [ ] Plan de gestion des erreurs
- [ ] Questions ouvertes résolues

---

## Étape 3 — Créer les migrations DB (si applicable)

**Skill** : `database-schema`

- [ ] Migration de création/modification des tables
- [ ] Migration testée sur environnement local
- [ ] Rollback migration défini

---

## Étape 4 — Implémenter les endpoints API

**Skill** : `api-endpoint-spec`

Pour chaque endpoint :
- [ ] Route définie avec méthode, params, body
- [ ] Validation des inputs (côté serveur)
- [ ] Logique métier implémentée
- [ ] Gestion de toutes les erreurs documentées dans la spec
- [ ] Pas de secret en dur (variables d'environnement)

---

## Étape 5 — Implémenter le frontend

### Fonctionnel
- [ ] Appels API depuis les composants/hooks
- [ ] États de chargement, erreur et succès gérés
- [ ] Comportement conforme aux critères d'acceptance du PRD
- [ ] Pas de logique métier dans les composants (dans les hooks/services)

### UI/UX (ref: `product/prd/design-system-guidelines.md`)
- [ ] Composants du design system utilisés — **jamais de styles ad hoc** (couleurs en dur, spacing arbitraire, composants one-off qui dupliquent un composant existant)
- [ ] Tokens de design respectés : couleurs (`gray-*`, `brand-*`, sémantiques), spacing (multiples de 4px), typographie (échelle définie), border radius (`radius-sm/md/lg/xl`)
- [ ] Dark mode natif — tous les fonds, textes et bordures utilisent les tokens dark du design system
- [ ] Les 5 états gérés pour chaque écran : empty state, loading (skeleton), erreur, succès, contenu normal
- [ ] Feedback visuel sur les actions utilisateur : bouton loading, toast succès, alert erreur inline
- [ ] Hiérarchie visuelle claire : `h1` pour le titre de page, `h2` pour les sections, `h3` pour les cards — jamais de `text-xl font-bold` ad hoc
- [ ] Parcours utilisateur fluide : l'utilisateur sait toujours quoi faire ensuite (CTA visible, breadcrumb, retour)
- [ ] Écran conforme à la spec dans `screens-and-flows.md` (si l'écran y est documenté)
- [ ] Si un nouveau composant réutilisable est créé → le spécifier avec le skill `ui-component-spec`

---

## Étape 6 — Tester

### Tests automatisés
- [ ] Test unitaire pour la logique métier non triviale
- [ ] Test d'intégration pour les endpoints critiques
- [ ] Test couvrant le scénario du bug (si fix)

### Test manuel (checklist issue du PRD)
Pour chaque user story, vérifier le critère d'acceptance Gherkin :
```
Étant donné [contexte]
Quand [action]
Alors [résultat attendu] ✓
```

---

## Étape 7 — Code Review

**Skill** : `code-review`

Auto-review avant de soumettre :
- [ ] Le code fait ce que le PRD demande (ni plus, ni moins)
- [ ] Pas de console.log oubliés
- [ ] Pas de TODO non résolus
- [ ] Variables d'environnement documentées dans `.env.example`
- [ ] Comportement en cas d'erreur testé
- [ ] **UI/UX** : tous les écrans utilisent les composants et tokens du design system (ouvrir `design-system-guidelines.md` et vérifier visuellement)

---

## Étape 8 — Merge

- [ ] Branch à jour avec main
- [ ] CI verte (si configurée)
- [ ] Commit message descriptif (référence l'epic : "feat(EP-01): add HubSpot OAuth flow")

---

## Convention de commit

```
[type](EP-XX): [description courte]

Types :
- feat    → nouvelle feature
- fix     → correction de bug
- refactor → refactoring sans changement de comportement
- test    → ajout ou modification de tests
- docs    → documentation uniquement
- chore   → tâche de maintenance (deps, config)
```

Exemples :
```
feat(EP-01): implement HubSpot OAuth authorization code flow
fix(EP-02): correct property fill rate calculation for empty portals
feat(EP-04): add public report sharing with unique token
```

---

## Anti-patterns à éviter

| Anti-pattern | Pourquoi | Alternative |
|---|---|---|
| Coder avant de spécifier | On découvre les problèmes trop tard | TDD d'abord, code ensuite |
| Over-engineering | Feature trop complexe pour les besoins actuels | Implémenter le minimum du PRD |
| Tests écrits après coup | On omet les cas d'erreur difficiles | Écrire les tests en même temps que le code |
| Ignorer les cas d'erreur | Les erreurs arrivent toujours en prod | Gérer explicitement chaque erreur documentée |
| Secrets dans le code | Fuite de credentials | Variables d'environnement uniquement |
| Styles ad hoc / couleurs en dur | Incohérence visuelle, dette UI | Toujours utiliser les tokens du design system |
| Ignorer les guidelines design | L'UI diverge du design system | Lire `design-system-guidelines.md` AVANT de coder le frontend |
| Oublier les empty/loading/error states | Expérience cassée sur les cas limites | Vérifier les 5 états systématiquement |

## Skills liés

- `technical-design-doc` — étape 2 de ce workflow
- `database-schema` — étape 3
- `api-endpoint-spec` — étape 4
- `ui-component-spec` — étape 5 (si nouveau composant UI réutilisable)
- `code-review` — étape 7
- `architecture-decision-record` — si une décision structurante émerge pendant le dev
