# PRD — EP-14 : Diagnostic global IA & Recommandations

**Auteur :** Louis
**Date :** 2026-03-17
**Statut :** Spécifié
**Epic :** [ep14-diagnostic-ia.md](../epics/ep14-diagnostic-ia.md)

---

## 1. Résumé exécutif

EP-14 transforme le résumé LLM actuel (3-5 phrases génériques, gpt-4.1) en un **diagnostic structuré** et une **roadmap de recommandations actionnables**, générés par gpt-5.4 via l'API Responses d'OpenAI avec structured outputs.

Le rapport d'audit passe de "voici vos problèmes" à "voici ce qui va bien, ce qui ne va pas, les risques systémiques, et les 5 projets prioritaires pour améliorer votre CRM". Le diagnostic croise les résultats inter-domaines pour identifier des patterns transverses (ex: doublons contacts + companies sans domain = même problème racine de qualité de données).

**Changements clés :**
- **Remplace** le résumé LLM actuel (EP-04) — le hero utilise un extrait du diagnostic
- **Supprime** les quick wins déterministes (EP-UX-03) — remplacés par des recommandations IA plus riches
- **Ajoute** 2 nouvelles sections au rapport : Diagnostic (forces/faiblesses/risques) et Recommandations (roadmap + backlog)
- **Knowledge base** injectée dans le prompt : best practices HubSpot, modèle de maturité CRM, patterns inter-domaines, templates de projets

---

## 2. Narration du problème (Problem Narrative)

### Situation actuelle

Sophie, RevOps Manager, partage le rapport d'audit à son directeur commercial. Celui-ci voit un score global de 58/100, un résumé LLM de 3 phrases ("Votre workspace présente des problèmes de qualité de données…"), puis une liste de ~40 règles triées par sévérité. Il comprend qu'il y a des problèmes, mais :

- Il ne sait pas **pourquoi** ces problèmes existent ensemble (pas de recoupement entre doublons contacts, companies sans domain et absence de workflow de déduplication)
- Il ne sait pas **que faire concrètement** — les règles disent "quoi" mais pas "quel projet lancer"
- Il ne peut pas **prioriser** — sans estimation d'effort et d'impact, impossible de choisir entre "nettoyer les contacts" et "restructurer les pipelines"

Sophie doit elle-même synthétiser les patterns, construire une roadmap et la présenter en réunion. C'est exactement le travail que l'IA devrait faire.

### Situation cible

Le directeur ouvre le rapport. Après le score global, il voit :

1. **Diagnostic** — "Vos forces : bonne couverture pipeline deals. Vos faiblesses : qualité de données d'identification (contacts sans email, companies sans domain, doublons). Vos risques : gouvernance insuffisante (4 Super Admins sur 5 utilisateurs)."
2. **Roadmap** — "Projet #1 : Nettoyage et déduplication de la base contacts (impact fort, taille M, 4 actions clés). Projet #2 : Structuration de la gouvernance utilisateurs…"

Sophie n'a plus besoin de faire la synthèse. Le rapport est un livrable complet qu'elle peut présenter tel quel à son client ou son management.

### Insight fondamental

Un rapport d'audit qui liste des problèmes sans les relier et sans proposer de plan d'action est un **diagnostic incomplet**. La valeur perçue du rapport est proportionnelle à la qualité des recommandations, pas au nombre de règles. Les consultants RevOps revendent le rapport comme un livrable — il doit être autonome.

---

## 3. Personas & Jobs-To-Be-Done

### Persona primaire : le destinataire du rapport (directeur, VP Sales, CMO)

**JTBD :** Quand je reçois un rapport d'audit CRM, je veux comprendre les **3-5 chantiers prioritaires** pour améliorer mon CRM, avec une estimation d'effort et d'impact, afin de valider un plan d'action sans avoir à interpréter les règles une par une.

### Persona secondaire : le consultant RevOps

**JTBD :** Quand je partage un rapport d'audit à mon client, je veux un **livrable structuré** avec diagnostic et roadmap clé en main, afin de gagner du temps de préparation et de justifier la valeur de ma prestation.

### Persona tertiaire : l'opérateur (RevOps Manager interne)

**JTBD :** Quand je consulte mon rapport d'audit, je veux voir les **patterns transverses** que je n'aurais pas identifiés seul (recoupements inter-domaines, risques systémiques), afin de prioriser mes projets d'amélioration CRM sur des données objectives.

---

## 4. Contexte stratégique

- Le diagnostic IA est un **différenciateur** : aucun outil concurrent (HubSpot Health Check, Datagrail) ne propose de recoupement inter-domaines ni de roadmap actionnablee
- Le rapport d'audit est le **livrable principal** partagé avec les stakeholders — sa qualité détermine la valeur perçue du produit et le potentiel de conversion (freemium → payant)
- gpt-5.4 avec structured outputs permet un résultat déterministe et parseable — le JSON est garanti valide, pas de parsing fragile
- La knowledge base (fichiers markdown) est un actif évolutif — enrichissable au fil des retours terrain sans modifier le code
- EP-14 remplace à la fois le résumé LLM (EP-04) et les quick wins déterministes (EP-UX-03) — consolidation de la couche IA en un seul pipeline

---

## 5. Vue d'ensemble de la solution

### Section A : Diagnostic global (type SWOT simplifié)

3 catégories de clusters, chacune regroupant des observations qui croisent les résultats de plusieurs domaines :

#### Forces
Domaines et aspects bien maîtrisés. Identifiées à partir des scores élevés et des groupes de règles conformes.

Exemples :
- "Bonne couverture pipeline deals" (si D-06/D-07/D-12/D-13 conformes)
- "Workflows bien structurés" (si W-01 à W-05 conformes)

#### Faiblesses
Problèmes récurrents identifiés en croisant les règles de plusieurs domaines autour d'un même thème.

Exemples :
- "Qualité des données d'identification" — regroupe P1 (propriétés sous-utilisées), C-01/C-02 (doublons contacts), CO-01 (doublons companies par domain), D-01 (deals sans montant)
- "Couverture des associations" — regroupe C-10 (contacts sans entreprise), CO-04 (companies orphelines), L-04 (leads sans contact)

#### Risques
Combinaisons de faiblesses qui créent un risque systémique.

Exemples :
- "Risque de gouvernance" — U-01 (Super Admins en excès) + U-02 (rôles non différenciés) + U-07 (utilisateurs sans rôle)
- "Risque de perte de pipeline" — D-05 (deals bloqués) + D-14 (stages sans activité) + L-01 (leads anciens)

#### Structure d'un cluster

| Champ | Description |
|---|---|
| Titre | Nom synthétique du cluster (ex: "Qualité des données d'identification") |
| Description | 2-3 phrases expliquant le pattern et ses conséquences |
| Domaines | Tags des domaines concernés (ex: Contacts, Companies, Propriétés) |
| Règles sources | Références aux règles qui fondent le cluster (ex: C-01, CO-01, P1) |
| Criticité | critique / élevé / modéré |

### Section B : Roadmap de recommandations

Structure en 2 niveaux :

#### Roadmap (top 5 projets prioritaires)
Les 5 projets à lancer en premier, triés par priorité. Chaque projet agrège les recommandations de plusieurs règles autour d'un objectif commun.

#### Backlog (projets restants)
5-10 projets complémentaires, moins prioritaires ou de plus faible impact.

#### Structure d'un projet

| Champ | Description |
|---|---|
| Titre | Nom du projet (ex: "Nettoyage et déduplication de la base contacts") |
| Objectif | 1-2 phrases — le "pourquoi" du projet |
| Impact attendu | Description qualitative de ce qui change concrètement |
| Niveau d'impact | Fort / Moyen / Faible |
| Taille (T-shirt) | XS / S / M / L / XL |
| Priorité | P1 / P2 / P3 |
| Domaines | Tags des domaines concernés |
| Actions clés | 3-5 bullet points actionnables |

Exemples de projets :
- **"Nettoyage et déduplication de la base contacts"** — Objectif : réduire les doublons et améliorer la fiabilité des données. Impact fort, taille M, P1. Actions : identifier et fusionner les doublons par email, nettoyer les contacts sans email, mettre en place un workflow de déduplication automatique…
- **"Structuration de la gouvernance utilisateurs"** — Objectif : sécuriser les accès et clarifier les rôles. Impact moyen, taille S, P2. Actions : réduire le nombre de Super Admins, assigner des rôles différenciés…

---

## 6. Objectifs & métriques de succès

### Objectifs

| Objectif | Métrique | Cible |
|---|---|---|
| Valeur perçue du rapport | Feedback qualitatif — "actionnable" / "je peux présenter tel quel" | > 80% positif |
| Complétude du diagnostic | Nombre de domaines croisés dans les clusters | ≥ 3 domaines en moyenne |
| Utilité des recommandations | Nombre de projets avec actions clés actionnables | 100% (toutes les recommandations ont des actions) |
| Temps de génération | Durée de l'appel API gpt-5.4 | < 30 secondes |

### Guardrails

- Le rapport reste fonctionnel sans diagnostic IA (fallback silencieux si erreur API)
- Le coût par audit ne doit pas dépasser 0.50$ (à surveiller après les premiers audits)
- Le temps total d'audit (fetch + analyse + diagnostic IA) ne doit pas dépasser 300 secondes (timeout Vercel)
- Les recommandations sont des suggestions — le libellé ne doit pas être prescriptif ("nous recommandons" plutôt que "vous devez")

---

## 7. User stories

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
- [ ] Étant donné un projet, quand je clique sur les actions clés, alors elles se déplient (expand) — elles sont repliées par défaut pour ne pas surcharger la vue
- [ ] Étant donné un audit avec beaucoup de problèmes, quand la roadmap est générée, alors un backlog de 5-10 projets complémentaires est affiché après les top 5
- [ ] Étant donné un audit quasi-parfait (score > 95), quand la roadmap est générée, alors elle contient 1-2 projets d'optimisation (pas de roadmap vide)

### EP-14-S3 — Intégration dans le rapport (sidebar, sections, hero)

**En tant que** destinataire du rapport, **je veux** voir le diagnostic et les recommandations intégrés dans le rapport existant, **afin de** les consulter dans le flux de lecture naturel.

**Critères d'acceptance :**
- [ ] Étant donné la sidebar du rapport, quand le diagnostic est disponible, alors 2 nouveaux items "Diagnostic" et "Recommandations" apparaissent entre "Vue d'ensemble" et les domaines
- [ ] Étant donné le hero du rapport, quand le diagnostic est disponible, alors le `hero_summary` du diagnostic remplace le résumé LLM actuel
- [ ] Étant donné le hero, quand le diagnostic n'est pas disponible (fallback), alors un texte générique basé sur les scores est affiché (comportement actuel)
- [ ] Étant donné la vue "Vue d'ensemble", quand je scrolle, alors l'ordre est : Hero → Grille de scores → Diagnostic → Recommandations → Règles par sévérité
- [ ] Étant donné le rapport, quand le diagnostic est disponible, alors le bloc Quick Wins (EP-UX-03) n'apparaît plus (remplacé par les recommandations)

### EP-14-S4 — Rapport public

**En tant que** destinataire externe via le lien public, **je veux** voir le diagnostic et les recommandations dans le rapport public, **afin de** bénéficier du même niveau d'analyse sans authentification.

**Critères d'acceptance :**
- [ ] Étant donné un lien public (`/share/[token]`), quand j'ouvre le rapport, alors les sections Diagnostic et Recommandations sont visibles (même rendu que le rapport authentifié)
- [ ] Étant donné la sidebar du rapport public, quand le diagnostic est disponible, alors les items "Diagnostic" et "Recommandations" sont présents

### EP-14-S5 — Knowledge base

**En tant que** opérateur du produit, **je veux** que le diagnostic IA s'appuie sur une base de connaissances CRM, **afin que** les recommandations reflètent les bonnes pratiques HubSpot et pas uniquement les données brutes de l'audit.

**Critères d'acceptance :**
- [ ] Étant donné les fichiers de knowledge base, quand le prompt est construit, alors leur contenu est injecté dans le system prompt
- [ ] Étant donné le contenu total de la knowledge base, quand il est mesuré, alors il ne dépasse pas 15 000 tokens
- [ ] Étant donné un projet de recommandation, quand il est généré, alors ses actions clés reflètent les best practices HubSpot documentées dans la knowledge base (pas des recommandations génériques)

---

## 8. Spécifications fonctionnelles

### 8.1 Architecture LLM

#### Modèle et API

- **Modèle** : `gpt-5.4` — configurable via env var `OPENAI_MODEL` (fallback sur `gpt-5.4` si non défini)
- **API** : OpenAI Responses API — `openai.responses.create()` (recommandé par OpenAI pour les nouveaux projets)
- **Structured outputs** : `response_format: { type: "json_schema", json_schema: {...}, strict: true }`
- **Temperature** : 0.3 (déterministe mais pas robotique)
- **Fallback** : si l'appel échoue (timeout, erreur API, JSON invalide), le rapport s'affiche sans diagnostic — même pattern que le résumé LLM actuel (fallback silencieux)

#### Knowledge base

Fichiers markdown dans `src/lib/audit/knowledge/` :

| Fichier | Contenu | Tokens estimés |
|---|---|---|
| `hubspot-best-practices.md` | Best practices par domaine CRM (contacts, deals, workflows, etc.) | ~3 000 |
| `crm-maturity-model.md` | Modèle de maturité CRM (niveaux, critères, patterns de progression) | ~3 000 |
| `cross-domain-patterns.md` | Corrélations connues entre règles (doublons ↔ companies sans domain ↔ absence déduplication auto) | ~3 000 |
| `project-templates.md` | Templates de projets d'amélioration CRM (nettoyage, gouvernance, pipeline, etc.) | ~4 000 |

Total knowledge base : ~13 000 tokens. Budget restant : ~5-8K tokens pour les données d'audit, ~3K pour la réponse.

Les fichiers sont lus au runtime et injectés dans le system prompt. Pas de vectorisation ni de RAG — injection directe.

#### Données envoyées au LLM

Réutiliser et enrichir la logique existante de `llm-summary.ts` :

```
Données incluses dans le prompt :
- Score global + label (ex: "58/100 — À améliorer")
- Scores par domaine exécuté (ex: "Contacts: 42, Deals: 78, ...")
- Domaines audités vs domaines exclus (périmètre EP-17)
- Pour chaque règle déclenchée :
  - ruleKey (ex: "C-01")
  - Titre
  - Sévérité (critique / avertissement / info)
  - Count (nombre d'occurrences)
  - Domaine d'appartenance
  - Business impact (depuis business-impact.ts)
- Métriques volumétriques : nombre total de contacts, companies, deals, pipelines, workflows, utilisateurs
```

#### Schéma JSON de sortie (structured output)

```json
{
  "diagnostic": {
    "forces": [
      {
        "titre": "string",
        "description": "string",
        "domaines": ["string"],
        "regles_sources": ["string"],
        "criticite": "critique | élevé | modéré"
      }
    ],
    "faiblesses": [
      {
        "titre": "string",
        "description": "string",
        "domaines": ["string"],
        "regles_sources": ["string"],
        "criticite": "critique | élevé | modéré"
      }
    ],
    "risques": [
      {
        "titre": "string",
        "description": "string",
        "domaines": ["string"],
        "regles_sources": ["string"],
        "criticite": "critique | élevé | modéré"
      }
    ]
  },
  "hero_summary": "string (2-3 phrases pour le hero du rapport)",
  "roadmap": [
    {
      "titre": "string",
      "objectif": "string",
      "impact_attendu": "string",
      "niveau_impact": "Fort | Moyen | Faible",
      "taille": "XS | S | M | L | XL",
      "priorite": "P1 | P2 | P3",
      "domaines": ["string"],
      "actions_cles": ["string"]
    }
  ],
  "backlog": [
    {
      "titre": "string",
      "objectif": "string",
      "impact_attendu": "string",
      "niveau_impact": "Fort | Moyen | Faible",
      "taille": "XS | S | M | L | XL",
      "priorite": "P1 | P2 | P3",
      "domaines": ["string"],
      "actions_cles": ["string"]
    }
  ]
}
```

### 8.2 Intégration dans le pipeline d'audit

#### Remplacement du résumé LLM

- `generateLlmSummary()` dans `route.ts` est remplacé par `generateDiagnosticIA()`
- Le résultat JSON est stocké dans une nouvelle colonne `ai_diagnostic` (jsonb) dans `audit_runs`
- L'ancien champ `llm_summary` (text) est conservé pour compatibilité (audits existants) mais n'est plus généré pour les nouveaux audits
- La progression d'audit affiche "Diagnostic IA" au lieu de "Résumé LLM" dans le tracker EP-UX-02

#### Migration DB

```sql
ALTER TABLE audit_runs ADD COLUMN ai_diagnostic jsonb;
```

#### Nouveau fichier principal

`src/lib/audit/diagnostic-ia.ts` — contient :
- `generateDiagnosticIA(auditData)` : fonction principale
- `buildDiagnosticPrompt(auditData, knowledgeBase)` : construction du prompt
- `loadKnowledgeBase()` : lecture des fichiers markdown
- `diagnosticJsonSchema` : schéma JSON pour structured outputs
- Types TypeScript pour le résultat

### 8.3 Intégration dans le rapport

#### Sidebar

2 nouveaux items entre "Vue d'ensemble" et les domaines :

```
VUE D'ENSEMBLE
  ● Vue d'ensemble

ANALYSE IA                    ← nouvelle section
  ◆ Diagnostic                ← scroll vers #diagnostic
  ◆ Recommandations           ← scroll vers #recommandations

DOMAINES
  ● Propriétés custom    ●50
  ...
```

Les items "Diagnostic" et "Recommandations" sont des liens d'ancrage (scroll-to) vers les sections correspondantes dans le contenu, pas des filtres comme les domaines.

Masqués si le diagnostic IA n'est pas disponible (fallback).

#### Hero

- `hero_summary` du diagnostic remplace le `llm_summary` actuel comme texte du hero en vue "Vue d'ensemble"
- Fallback : texte générique basé sur les scores (comportement actuel si pas de `ai_diagnostic`)

#### Section Diagnostic (après hero + grille de scores, avant les recommandations)

```
<section id="diagnostic">
  <h2>Diagnostic</h2>

  <h3>Forces</h3>
  [cards forces — chaque card : titre, description, tags domaines, badge criticité modéré/vert]

  <h3>Faiblesses</h3>
  [cards faiblesses — badge criticité rouge/orange]

  <h3>Risques</h3>
  [cards risques — badge criticité rouge/orange]
</section>
```

Chaque card de cluster :
- Titre (14px, font-medium)
- Description (12.5px, text-secondary, 2-3 lignes)
- Tags domaines (pills, style existant)
- Règles sources (texte tertiaire, ex: "C-01, CO-01, P1")
- Badge criticité (réutiliser le pattern SeverityBadge : critique → rouge, élevé → orange, modéré → bleu)

Sous-section masquée si aucun cluster dans la catégorie (ex: 0 risques).

#### Section Recommandations (après le diagnostic, avant les sections par sévérité)

```
<section id="recommandations">
  <h2>Recommandations</h2>

  <h3>Roadmap — Projets prioritaires</h3>
  [cards projets — top 5]

  <h3>Backlog</h3>
  [cards projets — reste]
</section>
```

Chaque card de projet :
- Titre (14px, font-medium)
- Objectif (12.5px, text-secondary, 1-2 lignes)
- Badges inline : niveau d'impact (Fort=vert, Moyen=orange, Faible=gris), taille (pill neutre), priorité (P1=rouge, P2=orange, P3=gris)
- Tags domaines (pills)
- Actions clés : repliées par défaut, expand au clic. Liste à puces, 3-5 items.

Sous-section "Backlog" masquée si le backlog est vide.

#### Suppression des Quick Wins

Le composant `QuickWinsCallout` n'est plus rendu quand `ai_diagnostic` est disponible. Conservé en fallback si le diagnostic IA échoue (les quick wins déterministes restent mieux que rien).

#### Ordre des sections dans le rapport (vue "Vue d'ensemble")

1. Hero (score + hero_summary du diagnostic)
2. Grille de scores domaines
3. **Diagnostic** (forces / faiblesses / risques) ← nouveau
4. **Recommandations** (roadmap + backlog) ← nouveau
5. Actions critiques (règles)
6. Avertissements (règles)
7. Informations (règles)
8. Conformes (règles)

### 8.4 Rapport public

Même rendu complet. Les sections Diagnostic et Recommandations sont visibles sur le rapport public (`/share/[token]`). C'est un argument de vente pour les consultants : le livrable partagé inclut l'analyse IA.

---

## 9. Dépendances & risques

### Dépendances

| Dépendance | Statut |
|---|---|
| OpenAI API (gpt-5.4, Responses API, structured outputs) | ✅ Disponible |
| Résultats d'audit complets (règles, scores, métriques) | ✅ Existant |
| Business impacts par règle (`business-impact.ts`) | ✅ Existant |
| Logique LLM existante (`llm-summary.ts`) | ✅ À remplacer/étendre |
| Sidebar rapport (EP-UX-03) | ✅ Livré |
| Rapport public (EP-04 + EP-UX-03) | ✅ Livré |
| Migration DB (ajout colonne `ai_diagnostic`) | ⚠️ À implémenter |

### Risques

| Risque | Impact | Mitigation |
|---|---|---|
| Coût API gpt-5.4 plus élevé que gpt-4.1 | Coût par audit augmenté | Surveiller le coût réel sur les 50 premiers audits. Si > 0.50$/audit, envisager de réduire la knowledge base ou passer à gpt-5.4-mini |
| Temps de génération plus long (prompt + structured output) | Audit total > 300s = timeout Vercel | Mesurer le temps réel. Si > 30s, optimiser le prompt (réduire la knowledge base) ou paralléliser avec les dernières étapes d'audit |
| Qualité variable des recommandations | Recommandations génériques ou non pertinentes | Knowledge base avec cross-domain patterns et project templates. Itérer sur le prompt après les premiers audits réels |
| Structured output rejeté par le modèle | JSON invalide ou champs manquants | `strict: true` garantit la conformité au schéma. Fallback silencieux si erreur |
| Knowledge base trop volumineuse | Dépasse le budget tokens du context window | Budget strict de 15K tokens. Mesurer au build ou au démarrage |

---

## 10. Questions ouvertes

Toutes les questions ont été tranchées.

| Question | Décision |
|---|---|
| Coût par audit avec gpt-5.4 ? | **Décidé** — On reste sur gpt-5.4. Surveiller le coût réel mais pas de fallback vers un modèle inférieur |
| Temps d'exécution acceptable ? | **Décidé** — Un temps de génération plus long est acceptable. Le diagnostic IA est la dernière étape, l'utilisateur voit la progression dans le tracker |
| Fallback si erreur IA ? | **Décidé** — Message "Diagnostic indisponible" + quick wins déterministes en fallback |
| Faut-il un cache du diagnostic ? | **Décidé** — Non. Le diagnostic est généré une fois par audit et stocké en base (`ai_diagnostic` jsonb). Pas de re-génération |
| Les recommandations doivent-elles être éditables ? | **Décidé** — Non. Lecture seule, pas d'éditabilité prévue |
