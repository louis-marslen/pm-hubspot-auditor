# Skills PM — HubSpot Auditor

Skills de product management traduits et adaptés pour ce projet, basés sur le repo [deanpeters/Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills).

---

## Workflows

Processus de bout en bout orchestrant plusieurs skills composants.

| Skill | Description | Utiliser quand... |
|---|---|---|
| [`session-strategie-produit`](workflows/session-strategie-produit.md) | Session de stratégie produit complète — positionnement, discovery, roadmap | Démarrer ou rafraîchir la stratégie produit |
| [`developpement-prd`](workflows/developpement-prd.md) | Construire un PRD structuré prêt pour l'engineering | Transformer des notes de discovery en document actionnable |
| [`planification-roadmap`](workflows/planification-roadmap.md) | Planifier une roadmap stratégique par trimestre | Traduire la stratégie en plan de release exécutable |

---

## Composants

Outils ciblés pour produire un artefact PM spécifique.

| Skill | Description | Utiliser quand... |
|---|---|---|
| [`user-story`](components/user-story.md) | Rédiger une user story format Mike Cohn + critères Gherkin | Transformer un besoin utilisateur en travail prêt pour le dev |
| [`enonce-probleme`](components/enonce-probleme.md) | Rédiger un problem statement centré utilisateur | Cadrer la discovery, aligner sur le problème avant la solution |
| [`jobs-to-be-done`](components/jobs-to-be-done.md) | Explorer les jobs, douleurs et gains clients | Clarifier les besoins non satisfaits, guider la discovery |
| [`proto-persona`](components/proto-persona.md) | Créer un proto-persona hypothesis-driven | Aligner l'équipe sur le client cible avant la validation |
| [`enonce-positionnement`](components/enonce-positionnement.md) | Créer un énoncé de positionnement style Geoffrey Moore | Clarifier la différenciation et le message stratégique |
| [`cartographie-parcours-client`](components/cartographie-parcours-client.md) | Créer une customer journey map complète | Diagnostiquer une expérience défaillante, aligner les équipes |
| [`decoupage-user-story`](components/decoupage-user-story.md) | Découper de grandes stories en stories livrables | Quand un backlog item est trop grand pour être estimé ou livré |

---

## Interactifs

Processus guidés en question-réponse pour des décisions contextuelles.

| Skill | Description | Utiliser quand... |
|---|---|---|
| [`conseiller-priorisation`](interactive/conseiller-priorisation.md) | Choisir le bon framework de priorisation selon le contexte | Décider entre RICE, ICE, Valeur/Effort ou autre |
| [`decoupeur-epics`](interactive/decoupeur-epics.md) | Découper des epics avec les 9 patterns Humanizing Work | Un epic est trop grand pour le sprint planning |
| [`arbre-opportunites-solutions`](interactive/arbre-opportunites-solutions.md) | Construire un Opportunity Solution Tree | Cadrer un problème avant de décider quoi construire |
| [`preparation-interviews-decouverte`](interactive/preparation-interviews-decouverte.md) | Planifier des interviews de discovery client | Préparer une validation de problème ou une recherche churn |
| [`conseiller-investissement-feature`](interactive/conseiller-investissement-feature.md) | Évaluer une feature selon son ROI et sa valeur stratégique | Décider si une feature mérite l'investissement |

---

## Relations entre skills

```
session-strategie-produit (workflow maître)
├─ enonce-positionnement
├─ proto-persona
├─ jobs-to-be-done
├─ enonce-probleme
├─ cartographie-parcours-client
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
