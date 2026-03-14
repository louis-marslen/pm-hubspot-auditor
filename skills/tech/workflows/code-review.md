---
name: code-review
description: Checklist et processus de review de code avant merge — qualité, sécurité, cohérence avec le PRD
type: workflow
---

# Code Review

## Objectif

Valider qu'un changement de code est correct, sûr, lisible et conforme aux specs avant de le merger. La review est un filet de sécurité, pas un contrôle de style.

## Checklist de review

### 1. Conformité avec le PRD

- [ ] Chaque user story du PRD est implémentée (ni plus, ni moins)
- [ ] Les critères d'acceptance Gherkin sont satisfaits
- [ ] Rien "out of scope" n'a été ajouté (scope creep)
- [ ] Les cas "out of scope" ne sont pas implémentés de façon partielle

### 2. Correction fonctionnelle

- [ ] Le chemin heureux fonctionne
- [ ] Les cas d'erreur listés dans la spec sont gérés
- [ ] Les cas limites sont traités (liste vide, null, 0, très grande valeur)
- [ ] Pas de régression sur les features existantes

### 3. Sécurité

- [ ] Aucun secret en dur (API key, token, password)
- [ ] Inputs utilisateurs validés côté serveur
- [ ] Endpoints authentifiés protégés par middleware
- [ ] Pas d'injection possible (SQL, XSS, command injection)
- [ ] Données sensibles non loguées (tokens, passwords)

### 4. Qualité du code

- [ ] Le code est lisible sans commentaires excessifs
- [ ] Les noms de variables/fonctions sont explicites
- [ ] Pas de duplication évidente (DRY, mais sans sur-abstraction)
- [ ] Pas de `console.log` oubliés
- [ ] Pas de `TODO` non documentés
- [ ] Complexité cyclomatique raisonnable (pas de if/else imbriqués à 5 niveaux)

### 5. Gestion des erreurs

- [ ] Les erreurs sont catchées aux bons endroits
- [ ] Les messages d'erreur sont informatifs (pas "Something went wrong")
- [ ] Les erreurs serveur ne leakent pas de détails d'implémentation au client
- [ ] Le comportement en cas de panne d'un service externe est défini

### 6. Tests

- [ ] Les tests couvrent le chemin heureux
- [ ] Les tests couvrent les cas d'erreur principaux
- [ ] Les tests ne sont pas couplés à l'implémentation (testent le comportement)
- [ ] Pas de test qui passe toujours (assertion vide ou mock trivial)

### 7. Infrastructure et config

- [ ] Nouvelles variables d'environnement documentées dans `.env.example`
- [ ] Pas de modification de schema DB sans migration
- [ ] Les migrations sont réversibles (rollback possible)

### 8. UI/UX et cohérence visuelle (ref: `product/prd/design-system-guidelines.md`)

- [ ] **Zéro style ad hoc** : pas de couleurs hex en dur, pas de `text-xl font-bold` quand un token `h2` existe, pas de `p-3` quand le spacing scale dit `space-4`
- [ ] Tokens de design respectés : palette `gray-*`/`brand-*`, spacing multiples de 4px, typo selon l'échelle, radius `sm/md/lg/xl`
- [ ] Dark mode natif : aucun fond blanc, aucun texte noir, aucun `bg-gray-50` (c'est le light mode ancien)
- [ ] Composants du design system réutilisés (Button, Input, Card, Badge, Alert, etc.) — pas de composants one-off
- [ ] Les 5 états gérés : empty state (avec CTA), loading (skeleton, pas spinner plein page), erreur (inline), succès (toast ou alert), contenu normal
- [ ] Hiérarchie visuelle cohérente avec `screens-and-flows.md`
- [ ] Textes orientés utilisateur (pas de jargon technique dans l'UI)
- [ ] Actions principales visuellement distinguées des secondaires (1 seul bouton `primary` par écran)

### 9. Commits et historique

- [ ] Messages de commit descriptifs (convention `type(EP-XX): description`)
- [ ] Pas de commits "fix", "wip", "test" non squashés
- [ ] Branch à jour avec main

---

## Format de feedback constructif

Lors d'une review, distinguer le niveau du commentaire :

```
🔴 BLOQUANT  — Doit être corrigé avant merge (bug, faille sécurité, non-conformité PRD)
🟡 SUGGESTION — Amélioration recommandée mais non bloquante
💬 QUESTION  — Demande de clarification ou d'explication
ℹ️  NOTE      — Information partagée, pas d'action requise
```

Exemple :
```
🔴 BLOQUANT : Le endpoint POST /api/audits n'est pas protégé par le middleware d'auth.
N'importe qui peut lancer un audit sans être connecté.

🟡 SUGGESTION : La fonction `calculateFillRate` pourrait être extraite dans un helper
pour être testée indépendamment.

💬 QUESTION : Pourquoi on stocke les résultats en jsonb plutôt qu'en tables normalisées ?
Est-ce une décision documentée dans un ADR ?
```

---

## Auto-review (avant de soumettre)

Avant de demander une review, se poser ces 5 questions :

1. **Est-ce que j'ai testé tous les cas d'erreur listés dans le PRD ?**
2. **Y a-t-il un secret, un TODO ou un console.log que j'aurais oublié ?**
3. **Est-ce que quelqu'un qui n'a pas écrit ce code peut le comprendre en 5 min ?**
4. **Ai-je fait plus que ce que le PRD demande ?** (si oui, retirer le surplus)
5. **Est-ce que la migration DB est sûre en production ?** (idempotente, avec rollback)

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Review de style uniquement | Commentaires sur l'indentation, pas sur la logique | Prioriser la correction et la sécurité |
| Approuver sans comprendre | "LGTM" sur un PR de 500 lignes | Se limiter à des PRs de scope raisonnable |
| Bloquer sur des opinions | "Je ferais ça différemment" | Distinguer préférence personnelle et problème réel |
| Ignorer la conformité PRD | Review technique sans relire les specs | Toujours croiser avec le PRD et les critères d'acceptance |

## Skills liés

- `feature-implementation` — la review est l'étape 7 de ce workflow
- `bug-investigation` — si la review révèle un bug difficile à tracer
- `ui-component-spec` — si la review révèle un composant UI à spécifier ou refactoriser
