# EP-04 — Tableau de bord & score de santé

## Hypothèse

Nous croyons que présenter les résultats de l'audit sous forme d'un score global sur 100 accompagné d'une double lecture — détail opérationnel par domaine puis traduction business consolidée — permettra aux RevOps Managers de comprendre rapidement l'état de leur workspace ET d'avoir les arguments nécessaires pour convaincre leur direction d'agir — parce qu'aujourd'hui ils n'ont ni vue d'ensemble structurée, ni langage adapté pour escalader les problèmes CRM.

Nous mesurerons le succès via : pourcentage d'utilisateurs qui partagent ou exportent le rapport dans les 48h suivant leur premier audit (cible : > 30%).

---

## Périmètre

### In scope
- Calcul et affichage du score de santé global sur 100
- Calcul et affichage du score par domaine d'audit (Propriétés, Workflows en phase NOW)
- Bandeau de statut global : Critique / À améliorer / Bon / Excellent
- Section 1 du rapport : problèmes par domaine (score + résumé + détail)
- Section 2 du rapport : impacts business consolidés
- Navigation entre les sections du rapport
- Affichage des métadonnées de l'audit (date, workspace analysé, durée d'exécution)

### Out of scope
- Export PDF du rapport (NEXT phase)
- Comparaison entre deux audits successifs / historique d'évolution du score (NEXT phase)
- Tableau de bord multi-workspace (NEXT phase — usage consultant)
- Notifications et alertes programmées (LATER phase)
- Recommandations personnalisées générées par IA (LATER phase)

---

## User stories

### Story 1 — Score global et bandeau de statut

**En tant que** RevOps Manager ou consultant
**je veux** voir en haut du rapport un score sur 100 et un statut global immédiatement lisible
**afin de** comprendre en un coup d'œil l'état de santé de mon workspace avant de lire le détail

**Critères d'acceptance :**

*Scénario : Affichage du score global*
**Étant donné** que l'audit est terminé avec au moins un domaine analysé
**Quand** j'accède au rapport
**Alors** je vois en premier :
- Le score global sur 100 affiché en grand format
- Le bandeau de statut correspondant à la plage de score :
  - 🔴 **Critique** : score < 50
  - 🟡 **À améliorer** : score entre 50 et 69
  - 🟢 **Bon** : score entre 70 et 89
  - ✅ **Excellent** : score ≥ 90
- La date et l'heure de l'audit
- Le nom du workspace HubSpot analysé

*Scénario : Score avec un seul domaine disponible*
**Étant donné** que le workspace ne contient aucun workflow (domaine non scoré)
**Quand** j'accède au rapport
**Alors** le score global est calculé uniquement sur les domaines disponibles
**Et** une mention indique quels domaines ont été exclus du calcul et pourquoi

*Scénario : Comparaison du score par domaine*
**Étant donné** que plusieurs domaines ont été analysés
**Quand** j'accède au rapport
**Alors** je vois le score de chaque domaine accompagné du score global
**Et** le domaine le plus problématique est visuellement mis en avant

---

### Story 2 — Navigation dans le rapport

**En tant que** RevOps Manager ou consultant
**je veux** naviguer facilement entre les sections du rapport
**afin de** consulter d'abord le résumé, puis plonger dans les détails qui m'intéressent sans avoir à tout lire

**Critères d'acceptance :**

*Scénario : Navigation par domaine*
**Étant donné** que le rapport contient plusieurs domaines analysés
**Quand** je consulte le rapport
**Alors** je peux accéder directement à chaque domaine depuis un menu ou une table des matières en haut du rapport
**Et** chaque domaine affiche son score dès la navigation (avant même d'ouvrir le détail)

*Scénario : Collapse / expand des sections de détail*
**Étant donné** que certaines règles de détection peuvent lister de nombreux éléments
**Quand** je consulte un domaine
**Alors** le résumé (score + comptage des problèmes) est visible par défaut
**Et** je peux dérouler le détail de chaque règle via un mécanisme expand/collapse
**Et** les règles sans problème détecté sont repliées par défaut avec un indicateur "✅ Aucun problème"

*Scénario : Passage à la section Impact business*
**Étant donné** que j'ai consulté les problèmes techniques d'un domaine
**Quand** je veux voir la traduction business
**Alors** je peux naviguer vers la section "Impact business" depuis n'importe quel point du rapport
**Et** la section Impact business est clairement séparée visuellement de la section opérationnelle

---

### Story 3 — Section 1 : Rapport opérationnel par domaine

**En tant que** RevOps Manager
**je veux** voir le détail des problèmes détectés organisés par domaine, avec leur criticité et leur nombre
**afin de** savoir précisément quoi corriger et dans quel ordre

**Critères d'acceptance :**

*Scénario : Résumé d'un domaine*
**Étant donné** que l'audit d'un domaine est terminé
**Quand** j'accède à la section d'un domaine (ex. Workflows)
**Alors** je vois :
- Le score du domaine sur 100
- Le décompte des problèmes par criticité : 🔴 X critiques / 🟡 Y avertissements / 🔵 Z informations
- Le nombre total d'éléments analysés dans ce domaine

*Scénario : Détail d'une règle avec problèmes*
**Étant donné** qu'une règle a détecté des problèmes
**Quand** j'ouvre le détail de cette règle
**Alors** je vois :
- L'identifiant de la règle (ex. W1), son nom, sa criticité
- La liste des éléments concernés avec les colonnes pertinentes à la règle
- Un tri par défaut adapté à la règle (ex. taux d'erreur décroissant pour W1)
- Le nombre total d'éléments listés

*Scénario : Ordre d'affichage des règles*
**Étant donné** que plusieurs règles ont détecté des problèmes
**Quand** j'accède à la section d'un domaine
**Alors** les règles sont affichées dans l'ordre suivant : 🔴 Critiques en premier, puis 🟡 Avertissements, puis 🔵 Informations
**Et** au sein d'une même criticité, les règles sont classées par nombre de problèmes détectés décroissant

---

### Story 4 — Section 2 : Impact business consolidé

**En tant que** RevOps Manager ou consultant
**je veux** voir dans une section dédiée la traduction business de tous les problèmes détectés
**afin de** pouvoir partager ou présenter ces éléments à ma direction sans avoir à reformuler moi-même les enjeux

**Critères d'acceptance :**

*Scénario : Affichage des impacts business*
**Étant donné** que des problèmes ont été détectés dans au moins un domaine
**Quand** j'accède à la section "Impact business"
**Alors** je vois, pour chaque règle ayant au moins un problème détecté :
- Un titre en langage business (non technique)
- Une description de l'impact estimé
- Un niveau d'urgence business (Élevé / Moyen / Faible)
- Le nombre d'éléments concernés
**Et** les impacts sont triés par urgence décroissante (Élevé en premier)

*Scénario : Résumé exécutif en tête de section*
**Étant donné** que la section Impact business est consultée
**Quand** j'arrive en haut de la section
**Alors** je vois un résumé exécutif en 3 à 5 lignes synthétisant les problèmes les plus critiques en langage business
**Et** ce résumé est formaté pour être directement copiable dans une communication dirigeant

*Scénario : Aucun problème détecté*
**Étant donné** qu'aucune règle n'a détecté de problème sur l'ensemble des domaines
**Quand** j'accède à la section "Impact business"
**Alors** je vois un message positif confirmant l'état sain du workspace
**Et** une recommandation de fréquence de ré-audit est suggérée

---

### Story 5 — Métadonnées et transparence de l'audit

**En tant que** RevOps Manager ou consultant
**je veux** voir les informations techniques sur la façon dont l'audit a été réalisé
**afin de** pouvoir valider la fiabilité du rapport et le dater avec précision

**Critères d'acceptance :**

*Scénario : Affichage des métadonnées*
**Étant donné** que l'audit est terminé
**Quand** je consulte le rapport
**Alors** je vois dans une section dédiée (ex. footer ou section "À propos de cet audit") :
- Date et heure de l'audit (fuseau horaire UTC + local)
- Nom et identifiant du workspace HubSpot analysé
- Nombre total d'éléments analysés par domaine
- Liste des domaines inclus dans le score global
- Durée totale d'exécution de l'audit

*Scénario : Éléments non analysés*
**Étant donné** que certains éléments ont rencontré des erreurs API pendant l'audit
**Quand** je consulte le rapport
**Alors** je vois un avertissement listant les éléments non analysés et la raison (erreur API)
**Et** ces éléments sont exclus du score avec une mention explicite dans le calcul

---

## Spécifications fonctionnelles

### Calcul du score global

```
Score_global = moyenne pondérée des scores de domaine disponibles

Phase NOW (2 domaines) :
Score_global = (Score_proprietes × 0.5) + (Score_workflows × 0.5)

Si un domaine est indisponible (ex. aucun workflow) :
Score_global = Score du seul domaine disponible × 1.0
(le poids est redistribué sur les domaines analysés)

Phase NEXT (domaines supplémentaires à définir) :
Les poids seront réévalués lors de la définition des nouveaux epics.
```

### Plages de score et statut

| Plage | Statut | Couleur |
|---|---|---|
| 90 – 100 | Excellent | Vert foncé ✅ |
| 70 – 89 | Bon | Vert 🟢 |
| 50 – 69 | À améliorer | Orange 🟡 |
| 0 – 49 | Critique | Rouge 🔴 |

### Structure du rapport (deux sections)

```
RAPPORT D'AUDIT HUBSPOT
├── En-tête
│   ├── Score global /100
│   ├── Bandeau de statut (Critique / À améliorer / Bon / Excellent)
│   ├── Métadonnées (workspace, date, durée)
│   └── Navigation rapide vers les sections
│
├── SECTION 1 — Résultats de l'audit par domaine
│   ├── Domaine : Propriétés
│   │   ├── Score Propriétés /100
│   │   ├── Résumé (X critiques / Y avertissements / Z informations)
│   │   └── Détail par règle (P1 → P16, ordre criticité puis volume)
│   │       ├── 🔴 Règles critiques
│   │       ├── 🟡 Règles avertissements
│   │       └── 🔵 Règles informations
│   │
│   └── Domaine : Workflows
│       ├── Score Workflows /100
│       ├── Résumé (X critiques / Y avertissements / Z informations)
│       └── Détail par règle (W1 → W7, ordre criticité puis volume)
│
└── SECTION 2 — Impact business
    ├── Résumé exécutif (3-5 lignes, langage dirigeant)
    └── Impacts par règle (triés par urgence décroissante)
        ├── 🔴 Urgence Élevée
        ├── 🟡 Urgence Moyenne
        └── 🔵 Urgence Faible
```

### Résumé exécutif — Règles de génération

Le résumé exécutif est généré en combinant les impacts des règles 🔴 Critiques, puis complété par les 🟡 Avertissements si le nombre de critiques est < 2.

Format type du résumé exécutif :
```
L'audit de votre workspace HubSpot [NOM] révèle [N] problèmes prioritaires.

[Si critiques > 0] : [N] automatisations ou configurations critiques sont
actuellement défaillantes, avec un impact direct possible sur le traitement
des leads et des opportunités commerciales.

[Si avertissements > 0] : [N] problèmes de configuration secondaires
alourdissent la maintenabilité du CRM et peuvent affecter la qualité
des données à moyen terme.

Score de santé global : [SCORE]/100 — Statut : [STATUT].
Une intervention est recommandée [en priorité / dans les prochaines semaines /
lors de la prochaine revue de configuration].
```

### Traductions de l'urgence recommendation selon le score

| Score global | Recommandation dans le résumé exécutif |
|---|---|
| < 50 | "Une intervention immédiate est recommandée sur les points critiques." |
| 50–69 | "Des corrections sont recommandées dans les prochaines semaines." |
| 70–89 | "Des améliorations sont souhaitables lors de la prochaine revue." |
| ≥ 90 | "Votre workspace est en bonne santé. Un audit de contrôle dans 3 mois est recommandé." |

### Cas particuliers d'affichage

| Cas | Traitement |
|---|---|
| Workspace avec 0 problème détecté | Score = 100, statut Excellent, message positif dans les deux sections |
| Domaine sans élément à analyser (ex. aucun workflow) | Score du domaine non calculé, mention explicite, redistribution du poids |
| Audit avec des éléments non analysés (erreurs API) | Avertissement visible dans l'en-tête ET dans les métadonnées |
| Score global après plafonnements = 100 mais avec des problèmes info | Score = 100 possible — le statut reflète le score calculé, pas l'existence de problèmes |

---

## Critères d'acceptance de l'epic

- [ ] Le score global est calculé correctement à partir des scores de domaine avec les poids définis
- [ ] La redistribution des poids fonctionne si un domaine est absent (workspace sans workflow)
- [ ] Le bandeau de statut correspond systématiquement à la plage de score affichée
- [ ] La Section 1 affiche les règles dans l'ordre criticité puis volume décroissant
- [ ] Le mécanisme collapse/expand fonctionne sur le détail des règles
- [ ] La Section 2 est distincte visuellement de la Section 1 et accessible depuis la navigation
- [ ] Le résumé exécutif est généré automatiquement et cohérent avec les problèmes détectés
- [ ] Les métadonnées de l'audit sont complètes et visibles (date, workspace, durée, périmètre)
- [ ] Les éléments non analysés (erreurs API) sont mentionnés avec leur impact sur le score
- [ ] Le rapport s'affiche correctement sur un workspace avec 0 problème détecté

---

## Dépendances

- **EP-02** (Audit des propriétés) : fournit le Score_proprietes et la liste des problèmes P1-P16
- **EP-03** (Audit des workflows) : fournit le Score_workflows et la liste des problèmes W1-W7
- **EP-01** (Connexion HubSpot OAuth) : doit être complété — nécessite un token valide pour déclencher l'audit

---

## Questions ouvertes

| # | Question | Impact | Statut |
|---|---|---|---|
| Q1 | Faut-il afficher le rapport dans une page web dédiée (URL unique par audit) ou dans un espace connecté ? | Architecture + expérience de partage | ✅ **Décision PO :** URL unique par rapport, accessible sans connexion (comme Notion). Chaque rapport généré reçoit un UUID unique. La page de partage affiche le rapport complet en lecture seule avec une mention "Généré par HubSpot Auditor". |
| Q2 | La durée de conservation des rapports d'audit doit-elle être limitée ou indéfinie ? | Infrastructure + RGPD | ✅ **Décision PO :** Conservation indéfinie. Pas de suppression automatique prévue en v1. |
| Q3 | Le résumé exécutif doit-il être généré par un LLM ou par un template statique ? | Qualité de l'output + complexité technique | ✅ **Décision PO :** Généré par LLM. L'objectif est une analyse contextuelle et fluide, pas un texte rigide. L'équipe tech choisit le modèle et l'implémentation. |
| Q4 | Faut-il permettre à l'utilisateur de masquer certains problèmes du rapport avant de partager ? | UX avancée | ✅ **Décision PO :** NEXT phase — hors scope v1. |
