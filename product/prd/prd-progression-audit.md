# PRD — Progression d'audit en temps réel

**Epic associé :** À définir (proposition : EP-UX-02)
**Phase :** NOW (v1)
**Statut :** Brouillon
**Dernière mise à jour :** 2026-03-16
**Auteur :** Product Management

---

## 1. Résumé exécutif

Aujourd'hui, lancer un audit graye le bouton "Lancer un audit" avec un spinner — sans navigation, sans feedback, sans visibilité sur l'avancement. L'audit prend entre 30 et 300 secondes, et l'utilisateur n'a aucun moyen de savoir si l'opération progresse ou a planté.

Ce PRD spécifie une expérience de progression en temps réel : navigation immédiate vers la page du rapport, tracker visuel montrant l'avancement domaine par domaine et sous-étape par sous-étape, puis révélation complète du rapport une fois tout terminé.

---

## 2. Problème utilisateur

### Narrative du problème

**Je suis :** Sophie, RevOps Manager qui vient de cliquer sur "Lancer un audit"
- Le bouton est grisé avec une molette qui tourne
- Je ne sais pas combien de temps ça va prendre
- Je ne sais pas si ça fonctionne ou si c'est bloqué
- Au bout de 30 secondes, j'hésite à rafraîchir la page

**J'essaie de :**
- Obtenir le diagnostic de mon workspace HubSpot

**Mais :**
- L'interface ne me donne aucun feedback sur ce qui se passe
- Je ne vois rien bouger pendant 1 à 5 minutes
- J'ai l'impression que l'outil a planté

**Parce que :**
- L'audit s'exécute en tâche de fond côté serveur sans remonter sa progression au frontend

**Ce qui me fait ressentir :**
- De l'anxiété ("est-ce que ça marche ?")
- De la frustration ("combien de temps encore ?")
- Un doute sur la fiabilité de l'outil

### Énoncé du problème

Les utilisateurs qui lancent un audit HubSpot (30-300s d'exécution) n'ont aucune visibilité sur la progression de l'opération, ce qui génère de l'anxiété, des abandons (rafraîchissement de page), et une perception négative de la fiabilité du produit.

---

## 2bis. Personas & Jobs-to-be-Done

### Sophie RevOps *(persona primaire)*

**Jobs fonctionnels :**
- Savoir que l'audit a bien démarré et progresse
- Estimer le temps restant avant de pouvoir consulter les résultats
- Comprendre ce que l'outil est en train d'analyser (contacts, propriétés, etc.)

**Jobs émotionnels :**
- Se sentir rassurée que le processus avance
- Être engagée par une expérience de chargement qui montre la richesse de l'analyse

**Douleurs actuelles :**
- Le bouton grisé + spinner est le seul feedback
- Pas de navigation vers une page de résultats
- Aucune indication de temps restant ou de progression

---

## 2ter. Contexte stratégique

**Lien avec la vision produit :** L'audit est le moment central du produit. Si l'utilisateur abandonne ou perd confiance pendant l'exécution, le rapport — et toute la valeur en aval (partage, action corrective) — ne sera jamais vu.

**Impact sur les métriques :** Le taux de complétion d'audit (cible roadmap : > 70%) est directement menacé par une expérience d'attente sans feedback. Ce PRD cible spécifiquement cette métrique.

**Référence design :** La section 5.5 de `screens-and-flows.md` décrivait déjà un état de progression par étapes, mais avec un fallback simple (textes rotatifs toutes les 10s). Ce PRD remplace cette spécification par une implémentation réelle avec progression en temps réel.

---

## 2quart. Vue d'ensemble de la solution

### Comportement cible

1. **Clic "Lancer un audit"** → Création de l'audit côté serveur → **navigation immédiate** vers `/audit/{auditId}`
2. **Page d'audit (état en cours)** → Affiche un **tracker de progression** montrant chaque domaine et ses sous-étapes en temps réel
3. **Quand l'audit est terminé** → Le tracker disparaît, le **rapport complet apparaît d'un coup** (scores, résultats, résumé LLM)

### Ce que ce n'est PAS

- Ce n'est **pas** un affichage progressif des résultats section par section
- Ce n'est **pas** un score global partiel mis à jour au fil de l'eau
- Le rapport est **caché** pendant toute la durée de l'audit — seul le tracker est visible

---

## 3. Objectifs & métriques de succès

### Objectif produit

Transformer le moment d'attente de l'audit (30-300s) en une expérience engageante qui donne confiance dans la progression de l'analyse.

### KPIs de l'epic

| Indicateur | Cible |
|---|---|
| Taux de complétion d'audit (utilisateur reste jusqu'à la fin) | > 90 % |
| Taux de rafraîchissement de page pendant l'audit | < 5 % |
| Perception de durée (feedback beta : "c'était rapide / acceptable / long") | > 70 % "rapide" ou "acceptable" |

### Métriques garde-fous

- La progression affichée ne doit jamais régresser (un domaine "terminé" ne repasse jamais en "en cours")
- Le rapport ne doit jamais s'afficher avec des données partielles (tout ou rien)
- Si l'audit échoue en cours de route, l'erreur doit s'afficher clairement dans le tracker

---

## 4. Périmètre

### In scope

- Navigation immédiate vers `/audit/{auditId}` au clic sur "Lancer un audit"
- Tracker de progression visible sur la page d'audit tant que le statut est "running"
- Progression par domaine (Propriétés, Contacts, Companies, Workflows) avec 3 sous-étapes chacun
- Communication en temps réel du statut backend → frontend (polling ou SSE)
- Gestion des erreurs partielles (un domaine échoue, les autres continuent)
- Transition fluide tracker → rapport complet quand l'audit est terminé
- Résumé LLM affiché comme dernière étape du tracker ("Génération du résumé exécutif…")

### Out of scope

- Annulation d'un audit en cours — **NEXT phase**
- Estimation du temps restant en secondes — **NEXT phase** (nécessite un historique de durées par workspace)
- Notifications push ou email quand l'audit est terminé — **LATER**
- Progression au niveau de chaque règle individuelle — **exclu** (spoiler les résultats, granularité excessive)

---

## 5. User stories

### Story 1 — Navigation immédiate vers la page d'audit

**En tant que** utilisateur qui lance un audit
**je veux** être redirigé immédiatement vers la page de mon audit
**afin de** voir que mon audit a bien démarré et suivre sa progression

**Critères d'acceptance :**

*Scénario : Lancement d'un audit*
**Étant donné** que je suis sur le dashboard avec un workspace connecté
**Quand** je clique sur "Lancer un audit"
**Alors** :
- L'audit est créé côté serveur avec le statut "running"
- Je suis redirigé vers `/audit/{auditId}` en moins de 2 secondes
- La page affiche le tracker de progression (pas le rapport)

*Scénario : Bouton pendant la création*
**Étant donné** que je clique sur "Lancer un audit"
**Quand** l'appel API est en cours (création de l'audit)
**Alors** le bouton passe en état loading (spinner + désactivé) pendant la durée de l'appel API uniquement (1-2 secondes), puis la navigation se déclenche

---

### Story 2 — Tracker de progression par domaine

**En tant que** utilisateur qui attend les résultats de son audit
**je veux** voir quels domaines sont en cours d'analyse, terminés ou en attente
**afin de** comprendre la progression globale de l'audit

**Critères d'acceptance :**

*Scénario : Affichage du tracker*
**Étant donné** que je suis sur la page `/audit/{auditId}` et que l'audit est en cours
**Quand** la page se charge
**Alors** je vois :
- Le nom du workspace en cours d'audit
- La liste de tous les domaines d'audit avec leur statut (en attente / en cours / terminé / erreur)
- Chaque domaine affiche ses sous-étapes

*Scénario : Mise à jour en temps réel*
**Étant donné** que le tracker est affiché
**Quand** un domaine change d'étape côté serveur
**Alors** le tracker se met à jour automatiquement sans rafraîchissement de page, dans un délai maximum de 3 secondes

---

### Story 3 — Sous-étapes par domaine

**En tant que** utilisateur qui suit la progression de l'audit
**je veux** voir les grandes étapes au sein de chaque domaine
**afin de** savoir où en est l'analyse à un niveau de détail utile

**Critères d'acceptance :**

*Scénario : Sous-étapes affichées*
**Étant donné** qu'un domaine est en cours d'analyse
**Quand** je regarde le tracker
**Alors** je vois les sous-étapes du domaine :
1. "Récupération des données" — appels API HubSpot pour récupérer les éléments
2. "Analyse en cours" — exécution des règles d'audit
3. "Scoring et recommandations" — calcul du score et génération des impacts business

Chaque sous-étape a un statut : ○ en attente, ◌ en cours (avec animation), ✓ terminé, ✗ erreur

*Scénario : Comptage des éléments*
**Étant donné** que la sous-étape "Récupération des données" d'un domaine est terminée
**Quand** le tracker se met à jour
**Alors** le nombre d'éléments récupérés est affiché (ex. "2 340 contacts", "890 companies", "156 workflows")

---

### Story 4 — Finalisation et révélation du rapport

**En tant que** utilisateur dont l'audit vient de se terminer
**je veux** voir le rapport complet apparaître d'un coup
**afin de** consulter les résultats dans leur intégralité sans information partielle

**Critères d'acceptance :**

*Scénario : Étape finale — résumé LLM*
**Étant donné** que tous les domaines sont terminés
**Quand** le résumé exécutif est en cours de génération
**Alors** le tracker affiche une dernière étape : "Génération du résumé exécutif…" avec l'icône ✨

*Scénario : Transition vers le rapport*
**Étant donné** que l'audit passe au statut "completed" (tous les domaines + résumé LLM terminés)
**Quand** le frontend détecte ce changement de statut
**Alors** :
- Le tracker se rétracte ou disparaît avec une transition fluide
- Le rapport complet apparaît (hero score, navigation, sections, résumé exécutif)
- Le score global est visible immédiatement
- Aucune donnée partielle n'a été visible avant ce moment

*Scénario : Score global*
**Étant donné** que le rapport s'affiche
**Quand** je regarde le hero
**Alors** le score global et tous les sous-scores de domaine apparaissent simultanément

---

### Story 5 — Gestion des erreurs pendant l'audit

**En tant que** utilisateur dont l'audit rencontre un problème
**je veux** comprendre ce qui a échoué et ce qui a fonctionné
**afin de** savoir si le rapport partiel est exploitable ou si je dois relancer

**Critères d'acceptance :**

*Scénario : Erreur sur un domaine*
**Étant donné** qu'un domaine échoue (ex. timeout API HubSpot sur les workflows)
**Quand** le tracker se met à jour
**Alors** :
- Le domaine en erreur affiche un statut ✗ avec un message court (ex. "Échec de la récupération — timeout API")
- Les autres domaines continuent leur exécution normalement
- Le tracker ne se bloque pas

*Scénario : Audit terminé avec erreur partielle*
**Étant donné** que l'audit se termine avec au moins un domaine en erreur
**Quand** le rapport s'affiche
**Alors** :
- Le rapport affiche les résultats des domaines réussis
- Les domaines en erreur sont signalés dans le hero (alerte) et dans les métadonnées
- Le score global est calculé sur les domaines disponibles uniquement
- Un bouton "Relancer l'audit" est proposé

*Scénario : Audit entièrement échoué*
**Étant donné** que tous les domaines ont échoué
**Quand** le frontend détecte le statut "failed"
**Alors** :
- Le tracker affiche tous les domaines en erreur
- Un message global explique l'échec
- Un bouton "Réessayer" est proposé
- Pas de transition vers le rapport

---

## 6. Spécifications fonctionnelles

### 6.1 Domaines et sous-étapes

Chaque domaine d'audit suit un cycle en 3 sous-étapes :

| Sous-étape | Description | Exemples de label affiché |
|---|---|---|
| **Récupération** | Appels API HubSpot pour récupérer les données brutes | "Récupération des contacts…", "Récupération des propriétés…" |
| **Analyse** | Exécution des règles d'audit sur les données récupérées | "Analyse des contacts (2 340)…", "Analyse des propriétés (148)…" |
| **Scoring** | Calcul du score, génération des impacts business | "Calcul du score et des recommandations…" |

#### Domaines actuels (phase NOW)

| Domaine | Icône | Label | Ordre d'affichage |
|---|---|---|---|
| Propriétés custom | `list-tree` | Propriétés | 1 |
| Contacts | `users` | Contacts | 2 |
| Companies | `building` | Companies | 3 |
| Workflows | `workflow` | Workflows | 4 |

#### Domaine futur (après EP-06)

| Domaine | Icône | Label | Ordre d'affichage |
|---|---|---|---|
| Deals & Pipelines | `handshake` | Deals & Pipelines | Entre Contacts et Companies (position 3, décale les suivants) |

#### Étape finale transverse

| Étape | Icône | Label |
|---|---|---|
| Résumé exécutif | `sparkles` | Génération du résumé exécutif |

Cette étape se déclenche après la complétion de **tous** les domaines. Elle couvre l'appel LLM et le calcul du score global.

### 6.2 États des domaines et sous-étapes

| État | Icône | Style visuel | Description |
|---|---|---|---|
| En attente | `○` (cercle vide) | Texte `gray-500`, icône `gray-600` | Le domaine n'a pas encore commencé |
| En cours | `◌` (cercle animé) | Texte `gray-200`, icône `brand-500` avec animation pulse | Le domaine est en cours de traitement |
| Terminé | `✓` (check) | Texte `gray-400`, icône verte `#22c55e` | Le domaine est terminé avec succès |
| Erreur | `✗` (croix) | Texte `#fca5a5`, icône rouge `#ef4444` | Le domaine a rencontré une erreur |

### 6.3 Structure du tracker

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│  Audit en cours — Portal Name                                     │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                                                            │   │
│  │  ✓  Propriétés                                     ✓ OK   │   │
│  │     ✓ Récupération des données (148 propriétés)           │   │
│  │     ✓ Analyse des propriétés                              │   │
│  │     ✓ Scoring et recommandations                          │   │
│  │                                                            │   │
│  │  ◌  Contacts                                     En cours  │   │
│  │     ✓ Récupération des données (2 340 contacts)           │   │
│  │     ◌ Analyse des contacts…                               │   │
│  │     ○ Scoring et recommandations                          │   │
│  │                                                            │   │
│  │  ○  Companies                                   En attente │   │
│  │     ○ Récupération des données                            │   │
│  │     ○ Analyse                                              │   │
│  │     ○ Scoring et recommandations                          │   │
│  │                                                            │   │
│  │  ○  Workflows                                   En attente │   │
│  │     ○ Récupération des données                            │   │
│  │     ○ Analyse                                              │   │
│  │     ○ Scoring et recommandations                          │   │
│  │                                                            │   │
│  │  ─────────────────────────────────────────────────────     │   │
│  │                                                            │   │
│  │  ○  Génération du résumé exécutif              ✨ En attente  │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░  40%                      │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### 6.4 Barre de progression globale

La barre de progression est calculée à partir du nombre total de sous-étapes terminées.

**Formule :**

```
Nombre total de sous-étapes = (nombre_domaines × 3) + 1 (résumé LLM)
Progression = sous_étapes_terminées / nombre_total_sous_étapes × 100
```

**Exemple avec 4 domaines :**
- Total = (4 × 3) + 1 = 13 sous-étapes
- Propriétés terminées (3/13), Contacts récupération terminée (4/13) → 30%

La barre de progression utilise le composant `ProgressBar` du design system (couleur `brand-500` sur track `gray-800`).

### 6.5 Placement du tracker sur la page

Le tracker occupe la **zone de contenu principal** de la page `/audit/{auditId}` quand le statut est "running".

**Layout de la page en état "running" :**

```
┌────────────────────────────────────────────────────────────────────┐
│  Topbar                                                           │
├────────────────────────────────────────────────────────────────────┤
│  Breadcrumb : Dashboard > Portal Name > Audit en cours…           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                      ┌─────────────────────┐                      │
│                      │                     │                      │
│                      │   Tracker card      │                      │
│                      │   (max-width 640px) │                      │
│                      │   centrée           │                      │
│                      │                     │                      │
│                      └─────────────────────┘                      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Spécifications visuelles du tracker :**

| Propriété | Valeur |
|---|---|
| Conteneur | Card standard (`gray-900`, bordure `gray-700`, `radius-lg`) |
| Max-width | `640px`, centré horizontalement |
| Padding | `space-6` (24px) |
| Titre | `h2`, `gray-100` : "Audit en cours — {Portal Name}" |
| Gap entre domaines | `space-5` (20px) |
| Gap entre sous-étapes | `space-2` (8px) |
| Icônes domaines | 20px, couleur selon état (voir 6.2) |
| Texte domaines | `body-medium` (14px, weight 500) |
| Texte sous-étapes | `body` (14px, weight 400), indentées de `space-6` (24px) sous le domaine |
| Séparateur avant résumé LLM | `1px solid gray-700`, margin vertical `space-4` |
| Barre de progression | Sous le tracker, full-width du conteneur, hauteur 6px |
| Pourcentage | `body-medium`, `gray-400`, aligné à droite de la barre |

### 6.6 Transition tracker → rapport

Quand l'audit passe au statut "completed" :

1. Le tracker affiche **toutes les étapes en ✓** pendant 1 seconde (confirmation visuelle que tout est terminé)
2. La barre de progression atteint 100%
3. **Transition :** le tracker se contracte vers le haut avec un fade-out (200ms, `ease-in`)
4. **Après la transition :** la page charge et affiche le rapport complet (hero, navigation, sections, résumé)
5. Si le rapport est déjà en cache (pré-chargé), l'affichage est instantané
6. Sinon, un skeleton de la page rapport s'affiche brièvement pendant le chargement des données

### 6.7 Communication backend → frontend

#### Option recommandée : polling

Le frontend interroge le statut de l'audit toutes les **3 secondes** via un appel GET.

**Endpoint :** `GET /api/audit/{auditId}/status`

**Réponse :**

```json
{
  "status": "running" | "completed" | "failed",
  "domains": {
    "properties": {
      "status": "completed" | "running" | "pending" | "error",
      "currentStep": "fetching" | "analyzing" | "scoring" | null,
      "completedSteps": ["fetching", "analyzing", "scoring"],
      "itemCount": 148,
      "error": null
    },
    "contacts": {
      "status": "running",
      "currentStep": "analyzing",
      "completedSteps": ["fetching"],
      "itemCount": 2340,
      "error": null
    },
    "companies": {
      "status": "pending",
      "currentStep": null,
      "completedSteps": [],
      "itemCount": null,
      "error": null
    },
    "workflows": {
      "status": "pending",
      "currentStep": null,
      "completedSteps": [],
      "itemCount": null,
      "error": null
    }
  },
  "llmSummary": {
    "status": "pending" | "running" | "completed" | "error",
    "error": null
  },
  "globalProgress": 0.31
}
```

**Fréquence de polling :**
- Toutes les 3 secondes tant que `status === "running"`
- Arrêt immédiat du polling quand `status === "completed"` ou `status === "failed"`

**Note :** Le choix entre polling et SSE (Server-Sent Events) est une décision technique laissée à l'implémentation. Le polling est recommandé en v1 pour sa simplicité. L'essentiel est que le frontend reflète la progression réelle du backend avec un délai maximal de 3 secondes.

### 6.8 Persistance de la progression

La progression de chaque domaine doit être persistée dans la base de données, pour permettre :
- Le rechargement de la page sans perdre l'état de progression
- La reprise après une interruption de connexion

**Colonne suggérée :** `audit_progress` (JSONB) dans la table `audit_runs`, mise à jour par le backend à chaque changement de sous-étape.

### 6.9 Cas particuliers

| Cas | Comportement |
|---|---|
| L'utilisateur rafraîchit la page pendant l'audit | Le tracker se recharge avec l'état actuel depuis la base de données (pas de perte) |
| L'utilisateur navigue ailleurs puis revient | Le tracker reprend au bon endroit (état persisté) |
| L'utilisateur ouvre `/audit/{auditId}` sur un audit déjà terminé | Pas de tracker, le rapport s'affiche directement |
| L'utilisateur ouvre `/audit/{auditId}` sur un audit "failed" | Le tracker s'affiche avec les domaines en erreur + bouton "Réessayer" |
| Domaine non applicable (ex. 0 workflow) | Le domaine apparaît dans le tracker avec le statut ✓ et le label "Aucun élément détecté — domaine exclu" |
| Perte de connexion internet | Le polling échoue silencieusement, reprend automatiquement quand la connexion revient |

---

## 7. Dépendances & risques

### Dépendances

| Dépendance | Nature | Statut |
|---|---|---|
| EP-04 — Tableau de bord | La page `/audit/{auditId}` existe déjà et affiche les résultats. Ce PRD ajoute l'état "running" à cette page. | ✅ Livré |
| Architecture backend (engine.ts) | Le moteur d'audit doit être modifié pour émettre des événements de progression à chaque sous-étape | Modification requise |
| Schéma base de données | Ajout de la colonne `audit_progress` (JSONB) dans `audit_runs` | Migration requise |

### Risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Latence de mise à jour > 3s perçue comme blocage | Faible | Moyen | L'animation "en cours" (pulse) donne une impression de mouvement même entre deux mises à jour |
| L'audit termine avant que l'utilisateur n'arrive sur la page | Faible (seulement sur petits workspaces) | Faible | Le frontend détecte `status === "completed"` au premier poll et affiche directement le rapport |
| Incohérence entre la progression affichée et l'état réel | Faible | Élevé | La progression ne doit jamais régresser (monotone croissante). Le backend est la source de vérité. |
| Charge DB augmentée par les mises à jour fréquentes de progression | Faible | Faible | Maximum ~15 updates par audit (4 domaines × 3 sous-étapes + 3 transitions). Négligeable. |

---

## 8. Critères d'acceptance globaux

- [ ] Au clic sur "Lancer un audit", l'utilisateur est redirigé vers `/audit/{auditId}` en moins de 2 secondes
- [ ] Le tracker affiche tous les domaines d'audit avec leurs sous-étapes
- [ ] La progression se met à jour en temps réel (délai max 3s) sans rafraîchissement de page
- [ ] Le nombre d'éléments récupérés est affiché pour chaque domaine après la sous-étape "récupération"
- [ ] La barre de progression globale avance de manière monotone (jamais de régression)
- [ ] Le rapport complet apparaît d'un coup quand l'audit est terminé (pas d'affichage progressif des résultats)
- [ ] Le score global n'est visible qu'une fois l'audit complètement terminé
- [ ] Le résumé LLM est affiché comme dernière étape dans le tracker
- [ ] En cas d'erreur sur un domaine, les autres domaines continuent et le rapport partiel est affiché
- [ ] En cas d'échec total, le tracker affiche les erreurs et propose un bouton "Réessayer"
- [ ] Le rafraîchissement de la page ne perd pas l'état de progression
- [ ] La transition tracker → rapport est fluide (fade-out → rapport complet)
- [ ] Le tracker est visuellement cohérent avec le design system (tokens, composants, dark mode)

---

*Ce PRD complète et remplace la section 5.5 "In-progress state" de `screens-and-flows.md`. La section 5.5 doit être mise à jour pour référencer ce PRD comme spécification de référence.*
