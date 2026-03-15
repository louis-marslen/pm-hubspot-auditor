# EP-06 — Audit des deals & pipelines HubSpot

## Hypothèse

Nous croyons que fournir un audit automatisé des deals (complétude, deals bloqués) et des pipelines (configuration, usage, cohérence structurelle) permettra aux Sales Managers et RevOps Managers d'identifier en moins de 5 minutes les problèmes de leur pipeline commercial — parce qu'aucun outil natif HubSpot ne fournit ce diagnostic structurel, et que le pipeline est l'objet CRM le plus directement lié au chiffre d'affaires.

Nous mesurerons le succès via : taux de workspaces avec ≥ 1 problème pipeline détecté (cible : > 70%) + durée médiane d'audit < 60s sur workspace < 10 000 deals.

---

## Périmètre

### In scope

- Migration des règles P13-P16 du domaine Propriétés vers le domaine Deals (D-01 à D-04)
- Détection de deals bloqués par stage > 60 jours (D-05 — feature phare)
- Audit de la configuration des pipelines : activité, complexité, phases sautées, points d'entrée, stages fermés redondants, stages obsolètes (D-06, D-07, D-12 à D-15)
- Qualité des données deals : owner, associations contact/company, montant à 0 (D-08 à D-11)
- Score de santé Deals avec pondération renforcée (×1.5) dans le score global
- Présentation des résultats avec regroupement par pipeline pour les règles de configuration
- Activation conditionnelle si ≥ 1 deal dans le workspace

### Out of scope

- Seuils configurables par l'utilisateur — **au backlog**
- Analyse de la vélocité de vente (temps moyen par stage) — NEXT phase
- Détection de deals en doublon — NEXT phase
- Recommandations de restructuration pipeline — NEXT phase
- Deep links vers les deals HubSpot — NEXT phase
- Export CSV des deals problématiques — NEXT phase
- Forecast prédictif — LATER

---

## User stories

### Story 1 — Vue d'ensemble de l'audit deals & pipelines

**En tant que** Sales Manager ou RevOps Manager
**je veux** voir un score de santé global de mes deals et pipelines avec un décompte des problèmes par criticité
**afin de** évaluer en un coup d'oeil la santé de mon pipeline commercial.

**Critères d'acceptance :**

*Scénario : audit avec des deals*
**Étant donné** un workspace avec au moins 1 deal
**Quand** l'audit s'exécute et se termine
**Alors** la section Deals apparaît dans la navigation intra-page avec un score de santé (0-100), un label coloré, et un décompte "X critiques · Y avertissements · Z infos"

*Scénario : workspace sans deal*
**Étant donné** un workspace avec 0 deal
**Quand** l'audit s'exécute
**Alors** l'onglet Deals n'apparaît pas dans la navigation et les métadonnées indiquent "Domaine Deals non analysé — aucun deal détecté"

*Scénario : contribution au score global*
**Étant donné** un audit terminé avec le domaine Deals actif
**Quand** le score global est calculé
**Alors** le score Deals contribue au score global avec un coefficient de 1.5 (pondération renforcée)

---

### Story 2 — Détection des deals bloqués

**En tant que** Sales Manager
**je veux** identifier tous les deals qui stagnent dans un stage depuis plus de 60 jours
**afin de** relancer les commerciaux concernés et nettoyer le pipeline des opportunités mortes.

**Critères d'acceptance :**

*Scénario : deals bloqués détectés*
**Étant donné** un workspace avec des deals open dont le stage n'a pas changé depuis > 60 jours
**Quand** l'audit s'exécute
**Alors** la règle D-05 liste ces deals regroupés par pipeline et par stage, triés par ancienneté décroissante, avec le nom du deal, le pipeline, le stage, la date d'entrée dans le stage, l'ancienneté en jours et l'owner

*Scénario : deals anciens (D-03)*
**Étant donné** un workspace avec des deals open créés il y a plus de 60 jours
**Quand** l'audit s'exécute
**Alors** la règle D-03 liste ces deals triés par ancienneté décroissante

*Scénario : pas de deal bloqué*
**Étant donné** un workspace où tous les deals open ont changé de stage dans les 60 derniers jours
**Quand** l'audit s'exécute
**Alors** la règle D-05 affiche "✅ Aucun problème détecté"

---

### Story 3 — Complétude des données deals

**En tant que** RevOps Manager
**je veux** évaluer le taux de remplissage des champs critiques de mes deals (montant, date de clôture, owner, propriétés obligatoires de stage)
**afin de** quantifier les lacunes de données et justifier un chantier de nettoyage auprès du management.

**Critères d'acceptance :**

*Scénario : taux montant insuffisant (D-01)*
**Étant donné** un workspace où < 70% des deals open ont un montant renseigné et > 0
**Quand** l'audit s'exécute
**Alors** la règle D-01 affiche une barre de progression rouge avec le taux mesuré, le nombre de deals sans montant et le seuil cible (70%)

*Scénario : taux date de clôture insuffisant (D-02)*
**Étant donné** un workspace où < 70% des deals open ont une date de clôture renseignée
**Quand** l'audit s'exécute
**Alors** la règle D-02 affiche une barre de progression rouge avec le taux mesuré et le seuil cible (70%)

*Scénario : propriétés obligatoires manquantes (D-04)*
**Étant donné** un workspace avec des stages ayant des propriétés obligatoires définies ET des deals open dans ces stages avec des propriétés manquantes
**Quand** l'audit s'exécute
**Alors** la règle D-04 affiche les résultats regroupés par pipeline > stage, avec pour chaque groupe le nombre de deals et la liste des propriétés manquantes

*Scénario : deals avec montant à 0 (D-11)*
**Étant donné** un workspace avec des deals open ayant `amount` = 0
**Quand** l'audit s'exécute
**Alors** la règle D-11 les liste séparément de D-01 (absence de montant), avec explication de la distinction

*Scénario : deals sans owner (D-08)*
**Étant donné** un workspace avec des deals open sans `hubspot_owner_id`
**Quand** l'audit s'exécute
**Alors** la règle D-08 affiche la liste paginée des deals concernés

*Scénario : deals sans contact (D-09)*
**Étant donné** un workspace avec des deals open sans contact associé
**Quand** l'audit s'exécute
**Alors** la règle D-09 affiche la liste paginée triée par montant décroissant

*Scénario : deals sans company (D-10) — workspace B2B*
**Étant donné** un workspace avec ≥ 1 company ET des deals open sans company associée
**Quand** l'audit s'exécute
**Alors** la règle D-10 affiche la liste paginée des deals concernés

*Scénario : deals sans company (D-10) — workspace sans company*
**Étant donné** un workspace avec 0 company
**Quand** l'audit s'exécute
**Alors** la règle D-10 affiche "Non applicable — aucune company détectée dans ce workspace"

---

### Story 4 — Audit de la configuration des pipelines

**En tant que** RevOps Manager
**je veux** diagnostiquer la santé structurelle de mes pipelines (activité, complexité, cohérence des stages, respect du process)
**afin de** identifier les pipelines à restructurer ou supprimer et quantifier le non-respect du process de vente.

**Critères d'acceptance :**

*Scénario : pipeline sans activité (D-06)*
**Étant donné** un workspace avec un pipeline sans deal open ET sans deal créé dans les 90 derniers jours
**Quand** l'audit s'exécute
**Alors** la règle D-06 affiche ce pipeline avec le nombre total de deals, la date du dernier deal créé et le nombre de stages

*Scénario : pipeline trop complexe (D-07)*
**Étant donné** un workspace avec un pipeline ayant plus de 8 stages actifs (hors closedwon/closedlost)
**Quand** l'audit s'exécute
**Alors** la règle D-07 affiche ce pipeline avec le nombre de stages et la liste des stages

*Scénario : phases sautées (D-12)*
**Étant donné** un workspace où > 20% des deals d'un pipeline ont sauté au moins 1 stage
**Quand** l'audit s'exécute
**Alors** la règle D-12 affiche le taux de phases sautées, le nombre de deals concernés et le top 3 des stages les plus sautés

*Scénario : points d'entrée multiples (D-13)*
**Étant donné** un workspace où > 20% des deals d'un pipeline ont été créés dans un stage autre que le premier
**Quand** l'audit s'exécute
**Alors** la règle D-13 affiche le taux d'entrées non standard et la répartition des stages de création

*Scénario : stages fermés redondants (D-14)*
**Étant donné** un workspace avec un pipeline ayant plus de 1 stage Closed Won OU plus de 1 stage Closed Lost
**Quand** l'audit s'exécute
**Alors** la règle D-14 affiche les stages fermés avec leur type, nom et nombre de deals

*Scénario : stages obsolètes (D-15)*
**Étant donné** un workspace avec un stage actif sans deal open ET sans deal passé dans les 90 derniers jours
**Quand** l'audit s'exécute
**Alors** la règle D-15 affiche ce stage avec son pipeline, sa position et la date du dernier passage

---

### Story 5 — Impact business par catégorie de problème

**En tant que** Sales Manager ou RevOps Manager
**je veux** voir chaque problème détecté accompagné de son impact business traduit en langage non technique
**afin de** pouvoir partager le rapport directement à mon CEO ou directeur commercial avec des arguments business.

**Critères d'acceptance :**

*Scénario : impact business affiché*
**Étant donné** un audit terminé avec au moins 1 règle déclenchée
**Quand** l'utilisateur consulte les résultats deals
**Alors** chaque règle déclenchée affiche un encart "Impact business" avec titre, estimation d'impact et niveau d'urgence selon la table 6.8 du PRD

*Scénario : section impact regroupée*
**Étant donné** un audit terminé avec des règles déclenchées dans plusieurs catégories
**Quand** l'utilisateur scrolle jusqu'au bloc Impact business
**Alors** les impacts sont regroupés par thème (Forecasting, Pipeline CA, Process commercial, Configuration pipeline, Qualité données)

---

## Spécifications fonctionnelles

### Règles de détection complètes

#### Règles migrées depuis EP-02 (ex-P13 à P16)

| ID | Règle | Condition | Criticité | Ex- |
|---|---|---|---|---|
| D-01 | Taux montant insuffisant (deals open) | (deals open avec amount > 0) / total deals open < 70% | 🔴 Critique | P13 |
| D-02 | Taux date de clôture insuffisant (deals open) | (deals open avec closedate) / total deals open < 70% | 🔴 Critique | P14 |
| D-03 | Deal open ancien (60j+) | Deal open avec createdate > 60 jours | 🟡 Avertissement | P15 |
| D-04 | Propriétés obligatoires de stage manquantes | Deal open avec ≥ 1 propriété obligatoire de stage null/vide | 🔴 Critique | P16 |

> **Note migration :** Ces règles sont déplacées du domaine Propriétés vers Deals. Les IDs P13-P16 sont retirés de EP-02.

#### Nouvelle règle — Deals bloqués (feature phare)

| ID | Règle | Condition | Criticité |
|---|---|---|---|
| D-05 | Deal bloqué dans un stage | Deal open dont le stage n'a pas changé depuis > 60 jours | 🟡 Avertissement |

#### Nouvelles règles — Configuration pipeline

| ID | Règle | Condition | Criticité |
|---|---|---|---|
| D-06 | Pipeline sans activité récente | 0 deal open ET 0 deal créé dans les 90 derniers jours | 🔵 Info |
| D-07 | Pipeline avec trop de stages | > 8 stages actifs (hors closed) | 🔵 Info |
| D-12 | Phases sautées | > 20% des deals du pipeline ont sauté ≥ 1 stage | 🟡 Avertissement |
| D-13 | Points d'entrée multiples | > 20% des deals créés hors premier stage | 🟡 Avertissement |
| D-14 | Stages fermés redondants | > 1 stage Closed Won OU > 1 stage Closed Lost | 🟡 Avertissement |
| D-15 | Stage sans activité 90j | Stage actif avec 0 deal open + 0 passage en 90j | 🔵 Info |

#### Nouvelles règles — Qualité données deals

| ID | Règle | Condition | Criticité |
|---|---|---|---|
| D-08 | Deal open sans owner | hubspot_owner_id null/vide | 🔵 Info |
| D-09 | Deal open sans contact associé | 0 contact associé | 🟡 Avertissement |
| D-10 | Deal open sans company associée | 0 company associée (désactivée si 0 company) | 🔵 Info |
| D-11 | Deal open avec montant à 0 | amount = 0 (distinct de null) | 🟡 Avertissement |

### Comptage des problèmes

| Règle(s) | Comptage |
|---|---|
| D-01, D-02 (taux global) | 1 problème si seuil franchi |
| D-03, D-05, D-08, D-09, D-10, D-11 (par deal) | 1 problème par deal concerné |
| D-04 (propriétés de stage) | 1 problème par deal concerné |
| D-06, D-07, D-12, D-13, D-14 (par pipeline) | 1 problème par pipeline concerné |
| D-15 (par stage) | 1 problème par stage concerné |

### Calcul du score Deals

```
Score_deals = 100
  − (nb_critiques × 5)     → plafonné à −30
  − (nb_avertissements × 2) → plafonné à −15
  − (nb_infos × 0,5)        → plafonné à −5

Score_deals = max(0, Score_deals)
```

### Impact sur le score global

```
Score_global = Σ (Score_domaine × Poids) / Σ Poids

Poids :
- Deals : 1.5 (pondération renforcée)
- Propriétés, Contacts, Companies, Workflows : 1.0 chacun

Avec 5 domaines actifs :
Score_global = (Prop×1 + Contacts×1 + Companies×1 + Deals×1.5 + Workflows×1) / 5.5

Si un domaine est inactif, son poids est retiré du dénominateur.
```

### Traductions business par règle

| Règle(s) | Titre business | Impact estimé | Urgence |
|---|---|---|---|
| D-01, D-02 | Forecasting commercial non fiable | Deals sans montant/date de clôture = prévisionnel inexploitable | Élevé |
| D-03, D-05 | CA potentiel immobilisé dans le pipeline | Deals stagnants = forecast surestimé, temps commercial perdu | Élevé |
| D-04 | Processus commercial non respecté | Propriétés obligatoires vides = process non suivi | Élevé |
| D-06, D-15 | Pipelines et stages obsolètes | Pollution de l'interface et confusion des commerciaux | Faible |
| D-07 | Pipeline trop complexe | Trop de stages = baisse d'adoption, risque de phases sautées | Moyen |
| D-08 | Deals sans responsable | Aucun commercial responsable = stagnation garantie | Moyen |
| D-09, D-10 | Deals déconnectés du contexte client | Historique commercial fragmenté, reporting account-based faussé | Moyen |
| D-11 | Deals à montant zéro | Fausse le CA pipeline, deals potentiellement non qualifiés | Moyen |
| D-12 | Process commercial contourné | > 20% des deals sautent des étapes = process inadapté | Élevé |
| D-13 | Pipeline sans point d'entrée unique | Taux de conversion par stage non fiable | Moyen |
| D-14 | Stages fermés redondants | Reporting compliqué, win rate faussé | Moyen |

---

## Critères d'acceptance de l'epic

- [ ] Les 15 règles D-01 à D-15 sont détectées et affichées correctement sur un workspace de test
- [ ] Les règles migrées (D-01 à D-04) produisent les mêmes résultats que les anciennes P13 à P16 (regression testing)
- [ ] Les règles P13 à P16 sont retirées du domaine Propriétés (EP-02)
- [ ] Les règles D-01 à D-05, D-08 à D-11 ne portent que sur les deals `open`
- [ ] D-05 utilise `hs_date_entered_*` pour détecter les deals bloqués par stage
- [ ] D-10 est désactivée si 0 company dans le workspace
- [ ] D-12 reconstitue le parcours de stage via `hs_date_entered_*`
- [ ] D-14 distingue Closed Won / Closed Lost via la probabilité du stage
- [ ] Les règles pipeline sont regroupées par pipeline dans l'affichage
- [ ] Score Deals calculé selon la formule (100 − critiques×5 − avertissements×2 − infos×0.5)
- [ ] Score global utilise la pondération renforcée Deals (×1.5)
- [ ] Chaque problème détecté affiche son impact business
- [ ] Pagination sur les listes > 20 items
- [ ] Non-destructif : aucune requête en écriture/suppression vers HubSpot
- [ ] Workspace avec 0 deal → domaine non affiché, poids redistribué

---

## Dépendances

- **EP-01** (OAuth) — token d'accès requis pour tous les appels API
- **EP-02** (Propriétés) — P13, P14, P15, P16 migrés vers EP-06
- **EP-05** (Contacts) — formule score global introduite par EP-05 ; EP-06 la modifie avec pondération
- **EP-04** (Dashboard) — consomme score et résultats Deals

---

## Questions ouvertes

| # | Question | Impact | Statut |
|---|---|---|---|
| 1 | Seuil 60j pour D-05 (deals bloqués) adapté à tous les secteurs ? | Seuil trop court pour cycles de vente longs (enterprise) | Fixé à 60j — personnalisation au backlog |
| 2 | Seuil 8 stages pour D-07 pertinent ? | Certains pipelines enterprise ont légitimement 10+ stages | À valider en beta |
| 3 | Seuil 20% pour D-12 et D-13 pertinent ? | Trop bas = faux positifs, trop haut = problèmes non détectés | À valider en beta |
| 4 | `hs_date_entered_*` disponibles sur tous les plans HubSpot ? | Si indisponibles, D-05/D-12/D-13 ne fonctionnent pas | À vérifier en pré-dev |
| 5 | Pondération renforcée Deals (×1.5) acceptée par les utilisateurs ? | Risque de biais perçu dans le score global | À réévaluer après beta |
