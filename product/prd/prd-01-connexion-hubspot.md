# PRD-01 — Connexion HubSpot (OAuth)

**Epic associé :** EP-01
**Version :** 1.0
**Date :** 2026-03-12
**Statut :** Prêt pour développement

---

## 1. Résumé exécutif

EP-01 définit le mécanisme d'authentification permettant à un utilisateur de HubSpot Auditor de connecter un ou plusieurs workspaces HubSpot à son compte via le protocole OAuth 2.0 (flux Authorization Code). C'est le prérequis absolu de tout audit : sans token valide, aucun appel API HubSpot ne peut être effectué.

L'enjeu UX est critique : toute friction à l'onboarding entraîne l'abandon avant que la valeur du produit soit perçue. Le flux doit être complété en moins de 2 minutes, sans configuration technique de la part de l'utilisateur.

**Décisions PO actées dans ce PRD :**
- Les utilisateurs disposent d'un compte propre sur HubSpot Auditor (email + mot de passe), géré par EP-00, indépendant de HubSpot.
- Un compte HubSpot Auditor peut contenir plusieurs workspaces HubSpot connectés (usage consultant).
- La Public App HubSpot est publiée sans listing Marketplace pour la v1 (décision post-validation marché).
- Les deep links vers HubSpot depuis le rapport sont hors périmètre phase NOW.
- Les rapports d'audit sont conservés indéfiniment, y compris après déconnexion d'un workspace.

---

## 2. Problème utilisateur

### Narrative du problème

**Je suis :** Sophie, RevOps Manager qui découvre HubSpot Auditor
- Je me méfie des outils tiers qui demandent l'accès à mon CRM sans expliquer exactement ce qu'ils lisent
- J'ai déjà abandonné des outils SaaS à l'onboarding parce que la connexion demandait 20 minutes et de l'aide
- Je veux pouvoir révoquer l'accès à tout moment, surtout si c'est le HubSpot d'un client

**J'essaie de :**
- Connecter mon workspace HubSpot en quelques clics pour lancer un premier audit immédiatement, sans configuration technique

**Mais :**
- Je ne sais pas ce que l'outil va accéder avant d'autoriser
- Toute friction ou opacité sur les permissions me fait abandonner
- En tant que consultant (Louis), je dois gérer plusieurs workspaces clients sans recréer une configuration par client

**Parce que :**
- Il n'existe pas de standard d'onboarding clair pour les outils tiers HubSpot — certains demandent des clés API, d'autres des tokens, aucun n'explique clairement la portée des accès

**Ce qui me fait ressentir :**
- Méfiante et hésitante face à une demande d'accès CRM opaque
- Soulagée quand le processus est transparent, rapide, et réversible

### Énoncé du problème

Les RevOps Managers et consultants ont besoin d'un moyen de connecter leur workspace HubSpot en toute sécurité et en moins de 2 minutes, parce que la friction et le manque de transparence sur les permissions sont les premières causes d'abandon avant le premier audit.

### Contexte

Les RevOps Managers et consultants HubSpot ont besoin d'auditer régulièrement des workspaces clients ou internes. Aujourd'hui, ils réalisent ces audits manuellement, objet par objet, en naviguant dans l'interface HubSpot — un processus qui prend plusieurs heures et ne produit pas de rapport structuré.

Pour qu'un outil d'audit automatisé puisse fonctionner, il doit accéder aux données du workspace HubSpot via l'API. OAuth 2.0 est le standard imposé par HubSpot pour les accès tiers légitimes : il garantit que l'utilisateur donne son consentement explicite, que les scopes sont limités au strict nécessaire, et que l'accès peut être révoqué à tout moment.

### Problèmes spécifiques adressés

1. **Friction d'onboarding** : si la connexion nécessite une configuration manuelle (clé API, paramétrage technique), les utilisateurs non-techniques abandonnent avant le premier audit.
2. **Confiance et sécurité** : les utilisateurs et leurs clients doivent pouvoir vérifier que l'outil ne demande que des droits en lecture, qu'il ne modifie aucune donnée, et que l'accès peut être révoqué à tout moment.
3. **Gestion multi-workspaces** : un consultant qui gère 10 clients ne peut pas se permettre de reconfigurer l'outil pour chaque workspace. Il doit pouvoir rattacher plusieurs connexions à son compte.
4. **Continuité de session** : un audit peut se lancer à tout moment, y compris plusieurs jours après la connexion initiale. Le token doit rester valide sans friction.

---

## 2bis. Personas & Jobs-to-be-Done

### Sophie RevOps *(persona primaire)*

**Jobs fonctionnels :**
- Connecter son workspace HubSpot en 1 clic, sans clé API ni configuration manuelle
- Comprendre exactement quelles données l'outil peut lire avant d'autoriser
- Déconnecter son workspace si elle change d'avis ou révoque son consentement

**Jobs sociaux :**
- Être perçue comme rigoureuse sur la sécurité des données de son entreprise

**Jobs émotionnels :**
- Se sentir en sécurité (outil non-destructif, lecture seule confirmée)
- Être rassurée par la transparence des permissions demandées

**Douleurs clés :**
- Peur des outils tiers opaques sur leurs accès CRM
- Abandon au moindre blocage technique à l'onboarding

---

### Louis Consultant *(persona secondaire)*

**Jobs fonctionnels :**
- Connecter le HubSpot d'un client rapidement en début de mission
- Déconnecter le workspace client proprement en fin de mission
- Gérer plusieurs workspaces clients depuis un seul compte Auditor

**Jobs émotionnels :**
- Paraître professionnel et sécurisé aux yeux de ses clients
- Ne pas faire peur au client avec une demande d'accès opaque

---

## 2ter. Contexte stratégique

**Lien avec les OKRs produit :** la métrique clé de l'onboarding est le taux de conversion "page de connexion → premier audit complété" (cible > 70%). Si ce taux est insuffisant, le produit ne peut pas croître organiquement.

**Pourquoi OAuth et pas clé API :** les clés API privées HubSpot sont dépréciées depuis 2022. OAuth est le standard reconnu qui affiche nativement les permissions sur la page d'autorisation HubSpot — il construit la confiance sans effort supplémentaire.

**Pourquoi maintenant :** cet epic est le prérequis absolu de EP-02 et EP-03. Sans token OAuth valide, aucun audit ne peut être lancé. Il est en dépendance directe de EP-00.

---

## 2quart. Vue d'ensemble de la solution

Nous implémentons le flux OAuth 2.0 Authorization Code avec HubSpot, avec 7 scopes strictement en lecture seule, stockage chiffré des tokens côté serveur, rafraîchissement automatique en arrière-plan, et gestion des erreurs avec messages utilisateur clairs et voies de sortie.

**Comment ça fonctionne :**
1. L'utilisateur clique "Connecter mon HubSpot" depuis son tableau de bord Auditor
2. HubSpot Auditor génère un `state` anti-CSRF et redirige vers la page d'autorisation HubSpot
3. HubSpot affiche le nom "HubSpot Auditor" et la liste des 7 permissions demandées
4. L'utilisateur autorise → retour avec code d'autorisation → échange contre tokens
5. Tokens chiffrés stockés côté serveur, workspace identifié (nom, Hub ID, hub domain)
6. Workspace rattaché au compte Auditor (EP-00) → tableau de bord prêt

**Features clés :** flux OAuth 2.0 complet avec anti-CSRF, 7 scopes read-only, refresh automatique, déconnexion avec révocation, gestion des erreurs et scopes insuffisants.

---

## 3. Objectifs & métriques de succès

### Objectifs

| Objectif | Description |
|---|---|
| O1 — Conversion onboarding | Un utilisateur qui crée un compte doit pouvoir réaliser son premier audit sans friction technique |
| O2 — Confiance utilisateur | L'utilisateur doit comprendre quels accès sont demandés et avoir confiance dans la sécurité de l'outil |
| O3 — Robustesse de session | La connexion doit rester opérationnelle sans intervention de l'utilisateur entre deux sessions |
| O4 — Contrôle de l'accès | L'utilisateur doit pouvoir révoquer l'accès à tout moment |

### KPIs

| KPI | Cible | Méthode de mesure |
|---|---|---|
| Taux de conversion connexion → premier audit complété | > 70% | Tracking événements : `oauth_start` → `audit_completed` |
| Durée médiane du flux OAuth | < 2 minutes | Timestamp `oauth_start` → `workspace_connected` |
| Taux d'erreurs OAuth bloquantes | < 5% | Logs erreurs OAuth avec code d'erreur |
| Taux de rafraîchissement de token silencieux | > 95% (sans interruption utilisateur) | Monitoring token refresh |

### Métriques garde-fous
- Aucun token ne doit apparaître dans les logs serveur, les cookies client ou le localStorage
- Aucun scope write ne doit être présent dans les permissions demandées à HubSpot
- Le taux d'erreur OAuth (flux complet échoué) doit rester < 2%

---

## 4. Périmètre

### In scope

- Authentification via OAuth 2.0 HubSpot, flux Authorization Code
- Public App enregistrée sur le HubSpot Developer Portal (sans listing Marketplace v1)
- Demande des scopes nécessaires aux audits phase NOW (propriétés + workflows)
- Stockage sécurisé de l'access token et du refresh token côté serveur
- Rafraîchissement automatique du token (token rotation) sans interruption utilisateur
- Déconnexion d'un workspace avec révocation du token côté HubSpot
- Gestion de toutes les erreurs d'authentification (refus, expiration, révocation, scopes insuffisants)
- Identification du workspace connecté (nom du portail, Hub ID, hub domain)
- Rattachement du workspace OAuth au compte utilisateur HubSpot Auditor (EP-00)
- Prise en charge du multi-workspace : un compte utilisateur peut connecter plusieurs workspaces successivement

### Out of scope (phase NOW)

- Multi-workspace simultané dans une même vue (affichage de plusieurs workspaces côte à côte) — NEXT phase
- Authentification par clé API privée HubSpot (déprécié par HubSpot, non supporté)
- SSO avec Google, GitHub ou autre fournisseur d'identité pour le compte HubSpot Auditor (géré par EP-00)
- Gestion des permissions granulaires par utilisateur au sein d'un workspace — NEXT phase
- Deep links depuis un rapport vers les objets HubSpot correspondants — NEXT phase
- Listing de la Public App sur la HubSpot Marketplace — décision post-validation marché

---

## 5. User stories associées

| ID | Titre | Priorité |
|---|---|---|
| EP-01-S1 | Initier la connexion OAuth | Must have |
| EP-01-S2 | Scopes et permissions demandées | Must have |
| EP-01-S3 | Maintien de la session et rafraîchissement du token | Must have |
| EP-01-S4 | Déconnexion et révocation | Must have |
| EP-01-S5 | Identification du workspace connecté | Must have |

Les stories complètes avec leurs critères d'acceptance Given/When/Then sont définies dans le fichier `/epics/ep01-connexion-hubspot.md`.

---

## 6. Spécifications fonctionnelles

### 6.1 Flux OAuth 2.0 complet — description pas à pas

Le flux suit le standard Authorization Code Grant d'OAuth 2.0. Voici la séquence complète telle qu'elle doit être implémentée :

**Étape 1 — Déclenchement**
L'utilisateur, connecté à son compte HubSpot Auditor, clique sur "Connecter un workspace HubSpot". Cette action est disponible depuis :
- La page de son tableau de bord, si aucun workspace n'est encore connecté (état vide)
- La section "Mes workspaces" de son profil, pour les connexions ultérieures

**Étape 2 — Génération du state anti-CSRF**
Le serveur HubSpot Auditor génère un token `state` aléatoire (recommandé : 32 octets en base64url, cryptographiquement sécurisé). Ce `state` est stocké en session serveur avec une durée de vie maximale de 5 minutes. Il ne doit pas être communiqué au client.

**Étape 3 — Redirection vers HubSpot**
L'utilisateur est redirigé vers l'endpoint d'autorisation HubSpot avec les paramètres suivants :

```
https://app.hubspot.com/oauth/authorize
  ?client_id={CLIENT_ID}
  &redirect_uri={REDIRECT_URI}
  &scope={SCOPES_ENCODÉS}
  &state={STATE}
```

Le `redirect_uri` doit correspondre exactement à l'URI enregistrée dans la Public App HubSpot Developer Portal.

**Étape 4 — Autorisation par l'utilisateur sur HubSpot**
L'utilisateur voit la page de consentement HubSpot avec le nom de l'application ("HubSpot Auditor") et la liste des permissions demandées. Il clique "Autoriser" ou "Annuler".

**Étape 5 — Retour sur HubSpot Auditor**
HubSpot redirige vers le `redirect_uri` avec deux paramètres :
- En cas de succès : `?code={AUTHORIZATION_CODE}&state={STATE}`
- En cas de refus : `?error=access_denied&state={STATE}`

**Étape 6 — Vérification anti-CSRF**
Le serveur compare le `state` reçu avec le `state` stocké en session. Si les deux valeurs ne correspondent pas ou si la session a expiré (> 5 min), la requête est rejetée avec un message d'erreur. Le `state` est immédiatement invalidé après utilisation (usage unique).

**Étape 7 — Échange du code contre des tokens**
Le serveur effectue une requête POST côté serveur (jamais côté client) vers :

```
POST https://api.hubapi.com/oauth/v1/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code={AUTHORIZATION_CODE}
&redirect_uri={REDIRECT_URI}
&client_id={CLIENT_ID}
&client_secret={CLIENT_SECRET}
```

Le `client_secret` ne doit jamais transiter par le client ni être exposé dans les logs.

**Étape 8 — Réception et stockage des tokens**
HubSpot retourne :

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 21600,
  "token_type": "bearer"
}
```

Les deux tokens sont immédiatement chiffrés et stockés en base de données côté serveur. Voir section 6.3 pour les détails de stockage.

**Étape 9 — Identification du workspace**
Le serveur appelle :

```
GET https://api.hubapi.com/oauth/v1/access-tokens/{ACCESS_TOKEN}
Authorization: Bearer {ACCESS_TOKEN}
```

Cette réponse retourne notamment :

```json
{
  "portal_id": 12345678,
  "hub_domain": "monentreprise.hubspot.com",
  "hub_id": 12345678,
  "user": "user@email.com",
  "scopes": ["crm.objects.contacts.read", "..."]
}
```

Ces métadonnées sont stockées en base de données et associées au workspace dans le compte utilisateur HubSpot Auditor.

**Étape 10 — Rattachement au compte utilisateur**
Le workspace (identifié par son `portal_id`) est rattaché au compte utilisateur HubSpot Auditor actuellement connecté. Si un workspace avec le même `portal_id` existe déjà sur ce compte, les tokens sont mis à jour (reconnexion). Si un workspace avec ce `portal_id` est déjà rattaché à un autre compte HubSpot Auditor, le rattachement est refusé avec un message d'erreur clair.

**Étape 11 — Redirection vers le tableau de bord**
L'utilisateur est redirigé vers le tableau de bord avec le workspace connecté visible. Un message de confirmation de type "Workspace [Nom] connecté avec succès" est affiché.

---

### 6.2 Scopes OAuth demandés

Les scopes demandés sont strictement limités aux besoins de la phase NOW. Aucun scope d'écriture ou de suppression ne doit jamais être demandé.

| Scope | Justification | Epic consommateur |
|---|---|---|
| `crm.objects.contacts.read` | Lire les records contacts pour calculer les taux de remplissage et détecter les incohérences | EP-02 |
| `crm.objects.companies.read` | Lire les records companies | EP-02 |
| `crm.objects.deals.read` | Lire les records deals | EP-02 |
| `crm.schemas.contacts.read` | Lire les définitions de propriétés custom contacts | EP-02 |
| `crm.schemas.companies.read` | Lire les définitions de propriétés custom companies | EP-02 |
| `crm.schemas.deals.read` | Lire les définitions de propriétés custom deals | EP-02 |
| `automation` | Lire les workflows HubSpot (définition, statut, statistiques d'erreurs) | EP-03 |

Note : les scopes `crm.objects.tickets.read`, `crm.schemas.tickets.read` et les scopes Custom Objects ne sont pas listés pour la v1, mais devront être ajoutés si l'audit des tickets et objets custom est activé. Cette évolution nécessite une re-demande de consentement auprès des utilisateurs existants.

---

### 6.3 Stockage sécurisé des tokens

| Donnée | Stockage | Durée de vie | Chiffrement | Exposé au client |
|---|---|---|---|---|
| `access_token` | Base de données serveur | 6 heures (valeur HubSpot par défaut) | Chiffré au repos (AES-256 ou équivalent) | Jamais |
| `refresh_token` | Base de données serveur | 30 jours sans activité | Chiffré au repos | Jamais |
| `portal_id` | Base de données serveur | Indéfini | Non requis (donnée non sensible) | Oui (affiché dans l'UI) |
| `hub_domain` | Base de données serveur | Indéfini | Non requis | Oui (affiché dans l'UI) |
| `state` anti-CSRF | Session serveur uniquement | 5 minutes maximum | Non persisté | Jamais |

**Règles impératives :**
- Les tokens ne sont jamais stockés dans le `localStorage` ou `sessionStorage` du navigateur
- Les tokens ne sont jamais transmis dans des cookies sans l'attribut `HttpOnly`
- Les tokens ne sont jamais journalisés (logs applicatifs, logs d'accès)
- Les tokens ne sont jamais inclus dans les réponses API retournées au client
- Le `client_secret` de la Public App HubSpot est stocké en variable d'environnement serveur, jamais en base de données ni en code source

---

### 6.4 Rafraîchissement automatique du token

L'access token HubSpot a une durée de vie de 6 heures. Le système doit le renouveler automatiquement via le refresh token sans interruption pour l'utilisateur.

**Déclenchement du refresh :**
Le serveur détecte que l'access token va expirer (recommandé : déclencher le refresh si `expires_at - now < 10 minutes`) ou reçoit une réponse HTTP 401 de l'API HubSpot.

**Requête de refresh :**

```
POST https://api.hubapi.com/oauth/v1/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token={REFRESH_TOKEN}
&client_id={CLIENT_ID}
&client_secret={CLIENT_SECRET}
```

HubSpot retourne un nouvel `access_token` et potentiellement un nouveau `refresh_token` (rotation de token). Le système doit mettre à jour les deux tokens en base de données et invalider les anciens.

**Cas d'échec du refresh :**
Si le refresh token est expiré (après 30 jours sans activité), révoqué, ou si la requête de refresh retourne une erreur `invalid_grant`, le système :
1. Supprime les tokens stockés pour ce workspace
2. Marque le workspace comme "déconnecté" dans le compte utilisateur
3. Notifie l'utilisateur via une bannière : "Votre connexion au workspace [Nom] a expiré. Reconnectez-vous pour lancer un nouvel audit."
4. Conserve intégralement tous les rapports d'audit précédents liés à ce workspace

---

### 6.5 Déconnexion et révocation

**Déconnexion initiée par l'utilisateur :**

Séquence à implémenter :
1. L'utilisateur clique "Déconnecter ce workspace" dans l'interface
2. Une confirmation est demandée ("Êtes-vous sûr ? Vos rapports seront conservés.")
3. Le serveur appelle l'endpoint de révocation HubSpot :
   ```
   POST https://api.hubapi.com/oauth/v1/token/revoke
   Content-Type: application/x-www-form-urlencoded

   token={REFRESH_TOKEN}&token_type_hint=refresh_token
   ```
4. Que la révocation HubSpot réussisse ou échoue (HubSpot peut retourner une erreur si le token est déjà révoqué), les tokens sont supprimés de la base de données HubSpot Auditor
5. Le workspace est marqué "déconnecté" mais conservé dans le compte utilisateur avec ses rapports
6. L'utilisateur peut reconnecter ce workspace ultérieurement

**Révocation initiée depuis HubSpot :**

Si un administrateur HubSpot révoque l'accès depuis l'interface HubSpot (Settings > Integrations > Connected Apps), le prochain appel API sur ce workspace retourne HTTP 401. Le système doit :
1. Détecter le 401 lors d'un appel API ou d'une tentative de refresh
2. Marquer le workspace comme "déconnecté"
3. Afficher un message clair à l'utilisateur : "L'accès à [Workspace] a été révoqué depuis HubSpot. Reconnectez-vous pour reprendre les audits."

---

### 6.6 Gestion des erreurs OAuth

#### Erreurs lors du flux d'autorisation (retour HubSpot avec paramètre `error`)

| Code d'erreur | Cause | Message utilisateur | Action proposée |
|---|---|---|---|
| `access_denied` | L'utilisateur a cliqué "Annuler" sur HubSpot ou l'admin a refusé | "Vous avez refusé l'accès. Les permissions sont nécessaires pour réaliser l'audit." | Bouton "Relancer la connexion" |
| `invalid_client` | Client ID ou secret invalide (erreur de configuration) | "Erreur de configuration de l'application. Contactez le support HubSpot Auditor." | Lien support |
| `invalid_grant` | Le code d'autorisation est expiré (> 10 min) ou déjà utilisé | "La session d'autorisation a expiré. Veuillez relancer la connexion." | Bouton "Relancer la connexion" |
| `invalid_scope` | Un scope demandé n'est pas supporté par HubSpot | "Erreur de configuration des permissions. Contactez le support HubSpot Auditor." | Lien support |
| `state` invalide | Tentative CSRF ou session expirée (> 5 min) | "La session a expiré. Veuillez relancer la connexion." | Bouton "Relancer la connexion" |

#### Erreurs lors des appels API post-connexion

| Code HTTP | Cause probable | Comportement système |
|---|---|---|
| 401 Unauthorized | Token expiré ou révoqué | Tenter un refresh ; si échec, marquer workspace déconnecté |
| 403 Forbidden | Scope insuffisant pour cette ressource | Continuer l'audit en mode partiel, logguer le scope manquant |
| 429 Too Many Requests | Rate limit HubSpot atteint | Retry avec backoff exponentiel (3 tentatives max, délai 1s / 2s / 4s) |
| 5xx Server Error | Erreur côté HubSpot | Retry une fois après 2s ; si persistant, marquer l'audit en erreur partielle |

#### Cas scopes insuffisants

Si l'utilisateur a autorisé la connexion mais que certains scopes ont été restreints par son administrateur HubSpot (exemple : le scope `automation` est désactivé au niveau du portail) :
- L'audit démarre normalement sur les domaines couverts par les scopes disponibles
- Les domaines non couverts sont exclus du calcul du score et affichent un avertissement explicite : "L'audit des workflows n'a pas pu être réalisé : le scope `automation` n'est pas disponible sur ce compte. Contactez votre administrateur HubSpot."
- L'audit partiel est présenté avec mention explicite des domaines non analysés
- Le score global est calculé uniquement sur les domaines disponibles

---

### 6.7 Identification et affichage du workspace

Après connexion réussie, les informations suivantes sont stockées et affichées dans l'interface :

| Information | Source API | Affichage dans l'UI |
|---|---|---|
| Nom du portail (Hub name) | `GET /oauth/v1/access-tokens/{TOKEN}` → champ `hub_domain` (déduire le nom depuis l'API si disponible) | En-tête de chaque rapport, section "Mes workspaces" |
| Hub ID / Portal ID | `portal_id` | Section "Mes workspaces", métadonnées de chaque rapport |
| Hub domain | `hub_domain` | Section "Mes workspaces" |
| Email de l'utilisateur HubSpot connecté | `user` | Affiché à titre informatif dans les détails de connexion |
| Scopes accordés | `scopes` | Non affiché directement, utilisé en interne pour déterminer le périmètre d'audit |
| Date de connexion | Timestamp généré côté HubSpot Auditor | Section "Mes workspaces" |

Ces informations sont incluses dans les métadonnées de chaque rapport d'audit généré pour ce workspace, y compris après déconnexion (les rapports restent accessibles et indiquent à quel workspace ils correspondent).

---

### 6.8 Gestion multi-workspaces

Décision PO confirmée : un compte HubSpot Auditor peut contenir plusieurs workspaces connectés (usage consultant).

**Règles de gestion :**
- Chaque workspace est identifié de manière unique par son `portal_id`
- Un même `portal_id` ne peut être rattaché qu'à un seul compte HubSpot Auditor à la fois (pas de partage de connexion entre comptes)
- L'affichage simultané de plusieurs workspaces dans une même vue est hors périmètre phase NOW — l'utilisateur sélectionne un workspace actif à la fois pour lancer un audit
- La liste des workspaces rattachés au compte (connectés et déconnectés) est accessible depuis la section "Mes workspaces"
- Chaque workspace déconnecté conserve ses rapports d'audit et peut être reconnecté

---

## 7. Dépendances & risques

### Dépendances

| Dépendance | Nature | Impact si bloquant |
|---|---|---|
| **EP-00 — Compte utilisateur** | Prérequis : le workspace OAuth est rattaché à un compte HubSpot Auditor existant | Bloquant — EP-01 ne peut pas fonctionner sans EP-00 |
| **HubSpot Developer Portal** | Création et validation de la Public App avec les scopes listés | Bloquant — délai de validation HubSpot à anticiper |
| **EP-02 — Audit propriétés** | Consomme le token OAuth produit par EP-01 | Dépendance en aval |
| **EP-03 — Audit workflows** | Consomme le token OAuth produit par EP-01 | Dépendance en aval |
| **EP-04 — Tableau de bord** | Affiche les métadonnées workspace identifiées par EP-01 | Dépendance en aval |

### Risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| R1 — Délai de validation de la Public App HubSpot | ~~Moyenne~~ **Résolu** | ~~Élevé~~ | **La Public App est déjà créée — ce risque est levé.** |
| R2 — Changement des scopes HubSpot disponibles | Faible | Moyen | Surveiller les changelogs HubSpot API ; documenter les scopes alternatifs |
| R3 — Utilisateur HubSpot sans droits admin | Moyenne | Moyen | Certains appels API peuvent retourner 403 sur des ressources restreintes. Gérer gracieusement en audit partiel (voir section 6.6) |
| R4 — Rate limiting HubSpot lors de l'audit | Moyenne | Moyen | Implémenter le retry avec backoff dès EP-01 (voir section 6.6) |
| R5 — Collision de portal_id entre comptes Auditor | Faible | Élevé (fuite de données) | Vérification stricte du rattachement avant toute connexion ; logs d'audit de sécurité |

### Questions ouvertes fermées par les décisions PO

| Question initiale | Décision PO |
|---|---|
| La Public App doit-elle être listée sur le Marketplace HubSpot ? | Non pour la v1. Décision post-validation marché. |
| Faut-il un compte utilisateur HubSpot Auditor ou la session OAuth suffit-elle ? | Compte utilisateur obligatoire (EP-00). La connexion OAuth est rattachée au compte. |
| Multi-workspace : dans une même session ou en séquentiel ? | Multi-workspace supporté sur un compte, mais affichage simultané reporté à NEXT phase. |
| Politique de rétention des rapports | Rapports conservés indéfiniment. |

---

## 8. Critères d'acceptance

Les critères suivants doivent tous être satisfaits pour que l'epic EP-01 soit considéré comme "Done" :

- [ ] Le flux OAuth 2.0 complet fonctionne de bout en bout : clic "Connecter" → page HubSpot → autorisation → retour sur HubSpot Auditor avec workspace identifié
- [ ] La vérification anti-CSRF du `state` est implémentée : un `state` invalide ou expiré bloque la connexion et affiche un message d'erreur
- [ ] Les tokens (`access_token`, `refresh_token`) sont stockés chiffrés côté serveur et ne sont jamais exposés au client (réponse API, localStorage, cookie sans HttpOnly)
- [ ] Le rafraîchissement automatique du token s'effectue en arrière-plan sans interruption de l'expérience utilisateur
- [ ] La déconnexion révoque le token côté HubSpot via l'API de révocation ET supprime les tokens côté HubSpot Auditor
- [ ] Les scopes demandés sont exclusivement les scopes de lecture listés en section 6.2 — aucun scope d'écriture ou de suppression n'est présent
- [ ] Le workspace connecté est affiché dans l'interface avec : nom du portail, Hub ID, hub domain
- [ ] Chaque erreur OAuth (refus, expiration, révocation, state invalide) produit un message utilisateur compréhensible et propose une voie de sortie (bouton de relance ou lien support)
- [ ] Le cas des scopes insuffisants est géré en mode audit partiel avec avertissement explicite sur les domaines non couverts — sans erreur bloquante
- [ ] Les rapports d'audit précédents sont conservés et accessibles après déconnexion puis reconnexion d'un workspace
- [ ] Un compte utilisateur HubSpot Auditor peut contenir plusieurs workspaces rattachés (test avec minimum 2 workspaces distincts)
- [ ] Un `portal_id` ne peut pas être rattaché simultanément à deux comptes HubSpot Auditor différents
- [ ] L'endpoint de callback OAuth est inaccessible sans `state` valide (protection CSRF active)
