# Prompt d'implémentation — EP-UX-03 : Refonte de la page rapport d'audit

> Copier-coller ce prompt dans une session Claude en mode Dev.

---

## Contexte

Tu vas implémenter l'epic EP-UX-03 qui refond la page rapport d'audit de HubSpot Auditor. C'est un changement majeur d'UX : on passe d'une navigation **par domaine** (tabs horizontaux) à une navigation **par sévérité** (sidebar + vue cross-domaine). L'objectif est que le destinataire du rapport voie immédiatement les problèmes les plus critiques, indépendamment du domaine HubSpot concerné.

L'app est fonctionnelle (7 domaines d'audit livrés : propriétés, contacts, companies, workflows, utilisateurs, deals, leads). **Aucune donnée, règle, ou logique d'audit ne change.** Ce chantier est purement frontend/UX — on réorganise l'affichage des résultats existants.

**Changements structurants :**
- **Layout** : les tabs horizontaux sticky disparaissent. Une sidebar fixe de 200px apparaît à gauche avec la liste des domaines, leurs scores, et des actions (Partager, futur PDF)
- **Architecture info** : les règles ne sont plus groupées par domaine mais par **sévérité** (critiques → avertissements → infos → conformes). Chaque règle affiche un tag avec son domaine d'origine
- **Hero** : simplifié — ScoreCircle 80px (au lieu de 120px), résumé texte (LLM ou générique), métadonnées, delta score vs dernier audit
- **Grille scores** : nouveau composant sous le hero — une mini-card par domaine avec score + barre de progression
- **Quick wins** : nouveau bloc callout entre la grille et les sections de sévérité — 2-4 actions concrètes recommandées
- **Section "Conformes"** : les règles OK (count = 0) sont désormais affichées dans une section dédiée en bas de page
- **Vue domaine** : clic sidebar/grille → filtre les règles pour un seul domaine (toujours groupées par sévérité)
- **Rapport public** : même refonte, sidebar adaptée (pas de Partager/PDF, CTA "Lancer votre audit" à la place)

## Documents de référence — à lire AVANT de coder

Lis ces documents intégralement avant de commencer :

1. **`product/prd/prd-ux-03-refonte-rapport.md`** — le PRD complet : problem narrative, specs de chaque composant, logique quick wins, logique delta score, responsive, mapping sévérité→style
2. **`product/epics/ep-ux-03-refonte-rapport.md`** — l'epic : hypothèse, 7 user stories Gherkin, critères d'acceptance, composants à créer vs réutiliser
3. **`product/prd/design-system-guidelines.md`** — tokens et composants UI existants (à réutiliser tels quels)

Consulte aussi `src/CLAUDE.md` pour les conventions.

**Fichiers à étudier impérativement avant de coder :**
- `src/components/audit/audit-results-view.tsx` — **fichier principal à refondre** (~1857 lignes). Comprendre la structure actuelle : hero, tabs, sections par domaine, RuleCard interne, PaginatedList
- `src/app/audit/[id]/page.tsx` — page wrapper (comprendre le layout actuel avec DashboardShell)
- `src/app/share/[shareToken]/page.tsx` — rapport public (même composant, variante isPublic)
- `src/components/ui/score-circle.tsx` — ScoreCircle à réutiliser (ajouter support taille 80px)
- `src/components/ui/severity-badge.tsx` — SeverityBadge (vérifier variante "ok")
- `src/components/ui/tabs.tsx` — Tabs actuels (à remplacer par la sidebar)
- `src/components/ui/card.tsx` — Card (à réutiliser)
- `src/components/ui/badge.tsx` — Badge (à réutiliser)
- `src/components/layout/topbar.tsx` — Topbar (inchangée)
- `src/components/layout/dashboard-shell.tsx` — Layout actuel (à remplacer par ReportLayout)
- `src/lib/audit/types.ts` — types GlobalAuditResults (comprendre la structure des données)
- `src/lib/audit/business-impact.ts` — impacts business par règle (pour le tag "Impact business")

## Maquette HTML de référence

La maquette cible a été fournie en HTML statique. Les points clés à respecter :
- Sidebar 200px fixe avec sections "Vue d'ensemble", "Domaines", "Rapport"
- Dot coloré + score numérique à droite de chaque domaine dans la sidebar
- Indicateur actif : barre 2.5px à gauche + fond surélevé
- Hero : circle 80px + H1 label + paragraphe résumé + métadonnées en ligne
- Grille 5 colonnes de mini-cards avec label + score + barre 3px de progression
- Callout Quick wins : fond info subtle, border-left 3px, bullet points
- Sections par sévérité : H2 + count, puis liste de cartes
- Carte de règle : dot + titre + description + badge sévérité pill + tag domaine texte + count pill à droite
- Section Conformes : cartes en opacité réduite, badge "OK" vert

**IMPORTANT : la palette de couleurs de la maquette (warm grays, light mode) est IGNORÉE.** On utilise la palette dark existante du projet (gris bleutés froids, tokens Tailwind custom). Adapter les composants de la maquette aux tokens existants.

## Plan d'implémentation

Procéder dans cet ordre strict. Chaque phase doit être fonctionnelle avant de passer à la suivante.

### Phase 1 — Nouveaux composants UI atomiques

**Objectif :** créer les briques de base réutilisables.

1. **Créer `src/components/report/report-sidebar.tsx`** (`ReportSidebar`) :
   ```
   Props :
     domains: Array<{ id, label, score?, skipped?, icon? }>
     activeDomain: string | null  (null = vue "Tableau de bord")
     onDomainSelect: (id: string | null) => void
     isPublic?: boolean

   Structure :
     <nav> position fixed, top 0, bottom 0, left 0
     width 200px, bg-gray-900, border-right border-gray-700
     padding-top: hauteur topbar (56px)
     overflow-y auto

     Section "VUE D'ENSEMBLE" (titre uppercase 10px, text-gray-500, spacing)
       Item "Tableau de bord" — actif par défaut

     Section "DOMAINES" (titre uppercase)
       Pour chaque domaine :
         Item : label + à droite (dot 5px coloré + score 11px)
         Dot color via getScoreColor(score) existant
         Si skipped/non exécuté : "—" en gray-500, pas de dot
         Hover : bg-gray-850
         Actif : bg-gray-850 + barre 2.5px à gauche en blue-500 + texte gray-100

     Section "RAPPORT" (titre uppercase, margin-top)
       Si !isPublic :
         Item "Partager" → action copie lien public
                Si isPublic :
         Item CTA "Lancer votre audit" → lien vers la page d'accueil
   ```
   Style des items sidebar : `flex items-center gap-1.5 px-3.5 py-1.5 text-xs cursor-pointer text-gray-400 hover:bg-gray-850 transition-colors relative`. L'item actif ajoute `text-gray-100 font-medium bg-gray-850` et un `::before` pseudo-element pour la barre gauche.

2. **Créer `src/components/report/domain-score-grid.tsx`** (`DomainScoreGrid`) :
   ```
   Props :
     domains: Array<{ id, label, score?, skipped? }>
     activeDomain: string | null
     onDomainClick: (id: string) => void

   Layout : grid grid-cols-5 gap-2 (responsive : grid-cols-3 md, grid-cols-2 sm)

   Chaque card :
     border border-gray-700, rounded-lg, p-2.5 px-3, cursor-pointer
     hover:border-gray-600 transition
     Si activeDomain === id : border-gray-500 bg-gray-850

     Label : text-[10.5px] text-gray-400, truncate
     Score : text-lg font-medium text-gray-100
       Si skipped : text-gray-500 "—"
     Barre : h-[3px] rounded-full bg-gray-700 mt-1.5
       Fill : h-full rounded-full, width = score%, color = getScoreColor(score)
   ```

3. **Créer `src/components/report/quick-wins-callout.tsx`** (`QuickWinsCallout`) :
   ```
   Props :
     recommendations: string[]

   Visible uniquement si recommendations.length > 0

   Layout : p-3 px-4, bg-blue-500/10, border-l-[3px] border-blue-500
     H3 : "Corrections rapides recommandées" — text-xs font-medium text-blue-400 mb-1.5
     Liste : chaque item = flex items-start gap-1.5
       Dot : w-1 h-1 rounded-full bg-blue-400 flex-shrink-0 mt-[5px]
       Texte : text-xs text-gray-300
   ```

4. **Créer `src/components/report/severity-section.tsx`** (`SeveritySection`) :
   ```
   Props :
     title: string ("Actions critiques" | "Avertissements" | "Informations" | "Conformes")
     count: number
     children: ReactNode

   Visible uniquement si count > 0

   Layout :
     Header : flex items-baseline gap-1.5
       H2 : text-sm font-medium text-gray-100
       Count : text-[11px] text-gray-500 "{count} règles"
     Liste : flex flex-col gap-1.5 mt-2
       {children}
   ```

5. **Créer `src/components/report/rule-list-item.tsx`** (`RuleListItem`) :
   ```
   Props :
     title: string
     description?: string (1-2 lignes, résumé du problème avec contexte)
     severity: "critique" | "avertissement" | "info" | "ok"
     domainLabel: string
     count?: number
     hasBusinessImpact?: boolean
     expandable?: boolean (default true si severity !== "ok")
     defaultOpen?: boolean
     children?: ReactNode (contenu expand : détails, items paginés, recommandation)

   Layout (collapsed) :
     flex items-start gap-2.5 p-2.5 px-3
     border border-gray-700 rounded-lg
     hover:bg-gray-850 hover:border-gray-600 cursor-pointer transition

     Dot : w-[5px] h-[5px] rounded-full mt-[6px] flex-shrink-0
       critique → bg-red-400
       avertissement → bg-amber-400
       info → bg-blue-400
       ok → bg-green-400

     Center (flex-1 min-w-0) :
       Titre : text-xs font-medium text-gray-100
       Description : text-[11.5px] text-gray-400 leading-relaxed (masquée si ok)
       Métadonnées : flex gap-2 mt-1 text-[10.5px] text-gray-500 items-center
         Badge sévérité : pill arrondi
           critique → bg-red-500/15 text-red-400 "Critique"
           avertissement → bg-amber-500/15 text-amber-400 "Avertissement"
           info → bg-blue-500/15 text-blue-400 "Info"
           ok → text-green-400 "OK" (pas de pill)
         Span domaine : texte simple
         Si hasBusinessImpact : span "Impact business" en text-amber-400

     Droite :
       Count pill : text-[11px] text-gray-400 bg-gray-850 px-2 py-0.5 rounded-full
       Masqué si ok ou pas de count

     Si ok : opacity-50 sur tout le conteneur

   Layout (expanded) :
     Bordure inférieure ajoutée : border-t border-gray-700 pt-3 mt-2
     {children} affiché en dessous
     Chevron rotation 180° (même pattern que RuleCard actuel)
   ```

6. **Créer `src/components/report/report-layout.tsx`** (`ReportLayout`) :
   ```
   Props :
     sidebar: ReactNode
     children: ReactNode

   Layout :
     <div className="flex min-h-screen">
       {sidebar}
       <main className="flex-1 min-w-0 ml-[200px] px-6 pt-14 pb-6 flex flex-col gap-4">
         {children}
       </main>
     </div>

   Responsive (< 1024px) :
     sidebar masquée (hidden lg:block)
     main : ml-0
     Bouton hamburger dans la topbar (ou en haut du contenu)
     Sidebar en overlay (fixed inset-0, z-40, bg-black/50 backdrop)
   ```

### Phase 2 — Logique de transformation des données

**Objectif :** créer les utilitaires qui transforment les données d'audit (par domaine) en données affichables (par sévérité).

1. **Créer `src/lib/report/transform-rules.ts`** :
   ```typescript
   type FlatRule = {
     ruleKey: string        // ex: "P1", "C-06", "D-05", "L-01"
     title: string
     description: string    // description courte contextuelle (avec données)
     severity: "critique" | "avertissement" | "info"
     domainId: string       // ex: "properties", "contacts", "deals"
     domainLabel: string    // ex: "Propriétés custom", "Deals & Pipelines"
     count: number
     hasBusinessImpact: boolean
     isEmpty: boolean       // count === 0
     renderDetail?: () => ReactNode  // callback pour le contenu expand
   }

   function flattenAllRules(auditResults: GlobalAuditResults): FlatRule[]
   ```

   Cette fonction parcourt **tous** les domaines d'audit et extrait chaque règle sous forme normalisée. Le champ `description` est un résumé court contextuel (ex: "6 propriétés (Rôle, CRM…) sont vides et encombrent votre workspace"). Le champ `renderDetail` est un callback qui retourne le JSX de détail (items paginés, impact business, recommandation) — il capture le contenu actuellement dans les `<RuleCard>` enfants.

   C'est le cœur de la transformation. Chaque domaine a ses propres règles et formats de données — il faut une extraction uniforme :
   - **Properties** : P1-P6 (custom rules) + P7-P16 (system rules) → extraire titre, description, count depuis `propertyResults`
   - **Contacts** : C-01 à C-12 → depuis `contactResults`
   - **Companies** : CO-01 à CO-08 → depuis `companyResults`
   - **Workflows** : W1-W7 → depuis `workflowResults`
   - **Users** : U-01 à U-07 → depuis `userResults`
   - **Deals** : D-01 à D-15 → depuis `dealResults`
   - **Leads** : L-01 à L-14 → depuis `leadResults`

2. **Créer `src/lib/report/group-by-severity.ts`** :
   ```typescript
   type SeverityGroups = {
     critiques: FlatRule[]      // severity === "critique" && !isEmpty
     avertissements: FlatRule[] // severity === "avertissement" && !isEmpty
     infos: FlatRule[]          // severity === "info" && !isEmpty
     conformes: FlatRule[]      // isEmpty (count === 0)
   }

   function groupBySeverity(rules: FlatRule[]): SeverityGroups
   ```
   Dans chaque groupe, trier par count décroissant.

3. **Créer `src/lib/report/generate-quick-wins.ts`** :
   ```typescript
   function generateQuickWins(rules: FlatRule[]): string[]
   ```
   Logique :
   - Prendre les règles déclenchées (non vides), critiques d'abord, puis avertissements
   - Trier par count décroissant
   - Limiter à 3-4
   - Générer un texte actionnable via un mapping `ruleKey → template(count)`
   - Exemples de templates :
     - P1 → "Supprimer les {count} propriétés vides depuis plus de 90 jours"
     - P4 → "Renseigner les descriptions manquantes sur {count} propriétés"
     - D-03/D-05 → "Clôturer ou mettre à jour les {count} deals ouverts/bloqués depuis plus de 60 jours"
     - U-01 → "Réduire le nombre de Super Admins ({count} actuellement)"
     - Fallback générique : "Corriger les {count} occurrences de « {title} »"

4. **Créer `src/lib/report/compute-score-delta.ts`** :
   ```typescript
   async function fetchScoreDelta(workspaceId: string, currentAuditId: string): Promise<number | null>
   ```
   Query Supabase : dernier audit du même workspace (hors audit courant), retourner `currentScore - previousScore`. Retourner `null` si pas d'audit précédent.

### Phase 3 — Refonte du composant principal

**Objectif :** refondre `audit-results-view.tsx` pour utiliser le nouveau layout et les nouvelles structures.

C'est la phase la plus importante et la plus risquée. Le fichier actuel fait ~1857 lignes. La stratégie est de **remplacer progressivement** plutôt que de tout réécrire :

1. **Supprimer le composant `Tabs`** de l'import et du JSX. Supprimer toute la logique de tabs (activeTab, onTabChange, scroll-to-section).

2. **Ajouter l'état de navigation** :
   ```typescript
   const [activeDomain, setActiveDomain] = useState<string | null>(null)
   // null = vue "Tableau de bord" (toutes les règles, par sévérité)
   // "properties" | "contacts" | ... = vue domaine filtrée
   ```

3. **Appeler les utilitaires de transformation** :
   ```typescript
   const allRules = useMemo(() => flattenAllRules(auditResults), [auditResults])
   const filteredRules = useMemo(() =>
     activeDomain ? allRules.filter(r => r.domainId === activeDomain) : allRules
   , [allRules, activeDomain])
   const groups = useMemo(() => groupBySeverity(filteredRules), [filteredRules])
   const quickWins = useMemo(() =>
     activeDomain === null ? generateQuickWins(allRules) : []
   , [allRules, activeDomain])
   ```

4. **Refondre le hero** (2 modes) :

   **Mode "Tableau de bord" (activeDomain === null)** :
   - ScoreCircle en 80px (via className `w-20 h-20`) — score **global**
   - H1 : label textuel (getScoreLabel existant)
   - Paragraphe : résumé LLM (`executive_summary`) ou texte générique basé sur les comptes de sévérité
   - Métadonnées : nombre de contacts / companies / deals / date / delta score
   - Supprimer les boutons d'action (déplacés dans sidebar)
   - Supprimer la grille de subscores (déplacée en composant DomainScoreGrid en dessous)

   **Mode domaine filtré (activeDomain !== null)** :
   - ScoreCircle en 80px — score **du domaine** (pas le global)
   - H1 : nom du domaine (ex: "Deals & Pipelines")
   - Sous-titre : label du score domaine (ex: "Bon")
   - Paragraphe : résumé contextuel (ex: "{N critiques}, {N avertissements} sur {totalRules} règles analysées")
   - Métadonnées : données spécifiques au domaine (ex: "387 deals · 2 pipelines", "18 915 contacts", "7 utilisateurs · 3 équipes")
   - Pas de delta score en mode domaine

5. **Remplacer les sections par domaine** par les sections par sévérité :
   ```jsx
   <SeveritySection title="Actions critiques" count={groups.critiques.length}>
     {groups.critiques.map(rule => (
       <RuleListItem key={rule.ruleKey} {...rule} expandable>
         {rule.renderDetail?.()}
       </RuleListItem>
     ))}
   </SeveritySection>
   <SeveritySection title="Avertissements" count={groups.avertissements.length}>
     ...
   </SeveritySection>
   <SeveritySection title="Informations" count={groups.infos.length}>
     ...
   </SeveritySection>
   <SeveritySection title="Conformes" count={groups.conformes.length}>
     {groups.conformes.map(rule => (
       <RuleListItem key={rule.ruleKey} severity="ok" {...rule} expandable={false} />
     ))}
   </SeveritySection>
   ```

6. **Wrapper le tout dans ReportLayout** :
   ```jsx
   <ReportLayout
     sidebar={
       <ReportSidebar
         domains={domainsList}
         activeDomain={activeDomain}
         onDomainSelect={setActiveDomain}
         isPublic={isPublic}
       />
     }
   >
     <Breadcrumb ... />
     <HeroSection ... />
     <DomainScoreGrid ... />
     {activeDomain === null && quickWins.length > 0 && <QuickWinsCallout recommendations={quickWins} />}
     <SeveritySection title="Actions critiques" ... />
     <SeveritySection title="Avertissements" ... />
     <SeveritySection title="Informations" ... />
     <SeveritySection title="Conformes" ... />
   </ReportLayout>
   ```

7. **Le contenu expand de chaque RuleListItem** doit reproduire le détail actuellement dans les RuleCard enfants : listes paginées d'items, bloc impact business, recommandation. Ce contenu est spécifique à chaque règle — le callback `renderDetail` dans `FlatRule` permet de capturer le JSX existant.

### Phase 4 — Pages wrapper et rapport public

**Objectif :** adapter les pages Next.js au nouveau layout.

1. **Modifier `src/app/audit/[id]/page.tsx`** :
   - Remplacer `DashboardShell` par le nouveau layout (ou laisser le composant gérer son propre layout via `ReportLayout`)
   - Ajouter le fetch du delta score (`fetchScoreDelta`) et le passer en prop

2. **Modifier `src/app/share/[shareToken]/page.tsx`** :
   - Même refonte, avec `isPublic={true}` passé à `ReportSidebar`
   - La sidebar affiche un CTA "Lancer votre audit" au lieu de Partager/PDF
   - La topbar publique reste inchangée

3. **Vérifier que la page de progression d'audit** (`audit-progress-tracker.tsx`) n'est PAS affectée — elle garde le layout actuel (pas de sidebar pendant le chargement). La sidebar n'apparaît qu'une fois le rapport terminé.

### Phase 5 — Responsive et polish

**Objectif :** assurer la qualité sur toutes les tailles d'écran et les cas limites.

1. **Responsive sidebar** :
   - `< 1024px` : sidebar masquée (`hidden lg:block`)
   - Bouton hamburger en haut du contenu (icône Menu de Lucide)
   - Clic → overlay sidebar (fixed, z-40, backdrop blur)
   - Clic dehors ou clic item → fermeture
   - Main content : `ml-0 lg:ml-[200px]` transition

2. **Responsive grille scores** :
   - `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`

3. **Edge cases** :
   - 0 règle déclenchée (score 100) → pas de Quick Wins, pas de section critiques/avertissements/infos, section Conformes avec toutes les règles
   - 1 seul domaine exécuté → sidebar avec 1 seul domaine, la vue "Tableau de bord" est identique à la vue domaine
   - Domaine skipped → affiché dans sidebar avec "—", pas cliquable (ou cliquable → message "Non exécuté")
   - Pas de résumé LLM → texte générique : "Votre workspace présente {N critiques} critiques et {N avert.} avertissements. {Label} avec un score de {score}/100."
   - Pas d'audit précédent → delta score masqué
   - Rapport public sans données leads (domaine non sélectionné) → "Leads" n'apparaît pas dans sidebar

4. **Animations** :
   - Transition sidebar overlay : `transform translate-x + opacity`, `duration-200`
   - Barre de progression domaines : `transition-all duration-500` au chargement
   - Expand/collapse RuleListItem : rotation chevron 180° `transition-transform duration-200`

5. **Cleanup** :
   - Supprimer l'ancien composant `Tabs` de `audit-results-view.tsx` (s'il n'est plus importé nulle part ailleurs)
   - Supprimer la logique de scroll-to-section et IntersectionObserver associée aux tabs
   - Supprimer l'ancien `RuleCard` interne s'il est entièrement remplacé par `RuleListItem`
   - Vérifier qu'aucun import cassé ne subsiste

## Règles à respecter pendant toute l'implémentation

- **Aucun changement de données ou de logique d'audit** : ce chantier est 100% frontend/UX. Ne pas modifier `engine.ts`, les fichiers de règles, `global-score.ts`, les endpoints API, ni les migrations DB
- **Palette inchangée** : utiliser les tokens Tailwind dark existants (gray-950/900/850/800/700 pour les fonds et bordures, gray-100/200/300/400/500 pour les textes, red/amber/green/blue pour les sévérités). **Zéro couleur hex en dur**, zéro nouveau token
- **Réutiliser les composants UI existants** : ScoreCircle, SeverityBadge, Badge, PaginatedList, Breadcrumb, Button. Ne pas recréer ce qui existe
- **Convention de commit** : `feat(EP-UX-03): phase N — description`
- **Pas de nouvelle dépendance npm**
- **Pas de régression d'information** : toutes les règles, tous les counts, tous les détails actuellement visibles doivent rester accessibles dans la nouvelle UI. Rien ne disparaît — la hiérarchie change
- **Ne pas toucher à la page de progression** (`audit-progress-tracker.tsx`), au dashboard principal, aux settings, ni à la modale de sélection des domaines
- **Ne pas toucher aux fichiers dans `product/`** — read-only
- **Tester le rapport public** (`/share/[token]`) à chaque phase — il utilise le même composant

## Récapitulatif des fichiers

### À créer

| Fichier | Composant |
|---|---|
| `src/components/report/report-sidebar.tsx` | ReportSidebar |
| `src/components/report/domain-score-grid.tsx` | DomainScoreGrid |
| `src/components/report/quick-wins-callout.tsx` | QuickWinsCallout |
| `src/components/report/severity-section.tsx` | SeveritySection |
| `src/components/report/rule-list-item.tsx` | RuleListItem |
| `src/components/report/report-layout.tsx` | ReportLayout |
| `src/lib/report/transform-rules.ts` | flattenAllRules() |
| `src/lib/report/group-by-severity.ts` | groupBySeverity() |
| `src/lib/report/generate-quick-wins.ts` | generateQuickWins() |
| `src/lib/report/compute-score-delta.ts` | fetchScoreDelta() |

### À modifier significativement

| Fichier | Nature du changement |
|---|---|
| `src/components/audit/audit-results-view.tsx` | Refonte majeure : supprimer tabs, réorganiser par sévérité, intégrer sidebar via ReportLayout |
| `src/app/audit/[id]/page.tsx` | Adapter le layout wrapper |
| `src/app/share/[shareToken]/page.tsx` | Adapter le layout wrapper (variante publique) |

### Inchangés (à réutiliser)

ScoreCircle, SeverityBadge, Badge, PaginatedList, Breadcrumb, Button, Topbar, ProgressBar
