# PRD-19 — Patch règles d'audit v1 : Propriétés, Workflows, Contacts

**Epic associé :** EP-19
**Version :** 1.0
**Date :** 2026-03-20
**Statut :** Spécifié

---

## 1. Résumé exécutif

EP-19 est un patch transverse qui améliore la précision et la pertinence des règles d'audit sur 3 domaines : Propriétés, Workflows et Contacts. Le changement principal est l'introduction d'un LLM (modèle léger) en second pass sur les règles les plus sujettes aux faux positifs (P3 redondance, P6 typage, W6 nommage, C-06 doublons). En parallèle, les règles Contacts sont réorganisées autour de critères plus actionnables : "contact inexploitable" (identité ou moyen de contact manquant), "contact incomplet" (contexte pro manquant), et un lifecycle stage évalué sur sa cohérence réelle plutôt que sur un simple taux de remplissage.

Ce patch réduit les faux positifs, élargit la couverture de détection et rend les résultats plus actionnables — sans changer l'architecture du moteur d'audit ni le scoring.

**Décisions PO actées dans ce PRD :**
- LLM léger (GPT-4.1-mini/nano) pour les règles, distinct du modèle diagnostic IA
- P3 : seuil Levenshtein abaissé à 70%, validation LLM systématique
- P6 : LLM sur toutes les propriétés custom (tous types), pas seulement les `string`
- W4 : seuil d'inactivité de 90j à 30j
- W5 ancienne supprimée, remplacée par "Workflow sans description" (Info)
- W6 : LLM, montée en Avertissement, pas de suggestion de nomenclature
- C-03 : taux de remplissage lifecycle supprimé, remplacé par cohérence lifecycle (5 sous-cas)
- C-06 : fusion doublons email + nom + téléphone en une seule règle avec LLM
- C-02 supprimée, absorbée dans C-07 "Contact inexploitable" (Critique)
- C-10, C-11, C-12 anciennes supprimées (peu actionnables)

---

## 2. Problème utilisateur

### Narrative du problème

**Je suis :** Sophie, RevOps Manager qui utilise HubSpot Auditor depuis 3 mois
- Mon dernier audit a remonté 47 propriétés potentiellement redondantes (P3) — quand j'ai vérifié, la moitié étaient des faux positifs (ex : "date de la dernière levée de fonds" vs "montant de la dernière levée de fonds")
- Le mauvais typage (P6) ne détecte que les cas les plus évidents — j'ai plein de propriétés "type de contrat" en texte libre qui passent sous le radar
- Mon audit contacts remonte des centaines de "contacts sans source" et "contacts sans owner" que personne ne traite parce que c'est trop granulaire et pas assez priorisé
- Les doublons sont détectés en 3 listes séparées (email, nom, téléphone) — je dois les recouper manuellement pour comprendre la situation réelle

**J'essaie de :**
- Avoir des résultats d'audit plus précis (moins de faux positifs) et plus actionnables (problèmes mieux qualifiés)

**Mais :**
- Les détections actuelles par pattern matching ou seuils simples génèrent du bruit
- Les règles Contacts sont trop atomiques et pas assez hiérarchisées

**Parce que :**
- Un pattern matching ne peut pas évaluer le sens sémantique d'un label de propriété
- Un simple taux de remplissage ne capture pas la cohérence d'un lifecycle stage

### Énoncé du problème

Les utilisateurs de HubSpot Auditor ont besoin de détections plus précises et mieux hiérarchisées parce que les méthodes actuelles (Levenshtein, regex, taux de remplissage) génèrent des faux positifs et des résultats trop atomiques qui diluent l'impact actionnable du rapport.

---

## 2bis. Personas & Jobs-to-be-Done

### Sophie RevOps *(persona primaire)*

**Jobs fonctionnels :**
- Avoir confiance que les propriétés signalées comme redondantes le sont vraiment
- Détecter les problèmes de typage au-delà des patterns évidents
- Comprendre en un coup d'œil quels contacts sont inexploitables vs simplement incomplets
- Voir les doublons consolidés avec un score de confiance pour prioriser

**Douleurs clés :**
- Trop de faux positifs sur P3 → perte de temps à investiguer
- Règles Contacts trop nombreuses et pas assez hiérarchisées → paralysie d'action
- Doublons en 3 listes séparées → recoupement manuel nécessaire

---

## 2ter. Contexte stratégique

**Lien avec la vision produit :** la confiance dans les résultats d'audit est le facteur #1 de rétention. Chaque faux positif érode cette confiance. L'introduction du LLM dans les règles est un investissement de qualité qui bénéficie à l'ensemble du produit.

**Pourquoi maintenant :** après 7 domaines d'audit livrés, le feedback utilisateur est clair — la couverture est bonne, mais la précision doit progresser. Le coût marginal des appels LLM est faible (modèle mini/nano) et l'infrastructure est en place (diagnostic IA EP-14).

**Indicateur différenciant :** aucun concurrent n'utilise un LLM pour valider les détections de règles d'audit CRM. C'est un avantage concurrentiel direct en termes de précision.

---

## 2quart. Vue d'ensemble de la solution

Nous introduisons un service LLM mutualisé (`llm-rules.ts`) qui est appelé en second pass par les règles P3, P6, W6 et C-06. Ce service gère le batching, les structured outputs, le fallback et les retries. En parallèle, les règles Contacts sont réorganisées pour être plus actionnables.

**Comment ça fonctionne :**
1. Les règles existantes (Levenshtein, regex, normalisation email) servent de **pré-filtre** rapide
2. Le service LLM reçoit les candidats pré-filtrés en **batch** et les évalue sémantiquement
3. Les résultats LLM **confirment ou infirment** les détections pré-filtre
4. En cas d'échec LLM, les résultats pré-filtre sont conservés avec un **tag "non validé par IA"**

**Features clés :** validation LLM sur P3/P6/W6/C-06, fusion des doublons contacts avec score de confiance, lifecycle cohérence (5 sous-cas), contact inexploitable/incomplet, workflow sans description.

**Considérations UX :**
- **Pas de changement de parcours** — les résultats s'affichent dans les mêmes sections du rapport
- **Score de confiance (C-06)** — nouveau pattern d'affichage dans les clusters de doublons : badge 0-100 à côté de chaque cluster
- **Tag "non validé par IA"** — badge discret affiché quand le fallback est actif, pour ne pas perdre la transparence
- **Sous-cas (C-03, C-04)** — affichage en accordion dans le RuleCard existant, un sous-cas par section dépliable
- **Composants UI existants** — aucun nouveau composant, réutilisation de `RuleCard`, `SeverityBadge`, `PaginatedList`, `ProgressBar`, `Badge`

---

## 3. Objectifs & métriques de succès

### Objectifs

| Objectif | Description |
|---|---|
| O1 — Réduction des faux positifs | Réduire le taux de faux positifs signalés sur P3, P6, C-06 |
| O2 — Couverture de détection élargie | Détecter plus de vrais positifs grâce au LLM (P6 toutes propriétés, P3 seuil 70%) |
| O3 — Résultats plus actionnables | Remplacer les règles atomiques Contacts par des diagnostics hiérarchisés |
| O4 — Maintien de la performance | L'ajout du LLM ne doit pas dégrader significativement le temps d'audit |

### KPIs

| KPI | Cible | Méthode de mesure |
|---|---|---|
| Taux de faux positifs P3 signalés | < 2% (vs ~15% estimé actuel) | Retours utilisateurs beta |
| Taux de faux positifs C-06 signalés | < 3% | Retours utilisateurs beta |
| Nombre de détections P6 par audit | +30% vs actuel (couverture LLM) | Analytics |
| Surcoût temps d'exécution LLM | < 15 secondes par audit | Monitoring |

### Métriques garde-fous
- Aucune régression sur les domaines non modifiés (Companies, Deals, Leads, Utilisateurs)
- Le fallback LLM fonctionne : l'audit ne plante jamais à cause d'une erreur LLM
- L'audit reste non-destructif

---

## 4. Périmètre

### In scope

Voir epic EP-19 section "Périmètre" pour le détail complet.

### Out of scope (epic 2)

- Modifications des domaines Companies, Deals, Leads, Utilisateurs & Équipes
- Seuils configurables par l'utilisateur
- Modification du diagnostic IA (EP-14)
- Export CSV des résultats
- Deep links vers HubSpot

---

## 5. User stories associées

| ID | Titre | Priorité |
|---|---|---|
| EP-19-S1 | Service LLM pour les règles d'audit | Must have |
| EP-19-S2 | P3 : Redondance avec validation LLM | Must have |
| EP-19-S3 | P6 : Mauvais typage avec analyse LLM complète | Must have |
| EP-19-S4 | W4/W5 : Seuil inactivité et workflow sans description | Must have |
| EP-19-S5 | W6 : Nommage et nomenclature via LLM | Must have |
| EP-19-S6 | C-03/C-04 : Cohérence et segmentation lifecycle | Must have |
| EP-19-S7 | C-06 : Doublons contacts fusionnés avec LLM | Must have |
| EP-19-S8 | C-07/C-08 : Contact inexploitable et incomplet | Must have |
| EP-19-S9 | C-10 : Numéros de téléphone non normalisés | Should have |

Les stories complètes avec leurs critères d'acceptance Given/When/Then sont définies dans le fichier `/epics/ep19-patch-regles-v1.md`.

---

## 6. Spécifications fonctionnelles

### 6.1 Service LLM mutualisé pour les règles d'audit

#### Architecture

Un nouveau fichier `src/lib/audit/llm-rules.ts` centralise tous les appels LLM utilisés par les règles d'audit.

| Paramètre | Valeur |
|---|---|
| Modèle | `process.env.OPENAI_RULES_MODEL` ?? `"gpt-4.1-mini"` |
| API | OpenAI Responses API avec structured outputs (`response_format: { type: "json_schema" }`) |
| Temperature | 0.1 |
| Batch max | 30 items par appel |
| Timeout | 30 secondes par appel |
| Retries | 3 avec backoff exponentiel |
| Fallback | Retourne `null` — l'appelant conserve les résultats pré-filtre avec tag |

#### Fonctions exposées

```
llmValidateRedundancy(pairs: PropertyPair[]): Promise<RedundancyResult[] | null>
llmAnalyzeTyping(properties: PropertyInfo[]): Promise<TypingResult[] | null>
llmAnalyzeWorkflowNaming(workflows: WorkflowNameInfo[]): Promise<NamingResult | null>
llmAnalyzeDuplicates(groups: ContactGroup[]): Promise<DuplicateResult[] | null>
```

Chaque fonction gère le découpage en batches, l'appel API avec structured output, et retourne `null` en cas d'échec.

---

### 6.2 P3 — Redondance de propriétés (modifié)

**Changement :** seuil Levenshtein abaissé de 80% à **70%** + validation LLM systématique.

**Nouveau flow :**
1. Calcul Levenshtein sur les labels de propriétés custom (seuil 70%)
2. Pour chaque paire candidate : envoi au LLM avec label, nom interne, type, description
3. Le LLM retourne `{ redundant: boolean, reason: string }` par paire
4. Seules les paires confirmées par le LLM sont remontées comme problèmes
5. **Fallback :** si LLM échoue, les paires candidates sont conservées avec tag "non validé par IA"

**Sévérité :** inchangée — Avertissement 🟡

---

### 6.3 P6 — Mauvais typage probable (modifié)

**Changement :** ajout d'une analyse LLM sur toutes les propriétés custom, en complément des patterns regex.

**Nouveau flow :**
1. **Pass 1 (regex) :** les patterns regex existants détectent les cas évidents (fast path)
2. **Pass 2 (LLM) :** toutes les propriétés custom (tous types, pas seulement `string`) sont envoyées au LLM
3. Le LLM retourne par propriété : `{ currentTypeOk: boolean, suggestedType?: string, reason?: string }`
4. Les détections regex + LLM sont fusionnées (dédoublonnées si une propriété est détectée par les deux)
5. **Fallback :** si LLM échoue, seules les détections regex sont affichées avec tag "analyse IA indisponible"

**Instructions système LLM :**
- Biais fort contre les champs texte libre — toujours challenger si un type plus structuré existe
- Prioriser `enumeration` / `radio` / `select` pour "type de X", "catégorie de X", "statut de X"
- Strict sur les numériques : tout montant, quantité, score, pourcentage → `number`
- Texte libre acceptable uniquement pour notes, commentaires, descriptions libres
- Vigilance maximale sur les propriétés chiffrées en type texte

**Sévérité :** inchangée — Critique 🔴

---

### 6.4 W4 — Inactif depuis longtemps (modifié)

**Changement :** seuil abaissé de 90 jours à **30 jours**.

**Condition :** statut `inactive` ET date de désactivation > 30 jours.

Tout le reste est inchangé.

---

### 6.5 W5 — Workflow sans description (nouvelle règle, remplace l'ancienne W5)

**Condition :** workflow avec champ `description` null, vide, ou contenant uniquement des espaces.

**Sévérité :** Info 🔵

**Affichage :** nombre total de workflows sans description + liste paginée : nom du workflow, type, statut (actif/inactif), date de création. Triée par statut (actifs d'abord) puis par date de création ascendante.

**Délai de grâce :** workflows créés < 7 jours exclus (aligné sur W2, W3, W7).

---

### 6.6 W6 — Nom non compréhensible et nomenclature incohérente (modifié)

**Changement :** remplacement du pattern regex par une analyse LLM + montée en sévérité.

**Sévérité :** Avertissement 🟡 (était Info 🔵)

**Nouveau flow :**
1. La liste complète des noms de workflows (+ type, statut) est envoyée au LLM
2. Le LLM évalue deux dimensions :
   - **Compréhensibilité individuelle** : chaque nom est-il compréhensible en isolation ?
   - **Cohérence de nomenclature** : y a-t-il une convention de nommage dans le workspace ? Quels workflows ne la respectent pas ?
3. Le LLM constate l'absence de convention le cas échéant, **sans en suggérer une**
4. **Fallback :** si LLM échoue, aucun résultat W6 n'est affiché + tag "analyse IA indisponible"

**Output LLM structuré :**
```
{
  convention_detected: boolean,
  convention_description?: string,
  issues: [{
    workflow_name: string,
    problem: "incomprehensible" | "breaks_convention",
    reason: string
  }]
}
```

**Affichage :**
- Si convention détectée : afficher la convention identifiée + liste des workflows qui ne la respectent pas
- Si pas de convention : message "Aucune convention de nommage détectée" + workflows individuellement incompréhensibles
- Pour chaque workflow signalé : nom, type de problème, raison

**Délai de grâce :** workflows créés < 7 jours exclus.

---

### 6.7 C-03 — Lifecycle stage incohérent (réécrit)

**Remplace :** ancienne C-03 (taux de remplissage lifecycle) + C-04a, C-04b, C-04d

**Sévérité :** Avertissement 🟡

**Condition :** déclenchée si **au moins un** des sous-cas suivants est détecté :

| Sous-cas | Condition |
|---|---|
| C-03a — Lifecycle vide | `lifecyclestage` null ou vide |
| C-03b — Deal associé sans statut Opportunity | Contact avec ≥ 1 deal `open` ET lifecycle ∉ {`opportunity`, `customer`} |
| C-03c — Deal Closed Won sans statut Customer | Contact avec ≥ 1 deal `closedwon` ET lifecycle ≠ `customer` |
| C-03d — Customer sans deal Closed Won | Contact avec lifecycle = `customer` ET 0 deal `closedwon` |
| C-03e — Lead/Subscriber avec deal actif | Contact avec lifecycle = `subscriber` ou `lead` ET ≥ 1 deal `open` |

**Comptage pour le scoring :** 1 problème par contact concerné (un contact peut apparaître dans plusieurs sous-cas mais est compté une seule fois).

**Affichage :** décompte par sous-cas + nombre total de contacts incohérents. Chaque sous-cas est une section dépliable (accordion dans RuleCard) avec sa liste paginée.

---

### 6.8 C-04 — Segmentation lifecycle imparfaite (réécrit)

**Remplace :** ancienne C-04c

**Sévérité :** Avertissement 🟡

**Condition :** déclenchée si **au moins un** des sous-cas suivants est détecté :

| Sous-cas | Condition |
|---|---|
| C-04a — MQL/SQL non utilisés | 0 contact `marketingqualifiedlead` ET 0 contact `salesqualifiedlead` ET ≥ 1 deal `open` |
| C-04b — Trop d'étapes custom | Lifecycle stage customisé avec > 8 étapes |

**Comptage pour le scoring :** 1 problème unique par sous-cas déclenché.

**Affichage :**
- C-04a : message d'alerte + explication business
- C-04b : nombre d'étapes configurées + liste des étapes + seuil recommandé (≤ 8)

---

### 6.9 C-06 — Doublons contacts (fusion + LLM)

**Remplace :** anciennes C-06 (email exact), C-07 (nom+company), C-08 (téléphone)

**Sévérité :** Critique 🔴

**Deux passes de détection :**

#### Pass 1 — Pré-filtre email exact (sans LLM)

Identique à l'ancienne C-06 :
1. Normalisation email : lowercase + trim + strip sous-adressage
2. Grouper par email normalisé
3. Créer un cluster pour chaque email ayant ≥ 2 contacts
4. **Score de confiance = 100** pour ces clusters (match exact)

Ce pré-filtre capte les doublons y compris les contacts **sans company associée**.

#### Pass 2 — Analyse LLM intra-company

1. Pour chaque company avec ≥ 2 contacts, pré-filtrer les paires candidates (Levenshtein léger sur fullname)
2. Envoyer les paires candidates au LLM avec : firstname, lastname, job title, email, téléphone (phone + mobilephone)
3. Le LLM retourne par paire : `{ is_duplicate: boolean, confidence: number (0-100), reason: string }`
4. Créer un cluster pour chaque paire confirmée par le LLM
5. Fusionner les clusters transitifs

**Fusion des résultats :** les clusters Pass 1 et Pass 2 sont fusionnés (dédoublonnés si un même contact apparaît dans les deux). Le score de confiance le plus élevé est conservé.

**Comptage pour le scoring :** 1 problème par cluster.

**Fallback :** si LLM échoue, seuls les résultats Pass 1 (email exact) sont retournés avec tag "analyse IA indisponible".

**Affichage :** clusters triés par score de confiance décroissant. Pour chaque cluster : score de confiance (badge), raison de la détection, membres (Hub ID, nom, email, téléphone, company).

---

### 6.10 C-07 — Contact inexploitable (nouvelle règle)

**Sévérité :** Critique 🔴

**Condition :** contact détecté si **au moins un** des cas suivants :
- **Identité manquante :** `firstname` ET `lastname` tous deux null ou vides
- **Aucun moyen de contact :** `email` null/vide ET `phone` null/vide ET `mobilephone` null/vide ET `hs_linkedin_url` (ou propriété LinkedIn custom) null/vide

**Comptage pour le scoring :** 1 problème par contact concerné.

**Affichage :** nombre total + liste paginée : Hub ID, nom (si disponible), champs présents/manquants, date de création. Triée par date de création ascendante.

**Impact business :** "Des contacts sans identité ou sans aucun moyen de contact sont des lignes mortes dans votre CRM — ils ne peuvent être ni ciblés en emailing, ni appelés, ni contactés sur LinkedIn. Ils gonflent artificiellement la taille de votre base et faussent vos métriques."

---

### 6.11 C-08 — Contact incomplet (nouvelle règle)

**Sévérité :** Avertissement 🟡

**Condition :** contact (non détecté par C-07) avec **au moins un** des cas suivants :
- `jobtitle` null ou vide
- 0 company associée

**Comptage pour le scoring :** 1 problème par contact concerné.

**Affichage :** nombre total + décompte par sous-cas (sans jobtitle / sans company) + liste paginée : Hub ID, nom, email, champ manquant, date de création. Triée par date de création ascendante.

**Impact business :** "Des contacts sans titre de poste ou sans entreprise associée rendent impossible la segmentation par rôle et l'analyse account-based. Ces contacts sont des candidats prioritaires à l'enrichissement."

---

### 6.12 C-10 — Numéro de téléphone non normalisé (nouvelle règle)

**Sévérité :** Info 🔵

**Condition :** contact avec `phone` ou `mobilephone` non null et non vide, dont le format ne correspond pas au standard E.164.

**Regex de détection (format non conforme) :**
Les numéros conformes sont ceux qui matchent `^\+[1-9]\d{6,14}$` (format E.164). Tout numéro non vide qui ne matche pas est signalé.

**Comptage pour le scoring :** 1 problème par contact concerné.

**Affichage :** nombre total + liste paginée : Hub ID, nom, numéro actuel, champ (phone/mobilephone). Triée par nom alphabétique.

---

### 6.13 Mise à jour du scoring

#### Propriétés (score.ts)

Aucun changement de formule. P3 et P6 conservent leur sévérité. Le nombre de détections P6 peut augmenter (couverture LLM) mais le plafonnement (-30 max critiques) limite l'impact.

#### Workflows (workflow-score.ts)

| Règle | Ancienne sévérité | Nouvelle sévérité |
|---|---|---|
| W4 | Avertissement | Avertissement (inchangé) |
| W5 ancienne | Info | **Supprimée** |
| W5 nouvelle | — | Info |
| W6 | Info | **Avertissement** |

Impact net : W6 passe de 0.5 pts/workflow à 2 pts/workflow dans les déductions.

#### Contacts (contact-score.ts)

Refonte complète du comptage :

| Règle | Sévérité | Comptage |
|---|---|---|
| C-01 | Critique | 1 unique si seuil franchi |
| C-03 | Avertissement | 1 par contact incohérent (dédoublonné entre sous-cas) |
| C-04 | Avertissement | 1 unique par sous-cas déclenché |
| C-05 | Info | 1 unique si seuil franchi |
| C-06 | Critique | 1 par cluster de doublons |
| C-07 | Critique | 1 par contact inexploitable |
| C-08 | Avertissement | 1 par contact incomplet |
| C-09 | Avertissement | 1 par contact avec email invalide |
| C-10 | Info | 1 par contact avec téléphone non normalisé |

---

### 6.14 Mise à jour des business impacts

Nouvelles entrées à ajouter dans `business-impact.ts` :

| Règle | Titre business | Urgence |
|---|---|---|
| C-03 (nouveau) | Pipeline et segmentation non fiables | Élevée |
| C-04 (nouveau) | Segmentation lifecycle sous-exploitée | Modérée |
| C-07 | Contacts inexploitables dans la base | Critique |
| C-08 | Contacts incomplets à enrichir | Modérée |
| C-10 | Données téléphoniques non standardisées | Faible |
| W5 (nouveau) | Gouvernance des workflows non documentée | Faible |

Entrées à supprimer : anciennes C-02, C-04a, C-04b, C-04c, C-04d, C-10 (stale), C-11, C-12, W5 (inactif récent).

---

## 7. Dépendances & risques

### Dépendances

| Dépendance | Nature | Impact si bloquant |
|---|---|---|
| **OpenAI API** | GPT-4.1-mini/nano avec structured outputs | Bloquant pour les règles LLM — fallback prévu |
| **Moteur d'audit existant** | Architecture engine.ts, rules/, scoring | Prérequis — tout est livré |
| **EP-14 diagnostic IA** | Pattern de structured outputs et fallback à réutiliser | Non bloquant — pattern de référence |

### Risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| R1 — Coût API LLM sur les gros workspaces | Moyenne | Moyen | Batching + modèle mini/nano. Monitoring du coût par audit |
| R2 — Latence LLM dégradant le temps d'audit | Moyenne | Moyen | Appels LLM en parallèle des autres traitements. Timeout 30s strict |
| R3 — LLM incohérent sur P3/P6 (faux positifs LLM) | Faible | Élevé | Temperature 0.1 + structured outputs stricts + validation en beta |
| R4 — Regression sur les règles non modifiées | Faible | Élevé | Tests de regression systématiques sur tous les domaines |
| R5 — Refonte numérotation Contacts cassant le diagnostic IA | Moyenne | Moyen | Mettre à jour les mappings dans business-impact.ts et diagnostic-ia.ts |

### Questions ouvertes

| Question | Décision |
|---|---|
| Modèle LLM exact | GPT-4.1-mini en première intention, nano si suffisant en tests |
| Seuil Levenshtein pré-filtre C-06 intra-company | À définir en implémentation (~60%) |
| Format E.164 strict pour C-10 ? | Oui — format international de référence |
| Propriété LinkedIn pour C-07 | `hs_linkedin_url` — vérifier disponibilité sur portails réels |

---

## 8. Critères d'acceptance

Voir epic EP-19 section "Critères d'acceptance globaux" pour la liste complète.
