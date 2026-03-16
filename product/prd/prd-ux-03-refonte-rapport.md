# PRD — EP-UX-03 : Refonte de la page rapport d'audit

**Auteur :** Louis
**Date :** 2026-03-16
**Statut :** Spécifié
**Epic :** [ep-ux-03-refonte-rapport.md](../epics/ep-ux-03-refonte-rapport.md)

---

## 1. Résumé exécutif

La page de rapport d'audit est l'écran le plus important du produit — c'est là que l'utilisateur (et ses stakeholders via le lien public) perçoit la valeur. L'implémentation actuelle organise les résultats **par domaine** (onglets horizontaux), ce qui force l'utilisateur à naviguer domaine par domaine pour trouver ses problèmes les plus critiques. La refonte réorganise les résultats **par sévérité** (critiques → avertissements → infos → conformes) dans une vue cross-domaine, avec une sidebar de navigation latérale pour accéder rapidement à un domaine spécifique.

**Changements clés :**
- Layout : tabs horizontaux → sidebar fixe + contenu scrollable
- Architecture d'information : domaine-first → sévérité-first (cross-domaine)
- Hero : simplifié avec résumé texte et métadonnées contextuelles
- Nouveau composant "Quick wins" : actions rapides recommandées
- Règles conformes visibles dans une section dédiée
- Grille de scores par domaine séparée du hero

---

## 2. Narration du problème (Problem Narrative)

### Situation actuelle

Sophie, RevOps Manager, partage le lien public de son audit à son directeur commercial. Celui-ci ouvre le rapport et voit des onglets : Propriétés, Contacts, Companies, Deals, Workflows, Utilisateurs. Il ne sait pas par où commencer. Il clique sur "Propriétés", voit 6 règles dont 2 critiques. Il doit ensuite cliquer sur "Deals", puis "Utilisateurs", etc. pour reconstituer mentalement la liste des problèmes les plus urgents.

### Situation cible

Le directeur commercial ouvre le rapport. Immédiatement, il voit : "4 règles critiques nécessitent une action immédiate". En dessous, les 4 actions critiques sont listées avec leur domaine d'origine. Plus bas, les avertissements. Et tout en bas, les 7 règles conformes — preuve que des choses fonctionnent bien. La sidebar lui permet de plonger dans un domaine spécifique s'il le souhaite.

### Insight fondamental

Les stakeholders non-techniques ne pensent pas en "domaines HubSpot" — ils pensent en **priorité d'action**. L'audit doit répondre à "que dois-je corriger en premier ?" avant "quel domaine pose problème ?".

---

## 3. Personas & Jobs-To-Be-Done

### Persona primaire : le destinataire du rapport

Le directeur, VP Sales, CMO — celui qui reçoit le lien public. Il dispose de 2 minutes pour comprendre l'état de son CRM.

**JTBD :** Quand je reçois un rapport d'audit, je veux voir immédiatement les problèmes les plus graves et les actions recommandées, afin de décider rapidement où investir du temps.

### Persona secondaire : l'opérateur (RevOps, consultant)

Sophie ou Louis — celui qui lance l'audit et l'utilise au quotidien.

**JTBD :** Quand je consulte mon rapport d'audit, je veux pouvoir naviguer rapidement entre la vue d'ensemble (par sévérité) et le détail d'un domaine, afin de construire un plan d'action structuré.

---

## 4. Contexte stratégique

- Le rapport est le **livrable principal** du produit — c'est ce qui est partagé, exporté, montré en réunion
- La vue par sévérité est le standard des outils d'audit (SonarQube, Lighthouse, ESLint) — pattern familier
- La sidebar est le pattern de navigation des outils pro (Linear, Notion, Figma) — plus scalable que des tabs pour 7+ domaines
- Cette refonte prépare l'ajout futur de nouveaux domaines (tickets, listes, formulaires) sans saturer la navigation

---

## 5. Vue d'ensemble de la solution

### Layout

```
┌──────────────────────────────────────────────────────┐
│ Topbar (inchangée)                                   │
├────────────┬─────────────────────────────────────────┤
│            │ Breadcrumb                              │
│  Sidebar   │ Hero (score + résumé + métadonnées)     │
│  (200px)   │ Grille scores domaines (5 cols)         │
│  fixe      │ Quick wins (callout bleu)               │
│            │ Actions critiques (X règles)             │
│            │ Avertissements (Y règles)                │
│            │ Informations (Z règles)                  │
│            │ Conformes (N règles)                     │
├────────────┴─────────────────────────────────────────┤
```

### Sidebar

```
VUE D'ENSEMBLE
  ● Tableau de bord          ← Vue par sévérité (défaut)

DOMAINES
  ● Propriétés custom    ●50
  ● Deals & Pipelines    ●80
  ● Leads & Prospection   —
  ● Contacts              ●72
  ● Companies             ●65
  ● Workflows             ●50
  ● Utilisateurs          ●54

RAPPORT
  ↗ Partager
```

- Position fixe, scroll indépendant
- Le domaine actif a un indicateur visuel (barre latérale gauche, fond surélevé)
- Le dot coloré reprend la couleur du score (rouge/orange/vert)
- Le score numérique est affiché à droite
- Domaines non exécutés : tiret grisé ("—")

### Vue "Tableau de bord" (défaut)

L'entrée par défaut. Affiche toutes les règles de tous les domaines, **groupées par sévérité** :

1. **Actions critiques** — Toutes les règles critique 🔴 de tous les domaines
2. **Avertissements** — Toutes les règles avertissement 🟡 de tous les domaines
3. **Informations** — Toutes les règles info 🔵 de tous les domaines
4. **Conformes** — Toutes les règles sans problème détecté (OK ✅)

Chaque règle affiche un tag avec son domaine d'origine.

### Vue domaine (clic sidebar)

Clic sur un domaine dans la sidebar → filtre le contenu pour n'afficher que les règles de ce domaine, toujours groupées par sévérité. **Le hero bascule en mode domaine** : ScoreCircle avec le score du domaine (pas le score global), label du domaine en H1, résumé contextuel du domaine, métadonnées spécifiques (ex: "387 deals · 2 pipelines" pour Deals). La grille des scores domaines met en surbrillance le domaine sélectionné. Le bloc Quick Wins est masqué.

---

## 6. Objectifs & métriques de succès

### Objectifs

| Objectif | Métrique | Cible |
|---|---|---|
| Compréhension immédiate | Temps avant première action identifiée | < 10 secondes |
| Navigation fluide | Clics pour voir tous les problèmes critiques | 0 (visible sans clic) |
| Adoption du lien public | Taux de scroll > 50% de la page (via analytics futur) | > 60% |

### Guardrails

- Pas de régression sur le temps de chargement du rapport
- Pas de perte d'information par rapport à la vue actuelle
- Le rapport public doit rester lisible sans authentification

---

## 7. User stories

### UX-03-S1 — Vue d'ensemble par sévérité

**En tant que** destinataire du rapport, **je veux** voir tous les problèmes critiques en premier, indépendamment du domaine, **afin de** comprendre immédiatement les priorités.

**Critères d'acceptance :**
- [ ] Étant donné un rapport avec des règles déclenchées dans plusieurs domaines, quand j'ouvre la page rapport, alors les règles sont groupées par sévérité : critiques → avertissements → informations → conformes
- [ ] Étant donné une règle critique dans le domaine "Deals", quand je vois la section "Actions critiques", alors la règle affiche un tag "Deals & Pipelines" pour identifier son domaine d'origine
- [ ] Étant donné une section de sévérité vide (ex: 0 critiques), quand j'ouvre le rapport, alors cette section n'apparaît pas
- [ ] Étant donné des règles sans problème détecté (count = 0), quand j'ouvre le rapport, alors elles apparaissent dans la section "Conformes" avec un indicateur vert

### UX-03-S2 — Sidebar de navigation

**En tant que** opérateur RevOps, **je veux** naviguer rapidement entre la vue d'ensemble et un domaine spécifique via une sidebar, **afin de** approfondir un domaine sans perdre le contexte global.

**Critères d'acceptance :**
- [ ] Étant donné la page rapport, quand elle se charge, alors une sidebar fixe de 200px est visible à gauche avec la liste des domaines exécutés
- [ ] Étant donné un domaine avec un score, quand je regarde la sidebar, alors un dot coloré (rouge/orange/vert) et le score numérique sont affichés à droite du nom
- [ ] Étant donné un domaine non exécuté (skipped ou non sélectionné), quand je regarde la sidebar, alors un tiret grisé remplace le score
- [ ] Étant donné que je clique sur un domaine dans la sidebar, quand la vue se met à jour, alors seules les règles de ce domaine sont affichées (toujours groupées par sévérité)
- [ ] Étant donné que je clique sur "Tableau de bord" dans la sidebar, quand la vue se met à jour, alors toutes les règles de tous les domaines sont affichées (vue par sévérité cross-domaine)
- [ ] Étant donné un écran < 768px de large, quand je consulte le rapport, alors la sidebar est masquée et remplacée par un menu hamburger ou un autre pattern mobile

### UX-03-S3 — Hero simplifié

**En tant que** destinataire du rapport, **je veux** voir un résumé textuel de l'état de mon CRM dès le haut de page, **afin de** comprendre la situation sans analyser des graphiques.

**Critères d'acceptance :**
- [ ] Étant donné un rapport avec un score global, quand j'ouvre la page, alors le hero affiche un ScoreCircle (80px), le label textuel (Excellent/Bon/À améliorer/Critique), un résumé de 1-2 phrases, et les métadonnées (nombre de contacts/companies/deals, date)
- [ ] Étant donné un score qui a changé par rapport au dernier audit du même workspace, quand j'ouvre le rapport, alors une mention "+X pts" ou "-X pts vs dernier audit" est affichée (colorée en vert si positif, rouge si négatif)
- [ ] Étant donné que le résumé LLM existe, quand j'ouvre la page, alors il est utilisé comme texte du hero (au lieu d'un texte générique)

### UX-03-S4 — Grille de scores par domaine

**En tant que** opérateur RevOps, **je veux** voir les scores de chaque domaine dans une grille compacte sous le hero, **afin de** identifier visuellement les domaines les plus faibles.

**Critères d'acceptance :**
- [ ] Étant donné un rapport avec N domaines exécutés, quand j'ouvre la page, alors une grille de N cards affiche pour chaque domaine : nom, score, barre de progression colorée
- [ ] Étant donné un domaine non exécuté, quand j'ouvre la page, alors sa card affiche un tiret grisé et une barre vide
- [ ] Étant donné un clic sur une card domaine, quand la vue se met à jour, alors le comportement est identique à un clic sur le domaine dans la sidebar (filtre les règles)
- [ ] Étant donné un score, quand la barre de progression s'affiche, alors la couleur suit le barème existant : rouge (0-49), orange (50-69), vert (70-100)

### UX-03-S5 — Bloc "Quick wins"

**En tant que** destinataire du rapport, **je veux** voir 2-3 actions rapides recommandées mises en évidence, **afin de** savoir par où commencer concrètement.

**Critères d'acceptance :**
- [ ] Étant donné un rapport avec des règles déclenchées, quand j'ouvre la page en vue "Tableau de bord", alors un bloc bleu "Corrections rapides recommandées" s'affiche entre la grille de scores et les sections de sévérité
- [ ] Étant donné les règles déclenchées, quand le bloc s'affiche, alors il contient 2 à 4 recommandations concrètes et actionnables, extraites des règles les plus impactantes
- [ ] Étant donné 0 règle déclenchée (score 100 partout), quand j'ouvre le rapport, alors le bloc quick wins n'apparaît pas
- [ ] Étant donné une vue filtrée par domaine (clic sidebar), quand la vue se met à jour, alors le bloc quick wins est masqué (il n'apparaît qu'en vue "Tableau de bord")

### UX-03-S6 — Cartes de règles redesignées

**En tant que** destinataire du rapport, **je veux** voir chaque règle sous forme de carte lisible avec titre, description, domaine et count, **afin de** scanner rapidement la liste sans avoir à déplier des accordéons.

**Critères d'acceptance :**
- [ ] Étant donné une règle déclenchée, quand je la vois dans la liste, alors elle affiche : dot coloré (sévérité), titre, description courte (1 ligne), badge de sévérité, tag domaine, et count (nombre d'occurrences) à droite
- [ ] Étant donné une règle avec un impact business défini, quand je la vois, alors un indicateur "Impact business" est affiché dans les métadonnées
- [ ] Étant donné un clic sur une carte de règle, quand elle s'ouvre, alors le détail s'affiche (liste des items, impact business complet, recommandation) — comportement d'expansion similaire à l'actuel
- [ ] Étant donné une règle conforme (0 occurrence), quand je la vois dans la section "Conformes", alors elle est affichée en opacité réduite avec un badge "OK" vert, sans description ni count

### UX-03-S7 — Rapport public

**En tant que** destinataire externe, **je veux** voir le même rapport redesigné via le lien public, **afin de** bénéficier de la même expérience de lecture.

**Critères d'acceptance :**
- [ ] Étant donné un lien public (`/share/[token]`), quand j'ouvre la page, alors le layout sidebar + contenu est identique à la vue authentifiée
- [ ] Étant donné le rapport public, quand je regarde la sidebar, alors les items "Exporter PDF" et "Partager" sont masqués (remplacés par un CTA "Lancer votre audit")
- [ ] Étant donné le rapport public, quand je regarde la topbar, alors elle affiche la variante publique existante (logo + CTA)

---

## 8. Spécifications fonctionnelles

### 8.1 Composant Sidebar (`ReportSidebar`)

```
Props :
  - domains: Array<{ id, label, score?, skipped? }>
  - activeDomain: string | null   // null = vue d'ensemble
  - onDomainSelect: (id: string | null) => void
  - isPublic?: boolean

Structure :
  <nav> fixe, 200px, bg-gray-900, border-right gray-700
    Section "Vue d'ensemble"
      Item "Tableau de bord" (actif par défaut)
    Section "Domaines"
      Pour chaque domaine :
        Item avec label + dot coloré + score
        Dot : getScoreColor(score) — rouge/orange/vert
        Score non exécuté : "—" en gray-500
    Section "Rapport" (si !isPublic)
      Item "Partager" → copie lien public
    Section "Rapport" (si isPublic)
      Item CTA "Lancer votre audit"

Indicateur actif :
  - Barre 2.5px à gauche, couleur info (blue-500)
  - Background surélevé (bg-gray-850)
  - Texte en gray-100 (au lieu de gray-400)

Mobile (< 768px) :
  - Sidebar masquée
  - Bouton hamburger dans la topbar
  - Overlay avec la sidebar en slide-in
```

### 8.2 Hero redesigné

```
Layout : flex, items-center, gap-20px, bg-gray-850, border-radius-lg, padding 18px 20px

Gauche :
  ScoreCircle taille custom (80px au lieu de 120px)
  Existant réutilisé avec prop size ajoutée ou className override

Centre (flex:1) :
  H1 : label textuel (17px, font-medium)
  Paragraphe : résumé (12.5px, text-secondary, line-height 1.5)
    → Utiliser le résumé LLM si disponible
    → Sinon, texte générique basé sur les scores et règles déclenchées
  Métadonnées (11px, text-tertiary) :
    - Nombre de contacts / companies / deals
    - Date de l'audit
    - Delta score vs dernier audit ("+X pts" vert ou "-X pts" rouge)

Pas de boutons d'action dans le hero (déplacés dans la sidebar)
Pas de grille de subscores dans le hero (déplacée en dessous)

Mode domaine filtré :
  Le hero s'adapte au domaine sélectionné :
  - ScoreCircle : score du domaine (pas le score global)
  - H1 : nom du domaine (ex: "Deals & Pipelines")
  - Label : getScoreLabel(domainScore) (ex: "Bon")
  - Résumé : texte contextuel du domaine (ex: "X règles déclenchées sur {totalRules}")
  - Métadonnées : données spécifiques au domaine (ex: "387 deals · 2 pipelines")
  - Delta score : masqué en vue domaine (pas de delta par domaine)
```

### 8.3 Grille des scores domaines (`DomainScoreGrid`)

```
Props :
  - domains: Array<{ id, label, score?, skipped? }>
  - activeDomain: string | null
  - onDomainClick: (id: string) => void

Layout : grid, 5 colonnes (responsive : 3 cols sur tablette, 2 sur mobile)
Gap : 8px

Chaque card :
  - Border gray-700, border-radius-md, padding 10px 12px
  - Hover : border gray-600
  - Label : 10.5px, text-secondary, ellipsis
  - Score : 18px, font-medium, text-primary (ou text-tertiary + "—" si skipped)
  - Barre de progression : 3px de haut, radius 2px
    - Track : gray-700
    - Fill : getScoreColor(score) → rouge/orange/vert
    - Largeur : score%

Clic → onDomainClick(id) → filtre le contenu
```

### 8.4 Bloc Quick Wins (`QuickWinsCallout`)

```
Props :
  - recommendations: string[]

Layout : padding 12px 16px, bg info subtle, border-left 3px blue-500
  H3 : "Corrections rapides recommandées" (12.5px, font-medium, text blue)
  Liste : chaque item avec bullet point bleu (4px dot)

Logique de génération des recommandations :
  → Sélectionner les 2-4 règles les plus impactantes (critiques d'abord, puis avertissements)
  → Formuler une action concrète avec le count : "Supprimer les X propriétés vides depuis plus de 90 jours"
  → Prioriser les règles avec le plus grand count ou impact business

Affiché uniquement en vue "Tableau de bord" (pas en vue domaine filtré)
Masqué si 0 règle déclenchée
```

### 8.5 Sections par sévérité

```
Ordre d'affichage :
  1. "Actions critiques" (N règles) — uniquement si N > 0
  2. "Avertissements" (N règles) — uniquement si N > 0
  3. "Informations" (N règles) — uniquement si N > 0
  4. "Conformes" (N règles) — toujours affiché si N > 0

Header de section :
  H2 (14px, font-medium) + count (11px, text-tertiary)

Liste de règles : flex-direction column, gap 5px
```

### 8.6 Carte de règle redesignée (`RuleListItem`)

```
Props :
  - rule: { id, title, description, severity, domain, count, hasBusinessImpact }
  - expandable?: boolean
  - children?: ReactNode (détail expand)

Layout (collapsed) :
  flex, items-start, gap 10px, padding 10px 12px
  Border gray-700, border-radius-md
  Hover : bg gray-850, border gray-600

  Gauche :
    Dot 5px (couleur sévérité), margin-top 6px

  Centre (flex:1) :
    Titre (12.5px, font-medium, text-primary)
    Description (11.5px, text-secondary, line-height 1.4) — 1-2 lignes max
    Métadonnées (flex, gap 8px, 10.5px, text-tertiary) :
      - Badge sévérité (pill : bg danger/warning/info + texte)
      - Tag domaine (texte simple)
      - "Impact business" (texte warning) si applicable

  Droite :
    Count (11px, text-secondary, bg gray-850, padding 2px 9px, border-radius pill)

Règle conforme :
  Opacité 0.5
  Pas de description
  Badge "OK" vert au lieu du badge sévérité
  Pas de count

Expand (clic) :
  Même comportement qu'actuellement (détail paginé, impact business complet, recommandation)
```

### 8.7 Mapping sévérité → style

| Sévérité | Dot | Badge bg | Badge text | Section title |
|---|---|---|---|---|
| critique | `#ef4444` | `rgba(239,68,68,0.15)` | `#f87171` | "Actions critiques" |
| avertissement | `#f59e0b` | `rgba(245,158,11,0.15)` | `#fbbf24` | "Avertissements" |
| info | `#3b82f6` | `rgba(59,130,246,0.15)` | `#60a5fa` | "Informations" |
| ok/conforme | `#22c55e` | `rgba(34,197,94,0.15)` | `#4ade80` | "Conformes" |

### 8.8 Responsive

| Breakpoint | Sidebar | Grille scores | Layout |
|---|---|---|---|
| ≥ 1024px | Visible (200px fixe) | 5 colonnes | Sidebar + contenu |
| 768-1023px | Masquée (hamburger) | 3 colonnes | Pleine largeur |
| < 768px | Masquée (hamburger) | 2 colonnes | Pleine largeur |

---

## 9. Dépendances & risques

### Dépendances

| Dépendance | Statut |
|---|---|
| Design system tokens existants (couleurs, typo, spacing) | ✅ Réutilisé tel quel |
| Composant ScoreCircle | ✅ Réutilisable (ajuster taille) |
| Composant SeverityBadge | ✅ Réutilisable |
| Données de règles déclenchées (audit_results) | ✅ Disponible |
| Résumé LLM (executive_summary) | ✅ Disponible |
| Historique d'audits (delta score) | ⚠️ À implémenter (query dernier audit du même workspace) |

### Risques

| Risque | Impact | Mitigation |
|---|---|---|
| Le résumé LLM n'est pas toujours disponible (fallback silencieux) | Le hero affiche un texte générique | Prévoir un template de texte basé sur les scores et counts |
| Performance : agréger toutes les règles cross-domaine | Faible — les données sont déjà chargées en mémoire | Le tri/groupement est côté client, pas d'appel API supplémentaire |
| Sidebar occupe de l'espace sur écrans moyens | Contenu compressé | Responsive : masquer sidebar < 1024px |
| Le delta score nécessite une query supplémentaire | Léger surcoût au chargement | Query optionnelle, masquer si pas de donnée |

---

## 10. Questions ouvertes

| Question | Décision proposée |
|---|---|
| Le bloc Quick Wins est-il généré par le LLM ou par une logique déterministe ? | **Décidé** — Logique déterministe en v1 (top 3 règles, texte template). Quick wins LLM en v2 via OpenAI API (même pattern que le résumé exécutif). |
| La vue domaine filtrée conserve-t-elle le hero global ou affiche-t-elle un hero spécifique au domaine ? | **Décidé** — Hero spécifique au domaine : ScoreCircle avec le score du domaine, label du domaine, résumé contextuel, métadonnées spécifiques au domaine |
| Les règles dans la section "Conformes" sont-elles cliquables/expandables ? | Non — affichage minimal (titre + badge OK + domaine), pas d'expansion |
| Le delta score s'affiche-t-il aussi sur le rapport public ? | Oui si le workspace a un audit précédent, sinon masqué |
| La sidebar est-elle présente sur la page de progression d'audit (tracker) ? | Non — la sidebar n'apparaît qu'une fois le rapport terminé |
