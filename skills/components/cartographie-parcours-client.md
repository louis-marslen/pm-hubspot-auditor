---
name: cartographie-parcours-client
description: Créer une customer journey map complète — étapes, touchpoints, actions, émotions et métriques. À utiliser pour diagnostiquer une expérience défaillante ou aligner une équipe sur le flux client complet.
type: component
source: adapté de deanpeters/Product-Manager-Skills — customer-journey-map
---

## Objectif

Créer une customer journey map complète qui visualise comment les clients interagissent avec le produit/la marque à travers toutes les étapes — de la découverte à la fidélité — en documentant leurs actions, touchpoints, émotions, KPIs, objectifs business et équipes impliquées. L'objectif est d'identifier les points de douleur, d'aligner les équipes cross-fonctionnelles et d'améliorer systématiquement l'expérience client.

---

## Structure de la customer journey map

### Structure horizontale (étapes)
- **Découverte** : Le client découvre le produit pour la première fois
- **Évaluation** : Le client évalue l'offre
- **Décision** : Le client prend une décision d'achat/d'essai
- **Utilisation** : Le client utilise le produit post-inscription
- **Fidélité** : Le client devient un utilisateur régulier et ambassadeur

### Structure verticale (pour chaque étape)
- **Actions client** : Ce que les clients font
- **Touchpoints** : Où/comment ils interagissent avec le produit/la marque
- **Expérience client** : Émotions et pensées
- **KPIs** : Métriques pour mesurer le succès
- **Objectifs business** : Ce qu'on cherche à atteindre
- **Équipes impliquées** : Qui est propriétaire de cette étape

---

## Application

### Étape 1 : Préparer les prérequis

Avant de cartographier, s'assurer d'avoir :
1. **Parties prenantes clés** : Représentants marketing, sales, produit, support
2. **Personas acheteurs** : Personas détaillés (référencer `proto-persona`)
3. **Étapes définies** : Principales étapes du processus d'achat
4. **Inventaire des touchpoints** : Tous les endroits où les clients interagissent avec le produit/la marque

### Étape 2 : Définir les objectifs

```markdown
## Objectifs
- [Objectif 1 : ex. "Identifier les 3 principaux points de friction entre Découverte et Évaluation"]
- [Objectif 2 : ex. "Aligner marketing et produit sur les motivations clients par étape"]
```

### Étape 3 : Choisir un persona

Sélectionner un seul persona (créer des maps séparées pour chaque persona) :

```markdown
## Persona
- [Nom et description courte]
- [Ex. "Maxime Manager RevOps : 35-42 ans, admin HubSpot dans une scale-up, cherche à fiabiliser ses données CRM"]
```

### Étape 4 : Cartographier chaque étape

Pour chaque étape (Découverte, Évaluation, Décision, Utilisation, Fidélité) :

```markdown
### Étape : [Nom de l'étape]

**Actions client :**
- [Action 1]
- [Action 2]

**Touchpoints :**
- [Touchpoint 1]
- [Touchpoint 2]

**Expérience client :**
- [Émotion/pensée 1 : ex. "Curieux mais sceptique — 'Est-ce vraiment mieux qu'un audit manuel ?'"]
- [Émotion/pensée 2]

**KPIs :**
- [KPI 1 : ex. "Taux de conversion essai → payant : X%"]
- [KPI 2]

**Objectifs business :**
- [Objectif 1]
- [Objectif 2]

**Équipes impliquées :**
- [Équipe 1 (rôle)]
- [Équipe 2 (rôle)]
```

### Étape 5 : Visualiser la map

| **Étape** | **Découverte** | **Évaluation** | **Décision** | **Utilisation** | **Fidélité** |
|---|---|---|---|---|---|
| **Actions** | Cherche "audit HubSpot", lit des articles | Compare les alternatives, demande une démo | Crée un compte essai, lance le premier audit | Configure le workspace, explore les rapports | Utilise hebdomadairement, partage avec l'équipe |
| **Touchpoints** | Google, LinkedIn, Capterra | Site web, démo, emails sales | Produit (essai), emails onboarding | Produit, support, base de connaissances | Produit, communauté, CSM |
| **Expérience** | Curieux mais sceptique | Enthousiaste mais incertain | Anxieux à propos de la configuration | Soulagé si c'est facile, frustré si c'est complexe | Satisfait et confiant |
| **KPIs** | Trafic organique, impressions | Demandes de démo, créations de compte | Taux de conversion essai → payant | Taux d'activation, tickets support | Taux de rétention, NPS |
| **Objectifs business** | Notoriété dans le segment RevOps | Générer des leads qualifiés | Convertir les essais en clients payants | Réduire le churn, améliorer l'activation | Augmenter le LTV, générer des recommandations |
| **Équipes** | Marketing, Content | Marketing, Sales, Produit | Sales, Produit, Onboarding | Produit, Support, CS | Produit, CS, Marketing |

### Étape 6 : Analyser et prioriser

Questions à se poser :
1. **Où sont les plus grands points de douleur ?** (Rechercher émotions négatives + forts taux d'abandon)
2. **Quelles étapes ont les KPIs les plus faibles ?** (Prioriser les étapes sous-performantes)
3. **Les équipes sont-elles alignées ?** (Chaque équipe comprend-elle son rôle dans chaque étape ?)
4. **Quelles opportunités existent ?** (Où de petites améliorations créent-elles un grand impact ?)

### Étape 7 : Tester et affiner

- Mettre à jour régulièrement : le comportement client évolue — revoir la map chaque trimestre
- Valider avec des données : analytics, enquêtes, interviews clients
- Suivre les améliorations : après chaque changement, mesurer l'impact sur les KPIs

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Émotions génériques | "Le client est satisfait" | Être spécifique : "Soulagé que la configuration n'ait pris que 30 min" |
| Touchpoints manqués | Uniquement les touchpoints digitaux | Inclure aussi les touchpoints humains (démo, support téléphonique) et communautaires |
| Perspective interne | Mapper ce qu'on *veut* que les clients fassent | Valider avec des données réelles : analytics, tickets support, interviews |
| Pas de KPIs ni objectifs | Map avec actions et émotions mais sans métriques | Ajouter KPIs et objectifs business pour chaque étape |
| Exercice ponctuel | Map créée une fois, jamais mise à jour | Revoir chaque trimestre, mettre à jour selon les données |
