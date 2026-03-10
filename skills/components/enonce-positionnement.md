---
name: enonce-positionnement
description: Créer un énoncé de positionnement au style Geoffrey Moore. À utiliser pour clarifier à qui on s'adresse, quel problème on résout, la catégorie du produit et pourquoi on est différent des alternatives.
type: component
source: adapté de deanpeters/Product-Manager-Skills — positioning-statement
---

## Objectif

Créer un énoncé de positionnement au style Geoffrey Moore qui articule clairement à qui le produit s'adresse, quel besoin il satisfait, comment il est catégorisé, quel bénéfice il délivre et comment il se différencie des alternatives. À utiliser pour aligner les parties prenantes sur la stratégie produit et guider le messaging.

---

## Framework Geoffrey Moore

### Proposition de valeur

```
Pour [client cible spécifique]
qui a besoin de [besoin non satisfait]
[nom du produit]
est un [catégorie de produit]
qui [bénéfice — centré sur les résultats, pas les features]
```

### Énoncé de différenciation

```
Contrairement à [concurrent principal ou alternative]
[nom du produit]
fournit [différenciation unique — résultats, pas features]
```

---

## Pourquoi cette structure fonctionne

- **Force la spécificité** : Impossible de dire "pour tout le monde" ou "contrairement à tous les concurrents"
- **Expose les hypothèses** : Si on ne peut pas remplir "contrairement à X", on n'a peut-être pas de différenciation défendable
- **Focus sur les résultats** : "Qui réduit le churn de 40%" bat "qui a des analytics"
- **La catégorie ancre la perception** : Dire "est un CRM" vs. "est un outil de workflow" change la façon dont les acheteurs évaluent le produit

---

## Application

### Étape 1 : Rassembler le contexte

Avant de rédiger, s'assurer d'avoir :
- **Segment client cible** : Comportements, rôles, contexte — pas juste "PME" ou "développeurs"
- **Besoin non satisfait** : Douleurs, gains, JTBD (référencer `jobs-to-be-done`)
- **Catégorie de produit** : Comment les acheteurs classent mentalement la solution
- **Paysage concurrentiel** : Concurrents directs ET comportements de substitution (souvent Excel est le vrai concurrent)

**Si le contexte manque :** Utiliser des interviews de discovery ou de la recherche marché.

### Étape 2 : Rédiger la proposition de valeur

```markdown
## Proposition de valeur

**Pour** [client/persona cible spécifique]
- **qui a besoin de** [énoncé du besoin non satisfait — douleurs, gains, JTBD]
- [nom ou description du produit]
- **est un** [catégorie de produit]
- **qui** [bénéfice — résultats, pas features]
```

**Vérifications qualité :**
- **Spécificité du cible** : Pourrait-on décrire cette personne à un recruteur ? Sinon, affiner.
- **Clarté du besoin** : Ce besoin résonne-t-il émotionnellement, ou est-il générique ("besoin d'efficacité") ?
- **Pertinence de la catégorie** : Cette catégorie aide-t-elle ou nuit-elle ? (Créer une nouvelle catégorie est stratégique mais risqué)
- **Focus sur les résultats** : Dit-on ce que l'utilisateur *obtient*, pas ce que le produit *a* ?

### Étape 3 : Rédiger l'énoncé de différenciation

```markdown
## Énoncé de différenciation

- **Contrairement à** [concurrent principal ou alternative de substitution]
- [nom du produit]
- **fournit** [différenciation unique — résultats, pas features]
```

**Vérifications qualité :**
- **Honnêteté sur le concurrent** : Est-ce la *vraie* alternative que les acheteurs considèrent ?
- **Substance de la différenciation** : Un concurrent pourrait-il copier ça en 6 mois ? Si oui, ce n'est pas une différenciation durable.
- **Cadrage résultat** : Dit-on ce que les utilisateurs *atteignent* différemment, pas juste ce qu'on *fait* différemment ?

### Étape 4 : Stress-tester le positionnement

1. **Un client se reconnaîtrait-il ?** Lire le "Pour [cible]" à voix haute. Semble-t-il spécifique ou générique ?
2. **Le besoin est-il défendable ?** Des données, interviews ou recherches valident-ils ce besoin ?
3. **La catégorie aide-t-elle ou nuit-elle ?** Ancre-t-elle contre les bons concurrents ?
4. **La différenciation est-elle crédible ?** Peut-on la prouver avec une démo, un cas client ou des données ?
5. **Ce positionnement guide-t-il les décisions ?** Si quelqu'un demande "Doit-on construire la feature X ?", aide-t-il à répondre ?

### Étape 5 : Socialiser et itérer

- Partager avec les parties prenantes (fondateurs, execs, produit, marketing, sales)
- Tester avec des clients : le lire à voix haute. Acquiescent-ils ou semblent-ils perdus ?
- Affiner sans relâche : le positionnement n'est jamais fini au premier jet

---

## Exemple — HubSpot Auditor

```markdown
## Proposition de valeur

**Pour** les RevOps Managers et admins HubSpot de scale-ups en croissance
- **qui ont besoin de** maintenir la qualité et la fiabilité de leurs données CRM sans y passer des heures chaque semaine
- **HubSpot Auditor**
- **est un** outil d'audit et de gouvernance CRM
- **qui** analyse automatiquement leur workspace HubSpot et leur fournit un rapport d'audit actionnable avec des recommandations priorisées par criticité

## Énoncé de différenciation

- **Contrairement aux** audits manuels dans des tableurs ou aux consultants RevOps ponctuels
- **HubSpot Auditor**
- **fournit** une analyse continue et automatisée qui identifie les problèmes de gouvernance en quelques secondes, avec des recommandations concrètes — sans jamais modifier les données du workspace
```

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| "Pour tout le monde" | "Pour les entreprises qui veulent grandir" | Choisir le premier segment qu'on servira, s'étendre ensuite |
| Liste de features dans le bénéfice | "Qui fournit IA, automation, analytics et intégrations" | Se concentrer sur le résultat : "Qui réduit le churn de 30% grâce à l'analytique prédictive" |
| Concurrent imaginaire | "Contrairement aux systèmes legacy dépassés" | Nommer le vrai concurrent ou la vraie alternative de substitution |
| Différenciation sans preuve | "Qui révolutionne la productivité" | Rendre falsifiable : "40% plus rapide que [concurrent] sur [cas d'usage]" |
| Confusion de catégorie | "Est une plateforme next-gen de transformation digitale" | Choisir une catégorie que les acheteurs comprennent déjà |
