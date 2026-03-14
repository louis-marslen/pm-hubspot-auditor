# Process complet : de l'idée au code

Guide pas-à-pas pour concevoir et développer une feature HubSpot Auditor avec Claude. Chaque étape décrit ce que tu fournis, ce que Claude produit, et dans quel mode.

---

## Vue d'ensemble

```
IDÉE → Cadrage PM → PRD → Design → Prompt → Implémentation → Review
         mode PM     mode PM   mode PM   mode PM    mode Dev       mode Dev
```

**Durée indicative :** 3-4 jours de cadrage PM, puis implémentation variable selon la taille.

---

## Étape 1 — Tu as une idée

**Mode :** aucun (conversation libre)

**Ce que tu fournis :**
- Une description de ce que tu veux, même vague ("j'aimerais que l'app détecte les doublons de contacts")
- Le problème que tu observes chez tes utilisateurs ou dans ton usage
- Des exemples concrets si tu en as

**Ce qui se passe :**
- Discussion libre pour clarifier le besoin
- Décision : est-ce un nouvel epic, une extension d'un epic existant, ou juste un fix ?

**Output :** décision de lancer (ou pas) le cadrage PM.

---

## Étape 2 — Cadrage du problème

**Mode :** `mode product`

**Ce que tu fournis :**
- Le contexte utilisateur : qui a ce problème, dans quelle situation
- Des verbatims, des exemples, des données si tu en as
- Les contraintes connues (techniques, business, temps)

**Ce que Claude fait :**
- Utilise les skills PM selon le besoin :
  - `enonce-probleme` → cadrer le problème
  - `proto-persona` → clarifier pour qui on construit
  - `jobs-to-be-done` → comprendre les besoins non satisfaits
  - `cartographie-parcours-client` → mapper le parcours existant
  - `audit-ux` → diagnostiquer l'UX d'un parcours existant (si la feature modifie un flux en place)

**Output :** compréhension partagée du problème et du persona cible.

---

## Étape 3 — Rédaction du PRD

**Mode :** `mode product`

**Ce que tu fournis :**
- Validation du problème cadré à l'étape 2
- Tes préférences ou contraintes sur la solution
- Réponses aux questions ouvertes que Claude pose

**Ce que Claude fait :**
- Exécute le skill `developpement-prd` (10 phases) :
  1. Résumé exécutif
  2. Problem statement
  3. Personas & JTBD
  4. Contexte stratégique
  5. Solution overview + **considérations UX** (parcours, états, composants)
  6. Métriques de succès
  7. User stories (format Mike Cohn + Gherkin)
  8. Out of scope & dépendances
  9. **Mise à jour des références design** (`screens-and-flows.md` + `design-system-guidelines.md`)
  10. **Rédaction du prompt d'implémentation** (`product/prompts/prompt-ep-XX-slug.md`)

**Output :** 3 livrables dans `product/` :

| Livrable | Fichier |
|---|---|
| PRD complet | `product/prd/prd-XX-slug.md` |
| Écrans & flows mis à jour | `product/prd/screens-and-flows.md` |
| Prompt d'implémentation | `product/prompts/prompt-ep-XX-slug.md` |

+ mise à jour de `design-system-guidelines.md` si nouveaux composants/tokens.

---

## Étape 4 — Mise à jour de la roadmap

**Mode :** `mode product`

**Ce que tu fournis :**
- Validation du PRD
- Position souhaitée dans la roadmap (NOW / NEXT / LATER) ou demander un avis

**Ce que Claude fait :**
- Met à jour `product/roadmap/roadmap.md` (ajout de l'epic dans la bonne phase)
- Met à jour `product/roadmap/backlog.md` (scoring RICE + statut)
- Met à jour `product/CLAUDE.md` (table des epics)
- Utilise le skill `conseiller-priorisation` si besoin d'arbitrage

**Output :** roadmap et backlog à jour.

---

## Étape 5 — Implémentation

**Mode :** `mode dev` (ou nouvelle session Claude)

**Ce que tu fournis :**
- Le prompt d'implémentation : copier-coller le contenu de `product/prompts/prompt-ep-XX-slug.md`
- C'est tout — le prompt contient tout le contexte nécessaire

**Ce que Claude fait :**
- Exécute le skill `feature-implementation` (8 étapes) :
  1. **Lire le PRD + les références design** (obligatoire avant de coder)
  2. Rédiger la Tech Design Doc
  3. Créer les migrations DB (si applicable)
  4. Implémenter les endpoints API
  5. **Implémenter le frontend** (composants design system, 5 états, tokens)
  6. Tester
  7. **Code review** (inclut section UI/UX)
  8. Merge
- Suit le plan phasé du prompt (commit à chaque phase)

**Output :** code fonctionnel, commité phase par phase.

---

## Étape 6 — Review

**Mode :** `mode dev`

**Ce que tu fournis :**
- "Fais une code review" ou utilise le skill `code-review`

**Ce que Claude fait :**
- Exécute le skill `code-review` (9 sections) :
  1. Conformité PRD
  2. Correction fonctionnelle
  3. Sécurité
  4. Qualité du code
  5. Gestion des erreurs
  6. Tests
  7. Infrastructure & config
  8. **UI/UX et cohérence visuelle** (tokens, dark mode, 5 états, hiérarchie)
  9. Commits et historique

**Output :** feedback structuré (BLOQUANT / SUGGESTION / QUESTION / NOTE).

---

## Étape 7 — Mise à jour post-livraison

**Mode :** `mode product`

**Ce que tu fournis :**
- "La feature EP-XX est livrée, mets à jour les docs"

**Ce que Claude fait :**
- Met à jour le statut dans `product/roadmap/backlog.md` → `✅ Livré`
- Met à jour le statut dans `product/CLAUDE.md`
- Met à jour le statut dans `src/CLAUDE.md` (table des PRDs)

**Output :** docs à jour, prêt pour le prochain epic.

---

## Résumé visuel

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  TOI                          CLAUDE                            │
│                                                                 │
│  "J'ai une idée" ──────────► Discussion libre                  │
│                                    │                            │
│                               mode product                     │
│                                    │                            │
│  Contexte, verbatims ────────► Cadrage problème                │
│                                    │                            │
│  Validation ─────────────────► PRD (10 phases)                 │
│                                    │                            │
│                                    ├──► prd-XX-slug.md          │
│                                    ├──► screens-and-flows.md    │
│                                    ├──► design-system-*.md      │
│                                    └──► prompt-ep-XX-slug.md    │
│                                    │                            │
│  "Roadmap à jour ?" ────────► Mise à jour roadmap + backlog    │
│                                    │                            │
│                               mode dev                         │
│                                    │                            │
│  Copier-coller le prompt ───► Implémentation (8 étapes)        │
│                                    │                            │
│  "Code review" ─────────────► Review (9 sections)              │
│                                    │                            │
│                               mode product                     │
│                                    │                            │
│  "C'est livré" ─────────────► Mise à jour statuts              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Skills utilisés par étape

| Étape | Skills PM | Skills Tech |
|---|---|---|
| 2. Cadrage | `enonce-probleme`, `proto-persona`, `jobs-to-be-done`, `cartographie-parcours-client`, `audit-ux` | — |
| 3. PRD | `developpement-prd`, `decoupeur-epics`, `user-story` | — |
| 4. Roadmap | `conseiller-priorisation` | — |
| 5. Implémentation | — | `feature-implementation`, `technical-design-doc`, `database-schema`, `api-endpoint-spec`, `ui-component-spec` |
| 6. Review | — | `code-review` |

---

## Raccourcis

| Situation | Ce que tu dis |
|---|---|
| Petite feature, pas besoin de PRD complet | "Ajoute [truc] au dashboard" → Claude peut implémenter directement en mode dev en suivant les guidelines |
| Bug fix | "Il y a un bug : [description]" → mode dev, skill `bug-investigation` |
| Juste explorer une idée | "Qu'est-ce que tu penses de [idée] ?" → conversation libre, pas besoin de mode |
| Prioriser entre plusieurs idées | "J'hésite entre X et Y" → mode product, skill `conseiller-priorisation` ou `conseiller-investissement-feature` |
| Découper un gros epic | "C'est trop gros, découpe-le" → mode product, skill `decoupeur-epics` |

---

## Fichiers de référence

| Fichier | Rôle | Quand le consulter |
|---|---|---|
| `CLAUDE.md` (racine) | Vue d'ensemble du projet, décisions partagées | Toujours |
| `product/CLAUDE.md` | Instructions mode PM, table des epics | En mode product |
| `src/CLAUDE.md` | Instructions mode Dev, stack, conventions, refs design | En mode dev |
| `product/prd/design-system-guidelines.md` | Tokens, composants, patterns UI | Avant tout frontend |
| `product/prd/screens-and-flows.md` | Maquettes d'écrans, parcours | Avant tout frontend |
| `product/roadmap/roadmap.md` | Roadmap NOW/NEXT/LATER | Pour prioriser |
| `product/roadmap/backlog.md` | Backlog RICE avec statuts | Pour prioriser |
| `skills/README.md` | Catalogue complet des skills | Pour savoir quel skill utiliser |
