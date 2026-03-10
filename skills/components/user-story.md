---
name: user-story
description: Rédiger une user story au format Mike Cohn avec critères d'acceptance Gherkin. À utiliser pour transformer des besoins utilisateurs en travail prêt pour le développement.
type: component
source: adapté de deanpeters/Product-Manager-Skills — user-story
---

## Objectif

Créer des user stories claires et concises qui combinent le format Mike Cohn avec des critères d'acceptance au format Gherkin. L'objectif est de traduire les besoins utilisateurs en travail actionnable centré sur les résultats, avec des conditions de succès testables.

---

## Format

### Use Case (format Mike Cohn)

```
En tant que [persona/rôle utilisateur],
je veux [action pour atteindre un résultat],
afin de [résultat souhaité].
```

### Critères d'acceptance (format Gherkin)

```
Scénario : [Description courte du scénario]
Étant donné : [Contexte initial ou préconditions]
Et étant donné : [Préconditions supplémentaires]
Quand : [Événement déclencheur — aligné avec "je veux"]
Alors : [Résultat attendu — aligné avec "afin de"]
```

---

## Pourquoi cette structure fonctionne

- **Centrée utilisateur** : force à se concentrer sur qui bénéficie et pourquoi
- **Orientée résultat** : "afin de" met en avant la valeur délivrée, pas juste l'action
- **Testable** : les critères Gherkin sont concrets et vérifiables
- **Conversationnelle** : la story est le point de départ de la discussion, pas la spec finale

---

## Application

### Étape 1 : Rassembler le contexte

Avant de rédiger, s'assurer d'avoir :
- **Le persona** : Pour qui ? (référencer le skill `proto-persona`)
- **La compréhension du problème** : Quel besoin est adressé ? (référencer `enonce-probleme`)
- **Le résultat souhaité** : À quoi ressemble le succès ?
- **Les contraintes** : Limites techniques, de temps ou de périmètre

### Étape 2 : Rédiger le use case

```markdown
### User Story [ID] :

**Résumé :** [Titre court et mémorable centré sur la valeur]

#### Use Case :
- **En tant que** [nom du persona ou rôle]
- **je veux** [action que l'utilisateur effectue]
- **afin de** [résultat souhaité]
```

**Vérifications qualité :**
- **Spécificité du "En tant que"** : Est-ce un persona spécifique (ex. "utilisateur en essai") ou générique ("utilisateur") ?
- **Clarté du "je veux"** : Est-ce une action que l'utilisateur prend, ou une feature qu'on construit ?
- **"Afin de" orienté résultat** : Explique-t-il la motivation de l'utilisateur ? Ou se contente-t-il de reformuler l'action ?

**Erreurs courantes :**
- ❌ "En tant qu'utilisateur, je veux un bouton de connexion, afin de pouvoir me connecter" (reformulation de l'action)
- ✅ "En tant qu'utilisateur en essai, je veux me connecter avec Google, afin d'accéder à l'application sans créer un nouveau mot de passe"

### Étape 3 : Rédiger les critères d'acceptance

```markdown
#### Critères d'acceptance :

**Scénario :** [Description courte et lisible du scénario]
**Étant donné :** [Contexte initial ou précondition]
**Et étant donné :** [Contexte supplémentaire]
**Quand :** [Événement déclencheur — aligné avec "je veux"]
**Alors :** [Résultat attendu — aligné avec "afin de"]
```

**Points de vigilance :**
- **Plusieurs "Étant donné" sont OK** : Les préconditions s'accumulent
- **Un seul "Quand"** : Si on a besoin de plusieurs "Quand", on a probablement plusieurs stories — les découper
- **Un seul "Alors"** : Idem — signe de périmètre trop large

**Signaux d'alarme :**
- Plusieurs "Quand"/"Alors" → Découper la story (référencer le skill `decoupage-user-story`)
- "Alors" vague → "Alors l'expérience est améliorée" est non mesurable — rendre concret

### Étape 4 : Valider et affiner

- **Lire à haute voix à l'équipe** : Tout le monde comprend-il qui, quoi, pourquoi ?
- **Tester les critères** : La QA peut-elle écrire des cas de test à partir de ça ?
- **Vérifier s'il faut découper** : Si la story semble trop grande, utiliser `decoupage-user-story`
- **Assurer la testabilité** : Peut-on prouver que le "Alors" s'est produit ?

---

## Exemple complet

```markdown
### User Story 042 :

**Résumé :** Permettre la connexion Google pour les utilisateurs en essai et réduire les frictions à l'inscription

#### Use Case :
- **En tant que** utilisateur en essai visitant l'application pour la première fois
- **je veux** me connecter avec mon compte Google
- **afin de** pouvoir accéder à l'application sans créer et mémoriser un nouveau mot de passe

#### Critères d'acceptance :
**Scénario :** Utilisateur en essai se connecte via Google OAuth pour la première fois
**Étant donné :** Je suis sur la page de connexion
**Et étant donné :** Je dispose d'un compte Google
**Quand :** Je clique sur "Se connecter avec Google" et autorise l'application
**Alors :** Je suis connecté à l'application et redirigé vers le flux d'onboarding
```

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Tâche technique déguisée | "En tant que développeur, je veux refactorer l'API" | Reformuler autour d'un résultat utilisateur, ou utiliser un ticket technique |
| "En tant qu'utilisateur" trop générique | Toutes les stories commencent par "En tant qu'utilisateur" | Utiliser des personas spécifiques : "utilisateur en essai", "admin", "manager" |
| "Afin de" reformule "je veux" | "je veux cliquer sur sauvegarder, afin de sauvegarder" | Creuser la motivation réelle : "afin de ne pas perdre mon travail si la page plante" |
| Plusieurs "Quand"/"Alors" | Critères avec 5 "Quand" et 5 "Alors" | Découper la story — chaque paire Quand/Alors devrait être sa propre story |
| Critères non testables | "Alors l'utilisateur a une meilleure expérience" | Rendre mesurable : "Alors la page charge en moins de 2 secondes" |
