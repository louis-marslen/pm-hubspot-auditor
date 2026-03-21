# Catalogue complet des règles d'audit — HubSpot Auditor

**Dernière mise à jour :** 2026-03-20
**Nombre total de règles :** 63 règles scorées + 2 recommandations non scorées

Ce document recense **toutes les règles d'audit implémentées** dans HubSpot Auditor, tous domaines confondus. Il sert de référence transverse pour le suivi produit, les communications marketing et l'onboarding.

---

## Vue de synthèse

| Domaine | Epic | Nb règles | Critiques | Avertissements | Infos | Statut |
|---|---|---|---|---|---|---|
| Propriétés | EP-02 | 6 | 2 | 2 | 2 | Livré |
| Workflows | EP-03 | 7 | 2 | 2 | 3 | Livré |
| Contacts | EP-05 | 12 | 3 | 5 | 4 | Livré |
| Companies | EP-05b | 8 | 2 | 2 | 4 | Livré |
| Utilisateurs & Équipes | EP-09 | 7 (+2 reco) | 2 | 3 | 2 | Livré |
| Deals & Pipelines | EP-06 | 15 | 3 | 6 | 6 | Livré |
| Leads & Pipelines de prospection | EP-18 | 14 | 2 | 7 | 5 | Livré |
| **Total** | | **69** (+ 2 reco) | **16** | **27** | **26** | |

---

## 1. Propriétés (EP-02) — 6 règles

> Analyse des propriétés custom et système sur tous les objets HubSpot actifs du workspace.

| ID | Nom | Sévérité | Condition résumée |
|---|---|---|---|
| P1 | Propriété jamais renseignée | Critique 🔴 | `created_at` > 90j ET taux de remplissage = 0% |
| P2 | Propriété quasi-inutilisée | Avertissement 🟡 | Taux de remplissage < 5% ET `created_at` > 90j ET ≠ 0% |
| P3 | Propriété potentiellement redondante | Avertissement 🟡 | Similarité Levenshtein > 80% entre labels de propriétés du même objet |
| P4 | Propriété sans description | Info 🔵 | Champ `description` null ou vide |
| P5 | Propriété sans groupe | Info 🔵 | `groupName` null ou groupe par défaut HubSpot |
| P6 | Mauvais typage probable | Critique 🔴 | Label/nom interne matche un pattern (téléphone, date, montant…) mais type incompatible |

**Objets couverts :** Contacts, Companies, Deals (P1-P6), Tickets & Custom Objects (P1, P2, P4, P5, P6 uniquement).

---

## 2. Workflows (EP-03) — 7 règles

> Analyse de tous les workflows du workspace (tous types confondus).

| ID | Nom | Sévérité | Condition résumée |
|---|---|---|---|
| W1 | En erreur active | Critique 🔴 | `error_rate` > 10% sur 30j ET statut `active` |
| W2 | Sans action configurée | Critique 🔴 | Statut `active` ET 0 action dans toutes les branches |
| W3 | Zombie | Avertissement 🟡 | Statut `active` ET dernier enrôlement > 90j (ou jamais) ET créé > 30j |
| W4 | Inactif depuis longtemps | Avertissement 🟡 | Statut `inactive` ET désactivation > 90j |
| W5 | Inactif récent | Info 🔵 | Statut `inactive` ET désactivation ≤ 90j |
| W6 | Nom non compréhensible | Info 🔵 | Nom matche pattern générique ("Copy of…", "New workflow…", "Workflow123", < 5 car.) |
| W7 | Non rangé dans un dossier | Info 🔵 | `folderId` = null |

**Délai de grâce :** workflows créés < 7j exclus de W2, W3, W6, W7.

---

## 3. Contacts (EP-05) — 12 règles

> Qualité des données contacts, doublons multi-critères, cohérence lifecycle.

### Cohérence lifecycle (migrées de EP-02)

| ID | Nom | Sévérité | Condition résumée |
|---|---|---|---|
| C-01 | Taux email insuffisant | Critique 🔴 | Taux contacts avec email < 80% |
| C-02 | Contact sans nom | Critique 🔴 | `firstname` ET `lastname` tous deux vides |
| C-03 | Taux lifecycle insuffisant | Avertissement 🟡 | Taux contacts avec `lifecyclestage` < 60% |
| C-04a | Deal Closed Won sans statut Customer | Avertissement 🟡 | Contact avec deal `closedwon` mais lifecycle ≠ `customer` |
| C-04b | Customer sans deal Closed Won | Info 🔵 | Contact `customer` mais 0 deal `closedwon` |
| C-04c | Absence MQL/SQL avec pipeline actif | Avertissement 🟡 | 0 contact MQL/SQL ET ≥ 1 deal `open` |
| C-04d | Lead avec deal actif | Info 🔵 | Contact `subscriber`/`lead` avec deal `open` associé |
| C-05 | Association contact-company insuffisante | Info 🔵 | Taux contacts avec ≥ 1 company < 60% (désactivé si 0 company) |

### Doublons

| ID | Nom | Sévérité | Condition résumée |
|---|---|---|---|
| C-06 | Doublons email exact | Critique 🔴 | ≥ 2 contacts avec même email normalisé (lowercase + trim + strip sous-adressage) |
| C-07 | Doublons nom+company | Avertissement 🟡 | ≥ 2 contacts avec noms similaires (Levenshtein > 85%) ET même company |
| C-08 | Doublons téléphone | Avertissement 🟡 | ≥ 2 contacts avec même téléphone normalisé (phone + mobilephone, normalisation FR +33→0) |

### Qualité

| ID | Nom | Sévérité | Condition résumée |
|---|---|---|---|
| C-09 | Email invalide | Avertissement 🟡 | Email non-null mais format invalide (regex) |
| C-10 | Contact inactif / stale | Info 🔵 | `lastmodifieddate` > 365j ET lifecycle ≠ `customer` ET 0 deal `open` |
| C-11 | Contact sans owner | Info 🔵 | `hubspot_owner_id` null ou vide |
| C-12 | Contact sans source | Info 🔵 | `hs_analytics_source` null ou vide |

**Grace period :** C-10, C-11, C-12 excluent les contacts créés < 7j.

---

## 4. Companies (EP-05b) — 8 règles

> Qualité des données companies, doublons domain/nom, companies orphelines.

### Qualité (migrée de EP-02)

| ID | Nom | Sévérité | Condition résumée |
|---|---|---|---|
| CO-01 | Taux domain insuffisant | Critique 🔴 | Taux companies avec `domain` < 70% |

### Doublons

| ID | Nom | Sévérité | Condition résumée |
|---|---|---|---|
| CO-02 | Doublons domain exact | Critique 🔴 | ≥ 2 companies avec même domain normalisé (lowercase + trim + strip www.) |
| CO-03 | Doublons nom entreprise | Avertissement 🟡 | ≥ 2 companies avec noms similaires (Levenshtein > 85%) après strip suffixes juridiques (SAS, SARL, Ltd, Inc, GmbH, LLC…) |

### Qualité

| ID | Nom | Sévérité | Condition résumée |
|---|---|---|---|
| CO-04 | Company sans contact | Avertissement 🟡 | 0 contact associé ET `createdate` > 90j |
| CO-05 | Company sans owner | Info 🔵 | `hubspot_owner_id` null ou vide |
| CO-06 | Company sans industrie | Info 🔵 | `industry` null ou vide |
| CO-07 | Company sans dimensionnement | Info 🔵 | `numberofemployees` ET `annualrevenue` tous deux vides |
| CO-08 | Company inactive / stale | Info 🔵 | `lastmodifieddate` > 365j ET 0 deal `open` ET 0 contact actif récent |

**Activation :** domaine actif si ≥ 1 company dans le workspace.

---

## 5. Utilisateurs & Équipes (EP-09) — 7 règles + 2 recommandations

> Gouvernance des accès, rôles, structure des équipes, activité des comptes.

### Règles scorées

| ID | Nom | Sévérité | Condition résumée |
|---|---|---|---|
| U-01 | Utilisateur sans équipe | Avertissement 🟡 | `primaryTeamId` null ET `secondaryTeamIds` vide |
| U-02 | Taux de Super Admins excessif | Critique 🔴 | > 20% des users OU > 3 Super Admins (seuils adaptatifs par taille) |
| U-03 | Utilisateur sans rôle assigné | Avertissement 🟡 | `roleId` null ET non Super Admin |
| U-04 | Absence de différenciation des rôles | Avertissement 🟡 | > 80% des users (hors Super Admins) partagent le même rôle |
| U-05 | Utilisateur potentiellement inactif | Critique 🔴 | **Enterprise :** 0 connexion dans les 90j. **Standard :** owner actif > 90j sans objet CRM assigné |
| U-06 | Équipe vide | Info 🔵 | Équipe avec 0 utilisateur (primary + secondary) |
| U-07 | Owner sans objet CRM assigné | Info 🔵 | Owner non archivé avec 0 contacts, 0 deals, 0 companies |

### Recommandations non scorées

| ID | Nom | Contenu |
|---|---|---|
| R1 | Permissions granulaires | Vérification manuelle recommandée : export, import, bulk delete, modification propriétés/pipelines |
| R2 | Optimisation des licences | Vérification manuelle recommandée : sièges Core/Sales Hub/Service Hub achetés vs attribués |

**Activation :** domaine actif si ≥ 2 utilisateurs dans le workspace.
**Grace period :** U-05 exclut les comptes créés < 30j.

---

## 6. Deals & Pipelines (EP-06) — 15 règles

> Complétude des données deals, deals bloqués, configuration des pipelines.

### Complétude données (migrées de EP-02 + nouvelles)

| ID | Nom | Sévérité | Condition résumée |
|---|---|---|---|
| D-01 | Taux montant insuffisant (deals open) | Critique 🔴 | Taux deals `open` avec `amount` > 0 < 70% |
| D-02 | Taux date de clôture insuffisant (deals open) | Critique 🔴 | Taux deals `open` avec `closedate` < 70% |
| D-03 | Deal open ancien sans avancement | Avertissement 🟡 | Deal `open` avec `createdate` > 60j |
| D-04 | Propriétés obligatoires de stage non renseignées | Critique 🔴 | Deal `open` avec ≥ 1 propriété obligatoire du stage vide |
| D-05 | Deal bloqué dans un stage | Avertissement 🟡 | Deal `open` dont le stage n'a pas changé depuis > 60j |
| D-08 | Deal open sans propriétaire | Info 🔵 | `hubspot_owner_id` null ou vide |
| D-09 | Deal open sans contact associé | Avertissement 🟡 | 0 contact associé |
| D-10 | Deal open sans company associée | Info 🔵 | 0 company associée (désactivé si 0 company dans workspace) |
| D-11 | Deal open avec montant à 0 | Avertissement 🟡 | `amount` = 0 exactement (distinct de D-01 qui couvre null) |

### Audit configuration pipeline

| ID | Nom | Sévérité | Condition résumée |
|---|---|---|---|
| D-06 | Pipeline sans activité récente | Info 🔵 | 0 deal `open` ET 0 deal créé dans les 90j |
| D-07 | Pipeline avec trop de stages | Info 🔵 | > 8 stages actifs (hors fermés) |
| D-12 | Phases sautées dans un pipeline | Avertissement 🟡 | > 20% des deals ont sauté ≥ 1 stage intermédiaire |
| D-13 | Points d'entrée multiples | Avertissement 🟡 | > 20% des deals créés dans un stage autre que le premier |
| D-14 | Stages fermés redondants | Avertissement 🟡 | > 1 stage Closed Won OU > 1 stage Closed Lost |
| D-15 | Stage avec 0 deal depuis 90 jours | Info 🔵 | Stage actif avec 0 deal open ET 0 deal passé dans les 90j |

**Périmètre :** règles D-01 à D-05 et D-08 à D-11 sur deals `open` uniquement.
**Pondération :** coefficient 1.5 dans le score global (domaine le plus lié au CA).

---

## 7. Leads & Pipelines de prospection (EP-18) — 14 règles

> Domaine **optionnel, décoché par défaut**. Qualité des leads, processus de disqualification, handoff lead → deal, configuration des pipelines de prospection.

### Qualité données leads

| ID | Nom | Sévérité | Condition résumée |
|---|---|---|---|
| L-01 | Lead ouvert ancien sans avancement | Avertissement 🟡 | Lead `open` avec `createdate` > **30j** |
| L-02 | Lead bloqué dans un stage | Avertissement 🟡 | Lead `open` dont le stage n'a pas changé depuis > **30j** |
| L-03 | Lead sans propriétaire | Info 🔵 | `hubspot_owner_id` null ou vide |
| L-04 | Lead sans contact associé | Critique 🔴 | 0 contact associé (sévérité relevée vs deals : un lead sans prospect est une anomalie structurelle) |

### Audit configuration pipeline

| ID | Nom | Sévérité | Condition résumée |
|---|---|---|---|
| L-05 | Pipeline de leads sans activité récente | Info 🔵 | 0 lead `open` ET 0 lead créé dans les **60j** |
| L-06 | Pipeline de leads avec trop d'étapes | Info 🔵 | > **5** stages actifs |
| L-07 | Phases sautées | Avertissement 🟡 | > 20% des leads ont sauté ≥ 1 stage |
| L-08 | Points d'entrée multiples | Avertissement 🟡 | > 20% des leads créés dans un stage autre que le premier |
| L-09 | Stages fermés redondants | Avertissement 🟡 | > 1 stage Qualified OU > 1 stage Disqualified |
| L-10 | Stage de lead sans activité 60 jours | Info 🔵 | Stage actif avec 0 lead open ET 0 lead passé dans les **60j** |

### Règles spécifiques leads

| ID | Nom | Sévérité | Condition résumée |
|---|---|---|---|
| L-11 | Lead disqualifié sans motif | Avertissement 🟡 | Lead en stage "Disqualified" avec propriété motif null/vide |
| L-12 | Motif de disqualification non structuré | Info 🔵 | Propriété motif de type `text` au lieu de `enumeration` |
| L-13 | Lead qualifié non rattaché à un deal | Critique 🔴 | Lead en stage "Qualified" avec 0 deal associé (handoff SDR → AE cassé) |
| L-14 | Lead sans source d'origine | Avertissement 🟡 | `hs_analytics_source` null ou vide |

**Seuils adaptés :** 30j (vs 60j deals) pour inactivité, 5 stages max (vs 8), 60j (vs 90j) pour pipelines/stages.
**Pondération :** coefficient 1.0 (standard).

---

## Annexe — Formule de scoring (commune à tous les domaines)

```
Score_domaine = 100
  − (nb_critiques × 5)     → plafonné à −30
  − (nb_avertissements × 2) → plafonné à −15
  − (nb_infos × 0,5)        → plafonné à −5

Score_domaine = max(0, Score_domaine)
```

**Score global :**

```
Score_global = Σ (Score_domaine × Poids_domaine) / Σ (Poids_domaine)

Poids : Deals = 1.5, tous les autres = 1.0
Seuls les domaines actifs sont inclus.
```

| Score | Label | Couleur |
|---|---|---|
| 0 – 49 | Critique | Rouge |
| 50 – 69 | À améliorer | Orange |
| 70 – 89 | Bon | Vert |
| 90 – 100 | Excellent | Vert foncé |
