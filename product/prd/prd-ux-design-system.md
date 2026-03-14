# PRD-UX — Design System & Rattrapage UX/UI

**Epic associé :** EP-UX
**Phase :** NOW (v2)
**Statut :** À spécifier
**Dernière mise à jour :** 2026-03-14
**Auteur :** Product Management

---

## 1. Résumé exécutif

L'application HubSpot Auditor a été développée en "function first" : les 5 epics de la phase 1 (EP-00 à EP-04) sont fonctionnels mais l'interface n'a ni cohérence visuelle, ni parcours utilisateur pensé, ni design system. Ce PRD couvre la mise en place d'une fondation UI/UX et le rattrapage des écrans existants pour atteindre un niveau de qualité compatible avec une utilisation externe (beta users, prospects, clients).

Ce n'est pas un "polish" cosmétique — c'est un prérequis pour que les features livrées délivrent réellement leur valeur. Un audit dont les résultats sont illisibles ou un parcours d'inscription qui perd l'utilisateur annulent la valeur fonctionnelle.

---

## 2. Problème utilisateur

### Narrative du problème

**Je suis :** Louis, consultant RevOps et créateur de l'outil
- Je veux montrer l'outil à des prospects et des beta users
- Je veux que la première impression inspire confiance et professionnalisme

**J'essaie de :**
- Présenter HubSpot Auditor comme un produit crédible, pas un prototype technique

**Mais :**
- Les écrans sont visuellement incohérents (pas de palette définie, spacing aléatoire, typographie par défaut)
- Le parcours utilisateur n'est pas guidé — après l'inscription, l'utilisateur ne sait pas quoi faire
- Les résultats d'audit sont denses et difficiles à scanner visuellement
- Le lien de partage public n'a pas le niveau de finition d'un livrable client

**Parce que :**
- Le développement a priorisé la couverture fonctionnelle, sans passer par une phase de design

**Ce qui fait ressentir :**
- Gêne à montrer l'outil en l'état
- Risque de perdre la confiance de beta users dès la première interaction

### Énoncé du problème

HubSpot Auditor a besoin d'un design system cohérent et d'un parcours utilisateur fluide parce que les écrans existants, développés sans guidelines visuelles, ne transmettent pas la crédibilité nécessaire pour convaincre des utilisateurs externes d'adopter l'outil.

---

## 3. Utilisateurs cibles & personas

### Persona primaire : Louis (Consultant / Créateur)
- **Job-to-be-done :** Montrer un outil professionnel à ses prospects et clients
- **Douleur :** L'UI actuelle ne reflète pas la qualité de l'audit sous-jacent

### Persona secondaire : Beta user (RevOps Manager)
- **Job-to-be-done :** S'inscrire, connecter HubSpot et comprendre ses résultats d'audit en autonomie
- **Douleur :** Parcours non guidé, résultats visuellement denses, pas de hiérarchie visuelle claire

### Persona tertiaire : Destinataire du rapport (Manager non-technique)
- **Job-to-be-done :** Lire un rapport d'audit partagé via lien public et comprendre les enjeux
- **Douleur :** Le rapport public n'a pas la finition d'un livrable professionnel

---

## 4. Contexte stratégique

### Pourquoi maintenant ?

La phase 1 est complète (EP-00 à EP-04 livrés). Avant d'ajouter de nouvelles features (EP-05/06/07/08), il faut consolider l'existant :
- Les prochains epics (export PDF, onboarding self-service) dépendent d'une base UI solide
- Un export PDF sur une UI non designée produira un PDF non présentable
- L'onboarding self-service n'a de sens que si le parcours post-inscription est pensé

### Positionnement

EP-UX est un **epic fondation** qui conditionne la réussite de toute la phase 2. Il doit être livré en premier.

---

## 5. Vue d'ensemble de la solution

### Volet 1 — Design system (fondation)

Créer un socle de composants et tokens réutilisables :

1. **Tokens de design** — palette de couleurs (brand, semantic, neutral), typographie (font family, scale, weights), spacing scale, border radius, shadows
2. **Composants UI de base** — Button (variants : primary, secondary, ghost, danger), Input (text, select, checkbox), Card, Badge, Alert, Modal, Table, Empty state, Loading state
3. **Layout** — Sidebar/header navigation, page container, responsive breakpoints
4. **Patterns d'interaction** — Toast notifications, formulaires (validation, erreurs inline), listes paginées, sections collapsibles

### Volet 2 — Parcours utilisateur (UX)

Repenser les flux critiques :

1. **Inscription → premier audit** — étapes guidées, feedback visuel à chaque étape, empty states explicatifs
2. **Dashboard** — hiérarchie visuelle claire, call-to-action évident ("Lancer un audit"), distinction visuelle entre workspaces connectés/non connectés
3. **Résultats d'audit** — scanner visuellement les scores avant de plonger dans le détail, catégories visuellement distinctes, business impact mis en avant
4. **Rapport public** — identité visuelle professionnelle, mise en page pensée pour la lecture (et préparant l'export PDF)

### Volet 3 — Rattrapage des écrans existants

Appliquer le design system aux écrans déjà codés :

| Écran | Problèmes identifiés | Priorité |
|---|---|---|
| Pages auth (login, register, forgot-password) | Pas de branding, layout basique, feedback minimal | Haute |
| Dashboard principal | Pas de hiérarchie visuelle, empty state absent, CTA peu visible | Haute |
| Page résultats d'audit | Trop dense, scores peu lisibles, sections mal distinguées | Haute |
| Page de partage public | Manque d'identité, pas de header/footer branded | Haute |
| Page workspaces | Fonctionnelle mais sans design | Moyenne |
| Page suppression de compte | Minimaliste | Basse |

---

## 6. Métriques de succès

### Métrique primaire
**Taux de complétion du premier audit** (inscription → audit terminé)
- Actuel : non mesuré (pas de tracking)
- Cible : > 60% des utilisateurs inscrits lancent et terminent un premier audit
- Délai de mesure : 30 jours après déploiement

### Métriques secondaires
- **Temps vers le premier audit** : < 5 minutes entre l'inscription et le lancement du premier audit
- **Satisfaction visuelle** : feedback qualitatif positif de 3/5 beta users

### Métriques garde-fou
- Pas de régression fonctionnelle sur les features existantes (tous les flux EP-00 à EP-04 restent opérationnels)

---

## 7. User stories & requirements

### Hypothèse d'epic

Nous croyons que mettre en place un design system cohérent et repenser les parcours utilisateur permettra aux beta users de compléter leur premier audit en autonomie et percevront l'outil comme professionnel et fiable, parce que la qualité visuelle est un signal de confiance direct. Nous mesurerons le succès via le taux de complétion du premier audit.

### User stories

#### US-UX-01 : Cohérence visuelle

**En tant que** beta user visitant l'application pour la première fois,
**je veux** voir une interface visuellement cohérente et professionnelle,
**afin de** avoir confiance dans l'outil et le prendre au sérieux.

**Critères d'acceptance :**
- [ ] Étant donné que je navigue entre les pages auth, dashboard et résultats, quand je compare les éléments visuels (boutons, inputs, couleurs, typo), alors ils sont cohérents sur toutes les pages
- [ ] Étant donné que je vois l'application pour la première fois, quand j'arrive sur la page de login, alors l'interface a une identité visuelle reconnaissable (couleurs brand, logo/nom, mise en page soignée)

#### US-UX-02 : Parcours inscription → premier audit

**En tant que** nouvel utilisateur,
**je veux** être guidé de l'inscription jusqu'à mon premier audit,
**afin de** comprendre la valeur de l'outil sans aide extérieure.

**Critères d'acceptance :**
- [ ] Étant donné que je viens de confirmer mon email, quand j'arrive sur le dashboard, alors un empty state m'explique quoi faire et me propose de connecter un workspace HubSpot
- [ ] Étant donné que j'ai connecté un workspace, quand je reviens au dashboard, alors un CTA clair m'invite à lancer mon premier audit
- [ ] Étant donné que l'audit est en cours, quand je regarde l'écran, alors je vois une progression visuelle (pas juste un spinner générique)

#### US-UX-03 : Lisibilité des résultats d'audit

**En tant que** RevOps Manager consultant les résultats de mon audit,
**je veux** scanner visuellement les scores et les problèmes principaux en quelques secondes,
**afin de** savoir où concentrer mon attention sans lire chaque ligne de détail.

**Critères d'acceptance :**
- [ ] Étant donné que l'audit est terminé, quand j'arrive sur la page de résultats, alors le score global et les scores par domaine sont immédiatement visibles (above the fold)
- [ ] Étant donné que je regarde la liste des problèmes, quand je scanne les résultats, alors les problèmes critiques sont visuellement distingués des avertissements et des infos (couleur, icône, position)
- [ ] Étant donné que j'ai beaucoup de résultats, quand je navigue dans les sections, alors je peux les replier/déplier pour gérer la densité d'information

#### US-UX-04 : Rapport public présentable

**En tant que** consultant partageant un rapport d'audit à un client,
**je veux** que le lien public ait un niveau de finition professionnel,
**afin de** pouvoir l'envoyer directement sans le retravailler.

**Critères d'acceptance :**
- [ ] Étant donné qu'un destinataire ouvre le lien public, quand la page charge, alors elle affiche un header avec le branding HubSpot Auditor, la date de l'audit et le nom du portail
- [ ] Étant donné que le destinataire n'est pas technique, quand il lit le rapport, alors le résumé LLM et le score global sont en premier, les détails techniques en dessous
- [ ] Étant donné que le rapport est long, quand le destinataire scrolle, alors une table des matières sticky ou un nav permet de sauter entre les sections

#### US-UX-05 : Design system utilisable pour les prochains epics

**En tant que** développeur implémentant les prochains epics (EP-05 à EP-08),
**je veux** avoir un design system avec des composants réutilisables documentés,
**afin de** produire des écrans cohérents sans devoir prendre des décisions visuelles à chaque feature.

**Critères d'acceptance :**
- [ ] Étant donné que je dois créer un nouvel écran, quand je cherche les composants disponibles, alors je trouve les composants de base (Button, Input, Card, Badge, Alert, Table) avec leurs variants
- [ ] Étant donné que j'utilise les tokens de design (couleurs, spacing, typo), quand le résultat est rendu, alors il est visuellement cohérent avec le reste de l'application

---

## 8. Out of scope

- **Branding complet** (logo, charte graphique détaillée) — on utilise une identité simple (nom + couleurs) pour la v1
- **Animations avancées** — pas de transitions élaborées, juste les feedbacks d'état basiques
- **Mode sombre** — pas dans ce scope
- **Internationalisation** — l'interface reste en français
- **Tests E2E** — les tests visuels ne sont pas dans ce scope (validation manuelle)
- **Storybook / documentation composants isolée** — les composants sont documentés dans le code, pas dans un outil séparé

---

## 9. Dépendances & risques

### Dépendances

| Type | Détail |
|---|---|
| Technique | Tailwind CSS déjà en place — le design system se construit dessus |
| Technique | Composants UI existants (`button.tsx`, `input.tsx`, `alert.tsx`) — à étendre, pas à repartir de zéro |
| Amont | EP-00 à EP-04 livrés — les écrans à rattraper existent |

### Risques & mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| Scope creep (toujours un "petit truc" à améliorer) | M | Définir les composants et écrans cibles au lancement, ne pas ajouter de nouveaux écrans |
| Régression fonctionnelle en modifiant les écrans existants | H | Tester manuellement tous les flux EP-00 à EP-04 après le rattrapage |
| Choix de design subjectifs qui bloquent l'avancement | M | Prendre des décisions rapidement, itérer après le feedback beta |

---

## 10. Questions ouvertes

| # | Question | Impact | Proposition |
|---|---|---|---|
| 1 | Faut-il utiliser une librairie de composants existante (shadcn/ui, Radix) ou construire sur Tailwind pur ? | Effort + cohérence | À décider en tech spec — évaluer shadcn/ui qui est compatible Tailwind et très populaire en Next.js |
| 2 | Faut-il intégrer un système d'icônes (Lucide, Heroicons) ? | Cohérence visuelle | Oui, choisir un set et s'y tenir — Lucide est le standard avec shadcn/ui |
| 3 | Le rapport public doit-il avoir un layout différent du rapport connecté ? | Effort | Proposer un layout partagé avec des variantes mineures (header, footer) |
