# PRD-06 — Audit des deals & pipelines HubSpot

**Epic associé :** EP-06
**Version :** 1.0
**Date :** 2026-03-15
**Statut :** Prêt pour développement

---

## 1. Résumé exécutif

EP-06 définit le moteur d'analyse des deals et pipelines HubSpot : détection des deals bloqués (inactivité par stage), évaluation de la complétude des données deals (montant, date de clôture, owner, associations), et audit de la configuration des pipelines (phases sautées, pipelines inutilisés, points d'entrée multiples, stages fermés redondants). L'audit applique 15 règles (D-01 à D-15), dont 4 migrées depuis l'audit Propriétés (ex-P13 à P16) et 11 nouvelles. Il calcule un score de santé "Deals" contribuant au score global avec pondération renforcée.

Les deals sont le nerf de la guerre commerciale — c'est l'objet CRM le plus directement lié au chiffre d'affaires. Cet epic couvre à la fois la qualité des données deals (complétude, cohérence) et la santé structurelle des pipelines (configuration, usage). L'audit pipeline est la feature phare : c'est un diagnostic que même les Sales Managers expérimentés ne peuvent pas faire manuellement à grande échelle.

**Décisions PO actées dans ce PRD :**
- Migration P13-P16 → D-01 à D-04 intégrée dans cet epic (pas d'epic migration séparé)
- Toutes les règles portant sur des deals individuels (D-01 à D-05, D-08 à D-11) ne concernent que les deals en statut `open` — les deals closedwon et closedlost sont exclus
- Seuil d'inactivité fixé à 60 jours (non configurable en v1 — la personnalisation des seuils est au backlog)
- Score global : le domaine Deals reçoit une pondération renforcée (coefficient 1.5) dans le calcul du score global, reflétant l'importance business du pipeline commercial
- Personas Sales Manager et RevOps Manager traités au même niveau (co-primaires)
- Vision cible : le domaine Propriétés sera à terme dissous, P13-P16 migrés ici est un pas supplémentaire

---

## 2. Problème utilisateur

### Narrative du problème

**Je suis :** Thomas, Sales Manager dans une scale-up B2B de 80 personnes avec 3 pipelines et 450 deals actifs dans HubSpot
- Mon équipe de 12 commerciaux crée des deals manuellement, souvent en sautant des étapes du pipeline parce qu'ils trouvent le process trop lourd
- Je sais que certains deals traînent depuis des mois dans le pipeline sans que personne ne les relance, mais je n'ai pas de vue consolidée
- Mon CEO me demande un forecast fiable chaque lundi, mais je sais que 30% de mes deals n'ont ni montant ni date de clôture renseignés
- J'ai 3 pipelines dont un hérité d'avant mon arrivée — je ne sais même pas s'il est encore utilisé

**J'essaie de :**
- Identifier en moins de 5 minutes tous les problèmes de mon pipeline commercial : deals bloqués, données manquantes, configuration incohérente des pipelines

**Mais :**
- HubSpot ne fournit pas de vue consolidée de la santé du pipeline au-delà des rapports standard (conversion par stage)
- L'analyse manuelle est impossible au-delà de quelques dizaines de deals — je devrais ouvrir chaque fiche une par une
- Je n'ai aucun moyen de détecter les incohérences structurelles des pipelines (phases sautées, points d'entrée multiples) sans analyser l'historique de chaque deal

**Parce que :**
- Aucun outil natif HubSpot ne combine audit des données deals ET diagnostic de configuration des pipelines

**Ce qui me fait ressentir :**
- Anxieux chaque lundi quand je dois présenter un forecast que je sais incomplet
- Frustré de découvrir en réunion qu'un deal "prioritaire" est inactif depuis 2 mois
- Impuissant face à des pipelines mal configurés dont je n'arrive pas à mesurer l'impact

### Énoncé du problème

Les Sales Managers et RevOps Managers ont besoin d'un moyen d'évaluer automatiquement la santé de leurs deals et la qualité de configuration de leurs pipelines HubSpot parce que les outils natifs ne fournissent pas de diagnostic structurel du pipeline, ce qui les oblige à des analyses manuelles impossibles à grande échelle et produit des forecasts non fiables.

### Contexte

Dans un workspace HubSpot, les deals sont l'objet le plus directement lié au chiffre d'affaires. La qualité des données deals (montant, date de clôture, propriétaire) conditionne la fiabilité du forecast commercial. Mais au-delà des données, c'est la configuration des pipelines elle-même qui peut être problématique : des stages mal définis, des propriétés obligatoires non configurées, des phases systématiquement sautées par les commerciaux, ou des pipelines entiers tombés en désuétude. Ces problèmes structurels sont invisibles dans les rapports HubSpot standard et nécessitent une analyse transversale que seul un audit automatisé peut fournir.

### Problèmes spécifiques adressés

1. **Deals bloqués invisibles** : des deals restent dans le même stage pendant des semaines/mois sans activité, faussant le forecast et immobilisant du CA déclaré qui ne se concrétisera pas
2. **Données deals incomplètes** : des deals sans montant, sans date de clôture ou sans propriétaire rendent le prévisionnel inexploitable
3. **Pipelines mal configurés** : des phases sautées, des points d'entrée multiples ou des stages fermés redondants indiquent un process commercial mal défini ou non suivi
4. **Pipelines obsolètes** : des pipelines sans activité récente encombrent l'interface et créent de la confusion
5. **Associations manquantes** : des deals sans contact ou sans company associés fragmentent l'historique commercial

---

## 2bis. Personas & Jobs-to-be-Done

### Thomas Sales Manager *(persona co-primaire)*

**Jobs fonctionnels :**
- Identifier en moins de 5 minutes tous les deals bloqués dans ses pipelines pour relancer les commerciaux concernés
- Vérifier que les données deals sont suffisamment complètes pour produire un forecast fiable
- Diagnostiquer la configuration de ses pipelines pour identifier les stages inutiles ou mal utilisés

**Jobs sociaux :**
- Présenter un forecast crédible à son CEO chaque lundi
- Montrer à son équipe qu'il a une visibilité claire sur le pipeline

**Jobs émotionnels :**
- Se sentir en contrôle de son pipeline commercial
- Ne plus être surpris par un deal "oublié" en réunion de direction

**Douleurs clés :**
- Aucune vue consolidée des deals bloqués par stage et par ancienneté
- Impossibilité de diagnostiquer la configuration des pipelines sans analyser l'historique deal par deal

---

### Sophie RevOps Manager *(persona co-primaire)*

**Jobs fonctionnels :**
- Évaluer la santé structurelle des pipelines (configuration, usage, cohérence)
- Détecter les pipelines obsolètes et les stages mal définis
- Quantifier les problèmes de qualité des données deals pour justifier un chantier de nettoyage

**Jobs sociaux :**
- Fournir au Sales Manager un diagnostic objectif de son pipeline
- Justifier auprès de la direction la nécessité de restructurer les pipelines

**Jobs émotionnels :**
- Se sentir en confiance sur la fiabilité des données commerciales
- Ne plus être mise en défaut quand les rapports de direction sont incohérents

**Douleurs clés :**
- Les pipelines sont un "angle mort" de la gouvernance CRM — personne ne les audite
- Aucun outil pour quantifier l'impact des problèmes de configuration pipeline

---

### Louis Consultant *(persona secondaire)*

**Jobs fonctionnels :**
- Diagnostiquer la santé du pipeline commercial d'un client en kick-off de mission
- Produire un rapport de diagnostic pipeline directement présentable au directeur commercial

**Douleurs clés :**
- L'analyse manuelle des pipelines prend 1-2 jours par client
- Pas de rapport structuré à livrer sans travail manuel

---

## 2ter. Contexte stratégique

**Lien avec la vision produit :** l'audit deals & pipelines est le troisième pilier de valeur du produit après les propriétés et les contacts. C'est le domaine le plus directement lié au chiffre d'affaires et le plus parlant pour les décideurs C-level. Un audit qui couvre les deals renforce considérablement la proposition de valeur du produit.

**Pourquoi maintenant :** EP-06 est le prochain epic de couverture d'audit Phase 2, après EP-05 (contacts) et EP-05b (companies). Les deals complètent la couverture des 3 objets CRM fondamentaux (contacts, companies, deals). Sans les deals, le produit ne couvre pas le domaine le plus critique pour les Sales Managers.

**Indicateur différenciant :** l'audit structurel des pipelines (phases sautées, points d'entrée multiples, stages fermés redondants) est une fonctionnalité qu'aucun outil natif HubSpot ni concurrent abordable ne propose. C'est un diagnostic que même un consultant expérimenté met plusieurs heures à produire manuellement.

---

## 2quart. Vue d'ensemble de la solution

Nous construisons un moteur d'analyse qui appelle l'API HubSpot via le token OAuth (EP-01), détecte 15 règles de qualité et de configuration sur les deals et pipelines, calcule un score de santé Deals, et présente chaque problème avec son impact business traduit en langage dirigeant.

**Comment ça fonctionne :**
1. Récupération de tous les deals du workspace via l'API HubSpot (avec les propriétés nécessaires)
2. Récupération de la configuration des pipelines et de leurs stages
3. Récupération de l'historique des changements de stage des deals (pour détecter les phases sautées)
4. Application des règles de complétude et qualité données deals (D-01 à D-05, D-08 à D-11)
5. Application des règles d'audit configuration pipeline (D-06, D-07, D-12 à D-15)
6. Calcul du score de santé Deals
7. Présentation des résultats avec impact business par catégorie

**Features clés :** détection deals bloqués par stage (D-05), audit structurel des pipelines (D-06, D-07, D-12 à D-15), complétude données migrée et étendue (D-01 à D-04, D-08 à D-11), score de santé pondéré, traductions business.

**Considérations UX :**
- **Parcours utilisateur :** l'audit deals s'exécute dans le flux d'audit global (Dashboard → Lancer audit → Résultats). Les résultats deals apparaissent comme un onglet "Deals" dans la navigation intra-page sticky, entre "Contacts" et "Companies". Le badge de l'onglet affiche le nombre total de problèmes deals.
- **États clés :**
  - *Empty state / domaine inactif* : si 0 deal dans le workspace, l'onglet Deals n'apparaît pas dans la navigation. Mention dans les métadonnées : "Domaine Deals non analysé — aucun deal détecté".
  - *Loading* : l'étape "Analyse des deals & pipelines" apparaît dans la progression étape par étape (cf. screens-and-flows section 5.5).
  - *Succès* : la section Deals affiche le score circle + décompte par criticité dans le header de section.
  - *Erreur* : alert rouge dans la section si l'API deals échoue.
- **Composants UI existants à réutiliser :** `ScoreCircle` (header de section), `SeverityBadge` (criticité des règles), `RuleCard` (affichage des règles avec accordion), `ProgressBar` (règles de taux D-01, D-02), `PaginatedList` (listes > 20 items), `Badge` (compteurs dans la navigation), `EmptyState` (workspace sans deal).
- **Nouveau pattern UI — Audit pipeline :** les règles pipeline (D-06, D-07, D-12 à D-15) introduisent un affichage regroupé par pipeline. Chaque pipeline est un bloc contenant les problèmes détectés sur ses stages. Ce pattern est similaire au regroupement par objet dans EP-02 (propriétés). À implémenter dans le composant `RuleCard` existant avec un niveau de groupement "pipeline".

---

## 3. Objectifs & métriques de succès

### Objectifs

| Objectif | Description |
|---|---|
| O1 — Détection des deals bloqués | Identifier automatiquement les deals sans activité depuis > 60 jours par stage, pipeline et propriétaire |
| O2 — Complétude données deals | Évaluer le taux de remplissage des champs critiques (montant, date de clôture, owner, associations) |
| O3 — Diagnostic configuration pipelines | Détecter les problèmes structurels des pipelines (phases sautées, points d'entrée multiples, stages fermés redondants, pipelines obsolètes) |
| O4 — Actionabilité | Chaque problème détecté est accompagné d'un impact business et d'un niveau d'urgence |

### KPIs

| KPI | Cible | Méthode de mesure |
|---|---|---|
| Taux de workspaces avec au moins 1 problème pipeline détecté | > 70% | Analytics sur les audits exécutés |
| Durée médiane de l'audit deals & pipelines | < 60 secondes sur workspace < 10 000 deals | Monitoring temps d'exécution |
| Taux de faux positifs signalés | < 5% | Retours utilisateurs en beta |
| Taux de partage du rapport dans les 7 jours | > 35% (augmentation vs baseline post-EP-05) | Tracking événement `report_shared` |

### Métriques garde-fous
- Aucune écriture ou modification dans HubSpot (non-destructif absolu)
- La migration P13-P16 → D-01-D-04 ne change pas les résultats de détection (regression testing)
- Les règles sur deals individuels (D-01 à D-05, D-08 à D-11) ne portent que sur les deals `open`

---

## 4. Périmètre

### In scope

- Migration des règles P13-P16 vers le domaine Deals (renumérotées D-01 à D-04)
- 1 nouvelle règle de détection de deals bloqués par stage (D-05) — feature phare
- 4 nouvelles règles de qualité données deals (D-08 à D-11)
- 6 nouvelles règles d'audit configuration pipeline (D-06, D-07, D-12 à D-15)
- Analyse de l'historique des changements de stage (pour D-12 phases sautées)
- Calcul du score de santé Deals avec pondération renforcée dans le score global
- Activation conditionnelle : domaine actif si ≥ 1 deal
- Présentation des résultats regroupés par pipeline pour les règles de configuration
- Pagination des listes de résultats au-delà de 20 items

### Out of scope (phase NOW)

- Seuils configurables par l'utilisateur (inactivité, taux de remplissage) — au backlog
- Analyse de la vélocité de vente (temps moyen par stage avec benchmarks) — NEXT phase
- Détection de deals en doublon (même contact + même montant + même date) — NEXT phase
- Recommandations de restructuration de pipeline — NEXT phase
- Deep links vers les deals HubSpot depuis le rapport — NEXT phase
- Export CSV des deals problématiques — NEXT phase
- Forecast prédictif basé sur les patterns détectés — LATER
- Analyse des activités (calls, emails, meetings) associées aux deals — LATER

---

## 5. User stories associées

| ID | Titre | Priorité |
|---|---|---|
| EP-06-S1 | Vue d'ensemble de l'audit deals & pipelines | Must have |
| EP-06-S2 | Détection des deals bloqués | Must have |
| EP-06-S3 | Complétude des données deals | Must have |
| EP-06-S4 | Audit de la configuration des pipelines | Must have |
| EP-06-S5 | Impact business par catégorie de problème | Must have |

Les stories complètes avec leurs critères d'acceptance Given/When/Then sont définies dans le fichier `/epics/ep06-audit-deals.md`.

---

## 6. Spécifications fonctionnelles

### 6.1 Condition d'activation du domaine Deals

Le domaine Deals est activé si le workspace contient au moins 1 deal (tous statuts confondus). Si 0 deal :
- Le domaine n'apparaît pas dans le rapport
- Son poids est redistribué sur les domaines actifs dans le calcul du score global
- Une mention dans les métadonnées de l'audit indique : "Domaine Deals non analysé — aucun deal détecté"

### 6.2 Règles migrées depuis EP-02 (D-01 à D-04)

Ces règles sont identiques aux anciennes P13 à P16 dans leur logique de détection. Seuls les IDs changent.

#### D-01 — Taux montant insuffisant sur deals open (Critique 🔴)

**Condition :** (nombre de deals `open` avec `amount` non-null et > 0) / (nombre total de deals en statut `open`) < 70%

**Périmètre :** deals en statut `open` uniquement (exclure les deals `closedwon` et `closedlost`).

**Affichage :** taux mesuré en % + nombre de deals open sans montant + barre de progression colorée (rouge si sous seuil, verte sinon) + seuil cible affiché (70%).

**Impact business associé :** voir table section 6.7.

#### D-02 — Taux date de clôture insuffisant sur deals open (Critique 🔴)

**Condition :** (nombre de deals `open` avec `closedate` non-null) / (nombre total de deals en statut `open`) < 70%

**Périmètre :** deals en statut `open` uniquement.

**Affichage :** taux mesuré en % + nombre de deals open sans date de clôture + barre de progression colorée + seuil cible affiché (70%).

#### D-03 — Deal open ancien sans avancement (Avertissement 🟡)

**Condition :** deal en statut `open` ET `createdate` > 60 jours par rapport à la date d'exécution de l'audit

**Affichage :** nombre total de deals concernés + liste paginée des deals avec : nom du deal, pipeline, stage actuel, date de création, ancienneté en jours. Triée par ancienneté décroissante (les plus anciens en premier).

#### D-04 — Propriétés obligatoires de stage non renseignées (Critique 🔴)

**Condition :** deal en statut `open` dont au moins une propriété déclarée comme obligatoire pour son stage de pipeline actuel est null ou vide.

**Logique de détection :**
1. Récupérer la configuration des pipelines du workspace via l'API (stages avec leurs propriétés obligatoires)
2. Pour chaque deal en statut `open`, récupérer son `pipeline`, son `dealstage` actuel, et les valeurs des propriétés obligatoires définies pour ce stage
3. Signaler le deal si au moins une propriété obligatoire est manquante

**Affichage :** résultats regroupés par pipeline et par stage. Pour chaque groupe : nombre de deals concernés, liste des propriétés obligatoires manquantes. Deals triés par ancienneté dans le stage (les plus anciens en premier).

---

### 6.3 Nouvelle règle — Deals bloqués (D-05, feature phare)

#### D-05 — Deal bloqué dans un stage (Avertissement 🟡)

**Condition :** deal en statut `open` dont le `dealstage` n'a pas changé depuis plus de 60 jours (basé sur la date du dernier changement de stage).

**Logique de détection :**
```
1. Pour chaque deal en statut `open` :
   a. Récupérer la date du dernier changement de stage via :
      - Propriété `hs_date_entered_{stage_id}` (date d'entrée dans le stage actuel)
      - OU à défaut, `lastmodifieddate` comme proxy
   b. Si (date_audit - date_entrée_stage) > 60 jours → deal bloqué
2. Exclure les deals dont le stage actuel est le premier stage du pipeline
   ET createdate < 60 jours (grâce period pour les nouveaux deals)
```

**Différence avec D-03 :** D-03 détecte les deals anciens (créés il y a > 60j), D-05 détecte les deals stagnants dans un stage spécifique (quel que soit leur âge de création). Un deal créé il y a 30 jours mais qui n'a pas bougé de stage pendant 60 jours sera détecté par D-05 mais pas par D-03.

**Affichage :** résultats regroupés par pipeline, puis par stage. Pour chaque deal : nom du deal, pipeline, stage actuel, date d'entrée dans le stage, ancienneté dans le stage en jours, owner. Triés par ancienneté dans le stage décroissante.

---

### 6.4 Nouvelles règles — Audit configuration pipeline (D-06, D-07, D-12 à D-15)

#### D-06 — Pipeline sans activité récente (Info 🔵)

**Condition :** pipeline avec 0 deal en statut `open` ET 0 deal créé dans les 90 derniers jours (tous statuts confondus).

**Affichage :** liste des pipelines concernés avec : nom du pipeline, nombre total de deals (tous statuts), date du dernier deal créé, nombre de stages configurés. Triée par date du dernier deal créé ascendante.

#### D-07 — Pipeline avec trop de stages (Info 🔵)

**Condition :** pipeline avec plus de 8 stages (hors stages fermés closedwon/closedlost).

**Seuil :** > 8 stages actifs. Au-delà, la complexité du pipeline dégrade l'adoption par les commerciaux et augmente le risque de phases sautées.

**Affichage :** pour chaque pipeline concerné : nom du pipeline, nombre de stages actifs, liste des stages avec leur nom et le nombre de deals open dans chaque stage.

#### D-12 — Phases sautées dans un pipeline (Avertissement 🟡)

**Condition :** au moins 20% des deals (closedwon + closedlost + open ayant changé de stage au moins une fois) d'un pipeline ont sauté au moins 1 stage intermédiaire dans leur parcours.

**Logique de détection :**
```
1. Pour chaque pipeline, récupérer l'ordre séquentiel des stages
2. Pour chaque deal du pipeline (ayant un historique de changement de stage) :
   a. Reconstituer le parcours de stages du deal via les propriétés
      `hs_date_entered_{stage_id}` (les stages avec une date sont ceux traversés)
   b. Comparer le parcours réel à l'ordre séquentiel des stages
   c. Si le deal a sauté au moins 1 stage intermédiaire → deal avec phase sautée
3. Calculer le taux de deals avec phases sautées par pipeline
4. Si taux > 20% → déclencher la règle
```

**Affichage :** résultats par pipeline. Pour chaque pipeline concerné : nom, taux de phases sautées (%), nombre de deals concernés, top 3 des stages les plus fréquemment sautés (nom du stage + nombre de fois sauté). Barre de progression inversée (rouge si taux élevé).

#### D-13 — Points d'entrée multiples dans un pipeline (Avertissement 🟡)

**Condition :** au moins 20% des deals d'un pipeline ont été créés dans un stage autre que le premier stage du pipeline.

**Logique de détection :**
```
1. Pour chaque pipeline, identifier le premier stage (displayOrder le plus bas)
2. Pour chaque deal du pipeline :
   a. Identifier le stage de création du deal (premier stage traversé chronologiquement
      via `hs_date_entered_{stage_id}`)
   b. Si le stage de création ≠ premier stage du pipeline → entrée non standard
3. Calculer le taux d'entrées non standard par pipeline
4. Si taux > 20% → déclencher la règle
```

**Affichage :** résultats par pipeline. Pour chaque pipeline concerné : nom, taux d'entrées non standard (%), répartition des stages de création (stage → nombre de deals créés dans ce stage). Visualisation sous forme de tableau.

#### D-14 — Stages fermés redondants dans un pipeline (Avertissement 🟡)

**Condition :** pipeline avec plus de 1 stage de type "Closed Won" OU plus de 1 stage de type "Closed Lost".

**Logique de détection :**
```
1. Pour chaque pipeline, récupérer les stages
2. Compter les stages dont le metadata/type indique "closedwon" et ceux "closedlost"
   (via la propriété `metadata.isClosed` et la probabilité 1.0 pour won, 0.0 pour lost)
3. Si count(closedwon) > 1 OU count(closedlost) > 1 → déclencher la règle
```

**Affichage :** pour chaque pipeline concerné : nom du pipeline, liste des stages fermés avec leur type (Won/Lost), leur nom, et le nombre de deals dans chaque stage. Explication : "Avoir plusieurs stages 'Closed Won' ou 'Closed Lost' complique le reporting et le calcul du taux de conversion."

#### D-15 — Stage avec 0 deal depuis 90 jours (Info 🔵)

**Condition :** stage actif (non fermé) d'un pipeline avec 0 deal open ET 0 deal ayant traversé ce stage dans les 90 derniers jours.

**Logique de détection :**
```
1. Pour chaque stage actif de chaque pipeline :
   a. Compter les deals open dans ce stage
   b. Compter les deals avec `hs_date_entered_{stage_id}` dans les 90 derniers jours
   c. Si les deux compteurs sont à 0 → stage potentiellement obsolète
2. Exclure les pipelines déjà détectés par D-06 (pipeline entier sans activité)
```

**Affichage :** résultats par pipeline. Pour chaque stage concerné : nom du pipeline, nom du stage, position dans le pipeline, dernier deal passé par ce stage (date).

---

### 6.5 Nouvelles règles — Qualité données deals (D-08 à D-11)

#### D-08 — Deal open sans propriétaire (Info 🔵)

**Condition :** deal en statut `open` avec `hubspot_owner_id` null ou vide

**Affichage :** nombre total de deals concernés + liste paginée : nom du deal, pipeline, stage, date de création. Triée par date de création ascendante.

#### D-09 — Deal open sans contact associé (Avertissement 🟡)

**Condition :** deal en statut `open` avec 0 contact associé

**Affichage :** nombre total de deals concernés + liste paginée : nom du deal, pipeline, stage, owner, date de création. Triée par montant décroissant (les plus gros deals orphelins en premier — `amount` null en dernier).

#### D-10 — Deal open sans company associée (Info 🔵)

**Condition :** deal en statut `open` avec 0 company associée

**Désactivation automatique :** règle désactivée si le workspace contient 0 company au total. Le rapport indique alors : "Règle D-10 non applicable — aucune company détectée dans ce workspace."

**Affichage :** nombre total de deals concernés + liste paginée : nom du deal, pipeline, stage, contact(s) associé(s), date de création. Triée par date de création ascendante.

#### D-11 — Deal open avec montant à 0 (Avertissement 🟡)

**Condition :** deal en statut `open` avec `amount` = 0 (exactement zéro, pas null — null est couvert par D-01)

**Affichage :** nombre total de deals concernés + liste paginée : nom du deal, pipeline, stage, owner, date de création. Triée par date de création ascendante.

**Note :** distinct de D-01 (taux global sans montant). D-01 détecte l'absence de montant (null), D-11 détecte un montant explicitement à 0 qui peut indiquer une erreur de saisie ou un deal non qualifié.

---

### 6.6 Comptage des problèmes pour le scoring

| Type de règle | Comptage |
|---|---|
| Règles taux global (D-01, D-02) | 1 problème unique si seuil franchi |
| Règle comptage deals (D-03, D-05) | 1 problème par deal concerné |
| Règle stage properties (D-04) | 1 problème par deal concerné |
| Règles pipeline config (D-06, D-07, D-12, D-13, D-14, D-15) | 1 problème par pipeline (ou par stage pour D-15) concerné |
| Règles qualité unitaires (D-08, D-09, D-10, D-11) | 1 problème par deal concerné |

---

### 6.7 Calcul du score de santé Deals

**Formule :**

```
Score_deals = 100
  − (nb_critiques × 5)     → plafonné à −30
  − (nb_avertissements × 2) → plafonné à −15
  − (nb_infos × 0,5)        → plafonné à −5

Score_deals = max(0, Score_deals)
```

**Niveaux de lecture du score :**

| Score | Label | Couleur |
|---|---|---|
| 0 – 49 | Critique | Rouge 🔴 |
| 50 – 69 | À améliorer | Orange 🟡 |
| 70 – 89 | Bon | Vert 🟢 |
| 90 – 100 | Excellent | Vert foncé ✅ |

**Contribution au score global — pondération renforcée :**

```
Score_global = moyenne pondérée des domaines actifs

Poids par domaine :
- Deals : coefficient 1.5 (pondération renforcée)
- Tous les autres domaines : coefficient 1.0

Formule :
Score_global = Σ (Score_domaine × Poids_domaine) / Σ (Poids_domaine)

Exemple avec EP-06 (5 domaines, tous actifs) :
Score_global = (Score_proprietes×1 + Score_contacts×1 + Score_companies×1 + Score_deals×1.5 + Score_workflows×1) / (1+1+1+1.5+1)
             = (Score_proprietes + Score_contacts + Score_companies + Score_deals×1.5 + Score_workflows) / 5.5

Si un domaine est inactif, son poids est retiré du dénominateur.
```

---

### 6.8 Traductions business par règle

| Règle(s) | Titre business | Estimation d'impact | Urgence |
|---|---|---|---|
| D-01, D-02 | Forecasting commercial non fiable | Des deals sans montant ni date de clôture rendent le prévisionnel des ventes inexploitable. La direction prend des décisions de recrutement et d'investissement sur des données incomplètes. | Élevé |
| D-03, D-05 | CA potentiel immobilisé dans le pipeline | Des deals ouverts depuis plus de 60 jours ou bloqués dans un stage représentent un CA déclaré dans le pipeline qui ne se concrétisera probablement pas — le forecasting est surestimé et les commerciaux perdent du temps sur des opportunités mortes. | Élevé |
| D-04 | Processus commercial non respecté | Des propriétés obligatoires vides dans un stage indiquent que le processus de vente défini n'est pas suivi. Les managers n'ont pas la visibilité nécessaire pour coacher leurs équipes. | Élevé |
| D-06, D-15 | Pipelines et stages obsolètes | Des pipelines sans activité et des stages jamais utilisés encombrent l'interface, créent de la confusion pour les commerciaux et faussent les rapports de conversion par stage. | Faible |
| D-07 | Pipeline trop complexe | Un pipeline avec plus de 8 stages décourage les commerciaux de suivre le process et augmente le risque de saisie incohérente. La simplicité du pipeline corrèle avec l'adoption. | Moyen |
| D-08 | Deals sans responsable identifié | Des deals sans propriétaire ne sont suivis par personne. Aucun commercial n'est responsable de leur avancement, ce qui garantit leur stagnation. | Moyen |
| D-09, D-10 | Deals déconnectés du contexte client | Des deals sans contact ou company associés fragmentent l'historique commercial. Impossible de calculer le CA par client, de vérifier les interactions passées ou de construire un reporting account-based fiable. | Moyen |
| D-11 | Deals à montant zéro dans le pipeline | Des deals avec un montant explicitement à 0€ faussent le CA pipeline et peuvent indiquer des deals non qualifiés qui devraient être en Closed Lost. | Moyen |
| D-12 | Process commercial contourné | Plus de 20% des deals sautent des étapes du pipeline, ce qui signifie que le process de vente n'est pas adapté à la réalité du terrain ou que les commerciaux ne voient pas la valeur des stages intermédiaires. | Élevé |
| D-13 | Pipeline sans point d'entrée unique | Les deals sont créés dans différents stages au lieu d'un point d'entrée unique, ce qui rend impossible le calcul fiable du taux de conversion par stage et fausse l'analyse de la vélocité de vente. | Moyen |
| D-14 | Stages fermés redondants | Plusieurs stages Closed Won ou Closed Lost dans un même pipeline compliquent le reporting, créent de la confusion chez les commerciaux et empêchent un calcul propre du win rate. | Moyen |

---

### 6.9 Présentation des résultats dans le rapport

#### Structure de la section Deals dans le rapport

1. **En-tête de domaine** : score de santé Deals (sur 100) avec label coloré + décompte synthétique (X critiques / Y avertissements / Z infos)
2. **Résumé** : nombre total de deals analysés (open), nombre de pipelines, nombre de stages
3. **Bloc Complétude données** : regroupé par règle (D-01, D-02, D-03, D-04, D-11), chaque règle avec son résultat. Barres de progression pour D-01, D-02
4. **Bloc Deals bloqués** : règle D-05 avec résultats regroupés par pipeline et stage, compteur de deals bloqués par stage
5. **Bloc Qualité associations** : regroupé par règle (D-08, D-09, D-10), listes paginées
6. **Bloc Santé des pipelines** : regroupé par pipeline, chaque pipeline affichant les problèmes D-06, D-07, D-12, D-13, D-14, D-15 qui le concernent
7. **Bloc Impact business** : regroupé par thème business, visible uniquement si au moins une règle est déclenchée

#### Règles d'affichage

- Si une règle ne détecte aucun problème : afficher "✅ Aucun problème détecté"
- Si une liste dépasse 20 items : pagination avec 20 items par page
- Les deals bloqués (D-05) sont regroupés par pipeline > stage > deals, triés par ancienneté décroissante
- Les règles pipeline (D-06, D-07, D-12 à D-15) sont affichées dans un bloc unique "Santé des pipelines" avec un sous-bloc par pipeline concerné
- Si le workspace n'a qu'un seul pipeline, le regroupement par pipeline est masqué (affichage direct des problèmes)

---

### 6.10 Appels API HubSpot nécessaires

| Information récupérée | Endpoint HubSpot | Usage |
|---|---|---|
| Liste des deals avec propriétés | `POST /crm/v3/objects/deals/search` | Toutes les règles |
| Propriétés récupérées par deal | `dealname`, `amount`, `closedate`, `dealstage`, `pipeline`, `hubspot_owner_id`, `createdate`, `lastmodifieddate`, `hs_date_entered_*` | D-01 à D-15 |
| Configuration des pipelines | `GET /crm/v3/pipelines/deals` | D-04, D-06, D-07, D-12, D-13, D-14, D-15 |
| Stages de chaque pipeline | `GET /crm/v3/pipelines/deals/{pipelineId}/stages` | D-04, D-07, D-12, D-13, D-14, D-15 |
| Associations deal → contacts | `GET /crm/v4/objects/deals/{id}/associations/contacts` ou batch | D-09 |
| Associations deal → companies | `GET /crm/v4/objects/deals/{id}/associations/companies` ou batch | D-10 |
| Nombre total de companies | `GET /crm/v3/objects/companies` avec limit=0 | D-10 (activation/désactivation) |
| Historique de changement de stage | Via propriétés `hs_date_entered_{stage_id}` sur chaque deal | D-05, D-12, D-13 |

**Note sur `hs_date_entered_*` :** HubSpot crée automatiquement une propriété `hs_date_entered_{stage_id}` pour chaque stage de chaque pipeline. Ces propriétés enregistrent la date à laquelle un deal est entré dans un stage donné. Elles sont essentielles pour reconstituer le parcours d'un deal dans le pipeline sans recourir à l'API d'historique des changements (plus coûteuse en appels).

**Gestion du rate limiting :** voir EP-01 section 6.6 pour la politique de retry avec backoff exponentiel. Les propriétés `hs_date_entered_*` doivent être récupérées en batch pour limiter le nombre d'appels.

**Objectif de performance :** le temps total d'exécution de l'audit deals & pipelines doit être inférieur à 60 secondes pour un workspace contenant moins de 10 000 deals.

---

## 7. Dépendances & risques

### Dépendances

| Dépendance | Nature | Impact si bloquant |
|---|---|---|
| **EP-01 — Connexion HubSpot OAuth** | Prérequis : token d'accès valide avec les scopes nécessaires | Bloquant — aucun appel API possible sans token |
| **EP-02 — Audit des propriétés** | Migration : les règles P13-P16 sont retirées de EP-02 et migrées vers EP-06 | L'implémentation EP-06 doit retirer P13-P16 de EP-02 simultanément |
| **EP-05 — Audit des contacts** | Prérequis : la formule du score global à pondération égale est introduite par EP-05 ; EP-06 la modifie (pondération renforcée Deals) | EP-05 doit être livré avant EP-06 |
| **EP-04 — Tableau de bord** | Consomme le score Deals et les résultats | Mise à jour du calcul du score global (5 domaines, pondération renforcée) |

### Risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| R1 — Propriétés `hs_date_entered_*` non disponibles sur certains workspaces | Faible | Élevé | Vérifier la disponibilité en amont. Fallback : utiliser `lastmodifieddate` pour D-05, désactiver D-12/D-13 si indisponibles |
| R2 — Performance sur workspaces > 10 000 deals (beaucoup de propriétés `hs_date_entered_*` à récupérer) | Moyenne | Moyen | Limiter le nombre de propriétés `hs_date_entered_*` récupérées aux stages des pipelines actifs ; batch les appels |
| R3 — Faux positifs D-12 (phases sautées) sur des pipelines dont les stages ont été réorganisés | Moyenne | Moyen | Ne détecter les phases sautées que sur les deals créés après la dernière modification de la configuration du pipeline (si disponible) |
| R4 — Migration P13-P16 → D-01-D-04 : regression | Faible | Élevé | Tests de regression systématiques : les résultats post-migration doivent être identiques |
| R5 — D-14 (stages fermés redondants) : difficulté à distinguer closedwon et closedlost via l'API | Faible | Faible | Utiliser la probabilité du stage (1.0 = won, 0.0 = lost) comme indicateur |
| R6 — Pondération renforcée du score Deals controversée | Faible | Moyen | Documenter la justification (domaine le plus lié au CA). Réévaluer après beta si les utilisateurs perçoivent un biais |

### Questions ouvertes

| Question | Décision |
|---|---|
| Seuil 60j pour deals bloqués (D-05) ? | Fixé à 60j en v1 — personnalisation au backlog |
| Seuil 8 stages pour D-07 ? | Proposé 8 — à valider en beta |
| Seuil 20% pour phases sautées (D-12) et entrées non standard (D-13) ? | Proposé 20% — à valider en beta |
| Pondération renforcée Deals (×1.5) dans le score global ? | Acté PO — à réévaluer après beta |

---

## 8. Critères d'acceptance

- [ ] Les 15 règles D-01 à D-15 sont détectées et affichées correctement sur un workspace de test
- [ ] Les règles migrées (D-01 à D-04) produisent les mêmes résultats que les anciennes P13 à P16 (regression testing)
- [ ] Les règles P13 à P16 sont retirées du domaine Propriétés (EP-02)
- [ ] Les règles D-01 à D-05, D-08 à D-11 ne portent que sur les deals en statut `open`
- [ ] D-05 détecte correctement les deals dont le stage n'a pas changé depuis > 60 jours via `hs_date_entered_*`
- [ ] D-10 est désactivée si 0 company dans le workspace
- [ ] D-12 reconstitue correctement le parcours de stage via les propriétés `hs_date_entered_*`
- [ ] D-13 identifie correctement le stage de création de chaque deal
- [ ] D-14 distingue correctement les stages Closed Won et Closed Lost via la probabilité
- [ ] Les règles pipeline (D-06, D-07, D-12 à D-15) affichent les résultats regroupés par pipeline
- [ ] Le score Deals est calculé selon la formule définie en section 6.7
- [ ] Le score global utilise la pondération renforcée (coefficient 1.5 pour Deals)
- [ ] Chaque problème détecté affiche son impact business correspondant (titre, estimation, urgence)
- [ ] Les listes de résultats dépassant 20 items sont paginées (20 items par page)
- [ ] L'audit est non-destructif : aucune requête en écriture ni en suppression n'est envoyée à HubSpot
- [ ] Un workspace sans aucun deal affiche un état vide avec mention "domaine non analysé"
- [ ] Le domaine Deals est activé uniquement si ≥ 1 deal existe dans le workspace
