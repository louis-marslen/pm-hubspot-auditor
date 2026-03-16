# PRD-09 — Audit des utilisateurs & équipes HubSpot

**Epic associé :** EP-09
**Version :** 1.0
**Date :** 2026-03-16
**Statut :** Prêt pour développement

---

## 1. Résumé exécutif

EP-09 définit le moteur d'analyse des utilisateurs et des équipes HubSpot : gouvernance des accès (Super Admins, rôles, différenciation des permissions), organisation des équipes (utilisateurs non assignés, équipes vides), et hygiène des comptes (utilisateurs potentiellement inactifs, owners sans objet CRM). L'audit applique 7 règles (U-01 à U-07) et calcule un score de santé "Utilisateurs & Équipes" contribuant au score global avec pondération égale entre domaines actifs.

En complément des règles scorées, le rapport inclut une section "Recommandations complémentaires" non scorée couvrant deux sujets que l'API HubSpot ne permet pas d'auditer automatiquement : les permissions granulaires (export, import, bulk delete) et l'optimisation des licences (sièges achetés vs attribués).

**Décisions PO actées dans ce PRD :**
- Les permissions granulaires (export, import, bulk delete) ne sont pas accessibles via l'API HubSpot → encart de recommandations manuelles dans le rapport (pas de scoring)
- Le nombre de licences achetées vs attribuées n'est pas exposé par l'API → même traitement (encart recommandation)
- Le seuil Super Admins est fixé à > 20% OU > 3 utilisateurs (le plus restrictif)
- Le seuil de différenciation des rôles est fixé à > 80% des utilisateurs partageant le même rôle
- L'historique de connexion (Enterprise only, 90 jours) est utilisé quand disponible ; sinon fallback sur owners sans objet CRM
- Domaine activé si ≥ 2 utilisateurs dans le workspace (un workspace solo n'a pas de problème de gouvernance)

---

## 2. Problème utilisateur

### Narrative du problème

**Je suis :** Thomas, Admin HubSpot dans une scale-up B2B de 200 personnes avec 45 utilisateurs HubSpot
- Mon entreprise a grandi vite — les utilisateurs HubSpot ont été ajoutés au fil des recrutements, souvent par copie des droits d'un collègue existant
- 3 personnes ont quitté l'entreprise depuis 6 mois, mais leurs comptes HubSpot sont toujours actifs
- Je soupçonne que la moitié des utilisateurs sont Super Admin "par défaut" parce que c'était plus simple au départ
- Des équipes ont été créées pour des projets passés et ne contiennent plus personne

**J'essaie de :**
- Avoir une vue claire de qui a accès à quoi dans mon CRM, identifier les comptes à désactiver et les droits à restreindre

**Mais :**
- HubSpot ne fournit pas de tableau de bord consolidé "gouvernance des accès"
- L'audit manuel utilisateur par utilisateur dans Settings est fastidieux (45 utilisateurs × vérification des rôles, équipes, dernière connexion)
- Aucune alerte native quand un utilisateur ne s'est pas connecté depuis longtemps

**Parce que :**
- La gouvernance des accès CRM n'est pas un sujet prioritaire pour les équipes produit HubSpot — c'est un angle mort

**Ce qui me fait ressentir :**
- Inquiet de laisser des failles de sécurité ouvertes (anciens employés avec accès au CRM)
- Frustré de ne pas pouvoir justifier auprès de ma direction que les licences HubSpot sont bien utilisées
- Démuni face à la dette de configuration accumulée (rôles identiques pour tous, équipes fantômes)

### Énoncé du problème

Les Admins HubSpot ont besoin d'un moyen d'auditer automatiquement la gouvernance des accès, la structure des équipes et l'activité des utilisateurs de leur workspace parce que HubSpot ne fournit aucune vue consolidée de la santé organisationnelle du compte, ce qui laisse des failles de sécurité et du gaspillage de licences passer inaperçus.

### Contexte

Un workspace HubSpot accumule des utilisateurs au fil de la croissance de l'entreprise. Les départs ne sont pas toujours reflétés (comptes non désactivés), les rôles sont souvent assignés par copie plutôt que par design, et les Super Admins se multiplient par commodité. Ces problèmes de gouvernance sont invisibles au quotidien mais représentent des risques de sécurité (accès non autorisé aux données CRM, export de données sensibles) et des coûts inutiles (licences attribuées à des utilisateurs inactifs).

### Problèmes spécifiques adressés

1. **Utilisateurs fantômes** : anciens employés ou prestataires dont les comptes sont encore actifs — faille de sécurité directe
2. **Sur-administration** : trop d'utilisateurs avec les droits Super Admin, augmentant la surface d'attaque et le risque d'erreur
3. **Absence de gouvernance des rôles** : tous les utilisateurs avec les mêmes droits, pas de principe du moindre privilège
4. **Structure d'équipes désorganisée** : utilisateurs non assignés à une équipe, équipes vides — impossible de segmenter les vues et les rapports
5. **Licences gaspillées** : owners sans aucune activité CRM, licences payées mais non utilisées

---

## 2bis. Personas & Jobs-to-be-Done

### Thomas Admin HubSpot *(persona primaire)*

**Jobs fonctionnels :**
- Identifier en moins de 2 minutes les utilisateurs à désactiver (inactifs, ex-employés)
- Vérifier que les droits Super Admin sont restreints au strict nécessaire
- S'assurer que chaque utilisateur est rattaché à une équipe

**Jobs sociaux :**
- Démontrer à sa direction que la gouvernance CRM est sous contrôle
- Justifier les dépenses de licences HubSpot avec des données d'utilisation

**Jobs émotionnels :**
- Ne plus avoir l'anxiété de ne pas savoir qui a accès au CRM
- Se sentir en maîtrise de la configuration du workspace

**Douleurs clés :**
- Aucune vue consolidée "gouvernance" dans HubSpot natif
- L'audit manuel est trop long pour être fait régulièrement

---

### Sophie RevOps Manager *(persona secondaire)*

**Jobs fonctionnels :**
- Vérifier que les équipes commerciales reflètent l'organisation réelle pour que les rapports par équipe soient fiables
- Identifier les owners sans activité CRM pour redistribuer les contacts/deals

**Douleurs clés :**
- Les rapports "par équipe" sont faussés quand des commerciaux ne sont pas dans la bonne équipe
- Des contacts orphelins sont assignés à des owners qui n'utilisent plus HubSpot

---

## 2ter. Contexte stratégique

**Lien avec la vision produit :** l'audit utilisateurs & équipes est le 5e domaine d'audit de HubSpot Auditor. C'est le premier domaine orienté gouvernance/sécurité (vs qualité des données pour les 4 précédents), ce qui élargit le positionnement du produit.

**Pourquoi maintenant :** après les 4 domaines de données (propriétés, contacts, companies, workflows), la gouvernance des accès est le sujet le plus souvent mentionné par les admins HubSpot. C'est aussi un sujet à forte valeur pour les consultants (Louis) qui auditent des workspaces clients — la sécurité des accès est un "quick win" toujours impressionnant en restitution.

**Indicateur différenciant :** HubSpot ne propose aucun audit de gouvernance natif. Les informations sont dispersées dans Settings > Users & Teams, difficiles à consolider. HubSpot Auditor offre une vue en un clic avec des recommandations priorisées.

---

## 2quart. Vue d'ensemble de la solution

Nous construisons un moteur d'analyse qui appelle les API HubSpot Settings (Users, Teams, Roles) et Owners, croise les données pour évaluer la gouvernance des accès, la structure des équipes et l'activité des utilisateurs, calcule un score de santé, et complète le rapport avec des recommandations manuelles sur les sujets non auditables par API.

**Comment ça fonctionne :**
1. Récupération de tous les utilisateurs via Settings Users API (`/settings/v3/users/`)
2. Récupération des équipes et leurs membres (`/settings/v3/users/teams`)
3. Récupération des rôles disponibles (`/settings/v3/users/roles`)
4. Récupération des owners avec statut archived (`/crm/v3/owners/?archived=false`)
5. Croisement owners ↔ objets CRM assignés (contacts, deals, companies)
6. (Si Enterprise) Récupération de l'historique de connexion (`/account-info/v3/activity/login`)
7. Application des 7 règles (U-01 à U-07)
8. Calcul du score de santé Utilisateurs & Équipes
9. Génération de la section "Recommandations complémentaires"

**Features clés :** détection des Super Admins en excès (U-02), utilisateurs inactifs (U-05), gouvernance des rôles (U-03, U-04), structure des équipes (U-01, U-06), owners inutilisés (U-07), recommandations manuelles (permissions granulaires, licences).

**Considérations UX :**
- **Parcours utilisateur :** l'audit utilisateurs & équipes s'exécute dans le flux d'audit global. Les résultats apparaissent comme un onglet "Utilisateurs & Équipes" dans la navigation intra-page sticky. Le badge de l'onglet affiche le nombre total de problèmes.
- **États clés :**
  - *Empty state* : si < 2 utilisateurs dans le workspace, le domaine n'apparaît pas dans la navigation. Mention dans les métadonnées.
  - *Loading* : pendant l'audit, l'étape "Analyse des utilisateurs & équipes" apparaît dans la progression.
  - *Succès* : la section affiche le score circle + décompte par criticité dans le header de section.
  - *Erreur* : si l'API Settings échoue (scope manquant), une alert rouge s'affiche avec mention du scope requis.
- **Composants UI existants à réutiliser :** `ScoreCircle`, `SeverityBadge`, `RuleCard`, `Badge`, `EmptyState`.
- **Nouveau pattern UI — Encart recommandation :** un bloc visuellement distinct (fond légèrement différent, icône ℹ️) qui contient des recommandations non scorées. Il doit être clairement séparé des règles scorées pour éviter la confusion.

---

## 3. Objectifs & métriques de succès

### Objectifs

| Objectif | Description |
|---|---|
| O1 — Sécurité des accès | Détecter les utilisateurs inactifs et la sur-administration pour réduire la surface d'attaque |
| O2 — Gouvernance des rôles | Évaluer la différenciation des permissions et identifier les configurations "tout le monde pareil" |
| O3 — Structure des équipes | Vérifier que les utilisateurs sont organisés en équipes et que les équipes ne sont pas fantômes |
| O4 — Sensibilisation | Alerter sur les sujets non auditables automatiquement (permissions granulaires, licences) |

### KPIs

| KPI | Cible | Méthode de mesure |
|---|---|---|
| Taux de workspaces avec ≥ 1 problème utilisateur détecté | > 70% | Analytics sur les audits exécutés |
| Taux de workspaces avec Super Admins en excès (U-02) | > 50% | Analytics |
| Durée médiane de l'audit utilisateurs | < 15 secondes | Monitoring temps d'exécution |
| Taux de lecture de la section recommandations (scroll) | > 40% | Analytics événement (si trackable) |

### Métriques garde-fous
- Aucune écriture ou modification dans HubSpot (non-destructif absolu)
- Les appels API Settings ne provoquent aucun changement de configuration
- La section recommandations ne doit jamais être confondue avec des règles scorées

---

## 4. Périmètre

### In scope

- 7 règles de détection (U-01 à U-07) avec scoring
- Calcul du score de santé Utilisateurs & Équipes avec contribution au score global
- Section "Recommandations complémentaires" non scorée (permissions granulaires, licences)
- Détection du mode Enterprise pour enrichir U-05 avec l'historique de connexion
- Fallback non-Enterprise pour U-05 (owners sans objet CRM)
- Grace period de 30 jours sur U-05 (comptes récents exclus)

### Out of scope (phase NOW)

- Modification des rôles ou permissions via l'API (l'outil est non-destructif)
- Audit des permissions granulaires par rôle (pas exposé par l'API HubSpot)
- Récupération du nombre de licences/sièges (pas d'endpoint API)
- Formulaire de saisie manuelle pour les informations non disponibles via API — LATER
- Recommandations de rôles/permissions optimaux basées sur le profil d'utilisation — LATER
- Deep links vers les paramètres utilisateurs HubSpot depuis le rapport — NEXT phase

---

## 5. User stories associées

| ID | Titre | Priorité |
|---|---|---|
| EP-09-S1 | Vue d'ensemble de l'audit utilisateurs & équipes | Must have |
| EP-09-S2 | Gouvernance des accès (Super Admins, rôles) | Must have |
| EP-09-S3 | Structure des équipes | Must have |
| EP-09-S4 | Détection des utilisateurs inactifs | Must have |
| EP-09-S5 | Recommandations complémentaires (non scorées) | Must have |

Les stories complètes avec leurs critères d'acceptance Given/When/Then sont définies dans le fichier `/epics/ep09-audit-utilisateurs-equipes.md`.

---

## 6. Spécifications fonctionnelles

### 6.1 Condition d'activation du domaine Utilisateurs & Équipes

Le domaine est activé si le workspace contient **≥ 2 utilisateurs**. Un workspace avec un seul utilisateur n'a pas de problème de gouvernance significatif. Si le domaine est désactivé, son poids est redistribué sur les domaines actifs.

### 6.2 Règles de gouvernance des accès (U-01 à U-04)

#### U-01 — Utilisateur sans équipe (Avertissement 🟡)

**Condition :** `primaryTeamId` null ET `secondaryTeamIds` vide (tableau vide ou absent)

**Affichage :** nombre total d'utilisateurs sans équipe + liste : email, nom complet, rôle assigné, date de création du compte.

**Impact business :** Un utilisateur sans équipe ne peut pas être ciblé par les vues d'équipe, les rapports par équipe, ni les règles d'attribution automatique. Les pipelines "par équipe" l'excluent silencieusement.

---

#### U-02 — Taux de Super Admins excessif (Critique 🔴)

**Condition :** (nombre d'utilisateurs avec `superAdmin` = true) / (nombre total d'utilisateurs) > 20% **OU** nombre de Super Admins > 3

**Seuils :**
- Workspace ≤ 5 utilisateurs : > 2 Super Admins déclenche la règle
- Workspace 6-15 utilisateurs : > 3 Super Admins OU > 20%
- Workspace > 15 utilisateurs : > 20% OU > 5 Super Admins

**Affichage :** nombre de Super Admins / nombre total d'utilisateurs + taux en % + liste des Super Admins (email, nom complet) + seuil recommandé.

**Impact business :** Chaque Super Admin a un accès complet en lecture, écriture, export et suppression sur toutes les données du CRM. Multiplier les Super Admins augmente le risque de suppression accidentelle, d'export non autorisé de données clients, et de modification involontaire de la configuration globale.

---

#### U-03 — Utilisateur sans rôle assigné (Avertissement 🟡)

**Condition :** `roleId` null ET `superAdmin` = false

**Note :** un utilisateur sans rôle ET non Super Admin a en pratique les permissions par défaut de HubSpot (qui varient selon le plan). L'absence de rôle explicite est un signal de configuration non intentionnelle.

**Affichage :** nombre total + liste : email, nom complet, équipe(s), date de création.

**Impact business :** Un utilisateur sans rôle explicitement assigné peut avoir des permissions par défaut trop larges ou trop restreintes selon le plan HubSpot. L'absence de rôle rend impossible l'audit des droits effectifs et crée une zone grise de gouvernance.

---

#### U-04 — Absence de différenciation des rôles (Avertissement 🟡)

**Condition :** > 80% des utilisateurs (hors Super Admins) partagent le même `roleId`

**Calcul :**
```
1. Exclure les Super Admins du calcul
2. Grouper les utilisateurs restants par roleId (null = un groupe à part)
3. Calculer le taux du groupe le plus représenté
4. Si taux > 80% → déclencher la règle
```

**Désactivation automatique :** règle non applicable si le workspace a ≤ 3 utilisateurs non-Super-Admin (trop peu pour juger de la différenciation).

**Affichage :** répartition des rôles (nom du rôle + nombre d'utilisateurs + %) sous forme de tableau trié par effectif décroissant. Le rôle dominant est mis en évidence.

**Impact business :** Si tous les utilisateurs ont le même rôle, c'est le signe que les permissions n'ont pas été configurées intentionnellement. Le principe du moindre privilège n'est pas respecté : des commerciaux ont probablement accès à des paramètres d'administration, et des marketeurs peuvent modifier des pipelines de vente.

---

### 6.3 Règles d'hygiène des comptes (U-05, U-07)

#### U-05 — Utilisateur potentiellement inactif (Critique 🔴)

Cette règle a deux modes de fonctionnement selon le plan HubSpot du workspace.

**Mode Enterprise (login history disponible) :**

**Condition :** utilisateur avec `superAdmin` = true OU rôle actif, ET aucune connexion réussie dans les 90 derniers jours (via `/account-info/v3/activity/login`).

**Détection du mode Enterprise :** appel à `/account-info/v3/activity/login` — si la réponse est 200, le mode Enterprise est activé. Si 403 ou 404, fallback sur le mode standard.

**Affichage :** nombre total + liste : email, nom complet, rôle, équipe, date de dernière connexion réussie (ou "Aucune connexion dans les 90 derniers jours").

**Mode standard (login history non disponible) :**

**Condition :** owner avec `archived` = false ET `createdAt` > 90 jours ET aucun objet CRM assigné (0 contacts owned + 0 deals owned + 0 companies owned).

**Logique :** un owner actif depuis plus de 6 mois qui ne possède aucun objet CRM est probablement un compte inutilisé. Ce critère est un proxy d'inactivité — moins précis que l'historique de connexion mais pertinent.

**Affichage :** nombre total + liste : email, nom complet, rôle, équipe, date de création du compte, mention "Aucun objet CRM assigné (contacts, deals, companies)".

**Note importante dans le rapport :** en mode standard, un disclaimer s'affiche : "L'historique de connexion n'est disponible que sur les comptes HubSpot Enterprise. Cette détection se base sur l'absence d'objets CRM assignés — certains utilisateurs (ex: management, consultation seule) peuvent être actifs sans posséder d'objets."

**Grace period :** comptes créés il y a moins de 30 jours exclus (nouvel employé en onboarding).

---

#### U-07 — Owner sans objet CRM assigné (Info 🔵)

**Condition :** owner avec `archived` = false ET 0 contacts assignés (via `hubspot_owner_id`) ET 0 deals assignés ET 0 companies assignées.

**Distinction avec U-05 :** U-05 détecte les comptes probablement inactifs (critère de temps + absence d'objets). U-07 détecte tous les owners sans objet, y compris les récents, comme signal de licence potentiellement sous-utilisée.

**Vérification des objets assignés :**
```
Pour chaque owner (non archived) :
  1. POST /crm/v3/objects/contacts/search
     filter: hubspot_owner_id = owner.id, limit=1
     → si total > 0 : owner a des contacts
  2. POST /crm/v3/objects/deals/search
     filter: hubspot_owner_id = owner.id, limit=1
     → si total > 0 : owner a des deals
  3. POST /crm/v3/objects/companies/search
     filter: hubspot_owner_id = owner.id, limit=1
     → si total > 0 : owner a des companies
  Si les 3 = 0 → déclencher la règle
```

**Optimisation :** batcher les recherches pour limiter les appels API. Stopper dès qu'un objet est trouvé (court-circuit).

**Affichage :** nombre total + liste : email, nom complet, rôle, équipe, date de création.

**Impact business :** Chaque owner sans objet CRM représente potentiellement une licence HubSpot payée mais non exploitée. Sur un plan Sales Hub ou Service Hub, le coût par siège peut atteindre 90-150 €/mois.

---

### 6.4 Règles de structure des équipes (U-01, U-06)

#### U-06 — Équipe vide (Info 🔵)

**Condition :** équipe avec 0 utilisateurs dans `userIds` ET 0 utilisateurs dans `secondaryUserIds`.

**Affichage :** nombre total d'équipes vides + liste : nom de l'équipe, ID.

**Impact business :** Une équipe vide est de la configuration orpheline. Elle peut être le signe d'une réorganisation non finalisée ou d'un projet abandonné. Elle pollue les menus de filtrage par équipe et peut induire en erreur les utilisateurs qui pensent qu'une équipe est active.

---

### 6.5 Comptage des problèmes pour le scoring

| Type de règle | Comptage |
|---|---|
| U-01 — Utilisateur sans équipe | 1 problème par utilisateur concerné |
| U-02 — Super Admins en excès | 1 problème unique si seuil franchi |
| U-03 — Utilisateur sans rôle | 1 problème par utilisateur concerné |
| U-04 — Absence différenciation rôles | 1 problème unique si seuil franchi |
| U-05 — Utilisateur inactif | 1 problème par utilisateur concerné |
| U-06 — Équipe vide | 1 problème par équipe concernée |
| U-07 — Owner sans objet CRM | 1 problème par owner concerné |

---

### 6.6 Calcul du score de santé Utilisateurs & Équipes

**Formule :**

```
Score_utilisateurs = 100
  − (nb_critiques × 5)     → plafonné à −30
  − (nb_avertissements × 2) → plafonné à −15
  − (nb_infos × 0,5)        → plafonné à −5

Score_utilisateurs = max(0, Score_utilisateurs)
```

**Niveaux de lecture du score :**

| Score | Label | Couleur |
|---|---|---|
| 0 – 49 | Critique | Rouge 🔴 |
| 50 – 69 | À améliorer | Orange 🟡 |
| 70 – 89 | Bon | Vert 🟢 |
| 90 – 100 | Excellent | Vert foncé ✅ |

**Contribution au score global :**

```
Score_global = moyenne pondérée à poids égaux des domaines actifs

Avec EP-09 (5 domaines possibles) :
Score_global = (Score_proprietes + Score_contacts + Score_companies + Score_workflows + Score_utilisateurs) / 5

Si un domaine est inactif :
Score_global = somme des scores actifs / nombre de domaines actifs
```

---

### 6.7 Section "Recommandations complémentaires" (non scorée)

Cette section apparaît après les règles scorées, visuellement distincte (encart avec fond différencié, icône ℹ️, titre "Recommandations — vérifications manuelles"). Elle ne contribue pas au score.

#### Recommandation R1 — Permissions granulaires

**Titre :** Vérifiez les permissions critiques de vos utilisateurs

**Contenu :**
> L'API HubSpot ne permet pas d'auditer les permissions détaillées par rôle. Nous vous recommandons de vérifier manuellement dans **Settings > Users & Teams > Roles** que les droits suivants sont restreints au strict nécessaire :
>
> - **Export de données** : seuls les managers et admins devraient pouvoir exporter des contacts, deals ou companies
> - **Import de données** : limiter aux utilisateurs formés pour éviter les doublons et les erreurs de mapping
> - **Suppression en masse (bulk delete)** : restreindre aux admins uniquement — une suppression accidentelle peut être irréversible
> - **Modification des propriétés et pipelines** : limiter aux RevOps / admins pour éviter les dérives de configuration
>
> **Bonne pratique :** créez un rôle par profil métier (Commercial, Marketing, Support, Admin) avec les permissions minimales nécessaires.

#### Recommandation R2 — Optimisation des licences

**Titre :** Vérifiez l'utilisation de vos licences HubSpot

**Contenu :**
> Le nombre de sièges achetés vs attribués n'est pas accessible via l'API HubSpot. Nous vous recommandons de vérifier dans **Settings > Account & Billing > Seats** :
>
> - Le nombre de sièges **Core Seat** achetés vs attribués
> - Le nombre de sièges **Sales Hub** achetés vs attribués
> - Le nombre de sièges **Service Hub** achetés vs attribués
>
> Si des sièges sont attribués à des utilisateurs identifiés comme inactifs (règle U-05) ou sans activité CRM (règle U-07), envisagez de les révoquer pour réduire votre facture.
>
> **Estimation :** chaque siège Sales Hub inutilisé représente 90-150 €/mois selon votre plan.

---

### 6.8 Traductions business par règle

| Règle(s) | Titre business | Estimation d'impact | Urgence |
|---|---|---|---|
| U-01 | **Utilisateurs invisibles dans les rapports d'équipe** | Des utilisateurs sans équipe sont exclus des vues par équipe, des rapports d'activité commerciale et des règles d'attribution automatique. Leur travail dans HubSpot n'apparaît nulle part dans le reporting d'équipe. | Moyen |
| U-02 | **Surface d'attaque élargie par excès de Super Admins** | Chaque Super Admin peut exporter toutes les données, supprimer des objets en masse et modifier la configuration globale. Plus il y en a, plus le risque d'erreur humaine ou de fuite de données augmente. | Élevé |
| U-03 | **Zone grise de gouvernance** | Des utilisateurs sans rôle explicite ont des permissions non maîtrisées. Impossible de savoir qui peut faire quoi — la gouvernance repose sur des hypothèses au lieu de règles configurées. | Moyen |
| U-04 | **Principe du moindre privilège non respecté** | Si tous les utilisateurs ont le même rôle, des commerciaux ont probablement accès à des paramètres d'administration et des marketeurs peuvent modifier des pipelines de vente. Le risque d'erreur de configuration augmente avec chaque utilisateur. | Moyen |
| U-05 | **Comptes fantômes — faille de sécurité** | Des comptes d'anciens employés ou prestataires encore actifs dans HubSpot représentent un risque direct de fuite de données. Chaque jour où ces comptes restent ouverts est un jour d'exposition. | Élevé |
| U-06 | **Configuration orpheline** | Des équipes vides polluent les menus de filtrage et peuvent induire en erreur les utilisateurs. Elles sont le signe d'une réorganisation non finalisée. | Faible |
| U-07 | **Licences potentiellement gaspillées** | Des comptes owner sans aucun objet CRM assigné (0 contacts, 0 deals, 0 companies) représentent des licences probablement payées mais non exploitées. | Faible |

---

### 6.9 Présentation des résultats dans le rapport

#### Structure de la section Utilisateurs & Équipes dans le rapport

1. **En-tête de domaine** : score de santé (sur 100) avec label coloré + décompte synthétique (X critiques / Y avertissements / Z infos)
2. **Résumé** : nombre total d'utilisateurs, nombre d'équipes, nombre de rôles distincts
3. **Bloc Sécurité** : U-02 (Super Admins), U-05 (inactifs) — les règles critiques en premier
4. **Bloc Gouvernance** : U-03 (sans rôle), U-04 (pas de différenciation)
5. **Bloc Équipes** : U-01 (sans équipe), U-06 (équipes vides)
6. **Bloc Activité** : U-07 (owners sans objet CRM)
7. **Bloc Impact business** : regroupé par thème, visible si au moins une règle est déclenchée
8. **Bloc Recommandations complémentaires** : R1 (permissions), R2 (licences) — toujours affiché, visuellement distinct

#### Règles d'affichage

- Si une règle ne détecte aucun problème : afficher "✅ Aucun problème détecté"
- Les listes d'utilisateurs sont toujours triées par date de création descendante (les plus anciens en dernier — les plus récents en premier pour U-05)
- Si une liste dépasse 20 items : pagination avec 20 items par page
- Le disclaimer Enterprise sur U-05 est affiché en mode standard (non-Enterprise)

---

### 6.10 Appels API HubSpot nécessaires

| Information récupérée | Endpoint HubSpot | Usage |
|---|---|---|
| Liste des utilisateurs | `GET /settings/v3/users/` | Toutes les règles |
| Détail utilisateur (rôle, équipe, superAdmin) | `GET /settings/v3/users/{userId}` | U-01, U-02, U-03, U-04, U-05 |
| Liste des équipes et membres | `GET /settings/v3/users/teams` | U-01, U-06 |
| Liste des rôles | `GET /settings/v3/users/roles` | U-04 (noms des rôles) |
| Owners (actifs) | `GET /crm/v3/owners/?archived=false` | U-05, U-07 |
| Historique de connexion (Enterprise) | `GET /account-info/v3/activity/login` | U-05 (mode Enterprise) |
| Contacts par owner | `POST /crm/v3/objects/contacts/search` (filter hubspot_owner_id) | U-07 |
| Deals par owner | `POST /crm/v3/objects/deals/search` (filter hubspot_owner_id) | U-07 |
| Companies par owner | `POST /crm/v3/objects/companies/search` (filter hubspot_owner_id) | U-07 |

**Scopes OAuth requis :**
- `settings.users.read` — Settings Users API (utilisateurs, équipes, rôles)
- `crm.objects.owners.read` — Owners API
- `crm.objects.contacts.read` — vérification objets assignés (U-07)
- `crm.objects.deals.read` — vérification objets assignés (U-07)
- `crm.objects.companies.read` — vérification objets assignés (U-07)
- `account-info.security.read` — historique de connexion (Enterprise, optionnel)

**Gestion du scope optionnel :** si `account-info.security.read` n'est pas accordé, l'audit fonctionne en mode standard (fallback U-05). Aucune erreur visible pour l'utilisateur.

**Performance attendue :** l'audit utilisateurs est léger en volume de données (rarement > 200 utilisateurs). La partie la plus coûteuse est U-07 (vérification des objets par owner) qui nécessite 3 appels search par owner — à batcher.

---

## 7. Dépendances & risques

### Dépendances

| Dépendance | Nature | Impact si bloquant |
|---|---|---|
| **EP-01 — Connexion HubSpot OAuth** | Prérequis : token d'accès valide avec les scopes nécessaires | Bloquant — aucun appel API possible sans token |
| **EP-01 — Scopes OAuth** | Les scopes `settings.users.read` et `account-info.security.read` doivent être demandés lors de l'autorisation OAuth | Si non demandés, l'audit utilisateurs sera partiellement ou totalement indisponible |
| **EP-04 — Tableau de bord** | Consomme le score Utilisateurs et les résultats. La formule du score global doit intégrer le nouveau domaine | Mise à jour du calcul du score global nécessaire |
| **EP-UX-02 — Progression d'audit** | Le tracker de progression doit inclure l'étape "Utilisateurs & Équipes" | Ajout d'une étape dans le tracker |

### Risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| R1 — Scope `settings.users.read` non accordé par l'utilisateur | Moyenne | Élevé (domaine entièrement indisponible) | Vérifier les scopes au lancement de l'audit ; afficher un message clair si le scope est manquant avec lien pour re-autoriser |
| R2 — Faux positifs U-05 en mode standard (owners sans objet ≠ inactifs) | Moyenne | Moyen (perte de confiance) | Disclaimer clair dans le rapport + criticité adaptée (les utilisateurs "consultation seule" existent) |
| R3 — U-07 lent sur workspaces avec beaucoup d'owners | Faible | Moyen | Batcher les appels search ; court-circuiter dès qu'un objet est trouvé ; limiter à 100 owners max |
| R4 — Seuils U-02 trop stricts ou trop laxistes | Moyenne | Faible | Seuils adaptatifs par taille de workspace (voir section 6.2) |
| R5 — Login history API limité à 90 jours | Faible | Faible | Documenter la limitation ; 90 jours sans connexion est déjà un signal fort |

### Questions ouvertes

| Question | Décision |
|---|---|
| Scope `settings.users.read` : le demander dès l'installation (OAuth initial) ou en lazy ? | ✅ Décidé : dès la connexion OAuth |
| Scope `account-info.security.read` : même question ? | ✅ Décidé : dès la connexion OAuth |
| U-05 seuil d'inactivité en mode standard : combien de jours ? | ✅ Décidé : 90 jours (aligné avec le seuil Enterprise) |
| U-02 seuils adaptatifs : les 3 paliers (≤5, 6-15, >15) sont-ils pertinents ? | ✅ Décidé : validé |
| Faut-il distinguer les owners des users dans le rapport (un user n'est pas forcément un owner) ? | ✅ Décidé : tout présenter comme "utilisateurs" |

---

## 8. Critères d'acceptance

- [ ] Les 7 règles U-01 à U-07 sont détectées et affichées correctement sur un workspace de test
- [ ] U-02 applique les seuils adaptatifs par taille de workspace
- [ ] U-04 est désactivée si ≤ 3 utilisateurs non-Super-Admin
- [ ] U-05 fonctionne en mode Enterprise (login history) et en mode standard (fallback owners sans objets)
- [ ] U-05 exclut les comptes créés il y a moins de 30 jours (grace period)
- [ ] U-05 affiche un disclaimer en mode standard
- [ ] U-07 court-circuite la vérification dès qu'un objet CRM est trouvé pour un owner
- [ ] Le score Utilisateurs & Équipes est calculé selon la formule définie en section 6.6
- [ ] Le score global redistribue les poids également entre les domaines actifs
- [ ] La section "Recommandations complémentaires" (R1, R2) s'affiche toujours, distincte visuellement des règles scorées
- [ ] Les recommandations R1 et R2 ne contribuent pas au score
- [ ] Chaque problème détecté affiche son impact business correspondant (titre, estimation, urgence)
- [ ] Les listes de résultats dépassant 20 items sont paginées
- [ ] L'audit est non-destructif : aucune requête en écriture ni en suppression n'est envoyée à HubSpot
- [ ] Un workspace avec < 2 utilisateurs affiche un état vide avec mention "domaine non analysé"
- [ ] Si le scope `settings.users.read` est manquant, une erreur claire s'affiche avec instructions de re-autorisation
