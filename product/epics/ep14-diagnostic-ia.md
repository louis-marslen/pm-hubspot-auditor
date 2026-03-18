# EP-14 — Diagnostic global IA & Recommandations

**PRD associé :** [prd-14-diagnostic-ia.md](../prd/prd-14-diagnostic-ia.md)
**Date de création :** 2026-03-17
**Statut :** ✅ Livré

---

## Hypothèse

Si nous remplaçons le résumé LLM court (3-5 phrases) par un diagnostic structuré (forces/faiblesses/risques) qui croise les résultats inter-domaines et une roadmap de recommandations priorisées (top 5 + backlog), alors les destinataires du rapport percevront le livrable comme autonome et actionnable, parce que le rapport répondra à "que faire concrètement" en plus de "quels sont les problèmes". Nous mesurerons le succès via le feedback qualitatif sur l'utilité des recommandations.

---

## Périmètre

### In scope

- **Diagnostic global** : génération IA de clusters forces / faiblesses / risques à partir des résultats d'audit croisés inter-domaines
- **Roadmap de recommandations** : top 5 projets prioritaires + backlog (5-10 projets), avec impact, taille, priorité et actions clés
- **Hero summary** : remplacement du résumé LLM par un extrait du diagnostic (2-3 phrases)
- **Knowledge base** : 4 fichiers markdown (best practices, maturité CRM, patterns inter-domaines, templates projets) injectés dans le prompt
- **Intégration rapport** : 2 nouvelles sections (Diagnostic, Recommandations) + 2 items sidebar + hero mis à jour
- **Rapport public** : même rendu complet (diagnostic + recommandations visibles)
- **Migration DB** : colonne `ai_diagnostic` (jsonb) dans `audit_runs`
- **Suppression quick wins** : remplacés par les recommandations IA (fallback déterministe si diagnostic indisponible)

### Out of scope

- Édition/modification des recommandations par l'utilisateur
- Cache ou re-génération du diagnostic
- Vectorisation ou RAG de la knowledge base
- Recommandations personnalisées par secteur (EP-16 futur)
- Export PDF des recommandations

---

## User Stories

### EP-14-S1 — Diagnostic global (forces / faiblesses / risques)

**En tant que** destinataire du rapport, **je veux** voir un diagnostic structuré qui croise les résultats de tous les domaines, **afin de** comprendre les patterns transverses et les risques systémiques de mon CRM.

**Critères d'acceptance :**
- [ ] Étant donné un audit terminé avec des règles déclenchées dans ≥ 2 domaines, quand le diagnostic IA est généré, alors il contient au moins 1 force, 1 faiblesse et 1 risque
- [ ] Étant donné un cluster de faiblesse, quand je le lis, alors il référence des règles de ≥ 2 domaines différents (croisement inter-domaines)
- [ ] Étant donné un cluster, quand je le vois dans le rapport, alors il affiche un titre, une description (2-3 phrases), des tags domaines, les règles sources et un badge de criticité
- [ ] Étant donné un audit avec un score > 90 dans tous les domaines, quand le diagnostic est généré, alors les forces sont majoritaires et les faiblesses/risques sont minimaux ou absents
- [ ] Étant donné une erreur de l'API OpenAI, quand le diagnostic échoue, alors le rapport s'affiche sans la section diagnostic (fallback silencieux)

### EP-14-S2 — Roadmap de recommandations (top 5 + backlog)

**En tant que** consultant RevOps, **je veux** voir une roadmap de projets d'amélioration priorisés avec impact, effort et actions clés, **afin de** présenter un plan d'action structuré à mon client.

**Critères d'acceptance :**
- [ ] Étant donné un audit avec des faiblesses identifiées, quand la roadmap est générée, alors elle contient exactement 5 projets prioritaires (ou moins si l'audit a peu de problèmes)
- [ ] Étant donné un projet de la roadmap, quand je le lis, alors il affiche titre, objectif, impact attendu, niveau d'impact (Fort/Moyen/Faible), taille (XS à XL), priorité (P1/P2/P3), domaines concernés et 3-5 actions clés
- [ ] Étant donné un projet, quand je clique sur les actions clés, alors elles se déplient (expand) — elles sont repliées par défaut
- [ ] Étant donné un audit avec beaucoup de problèmes, quand la roadmap est générée, alors un backlog de 5-10 projets complémentaires est affiché après les top 5
- [ ] Étant donné un audit quasi-parfait (score > 95), quand la roadmap est générée, alors elle contient 1-2 projets d'optimisation (pas de roadmap vide)

### EP-14-S3 — Intégration dans le rapport (sidebar, sections, hero)

**En tant que** destinataire du rapport, **je veux** voir le diagnostic et les recommandations intégrés dans le rapport existant, **afin de** les consulter dans le flux de lecture naturel.

**Critères d'acceptance :**
- [ ] Étant donné la sidebar du rapport, quand le diagnostic est disponible, alors 2 nouveaux items "Diagnostic" et "Recommandations" apparaissent entre "Vue d'ensemble" et les domaines
- [ ] Étant donné le hero du rapport, quand le diagnostic est disponible, alors le `hero_summary` du diagnostic remplace le résumé LLM actuel
- [ ] Étant donné le hero, quand le diagnostic n'est pas disponible (fallback), alors un texte générique basé sur les scores est affiché
- [ ] Étant donné la vue "Vue d'ensemble", quand je scrolle, alors l'ordre est : Hero → Grille de scores → Diagnostic → Recommandations → Règles par sévérité
- [ ] Étant donné le rapport, quand le diagnostic est disponible, alors le bloc Quick Wins n'apparaît plus (remplacé par les recommandations)
- [ ] Étant donné le rapport, quand le diagnostic n'est pas disponible, alors les Quick Wins déterministes s'affichent en fallback

### EP-14-S4 — Rapport public

**En tant que** destinataire externe via le lien public, **je veux** voir le diagnostic et les recommandations dans le rapport public, **afin de** bénéficier du même niveau d'analyse sans authentification.

**Critères d'acceptance :**
- [ ] Étant donné un lien public (`/share/[token]`), quand j'ouvre le rapport, alors les sections Diagnostic et Recommandations sont visibles
- [ ] Étant donné la sidebar du rapport public, quand le diagnostic est disponible, alors les items "Diagnostic" et "Recommandations" sont présents

### EP-14-S5 — Knowledge base

**En tant que** opérateur du produit, **je veux** que le diagnostic IA s'appuie sur une base de connaissances CRM, **afin que** les recommandations reflètent les bonnes pratiques HubSpot.

**Critères d'acceptance :**
- [ ] Étant donné les fichiers de knowledge base dans `src/lib/audit/knowledge/`, quand le prompt est construit, alors leur contenu est injecté dans le system prompt
- [ ] Étant donné le contenu total de la knowledge base, quand il est mesuré, alors il ne dépasse pas 15 000 tokens
- [ ] Étant donné un projet de recommandation, quand il est généré, alors ses actions clés reflètent les best practices HubSpot documentées (pas des recommandations génériques)

---

## Spécifications fonctionnelles

### Architecture technique

| Élément | Détail |
|---|---|
| Modèle LLM | gpt-5.4 (env var `OPENAI_MODEL`, fallback `gpt-5.4`) |
| API | OpenAI Responses API (`openai.responses.create()`) |
| Structured outputs | `response_format: { type: "json_schema", json_schema: {...}, strict: true }` |
| Temperature | 0.3 |
| Fallback | Silencieux — rapport sans diagnostic si erreur API |

### Fichiers à créer

| Fichier | Rôle |
|---|---|
| `src/lib/audit/diagnostic-ia.ts` | Génération du diagnostic IA (prompt, appel API, parsing) |
| `src/lib/audit/knowledge/hubspot-best-practices.md` | Best practices HubSpot par domaine |
| `src/lib/audit/knowledge/crm-maturity-model.md` | Modèle de maturité CRM |
| `src/lib/audit/knowledge/cross-domain-patterns.md` | Corrélations connues entre règles |
| `src/lib/audit/knowledge/project-templates.md` | Templates de projets d'amélioration CRM |

### Fichiers à modifier

| Fichier | Nature du changement |
|---|---|
| `src/app/api/audit/[id]/route.ts` | Remplacer `generateLlmSummary()` par `generateDiagnosticIA()` |
| `src/components/audit-results-view.tsx` | Ajouter sections Diagnostic et Recommandations, conditionner Quick Wins |
| `src/components/report-sidebar.tsx` | Ajouter items "Diagnostic" et "Recommandations" |
| `src/app/share/[shareToken]/page.tsx` | Même intégration que le rapport authentifié |
| Migration Supabase | `ALTER TABLE audit_runs ADD COLUMN ai_diagnostic jsonb;` |

### Composants UI à créer

| Composant | Rôle |
|---|---|
| `DiagnosticSection` | Section diagnostic avec 3 sous-sections (forces/faiblesses/risques) et cards |
| `DiagnosticClusterCard` | Card pour un cluster (titre, description, domaines, règles, criticité) |
| `RecommandationsSection` | Section recommandations avec roadmap + backlog |
| `ProjectCard` | Card pour un projet (titre, objectif, badges, actions expandables) |

### Schéma JSON de sortie

Voir PRD section 8.1 pour le schéma complet.

### Stockage DB

- Nouvelle colonne `ai_diagnostic` (jsonb) dans `audit_runs`
- Contient le JSON complet retourné par le LLM
- `llm_summary` conservé pour les audits existants, non généré pour les nouveaux

---

## Critères d'acceptance globaux

- [ ] Le diagnostic IA est généré pour chaque nouvel audit (remplace le résumé LLM)
- [ ] Le rapport affiche les sections Diagnostic et Recommandations quand `ai_diagnostic` est disponible
- [ ] Le hero utilise `hero_summary` du diagnostic au lieu de `llm_summary`
- [ ] Les Quick Wins sont masqués quand le diagnostic est disponible (fallback déterministe sinon)
- [ ] La sidebar affiche "Diagnostic" et "Recommandations" entre "Vue d'ensemble" et les domaines
- [ ] Le rapport public affiche le même rendu complet
- [ ] Le fallback silencieux fonctionne (rapport sans diagnostic si erreur API)
- [ ] Le temps d'appel API est < 30 secondes
- [ ] La knowledge base totale est < 15 000 tokens
- [ ] Pas de régression sur les sections existantes du rapport

---

## Dépendances

| Dépendance | Statut |
|---|---|
| OpenAI API (gpt-5.4, Responses API, structured outputs) | ✅ Disponible |
| Résultats d'audit (règles, scores, métriques) | ✅ Existant |
| Business impacts (`business-impact.ts`) | ✅ Existant |
| Logique LLM (`llm-summary.ts`) | ✅ À remplacer |
| Sidebar rapport (EP-UX-03) | ✅ Livré |
| Rapport public (EP-04 + EP-UX-03) | ✅ Livré |

---

## Questions ouvertes

Toutes tranchées — voir PRD section 10 pour le détail.

| Question | Décision |
|---|---|
| Modèle LLM | gpt-5.4 confirmé, pas de fallback vers un modèle inférieur |
| Temps d'exécution | Temps long acceptable |
| Cache | Non — stocké une fois en base, pas de re-génération |
| Éditabilité recommandations | Non — lecture seule |
| Fallback si erreur | Quick wins déterministes + "Diagnostic indisponible" |
