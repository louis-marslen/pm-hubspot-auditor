# EP-UX-03 — Refonte de la page rapport d'audit

**PRD associé :** [prd-ux-03-refonte-rapport.md](../prd/prd-ux-03-refonte-rapport.md)
**Date de création :** 2026-03-16
**Statut :** ✅ Livré

---

## Hypothèse

Si nous réorganisons le rapport d'audit par sévérité (cross-domaine) au lieu de par domaine, avec une sidebar de navigation et un bloc "quick wins", alors les destinataires du rapport comprendront les priorités d'action en moins de 10 secondes, parce que la hiérarchie visuelle correspond à leur modèle mental (urgence > domaine). Nous mesurerons le succès via le feedback qualitatif sur la lisibilité du rapport.

---

## Périmètre

### In scope

- **Layout** : Remplacement des tabs horizontaux par une sidebar fixe (200px)
- **Architecture info** : Regroupement des règles par sévérité (critiques → avertissements → infos → conformes) au lieu de par domaine
- **Hero** : Simplification (ScoreCircle 80px + résumé texte + métadonnées + delta score)
- **Grille scores** : Nouveau composant avec barres de progression par domaine
- **Quick wins** : Nouveau bloc de recommandations actionnables
- **Cartes de règles** : Redesign avec dot, titre, description, badge sévérité, tag domaine, count
- **Section "Conformes"** : Nouvelle section montrant les règles sans problème
- **Vue domaine filtrée** : Clic sidebar → filtre les règles pour un domaine
- **Rapport public** : Même refonte, variante sidebar adaptée
- **Responsive** : Sidebar masquée < 1024px, grille adaptative

### Out of scope

- Export PDF (EP-07 abandonné)
- Changement de palette de couleurs (on garde les tokens actuels)
- Changement de marque ou de logo
- Modification du moteur d'audit ou des règles
- Modification de la page de progression (tracker)
- Modification du dashboard principal (liste des audits)
- Quick wins générés par LLM (v2)

---

## User Stories

### EP-UX-03-S1 — Vue d'ensemble par sévérité

**En tant que** destinataire du rapport, **je veux** voir tous les problèmes critiques en premier, indépendamment du domaine, **afin de** comprendre immédiatement les priorités.

**Critères d'acceptance :**
- [ ] Étant donné un rapport avec des règles déclenchées dans plusieurs domaines, quand j'ouvre la page rapport, alors les règles sont groupées par sévérité : critiques → avertissements → informations → conformes
- [ ] Étant donné une règle critique dans le domaine "Deals", quand je vois la section "Actions critiques", alors la règle affiche un tag "Deals & Pipelines"
- [ ] Étant donné une section de sévérité vide (ex: 0 critiques), quand j'ouvre le rapport, alors cette section n'apparaît pas
- [ ] Étant donné des règles sans problème détecté (count = 0), quand j'ouvre le rapport, alors elles apparaissent dans la section "Conformes"

### EP-UX-03-S2 — Sidebar de navigation

**En tant que** opérateur RevOps, **je veux** naviguer entre la vue d'ensemble et un domaine via une sidebar fixe, **afin de** approfondir un domaine sans perdre le contexte global.

**Critères d'acceptance :**
- [ ] Étant donné la page rapport, quand elle se charge, alors une sidebar fixe de 200px est visible à gauche
- [ ] Étant donné un domaine avec un score, quand je regarde la sidebar, alors un dot coloré et le score numérique sont affichés
- [ ] Étant donné un domaine non exécuté, quand je regarde la sidebar, alors un tiret grisé remplace le score
- [ ] Étant donné que je clique sur un domaine, quand la vue se met à jour, alors seules les règles de ce domaine sont affichées
- [ ] Étant donné que je clique sur "Tableau de bord", quand la vue se met à jour, alors toutes les règles sont affichées
- [ ] Étant donné un écran < 1024px, quand je consulte le rapport, alors la sidebar est masquée et accessible via hamburger

### EP-UX-03-S3 — Hero simplifié

**En tant que** destinataire du rapport, **je veux** voir un résumé textuel dès le haut de page, **afin de** comprendre la situation sans analyser des graphiques.

**Critères d'acceptance :**
- [ ] Étant donné un rapport en vue "Tableau de bord", quand j'ouvre la page, alors le hero affiche un ScoreCircle 80px avec le score global, le label, un résumé 1-2 phrases, et les métadonnées
- [ ] Étant donné un rapport en vue domaine filtrée, quand je clique sur un domaine, alors le hero bascule : ScoreCircle avec le score du domaine, nom du domaine en H1, résumé contextuel, métadonnées spécifiques au domaine
- [ ] Étant donné un delta de score vs le dernier audit, quand j'ouvre le rapport en vue globale, alors "+X pts" (vert) ou "-X pts" (rouge) est affiché
- [ ] Étant donné un résumé LLM disponible, quand j'ouvre la page en vue globale, alors il est utilisé comme texte du hero

### EP-UX-03-S4 — Grille de scores par domaine

**En tant que** opérateur RevOps, **je veux** voir les scores de chaque domaine dans une grille compacte, **afin de** identifier visuellement les domaines les plus faibles.

**Critères d'acceptance :**
- [ ] Étant donné N domaines exécutés, quand j'ouvre la page, alors une grille affiche pour chaque domaine : nom, score, barre de progression colorée
- [ ] Étant donné un clic sur une card domaine, quand la vue se met à jour, alors le filtre domaine s'active (identique au clic sidebar)
- [ ] Étant donné un score, quand la barre s'affiche, alors la couleur suit le barème : rouge (0-49), orange (50-69), vert (70-100)

### EP-UX-03-S5 — Bloc Quick Wins

**En tant que** destinataire du rapport, **je veux** voir 2-3 actions rapides recommandées, **afin de** savoir par où commencer.

**Critères d'acceptance :**
- [ ] Étant donné des règles déclenchées, quand j'ouvre le rapport en vue "Tableau de bord", alors un bloc bleu affiche 2-4 recommandations actionnables
- [ ] Étant donné 0 règle déclenchée, quand j'ouvre le rapport, alors le bloc n'apparaît pas
- [ ] Étant donné une vue filtrée par domaine, quand la vue se met à jour, alors le bloc est masqué

### EP-UX-03-S6 — Cartes de règles redesignées

**En tant que** destinataire du rapport, **je veux** scanner les règles rapidement sans déplier d'accordéons, **afin de** avoir une vue d'ensemble immédiate.

**Critères d'acceptance :**
- [ ] Étant donné une règle déclenchée, quand je la vois, alors elle affiche : dot coloré, titre, description, badge sévérité, tag domaine, count
- [ ] Étant donné un clic sur une carte, quand elle s'ouvre, alors le détail s'affiche (items paginés, impact business, recommandation)
- [ ] Étant donné une règle conforme, quand je la vois dans "Conformes", alors elle est en opacité réduite avec badge "OK" vert

### EP-UX-03-S7 — Rapport public

**En tant que** destinataire externe, **je veux** le même rapport redesigné via le lien public, **afin de** bénéficier de la même expérience.

**Critères d'acceptance :**
- [ ] Étant donné un lien public, quand j'ouvre la page, alors le layout sidebar + contenu est identique
- [ ] Étant donné le rapport public, quand je regarde la sidebar, alors "Partager" est remplacé par un CTA "Lancer votre audit"

---

## Spécifications fonctionnelles

### Nouveaux composants à créer

| Composant | Fichier | Rôle |
|---|---|---|
| `ReportSidebar` | `src/components/report-sidebar.tsx` | Navigation latérale fixe avec domaines et scores |
| `DomainScoreGrid` | `src/components/domain-score-grid.tsx` | Grille de mini-cards scores domaines |
| `QuickWinsCallout` | `src/components/quick-wins-callout.tsx` | Bloc de recommandations actionnables |
| `RuleListItem` | `src/components/rule-list-item.tsx` | Carte de règle redesignée (remplace `RuleCard` interne) |
| `SeveritySection` | `src/components/severity-section.tsx` | Header de section + liste de règles par sévérité |
| `ReportLayout` | `src/components/report-layout.tsx` | Layout shell (sidebar + contenu scrollable) |

### Composants existants réutilisés

| Composant | Modification |
|---|---|
| `ScoreCircle` | Aucune — utiliser `className` pour forcer 80px |
| `SeverityBadge` | Ajouter variante "ok" si pas déjà présente |
| `Badge` | Aucune |
| `PaginatedList` | Aucune |
| `Breadcrumb` | Aucune |
| `Topbar` | Aucune |

### Fichiers principaux à modifier

| Fichier | Nature du changement |
|---|---|
| `src/app/audit/[id]/page.tsx` | Wrapper avec `ReportLayout` au lieu de `DashboardShell` |
| `src/components/audit-results-view.tsx` | Refonte majeure : supprimer tabs, réorganiser par sévérité, intégrer sidebar |
| `src/app/share/[shareToken]/page.tsx` | Même refonte, variante publique |

### Logique de tri cross-domaine

```
Entrée : audit_results (toutes les règles de tous les domaines)

1. Collecter toutes les règles de tous les domaines
2. Pour chaque règle, annoter avec { domainId, domainLabel }
3. Partitionner en 4 groupes :
   - critiques : severity === "critique" && count > 0
   - avertissements : severity === "avertissement" && count > 0
   - infos : severity === "info" && count > 0
   - conformes : count === 0 (ou isEmpty)
4. Dans chaque groupe, trier par count décroissant
5. Afficher chaque groupe dans une SeveritySection
```

### Logique Quick Wins

```
Entrée : règles triées par sévérité

1. Prendre les règles critiques (par count décroissant)
2. Si < 3, compléter avec les avertissements (par count décroissant)
3. Limiter à 4 recommandations max
4. Pour chaque règle sélectionnée, générer un texte actionnable :
   Template : "[Verbe d'action] les {count} {objet} {condition}"
   Exemples :
   - "Supprimer les 6 propriétés vides depuis plus de 90 jours"
   - "Clôturer ou mettre à jour les 5 deals ouverts depuis plus de 60 jours"
   - "Renseigner les descriptions manquantes sur 99 propriétés"
5. Stocker les templates de texte dans un mapping ruleKey → template
```

### Logique Delta Score

```
Entrée : workspace_id, audit_id courant

1. Query : SELECT overall_score FROM audit_runs
   WHERE workspace_id = $1 AND id != $2
   ORDER BY created_at DESC LIMIT 1
2. Si résultat : delta = current_score - previous_score
3. Affichage :
   - delta > 0 : "+{delta} pts vs dernier audit" (text-green-400)
   - delta < 0 : "{delta} pts vs dernier audit" (text-red-400)
   - delta === 0 : "= dernier audit" (text-tertiary)
   - Pas de résultat : ne rien afficher
```

---

## Critères d'acceptance globaux

- [ ] Le layout sidebar + contenu est fonctionnel sur desktop (≥ 1024px)
- [ ] La sidebar est masquée et accessible via hamburger sur tablette/mobile (< 1024px)
- [ ] La vue par défaut ("Tableau de bord") affiche toutes les règles groupées par sévérité
- [ ] Le clic sur un domaine (sidebar ou grille) filtre les règles pour ce domaine
- [ ] Le hero affiche ScoreCircle 80px + résumé + métadonnées + delta score
- [ ] La grille de scores affiche tous les domaines exécutés avec barres de progression
- [ ] Le bloc Quick Wins affiche 2-4 recommandations actionnables
- [ ] Les cartes de règles affichent dot + titre + description + badge sévérité + tag domaine + count
- [ ] La section "Conformes" affiche les règles sans problème (opacité réduite, badge OK)
- [ ] Le rapport public (`/share/[token]`) a le même layout avec sidebar adaptée
- [ ] Pas de régression sur les données affichées (toutes les règles restent visibles)
- [ ] Palette de couleurs inchangée (tokens dark existants)
- [ ] Performance : pas de surcoût mesurable au chargement

---

## Dépendances

| Dépendance | Statut |
|---|---|
| Design system tokens (palette, typo, spacing) | ✅ Existant |
| ScoreCircle, SeverityBadge, Badge, PaginatedList | ✅ Existant |
| Données d'audit (toutes les règles de tous les domaines) | ✅ Existant |
| Résumé LLM (executive_summary) | ✅ Existant |
| Query delta score (audit précédent) | ⚠️ À implémenter |

---

## Questions ouvertes

| Question | Décision proposée |
|---|---|
| Quick wins : logique déterministe ou LLM ? | **Décidé** — Déterministe en v1, LLM via OpenAI en v2 |
| Le hero en vue domaine filtrée : global ou spécifique ? | **Décidé** — Hero spécifique au domaine (score domaine, label domaine, résumé et métadonnées contextuels) |
| Règles conformes : cliquables ? | Non — affichage minimal |
| Delta score sur rapport public ? | Oui si audit précédent existe |
| Animation de transition sidebar → filtre domaine ? | Transition CSS simple (opacity/transform), pas de page reload |
