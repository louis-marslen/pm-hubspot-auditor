# Prompt d'implémentation — EP-14 : Diagnostic global IA & Recommandations

> Copier-coller ce prompt dans une session Claude en mode Dev.

---

## Contexte

Tu vas implémenter l'epic EP-14 qui remplace le résumé LLM actuel (3-5 phrases, gpt-4.1) par un **diagnostic structuré** (forces/faiblesses/risques croisés inter-domaines) et une **roadmap de recommandations** (top 5 projets prioritaires + backlog), générés par gpt-5.4 via l'API Responses d'OpenAI avec structured outputs.

L'app est fonctionnelle (tous les epics Phase 1 + Phase 2 livrés sauf EP-08). Le moteur d'audit gère 7 domaines (propriétés, contacts, companies, workflows, utilisateurs, deals, leads). Le rapport est organisé par sévérité cross-domaine avec une sidebar de navigation (EP-UX-03). Un résumé LLM court existe déjà dans `llm-summary.ts` — tu vas le remplacer par un pipeline plus complet.

**Changements structurants :**
- **Remplace `generateLlmSummary()`** par `generateDiagnosticIA()` — nouveau fichier, nouveau prompt, nouveau modèle (gpt-5.4), structured output JSON
- **Nouvelle colonne DB** : `ai_diagnostic` (jsonb) dans `audit_runs` — stocke le JSON complet du diagnostic
- **Knowledge base** : 4 fichiers markdown dans `src/lib/audit/knowledge/` injectés dans le system prompt
- **2 nouvelles sections dans le rapport** : Diagnostic (forces/faiblesses/risques) et Recommandations (roadmap + backlog)
- **2 nouveaux items sidebar** : "Diagnostic" et "Recommandations" entre "Vue d'ensemble" et les domaines
- **Hero mis à jour** : `hero_summary` du diagnostic remplace le `llm_summary`
- **Quick wins supprimés** quand le diagnostic est disponible (conservés en fallback si erreur IA)
- L'ancien champ `llm_summary` est conservé pour les audits existants mais **n'est plus généré** pour les nouveaux audits

## Documents de référence — à lire AVANT de coder

Lis ces documents intégralement avant de commencer :

1. **`product/prd/prd-14-diagnostic-ia.md`** — le PRD complet : specs fonctionnelles, schéma JSON structured output, intégration rapport, architecture LLM
2. **`product/epics/ep14-diagnostic-ia.md`** — l'epic : hypothèse, 5 user stories (S1-S5), critères d'acceptance, composants UI à créer
3. **`product/research/knowledge-base/`** — les 4 fichiers de knowledge base à copier dans `src/lib/audit/knowledge/` :
   - `hubspot-best-practices.md` — best practices par domaine CRM
   - `crm-maturity-model.md` — modèle de maturité CRM (4 niveaux)
   - `cross-domain-patterns.md` — 8 patterns inter-domaines avec règles corrélées
   - `project-templates.md` — 11 templates de projets d'amélioration CRM
4. **`product/research/knowledge-base/prompt-diagnostic-ia.md`** — le system prompt et le user prompt à intégrer, avec notes d'implémentation et estimation de tokens
5. **`product/prd/design-system-guidelines.md`** — tokens et composants UI
6. **`product/prd/screens-and-flows.md`** — architecture de navigation, maquettes d'écrans

Consulte aussi `src/CLAUDE.md` pour les conventions et le skill `feature-implementation` dans `skills/tech/workflows/feature-implementation.md` pour le workflow à suivre.

**Fichiers à étudier impérativement avant de coder :**
- `src/lib/audit/llm-summary.ts` — **le fichier que tu remplaces** : comprendre les données envoyées, le format du prompt, le fallback silencieux, l'intégration dans route.ts
- `src/lib/audit/engine.ts` — orchestrateur principal (comprendre où `generateLlmSummary` est appelé)
- `src/lib/audit/types.ts` — toutes les interfaces TypeScript + `AUDIT_DOMAINS`
- `src/lib/audit/business-impact.ts` — impacts business statiques (à inclure dans le prompt)
- `src/lib/audit/global-score.ts` — formule du score global
- `src/lib/audit/score.ts` — barème des scores et labels
- `src/app/api/audit/run/route.ts` — endpoint API d'exécution (là où le LLM est appelé)
- `src/components/audit-results-view.tsx` — composant principal du rapport (là où les sections s'affichent)
- `src/components/report-sidebar.tsx` — sidebar de navigation du rapport
- `src/components/quick-wins-callout.tsx` — composant Quick Wins (à conditionner)
- `src/app/share/[shareToken]/page.tsx` — rapport public

## Plan d'implémentation

Procéder dans cet ordre strict. Chaque phase doit être fonctionnelle avant de passer à la suivante.

### Phase 1 — Migration DB et types

**Objectif :** définir la structure de données pour le diagnostic IA.

1. **Créer la migration Supabase** (numéroter après la dernière existante) :
   ```sql
   ALTER TABLE public.audit_runs ADD COLUMN IF NOT EXISTS ai_diagnostic jsonb;
   ```

2. **Étendre `src/lib/audit/types.ts`** avec les nouveaux types :
   ```typescript
   // Cluster diagnostic (force, faiblesse, risque)
   interface DiagnosticCluster {
     titre: string;
     description: string;
     domaines: string[];
     regles_sources: string[];
     criticite: 'critique' | 'élevé' | 'modéré';
   }

   // Projet de recommandation (roadmap ou backlog)
   interface RecommandationProject {
     titre: string;
     objectif: string;
     impact_attendu: string;
     niveau_impact: 'Fort' | 'Moyen' | 'Faible';
     taille: 'XS' | 'S' | 'M' | 'L' | 'XL';
     priorite: 'P1' | 'P2' | 'P3';
     domaines: string[];
     actions_cles: string[];
   }

   // Résultat complet du diagnostic IA
   interface AIDiagnostic {
     diagnostic: {
       forces: DiagnosticCluster[];
       faiblesses: DiagnosticCluster[];
       risques: DiagnosticCluster[];
     };
     hero_summary: string;
     roadmap: RecommandationProject[];
     backlog: RecommandationProject[];
   }
   ```

3. **Étendre `GlobalAuditResults`** pour inclure `aiDiagnostic: AIDiagnostic | null`

### Phase 2 — Knowledge base

**Objectif :** installer les fichiers de connaissance qui alimentent le prompt.

1. **Créer le dossier `src/lib/audit/knowledge/`**

2. **Copier les 4 fichiers** depuis `product/research/knowledge-base/` vers `src/lib/audit/knowledge/` :
   - `hubspot-best-practices.md`
   - `crm-maturity-model.md`
   - `cross-domain-patterns.md`
   - `project-templates.md`

   ⚠️ Copier le contenu tel quel — ces fichiers sont des artefacts PM validés, ne pas les modifier.

3. **Créer `src/lib/audit/knowledge/index.ts`** — fonction de chargement :
   ```typescript
   import fs from 'fs';
   import path from 'path';

   export function loadKnowledgeBase(): string {
     const knowledgeDir = path.join(process.cwd(), 'src/lib/audit/knowledge');
     const files = [
       'hubspot-best-practices.md',
       'crm-maturity-model.md',
       'cross-domain-patterns.md',
       'project-templates.md',
     ];
     return files
       .map(f => fs.readFileSync(path.join(knowledgeDir, f), 'utf-8'))
       .join('\n\n---\n\n');
   }
   ```

### Phase 3 — Prompt et appel LLM

**Objectif :** créer le cœur du diagnostic IA — construction du prompt, appel API, parsing du résultat.

1. **Créer `src/lib/audit/diagnostic-ia.ts`** — fichier principal. Contenu :

   - **`diagnosticJsonSchema`** — le JSON Schema pour structured outputs. Doit correspondre exactement aux types `AIDiagnostic` définis en Phase 1. Utiliser `strict: true`.

   - **`buildSystemPrompt(knowledgeBase: string): string`** — construit le system prompt. Référence : `product/research/knowledge-base/prompt-diagnostic-ia.md` section "System prompt". Remplacer `{{KNOWLEDGE_BASE}}` par le contenu de la knowledge base.

   - **`buildUserPrompt(auditData): string`** — construit le user prompt avec les données de l'audit. Référence : `product/research/knowledge-base/prompt-diagnostic-ia.md` section "User prompt". Données à inclure :
     - Score global + label (réutiliser `getScoreLabel`)
     - Niveau de maturité : 0-49 → "Réactif (Niveau 1)", 50-69 → "Structuré (Niveau 2)", 70-89 → "Optimisé (Niveau 3)", 90-100 → "Excellence (Niveau 4)"
     - Scores par domaine exécuté (label + score + label)
     - Domaines exclus (issus de `skipped_reasons` et `audit_domains`)
     - Métriques volumétriques (contacts, companies, deals, workflows, utilisateurs, leads, pipelines, équipes)
     - Règles déclenchées : ruleKey, titre, sévérité, count, domaine, business impact (titre seulement, pas l'estimation complète)
     - Règles conformes : ruleKey, titre, domaine
     - Trier les règles déclenchées par sévérité (critique → avertissement → info) puis par count décroissant

   - **`generateDiagnosticIA(auditData): Promise<AIDiagnostic | null>`** — fonction principale :
     ```typescript
     export async function generateDiagnosticIA(auditData): Promise<AIDiagnostic | null> {
       try {
         const knowledgeBase = loadKnowledgeBase();
         const systemPrompt = buildSystemPrompt(knowledgeBase);
         const userPrompt = buildUserPrompt(auditData);

         const response = await openai.responses.create({
           model: process.env.OPENAI_MODEL || 'gpt-5.4',
           input: [
             { role: 'system', content: systemPrompt },
             { role: 'user', content: userPrompt },
           ],
           text: {
             format: {
               type: 'json_schema',
               json_schema: {
                 name: 'diagnostic_ia',
                 schema: diagnosticJsonSchema,
                 strict: true,
               },
             },
           },
           temperature: 0.3,
         });

         const result = JSON.parse(response.output_text);
         return result as AIDiagnostic;
       } catch (error) {
         console.error('[Diagnostic IA] Erreur:', error);
         return null; // Fallback silencieux
       }
     }
     ```

2. **Important — API Responses** : l'API Responses d'OpenAI utilise `openai.responses.create()` (pas `openai.chat.completions.create()`). Les paramètres sont différents :
   - `input` au lieu de `messages`
   - `text.format` au lieu de `response_format`
   - `response.output_text` au lieu de `response.choices[0].message.content`
   - Consulter la documentation OpenAI si besoin : https://platform.openai.com/docs/api-reference/responses

### Phase 4 — Intégration dans le pipeline d'audit

**Objectif :** remplacer `generateLlmSummary()` par `generateDiagnosticIA()` dans l'exécution de l'audit.

1. **Modifier `src/app/api/audit/run/route.ts`** (ou `engine.ts` selon l'endroit où le LLM est appelé) :
   - Remplacer l'appel à `generateLlmSummary()` par `generateDiagnosticIA()`
   - Stocker le résultat dans la colonne `ai_diagnostic` (jsonb) en base
   - Ne plus générer `llm_summary` pour les nouveaux audits
   - Conserver `llm_summary` en lecture pour les audits existants (pas de migration de données)

2. **Modifier la progression d'audit** (`progress.ts` ou équivalent) :
   - L'étape LLM dans le tracker doit afficher **"Diagnostic IA"** au lieu de **"Résumé LLM"**
   - Même pattern de progression (en cours → terminé)

3. **Mettre à jour les requêtes de lecture** (page audit results, dashboard, rapport public) :
   - Inclure `ai_diagnostic` dans les SELECT
   - Passer `aiDiagnostic` au composant `audit-results-view`

### Phase 5 — Composants UI du diagnostic

**Objectif :** créer les composants React pour afficher le diagnostic et les recommandations.

1. **Créer `src/components/diagnostic-section.tsx`** — section Diagnostic :
   ```
   <section id="diagnostic">
     <h2>Diagnostic</h2>

     <!-- Sous-section Forces (si forces.length > 0) -->
     <h3>Forces</h3>
     {forces.map(cluster => <DiagnosticClusterCard ... />)}

     <!-- Sous-section Faiblesses (si faiblesses.length > 0) -->
     <h3>Faiblesses</h3>
     {faiblesses.map(cluster => <DiagnosticClusterCard ... />)}

     <!-- Sous-section Risques (si risques.length > 0) -->
     <h3>Risques</h3>
     {risques.map(cluster => <DiagnosticClusterCard ... />)}
   </section>
   ```

2. **Créer `src/components/diagnostic-cluster-card.tsx`** — card pour un cluster :
   - Titre (14px, font-medium)
   - Description (12.5px, text-secondary, 2-3 lignes)
   - Tags domaines : pills avec le style existant des tags domaines dans les règles
   - Règles sources : texte tertiaire (11px, text-tertiary, ex: "C-01, CO-01, P1")
   - Badge criticité : réutiliser le pattern `SeverityBadge` — critique → rouge, élevé → orange, modéré → bleu
   - Pour les forces : le badge est toujours "modéré" (bleu/vert) — c'est un constat positif
   - Border, padding, hover : même style que les `RuleListItem` existants

3. **Créer `src/components/recommandations-section.tsx`** — section Recommandations :
   ```
   <section id="recommandations">
     <h2>Recommandations</h2>

     <!-- Roadmap (si roadmap.length > 0) -->
     <h3>Roadmap — Projets prioritaires</h3>
     {roadmap.map((projet, i) => <ProjectCard index={i + 1} ... />)}

     <!-- Backlog (si backlog.length > 0) -->
     <h3>Backlog</h3>
     {backlog.map(projet => <ProjectCard ... />)}
   </section>
   ```

4. **Créer `src/components/project-card.tsx`** — card pour un projet de recommandation :
   - Numéro du projet (si roadmap : "#1", "#2"... — pas de numéro pour le backlog)
   - Titre (14px, font-medium)
   - Objectif (12.5px, text-secondary, 1-2 lignes)
   - Badges inline (flex, gap-6px) :
     - Niveau d'impact : pill — Fort = vert (`bg-green-500/15 text-green-400`), Moyen = orange (`bg-amber-500/15 text-amber-400`), Faible = gris (`bg-gray-500/15 text-gray-400`)
     - Taille : pill neutre (`bg-gray-700 text-gray-300`)
     - Priorité : pill — P1 = rouge (`bg-red-500/15 text-red-400`), P2 = orange (`bg-amber-500/15 text-amber-400`), P3 = gris (`bg-gray-500/15 text-gray-400`)
   - Tags domaines : pills (même style que les clusters)
   - **Actions clés** : repliées par défaut (bouton "Voir les actions" ou chevron). Au clic, expand avec liste à puces (ul/li). 3-5 items. Utiliser un state `expanded` local.
   - Border, padding, hover : même style que les autres cards

### Phase 6 — Intégration dans le rapport

**Objectif :** brancher les nouvelles sections dans le rapport existant et mettre à jour la sidebar et le hero.

1. **Modifier `src/components/report-sidebar.tsx`** :
   - Ajouter une section **"ANALYSE IA"** entre "VUE D'ENSEMBLE" et "DOMAINES"
   - 2 items : "Diagnostic" et "Recommandations"
   - Ce sont des liens d'ancrage (`onClick → scrollIntoView({ behavior: 'smooth' })` vers `#diagnostic` et `#recommandations`)
   - Icônes : utiliser des icônes Lucide pertinentes (ex: `Brain` ou `Sparkles` pour Diagnostic, `ListChecks` ou `Route` pour Recommandations)
   - **Masqués si `aiDiagnostic` est null** (fallback)

2. **Modifier `src/components/audit-results-view.tsx`** :
   - Ajouter les composants `DiagnosticSection` et `RecommandationsSection` dans la vue "Vue d'ensemble"
   - **Ordre des sections** (vue d'ensemble) :
     1. Hero (score + hero_summary)
     2. Grille de scores domaines
     3. `<DiagnosticSection />` ← nouveau
     4. `<RecommandationsSection />` ← nouveau
     5. Actions critiques (règles)
     6. Avertissements (règles)
     7. Informations (règles)
     8. Conformes (règles)
   - Conditionner l'affichage : sections visibles uniquement si `aiDiagnostic !== null`
   - En vue domaine filtré (clic sidebar sur un domaine) : les sections Diagnostic et Recommandations sont **masquées** (elles sont globales, pas par domaine)

3. **Modifier le hero** dans `audit-results-view.tsx` :
   - Si `aiDiagnostic?.hero_summary` existe → l'utiliser comme texte du hero (remplace `llm_summary`)
   - Sinon, fallback vers `llm_summary` si disponible (audits anciens)
   - Sinon, texte générique basé sur les scores (comportement actuel)

4. **Conditionner les Quick Wins** dans `audit-results-view.tsx` :
   - Si `aiDiagnostic` est disponible → **ne pas afficher** `QuickWinsCallout`
   - Si `aiDiagnostic` est null → afficher les Quick Wins déterministes comme actuellement (fallback)

5. **Modifier `src/app/share/[shareToken]/page.tsx`** (rapport public) :
   - Même intégration que le rapport authentifié
   - Passer `aiDiagnostic` au composant de rendu
   - Vérifier que les sections Diagnostic et Recommandations s'affichent correctement

### Phase 7 — Polish et edge cases

**Objectif :** gérer tous les cas limites et valider la qualité.

1. **Fallback complet** :
   - Si `generateDiagnosticIA()` retourne `null` → le rapport s'affiche normalement sans les sections Diagnostic/Recommandations, les Quick Wins déterministes restent visibles, le hero utilise le texte générique
   - La sidebar ne montre pas les items "Diagnostic" et "Recommandations"
   - Aucun message d'erreur visible pour l'utilisateur (fallback silencieux)

2. **Audits existants** (rétrocompatibilité) :
   - Les audits créés avant EP-14 ont `ai_diagnostic = null` et `llm_summary` renseigné
   - Le hero utilise `llm_summary` pour ces audits
   - Les sections Diagnostic/Recommandations n'apparaissent pas
   - Les Quick Wins déterministes s'affichent

3. **Audit avec peu de règles déclenchées** (score > 90) :
   - Le diagnostic doit quand même fonctionner — le LLM est instruit de produire au moins 1 force
   - La roadmap peut contenir 1-2 projets d'optimisation (le LLM est instruit de ne pas laisser la roadmap vide)

4. **Audit partiel** (domaines exclus via EP-17) :
   - Les domaines exclus sont mentionnés dans le prompt → le LLM en tient compte
   - Les clusters ne référencent que les domaines audités

5. **Scroll et navigation** :
   - Vérifier que le clic sur "Diagnostic" dans la sidebar scrolle bien vers `#diagnostic`
   - Vérifier que le clic sur "Recommandations" scrolle vers `#recommandations`
   - Vérifier que le retour à "Vue d'ensemble" dans la sidebar réaffiche les sections (si on était en vue domaine filtré)

6. **Responsive** :
   - Les cards de clusters et projets doivent être lisibles sur mobile (< 768px)
   - Les badges inline doivent wrapper correctement (flex-wrap)
   - Les actions clés expandables doivent fonctionner sur mobile

7. **Performance** :
   - Le temps d'appel API gpt-5.4 peut être long (10-30s) — c'est acceptable
   - Vérifier que le timeout Vercel (300s) n'est pas atteint sur le total de l'audit
   - La knowledge base est lue à chaque appel (pas de cache en v1) — c'est OK, c'est de la lecture fichier locale

## Règles à respecter pendant toute l'implémentation

- **Réutiliser les patterns existants** — les nouvelles sections doivent visuellement s'intégrer au rapport existant (même palette, mêmes spacings, mêmes patterns de cards)
- **Zéro couleur hex en dur** — uniquement les classes Tailwind du design system
- **Non-destructif** — aucune requête en écriture à l'API HubSpot ni à l'API OpenAI au-delà du diagnostic
- **Fallback silencieux obligatoire** — le rapport doit toujours fonctionner sans diagnostic IA. Tester en coupant la clé API OpenAI
- **Ne pas supprimer `llm-summary.ts`** — le garder pour référence et pour les audits existants. Simplement ne plus l'appeler pour les nouveaux audits
- **Ne pas modifier les règles d'audit** — EP-14 n'ajoute ni ne modifie aucune règle. Il consomme les résultats existants
- **Ne pas modifier la logique de scoring** — EP-14 ne change pas les scores. Il les lit et les transmet au LLM
- **Knowledge base en lecture seule** — les fichiers dans `src/lib/audit/knowledge/` ne sont pas modifiés par le code. Ils sont lus et injectés dans le prompt
- **Ne pas créer de fichiers dans `product/`**
- **Convention de commit** : `feat(EP-14): phase N — [description]`

## Récapitulatif des fichiers

### À créer

| Fichier | Rôle |
|---|---|
| Migration SQL | `ALTER TABLE audit_runs ADD COLUMN ai_diagnostic jsonb` |
| `src/lib/audit/knowledge/hubspot-best-practices.md` | Knowledge base — best practices |
| `src/lib/audit/knowledge/crm-maturity-model.md` | Knowledge base — maturité CRM |
| `src/lib/audit/knowledge/cross-domain-patterns.md` | Knowledge base — patterns inter-domaines |
| `src/lib/audit/knowledge/project-templates.md` | Knowledge base — templates de projets |
| `src/lib/audit/knowledge/index.ts` | Chargement de la knowledge base |
| `src/lib/audit/diagnostic-ia.ts` | Prompt, appel API, parsing — cœur du diagnostic |
| `src/components/diagnostic-section.tsx` | Section Diagnostic (forces/faiblesses/risques) |
| `src/components/diagnostic-cluster-card.tsx` | Card pour un cluster diagnostic |
| `src/components/recommandations-section.tsx` | Section Recommandations (roadmap + backlog) |
| `src/components/project-card.tsx` | Card pour un projet de recommandation |

### À modifier

| Fichier | Changement |
|---|---|
| `src/lib/audit/types.ts` | Types `AIDiagnostic`, `DiagnosticCluster`, `RecommandationProject` |
| `src/app/api/audit/run/route.ts` | Remplacer `generateLlmSummary` par `generateDiagnosticIA`, stocker `ai_diagnostic` |
| `src/lib/audit/progress.ts` | Label "Diagnostic IA" au lieu de "Résumé LLM" |
| `src/components/audit-results-view.tsx` | Ajouter sections Diagnostic + Recommandations, conditionner Quick Wins, mettre à jour hero |
| `src/components/report-sidebar.tsx` | Ajouter items "Diagnostic" et "Recommandations" |
| `src/app/share/[shareToken]/page.tsx` | Passer `aiDiagnostic` au rendu, même intégration |
| Requêtes de lecture audit | Inclure `ai_diagnostic` dans les SELECT |
