# PRD-03 — Audit des workflows HubSpot

**Epic associé :** EP-03
**Phase :** NOW (v1)
**Statut :** Prêt pour développement
**Dernière mise à jour :** 2026-03-12
**Auteur :** Product Management

---

## 1. Résumé exécutif

L'audit des workflows est l'un des deux domaines d'analyse couverts par HubSpot Auditor en phase NOW. Il représente 50 % du score de santé global du workspace.

Ce module analyse automatiquement l'ensemble des workflows HubSpot d'un compte (tous types confondus) et détecte 7 catégories de problèmes, classées par criticité. Pour chaque problème, une traduction en impact business est fournie afin de permettre au RevOps Manager ou au consultant de prioriser ses actions correctives et de justifier ces interventions auprès de sa direction.

L'audit est strictement non-destructif : l'outil ne modifie, n'active ni ne désactive aucun workflow.

---

## 2. Problème utilisateur

### Narrative du problème

**Je suis :** Sophie, RevOps Manager responsable des automatisations HubSpot
- Je découvre les workflows cassés quand un client se plaint ou qu'un commercial me signale qu'une relance automatique n'est jamais partie
- J'ai 80+ workflows dont je ne sais plus exactement lesquels sont actifs, lesquels fonctionnent, et lesquels ont été abandonnés
- Je passe du temps à "naviguer" dans les workflows pour comprendre ce qui tourne — sans vue consolidée

**J'essaie de :**
- Détecter en quelques secondes tous les workflows problématiques de mon workspace, avec leur impact business, pour corriger en priorité ce qui fait le plus de dégâts

**Mais :**
- Les workflows en erreur ne génèrent pas d'alerte visible dans HubSpot (erreur silencieuse)
- Il n'existe pas de vue "état de santé global des workflows" dans l'interface HubSpot native
- Un audit manuel prend plusieurs heures et reste incomplet selon les droits et la mémoire des personnes

**Parce que :**
- HubSpot ne fournit pas nativement de rapport sur l'état des workflows — ni les erreurs, ni l'activité, ni la gouvernance

**Ce qui me fait ressentir :**
- Anxieuse à l'idée qu'une automatisation critique soit cassée sans que je le sache
- Frustrée de découvrir les problèmes trop tard, après un impact client
- Dépassée par la complexité d'un workspace dont les workflows se sont accumulés sans nettoyage

### Énoncé du problème

Les RevOps Managers ont besoin d'un moyen de détecter automatiquement les workflows HubSpot problématiques parce qu'ils passent inaperçus jusqu'à un incident client, ce qui génère des pertes commerciales silencieuses et une dette de configuration croissante.

Les RevOps Managers et consultants HubSpot n'ont aujourd'hui aucun moyen automatisé de détecter l'état réel de leurs workflows. Les problèmes courants — workflows en erreur silencieuse, actifs mais vides, jamais déclenchés, ou abandonnés — passent inaperçus jusqu'à ce qu'un incident client ou une anomalie commerciale les révèle.

Les conséquences directes sont :
- Des leads non traités parce qu'une automatisation est cassée en production
- Des contacts qui entrent dans des workflows qui n'exécutent aucune action
- Une configuration CRM illisible qui ralentit chaque intervention et complique l'onboarding

Sans outil dédié, un audit manuel des workflows d'un workspace de taille moyenne prend plusieurs heures et reste incomplet car il dépend de la mémoire et des droits des personnes en charge.

---

## 2bis. Personas & Jobs-to-be-Done

### Sophie RevOps *(persona primaire)*

**Jobs fonctionnels :**
- Voir en 30 secondes quels workflows sont en erreur active et depuis quand
- Identifier les workflows actifs qui ne font rien (sans action configurée)
- Nettoyer les workflows zombies et abandonnés pour réduire la complexité

**Jobs sociaux :**
- Être perçue comme quelqu'un qui maîtrise ses automatisations et ne laisse pas des erreurs silencieuses impacter les clients

**Jobs émotionnels :**
- Se sentir en confiance que les automatisations critiques fonctionnent
- Éviter l'anxiété des incidents clients découverts trop tard

---

### Louis Consultant *(persona secondaire)*

**Jobs fonctionnels :**
- Évaluer en moins d'une heure la qualité des automatisations d'un client HubSpot
- Livrer un rapport sur la dette de workflows au kick-off d'une mission

**Douleurs clés :**
- Audit manuel des workflows fastidieux et dépendant des droits du compte client

---

## 2ter. Contexte stratégique

**Lien avec la vision produit :** les workflows en erreur silencieuse sont la cause la plus fréquente d'incidents CRM non détectés. Résoudre ce problème génère une valeur immédiatement visible et mesurable (correction dans les 14 jours suivant l'audit).

**Pourquoi maintenant :** EP-03 représente 50% du score global avec EP-02. Sans lui, le produit manque l'une des deux valeurs fondamentales de la v1.

**Indicateur clé de la valeur perçue :** 40% des utilisateurs corrigent au moins un workflow dans les 14 jours suivant leur premier audit — si cette métrique est atteinte, la valeur actionnable du produit est démontrée.

---

## 2quart. Vue d'ensemble de la solution

Nous construisons un moteur d'analyse des workflows qui appelle l'API HubSpot via le token OAuth (scope `automation`), applique 7 règles de détection sur l'ensemble des workflows du workspace, et présente chaque problème avec son impact business traduit en langage non technique.

**Comment ça fonctionne :**
1. Récupération de tous les workflows du workspace via l'API HubSpot (tous types)
2. Application des règles W1-W7 sur chaque workflow
3. Calcul du score de santé Workflows (50% du score global)
4. Présentation des résultats avec impact business par règle déclenchée

**Features clés :** détection W1-W7, délai de grâce 7 jours, gestion de l'ancienne génération HubSpot, workspace vide = pas d'erreur, score de santé, traductions business.

---

## 3. Objectifs & métriques de succès

### Objectif produit
Permettre à un RevOps Manager de détecter en moins de 30 secondes l'ensemble des workflows problématiques de son workspace, avec leur impact business associé.

### OKR rattaché
**Objectif :** Démontrer la valeur actionnable de HubSpot Auditor dès le premier audit.
**KR :** > 40 % des utilisateurs ayant effectué un audit corrigent au moins un workflow dans les 14 jours suivants.

### KPIs de l'epic
| Indicateur | Cible |
|---|---|
| Taux de correction workflow post-audit (14 jours) | > 40 % |
| Temps d'exécution de l'audit workflows (jusqu'à 200 workflows) | < 30 secondes |
| Taux de faux positifs signalés par les utilisateurs (beta) | < 5 % |

### Métriques garde-fous
- Aucune écriture, activation ou désactivation dans HubSpot (non-destructif absolu)
- Les workflows créés < 7 jours ne doivent déclencher aucune règle W2/W3/W6/W7
- Un workspace sans workflow doit s'afficher sans erreur et sans score pour ce domaine

---

## 4. Périmètre

### In scope
- Audit de tous les types de workflows HubSpot du workspace : Contact-based, Company-based, Deal-based, Ticket-based, Quote-based, Custom Object-based
- Détection des 7 règles de détection définies (W1 à W7)
- Présentation des résultats en deux niveaux : détail opérationnel + traduction en impact business
- Calcul d'un score de santé pour le domaine Workflows, contribuant à 50 % du score global en phase NOW
- Prise en charge des workflows de l'ancienne génération HubSpot ("Simple")

### Out of scope (phase NOW)
- Modification, activation ou désactivation de workflows — l'outil est strictement non-destructif
- Analyse du contenu des actions de workflow (vérifier si les actions sont bien configurées)
- Détection de workflows redondants (même logique métier dans deux workflows différents)
- Analyse des délais entre étapes de workflow
- Historique d'exécution au-delà de 90 jours (limite API HubSpot)
- Deep links directs vers les workflows dans HubSpot depuis le rapport — **décision PO confirmée hors scope phase NOW**
- Fonctionnalité "masquer / ignorer un problème" — **décision PO confirmée NEXT phase**

---

## 5. User stories associées

| ID | Résumé | Persona |
|---|---|---|
| EP-03 / S1 | Vue d'ensemble de l'audit workflows (résumé, score, comptage par criticité) | RevOps Manager, consultant |
| EP-03 / S2 | Détection et affichage des workflows critiques (W1 — erreur active, W2 — sans action) | RevOps Manager |
| EP-03 / S3 | Détection et affichage des workflows obsolètes (W3 — zombie, W4 — inactif long, W5 — inactif récent) | RevOps Manager |
| EP-03 / S4 | Détection des problèmes de gouvernance (W6 — nom non compréhensible, W7 — non rangé) | RevOps Manager |
| EP-03 / S5 | Impact business des problèmes détectés, en langage dirigeant | RevOps Manager, consultant |

---

## 6. Spécifications fonctionnelles

### 6.1 Périmètre d'analyse

L'audit porte sur **tous les workflows du workspace**, sans filtrage préalable par statut ou type. Les types pris en charge sont :
- Contact-based
- Company-based
- Deal-based
- Ticket-based
- Quote-based
- Custom Object-based
- Workflows de l'ancienne génération HubSpot ("Simple") — inclus et identifiés comme tels

### 6.2 Règles de détection

#### Tableau de synthèse

| ID | Nom | Condition de détection | Criticité |
|---|---|---|---|
| W1 | En erreur active | `error_rate` > 10 % sur les 30 derniers jours ET statut `active` | Critique |
| W2 | Sans action configurée | Statut `active` ET 0 action dans toutes les branches | Critique |
| W3 | Zombie | Statut `active` ET `last_enrollment_date` > 90 jours (ou null) ET `created_at` > 30 jours | Avertissement |
| W4 | Inactif depuis longtemps | Statut `inactive` ET date de désactivation > 90 jours | Avertissement |
| W5 | Inactif récent | Statut `inactive` ET date de désactivation ≤ 90 jours | Info |
| W6 | Nom non compréhensible | Nom correspond à au moins un pattern défini (voir 6.2.1) | Info |
| W7 | Non rangé dans un dossier | `folderId` = null | Info |

#### 6.2.1 Détail de la règle W1 — En erreur active

**Condition :** `error_rate` > 10 % ET statut `active`

**Calcul de l'error_rate :**
```
error_rate = (nombre_erreurs / nombre_enrôlements) × 100
```
Calculé sur la fenêtre glissante des **30 derniers jours**.

- Si `nombre_enrôlements` = 0 sur la période : le workflow ne peut pas déclencher W1 (division par zéro non applicable — rule W3 peut s'appliquer à la place).
- Si l'API HubSpot ne retourne pas directement ce ratio, il est calculé côté application à partir des données brutes retournées.

**Données affichées par workflow concerné :**
- Nom du workflow
- Type (Contact-based, Deal-based, etc.)
- Taux d'erreur (%)
- Nombre d'erreurs sur 30 jours
- Date de la dernière erreur connue
- Mention "Workflow ancienne génération" si applicable

**Tri par défaut :** taux d'erreur décroissant.

#### 6.2.2 Détail de la règle W2 — Sans action configurée

**Condition :** statut `active` ET 0 action dans toutes les branches du workflow (le trigger d'enrôlement est présent, mais les branches sont vides ou ne contiennent que des conditions sans actions terminales).

**Données affichées par workflow concerné :**
- Nom du workflow
- Type
- Date de création
- Nombre d'enrôlements totaux (depuis la création)

**Message explicatif affiché :** "Ce workflow se déclenche mais n'exécute aucune action — les contacts/records enrôlés ne sont pas traités."

#### 6.2.3 Détail de la règle W3 — Zombie

**Condition :** statut `active` ET (`last_enrollment_date` > 90 jours OU `last_enrollment_date` est null) ET `created_at` > 30 jours.

**Note sur les triggers rares (Q2 épic résolue) :** Les workflows à trigger rare par nature (ex. "deal atteint un montant de 100 K€") ne sont PAS exclus automatiquement de W3 en phase NOW. Cette situation sera gérée en beta sur la base des retours utilisateurs. Aucune exclusion automatique n'est implémentée.

**Données affichées par workflow concerné :**
- Nom du workflow
- Type
- Date de dernière activation du workflow
- Date du dernier enrôlement connu (ou "Jamais" si null)
- Nombre total d'enrôlements depuis la création

**Différenciation visuelle :**
- Workflows "jamais utilisés" (0 enrôlement total) : indicateur distinct des workflows "anciennement actifs" (enrôlements historiques mais plus récents).

#### 6.2.4 Détail de la règle W4 — Inactif depuis longtemps

**Condition :** statut `inactive` ET date de désactivation > 90 jours.

**Données affichées par workflow concerné :**
- Nom du workflow
- Type
- Date de désactivation
- Ancienneté de l'inactivité (en jours)

**Tri par défaut :** ancienneté de désactivation décroissante (les plus anciens en premier).

#### 6.2.5 Détail de la règle W5 — Inactif récent

**Condition :** statut `inactive` ET date de désactivation ≤ 90 jours.

**Données affichées par workflow concerné :**
- Nom du workflow
- Type
- Date de désactivation

**Message affiché :** "Ces workflows ont été désactivés récemment — vérifiez s'il s'agit d'une pause intentionnelle."

#### 6.2.6 Détail de la règle W6 — Nom non compréhensible

**Condition :** le nom du workflow correspond à au moins un des patterns suivants :
- Commence par "Copy of " (insensible à la casse) — pattern `/^copy of /i`
- Commence par "New workflow" (insensible à la casse) — pattern `/^new workflow/i`
- Correspond à "Workflow" suivi d'un ou plusieurs chiffres uniquement — pattern `/^workflow\s*\d+$/i`
- Longueur du nom < 5 caractères

**Données affichées par workflow concerné :**
- Nom actuel du workflow
- Pattern détecté (ex. "Nom générique : commence par 'Copy of'")

#### 6.2.7 Détail de la règle W7 — Non rangé dans un dossier

**Condition :** `folderId` = null (le workflow n'est assigné à aucun dossier dans HubSpot).

**Données affichées :**
- Pourcentage de workflows sans dossier sur le total des workflows du workspace
- Liste des workflows concernés avec : nom, type, statut (actif/inactif)

### 6.3 Cas particuliers et exclusions

#### Délai de grâce post-création
Tout workflow créé **il y a moins de 7 jours** (calculé à la date d'exécution de l'audit) est **exclu des règles W2, W3, W6 et W7**. Il reste inclus dans W1, W4 et W5 si les conditions sont remplies. Ce délai est appliqué pour éviter les faux positifs sur des configurations en cours de mise en place.

#### Workflows ancienne génération HubSpot
Les workflows de type "Simple" (ancienne génération HubSpot) sont inclus dans l'audit. Ils sont signalés avec la mention "Workflow ancienne génération" dans leur fiche détail. Toutes les règles applicables leur sont appliquées normalement.

#### Workspace sans aucun workflow
Si le workspace ne contient aucun workflow :
- Le message "Aucun workflow trouvé dans ce workspace" est affiché dans la section Workflows du rapport.
- Aucun score n'est calculé pour le domaine Workflows.
- Le score global est recalculé en redistribuant le poids sur les domaines disponibles (voir EP-04 pour la formule de redistribution).
- Aucune erreur n'est levée.

#### Erreur API sur un workflow spécifique
Si l'appel API pour un workflow spécifique échoue :
- Ce workflow est marqué "Non analysé" dans le rapport.
- Il est exclu du calcul du score Workflows.
- Un avertissement est affiché dans l'en-tête du rapport et dans les métadonnées de l'audit.
- Les autres workflows sont analysés normalement.

### 6.4 Calcul du score Workflows

Le score est calculé selon la formule suivante :

```
Score_workflows = 100
  − (nb_critiques × 5),    plafonné à −30 points maximum
  − (nb_avertissements × 2), plafonné à −15 points maximum
  − (nb_infos × 0,5),      plafonné à −5 points maximum

Score_workflows = max(0, Score_workflows)
```

**Définition des comptages :**
- `nb_critiques` = nombre total de workflows déclenchant W1 ou W2 (une même règle peut toucher plusieurs workflows ; chaque workflow déclenche au plus une règle critique)
- `nb_avertissements` = nombre total de workflows déclenchant W3 ou W4
- `nb_infos` = nombre total de workflows déclenchant W5, W6 ou W7 (un même workflow peut déclencher plusieurs règles info — chaque occurrence est comptée séparément)

**Exclusions du score :**
- Les workflows "Non analysés" (erreurs API) sont exclus du score.
- Si le workspace est vide (aucun workflow), aucun score n'est calculé pour ce domaine.

Le score Workflows contribue à **50 % du score global** en phase NOW.

### 6.5 Traductions business par règle

| Règle(s) | Titre business | Description de l'impact | Urgence |
|---|---|---|---|
| W1 | Automatisations cassées en production | Des actions censées se déclencher automatiquement (assignation de leads, relances, notifications) ne s'exécutent pas. Chaque erreur peut représenter un lead non traité ou une opportunité commerciale manquée. | Élevé |
| W2 | Workflows actifs qui ne font rien | Des contacts ou deals entrent dans un workflow, consomment des ressources, et ne reçoivent aucun traitement. Ces workflows créent une fausse impression d'automatisation sans aucun bénéfice réel. | Élevé |
| W3 | Automatisations fantômes — actives mais sans effet | Des workflows restent actifs alors qu'aucun record n'y entre. Soit le trigger ne correspond plus à la réalité du business, soit les données ont évolué. Risque de déclenchement massif non intentionnel si les données changent. | Moyen |
| W4 | Dette de configuration non traitée | Des workflows désactivés depuis plus de 3 mois encombrent la configuration et compliquent la compréhension du système. Ils représentent une charge cognitive pour toute personne qui doit intervenir sur le CRM. | Moyen |
| W6, W7 | Configuration illisible et non maintenable | Des workflows mal nommés et non organisés ralentissent chaque intervention sur le CRM. En cas de départ ou d'onboarding, personne ne comprend ce que font les automatisations sans investir plusieurs heures d'investigation. | Moyen |

### 6.6 États d'affichage du résumé workflows

| Situation | Affichage |
|---|---|
| Aucun problème détecté (toutes règles) | "✅ Aucun problème détecté sur les workflows de ce workspace." |
| Aucun workflow critique (W1, W2) | "✅ Aucun workflow en erreur active ni sans action." |
| Workflows non analysés (erreurs API) | Avertissement listé séparément — "X workflow(s) n'ont pas pu être analysés en raison d'erreurs API." |
| Workspace vide | "Aucun workflow trouvé dans ce workspace." — section sans score. |

---

## 7. Dépendances & risques

### Dépendances

| Dépendance | Nature | Statut |
|---|---|---|
| EP-01 — Connexion HubSpot OAuth | Bloquante — nécessite un token d'accès valide avec le scope `automation` pour appeler l'API Workflows | EP-01 doit être complété en premier |
| EP-04 — Tableau de bord & score de santé | Consommateur — EP-04 consomme le Score_workflows et la liste structurée des problèmes W1-W7 produits par cet epic | Interface de données à définir conjointement |

### Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| L'API HubSpot ne retourne pas directement `error_rate` pour W1 | Élevée | Moyen | Calculer le ratio côté application à partir des données brutes (nb_erreurs / nb_enrôlements × 100 sur 30 jours) — **décision PO confirmée** |
| Faux positifs sur W3 pour les workflows à trigger rare (ex. deals > 100 K€) | Moyenne | Moyen | Absence d'exclusion automatique en phase NOW — les retours beta permettront d'ajuster le seuil ou d'ajouter un mécanisme d'exclusion en NEXT phase — **décision PO confirmée** |
| Quota API HubSpot dépassé sur des workspaces avec > 200 workflows | Faible | Élevé | Pagination des appels API, gestion des erreurs 429 avec retry exponentiel |
| Workflows ancienne génération non couverts par les mêmes endpoints API | Moyenne | Moyen | Identifier les endpoints spécifiques aux workflows "Simple" lors du spike technique |

---

## 8. Critères d'acceptance

- [ ] Toutes les règles W1 à W7 sont détectées correctement sur un workspace de test contenant des workflows de chaque type (Contact-based, Deal-based, etc.)
- [ ] Le `error_rate` de W1 est calculé comme `(nb_erreurs / nb_enrôlements) × 100` sur les 30 derniers jours — **définition confirmée par le PO**
- [ ] Le délai de grâce de 7 jours post-création est respecté pour les règles W2, W3, W6 et W7
- [ ] Les workflows de l'ancienne génération HubSpot ("Simple") sont inclus dans l'audit et identifiés avec la mention appropriée
- [ ] Si le workspace ne contient aucun workflow, un message approprié s'affiche sans erreur et sans score pour ce domaine
- [ ] Le score Workflows est calculé conformément à la formule de la section 6.4 et est cohérent avec les problèmes détectés
- [ ] Chaque problème détecté affiche son impact business correspondant (titre, description, urgence) selon le tableau de la section 6.5
- [ ] Le temps d'exécution de l'audit workflows est inférieur à 30 secondes sur un workspace avec jusqu'à 200 workflows
- [ ] Les workflows non analysés (erreurs API) sont marqués "Non analysé", exclus du score, et listés dans un avertissement dédié
- [ ] L'audit est non-destructif : aucune écriture, modification, activation ni désactivation dans HubSpot n'est effectuée
- [ ] Les workflows déclenchant W3 différencient visuellement les workflows "jamais utilisés" (0 enrôlement total) des workflows "anciennement actifs"
- [ ] La règle W6 identifie correctement les 4 patterns de noms non compréhensibles définis
- [ ] La règle W7 affiche le pourcentage de workflows sans dossier sur le total

---

*Ce PRD ferme les questions ouvertes de l'epic EP-03 sur la base des décisions du PO :*
- *Q1 (calcul error_rate) : calculé côté application comme (nb_erreurs / nb_enrôlements) × 100 sur 30 jours*
- *Q2 (workflows à trigger rare) : pas d'exclusion automatique en phase NOW, traité en beta*
- *Q3 (deep links) : hors scope phase NOW — confirmé par le PO*
