# PRD-18 — Audit des leads & pipelines de prospection HubSpot

**Epic associé :** EP-18
**Version :** 1.0
**Date :** 2026-03-16
**Statut :** Prêt pour développement

---

## 1. Résumé exécutif

EP-18 définit le moteur d'analyse des leads et pipelines de prospection HubSpot : détection des leads bloqués (inactivité par stage avec seuils courts adaptés à la prospection), évaluation de la qualité des données leads (source, attribution, associations), audit de la configuration des pipelines de prospection, et contrôle de la rigueur du processus de qualification/disqualification. L'audit applique 14 règles (L-01 à L-14), dont 10 adaptées de l'audit Deals (EP-06) avec des seuils réduits et 4 nouvelles règles spécifiques aux leads.

Les leads représentent l'étape pré-deal dans le cycle de vente — c'est l'objet CRM qui fait le lien entre marketing et ventes. Un pipeline de prospection mal géré signifie des leads qui stagnent, des disqualifications non tracées, et une rupture dans le funnel marketing → vente.

**Décisions PO actées dans ce PRD :**
- Le domaine Leads est **optionnel et décoché par défaut** dans la modale de sélection EP-17 — contrairement aux 6 autres domaines cochés par défaut. Raison : beaucoup d'entreprises n'utilisent pas l'objet Lead HubSpot
- Les seuils d'inactivité et de blocage sont fixés à **30 jours** (vs 60 jours pour les deals) — les cycles de prospection sont significativement plus courts que les cycles de vente
- Le seuil maximum de stages par pipeline est fixé à **5** (vs 8 pour les deals) — un pipeline de prospection doit rester simple
- Le seuil d'inactivité pipeline et stage est fixé à **60 jours** (vs 90 jours pour les deals)
- Score global : le domaine Leads reçoit un coefficient standard (1.0), pas de pondération renforcée
- Un lead sans contact associé est une anomalie **critique** (vs avertissement pour les deals) — un lead est par définition lié à un prospect
- Personas RevOps Manager et SDR Manager traités au même niveau (co-primaires)

---

## 2. Problème utilisateur

### Narrative du problème

**Je suis :** Camille, SDR Manager dans une scale-up B2B SaaS de 120 personnes avec 2 pipelines de prospection et 800 leads actifs dans HubSpot
- Mon équipe de 8 SDR qualifie les leads entrants (inbound) et sortants (outbound) via 2 pipelines distincts
- Je sais que des leads traînent dans le pipeline depuis des semaines sans que personne ne les relance — mais je n'ai pas de vue consolidée pour les identifier rapidement
- Quand un SDR disqualifie un lead, il met souvent juste "pas intéressé" en texte libre — impossible d'analyser les patterns de disqualification pour améliorer le ciblage
- Pire : certains leads sont qualifiés et passés en "Converted" mais aucun deal n'est créé derrière — le handoff SDR → AE est cassé et personne ne s'en rend compte
- Mon CMO me demande le taux de conversion lead → deal par canal, mais 30% de mes leads n'ont même pas de source renseignée

**J'essaie de :**
- Identifier en moins de 5 minutes tous les problèmes de mon pipeline de prospection : leads bloqués, données manquantes, handoff cassé, disqualifications non tracées

**Mais :**
- HubSpot ne fournit pas de diagnostic du pipeline de prospection — les rapports standard montrent des volumes, pas la qualité du process
- L'objet Lead est relativement récent et les bonnes pratiques sont moins établies que pour les deals — les équipes reproduisent souvent les erreurs classiques sans s'en rendre compte
- Le lien lead → deal est le maillon faible du funnel : il repose sur la discipline individuelle des SDR

**Parce que :**
- Aucun outil natif HubSpot ne combine audit des données leads ET diagnostic de la configuration des pipelines de prospection ET contrôle du processus de qualification

**Ce qui me fait ressentir :**
- Frustrée de découvrir des leads "qualifiés" qui n'ont jamais été convertis en deals — du pipeline fantôme
- Inquiète que les motifs de disqualification en texte libre rendent impossible toute analyse de tendances
- Impuissante face à un pipeline de prospection dont je ne peux pas mesurer la santé réelle

### Énoncé du problème

Les SDR Managers et RevOps Managers ont besoin d'un moyen d'évaluer automatiquement la santé de leurs leads et la qualité de leurs pipelines de prospection HubSpot parce que les outils natifs ne fournissent pas de diagnostic du processus de qualification/disqualification ni de détection des ruptures dans le funnel lead → deal, ce qui laisse des leads stagner, des disqualifications non tracées, et des conversions fantômes.

### Contexte

L'objet Lead dans HubSpot est plus récent que l'objet Deal et sa gouvernance est souvent négligée. Les entreprises qui utilisent les leads ont typiquement des équipes SDR/BDR distinctes des Account Executives, avec un handoff formel entre prospection et vente. La qualité de ce handoff (lead qualifié → deal créé) est un indicateur clé de la performance commerciale. Mais c'est aussi le maillon le plus fragile : sans audit automatisé, les ruptures passent inaperçues.

**Particularité importante :** beaucoup d'entreprises HubSpot n'utilisent pas l'objet Lead — elles gèrent la prospection directement dans les deals ou via le lifecycle stage des contacts. C'est pourquoi ce domaine est optionnel et décoché par défaut.

### Problèmes spécifiques adressés

1. **Leads bloqués invisibles** : des leads restent dans le même stage pendant des semaines sans qualification ni relance, faussant les métriques de pipeline et gaspillant du temps SDR
2. **Disqualifications non tracées** : des leads sont disqualifiés sans motif structuré, rendant impossible l'analyse des patterns de rejet pour améliorer le ciblage marketing
3. **Handoff SDR → AE cassé** : des leads marqués comme "qualifiés" ou "convertis" n'ont aucun deal associé — le funnel est rompu et le CA potentiel est perdu
4. **Données leads incomplètes** : des leads sans source, sans propriétaire ou sans contact rendent l'attribution marketing impossible et fragmentent l'historique commercial
5. **Pipelines de prospection mal configurés** : trop de stages, phases sautées, pipelines obsolètes — les mêmes problèmes structurels que les pipelines de deals mais avec des seuils de tolérance plus bas

---

## 2bis. Personas & Jobs-to-be-Done

### Camille SDR Manager *(persona co-primaire)*

**Jobs fonctionnels :**
- Identifier en moins de 5 minutes tous les leads bloqués dans ses pipelines de prospection
- Vérifier que les disqualifications sont correctement documentées et structurées
- S'assurer que chaque lead qualifié a été converti en deal (handoff SDR → AE complet)
- Diagnostiquer la configuration de ses pipelines de prospection

**Jobs sociaux :**
- Prouver à son CMO que le pipeline de prospection est sain et que les leads sont correctement traités
- Montrer à son équipe SDR les axes d'amélioration concrets

**Jobs émotionnels :**
- Se sentir en contrôle du pipeline de prospection
- Ne plus découvrir des leads "fantômes" qualifiés mais jamais convertis

**Douleurs clés :**
- Aucune vue consolidée des leads bloqués par stage et par ancienneté
- Impossible d'analyser les motifs de disqualification quand ils sont en texte libre
- Pas de détection automatique des leads qualifiés sans deal associé

---

### Sophie RevOps Manager *(persona co-primaire)*

**Jobs fonctionnels :**
- Évaluer la santé structurelle des pipelines de prospection (configuration, usage, cohérence)
- Quantifier les ruptures dans le funnel lead → deal pour justifier un chantier d'optimisation du handoff
- Vérifier que les propriétés de disqualification sont correctement configurées (valeurs structurées vs texte libre)

**Jobs sociaux :**
- Fournir au SDR Manager un diagnostic objectif de son pipeline de prospection
- Justifier auprès de la direction la nécessité de restructurer le processus de qualification

**Jobs émotionnels :**
- Se sentir en confiance sur la fiabilité du funnel marketing → vente
- Ne plus être mise en défaut quand les taux de conversion lead → deal sont incohérents

**Douleurs clés :**
- Le pipeline de prospection est un "angle mort" de la gouvernance CRM — encore plus que les deals
- Aucun outil pour quantifier l'impact des ruptures dans le handoff SDR → AE

---

### Louis Consultant *(persona secondaire)*

**Jobs fonctionnels :**
- Diagnostiquer la maturité du processus de prospection d'un client en kick-off de mission
- Identifier rapidement si le client utilise l'objet Lead et si c'est pertinent de l'auditer

**Douleurs clés :**
- Beaucoup de clients n'utilisent pas les leads — il faut pouvoir le détecter et l'exclure de l'audit rapidement

---

## 2ter. Contexte stratégique

**Lien avec la vision produit :** l'audit leads est une extension naturelle de l'audit deals (EP-06). Il couvre le maillon amont du cycle commercial — la prospection — et complète la couverture du funnel marketing → vente. C'est le premier domaine d'audit **optionnel par défaut**, ce qui valide le modèle de personnalisation introduit par EP-17.

**Pourquoi maintenant :** EP-17 (sélection des domaines) a posé les fondations techniques pour les domaines optionnels. EP-06 (deals) fournit un modèle de règles directement adaptable. Le coût d'implémentation est faible car l'architecture (moteur d'audit, scoring, UI) est en place — il suffit d'ajouter un nouveau domaine avec ses règles.

**Indicateur différenciant :** les règles L-11 à L-13 (qualité de la disqualification et intégrité du handoff lead → deal) sont des diagnostics qu'aucun outil natif HubSpot ne propose. C'est exactement le type de problème invisible à l'œil nu mais mesurable par un audit automatisé.

---

## 2quart. Vue d'ensemble de la solution

Nous construisons un moteur d'analyse qui appelle l'API HubSpot via le token OAuth (EP-01), détecte 14 règles de qualité et de configuration sur les leads et pipelines de prospection, calcule un score de santé Leads, et présente chaque problème avec son impact business traduit en langage dirigeant.

**Comment ça fonctionne :**
1. Récupération de tous les leads du workspace via l'API HubSpot (avec les propriétés nécessaires)
2. Récupération de la configuration des pipelines de leads et de leurs stages
3. Récupération de l'historique des changements de stage des leads (via `hs_date_entered_*`)
4. Application des règles de qualité données leads (L-01 à L-04, L-14)
5. Application des règles d'audit configuration pipeline (L-05 à L-10)
6. Application des règles spécifiques leads (L-11 à L-13)
7. Calcul du score de santé Leads
8. Présentation des résultats avec impact business par catégorie

**Features clés :** détection leads bloqués (L-02), contrôle du handoff lead → deal (L-13), qualité de la disqualification (L-11, L-12), audit structurel des pipelines de prospection (L-05 à L-10), score de santé Leads.

**Considérations UX :**
- **Parcours utilisateur :** l'audit leads s'exécute dans le flux d'audit global si le domaine est sélectionné. Les résultats apparaissent comme un onglet "Leads" dans la navigation intra-page sticky, après "Deals". Le badge de l'onglet affiche le nombre total de problèmes leads.
- **Sélection domaine (EP-17) :** le domaine Leads est **décoché par défaut** dans la modale de sélection. Un tooltip explique : "Activez si votre équipe utilise l'objet Lead HubSpot pour gérer la prospection."
- **États clés :**
  - *Domaine non sélectionné* : l'onglet Leads n'apparaît pas dans le rapport — aucune mention
  - *Domaine sélectionné mais 0 lead* : skipped reason "no_leads" — onglet grisé avec mention "Aucun lead détecté dans ce workspace"
  - *Loading* : l'étape "Analyse des leads & pipelines de prospection" apparaît dans la progression
  - *Succès* : la section Leads affiche le score circle + décompte par criticité
  - *Erreur* : alert rouge dans la section si l'API leads échoue
- **Composants UI existants à réutiliser :** `ScoreCircle`, `SeverityBadge`, `RuleCard`, `ProgressBar`, `PaginatedList`, `Badge`, `EmptyState` — aucun nouveau composant nécessaire

---

## 3. Objectifs & métriques de succès

### Objectifs

| Objectif | Description |
|---|---|
| O1 — Détection des leads bloqués | Identifier automatiquement les leads sans progression depuis > 30 jours par stage, pipeline et propriétaire |
| O2 — Qualité du processus de disqualification | Vérifier que les leads disqualifiés ont un motif structuré (pas de texte libre) |
| O3 — Intégrité du handoff lead → deal | Détecter les leads qualifiés/convertis qui n'ont pas de deal associé |
| O4 — Diagnostic configuration pipelines | Détecter les problèmes structurels des pipelines de prospection avec des seuils adaptés |
| O5 — Actionabilité | Chaque problème détecté est accompagné d'un impact business et d'un niveau d'urgence |

### KPIs

| KPI | Cible | Méthode de mesure |
|---|---|---|
| Taux d'activation du domaine Leads | > 15% des audits (domaine optionnel) | Analytics sur `audit_domains.selected` |
| Taux de workspaces avec ≥ 1 problème lead détecté (parmi ceux qui activent) | > 80% | Analytics sur les audits exécutés |
| Durée médiane de l'audit leads | < 30 secondes sur workspace < 5 000 leads | Monitoring temps d'exécution |
| Taux de faux positifs signalés | < 5% | Retours utilisateurs en beta |

### Métriques garde-fous
- Aucune écriture ou modification dans HubSpot (non-destructif absolu)
- Le domaine Leads ne dégrade pas le score global des utilisateurs qui n'utilisent pas les leads (décoché par défaut)
- Les règles sur leads individuels (L-01 à L-04, L-11 à L-14) ne portent que sur les leads en statut `open` (sauf L-11 et L-13 qui s'appliquent aussi aux leads disqualifiés/convertis)

---

## 4. Périmètre

### In scope

- 10 règles adaptées de EP-06 (deals) avec seuils ajustés pour la prospection
- 4 nouvelles règles spécifiques leads (disqualification, handoff, source)
- Intégration dans la modale de sélection EP-17 (décoché par défaut)
- Calcul du score de santé Leads avec coefficient standard (1.0)
- Activation conditionnelle : domaine actif si sélectionné ET ≥ 1 lead
- Présentation des résultats regroupés par pipeline pour les règles de configuration
- Skipped reason "no_leads" si domaine sélectionné mais 0 lead

### Out of scope (phase NOW)

- Seuils configurables par l'utilisateur — au backlog (EP-16)
- Analyse de la vélocité de prospection (temps moyen par stage) — NEXT phase
- Détection de leads en doublon — couvert par EP-05 (contacts) si même contact
- Recommandations de restructuration de pipeline de prospection — NEXT phase
- Deep links vers les leads HubSpot depuis le rapport — NEXT phase
- Analyse des activités (calls, emails, meetings) associées aux leads — LATER
- Scoring prédictif de la probabilité de conversion lead → deal — LATER

---

## 5. User stories associées

| ID | Titre | Priorité |
|---|---|---|
| EP-18-S1 | Vue d'ensemble de l'audit leads & pipelines de prospection | Must have |
| EP-18-S2 | Détection des leads bloqués | Must have |
| EP-18-S3 | Qualité du processus de disqualification | Must have |
| EP-18-S4 | Intégrité du handoff lead → deal | Must have |
| EP-18-S5 | Audit de la configuration des pipelines de prospection | Must have |
| EP-18-S6 | Impact business par catégorie de problème | Must have |

Les stories complètes avec leurs critères d'acceptance Given/When/Then sont définies dans le fichier `/epics/ep18-audit-leads.md`.

---

## 6. Spécifications fonctionnelles

### 6.1 Condition d'activation du domaine Leads

Le domaine Leads est un domaine **optionnel décoché par défaut** dans la modale de sélection (EP-17). Il est exécuté uniquement si :
1. L'utilisateur l'a explicitement coché dans la modale de sélection
2. Le workspace contient au moins 1 lead

Si le domaine est sélectionné mais 0 lead détecté :
- Skipped reason : `"no_leads"`
- L'onglet Leads apparaît grisé avec mention "Aucun lead détecté dans ce workspace"
- Son poids n'est pas inclus dans le calcul du score global

**Intégration EP-17 :**
- Ajout de `"leads"` dans `AUDIT_DOMAINS` avec `defaultSelected: false`
- Tooltip dans la modale : "Activez si votre équipe utilise l'objet Lead HubSpot pour gérer la prospection."

---

### 6.2 Règles adaptées de EP-06 — Leads individuels (L-01 à L-04)

#### L-01 — Lead ouvert ancien sans avancement (Avertissement 🟡)

**Condition :** lead en statut `open` ET `createdate` > 30 jours par rapport à la date d'exécution de l'audit

**Adaptation vs D-03 :** seuil réduit de 60j à **30j** — les cycles de prospection sont significativement plus courts que les cycles de vente. Un lead qui n'a pas progressé en 30 jours est probablement mort.

**Affichage :** nombre total de leads concernés + liste paginée des leads avec : nom du lead, pipeline, stage actuel, date de création, ancienneté en jours. Triée par ancienneté décroissante.

#### L-02 — Lead bloqué dans un stage (Avertissement 🟡)

**Condition :** lead en statut `open` dont le stage n'a pas changé depuis plus de 30 jours (basé sur la date du dernier changement de stage).

**Adaptation vs D-05 :** seuil réduit de 60j à **30j**.

**Logique de détection :**
```
1. Pour chaque lead en statut `open` :
   a. Récupérer la date du dernier changement de stage via :
      - Propriété `hs_date_entered_{stage_id}` (date d'entrée dans le stage actuel)
      - OU à défaut, `lastmodifieddate` comme proxy
   b. Si (date_audit - date_entrée_stage) > 30 jours → lead bloqué
2. Exclure les leads dont le stage actuel est le premier stage du pipeline
   ET createdate < 30 jours (grace period pour les nouveaux leads)
```

**Différence avec L-01 :** L-01 détecte les leads anciens (créés il y a > 30j), L-02 détecte les leads stagnants dans un stage spécifique. Un lead créé il y a 15 jours mais qui n'a pas bougé de stage pendant 30 jours sera détecté par L-02 mais pas par L-01.

**Affichage :** résultats regroupés par pipeline, puis par stage. Pour chaque lead : nom du lead, pipeline, stage actuel, date d'entrée dans le stage, ancienneté dans le stage en jours, owner. Triés par ancienneté décroissante.

#### L-03 — Lead sans propriétaire (Info 🔵)

**Condition :** lead en statut `open` avec `hubspot_owner_id` null ou vide

**Identique à D-08.**

**Affichage :** nombre total de leads concernés + liste paginée : nom du lead, pipeline, stage, date de création. Triée par date de création ascendante.

#### L-04 — Lead sans contact associé (Critique 🔴)

**Condition :** lead en statut `open` avec 0 contact associé

**Adaptation vs D-09 :** sévérité relevée de Avertissement à **Critique**. Un lead est par définition lié à un prospect (contact). Un lead sans contact est une anomalie structurelle grave qui rend le lead inutilisable.

**Affichage :** nombre total de leads concernés + liste paginée : nom du lead, pipeline, stage, owner, date de création. Triée par date de création ascendante.

---

### 6.3 Règles adaptées de EP-06 — Audit configuration pipeline (L-05 à L-10)

#### L-05 — Pipeline de leads sans activité récente (Info 🔵)

**Condition :** pipeline de leads avec 0 lead en statut `open` ET 0 lead créé dans les 60 derniers jours.

**Adaptation vs D-06 :** seuil réduit de 90j à **60j**.

**Affichage :** liste des pipelines concernés avec : nom du pipeline, nombre total de leads (tous statuts), date du dernier lead créé, nombre de stages configurés. Triée par date du dernier lead ascendante.

#### L-06 — Pipeline de leads avec trop d'étapes (Info 🔵)

**Condition :** pipeline de leads avec plus de 5 stages (hors stages fermés).

**Adaptation vs D-07 :** seuil réduit de 8 à **5** stages actifs. Un pipeline de prospection doit rester simple — les SDR traitent un volume élevé de leads et chaque stage supplémentaire ralentit le processus et augmente le risque d'abandon.

**Affichage :** pour chaque pipeline concerné : nom du pipeline, nombre de stages actifs, liste des stages avec leur nom et le nombre de leads open dans chaque stage.

#### L-07 — Phases sautées dans un pipeline de leads (Avertissement 🟡)

**Condition :** au moins 20% des leads d'un pipeline ont sauté au moins 1 stage intermédiaire dans leur parcours.

**Identique à D-12** dans sa logique de détection (via `hs_date_entered_{stage_id}`).

**Affichage :** résultats par pipeline. Pour chaque pipeline concerné : nom, taux de phases sautées (%), nombre de leads concernés, top 3 des stages les plus fréquemment sautés. Barre de progression inversée.

#### L-08 — Points d'entrée multiples dans un pipeline de leads (Avertissement 🟡)

**Condition :** au moins 20% des leads d'un pipeline ont été créés dans un stage autre que le premier stage.

**Identique à D-13.**

**Affichage :** résultats par pipeline. Pour chaque pipeline concerné : nom, taux d'entrées non standard (%), répartition des stages de création.

#### L-09 — Stages fermés redondants dans un pipeline de leads (Avertissement 🟡)

**Condition :** pipeline de leads avec plus de 1 stage de type "Qualified" (converti) OU plus de 1 stage de type "Disqualified".

**Adaptation vs D-14 :** les types de stages fermés sont différents pour les leads (Qualified/Disqualified vs Closed Won/Closed Lost).

**Affichage :** pour chaque pipeline concerné : nom du pipeline, liste des stages fermés avec leur type, leur nom, et le nombre de leads dans chaque stage.

#### L-10 — Stage de lead sans activité 60 jours (Info 🔵)

**Condition :** stage actif (non fermé) d'un pipeline de leads avec 0 lead open ET 0 lead ayant traversé ce stage dans les 60 derniers jours.

**Adaptation vs D-15 :** seuil réduit de 90j à **60j**.

**Affichage :** résultats par pipeline. Pour chaque stage concerné : nom du pipeline, nom du stage, position dans le pipeline, dernier lead passé par ce stage (date).

---

### 6.4 Règles spécifiques Leads (L-11 à L-14)

#### L-11 — Lead disqualifié sans motif de disqualification (Avertissement 🟡)

**Condition :** lead dont le stage est de type "Disqualified" (fermé en disqualification) ET dont la propriété de motif de disqualification est null, vide, ou non renseignée.

**Logique de détection :**
```
1. Identifier les stages de type "Disqualified" dans chaque pipeline de leads
2. Récupérer tous les leads dans ces stages
3. Pour chaque lead disqualifié :
   a. Vérifier la propriété `hs_lead_disqualification_reason` (ou custom property mappée)
   b. Si null ou vide → lead sans motif de disqualification
```

**Note sur le périmètre :** cette règle s'applique à TOUS les leads disqualifiés (pas seulement les leads `open`) — c'est une règle de qualité rétrospective.

**Affichage :** nombre total de leads disqualifiés sans motif + pourcentage par rapport au total des leads disqualifiés + liste paginée : nom du lead, pipeline, date de disqualification, owner. Triée par date de disqualification décroissante.

**Impact business :** sans motif de disqualification structuré, impossible d'analyser les patterns de rejet pour améliorer le ciblage marketing et la qualité des leads entrants.

#### L-12 — Motif de disqualification non structuré (Info 🔵)

**Condition :** la propriété utilisée pour le motif de disqualification est de type `text` (texte libre) au lieu d'un type structuré (`enumeration`, `radio`, `select`).

**Logique de détection :**
```
1. Identifier la propriété utilisée pour le motif de disqualification :
   a. Propriété HubSpot native `hs_lead_disqualification_reason`
   b. OU propriété custom la plus probable (chercher parmi les propriétés de l'objet lead
      celles dont le label contient "disqualification", "raison", "reason", "motif")
2. Vérifier le type de la propriété :
   a. Si type = "string" ou "text" → non structuré
   b. Si type = "enumeration" → structuré ✅
```

**Note :** cette règle est évaluée une seule fois au niveau du workspace (pas par lead). C'est une règle de configuration.

**Affichage :** nom de la propriété détectée, type actuel, recommandation de passer à un type `enumeration` avec des valeurs prédéfinies. Suggestion de valeurs types : "Budget insuffisant", "Pas le bon timing", "Concurrent retenu", "Pas de besoin identifié", "Mauvais contact", "Autre".

**Impact business :** un champ texte libre génère des motifs inconsistants (fautes, synonymes, abréviations) impossibles à analyser en masse. Un champ structuré permet de piloter le ciblage marketing et d'identifier les segments non pertinents.

#### L-13 — Lead qualifié/converti non rattaché à un deal (Critique 🔴)

**Condition :** lead dont le stage est de type "Qualified" (converti/gagné) ET qui n'a aucun deal associé dans HubSpot.

**Logique de détection :**
```
1. Identifier les stages de type "Qualified" (converted) dans chaque pipeline de leads
2. Récupérer tous les leads dans ces stages
3. Pour chaque lead qualifié :
   a. Vérifier l'association lead → deal via l'API associations
   b. Si 0 deal associé → handoff cassé
```

**Note sur le périmètre :** cette règle s'applique à TOUS les leads qualifiés/convertis (pas seulement les `open`). Un lead converti sans deal est une anomalie quel que soit son âge.

**Affichage :** nombre total de leads qualifiés sans deal + pourcentage par rapport au total des leads qualifiés + liste paginée : nom du lead, pipeline, date de qualification, owner, contact associé. Triée par date de qualification décroissante (les plus récents en premier — ce sont les plus actionnables).

**Impact business :** chaque lead qualifié sans deal représente une opportunité commerciale identifiée par les SDR mais jamais prise en charge par les AE. C'est la rupture la plus coûteuse du funnel — le coût d'acquisition du lead est engagé mais le revenu potentiel est perdu.

#### L-14 — Lead sans source d'origine (Avertissement 🟡)

**Condition :** lead en statut `open` avec la propriété `hs_analytics_source` (ou équivalent) null ou vide.

**Affichage :** nombre total de leads concernés + pourcentage par rapport au total des leads open + liste paginée : nom du lead, pipeline, stage, date de création, owner. Triée par date de création décroissante.

**Impact business :** sans source d'origine, impossible de calculer le coût d'acquisition par canal et le ROI marketing. Le CMO ne peut pas arbitrer les investissements entre canaux (paid, organic, outbound, referral) sans cette donnée.

---

### 6.5 Comptage des problèmes pour le scoring

| Type de règle | Comptage |
|---|---|
| Règle comptage leads (L-01, L-02, L-04, L-14) | 1 problème par lead concerné |
| Règle comptage leads (L-03) | 1 problème par lead concerné |
| Règle pipeline config (L-05, L-06, L-07, L-08, L-09, L-10) | 1 problème par pipeline (ou par stage pour L-10) concerné |
| Règle comptage leads disqualifiés (L-11) | 1 problème par lead disqualifié sans motif |
| Règle configuration workspace (L-12) | 1 problème unique si déclenché |
| Règle comptage leads qualifiés (L-13) | 1 problème par lead qualifié sans deal |

---

### 6.6 Calcul du score de santé Leads

**Formule :**

```
Score_leads = 100
  − (nb_critiques × 5)     → plafonné à −30
  − (nb_avertissements × 2) → plafonné à −15
  − (nb_infos × 0,5)        → plafonné à −5

Score_leads = max(0, Score_leads)
```

**Classification des règles par sévérité :**

| Sévérité | Règles |
|---|---|
| Critique 🔴 | L-04, L-13 |
| Avertissement 🟡 | L-01, L-02, L-07, L-08, L-09, L-11, L-14 |
| Info 🔵 | L-03, L-05, L-06, L-10, L-12 |

**Niveaux de lecture du score :**

| Score | Label | Couleur |
|---|---|---|
| 0 – 49 | Critique | Rouge 🔴 |
| 50 – 69 | À améliorer | Orange 🟡 |
| 70 – 89 | Bon | Vert 🟢 |
| 90 – 100 | Excellent | Vert foncé ✅ |

**Contribution au score global — coefficient standard :**

```
Poids du domaine Leads : coefficient 1.0 (standard)

Le domaine Leads n'est inclus dans le score global QUE s'il a été
sélectionné par l'utilisateur ET s'il contient au moins 1 lead.
```

---

### 6.7 Traductions business par règle

| Règle(s) | Titre business | Estimation d'impact | Urgence |
|---|---|---|---|
| L-01, L-02 | Leads en stagnation dans le pipeline | Des leads ouverts depuis plus de 30 jours ou bloqués dans un stage représentent des prospects identifiés mais non traités. Le coût d'acquisition est engagé, les SDR perdent du temps sur des leads morts, et les prospects refroidissent irréversiblement. | Élevé |
| L-04 | Leads sans prospect identifié | Des leads sans contact associé sont des opportunités fantômes — impossible de contacter le prospect, de suivre les interactions, ou de mesurer le taux de conversion. C'est une anomalie structurelle qui indique un problème de process de création des leads. | Élevé |
| L-05, L-10 | Pipelines et stages de prospection obsolètes | Des pipelines sans activité et des stages jamais utilisés encombrent l'interface, créent de la confusion pour les SDR et faussent les métriques de pipeline. | Faible |
| L-06 | Pipeline de prospection trop complexe | Un pipeline de prospection avec plus de 5 stages ralentit les SDR qui traitent un volume élevé de leads. La simplicité corrèle avec la vélocité de traitement. | Moyen |
| L-03 | Leads sans responsable identifié | Des leads sans propriétaire ne sont suivis par personne. Aucun SDR n'est responsable de leur qualification, ce qui garantit leur stagnation. | Moyen |
| L-07 | Process de qualification contourné | Plus de 20% des leads sautent des étapes du pipeline — le processus de qualification n'est pas adapté ou les SDR ne voient pas la valeur des stages intermédiaires. | Élevé |
| L-08 | Pipeline de prospection sans point d'entrée unique | Les leads sont créés dans différents stages, ce qui rend impossible le calcul du taux de conversion par stage et fausse l'analyse de la vélocité de prospection. | Moyen |
| L-09 | Stages de qualification redondants | Plusieurs stages Qualified ou Disqualified compliquent le reporting et empêchent un calcul propre du taux de conversion lead → deal. | Moyen |
| L-11 | Disqualifications non documentées | Des leads disqualifiés sans motif rendent impossible l'analyse des patterns de rejet. Le marketing ne peut pas ajuster le ciblage car il ne sait pas pourquoi les leads sont rejetés. | Élevé |
| L-12 | Motifs de disqualification non exploitables | Un champ texte libre pour le motif de disqualification génère des données inconsistantes impossibles à analyser en masse. Passer à des valeurs prédéfinies permet de piloter le ciblage marketing. | Moyen |
| L-13 | Rupture du handoff SDR → AE | Des leads qualifiés sans deal associé représentent la fuite la plus coûteuse du funnel — le travail de prospection est fait mais l'opportunité n'est jamais traitée commercialement. Chaque lead qualifié perdu est un coût d'acquisition gaspillé. | Élevé |
| L-14 | Attribution marketing impossible | Des leads sans source d'origine rendent impossible le calcul du ROI par canal marketing. Le CMO ne peut pas arbitrer les investissements entre paid, organic, outbound et referral. | Moyen |

---

### 6.8 Présentation des résultats dans le rapport

#### Structure de la section Leads dans le rapport

1. **En-tête de domaine** : score de santé Leads (sur 100) avec label coloré + décompte synthétique (X critiques / Y avertissements / Z infos)
2. **Résumé** : nombre total de leads analysés, nombre de pipelines de prospection, nombre de stages
3. **Bloc Qualité données leads** : regroupé par règle (L-01, L-03, L-04, L-14), chaque règle avec son résultat
4. **Bloc Leads bloqués** : règle L-02 avec résultats regroupés par pipeline et stage
5. **Bloc Processus de disqualification** : règles L-11, L-12 — qualité de la documentation des rejets
6. **Bloc Handoff lead → deal** : règle L-13 — leads qualifiés sans deal
7. **Bloc Santé des pipelines de prospection** : regroupé par pipeline, chaque pipeline affichant les problèmes L-05 à L-10
8. **Bloc Impact business** : regroupé par thème business, visible uniquement si au moins une règle est déclenchée

#### Règles d'affichage

- Si une règle ne détecte aucun problème : afficher "✅ Aucun problème détecté"
- Si une liste dépasse 20 items : pagination avec 20 items par page
- Les leads bloqués (L-02) sont regroupés par pipeline > stage > leads, triés par ancienneté décroissante
- Les règles pipeline (L-05 à L-10) sont affichées dans un bloc unique "Santé des pipelines de prospection" avec un sous-bloc par pipeline
- Si le workspace n'a qu'un seul pipeline de leads, le regroupement par pipeline est masqué

---

### 6.9 Appels API HubSpot nécessaires

| Information récupérée | Endpoint HubSpot | Usage |
|---|---|---|
| Liste des leads avec propriétés | `POST /crm/v3/objects/leads/search` | Toutes les règles |
| Propriétés récupérées par lead | `hs_lead_label`, `hs_lead_status`, `hs_pipeline`, `hs_pipeline_stage`, `hubspot_owner_id`, `createdate`, `lastmodifieddate`, `hs_date_entered_*`, `hs_analytics_source`, `hs_lead_disqualification_reason` | L-01 à L-14 |
| Configuration des pipelines de leads | `GET /crm/v3/pipelines/leads` | L-05 à L-10 |
| Stages de chaque pipeline de leads | `GET /crm/v3/pipelines/leads/{pipelineId}/stages` | L-05 à L-10 |
| Associations lead → contacts | `GET /crm/v4/objects/leads/{id}/associations/contacts` ou batch | L-04 |
| Associations lead → deals | `GET /crm/v4/objects/leads/{id}/associations/deals` ou batch | L-13 |
| Propriétés de l'objet lead (schéma) | `GET /crm/v3/properties/leads` | L-12 (vérifier le type de la propriété disqualification) |

**Note sur les scopes OAuth :** l'accès à l'objet Lead nécessite le scope `crm.objects.leads.read`. Ce scope doit être ajouté à la Public App HubSpot et demandé lors de l'autorisation OAuth. Si le scope n'est pas accordé, le domaine Leads doit être désactivé automatiquement avec une mention explicite.

**Gestion du rate limiting :** identique à EP-06 — voir EP-01 section 6.6 pour la politique de retry avec backoff exponentiel. Les associations lead → contact et lead → deal doivent être récupérées en batch.

**Objectif de performance :** le temps total d'exécution de l'audit leads doit être inférieur à 30 secondes pour un workspace contenant moins de 5 000 leads.

---

## 7. Dépendances & risques

### Dépendances

| Dépendance | Nature | Impact si bloquant |
|---|---|---|
| **EP-01 — Connexion HubSpot OAuth** | Prérequis : token d'accès valide avec scope `crm.objects.leads.read` | Bloquant — aucun appel API possible sans token et scope |
| **EP-17 — Sélection des domaines** | Prérequis : modale de sélection et mécanisme `audit_domains` en place | Nécessaire pour le opt-in du domaine Leads (décoché par défaut) |
| **EP-06 — Audit des deals** | Référence : architecture moteur d'audit, scoring, UI — code à réutiliser/adapter | Non bloquant mais accélérateur d'implémentation |
| **EP-04 — Tableau de bord** | Consomme le score Leads et les résultats | Mise à jour du calcul du score global (7 domaines possibles) |

### Risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| R1 — Scope `crm.objects.leads.read` non disponible sur certains plans HubSpot | Moyenne | Élevé | Vérifier la disponibilité du scope au runtime. Si absent, désactiver le domaine avec message explicite : "L'accès aux leads nécessite un plan HubSpot incluant l'objet Lead." |
| R2 — L'objet Lead n'existe pas dans tous les portails HubSpot | Élevée | Moyen | Le domaine est décoché par défaut — les utilisateurs sans leads ne le verront pas. Si coché mais API retourne 404, skipped reason "leads_not_available" |
| R3 — Propriété `hs_lead_disqualification_reason` non standard sur tous les portails | Moyenne | Moyen | Fallback : chercher parmi les propriétés custom de l'objet lead. Si aucune propriété de disqualification trouvée, L-11 et L-12 désactivées avec mention |
| R4 — Propriétés `hs_date_entered_*` non disponibles pour les pipelines de leads | Faible | Élevé | Vérifier la disponibilité. Fallback : utiliser `lastmodifieddate` pour L-02, désactiver L-07/L-08 si indisponibles |
| R5 — Volume de leads élevé sur certains workspaces (>10 000) | Faible | Moyen | Pagination avec batches, même stratégie que EP-06 pour les deals |
| R6 — Confusion utilisateur entre Lead et Deal (pipeline) | Moyenne | Faible | Labels clairs dans l'UI : "Pipelines de prospection" vs "Pipelines de vente". Tooltip explicatif dans la modale de sélection |

### Questions ouvertes

| Question | Décision proposée |
|---|---|
| Seuil 30j pour leads bloqués (L-01, L-02) ? | Proposé 30j — à valider en beta |
| Seuil 5 stages pour L-06 ? | Proposé 5 — à valider en beta |
| Seuils 60j pour L-05 et L-10 ? | Proposé 60j — à valider en beta |
| Seuil 20% pour phases sautées (L-07) et entrées non standard (L-08) ? | Proposé 20% (identique aux deals) — à valider en beta |
| Nom de la propriété de disqualification ? | `hs_lead_disqualification_reason` en priorité, fallback sur propriétés custom. À vérifier sur des portails réels |
| L-13 : inclure les leads en stage "Qualified" ET "Converted" ou seulement "Converted" ? | Les deux — tout lead dans un stage terminal positif devrait avoir un deal |

---

## 8. Critères d'acceptance

- [ ] Les 14 règles L-01 à L-14 sont détectées et affichées correctement sur un workspace de test
- [ ] L-01 et L-02 utilisent un seuil de 30 jours (pas 60 comme les deals)
- [ ] L-04 est de sévérité Critique (pas Avertissement)
- [ ] L-06 détecte les pipelines avec plus de 5 stages (pas 8)
- [ ] L-05 et L-10 utilisent un seuil d'inactivité de 60 jours (pas 90)
- [ ] L-11 détecte les leads disqualifiés sans motif de disqualification
- [ ] L-12 vérifie le type de la propriété de disqualification (text vs enumeration)
- [ ] L-13 détecte les leads qualifiés/convertis sans deal associé
- [ ] L-14 détecte les leads sans source d'origine
- [ ] Le domaine Leads est décoché par défaut dans la modale EP-17
- [ ] Le domaine Leads n'est exécuté que si sélectionné ET ≥ 1 lead dans le workspace
- [ ] Si 0 lead détecté, skipped reason "no_leads" affiché
- [ ] Le score Leads est calculé selon la formule standard (coefficient 1.0)
- [ ] Le score global inclut les Leads uniquement si le domaine est actif
- [ ] Chaque problème détecté affiche son impact business correspondant
- [ ] Les listes dépassant 20 items sont paginées
- [ ] L'audit est non-destructif : aucune requête en écriture ni en suppression
- [ ] Si le scope `crm.objects.leads.read` n'est pas disponible, le domaine est désactivé avec message explicite
- [ ] Les labels UI distinguent clairement "Pipelines de prospection" et "Pipelines de vente"
