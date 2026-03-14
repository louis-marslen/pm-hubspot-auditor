---
name: ui-component-spec
description: Spécifier un composant UI réutilisable — variants, props, états, tokens de design. À utiliser pour documenter un composant du design system avant ou pendant son implémentation.
type: component
---

## Objectif

Documenter la spécification d'un composant UI avant ou pendant son implémentation. Garantit que chaque composant du design system est pensé avec ses variants, ses états et ses tokens avant d'être codé.

Ce n'est pas un mockup — c'est une spec fonctionnelle et visuelle qui sert de contrat entre le design et le code.

---

## Quand utiliser

- En créant un nouveau composant pour le design system
- En refactorisant un composant existant pour le rendre réutilisable
- Quand plusieurs écrans ont besoin du même pattern UI (button, card, badge, etc.)

---

## Structure de la spec

### 1. Identité du composant

```markdown
## [NomDuComposant]

**Description :** [Ce que fait le composant en une phrase]
**Catégorie :** Primitif | Composé | Layout | Pattern
**Fichier :** `src/components/ui/[nom].tsx`
```

**Catégories :**
- **Primitif** : élément de base (Button, Input, Badge)
- **Composé** : combine plusieurs primitifs (FormField = Label + Input + ErrorMessage)
- **Layout** : structure de page (PageContainer, Sidebar, Grid)
- **Pattern** : pattern d'interaction réutilisable (EmptyState, LoadingOverlay, ConfirmDialog)

### 2. Props (API du composant)

```markdown
### Props

| Prop | Type | Défaut | Requis | Description |
|---|---|---|---|---|
| variant | 'primary' \| 'secondary' \| 'ghost' \| 'danger' | 'primary' | Non | Style visuel |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Non | Taille |
| disabled | boolean | false | Non | Désactive le composant |
| children | ReactNode | — | Oui | Contenu |
```

### 3. Variants visuelles

Lister chaque variant avec :
- **Quand l'utiliser** (cas d'usage)
- **Tokens appliqués** (couleur fond, texte, bordure)

```markdown
### Variants

| Variant | Cas d'usage | Fond | Texte | Bordure |
|---|---|---|---|---|
| primary | Action principale de la page | brand-600 | white | — |
| secondary | Action secondaire | transparent | brand-600 | brand-600 |
| ghost | Action tertiaire / navigation | transparent | gray-600 | — |
| danger | Action destructive | red-600 | white | — |
```

### 4. États

Documenter tous les états visuels :

```markdown
### États

| État | Déclencheur | Changement visuel |
|---|---|---|
| Default | — | Style de base |
| Hover | Survol souris | Fond légèrement assombri |
| Focus | Navigation clavier | Ring outline (focus-visible) |
| Active | Clic en cours | Fond plus sombre |
| Disabled | prop disabled=true | Opacité réduite, curseur not-allowed |
| Loading | prop loading=true | Spinner inline, texte masqué |
```

### 5. Tailles

```markdown
### Tailles

| Taille | Hauteur | Padding | Font size | Icône |
|---|---|---|---|---|
| sm | 32px | px-3 | text-sm | 16px |
| md | 40px | px-4 | text-base | 20px |
| lg | 48px | px-6 | text-lg | 24px |
```

### 6. Accessibilité

```markdown
### Accessibilité

- [ ] Rôle ARIA : [role si nécessaire]
- [ ] Focus visible : outline conforme
- [ ] Contraste : ratio minimum 4.5:1 (texte), 3:1 (éléments graphiques)
- [ ] Clavier : [touches supportées]
- [ ] Label : [comment le composant est labellisé pour les lecteurs d'écran]
```

### 7. Exemples d'utilisation

```markdown
### Exemples

**Action principale :**
\`\`\`tsx
<Button variant="primary" size="md">Lancer l'audit</Button>
\`\`\`

**Action destructive avec confirmation :**
\`\`\`tsx
<Button variant="danger" size="sm" onClick={handleDelete}>
  Supprimer le compte
</Button>
\`\`\`

**État de chargement :**
\`\`\`tsx
<Button variant="primary" loading>Audit en cours…</Button>
\`\`\`
```

---

## Template complet

```markdown
# [NomDuComposant]

**Description :** [phrase]
**Catégorie :** [Primitif | Composé | Layout | Pattern]
**Fichier :** `src/components/ui/[nom].tsx`

## Props
[tableau]

## Variants
[tableau avec tokens]

## États
[tableau]

## Tailles
[tableau, si applicable]

## Accessibilité
[checklist]

## Exemples d'utilisation
[code snippets]

## Notes d'implémentation
[détails techniques : composition, forwarded refs, polymorphisme, etc.]
```

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Trop de variants | 8 variants de bouton dont 5 jamais utilisés | Commencer avec 2-3 variants, ajouter au besoin |
| Props API trop large | 15 props configurables | Garder l'API minimale, ajouter quand un vrai besoin émerge |
| Spécifier sans implémenter | Spec détaillée mais code jamais aligné | Spec et code évoluent ensemble — la spec n'est pas un contrat figé |
| Ignorer les états | Composant designé en état "default" uniquement | Toujours spécifier hover, focus, disabled, loading, error |
| Oublier l'accessibilité | Composant joli mais inutilisable au clavier | Intégrer a11y dès la spec, pas en rattrapage |

---

## Skills liés

- `audit-ux` (PM) — peut révéler des composants à créer ou refactoriser
- `technical-design-doc` — la spec UI complète la spec technique
- `feature-implementation` — les composants sont créés à l'étape 5 (frontend)
