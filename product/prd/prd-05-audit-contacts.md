# PRD-05 — Audit des contacts HubSpot

**Epic associé :** EP-05
**Version :** 1.0
**Date :** 2026-03-15
**Statut :** Prêt pour développement

---

## 1. Résumé exécutif

EP-05 définit le moteur d'analyse des contacts HubSpot : détection de doublons multi-critères (email, nom+company, téléphone), évaluation de la qualité des données (emails invalides, contacts stale, attribution), et vérification de la cohérence du lifecycle stage. L'audit applique 12 règles (C-01 à C-12), dont 8 migrées depuis l'audit Propriétés (ex-P7 à P11) et 4 nouvelles. Il calcule un score de santé "Contacts" contribuant au score global avec pondération égale entre domaines actifs.

La détection de doublons est la feature phare de cet epic : c'est le pain point le plus fréquemment cité par les RevOps Managers, et aucun outil natif HubSpot ne le couvre sans licence Operations Hub.

**Décisions PO actées dans ce PRD :**
- Migration P7-P11 → C-01 à C-05 intégrée dans cet epic (pas d'epic migration séparé)
- P13-P16 (deals) restent dans le domaine Propriétés en attendant EP-06
- C-05 (ex-P11) : criticité abaissée de Critique à Info
- Score global : pondération égale entre domaines actifs (redistribution si domaine absent)
- Vision cible : le domaine Propriétés sera à terme dissous, ses règles ventilées par objet

---

## 2. Problème utilisateur

### Narrative du problème

**Je suis :** Sophie, RevOps Manager dans une scale-up B2B de 150 personnes avec un workspace HubSpot de 30 000 contacts
- Mon équipe commerciale crée des contacts manuellement, le marketing en importe via les événements, et 3 intégrations en synchronisent automatiquement
- Je suis certaine qu'il y a des milliers de doublons dans la base, mais je n'ai aucun moyen de les identifier sans Operations Hub (que mon CEO refuse d'acheter)
- Chaque semaine, un commercial me signale qu'il a appelé un prospect déjà en discussion avec un collègue — deux fiches, pas de visibilité

**J'essaie de :**
- Identifier automatiquement tous les doublons de ma base et évaluer la qualité globale de mes contacts en moins de 5 minutes

**Mais :**
- HubSpot ne fournit la détection de doublons que dans Operations Hub (plan payant)
- L'audit manuel est impossible au-delà de quelques centaines de contacts
- Je ne peux pas évaluer la qualité globale de la base (emails invalides, contacts orphelins) sans exporter et analyser dans un tableur

**Parce que :**
- Aucun outil abordable ne combine détection de doublons multi-critères et audit qualité des contacts HubSpot

**Ce qui me fait ressentir :**
- Frustrée de savoir que des doublons existent sans pouvoir les quantifier
- Démunie face à mon CEO quand il demande "combien de vrais contacts on a ?" et que je ne peux pas répondre
- Anxieuse à chaque import en masse qui risque de créer de nouveaux doublons

### Énoncé du problème

Les RevOps Managers ont besoin d'un moyen d'identifier les doublons et d'évaluer la qualité de leur base contacts HubSpot parce que les outils natifs ne couvrent ce besoin qu'avec un plan payant coûteux, ce qui les oblige à des analyses manuelles impossibles à grande échelle.

### Contexte

Un workspace HubSpot accumule des contacts via de multiples sources : saisie manuelle, import CSV, formulaires web, intégrations tierces. Chaque source a ses conventions de saisie (majuscules, formats de téléphone, sous-adressage email), ce qui génère mécaniquement des doublons que seule une normalisation multi-critères peut détecter. Au-delà des doublons, la qualité de la base se dégrade silencieusement : contacts sans email valide, sans propriétaire, sans source d'acquisition — des données qui polluent les métriques marketing et empêchent l'attribution correcte des leads.

### Problèmes spécifiques adressés

1. **Doublons non détectés** : des contacts représentant la même personne coexistent sans être identifiés, faussant les métriques et créant de la friction commerciale
2. **Qualité de base invisible** : aucune vue consolidée du taux d'emails valides, de contacts actifs ou correctement attribués
3. **Cohérence lifecycle non vérifiée** : des incohérences entre lifecycle stage et statut des deals faussent le pipeline et la segmentation
4. **Absence de traduction business** : les problèmes de qualité contacts ne sont jamais formulés en impact business pour le management

---

## 2bis. Personas & Jobs-to-be-Done

### Sophie RevOps *(persona primaire)*

**Jobs fonctionnels :**
- Identifier en moins de 5 minutes tous les clusters de doublons dans sa base contacts
- Évaluer le taux de contacts avec email valide, owner assigné, source renseignée
- Détecter les incohérences lifecycle stage / deals pour corriger la segmentation

**Jobs sociaux :**
- Pouvoir répondre avec précision quand le CEO demande "combien de vrais contacts on a ?"
- Justifier un budget de nettoyage de base avec des données chiffrées

**Jobs émotionnels :**
- Se sentir en contrôle de la qualité de sa base contacts
- Ne plus être surprise par un doublon signalé par un commercial

**Douleurs clés :**
- Détection de doublons HubSpot native réservée à Operations Hub (trop cher)
- Aucun outil pour quantifier le problème et convaincre le management d'agir

---

### Louis Consultant *(persona secondaire)*

**Jobs fonctionnels :**
- Diagnostiquer la qualité d'une base contacts client en kick-off de mission
- Produire un rapport de doublons directement présentable au client

**Douleurs clés :**
- Export CSV + dédoublonnage tableur = 1-2 jours par client
- Pas de rapport professionnel à livrer sans travail manuel

---

## 2ter. Contexte stratégique

**Lien avec la vision produit :** l'audit contacts avec détection de doublons est le deuxième "aha moment" du produit après les propriétés. C'est la feature la plus demandée par les RevOps Managers et la plus différenciante face à l'offre native HubSpot.

**Pourquoi maintenant :** EP-05 est le premier epic de couverture d'audit Phase 2. La détection de doublons est un pain point universel — elle maximise l'impact perçu du produit à chaque audit lancé.

**Indicateur différenciant :** HubSpot ne propose la détection de doublons qu'avec Operations Hub (licence payante). HubSpot Auditor la fournit gratuitement dans le cadre de l'audit, avec une normalisation multi-critères plus fine (sous-adressage email, Levenshtein sur noms, normalisation téléphone).

---

## 2quart. Vue d'ensemble de la solution

Nous construisons un moteur d'analyse qui appelle l'API HubSpot via le token OAuth (EP-01), détecte 12 règles de qualité et de doublons sur les contacts, calcule un score de santé Contacts, et présente chaque problème avec son impact business traduit en langage dirigeant.

**Comment ça fonctionne :**
1. Récupération de tous les contacts du workspace via l'API HubSpot (avec les propriétés nécessaires)
2. Normalisation des données pour la détection de doublons (email, téléphone, noms)
3. Détection de doublons par clustering sur chaque critère
4. Application des règles de qualité et de cohérence lifecycle (C-01 à C-12)
5. Calcul du score de santé Contacts
6. Présentation des résultats avec clusters de doublons et impact business

**Features clés :** détection doublons multi-critères (C-06 à C-08), audit qualité (C-09 à C-12), cohérence lifecycle migrée (C-01 à C-05), score de santé, clusters triés par taille, traductions business.

**Considérations UX :**
- **Parcours utilisateur :** l'audit contacts s'exécute dans le flux d'audit global (Dashboard → Lancer audit → Résultats). Les résultats contacts apparaissent comme un nouvel onglet "Contacts" dans la navigation intra-page sticky, entre "Propriétés" et "Deals". Le badge de l'onglet affiche le nombre total de problèmes contacts.
- **États clés :**
  - *Empty state* : si 0 contact dans le workspace, l'onglet Contacts n'apparaît pas dans la navigation. Une mention dans les métadonnées explique pourquoi.
  - *Loading* : pendant l'audit, l'étape "Analyse des contacts" apparaît dans la progression étape par étape (cf. screens-and-flows section 5.5).
  - *Succès* : la section Contacts affiche le score circle + décompte par criticité dans le header de section.
  - *Erreur* : si l'API contacts échoue, une alert rouge s'affiche dans la section avec mention dans les métadonnées.
- **Composants UI existants à réutiliser :** `ScoreCircle` (header de section), `SeverityBadge` (criticité des règles), `RuleCard` (affichage des règles avec accordion), `ProgressBar` (règles de taux C-01, C-03, C-05), `PaginatedList` (listes > 20 items), `Badge` (compteurs dans la navigation), `EmptyState` (workspace sans contact).
- **Nouveau pattern UI — Clusters de doublons :** les clusters de doublons (C-06, C-07, C-08) introduisent un nouveau pattern d'affichage : une liste de groupes (clusters) triés par taille décroissante, chaque groupe affichant ses membres dans un sous-tableau. Ce pattern est similaire aux rule cards mais avec un niveau de nesting supplémentaire (cluster → membres). À implémenter dans le composant `RuleCard` existant avec une variante "cluster".

---

## 3. Objectifs & métriques de succès

### Objectifs

| Objectif | Description |
|---|---|
| O1 — Détection automatique de doublons | Identifier les clusters de doublons multi-critères sans intervention manuelle ni licence Operations Hub |
| O2 — Évaluation qualité de base | Donner une vue consolidée et chiffrée de la qualité des contacts (emails, attribution, activité) |
| O3 — Cohérence lifecycle | Détecter les incohérences lifecycle stage / deals qui faussent le pipeline |
| O4 — Actionabilité | Chaque problème détecté est accompagné d'un impact business et d'un niveau d'urgence |

### KPIs

| KPI | Cible | Méthode de mesure |
|---|---|---|
| Taux de workspaces avec au moins 1 cluster de doublons détecté | > 80% | Analytics sur les audits exécutés |
| Durée médiane de l'audit contacts | < 90 secondes sur workspace < 50 000 contacts | Monitoring temps d'exécution |
| Taux de faux positifs doublons signalés | < 5% des clusters | Retours utilisateurs en beta |
| Taux de partage du rapport dans les 7 jours | > 30% | Tracking événement `report_shared` |

### Métriques garde-fous
- Aucune écriture ou modification dans HubSpot (non-destructif absolu)
- La migration P7-P11 → C-01-C-05 ne change pas les résultats de détection (regression testing)
- Les grace periods (7j) sont appliquées systématiquement sur C-10, C-11, C-12

---

## 4. Périmètre

### In scope

- Migration des règles P7-P11 vers le domaine Contacts (renumérotées C-01 à C-05)
- 4 nouvelles règles de détection de doublons multi-critères (C-06, C-07, C-08)
- 4 nouvelles règles de qualité (C-09, C-10, C-11, C-12)
- Algorithmes de normalisation (email, téléphone, noms) avec détail en section 6
- Calcul du score de santé Contacts avec contribution au score global
- Présentation des clusters de doublons avec tri par taille décroissante
- Grace period de 7 jours sur C-10, C-11, C-12
- Pagination des listes de résultats au-delà de 20 items

### Out of scope (phase NOW)

- Fusion automatique de doublons (l'outil est non-destructif par principe)
- Détection de doublons cross-workspace
- Enrichissement de contacts (complétion automatique des champs vides)
- Deep links vers les contacts HubSpot depuis le rapport — NEXT phase
- Feature "ignorer un doublon" (won't fix pour les prochains audits) — NEXT phase
- Détection de doublons par adresse postale ou localisation géographique
- Export CSV des clusters de doublons — NEXT phase

---

## 5. User stories associées

| ID | Titre | Priorité |
|---|---|---|
| EP-05-S1 | Vue d'ensemble de l'audit contacts | Must have |
| EP-05-S2 | Détection des doublons | Must have |
| EP-05-S3 | Qualité des données contacts | Must have |
| EP-05-S4 | Cohérence lifecycle stage | Must have |
| EP-05-S5 | Impact business par catégorie de problème | Must have |

Les stories complètes avec leurs critères d'acceptance Given/When/Then sont définies dans le fichier `/epics/ep05-audit-contacts.md`.

---

## 6. Spécifications fonctionnelles

### 6.1 Condition d'activation du domaine Contacts

Le domaine Contacts est activé si le workspace contient au moins 1 contact. Si 0 contact, le domaine est désactivé et son poids est redistribué sur les domaines actifs.

### 6.2 Règles migrées depuis EP-02 (C-01 à C-05)

Ces règles sont identiques aux anciennes P7 à P11 dans leur logique de détection. Seuls les IDs et la criticité de C-05 changent.

#### C-01 — Taux email insuffisant (Critique 🔴)

**Condition :** (nombre de contacts avec `email` non-null et non-vide) / (nombre total de contacts) < 80%

**Affichage :** taux mesuré en % + nombre de contacts sans email + barre de progression colorée (rouge si sous seuil, verte sinon) + seuil cible affiché (80%).

**Impact business associé :** voir table section 6.7.

#### C-02 — Contact sans nom (Critique 🔴)

**Condition :** contact où `firstname` ET `lastname` sont tous les deux null ou vides simultanément.

**Affichage :** nombre total de contacts concernés + preview de 5 exemples (Hub ID du contact + date de création).

#### C-03 — Taux lifecycle insuffisant (Avertissement 🟡)

**Condition :** (nombre de contacts avec `lifecyclestage` non-null et non-vide) / (nombre total de contacts) < 60%

**Affichage :** taux mesuré + nombre de contacts sans lifecycle stage + barre de progression + seuil cible (60%).

#### C-04a — Deal Closed Won sans statut Customer (Avertissement 🟡)

**Condition :** contact associé à au moins 1 deal avec statut `closedwon` ET `lifecyclestage` ≠ `customer`

**Affichage :** nombre total de contacts concernés + explication : "Ces contacts ont un deal gagné associé mais leur lifecycle stage n'est pas 'Customer'" + preview de 5 exemples (Hub ID contact, lifecycle stage actuel, nombre de deals Closed Won associés).

#### C-04b — Customer sans deal Closed Won (Info 🔵)

**Condition :** contact avec `lifecyclestage` = `customer` ET 0 deal associé avec statut `closedwon`

**Affichage :** nombre total de contacts concernés + explication de l'incohérence.

#### C-04c — Absence MQL/SQL avec pipeline actif (Avertissement 🟡)

**Condition :** 0 contact avec `lifecyclestage` = `marketingqualifiedlead` ET 0 contact avec `lifecyclestage` = `salesqualifiedlead` dans le workspace ET au moins 1 deal en statut `open` existe

**Affichage :** message d'alerte avec explication business : "Votre workspace contient des deals actifs mais aucun contact MQL ou SQL. Le lifecycle stage n'est peut-être pas utilisé comme outil de qualification."

#### C-04d — Lead avec deal actif (Info 🔵)

**Condition :** contact avec `lifecyclestage` = `subscriber` ou `lead` ET au moins 1 deal associé en statut `open`

**Affichage :** nombre total de contacts concernés + explication : "Ces contacts ont un deal actif associé mais un lifecycle stage de 'Lead' ou 'Subscriber', ce qui indique un manque de mise à jour du statut."

#### C-05 — Association contact-company insuffisante (Info 🔵)

**Condition :** (nombre de contacts avec au moins 1 company associée) / (nombre total de contacts) < 60%

**Désactivation automatique :** cette règle est désactivée si le workspace contient 0 company au total. Le rapport indique alors : "Règle C-05 non applicable — aucune company détectée dans ce workspace (usage B2C possible)."

**Affichage :** taux mesuré + nombre de contacts non associés à une company + barre de progression + seuil cible (60%).

> **Note changement de criticité :** C-05 passe de Critique (ex-P11) à Info. L'absence d'association contact-company est fréquente et légitime en contexte B2C ou dans les workspaces à usage marketing pur.

---

### 6.3 Règles de détection de doublons (C-06 à C-08)

#### C-06 — Doublons email exact (Critique 🔴)

**Condition :** ≥ 2 contacts avec le même email après normalisation

**Algorithme de normalisation email :**
```
1. lowercase(email)
2. trim(email)                             → suppression espaces début/fin
3. strip_subaddressing(email)              → "user+alias@domain.com" → "user@domain.com"
   Regex : supprimer /\+[^@]*/ avant le @
4. Grouper les contacts par email normalisé
5. Créer un cluster pour chaque email ayant ≥ 2 contacts
```

**Affichage :** liste des clusters triée par taille décroissante. Pour chaque cluster : email normalisé, nombre de contacts dans le cluster, liste des contacts (Hub ID, nom complet, email original, date de création).

**Comptage :** 1 problème = 1 cluster (pas 1 par contact dans le cluster).

#### C-07 — Doublons nom+company (Avertissement 🟡)

**Condition :** ≥ 2 contacts avec firstname+lastname similaires (Levenshtein > 85%) ET la même company associée

**Algorithme :**
```
1. Concaténer firstname + " " + lastname → fullname
2. lowercase(fullname), trim
3. Pour les contacts ayant la même company associée (par Hub ID company) :
   - Calculer la similarité Levenshtein normalisée entre chaque paire de fullnames
   - Similarité = 1 - (distance_levenshtein / max(len(a), len(b)))
   - Si similarité > 0.85 → créer un cluster
4. Fusionner les clusters transitifs (si A~B et B~C, alors {A,B,C})
```

**Désactivation automatique :** règle désactivée si 0 company dans le workspace.

**Affichage :** clusters triés par taille décroissante. Pour chaque cluster : company associée, contacts dans le cluster (Hub ID, nom complet, score de similarité avec le premier membre du cluster).

#### C-08 — Doublons téléphone (Avertissement 🟡)

**Condition :** ≥ 2 contacts avec le même numéro de téléphone après normalisation (champs `phone` et `mobilephone`)

**Algorithme de normalisation téléphone :**
```
1. Prendre les champs phone ET mobilephone de chaque contact
2. Pour chaque numéro :
   a. Supprimer tous les caractères non-numériques sauf le + initial
   b. Convertir les préfixes internationaux FR : +33 → 0
   c. Supprimer le + initial restant
   d. Résultat = chaîne de chiffres uniquement
3. Filtre anti-faux-positifs : ignorer les numéros normalisés < 8 chiffres
4. Grouper les contacts par numéro normalisé (phone et mobilephone traités comme un pool)
5. Créer un cluster pour chaque numéro ayant ≥ 2 contacts
```

**Affichage :** clusters triés par taille décroissante. Pour chaque cluster : numéro normalisé, nombre de contacts, liste des contacts (Hub ID, nom complet, numéro original, champ source phone/mobilephone).

---

### 6.4 Règles de qualité (C-09 à C-12)

#### C-09 — Email invalide (Avertissement 🟡)

**Condition :** champ `email` non-null et non-vide, mais format invalide.

**Regex de validation :**
```
^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$
```

**Affichage :** nombre total de contacts concernés + liste paginée : Hub ID, email invalide, date de création. Triée par date de création descendante.

#### C-10 — Contact inactif / stale (Info 🔵)

**Condition :** `lastmodifieddate` > 365 jours par rapport à la date d'exécution de l'audit ET `lifecyclestage` ≠ `customer` ET 0 deal en statut `open` associé

**Grace period :** contacts avec `createdate` < 7 jours exclus.

**Affichage :** nombre total + liste paginée : Hub ID, nom, lifecycle stage, dernière modification, ancienneté d'inactivité en jours. Triée par ancienneté d'inactivité décroissante.

#### C-11 — Contact sans owner (Info 🔵)

**Condition :** `hubspot_owner_id` null ou vide

**Grace period :** contacts avec `createdate` < 7 jours exclus.

**Affichage :** nombre total + liste paginée : Hub ID, nom, lifecycle stage, date de création. Triée par date de création ascendante.

#### C-12 — Contact sans source (Info 🔵)

**Condition :** `hs_analytics_source` null ou vide

**Grace period :** contacts avec `createdate` < 7 jours exclus.

**Affichage :** nombre total + liste paginée : Hub ID, nom, date de création. Triée par date de création ascendante.

---

### 6.5 Comptage des problèmes pour le scoring

| Type de règle | Comptage |
|---|---|
| Règles taux global (C-01, C-03, C-05) | 1 problème unique si seuil franchi |
| Règle comptage (C-02) | 1 problème unique si count > 0 |
| Règles lifecycle (C-04a, C-04b, C-04c, C-04d) | 1 problème chacune si déclenchée |
| Règles doublons (C-06, C-07, C-08) | 1 problème par cluster |
| Règles qualité unitaires (C-09, C-10, C-11, C-12) | 1 problème par contact concerné |

---

### 6.6 Calcul du score de santé Contacts

**Formule :**

```
Score_contacts = 100
  − (nb_critiques × 5)     → plafonné à −30
  − (nb_avertissements × 2) → plafonné à −15
  − (nb_infos × 0,5)        → plafonné à −5

Score_contacts = max(0, Score_contacts)
```

**Niveaux de lecture du score :**

| Score | Label | Couleur |
|---|---|---|
| 0 – 49 | Critique | Rouge 🔴 |
| 50 – 69 | À améliorer | Orange 🟡 |
| 70 – 89 | Bon | Vert 🟢 |
| 90 – 100 | Excellent | Vert foncé ✅ |

**Contribution au score global :**

```
Score_global = moyenne pondérée à poids égaux des domaines actifs

Avec EP-05 (3 domaines) :
Score_global = (Score_proprietes + Score_contacts + Score_workflows) / 3

Si un domaine est inactif (ex. 0 workflow) :
Score_global = somme des scores actifs / nombre de domaines actifs
```

---

### 6.7 Traductions business par règle

| Règle(s) | Titre business | Estimation d'impact | Urgence |
|---|---|---|---|
| C-01, C-02 | Contacts inexploitables pour le marketing et le commercial | Des contacts sans email ni nom ne peuvent pas être ciblés en emailing ni assignés correctement. Chaque contact de ce type est une opportunité commerciale aveugle. | Élevé |
| C-03, C-04a–d | Pipeline et segmentation non fiables | Un lifecycle stage incorrect ou manquant fausse la vue du pipeline, les taux de conversion et les décisions de ciblage. Les rapports de direction sont potentiellement basés sur des données erronées. | Élevé |
| C-05 | Impossibilité d'analyser les données par compte | Sans association contact-entreprise, les analyses account-based (ABM) sont impossibles et le chiffre d'affaires par client ne peut pas être calculé fiablement. | Moyen |
| C-06 | Base contacts polluée par des doublons | Les doublons email faussent les métriques marketing (taux d'ouverture, d'engagement), doublent les coûts d'emailing et créent de la confusion chez les commerciaux qui voient plusieurs fiches pour le même prospect. | Élevé |
| C-07, C-08 | Risque de doublons non détectés | Des contacts avec des noms ou numéros similaires mais des emails différents peuvent représenter la même personne — leads contactés en double, historique d'interactions fragmenté. | Moyen |
| C-09 | Emails non délivrables dans la base | Des emails au format invalide polluent les listes d'envoi, dégradent la réputation d'expéditeur et faussent les métriques de délivrabilité. | Moyen |
| C-10 | Contacts fantômes dans la base | Des contacts inactifs depuis plus d'un an gonflent artificiellement la taille de la base, augmentent les coûts de licence HubSpot et faussent les métriques de segmentation. | Faible |
| C-11, C-12 | Manque de traçabilité et d'attribution | Des contacts sans owner ni source rendent impossible l'attribution des leads et le suivi de la performance des canaux d'acquisition. | Faible |

---

### 6.8 Présentation des résultats dans le rapport

#### Structure de la section Contacts dans le rapport

1. **En-tête de domaine** : score de santé Contacts (sur 100) avec label coloré + décompte synthétique (X critiques / Y avertissements / Z infos)
2. **Résumé** : nombre total de contacts analysés
3. **Bloc Doublons** : regroupé par règle (C-06, C-07, C-08), chaque règle avec son label, sa criticité, le nombre de clusters, et la liste détaillée paginée
4. **Bloc Qualité** : regroupé par règle (C-09, C-10, C-11, C-12), chaque règle avec son résultat
5. **Bloc Cohérence lifecycle** : regroupé par règle (C-01 à C-05), chaque règle avec son résultat
6. **Bloc Impact business** : regroupé par thème business, visible uniquement si au moins une règle est déclenchée

#### Règles d'affichage

- Si une règle ne détecte aucun problème : afficher "✅ Aucun problème détecté"
- Si une liste dépasse 20 items : pagination avec 20 items par page
- Les clusters de doublons sont toujours triés par taille décroissante (les plus gros en premier)
- Les listes d'exemples dans les règles taux/lifecycle sont limitées à 5 exemples en preview avec un lien "Voir tous les [N] cas"

---

### 6.9 Appels API HubSpot nécessaires

| Information récupérée | Endpoint HubSpot | Usage |
|---|---|---|
| Liste des contacts avec propriétés | `POST /crm/v3/objects/contacts/search` | Toutes les règles |
| Propriétés récupérées par contact | `email`, `firstname`, `lastname`, `lifecyclestage`, `hubspot_owner_id`, `hs_analytics_source`, `phone`, `mobilephone`, `lastmodifieddate`, `createdate` | C-01 à C-12 |
| Associations contact → deals | `GET /crm/v4/objects/contacts/{id}/associations/deals` ou batch | C-04a, C-04b, C-04d |
| Statut des deals associés | `POST /crm/v3/objects/deals/search` ou batch | C-04a, C-04b, C-04c, C-04d |
| Associations contact → companies | `GET /crm/v4/objects/contacts/{id}/associations/companies` ou batch | C-05, C-07 |
| Nombre total de companies | `GET /crm/v3/objects/companies` avec limit=0 | C-05, C-07 (activation/désactivation) |

**Gestion du rate limiting :** l'audit contacts nécessite de nombreux appels pour les workspaces de grande taille. Implémenter une stratégie de batching et de retry avec backoff exponentiel (voir EP-01 section 6.6).

**Objectif de performance :** le temps total d'exécution de l'audit contacts doit être inférieur à 90 secondes pour un workspace contenant moins de 50 000 contacts (à valider — Q4 en question ouverte).

---

## 7. Dépendances & risques

### Dépendances

| Dépendance | Nature | Impact si bloquant |
|---|---|---|
| **EP-01 — Connexion HubSpot OAuth** | Prérequis : token d'accès valide avec les scopes nécessaires | Bloquant — aucun appel API possible sans token |
| **EP-02 — Audit des propriétés** | Migration : les règles P7-P11 sont retirées de EP-02 et migrées vers EP-05 | L'implémentation EP-05 doit retirer P7-P11 de EP-02 simultanément |
| **EP-04 — Tableau de bord** | Consomme le score Contacts et les résultats. La formule du score global doit passer à pondération égale | Mise à jour du calcul du score global nécessaire |

### Risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| R1 — Faux positifs doublons nom+company (Levenshtein trop sensible) | Moyenne | Moyen (perte de confiance) | Seuil 85% conservateur + validation en beta + désactivation possible si 0 company |
| R2 — Performance sur workspaces > 50 000 contacts | Moyenne | Élevé | Implémenter un mode d'audit asynchrone ; optimiser les algorithmes de normalisation (hash-based grouping au lieu de comparaison exhaustive) |
| R3 — Normalisation email : sous-adressage trop agressif | Faible | Faible | Proposé comme défaut OUI, question ouverte Q1 pour validation PO |
| R4 — Normalisation téléphone : formats internationaux non couverts | Moyenne | Faible | Phase NOW : France (+33) uniquement. Extension internationale en NEXT |
| R5 — Migration P7-P11 → C-01-C-05 : regression | Faible | Élevé | Tests de regression systématiques : les résultats post-migration doivent être identiques |
| R6 — Rate limiting HubSpot sur les associations (C-04, C-05, C-07) | Moyenne | Moyen | Batch les appels d'associations ; pré-calculer les associations en amont |

### Questions ouvertes

| Question | Décision |
|---|---|
| Sous-adressage email (+alias) dans normalisation C-06 ? | Proposé OUI — à valider PO |
| Seuil Levenshtein 85% pour noms (C-07) ? | À valider en beta |
| Seuil 365 jours pour contacts stale (C-10) ? | Proposé OUI — à valider PO |
| Budget perf 90s sur workspace < 50 000 contacts ? | Décision PO nécessaire |
| C-05 (ex-P11) : garder Info ou remonter en Avertissement ? | Décision PO nécessaire |

---

## 8. Critères d'acceptance

- [ ] Les 12 règles C-01 à C-12 sont détectées et affichées correctement sur un workspace de test
- [ ] Les règles migrées (C-01 à C-05) produisent les mêmes résultats que les anciennes P7 à P11 (regression testing)
- [ ] Les règles P7 à P11 sont retirées du domaine Propriétés (EP-02)
- [ ] La normalisation email (C-06) applique lowercase + trim + strip sous-adressage
- [ ] La normalisation téléphone (C-08) gère les formats FR (+33→0) avec minimum 8 chiffres
- [ ] La similarité Levenshtein (C-07) est correctement calculée avec seuil > 85%
- [ ] Les règles C-05 et C-07 sont désactivées si 0 company dans le workspace
- [ ] Les règles C-10, C-11, C-12 excluent les contacts créés il y a moins de 7 jours (grace period)
- [ ] Le score Contacts est calculé selon la formule définie en section 6.6
- [ ] Le score global utilise une pondération égale entre domaines actifs
- [ ] Chaque problème détecté affiche son impact business correspondant (titre, estimation, urgence)
- [ ] Les clusters de doublons sont affichés par taille décroissante
- [ ] Les listes de résultats dépassant 20 items sont paginées (20 items par page)
- [ ] L'audit est non-destructif : aucune requête en écriture ni en suppression n'est envoyée à HubSpot
- [ ] Un workspace sans aucun contact affiche un état vide avec mention "domaine non analysé"
