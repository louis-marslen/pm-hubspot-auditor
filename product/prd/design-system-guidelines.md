# Design System Guidelines — HubSpot Auditor

**Epic associé :** EP-UX
**Dernière mise à jour :** 2026-03-14
**Auteur :** Product Design

Direction esthétique : **dark mode par défaut, moderne et épuré**. Références : Linear, Vercel, Raycast — interfaces denses mais lisibles, contrastes nets, pas de décoration superflue.

---

## 1. Fondations

### 1.1 — Couleurs

#### Palette neutre (base dark)

Le fond de l'app repose sur des nuances de **gray** très sombres. On utilise une échelle custom basée sur des gris légèrement bleutés (plus vivants que du gris pur).

| Token | Hex | Usage |
|---|---|---|
| `gray-950` | `#0a0a0f` | Fond principal de l'app (body) |
| `gray-900` | `#111118` | Fond des cards, sections, sidebar |
| `gray-850` | `#18181f` | Fond des cards élevées (hover, modale) |
| `gray-800` | `#222230` | Fond des inputs, zones interactives |
| `gray-700` | `#2e2e3a` | Bordures subtiles, séparateurs |
| `gray-600` | `#3f3f4d` | Bordures actives, focus ring secondaire |
| `gray-500` | `#63637a` | Texte désactivé, placeholders |
| `gray-400` | `#8b8ba3` | Texte secondaire (labels, métadonnées) |
| `gray-300` | `#acacc0` | Texte tertiaire |
| `gray-200` | `#d1d1e0` | Texte courant (body) |
| `gray-100` | `#ececf4` | Texte principal (titres, valeurs) |
| `gray-50` | `#f8f8fc` | Texte emphase maximale (scores, chiffres clés) |

#### Couleur brand

Orange maintenu comme couleur d'identité — vibrant et visible sur dark.

| Token | Hex | Usage |
|---|---|---|
| `brand-300` | `#fdba74` | Texte brand sur fond sombre |
| `brand-400` | `#fb923c` | Hover sur éléments brand |
| `brand-500` | `#f97316` | Couleur brand principale (CTA, liens actifs, accents) |
| `brand-600` | `#ea580c` | Active / pressed state |
| `brand-900` | `#431407` | Fond teinté brand (badges, subtle backgrounds) |
| `brand-950` | `#1c0a04` | Fond teinté brand ultra-subtil |

#### Couleurs sémantiques

| Rôle | Couleur | Token principal | Token fond | Token texte |
|---|---|---|---|---|
| Critique / Erreur | Rouge | `#ef4444` | `#1a0a0a` | `#fca5a5` |
| Avertissement | Ambre | `#f59e0b` | `#1a1408` | `#fcd34d` |
| Succès / OK | Vert | `#22c55e` | `#0a1a10` | `#86efac` |
| Info | Bleu | `#3b82f6` | `#0a0f1a` | `#93c5fd` |

> Les fonds sémantiques sont très désaturés pour rester subtils sur dark. Ils ne servent que pour les alerts et badges.

#### Couleurs de score

| Plage | Couleur principale | Fond subtil | Label |
|---|---|---|---|
| 0–49 | `#ef4444` (rouge) | `rgba(239,68,68,0.08)` | Critique |
| 50–69 | `#f59e0b` (ambre) | `rgba(245,158,11,0.08)` | À améliorer |
| 70–89 | `#22c55e` (vert) | `rgba(34,197,94,0.08)` | Bon |
| 90–100 | `#22c55e` (vert vif) | `rgba(34,197,94,0.12)` | Excellent |

### 1.2 — Typographie

**Font family :** `Geist Sans` (Vercel) — variable font, optimisée pour les interfaces. Fallback : `Inter`, `-apple-system`, `system-ui`, `sans-serif`.

> Geist est disponible via `@vercel/font` ou `next/font/google`. C'est la police de référence de l'écosystème Next.js.

#### Échelle typographique

| Token | Taille | Line height | Weight | Usage |
|---|---|---|---|---|
| `display` | 36px / 2.25rem | 1.1 | 700 | Score global (chiffre dans le cercle) |
| `h1` | 24px / 1.5rem | 1.2 | 600 | Titre de page |
| `h2` | 18px / 1.125rem | 1.3 | 600 | Titre de section |
| `h3` | 15px / 0.9375rem | 1.4 | 600 | Titre de card, titre de règle |
| `body` | 14px / 0.875rem | 1.5 | 400 | Texte courant |
| `body-medium` | 14px / 0.875rem | 1.5 | 500 | Labels, texte mis en avant |
| `small` | 12px / 0.75rem | 1.5 | 400 | Métadonnées, timestamps, badges |
| `caption` | 11px / 0.6875rem | 1.4 | 500 | Compteurs, annotations mineures |

#### Règles typographiques

- **Pas de texte en full caps** sauf les badges de sévérité (CRITIQUE, AVERT., INFO)
- **Pas de texte en italique** — on utilise la couleur ou le weight pour distinguer
- **Chiffres tabulaires** (`font-variant-numeric: tabular-nums`) sur les scores, pourcentages et tableaux pour l'alignement
- **Texte tronqué** avec `...` pour les noms de propriétés/workflows longs (tooltip au hover)
- **Couleur du texte par défaut** : `gray-200` pour le body, `gray-100` pour les titres, `gray-400` pour le secondaire

### 1.3 — Spacing

Échelle en **multiples de 4px**, avec des paliers nommés :

| Token | Valeur | Usage courant |
|---|---|---|
| `space-0.5` | 2px | Micro-espacement (entre badge et texte) |
| `space-1` | 4px | Gap minimal (entre icône et label inline) |
| `space-2` | 8px | Padding interne compact (badges, small chips) |
| `space-3` | 12px | Gap entre éléments d'un même groupe |
| `space-4` | 16px | Padding interne standard (cards, inputs) |
| `space-5` | 20px | Gap entre groupes d'éléments |
| `space-6` | 24px | Padding de section |
| `space-8` | 32px | Gap entre sections |
| `space-10` | 40px | Gap entre blocs majeurs |
| `space-12` | 48px | Padding de page, marge verticale entre zones |
| `space-16` | 64px | Espacement de zone principal |

**Principe : generous whitespace.** L'espace vide est un élément de design, pas un gaspillage. Toujours préférer trop d'espace à pas assez.

### 1.4 — Border radius

| Token | Valeur | Usage |
|---|---|---|
| `radius-sm` | 6px | Badges, chips, petits éléments |
| `radius-md` | 8px | Inputs, boutons |
| `radius-lg` | 12px | Cards, modales, sections |
| `radius-xl` | 16px | Cards de premier niveau, hero sections |
| `radius-full` | 9999px | Avatars, score circles, indicateurs de statut |

**Principe :** angles arrondis partout, mais pas excessifs. Pas de `rounded-full` sur les boutons (ça fait "playful", pas "pro").

### 1.5 — Ombres et élévation

En dark mode, les ombres classiques sont peu visibles. On utilise plutôt la **luminosité du fond** pour créer l'élévation.

| Niveau | Fond | Bordure | Usage |
|---|---|---|---|
| 0 — Base | `gray-950` | Aucune | Fond de page |
| 1 — Surface | `gray-900` | `1px solid gray-700` (optionnel) | Cards, sections |
| 2 — Élevé | `gray-850` | `1px solid gray-700` | Modales, dropdowns, popovers |
| 3 — Flottant | `gray-800` | `1px solid gray-600` + `shadow-lg` | Tooltips, toasts |

```css
/* L'unique shadow utilisée (pour les éléments flottants) */
--shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.5);
```

**Principe :** sur dark, l'élévation se fait par la lumière (fond plus clair = plus proche de l'utilisateur), pas par les ombres.

### 1.6 — Bordures

| Type | Style | Usage |
|---|---|---|
| Subtile | `1px solid gray-700` | Séparation de cards, sections |
| Active | `1px solid gray-600` | Input au focus, card hover |
| Brand | `1px solid brand-500` | Input focus primary, élément sélectionné |
| Sémantique | `1px solid {semantic-color}` avec opacité 30% | Alerts, badges de sévérité |
| Dashed | `1px dashed gray-600` | Empty states, zones d'ajout |

**Principe :** les bordures sont des **séparateurs**, pas des décorations. Les utiliser avec parcimonie — un changement de fond suffit souvent.

---

## 2. Composants

### 2.1 — Boutons

#### Variants

| Variant | Fond | Texte | Bordure | Usage |
|---|---|---|---|---|
| `primary` | `brand-500` | `white` | Aucune | Action principale de la page (1 seul par écran) |
| `secondary` | `gray-800` | `gray-100` | `1px solid gray-700` | Actions secondaires |
| `ghost` | Transparent | `gray-300` | Aucune | Actions tertiaires, navigation, liens-boutons |
| `danger` | Transparent | `#ef4444` | `1px solid rgba(239,68,68,0.3)` | Actions destructives. Fond `#ef4444` + texte `white` au hover |

#### Tailles

| Taille | Hauteur | Padding horizontal | Font | Radius |
|---|---|---|---|---|
| `sm` | 32px | 12px | `small` (12px) | `radius-md` |
| `md` | 36px | 16px | `body` (14px) | `radius-md` |
| `lg` | 40px | 20px | `body` (14px, weight 500) | `radius-md` |

#### États

| État | Modification |
|---|---|
| Default | Styles de base |
| Hover | Légère augmentation de luminosité du fond (+5-10%) |
| Active / Pressed | Fond légèrement plus sombre que default |
| Focus-visible | Ring `2px solid brand-500` avec `2px offset` |
| Disabled | `opacity: 0.4`, `cursor: not-allowed` |
| Loading | Spinner SVG 16px à la place du texte (ou à gauche), texte conservé mais grisé |

### 2.2 — Inputs

```
┌──────────────────────────────────────┐
│ Label                                │
│ ┌──────────────────────────────────┐ │
│ │ Placeholder text                 │ │
│ └──────────────────────────────────┘ │
│ Helper text ou message d'erreur      │
└──────────────────────────────────────┘
```

| Propriété | Valeur |
|---|---|
| Fond | `gray-800` |
| Bordure default | `1px solid gray-700` |
| Bordure focus | `1px solid brand-500` + ring `brand-500/20` |
| Bordure erreur | `1px solid #ef4444` + ring `#ef4444/20` |
| Texte input | `gray-100` |
| Placeholder | `gray-500` |
| Label | `gray-300`, `body-medium` |
| Helper text | `gray-400`, `small` |
| Error text | `#fca5a5`, `small` |
| Hauteur | 36px (md), 32px (sm) |
| Radius | `radius-md` |
| Padding | `12px` horizontal |

### 2.3 — Cards

Cards = conteneurs principaux de contenu.

| Propriété | Valeur |
|---|---|
| Fond | `gray-900` |
| Bordure | `1px solid gray-700` |
| Radius | `radius-lg` (12px) |
| Padding | `space-5` (20px) pour les cards compactes, `space-6` (24px) pour les cards standard |
| Hover (si cliquable) | Bordure `gray-600`, fond `gray-850` |

**Variantes :**

| Variante | Différence |
|---|---|
| Card standard | Fond `gray-900`, bordure `gray-700` |
| Card élevée | Fond `gray-850`, bordure `gray-600` — pour modales, dropdowns |
| Card colorée | Fond sémantique subtil (ex. `rgba(239,68,68,0.08)` pour critique) |
| Card dashed | Bordure `dashed gray-600`, fond transparent — pour les empty states / "ajouter" |

### 2.4 — Badges

Petits indicateurs textuels compacts.

| Variante | Fond | Texte | Bordure |
|---|---|---|---|
| Critique | `rgba(239,68,68,0.12)` | `#fca5a5` | `1px solid rgba(239,68,68,0.2)` |
| Avertissement | `rgba(245,158,11,0.12)` | `#fcd34d` | `1px solid rgba(245,158,11,0.2)` |
| Info | `rgba(59,130,246,0.12)` | `#93c5fd` | `1px solid rgba(59,130,246,0.2)` |
| Succès | `rgba(34,197,94,0.12)` | `#86efac` | `1px solid rgba(34,197,94,0.2)` |
| Neutre | `rgba(255,255,255,0.06)` | `gray-300` | `1px solid gray-700` |
| Brand | `rgba(249,115,22,0.12)` | `brand-300` | `1px solid rgba(249,115,22,0.2)` |

**Style :** `small` (12px), `font-weight: 500`, `radius-sm` (6px), padding `2px 8px`, inline.

### 2.5 — Alerts

Blocs de notification contextuels — plus larges que les badges.

| Type | Fond | Bordure gauche | Icône | Texte |
|---|---|---|---|---|
| Error | `rgba(239,68,68,0.08)` | `3px solid #ef4444` | ✕ cercle | `#fca5a5` |
| Warning | `rgba(245,158,11,0.08)` | `3px solid #f59e0b` | ⚠ triangle | `#fcd34d` |
| Success | `rgba(34,197,94,0.08)` | `3px solid #22c55e` | ✓ cercle | `#86efac` |
| Info | `rgba(59,130,246,0.08)` | `3px solid #3b82f6` | ℹ cercle | `#93c5fd` |

**Structure :** bordure gauche épaisse (accent bar), icône à gauche, texte à droite. Padding `space-4`. Radius `radius-md`.

### 2.6 — Tables

| Propriété | Valeur |
|---|---|
| Fond header | `gray-850` |
| Texte header | `gray-400`, `caption` (11px), `font-weight: 500`, uppercase, letter-spacing `0.05em` |
| Bordure séparateur | `1px solid gray-700` (entre les lignes) |
| Fond row | Transparent |
| Fond row hover | `gray-850` |
| Texte row | `gray-200`, `body` (14px) |
| Padding cellule | `space-3` (12px) vertical, `space-4` (16px) horizontal |

### 2.7 — Topbar

| Propriété | Valeur |
|---|---|
| Fond | `gray-900` |
| Bordure bottom | `1px solid gray-700` |
| Hauteur | 56px |
| Padding horizontal | `space-6` (24px) |
| Logo texte | `h3` (15px), `font-weight: 600`, `gray-50` |
| Nav links | `body` (14px), `gray-400` default, `gray-100` hover, `gray-50` + indicateur `brand-500` actif |
| Avatar | 28px, cercle, fond `brand-900`, texte `brand-300`, lettre initiale |

### 2.8 — Score Circle

Cercle SVG avec arc de progression.

| Propriété | Valeur |
|---|---|
| Taille `lg` | 120px (page résultats, hero) |
| Taille `md` | 48px (sous-scores, workspace cards) |
| Taille `sm` | 32px (dans les tableaux) |
| Ring track | `gray-700` (fond du cercle) |
| Ring progress | Couleur sémantique selon le score |
| Stroke width | 6px (lg), 4px (md), 3px (sm) |
| Chiffre centre | `display` (lg), `h3` (md), `small` bold (sm) |
| Couleur chiffre | `gray-50` |
| Fond intérieur | Transparent |

### 2.9 — Progress Bar (taux)

Pour les règles de type taux (P7-P14).

```
━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░  72%
```

| Propriété | Valeur |
|---|---|
| Track | `gray-800`, radius `radius-full`, hauteur 6px |
| Fill | Couleur sémantique selon position vs seuil |
| Fill > seuil | `#22c55e` (vert) |
| Fill < seuil | Couleur de sévérité de la règle |
| Seuil marker | Ligne verticale `gray-500` sur le track, positionnée au % du seuil |
| Radius | `radius-full` |

### 2.10 — Toast

Notification éphémère en bas à droite.

| Propriété | Valeur |
|---|---|
| Position | `fixed bottom-6 right-6` |
| Fond | `gray-850` |
| Bordure | `1px solid gray-600` |
| Shadow | `shadow-lg` |
| Radius | `radius-lg` |
| Padding | `space-3 space-4` |
| Texte | `body`, `gray-100` |
| Icône | À gauche, couleur sémantique |
| Auto-dismiss | 3 secondes, fondu sortant |
| Max-width | 360px |

### 2.11 — Modal

| Propriété | Valeur |
|---|---|
| Overlay | `rgba(0,0,0,0.6)` + `backdrop-filter: blur(4px)` |
| Fond | `gray-850` |
| Bordure | `1px solid gray-700` |
| Radius | `radius-xl` (16px) |
| Shadow | `shadow-lg` |
| Padding | `space-6` (24px) |
| Max-width | 480px |
| Titre | `h2`, `gray-50` |
| Actions | Alignées à droite, bouton primaire à droite, secondaire à gauche |
| Fermeture | Bouton `✕` ghost en haut à droite + clic overlay + touche Escape |

### 2.12 — Empty State

| Propriété | Valeur |
|---|---|
| Conteneur | Card dashed ou zone centrée |
| Icône | 48px, `gray-500`, style outline/stroke |
| Titre | `h3`, `gray-200` |
| Description | `body`, `gray-400`, max-width 360px, centré |
| CTA | Bouton `primary` ou `secondary` selon le contexte |
| Espacement | `space-4` entre chaque élément, centré verticalement |

### 2.13 — Skeleton (loading)

| Propriété | Valeur |
|---|---|
| Fond | `gray-800` |
| Animation | Pulse (`opacity: 0.5 → 1 → 0.5`, 1.5s, infinite) |
| Radius | Identique à l'élément remplacé |
| Taille | Identique à l'élément remplacé |

Reproduire la structure de la page (pas un spinner central). Cards, lignes de texte, badges — chaque élément a son skeleton.

---

## 3. Patterns d'interaction

### 3.1 — Transitions et animations

**Principe : subtil et fonctionnel.** Pas d'animation décorative. Chaque animation a un but (feedback, orientation, continuité).

| Contexte | Animation | Durée | Easing |
|---|---|---|---|
| Hover (boutons, links, cards) | Changement de couleur/fond | 150ms | `ease-out` |
| Focus ring | Apparition | 150ms | `ease-out` |
| Ouverture d'accordion | Height auto + fade | 200ms | `ease-in-out` |
| Ouverture de modal | Scale 0.95→1 + fade | 200ms | `ease-out` |
| Fermeture de modal | Fade out | 150ms | `ease-in` |
| Toast apparition | Slide up 8px + fade | 200ms | `ease-out` |
| Toast disparition | Fade out | 150ms | `ease-in` |
| Skeleton pulse | Opacity | 1500ms | `ease-in-out`, infinite |
| Score circle (page load) | Arc stroke-dashoffset | 800ms | `ease-out` |
| Tab indicator slide | Transform X | 200ms | `ease-in-out` |

**Pas d'animation sur :** le chargement initial de page, le scroll, la saisie de texte, les changements de données dans les tableaux.

### 3.2 — Feedback tactile

| Action | Feedback |
|---|---|
| Clic bouton | Fond active (plus sombre), 100ms |
| Clic lien | Couleur active (brand-600), 100ms |
| Copie de lien | Toast "Lien copié" + icône ✓ |
| Soumission formulaire | Bouton → état loading (spinner + disabled) |
| Action réussie | Alert success ou toast selon le contexte |
| Action échouée | Alert error inline (pas une modale) |
| Survol card cliquable | Bordure plus claire + fond plus clair |

### 3.3 — Responsive

| Breakpoint | Token | Comportement |
|---|---|---|
| Mobile | `< 640px` | Cards pleine largeur, topbar simplifiée (burger menu), table → cards empilées |
| Tablet | `640–1024px` | Grille 2 colonnes pour workspace cards, table complète |
| Desktop | `> 1024px` | Grille 3 colonnes, max-width `1120px` centré |

**Mobile-specific :**
- Topbar : logo + burger menu (dropdown avec nav + user)
- Workspace cards : stack vertical, pleine largeur
- Résultats d'audit : nav sticky tabs scrollable horizontalement
- Tables : chaque row devient une card empilée
- Modales : plein écran sur mobile

---

## 4. Iconographie

**Set d'icônes :** Lucide Icons — style outline/stroke, cohérent avec l'esthétique épurée.

| Contexte | Taille | Stroke width | Couleur |
|---|---|---|---|
| Inline (dans du texte, badges) | 14–16px | 1.5px | Hérite de la couleur du texte |
| UI (boutons, inputs, nav) | 18–20px | 1.5px | `gray-400` default, `gray-100` actif |
| Illustratif (empty states) | 40–48px | 1.5px | `gray-500` |

**Icônes sémantiques récurrentes :**

| Usage | Icône Lucide |
|---|---|
| Critique / erreur | `circle-x` |
| Avertissement | `triangle-alert` |
| Info | `info` |
| Succès / OK | `circle-check` |
| Workspace | `building-2` |
| Audit / analyse | `scan-search` |
| Propriétés | `list-tree` |
| Workflows | `workflow` |
| Contacts | `users` |
| Deals | `handshake` |
| Companies | `building` |
| Partager | `share-2` |
| Copier | `copy` |
| Lien externe | `external-link` |
| Paramètres | `settings` |
| Déconnexion | `log-out` |
| Supprimer | `trash-2` |
| Chevron (accordion) | `chevron-down` |
| Retour | `arrow-left` |
| IA / LLM | `sparkles` |

---

## 5. Mise en page

### 5.1 — Grille

| Propriété | Valeur |
|---|---|
| Max-width contenu | `1120px` |
| Centrage | `margin: 0 auto` |
| Padding horizontal page | `space-6` (24px) sur desktop, `space-4` (16px) sur mobile |
| Colonnes grille | CSS Grid ou Flexbox, 12 colonnes logiques |
| Gutter | `space-5` (20px) |

### 5.2 — Structure type d'une page

```
┌──────────────────────────────────────────────┐
│  Topbar (h: 56px)                    fixed   │
├──────────────────────────────────────────────┤
│  space-8 (32px)                              │
│  ┌────────────────────────────────────────┐  │
│  │  Page header                           │  │
│  │  Titre (h1) + description optionnelle  │  │
│  └────────────────────────────────────────┘  │
│  space-8 (32px)                              │
│  ┌────────────────────────────────────────┐  │
│  │  Section 1                             │  │
│  │  Heading (h2) + contenu               │  │
│  └────────────────────────────────────────┘  │
│  space-8 (32px)                              │
│  ┌────────────────────────────────────────┐  │
│  │  Section 2                             │  │
│  │  Heading (h2) + contenu               │  │
│  └────────────────────────────────────────┘  │
│  space-12 (48px)                             │
└──────────────────────────────────────────────┘
```

### 5.3 — Pages d'authentification (hors app shell)

Layout centré, pas de topbar complète :

```
┌──────────────────────────────────────────────┐
│  Topbar minimale                             │
├──────────────────────────────────────────────┤
│                                              │
│                                              │
│          ┌──────────────────┐                │
│          │  Card (400px)     │                │
│          │                  │                │
│          │  Titre           │                │
│          │  Sous-titre      │                │
│          │                  │                │
│          │  [Formulaire]    │                │
│          │                  │                │
│          │  Lien secondaire │                │
│          │                  │                │
│          └──────────────────┘                │
│                                              │
│                                              │
└──────────────────────────────────────────────┘
```

Card centrée verticalement et horizontalement. Max-width `400px`. Fond `gray-900`, bordure `gray-700`.

---

## 6. Règles de rédaction UI (microcopy)

| Principe | Exemple bon | Exemple mauvais |
|---|---|---|
| **Verbes d'action** sur les boutons | "Lancer l'audit" | "Audit" |
| **Résultat** plutôt que process | "Créer mon compte" | "S'inscrire" |
| **Pas de jargon technique** dans l'UI | "Vos automatisations" | "Vos workflows" — sauf dans les résultats d'audit où le terme HubSpot est attendu |
| **Phrases courtes** pour les descriptions | "Auditez votre workspace en quelques minutes." | "Notre outil vous permet de réaliser un audit complet de votre espace de travail HubSpot." |
| **Messages d'erreur actionnables** | "Email ou mot de passe incorrect. Réessayez ou réinitialisez votre mot de passe." | "Erreur d'authentification." |
| **Confirmation positive** | "Workspace connecté avec succès" | "Opération réussie" |
| **Ton** : professionnel, direct, jamais condescendant | "Aucun audit pour le moment." | "On dirait que vous n'avez pas encore lancé d'audit ! 🚀" |

---

## 7. Accessibilité (baseline)

Même sur un design dark mode moderne, les standards d'accessibilité s'appliquent :

| Règle | Spécification |
|---|---|
| Contraste texte | Ratio minimum 4.5:1 pour le body, 3:1 pour les grands textes (> 18px) |
| Contraste éléments UI | Ratio minimum 3:1 pour les bordures, icônes, éléments interactifs |
| Focus visible | Tous les éléments interactifs ont un état `:focus-visible` (ring `brand-500`) |
| Navigation clavier | Tab order logique, Enter/Space activent les boutons, Escape ferme modales/dropdowns |
| Attributs ARIA | `aria-label` sur les boutons icône-only, `role="alert"` sur les alerts, `aria-expanded` sur les accordéons |
| Motion | Respecter `prefers-reduced-motion` — désactiver les animations non essentielles |

---

## 8. Implémentation Tailwind

Configuration Tailwind recommandée pour mapper ces tokens :

```js
// tailwind.config.ts — extrait des extensions
{
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#0a0a0f',
          900: '#111118',
          850: '#18181f',
          800: '#222230',
          700: '#2e2e3a',
          600: '#3f3f4d',
          500: '#63637a',
          400: '#8b8ba3',
          300: '#acacc0',
          200: '#d1d1e0',
          100: '#ececf4',
          50:  '#f8f8fc',
        },
        brand: {
          950: '#1c0a04',
          900: '#431407',
          600: '#ea580c',
          500: '#f97316',
          400: '#fb923c',
          300: '#fdba74',
        },
      },
      fontFamily: {
        sans: ['Geist Sans', 'Inter', '-apple-system', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['2.25rem', { lineHeight: '1.1', fontWeight: '700' }],
        'caption': ['0.6875rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      maxWidth: {
        'content': '1120px',
        'form': '400px',
      },
      spacing: {
        '0.5': '2px',
        '4.5': '18px',
      },
    },
  },
}
```

> Ce n'est qu'un extrait indicatif. La configuration complète sera produite pendant l'implémentation de l'epic EP-UX.
