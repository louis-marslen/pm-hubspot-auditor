# EP-09 — Audit des utilisateurs & équipes

## Hypothèse

Nous croyons qu'auditer automatiquement la gouvernance des accès (Super Admins, rôles, différenciation), la structure des équipes et l'activité des utilisateurs HubSpot permettra aux admins de détecter les failles de sécurité (comptes fantômes, sur-administration) et les gaspillages de licences — parce qu'aujourd'hui ces vérifications se font manuellement, utilisateur par utilisateur, dans les Settings HubSpot, et ne sont donc jamais faites régulièrement.

Nous mesurerons le succès via : taux de workspaces avec ≥ 1 problème utilisateur détecté (cible : > 70%) + taux de workspaces avec Super Admins en excès (cible : > 50%).

---

## Périmètre

### In scope
- 7 règles de détection (U-01 à U-07) avec scoring
- Calcul d'un score de santé Utilisateurs & Équipes (contribue au score global avec pondération égale entre domaines actifs)
- Détection automatique du mode Enterprise pour enrichir U-05 avec l'historique de connexion
- Fallback non-Enterprise pour U-05 (owners sans objet CRM depuis > 90 jours)
- Section "Recommandations complémentaires" non scorée (permissions granulaires, optimisation licences)
- Grace period de 30 jours sur U-05 (comptes récents exclus)
- Activation conditionnelle : domaine actif uniquement si ≥ 2 utilisateurs dans le workspace

### Out of scope
- Modification des rôles ou permissions (l'outil est non-destructif)
- Audit des permissions granulaires par rôle (pas exposé par l'API HubSpot)
- Récupération du nombre de licences/sièges (pas d'endpoint API)
- Formulaire de saisie manuelle — LATER
- Recommandations de rôles optimaux basées sur le profil d'utilisation — LATER
- Deep links vers les settings HubSpot depuis le rapport — NEXT phase

---

## User stories

### Story 1 — Vue d'ensemble de l'audit utilisateurs & équipes

**En tant que** Admin HubSpot
**je veux** voir un résumé consolidé de la gouvernance de mon workspace dès la fin de l'audit
**afin de** comprendre en 30 secondes si mes accès sont bien configurés et si des actions urgentes sont nécessaires

**Critères d'acceptance :**

*Scénario : Affichage du résumé*
**Étant donné** que l'audit du workspace est terminé
**Quand** j'accède à la section Utilisateurs & Équipes du rapport
**Alors** je vois :
- Le nombre total d'utilisateurs analysés
- Le nombre d'équipes configurées
- Le nombre de rôles distincts utilisés
- Le décompte des problèmes par criticité : 🔴 X critiques / 🟡 Y avertissements / 🔵 Z informations
- Le score de santé du domaine sur 100

*Scénario : Workspace avec < 2 utilisateurs*
**Étant donné** que le workspace ne contient qu'un seul utilisateur
**Quand** j'accède au rapport
**Alors** le domaine Utilisateurs & Équipes n'apparaît pas dans la navigation
**Et** une mention dans les métadonnées explique : "Domaine non analysé — un seul utilisateur dans ce workspace"
**Et** le poids du domaine est redistribué sur les domaines actifs

*Scénario : Scope manquant*
**Étant donné** que le scope `settings.users.read` n'a pas été accordé lors de l'autorisation OAuth
**Quand** l'audit tente d'analyser les utilisateurs
**Alors** une alert rouge s'affiche : "Impossible d'analyser les utilisateurs — le scope 'settings.users.read' n'est pas accordé"
**Et** un lien propose de re-autoriser l'application avec les scopes nécessaires

---

### Story 2 — Gouvernance des accès (Super Admins, rôles)

**En tant que** Admin HubSpot
**je veux** voir si mes utilisateurs ont des droits adaptés à leurs rôles réels
**afin de** réduire la surface d'attaque et appliquer le principe du moindre privilège

**Critères d'acceptance :**

*Scénario : Super Admins en excès (U-02)*
**Étant donné** que le workspace contient 12 utilisateurs dont 5 Super Admins
**Quand** je consulte la règle U-02
**Alors** je vois : "5 Super Admins sur 12 utilisateurs (42%)"
**Et** la liste des 5 Super Admins (email, nom)
**Et** le seuil recommandé pour cette taille de workspace (> 3 OU > 20%)
**Et** la criticité est 🔴 Critique

*Scénario : Seuil Super Admins respecté*
**Étant donné** que le workspace contient 20 utilisateurs dont 2 Super Admins (10%)
**Quand** l'audit est exécuté
**Alors** la règle U-02 affiche "✅ Aucun problème détecté"

*Scénario : Utilisateur sans rôle (U-03)*
**Étant donné** que le workspace contient des utilisateurs sans rôle assigné et non Super Admin
**Quand** je consulte la règle U-03
**Alors** je vois le nombre d'utilisateurs concernés + la liste (email, nom, équipe, date de création)

*Scénario : Absence de différenciation des rôles (U-04)*
**Étant donné** que 85% des utilisateurs non-Super-Admin partagent le même rôle
**Quand** je consulte la règle U-04
**Alors** je vois la répartition des rôles en tableau (nom du rôle, nombre d'utilisateurs, %)
**Et** le rôle dominant est mis en évidence
**Et** un message explique le risque : "La quasi-totalité de vos utilisateurs ont le même rôle — les permissions ne sont probablement pas adaptées aux besoins réels de chacun"

*Scénario : U-04 non applicable*
**Étant donné** que le workspace a ≤ 3 utilisateurs non-Super-Admin
**Quand** l'audit est exécuté
**Alors** la règle U-04 est désactivée avec mention : "Règle non applicable — trop peu d'utilisateurs pour évaluer la différenciation des rôles"

---

### Story 3 — Structure des équipes

**En tant que** RevOps Manager
**je veux** voir si mes utilisateurs sont correctement rattachés à des équipes et si des équipes fantômes existent
**afin de** fiabiliser les rapports par équipe et le routing des leads

**Critères d'acceptance :**

*Scénario : Utilisateurs sans équipe (U-01)*
**Étant donné** que le workspace contient des utilisateurs sans `primaryTeamId`
**Quand** je consulte la règle U-01
**Alors** je vois le nombre d'utilisateurs sans équipe + la liste (email, nom, rôle, date de création)
**Et** la criticité est 🟡 Avertissement

*Scénario : Équipes vides (U-06)*
**Étant donné** que le workspace contient des équipes avec 0 membres (primary et secondary)
**Quand** je consulte la règle U-06
**Alors** je vois le nombre d'équipes vides + la liste (nom de l'équipe, ID)
**Et** la criticité est 🔵 Info

*Scénario : Workspace sans équipes configurées*
**Étant donné** que le workspace n'a aucune équipe configurée
**Quand** l'audit est exécuté
**Alors** U-01 signale tous les utilisateurs comme "sans équipe"
**Et** U-06 affiche "✅ Aucune équipe vide" (car aucune équipe n'existe)

---

### Story 4 — Détection des utilisateurs inactifs

**En tant que** Admin HubSpot
**je veux** identifier les comptes utilisateurs qui ne sont plus actifs
**afin de** les désactiver pour fermer les failles de sécurité et potentiellement réduire mes coûts de licence

**Critères d'acceptance :**

*Scénario : Utilisateurs inactifs — mode Enterprise (U-05)*
**Étant donné** que le workspace est Enterprise et l'historique de connexion est disponible
**Quand** je consulte la règle U-05
**Alors** je vois la liste des utilisateurs sans connexion réussie dans les 90 derniers jours
**Et** chaque entrée affiche : email, nom, rôle, équipe, date de dernière connexion
**Et** la criticité est 🔴 Critique
**Et** les comptes créés il y a moins de 30 jours sont exclus

*Scénario : Utilisateurs inactifs — mode standard (U-05 fallback)*
**Étant donné** que le workspace n'est pas Enterprise (login history non disponible)
**Quand** je consulte la règle U-05
**Alors** je vois la liste des owners actifs créés depuis > 90 jours ET sans aucun objet CRM assigné
**Et** un disclaimer s'affiche : "L'historique de connexion n'est disponible que sur les comptes HubSpot Enterprise. Cette détection se base sur l'absence d'objets CRM assignés — certains utilisateurs (ex: management, consultation seule) peuvent être actifs sans posséder d'objets."
**Et** les comptes créés il y a moins de 30 jours sont exclus

*Scénario : Owners sans objet CRM (U-07)*
**Étant donné** que le workspace contient des owners actifs sans aucun contact, deal ni company assigné
**Quand** je consulte la règle U-07
**Alors** je vois le nombre d'owners concernés + la liste (email, nom, rôle, équipe, date de création)
**Et** la criticité est 🔵 Info
**Et** un message mentionne l'impact potentiel sur les licences

---

### Story 5 — Recommandations complémentaires (non scorées)

**En tant que** Admin HubSpot
**je veux** être alerté sur les aspects de gouvernance que l'outil ne peut pas auditer automatiquement
**afin de** savoir quoi vérifier manuellement pour compléter mon audit

**Critères d'acceptance :**

*Scénario : Affichage des recommandations*
**Étant donné** que l'audit utilisateurs est terminé
**Quand** je consulte la section Utilisateurs & Équipes du rapport
**Alors** je vois en bas de section un bloc "Recommandations — vérifications manuelles" visuellement distinct des règles scorées
**Et** ce bloc contient deux encarts :
- R1 — Permissions granulaires : avec les droits critiques à vérifier (export, import, suppression en masse, modification des propriétés/pipelines) et la bonne pratique (un rôle par profil métier)
- R2 — Optimisation des licences : avec les types de sièges à vérifier et le lien vers Settings > Account & Billing > Seats

*Scénario : Distinction visuelle*
**Étant donné** que je parcours la section Utilisateurs & Équipes
**Quand** j'arrive au bloc Recommandations
**Alors** le bloc est visuellement distinct : fond différencié, icône ℹ️, titre explicite
**Et** aucune indication de criticité (pas de badge 🔴/🟡/🔵)
**Et** aucun impact sur le score affiché

---

## Spécifications fonctionnelles

### Règles de détection complètes

#### Règles de gouvernance des accès

| ID | Règle | Condition | Criticité |
|---|---|---|---|
| U-01 | Utilisateur sans équipe | `primaryTeamId` null ET `secondaryTeamIds` vide | 🟡 Avertissement |
| U-02 | Super Admins en excès | Seuil adaptatif : ≤5 users → >2 SA / 6-15 users → >3 SA ou >20% / >15 users → >20% ou >5 SA | 🔴 Critique |
| U-03 | Utilisateur sans rôle | `roleId` null ET `superAdmin` false | 🟡 Avertissement |
| U-04 | Absence différenciation rôles | >80% des users non-SA partagent le même roleId. Désactivée si ≤3 users non-SA | 🟡 Avertissement |

#### Règles d'hygiène des comptes

| ID | Règle | Condition | Criticité |
|---|---|---|---|
| U-05 | Utilisateur inactif | Enterprise : 0 login 90j / Standard : owner créé >90j + 0 objets CRM. Grace period 30j | 🔴 Critique |
| U-06 | Équipe vide | 0 userIds ET 0 secondaryUserIds | 🔵 Info |
| U-07 | Owner sans objet CRM | Owner non-archived + 0 contacts + 0 deals + 0 companies assignés | 🔵 Info |

#### Recommandations non scorées

| ID | Recommandation | Contenu |
|---|---|---|
| R1 | Permissions granulaires | Vérifier export, import, bulk delete, modification propriétés/pipelines dans Settings > Users & Teams > Roles |
| R2 | Optimisation licences | Vérifier sièges Core/Sales/Service dans Settings > Account & Billing > Seats |

### Comptage des problèmes

| Règle | Comptage |
|---|---|
| U-01 | 1 par utilisateur sans équipe |
| U-02 | 1 unique si seuil franchi |
| U-03 | 1 par utilisateur sans rôle |
| U-04 | 1 unique si seuil franchi |
| U-05 | 1 par utilisateur inactif |
| U-06 | 1 par équipe vide |
| U-07 | 1 par owner sans objet CRM |

### Edge cases

| Cas | Traitement |
|---|---|
| Workspace < 2 utilisateurs | Domaine désactivé, poids redistribué |
| U-04 : ≤ 3 utilisateurs non-SA | Règle désactivée |
| U-05 : mode Enterprise non disponible | Fallback owners sans objet CRM + disclaimer |
| U-05 : comptes créés < 30 jours | Exclus (grace period) |
| U-07 : owner est aussi identifié par U-05 | Les deux règles remontent indépendamment (un même owner peut apparaître dans les deux) |
| Scope `settings.users.read` manquant | Alert rouge avec instructions de re-autorisation, domaine non analysé |
| Scope `account-info.security.read` manquant | Fallback silencieux vers mode standard (pas d'erreur) |

### Calcul du score Utilisateurs & Équipes

```
Score_utilisateurs = 100
  − (nb_critiques × 5)     → plafonné à −30
  − (nb_avertissements × 2) → plafonné à −15
  − (nb_infos × 0,5)        → plafonné à −5

Score_utilisateurs = max(0, Score_utilisateurs)
```

### Impact sur le score global

Après EP-09, le score global utilise une pondération égale entre domaines actifs :

```
Domaines actifs = [Propriétés, Contacts, Companies, Workflows, Utilisateurs]
  (exclure si domaine inactif)

Poids = 1 / nombre_domaines_actifs

Score_global = Σ (Score_domaine × Poids)
```

### Traductions business par règle

| Règle(s) | Titre business | Impact estimé | Urgence |
|---|---|---|---|
| U-01 | **Utilisateurs invisibles dans les rapports d'équipe** | Des utilisateurs sans équipe sont exclus des vues par équipe, des rapports d'activité commerciale et des règles d'attribution automatique. | Moyen |
| U-02 | **Surface d'attaque élargie par excès de Super Admins** | Chaque Super Admin peut exporter toutes les données, supprimer des objets en masse et modifier la configuration globale. | Élevé |
| U-03 | **Zone grise de gouvernance** | Des utilisateurs sans rôle explicite ont des permissions non maîtrisées. Impossible de savoir qui peut faire quoi. | Moyen |
| U-04 | **Principe du moindre privilège non respecté** | Si tous les utilisateurs ont le même rôle, des commerciaux ont probablement accès à des paramètres d'administration. | Moyen |
| U-05 | **Comptes fantômes — faille de sécurité** | Des comptes d'anciens employés encore actifs représentent un risque direct de fuite de données. | Élevé |
| U-06 | **Configuration orpheline** | Des équipes vides polluent les menus de filtrage et signalent une réorganisation non finalisée. | Faible |
| U-07 | **Licences potentiellement gaspillées** | Des comptes owner sans aucun objet CRM assigné représentent des licences probablement payées mais non exploitées. | Faible |

### Appels API HubSpot

| Endpoint | Usage | Scope requis |
|---|---|---|
| `GET /settings/v3/users/` | Liste des utilisateurs | `settings.users.read` |
| `GET /settings/v3/users/{userId}` | Détail utilisateur (rôle, équipe, superAdmin) | `settings.users.read` |
| `GET /settings/v3/users/teams` | Équipes et membres | `settings.users.read` |
| `GET /settings/v3/users/roles` | Rôles disponibles | `settings.users.read` |
| `GET /crm/v3/owners/?archived=false` | Owners actifs | `crm.objects.owners.read` |
| `GET /account-info/v3/activity/login` | Historique connexion (Enterprise) | `account-info.security.read` |
| `POST /crm/v3/objects/contacts/search` | Contacts par owner | `crm.objects.contacts.read` |
| `POST /crm/v3/objects/deals/search` | Deals par owner | `crm.objects.deals.read` |
| `POST /crm/v3/objects/companies/search` | Companies par owner | `crm.objects.companies.read` |

---

## Critères d'acceptance de l'epic

- [ ] Les 7 règles U-01 à U-07 sont détectées et affichées correctement sur un workspace de test
- [ ] U-02 applique les seuils adaptatifs par taille de workspace (≤5, 6-15, >15 utilisateurs)
- [ ] U-04 est désactivée si ≤ 3 utilisateurs non-Super-Admin
- [ ] U-05 fonctionne en mode Enterprise (login history) avec fallback silencieux en mode standard
- [ ] U-05 exclut les comptes créés il y a moins de 30 jours (grace period)
- [ ] U-05 affiche un disclaimer en mode standard (non-Enterprise)
- [ ] U-07 court-circuite la vérification dès qu'un objet CRM est trouvé pour un owner
- [ ] Le score Utilisateurs & Équipes est calculé selon la formule définie
- [ ] Le score global redistribue les poids également entre les domaines actifs
- [ ] La section Recommandations (R1, R2) s'affiche toujours, visuellement distincte
- [ ] Les recommandations R1 et R2 ne contribuent pas au score
- [ ] Chaque problème détecté affiche son impact business correspondant
- [ ] Les listes > 20 items sont paginées
- [ ] L'audit est non-destructif : aucune requête en écriture
- [ ] Un workspace < 2 utilisateurs affiche un état vide
- [ ] Scope manquant → alert claire avec instructions de re-autorisation

---

## Dépendances

- **EP-01** (Connexion HubSpot OAuth) : token d'accès valide + scopes `settings.users.read`, `crm.objects.owners.read`, `account-info.security.read` (optionnel)
- **EP-04** (Tableau de bord) : le score global doit intégrer le domaine Utilisateurs & Équipes
- **EP-UX-02** (Progression d'audit) : ajouter l'étape "Utilisateurs & Équipes" dans le tracker

---

## Questions ouvertes

| # | Question | Impact | Statut |
|---|---|---|---|
| Q1 | Scope `settings.users.read` : demandé dès l'OAuth initial ou en lazy ? | Impacte le flow d'autorisation | ✅ Décidé : dès la connexion OAuth |
| Q2 | Scope `account-info.security.read` : même question ? | Enterprise only | ✅ Décidé : dès la connexion OAuth |
| Q3 | U-05 seuil en mode standard : combien de jours ? | Impacte faux positifs | ✅ Décidé : 90 jours (au lieu de 180) |
| Q4 | U-02 seuils adaptatifs (3 paliers) : pertinents ? | Impacte la détection | ✅ Décidé : validé (≤5, 6-15, >15) |
| Q5 | Faut-il distinguer owners/users dans le rapport ? | UX du rapport | ✅ Décidé : tout présenter comme "utilisateurs" |
