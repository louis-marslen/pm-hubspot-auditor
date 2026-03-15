# PRD-05b — Audit des companies HubSpot

**Epic associé :** EP-05b
**Version :** 1.0
**Date :** 2026-03-15
**Statut :** Prêt pour développement

---

## 1. Résumé exécutif

EP-05b définit le moteur d'analyse des companies HubSpot : détection de doublons (domain exact, noms similaires), évaluation de la qualité des données (taux de remplissage domain, companies orphelines, données incomplètes), et identification des companies stale. L'audit applique 8 règles (CO-01 à CO-08), dont 1 migrée depuis l'audit Propriétés (ex-P12) et 7 nouvelles. Il calcule un score de santé "Companies" contribuant au score global avec pondération égale entre domaines actifs.

Cet epic est le pendant B2B de EP-05 (Contacts). Ensemble, ils couvrent les deux objets fondamentaux du CRM et permettent une analyse croisée (contacts sans company, companies sans contact).

**Décisions PO actées dans ce PRD :**
- Migration P12 → CO-01 intégrée dans cet epic (pas d'epic migration séparé)
- Domaine activé si ≥ 1 company dans le workspace. Sinon désactivé, poids redistribué
- Abréviations (Saint/St., International/Intl.) non gérées en v1
- Grace period 90 jours pour CO-04 (company sans contact)
- Vision cible : le domaine Propriétés sera à terme dissous, P12 migré ici est un premier pas

---

## 2. Problème utilisateur

### Narrative du problème

**Je suis :** Marc, RevOps Manager dans une ETI B2B de 300 personnes avec 8 000 companies dans HubSpot
- Mon équipe commerciale crée des fiches companies manuellement, parfois en doublon de fiches créées automatiquement par les intégrations
- Je sais que "Acme SAS" et "ACME" et "acme.com" sont la même entreprise, mais HubSpot ne les rapproche pas
- Mon reporting CA par client est faussé parce que les deals sont répartis sur des fiches en doublon

**J'essaie de :**
- Identifier les doublons de companies et évaluer la qualité globale de ma base entreprises en moins de 5 minutes

**Mais :**
- HubSpot ne propose pas de détection de doublons companies suffisamment fine (les variantes de noms avec suffixes juridiques ne sont pas gérées)
- Je n'ai aucune vue consolidée de la qualité de ma base companies (taux de remplissage domain, industry, etc.)

**Parce que :**
- Aucun outil natif ne combine normalisation de noms d'entreprise et audit qualité des companies

**Ce qui me fait ressentir :**
- Frustré de voir le CA fragmenté entre des fiches en doublon
- Inquiet quand le directeur commercial demande un reporting par client et que les chiffres ne collent pas

### Énoncé du problème

Les RevOps Managers B2B ont besoin d'un moyen d'identifier les doublons de companies et d'évaluer la qualité de leur base entreprises parce que les outils natifs HubSpot ne normalisent pas suffisamment les noms d'entreprise, ce qui fausse le reporting CA par client et la segmentation account-based.

### Contexte

Dans un workspace HubSpot B2B, les companies sont l'objet central autour duquel s'organisent les contacts, les deals et l'historique commercial. Des doublons de companies fragmentent cet historique : le CA est réparti sur plusieurs fiches, les contacts sont associés à la mauvaise entité, et les analyses ABM (Account-Based Marketing) deviennent non fiables. Au-delà des doublons, des companies sans domain, sans industrie ou sans dimensionnement rendent impossible la segmentation stratégique par taille ou secteur.

### Problèmes spécifiques adressés

1. **Doublons non détectés** : des companies représentant la même entité coexistent avec des noms légèrement différents (suffixes juridiques, casse, www.)
2. **CA fragmenté** : les deals répartis sur des fiches en doublon faussent le reporting par client
3. **Companies orphelines** : des fiches companies sans contact associé polluent la base sans valeur commerciale
4. **Données incomplètes** : des companies sans domain, industrie ou dimensionnement empêchent la segmentation stratégique

---

## 2bis. Personas & Jobs-to-be-Done

### Marc RevOps B2B *(persona primaire)*

**Jobs fonctionnels :**
- Identifier tous les clusters de doublons companies pour consolider le CA par client
- Évaluer le taux de companies avec domain, industrie et dimensionnement renseignés
- Détecter les companies orphelines (sans contact) qui polluent la base

**Jobs sociaux :**
- Produire un reporting CA par client fiable pour le directeur commercial
- Montrer à la direction que la base CRM est maîtrisée

**Jobs émotionnels :**
- Se sentir en confiance sur la fiabilité du reporting commercial
- Ne plus craindre les incohérences quand les chiffres sont présentés en comité de direction

**Douleurs clés :**
- CA réparti sur des fiches en doublon sans outil pour les rapprocher
- Aucune vue consolidée de la qualité des données companies

---

### Louis Consultant *(persona secondaire)*

**Jobs fonctionnels :**
- Diagnostiquer la qualité de la base companies d'un client en kick-off
- Identifier les doublons companies pour proposer un chantier de nettoyage

**Douleurs clés :**
- Pas d'outil pour comparer les noms d'entreprise avec normalisation des suffixes juridiques

---

## 2ter. Contexte stratégique

**Lien avec la vision produit :** l'audit companies complète l'audit contacts (EP-05) pour couvrir les deux objets fondamentaux du CRM B2B. Ensemble, ils permettent une analyse croisée (contacts sans company, companies sans contact).

**Pourquoi maintenant :** EP-05b suit immédiatement EP-05 pour maximiser la couverture d'audit sur les objets core. Le développement est facilité par la réutilisation des patterns de EP-05 (normalisation, clustering, scoring).

**Indicateur différenciant :** la normalisation des noms d'entreprise avec strip des suffixes juridiques (SAS, SARL, Ltd, Inc, GmbH, LLC) est une fonctionnalité que HubSpot natif ne propose pas.

---

## 2quart. Vue d'ensemble de la solution

Nous construisons un moteur d'analyse qui appelle l'API HubSpot via le token OAuth (EP-01), détecte 8 règles de qualité et de doublons sur les companies, calcule un score de santé Companies, et présente chaque problème avec son impact business.

**Comment ça fonctionne :**
1. Récupération de toutes les companies du workspace via l'API HubSpot (avec les propriétés nécessaires)
2. Normalisation des données pour la détection de doublons (domain, noms d'entreprise)
3. Détection de doublons par clustering sur chaque critère
4. Application des règles de qualité (CO-01, CO-04 à CO-08)
5. Calcul du score de santé Companies
6. Présentation des résultats avec clusters de doublons et impact business

**Features clés :** détection doublons domain et noms (CO-02, CO-03), audit qualité (CO-01, CO-04 à CO-08), score de santé, activation conditionnelle, traductions business.

**Considérations UX :**
- **Parcours utilisateur :** l'audit companies s'exécute dans le flux d'audit global. Les résultats apparaissent comme un onglet "Companies" dans la navigation intra-page sticky, entre "Deals" et "Workflows". Le badge de l'onglet affiche le nombre total de problèmes companies. Si 0 company dans le workspace, l'onglet n'apparaît pas.
- **États clés :**
  - *Empty state / domaine inactif* : si 0 company, l'onglet Companies est masqué. Mention dans les métadonnées : "Domaine Companies non analysé — aucune company détectée".
  - *Loading* : l'étape "Analyse des companies" apparaît dans la progression étape par étape.
  - *Succès* : la section Companies affiche le score circle + décompte par criticité.
  - *Erreur* : alert rouge dans la section si l'API companies échoue.
- **Composants UI existants à réutiliser :** `ScoreCircle`, `SeverityBadge`, `RuleCard`, `ProgressBar` (CO-01), `PaginatedList` (listes > 20 items), `Badge`, `EmptyState`.
- **Pattern UI — Clusters de doublons :** réutilise le pattern "cluster" introduit par EP-05 pour C-06/C-07/C-08. Les clusters companies affichent en plus le nombre de contacts et deals associés à chaque membre du cluster (aide à décider quelle fiche conserver lors de la fusion).

---

## 3. Objectifs & métriques de succès

### Objectifs

| Objectif | Description |
|---|---|
| O1 — Détection automatique de doublons companies | Identifier les clusters de doublons par domain et par nom normalisé |
| O2 — Évaluation qualité de base companies | Donner une vue consolidée de la complétude des données companies |
| O3 — Identification des companies orphelines | Détecter les fiches sans contact qui polluent la base |
| O4 — Actionabilité | Chaque problème détecté est accompagné d'un impact business |

### KPIs

| KPI | Cible | Méthode de mesure |
|---|---|---|
| Taux de workspaces B2B avec au moins 1 cluster de doublons companies | > 60% | Analytics sur les audits exécutés |
| Durée médiane de l'audit companies | < 30 secondes | Monitoring temps d'exécution |
| Taux de faux positifs doublons noms signalés | < 5% des clusters | Retours utilisateurs en beta |

### Métriques garde-fous
- Aucune écriture ou modification dans HubSpot (non-destructif absolu)
- La migration P12 → CO-01 ne change pas les résultats de détection (regression testing)
- Le domaine Companies est désactivé si 0 company (pas de résultat vide affiché)

---

## 4. Périmètre

### In scope

- Migration de la règle P12 vers le domaine Companies (renumérotée CO-01)
- 2 nouvelles règles de détection de doublons (CO-02, CO-03)
- 5 nouvelles règles de qualité (CO-04 à CO-08)
- Algorithmes de normalisation (domain, noms d'entreprise) avec détail en section 6
- Calcul du score de santé Companies avec contribution au score global
- Activation conditionnelle : domaine actif si ≥ 1 company
- Présentation des clusters de doublons avec tri par taille décroissante

### Out of scope (phase NOW)

- Fusion automatique de companies (l'outil est non-destructif par principe)
- Détection de doublons cross-workspace
- Enrichissement de companies via API tierces
- Hiérarchie parent-enfant des companies (structures de groupe)
- Gestion des abréviations (Saint/St., International/Intl.) dans CO-03 — v1 limité aux suffixes juridiques
- Deep links vers les companies HubSpot depuis le rapport — NEXT phase
- Export CSV des clusters de doublons — NEXT phase

---

## 5. User stories associées

| ID | Titre | Priorité |
|---|---|---|
| EP-05b-S1 | Vue d'ensemble de l'audit companies | Must have |
| EP-05b-S2 | Détection des doublons entreprises | Must have |
| EP-05b-S3 | Qualité des données companies | Must have |
| EP-05b-S4 | Impact business | Must have |

Les stories complètes avec leurs critères d'acceptance Given/When/Then sont définies dans le fichier `/epics/ep05b-audit-companies.md`.

---

## 6. Spécifications fonctionnelles

### 6.1 Condition d'activation du domaine Companies

Le domaine Companies est activé si le workspace contient au moins 1 company. Si 0 company :
- Le domaine n'apparaît pas dans le rapport
- Son poids est redistribué sur les domaines actifs dans le calcul du score global
- Une mention dans les métadonnées de l'audit indique : "Domaine Companies non analysé — aucune company détectée"

### 6.2 Règle migrée depuis EP-02 (CO-01)

#### CO-01 — Taux domain insuffisant (Critique 🔴)

**Condition :** (nombre de companies avec `domain` non-null et non-vide) / (nombre total de companies) < 70%

**Affichage :** taux mesuré en % + nombre de companies sans domain + barre de progression colorée (rouge si sous seuil, verte sinon) + seuil cible affiché (70%).

**Impact business associé :** voir table section 6.7.

---

### 6.3 Règles de détection de doublons (CO-02, CO-03)

#### CO-02 — Doublons domain exact (Critique 🔴)

**Condition :** ≥ 2 companies avec le même domain après normalisation

**Algorithme de normalisation domain :**
```
1. lowercase(domain)
2. trim(domain)
3. strip_www(domain)                    → "www.acme.com" → "acme.com"
   Regex : supprimer /^www\./ au début
4. Grouper les companies par domain normalisé
5. Exclure les companies sans domain (domain null ou vide)
6. Créer un cluster pour chaque domain ayant ≥ 2 companies
```

**Affichage :** liste des clusters triée par taille décroissante. Pour chaque cluster : domain normalisé, nombre de companies dans le cluster, liste des companies (Hub ID, nom, domain original, date de création, nombre de contacts associés, nombre de deals associés).

**Comptage :** 1 problème = 1 cluster.

#### CO-03 — Doublons nom entreprise (Avertissement 🟡)

**Condition :** ≥ 2 companies avec le même nom après normalisation (Levenshtein > 85%)

**Algorithme de normalisation nom d'entreprise :**
```
1. lowercase(name)
2. trim(name)
3. strip_legal_suffixes(name)           → supprimer les suffixes juridiques
   Suffixes à supprimer (regex insensible à la casse, en fin de chaîne) :
   - \b(sas|sarl|sa|eurl|sasu|sci)\b
   - \b(ltd|limited|inc|incorporated|corp|corporation)\b
   - \b(gmbh|ag|ug)\b
   - \b(llc|llp|lp)\b
   - \b(bv|nv)\b
   - Points et virgules associés (ex. "Ltd." → supprimé)
4. trim(name)                           → re-trim après strip des suffixes
5. Pour toutes les paires de companies :
   - Calculer la similarité Levenshtein normalisée
   - Similarité = 1 - (distance_levenshtein / max(len(a), len(b)))
   - Si similarité > 0.85 → créer un cluster
6. Fusionner les clusters transitifs (si A~B et B~C, alors {A,B,C})
```

**Exclusion :** les companies sans nom (`name` null ou vide) sont exclues de CO-03.

**Affichage :** clusters triés par taille décroissante. Pour chaque cluster : noms originaux des companies, score de similarité entre les membres, Hub IDs, domains respectifs, nombre de contacts et deals associés.

---

### 6.4 Règles de qualité (CO-04 à CO-08)

#### CO-04 — Company sans contact (Avertissement 🟡)

**Condition :** 0 contact associé à la company ET `createdate` > 90 jours par rapport à la date d'exécution de l'audit

**Grace period :** companies créées il y a moins de 90 jours sont exclues.

**Affichage :** nombre total de companies concernées + liste paginée : Hub ID, nom, domain, date de création, ancienneté en jours. Triée par ancienneté décroissante.

#### CO-05 — Company sans owner (Info 🔵)

**Condition :** `hubspot_owner_id` null ou vide

**Affichage :** nombre total + liste paginée : Hub ID, nom, domain, date de création. Triée par date de création ascendante.

#### CO-06 — Company sans industrie (Info 🔵)

**Condition :** `industry` null ou vide

**Affichage :** nombre total + liste paginée : Hub ID, nom, domain. Triée par nom alphabétique.

#### CO-07 — Company sans dimensionnement (Info 🔵)

**Condition :** `numberofemployees` null/vide ET `annualrevenue` null/vide (les deux simultanément)

**Affichage :** nombre total + liste paginée : Hub ID, nom, domain, industry (si renseigné). Triée par nom alphabétique.

#### CO-08 — Company inactive / stale (Info 🔵)

**Condition :** `lastmodifieddate` > 365 jours par rapport à la date d'exécution de l'audit ET 0 deal en statut `open` associé ET 0 contact avec `lastmodifieddate` < 365 jours associé

**Logique :** une company est considérée active si elle-même, un deal ou un contact associé a été modifié dans les 365 derniers jours.

**Affichage :** nombre total + liste paginée : Hub ID, nom, domain, dernière modification, ancienneté d'inactivité en jours. Triée par ancienneté décroissante.

---

### 6.5 Comptage des problèmes pour le scoring

| Type de règle | Comptage |
|---|---|
| Règle taux global (CO-01) | 1 problème unique si seuil franchi |
| Règles doublons (CO-02, CO-03) | 1 problème par cluster |
| Règles qualité unitaires (CO-04 à CO-08) | 1 problème par company concernée |

---

### 6.6 Calcul du score de santé Companies

**Formule :**

```
Score_companies = 100
  − (nb_critiques × 5)     → plafonné à −30
  − (nb_avertissements × 2) → plafonné à −15
  − (nb_infos × 0,5)        → plafonné à −5

Score_companies = max(0, Score_companies)
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

Avec EP-05b (4 domaines) :
Score_global = (Score_proprietes + Score_contacts + Score_companies + Score_workflows) / 4

Si un domaine est inactif (ex. 0 company) :
Score_global = somme des scores actifs / nombre de domaines actifs
```

---

### 6.7 Traductions business par règle

| Règle(s) | Titre business | Estimation d'impact | Urgence |
|---|---|---|---|
| CO-01 | Companies sans identité web | Des entreprises sans domaine ne peuvent pas être dédupliquées automatiquement, ni enrichies via les outils d'enrichissement HubSpot. L'identification et le suivi des comptes sont compromis. | Élevé |
| CO-02 | Base entreprises polluée par des doublons | Des companies en doublon fragmentent le CA par client, créent des incohérences dans les rapports account-based et empêchent de calculer un chiffre d'affaires fiable par client. | Élevé |
| CO-03 | Risque de doublons entreprises non détectés | Des companies avec des noms similaires mais des domains différents peuvent représenter la même entité — historique commercial fragmenté, deals attribués à la mauvaise fiche. | Moyen |
| CO-04 | Companies orphelines sans valeur commerciale | Des fiches entreprises sans aucun contact associé depuis plus de 90 jours n'ont aucune valeur commerciale directe et polluent la base. | Moyen |
| CO-05, CO-06, CO-07 | Données entreprises incomplètes | Des companies sans owner, sans industrie ou sans dimensionnement rendent impossible la segmentation par taille, secteur ou territoire. Les rapports stratégiques sont faussés. | Faible |
| CO-08 | Companies fantômes dans la base | Des companies inactives depuis plus d'un an gonflent la base et faussent les métriques de couverture marché. | Faible |

---

### 6.8 Présentation des résultats dans le rapport

#### Structure de la section Companies dans le rapport

1. **En-tête de domaine** : score de santé Companies (sur 100) avec label coloré + décompte synthétique (X critiques / Y avertissements / Z infos)
2. **Résumé** : nombre total de companies analysées
3. **Bloc Doublons** : regroupé par règle (CO-02, CO-03), chaque règle avec son label, sa criticité, le nombre de clusters, et la liste détaillée paginée
4. **Bloc Qualité** : regroupé par règle (CO-01, CO-04 à CO-08), chaque règle avec son résultat
5. **Bloc Impact business** : regroupé par thème business, visible uniquement si au moins une règle est déclenchée

#### Règles d'affichage

- Si une règle ne détecte aucun problème : afficher "✅ Aucun problème détecté"
- Si une liste dépasse 20 items : pagination avec 20 items par page
- Les clusters de doublons sont toujours triés par taille décroissante
- Chaque company dans un cluster affiche le nombre de contacts et deals associés (aide à décider laquelle conserver)

---

### 6.9 Appels API HubSpot nécessaires

| Information récupérée | Endpoint HubSpot | Usage |
|---|---|---|
| Liste des companies avec propriétés | `POST /crm/v3/objects/companies/search` | Toutes les règles |
| Propriétés récupérées par company | `name`, `domain`, `industry`, `numberofemployees`, `annualrevenue`, `hubspot_owner_id`, `lastmodifieddate`, `createdate` | CO-01 à CO-08 |
| Associations company → contacts | `GET /crm/v4/objects/companies/{id}/associations/contacts` ou batch | CO-04, CO-08 |
| Associations company → deals | `GET /crm/v4/objects/companies/{id}/associations/deals` ou batch | CO-08, affichage clusters |
| Activité récente des contacts associés | `POST /crm/v3/objects/contacts/search` avec filtre `lastmodifieddate` | CO-08 |

**Gestion du rate limiting :** voir EP-01 section 6.6 pour la politique de retry avec backoff exponentiel.

**Objectif de performance :** le temps total d'exécution de l'audit companies doit être inférieur à 30 secondes (les companies sont généralement moins nombreuses que les contacts).

---

## 7. Dépendances & risques

### Dépendances

| Dépendance | Nature | Impact si bloquant |
|---|---|---|
| **EP-01 — Connexion HubSpot OAuth** | Prérequis : token d'accès valide avec les scopes nécessaires | Bloquant — aucun appel API possible sans token |
| **EP-02 — Audit des propriétés** | Migration : la règle P12 est retirée de EP-02 et migrée vers EP-05b | L'implémentation EP-05b doit retirer P12 de EP-02 simultanément |
| **EP-05 — Audit des contacts** | Prérequis : la formule du score global à pondération égale est introduite par EP-05 | EP-05 doit être livré avant EP-05b |
| **EP-04 — Tableau de bord** | Consomme le score Companies et les résultats | Mise à jour du calcul du score global (4 domaines) |

### Risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| R1 — Faux positifs doublons noms (Levenshtein trop sensible) | Moyenne | Moyen | Seuil 85% conservateur + strip suffixes juridiques + validation en beta |
| R2 — Suffixes juridiques non exhaustifs | Faible | Faible | Liste de suffixes couvrant FR, UK, US, DE, NL. Extension possible en NEXT |
| R3 — CO-08 complexe (requiert associations + activité contacts) | Moyenne | Moyen | Optimiser les requêtes batch ; accepter un traitement asynchrone si > 10 000 companies |
| R4 — Migration P12 → CO-01 : regression | Faible | Élevé | Tests de regression systématiques |

### Questions ouvertes

| Question | Décision |
|---|---|
| Seuil Levenshtein 85% sur noms d'entreprise ? | À valider en beta |
| Gérer les abréviations (Saint/St., International/Intl.) ? | NON en v1 |
| Grace period 90 jours pour CO-04 ? | Proposé OUI — à valider PO |

---

## 8. Critères d'acceptance

- [ ] Les 8 règles CO-01 à CO-08 sont détectées et affichées correctement sur un workspace de test
- [ ] La règle migrée (CO-01) produit les mêmes résultats que l'ancienne P12 (regression testing)
- [ ] La règle P12 est retirée du domaine Propriétés (EP-02)
- [ ] La normalisation domain (CO-02) applique lowercase + trim + strip www.
- [ ] La normalisation noms (CO-03) strip les suffixes juridiques (SAS, SARL, Ltd, Inc, GmbH, LLC, etc.)
- [ ] La similarité Levenshtein (CO-03) est correctement calculée avec seuil > 85%
- [ ] CO-04 exclut les companies créées il y a moins de 90 jours
- [ ] CO-08 exclut les companies avec un deal open ou un contact avec activité récente
- [ ] Le domaine Companies est désactivé si 0 company, avec poids redistribué
- [ ] Le score Companies est calculé selon la formule définie en section 6.6
- [ ] Le score global utilise une pondération égale entre les 4 domaines actifs
- [ ] Chaque problème détecté affiche son impact business correspondant
- [ ] Les clusters de doublons sont affichés par taille décroissante
- [ ] Chaque company dans un cluster affiche le nombre de contacts et deals associés
- [ ] Les listes de résultats dépassant 20 items sont paginées (20 items par page)
- [ ] L'audit est non-destructif : aucune requête en écriture ni en suppression
