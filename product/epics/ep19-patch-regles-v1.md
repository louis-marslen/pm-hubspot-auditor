# EP-19 — Patch règles d'audit v1 : Propriétés, Workflows, Contacts

**PRD associé :** [prd-19-patch-regles-v1.md](../prd/prd-19-patch-regles-v1.md)
**Date de création :** 2026-03-20
**Statut :** Spécifié

---

## Hypothèse

Si nous introduisons une validation LLM en second pass sur les règles de détection les plus sujettes aux faux positifs (redondance de propriétés, mauvais typage, nommage de workflows, doublons de contacts) et que nous réorganisons les règles Contacts autour de critères d'exploitabilité et de cohérence lifecycle plus pertinents, alors la confiance des utilisateurs dans les résultats d'audit augmentera significativement, parce que les détections seront plus précises (moins de faux positifs) et plus actionnables (problèmes mieux qualifiés). Nous mesurerons le succès via le taux de faux positifs signalés en beta (cible < 2%).

---

## Périmètre

### In scope

**Domaine Propriétés (EP-02) — 2 règles modifiées :**
- P3 : abaissement du seuil Levenshtein à 70% + validation LLM systématique en second pass
- P6 : ajout d'une analyse LLM sur toutes les propriétés custom (tous types) en complément des patterns regex

**Domaine Workflows (EP-03) — 3 règles modifiées, 1 supprimée, 1 créée :**
- W4 : seuil d'inactivité abaissé de 90j à 30j
- W5 (ancienne "Inactif récent") : supprimée
- W5 (nouvelle) : Workflow sans description — Info 🔵
- W6 : remplacement du pattern regex par une analyse LLM (compréhensibilité + cohérence de nomenclature) — montée en Avertissement 🟡

**Domaine Contacts (EP-05) — refonte majeure :**
- C-01 : déplacée en section Qualité (inchangée sinon)
- C-02 : supprimée (absorbée dans C-07 "Contact inexploitable")
- C-03 : réécrite — "Lifecycle stage incohérent" (5 sous-cas)
- C-04 : réécrite — "Segmentation lifecycle imparfaite" (2 sous-cas)
- C-04a, C-04b, C-04c, C-04d : supprimées (absorbées dans C-03 et C-04)
- C-06 : fusion C-06 + C-07 + C-08 — "Doublons contacts" avec pré-filtre email + analyse LLM intra-company
- C-07 (nouvelle) : "Contact inexploitable" — Critique 🔴
- C-08 (nouvelle) : "Contact incomplet" — Avertissement 🟡
- C-09 : Email invalide — inchangée
- C-10 (nouvelle) : "Numéro de téléphone non normalisé" — Info 🔵
- C-10, C-11, C-12 (anciennes) : supprimées

**Infrastructure LLM transverse :**
- Service LLM mutualisé pour les règles d'audit (batching, modèle léger, structured outputs, fallback)

### Out of scope

- Modifications des domaines Companies, Deals, Leads, Utilisateurs & Équipes (epic 2)
- Modification du diagnostic IA (EP-14) ou du scoring
- Nouveaux composants UI (les résultats utilisent les composants existants)
- Seuils configurables par l'utilisateur

---

## User Stories

### EP-19-S1 — Service LLM pour les règles d'audit

**En tant que** moteur d'audit, **je veux** disposer d'un service LLM mutualisé et optimisé pour les validations de règles, **afin de** centraliser le batching, le fallback et la gestion des erreurs.

**Critères d'acceptance :**
- [ ] Étant donné un batch de paires de propriétés à évaluer, quand le service est appelé, alors il envoie un seul appel LLM avec structured output et retourne un résultat par paire
- [ ] Étant donné un échec de l'API LLM (timeout, rate limit), quand le fallback s'active, alors les résultats sont tagués "non validé par IA" et les détections pré-filtre sont conservées
- [ ] Étant donné le service LLM, quand il est configuré, alors il utilise un modèle léger (GPT-4.1-mini ou nano) distinct du modèle diagnostic IA
- [ ] Étant donné un batch de plus de 50 items, quand le service est appelé, alors il découpe automatiquement en sous-batches

### EP-19-S2 — P3 : Redondance de propriétés avec validation LLM

**En tant que** RevOps Manager, **je veux** que la détection de propriétés redondantes soit plus précise, **afin de** ne pas perdre de temps à investiguer des faux positifs (ex : "date de la dernière levée de fonds" vs "montant de la dernière levée de fonds").

**Critères d'acceptance :**
- [ ] Étant donné deux propriétés avec un score Levenshtein > 70% sur les labels, quand le LLM les évalue, alors il reçoit le label, le nom interne, le type de champ et la description de chaque propriété
- [ ] Étant donné deux propriétés sémantiquement distinctes ("date levée de fonds" vs "montant levée de fonds"), quand le LLM les évalue, alors il les marque comme non redondantes
- [ ] Étant donné deux propriétés réellement redondantes ("Téléphone mobile" vs "Tel portable"), quand le LLM les évalue, alors il les marque comme redondantes
- [ ] Étant donné un échec LLM, quand le fallback s'active, alors les paires candidates sont conservées avec le tag "non validé par IA"
- [ ] Étant donné le nouveau seuil de 70%, quand l'audit s'exécute, alors le nombre de paires candidates augmente mais le nombre de faux positifs diminue par rapport à l'ancien seuil de 80% sans LLM

### EP-19-S3 — P6 : Mauvais typage avec analyse LLM complète

**En tant que** RevOps Manager, **je veux** que le mauvais typage soit détecté sur toutes mes propriétés custom et pas seulement celles qui matchent un pattern regex, **afin de** maximiser la qualité structurelle de mon CRM.

**Critères d'acceptance :**
- [ ] Étant donné une propriété custom de type `string` nommée "Type de contrat", quand le LLM l'analyse, alors il suggère le type `enumeration` avec une raison courte
- [ ] Étant donné une propriété custom de type `number` correctement typée, quand le LLM l'analyse, alors il retourne "OK"
- [ ] Étant donné une propriété de type `string` nommée "Notes internes", quand le LLM l'analyse, alors il retourne "OK" (texte libre légitime)
- [ ] Étant donné l'analyse LLM, quand elle s'exécute, alors elle couvre toutes les propriétés custom de tous les types (pas uniquement les `string`)
- [ ] Étant donné un résultat LLM pour une propriété, quand il est affiché, alors il montre : type actuel, type suggéré, raison en une phrase
- [ ] Étant donné les patterns regex existants, quand l'audit s'exécute, alors les détections regex sont conservées en fast path et le LLM passe en complément sur toutes les propriétés

### EP-19-S4 — W4/W5 : Seuil inactivité et workflow sans description

**En tant que** RevOps Manager, **je veux** que les workflows inactifs soient détectés plus rapidement et que les workflows sans description soient signalés, **afin de** maintenir une meilleure hygiène de mes automatisations.

**Critères d'acceptance :**
- [ ] Étant donné un workflow désactivé depuis 35 jours, quand l'audit s'exécute, alors W4 le détecte (ancien seuil 90j → nouveau seuil 30j)
- [ ] Étant donné un workflow désactivé depuis 25 jours, quand l'audit s'exécute, alors W4 ne le détecte pas
- [ ] Étant donné l'ancienne règle W5 "Inactif récent", quand l'audit s'exécute, alors elle n'existe plus
- [ ] Étant donné un workflow actif avec une description vide ou null, quand l'audit s'exécute, alors la nouvelle W5 le détecte comme Info
- [ ] Étant donné un workflow actif avec une description renseignée, quand l'audit s'exécute, alors la nouvelle W5 ne le détecte pas

### EP-19-S5 — W6 : Nommage et nomenclature via LLM

**En tant que** RevOps Manager, **je veux** que la qualité du nommage de mes workflows soit évaluée intelligemment (compréhensibilité + cohérence de nomenclature), **afin de** maintenir une configuration lisible et maintenable.

**Critères d'acceptance :**
- [ ] Étant donné la liste complète des noms de workflows du workspace, quand le LLM les analyse, alors il évalue la compréhensibilité individuelle de chaque nom
- [ ] Étant donné un ensemble de workflows dont certains suivent une convention ("Contact — Onboarding — Welcome", "Deal — Relance — J+7") et d'autres non ("test wf", "Copy of truc"), quand le LLM les analyse, alors il identifie la convention et signale les workflows qui ne la respectent pas
- [ ] Étant donné un workspace sans convention de nommage claire, quand le LLM constate l'absence de convention, alors il signale le problème sans suggérer de nomenclature
- [ ] Étant donné un échec LLM, quand le fallback s'active, alors les workflows sont marqués "analyse IA indisponible" et aucun résultat W6 n'est affiché
- [ ] Étant donné la règle W6, quand elle détecte des problèmes, alors elle s'affiche en Avertissement 🟡 (montée depuis Info)

### EP-19-S6 — C-03/C-04 : Cohérence et segmentation lifecycle

**En tant que** RevOps Manager, **je veux** que l'audit lifecycle détecte les incohérences réelles entre le lifecycle stage et la situation CRM de mes contacts, **afin de** fiabiliser mon pipeline et ma segmentation.

**Critères d'acceptance :**
- [ ] Étant donné un contact avec un lifecycle stage vide, quand l'audit s'exécute, alors C-03a le détecte
- [ ] Étant donné un contact avec un deal `open` associé et un lifecycle stage qui n'est ni "opportunity" ni "customer", quand l'audit s'exécute, alors C-03b le détecte
- [ ] Étant donné un contact avec un deal `closedwon` et un lifecycle ≠ "customer", quand l'audit s'exécute, alors C-03c le détecte
- [ ] Étant donné un contact avec lifecycle = "customer" et 0 deal `closedwon`, quand l'audit s'exécute, alors C-03d le détecte
- [ ] Étant donné un contact avec lifecycle = "subscriber" ou "lead" et un deal `open`, quand l'audit s'exécute, alors C-03e le détecte
- [ ] Étant donné un workspace sans contact MQL ou SQL mais avec des deals actifs, quand l'audit s'exécute, alors C-04a le détecte
- [ ] Étant donné un lifecycle stage customisé avec 10 étapes, quand l'audit s'exécute, alors C-04b le détecte (seuil > 8)
- [ ] Étant donné l'ancienne règle C-03 (taux de remplissage lifecycle), quand l'audit s'exécute, alors elle n'existe plus

### EP-19-S7 — C-06 : Doublons contacts fusionnés avec LLM

**En tant que** RevOps Manager, **je veux** que la détection de doublons contacts utilise tous les critères disponibles avec un score de confiance, **afin de** prioriser les doublons les plus certains.

**Critères d'acceptance :**
- [ ] Étant donné deux contacts avec le même email normalisé (lowercase + trim + strip sous-adressage), quand l'audit s'exécute, alors ils sont détectés comme doublons avec un score de confiance = 100
- [ ] Étant donné deux contacts dans la même company avec des noms similaires mais des emails différents, quand le LLM les analyse avec firstname, lastname, job title, email, téléphone, alors il retourne un score de confiance et une raison
- [ ] Étant donné un workspace avec des contacts sans company, quand l'audit s'exécute, alors les doublons email exact sont détectés indépendamment de la company
- [ ] Étant donné les résultats de doublons, quand ils sont affichés, alors les clusters sont triés par score de confiance décroissant
- [ ] Étant donné un échec LLM, quand le fallback s'active, alors seuls les doublons email exact sont retournés avec le tag "analyse IA indisponible"
- [ ] Étant donné les anciennes règles C-07 (nom+company) et C-08 (téléphone), quand l'audit s'exécute, alors elles n'existent plus (absorbées)

### EP-19-S8 — C-07/C-08 : Contact inexploitable et incomplet

**En tant que** RevOps Manager, **je veux** savoir quels contacts de ma base sont inexploitables ou incomplets, **afin de** prioriser l'enrichissement et le nettoyage.

**Critères d'acceptance :**
- [ ] Étant donné un contact sans firstname ET sans lastname, quand l'audit s'exécute, alors C-07 le détecte comme "Contact inexploitable" (Critique)
- [ ] Étant donné un contact avec un nom mais sans email, sans téléphone ET sans profil LinkedIn (`hs_linkedin_url`), quand l'audit s'exécute, alors C-07 le détecte comme "Contact inexploitable" (Critique)
- [ ] Étant donné un contact avec nom + email mais sans jobtitle, quand l'audit s'exécute, alors C-08 le détecte comme "Contact incomplet" (Avertissement)
- [ ] Étant donné un contact avec nom + email mais sans company associée, quand l'audit s'exécute, alors C-08 le détecte comme "Contact incomplet" (Avertissement)
- [ ] Étant donné un contact avec nom + email + jobtitle + company, quand l'audit s'exécute, alors ni C-07 ni C-08 ne le détecte
- [ ] Étant donné l'ancienne règle C-02 (contact sans nom), quand l'audit s'exécute, alors elle n'existe plus (absorbée dans C-07)
- [ ] Étant donné l'impact business de C-08, quand il est affiché, alors il mentionne que ces contacts sont des candidats prioritaires à l'enrichissement

### EP-19-S9 — C-10 : Numéros de téléphone non normalisés

**En tant que** RevOps Manager, **je veux** que les numéros de téléphone non normalisés soient détectés, **afin de** garantir l'exploitabilité des données téléphoniques.

**Critères d'acceptance :**
- [ ] Étant donné un contact avec un numéro "06 12 34 56 78" (espaces), quand l'audit s'exécute, alors C-10 le détecte
- [ ] Étant donné un contact avec un numéro "+33612345678" (format international correct), quand l'audit s'exécute, alors C-10 ne le détecte pas
- [ ] Étant donné un contact sans numéro de téléphone, quand l'audit s'exécute, alors C-10 ne le détecte pas
- [ ] Étant donné C-10, quand elle détecte des problèmes, alors elle s'affiche en Info 🔵

---

## Spécifications fonctionnelles

### Architecture LLM pour les règles

| Élément | Détail |
|---|---|
| Modèle | GPT-4.1-mini (ou nano) — env var `OPENAI_RULES_MODEL` |
| API | OpenAI Responses API avec structured outputs |
| Temperature | 0.1 (tâches de classification, déterminisme maximal) |
| Batching | Max 30 items par appel (propriétés ou paires) |
| Fallback | Résultats pré-filtre conservés + tag "non validé par IA" |
| Timeout | 30 secondes par appel, 3 retries avec backoff exponentiel |

### Instructions système LLM — P3 (redondance)

Le LLM reçoit un batch de paires de propriétés et doit déterminer pour chacune si elles représentent le même concept (redondantes) ou des concepts distincts.

**Contexte fourni par paire :** label, nom interne, type de champ, description.

**Output structuré par paire :** `{ redundant: boolean, reason: string }`

### Instructions système LLM — P6 (typage)

Le LLM reçoit un batch de propriétés custom et doit évaluer si le type actuel est optimal.

**Directives clés du system prompt :**
- Biais fort contre les champs texte libre — toujours challenger si un type plus structuré existe
- Prioriser `enumeration` / `radio` / `select` pour tout ce qui est "type de X", "catégorie de X", "statut de X"
- Être strict sur les champs numériques : tout ce qui est montant, quantité, score, pourcentage → `number`
- Accepter le texte libre uniquement pour les champs narratifs (notes, commentaires, descriptions libres)
- Être vigilant que toutes les propriétés chiffrées soient bien des nombres et non du texte

**Contexte fourni par propriété :** label, nom interne, type actuel, description, objet HubSpot.

**Output structuré par propriété :** `{ currentTypeOk: boolean, suggestedType?: string, reason?: string }`

### Instructions système LLM — W6 (nommage workflows)

Le LLM reçoit la liste complète des noms de workflows du workspace et évalue deux dimensions :

1. **Compréhensibilité individuelle** : est-ce que le nom du workflow est compréhensible en isolation ?
2. **Cohérence de nomenclature** : est-ce qu'il y a une convention de nommage qui se dégage et quels workflows ne la respectent pas ?

Le LLM constate l'absence de convention le cas échéant, sans en suggérer une.

**Contexte fourni :** liste complète des noms de workflows + type + statut.

**Output structuré :** `{ convention_detected: boolean, convention_description?: string, issues: [{ workflow_name: string, problem: "incomprehensible" | "breaks_convention", reason: string }] }`

### Instructions système LLM — C-06 (doublons contacts)

Le LLM reçoit des groupes de contacts appartenant à la même company et évalue les paires candidates (pré-filtrées par Levenshtein léger) pour détecter les doublons.

**Contexte fourni par contact :** firstname, lastname, job title, email, téléphone (phone + mobilephone).

**Output structuré par paire :** `{ is_duplicate: boolean, confidence: number (0-100), reason: string }`

### Nouvelle numérotation des règles Contacts

| Nouveau ID | Nom | Sévérité | Origine |
|---|---|---|---|
| C-01 | Taux email insuffisant | Critique 🔴 | Inchangée, déplacée en section Qualité |
| C-03 | Lifecycle stage incohérent | Avertissement 🟡 | Réécrite (5 sous-cas) |
| C-04 | Segmentation lifecycle imparfaite | Avertissement 🟡 | Réécrite (2 sous-cas) |
| C-05 | Association contact-company insuffisante | Info 🔵 | Inchangée |
| C-06 | Doublons contacts | Critique 🔴 | Fusion C-06 + C-07 + C-08 + LLM |
| C-07 | Contact inexploitable | Critique 🔴 | Nouvelle (absorbe C-02) |
| C-08 | Contact incomplet | Avertissement 🟡 | Nouvelle |
| C-09 | Email invalide | Avertissement 🟡 | Inchangée |
| C-10 | Numéro de téléphone non normalisé | Info 🔵 | Nouvelle |

**Règles supprimées :** C-02 (→ C-07), C-04a/b/c/d (→ C-03, C-04), C-07 ancienne (→ C-06), C-08 ancienne (→ C-06), C-10 ancienne (stale), C-11 (sans owner), C-12 (sans source).

### Fichiers à créer

| Fichier | Rôle |
|---|---|
| `src/lib/audit/llm-rules.ts` | Service LLM mutualisé pour les règles (batching, fallback, structured outputs) |

### Fichiers à modifier

| Fichier | Nature du changement |
|---|---|
| `src/lib/audit/rules/custom-properties.ts` | P3 : seuil 70% + appel LLM. P6 : ajout pass LLM complète |
| `src/lib/audit/rules/workflows.ts` | W4 : seuil 30j. W5 ancienne supprimée, W5 nouvelle (description). W6 : remplacement regex par LLM |
| `src/lib/audit/rules/contacts.ts` | Refonte majeure : C-02 supprimée, C-03/C-04 réécrites, C-06 fusionnée + LLM, C-07/C-08/C-10 nouvelles, C-10/C-11/C-12 anciennes supprimées |
| `src/lib/audit/types.ts` | Mise à jour interfaces ContactAuditResults, WorkflowAuditResults, ajout types LLM |
| `src/lib/audit/contact-engine.ts` | Adaptation à la nouvelle numérotation et aux nouvelles règles |
| `src/lib/audit/contact-score.ts` | Mise à jour comptage (nouvelles règles, suppressions) |
| `src/lib/audit/workflow-score.ts` | Mise à jour comptage (W4 modifiée, W5 remplacée, W6 montée en sévérité) |
| `src/lib/audit/score.ts` | Aucun changement structurel (P3/P6 restent même sévérité) |
| `src/lib/audit/business-impact.ts` | Mise à jour des entrées Contacts (nouvelles règles), Workflows (W5, W6) |
| `src/components/audit/audit-results-view.tsx` | Adaptation affichage Contacts (nouvelles sections, score de confiance doublons) |
| `src/lib/audit/engine.ts` | Passage du token LLM aux engines concernés |

---

## Critères d'acceptance globaux

- [ ] Les règles P3 et P6 utilisent un LLM en second pass avec structured outputs
- [ ] Les règles W6 et C-06 utilisent un LLM en remplacement ou en complément des méthodes existantes
- [ ] Le service LLM mutualisé gère le batching, le fallback et les retries
- [ ] Le modèle LLM utilisé est un modèle léger (GPT-4.1-mini/nano), distinct du modèle diagnostic IA
- [ ] Le fallback fonctionne correctement : résultats pré-filtre conservés avec tag "non validé par IA"
- [ ] Les seuils W4 (30j) et P3 (70%) sont correctement appliqués
- [ ] La règle W5 ancienne est supprimée, la nouvelle W5 (description) fonctionne
- [ ] La règle W6 est montée en Avertissement et utilise le LLM
- [ ] Les règles C-03 et C-04 réécrites couvrent les 7 sous-cas spécifiés
- [ ] Les règles C-07 (inexploitable) et C-08 (incomplet) sont fonctionnelles
- [ ] La règle C-10 (téléphone non normalisé) détecte les formats non standard
- [ ] Les anciennes règles supprimées (C-02, C-04a-d, C-07/C-08/C-10/C-11/C-12 anciennes, W5 ancienne) n'apparaissent plus
- [ ] Les scores sont correctement recalculés avec les nouvelles règles
- [ ] Le temps d'exécution total de l'audit ne dépasse pas +15 secondes par rapport à l'actuel (impact LLM)
- [ ] Pas de régression sur les domaines non modifiés (Companies, Deals, Leads, Utilisateurs)
- [ ] L'audit reste non-destructif : aucune requête en écriture vers HubSpot

---

## Dépendances

| Dépendance | Statut |
|---|---|
| OpenAI API (GPT-4.1-mini, Responses API, structured outputs) | ✅ Disponible |
| Moteur d'audit existant (engine.ts, rules/, scoring) | ✅ Livré |
| Service LLM diagnostic IA existant (diagnostic-ia.ts) | ✅ Livré (pattern à réutiliser) |
| Composants UI rapport (RuleCard, SeverityBadge, etc.) | ✅ Livrés |

---

## Questions ouvertes

| Question | Décision |
|---|---|
| Modèle LLM pour les règles | GPT-4.1-mini ou nano — à confirmer en dev selon coût/qualité |
| Taille max des batches LLM | 30 items — à ajuster en fonction des tests de performance |
| Seuil Levenshtein pré-filtre pour C-06 intra-company | À définir en implémentation (suggestion : 60% pour maximiser le recall du LLM) |
| Format de normalisation téléphone pour C-10 | Format E.164 comme référence (+33XXXXXXXXX) — à confirmer |
