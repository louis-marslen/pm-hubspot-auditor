# EP-05 — Audit des contacts

## Hypothèse

Nous croyons que détecter automatiquement les doublons multi-critères et les problèmes de qualité des contacts permettra aux RevOps Managers d'assainir leur base et d'améliorer la fiabilité de leur segmentation — parce qu'aujourd'hui la détection de doublons et l'évaluation de la qualité des contacts se font manuellement, objet par objet, sans aucune vue consolidée ni argument business structuré.

Nous mesurerons le succès via : nombre de clusters de doublons détectés par audit (cible : > 0 sur 80% des workspaces audités) + taux d'utilisateurs ayant partagé le rapport contacts à un tiers (cible : > 30% dans les 7 jours).

---

## Périmètre

### In scope
- Migration des règles P7-P11 de l'audit Propriétés vers le domaine Contacts (renumérotées C-01 à C-05)
- 4 nouvelles règles de détection de doublons multi-critères (C-06 à C-08) et de qualité (C-09 à C-12)
- Algorithmes de normalisation pour la détection de doublons (email, téléphone, noms)
- Calcul d'un score de santé Contacts (contribue au score global avec pondération égale entre domaines actifs)
- Présentation des résultats avec impact business par règle déclenchée
- Grace period de 7 jours sur les règles C-10, C-11, C-12 (contacts créés < 7j exclus)

### Out of scope
- Fusion automatique de doublons (l'outil est non-destructif)
- Détection de doublons cross-workspace
- Enrichissement de contacts (complétion des champs vides)
- Deep links vers les contacts HubSpot depuis le rapport (NEXT phase)
- Feature "ignorer un doublon" (won't fix) — NEXT phase

---

## User stories

### Story 1 — Vue d'ensemble de l'audit contacts

**En tant que** RevOps Manager
**je veux** voir un résumé consolidé de l'état de mes contacts dès la fin de l'audit
**afin de** comprendre en 30 secondes l'ampleur des problèmes de qualité et de doublons avant de plonger dans le détail

**Critères d'acceptance :**

*Scénario : Affichage du résumé de l'audit contacts*
**Étant donné** que l'audit du workspace est terminé
**Quand** j'accède à la section Contacts du rapport
**Alors** je vois :
- Le nombre total de contacts analysés
- Le décompte des problèmes par criticité : 🔴 X critiques / 🟡 Y avertissements / 🔵 Z informations
- Le score de santé du domaine Contacts sur 100
- Un bandeau de statut : Critique (0-49) / À améliorer (50-69) / Bon (70-89) / Excellent (90-100)

*Scénario : Aucun contact dans le workspace*
**Étant donné** que le workspace ne contient aucun contact
**Quand** j'accède à la section Contacts du rapport
**Alors** je vois un état vide : "Aucun contact détecté dans ce workspace — le domaine Contacts n'a pas été analysé"
**Et** le domaine Contacts est exclu du score global avec mention explicite

---

### Story 2 — Détection des doublons

**En tant que** RevOps Manager
**je veux** voir les clusters de doublons détectés par critère (email, nom+company, téléphone) triés par taille décroissante
**afin de** savoir quels contacts fusionner ou nettoyer en priorité

**Critères d'acceptance :**

*Scénario : Doublons email exact (C-06)*
**Étant donné** que le workspace contient des contacts avec le même email après normalisation
**Quand** je consulte la règle C-06 dans le rapport
**Alors** je vois les clusters de doublons regroupés par email normalisé
**Et** chaque cluster affiche : l'email, le nombre de contacts dans le cluster, les Hub IDs et noms des contacts concernés
**Et** les clusters sont triés par taille décroissante (les plus gros en premier)

*Scénario : Doublons nom+company (C-07)*
**Étant donné** que le workspace contient des contacts avec des noms similaires (Levenshtein > 85%) ET la même company associée
**Quand** je consulte la règle C-07
**Alors** je vois les clusters de doublons avec : les noms comparés, le score de similarité, la company associée
**Et** les clusters sont triés par taille décroissante

*Scénario : Doublons téléphone (C-08)*
**Étant donné** que le workspace contient des contacts avec le même numéro de téléphone après normalisation
**Quand** je consulte la règle C-08
**Alors** je vois les clusters de doublons regroupés par numéro normalisé
**Et** chaque cluster affiche : le numéro normalisé, le nombre de contacts, les Hub IDs et noms des contacts concernés

*Scénario : Règle C-07 en contexte B2C*
**Étant donné** que le workspace contient 0 company
**Quand** l'audit est exécuté
**Alors** la règle C-07 est désactivée avec le message : "Règle C-07 non applicable — aucune company détectée dans ce workspace"

*Scénario : Aucun doublon détecté*
**Étant donné** qu'aucun doublon n'est détecté par une règle donnée
**Quand** je consulte cette règle dans le rapport
**Alors** je vois un état "✅ Aucun doublon détecté" pour cette règle

---

### Story 3 — Qualité des données contacts

**En tant que** RevOps Manager
**je veux** voir les contacts avec des problèmes de qualité (emails invalides, contacts stale, sans owner, sans source)
**afin de** identifier les segments de ma base à nettoyer ou enrichir

**Critères d'acceptance :**

*Scénario : Emails invalides (C-09)*
**Étant donné** que le workspace contient des contacts avec des emails au format invalide
**Quand** je consulte la règle C-09
**Alors** je vois la liste des contacts concernés avec : Hub ID, email invalide, raison de l'invalidité
**Et** les contacts sont triés par date de création descendante

*Scénario : Contacts stale (C-10)*
**Étant donné** que le workspace contient des contacts non modifiés depuis plus de 365 jours
**Quand** je consulte la règle C-10
**Alors** je vois les contacts concernés avec : Hub ID, nom, dernière modification, lifecycle stage
**Et** les contacts créés il y a moins de 7 jours sont exclus
**Et** les contacts avec lifecycle = customer ou ayant un deal open sont exclus

*Scénario : Contacts sans owner (C-11)*
**Étant donné** que le workspace contient des contacts sans propriétaire assigné
**Quand** je consulte la règle C-11
**Alors** je vois le nombre total de contacts sans owner et la liste paginée
**Et** les contacts créés il y a moins de 7 jours sont exclus

*Scénario : Contacts sans source (C-12)*
**Étant donné** que le workspace contient des contacts sans source d'acquisition
**Quand** je consulte la règle C-12
**Alors** je vois le nombre total et la liste paginée des contacts sans `hs_analytics_source`
**Et** les contacts créés il y a moins de 7 jours sont exclus

---

### Story 4 — Cohérence lifecycle stage

**En tant que** RevOps Manager
**je veux** voir les incohérences de lifecycle stage de mes contacts (taux de remplissage, cohérence avec les deals)
**afin de** corriger les problèmes de segmentation qui faussent mes rapports et mon pipeline

**Critères d'acceptance :**

*Scénario : Taux email insuffisant (C-01)*
**Étant donné** que le workspace contient des contacts
**Quand** je consulte la règle C-01
**Alors** je vois le taux de remplissage email en % + barre de progression colorée + seuil cible (80%)

*Scénario : Contacts sans nom (C-02)*
**Étant donné** que le workspace contient des contacts
**Quand** je consulte la règle C-02
**Alors** je vois le nombre total de contacts avec firstname ET lastname vides + preview de 5 exemples

*Scénario : Taux lifecycle insuffisant (C-03)*
**Étant donné** que le workspace contient des contacts
**Quand** je consulte la règle C-03
**Alors** je vois le taux de remplissage lifecycle stage en % + barre de progression + seuil cible (60%)

*Scénario : Incohérences lifecycle-deals (C-04a à C-04d)*
**Étant donné** que des incohérences existent entre lifecycle stage et statut des deals
**Quand** je consulte les règles C-04a à C-04d
**Alors** je vois pour chaque règle déclenchée : le nombre de contacts concernés, une explication de l'incohérence, et une preview de 5 exemples

*Scénario : Association contact-company (C-05)*
**Étant donné** que le workspace contient des companies
**Quand** je consulte la règle C-05
**Alors** je vois le taux d'association contact-company + barre de progression + seuil cible (60%)

*Scénario : Règle C-05 en contexte B2C*
**Étant donné** que le workspace contient 0 company
**Quand** l'audit est exécuté
**Alors** la règle C-05 est désactivée avec le message : "Règle C-05 non applicable — aucune company détectée dans ce workspace"

---

### Story 5 — Impact business par catégorie de problème

**En tant que** RevOps Manager ou consultant
**je veux** voir l'impact business estimé de chaque catégorie de problème contacts
**afin de** pouvoir présenter les enjeux à ma direction sans reformuler moi-même les problèmes techniques

**Critères d'acceptance :**

*Scénario : Affichage de l'impact business*
**Étant donné** que des problèmes de contacts ont été détectés
**Quand** je consulte la section "Impact business" du domaine Contacts
**Alors** pour chaque règle ayant au moins un problème détecté, je vois un encart avec :
- Un titre en langage business (pas technique)
- Une estimation d'impact
- Un niveau d'urgence business : Élevé / Moyen / Faible

*Scénario : Aucun problème détecté*
**Étant donné** qu'aucune règle contact n'a détecté de problème
**Quand** j'accède à la section "Impact business" du domaine Contacts
**Alors** je vois un message positif confirmant la bonne santé de la base contacts

---

## Spécifications fonctionnelles

### Règles de détection complètes

#### Règles migrées depuis EP-02 (ex-P7 à P11)

| ID | Règle | Condition | Criticité | Ex- |
|---|---|---|---|---|
| C-01 | Taux email insuffisant | Taux remplissage `email` < 80% | 🔴 Critique | P7 |
| C-02 | Contact sans nom | `firstname` ET `lastname` tous deux null/vides | 🔴 Critique | P8 |
| C-03 | Taux lifecycle insuffisant | Taux remplissage `lifecyclestage` < 60% | 🟡 Avertissement | P9 |
| C-04a | Deal won sans Customer | Contact associé à deal Closed Won ET lifecycle ≠ customer | 🟡 Avertissement | P10a |
| C-04b | Customer sans deal won | lifecycle = customer ET 0 deal Closed Won | 🔵 Info | P10b |
| C-04c | Absence MQL/SQL avec pipeline | 0 MQL ET 0 SQL ET ≥ 1 deal open | 🟡 Avertissement | P10c |
| C-04d | Lead avec deal actif | lifecycle = subscriber/lead ET ≥ 1 deal open | 🔵 Info | P10d |
| C-05 | Contact sans company (B2B) | Taux association < 60% | 🔵 Info | P11 |

> **Note migration :** Ces règles sont déplacées du domaine Propriétés (EP-02) vers le domaine Contacts. Les IDs P7 à P11 sont retirés de EP-02. Les règles P1-P6 et P13-P16 restent dans le domaine Propriétés en attendant la dissolution progressive de ce domaine.

> **Note C-05 :** Criticité abaissée de Critique (P11) à Info — l'absence d'association contact-company peut être légitime en B2C. Règle automatiquement désactivée si 0 company dans le workspace.

#### Nouvelles règles doublons (feature phare)

| ID | Règle | Condition | Criticité |
|---|---|---|---|
| C-06 | Doublons email exact | ≥ 2 contacts même email normalisé (lowercase, trim, strip +alias) | 🔴 Critique |
| C-07 | Doublons nom+company | ≥ 2 contacts même firstname+lastname (Levenshtein > 85%) ET même company associée | 🟡 Avertissement |
| C-08 | Doublons téléphone | ≥ 2 contacts même phone/mobilephone après normalisation (suppression espaces, tirets, +33→0) | 🟡 Avertissement |

#### Nouvelles règles qualité

| ID | Règle | Condition | Criticité |
|---|---|---|---|
| C-09 | Email invalide (format) | `email` présent mais format invalide (regex) | 🟡 Avertissement |
| C-10 | Contact inactif (stale) | `lastmodifieddate` > 365j ET lifecycle ≠ customer ET 0 deal open | 🔵 Info |
| C-11 | Contact sans owner | `hubspot_owner_id` null | 🔵 Info |
| C-12 | Contact sans source | `hs_analytics_source` null | 🔵 Info |

### Comptage des problèmes

| Règle(s) | Comptage |
|---|---|
| C-01, C-03, C-05 | 1 problème si seuil franchi (taux global) |
| C-02 | 1 problème si count > 0 |
| C-04a, C-04b, C-04c, C-04d | 1 problème chacun si déclenché |
| C-06, C-07, C-08 | 1 problème par **cluster** de doublons |
| C-09 à C-12 | 1 problème par contact concerné |

### Edge cases

| Cas | Traitement |
|---|---|
| C-05, C-07 : workspace avec 0 company | Règles désactivées (contexte B2C) |
| C-10, C-11, C-12 : contacts créés < 7j | Exclus (grace period) |
| C-06 : normalisation email | lowercase + trim + strip sous-adressage (+alias) avant @ |
| C-08 : normalisation téléphone | Minimum 8 chiffres après normalisation pour éviter faux positifs |

### Calcul du score Contacts

```
Score_contacts = 100
  − (nb_critiques × 5)     → plafonné à −30
  − (nb_avertissements × 2) → plafonné à −15
  − (nb_infos × 0,5)        → plafonné à −5

Score_contacts = max(0, Score_contacts)
```

### Impact sur le score global

Après EP-05, le score global utilise une pondération égale entre domaines actifs :

```
Domaines actifs = [Propriétés, Contacts, Workflows]
  (exclure si domaine inactif)

Poids = 1 / nombre_domaines_actifs

Score_global = Σ (Score_domaine × Poids)
```

### Traductions business par règle

| Règle(s) | Titre business | Impact estimé | Urgence |
|---|---|---|---|
| C-01, C-02 | **Contacts inexploitables pour le marketing et le commercial** | Des contacts sans email ni nom ne peuvent pas être ciblés en emailing ni assignés correctement. Chaque contact de ce type est une opportunité commerciale aveugle. | Élevé |
| C-03, C-04a–d | **Pipeline et segmentation non fiables** | Un lifecycle stage incorrect ou manquant fausse la vue du pipeline, les taux de conversion et les décisions de ciblage. Les rapports de direction sont potentiellement basés sur des données erronées. | Élevé |
| C-05 | **Impossibilité d'analyser les données par compte** | Sans association contact-entreprise, les analyses account-based (ABM) sont impossibles et le chiffre d'affaires par client ne peut pas être calculé fiablement. | Moyen |
| C-06 | **Base contacts polluée par des doublons** | Les doublons email faussent les métriques marketing (taux d'ouverture, d'engagement), doublent les coûts d'emailing et créent de la confusion chez les commerciaux qui voient plusieurs fiches pour le même prospect. | Élevé |
| C-07, C-08 | **Risque de doublons non détectés** | Des contacts avec des noms ou numéros similaires mais des emails différents peuvent représenter la même personne — leads contactés en double, historique d'interactions fragmenté. | Moyen |
| C-09 | **Emails non délivrables dans la base** | Des emails au format invalide polluent les listes d'envoi, dégradent la réputation d'expéditeur et faussent les métriques de délivrabilité. | Moyen |
| C-10 | **Contacts fantômes dans la base** | Des contacts inactifs depuis plus d'un an gonflent artificiellement la taille de la base, augmentent les coûts de licence HubSpot et faussent les métriques de segmentation. | Faible |
| C-11, C-12 | **Manque de traçabilité et d'attribution** | Des contacts sans owner ni source rendent impossible l'attribution des leads et le suivi de la performance des canaux d'acquisition. | Faible |

---

## Critères d'acceptance de l'epic

- [ ] Les 12 règles C-01 à C-12 sont détectées et affichées correctement sur un workspace de test
- [ ] Les règles migrées (C-01 à C-05) produisent les mêmes résultats que les anciennes P7 à P11
- [ ] Les règles P7 à P11 sont retirées du domaine Propriétés (EP-02) et remplacées par le domaine Contacts
- [ ] La normalisation email (C-06) applique correctement lowercase + trim + strip +alias
- [ ] La normalisation téléphone (C-08) gère les formats FR (+33, 0X) et internationaux, avec minimum 8 chiffres
- [ ] La similarité Levenshtein (C-07) est correctement calculée avec seuil > 85%
- [ ] Les règles C-05 et C-07 sont désactivées automatiquement si 0 company dans le workspace
- [ ] Les règles C-10, C-11, C-12 excluent les contacts créés il y a moins de 7 jours
- [ ] Le score Contacts est calculé et cohérent avec les problèmes détectés
- [ ] Le score global redistribue les poids également entre les domaines actifs
- [ ] Chaque problème détecté affiche son impact business correspondant
- [ ] Les clusters de doublons sont affichés par taille décroissante
- [ ] Les listes de résultats sont paginées si > 20 items
- [ ] L'audit est non-destructif : aucune écriture ni modification dans HubSpot

---

## Dépendances

- **EP-01** (Connexion HubSpot OAuth) : doit être complété — l'audit contacts nécessite un token d'accès valide
- **EP-02** (Audit des propriétés) : les règles P7-P11 sont migrées de EP-02 vers EP-05. EP-02 doit être mis à jour pour retirer ces règles
- **EP-04** (Tableau de bord) : consomme le score et les résultats produits par cet epic. La pondération du score global doit être mise à jour

---

## Questions ouvertes

| # | Question | Impact | Statut |
|---|---|---|---|
| Q1 | Sous-adressage email (+alias) dans la normalisation C-06 ? | Impacte le nombre de doublons détectés | Proposé OUI — à valider PO |
| Q2 | Seuil Levenshtein 85% pour les noms (C-07) → assez strict ? | Impacte faux positifs / faux négatifs | À valider en beta |
| Q3 | Seuil 365 jours pour contacts stale (C-10) ? | Impacte le nombre de contacts signalés | Proposé OUI — à valider PO |
| Q4 | Budget perf audit contacts : accepter 90s sur workspace < 50 000 contacts ? | Architecture et UX | Décision PO nécessaire |
| Q5 | C-05 (ex-P11) : garder la criticité Info ou remonter en Avertissement ? | Impacte le scoring | Décision PO nécessaire |
