# EP-UX-04 — Refonte UX Diagnostic & Recommandations

**PRD associé :** [prd-ux-04-refonte-diagnostic-recommandations.md](../prd/prd-ux-04-refonte-diagnostic-recommandations.md)
**Date de création :** 2026-03-18
**Statut :** Spécifié

---

## Hypothèse

Si nous remplaçons le layout linéaire (scroll vertical) des sections Diagnostic et Recommandations par une grille 3 colonnes (diagnostic) et un tableau avec tabs (recommandations), avec un side panel partagé pour le détail au clic, alors les utilisateurs consulteront le diagnostic et la roadmap plus efficacement, parce que la navigation par clic (avant/arrière) remplace le scroll séquentiel et le contenu est scannable en un coup d'oeil. Nous mesurerons le succès via le feedback qualitatif sur la lisibilité et la réduction du scroll (~60% en moins).

---

## Périmètre

### In scope

- **Diagnostic — Grille 3 colonnes** : Forces / Faiblesses / Risques côte à côte, cards compactes (titre + badges), pastilles de sévérité par colonne, tri par criticité décroissante
- **Recommandations — Vue tableau** : colonnes (#, Projet, Priorité, Impact, Taille, Domaines), tabs Roadmap / Backlog
- **Side panel partagé** : panneau latéral (~480-520px) qui slide depuis la droite, navigation ← → entre items, fermeture Échap/overlay
- **Side panel diagnostic** : analyse complète, domaines, règles sources
- **Side panel recommandations** : objectif, grille metadata (priorité/impact/taille), impact attendu, checklist actions interactive
- **Cards diagnostic redesignées** : titre + bouton flèche au hover + badges (criticité + domaines)
- **Rapport public** : mêmes layouts et interactions
- **Responsive** : grille → 1 colonne < 900px, tableau → colonnes réduites < 1000px, panel → pleine largeur < 900px

### Out of scope

- Modification de la structure de données `ai_diagnostic` (jsonb)
- Persistance des coches d'actions (état visuel uniquement)
- Tri interactif des colonnes du tableau (v2)
- Modification des sections existantes du rapport (hero, grille scores, sévérité)
- Modification de la sidebar de navigation du rapport
- Modification du moteur de diagnostic ou de la knowledge base

---

## Maquettes de référence

| Section | Fichier |
|---|---|
| Diagnostic (grille 3 colonnes + side panel) | [`product/mockups/ep-ux-04-diagnostic-mockup.html`](../mockups/ep-ux-04-diagnostic-mockup.html) |
| Recommandations (tableau + side panel) | [`product/mockups/ep-ux-04-recommandations-mockup.html`](../mockups/ep-ux-04-recommandations-mockup.html) |

---

## User Stories

### EP-UX-04-S1 — Grille diagnostic 3 colonnes

**En tant que** destinataire du rapport, **je veux** voir les forces, faiblesses et risques côte à côte en colonnes, **afin de** scanner le diagnostic en un coup d'oeil sans scroller.

**Critères d'acceptance :**
- [ ] Étant donné un diagnostic avec des clusters dans les 3 catégories, quand je vois la section Diagnostic, alors les forces, faiblesses et risques sont affichés dans 3 colonnes côte à côte
- [ ] Étant donné chaque colonne, quand je lis l'en-tête, alors il affiche un dot coloré, le nom et des pastilles de sévérité (ex: "1 critique", "2 élevé") pour les faiblesses et risques
- [ ] Étant donné les clusters dans une colonne, quand ils sont affichés, alors ils sont triés par criticité décroissante (critique → élevé → modéré)
- [ ] Étant donné un écran < 900px, quand je consulte le rapport, alors les 3 colonnes s'empilent verticalement

### EP-UX-04-S2 — Cards diagnostic compactes avec bouton flèche

**En tant que** destinataire du rapport, **je veux** voir chaque cluster sous forme de card compacte avec un bouton flèche visible au survol, **afin de** savoir que les cards sont cliquables et avoir une densité d'information optimale.

**Critères d'acceptance :**
- [ ] Étant donné un cluster, quand je vois sa card, alors elle affiche : titre, bouton flèche (→) en haut à droite, badges (criticité + domaines) en bas
- [ ] Étant donné une card, quand je la survole, alors le bouton flèche apparaît avec bordure et fond subtil, et la card a un box-shadow
- [ ] Étant donné la card active (side panel ouvert), quand je la vois, alors bordure et bouton flèche sont violets

### EP-UX-04-S3 — Side panel diagnostic

**En tant que** opérateur RevOps, **je veux** cliquer sur un cluster pour voir son détail dans un panneau latéral, **afin de** consulter l'analyse complète sans quitter la vue d'ensemble.

**Critères d'acceptance :**
- [ ] Étant donné un clic sur une card, quand le side panel s'ouvre, alors il affiche : type en header, titre, criticité, analyse, domaines, règles sources
- [ ] Étant donné le side panel ouvert, quand j'utilise ← → (boutons ou clavier), alors je navigue entre les clusters de la même colonne
- [ ] Étant donné Échap ou clic overlay, quand je l'actionne, alors le panel se ferme

### EP-UX-04-S4 — Tableau des recommandations

**En tant que** consultant RevOps, **je veux** voir les recommandations sous forme de tableau avec tabs Roadmap / Backlog, **afin de** avoir une vue synthétique de la roadmap.

**Critères d'acceptance :**
- [ ] Étant donné des recommandations, quand je vois la section, alors un tableau s'affiche avec : #, Projet, Priorité, Impact, Taille, Domaines
- [ ] Étant donné les tabs, quand je clique sur Backlog, alors le tableau affiche les projets complémentaires
- [ ] Étant donné une ligne, quand je la survole, alors fond subtil et flèche → visible
- [ ] Étant donné la roadmap, quand les lignes sont affichées, alors un index #1, #2… est visible — le backlog affiche un point (·)

### EP-UX-04-S5 — Side panel recommandations

**En tant que** consultant RevOps, **je veux** cliquer sur un projet pour voir son détail avec une checklist des actions, **afin de** présenter le plan d'action à mon client.

**Critères d'acceptance :**
- [ ] Étant donné un clic sur une ligne, quand le side panel s'ouvre, alors il affiche : titre, objectif, grille metadata (Priorité, Impact, Taille), domaines, impact attendu, checklist des actions
- [ ] Étant donné les actions, quand je clique sur une case, alors le texte est barré visuellement (non persisté)
- [ ] Étant donné le header du panel, quand il s'affiche, alors il indique "Roadmap #N" ou "Backlog"
- [ ] Étant donné la navigation ← →, quand je navigue, alors je reste dans le même tab (roadmap ou backlog)

### EP-UX-04-S6 — Rapport public

**En tant que** destinataire externe via le lien public, **je veux** les mêmes layouts et interactions, **afin de** bénéficier de la même expérience.

**Critères d'acceptance :**
- [ ] Étant donné un lien public avec un diagnostic IA, quand j'ouvre le rapport, alors les sections Diagnostic et Recommandations utilisent les nouveaux layouts
- [ ] Étant donné le side panel, quand il s'ouvre sur le rapport public, alors il fonctionne identiquement

---

## Spécifications fonctionnelles

### Composants à créer

| Composant | Fichier | Rôle |
|---|---|---|
| `DiagnosticGrid` | `src/components/diagnostic-grid.tsx` | Layout 3 colonnes avec en-têtes, pastilles, tri |
| `RecommandationsTable` | `src/components/recommandations-table.tsx` | Tableau avec tabs Roadmap/Backlog, lignes cliquables |
| `DetailSidePanel` | `src/components/detail-side-panel.tsx` | Shell side panel partagé (overlay, header, nav, children) |

### Composants à modifier (redesign)

| Composant | Fichier | Nature du changement |
|---|---|---|
| `DiagnosticClusterCard` | `src/components/diagnostic-cluster-card.tsx` | Nouveau layout : titre + bouton flèche + badges row |

### Composants à supprimer

| Composant | Fichier | Remplacé par |
|---|---|---|
| `DiagnosticSection` | `src/components/diagnostic-section.tsx` | `DiagnosticGrid` |
| `RecommandationsSection` | `src/components/recommandations-section.tsx` | `RecommandationsTable` |
| `ProjectCard` | `src/components/project-card.tsx` | `RecommandationsTable` + `DetailSidePanel` |

### Fichiers à modifier

| Fichier | Nature du changement |
|---|---|
| `src/components/audit/audit-results-view.tsx` | Remplacer `<DiagnosticSection>` par `<DiagnosticGrid>`, `<RecommandationsSection>` par `<RecommandationsTable>`, ajouter state management pour le side panel |
| `src/app/(public)/share/[shareToken]/page.tsx` | Même intégration via les props existants de `AuditResultsView` |

---

## Critères d'acceptance globaux

- [ ] La section Diagnostic affiche les 3 colonnes côte à côte avec pastilles de sévérité
- [ ] Les cards sont triées par criticité décroissante dans chaque colonne
- [ ] Le bouton flèche apparaît au hover des cards diagnostic
- [ ] La section Recommandations affiche un tableau avec colonnes #, Projet, Priorité, Impact, Taille, Domaines
- [ ] Les tabs Roadmap / Backlog permettent de switcher le contenu du tableau
- [ ] Le clic sur une card diagnostic ou une ligne du tableau ouvre le side panel
- [ ] Le side panel affiche le contenu détaillé approprié (diagnostic ou recommandation)
- [ ] La navigation ← → fonctionne dans le side panel (boutons et clavier)
- [ ] Le side panel se ferme avec Échap, clic overlay, ou bouton ✕
- [ ] La checklist des actions est interactive (cocher/décocher visuellement)
- [ ] Le rapport public bénéficie des mêmes layouts et interactions
- [ ] Responsive : grille → 1 colonne < 900px, tableau colonnes réduites < 1000px, panel pleine largeur < 900px
- [ ] Aucune modification de la structure de données `ai_diagnostic`
- [ ] Pas de régression sur les sections existantes du rapport (hero, grille scores, sévérité)

---

## Dépendances

| Dépendance | Statut |
|---|---|
| Structure `ai_diagnostic` (jsonb) | ✅ Existant — non modifié |
| Design system tokens | ✅ Existant |
| Sidebar rapport (EP-UX-03) | ✅ Existant |
| Rapport public (EP-04 + EP-UX-03) | ✅ Existant |
| Diagnostic IA (EP-14) | ✅ Livré |

---

## Questions ouvertes

Toutes tranchées — voir PRD section 10 pour le détail.

| Question | Décision |
|---|---|
| Persistance des coches d'actions | Non — état visuel uniquement en v1 |
| Colonne vide dans la grille diagnostic | Affichée avec état vide discret |
| Navigation ← → cross-catégories | Non — navigation au sein d'une catégorie |
| Tri interactif des colonnes du tableau | Non en v1, ordre LLM conservé |
