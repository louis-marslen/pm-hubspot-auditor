---
name: conseiller-investissement-feature
description: Évaluer les investissements en features selon l'impact revenu, la structure de coûts, le ROI et la stratégie. À utiliser pour décider si une feature mérite un investissement.
type: interactive
source: adapté de deanpeters/Product-Manager-Skills — feature-investment-advisor
---

## Objectif

Guider le PM à travers l'évaluation d'une feature basée sur l'analyse de l'impact financier. L'objectif est de prendre des décisions de priorisation basées sur les données en évaluant le lien revenu (direct ou indirect), la structure de coûts, le calcul du ROI et la valeur stratégique — puis de fournir des recommandations actionnables build/ne pas construire avec le raisonnement chiffré.

Ce n'est pas un framework de priorisation générique — c'est un prisme financier pour les décisions de features qui complète d'autres méthodes (RICE, valeur/effort, recherche utilisateur).

---

## Framework d'investissement feature

### 1. Lien revenu — Comment la feature impacte-t-elle le revenu ?
- **Monétisation directe** : Nouvelle tier, add-on, frais d'usage
- **Monétisation indirecte** : Rétention, conversion, activation, expansion

### 2. Structure de coûts — Combien ça coûte ?
- Coût de développement (investissement unique)
- Impact COGS (infrastructure, traitement)
- Impact OpEx (support, maintenance)

### 3. Calcul du ROI — Le retour vaut-il l'investissement ?
- Monétisation directe : Impact revenu / Coût de développement
- Features de rétention : Impact LTV sur la base clients / Coût de développement
- Prendre en compte la marge brute, pas juste le revenu

### 4. Valeur stratégique — Valeur non financière qui pourrait primer sur le ROI pur
- Fossé concurrentiel
- Enabler de plateforme
- Positionnement marché
- Réduction de risque

---

## Process interactif

### Étape 0 : Rassembler le contexte

Fournir :
- **Description de la feature** : Qu'est-ce que c'est ? (1 à 2 phrases)
- **Segment client cible** : PME, mid-market, enterprise, tous
- **Contexte business actuel** : MRR/ARR actuel, ARPU/ARPA actuel, taux de churn mensuel actuel, marge brute %
- **Contraintes** : Estimation du coût de développement, impact COGS ou OpEx ?

---

### Étape 1 : Identifier le lien revenu

**"Comment cette feature impacte-t-elle le revenu ?"**

1. **Monétisation directe** — On va faire payer cette feature (nouvelle tier, add-on payant, frais d'usage)
2. **Amélioration de la rétention** — Adresse une raison clé de churn, garde les clients
3. **Amélioration de la conversion** — Aide à convertir les utilisateurs en essai/freemium en clients payants
4. **Enabler d'expansion** — Crée un chemin d'upsell ou stimule l'expansion basée sur l'usage
5. **Pas d'impact revenu direct** — Table stakes, amélioration de plateforme, ou valeur uniquement stratégique

**Selon la sélection :**

**Si 1 (Monétisation directe) :**
- Quel pricing envisage-t-on ?
- Quel % de clients adopterait ça ? (conservateur, base, optimiste)
- Calculer : `Revenu mensuel potentiel = Base clients × Taux d'adoption × Prix`

**Si 2 (Amélioration rétention) :**
- Quel % du churn cette feature adresse-t-elle ? (ex. "30% des clients churned ont cité ce manque")
- Quelle réduction du churn attend-on ? (ex. "5% → 4% churn mensuel")
- Calculer : `Impact LTV = Augmentation de la durée de vie × Base clients × ARPU × Marge`

**Si 3 (Amélioration conversion) :**
- Taux de conversion essai → payant actuel ?
- Uplift de conversion attendu ? (ex. "20% → 25%")
- Calculer : `MRR additionnel = Utilisateurs en essai × Uplift conversion × ARPU`

**Si 4 (Enabler d'expansion) :**
- Quelle opportunité d'expansion crée-t-elle ? (upsell tier, croissance d'usage, add-on)
- Quel % de clients s'étendrait ?
- Calculer : `MRR d'expansion = Base clients × Taux d'expansion × Augmentation ARPU`

---

### Étape 2 : Évaluer la structure de coûts

```markdown
**Coût de développement (unique) :**
- Taille de l'équipe : ___ ingénieurs
- Estimation de durée : ___ semaines/mois
- Coût estimé : ___€

**Coûts continus (si applicable) :**
- Impact COGS : ___€/mois (hébergement, infrastructure, traitement)
- Impact OpEx : ___€/mois (support, maintenance)
```

**Signaux d'alarme :**
- Si COGS > 20% du revenu projeté : ⚠️ Cette feature dilue significativement les marges
- Si les coûts continus sont élevés par rapport au revenu : ⚠️ À vérifier la viabilité

---

### Étape 3 : Évaluer les contraintes et le timing

1. **Menace concurrentielle time-sensitive** — Un concurrent vient de lancer ça ; on perd des deals
2. **Budget/capacité limitée** — On ne peut construire qu'une grande feature ce trimestre
3. **Dépendances sur d'autres travaux** — Nécessite des améliorations de plateforme ou d'autres features en premier
4. **Pas de contraintes majeures** — On a la capacité et la flexibilité

---

### Étape 4 : Recommandations

#### Recommandation 1 : Cas financier solide → Construire maintenant

**Quand :** ROI > 3:1 (monétisation directe) ou impact LTV > 10:1 (rétention/expansion)

```markdown
**Construire maintenant** — Cas financier solide

**Impact revenu :**
- Estimation conservatrice : [X]€/mois
- Estimation optimiste : [Y]€/mois

**Coût :**
- Développement : [Z]€
- COGS/OpEx continus : [W]€/mois
- Impact marge nette : [%]

**ROI :**
- ROI Année 1 : [ratio]:1
- Délai de récupération : [mois]

**Prochaines étapes :**
1. Valider les hypothèses de pricing/adoption avec des interviews clients
2. Construire un MVP pour tester la valeur core
3. Monitorer [métrique spécifique] pour mesurer l'impact
```

#### Recommandation 2 : Cas financier marginal, construire quand même (stratégique)

**Quand :** ROI < 2:1 mais haute valeur stratégique (concurrentiel, plateforme, conformité)

```markdown
**Construire pour des raisons stratégiques (cas financier marginal)**

**Réalité financière :**
- Impact revenu : [X]€/mois (modeste)
- ROI : [ratio]:1 (sous le seuil de 3:1)

**Valeur stratégique :**
- [Fossé concurrentiel / Enabler de plateforme / Obligation marché]

**Risque :**
Coût d'opportunité — d'autres features ont potentiellement un meilleur ROI
```

#### Recommandation 3 : Ne pas construire (mauvais ROI)

**Quand :** ROI < 1:1 ou impact LTV négatif

```markdown
**Ne pas construire** — Le cas financier ne justifie pas l'investissement

**Pourquoi :**
- Impact revenu : [X]€/mois
- ROI : [ratio]:1 (sous le point mort)

**Approches alternatives :**
1. **Réduire le périmètre** — Peut-on construire une version plus simple à 50% du coût ?
2. **Changer la monétisation** — Peut-on facturer plus ou différemment ?
3. **Déprioritiser** — Focus sur des features avec meilleur ROI

**Ce qui devrait changer pour que ça vaille la peine :**
- Si le taux d'adoption augmente de [X]% à [Y]%, le ROI devient viable
- Si on réduit le coût de dev à [Z]€, le délai de récupération devient acceptable
```

#### Recommandation 4 : Construire plus tard / Plus de données nécessaires

**Quand :** Hypothèses très incertaines, impact revenu dépend d'hypothèses non validées

```markdown
**Construire plus tard** — Valider les hypothèses d'abord

**Incertitude actuelle :**
- Taux d'adoption : [X]% (à valider)
- Impact churn : [X]% de réduction (hypothèse, pas prouvée)

**Que valider :**
1. Enquête de demande de feature auprès de 50+ clients
2. Prototype et test de willingness-to-pay
3. Interviews clients churned pour confirmer que ça adresse la raison de churn #1

**Critères de décision :**
- Si [X]% de clients disent qu'ils paieraient [Y]€ → construire
- Si les interviews de churn confirment que c'est dans le top 3 des raisons → construire
- Sinon → déprioritiser
```

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Confondre revenu et profit | "Ça génèrera 1M€ de revenu !" (sans les 800K€ de COGS) | Toujours calculer la marge contributive : `Revenu × Marge %` |
| Ignorer le délai de récupération | ROI 5:1 mais récupération en 5 ans alors que les clients churent en 2 ans | Vérifier le délai de récupération < durée de vie moyenne client |
| Surestimer l'adoption | "100% des clients adopteront cet add-on payant !" | Utiliser des estimations conservatrices (10 à 20% pour les add-ons). Valider avec willingness-to-pay |
| Construire sans valider | "On pense que ça réduira le churn" (sans interviews) | Interviewer les clients churned d'abord, valider que ça adresse les top 3 raisons de churn |
| Ignorer le coût d'opportunité | "Ce feature a un ROI de 2:1, construisons-le !" (d'autres ont un ROI de 10:1) | Comparer le ROI entre les features, construire celles avec le meilleur ROI d'abord |
| "Stratégique" comme excuse | "Le ROI est nul mais c'est stratégique !" | Définir ce que "stratégique" signifie concrètement (fossé concurrentiel, enabler plateforme, conformité) |
