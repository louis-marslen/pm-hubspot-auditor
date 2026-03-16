# Prompt d'implémentation — EP-UX-02 : Progression d'audit en temps réel

> Copier-coller ce prompt dans une session Claude en mode Dev.

---

## Contexte

Tu vas implémenter la progression d'audit en temps réel. Aujourd'hui, quand l'utilisateur clique "Lancer un audit", le bouton est grisé avec un spinner et rien d'autre ne se passe jusqu'à la fin de l'audit (30-300s). L'objectif est de naviguer immédiatement vers la page du rapport, d'afficher un tracker de progression montrant l'avancement domaine par domaine avec sous-étapes, puis de révéler le rapport complet d'un coup quand tout est terminé.

**Ce qui existe déjà :**
- La page `/audit/{auditId}` affiche les résultats quand `status === "completed"`
- Le moteur d'audit (`engine.ts`) orchestre 4 domaines en parallèle (Propriétés, Contacts, Companies, Workflows)
- La table `audit_runs` stocke les résultats par domaine en JSONB
- Le composant `AuditResultsView` affiche le rapport complet

**Ce qu'on construit :**
- Navigation immédiate vers `/audit/{auditId}` au clic "Lancer"
- Tracker de progression avec statut par domaine + sous-étapes
- Endpoint de polling pour la progression
- Persistance de la progression en base
- Transition fluide tracker → rapport

## Documents de référence — à lire AVANT de coder

Lis ces documents intégralement avant de commencer :

1. **`product/prd/prd-progression-audit.md`** — le PRD complet : problème, specs fonctionnelles, wireframes, API de statut, cas particuliers
2. **`product/epics/ep-ux-02-progression-audit.md`** — l'epic : user stories Gherkin, critères d'acceptance
3. **`product/prd/design-system-guidelines.md`** — tokens et composants UI (section 2.13 Skeleton, section 2.9 Progress Bar, section 3.1 animations)
4. **`product/prd/screens-and-flows.md`** — section 5.5 (état in-progress, wireframe du tracker)

Consulte aussi `src/CLAUDE.md` pour les conventions et le skill `feature-implementation` dans `skills/tech/workflows/feature-implementation.md` pour le workflow à suivre.

**Fichiers à étudier impérativement avant de coder :**
- `src/lib/audit/engine.ts` — orchestrateur principal (c'est ici qu'il faut émettre la progression)
- `src/app/api/audit/run/route.ts` — endpoint de lancement (à modifier pour le retour immédiat)
- `src/app/(dashboard)/audit/[auditId]/page.tsx` — page de résultats (à étendre avec l'état "running")
- `src/components/audit/audit-results-view.tsx` — composant rapport (ne pas modifier, seulement l'enrober)
- `src/lib/audit/global-score.ts` — calcul du score global
- `supabase/migrations/` — pour la nouvelle migration

## Plan d'implémentation

Procéder dans cet ordre strict. Chaque phase doit être fonctionnelle avant de passer à la suivante.

### Phase 1 — Migration DB et modèle de progression

**Objectif :** ajouter la colonne de progression et définir la structure de données.

1. **Créer une migration Supabase** — ajouter la colonne `audit_progress` (JSONB, nullable) à `audit_runs`
2. **Définir le type TypeScript `AuditProgress`** dans `src/lib/audit/types.ts` :
   ```
   AuditProgress {
     domains: Record<string, DomainProgress>
     llmSummary: { status, error? }
     globalProgress: number (0-1)
   }
   DomainProgress {
     status: "pending" | "running" | "completed" | "error"
     currentStep: "fetching" | "analyzing" | "scoring" | null
     completedSteps: string[]
     itemCount: number | null
     error: string | null
   }
   ```
3. **Créer `src/lib/audit/progress.ts`** — fonctions utilitaires :
   - `initProgress(domains: string[]): AuditProgress` — état initial (tout pending)
   - `updateDomainStep(progress, domain, step, itemCount?): AuditProgress` — avancer une sous-étape
   - `completeDomain(progress, domain): AuditProgress`
   - `failDomain(progress, domain, error): AuditProgress`
   - `calculateGlobalProgress(progress): number` — pourcentage basé sur sous-étapes terminées
   - `persistProgress(auditId, progress)` — écriture Supabase

### Phase 2 — Refactoring du moteur d'audit pour émettre la progression

**Objectif :** modifier `engine.ts` pour mettre à jour `audit_progress` à chaque changement de sous-étape.

1. **Modifier `runFullAudit`** pour accepter un callback ou un `auditId` et écrire la progression :
   - Avant chaque appel API HubSpot d'un domaine : `updateDomainStep(progress, domain, "fetching")`
   - Après récupération des données : `updateDomainStep(progress, domain, "analyzing", itemCount)`
   - Après exécution des règles : `updateDomainStep(progress, domain, "scoring")`
   - Après calcul du score : `completeDomain(progress, domain)`
   - En cas d'erreur : `failDomain(progress, domain, error.message)`
   - Après tous les domaines, avant le LLM : `progress.llmSummary.status = "running"`
   - Après le LLM : `progress.llmSummary.status = "completed"`
2. **Chaque mise à jour de progression doit persister en base** via `persistProgress(auditId, progress)`
3. **Les domaines continuent de s'exécuter en parallèle** — la progression de chaque domaine est indépendante
4. **Important :** ne pas modifier la logique métier des règles d'audit. Seul l'enrobage de progression change.

### Phase 3 — Modification du endpoint de lancement

**Objectif :** le endpoint `/api/audit/run` doit retourner immédiatement avec l'ID de l'audit au lieu d'attendre la fin.

1. **Modifier `src/app/api/audit/run/route.ts`** :
   - Créer l'`audit_run` avec statut "running" + `audit_progress` initial (tout pending)
   - Lancer `runFullAudit` de manière asynchrone (fire-and-forget, sans await)
   - Retourner immédiatement `{ auditId, shareToken }` au frontend
   - L'audit continue en arrière-plan
2. **Gérer la finalisation** : à la fin de `runFullAudit`, mettre à jour `status = "completed"` ou `"failed"` dans `audit_runs`

### Phase 4 — Endpoint de polling du statut

**Objectif :** créer un endpoint léger pour que le frontend interroge la progression.

1. **Créer `src/app/api/audit/[auditId]/status/route.ts`** (GET) :
   - Lire `status` et `audit_progress` depuis `audit_runs`
   - Retourner le JSON de progression (voir format dans le PRD section 6.7)
   - Authentification : vérifier que l'audit appartient à l'utilisateur connecté
   - Réponse légère (pas de résultats d'audit, juste la progression)

### Phase 5 — Modification du frontend : navigation immédiate

**Objectif :** au clic "Lancer un audit", naviguer vers la page du rapport au lieu d'attendre.

1. **Modifier le dashboard** (`src/app/(dashboard)/dashboard/page.tsx`) :
   - Au clic "Lancer un audit" : POST `/api/audit/run` → récupérer `auditId` → `router.push(/audit/${auditId})`
   - Le bouton passe en loading pendant le POST (1-2s) puis la navigation se fait
   - Supprimer toute logique d'attente de résultats côté dashboard

### Phase 6 — Composant tracker de progression

**Objectif :** créer le composant qui affiche la progression domaine par domaine.

1. **Créer `src/components/audit/audit-progress-tracker.tsx`** :
   - Props : `auditId`, `portalName`
   - Hook de polling : `useEffect` avec `setInterval(3000)` qui GET `/api/audit/{auditId}/status`
   - Affichage conforme au wireframe du PRD (section 6.3) :
     - Card `gray-900`, bordure `gray-700`, `radius-lg`, max-width `640px`, centrée
     - Titre `h2` : "Audit en cours — {Portal Name}"
     - Liste des domaines avec icônes Lucide + sous-étapes indentées
     - Icônes de statut : ○ ◌ ✓ ✗ avec les couleurs du design system
     - Animation pulse sur l'état "en cours" (150ms, `brand-500`)
     - Comptage d'éléments affiché après récupération
   - Barre de progression sous le tracker (composant `ProgressBar` existant ou à créer, couleur `brand-500`, track `gray-800`, hauteur 6px)
   - Séparateur `1px solid gray-700` avant l'étape LLM
   - Pourcentage affiché à droite de la barre
   - **Quand `status === "completed"` :** toutes les étapes passent en ✓, barre à 100%, attente 1s, puis callback `onComplete`
   - **Quand `status === "failed"` :** afficher les erreurs + bouton "Réessayer"
   - Arrêt du polling quand status !== "running"

### Phase 7 — Intégration dans la page d'audit

**Objectif :** la page `/audit/{auditId}` affiche le tracker ou le rapport selon le statut.

1. **Modifier `src/app/(dashboard)/audit/[auditId]/page.tsx`** :
   - Charger le statut de l'audit au montage
   - Si `status === "running"` : afficher `<AuditProgressTracker>`
   - Si `status === "completed"` : afficher `<AuditResultsView>` (comportement actuel)
   - Si `status === "failed"` : afficher le tracker en état d'erreur
   - Transition tracker → rapport : fade-out du tracker (200ms, `ease-in`) → fade-in du rapport
   - Le breadcrumb affiche "Audit en cours…" pendant le running, puis le titre normal

### Phase 8 — Edge cases et polish

**Objectif :** gérer tous les cas limites.

1. **Audit qui termine très vite** (petit workspace) : le premier poll détecte "completed" → afficher directement le rapport sans tracker
2. **Perte de connexion** : le polling échoue silencieusement, pas de message d'erreur, reprend automatiquement
3. **Ouverture d'un audit déjà terminé** : pas de tracker, rapport affiché directement (comportement actuel préservé)
4. **Domaine 0 élément** : afficher ✓ "Aucun élément détecté — domaine exclu"
5. **Erreur partielle** (un domaine KO) : les autres continuent, rapport affiché avec avertissement
6. **Animations** : respecter `prefers-reduced-motion` (désactiver le pulse, garder les transitions à 0ms)
7. **Mobile** : le tracker card passe en full-width, même pattern de sous-étapes

## Règles à respecter pendant toute l'implémentation

- **Ne pas modifier la logique métier des règles d'audit** — seul l'enrobage de progression change dans `engine.ts`
- **Ne pas modifier `audit-results-view.tsx`** au-delà de l'intégration de la transition — le rapport reste identique
- **Utiliser les tokens du design system** — zéro couleur hex en dur, zéro spacing arbitraire
- **Icônes Lucide** exclusivement : `list-tree`, `users`, `building`, `workflow`, `sparkles`, `circle-check`, `circle-x`, `loader`
- **Non-destructif** — aucune écriture dans l'API HubSpot
- **Ne pas créer de fichiers dans `product/`**
- **Commiter à chaque phase** avec le format : `feat(EP-UX-02): phase N — [description]`
- **La progression ne doit jamais régresser** — garantir la monotonie côté backend
- **Le rapport ne doit jamais s'afficher avec des données partielles** — tout ou rien
