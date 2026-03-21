# Prompt d'implémentation — EP-19 : Patch règles d'audit v1 (Propriétés, Workflows, Contacts)

> Copier-coller ce prompt dans une session Claude en mode Dev.

---

## Contexte

Tu vas implémenter l'epic EP-19 qui est un patch transverse améliorant la précision et la pertinence des règles d'audit sur 3 domaines : Propriétés, Workflows et Contacts. Le changement majeur est l'introduction d'un **LLM léger (GPT-4.1-mini)** en second pass sur 4 règles (P3, P6, W6, C-06) pour réduire les faux positifs et élargir la couverture. En parallèle, les règles Contacts sont réorganisées en profondeur.

L'app est fonctionnelle (tous les epics Phase 1 et Phase 2 livrés). Tu modifies des règles existantes et en crées de nouvelles — tu ne changes **pas** l'architecture du moteur d'audit ni le scoring global.

**Résumé des changements :**
- **4 règles augmentées par LLM** : P3 (redondance), P6 (typage), W6 (nommage), C-06 (doublons)
- **3 règles modifiées** : W4 (seuil 90j→30j), C-03 (lifecycle cohérence), C-04 (segmentation)
- **3 nouvelles règles** : W5 (description), C-07 (contact inexploitable), C-08 (contact incomplet), C-10 (téléphone non normalisé)
- **8 règles supprimées** : W5 ancienne, C-02, C-04a/b/c/d, C-07/C-08/C-10/C-11/C-12 anciennes
- **1 nouveau fichier** : `llm-rules.ts` (service LLM mutualisé)

## Documents de référence — à lire AVANT de coder

Lis ces documents intégralement avant de commencer :

1. **`product/prd/prd-19-patch-regles-v1.md`** — le PRD : specs fonctionnelles complètes de chaque règle modifiée/créée/supprimée
2. **`product/epics/ep19-patch-regles-v1.md`** — l'epic : user stories avec critères d'acceptance Gherkin, architecture LLM, fichiers à modifier
3. **`product/prd/design-system-guidelines.md`** — tokens et composants UI
4. **`product/prd/screens-and-flows.md`** — maquettes d'écrans, parcours utilisateurs

Consulte aussi `src/CLAUDE.md` pour les conventions et le skill `feature-implementation` dans `skills/tech/workflows/feature-implementation.md`.

**Fichiers à étudier impérativement avant de coder :**
- `src/lib/audit/diagnostic-ia.ts` — **modèle de référence** pour les structured outputs OpenAI (batching, schema, fallback)
- `src/lib/audit/rules/custom-properties.ts` — règles P1-P6 actuelles (P3 et P6 à modifier)
- `src/lib/audit/rules/workflows.ts` — règles W1-W7 actuelles (W4, W5, W6 à modifier)
- `src/lib/audit/rules/contacts.ts` — règles C-01 à C-12 actuelles (refonte majeure)
- `src/lib/audit/contact-engine.ts` — orchestrateur contacts (adapter aux nouvelles règles)
- `src/lib/audit/contact-score.ts` — scoring contacts (refonte comptage)
- `src/lib/audit/workflow-score.ts` — scoring workflows (mise à jour W5/W6)
- `src/lib/audit/types.ts` — interfaces à mettre à jour
- `src/lib/audit/business-impact.ts` — impacts business à mettre à jour
- `src/lib/audit/engine.ts` — orchestrateur principal (passage du contexte LLM)
- `src/components/audit/audit-results-view.tsx` — affichage résultats (adaptation contacts)

## Plan d'implémentation

Procéder dans cet ordre strict. Chaque phase doit être fonctionnelle avant de passer à la suivante.

### Phase 1 — Service LLM mutualisé pour les règles

**Objectif :** créer le service LLM central que les règles P3, P6, W6 et C-06 utiliseront.

1. **Créer `src/lib/audit/llm-rules.ts`** — service LLM mutualisé :
   - Variable d'environnement : `OPENAI_RULES_MODEL` (fallback `"gpt-4.1-mini"`)
   - Temperature : `0.1`
   - Utiliser l'OpenAI Responses API avec structured outputs (`response_format: { type: "json_schema", json_schema: {...}, strict: true }`) — **même pattern que `diagnostic-ia.ts`**
   - Implémenter un helper `callLlmBatch<T>(systemPrompt, items, schema, batchSize=30)` qui :
     - Découpe les items en batches de `batchSize`
     - Appelle l'API pour chaque batch avec structured output
     - Gère le timeout (30s), les retries (3 avec backoff exponentiel)
     - Retourne `T[] | null` (null = fallback)
   - Exposer 4 fonctions spécialisées (voir PRD section 6.1) :
     - `llmValidateRedundancy(pairs)` — pour P3
     - `llmAnalyzeTyping(properties)` — pour P6
     - `llmAnalyzeWorkflowNaming(workflows)` — pour W6
     - `llmAnalyzeDuplicates(groups)` — pour C-06
   - Chaque fonction construit son system prompt spécifique (voir PRD sections 6.2 à 6.6 pour les instructions système détaillées) et son JSON schema de sortie

2. **Mettre à jour `src/lib/audit/types.ts`** :
   - Ajouter les interfaces pour les résultats LLM : `RedundancyResult`, `TypingResult`, `NamingResult`, `NamingIssue`, `DuplicateLlmResult`
   - Ajouter un champ optionnel `llmValidated?: boolean` sur `PropertyIssue` (P3) et `PropertyTypingIssue` (P6)
   - Ajouter un champ `confidence?: number` et `reason?: string` sur les clusters de doublons contacts

3. **Ajouter `OPENAI_RULES_MODEL` dans `.env.local.example`**

### Phase 2 — Règles Propriétés (P3, P6)

**Objectif :** modifier P3 et P6 pour intégrer le LLM en second pass.

1. **Modifier `runP3()` dans `custom-properties.ts`** :
   - Abaisser le seuil Levenshtein de `0.80` à `0.70`
   - Après le pré-filtre Levenshtein, appeler `llmValidateRedundancy()` avec les paires candidates
   - Contexte par paire envoyé au LLM : `label`, `name` (nom interne), `type`, `description`
   - Si le LLM confirme `redundant: true` → conserver la paire, marquer `llmValidated: true`
   - Si le LLM infirme `redundant: false` → retirer la paire des résultats
   - Si le LLM échoue (retour `null`) → conserver toutes les paires candidates, marquer `llmValidated: false`

2. **Modifier `runP6()` dans `custom-properties.ts`** :
   - Conserver le pass regex existant (fast path)
   - Ajouter un pass LLM : appeler `llmAnalyzeTyping()` avec **toutes** les propriétés custom (tous types, pas seulement `string`)
   - Contexte par propriété : `label`, `name`, `type` (type actuel), `description`, `objectType`
   - Le system prompt du LLM doit inclure les directives du PRD section 6.3 :
     - Biais fort contre les champs texte libre
     - Prioriser enumeration/radio/select pour "type de X", "catégorie", "statut"
     - Strict sur les numériques (montant, quantité, score → number)
     - Texte libre acceptable uniquement pour notes/commentaires/descriptions
   - Fusionner les résultats regex + LLM (dédoublonner par nom de propriété)
   - Si LLM échoue → afficher uniquement les résultats regex + tag "analyse IA indisponible"

3. **Mettre à jour l'affichage P6** dans le composant de résultats pour montrer : type actuel, type suggéré, raison en une phrase (champ `reason` du LLM)

### Phase 3 — Règles Workflows (W4, W5, W6)

**Objectif :** modifier W4, remplacer W5, et passer W6 au LLM.

1. **Modifier `runW4()` dans `workflows.ts`** :
   - Changer le seuil de `90` jours à `30` jours
   - C'est le seul changement

2. **Remplacer `runW5()` dans `workflows.ts`** :
   - Supprimer l'ancienne logique (inactif récent ≤ 90j)
   - Nouvelle logique : workflow avec `description` null, vide ou whitespace-only
   - Appliquer le délai de grâce 7 jours (exclure workflows créés < 7j)
   - Sévérité : Info

3. **Modifier `runW6()` dans `workflows.ts`** :
   - Supprimer les 4 patterns regex existants (`/^copy of /i`, `/^new workflow/i`, `/^workflow\s*\d+$/i`, longueur < 5)
   - Appeler `llmAnalyzeWorkflowNaming()` avec la liste complète des noms de workflows (nom, type, statut)
   - Le LLM retourne : `convention_detected`, `convention_description?`, `issues[]` avec `workflow_name`, `problem` ("incomprehensible" | "breaks_convention"), `reason`
   - Mapper les issues en `WorkflowIssue[]`
   - Si LLM échoue → aucun résultat W6, tag "analyse IA indisponible" dans la section
   - Sévérité : **Avertissement** (montée depuis Info)
   - Délai de grâce 7 jours maintenu

4. **Mettre à jour `workflow-score.ts`** :
   - W5 : comptée en Info (comme avant mais avec la nouvelle logique description)
   - W6 : comptée en **Avertissement** (était Info) — 2 pts par workflow au lieu de 0.5

5. **Mettre à jour les types dans `types.ts`** :
   - `WorkflowAuditResults.w5` : adapter le type si nécessaire
   - `WorkflowAuditResults.w6` : ajouter les champs `convention_detected`, `convention_description`

### Phase 4 — Règles Contacts : suppressions et réorganisation

**Objectif :** supprimer les anciennes règles et restructurer les types avant de créer les nouvelles.

1. **Supprimer dans `contacts.ts`** :
   - `runC02()` (contact sans nom → absorbé dans C-07)
   - `runC04a()`, `runC04b()`, `runC04c()`, `runC04d()` (→ absorbés dans C-03, C-04)
   - `runC07()` (doublons nom+company → absorbé dans C-06)
   - `runC08()` (doublons téléphone → absorbé dans C-06)
   - `runC10()` (contact stale)
   - `runC11()` (contact sans owner)
   - `runC12()` (contact sans source)

2. **Mettre à jour `types.ts` — `ContactAuditResults`** :
   - Supprimer les champs `c02`, `c04a`, `c04b`, `c04c`, `c04d`, `c07`, `c08`, `c10`, `c11`, `c12`
   - Modifier `c03` : nouveau type avec 5 sous-cas (a-e), chaque sous-cas est un tableau de contacts
   - Modifier `c04` : nouveau type avec 2 sous-cas (a, b)
   - Modifier `c06` : ajouter `confidence`, `reason`, `llmValidated` sur les clusters
   - Ajouter `c07` (contact inexploitable), `c08` (contact incomplet), `c10` (téléphone non normalisé)

3. **Mettre à jour `contact-engine.ts`** :
   - Retirer les appels aux fonctions supprimées
   - Ajouter les appels aux nouvelles fonctions
   - Adapter le return object à la nouvelle structure

### Phase 5 — Nouvelles règles Contacts (C-03, C-04, C-06, C-07, C-08, C-10)

**Objectif :** implémenter les règles réécrites et les nouvelles règles.

1. **Réécrire `runC03()` dans `contacts.ts`** — Lifecycle stage incohérent :
   - C-03a : `lifecyclestage` null ou vide
   - C-03b : contact avec ≥ 1 deal `open` ET lifecycle ∉ {`opportunity`, `customer`}
   - C-03c : contact avec ≥ 1 deal `closedwon` ET lifecycle ≠ `customer`
   - C-03d : contact avec lifecycle = `customer` ET 0 deal `closedwon`
   - C-03e : contact avec lifecycle = `subscriber`/`lead` ET ≥ 1 deal `open`
   - Dédoublonner : un contact présent dans plusieurs sous-cas n'est compté qu'une fois pour le scoring
   - Les sous-cas b, c, d, e nécessitent les associations contact→deals (réutiliser le pattern existant)

2. **Réécrire `runC04()` dans `contacts.ts`** — Segmentation lifecycle imparfaite :
   - C-04a : 0 contact MQL ET 0 contact SQL ET ≥ 1 deal `open` (reprise de l'ancienne C-04c)
   - C-04b : lifecycle stage customisé avec > 8 étapes. Récupérer la définition du lifecycle stage via `GET /crm/v3/properties/contacts/lifecyclestage` et compter les options

3. **Réécrire `runC06()` dans `contacts.ts`** — Doublons contacts fusionnés :
   - **Pass 1** (email exact) : reprendre la logique existante de normalisation email (lowercase + trim + strip sous-adressage). Score de confiance = 100
   - **Pass 2** (LLM intra-company) :
     - Pour chaque company avec ≥ 2 contacts, pré-filtrer les paires par Levenshtein léger (~60% sur fullname)
     - Appeler `llmAnalyzeDuplicates()` avec les groupes de paires. Contexte par contact : firstname, lastname, jobtitle, email, phone, mobilephone
     - Le LLM retourne par paire : `is_duplicate`, `confidence` (0-100), `reason`
     - Créer les clusters à partir des paires confirmées, fusionner les clusters transitifs
   - Fusionner les résultats Pass 1 + Pass 2 (dédoublonner, garder le score de confiance le plus élevé)
   - Fallback LLM : seuls les résultats Pass 1

4. **Créer `runC07()` dans `contacts.ts`** — Contact inexploitable :
   - Identité manquante : `firstname` ET `lastname` tous deux null/vides
   - OU aucun moyen de contact : `email` null/vide ET `phone` null/vide ET `mobilephone` null/vide ET `hs_linkedin_url` null/vide
   - Sévérité : Critique
   - Ajouter `hs_linkedin_url` aux propriétés fetchées dans `contact-engine.ts`

5. **Créer `runC08()` dans `contacts.ts`** — Contact incomplet :
   - Exclure les contacts déjà détectés par C-07
   - `jobtitle` null/vide OU 0 company associée
   - Sévérité : Avertissement
   - Ajouter `jobtitle` aux propriétés fetchées si pas déjà présent

6. **Créer `runC10()` dans `contacts.ts`** — Numéro de téléphone non normalisé :
   - Contact avec `phone` ou `mobilephone` non null/vide
   - Le numéro ne matche pas le format E.164 : `^\+[1-9]\d{6,14}$`
   - Sévérité : Info

### Phase 6 — Scoring et business impacts

**Objectif :** mettre à jour le scoring Contacts/Workflows et les business impacts.

1. **Refondre `contact-score.ts`** :
   - C-01 : critique, 1 unique si triggered
   - C-03 : avertissement, 1 par contact incohérent (dédoublonné entre sous-cas)
   - C-04 : avertissement, 1 unique par sous-cas déclenché (max 2)
   - C-05 : info, 1 unique si triggered
   - C-06 : critique, 1 par cluster
   - C-07 : critique, 1 par contact
   - C-08 : avertissement, 1 par contact
   - C-09 : avertissement, 1 par contact
   - C-10 : info, 1 par contact

2. **Mettre à jour `workflow-score.ts`** :
   - W5 : info (nouvelle règle description), 1 par workflow
   - W6 : **avertissement** (montée depuis info), 1 par workflow

3. **Mettre à jour `business-impact.ts`** :
   - **Ajouter :** c03 (nouveau), c04 (nouveau), c07, c08, c10, w5 (nouveau)
   - **Supprimer :** c02, c04a, c04b, c04c, c04d, c10 (ancien), c11, c12, w5 (ancien)
   - Voir PRD sections 6.10, 6.11, 6.12 et 6.14 pour les textes exacts

4. **Vérifier `global-score.ts`** : aucun changement structurel nécessaire (les domaines et coefficients ne changent pas)

### Phase 7 — Affichage et composants UI

**Objectif :** adapter l'affichage des résultats aux nouvelles règles.

1. **Mettre à jour `audit-results-view.tsx`** (section Contacts) :
   - C-03 : afficher les 5 sous-cas en accordion (sections dépliables dans le RuleCard)
   - C-04 : afficher les 2 sous-cas
   - C-06 : afficher le score de confiance (badge 0-100) à côté de chaque cluster + la raison de détection
   - C-07, C-08 : nouvelles RuleCards avec les bons SeverityBadge
   - C-10 : nouvelle RuleCard Info
   - Supprimer l'affichage des anciennes règles (C-02, C-04a-d, C-07/C-08/C-10/C-11/C-12 anciennes)
   - Réorganiser l'ordre des sections Contacts : C-07/C-08 (Exploitabilité) → C-06 (Doublons) → C-03/C-04 (Lifecycle) → C-01/C-05 (Taux) → C-09/C-10 (Format)

2. **Mettre à jour l'affichage Workflows** :
   - W5 : nouvelle RuleCard Info pour les workflows sans description
   - W6 : adapter l'affichage pour montrer la convention détectée (si applicable) + la liste des workflows problématiques avec raison

3. **Mettre à jour l'affichage Propriétés** :
   - P3 : ajouter un badge "Validé par IA" ou "Non validé par IA" sur chaque paire
   - P6 : afficher le type suggéré + raison pour les détections LLM. Badge "Validé par IA" / "Non validé par IA"

4. **Rapport public** (`src/app/share/[shareToken]/page.tsx`) : vérifier que les mêmes adaptations sont visibles

### Phase 8 — Mise à jour du diagnostic IA et des mappings

**Objectif :** s'assurer que le diagnostic IA (EP-14) fonctionne correctement avec les nouvelles règles.

1. **Mettre à jour `diagnostic-ia.ts`** (si nécessaire) :
   - Le `buildUserPrompt()` utilise les résultats d'audit pour construire le prompt diagnostic
   - Vérifier que les nouvelles clés de règles (c03, c04, c07, c08, c10) sont correctement mappées
   - Vérifier que les anciennes clés supprimées (c02, c04a-d, c07/c08/c10/c11/c12 anciennes) ne cassent pas le prompt
   - Mettre à jour les descriptions de règles dans le prompt si elles sont hardcodées

2. **Mettre à jour la knowledge base** (`src/lib/audit/knowledge/cross-domain-patterns.md`) si elle référence des anciennes règles

3. **Mettre à jour la progression d'audit** (`progress.ts`) si nécessaire — aucun changement attendu (les domaines ne changent pas)

### Phase 9 — Tests et validation

**Objectif :** s'assurer que tout fonctionne et qu'il n'y a pas de régression.

1. **Tester les règles LLM** :
   - Vérifier que P3 avec seuil 70% + LLM ne remonte pas "date levée de fonds" vs "montant levée de fonds"
   - Vérifier que P6 détecte "Type de contrat" en texte libre → suggestion enumeration
   - Vérifier que W6 détecte les workflows mal nommés et identifie une convention si elle existe
   - Vérifier que C-06 fusionne correctement les doublons email + LLM intra-company

2. **Tester le fallback LLM** :
   - Simuler un échec API (env var modèle invalide ou timeout)
   - Vérifier que les résultats pré-filtre sont conservés avec le tag "non validé par IA"
   - Vérifier que l'audit ne plante pas

3. **Tester les nouvelles règles Contacts** :
   - C-03 : vérifier chacun des 5 sous-cas individuellement
   - C-04b : vérifier la détection du nombre d'étapes custom du lifecycle
   - C-07 : vérifier identité manquante ET aucun moyen de contact
   - C-08 : vérifier que les contacts C-07 sont exclus de C-08
   - C-10 : vérifier détection format non E.164

4. **Tester la non-régression** :
   - Les domaines Companies, Deals, Leads, Utilisateurs ne doivent pas être affectés
   - Le score global doit se recalculer correctement
   - Le diagnostic IA doit fonctionner avec les nouvelles règles
   - Le rapport public doit afficher les mêmes résultats que le rapport authentifié

5. **Tester la performance** :
   - Lancer un audit complet et mesurer le surcoût des appels LLM
   - Le temps total ne doit pas dépasser +15 secondes vs l'actuel

## Règles à respecter pendant toute l'implémentation

- **Ne PAS modifier** les domaines Companies, Deals, Leads, Utilisateurs & Équipes — ce sera l'epic 2
- **Ne PAS modifier** le diagnostic IA (EP-14) au-delà des mappings de règles nécessaires
- **Ne PAS modifier** la formule de scoring globale ni les coefficients de pondération
- **Ne PAS modifier** l'architecture du moteur d'audit (engine.ts) — seul le passage du contexte LLM est autorisé
- **Réutiliser** les composants UI existants (RuleCard, SeverityBadge, PaginatedList, Badge, ProgressBar) — ne pas en créer de nouveaux
- **S'inspirer** de `diagnostic-ia.ts` pour les patterns OpenAI (structured outputs, schema, fallback)
- **Respecter** le design system : pas de couleur hex en dur, pas de spacing arbitraire
- **Convention de commit :** `feat(EP-19): phase N — description`
- **Non-destructif :** aucune requête en écriture vers HubSpot
