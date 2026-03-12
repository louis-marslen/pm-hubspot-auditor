# PRD-00 — Gestion du compte utilisateur HubSpot Auditor

---

## 1. Résumé exécutif

Nous construisons un système de compte utilisateur pour HubSpot Auditor afin de permettre aux RevOps Managers et consultants CRM de retrouver leurs audits passés, de gérer plusieurs workspaces HubSpot depuis un seul endroit, et de partager leurs rapports — parce que sans identité persistante, aucune valeur ne peut s'accumuler dans l'outil entre deux sessions. Ce fondament conditionne l'ensemble du produit.

---

## 2. Problem statement

### Narrative du problème

**Je suis :** Sophie, RevOps Manager dans une scale-up de 150 personnes
- Responsable de la qualité des données CRM, seule à gérer HubSpot
- Découvre les problèmes de configuration par accident ou trop tard
- Doit convaincre son management d'allouer du temps pour corriger les problèmes

**J'essaie de :**
- Auditer régulièrement mon workspace HubSpot pour maintenir la qualité des données et pouvoir justifier des actions correctives auprès de ma direction

**Mais :**
- Si l'outil ne mémorise pas mes sessions, je dois refaire l'audit entier à chaque visite
- Je ne peux pas comparer l'évolution dans le temps sans historique
- Je ne peux pas partager un rapport à mon manager sans qu'il soit connecté
- En tant que consultant (Louis), je dois gérer plusieurs clients HubSpot avec un seul compte

**Parce que :**
- Il n'existe pas de mécanisme d'identité dans l'outil — chaque session est orpheline

**Ce qui me fait ressentir :**
- Frustrée de reperdre du temps à relancer un audit que j'ai déjà fait la semaine dernière
- Bloquée pour partager mes findings sans friction
- Peu professionnelle quand je ne peux pas délivrer un rapport structuré à mon client

### Énoncé final du problème

Les RevOps Managers et consultants HubSpot ont besoin d'un espace de travail persistant parce que sans compte, ils ne peuvent ni retrouver leurs audits passés, ni gérer plusieurs workspaces clients, ni partager leurs rapports — ce qui rend l'outil jetable au lieu d'être un partenaire de gouvernance CRM au long cours.

---

## 3. Utilisateurs cibles & personas

### Persona primaire — Sophie RevOps *(self-service)*

**Profil :** RevOps Manager dans une scale-up (30-500 personnes), 2-5 ans d'expérience HubSpot, autodidacte, responsable de la qualité CRM.

**Jobs fonctionnels :**
- Retrouver l'état d'un audit lancé la semaine précédente
- Comparer l'évolution du score de santé dans le temps
- Partager un rapport à son directeur commercial sans lui créer un compte

**Jobs sociaux :**
- Être perçue comme rigoureuse et organisée dans sa gestion du CRM
- Pouvoir présenter des données structurées en réunion de direction

**Jobs émotionnels :**
- Se sentir en confiance sur l'état de son workspace
- Éviter l'anxiété d'un accès perdu ou de données disparues

**Douleurs clés :**
- Perte des données de session entre deux visites
- Impossibilité de partager un rapport sans friction

---

### Persona secondaire — Louis Consultant *(usage professionnel)*

**Profil :** Consultant RevOps freelance, démarre régulièrement avec un nouveau workspace client, facture au temps.

**Jobs fonctionnels :**
- Gérer plusieurs workspaces HubSpot clients depuis un seul compte
- Délivrer un rapport d'état professionnel dès le kick-off d'une mission
- Déconnecter un workspace client une fois la mission terminée

**Jobs émotionnels :**
- Paraître professionnel et structuré auprès de ses clients
- Ne pas passer ses premières heures de mission sur des tâches non facturables

**Douleurs clés :**
- Devoir créer un compte par client ou tout recommencer manuellement
- Pas de moyen de livrer un artefact propre et partageable

---

## 4. Contexte stratégique

### Lien avec la vision produit

Sans compte utilisateur, HubSpot Auditor est un outil jetable : l'utilisateur lance un audit, voit les résultats, ferme l'onglet — et tout disparaît. L'identité persistante est la condition pour que l'outil devienne un partenaire de gouvernance CRM au long cours, pas une calculatrice.

### Pourquoi maintenant

Cet epic est **le fondement technique de tous les autres epics**. EP-01 (OAuth) rattache un workspace à un compte. EP-04 (rapports) conserve des audits associés à un utilisateur. Sans EP-00, aucun autre epic ne peut fonctionner conformément aux décisions produit validées.

### Positionnement concurrentiel

Les outils d'audit HubSpot existants (grids manuelles, scripts internes) n'ont aucune notion de compte ou d'historique. Un espace de travail persistant avec multi-workspace est un avantage différenciant direct, notamment pour le segment consultant.

---

## 5. Vue d'ensemble de la solution

Nous construisons un système d'authentification et de gestion de profil découplé de HubSpot : l'utilisateur crée son compte sur HubSpot Auditor (email + mot de passe), puis connecte un ou plusieurs workspaces HubSpot via OAuth (cf. EP-01) depuis cet espace.

**Comment ça fonctionne :**
1. L'utilisateur s'inscrit sur HubSpot Auditor avec son email et un mot de passe
2. Il confirme son email via un lien envoyé automatiquement
3. Il accède à son tableau de bord (vide au départ)
4. Il connecte son premier workspace HubSpot via OAuth
5. Il peut ajouter d'autres workspaces à tout moment
6. Il retrouve son tableau de bord et ses rapports à chaque reconnexion

**Features clés :**
- Inscription / connexion / déconnexion / reset mot de passe
- Validation de l'email à l'inscription
- Gestion des workspaces connectés (liste, ajout, suppression, switch)
- Suppression de compte avec effacement complet des données

---

## 6. Métriques de succès

### Métrique primaire
**Taux de complétion inscription → premier audit lancé**
- Actuel : N/A (nouveau produit)
- Cible : > 60%
- Délai de mesure : 30 jours après le lancement

### Métriques secondaires
- Taux de confirmation d'email dans les 24h : > 80%
- Taux de rétention à 7 jours (utilisateurs qui reviennent après le premier audit) : > 40%
- Nombre moyen de workspaces connectés par compte consultant : > 1,5

### Métriques garde-fous
- Taux d'erreur lors du flux d'inscription : < 5%
- Délai de réception de l'email de confirmation : < 30 secondes

---

## 7. User stories & requirements

### US-00-01 — Inscription

**En tant que** RevOps Manager visitant HubSpot Auditor pour la première fois
**je veux** créer un compte avec mon email et un mot de passe
**afin de** retrouver mes audits et mes workspaces connectés à chaque visite

**Critères d'acceptance :**

*Scénario : Inscription réussie*
**Étant donné** que je suis sur la page d'inscription
**Et étant donné** que l'email n'est pas déjà enregistré
**Quand** je soumets un email valide et un mot de passe conforme
**Alors** un email de confirmation m'est envoyé dans les 30 secondes
**Et** je suis redirigé vers une page me demandant de confirmer mon email

*Scénario : Email déjà utilisé*
**Étant donné** que je suis sur la page d'inscription
**Quand** je renseigne un email déjà associé à un compte existant
**Alors** je vois le message : "Un compte existe déjà avec cet email."
**Et** un lien vers la page de connexion m'est proposé

*Scénario : Mot de passe non conforme*
**Étant donné** que je renseigne un mot de passe trop court
**Quand** je tente de soumettre le formulaire
**Alors** je vois un message listant les règles non respectées
**Et** le formulaire n'est pas soumis

---

### US-00-02 — Connexion

**En tant que** RevOps Manager avec un compte HubSpot Auditor
**je veux** me connecter avec mon email et mon mot de passe
**afin d'** accéder à mes workspaces et à l'historique de mes audits

**Critères d'acceptance :**

*Scénario : Connexion réussie*
**Étant donné** que je suis sur la page de connexion
**Quand** je renseigne des identifiants corrects
**Alors** je suis redirigé vers mon tableau de bord

*Scénario : Identifiants incorrects*
**Étant donné** que je renseigne un email ou un mot de passe incorrect
**Quand** je soumets le formulaire
**Alors** je vois le message générique : "Email ou mot de passe incorrect."
**Et** aucune information ne révèle si c'est l'email ou le mot de passe qui est faux (sécurité)

*Scénario : Email non confirmé*
**Étant donné** que mon email n'a pas encore été confirmé
**Quand** je tente de me connecter
**Alors** je vois un message m'invitant à confirmer mon email
**Et** je peux demander le renvoi de l'email de confirmation depuis ce message

---

### US-00-03 — Réinitialisation du mot de passe

**En tant que** utilisateur ayant oublié son mot de passe
**je veux** recevoir un lien de réinitialisation par email
**afin de** récupérer l'accès à mon compte sans contacter le support

**Critères d'acceptance :**

*Scénario : Demande de réinitialisation*
**Étant donné** que je suis sur la page "Mot de passe oublié"
**Quand** je soumets mon email
**Alors** je vois un message de confirmation identique que l'email soit connu ou non (pas de révélation d'existence du compte)
**Et** si l'email est enregistré, je reçois un lien valable 1 heure

*Scénario : Réinitialisation réussie*
**Étant donné** que j'ai cliqué sur un lien de réinitialisation valide
**Quand** je soumets un nouveau mot de passe conforme
**Alors** mon mot de passe est mis à jour
**Et** toutes mes sessions actives sont invalidées
**Et** je suis redirigé vers la page de connexion avec une confirmation

---

### US-00-04 — Connexion d'un workspace HubSpot

**En tant que** consultant CRM gérant plusieurs clients HubSpot
**je veux** connecter un ou plusieurs workspaces HubSpot à mon compte Auditor
**afin de** pouvoir lancer un audit sur chaque workspace client sans recréer un compte

**Critères d'acceptance :**

*Scénario : Connexion du premier workspace*
**Étant donné** que mon compte Auditor est créé et confirmé
**Et étant donné** qu'aucun workspace n'est encore connecté
**Quand** je clique sur "Connecter un workspace HubSpot"
**Alors** le flux OAuth EP-01 est déclenché
**Et** après autorisation, le workspace apparaît dans ma liste avec son nom, Hub ID et hub domain

*Scénario : Ajout d'un second workspace*
**Étant donné** que j'ai déjà un workspace connecté
**Quand** je clique sur "Ajouter un workspace"
**Alors** un nouveau flux OAuth peut être lancé indépendamment
**Et** les deux workspaces coexistent dans ma liste sans conflit

---

### US-00-05 — Gestion des workspaces connectés

**En tant que** consultant CRM gérant plusieurs clients
**je veux** voir, sélectionner et déconnecter mes workspaces HubSpot
**afin de** contrôler les accès et me concentrer sur le bon workspace client

**Critères d'acceptance :**

*Scénario : Affichage de la liste*
**Étant donné** que j'ai un ou plusieurs workspaces connectés
**Quand** j'accède à la section "Mes workspaces"
**Alors** je vois pour chaque workspace : nom du portail, Hub ID, hub domain, date de connexion, statut (actif / expiré)

*Scénario : Déconnexion d'un workspace*
**Étant donné** que je veux retirer un workspace client en fin de mission
**Quand** je clique sur "Déconnecter" pour ce workspace
**Alors** les tokens OAuth sont révoqués côté HubSpot et supprimés côté Auditor
**Et** le workspace disparaît de ma liste
**Et** les rapports générés sur ce workspace restent accessibles

---

### US-00-06 — Suppression du compte

**En tant que** utilisateur souhaitant quitter le service
**je veux** supprimer mon compte et toutes mes données
**afin de** contrôler mes données personnelles et respecter mon droit à l'oubli

**Critères d'acceptance :**

*Scénario : Suppression avec confirmation explicite*
**Étant donné** que je suis sur la page "Supprimer mon compte"
**Quand** je confirme la suppression en saisissant mon email
**Alors** tous mes tokens OAuth sont révoqués côté HubSpot
**Et** tous mes rapports d'audit sont supprimés de la base de données
**Et** mon compte est effacé
**Et** je suis redirigé vers la page d'accueil avec un message de confirmation

---

### Contraintes & cas limites

| Situation | Comportement attendu |
|---|---|
| Lien de confirmation email expiré (> 24h) | Message d'erreur + bouton "Renvoyer l'email" |
| Lien de reset mot de passe expiré (> 1h) | Message d'erreur + lien vers "Mot de passe oublié" |
| Workspace HubSpot déjà connecté au même compte | Rafraîchissement des tokens, pas de duplication |
| Tentatives de connexion répétées (brute force) | Rate limiting côté serveur (implémentation à définir par l'équipe tech) |
| Suppression de compte avec workspaces actifs | Révocation de tous les tokens avant suppression |

---

## 8. Out of scope

| Feature | Raison de l'exclusion |
|---|---|
| SSO Google / GitHub | Complexité d'implémentation + non prioritaire pour la v1 |
| Gestion des rôles au sein d'un compte (admin/viewer) | Usage multi-utilisateur non validé en v1 |
| Invitations d'équipe | Dépend d'un modèle de permissions non défini |
| Authentification à deux facteurs (2FA) | NEXT phase |
| Tableau de bord multi-workspace simultané | Géré par EP-04 NEXT |
| Export de toutes les données personnelles (RGPD article 20) | Implémentation manuelle suffisante en v1 pour la taille du produit |

---

## 9. Dépendances & risques

### Dépendances

| Dépendance | Description | Criticité |
|---|---|---|
| **EP-01** (OAuth HubSpot) | Le flux de connexion workspace est déclenché depuis le compte Auditor | Bloquante — doit être développé conjointement |
| **Infrastructure email** | Service d'envoi d'emails transactionnels (SendGrid, Resend ou équivalent — choix équipe tech) | Bloquante pour l'inscription et le reset |
| **EP-04** (Tableau de bord) | Les rapports d'audit sont associés à un compte utilisateur | Dépendance de données |

### Risques & mitigations

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Taux d'activation faible (email non confirmé) | Moyen | Élevé | Email de confirmation bien conçu, lien de renvoi accessible, délai 24h généreux |
| Friction à l'inscription trop élevée | Moyen | Élevé | Formulaire minimal (email + mot de passe uniquement), pas de données de profil obligatoires |
| Perte de tokens OAuth lors de la suppression de compte | Faible | Élevé | Tester le flux de révocation côté HubSpot avant la mise en prod |
| Service email défaillant | Faible | Élevé | Mécanisme de retry + fallback "Renvoyer l'email" accessible à tout moment |

---

## 10. Questions ouvertes

| # | Question | Impact | Statut |
|---|---|---|---|
| Q1 | Quel service d'envoi d'email transactionnel choisir ? | Implémentation | ✅ **Décision PO : Resend** (free tier). Simple à intégrer, généreux en volume gratuit pour la v1. |
| Q2 | Faut-il implémenter un rate limiting sur les tentatives de connexion dès la v1 ? | Sécurité | ❓ Recommandé — à confirmer |
| Q3 | La session "Se souvenir de moi" (30 jours) doit-elle être opt-in ou activée par défaut ? | UX | ❓ Décision design |
