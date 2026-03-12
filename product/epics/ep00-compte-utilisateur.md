# EP-00 — Gestion du compte utilisateur HubSpot Auditor

## Hypothèse

Nous croyons que proposer un compte propre sur HubSpot Auditor (email + mot de passe), découplé de HubSpot, permettra aux RevOps Managers et consultants de retrouver leurs audits passés, de gérer plusieurs workspaces HubSpot depuis un seul endroit, et de partager leurs rapports — parce que sans identité persistante, aucune valeur ne peut s'accumuler dans l'outil entre deux sessions.

Nous mesurerons le succès via : taux de complétion du parcours inscription → premier audit lancé (cible : > 60%).

---

## Périmètre

### In scope
- Inscription avec email + mot de passe
- Connexion et déconnexion au compte Auditor
- Réinitialisation du mot de passe par email
- Gestion du profil : modification de l'email et du nom d'affichage
- Connexion de workspaces HubSpot au compte (via OAuth — cf. EP-01), plusieurs workspaces possibles
- Liste des workspaces connectés avec possibilité de passer de l'un à l'autre
- Déconnexion d'un workspace HubSpot depuis le compte
- Suppression du compte Auditor avec effacement de toutes les données associées (rapports, tokens)
- Validation de l'email à l'inscription (lien de confirmation)

### Out of scope
- SSO avec Google, GitHub ou autre fournisseur d'identité (NEXT)
- Gestion des rôles au sein d'un même compte (ex. admin / viewer) (NEXT)
- Invitations d'équipe — partager un compte entre plusieurs utilisateurs (NEXT)
- Tableau de bord multi-workspace simultané (NEXT — cf. EP-04)
- Authentification à deux facteurs (2FA) (NEXT)

---

## User stories

### Story 1 — Inscription

**En tant que** RevOps Manager ou consultant
**je veux** créer un compte HubSpot Auditor avec mon email et un mot de passe
**afin de** retrouver mes audits et mes workspaces connectés à chaque visite

**Critères d'acceptance :**

*Scénario : Inscription réussie*
**Étant donné** que je suis sur la page d'inscription
**Quand** je renseigne un email valide et un mot de passe conforme aux règles
**Alors** un email de confirmation m'est envoyé
**Et** je suis redirigé vers une page me demandant de confirmer mon email avant de continuer

*Scénario : Email déjà utilisé*
**Étant donné** que j'essaie de m'inscrire avec un email déjà enregistré
**Quand** je soumets le formulaire
**Alors** je vois un message m'indiquant que cet email est déjà associé à un compte
**Et** un lien vers la page de connexion m'est proposé

*Scénario : Mot de passe non conforme*
**Étant donné** que je renseigne un mot de passe trop court ou sans caractère spécial
**Quand** je soumets le formulaire
**Alors** je vois un message précisant les règles non respectées
**Et** le formulaire n'est pas soumis

*Scénario : Confirmation de l'email*
**Étant donné** que j'ai reçu l'email de confirmation
**Quand** je clique sur le lien de confirmation
**Alors** mon compte est activé
**Et** je suis redirigé vers la page de connexion avec un message de confirmation

---

### Story 2 — Connexion et déconnexion

**En tant que** utilisateur inscrit
**je veux** me connecter à mon compte Auditor avec mon email et mon mot de passe
**afin d'** accéder à mes workspaces connectés et à mes rapports d'audit

**Critères d'acceptance :**

*Scénario : Connexion réussie*
**Étant donné** que je suis sur la page de connexion
**Quand** je renseigne un email et un mot de passe valides
**Alors** je suis redirigé vers mon tableau de bord

*Scénario : Identifiants incorrects*
**Étant donné** que je renseigne un email ou un mot de passe incorrect
**Quand** je soumets le formulaire
**Alors** je vois un message générique : "Email ou mot de passe incorrect"
**Et** aucune information ne révèle si c'est l'email ou le mot de passe qui est faux

*Scénario : Déconnexion*
**Étant donné** que je suis connecté à mon compte Auditor
**Quand** je clique sur "Déconnexion"
**Alors** ma session est invalidée
**Et** je suis redirigé vers la page de connexion

---

### Story 3 — Réinitialisation du mot de passe

**En tant que** utilisateur inscrit
**je veux** pouvoir réinitialiser mon mot de passe si je l'ai oublié
**afin de** retrouver l'accès à mon compte sans contacter le support

**Critères d'acceptance :**

*Scénario : Demande de réinitialisation*
**Étant donné** que je suis sur la page "Mot de passe oublié"
**Quand** je renseigne mon email
**Alors** si l'email est enregistré, je reçois un lien de réinitialisation valable 1 heure
**Et** si l'email n'est pas enregistré, je vois le même message de confirmation (pas de révélation d'existence du compte)

*Scénario : Réinitialisation réussie*
**Étant donné** que j'ai cliqué sur le lien de réinitialisation
**Quand** je renseigne et confirme un nouveau mot de passe conforme
**Alors** mon mot de passe est mis à jour
**Et** je suis redirigé vers la page de connexion
**Et** tous mes tokens de session actifs sont invalidés

---

### Story 4 — Connexion d'un workspace HubSpot au compte

**En tant que** utilisateur connecté à HubSpot Auditor
**je veux** connecter mon workspace HubSpot à mon compte
**afin de** pouvoir lancer un audit sur ce workspace

**Critères d'acceptance :**

*Scénario : Ajout d'un premier workspace*
**Étant donné** que j'ai un compte Auditor sans workspace connecté
**Quand** je clique sur "Connecter un workspace HubSpot"
**Alors** le flux OAuth HubSpot est déclenché (cf. EP-01)
**Et** après autorisation, le workspace est rattaché à mon compte et apparaît dans ma liste de workspaces

*Scénario : Ajout d'un second workspace*
**Étant donné** que j'ai déjà un workspace connecté à mon compte
**Quand** je clique sur "Ajouter un workspace"
**Alors** je peux lancer un nouveau flux OAuth pour un second compte HubSpot
**Et** les deux workspaces coexistent dans ma liste

*Scénario : Workspace déjà connecté à ce compte*
**Étant donné** que j'essaie de connecter un workspace HubSpot déjà rattaché à mon compte
**Quand** le flux OAuth est complété
**Alors** les tokens sont mis à jour (refresh) et le workspace n'est pas dupliqué dans la liste

---

### Story 5 — Gestion des workspaces connectés

**En tant que** utilisateur connecté à HubSpot Auditor
**je veux** voir et gérer la liste de mes workspaces HubSpot connectés
**afin de** choisir le workspace à auditer ou déconnecter un workspace client dont je n'ai plus besoin

**Critères d'acceptance :**

*Scénario : Affichage de la liste des workspaces*
**Étant donné** que j'ai un ou plusieurs workspaces connectés
**Quand** j'accède à la section "Mes workspaces"
**Alors** je vois pour chaque workspace : nom du portail, Hub ID, hub domain, date de connexion, statut de la connexion (active / expirée)

*Scénario : Passage d'un workspace à l'autre*
**Étant donné** que j'ai plusieurs workspaces connectés
**Quand** je sélectionne un workspace dans la liste
**Alors** ce workspace devient le workspace actif pour le prochain audit
**Et** l'interface indique clairement quel workspace est actuellement sélectionné

*Scénario : Déconnexion d'un workspace*
**Étant donné** que je veux retirer un workspace de mon compte
**Quand** je clique sur "Déconnecter" sur un workspace
**Alors** les tokens OAuth associés sont révoqués côté HubSpot et supprimés côté Auditor
**Et** le workspace disparaît de ma liste
**Et** les rapports d'audit générés sur ce workspace restent accessibles

---

### Story 6 — Suppression du compte

**En tant que** utilisateur inscrit
**je veux** pouvoir supprimer mon compte HubSpot Auditor
**afin de** contrôler mes données et pouvoir quitter le service complètement

**Critères d'acceptance :**

*Scénario : Suppression avec confirmation*
**Étant donné** que je suis sur la page "Supprimer mon compte"
**Quand** je confirme la suppression en saisissant mon email ou un texte de confirmation
**Alors** tous mes tokens OAuth sont révoqués côté HubSpot
**Et** tous mes rapports d'audit sont supprimés
**Et** mon compte est supprimé de la base de données
**Et** je suis redirigé vers la page d'accueil avec un message de confirmation

---

## Spécifications fonctionnelles

### Règles de mot de passe

| Règle | Valeur |
|---|---|
| Longueur minimale | 8 caractères |
| Caractère majuscule | Au moins 1 |
| Caractère chiffre ou spécial | Au moins 1 |
| Longueur maximale | 128 caractères |

### Politique de session

| Paramètre | Valeur |
|---|---|
| Durée de session inactive | 7 jours |
| Session "Se souvenir de moi" | 30 jours |
| Invalidation sur réinitialisation mot de passe | Toutes les sessions actives |
| Invalidation sur suppression de compte | Toutes les sessions actives |

### Validation de l'email à l'inscription

- Un lien de confirmation est envoyé à l'email fourni à l'inscription
- Le lien est valable 24 heures
- Tant que l'email n'est pas confirmé, l'accès au tableau de bord est bloqué avec un message et un bouton "Renvoyer l'email de confirmation"
- Le lien de confirmation est à usage unique

### Gestion des erreurs

| Situation | Message utilisateur |
|---|---|
| Email invalide (format) | "Veuillez saisir un email valide." |
| Email déjà utilisé | "Un compte existe déjà avec cet email. Connectez-vous ou réinitialisez votre mot de passe." |
| Mot de passe non conforme | Message listant les règles non respectées |
| Identifiants incorrects | "Email ou mot de passe incorrect." (message générique — ne distingue pas les deux) |
| Lien de réinitialisation expiré | "Ce lien a expiré. Demandez un nouveau lien de réinitialisation." |
| Email non confirmé | "Veuillez confirmer votre email avant de vous connecter. [Renvoyer l'email]" |

### Structure des données utilisateur

```
Utilisateur
├── id (UUID)
├── email (unique, indexé)
├── nom d'affichage
├── mot de passe (hashé — bcrypt ou équivalent)
├── email_confirmé (booléen)
├── créé_le
├── mis_à_jour_le
└── workspaces_connectés []
    ├── portal_id (HubSpot)
    ├── hub_name
    ├── hub_domain
    ├── access_token (chiffré)
    ├── refresh_token (chiffré)
    ├── connecté_le
    └── dernière_activité
```

> Les mots de passe ne sont jamais stockés en clair. Les tokens OAuth sont chiffrés au repos.

---

## Critères d'acceptance de l'epic

- [ ] L'inscription crée un compte avec email non confirmé et envoie l'email de validation
- [ ] La connexion est bloquée tant que l'email n'est pas confirmé
- [ ] La connexion avec identifiants corrects crée une session persistante
- [ ] Le message d'erreur de connexion ne distingue pas email et mot de passe
- [ ] La réinitialisation de mot de passe fonctionne de bout en bout et invalide les sessions actives
- [ ] Un compte peut avoir plusieurs workspaces HubSpot connectés (pas de limite en v1)
- [ ] Le passage d'un workspace à l'autre est possible depuis l'interface
- [ ] La déconnexion d'un workspace révoque le token côté HubSpot ET le supprime côté Auditor
- [ ] Les rapports restent accessibles après déconnexion d'un workspace
- [ ] La suppression de compte efface toutes les données (compte, tokens, rapports)
- [ ] Les mots de passe sont hashés, jamais stockés en clair
- [ ] Les tokens OAuth sont chiffrés au repos, jamais exposés côté client

---

## Dépendances

- **EP-01** (Connexion HubSpot OAuth) : le flux OAuth rattache un workspace au compte créé par cet epic
- **EP-04** (Tableau de bord) : les rapports d'audit sont associés au compte utilisateur
- **Infrastructure email** : nécessite un service d'envoi d'emails transactionnels (confirmation, réinitialisation)

---

## Questions ouvertes

| # | Question | Impact | Statut |
|---|---|---|---|
| Q1 | Quel service d'envoi d'email transactionnel utiliser (SendGrid, Resend, AWS SES, etc.) ? | Implémentation email | ❓ À décider par l'équipe tech |
| Q2 | Faut-il implémenter une limitation des tentatives de connexion (rate limiting) pour se protéger contre le brute force ? | Sécurité | ❓ Recommandé — à confirmer en implémentation |
| Q3 | La session "Se souvenir de moi" doit-elle être opt-in (case à cocher) ou activée par défaut ? | UX | ❓ À décider en design |
