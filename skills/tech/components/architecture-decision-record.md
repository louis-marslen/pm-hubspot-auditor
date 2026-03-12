---
name: architecture-decision-record
description: Documenter une décision technique structurante sous forme d'ADR (Architecture Decision Record)
type: component
---

# Architecture Decision Record (ADR)

## Objectif

Capturer une décision technique importante, son contexte, les options considérées et les compromis acceptés. Un ADR rend les décisions architecturales traçables, réversibles en connaissance de cause, et compréhensibles par tous.

## Format

```markdown
# ADR-[numéro] — [Titre de la décision]

**Date** : YYYY-MM-DD
**Statut** : Proposé | Accepté | Déprécié | Remplacé par ADR-XX
**Décideurs** : [noms ou rôles]

## Contexte

[Quel problème ou besoin pousse à prendre cette décision ? Quelle contrainte, quelle opportunité ?]

## Options considérées

### Option A — [Nom]
**Description** : ...
**Avantages** : ...
**Inconvénients** : ...

### Option B — [Nom]
**Description** : ...
**Avantages** : ...
**Inconvénients** : ...

### Option C — [Nom] *(si pertinent)*
...

## Décision

**Choix retenu : Option [X] — [Nom]**

[Justification : pourquoi cette option face aux autres ?]

## Conséquences

**Positives** :
- ...

**Négatives / risques acceptés** :
- ...

**Actions requises** :
- [ ] ...
```

## Pourquoi cette structure fonctionne

| Élément | Valeur |
|---|---|
| Contexte explicite | Évite les "pourquoi on a fait ça ?" six mois plus tard |
| Options multiples | Prouve que la décision n'est pas arbitraire |
| Conséquences | Force à anticiper les compromis avant d'écrire du code |
| Statut | Permet de marquer une décision comme dépassée sans la supprimer |

## Application

**Étape 1 — Identifier la décision à documenter**
- S'agit-il d'un choix difficile à revenir en arrière ?
- Plusieurs membres de l'équipe seraient-ils en désaccord ?
- L'option rejetée semblait-elle raisonnable ?
→ Si oui à l'une de ces questions : écrire un ADR.

**Étape 2 — Rédiger le contexte sans solution**
Décrire le problème et les contraintes sans mentionner la solution retenue.

**Étape 3 — Lister les options honnêtement**
Donner un vrai avantage et un vrai inconvénient à chaque option, même à celle rejetée.

**Étape 4 — Énoncer la décision clairement**
Une phrase, pas de conditionnel. "Nous utilisons X" pas "Nous pensons utiliser X".

**Étape 5 — Anticiper les conséquences**
Qu'est-ce que cette décision empêche de faire plus tard ? Qu'est-ce qu'elle facilite ?

## Exemple complet

```markdown
# ADR-001 — Utiliser Resend pour l'envoi d'emails transactionnels

**Date** : 2026-01-15
**Statut** : Accepté
**Décideurs** : Louis (fondateur)

## Contexte

Le produit doit envoyer des emails transactionnels (confirmation d'inscription,
lien de connexion, notification d'audit terminé). Nous avons besoin d'un service
fiable, avec une bonne deliverability et une intégration simple depuis Node.js.

## Options considérées

### Option A — Resend
**Description** : Service email moderne, API-first, SDK Node.js officiel
**Avantages** : DX excellente, plan gratuit (3000 emails/mois), React Email compatible
**Inconvénients** : Nouveau service (moins mature), moins de fonctionnalités marketing

### Option B — SendGrid
**Description** : Service email établi (Twilio), très complet
**Avantages** : Mature, très documenté, analytics avancés
**Inconvénients** : API plus complexe, onboarding plus long, prix plus élevé à scale

### Option C — SMTP direct (ex: AWS SES)
**Description** : Configuration SMTP low-level
**Avantages** : Contrôle total, coût minimal à volume
**Inconvénients** : Complexité de configuration, gestion de la deliverability manuelle

## Décision

**Choix retenu : Option A — Resend**

Plan gratuit suffisant pour le MVP, DX adaptée à un développeur solo, intégration
native avec Next.js. La maturité moindre est un risque acceptable en early stage.

## Conséquences

**Positives** :
- Intégration en < 1h avec le SDK officiel
- Templates email en React (cohérent avec le frontend)
- 0€ jusqu'à 3000 emails/mois

**Négatives / risques acceptés** :
- Migration nécessaire si besoin d'analytics email avancés
- Dépendance à un service jeune

**Actions requises** :
- [ ] Créer le compte Resend et configurer le domaine expéditeur
- [ ] Ajouter RESEND_API_KEY en variable d'environnement
```

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| ADR trop tardif | "On a déjà codé, on documente maintenant" | Écrire l'ADR AVANT l'implémentation |
| Options de façade | Une seule vraie option, les autres sont là pour la forme | Rendre chaque option honnêtement défendable |
| Décision vague | "On va probablement utiliser X" | Formuler au présent, assumer la décision |
| Pas de conséquences | Section vide ou générique | Citer au moins une contrainte réelle induite |

## Skills liés

- `technical-design-doc` — pour la spec d'implémentation qui suit la décision
- `tech-stack-advisor` (interactif) — pour structurer la comparaison avant d'écrire l'ADR
