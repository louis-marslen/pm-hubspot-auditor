---
name: arbre-opportunites-solutions
description: Construire un Opportunity Solution Tree — des résultats aux opportunités, solutions et tests. À utiliser quand une demande de partie prenante nécessite un cadrage du problème avant de décider quoi construire.
type: interactive
source: adapté de deanpeters/Product-Manager-Skills — opportunity-solution-tree
---

## Objectif

Guider le PM à travers la création d'un Opportunity Solution Tree (OST) en extrayant les résultats cibles des demandes des parties prenantes, en générant des options d'opportunités (problèmes à résoudre), en mappant les solutions potentielles et en sélectionnant le meilleur proof-of-concept (POC) selon la faisabilité, l'impact et le fit marché.

---

## Qu'est-ce qu'un Opportunity Solution Tree ?

Un OST (Teresa Torres, *Continuous Discovery Habits*) connecte :
1. **Résultat souhaité** (objectif business ou métrique produit)
2. **Opportunités** (problèmes, besoins, points de douleur ou désirs clients qui pourraient conduire au résultat)
3. **Solutions** (façons d'adresser chaque opportunité)
4. **Expériences** (tests pour valider les solutions)

```
         Résultat souhaité (1)
                |
    +-----------+-----------+
    |           |           |
Opportunité  Opportunité  Opportunité (3)
    |           |           |
  +-+-+       +-+-+       +-+-+
  | | |       | | |       | | |
 S1 S2 S3    S1 S2 S3    S1 S2 S3 (9 solutions)
```

---

## Processus en 2 phases

### Phase 1 : Générer l'OST

#### Question 1 : Extraire le résultat souhaité

**"Quel est le résultat souhaité pour cette initiative ? (Quelle métrique business ou produit cherche-t-on à faire bouger ?)"**

Options :
1. **Croissance du revenu** — Augmenter l'ARR, étendre le revenu des clients existants, nouvelles sources de revenu
2. **Rétention client** — Réduire le churn, augmenter l'activation, améliorer l'engagement
3. **Acquisition client** — Augmenter les inscriptions, les conversions essai → payant, la croissance de nouveaux utilisateurs
4. **Efficacité produit** — Réduire les coûts de support, diminuer le time-to-value, améliorer les métriques opérationnelles

**Ou décrire un résultat spécifique et mesurable (ex. "Augmenter le taux de conversion essai → payant de 15% à 25%").**

---

#### Question 2 : Identifier les opportunités (problèmes à résoudre)

Générer 3 opportunités basées sur le résultat souhaité et le contexte.

**Format de chaque opportunité :**
```markdown
### Opportunité [N] : [Nom descriptif]
**Problème :** [Description du problème/besoin client]
**Preuves :** [Données, verbatims, analytics disponibles]
```

**Règle critique :** Les opportunités sont des **problèmes clients**, pas des solutions déguisées.
- ❌ "Opportunité : On a besoin d'une application mobile"
- ✅ "Opportunité : Les utilisateurs mobiles ne peuvent pas compléter les workflows en déplacement"

**Question au PM :** "Quelle opportunité vous semble la plus critique à explorer en premier ?"

---

#### Question 3 : Générer des solutions pour l'opportunité sélectionnée

Pour l'opportunité choisie, générer 3 solutions potentielles.

**Format de chaque solution :**
```markdown
### Solution [N] : [Nom descriptif]
**Description :** [Comment cette solution adresse l'opportunité]
**Hypothèse :** "Si on [implémente la solution], alors [métrique] s'améliorera de [X à Y] parce que [raisonnement]."
**Expérience :** [Comment tester cette hypothèse]
```

**Question au PM :** "Voulez-vous explorer des solutions pour une autre opportunité, ou passer à la sélection du POC ?"

---

### Phase 2 : Sélectionner le POC

#### Question 4 : Évaluer les solutions

Évaluer chaque solution selon 3 critères :

| Solution | Faisabilité (1-5) | Impact (1-5) | Fit marché (1-5) | Score total | Justification |
|---|---|---|---|---|---|
| Solution 1 | | | | | |
| Solution 2 | | | | | |
| Solution 3 | | | | | |

**Critères de scoring :**
- **Faisabilité :** 1 = plusieurs mois de travail, 5 = quelques jours/semaines
- **Impact :** 1 = déplacement minimal de la métrique, 5 = déplacement majeur
- **Fit marché :** 1 = les clients s'en fichent, 5 = les clients le demandent activement

---

#### Question 5 : Définir l'expérience

**"Comment allez-vous tester cette solution ? Quelle est l'expérience ?"**

1. **A/B test** — Construire un MVP, montrer à 50% des utilisateurs, comparer la conversion vs. le groupe de contrôle
2. **Prototype + test utilisabilité** — Créer un prototype cliquable, observer 10 utilisateurs, recueillir des feedbacks qualitatifs
3. **Test concierge manuel** — Exécuter la solution manuellement avec 20 utilisateurs, mesurer les résultats

---

### Output : OST + Plan de POC

```markdown
# Opportunity Solution Tree + Plan de POC

## Résultat souhaité
**Résultat :** [Résultat de la Question 1]
**Métrique cible :** [Objectif spécifique et mesurable]
**Pourquoi c'est important :** [Justification]

---

## Carte des opportunités

### Opportunité 1 : [Nom]
**Problème :** [Description]
**Preuves :** [Données disponibles]
**Solutions :** [Solution 1, 2, 3]

### Opportunité 2 : [Nom]
[...]

### Opportunité 3 : [Nom]
[...]

---

## POC sélectionné

**Opportunité :** [Opportunité sélectionnée]
**Solution :** [Solution sélectionnée]

**Hypothèse :**
"Si on [implémente la solution], alors [métrique] s'améliorera de [X] à [Y] parce que [raisonnement]."

**Expérience :**
- Type : [A/B test / Prototype / Concierge]
- Participants : [Nombre, segment]
- Durée : [Timeline]
- Critères de succès : [Ce qui valide l'hypothèse]

**Scores :** Faisabilité [X]/5 | Impact [Y]/5 | Fit marché [Z]/5 | **Total : [T]/15**

---

## Prochaines étapes

1. [Action spécifique, ex. "Créer des wireframes pour la checklist d'onboarding"]
2. [Action spécifique, ex. "Déployer à 50% des utilisateurs en essai pendant 2 semaines"]
3. [Action spécifique, ex. "Comparer le taux d'activation : avec vs. sans"]
4. [Décision : si succès → scaler ; si échec → essayer la solution suivante]
```

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Opportunités déguisées en solutions | "Opportunité : On a besoin d'une app mobile" | Recadrer comme problème client : "Les utilisateurs mobiles ne peuvent pas compléter leurs workflows en déplacement" |
| Sauter la divergence (1 seule solution) | "On sait que la solution est X, construisons-la" | Générer au minimum 3 solutions par opportunité — forcer la divergence avant la convergence |
| Résultat trop vague | "Résultat souhaité : Améliorer l'expérience utilisateur" | Rendre mesurable : "Augmenter le NPS de 30 à 50" |
| Pas d'expériences (construire directement) | Choisir une solution et aller directement à la roadmap | Chaque solution doit mapper à une expérience |
| Paralysie analytique | Générer 20 opportunités, 50 solutions, ne jamais choisir | Limiter à 3 opportunités, 3 solutions chacune (9 total). Choisir un POC, expérimenter, apprendre, itérer |
