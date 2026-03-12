# PRD-02 — Audit des propriétés HubSpot

**Epic associé :** EP-02
**Version :** 1.0
**Date :** 2026-03-12
**Statut :** Prêt pour développement

---

## 1. Résumé exécutif

EP-02 définit le moteur d'analyse des propriétés HubSpot : propriétés custom sur tous les objets actifs du workspace, et propriétés système critiques sur les objets Contacts, Companies et Deals. L'audit détecte 16 règles de qualité (P1 à P16), calcule un score de santé "Propriétés" contribuant à 50% du score global en phase NOW, et restitue chaque problème avec son impact business traduit en langage non technique.

C'est le cœur de valeur du produit pour la v1 : l'analyse des propriétés est le premier indicateur de la dette de configuration d'un workspace HubSpot, et celle qui convainc le plus rapidement un décideur d'allouer du temps de nettoyage.

**Décisions PO actées dans ce PRD :**
- Taux de remplissage calculé sur TOUS les records, sans filtre temporel.
- Règle P3 (redondance) : comparaison sur le label uniquement, pas sur le nom interne.
- Seuil P2 (quasi-inutilisée) : 5% uniforme pour tous les objets, à valider en beta.
- La feature "ignorer un problème" (won't fix) est repoussée à la phase NEXT.
- Les tickets et Custom Objects sont couverts uniquement par les règles P1, P2, P4, P5, P6.

---

## 2. Problème utilisateur

### Narrative du problème

**Je suis :** Sophie, RevOps Manager responsable de la qualité du CRM dans une scale-up de 150 personnes
- J'ai hérité d'un workspace HubSpot mal configuré avec des centaines de propriétés custom dont je ne connais pas l'usage
- Avant chaque réunion de direction, je re-vérifie tout manuellement parce que je ne fais pas confiance aux données
- Je sais qu'il y a des problèmes mais je n'arrive pas à les formuler en termes business pour obtenir du temps de nettoyage

**J'essaie de :**
- Obtenir en moins de 2 minutes un état des lieux complet et structuré de mes propriétés HubSpot, avec les arguments business pour convaincre ma direction d'agir

**Mais :**
- HubSpot ne fournit pas nativement de rapport sur l'utilisation des propriétés
- L'audit manuel prend plusieurs heures, objet par objet dans les paramètres HubSpot
- Je n'ai aucun moyen de traduire les problèmes techniques (propriétés vides, typage incorrect) en impact business pour mon CEO

**Parce que :**
- Aucun outil natif HubSpot ni aucune alternative abordable ne couvre ce besoin

**Ce qui me fait ressentir :**
- Frustrée de passer des heures sur un travail répétitif et non valorisé
- Anxieuse en réunion de direction quand les données CRM sont présentées
- Dépassée par la taille et la complexité d'un workspace qui a grandi sans gouvernance

### Énoncé du problème

Les RevOps Managers ont besoin d'un moyen d'identifier automatiquement les problèmes de propriétés dans leur workspace HubSpot parce qu'aucun outil ne le fait nativement, ce qui les oblige à des audits manuels de plusieurs heures qui ne produisent aucun argument business pour convaincre leur direction d'agir.

### Contexte

Un workspace HubSpot accumule des propriétés custom au fil du temps : tests d'intégrations abandonnés, champs créés pour un projet ponctuel, propriétés importées en masse qui ne sont jamais renseignées. Sans outil dédié, identifier ces propriétés requiert une navigation manuelle objet par objet dans les paramètres HubSpot — un travail fastidieux, non reproductible, et qui ne produit aucun argument business structuré pour justifier un chantier de nettoyage.

Au-delà des propriétés custom, les champs système critiques (email, lifecycle stage, montant des deals, date de clôture) sont des fondations de la fiabilité du CRM. Un taux de remplissage insuffisant sur ces champs rend les rapports de direction inexploitables, fausse le forecasting commercial, et bloque les automatisations marketing.

### Problèmes spécifiques adressés

1. **Invisibilité de la dette de configuration** : personne ne sait combien de propriétés custom ne sont jamais renseignées, ni depuis combien de temps.
2. **Saisie inutile** : chaque propriété vide que les équipes voient dans les formulaires de saisie représente du temps perdu et de la friction cognitive.
3. **Données de base non fiables** : des champs système mal remplis (email, lifecyclestage, amount) rendent les décisions de direction et les automatisations marketing non fiables.
4. **Absence de traduction business** : les problèmes techniques identifiés manuellement ne sont jamais formulés en impact business, ce qui rend difficile d'obtenir un budget ou du temps pour les corriger.

---

## 2bis. Personas & Jobs-to-be-Done

### Sophie RevOps *(persona primaire)*

**Jobs fonctionnels :**
- Identifier en moins de 2 minutes quelles propriétés custom ne sont jamais renseignées
- Détecter les champs système critiques sous-utilisés (email, lifecycle stage, amount)
- Générer un rapport structuré à partager avec son manager ou son directeur commercial

**Jobs sociaux :**
- Être perçue comme rigoureuse dans sa gestion du CRM
- Pouvoir présenter un état des lieux chiffré en réunion de direction sans avoir à re-vérifier manuellement

**Jobs émotionnels :**
- Se sentir en confiance sur la fiabilité de ses données avant une présentation
- Éviter l'anxiété de découvrir un problème de données en public

**Douleurs clés :**
- Audit manuel de plusieurs heures pour un résultat incomplet
- Impossible de traduire les findings techniques en langage business sans reformuler tout soi-même

---

### Louis Consultant *(persona secondaire)*

**Jobs fonctionnels :**
- Délivrer un état des lieux des propriétés d'un client en moins d'une heure au kick-off
- Présenter un rapport professionnel au client sans avoir à construire manuellement les données

**Douleurs clés :**
- 1 à 2 jours perdus en début de mission pour cartographier l'état du HubSpot client
- Pas de rapport structuré à livrer au client sans travail manuel supplémentaire

---

## 2ter. Contexte stratégique

**Lien avec la vision produit :** l'audit des propriétés est le domaine qui convainc le plus rapidement un décideur d'allouer du temps de nettoyage. C'est le cœur de valeur de la v1 — le premier indicateur visible de la dette de configuration.

**Pourquoi maintenant :** EP-02 représente 50% du score global. Sans lui, le produit n'a pas de valeur au lancement. C'est le domaine qui génère le plus de "aha moment" lors des premières démonstrations.

**Indicateur différenciant :** la traduction business de chaque problème technique est l'argument de vente du produit — les RevOps ont le problème, les dirigeants ont le budget.

---

## 2quart. Vue d'ensemble de la solution

Nous construisons un moteur d'analyse qui appelle l'API HubSpot via le token OAuth (EP-01), détecte 16 règles de qualité sur les propriétés custom et système, calcule un score de santé, et présente chaque problème avec son impact business traduit en langage dirigeant.

**Comment ça fonctionne :**
1. Récupération de toutes les propriétés custom par objet via l'API HubSpot
2. Calcul du taux de remplissage de chaque propriété sur l'ensemble des records
3. Application des 16 règles de détection (P1-P16)
4. Calcul du score de santé Propriétés (50% du score global)
5. Présentation des résultats avec impact business par règle déclenchée

**Features clés :** détection P1-P16, score de santé, pagination >20 items, traductions business, désactivation automatique de P11 (workspace B2C).

---

## 3. Objectifs & métriques de succès

### Objectifs

| Objectif | Description |
|---|---|
| O1 — Gain de temps d'audit | Passer de plusieurs heures d'analyse manuelle à moins de 2 minutes pour un état des lieux complet des propriétés |
| O2 — Qualité des détections | Détecter tous les problèmes réels sans faux positifs sur les propriétés système HubSpot natives |
| O3 — Actionabilité | Chaque problème détecté est accompagné d'un impact business et d'un niveau d'urgence |
| O4 — Partage externe | Le rapport est suffisamment clair pour être partagé directement à un décideur non technique |

### KPIs

| KPI | Cible | Méthode de mesure |
|---|---|---|
| Durée médiane de l'audit propriétés | < 60 secondes sur un workspace < 50 000 contacts | Monitoring temps d'exécution |
| Taux de partage du rapport dans les 7 jours | > 30% | Tracking événement `report_shared` |
| Taux de faux positifs signalés (via feedback) | < 2% des problèmes détectés | Retours utilisateurs en beta |
| Taux d'audits avec au moins un problème critique détecté | À mesurer (base de référence à établir en beta) | Analytics |

### Métriques garde-fous
- Aucun faux positif sur les propriétés système HubSpot natives (propriétés internes = tolérance zéro)
- Aucune écriture ou modification dans HubSpot (non-destructif absolu)
- Taux de remplissage calculé sur 100% des records (pas de sampling)

---

## 4. Périmètre

### In scope

- Audit des propriétés custom sur tous les objets HubSpot actifs du workspace : Contacts, Companies, Deals, Tickets (si au moins 1 record existe), Custom Objects (si au moins 1 objet custom avec au moins 1 record existe)
- Audit des propriétés système critiques sur Contacts, Companies et Deals
- Détection des règles P1 à P16 (détail complet en section 6)
- Présentation des résultats en deux niveaux : liste opérationnelle détaillée + traduction impact business
- Calcul d'un score de santé pour le domaine Propriétés, contribuant à 50% du score global en phase NOW
- Pagination des listes de résultats au-delà de 20 items

### Out of scope (phase NOW)

- Modification ou suppression de propriétés dans HubSpot (l'outil est non-destructif par principe)
- Audit du contenu des valeurs (vérifier la pertinence sémantique des données saisies)
- Suggestions de propriétés manquantes (l'audit porte sur l'existant)
- Audit des options de propriétés de type dropdown (valeurs orphelines, doublons de valeurs)
- Règles système spécifiques pour Tickets et Custom Objects (seules P1, P2, P4, P5, P6 s'appliquent)
- Feature "ignorer un problème" (won't fix pour les prochains audits) — NEXT phase
- Deep links vers les propriétés HubSpot correspondantes depuis le rapport — NEXT phase

---

## 5. User stories associées

| ID | Titre | Priorité |
|---|---|---|
| EP-02-S1 | Vue d'ensemble de l'audit propriétés | Must have |
| EP-02-S2 | Détection des propriétés custom problématiques | Must have |
| EP-02-S3 | Détection des champs système critiques | Must have |
| EP-02-S4 | Impact business des problèmes de propriétés | Must have |

Les stories complètes avec leurs critères d'acceptance Given/When/Then sont définies dans le fichier `/epics/ep02-audit-proprietes.md`.

---

## 6. Spécifications fonctionnelles

### 6.1 Objets HubSpot couverts et conditions d'activation

L'audit ne s'applique qu'aux objets qui existent et sont utilisés dans le workspace. Un objet est considéré "actif" si au moins 1 record existe.

| Objet | Propriétés custom | Propriétés système | Condition d'activation |
|---|---|---|---|
| Contacts | P1, P2, P3, P4, P5, P6 | P7, P8, P9, P10a–d, P11 | Toujours (objet natif HubSpot) |
| Companies | P1, P2, P3, P4, P5, P6 | P12 | Toujours si ≥ 1 company |
| Deals | P1, P2, P3, P4, P5, P6 | P13, P14, P15, P16 | Toujours si ≥ 1 deal |
| Tickets | P1, P2, P4, P5, P6 | Aucune règle système | Si ≥ 1 ticket existe dans le workspace |
| Custom Objects | P1, P2, P4, P5, P6 | Aucune règle système | Si au moins 1 objet custom défini avec ≥ 1 record |

**Note sur P3 et Tickets/Custom Objects :** La règle P3 (redondance par similarité de label) est exclue des Tickets et Custom Objects en phase NOW, car ces objets ont généralement peu de propriétés et génèrent des faux positifs.

**Note sur P11 (association contact-company) :** Cette règle est automatiquement désactivée si le workspace ne contient aucune company (workspace B2C ou usage contacts-only). La détection se fait en vérifiant si le compte `companies` total est égal à 0.

---

### 6.2 Règles de détection — Propriétés custom (P1 à P6)

Ces règles s'appliquent exclusivement aux **propriétés custom** créées par l'utilisateur ou importées via des intégrations. Les propriétés système HubSpot natives (celles dont le `fieldType` ou la source indiquent qu'elles sont gérées par HubSpot) sont exclues de P1 à P6 pour éviter les faux positifs.

#### P1 — Propriété jamais renseignée (Critique 🔴)

**Condition :** `created_at` > 90 jours ET taux de remplissage = 0% exactement

**Taux de remplissage :** nombre de records où la propriété est non-null et non-vide, divisé par le nombre total de records de l'objet. Calculé sur TOUS les records, sans filtre temporel.

**Affichage :** liste des propriétés concernées avec : nom du champ (label), nom interne, objet HubSpot, date de création, groupe de propriété. Triées par objet puis par date de création ascendante (les plus anciennes en premier).

**Impact business associé :** voir table section 6.7.

#### P2 — Propriété quasi-inutilisée (Avertissement 🟡)

**Condition :** taux de remplissage < 5% ET `created_at` > 90 jours ET taux ≠ 0% (sinon = P1)

**Seuil :** 5% uniforme pour tous les objets (Contacts, Companies, Deals, Tickets, Custom Objects). Ce seuil est fixé par décision PO et sera réévalué lors de la beta.

**Affichage :** liste des propriétés concernées avec : nom du champ, objet, taux de remplissage en %, nombre de records renseignés sur nombre total de records (ex. "47 / 12 450"). Triées par taux de remplissage croissant.

#### P3 — Propriété potentiellement redondante (Avertissement 🟡)

**Condition :** score de similarité Levenshtein > 80% entre les **labels** (libellés affichés) de deux propriétés du même objet.

**Règle de comparaison :** comparaison sur le label uniquement (champ affiché à l'utilisateur), pas sur le nom interne (nom technique). Décision PO actée.

**Méthode :** pour chaque objet, calculer la similarité entre toutes les paires de labels de propriétés custom. Normaliser la distance de Levenshtein par la longueur du label le plus long. Si le ratio de similarité > 0,80, signaler la paire.

**Affichage :** liste des paires de propriétés concernées. Pour chaque paire : les deux labels côte à côte, le score de similarité en %, le taux de remplissage de chacune des deux propriétés.

**Exclusion :** ne pas signaler une propriété comme redondante avec elle-même. Chaque paire n'est affichée qu'une seule fois (A-B et non A-B + B-A).

#### P4 — Propriété sans description (Info 🔵)

**Condition :** champ `description` de la propriété est null, vide ou contient uniquement des espaces.

**Affichage :** liste des propriétés concernées avec : nom du champ, objet, groupe de propriété. Triées par objet.

#### P5 — Propriété sans groupe (Info 🔵)

**Condition :** `groupName` est null, ou `groupName` correspond au groupe par défaut HubSpot pour une propriété custom (par exemple `contactinformation` pour les contacts, `companyinformation` pour les companies, `dealinformation` pour les deals).

**Logique :** si une propriété custom se retrouve dans le groupe par défaut HubSpot, c'est un indicateur qu'elle n'a pas été organisée intentionnellement.

**Affichage :** liste des propriétés concernées avec : nom du champ, objet. Triées par objet.

#### P6 — Mauvais typage probable (Critique 🔴)

**Condition :** le label ou le nom interne de la propriété correspond à un pattern connu associé à un type de champ spécifique, mais le type actuel de la propriété ne correspond pas.

**Table des patterns de détection :**

| Pattern (regex insensible à la casse, appliqué sur label ET nom interne) | Type actuel déclencheur | Type attendu suggéré | Exemple de problème |
|---|---|---|---|
| `code.?postal`, `zip`, `\bcp\b` | `string` (single-line text) | `number` ou format contraint | "code_postal" défini comme texte libre |
| `siret`, `siren`, `\btva\b`, `\bnaf\b` | `string` | `string` à format contraint | "siret" en texte libre sans validation |
| `t[eé]l[eé]phone`, `\bphone\b`, `\btel\b`, `mobile` | `string` (non `phone_number`) | `phone_number` | "tel_mobile" défini comme texte au lieu du type téléphone HubSpot |
| `date.*naiss`, `birthday`, `birth` | `string` ou `number` | `date` | "date_de_naissance" en texte libre |
| `\bnb\b`, `nombre`, `count`, `quantit[eé]`, `quantity` | `string` | `number` | "nb_employes" en texte |
| `montant`, `budget`, `\bprix\b`, `revenue`, `\bca\b`, `chiffre.*affaire` | `string` | `number` | "budget_annuel" en texte |
| `score`, `\bnote\b`, `rating`, `\brank\b` | `string` | `number` | "score_qualification" en texte |

**Affichage :** pour chaque propriété concernée : label, nom interne, objet, type actuel, type suggéré, raison de la détection (ex. "Le libellé 'Code postal' suggère le type Téléphone ou un format contraint").

---

### 6.3 Règles de détection — Propriétés système Contacts (P7 à P11)

Ces règles portent sur des champs HubSpot natifs et analysent soit le taux de remplissage global, soit des incohérences logiques entre champs.

#### P7 — Email : taux de remplissage insuffisant (Critique 🔴)

**Condition :** (nombre de contacts avec `email` non-null et non-vide) / (nombre total de contacts) < 80%

**Affichage :** taux mesuré en % + nombre de contacts sans email + barre de progression colorée (rouge si sous seuil, verte sinon) + seuil cible affiché (80%).

#### P8 — Contact sans nom (Critique 🔴)

**Condition :** contact où `firstname` ET `lastname` sont tous les deux null ou vides simultanément.

**Affichage :** nombre total de contacts concernés + preview de 5 exemples (Hub ID du contact + date de création).

#### P9 — Lifecycle stage : taux de remplissage insuffisant (Critique 🔴)

**Condition :** (nombre de contacts avec `lifecyclestage` non-null et non-vide) / (nombre total de contacts) < 60%

**Affichage :** taux mesuré + nombre de contacts sans lifecycle stage + barre de progression + seuil cible (60%).

#### P10a — Lifecycle stage incohérent : deal Closed Won sans statut Customer (Critique 🔴)

**Condition :** contact associé à au moins 1 deal avec statut `closedwon` ET `lifecyclestage` ≠ `customer`

**Affichage :** nombre total de contacts concernés + explication : "Ces contacts ont un deal gagné associé mais leur lifecycle stage n'est pas 'Customer'" + preview de 5 exemples (Hub ID contact, lifecycle stage actuel, nombre de deals Closed Won associés).

#### P10b — Lifecycle stage Customer sans deal Closed Won (Avertissement 🟡)

**Condition :** contact avec `lifecyclestage` = `customer` ET 0 deal associé avec statut `closedwon`

**Affichage :** nombre total de contacts concernés + explication de l'incohérence.

#### P10c — Absence de contacts MQL/SQL avec pipeline actif (Avertissement 🟡)

**Condition :** 0 contact avec `lifecyclestage` = `marketingqualifiedlead` ET 0 contact avec `lifecyclestage` = `salesqualifiedlead` dans le workspace ET au moins 1 deal en statut `open` existe

**Logique :** si le workspace a des deals actifs mais aucun contact en stade MQL ou SQL, cela signale une absence de processus de qualification ou une non-utilisation du lifecycle stage.

**Affichage :** message d'alerte avec explication business : "Votre workspace contient des deals actifs mais aucun contact MQL ou SQL. Le lifecycle stage n'est peut-être pas utilisé comme outil de qualification."

#### P10d — Contact Subscriber/Lead avec deal actif (Avertissement 🟡)

**Condition :** contact avec `lifecyclestage` = `subscriber` ou `lead` ET au moins 1 deal associé en statut `open`

**Affichage :** nombre total de contacts concernés + explication : "Ces contacts ont un deal actif associé mais un lifecycle stage de 'Lead' ou 'Subscriber', ce qui indique un manque de mise à jour du statut."

#### P11 — Association contact-company insuffisante (Critique 🔴)

**Condition :** (nombre de contacts avec au moins 1 company associée) / (nombre total de contacts) < 60%

**Désactivation automatique :** cette règle est désactivée si le workspace contient 0 company au total. Le rapport indique alors : "Règle P11 non applicable — aucune company détectée dans ce workspace (usage B2C possible)."

**Affichage :** taux mesuré + nombre de contacts non associés à une company + barre de progression + seuil cible (60%).

---

### 6.4 Règles de détection — Propriétés système Companies (P12)

#### P12 — Domain : taux de remplissage insuffisant (Critique 🔴)

**Condition :** (nombre de companies avec `domain` non-null et non-vide) / (nombre total de companies) < 70%

**Affichage :** taux mesuré + nombre de companies sans domaine + barre de progression + seuil cible (70%).

---

### 6.5 Règles de détection — Propriétés système Deals (P13 à P16)

#### P13 — Montant : taux de remplissage insuffisant sur deals open (Critique 🔴)

**Condition :** (nombre de deals `open` avec `amount` non-null et > 0) / (nombre total de deals en statut `open`) < 70%

**Périmètre :** deals en statut `open` uniquement (exclure les deals `closedwon` et `closedlost`).

**Affichage :** taux mesuré + nombre de deals open sans montant + barre de progression + seuil cible (70%).

#### P14 — Date de clôture : taux de remplissage insuffisant sur deals open (Critique 🔴)

**Condition :** (nombre de deals `open` avec `closedate` non-null) / (nombre total de deals en statut `open`) < 70%

**Périmètre :** deals en statut `open` uniquement.

**Affichage :** taux mesuré + nombre de deals open sans date de clôture + barre de progression + seuil cible (70%).

#### P15 — Deal open ancien sans avancement (Avertissement 🟡)

**Condition :** deal en statut `open` ET `createdate` > 60 jours par rapport à la date d'exécution de l'audit

**Affichage :** nombre total de deals concernés + liste paginée des deals avec : nom du deal, pipeline, stage actuel, date de création, ancienneté en jours. Triée par ancienneté décroissante (les plus anciens en premier).

#### P16 — Propriétés obligatoires de stage non renseignées (Critique 🔴)

**Condition :** deal dont au moins une propriété déclarée comme obligatoire pour son stage de pipeline actuel est null ou vide.

**Logique de détection :**
1. Récupérer la configuration des pipelines du workspace via l'API (stages avec leurs propriétés obligatoires)
2. Pour chaque deal en statut `open`, récupérer son `pipeline`, son `dealstage` actuel, et les valeurs des propriétés obligatoires définies pour ce stage
3. Signaler le deal si au moins une propriété obligatoire est manquante

**Affichage :** résultats regroupés par pipeline et par stage. Pour chaque groupe : nombre de deals concernés, liste des propriétés obligatoires manquantes. Deals triés par ancienneté dans le stage (les plus anciens en premier).

---

### 6.6 Calcul du score de santé Propriétés

Le score est calculé sur la base des problèmes détectés toutes règles confondues (P1 à P16).

**Formule :**

```
Score_propriétés = 100
  − (nb_critiques × 5)     → plafonné à −30
  − (nb_avertissements × 2) → plafonné à −15
  − (nb_infos × 0,5)        → plafonné à −5

Score_propriétés = max(0, Score_propriétés)
```

**Comptage des problèmes :**
- Un problème = une occurrence d'une règle (ex. une propriété P1 = 1 critique ; 50 propriétés P1 = 50 critiques)
- Exception pour les règles de type "taux global" (P7, P9, P11, P12, P13, P14) : si le seuil est franchi, c'est 1 problème critique unique, pas un problème par record
- Exception pour P10c : si la condition est vraie pour le workspace, c'est 1 problème avertissement unique
- P8 : 1 problème critique unique (le seuil n'est pas pourcentuel, mais le total de contacts sans nom est 1 occurrence unique signalée)

**Niveaux de lecture du score :**

| Score | Label | Couleur |
|---|---|---|
| 0 – 40 | Critique | Rouge |
| 41 – 70 | À améliorer | Orange |
| 71 – 90 | Bon | Jaune |
| 91 – 100 | Excellent | Vert |

**Contribution au score global :** le score Propriétés contribue à 50% du score global de santé du workspace en phase NOW. Les 50% restants sont apportés par l'audit Workflows (EP-03).

---

### 6.7 Traductions business par règle

Chaque règle déclenchée affiche un encart "Impact business" avec le titre business, l'estimation d'impact, et le niveau d'urgence.

| Règle(s) | Titre business | Estimation d'impact | Urgence |
|---|---|---|---|
| P1, P2 | Temps commercial gaspillé en saisie inutile | Chaque propriété inutilisée que vos équipes renseignent représente du temps perdu à chaque création de contact ou deal. Sur une équipe de 10 personnes, 10 champs inutiles = ~30 min/semaine perdues. | Moyen |
| P3 | Données fragmentées entre champs redondants | Des propriétés en doublon signifient que la même information est saisie à deux endroits différents — ou dans un seul, rendant les rapports incomplets et les automatisations non fiables. | Moyen |
| P4 | Gouvernance des données non documentée | Des propriétés sans description rendent l'onboarding de nouveaux membres difficile et favorisent les erreurs de saisie. | Faible |
| P5 | Configuration non structurée du CRM | Des propriétés non organisées en groupes dégradent l'expérience de saisie des commerciaux et compliquent la gouvernance du workspace. | Faible |
| P6 | Risque de casse d'automatisations | Un mauvais typage de propriété peut bloquer silencieusement des workflows, fausser des calculs et rendre les exports incohérents. Impact direct sur la fiabilité des données commerciales. | Élevé |
| P7, P8 | Contacts inexploitables pour le marketing et le commercial | Des contacts sans email ni nom ne peuvent pas être ciblés en emailing ni assignés correctement. Chaque contact de ce type est une opportunité commerciale aveugle. | Élevé |
| P9, P10a–d | Pipeline et segmentation non fiables | Un lifecycle stage incorrect fausse la vue du pipeline, les taux de conversion et les décisions de ciblage. Les rapports de direction sont potentiellement basés sur des données erronées. | Élevé |
| P11 | Impossibilité d'analyser les données par compte | Sans association contact-entreprise, les analyses account-based (ABM) sont impossibles et le chiffre d'affaires par client ne peut pas être calculé fiablement. | Élevé |
| P13, P14 | Forecasting commercial non fiable | Des deals sans montant ni date de clôture rendent le prévisionnel des ventes inexploitable. La direction prend des décisions de recrutement et d'investissement sur des données incomplètes. | Élevé |
| P15 | CA potentiel immobilisé dans le pipeline | Des deals ouverts depuis plus de 60 jours représentent un CA déclaré dans le pipeline qui ne se concrétisera probablement pas — le forecasting est surestimé. | Moyen |
| P16 | Processus commercial non respecté | Des propriétés obligatoires vides dans un stage indiquent que le processus de vente défini n'est pas suivi. Les managers n'ont pas la visibilité nécessaire pour coacher leurs équipes. | Élevé |

---

### 6.8 Présentation des résultats dans le rapport

#### Structure de la section Propriétés dans le rapport

1. **En-tête de domaine** : score de santé Propriétés (sur 100) avec label coloré + décompte synthétique (X critiques / Y avertissements / Z infos)
2. **Résumé par objet** : nombre de propriétés custom analysées par objet (Contacts : X, Companies : Y, Deals : Z, Tickets : W si applicable)
3. **Bloc Propriétés custom** : regroupé par règle (P1 à P6), chaque règle avec son label, sa criticité, le nombre d'occurrences, et la liste détaillée paginée
4. **Bloc Propriétés système** : regroupé par objet (Contacts, Companies, Deals), chaque règle avec son résultat
5. **Bloc Impact business** : regroupé par thème business, visible uniquement si au moins une règle du thème est déclenchée

#### Règles d'affichage

- Si une règle ne détecte aucun problème : afficher "Aucun problème détecté" (état positif visible)
- Si une liste dépasse 20 items : pagination avec 20 items par page, navigation simple (page précédente / suivante)
- Les listes d'exemples dans les règles système (P8, P10a–d) sont limitées à 5 exemples en preview avec un lien "Voir tous les [N] cas" qui charge la liste complète paginée

---

### 6.9 Appels API HubSpot nécessaires

Cette section liste les endpoints HubSpot que le moteur d'audit EP-02 doit appeler. Elle est fournie à titre indicatif pour l'architecture technique — la stack étant à définir par l'équipe.

| Information récupérée | Endpoint HubSpot | Usage |
|---|---|---|
| Liste des propriétés custom par objet | `GET /crm/v3/properties/{objectType}` | P1, P2, P3, P4, P5, P6 |
| Taux de remplissage par propriété | Agrégation via `POST /crm/v3/objects/{objectType}/search` ou via l'API analytics (si disponible) | P1, P2, P7, P9, P11, P12, P13, P14 |
| Contacts associés à des deals Closed Won | `POST /crm/v3/objects/contacts/search` avec filtre sur associations deals | P10a, P10b |
| Distribution des lifecycle stages | Agrégation sur `lifecyclestage` | P10c |
| Nombre total de records par objet | `GET /crm/v3/objects/{objectType}` avec limit=0 (count total) | Calcul des taux |
| Configuration des pipelines et stages | `GET /crm/v3/pipelines/{objectType}` | P16 |
| Propriétés obligatoires par stage | `GET /crm/v3/pipelines/{objectType}/{pipelineId}/stages` | P16 |

**Gestion du rate limiting :** l'audit propriétés peut nécessiter de nombreux appels pour les workspaces de grande taille. Implémenter une stratégie de batching et de retry avec backoff exponentiel (voir EP-01 section 6.6 pour la politique de retry).

**Objectif de performance :** le temps total d'exécution de l'audit propriétés doit être inférieur à 60 secondes pour un workspace contenant moins de 50 000 contacts.

---

## 7. Dépendances & risques

### Dépendances

| Dépendance | Nature | Impact si bloquant |
|---|---|---|
| **EP-01 — Connexion HubSpot OAuth** | Prérequis : token d'accès valide avec les scopes nécessaires | Bloquant — aucun appel API possible sans token |
| **EP-04 — Tableau de bord** | Consomme le score Propriétés et les résultats structurés produits par EP-02 | Dépendance en aval |

### Risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| R1 — Faux positifs sur propriétés système HubSpot natives | Moyenne | Élevé (perte de confiance utilisateur) | Maintenir une liste d'exclusion à jour des propriétés natives par objet ; tester sur un workspace de référence HubSpot |
| R2 — Workspaces de très grande taille (> 500 000 records) dépassant le timeout | Faible | Moyen | Implémenter un mode d'audit asynchrone avec notification à la fin ; commencer les tests de performance dès la phase de développement |
| R3 — Rate limiting HubSpot sur les workspaces avec beaucoup de propriétés | Moyenne | Moyen | Voir politique de retry EP-01 ; concevoir les appels en parallèle dans les limites du rate limit HubSpot |
| R4 — Seuil P2 à 5% trop sensible (faux positifs) | Moyenne | Faible (signalé en beta) | Seuil validé lors de la beta avec ajustement possible avant le lancement public |
| R5 — Calcul de similarité Levenshtein coûteux sur de nombreuses propriétés | Faible | Faible | Limiter P3 aux objets ayant > 10 propriétés custom ; appliquer un pré-filtre sur la longueur des labels (ignorer les paires avec un ratio de longueur > 3) |
| R6 — L'API HubSpot ne fournit pas directement le taux de remplissage | Moyenne | Moyen | Explorer les endpoints de propriétés analytics HubSpot ; si indisponibles, calculer par sampling ou par appel paginé sur les records |

### Questions ouvertes fermées par les décisions PO

| Question initiale | Décision PO |
|---|---|
| Taux de remplissage sur tous les records ou 12 derniers mois ? | Sur TOUS les records, sans filtre temporel |
| P3 : comparer label ou nom interne ? | Label uniquement |
| Seuil P2 à 5% : uniforme ou par objet ? | Uniforme à 5%, réévaluation en beta |
| Feature "ignorer un problème" (won't fix) ? | NEXT phase |

---

## 8. Critères d'acceptance

Les critères suivants doivent tous être satisfaits pour que l'epic EP-02 soit considéré comme "Done" :

- [ ] Toutes les règles P1 à P16 sont détectées et affichées correctement sur un workspace de test couvrant les cas nominaux et les cas limites
- [ ] Aucun faux positif n'est généré sur les propriétés système HubSpot natives (les propriétés internes HubSpot ne sont pas signalées en P1-P6)
- [ ] Le taux de remplissage est calculé sur la totalité des records de chaque objet, sans filtre de date
- [ ] La règle P3 compare uniquement les labels des propriétés, pas les noms internes
- [ ] Le seuil de P2 est fixé à 5% pour tous les objets
- [ ] La règle P11 est automatiquement désactivée si le workspace contient 0 company, avec message explicatif dans le rapport
- [ ] Le score Propriétés est calculé selon la formule définie en section 6.6 et est cohérent avec les problèmes détectés
- [ ] Chaque problème détecté affiche son impact business correspondant (titre, estimation, urgence) selon la table section 6.7
- [ ] Les listes de résultats dépassant 20 items sont paginées (20 items par page)
- [ ] Le temps d'exécution de l'audit propriétés est inférieur à 60 secondes sur un workspace contenant moins de 50 000 contacts
- [ ] L'audit est non-destructif : aucune requête en écriture ni en suppression n'est envoyée à HubSpot
- [ ] Les règles système P7, P9, P11, P12, P13, P14 affichent le taux mesuré, le nombre de records concernés, et le seuil cible côte à côte
- [ ] La règle P16 regroupe les résultats par pipeline et par stage, avec les propriétés manquantes listées explicitement
- [ ] Les Tickets et Custom Objects ne déclenchent que les règles P1, P2, P4, P5, P6 (P3 et toutes les règles système sont exclues)
- [ ] Un workspace sans aucun problème détecté dans une règle affiche un état "Aucun problème détecté" (pas une section vide)
