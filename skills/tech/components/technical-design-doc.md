---
name: technical-design-doc
description: Rédiger une spécification technique détaillée d'une feature avant de commencer à coder
type: component
---

# Technical Design Document (TDD)

## Objectif

Formaliser le "comment" d'une feature avant d'écrire une ligne de code. Le TDD traduit le PRD (le "quoi" et le "pourquoi") en choix d'implémentation concrets, identifiant les risques et les dépendances avant qu'ils ne deviennent des problèmes.

## Format

```markdown
# Tech Spec — [Nom de la feature]

**Epic** : EP-XX
**PRD de référence** : product/prd/prd-XX-slug.md
**Date** : YYYY-MM-DD
**Statut** : Brouillon | En revue | Approuvé

## Résumé

[1-2 phrases décrivant ce qui sera construit et pourquoi.]

## Périmètre d'implémentation

**In scope** :
- ...

**Out of scope** :
- ...

## Architecture & flux

[Décrire le flux de données ou le parcours utilisateur côté technique.
Utiliser du pseudo-code, des diagrammes textuels (ASCII), ou des listes ordonnées.]

```
Exemple de flux :
1. Utilisateur clique "Connecter HubSpot"
2. Frontend → GET /api/auth/hubspot → redirect OAuth URL
3. HubSpot → callback /api/auth/callback?code=XXX
4. Backend échange code contre access_token + refresh_token
5. Tokens stockés en base (table: hubspot_connections)
6. Utilisateur redirigé vers /dashboard
```

## Modèle de données

[Tables ou collections impactées. Décrire les champs nouveaux ou modifiés.]

| Champ | Type | Contrainte | Description |
|---|---|---|---|
| id | uuid | PK | ... |
| ... | ... | ... | ... |

## API endpoints

[Lister les endpoints créés ou modifiés. Pointer vers les specs détaillées si besoin.]

| Méthode | Route | Description |
|---|---|---|
| POST | /api/... | ... |

## Dépendances techniques

- Services externes : ...
- Librairies : ...
- Variables d'environnement requises : ...

## Gestion des erreurs

| Cas d'erreur | Comportement attendu |
|---|---|
| Token expiré | Refresh automatique, sinon redirect login |
| API HubSpot timeout | Retry × 3, puis erreur affichée à l'utilisateur |

## Sécurité

- [ ] Aucun secret en dur dans le code
- [ ] Inputs validés côté serveur
- [ ] Appels API authentifiés
- [ ] [Autres points spécifiques à la feature]

## Plan de test

- [ ] Tests unitaires : [ce qui sera testé]
- [ ] Tests d'intégration : [scénarios clés]
- [ ] Test manuel : [checklist de validation]

## Questions ouvertes

- [ ] [Question technique non résolue]
```

## Pourquoi cette structure fonctionne

| Élément | Valeur |
|---|---|
| Périmètre explicite | Évite le scope creep pendant le dev |
| Flux avant code | Détecte les problèmes de design sans avoir à refactorer |
| Gestion des erreurs planifiée | Force à penser aux cas limites en amont |
| Questions ouvertes | Matérialise les blockers avant de commencer |

## Application

**Étape 1 — Lire le PRD**
Comprendre les user stories, les critères d'acceptance et les contraintes. Ne pas commencer le TDD sans avoir lu le PRD en entier.

**Étape 2 — Dessiner le flux en pseudo-code**
Avant tout détail, tracer le chemin heureux de bout en bout.

**Étape 3 — Identifier les entités de données**
Quelles tables sont créées ou modifiées ? Quels champs ? Quelles contraintes ?

**Étape 4 — Spécifier les endpoints**
Pour chaque route API, pointer vers `api-endpoint-spec` si la spec est complexe.

**Étape 5 — Lister les risques**
Qu'est-ce qui peut casser ? Qu'est-ce qui dépend d'un service externe ?

**Étape 6 — Identifier les questions ouvertes**
Ce qui n'est pas encore décidé et qui bloque l'implémentation.

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| TDD après le code | "Je documente ce que j'ai fait" | Le TDD est un outil de conception, pas de documentation |
| Trop de détail trop tôt | Spécifier chaque ligne de code | Rester au niveau architecture et flux, pas implémentation |
| Ignorer les erreurs | Section vide | Lister au moins les 3 cas d'erreur les plus probables |
| Pas de lien vers le PRD | TDD orphelin | Toujours référencer l'epic et le PRD |

## Skills liés

- `api-endpoint-spec` — pour détailler chaque endpoint identifié
- `database-schema` — pour modéliser les entités de données
- `architecture-decision-record` — si une décision structurante est nécessaire
- `feature-implementation` (workflow) — ce skill est une étape de ce workflow
