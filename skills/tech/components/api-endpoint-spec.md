---
name: api-endpoint-spec
description: Spécifier un endpoint REST de manière complète et non ambiguë (méthode, route, params, réponses, erreurs)
type: component
---

# API Endpoint Spec

## Objectif

Documenter un endpoint API de façon exhaustive avant ou pendant son implémentation. Une bonne spec évite les allers-retours entre frontend et backend, sert de contrat entre équipes, et facilite les tests.

## Format

```markdown
## [MÉTHODE] /api/[route]

**Description** : [Ce que fait cet endpoint en une phrase.]
**Authentification** : Oui — JWT Bearer | Non
**Rôle requis** : Aucun | [rôle spécifique]

### Paramètres

#### Path params
| Param | Type | Requis | Description |
|---|---|---|---|
| :id | string (uuid) | Oui | Identifiant de la ressource |

#### Query params
| Param | Type | Requis | Default | Description |
|---|---|---|---|---|
| page | number | Non | 1 | Numéro de page |

#### Body (JSON)
| Champ | Type | Requis | Description |
|---|---|---|---|
| email | string | Oui | Email de l'utilisateur |
| password | string | Oui | Mot de passe (min 8 chars) |

### Réponses

#### 200 OK
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "createdAt": "2026-01-15T10:00:00Z"
}
```

#### Erreurs
| Code | Condition | Body |
|---|---|---|
| 400 | Champ manquant ou invalide | `{ "error": "email_required" }` |
| 401 | Token manquant ou expiré | `{ "error": "unauthorized" }` |
| 404 | Ressource introuvable | `{ "error": "not_found" }` |
| 409 | Conflit (ex: email déjà pris) | `{ "error": "email_already_exists" }` |
| 500 | Erreur serveur | `{ "error": "internal_error" }` |

### Notes d'implémentation
- [Logique métier non évidente]
- [Appel à service externe : lequel, pour quoi]
- [Rate limiting applicable ?]
```

## Pourquoi cette structure fonctionne

| Élément | Valeur |
|---|---|
| Authentification explicite | Évite les endpoints ouverts par oubli |
| Body typé | Sert de validation schema de référence |
| Toutes les erreurs listées | Le frontend peut gérer tous les cas |
| Notes d'implémentation | Capture la logique non évidente avant qu'elle ne soit oubliée |

## Application

**Étape 1 — Identifier la ressource et l'action**
REST = ressource + verbe. `/api/audits` + POST = créer un audit. Nommer la route en conséquence.

**Étape 2 — Définir l'authentification**
Par défaut : tous les endpoints de l'app sont authentifiés sauf ceux explicitement publics (ex: `/api/reports/public/:token`).

**Étape 3 — Spécifier les inputs**
Distinguer path params (identifiants), query params (filtres, pagination) et body (données de création/modification).

**Étape 4 — Définir le cas heureux**
Quel est le body de réponse 200 ? Inclure un exemple JSON réel.

**Étape 5 — Lister toutes les erreurs**
Pour chaque champ requis : 400. Pour chaque ressource externe : 404. Pour chaque conflit métier : 409. Toujours inclure 401 et 500.

## Exemple complet

```markdown
## POST /api/auth/register

**Description** : Créer un nouveau compte utilisateur
**Authentification** : Non
**Rôle requis** : Aucun

### Body (JSON)
| Champ | Type | Requis | Description |
|---|---|---|---|
| email | string | Oui | Email de l'utilisateur |
| password | string | Oui | Mot de passe (min 8 caractères) |

### Réponses

#### 201 Created
```json
{
  "id": "a1b2c3d4-...",
  "email": "user@example.com",
  "createdAt": "2026-01-15T10:00:00Z"
}
```

#### Erreurs
| Code | Condition | Body |
|---|---|---|
| 400 | Email manquant | `{ "error": "email_required" }` |
| 400 | Password < 8 chars | `{ "error": "password_too_short" }` |
| 409 | Email déjà utilisé | `{ "error": "email_already_exists" }` |
| 500 | Erreur serveur | `{ "error": "internal_error" }` |

### Notes d'implémentation
- Hasher le password avec bcrypt (salt rounds: 10) avant stockage
- Envoyer un email de confirmation via Resend après création
- Ne pas exposer si l'email existe déjà dans le message d'erreur public (sécurité)
```

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Réponse d'erreur inconsistante | `{ message: "..." }` parfois, `{ error: "..." }` d'autres fois | Adopter un format d'erreur uniforme dès le début |
| Pas de 401 | Endpoint authentifié sans erreur documentée | Toujours documenter le cas token manquant/expiré |
| Body trop générique | `{ data: {...} }` sans structure documentée | Donner un exemple JSON avec des valeurs réelles |
| Route non RESTful | `/api/getUserById` | Utiliser les ressources : `/api/users/:id` |

## Skills liés

- `technical-design-doc` — le TDD agrège plusieurs endpoint specs
- `database-schema` — les réponses reflètent le schéma de données
