# EP-01 — Connexion HubSpot (OAuth)

## Hypothèse

Nous croyons que proposer une connexion HubSpot sécurisée via OAuth (public app sur le HubSpot Marketplace) permettra aux RevOps Managers et consultants de connecter leur workspace en moins de 2 minutes sans friction technique — parce que toute friction à l'onboarding d'un outil d'audit CRM conduit à l'abandon avant que la valeur soit perçue.

Nous mesurerons le succès via : taux de conversion de la page de connexion vers un premier audit complété (cible : > 70%).

---

## Périmètre

### In scope
- Authentification via OAuth 2.0 HubSpot (flux Authorization Code)
- Public app enregistrée sur le HubSpot Developer Portal
- Demande des scopes nécessaires aux audits NOW (propriétés + workflows)
- Stockage sécurisé du token d'accès et du refresh token
- Rafraîchissement automatique du token (token rotation)
- Déconnexion et révocation du token
- Gestion des erreurs d'authentification (token expiré, accès révoqué, scopes insuffisants)
- Identification du workspace connecté (portail ID, nom, hub domain)

### Out of scope
- Connexion multi-workspace dans une même session (NEXT phase — usage consultant)
- Authentification par clé API privée HubSpot (déprécié, non supporté)
- Single Sign-On (SSO) avec Google, GitHub ou autre fournisseur d'identité pour le compte HubSpot Auditor lui-même
- Gestion des permissions granulaires par utilisateur au sein d'un workspace (NEXT phase)

---

## User stories

### Story 1 — Initier la connexion OAuth

**En tant que** RevOps Manager ou consultant
**je veux** connecter mon workspace HubSpot en cliquant sur un bouton
**afin de** lancer mon premier audit sans avoir à configurer de clé API ou de token manuellement

**Critères d'acceptance :**

*Scénario : Connexion réussie depuis la page d'accueil*
**Étant donné** que je suis sur la page d'accueil de HubSpot Auditor, non connecté
**Quand** je clique sur "Connecter mon HubSpot"
**Alors** je suis redirigé vers la page d'autorisation HubSpot
**Et** la page HubSpot affiche le nom de l'application HubSpot Auditor et la liste des permissions demandées
**Et** après avoir cliqué "Autoriser" sur HubSpot, je suis redirigé vers HubSpot Auditor
**Et** le workspace est identifié (nom, portail ID) et affiché dans l'interface

*Scénario : L'utilisateur refuse les permissions sur HubSpot*
**Étant donné** que je suis redirigé vers la page d'autorisation HubSpot
**Quand** je clique "Annuler" ou refuse les permissions
**Alors** je suis redirigé vers HubSpot Auditor avec un message explicatif
**Et** le message explique que les permissions sont nécessaires pour réaliser l'audit
**Et** je peux relancer la connexion depuis la même page

*Scénario : Erreur lors de la redirection OAuth*
**Étant donné** qu'une erreur technique survient pendant le flux OAuth (timeout, state invalide, etc.)
**Quand** je suis redirigé vers HubSpot Auditor
**Alors** je vois un message d'erreur clair indiquant que la connexion a échoué
**Et** je peux relancer la connexion sans rechargement manuel de la page

---

### Story 2 — Scopes et permissions demandées

**En tant que** RevOps Manager ou consultant
**je veux** comprendre pourquoi HubSpot Auditor demande certaines permissions
**afin de** donner mon consentement en connaissance de cause et de faire confiance à l'outil

**Critères d'acceptance :**

*Scénario : Affichage des scopes demandés sur HubSpot*
**Étant donné** que je suis redirigé vers la page d'autorisation HubSpot
**Quand** je consulte la liste des permissions demandées
**Alors** je vois uniquement les scopes nécessaires aux audits NOW :
- `crm.objects.contacts.read`
- `crm.objects.companies.read`
- `crm.objects.deals.read`
- `crm.schemas.contacts.read`
- `crm.schemas.companies.read`
- `crm.schemas.deals.read`
- `automation` (lecture des workflows)
**Et** aucun scope d'écriture ou de modification n'est demandé

*Scénario : Scopes insuffisants après connexion*
**Étant donné** que l'utilisateur a autorisé la connexion mais avec des scopes incomplets (ex. accès workflows refusé par l'admin HubSpot)
**Quand** l'audit est lancé
**Alors** les domaines non couverts par les scopes disponibles sont exclus de l'audit
**Et** un avertissement explique quels domaines n'ont pas pu être analysés et pourquoi
**Et** l'audit partiel est tout de même présenté avec un score calculé sur les domaines disponibles

---

### Story 3 — Maintien de la session et rafraîchissement du token

**En tant que** RevOps Manager ou consultant
**je veux** que ma connexion HubSpot reste active sans avoir à me reconnecter à chaque visite
**afin de** relancer un audit rapidement sans friction

**Critères d'acceptance :**

*Scénario : Token encore valide à la connexion*
**Étant donné** que je reviens sur HubSpot Auditor avec un token valide en session
**Quand** j'accède à l'application
**Alors** je suis automatiquement reconnu comme connecté
**Et** le workspace connecté est affiché sans nouvelle authentification

*Scénario : Rafraîchissement automatique du token*
**Étant donné** que le token d'accès a expiré mais le refresh token est toujours valide
**Quand** je lance un audit ou accède à l'application
**Alors** le token est rafraîchi automatiquement en arrière-plan
**Et** l'audit démarre normalement sans interruption ni message d'erreur

*Scénario : Refresh token expiré ou révoqué*
**Étant donné** que le refresh token est expiré (après 30 jours sans activité) ou révoqué depuis HubSpot
**Quand** j'accède à l'application
**Alors** je vois un message m'indiquant que la connexion a expiré
**Et** je peux relancer le flux OAuth depuis ce message sans perdre mes rapports précédents

---

### Story 4 — Déconnexion et révocation

**En tant que** RevOps Manager ou consultant
**je veux** pouvoir déconnecter mon workspace HubSpot de HubSpot Auditor
**afin de** contrôler les accès et déconnecter un workspace client une fois ma mission terminée

**Critères d'acceptance :**

*Scénario : Déconnexion depuis l'interface*
**Étant donné** que je suis connecté à HubSpot Auditor
**Quand** je clique sur "Déconnecter ce workspace"
**Alors** le token d'accès et le refresh token sont supprimés côté HubSpot Auditor
**Et** une requête de révocation est envoyée à l'API HubSpot
**Et** je suis redirigé vers la page de connexion avec une confirmation de déconnexion
**Et** mes rapports d'audit précédents restent accessibles (les données sont conservées côté HubSpot Auditor)

*Scénario : Révocation depuis HubSpot*
**Étant donné** que l'accès a été révoqué directement depuis l'interface HubSpot (par l'utilisateur ou un admin)
**Quand** je tente de lancer un audit depuis HubSpot Auditor
**Alors** l'erreur d'authentification est détectée
**Et** je suis redirigé vers la page de connexion avec un message explicatif
**Et** mes rapports précédents restent accessibles

---

### Story 5 — Identification du workspace connecté

**En tant que** RevOps Manager ou consultant
**je veux** voir clairement quel workspace HubSpot est connecté
**afin de** m'assurer que j'audit bien le bon compte avant de lancer l'analyse

**Critères d'acceptance :**

*Scénario : Affichage du workspace connecté*
**Étant donné** que la connexion OAuth est établie
**Quand** je suis dans l'interface de HubSpot Auditor
**Alors** je vois en permanence dans l'interface :
- Le nom du portail HubSpot (Hub name)
- L'identifiant du portail (Hub ID / Portal ID)
- Le hub domain (ex. monentreprise.hubspot.com)
**Et** ces informations sont également présentes dans les métadonnées de chaque rapport d'audit

*Scénario : Plusieurs connexions successives*
**Étant donné** que je me suis déjà connecté avec un workspace A puis déconnecté
**Quand** je me connecte avec un workspace B
**Alors** les informations du workspace B remplacent celles du workspace A dans l'interface
**Et** les rapports du workspace A restent accessibles s'ils ont été générés lors de la session précédente (selon la politique de rétention)

---

## Spécifications fonctionnelles

### Flux OAuth 2.0 complet

```
1. Utilisateur clique "Connecter mon HubSpot" sur HubSpot Auditor
2. HubSpot Auditor génère un `state` aléatoire (anti-CSRF) et le stocke en session
3. Redirection vers :
   https://app.hubspot.com/oauth/authorize
     ?client_id={CLIENT_ID}
     &redirect_uri={REDIRECT_URI}
     &scope={SCOPES}
     &state={STATE}

4. L'utilisateur autorise sur HubSpot

5. HubSpot redirige vers :
   {REDIRECT_URI}?code={AUTHORIZATION_CODE}&state={STATE}

6. HubSpot Auditor vérifie que le `state` correspond (anti-CSRF)

7. HubSpot Auditor échange le code contre des tokens :
   POST https://api.hubapi.com/oauth/v1/token
   Body: grant_type=authorization_code&code={CODE}&redirect_uri={REDIRECT_URI}
         &client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}

8. HubSpot retourne :
   { access_token, refresh_token, expires_in, token_type }

9. HubSpot Auditor stocke les tokens de façon sécurisée
10. HubSpot Auditor appelle GET /oauth/v1/access-tokens/{TOKEN} pour identifier le portal_id
11. Redirection vers le tableau de bord avec le workspace identifié
```

### Scopes nécessaires (phase NOW)

| Scope | Justification | Domaine d'audit |
|---|---|---|
| `crm.objects.contacts.read` | Lire les contacts pour les règles de qualité | Propriétés (contacts) |
| `crm.objects.companies.read` | Lire les sociétés | Propriétés (companies) |
| `crm.objects.deals.read` | Lire les deals | Propriétés (deals) |
| `crm.schemas.contacts.read` | Lire les propriétés custom contacts | Propriétés |
| `crm.schemas.companies.read` | Lire les propriétés custom companies | Propriétés |
| `crm.schemas.deals.read` | Lire les propriétés custom deals | Propriétés |
| `automation` | Lire les workflows (définition + stats) | Workflows |

> **Note :** Aucun scope `write` ou `delete` n'est demandé. L'outil est non-destructif par conception.

### Stockage sécurisé des tokens

| Donnée | Stockage | Durée de vie | Chiffrement |
|---|---|---|---|
| `access_token` | Base de données serveur | 6 heures (HubSpot default) | Chiffré au repos |
| `refresh_token` | Base de données serveur | 30 jours (sans activité) | Chiffré au repos |
| `portal_id` | Base de données serveur | Indéfini | Non sensible |
| `state` OAuth | Session serveur uniquement | Durée du flux (5 min max) | Non persisté |

> Les tokens ne sont **jamais** exposés côté client (pas dans le localStorage, pas dans les cookies non-httpOnly).

### Gestion des erreurs OAuth

| Code d'erreur HubSpot | Cause | Message utilisateur |
|---|---|---|
| `access_denied` | L'utilisateur a refusé l'autorisation | "Vous avez refusé l'accès. Les permissions sont nécessaires pour réaliser l'audit. Relancer la connexion ?" |
| `invalid_client` | Client ID ou secret invalide | "Erreur de configuration. Contactez le support." |
| `invalid_grant` | Code d'autorisation expiré ou déjà utilisé | "La session d'autorisation a expiré. Veuillez relancer la connexion." |
| `invalid_scope` | Scope demandé non supporté | "Erreur de configuration des permissions. Contactez le support." |
| Token révoqué (401 sur API call) | Accès révoqué depuis HubSpot | "Votre connexion HubSpot a été révoquée. Reconnectez-vous pour continuer." |

### Informations du workspace récupérées à la connexion

Via `GET https://api.hubapi.com/oauth/v1/access-tokens/{TOKEN}` :
```json
{
  "portal_id": 12345678,
  "hub_domain": "monentreprise.hubspot.com",
  "hub_id": 12345678,
  "app_id": ...,
  "user": "user@email.com",
  "scopes": ["crm.objects.contacts.read", ...]
}
```

---

## Critères d'acceptance de l'epic

- [ ] Le flux OAuth complet fonctionne de bout en bout : clic → HubSpot → autorisation → retour sur HubSpot Auditor
- [ ] La vérification anti-CSRF du `state` est implémentée et bloque les tentatives de rejeu
- [ ] Les tokens sont stockés chiffrés côté serveur, jamais exposés au client
- [ ] Le rafraîchissement automatique du token fonctionne sans interruption pour l'utilisateur
- [ ] La déconnexion révoque le token côté HubSpot ET supprime les tokens côté HubSpot Auditor
- [ ] Les scopes demandés sont uniquement les scopes de lecture nécessaires (aucun scope d'écriture)
- [ ] Le workspace connecté (nom, Hub ID, hub domain) est affiché dans l'interface après connexion
- [ ] Les erreurs OAuth (refus, expiration, révocation) donnent un message utilisateur clair et une voie de sortie
- [ ] Le cas des scopes insuffisants est géré : audit partiel avec avertissement, pas d'erreur bloquante
- [ ] Les rapports précédents sont conservés après déconnexion et reconnexion

---

## Dépendances

- **HubSpot Developer Portal** : nécessite la création et la validation d'une Public App avec les scopes listés
- **EP-02** (Audit des propriétés) : consomme le token fourni par cet epic
- **EP-03** (Audit des workflows) : consomme le token fourni par cet epic
- **EP-04** (Tableau de bord) : affiche les métadonnées du workspace identifié par cet epic

---

## Questions ouvertes

| # | Question | Impact | Statut |
|---|---|---|---|
| Q1 | La Public App HubSpot doit-elle être soumise à la HubSpot Marketplace pour être listée, ou suffit-il de la publier sans listing ? Le listing implique une revue HubSpot et des contraintes supplémentaires. | Go-to-market + délai | ✅ **Décision PO :** Sans listing Marketplace pour la v1. Le listing sera envisagé après validation marché. |
| Q2 | Quelle politique de rétention des tokens et des rapports adopter (RGPD) ? Si l'utilisateur n'utilise pas l'outil pendant 30 jours, faut-il supprimer automatiquement les données ? | RGPD + architecture | ✅ **Décision PO :** Conservation indéfinie des rapports. Les tokens OAuth suivent la durée de vie HubSpot (access_token 6h, refresh_token 30 jours). |
| Q3 | Faut-il implémenter une gestion de compte utilisateur (email + mot de passe) dès NOW, ou la session OAuth HubSpot peut-elle servir d'unique identifiant ? | Architecture fondamentale | ✅ **Décision PO :** Compte utilisateur obligatoire dès NOW (email + mot de passe). Un utilisateur peut connecter plusieurs workspaces HubSpot à son compte. Cela génère un nouvel epic EP-00. |
| Q4 | Quel comportement adopter si l'utilisateur connecte un workspace HubSpot en tant qu'utilisateur sans droits admin ? | Robustesse + UX | ✅ **Décision :** Gestion gracieuse — les domaines non accessibles sont exclus de l'audit avec un avertissement explicatif. Cf. comportement scopes insuffisants (Story 2). |
