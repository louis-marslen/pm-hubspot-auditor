# PRD — EP-UX-04 : Refonte UX Diagnostic & Recommandations

**Auteur :** Louis
**Date :** 2026-03-18
**Statut :** Spécifié
**Epic :** [ep-ux-04-refonte-diagnostic-recommandations.md](../epics/ep-ux-04-refonte-diagnostic-recommandations.md)

---

## 1. Résumé exécutif

Les sections Diagnostic et Recommandations (EP-14) affichent actuellement leurs contenus de manière **linéaire et verticale** : les clusters forces/faiblesses/risques sont empilés les uns sous les autres, et les projets de la roadmap sont des cards expandables à scroller. Sur un audit typique (3 forces, 4 faiblesses, 2 risques, 5 projets roadmap, 3 backlog), l'utilisateur doit scroller ~1500px de contenu dense avant d'atteindre la fin des recommandations.

EP-UX-04 réorganise ces deux sections sans toucher à la structure de données :

**Diagnostic → Grille 3 colonnes + Side panel :**
- Forces, Faiblesses et Risques côte à côte en colonnes
- Cards compactes (titre + badge criticité + tags domaines)
- Clic sur une card → side panel avec le détail complet

**Recommandations → Tableau + Side panel :**
- Vue tableau style Notion (colonnes : #, Projet, Priorité, Impact, Taille, Domaines)
- Tabs Roadmap / Backlog pour switcher
- Clic sur une ligne → side panel avec objectif, metadata, impact et checklist des actions

**Pattern unifié :** les deux sections partagent le même side panel et le même pattern d'interaction (clic → panneau latéral → navigation ← →). Résultat : ~80% de scroll en moins, navigation par clic avant/arrière au lieu du défilement linéaire.

---

## 2. Narration du problème (Problem Narrative)

### Situation actuelle

Sophie, consultante RevOps, présente le rapport d'audit à son client. Elle scrolle à travers la section Diagnostic : 3 forces, puis 4 faiblesses avec descriptions complètes et règles sources, puis 2 risques. Le client décroche au milieu des faiblesses — trop d'information linéaire, pas de hiérarchie visuelle entre les clusters.

Elle arrive ensuite à la section Recommandations : 5 ProjectCards empilées, chacune avec un bouton "Voir les actions" à cliquer. Pour montrer les actions du projet #3, elle doit d'abord replier le #1, scroller, déplier le #3. Le client perd le contexte de la roadmap globale.

### Situation cible

Sophie ouvre la section Diagnostic : en un coup d'oeil, elle voit les 3 colonnes — 3 forces, 4 faiblesses (dont 1 critique, 2 élevé, 1 modéré), 2 risques (dont 1 critique). Elle clique sur "Doublons cross-objets non traités" (critique) : un panneau latéral s'ouvre avec l'analyse complète, les domaines et les règles sources. Elle navigue avec → vers la faiblesse suivante sans fermer le panneau.

Pour les Recommandations, elle montre le tableau : "Voici vos 5 projets prioritaires, triés par priorité". Elle clique sur le projet #1 : le panneau affiche l'objectif, l'impact attendu, et la checklist des actions concrètes. Le tableau reste visible à gauche — le client garde la vue d'ensemble.

### Insight fondamental

Les consultants RevOps utilisent le rapport comme **support de présentation** en réunion. Le format linéaire force le scroll séquentiel ; le format tableau + panneau permet une navigation **à la demande** — on montre le niveau de détail que le public demande, pas tout d'un coup.

---

## 3. Personas & Jobs-To-Be-Done

### Persona primaire : le consultant RevOps

Sophie utilise le rapport comme livrable client. Elle le présente en réunion et doit naviguer fluidement entre vue d'ensemble et détail.

**JTBD :** Quand je présente le diagnostic à mon client, je veux pouvoir montrer la vue synthétique puis plonger dans un point précis au clic, afin de garder l'attention du client et répondre à ses questions en temps réel.

### Persona secondaire : le destinataire du rapport (directeur, VP)

Il consulte le rapport seul via le lien public. Il veut comprendre la situation rapidement sans scroller des pages de texte.

**JTBD :** Quand je consulte le diagnostic de mon CRM, je veux scanner les forces/faiblesses/risques en un coup d'oeil et cliquer uniquement sur ce qui m'intéresse, afin de me concentrer sur les points critiques sans être noyé d'information.

---

## 4. Contexte stratégique

- Le diagnostic IA (EP-14) est la **feature différenciante** du produit — son UX doit être à la hauteur de la qualité du contenu généré
- Le format tableau + side panel est le standard des outils pro (Notion, Linear, Jira) — pattern familier pour les personas cibles
- La grille 3 colonnes est le pattern des dashboards d'analyse (Datadog, Grafana) — lecture comparative immédiate
- Cette refonte ne touche **aucune structure de données** — uniquement du frontend, risque technique faible
- Le side panel partagé est réutilisable pour de futurs besoins (détail de règles, profil business EP-16)

---

## 5. Vue d'ensemble de la solution

### Maquettes de référence

| Section | Maquette | Fichier |
|---|---|---|
| Diagnostic (grille 3 colonnes + side panel) | [Ouvrir la maquette](../mockups/ep-ux-04-diagnostic-mockup.html) | `product/mockups/ep-ux-04-diagnostic-mockup.html` |
| Recommandations (tableau + side panel) | [Ouvrir la maquette](../mockups/ep-ux-04-recommandations-mockup.html) | `product/mockups/ep-ux-04-recommandations-mockup.html` |

### Section Diagnostic — Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ ✦ Diagnostic                                    9 insights     │
├─────────────────┬─────────────────┬─────────────────────────────┤
│ ● Forces     3  │ ● Faiblesses    │ ● Risques                  │
│                 │ 1 critique      │ 1 critique  1 élevé        │
│                 │ 2 élevé         │                             │
│                 │ 1 modéré        │                             │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────┐            │
│ │ Titre    [→]│ │ │ Titre    [→]│ │ │ Titre    [→]│            │
│ │ Tags        │ │ │ Crit. Tags  │ │ │ Crit. Tags  │            │
│ └─────────────┘ │ └─────────────┘ │ └─────────────┘            │
│ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────┐            │
│ │ Titre    [→]│ │ │ Titre    [→]│ │ │ Titre    [→]│            │
│ │ Tags        │ │ │ Crit. Tags  │ │ │ Crit. Tags  │            │
│ └─────────────┘ │ └─────────────┘ │ └─────────────┘            │
│ ┌─────────────┐ │ ┌─────────────┐ │                             │
│ │ Titre    [→]│ │ │ Titre    [→]│ │                             │
│ │ Tags        │ │ │ Crit. Tags  │ │                             │
│ └─────────────┘ │ └─────────────┘ │                             │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### Section Recommandations — Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ ✦ Recommandations                               8 projets     │
├─────────────────────────────────────────────────────────────────┤
│ [Roadmap 5]  [Backlog 3]                                       │
├────┬────────────────────────────────┬──────┬──────┬─────┬──────┤
│ #  │ Projet                      → │ Prio │ Imp. │ T.  │ Dom. │
├────┼────────────────────────────────┼──────┼──────┼─────┼──────┤
│ 1  │ Plan de déduplication      [→]│ P1   │ Fort │ M   │ C CO │
│ 2  │ Remédiation qualité données[→]│ P1   │ Fort │ L   │ C D  │
│ 3  │ Revue de gouvernance      [→] │ P1   │ Moy. │ S   │ U    │
│ 4  │ Corriger handoff lead→deal[→] │ P2   │ Fort │ M   │ L D  │
│ 5  │ Standardisation workflows [→] │ P2   │ Fbl. │ S   │ W    │
└────┴────────────────────────────────┴──────┴──────┴─────┴──────┘
```

### Side panel (partagé) — Layout

```
                                    ┌─────────────────────────┐
                                    │ TYPE              [✕]   │
                                    ├─────────────────────────┤
                                    │                         │
                                    │ Titre (18px)            │
                                    │ Objectif / Description  │
                                    │                         │
                                    │ ┌───────┬──────┬──────┐ │
                                    │ │Priorité│Impact│Taille│ │
                                    │ │  P1    │ Fort │  M   │ │
                                    │ └───────┴──────┴──────┘ │
                                    │                         │
                                    │ DOMAINES CONCERNÉS      │
                                    │ [Contacts] [Companies]  │
                                    │                         │
                                    │ IMPACT ATTENDU          │
                                    │ ou RÈGLES SOURCES       │
                                    │ Texte descriptif...     │
                                    │                         │
                                    │ ACTIONS À RÉALISER      │
                                    │ ☐ Action 1              │
                                    │ ☐ Action 2              │
                                    │ ☑ Action 3 (cochée)     │
                                    │                         │
                                    ├─────────────────────────┤
                                    │ [← Préc.]  2/5  [Suiv.→]│
                                    └─────────────────────────┘
```

---

## 6. Objectifs & métriques de succès

### Objectifs

| Objectif | Métrique | Cible |
|---|---|---|
| Réduction du scroll | Hauteur totale des sections Diagnostic + Recommandations | Réduction ≥ 60% vs actuel |
| Scan immédiat du diagnostic | Temps pour identifier le cluster le plus critique | < 5 secondes (vs ~15s avec scroll) |
| Navigation fluide | Nombre de clics pour consulter les 5 projets roadmap | 5 clics + navigation ← → (vs 10 clics expand/collapse) |

### Guardrails

- Aucune modification de la structure de données `ai_diagnostic` (jsonb)
- Pas de régression sur les informations affichées — même contenu, meilleure organisation
- Le rapport public doit bénéficier des mêmes améliorations
- Les sections existantes du rapport (hero, grille scores, sévérité) ne sont pas impactées

---

## 7. User stories

### UX-04-S1 — Grille diagnostic 3 colonnes

**En tant que** destinataire du rapport, **je veux** voir les forces, faiblesses et risques côte à côte en colonnes, **afin de** scanner le diagnostic en un coup d'oeil sans scroller.

**Critères d'acceptance :**
- [ ] Étant donné un diagnostic avec des clusters dans les 3 catégories, quand je vois la section Diagnostic, alors les forces, faiblesses et risques sont affichés dans 3 colonnes côte à côte
- [ ] Étant donné chaque colonne, quand je lis l'en-tête, alors il affiche le nom (Forces/Faiblesses/Risques) avec un dot coloré (vert/ambre/rouge) et des pastilles de sévérité (ex: "1 critique", "2 élevé") pour les faiblesses et risques
- [ ] Étant donné les clusters dans une colonne, quand ils sont affichés, alors ils sont triés par criticité décroissante (critique → élevé → modéré)
- [ ] Étant donné un écran < 900px, quand je consulte le rapport, alors les 3 colonnes s'empilent verticalement

### UX-04-S2 — Cards diagnostic compactes

**En tant que** destinataire du rapport, **je veux** voir chaque cluster sous forme de card compacte (titre + badges), **afin de** avoir une densité d'information optimale sans surcharge.

**Critères d'acceptance :**
- [ ] Étant donné un cluster, quand je vois sa card, alors elle affiche : titre (13.5px), bouton flèche en haut à droite, et une ligne de badges (criticité + tags domaines) en bas
- [ ] Étant donné un cluster sans criticité (forces), quand je vois sa card, alors seuls les tags domaines sont affichés dans les badges
- [ ] Étant donné une card, quand je la survole, alors le bouton flèche devient visible (bordure + fond subtil) et la card a un léger box-shadow
- [ ] Étant donné la card active (side panel ouvert sur ce cluster), quand je la vois, alors elle a une bordure violette et le bouton flèche est violet

### UX-04-S3 — Side panel diagnostic

**En tant que** opérateur RevOps, **je veux** cliquer sur un cluster pour voir son détail dans un panneau latéral, **afin de** consulter l'analyse complète sans quitter la vue d'ensemble.

**Critères d'acceptance :**
- [ ] Étant donné un clic sur une card diagnostic, quand le side panel s'ouvre, alors il slide depuis la droite (~480px de largeur) avec un overlay sombre
- [ ] Étant donné le side panel ouvert, quand je lis son contenu, alors il affiche : type (Force/Faiblesse/Risque) en header, titre, badge criticité (si applicable), analyse (description complète), domaines concernés (badges), et règles sources (liste avec codes)
- [ ] Étant donné le side panel ouvert, quand j'utilise les boutons ← → ou les flèches clavier, alors je navigue entre les clusters de la même colonne
- [ ] Étant donné le side panel ouvert, quand j'appuie sur Échap ou clique sur l'overlay, alors le panel se ferme
- [ ] Étant donné la navigation ← →, quand le cluster actif change, alors la card correspondante dans la grille est surlignée

### UX-04-S4 — Tableau des recommandations

**En tant que** consultant RevOps, **je veux** voir les recommandations sous forme de tableau avec colonnes (Projet, Priorité, Impact, Taille, Domaines), **afin de** avoir une vue synthétique de la roadmap comme dans un outil de gestion de projet.

**Critères d'acceptance :**
- [ ] Étant donné des recommandations générées, quand je vois la section Recommandations, alors un tableau s'affiche avec les colonnes : #, Projet, Priorité, Impact, Taille, Domaines
- [ ] Étant donné le tableau, quand je regarde les tabs, alors je peux switcher entre "Roadmap" (top projets) et "Backlog" (projets complémentaires) avec un compteur par tab
- [ ] Étant donné une ligne du tableau, quand je la survole, alors un fond subtil apparaît et une flèche → se révèle à droite du titre
- [ ] Étant donné les lignes de la roadmap, quand elles sont affichées, alors un index numérique (#1, #2…) est affiché — les lignes du backlog affichent un point (·)
- [ ] Étant donné un écran < 1000px, quand je consulte le tableau, alors les colonnes Taille et Domaines sont masquées

### UX-04-S5 — Side panel recommandations

**En tant que** consultant RevOps, **je veux** cliquer sur un projet pour voir son détail dans un panneau latéral avec une checklist des actions, **afin de** présenter le plan d'action détaillé à mon client.

**Critères d'acceptance :**
- [ ] Étant donné un clic sur une ligne du tableau, quand le side panel s'ouvre, alors il affiche : titre, objectif (texte), grille metadata (Priorité, Impact, Taille en 3 colonnes), domaines concernés, impact attendu (texte), et checklist des actions clés
- [ ] Étant donné les actions clés, quand je les vois, alors chaque action a une case à cocher interactive (clic = texte barré, état visuel uniquement, non persisté)
- [ ] Étant donné le side panel ouvert sur la roadmap, quand je navigue avec ← →, alors je parcours les projets de la roadmap (pas du backlog, et inversement)
- [ ] Étant donné le header du side panel, quand il s'affiche, alors il indique "Roadmap #N" ou "Backlog" selon le contexte

### UX-04-S6 — Rapport public

**En tant que** destinataire externe via le lien public, **je veux** voir les mêmes layouts (grille 3 colonnes, tableau, side panel) dans le rapport public, **afin de** bénéficier de la même expérience.

**Critères d'acceptance :**
- [ ] Étant donné un lien public (`/share/[token]`) avec un diagnostic IA, quand j'ouvre le rapport, alors les sections Diagnostic et Recommandations utilisent les nouveaux layouts
- [ ] Étant donné le side panel sur le rapport public, quand il s'ouvre, alors il fonctionne de manière identique (overlay, navigation, fermeture)

---

## 8. Spécifications fonctionnelles

### 8.1 Composant `DiagnosticGrid`

Remplace `DiagnosticSection` actuel.

```
Props :
  - diagnostic: { forces: DiagnosticCluster[], faiblesses: DiagnosticCluster[], risques: DiagnosticCluster[] }
  - onClusterClick: (type: string, index: number) => void

Layout : grid 3 colonnes (1fr 1fr 1fr), gap 16px
Responsive : 1 colonne < 900px

Chaque colonne :
  Header :
    - Dot coloré (8px) : vert (forces), ambre (faiblesses), rouge (risques)
    - Titre (13px, font-semibold, gray-400)
    - Pastilles de sévérité alignées à droite (margin-left: auto)
      → Comptage dynamique des criticités dans la colonne
      → Ex: "1 critique" (rouge) + "2 élevé" (ambre)
      → Pas de pastilles pour les Forces (pas de criticité)
    - Border-bottom 1px gray-800

  Cards :
    - Triées par criticité décroissante : critique → élevé → modéré → null
    - Gap 8px entre les cards
```

### 8.2 Composant `DiagnosticClusterCard` (redesign)

Remplace le DiagnosticClusterCard actuel.

```
Props :
  - cluster: DiagnosticCluster
  - isActive: boolean
  - onClick: () => void

Layout :
  Border 1px gray-700, border-radius 12px, padding 14px 16px
  Background gray-900, cursor pointer

  Top row (flex, align-items flex-start, gap 10px) :
    - Titre (flex: 1, 13.5px, font-medium, gray-100, line-height 1.45)
    - Bouton flèche (28×28px, border-radius 6px) :
      → SVG arrow-right (15px)
      → Au repos : border transparent, color gray-700
      → Hover card : border gray-600, bg gray-800, color gray-400
      → Active : border violet-500/30, bg violet-500/10, color violet-400

  Badges row (flex, gap 6px, margin-top 10px) :
    - Badge criticité (si applicable) : 10.5px, padding 2px 8px, radius 4px
      → critique : bg red-500/12, color red-400
      → élevé : bg amber-500/12, color amber-400
      → modéré : bg blue-500/12, color blue-400
    - Tags domaines : 10.5px, padding 2px 8px, radius 4px, bg gray-850, color gray-500

  Hover card :
    border-color gray-600, bg gray-850, box-shadow 0 2px 8px rgba(0,0,0,0.25)

  Active (side panel ouvert) :
    border-color violet-500, bg violet-500/6%
```

### 8.3 Composant `RecommandationsTable`

Remplace `RecommandationsSection` actuel.

```
Props :
  - roadmap: RecommandationProject[]
  - backlog: RecommandationProject[]
  - onProjectClick: (tab: 'roadmap' | 'backlog', index: number) => void

Layout :
  Tabs (Roadmap / Backlog) :
    - Flex, border-bottom 1px gray-800
    - Tab actif : color gray-100, border-bottom 2px violet-400
    - Tab inactif : color gray-600, hover gray-400
    - Count badge après le label (11px, gray-600, actif: violet-400)

  Table :
    - Border 1px gray-700, border-radius 12px, overflow hidden, bg gray-900
    - Header row : bg gray-950, height 36px, text 11px uppercase gray-600
    - Grid columns : 36px 1fr 100px 90px 70px 160px
    - Responsive < 1000px : masquer colonnes 5 (Taille) et 6 (Domaines)

  Table rows :
    - Min-height 52px, align-items center, border-bottom 1px gray-850
    - Hover : bg gray-850
    - Active : bg violet-500/6%
    - Index : 12px font-semibold gray-700 (roadmap: numéro, backlog: "·")
    - Titre : 13px font-medium gray-100, flex avec flèche → (opacity 0, visible au hover)
    - Badges Priorité : P1 rouge, P2 ambre, P3 gris
    - Badges Impact : Fort vert, Moyen ambre, Faible gris
    - Badge Taille : bg gray-800, color gray-500
    - Tags Domaines : 10px, bg gray-850, color gray-500
```

### 8.4 Composant `DetailSidePanel`

Nouveau composant partagé entre Diagnostic et Recommandations.

```
Props :
  - isOpen: boolean
  - onClose: () => void
  - onNavigate: (direction: -1 | 1) => void
  - currentIndex: number
  - totalCount: number
  - headerLabel: string  // "Force", "Faiblesse", "Risque", "Roadmap #N", "Backlog"
  - children: ReactNode  // Contenu spécifique

Layout :
  Overlay : fixed, inset 0, bg black/40%, z-index 40
    → Click → onClose()
  Panel : fixed, top 0, right 0, bottom 0, width 480px (recommandations: 520px)
    → bg gray-900, border-left 1px gray-700, z-index 50
    → Transition : translateX(100%) → translateX(0), 250ms ease

  Header : flex, justify-between, padding 20px 24px 16px, border-bottom 1px gray-800
    - Label (11px, font-semibold, uppercase, violet-400)
    - Bouton fermer (28×28px, border gray-700, hover bg gray-800)

  Body : flex-1, overflow-y auto, padding 24px
    → Contenu via children

  Footer navigation : flex, padding 12px 24px 16px, border-top 1px gray-800
    - Bouton "← Précédent" (flex 1, disabled si index === 0)
    - Counter "N / M" (11px, gray-600)
    - Bouton "Suivant →" (flex 1, disabled si index === total - 1)

Raccourcis clavier :
  - Échap → fermer
  - ← → naviguer
```

### 8.5 Contenu du side panel — Diagnostic

```
- Titre (18px, font-semibold, gray-50)
- Section Criticité (si applicable) : badge criticité
- Section Analyse : description complète (13.5px, gray-400, line-height 1.65)
- Section Domaines concernés : badges domaines (11px, bg gray-800, color gray-400)
- Section Règles sources : liste avec code règle (monospace, bg gray-800, color violet-400) + label
```

### 8.6 Contenu du side panel — Recommandations

```
- Titre (18px, font-semibold, gray-50)
- Objectif (13.5px, gray-400, line-height 1.6)
- Grille metadata (3 colonnes) :
  - Card Priorité : label uppercase + badge
  - Card Impact : label uppercase + badge
  - Card Taille : label uppercase + badge
  Chaque card : bg gray-950, border 1px gray-800, border-radius 8px, padding 12px
- Section Domaines concernés : badges
- Section Impact attendu : texte descriptif (13.5px, gray-400)
- Section Actions à réaliser : checklist interactive
  - Case à cocher (18×18px, border 1.5px gray-600, radius 4px)
    → Hover : border violet-400, bg violet-500/8%
    → Checked : bg violet-500, border violet-500, checkmark blanc
  - Texte action (13px, gray-400)
  - Checked : texte barré, color gray-600
  - État purement visuel — non persisté en base
```

### 8.7 Mapping pastilles de sévérité (en-têtes colonnes)

```
Logique de génération :
  Pour chaque colonne (faiblesses, risques) :
    1. Compter les clusters par criticité
    2. Afficher une pastille par criticité présente, triée critique → élevé → modéré
    3. Format : "{count} {label}" (ex: "1 critique", "2 élevé")
    4. Couleurs identiques aux badges criticité des cards

  Forces : pas de pastilles (pas de criticité)
```

### 8.8 Tri des cards par criticité

```
Ordre de tri dans chaque colonne :
  1. criticité "critique" en premier
  2. criticité "élevé" ensuite
  3. criticité "modéré" en dernier
  4. criticité null en dernier (forces)

À criticité égale, conserver l'ordre retourné par le LLM.
```

---

## 9. Dépendances & risques

### Dépendances

| Dépendance | Statut |
|---|---|
| Structure de données `ai_diagnostic` (jsonb) | ✅ Existant — aucune modification |
| Composants existants (DiagnosticSection, RecommandationsSection, ProjectCard, DiagnosticClusterCard) | ✅ À remplacer |
| Design system tokens (couleurs, typo, spacing) | ✅ Réutilisé tel quel |
| Sidebar rapport (EP-UX-03) | ✅ Existant — items "Diagnostic" et "Recommandations" inchangés |
| Rapport public (EP-04 + EP-UX-03) | ✅ Existant — même intégration |

### Risques

| Risque | Impact | Mitigation |
|---|---|---|
| Side panel sur mobile : 480px de largeur ne tient pas | Expérience dégradée sur petits écrans | Panel en pleine largeur (width: 100%) sur écrans < 900px |
| Grille 3 colonnes déséquilibrée (ex: 0 forces, 6 faiblesses) | Colonne vide visuellement étrange | Afficher un état vide subtil ("Aucune force identifiée") ou masquer la colonne vide et redistribuer l'espace |
| Checklist des actions non persistée | L'utilisateur perd ses coches au rechargement | Accepté en v1 — état purement visuel. Persistance possible en v2 via localStorage |
| Tableau dense sur écrans moyens | Colonnes compressées | Responsive : masquer Taille et Domaines < 1000px |

---

## 10. Questions ouvertes

| Question | Décision |
|---|---|
| Les coches des actions sont-elles persistées ? | **Décidé** — Non, état purement visuel en v1. Pas de persistence en base ni localStorage. |
| Grille 3 colonnes : que faire si une catégorie est vide ? | **Décidé** — Afficher la colonne avec un état vide discret. Ne pas masquer pour garder la structure visuelle stable. |
| Le side panel est-il le même composant pour Diagnostic et Recommandations ? | **Décidé** — Oui, un seul `DetailSidePanel` shell avec des `children` différents selon le contexte. |
| La navigation ← → du panel traverse-t-elle les catégories (forces → faiblesses → risques) ? | **Décidé** — Non, la navigation reste au sein d'une catégorie. Pour changer de catégorie, fermer le panel et cliquer dans une autre colonne. |
| Le tableau recommandations : tri par l'utilisateur (clic sur colonne) ? | **Décidé** — Non en v1. L'ordre est celui retourné par le LLM (déjà trié par priorité). |
