---
name: decoupeur-epics
description: Découper des epics en user stories avec les 9 patterns Humanizing Work. À utiliser quand un backlog item est trop grand pour être estimé, séquencé ou livré en toute sécurité.
type: interactive
source: adapté de deanpeters/Product-Manager-Skills — epic-breakdown-advisor
---

## Objectif

Guider le PM à travers le découpage des epics en user stories en utilisant la méthodologie complète Humanizing Work de Richard Lawrence — une approche systématique qui applique 9 patterns de découpage séquentiellement. L'objectif est d'identifier quel pattern s'applique, de découper en préservant la valeur utilisateur, et d'évaluer les découpages selon ce qu'ils révèlent sur le travail à faible valeur qu'on peut éliminer.

---

## Principes fondamentaux

### Les tranches verticales préservent la valeur

Une user story est "une description d'un changement de comportement du système du point de vue d'un utilisateur." Le découpage doit maintenir des **tranches verticales** — du travail qui touche plusieurs couches architecturales et délivre de la valeur observable à l'utilisateur — pas des tranches horizontales (ex. "story front-end" + "story back-end").

### Les 3 étapes

1. **Validation pré-découpage** : Vérifier que la story satisfait les critères INVEST (sauf "Small")
2. **Appliquer les patterns de découpage** : Parcourir 9 patterns séquentiellement
3. **Évaluer le découpage** : Choisir le découpage qui révèle du travail à faible valeur ou produit des stories de taille égale

---

## Étape 0 : Fournir le contexte de l'epic

Partager :
- Titre/ID de l'epic
- Description ou hypothèse
- Critères d'acceptance (surtout les paires "Quand/Alors" multiples)
- Persona cible
- Estimation approximative

---

## Étape 1 : Validation pré-découpage (INVEST)

Vérifier chaque critère avant de découper :

| Critère | Question | OK si... |
|---|---|---|
| **Indépendante** | Peut-elle être priorisée sans dépendances bloquantes ? | Pas de blockers durs |
| **Négociable** | Laisse-t-elle de la place pour découvrir les détails d'implémentation ? | C'est un point de départ de conversation |
| **Valeur** | Délivre-t-elle de la valeur observable à un utilisateur ? | Les utilisateurs voient/vivent quelque chose de différent |
| **Estimable** | L'équipe peut-elle la dimensionner ? | Estimation possible, même approximative |
| **Testable** | A-t-elle des critères d'acceptance concrets que la QA peut vérifier ? | Conditions pass/fail claires |

⚠️ **Si la story échoue sur "Valeur"** : ARRÊTER. Ne pas découper. Combiner avec d'autres travaux pour créer un incrément de valeur réel.

---

## Étape 2 : Les 9 patterns de découpage

### Pattern 1 : Étapes du workflow

**S'applique si :** L'epic implique un workflow multi-étapes où on peut livrer un cas simple en premier.

**Principe clé :** Tranches bout-en-bout, pas étape par étape.

**Exemple (contexte HubSpot Auditor) :**
- **Original :** "Générer un rapport d'audit complet (propriétés, workflows, deals, utilisateurs)"
- **✅ Bon découpage :**
  - Story 1 : Générer un rapport d'audit simplifié (propriétés inutilisées uniquement)
  - Story 2 : Étendre à l'audit des workflows
  - Story 3 : Étendre à l'audit des deals et pipelines
  - Story 4 : Étendre à l'audit des utilisateurs

---

### Pattern 2 : Opérations (CRUD)

**S'applique si :** L'epic utilise "gérer", "administrer" ou "maintenir" → plusieurs opérations bundlées.

**Exemple :**
- **Original :** "Gérer les règles d'audit"
- **Découpage :** Créer / Consulter / Modifier / Supprimer une règle d'audit

---

### Pattern 3 : Variations de règles métier

**S'applique si :** Même fonctionnalité avec des règles différentes selon le scénario.

**Exemple :**
- **Original :** "Calculer un score de santé pour les propriétés HubSpot (custom, système, héritage)"
- **Découpage :**
  - Story 1 : Calculer le score pour les propriétés custom
  - Story 2 : Calculer le score pour les propriétés système
  - Story 3 : Calculer le score pour les propriétés héritées

---

### Pattern 4 : Variations de données

**S'applique si :** L'epic gère différents types, formats ou structures de données.

**Exemple :**
- **Original :** "Exporter le rapport d'audit (CSV, PDF, via API)"
- **Découpage :**
  - Story 1 : Exporter en CSV
  - Story 2 : Exporter en PDF
  - Story 3 : Exposer via API

---

### Pattern 5 : Méthodes de saisie

**S'applique si :** Des éléments UI complexes ne sont pas essentiels à la fonctionnalité principale.

**Exemple :**
- **Original :** "Filtrer les résultats d'audit avec une interface de filtres avancés (multi-select, date range picker, etc.)"
- **Découpage :**
  - Story 1 : Filtrer par type d'objet (saisie simple)
  - Story 2 : Ajouter les filtres avancés (multi-select, date picker)

---

### Pattern 6 : Effort majeur

**S'applique si :** La première implémentation est complexe mais les ajouts suivants sont simples.

**Exemple :**
- **Original :** "Connecter HubSpot Auditor à plusieurs workspaces HubSpot"
- **Découpage :**
  - Story 1 : Connecter et auditer 1 workspace HubSpot (construire toute l'infrastructure d'authentification)
  - Story 2 : Permettre la connexion à plusieurs workspaces

---

### Pattern 7 : Simple/Complexe

**S'applique si :** On peut identifier la version la plus simple qui délivre encore de la valeur.

**Exemple :**
- **Original :** "Tableau de bord d'audit (avec score global, détail par catégorie, évolution historique, benchmarks sectoriels)"
- **Découpage :**
  - Story 1 : Tableau de bord basique (score global + liste des problèmes par criticité)
  - Story 2 : Ajouter le détail par catégorie
  - Story 3 : Ajouter l'évolution historique
  - Story 4 : Ajouter les benchmarks sectoriels

---

### Pattern 8 : Différer la performance

**S'applique si :** On peut livrer la valeur fonctionnelle d'abord, optimiser ensuite.

**Exemple :**
- **Original :** "Analyser un workspace HubSpot avec 100 000 contacts en moins de 10 secondes"
- **Découpage :**
  - Story 1 : L'analyse fonctionne (fonctionnelle, pas de garantie de performance)
  - Story 2 : Optimiser pour analyser en moins de 10 secondes

---

### Pattern 9 : Spike de découverte (dernier recours)

**S'applique si :** Aucun des patterns 1 à 8 ne s'applique — fort niveau d'incertitude.

**Questions types pour un spike :**
- Faisabilité technique : "Peut-on accéder à ces données via l'API HubSpot ?"
- Choix d'approche : "Quelle méthode d'analyse des doublons performe le mieux ?"
- Dépendance externe : "Que retourne réellement l'API HubSpot pour les propriétés inutilisées ?"

**Format :** Time-boxer à 1 à 2 jours. Après le spike, reprendre au Pattern 1.

---

## Étape 3 : Évaluer la qualité du découpage

Après le découpage, vérifier :

**1. Ce découpage révèle-t-il du travail à faible valeur ?**
- Bons découpages exposent le principe 80/20 : la majorité de la valeur se concentre dans une fraction des fonctionnalités
- Ex. : Après avoir découpé "Export du rapport", on réalise que "Export PDF" est rarement utilisé → déprioritiser

**2. Ce découpage produit-il des stories de taille plus égale ?**
- Des stories de taille égale donnent plus de flexibilité de priorisation au PM
- Ex. : Au lieu d'un epic de 10 jours, cinq stories de 2 jours permettent la réorganisation

Si le découpage ne satisfait aucun critère, essayer un autre pattern.

---

## Output : Plan de découpage d'epic

```markdown
# Plan de découpage

**Epic :** [Epic original]
**Validation INVEST :** ✅ Satisfait INVEST (sauf Small)
**Pattern appliqué :** [Nom du pattern]
**Justification :** [Pourquoi ce pattern s'applique]

---

## Découpage en stories

### Story 1 : [Titre] (Tranche la plus simple et complète)

**En tant que** [persona]
**je veux** [action]
**afin de** [résultat]

**Critères d'acceptance :**
- **Étant donné :** [Préconditions]
- **Quand :** [Action]
- **Alors :** [Résultat]

**Pourquoi en premier :** [Délivre la valeur core]
**Effort estimé :** [jours/points]

---

### Story 2 : [Titre]
[...]

---

## Évaluation du découpage

✅ **Révèle du travail à faible valeur ?**
[Analyse : quelles stories pourrait-on déprioritiser ?]

✅ **Stories de taille comparable ?**
[Analyse : les efforts sont-ils équilibrés ?]

---

## Validation INVEST (chaque story)

✅ Indépendante / ✅ Négociable / ✅ Valeur / ✅ Estimable / ✅ Small / ✅ Testable
```

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Sauter la validation INVEST | Découper sans vérifier si la story a de la valeur | Toujours faire l'Étape 1 avant l'Étape 2 |
| Découpage workflow étape par étape | Story 1 = étape 1, Story 2 = étape 2 | Chaque story doit couvrir le workflow complet (tranche bout-en-bout) |
| Découpage horizontal | "Story 1 : API. Story 2 : UI." | Découpage vertical — chaque story inclut ce qu'il faut pour délivrer de la valeur observable |
| Ne pas re-découper les grandes stories | Epics découpés en 3 stories qui font encore 5+ jours | Reprendre au Pattern 1 pour chaque story encore trop grande |
| Ignorer l'évaluation | Découper sans chercher ce qu'on peut éliminer | Après le découpage, demander : "Quelles stories révèlent du travail inutile ?" |
