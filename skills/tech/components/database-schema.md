---
name: database-schema
description: Modéliser les entités et leurs relations avant de créer les migrations de base de données
type: component
---

# Database Schema

## Objectif

Concevoir le modèle de données d'une feature avant d'écrire les migrations. Un schéma bien pensé en amont évite les migrations correctives coûteuses et les incohérences de données en production.

## Format

```markdown
## Entité : [nom_de_la_table]

**Description** : [Ce que représente cette table.]
**Relations** : [Liens vers d'autres tables.]

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | Identifiant unique |
| created_at | timestamptz | NOT NULL, default now() | Date de création |
| updated_at | timestamptz | NOT NULL, default now() | Date de mise à jour |
| [colonne] | [type] | [contraintes] | [description] |

**Index** :
- `idx_[table]_[colonne]` sur `[colonne]` — [raison]

**Migrations** :
- `[date]_create_[table].sql`
```

## Pourquoi cette structure fonctionne

| Élément | Valeur |
|---|---|
| Types explicites | Évite les ambiguïtés (varchar vs text, timestamp vs timestamptz) |
| Contraintes documentées | Force à décider des règles d'intégrité avant le code |
| Index anticipés | Performance réfléchie dès la conception, pas en urgence |
| Description par colonne | La sémantique est capturée pendant qu'elle est fraîche |

## Application

**Étape 1 — Identifier les entités**
À partir du PRD et du TDD, lister les "noms" du domaine (utilisateur, workspace, audit, rapport…).

**Étape 2 — Définir les relations**
- 1:1 → colonne de FK dans l'une des tables
- 1:N → FK dans la table "enfant"
- N:M → table de jonction

**Étape 3 — Typer chaque colonne**
Choisir le type le plus précis : `uuid` plutôt que `varchar`, `timestamptz` plutôt que `timestamp`, `boolean` plutôt que `integer`.

**Étape 4 — Définir les contraintes**
- `NOT NULL` par défaut, `NULL` explicite si optionnel
- `UNIQUE` si la valeur doit être unique
- `CHECK` si des valeurs sont contraintes (ex: statut ∈ {active, inactive})

**Étape 5 — Anticiper les index**
Quelles colonnes seront utilisées dans des `WHERE`, `ORDER BY`, ou `JOIN` fréquents ?

## Exemple complet — Schéma HubSpot Auditor (v1)

```markdown
## Entité : users

**Description** : Comptes utilisateurs de la plateforme.
**Relations** : 1 user → N hubspot_connections, 1 user → N audits

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | Identifiant unique |
| email | varchar(255) | NOT NULL, UNIQUE | Email de connexion |
| password_hash | varchar(255) | NOT NULL | Mot de passe hashé (bcrypt) |
| created_at | timestamptz | NOT NULL, default now() | Date d'inscription |
| updated_at | timestamptz | NOT NULL, default now() | Dernière modification |

---

## Entité : hubspot_connections

**Description** : Connexions OAuth HubSpot d'un utilisateur (multi-workspace).
**Relations** : N connections → 1 user, 1 connection → N audits

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | Identifiant unique |
| user_id | uuid | NOT NULL, FK → users(id) ON DELETE CASCADE | Propriétaire |
| portal_id | varchar(50) | NOT NULL | ID du portail HubSpot |
| portal_name | varchar(255) | NULL | Nom du portail (récupéré via API) |
| access_token | text | NOT NULL | Token OAuth (chiffré) |
| refresh_token | text | NOT NULL | Refresh token OAuth (chiffré) |
| token_expires_at | timestamptz | NOT NULL | Expiration du access token |
| scopes | text[] | NOT NULL, default '{}' | Scopes OAuth accordés |
| created_at | timestamptz | NOT NULL, default now() | Date de connexion |
| updated_at | timestamptz | NOT NULL, default now() | Dernière mise à jour token |

**Index** :
- `idx_hubspot_connections_user_id` sur `user_id` — requêtes "toutes les connexions d'un user"
- `UNIQUE(user_id, portal_id)` — un user ne peut connecter le même portail qu'une fois

---

## Entité : audits

**Description** : Résultats d'un audit d'un portail HubSpot.
**Relations** : N audits → 1 hubspot_connection

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | Identifiant unique |
| connection_id | uuid | NOT NULL, FK → hubspot_connections(id) | Portail audité |
| status | varchar(20) | NOT NULL, CHECK IN ('pending','running','completed','failed') | État de l'audit |
| results | jsonb | NULL | Résultats bruts de l'audit |
| summary | text | NULL | Résumé exécutif généré par LLM |
| public_token | varchar(64) | NULL, UNIQUE | Token pour lien de partage public |
| created_at | timestamptz | NOT NULL, default now() | Date de lancement |
| completed_at | timestamptz | NULL | Date de fin |

**Index** :
- `idx_audits_connection_id` sur `connection_id` — historique des audits d'un portail
- `idx_audits_public_token` sur `public_token` — accès aux rapports partagés
```

## Types courants (PostgreSQL)

| Besoin | Type recommandé |
|---|---|
| Identifiant | `uuid` avec `gen_random_uuid()` |
| Texte court | `varchar(255)` |
| Texte long | `text` |
| Date + heure | `timestamptz` (avec timezone) |
| Booléen | `boolean` |
| Entier | `integer` ou `bigint` |
| Décimal | `numeric(precision, scale)` |
| JSON structuré | `jsonb` (indexable) |
| Tableau | `text[]`, `uuid[]`… |
| Enum | `varchar(X)` + CHECK ou type ENUM PostgreSQL |

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Pas de `updated_at` | Impossible de savoir quand une ligne a changé | Ajouter sur toutes les tables avec trigger auto-update |
| Stocker tokens en clair | Tokens OAuth lisibles en DB | Chiffrer avec AES ou utiliser vault |
| FK sans ON DELETE | Orphelins en base après suppression | Définir ON DELETE CASCADE ou RESTRICT selon la logique métier |
| jsonb pour tout | Requêtes lentes, pas d'index | jsonb uniquement pour données vraiment flexibles |

## Skills liés

- `technical-design-doc` — le schéma est une section du TDD
- `api-endpoint-spec` — les réponses API reflètent le schéma
