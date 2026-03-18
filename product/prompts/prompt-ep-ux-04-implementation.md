# Prompt d'implémentation — EP-UX-04 : Refonte UX Diagnostic & Recommandations

> Ce prompt est destiné à une session Claude en **mode Dev**. Copier-coller le contenu ci-dessous pour lancer l'implémentation.

---

## Prompt

Implémente l'epic **EP-UX-04 — Refonte UX Diagnostic & Recommandations**.

### Contexte

Les sections Diagnostic et Recommandations du rapport d'audit (EP-14) ont un layout linéaire qui force trop de scroll. On veut réorganiser l'interface sans toucher à la structure de données `ai_diagnostic` (jsonb).

### Documents à lire avant de coder

1. **PRD** : `product/prd/prd-ux-04-refonte-diagnostic-recommandations.md` — specs fonctionnelles complètes, user stories, spécifications des composants
2. **Epic** : `product/epics/ep-ux-04-refonte-diagnostic-recommandations.md` — périmètre, critères d'acceptance globaux
3. **Maquette Diagnostic** : `product/mockups/ep-ux-04-diagnostic-mockup.html` — ouvrir dans le navigateur pour voir le rendu visuel et les interactions (grille 3 colonnes, cards avec bouton flèche, side panel, navigation ← →)
4. **Maquette Recommandations** : `product/mockups/ep-ux-04-recommandations-mockup.html` — ouvrir dans le navigateur pour voir le rendu visuel (tableau avec tabs, side panel avec checklist, navigation)
5. **Design system** : `product/prd/design-system-guidelines.md` — tokens obligatoires

### Ce qu'il faut faire

**3 nouveaux composants à créer :**

1. **`src/components/diagnostic-grid.tsx`** — Grille 3 colonnes (Forces / Faiblesses / Risques)
   - En-tête de colonne : dot coloré + titre + pastilles de sévérité (comptage dynamique des criticités, ex: "1 critique", "2 élevé")
   - Pas de pastilles pour la colonne Forces (pas de criticité)
   - Cards triées par criticité décroissante dans chaque colonne (critique → élevé → modéré → null)
   - Responsive : 1 colonne < 900px
   - Voir maquette `ep-ux-04-diagnostic-mockup.html` pour le rendu exact

2. **`src/components/recommandations-table.tsx`** — Tableau style Notion avec tabs
   - Tabs : Roadmap (compteur) / Backlog (compteur)
   - Colonnes : #, Projet, Priorité, Impact, Taille, Domaines
   - Index numérique (#1, #2…) pour la roadmap, point (·) pour le backlog
   - Flèche → visible au hover de chaque ligne
   - Responsive : masquer colonnes Taille et Domaines < 1000px
   - Voir maquette `ep-ux-04-recommandations-mockup.html` pour le rendu exact

3. **`src/components/detail-side-panel.tsx`** — Side panel partagé (shell)
   - Panneau qui slide depuis la droite (480px diagnostic, 520px recommandations)
   - Overlay sombre au clic → fermeture
   - Header : label contextuel + bouton fermer ✕
   - Body : `children` (contenu spécifique injecté par le parent)
   - Footer : navigation ← Précédent / compteur / Suivant → avec boutons disabled aux extrémités
   - Raccourcis clavier : Échap (fermer), ← → (naviguer)
   - Responsive : pleine largeur < 900px

**1 composant à redesigner :**

4. **`src/components/diagnostic-cluster-card.tsx`** — Nouveau layout
   - Top row : titre (flex: 1) + bouton flèche (28×28px, SVG arrow-right)
   - Bottom row : badges sur une ligne (criticité + tags domaines)
   - Bouton flèche : invisible au repos, apparaît au hover (bordure + fond subtil), violet quand active
   - Hover card : border plus claire, box-shadow léger
   - Active : bordure violette, fond violet subtil
   - Voir maquette pour le rendu exact des cards

**3 composants à supprimer (remplacés) :**
- `src/components/diagnostic-section.tsx` → remplacé par `DiagnosticGrid`
- `src/components/recommandations-section.tsx` → remplacé par `RecommandationsTable`
- `src/components/project-card.tsx` → remplacé par le tableau + side panel

**Fichier principal à modifier :**
- `src/components/audit/audit-results-view.tsx` — remplacer `<DiagnosticSection>` par `<DiagnosticGrid>` et `<RecommandationsSection>` par `<RecommandationsTable>`, ajouter le state management pour le side panel (quel item est ouvert, navigation)

### Contenu du side panel — Diagnostic

Quand on clique sur un cluster diagnostic, le side panel affiche :
- Header : "Force" / "Faiblesse" / "Risque" (coloré selon le type)
- Titre (18px)
- Badge criticité (si applicable)
- Section "Analyse" : description complète du cluster
- Section "Domaines concernés" : badges domaines
- Section "Règles sources" : liste avec code règle (monospace, violet) + label

### Contenu du side panel — Recommandations

Quand on clique sur une ligne du tableau, le side panel affiche :
- Header : "Roadmap #N" ou "Backlog"
- Titre (18px) + objectif (texte)
- Grille metadata 3 colonnes (Priorité, Impact, Taille) dans des mini-cards avec fond sombre
- Section "Domaines concernés" : badges
- Section "Impact attendu" : texte descriptif
- Section "Actions à réaliser" : checklist avec cases à cocher interactives (clic = barré visuellement, non persisté en base)

### Contraintes

- **Aucune modification de la structure de données** `ai_diagnostic` — les types dans `src/lib/audit/types.ts` ne changent pas
- **Aucune modification des autres sections du rapport** (hero, grille scores, sévérité, sidebar)
- Les maquettes HTML sont la **référence visuelle** — reproduire le même rendu en React/Tailwind avec les tokens du design system
- Le **rapport public** (`/share/[shareToken]`) doit bénéficier des mêmes changements (il utilise déjà `AuditResultsView`, donc ça devrait être transparent)
- Utiliser les tokens du design system (jamais de couleurs hex en dur) — voir `design-system-guidelines.md`

### Ordre d'implémentation suggéré

1. Créer `DetailSidePanel` (shell réutilisable)
2. Redesigner `DiagnosticClusterCard` (nouveau layout avec bouton flèche)
3. Créer `DiagnosticGrid` (remplace `DiagnosticSection`) + brancher le side panel diagnostic
4. Créer `RecommandationsTable` (remplace `RecommandationsSection` + `ProjectCard`) + brancher le side panel recommandations
5. Modifier `audit-results-view.tsx` pour utiliser les nouveaux composants
6. Supprimer les anciens composants (`DiagnosticSection`, `RecommandationsSection`, `ProjectCard`)
7. Vérifier le rapport public
8. Tester le responsive (< 900px, < 1000px)
