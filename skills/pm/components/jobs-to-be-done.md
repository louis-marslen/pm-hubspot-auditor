---
name: jobs-to-be-done
description: Identifier les jobs, douleurs et gains clients dans un format JTBD structuré. À utiliser pour clarifier les besoins non satisfaits, repositionner un produit ou améliorer la discovery et le messaging.
type: component
source: adapté de deanpeters/Product-Manager-Skills — jobs-to-be-done
---

## Objectif

Explorer systématiquement ce que les clients cherchent à accomplir (jobs fonctionnels, sociaux, émotionnels), les douleurs qu'ils vivent et les gains qu'ils recherchent. L'objectif est d'identifier les besoins non satisfaits, valider les idées produit et s'assurer que la solution adresse de vraies motivations — pas juste des feature requests de surface.

---

## Concepts clés

### Le framework JTBD

Inspiré de Clayton Christensen et du Value Proposition Canvas (Osterwalder) :

**1. Jobs client :**
- **Jobs fonctionnels** : Tâches que les clients doivent accomplir (ex. "envoyer une facture")
- **Jobs sociaux** : Comment les clients veulent être perçus (ex. "paraître professionnel auprès des clients")
- **Jobs émotionnels** : États émotionnels que les clients cherchent ou veulent éviter (ex. "se sentir en confiance dans son travail")

**2. Douleurs :**
- Obstacles rencontrés
- Ce qui coûte trop cher en temps, argent ou effort
- Erreurs courantes qui pourraient être évitées
- Problèmes non résolus par les solutions actuelles

**3. Gains :**
- Ce qui dépasserait les solutions actuelles
- Économies de temps, d'argent ou d'effort
- Facteurs favorisant l'adoption
- Comment la solution améliore la vie ou le travail

---

## Application

### Étape 1 : Définir le contexte

Avant d'explorer les JTBD, clarifier :
- **Segment client cible** : Qui étudie-t-on ? (référencer `proto-persona`)
- **Situation** : Dans quel contexte le job apparaît-il ?
- **Solutions actuelles** : Que utilisent-ils aujourd'hui ? (concurrents, alternatives, ne rien faire)

### Étape 2 : Explorer les jobs client

#### Jobs fonctionnels
*Demander : "Quelles tâches essayez-vous d'accomplir ?"*

```markdown
### Jobs fonctionnels :
- [Tâche 1]
- [Tâche 2]
- [Tâche 3]
```

**Vérifications qualité :**
- **Piloté par un verbe** : Les jobs sont des actions ("envoyer", "analyser", "coordonner")
- **Sans solution** : Ne pas dire "utiliser HubSpot pour communiquer" — dire "communiquer avec l'équipe commerciale"
- **Spécifique** : "Gérer les contacts" trop vague ; "Identifier les doublons dans la base de contacts" est spécifique

#### Jobs sociaux
*Demander : "Comment voulez-vous être perçu par les autres ?"*

```markdown
### Jobs sociaux :
- [Façon dont le client veut être perçu 1]
- [Façon dont le client veut être perçu 2]
```

#### Jobs émotionnels
*Demander : "Quel état émotionnel souhaitez-vous atteindre ou éviter ?"*

```markdown
### Jobs émotionnels :
- [État émotionnel recherché ou évité 1]
- [État émotionnel recherché ou évité 2]
```

### Étape 3 : Identifier les douleurs

#### Obstacles
*Demander : "Quels obstacles vous empêchent d'accomplir ce job ?"*

```markdown
### Obstacles :
- [Obstacle 1]
- [Obstacle 2]
```

#### Coûts excessifs
*Demander : "Qu'est-ce qui prend trop de temps, d'argent ou d'effort ?"*

```markdown
### Coûts excessifs :
- [Ce qui est trop coûteux 1]
- [Ce qui est trop coûteux 2]
```

#### Erreurs courantes
*Demander : "Quelles erreurs commettez-vous fréquemment qui pourraient être évitées ?"*

```markdown
### Erreurs courantes :
- [Erreur fréquente 1]
- [Erreur fréquente 2]
```

#### Problèmes non résolus
*Demander : "Quels problèmes les solutions actuelles ne résolvent-elles pas ?"*

```markdown
### Problèmes non résolus :
- [Problème non résolu 1]
- [Problème non résolu 2]
```

### Étape 4 : Identifier les gains

#### Attentes
```markdown
### Attentes (ce qui dépasserait les solutions actuelles) :
- [Attente 1]
- [Attente 2]
```

#### Économies
```markdown
### Économies (temps, argent, effort) :
- [Économie 1]
- [Économie 2]
```

#### Facteurs d'adoption
```markdown
### Facteurs d'adoption (ce qui ferait switcher) :
- [Facteur 1]
- [Facteur 2]
```

#### Amélioration de vie/travail
```markdown
### Amélioration de vie/travail :
- [Amélioration 1]
- [Amélioration 2]
```

### Étape 5 : Prioriser et valider

- **Classer les douleurs par intensité** : Quelles douleurs sont aiguës vs. légères irritations ?
- **Identifier les gains indispensables vs. appréciés** : Quels gains conduiraient à l'adoption vs. quels sont juste un bonus ?
- **Croiser avec les personas** : Différents personas ont-ils des jobs/douleurs/gains différents ?

---

## Exemple — contexte HubSpot Auditor

```markdown
### Jobs fonctionnels :
- Identifier les propriétés HubSpot inutilisées ou redondantes
- Détecter les workflows en erreur ou inactifs
- Générer un rapport d'état du CRM à partager avec la direction

### Jobs émotionnels :
- Se sentir en confiance lors des présentations basées sur les données CRM
- Éviter l'anxiété de découvrir des problèmes de données en public

### Obstacles :
- HubSpot ne fournit pas nativement de vue consolidée de la santé du workspace
- L'audit manuel prend plusieurs jours par mois

### Problèmes non résolus :
- Impossible de savoir quelles propriétés custom ne sont jamais renseignées
- Pas de visibilité sur les deals bloqués depuis plus de X jours

### Économies :
- Réduire le temps d'audit mensuel de 8 heures à 30 minutes
- Éliminer la vérification manuelle des données avant chaque réunion de direction
```

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Confondre job et solution | "J'ai besoin d'utiliser Slack" | Demander "Pourquoi ?" 5 fois jusqu'au job réel |
| Jobs trop génériques | "Être plus productif" | Spécifier : "Réduire le temps de génération des rapports de 8h à 1h" |
| Ignorer les jobs sociaux/émotionnels | Uniquement les jobs fonctionnels | Demander explicitement : "Comment vous sentiriez-vous si ce problème était résolu ?" |
| JTBD sans recherche | Remplir le template sur des hypothèses | Conduire des interviews "switch" (pourquoi ils ont changé de solution) |
| Toutes les douleurs égales | 20 douleurs sans priorisation | Classer par intensité : "Si on ne résolvait qu'une seule, laquelle aurait le plus d'impact ?" |
