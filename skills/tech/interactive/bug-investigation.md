---
name: bug-investigation
description: Processus structuré de débogage — des symptômes à la cause racine et au fix
type: interactive
---

# Bug Investigation

## Objectif

Structurer l'investigation d'un bug de façon méthodique pour éviter les tâtonnements et trouver la cause racine plutôt que de traiter les symptômes. Particulièrement utile pour les bugs intermittents, difficiles à reproduire, ou impliquant plusieurs couches (frontend → API → base de données → service externe).

## Processus guidé

### Phase 1 — Caractériser le bug (questions à poser)

```
1. Quel est le comportement observé ?
   (Être précis : "La page affiche une erreur 500" plutôt que "ça marche pas")

2. Quel est le comportement attendu ?

3. Est-ce reproductible ? Toujours, parfois, dans certaines conditions ?

4. Depuis quand ? Y a-t-il eu un déploiement récent ?

5. Qui est affecté ? Tous les users ? Un user spécifique ? Un type de donnée ?

6. Quels sont les messages d'erreur exacts ?
   (Copier le stack trace complet, pas un résumé)
```

### Phase 2 — Isoler le problème

**Stratégie de bisection** : identifier la couche responsable.

```
Frontend ?
  → L'erreur apparaît dans la console browser ?
  → Le composant reçoit-il les bonnes données (props, state) ?

API ?
  → L'endpoint retourne-t-il la bonne réponse ? (tester avec curl / Postman)
  → Les logs serveur montrent-ils une erreur ?
  → La requête arrive-t-elle même au serveur ?

Base de données ?
  → La requête SQL produit-elle le bon résultat en direct ?
  → Y a-t-il une contrainte violée (NOT NULL, UNIQUE, FK) ?
  → La migration a-t-elle bien été appliquée ?

Service externe (HubSpot API, OpenAI, Resend) ?
  → L'API externe retourne-t-elle une erreur ?
  → Le token est-il valide / expiré ?
  → Y a-t-il un rate limit atteint ?
```

### Phase 3 — Formuler des hypothèses

Avant de modifier le code, lister 2-3 hypothèses ordonnées par probabilité :

```
H1 (la plus probable) : [Ce que je pense être la cause, pourquoi]
H2 : [Alternative si H1 infirmée]
H3 : [Cas edge moins probable]
```

### Phase 4 — Tester les hypothèses

Pour chaque hypothèse, définir **un test précis et falsifiable** :

```
Pour tester H1 :
  Action : [Quoi faire pour confirmer ou infirmer]
  Résultat attendu si H1 vraie : [...]
  Résultat attendu si H1 fausse : [...]
```

Ne modifier le code qu'après avoir confirmé l'hypothèse, pas avant.

### Phase 5 — Implémenter le fix

- Fix minimal : corriger uniquement ce qui est cassé
- Ajouter un test qui aurait détecté ce bug
- Vérifier que le fix ne casse pas d'autres comportements

### Phase 6 — Post-mortem (si bug critique)

```
Cause racine : [Pas le symptôme, la vraie cause]
Pourquoi non détecté avant ? [Test manquant, monitoring absent, cas edge…]
Actions préventives : [ ] ... [ ] ...
```

## Exemple d'application

**Bug** : "Les tokens HubSpot ne se rafraîchissent pas et les users se retrouvent déconnectés après 30 min."

**Phase 1 — Caractérisation** :
- Comportement observé : Erreur 401 sur les appels API HubSpot après ~30 min
- Comportement attendu : Token rafraîchi automatiquement avant expiration
- Reproductible : Oui, toujours après 30 min d'inactivité
- Depuis : v1.2.0 (déployée il y a 2 jours)

**Phase 2 — Isolation** :
→ Erreur côté API (logs : "HubSpot API returned 401 — token expired")
→ La DB montre `token_expires_at` dans le passé
→ La fonction de refresh n'est pas appelée

**Hypothèses** :
- H1 : Le middleware de refresh n'est pas appelé avant les requêtes HubSpot
- H2 : La logique de vérification d'expiration a un bug de comparaison de dates (timezone ?)
- H3 : Le refresh token lui-même est expiré (durée de vie plus courte que prévue)

**Test H1** :
→ Ajouter un log au début du middleware de refresh
→ Si aucun log : le middleware n'est pas monté sur la bonne route
→ Si log présent : passer à H2

**Fix confirmé** : Le middleware était appliqué uniquement sur `/api/hubspot/*` mais pas sur `/api/audits/*` qui fait aussi des appels HubSpot.

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Fixer avant de comprendre | "J'ai essayé X, puis Y, puis Z…" | Formuler une hypothèse avant chaque tentative |
| Traiter le symptôme | Cacher l'erreur plutôt que la corriger | Toujours chercher la cause racine |
| Pas de test de non-régression | Le bug réapparaît 2 semaines plus tard | Écrire le test qui aurait détecté le bug |
| Stack trace incomplet | "Y a une erreur quelque part" | Copier le message d'erreur complet avant d'investiguer |

## Skills liés

- `architecture-decision-record` — si le bug révèle un problème architectural
- `feature-implementation` (workflow) — pour le fix et le test associé
