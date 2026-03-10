---
name: enonce-probleme
description: Rédiger un problem statement centré utilisateur — qui est bloqué, ce qu'il essaie de faire, pourquoi c'est important, ce que ça lui fait ressentir. À utiliser pour cadrer la discovery, la priorisation ou un PRD.
type: component
source: adapté de deanpeters/Product-Manager-Skills — problem-statement
---

## Objectif

Articuler un problème du point de vue de l'utilisateur en utilisant un framework empathique qui capture qui il est, ce qu'il essaie de faire, ce qui le bloque, pourquoi, et ce que ça lui fait ressentir. L'objectif est d'aligner les parties prenantes sur le problème avant de passer aux solutions.

---

## Framework de cadrage du problème

### Narrative de cadrage

```markdown
## Narrative du problème

**Je suis :** [Décrire le persona clé, 3-4 caractéristiques principales]
- [Caractéristique / point de douleur 1]
- [Caractéristique / point de douleur 2]
- [Caractéristique / point de douleur 3]

**J'essaie de :**
- [Une phrase décrivant les résultats que le persona cherche à atteindre]

**Mais :**
- [Décrire les obstacles qui empêchent d'atteindre ces résultats]
- [Obstruction 1]
- [Obstruction 2]
- [Obstruction 3]

**Parce que :**
- [Décrire la cause racine de manière empathique]

**Ce qui me fait ressentir :**
- [Décrire les émotions du point de vue du persona]
```

### Contexte & contraintes

```markdown
## Contexte & contraintes

- [Facteurs géographiques, technologiques, temporels ou démographiques]
- Ex. : "Doit fonctionner hors ligne dans des zones à connectivité limitée"
- Ex. : "Utilisé par des non-techniciens peu familiers avec les logiciels complexes"
```

### Énoncé final du problème

```markdown
## Énoncé final du problème

[Une seule phrase concise qui résume le problème de façon puissante et empathique]
```

**Formule :** `[Persona] a besoin d'un moyen de [résultat souhaité] parce que [cause racine], ce qui actuellement [impact émotionnel/pratique].`

---

## Pourquoi cette structure fonctionne

- **Centrée persona** : force à voir le problème à travers les yeux de l'utilisateur
- **Orientée résultat** : "J'essaie de" met l'accent sur les résultats désirés, pas les tâches
- **Analyse de cause racine** : "Parce que" pousse au-delà des symptômes vers les problèmes sous-jacents
- **Validation émotionnelle** : "Ce qui me fait ressentir" humanise le problème
- **Contextuelle** : les contraintes reconnaissent les limites du monde réel

---

## Application

### Étape 1 : Rassembler le contexte utilisateur

Avant de rédiger, s'assurer d'avoir :
- **Interviews ou recherche utilisateur** : verbatims directs, comportements observés, points de douleur
- **Insights Jobs-to-be-Done** : ce que les utilisateurs "recrutent" le produit pour faire (référencer `jobs-to-be-done`)
- **Clarté sur le persona** : qui spécifiquement vit ce problème (référencer `proto-persona`)

**Si le contexte manque** : Conduire des interviews de discovery. Ne pas inventer des problèmes.

### Étape 2 : Rédiger la narrative

Remplir le template du point de vue du persona.

**Vérifications qualité :**
- **Spécificité du "Je suis"** : Peut-on visualiser cette personne, ou est-ce trop générique ("professionnels occupés") ?
- **Clarté du "J'essaie de"** : Est-ce un résultat (mesurable) ou une tâche (activité) ?
- **Profondeur du "Mais"** : Sont-ce de vrais obstacles ou juste des inconvénients ?
- **Honnêteté du "Parce que"** : Est-ce la cause racine ou juste un symptôme ?
- **Authenticité du "Ce qui me fait ressentir"** : Ces émotions viennent-elles de la recherche ou d'hypothèses ?

### Étape 3 : Rédiger l'énoncé final

Synthétiser la narrative en une phrase puissante.

**Vérifications qualité :**
- **Une seule phrase** : Si cela nécessite plusieurs phrases, le problème n'est pas encore clairement formulé
- **Mesurable** : Peut-on dire si on l'a résolu ?
- **Empathique** : Résonne-t-il émotionnellement ?
- **Partageable** : Peut-on le dire en réunion et voir les parties prenantes acquiescer ?

### Étape 4 : Valider et socialiser

- **Tester avec des utilisateurs** : Lire à voix haute à des personnes qui vivent le problème. Disent-ils "Oui, exactement !" ?
- **Partager avec les parties prenantes** : Le PM, l'engineering, le design, les execs. Aligne-t-il tout le monde ?

---

## Exemple complet

```markdown
## Narrative du problème

**Je suis :** Un RevOps Manager dans une entreprise de 200 personnes
- Responsable de la qualité des données CRM
- Gérant HubSpot sans documentation des conventions de nommage
- Incapable de faire confiance aux données pour les rapports de direction

**J'essaie de :**
- M'assurer que les données HubSpot sont fiables, cohérentes et exploitables pour les décisions commerciales

**Mais :**
- Je ne sais pas quelles propriétés sont réellement utilisées vs. celles qui ont été créées et abandonnées
- Je découvre les problèmes de données quand il est trop tard (lors d'une présentation à la direction)
- Il n'existe pas d'outil qui me donne une vue complète de la santé de mon workspace

**Parce que :**
- HubSpot ne fournit pas nativement de rapport d'audit sur l'utilisation des propriétés, les workflows en erreur ou les deals bloqués

**Ce qui me fait ressentir :**
- Anxieux à chaque réunion de direction où les données CRM sont présentées
- Frustré de passer des heures à vérifier manuellement des données qui devraient être fiables
- Dépassé par la taille et la complexité du workspace

## Énoncé final du problème

Les RevOps Managers ont besoin d'un moyen d'identifier rapidement les problèmes de qualité et de gouvernance dans leur workspace HubSpot parce qu'il n'existe pas d'outil natif pour auditer l'état du CRM, ce qui les rend anxieux face aux données et incapables de garantir la fiabilité des rapports.
```

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Solution déguisée en problème | "Le problème est qu'il n'y a pas de feature X" | Recadrer autour du résultat souhaité par l'utilisateur |
| Problème business déguisé en problème utilisateur | "Notre taux de churn est trop élevé" | Creuser pourquoi les utilisateurs partent, formuler de leur point de vue |
| Personas trop génériques | "Je suis un professionnel occupé voulant être plus productif" | Être spécifique : "Je suis un Sales Manager gérant 50 deals dans HubSpot" |
| Symptôme plutôt que cause racine | "Parce que l'interface est confuse" | Demander "Pourquoi ?" jusqu'à la cause racine |
| Émotions fabriquées | "Ce qui me fait ressentir de la joie et de la satisfaction" | Utiliser de vrais verbatims d'interviews : "frustré", "anxieux", "dépassé" |
