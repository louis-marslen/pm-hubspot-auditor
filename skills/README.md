# Skills — HubSpot Auditor

Bibliothèque de skills Claude pour ce projet, organisée en deux catégories : **PM** (product management) et **Tech** (développement).

- Skills PM : `pm/` — basés sur [deanpeters/Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills)
- Skills Tech : `tech/` — patterns et processus de développement pour HubSpot Auditor

---

## Skills PM (`pm/`)

Skills de product management traduits et adaptés pour ce projet.

### Workflows PM

Processus de bout en bout orchestrant plusieurs skills composants.

| Skill | Description | Utiliser quand... |
|---|---|---|
| [`session-strategie-produit`](pm/workflows/session-strategie-produit.md) | Session de stratégie produit complète — positionnement, discovery, roadmap | Démarrer ou rafraîchir la stratégie produit |
| [`developpement-prd`](pm/workflows/developpement-prd.md) | Construire un PRD structuré prêt pour l'engineering | Transformer des notes de discovery en document actionnable |
| [`planification-roadmap`](pm/workflows/planification-roadmap.md) | Planifier une roadmap stratégique par trimestre | Traduire la stratégie en plan de release exécutable |

### Composants PM

Outils ciblés pour produire un artefact PM spécifique.

| Skill | Description | Utiliser quand... |
|---|---|---|
| [`user-story`](pm/components/user-story.md) | Rédiger une user story format Mike Cohn + critères Gherkin | Transformer un besoin utilisateur en travail prêt pour le dev |
| [`enonce-probleme`](pm/components/enonce-probleme.md) | Rédiger un problem statement centré utilisateur | Cadrer la discovery, aligner sur le problème avant la solution |
| [`jobs-to-be-done`](pm/components/jobs-to-be-done.md) | Explorer les jobs, douleurs et gains clients | Clarifier les besoins non satisfaits, guider la discovery |
| [`proto-persona`](pm/components/proto-persona.md) | Créer un proto-persona hypothesis-driven | Aligner l'équipe sur le client cible avant la validation |
| [`enonce-positionnement`](pm/components/enonce-positionnement.md) | Créer un énoncé de positionnement style Geoffrey Moore | Clarifier la différenciation et le message stratégique |
| [`cartographie-parcours-client`](pm/components/cartographie-parcours-client.md) | Créer une customer journey map complète | Diagnostiquer une expérience défaillante, aligner les équipes |
| [`audit-ux`](pm/components/audit-ux.md) | Auditer l'UX d'un parcours existant (heuristiques Nielsen) | Évaluer un produit avant un redesign ou un rattrapage UX |
| [`decoupage-user-story`](pm/components/decoupage-user-story.md) | Découper de grandes stories en stories livrables | Quand un backlog item est trop grand pour être estimé ou livré |

### Interactifs PM

Processus guidés en question-réponse pour des décisions contextuelles.

| Skill | Description | Utiliser quand... |
|---|---|---|
| [`conseiller-priorisation`](pm/interactive/conseiller-priorisation.md) | Choisir le bon framework de priorisation selon le contexte | Décider entre RICE, ICE, Valeur/Effort ou autre |
| [`decoupeur-epics`](pm/interactive/decoupeur-epics.md) | Découper des epics avec les 9 patterns Humanizing Work | Un epic est trop grand pour le sprint planning |
| [`arbre-opportunites-solutions`](pm/interactive/arbre-opportunites-solutions.md) | Construire un Opportunity Solution Tree | Cadrer un problème avant de décider quoi construire |
| [`preparation-interviews-decouverte`](pm/interactive/preparation-interviews-decouverte.md) | Planifier des interviews de discovery client | Préparer une validation de problème ou une recherche churn |
| [`conseiller-investissement-feature`](pm/interactive/conseiller-investissement-feature.md) | Évaluer une feature selon son ROI et sa valeur stratégique | Décider si une feature mérite l'investissement |

### Relations entre skills PM

```
session-strategie-produit (workflow maître)
├─ enonce-positionnement
├─ proto-persona
├─ jobs-to-be-done
├─ enonce-probleme
├─ cartographie-parcours-client
├─ audit-ux
├─ arbre-opportunites-solutions
├─ conseiller-priorisation
└─ developpement-prd (workflow)
   ├─ enonce-probleme
   ├─ proto-persona
   ├─ decoupeur-epics (interactif)
   └─ user-story
      └─ decoupage-user-story

planification-roadmap (workflow)
├─ conseiller-priorisation (interactif)
└─ conseiller-investissement-feature (interactif)

preparation-interviews-decouverte (interactif)
└─ alimente → enonce-probleme, proto-persona, jobs-to-be-done
```

---

## Skills Tech (`tech/`)

Skills de développement pour implémenter les features de HubSpot Auditor.

### Workflows Tech

Processus de développement complets, de la spec au code.

| Skill | Description | Utiliser quand... |
|---|---|---|
| [`feature-implementation`](tech/workflows/feature-implementation.md) | Workflow complet d'implémentation d'une feature (PRD → spec → code → test) | Démarrer le développement d'un nouvel epic |
| [`code-review`](tech/workflows/code-review.md) | Checklist et processus de review de code | Valider un PR avant merge |

### Composants Tech

Artefacts ciblés pour documenter et concevoir les aspects techniques.

| Skill | Description | Utiliser quand... |
|---|---|---|
| [`architecture-decision-record`](tech/components/architecture-decision-record.md) | Documenter une décision technique structurante (ADR) | Choisir une librairie, une architecture, un pattern |
| [`technical-design-doc`](tech/components/technical-design-doc.md) | Rédiger une spec technique détaillée avant implémentation | Avant de coder une feature complexe |
| [`api-endpoint-spec`](tech/components/api-endpoint-spec.md) | Spécifier un endpoint REST (méthode, params, réponses, erreurs) | Concevoir ou documenter une route API |
| [`database-schema`](tech/components/database-schema.md) | Modéliser des entités et leurs relations | Concevoir ou réviser le modèle de données |
| [`ui-component-spec`](tech/components/ui-component-spec.md) | Spécifier un composant UI réutilisable (variants, props, états) | Créer ou refactoriser un composant du design system |

### Interactifs Tech

Processus guidés pour prendre des décisions techniques.

| Skill | Description | Utiliser quand... |
|---|---|---|
| [`tech-stack-advisor`](tech/interactive/tech-stack-advisor.md) | Guider le choix de librairies ou services avec trade-offs | Évaluer plusieurs options techniques |
| [`bug-investigation`](tech/interactive/bug-investigation.md) | Processus structuré de débogage (symptômes → hypothèses → fix) | Face à un bug difficile à reproduire ou comprendre |

### Relations entre skills Tech

```
feature-implementation (workflow maître)
├─ technical-design-doc (composant)
│  ├─ api-endpoint-spec
│  └─ database-schema
├─ ui-component-spec (si nouveau composant UI)
├─ architecture-decision-record (si décision structurante)
└─ code-review (workflow, fin de cycle)

tech-stack-advisor (interactif)
└─ alimente → architecture-decision-record

bug-investigation (interactif)
└─ peut aboutir → architecture-decision-record (si fix architectural)
```
