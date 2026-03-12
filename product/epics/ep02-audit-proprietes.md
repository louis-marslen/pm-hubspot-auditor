# EP-02 — Audit des propriétés

## Hypothèse

Nous croyons que détecter et présenter automatiquement les problèmes de propriétés HubSpot (custom et système) avec leur impact business permettra aux RevOps Managers et consultants d'identifier rapidement la dette de configuration de leur workspace et de convaincre leur direction d'allouer du temps pour la corriger — parce qu'aujourd'hui cette analyse prend plusieurs heures de travail manuel et ne produit aucun argument business structuré.

Nous mesurerons le succès via : temps moyen pour obtenir un état des lieux complet des propriétés (cible : < 2 min vs. plusieurs heures en manuel) + taux d'utilisateurs ayant partagé le rapport à un tiers (cible : > 30% dans les 7 jours après l'audit).

---

## Périmètre

### In scope
- Audit des propriétés custom sur tous les objets HubSpot actifs du workspace : Contacts, Companies, Deals, Tickets (si l'objet est utilisé), Custom Objects (si des objets custom existent)
- Audit des propriétés système critiques sur Contacts, Companies et Deals
- Détection des 10 règles définies (P1 à P6 custom + P7 à P16 système)
- Présentation des résultats en deux niveaux : détail opérationnel + impact business
- Calcul d'un score de santé pour le domaine Propriétés (contribue à 50% du score global en phase NOW)

### Out of scope
- Modification ou suppression de propriétés (l'outil est non-destructif)
- Audit du contenu des valeurs (vérifier que les données sont "correctes" au-delà du typage)
- Suggestions de propriétés manquantes (on audite ce qui existe)
- Audit des options de propriétés de type dropdown (valeurs orphelines, doublons de valeurs)
- Tickets et Custom Objects : détection uniquement sur les règles P1, P2, P4, P5, P6 (pas de règles système spécifiques pour ces objets en phase NOW)

---

## User stories

### Story 1 — Vue d'ensemble de l'audit propriétés

**En tant que** RevOps Manager ou consultant
**je veux** voir un résumé consolidé de l'état des propriétés de mon workspace dès le lancement de l'audit
**afin de** comprendre en 30 secondes l'ampleur des problèmes avant de plonger dans le détail

**Critères d'acceptance :**

*Scénario : Affichage du résumé de l'audit propriétés*
**Étant donné** que l'audit du workspace est terminé
**Quand** j'accède à la section Propriétés du rapport
**Alors** je vois :
- Le nombre total de propriétés custom analysées par objet (Contacts : X, Companies : Y, Deals : Z, …)
- Le nombre total de règles system properties vérifiées
- Le décompte des problèmes par criticité : 🔴 X critiques / 🟡 Y avertissements / 🔵 Z informations
- Le score de santé du domaine Propriétés sur 100
- Un bandeau de statut global : Critique (0-40) / À améliorer (41-70) / Bon (71-90) / Excellent (91-100)

---

### Story 2 — Détection des propriétés custom problématiques

**En tant que** RevOps Manager
**je veux** voir la liste détaillée de toutes les propriétés custom problématiques, groupées par règle et par objet
**afin de** savoir exactement quelles propriétés nettoyer, archiver ou corriger

**Critères d'acceptance :**

*Scénario : Propriétés jamais renseignées (P1)*
**Étant donné** que le workspace contient des propriétés custom créées depuis plus de 3 mois
**Quand** je consulte la règle P1 dans le rapport
**Alors** je vois la liste des propriétés concernées avec pour chacune : nom du champ, objet HubSpot, date de création, groupe de propriété (si défini)
**Et** les propriétés sont triées par objet puis par date de création (les plus anciennes en premier)

*Scénario : Propriétés quasi-inutilisées (P2)*
**Étant donné** que le workspace contient des propriétés custom avec un faible taux de remplissage
**Quand** je consulte la règle P2
**Alors** je vois pour chaque propriété : nom, objet, taux de remplissage (%), nombre de records renseignés sur total de records
**Et** les propriétés sont triées par taux de remplissage croissant

*Scénario : Propriétés potentiellement redondantes (P3)*
**Étant donné** que plusieurs propriétés du même objet ont des libellés similaires
**Quand** je consulte la règle P3
**Alors** je vois les paires de propriétés concernées avec leur score de similarité
**Et** les deux propriétés de chaque paire sont affichées côte à côte avec leur taux de remplissage respectif

*Scénario : Mauvais typage probable (P6)*
**Étant donné** que certaines propriétés custom ont un type incohérent avec leur nom
**Quand** je consulte la règle P6
**Alors** je vois pour chaque propriété : nom, objet, type actuel, type suggéré, et la raison de la détection (ex. "Le libellé 'Code postal' suggère un type Nombre ou Texte à format contraint")

*Scénario : Aucun problème détecté*
**Étant donné** qu'aucune propriété custom ne déclenche une règle donnée
**Quand** je consulte cette règle dans le rapport
**Alors** je vois un état "✅ Aucun problème détecté" pour cette règle

---

### Story 3 — Détection des champs système critiques

**En tant que** RevOps Manager
**je veux** voir le taux de remplissage des champs système critiques et les incohérences de lifecycle stage
**afin de** mesurer la fiabilité de mes données de base et corriger les problèmes de segmentation

**Critères d'acceptance :**

*Scénario : Champs critiques vides (P7, P8, P9, P12, P13, P14)*
**Étant donné** que le workspace contient des contacts, companies ou deals
**Quand** je consulte la section champs système
**Alors** je vois pour chaque champ critique un indicateur visuel : taux de remplissage en % + barre de progression colorée (rouge si sous le seuil, vert si au-dessus)
**Et** le seuil attendu est affiché à côté de la valeur mesurée (ex. "67% — seuil recommandé : 80%")

*Scénario : Incohérences lifecycle stage (P10a)*
**Étant donné** que des contacts sont associés à des deals "Closed Won"
**Quand** je consulte la règle P10a
**Alors** je vois le nombre de contacts concernés avec un lien permettant de voir les exemples (5 contacts max en preview)
**Et** le message explique l'incohérence : "Ces contacts ont un deal gagné associé mais leur lifecycle stage n'est pas 'Customer'"

*Scénario : Propriétés obligatoires de stage non renseignées (P16)*
**Étant donné** que des deals sont dans des stages avec des propriétés obligatoires
**Quand** je consulte la règle P16
**Alors** je vois par stage de pipeline : le nombre de deals concernés et la liste des propriétés obligatoires manquantes
**Et** les deals sont triés par ancienneté dans le stage (les plus anciens en premier)

---

### Story 4 — Impact business des problèmes de propriétés

**En tant que** RevOps Manager ou consultant
**je veux** voir l'impact business estimé de chaque catégorie de problème détecté
**afin de** pouvoir présenter les enjeux à ma direction ou à mon client sans avoir à reformuler moi-même les problèmes techniques en langage business

**Critères d'acceptance :**

*Scénario : Affichage de l'impact business*
**Étant donné** que des problèmes de propriétés ont été détectés
**Quand** je consulte la section "Impact business" du domaine Propriétés
**Alors** pour chaque règle ayant au moins un problème détecté, je vois un encart avec :
- Un titre en langage business (pas technique)
- Une estimation d'impact (voir table des traductions ci-dessous)
- Un niveau d'urgence business : Élevé / Moyen / Faible

*Scénario : Export du résumé business*
**Étant donné** que j'ai un rapport d'audit avec des problèmes détectés
**Quand** je clique sur "Copier le résumé business"
**Alors** le texte des impacts business est copié dans le presse-papier dans un format lisible (liste à puces, en français)

---

## Spécifications fonctionnelles

### Règles de détection complètes

#### Propriétés custom

| ID | Règle | Condition précise | Criticité | Objets couverts |
|---|---|---|---|---|
| P1 | Jamais renseignée | `created_at` > 90 jours ET taux de remplissage = 0% | 🔴 | Contacts, Companies, Deals, Tickets*, Custom Objects* |
| P2 | Quasi-inutilisée | Taux de remplissage < 5% ET `created_at` > 90 jours ET taux ≠ 0% | 🟡 | Idem |
| P3 | Potentiellement redondante | Score de similarité Levenshtein > 80% entre deux propriétés du même objet | 🟡 | Idem |
| P4 | Sans description | Champ `description` null ou vide | 🔵 | Idem |
| P5 | Sans groupe | `groupName` = null ou groupe = "contactinformation" (groupe par défaut HubSpot) pour une custom property | 🔵 | Idem |
| P6 | Mauvais typage probable | Voir table des patterns ci-dessous | 🔴 | Idem |

*Si l'objet est utilisé (au moins 1 record existant)*

**Patterns de détection P6 — Mauvais typage :**

| Pattern de nom (regex insensible à la casse) | Type actuel détecté | Type attendu | Exemple |
|---|---|---|---|
| `code.?postal`, `zip`, `cp` | `string` | `number` ou `string` avec format | "code_postal" en texte libre |
| `siret`, `siren`, `tva`, `naf` | `string` | `string` avec format contraint ou `number` | "siret" en single-line text |
| `telephone`, `phone`, `tel`, `mobile` | `string` (non `phone_number`) | `phone_number` | "tel_mobile" en texte |
| `date.*naissance`, `birthday`, `birth` | `string` ou `number` | `date` | "date_de_naissance" en texte |
| `nombre.*`, `nb.*`, `count.*`, `quantite`, `quantity` | `string` | `number` | "nb_employes" en texte |
| `montant`, `budget`, `prix`, `revenue`, `ca` | `string` | `number` | "budget_annuel" en texte |
| `score`, `note`, `rating`, `rank` | `string` | `number` | "score_qualification" en texte |

#### Propriétés système — Contacts

| ID | Champ HubSpot | Condition | Criticité |
|---|---|---|---|
| P7 | `email` | Taux de remplissage < 80% sur tous les contacts | 🔴 |
| P8 | `firstname` ET `lastname` | Contact avec les deux champs vides simultanément | 🔴 |
| P9 | `lifecyclestage` | Taux de remplissage < 60% sur tous les contacts | 🔴 |
| P10a | `lifecyclestage` vs deals | Contact associé à ≥ 1 deal "Closed Won" ET `lifecyclestage` ≠ `customer` | 🔴 |
| P10b | `lifecyclestage` vs deals | Contact en `lifecyclestage` = `customer` ET 0 deal "Closed Won" associé | 🟡 |
| P10c | Distribution `lifecyclestage` | 0 contact en `MQL` ET 0 contact en `SQL` dans le workspace ET ≥ 1 deal actif | 🟡 |
| P10d | `lifecyclestage` vs deals | Contact en `lifecyclestage` = `subscriber` ou `lead` ET ≥ 1 deal actif associé | 🟡 |
| P11 | `associatedcompanyid` | Taux d'association < 60% sur tous les contacts (seuil abaissé — peut être un workspace B2C) | 🔴 |

> **Note P11 :** Si le workspace est détecté comme majoritairement B2C (0 companies créées), cette règle est automatiquement désactivée.

#### Propriétés système — Companies

| ID | Champ HubSpot | Condition | Criticité |
|---|---|---|---|
| P12 | `domain` | Taux de remplissage < 70% sur toutes les companies | 🔴 |

#### Propriétés système — Deals

| ID | Champ HubSpot | Condition | Criticité |
|---|---|---|---|
| P13 | `amount` | Taux de remplissage < 70% sur les deals en statut `open` | 🔴 |
| P14 | `closedate` | Taux de remplissage < 70% sur les deals en statut `open` | 🔴 |
| P15 | `createdate` | Deal en statut `open` ET `createdate` > 60 jours | 🟡 |
| P16 | Required properties | Deal dont au moins une propriété obligatoire de son stage de pipeline actuel est vide | 🔴 |

### Calcul du score Propriétés

```
Score_propriétés = 100
  - (nb_critiques × 5), plafonné à -30
  - (nb_avertissements × 2), plafonné à -15
  - (nb_infos × 0.5), plafonné à -5

Score_propriétés = max(0, Score_propriétés)
```

Le score propriétés contribue à **50% du score global** en phase NOW.

### Traductions business par règle

| Règle(s) | Titre business | Impact estimé | Urgence |
|---|---|---|---|
| P1, P2 | **Temps commercial gaspillé en saisie inutile** | Chaque propriété inutilisée que vos équipes renseignent représente du temps perdu à chaque création de contact ou deal. Sur une équipe de 10 personnes, 10 champs inutiles = ~30 min/semaine perdues. | Moyen |
| P3 | **Données fragmentées entre champs redondants** | Des propriétés en doublon signifient que la même information est saisie à deux endroits différents — ou dans un seul, rendant les rapports incomplets. | Moyen |
| P6 | **Risque de casse d'automatisations** | Un mauvais typage de propriété peut bloquer silencieusement des workflows, fausser des calculs et rendre les exports incohérents. Impact direct sur la fiabilité des données commerciales. | Élevé |
| P7, P8 | **Contacts inexploitables pour le marketing et le commercial** | Des contacts sans email ni nom ne peuvent pas être ciblés en emailing, ni assignés correctement. Chaque contact de ce type est une opportunité commerciale aveugle. | Élevé |
| P9, P10a–d | **Pipeline et segmentation non fiables** | Un lifecycle stage incorrect fausse la vue du pipeline, les taux de conversion et les décisions de ciblage. Les rapports de direction sont potentiellement basés sur des données erronées. | Élevé |
| P11 | **Impossibilité d'analyser les données par compte** | Sans association contact-entreprise, les analyses account-based (ABM) sont impossibles et le chiffre d'affaires par client ne peut pas être calculé fiablement. | Élevé |
| P13, P14 | **Forecasting commercial non fiable** | Des deals sans montant ni date de clôture rendent le prévisionnel des ventes inexploitable. La direction prend des décisions de recrutement et d'investissement sur des données incomplètes. | Élevé |
| P15 | **CA potentiel immobilisé dans le pipeline** | Des deals ouverts depuis plus de 60 jours sans activité représentent un CA déclaré dans le pipeline qui ne se concrétisera probablement pas — le forecasting est surestimé. | Moyen |
| P16 | **Processus commercial non respecté** | Des propriétés obligatoires vides dans un stage indiquent que le processus de vente défini n'est pas suivi. Les managers n'ont pas la visibilité nécessaire pour coacher leurs équipes. | Élevé |

---

## Critères d'acceptance de l'epic

- [ ] Toutes les règles P1 à P16 sont détectées et affichées correctement sur un workspace de test
- [ ] Le score Propriétés est calculé et cohérent avec les problèmes détectés
- [ ] Aucun faux positif sur les propriétés système HubSpot natives (hors scope custom)
- [ ] La règle P11 est désactivée automatiquement si 0 company dans le workspace
- [ ] Chaque problème détecté affiche son impact business correspondant
- [ ] Les listes de résultats sont paginées si > 20 items
- [ ] Le temps d'exécution de l'audit propriétés est < 60 secondes sur un workspace de taille standard (< 50 000 contacts)
- [ ] L'audit est non-destructif : aucune écriture ni modification dans HubSpot

---

## Dépendances

- **EP-01** (Connexion HubSpot OAuth) : doit être complété — l'audit propriétés nécessite un token d'accès valide
- **EP-04** (Tableau de bord) : consomme le score et les résultats produits par cet epic

---

## Questions ouvertes

| # | Question | Impact | Statut |
|---|---|---|---|
| Q1 | Calcul du taux de remplissage : se baser sur tous les records ou uniquement les records créés dans les 12 derniers mois ? | Impacte P2, P7–P14 | ✅ **Décision PO :** Calculé sur TOUS les records, sans filtre temporel. Approche la plus simple et la plus représentative de l'état réel du workspace. |
| Q2 | Pour P3 (redondance), comparer uniquement le libellé (`label`) ou aussi le nom interne (`name`) ? | Impacte le nombre de faux positifs | ✅ **Décision PO :** Comparer uniquement le `label` (libellé visible). Le nom interne est souvent auto-généré et génèrerait trop de faux positifs. |
| Q3 | Seuil P2 à 5% : est-il le même pour tous les objets ? | Impacte la pertinence des résultats | ✅ **Décision PO :** Seuil uniforme à 5% pour tous les objets en phase NOW. À réévaluer lors de la beta en fonction des retours utilisateurs. |
| Q4 | Faut-il permettre à l'utilisateur de marquer un problème comme "ignoré" (won't fix) ? | Fonctionnalité de gestion du rapport | ✅ **Décision PO :** NEXT phase — hors scope v1. |
