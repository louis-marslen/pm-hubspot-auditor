# Prompt d'implémentation — EP-UX : Design System & Rattrapage UI/UX

> Copier-coller ce prompt dans une session Claude en mode Dev.

---

## Contexte

Tu vas implémenter l'epic EP-UX qui transforme l'UI de l'app HubSpot Auditor. L'app est fonctionnelle (EP-00 à EP-04 livrés) mais a été développée en "function first" sans design system. L'objectif est de passer d'un prototype technique à un produit au rendu professionnel, dark mode, moderne et épuré.

## Documents de référence — à lire AVANT de coder

Lis ces 3 documents intégralement avant de commencer :

1. **`product/prd/prd-ux-design-system.md`** — le PRD de l'epic : problème, user stories, critères d'acceptance, scope
2. **`product/prd/design-system-guidelines.md`** — tous les tokens (couleurs, typo, spacing, radius, ombres), les 13 composants spécifiés, les patterns d'interaction, les animations, le responsive, l'accessibilité, et l'extrait de config Tailwind
3. **`product/prd/screens-and-flows.md`** — l'architecture d'information, la navigation globale (topbar), les 4 parcours utilisateurs, chaque écran détaillé (layout, zones, variantes d'état), le système d'états (empty, loading, error, success, in-progress)

Consulte aussi `src/CLAUDE.md` pour les conventions et le skill `feature-implementation` dans `skills/tech/workflows/feature-implementation.md` pour le workflow à suivre.

## Plan d'implémentation

Procéder dans cet ordre strict. Chaque phase doit être fonctionnelle avant de passer à la suivante.

### Phase 1 — Fondations design system

**Objectif :** poser les tokens et la config sans casser l'existant.

1. **Tailwind config** — étendre `tailwind.config.ts` avec les tokens du design system :
   - Palette `gray` custom (13 niveaux, gris bleutés — cf. section 1.1 des guidelines)
   - Palette `brand` (orange, 6 niveaux)
   - Font family Geist Sans (installer via `next/font/local` ou `@vercel/font`)
   - Font sizes custom (`display`, `caption`)
   - Border radius (`sm` 6px, `md` 8px, `lg` 12px, `xl` 16px)
   - Max-width custom (`content` 1120px, `form` 400px)
   - Installer `lucide-react` pour les icônes

2. **Layout global** (`app/layout.tsx`) — passer le body en dark mode :
   - Fond `gray-950`, texte `gray-200`
   - Appliquer la font Geist Sans
   - `font-variant-numeric: tabular-nums` sur les éléments numériques

3. **Vérifier** que l'app se lance sans erreur. L'UI sera "cassée" visuellement à ce stade (fond sombre, anciens composants light) — c'est normal, la phase 2 corrige ça.

### Phase 2 — Composants UI de base

**Objectif :** refactoriser les 3 composants existants et créer les composants manquants.

Suivre les specs exactes de `design-system-guidelines.md` section 2 pour chaque composant.

**Refactoriser :**
- `components/ui/button.tsx` — ajouter variant `ghost`, états hover/active/focus-visible/loading selon la spec, tailles `sm/md/lg`
- `components/ui/input.tsx` — fond `gray-800`, bordures, focus ring `brand-500`, tailles, états erreur
- `components/ui/alert.tsx` — bordure gauche épaisse (accent bar), icône à gauche, fonds sémantiques dark

**Créer :**
- `components/ui/badge.tsx` — 6 variantes (critique, avertissement, info, succès, neutre, brand)
- `components/ui/card.tsx` — 4 variantes (standard, élevée, colorée, dashed)
- `components/ui/modal.tsx` — overlay blur, fond `gray-850`, fermeture Escape + clic overlay
- `components/ui/toast.tsx` — position fixed bottom-right, auto-dismiss 3s, animation slide-up
- `components/ui/topbar.tsx` — logo, nav links avec indicateur actif, menu utilisateur dropdown
- `components/ui/skeleton.tsx` — rectangles animés pulse, tailles paramétrables
- `components/ui/progress-bar.tsx` — track `gray-800`, fill coloré, marqueur de seuil optionnel
- `components/ui/empty-state.tsx` — icône + titre + description + CTA, centré
- `components/ui/breadcrumb.tsx` — séparateurs chevron, dernier item non cliquable
- `components/ui/tabs.tsx` — navigation sticky, scroll-to-anchor, badge de compteur par onglet
- `components/ui/dropdown.tsx` — pour le menu utilisateur dans la topbar

**Extraire des composants inline existants :**
- `components/ui/score-circle.tsx` — extraire du `audit-results-view.tsx`, 3 tailles (lg/md/sm), arc SVG animé
- `components/ui/severity-badge.tsx` — extraire du `audit-results-view.tsx`, réutiliser le `badge.tsx`
- `components/ui/workspace-card.tsx` — extraire du dashboard, 4 variantes d'état (cf. screens-and-flows)
- `components/ui/rule-card.tsx` — extraire le `RuleSection` d'`audit-results-view.tsx`, refactoriser avec les nouvelles specs (sévérité + code + titre + compteur + impact + accordion)

### Phase 3 — Layout global et navigation

**Objectif :** mettre en place l'app shell (topbar) et la structure de navigation décrite dans `screens-and-flows.md` section 2.

1. **Topbar connectée** — logo "HubSpot Auditor" (lien `/dashboard`), nav (Dashboard, Paramètres), menu utilisateur (avatar initiale, dropdown avec email + Paramètres + Déconnexion)
2. **Topbar non-auth** — logo, lien contextuel à droite ("Se connecter" ou "Créer un compte")
3. **Topbar publique** — logo, CTA "Auditer mon workspace →"
4. **Layout groups** — configurer les layout routes Next.js :
   - `(auth)/layout.tsx` → topbar minimale + card centrée (max-width `form`)
   - `(dashboard)/layout.tsx` → topbar connectée + conteneur max-width `content`
   - `(public)/layout.tsx` → topbar publique + conteneur max-width `content`

### Phase 4 — Retrofit des pages d'authentification

**Objectif :** appliquer le design system aux pages auth existantes. Suivre les specs de `screens-and-flows.md` section 4.1.

- `/login` — refactoriser `login-form.tsx` avec les nouveaux composants (Input, Button, Alert dark)
- `/register` — refactoriser `register-form.tsx`, checklist password avec icônes ✓/✗ colorées
- `/forgot-password` — refactoriser avec état succès (remplacement du formulaire)
- `/reset-password` — aligner sur le même pattern que register
- `/confirm` — icône enveloppe sur fond dark, ajouter bouton "Renvoyer l'email" avec cooldown

Toutes les pages doivent utiliser le layout auth (topbar minimale + card centrée sur fond `gray-950`).

### Phase 5 — Retrofit du dashboard

**Objectif :** refondre la page dashboard selon `screens-and-flows.md` section 4.2.

1. **Supprimer la page `/workspaces`** — son contenu migre dans le dashboard (section workspaces) et dans la future page settings
2. **Section workspaces** — grille de `workspace-card` (avec dernier score, date, CTA contextuel) + card d'ajout en dashed
3. **Section historique** — table avec composant `Table`, colonnes (workspace, date relative, score badge, problèmes, action)
4. **Empty state** — quand 0 workspace : illustration + 3 étapes visuelles + CTA unique "Connecter mon workspace HubSpot"
5. **Callback OAuth** — gérer les query params `?connected=true` et `?error=*` avec des toasts ou alerts
6. **État audit en cours** — remplacer le spinner par l'écran de progression étape par étape (cf. screens-and-flows section 5.5). Si la complexité SSE/polling est trop élevée, fallback acceptable : textes qui changent toutes les 10s

### Phase 6 — Retrofit des résultats d'audit

**Objectif :** transformer la page de résultats selon `screens-and-flows.md` section 4.3. C'est la page la plus complexe.

1. **Breadcrumb** en haut (Dashboard > Portal Name > Audit du {date})
2. **Hero score** — card pleine largeur, fond teinté selon score, grand score circle, sous-scores, métadonnées, boutons Partager + Retour
3. **Navigation intra-page sticky** — composant `Tabs` sous la topbar, onglets (Résumé, Propriétés, Contacts, Deals, Companies, Workflows) avec badges de compteur, scroll-to-anchor + intersection observer pour suivre le scroll
4. **Résumé exécutif** — card avec icône ✨ (sparkles), masquer la section si pas de résumé LLM
5. **Sections de règles** — refactoriser `audit-results-view.tsx` pour utiliser les `rule-card` :
   - Header de section avec score du domaine
   - Rule cards avec sévérité + code + titre + compteur + chevron
   - Barres de progression pour les règles de taux (P7-P14) avec seuil marker
   - Impact business dans la zone dépliée
   - Logique d'ouverture : critiques ouvertes par défaut, reste replié
   - Règles OK : non cliquables, badge ✅
6. **Footer** — "Généré par HubSpot Auditor" + bouton "Relancer un audit"

### Phase 7 — Page paramètres (nouveau)

**Objectif :** créer la page `/settings` selon `screens-and-flows.md` section 4.4.

1. **Section "Mon profil"** — email en lecture seule, bouton "Modifier le mot de passe"
2. **Section "Workspaces HubSpot"** — liste des workspaces avec déconnexion + bouton ajouter (reprendre la logique de l'ancien `/workspaces`)
3. **Section "Danger zone"** — bordure rouge, bouton "Supprimer mon compte" → ouvre modale (reprendre la logique de l'ancien `/account/delete` mais en modale au lieu d'une page)
4. **Supprimer** `/account/delete/page.tsx` et `delete-account-form.tsx` (migrés dans la modale)

### Phase 8 — Rapport public

**Objectif :** professionnaliser la page publique selon `screens-and-flows.md` section 4.5.

1. **Topbar publique** — logo + CTA "Auditer mon workspace →" (lien vers `/register`)
2. **Bandeau en-tête** — "Rapport d'audit HubSpot" + nom du portail + date
3. **Contenu** — même composant de résultats que la page privée, avec `isPublic=true` (pas de bouton Partager, pas de Relancer)
4. **Footer public** — "Généré par HubSpot Auditor" + CTA "Créer mon compte gratuitement" (lien vers `/register`)
5. **Retirer** l'alert bleue brute actuelle, remplacer par une mention discrète inline "Rapport en lecture seule"

## Règles à respecter pendant toute l'implémentation

- **Zéro couleur hex en dur** dans les composants — uniquement les classes Tailwind qui mappent les tokens
- **Zéro `bg-white`, `bg-gray-50`, `text-black`** — c'est l'ancien light mode, on est en dark
- **Tester chaque phase** avant de passer à la suivante — l'app doit rester fonctionnelle
- **Ne pas modifier la logique métier** — cet epic ne touche que l'UI. Les appels API, la logique d'audit, le scoring, le LLM, l'OAuth restent identiques
- **Conserver tous les comportements fonctionnels existants** — vérifier manuellement les flux auth, OAuth, audit, partage après chaque phase
- **Ne pas créer de fichiers dans `product/`**
- **Commiter à chaque phase** avec le format : `feat(EP-UX): phase X — [description]`
