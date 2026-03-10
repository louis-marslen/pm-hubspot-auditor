---
name: proto-persona
description: Créer un proto-persona à partir de la recherche actuelle, des signaux marché et des connaissances de l'équipe. À utiliser quand on a besoin d'un profil client de travail avant une validation approfondie.
type: component
source: adapté de deanpeters/Product-Manager-Skills — proto-persona
---

## Objectif

Créer un profil de persona initial basé sur des hypothèses qui synthétise la recherche utilisateur disponible, les données marché et les connaissances des parties prenantes en une hypothèse de travail sur l'utilisateur cible. L'objectif est d'aligner les équipes tôt dans le développement produit et d'identifier les lacunes dans la compréhension.

Un proto-persona est une hypothèse, pas une vérité — il évolue au fil des apprentissages.

---

## Proto-persona vs. Persona validé

| Proto-Persona | Persona validé |
|---|---|
| Créé en quelques heures/jours | Créé sur plusieurs semaines/mois |
| Basé sur hypothèses + recherche limitée | Basé sur recherche utilisateur approfondie |
| Utilisé pour aligner les équipes tôt | Utilisé pour guider le design détaillé |
| Évolue rapidement | Stable dans le temps |
| Suffisant pour démarrer | Haute confiance |

---

## Template

### Nom
Donner un **nom allitératif et mémorable** (facilite les références en équipe).

```markdown
### Nom
- [Prénom mémorable, ex. "Mathieu Manager", "Sandra Sales Ops", "Alexis Admin"]
```

### Bio & démographie

```markdown
### Bio & démographie
- [Tranche d'âge]
- [Localisation géographique]
- [Situation personnelle]
- [Présence en ligne et réseaux]
- [Activités hors travail]
- [Poste, secteur, niveau de séniorité]
```

**Vérifications qualité :**
- **Comportemental, pas juste démographique** : Ne pas s'arrêter à "35-40 ans, basé à Paris" — ajouter "Travaille en remote, actif sur LinkedIn, jongle avec 3 outils CRM différents"
- **Pertinent pour le produit** : N'inclure que les données démographiques qui influencent les décisions produit

### Verbatims
*Utiliser de vrais verbatims ou des verbatims représentatifs révélant comment le persona pense et parle.*

```markdown
### Verbatims
- "[Verbatim 1 révélant ce qu'il dit, ressent ou pense]"
- "[Verbatim 2 révélant ses frustrations ou motivations]"
- "[Verbatim 3 révélant ses attitudes ou croyances]"
```

**Vérifications qualité :**
- **Authentiques** : Utiliser de vrais verbatims d'interviews si disponibles
- **Révélateurs** : Exposent l'état d'esprit, pas juste des faits

### Douleurs
*Référencer le skill `jobs-to-be-done` pour la structure.*

```markdown
### Douleurs
- [Point de douleur 1 lié à l'espace problème]
- [Point de douleur 2]
- [Point de douleur 3]
```

### Ce que ce persona essaie d'accomplir

```markdown
### Ce que ce persona essaie d'accomplir
- [Comportement ou résultat 1]
- [Comportement ou résultat 2]
- [Comportement ou résultat 3]
```

### Objectifs

```markdown
### Objectifs
- [Objectif 1 : besoin, envie ou aspiration]
- [Objectif 2]
- [Objectif 3]
```

### Attitudes & influences

```markdown
### Attitudes & influences

- **Autorité de décision :** [Oui/Non + contexte (ex. "Budget autonome jusqu'à 10K€, validation direction au-delà")]
- **Influenceurs de décision :** [Qui influence ce persona ? (ex. "Son manager, ses pairs sur LinkedIn, les articles du blog HubSpot")]
- **Croyances & attitudes :** [Croyances qui impactent ses décisions (ex. "Sceptique vis-à-vis des outils qui nécessitent un développeur", "Valorise les décisions basées sur les données")]
```

---

## Étapes

### Étape 1 : Rassembler le contexte disponible
- Recherche utilisateur : notes d'interviews, enquêtes, tickets support
- Analytics : données d'usage, démographie, patterns comportementaux
- Données marché : rapports sectoriels, bases utilisateurs des concurrents
- Insights parties prenantes : équipes Sales/Support/CS qui interagissent avec les clients

### Étape 2 : Remplir le template
Documenter ce qu'on sait, et tagger les hypothèses : `[HYPOTHÈSE — À VALIDER]`

### Étape 3 : Valider et itérer
- Partager avec l'équipe : reconnaît-elle ce persona ?
- Identifier les lacunes : quelles zones sont des hypothèses ?
- Planifier la recherche : utiliser le proto-persona pour guider les prochaines interviews
- Faire évoluer : mettre à jour au fil des apprentissages

---

## Exemples — contexte HubSpot Auditor

```markdown
### Persona 1 : "Maxime Manager RevOps"

**Bio & démographie :**
- 32-42 ans, Île-de-France ou télétravail
- RevOps Manager dans une scale-up (50 à 500 personnes)
- Admin HubSpot depuis 2-3 ans, autodidacte
- Actif sur LinkedIn, dans les communautés Ops

**Verbatims :**
- "Je passe plus de temps à nettoyer des données qu'à les analyser."
- "J'ai hérité d'un HubSpot que personne ne comprend vraiment."
- "Avant chaque COMEX, je vérifie manuellement les chiffres parce que je ne leur fais pas confiance."

**Douleurs :**
- Impossible de savoir quelles propriétés custom sont vraiment utilisées
- Les workflows en erreur passent inaperçus pendant des semaines
- Pas de rapport d'état du workspace pour justifier un nettoyage

**Objectifs :**
- Avoir un CRM de confiance pour des décisions data-driven
- Réduire le temps consacré à la maintenance manuelle
- Être perçu comme un garant de la qualité des données par le CODIR

**Autorité de décision :** Recommande l'outil, le CMO ou CRO valide le budget
**Influenceurs :** Communauté RevOps, blog HubSpot, pairs LinkedIn, Capterra
```

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Démographie sans comportement | "28 ans, basé à Lyon" | Ajouter le contexte comportemental |
| Traiter le proto-persona comme une vérité | "Ce persona ne ferait jamais ça" | Tagger comme hypothèse, planifier des interviews |
| Créer 10 proto-personas | Analyse paralysante | Commencer par 1 à 2 (primaire + secondaire) |
| Verbatims fabriqués | Verbatims qui ressemblent à du marketing | Utiliser de vrais verbatims ou marquer `[PLACEHOLDER — RECHERCHE NÉCESSAIRE]` |
| Jamais validé | Proto-persona créé il y a 6 mois, jamais mis à jour | Planifier des sprints de recherche pour valider les hypothèses clés |
