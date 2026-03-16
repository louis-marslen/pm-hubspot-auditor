# Prompt d'implémentation — EP-17 : Sélection des domaines d'audit

> Copier-coller ce prompt dans une session Claude en mode Dev.

---

## Contexte

Tu vas implémenter l'epic EP-17 qui ajoute une modale de sélection des domaines avant le lancement d'un audit. Actuellement, tous les domaines (Propriétés, Contacts, Companies, Workflows, Utilisateurs) sont audités systématiquement. Avec EP-17, l'utilisateur choisit les domaines à auditer via une modale, et tout le pipeline (moteur d'audit, progression, scoring, rapport) est filtré en conséquence.

**Prérequis :** EP-09 est livré. Le moteur d'audit gère 5 domaines en parallèle (Properties d'abord, puis Contacts, Companies, Workflows, Users via `Promise.all`). Le tracker de progression affiche tous les domaines. Le score global est une moyenne pondérée des domaines actifs.

**Spécificités de cet epic :**
- C'est un epic **transversal** — il touche le frontend (modale, tracker, résultats, rapport public, dashboard), le backend (API, moteur d'audit, scoring), et la base de données (nouvelle colonne)
- Aucune nouvelle règle d'audit — on modifie le flux existant
- Le domaine **Propriétés est obligatoire** (toujours exécuté, non décochable)
- **Rétrocompatibilité critique** : les audits existants (`audit_domains = null`) doivent continuer de fonctionner

## Documents de référence — à lire AVANT de coder

Lis ces documents intégralement avant de commencer :

1. **`product/prd/prd-17-selection-domaines-audit.md`** — le PRD complet : specs fonctionnelles (modale, API, moteur, scoring, rapport, persistance), critères d'acceptance
2. **`product/epics/ep17-selection-domaines-audit.md`** — l'epic : hypothèse, user stories Gherkin, edge cases
3. **`product/prd/design-system-guidelines.md`** — tokens et composants UI (notamment `Modal`)
4. **`product/prd/screens-and-flows.md`** — architecture de navigation

Consulte aussi `src/CLAUDE.md` pour les conventions et le skill `feature-implementation` dans `skills/tech/workflows/feature-implementation.md` pour le workflow à suivre.

**Fichiers à étudier impérativement avant de coder (tu vas modifier la plupart) :**
- `src/app/(dashboard)/dashboard/page.tsx` — le bouton "Lancer un audit" actuel
- `src/app/api/audit/run/route.ts` — endpoint POST qui lance l'audit
- `src/lib/audit/engine.ts` — orchestrateur principal (`runFullAudit`)
- `src/lib/audit/global-score.ts` — calcul du score global
- `src/lib/audit/progress.ts` — initialisation et mise à jour de la progression
- `src/components/audit/audit-progress-tracker.tsx` — composant de progression temps réel
- `src/components/audit/audit-results-view.tsx` — composant d'affichage des résultats
- `src/app/(public)/share/[shareToken]/page.tsx` — rapport public
- `src/lib/audit/llm-summary.ts` — prompt du résumé LLM

## Plan d'implémentation

Procéder dans cet ordre strict. Chaque phase doit être fonctionnelle avant de passer à la suivante.

### Phase 1 — Migration DB et types

**Objectif :** préparer la structure de données pour la sélection.

1. **Créer `src/supabase/migrations/008_audit_domains.sql`** :
   ```sql
   -- EP-17 : Sélection des domaines d'audit
   ALTER TABLE public.audit_runs
     ADD COLUMN audit_domains jsonb;
   ```

2. **Étendre les types dans `src/lib/audit/types.ts`** :
   - Ajouter un type `AuditDomainId = 'properties' | 'contacts' | 'companies' | 'workflows' | 'users' | 'deals'`
   - Ajouter une interface `AuditDomainSelection` :
     ```typescript
     interface AuditDomainSelection {
       selected: AuditDomainId[]
       available: AuditDomainId[]
       skipped_reasons?: Record<string, string>
     }
     ```
   - Ajouter une constante `AUDIT_DOMAINS` avec les métadonnées de chaque domaine (id, label, description, required, implementé)

### Phase 2 — Modale de sélection

**Objectif :** créer le composant modale et l'intégrer dans le dashboard.

1. **Créer `src/components/audit/audit-domain-selector.tsx`** :
   - Utiliser le composant `Modal` existant du design system
   - Props : `isOpen`, `onClose`, `onLaunch(selectedDomains: AuditDomainId[])`, `workspaceId`
   - Afficher la liste des domaines avec checkboxes, labels, descriptions
   - Propriétés : checkbox cochée + désactivée + badge "Obligatoire"
   - Domaines non implémentés (deals) : checkbox grisée + badge "Bientôt"
   - Domaines conditionnels non activables : checkbox grisée + tooltip explicatif
   - Lien "Tout sélectionner / Tout désélectionner" en haut
   - Bouton "Lancer l'audit (X domaines)" avec compteur dynamique
   - State local `useState<Set<AuditDomainId>>` initialisé avec tous les domaines disponibles
   - Accessibilité : focus trap, navigation clavier

2. **Modifier le dashboard** (`src/app/(dashboard)/dashboard/page.tsx`) :
   - Le bouton "Lancer un audit" ouvre la modale au lieu de déclencher directement l'API
   - Ajouter un état `showDomainSelector: boolean`
   - Le callback `onLaunch` de la modale appelle l'API avec `selectedDomains`

### Phase 3 — API et moteur d'audit

**Objectif :** faire passer la sélection des domaines du frontend au moteur d'audit.

1. **Modifier `POST /api/audit/run`** (`src/app/api/audit/run/route.ts`) :
   - Accepter `selectedDomains: string[]` dans le body
   - Validation : `selectedDomains` doit contenir `"properties"` ; IDs doivent être valides
   - Fallback : si absent/vide → tous les domaines
   - Passer `selectedDomains` à `runFullAudit`
   - Stocker la sélection dans `audit_domains` jsonb lors de l'insert en base

2. **Modifier `runFullAudit` dans `src/lib/audit/engine.ts`** :
   - Ajouter le paramètre `selectedDomains?: AuditDomainId[]`
   - Filtrer les domaines à exécuter :
     ```typescript
     const domainsToRun = selectedDomains
       ? ['contacts', 'companies', 'workflows', 'users'].filter(d => selectedDomains.includes(d))
       : ['contacts', 'companies', 'workflows', 'users']
     ```
   - Le `Promise.all` ne lance que les domaines sélectionnés
   - Properties reste toujours exécuté en premier (obligatoire)

3. **Modifier `src/lib/audit/progress.ts`** :
   - `initProgress` reçoit `selectedDomains` et n'initialise que les domaines sélectionnés
   - La progression globale est calculée sur le nombre de sous-étapes des domaines sélectionnés uniquement

### Phase 4 — Score global et résumé LLM

**Objectif :** adapter le scoring et le résumé au périmètre.

1. **`src/lib/audit/global-score.ts`** — normalement aucune modification nécessaire : la logique existante calcule déjà la moyenne des domaines actifs (ceux avec un score non null). Si un domaine n'est pas exécuté, son score est null → il est exclu automatiquement. Vérifier que c'est bien le cas.

2. **Modifier `src/lib/audit/llm-summary.ts`** :
   - Ajouter dans le prompt LLM le contexte de périmètre :
     ```
     Domaines audités : {liste des domaines audités} ({X}/{Y}).
     Domaines non inclus : {liste des domaines non audités}.
     Le score global est calculé sur les domaines audités uniquement.
     ```
   - Instruire le LLM de ne commenter que les domaines audités
   - Permettre une phrase suggérant d'auditer les domaines manquants

### Phase 5 — Tracker de progression

**Objectif :** filtrer le tracker pour n'afficher que les domaines sélectionnés.

1. **Modifier `src/components/audit/audit-progress-tracker.tsx`** :
   - Le tracker reçoit la liste des domaines sélectionnés (via les données de progression en base ou via la réponse de l'API status)
   - N'afficher que les domaines présents dans la sélection
   - La barre de progression globale est calculée sur les domaines affichés

2. **Modifier `GET /api/audit/{auditId}/status`** :
   - Inclure `audit_domains` dans la réponse pour que le tracker sache quels domaines afficher

### Phase 6 — Affichage des résultats

**Objectif :** adapter le rapport aux domaines audités.

1. **Modifier `src/components/audit/audit-results-view.tsx`** :
   - Filtrer les tabs/onglets : ne montrer que les domaines audités
   - Ajouter un **bandeau de périmètre** si l'audit est partiel :
     ```
     ℹ️ Cet audit couvre X domaines sur Y disponibles : [liste].
        Domaines non inclus : [liste].
     ```
   - Style du bandeau : fond `bg-gray-850`, bordure `border-gray-700`, icône ℹ️
   - Placement : sous le score global, avant les tabs

2. **Modifier le rapport public** (`src/app/(public)/share/[shareToken]/page.tsx`) :
   - Même logique : filtrer les sections, ajouter le bandeau de périmètre
   - Lire `audit_domains` depuis la base pour déterminer les domaines audités

3. **Modifier l'historique des audits** (dans le dashboard) :
   - Afficher "X/Y domaines" pour les audits partiels
   - Les audits anciens (`audit_domains = null`) : aucune mention (audit complet implicite)

### Phase 7 — Edge cases et rétrocompatibilité

**Objectif :** gérer tous les cas limites.

1. **Audits existants** (`audit_domains = null`) :
   - Le rapport s'affiche normalement (tous les domaines)
   - Pas de bandeau de périmètre
   - L'historique ne montre pas "X/Y domaines"

2. **Domaine sélectionné mais condition non remplie** (ex: users < 2) :
   - Le moteur d'audit gère déjà ce cas (le domaine retourne null si condition non remplie)
   - La progression le marque comme "skipped"
   - Le score global l'exclut
   - Ajouter la raison dans `audit_domains.skipped_reasons`

3. **Domaine sélectionné mais scope manquant** :
   - Le moteur d'audit gère déjà ce cas (erreur attrapée, domaine non scoré)
   - S'assurer que le rapport affiche l'alert d'erreur de scope

4. **API appelée sans `selectedDomains`** (rétrocompatibilité, appels directs) :
   - Fallback sur tous les domaines
   - `audit_domains = null` en base

5. **Modale sur mobile** :
   - S'assurer que la modale est scrollable si nécessaire (6+ domaines)
   - Tester la responsivité des checkboxes

## Règles à respecter pendant toute l'implémentation

- **Rétrocompatibilité absolue** — les audits existants ne doivent pas être impactés. `audit_domains = null` = tous les domaines
- **Le domaine Propriétés est TOUJOURS exécuté** — c'est le socle de l'audit, il n'est jamais optionnel
- **Réutiliser le composant Modal existant** du design system — ne pas créer une nouvelle modale from scratch
- **Zéro couleur hex en dur** — uniquement les classes Tailwind du design system
- **Validation côté serveur** — ne pas faire confiance au frontend pour la validation de `selectedDomains`
- **Score global : ne pas changer la formule** — la logique existante (moyenne des domaines actifs) gère déjà les domaines absents. Vérifier, ne pas réécrire
- **Ne pas modifier la logique interne des domaines d'audit** — seul le "filtre" en amont change
- **Ne pas créer de fichiers dans `product/`**
- **Commiter à chaque phase** avec le format : `feat(EP-17): phase N — [description]`
