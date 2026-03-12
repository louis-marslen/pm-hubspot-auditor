---
name: preparation-interviews-decouverte
description: Planifier des interviews de découverte client avec les bons objectifs, segments, contraintes et méthodes. À utiliser pour préparer des interviews de validation du problème, de recherche sur le churn ou de nouvelles idées produit.
type: interactive
source: adapté de deanpeters/Product-Manager-Skills — discovery-interview-prep
---

## Objectif

Guider le PM à travers la préparation des interviews de découverte client en posant des questions adaptatives sur les objectifs de recherche, les segments clients, les contraintes et les méthodologies. L'objectif est de concevoir des plans d'interview efficaces, de formuler des questions ciblées, d'éviter les biais courants et de maximiser l'apprentissage — en s'assurant que les interviews yielden des insights actionnables plutôt que de la confirmation de biais.

Ce n'est pas un générateur de scripts — c'est un processus de préparation stratégique qui produit un plan d'interview adapté.

---

## Étape 0 : Rassembler le contexte

Avant de commencer, recueillir :

**Pour son propre produit :**
- Description du problème hypothèse ou du concept produit
- Segment client cible (si connu)
- Recherche existante (tickets support, données de churn, feedbacks)
- Hypothèses clés à valider

**Pour explorer un espace problème :**
- Plaintes clients, tickets support, raisons de churn
- Hypothèses sur pourquoi les clients partent ou ont du mal
- Alternatives concurrentes vers lesquelles les clients se tournent

---

## Process interactif

### Question 1 : Objectif de recherche

**"Quel est l'objectif principal de ces interviews ? (Qu'avez-vous besoin d'apprendre ?)"**

1. **Validation du problème** — Confirmer qu'un problème existe et est suffisamment douloureux pour valoir la peine d'être résolu (pour les nouvelles idées produit)
2. **Discovery Jobs-to-be-Done** — Comprendre ce que les clients cherchent à accomplir et pourquoi les solutions actuelles échouent (pour la stratégie produit)
3. **Investigation rétention/churn** — Comprendre pourquoi les clients partent ou ne s'activent pas (pour les produits existants avec des problèmes de rétention)
4. **Priorisation de features** — Valider quels problèmes/features comptent le plus pour les clients (pour la planification de roadmap)

---

### Question 2 : Segment client cible

**"Qui allez-vous interviewer ?"**

Options adaptées selon l'objectif (Q1) :

*Si validation du problème :*
1. **Personnes qui vivent le problème régulièrement** — Haute fréquence de douleur
2. **Personnes qui ont essayé de le résoudre** — Comprendre pourquoi les solutions alternatives échouent
3. **Personnes dans le segment cible (peu importe la conscience du problème)** — Découvrir des besoins latents
4. **Personnes ayant récemment vécu le problème** — Mémoire fraîche

---

### Question 3 : Contraintes

**"Quelles contraintes avez-vous pour ces interviews ?"**

1. **Accès limité** — Seulement 5 à 10 clients, résultats en 2 semaines
2. **Base clients existante** — 100+ clients actifs, recrutement facile
3. **Prospection à froid requise** — Pas de clients existants, recrutement via LinkedIn, Reddit, communautés
4. **Parties prenantes internes uniquement** — Interviews des équipes Sales/Support qui parlent aux clients quotidiennement (recherche proxy, moins idéale mais pragmatique)

---

### Question 4 : Méthodologie

Recommandations selon le contexte (Q1 + Q2 + Q3) :

1. **Interviews de validation (style Mom Test)** — Demander des comportements passés, pas des hypothèses. Focus : "Raconte-moi la dernière fois où tu as [vécu le problème]. Qu'as-tu essayé ? Que s'est-il passé ?" — Idéal pour valider si le problème est réel et douloureux

2. **Interviews Jobs-to-be-Done** — Focus sur ce que les clients essaient d'accomplir. Demander : "Qu'est-ce que tu essayais de faire ? Quelles alternatives as-tu considérées ? Qu'est-ce qui t'a amené à choisir X ?" — Idéal pour comprendre les motivations et le comportement de switch

3. **Interviews de switch** — Interviewer des clients qui ont récemment changé de concurrent ou d'alternative. "Qu'est-ce qui t'a poussé à chercher une nouvelle solution ? Qu'est-ce qui t'a repoussé de l'ancien outil ? Qu'est-ce qui t'a attiré vers le nouveau ?" — Idéal pour le positionnement concurrentiel

4. **Interviews de parcours (timeline)** — Parcourir toute leur expérience chronologiquement. "Guide-moi à travers la première fois que tu as rencontré ce problème. Que s'est-il passé ensuite ?" — Idéal pour découvrir le contexte complet et les points de douleur

---

### Output : Plan d'interview

```markdown
# Plan d'interview de découverte

**Objectif de recherche :** [Q1]
**Segment cible :** [Q2]
**Contraintes :** [Q3]
**Méthodologie :** [Q4]

---

## Guide d'interview

### Ouverture (5 min)
- **Créer le rapport :** "Merci de prendre le temps. Je suis [nom] et je recherche [espace problème]. Ce n'est pas un appel commercial — je suis ici pour apprendre de votre expérience."
- **Définir les attentes :** "Je vais vous poser des questions sur vos expériences. Il n'y a pas de bonnes ou mauvaises réponses. Les retours critiques sont les plus utiles."
- **Obtenir le consentement :** "Est-ce que je peux prendre des notes / enregistrer cette conversation ?"

---

### Questions principales (30 à 40 min)

#### [Nom de la méthodologie] :

1. **[Question 1]**
   - Suivi : [Pour approfondir...]
   - Éviter : [Ne pas demander la version directive comme...]

2. **[Question 2]**
   - Suivi : [...]
   - Éviter : [...]

[Exemple pour validation Mom Test :]

1. **"Raconte-moi la dernière fois que tu as [vécu ce problème]."** — Obtient des comportements spécifiques et récents (pas hypothétiques)
   - Suivi : "Qu'est-ce que tu essayais d'accomplir ? Qu'est-ce qui l'a rendu difficile ? Qu'as-tu essayé ?"
   - Éviter : "Utiliseriez-vous un outil qui résout ça ?" (directif, hypothétique)

2. **"Comment gérez-vous actuellement [ce problème] ?"** — Révèle les workarounds, alternatives, intensité de la douleur
   - Suivi : "Combien de temps/d'argent ça prend ? Qu'est-ce qui vous frustre ?"
   - Éviter : "N'est-ce pas inefficace ?" (directif)

3. **"Pouvez-vous me guider étape par étape dans ce que vous avez fait ?"** — Découvre les détails, cas limites, contexte
   - Suivi : "Que s'est-il passé ensuite ? Où vous êtes-vous bloqué ?"
   - Éviter : "C'était difficile ?" (question fermée)

4. **"Avez-vous essayé d'autres solutions pour ça ?"** — Révèle le paysage concurrentiel, besoins non satisfaits
   - Suivi : "Qu'avez-vous aimé/pas aimé ? Pourquoi vous avez arrêté ?"
   - Éviter : "Paieriez-vous pour une meilleure solution ?" (hypothétique)

---

### Clôture (5 min)
- **Résumer :** "Pour récapituler, j'ai compris que [insights clés]. Ai-je bien compris ?"
- **Demander des recommandations :** "Connaissez-vous quelqu'un d'autre qui vit ce problème ?"
- **Remercier :** "C'était incroyablement utile. Je vous remercie vraiment de votre temps."

---

## Biais à éviter

1. **Biais de confirmation** : Ne pas demander "N'est-ce pas que X est un problème ?" → Demander "Raconte-moi ton expérience avec X."
2. **Questions directives** : Ne pas demander "Utiliseriez-vous ça ?" → Demander "Qu'avez-vous essayé ? Pourquoi ça a marché/échoué ?"
3. **Questions hypothétiques** : Ne pas demander "Si on construisait Y, paieriez-vous ?" → Demander "Pour quoi payez-vous actuellement ? Pourquoi ?"
4. **Vente déguisée en recherche** : Ne pas dire "On construit Z pour résoudre X" → Dire "Je recherche X. Parle-moi de ton expérience."
5. **Questions fermées** : Ne pas demander "Est-ce que [X] est difficile ?" → Demander "Décris-moi ton processus de [X]."

---

## Critères de succès

Vous saurez que ces interviews sont réussies si :

✅ **Vous entendez des histoires spécifiques, pas des plaintes génériques** — "Mardi dernier, j'ai passé 3 heures à..." vs. "Les audits sont ennuyeux"
✅ **Vous découvrez des comportements passés, pas des souhaits hypothétiques** — "J'ai essayé de faire ça avec Excel mais j'ai abandonné après 2 semaines" vs. "J'utiliserais probablement un outil automatisé"
✅ **Vous identifiez des patterns sur 3+ interviews** — Mêmes points de douleur émergent indépendamment
✅ **Vous êtes surpris par quelque chose** — Si tout confirme vos hypothèses, vous posez des questions directives
✅ **Vous pouvez citer les clients verbatim** — Le langage réel = insights authentiques

---

## Logistique

**Recrutement :**
- [Basé sur les contraintes Q3, suggérer les canaux de recrutement]
- Contacter 20 à 30 personnes pour obtenir 5 à 10 interviews (33% de taux de réponse typique)

**Planification :**
- 45 à 60 min par interview (30 à 40 min de conversation + tampon)
- Enregistrer si possible (avec consentement), ou prendre des notes détaillées
- Maximum 2 à 3 par jour (temps nécessaire pour la synthèse)

**Synthèse :**
- Après chaque interview, écrire les insights clés immédiatement
- Après 5 interviews, chercher les patterns (douleurs communes, jobs, workarounds)
- Utiliser le skill `enonce-probleme` pour cadrer les insights
```

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Demander ce que les clients veulent | "Quelles features voulez-vous qu'on construise ?" | Demander des comportements passés : "Raconte-moi la dernière fois que tu as eu du mal avec X." |
| Vendre plutôt qu'écouter | 20 min à expliquer son idée produit | Ne pas mentionner la solution jusqu'aux 5 dernières minutes (si jamais) |
| Interviewer les mauvaises personnes | Amis, famille, ou personnes ne vivant pas le problème | Interviewer des personnes qui vivent le problème régulièrement et récemment |
| S'arrêter à 1 ou 2 interviews | "On a parlé à 2 personnes, elles ont aimé, construisons !" | Minimum 5 à 10 interviews. Chercher des patterns, pas des feedbacks isolés |
| Ne pas noter les insights | S'appuyer sur la mémoire après les interviews | Enregistrer ou prendre des notes détaillées. Synthétiser immédiatement après chaque interview |
