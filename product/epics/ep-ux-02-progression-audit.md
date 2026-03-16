# EP-UX-02 — Progression d'audit en temps réel

## Hypothèse

Nous croyons que remplacer le spinner de lancement d'audit par une navigation immédiate vers la page rapport + un tracker de progression en temps réel domaine par domaine permettra aux utilisateurs de rester engagés pendant l'exécution de l'audit (30-300s) et de ne plus douter de son bon fonctionnement — parce qu'aujourd'hui le bouton grisé sans feedback génère de l'anxiété et des abandons.

Nous mesurerons le succès via : taux de complétion d'audit (cible : > 90%) + taux de rafraîchissement de page pendant l'audit (cible : < 5%).

---

## Périmètre

### In scope

- Navigation immédiate vers `/audit/{auditId}` au clic sur "Lancer un audit"
- Tracker de progression visible sur la page d'audit (état "running")
- Progression par domaine (Propriétés, Contacts, Companies, Workflows) avec 3 sous-étapes chacun
- Étape finale transverse : génération du résumé LLM
- Barre de progression globale (pourcentage calculé sur les sous-étapes)
- Communication temps réel backend → frontend (polling recommandé, SSE optionnel)
- Persistance de la progression en base (survie au rafraîchissement)
- Gestion des erreurs partielles (un domaine échoue, les autres continuent)
- Transition fluide tracker → rapport complet

### Out of scope

- Annulation d'un audit en cours — NEXT phase
- Estimation du temps restant en secondes — NEXT phase
- Notifications push/email quand l'audit est terminé — LATER
- Progression au niveau de chaque règle individuelle — exclu (spoiler + bruit)

---

## User stories

### Story 1 — Navigation immédiate vers la page d'audit

**En tant que** utilisateur qui lance un audit
**je veux** être redirigé immédiatement vers la page de mon audit
**afin de** voir que l'audit a bien démarré et suivre sa progression

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
**Quand** l'appel API est en cours
**Alors** le bouton passe en état loading (spinner + désactivé) pendant la durée de l'appel API (1-2s), puis la navigation se déclenche

---

### Story 2 — Tracker de progression par domaine

**En tant que** utilisateur qui attend les résultats de son audit
**je veux** voir quels domaines sont en cours d'analyse, terminés ou en attente
**afin de** comprendre la progression globale de l'audit

**Critères d'acceptance :**

*Scénario : Affichage du tracker*
**Étant donné** que je suis sur `/audit/{auditId}` et que l'audit est en cours
**Quand** la page se charge
**Alors** je vois :
- Le titre "Audit en cours — {Portal Name}"
- La liste de tous les domaines d'audit avec leur statut : ○ en attente / ◌ en cours / ✓ terminé / ✗ erreur
- Chaque domaine affiche ses 3 sous-étapes avec le même système de statut

*Scénario : Mise à jour en temps réel*
**Étant donné** que le tracker est affiché
**Quand** un domaine change d'étape côté serveur
**Alors** le tracker se met à jour automatiquement sans rafraîchissement, délai max 3 secondes

*Scénario : Rafraîchissement de page*
**Étant donné** que l'audit est en cours et que je rafraîchis la page
**Quand** la page se recharge
**Alors** le tracker reprend à l'état actuel sans perte de progression

---

### Story 3 — Sous-étapes par domaine

**En tant que** utilisateur qui suit la progression de l'audit
**je veux** voir les grandes étapes au sein de chaque domaine
**afin de** savoir précisément où en est l'analyse

**Critères d'acceptance :**

*Scénario : Sous-étapes affichées*
**Étant donné** qu'un domaine est en cours d'analyse
**Quand** je regarde le tracker
**Alors** je vois 3 sous-étapes :
1. "Récupération des données" — appels API HubSpot
2. "Analyse en cours" — exécution des règles
3. "Scoring et recommandations" — calcul du score et des impacts

*Scénario : Comptage des éléments*
**Étant donné** que la sous-étape "Récupération" d'un domaine est terminée
**Quand** le tracker se met à jour
**Alors** le nombre d'éléments récupérés est affiché (ex. "2 340 contacts", "148 propriétés")

*Scénario : Domaine non applicable*
**Étant donné** qu'un domaine n'a aucun élément (ex. 0 workflow)
**Quand** le tracker se met à jour
**Alors** le domaine affiche ✓ avec le label "Aucun élément détecté — domaine exclu"

---

### Story 4 — Barre de progression globale

**En tant que** utilisateur qui attend les résultats
**je veux** voir une barre de progression globale avec un pourcentage
**afin de** estimer visuellement le temps restant

**Critères d'acceptance :**

*Scénario : Calcul du pourcentage*
**Étant donné** que l'audit est en cours
**Quand** des sous-étapes sont complétées
**Alors** la barre avance selon : `sous_étapes_terminées / (nb_domaines × 3 + 1) × 100`

*Scénario : Monotonie*
**Étant donné** que la barre affiche N%
**Quand** le tracker se met à jour
**Alors** la barre ne régresse jamais (N+1 ≥ N)

---

### Story 5 — Finalisation et révélation du rapport

**En tant que** utilisateur dont l'audit vient de se terminer
**je veux** voir le rapport complet apparaître d'un coup
**afin de** consulter les résultats dans leur intégralité

**Critères d'acceptance :**

*Scénario : Étape finale — résumé LLM*
**Étant donné** que tous les domaines sont terminés
**Quand** le résumé exécutif est en cours de génération
**Alors** le tracker affiche une dernière étape : "Génération du résumé exécutif…" avec l'icône ✨

*Scénario : Transition vers le rapport*
**Étant donné** que l'audit passe au statut "completed"
**Quand** le frontend détecte ce changement
**Alors** :
- Toutes les étapes passent en ✓ (confirmation visuelle, 1s)
- La barre atteint 100%
- Le tracker disparaît avec une transition fluide
- Le rapport complet apparaît (hero, navigation, sections, résumé)
- Aucun résultat partiel n'a été visible avant ce moment

*Scénario : Score global*
**Étant donné** que le rapport s'affiche
**Quand** je regarde le hero
**Alors** le score global et tous les sous-scores apparaissent simultanément

---

### Story 6 — Gestion des erreurs pendant l'audit

**En tant que** utilisateur dont l'audit rencontre un problème
**je veux** comprendre ce qui a échoué et ce qui a fonctionné
**afin de** savoir si le rapport est exploitable ou si je dois relancer

**Critères d'acceptance :**

*Scénario : Erreur sur un domaine*
**Étant donné** qu'un domaine échoue (ex. timeout API sur les workflows)
**Quand** le tracker se met à jour
**Alors** :
- Le domaine en erreur affiche ✗ avec un message court
- Les autres domaines continuent normalement

*Scénario : Audit terminé avec erreur partielle*
**Étant donné** que l'audit se termine avec au moins un domaine en erreur
**Quand** le rapport s'affiche
**Alors** :
- Les domaines réussis sont affichés normalement
- Les domaines en erreur sont signalés (hero + métadonnées)
- Le score global est calculé sur les domaines disponibles
- Un bouton "Relancer l'audit" est proposé

*Scénario : Échec total*
**Étant donné** que tous les domaines ont échoué
**Quand** le frontend détecte le statut "failed"
**Alors** :
- Le tracker affiche tous les domaines en erreur
- Un message global explique l'échec + bouton "Réessayer"
- Pas de transition vers le rapport

---

## Spécifications fonctionnelles

### Domaines et sous-étapes

Chaque domaine suit un cycle en 3 sous-étapes :

| Sous-étape | Description |
|---|---|
| Récupération | Appels API HubSpot pour récupérer les données brutes |
| Analyse | Exécution des règles d'audit |
| Scoring | Calcul du score et génération des impacts business |

#### Domaines (ordre d'affichage)

| # | Domaine | Icône Lucide | Label |
|---|---|---|---|
| 1 | Propriétés custom | `list-tree` | Propriétés |
| 2 | Contacts | `users` | Contacts |
| 3 | Companies | `building` | Companies |
| 4 | Workflows | `workflow` | Workflows |

> Après EP-06 : Deals & Pipelines (`handshake`) s'insère en position 3, décale Companies et Workflows.

#### Étape finale transverse

| Étape | Icône | Label |
|---|---|---|
| Résumé exécutif | `sparkles` | Génération du résumé exécutif |

Se déclenche après la complétion de tous les domaines.

### États visuels

| État | Icône | Texte | Animation |
|---|---|---|---|
| En attente | ○ cercle vide | `gray-500` | Aucune |
| En cours | ◌ cercle | `gray-200` + icône `brand-500` | Pulse |
| Terminé | ✓ check | `gray-400` + icône `#22c55e` | Aucune |
| Erreur | ✗ croix | `#fca5a5` + icône `#ef4444` | Aucune |

### Communication backend → frontend

**Polling (recommandé en v1) :** `GET /api/audit/{auditId}/status` toutes les 3s.

Réponse JSON :

```json
{
  "status": "running | completed | failed",
  "domains": {
    "properties": {
      "status": "completed | running | pending | error",
      "currentStep": "fetching | analyzing | scoring | null",
      "completedSteps": ["fetching", "analyzing", "scoring"],
      "itemCount": 148,
      "error": null
    }
  },
  "llmSummary": {
    "status": "pending | running | completed | error"
  },
  "globalProgress": 0.31
}
```

### Persistance

Nouvelle colonne `audit_progress` (JSONB) dans `audit_runs`, mise à jour à chaque changement de sous-étape (~15 updates max par audit).

### Cas particuliers

| Cas | Comportement |
|---|---|
| Rafraîchissement page | Tracker reprend depuis la DB |
| Audit déjà terminé | Rapport affiché directement (pas de tracker) |
| Audit échoué | Tracker avec erreurs + bouton "Réessayer" |
| Domaine 0 élément | ✓ "Aucun élément détecté — domaine exclu" |
| Perte connexion | Polling échoue silencieusement, reprend automatiquement |
| Audit termine très vite | Premier poll détecte "completed", rapport affiché directement |

---

## Critères d'acceptance de l'epic

- [ ] Au clic "Lancer un audit", navigation vers `/audit/{auditId}` en < 2s
- [ ] Tracker affiche tous les domaines + sous-étapes avec statuts corrects
- [ ] Mise à jour temps réel (délai max 3s) sans rafraîchissement
- [ ] Nombre d'éléments affiché après récupération de chaque domaine
- [ ] Barre de progression monotone croissante
- [ ] Rapport complet apparaît d'un coup (pas d'affichage progressif)
- [ ] Score global visible uniquement à la fin
- [ ] Résumé LLM affiché comme dernière étape du tracker
- [ ] Erreur partielle : domaines OK affichés, domaines KO signalés
- [ ] Échec total : erreurs affichées + bouton "Réessayer"
- [ ] Rafraîchissement de page ne perd pas la progression
- [ ] Transition tracker → rapport fluide (fade-out → rapport)
- [ ] Design conforme au design system (tokens, composants, dark mode)
- [ ] L'état "running" est persisté en base (colonne `audit_progress`)

---

## Dépendances

- **EP-04** (Tableau de bord) : la page `/audit/{auditId}` existe déjà — cet epic ajoute l'état "running"
- **Architecture backend (engine.ts)** : le moteur d'audit doit émettre des événements de progression à chaque sous-étape
- **Schéma DB** : ajout de la colonne `audit_progress` (JSONB) dans `audit_runs`

---

## Questions ouvertes

| # | Question | Impact | Statut |
|---|---|---|---|
| Q1 | Fréquence de polling 3s : suffisant ou trop fréquent ? | UX de fluidité vs charge serveur | À valider pendant l'implémentation |
| Q2 | Pré-charger le rapport en arrière-plan avant la fin du tracker ? | Transition plus rapide tracker → rapport | Proposé OUI — décision technique |
