# EP-05b — Audit des companies

## Hypothèse

Nous croyons que détecter les doublons d'entreprises et les problèmes de qualité companies permettra aux RevOps Managers de fiabiliser leur segmentation B2B et leur reporting CA par client — parce qu'aujourd'hui les doublons de companies fragmentent l'historique commercial et faussent les analyses account-based, sans aucun outil natif pour les détecter.

Nous mesurerons le succès via : nombre de clusters de doublons companies détectés par audit (cible : > 0 sur 60% des workspaces B2B audités) + taux de correction des problèmes signalés (cible : à établir en beta).

---

## Périmètre

### In scope
- Migration de la règle P12 de l'audit Propriétés vers le domaine Companies (renumérotée CO-01)
- 2 nouvelles règles de détection de doublons (CO-02, CO-03)
- 5 nouvelles règles de qualité companies (CO-04 à CO-08)
- Algorithmes de normalisation pour la détection de doublons (domain, noms d'entreprise)
- Calcul d'un score de santé Companies (contribue au score global avec pondération égale entre domaines actifs)
- Activation conditionnelle : domaine actif uniquement si ≥ 1 company dans le workspace

### Out of scope
- Fusion automatique de companies (l'outil est non-destructif)
- Enrichissement de companies (complétion automatique via API tierces)
- Détection de doublons cross-workspace
- Hiérarchie parent-enfant des companies (analyse des structures de groupe)
- Deep links vers les companies HubSpot depuis le rapport — NEXT phase

---

## User stories

### Story 1 — Vue d'ensemble de l'audit companies

**En tant que** RevOps Manager
**je veux** voir un résumé consolidé de l'état de mes companies dès la fin de l'audit
**afin de** comprendre en 30 secondes l'ampleur des problèmes de qualité et de doublons entreprises

**Critères d'acceptance :**

*Scénario : Affichage du résumé de l'audit companies*
**Étant donné** que l'audit du workspace est terminé et que le workspace contient au moins 1 company
**Quand** j'accède à la section Companies du rapport
**Alors** je vois :
- Le nombre total de companies analysées
- Le décompte des problèmes par criticité : 🔴 X critiques / 🟡 Y avertissements / 🔵 Z informations
- Le score de santé du domaine Companies sur 100
- Un bandeau de statut : Critique (0-49) / À améliorer (50-69) / Bon (70-89) / Excellent (90-100)

*Scénario : Aucune company dans le workspace*
**Étant donné** que le workspace ne contient aucune company
**Quand** j'accède au rapport
**Alors** le domaine Companies n'apparaît pas dans le rapport
**Et** le score global est calculé sans le domaine Companies avec mention explicite

---

### Story 2 — Détection des doublons entreprises

**En tant que** RevOps Manager
**je veux** voir les clusters de doublons d'entreprises détectés par critère (domain, nom) triés par taille décroissante
**afin de** savoir quelles companies fusionner en priorité pour consolider mon historique commercial

**Critères d'acceptance :**

*Scénario : Doublons domain exact (CO-02)*
**Étant donné** que le workspace contient des companies avec le même domain après normalisation
**Quand** je consulte la règle CO-02 dans le rapport
**Alors** je vois les clusters de doublons regroupés par domain normalisé
**Et** chaque cluster affiche : le domain, le nombre de companies dans le cluster, les Hub IDs et noms des companies concernées
**Et** les clusters sont triés par taille décroissante

*Scénario : Doublons nom entreprise (CO-03)*
**Étant donné** que le workspace contient des companies avec des noms similaires (Levenshtein > 85% après strip suffixes)
**Quand** je consulte la règle CO-03
**Alors** je vois les clusters de doublons avec : les noms comparés, le score de similarité, les suffixes strippés
**Et** les clusters sont triés par taille décroissante

*Scénario : Aucun doublon détecté*
**Étant donné** qu'aucun doublon company n'est détecté
**Quand** je consulte les règles CO-02 et CO-03 dans le rapport
**Alors** je vois un état "✅ Aucun doublon détecté" pour chaque règle

---

### Story 3 — Qualité des données companies

**En tant que** RevOps Manager
**je veux** voir les companies avec des problèmes de qualité (sans domain, sans contact, sans owner, sans dimensionnement)
**afin de** identifier les fiches entreprises à enrichir ou nettoyer

**Critères d'acceptance :**

*Scénario : Taux domain insuffisant (CO-01)*
**Étant donné** que le workspace contient des companies
**Quand** je consulte la règle CO-01
**Alors** je vois le taux de remplissage domain en % + barre de progression colorée + seuil cible (70%)

*Scénario : Companies sans contact (CO-04)*
**Étant donné** que le workspace contient des companies créées depuis plus de 90 jours sans contact associé
**Quand** je consulte la règle CO-04
**Alors** je vois le nombre de companies concernées et la liste paginée avec : Hub ID, nom, date de création, ancienneté en jours

*Scénario : Companies sans owner (CO-05)*
**Étant donné** que le workspace contient des companies sans propriétaire assigné
**Quand** je consulte la règle CO-05
**Alors** je vois le nombre total et la liste paginée

*Scénario : Companies sans industrie (CO-06)*
**Étant donné** que le workspace contient des companies sans industrie renseignée
**Quand** je consulte la règle CO-06
**Alors** je vois le nombre total et la liste paginée

*Scénario : Companies sans dimensionnement (CO-07)*
**Étant donné** que le workspace contient des companies sans `numberofemployees` ni `annualrevenue`
**Quand** je consulte la règle CO-07
**Alors** je vois le nombre total et la liste paginée

*Scénario : Companies stale (CO-08)*
**Étant donné** que le workspace contient des companies non modifiées depuis plus de 365 jours
**Quand** je consulte la règle CO-08
**Alors** je vois le nombre total et la liste paginée avec : Hub ID, nom, dernière modification, ancienneté d'inactivité
**Et** les companies avec un deal open ou un contact avec activité récente sont exclues

---

### Story 4 — Impact business

**En tant que** RevOps Manager ou consultant
**je veux** voir l'impact business estimé de chaque catégorie de problème companies
**afin de** pouvoir présenter les enjeux à ma direction

**Critères d'acceptance :**

*Scénario : Affichage de l'impact business*
**Étant donné** que des problèmes de companies ont été détectés
**Quand** je consulte la section "Impact business" du domaine Companies
**Alors** pour chaque règle ayant au moins un problème détecté, je vois un encart avec :
- Un titre en langage business
- Une estimation d'impact
- Un niveau d'urgence business : Élevé / Moyen / Faible

*Scénario : Aucun problème détecté*
**Étant donné** qu'aucune règle company n'a détecté de problème
**Quand** j'accède à la section "Impact business" du domaine Companies
**Alors** je vois un message positif confirmant la bonne santé des données companies

---

## Spécifications fonctionnelles

### Règles de détection complètes

#### Règle migrée depuis EP-02

| ID | Règle | Condition | Criticité | Ex- |
|---|---|---|---|---|
| CO-01 | Taux domain insuffisant | Taux remplissage `domain` < 70% | 🔴 Critique | P12 |

> **Note migration :** La règle P12 est déplacée du domaine Propriétés vers le domaine Companies. L'ID P12 est retiré de EP-02.

#### Nouvelles règles doublons

| ID | Règle | Condition | Criticité |
|---|---|---|---|
| CO-02 | Doublons domain exact | ≥ 2 companies même domain normalisé (lowercase, trim, strip www.) | 🔴 Critique |
| CO-03 | Doublons nom entreprise | ≥ 2 companies même name (Levenshtein > 85% après strip suffixes SAS/SARL/Ltd/Inc/GmbH/LLC) | 🟡 Avertissement |

#### Nouvelles règles qualité

| ID | Règle | Condition | Criticité |
|---|---|---|---|
| CO-04 | Company sans contact | 0 contact associé ET créée > 90j | 🟡 Avertissement |
| CO-05 | Company sans owner | `hubspot_owner_id` null | 🔵 Info |
| CO-06 | Company sans industrie | `industry` null | 🔵 Info |
| CO-07 | Company sans dimensionnement | `numberofemployees` ET `annualrevenue` tous deux null | 🔵 Info |
| CO-08 | Company inactive (stale) | `lastmodifieddate` > 365j ET 0 deal open ET 0 contact avec activité récente | 🔵 Info |

### Comptage des problèmes

| Règle(s) | Comptage |
|---|---|
| CO-01 | 1 problème si seuil franchi (taux global) |
| CO-02, CO-03 | 1 problème par cluster de doublons |
| CO-04 à CO-08 | 1 problème par company concernée |

### Calcul du score Companies

```
Score_companies = 100
  − (nb_critiques × 5)     → plafonné à −30
  − (nb_avertissements × 2) → plafonné à −15
  − (nb_infos × 0,5)        → plafonné à −5

Score_companies = max(0, Score_companies)
```

### Impact sur le score global

Après EP-05b, le score global utilise une pondération égale entre domaines actifs :

```
Domaines actifs = [Propriétés, Contacts, Companies, Workflows]
  (exclure si domaine inactif : 0 companies → pas de Companies, etc.)

Poids = 1 / nombre_domaines_actifs

Score_global = Σ (Score_domaine × Poids)
```

### Traductions business par règle

| Règle(s) | Titre business | Impact estimé | Urgence |
|---|---|---|---|
| CO-01 | **Companies sans identité web** | Des entreprises sans domaine ne peuvent pas être dédupliquées automatiquement, ni enrichies via les outils d'enrichissement HubSpot. L'identification et le suivi des comptes sont compromis. | Élevé |
| CO-02 | **Base entreprises polluée par des doublons** | Des companies en doublon fragmentent le CA par client, créent des incohérences dans les rapports account-based et empêchent de calculer un chiffre d'affaires fiable par client. | Élevé |
| CO-03 | **Risque de doublons entreprises non détectés** | Des companies avec des noms similaires mais des domains différents peuvent représenter la même entité — historique commercial fragmenté, deals attribués à la mauvaise fiche. | Moyen |
| CO-04 | **Companies orphelines sans valeur commerciale** | Des fiches entreprises sans aucun contact associé depuis plus de 90 jours n'ont aucune valeur commerciale directe et polluent la base. | Moyen |
| CO-05, CO-06, CO-07 | **Données entreprises incomplètes** | Des companies sans owner, sans industrie ou sans dimensionnement rendent impossible la segmentation par taille, secteur ou territoire. Les rapports stratégiques sont faussés. | Faible |
| CO-08 | **Companies fantômes dans la base** | Des companies inactives depuis plus d'un an gonflent la base et faussent les métriques de couverture marché. | Faible |

---

## Critères d'acceptance de l'epic

- [ ] Les 8 règles CO-01 à CO-08 sont détectées et affichées correctement sur un workspace de test
- [ ] La règle migrée (CO-01) produit les mêmes résultats que l'ancienne P12
- [ ] La règle P12 est retirée du domaine Propriétés (EP-02) et remplacée par le domaine Companies
- [ ] La normalisation domain (CO-02) applique correctement lowercase + trim + strip www.
- [ ] La similarité Levenshtein (CO-03) est calculée après strip des suffixes juridiques (SAS, SARL, Ltd, Inc, GmbH, LLC)
- [ ] CO-04 exclut les companies créées il y a moins de 90 jours
- [ ] CO-08 exclut les companies avec un deal open ou un contact avec activité récente
- [ ] Le domaine Companies est automatiquement désactivé si 0 company dans le workspace
- [ ] Le score Companies est calculé et cohérent avec les problèmes détectés
- [ ] Le score global redistribue les poids également entre les domaines actifs (4 domaines post EP-05b)
- [ ] Chaque problème détecté affiche son impact business correspondant
- [ ] Les clusters de doublons sont affichés par taille décroissante
- [ ] Les listes de résultats sont paginées si > 20 items
- [ ] L'audit est non-destructif : aucune écriture ni modification dans HubSpot

---

## Dépendances

- **EP-01** (Connexion HubSpot OAuth) : doit être complété — l'audit companies nécessite un token d'accès valide
- **EP-02** (Audit des propriétés) : la règle P12 est migrée de EP-02 vers EP-05b
- **EP-05** (Audit des contacts) : doit être livré avant EP-05b — la formule du score global à pondération égale est introduite par EP-05
- **EP-04** (Tableau de bord) : consomme le score et les résultats produits par cet epic

---

## Questions ouvertes

| # | Question | Impact | Statut |
|---|---|---|---|
| Q1 | Seuil Levenshtein 85% sur noms d'entreprise (CO-03) → assez strict ? | Impacte faux positifs / faux négatifs | À valider en beta |
| Q2 | Gérer les abréviations (Saint/St., International/Intl.) dans CO-03 ? | Complexité algo + impact sur la détection | Proposé NON en v1 |
| Q3 | Grace period 90 jours pour CO-04 (company sans contact) ? | Impacte le nombre de companies signalées | Proposé OUI — à valider PO |
