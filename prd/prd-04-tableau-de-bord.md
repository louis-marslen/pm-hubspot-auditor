# PRD-04 — Tableau de bord & score de santé

**Epic associé :** EP-04
**Phase :** NOW (v1)
**Statut :** Prêt pour développement
**Dernière mise à jour :** 2026-03-12
**Auteur :** Product Management

---

## 1. Résumé exécutif

Le tableau de bord est la surface de présentation centrale de HubSpot Auditor. Il agrège les résultats produits par les epics d'audit (EP-02 pour les propriétés, EP-03 pour les workflows) et les restitue sous la forme d'un rapport structuré, navigable et partageable.

Ce module calcule le score de santé global du workspace sur 100, propose une double lecture des résultats (détail opérationnel par domaine puis impact business consolidé), génère un résumé exécutif via LLM, et permet le partage du rapport via un lien public sans connexion requise.

Toutes les questions ouvertes de l'epic EP-04 ont été closes par les décisions du PO avant la rédaction de ce PRD.

---

## 2. Problème utilisateur

### Narrative du problème

**Je suis :** Sophie, RevOps Manager qui vient de lancer son premier audit
- J'ai besoin de comprendre en 30 secondes où en est mon workspace avant de plonger dans le détail
- Je dois partager les résultats à mon directeur commercial qui n'a pas d'expertise HubSpot
- Je veux un texte que je peux copier-coller dans un email ou une présentation sans reformuler

**J'essaie de :**
- Comprendre rapidement l'état de santé de mon workspace ET avoir les arguments business pour convaincre ma direction d'agir — le tout depuis un seul rapport

**Mais :**
- Les findings techniques de l'audit sont inexploitables tels quels pour un dirigeant
- Je n'ai pas de surface unique qui agrège propriétés + workflows en une lecture cohérente
- Je dois partager le rapport à mon manager sans lui imposer de créer un compte

**Parce que :**
- HubSpot ne fournit pas de vue de santé consolidée, et aucun outil ne fait la traduction business automatiquement

**Ce qui me fait ressentir :**
- Frustrée d'avoir des findings utiles mais impossibles à partager directement
- Limitée dans ma capacité à escalader les problèmes CRM à la direction

### Énoncé du problème

Les RevOps Managers ont besoin d'une surface unique qui agrège les résultats d'audit en un score lisible et en arguments business partageables, parce qu'aucun outil ne fait cette synthèse et que les findings techniques restent invisibles pour les décideurs.

Un RevOps Manager ou un consultant qui a lancé un audit de son workspace HubSpot a besoin de deux choses distinctes :

1. **Une vue opérationnelle précise** — quels éléments sont problématiques, dans quel domaine, selon quelle règle, dans quel ordre les corriger.
2. **Un langage dirigeant** — une synthèse en termes business pour escalader les problèmes auprès d'une direction qui n'a ni le temps ni l'expertise de lire un rapport technique.

Aujourd'hui, ces deux besoins ne sont pas couverts : il n'existe pas de surface unique qui agrège et priorise les problèmes HubSpot avec leur traduction en enjeux commerciaux. Le rapport d'audit de HubSpot Auditor est cette surface.

Par ailleurs, les consultants ont besoin de partager ce rapport avec leurs clients sans leur demander de créer un compte — d'où l'exigence d'un lien de partage public.

---

## 2bis. Personas & Jobs-to-be-Done

### Sophie RevOps *(persona primaire)*

**Jobs fonctionnels :**
- Voir en un coup d'œil le score de santé global et les domaines les plus problématiques
- Obtenir un résumé en langage dirigeant copiable directement dans un email ou une slide
- Partager le rapport à son directeur en 30 secondes sans lui imposer de créer un compte

**Jobs sociaux :**
- Être perçue comme quelqu'un qui a une vue structurée et chiffrée de l'état du CRM

**Jobs émotionnels :**
- Se sentir en confiance pour présenter l'état du workspace à sa direction
- Être soulagée d'avoir un document propre à partager sans avoir à reformuler

---

### Louis Consultant *(persona secondaire)*

**Jobs fonctionnels :**
- Livrer un rapport professionnel à son client lors du kick-off de mission
- Partager un lien sans demander au client de créer un compte

**Douleurs clés :**
- Pas de moyen simple de partager un rapport structuré sans friction pour le destinataire

---

## 2ter. Contexte stratégique

**Lien avec la vision produit :** EP-04 est la surface de présentation qui donne sens à tout le travail des epics précédents. Un bon score visible + un résumé business partageable = le produit remplit sa promesse de "rendre les problèmes CRM compréhensibles pour les dirigeants".

**Pourquoi le LLM pour le résumé :** un template statique produirait un texte rigide, toujours identique. Le LLM permet une analyse contextuelle qui varie selon les problèmes détectés — plus crédible, plus utile, plus partageable.

**Pourquoi le lien public :** le taux de partage dans les 48h est la métrique proxy de la valeur perçue. Si l'utilisateur partage le rapport, c'est qu'il estime que le rapport vaut quelque chose pour lui.

---

## 2quart. Vue d'ensemble de la solution

Nous construisons la surface de présentation centrale qui agrège les scores de EP-02 et EP-03, calcule le score global, génère un résumé exécutif via LLM, et rend le rapport partageable via lien public sans connexion.

**Comment ça fonctionne :**
1. Agrégation des scores Propriétés (EP-02) et Workflows (EP-03)
2. Calcul du score global (50/50, redistribution si domaine absent)
3. Génération du résumé exécutif par LLM (input structuré → 3-5 phrases en français)
4. Affichage du rapport en deux sections (opérationnel + business)
5. Génération d'un UUID unique → lien public accessible sans connexion

**Features clés :** score global sur 100, bandeau statut, 2 sections de rapport, collapse/expand, résumé LLM, lien public, métadonnées complètes, conservation indéfinie.

---

## 3. Objectifs & métriques de succès

### Objectif produit
Permettre à un utilisateur de comprendre l'état de santé de son workspace en moins de 2 minutes après la fin de l'audit, et de partager le rapport avec une partie prenante externe en moins de 30 secondes.

### OKR rattaché
**Objectif :** Démontrer la valeur de communication de HubSpot Auditor au-delà de l'usage individuel.
**KR :** > 30 % des utilisateurs partagent ou exportent le rapport dans les 48 heures suivant leur premier audit.

### KPIs de l'epic
| Indicateur | Cible |
|---|---|
| Taux d'utilisation du lien de partage dans les 48h post-audit | > 30 % |
| Taux de rapports avec résumé exécutif jugé "pertinent" (feedback beta) | > 70 % |
| Temps de chargement du rapport complet | < 3 secondes |
| Taux d'erreur sur le calcul du score global | 0 % (validation automatisée) |

### Métriques garde-fous
- Le score global ne doit jamais dépasser 100 ni être inférieur à 0
- Le résumé LLM ne doit jamais bloquer l'affichage du rapport (fallback obligatoire)
- Le lien public ne doit jamais exposer de données personnelles du compte Auditor (lecture seule, anonyme)

---

## 4. Périmètre

### In scope
- Calcul et affichage du score de santé global sur 100
- Calcul et affichage du score par domaine d'audit (Propriétés et Workflows en phase NOW)
- Bandeau de statut global : Critique / À améliorer / Bon / Excellent
- Section 1 du rapport : problèmes par domaine (score + résumé + détail par règle)
- Section 2 du rapport : impacts business consolidés
- Navigation entre les sections (table des matières, collapse/expand des détails)
- Métadonnées complètes de l'audit (date, workspace, durée, périmètre, éléments non analysés)
- Résumé exécutif généré par LLM (Claude API ou équivalent) — **décision PO confirmée**
- Partage du rapport via lien public unique par rapport, sans connexion requise — **décision PO confirmée**
- Conservation des rapports indéfinie — **décision PO confirmée**
- Rapports associés au compte utilisateur HubSpot Auditor (indépendant du compte HubSpot)

### Out of scope (phase NOW)
- Export PDF du rapport — **NEXT phase**
- Comparaison entre deux audits successifs / historique d'évolution du score — **NEXT phase**
- Tableau de bord multi-workspace (vue consolidée) — **NEXT phase** (usage consultant)
- Notifications et alertes programmées — **LATER phase**
- Fonctionnalité "masquer / ignorer un problème" avant partage — **décision PO confirmée NEXT phase**
- Deep links directs vers les éléments dans HubSpot depuis le rapport — **décision PO confirmée hors scope phase NOW**

---

## 5. User stories associées

| ID | Résumé | Persona |
|---|---|---|
| EP-04 / S1 | Score global et bandeau de statut — première information visible à l'ouverture du rapport | RevOps Manager, consultant |
| EP-04 / S2 | Navigation dans le rapport — table des matières, collapse/expand, accès rapide aux sections | RevOps Manager, consultant |
| EP-04 / S3 | Section 1 — rapport opérationnel par domaine, règles triées par criticité puis volume | RevOps Manager |
| EP-04 / S4 | Section 2 — impact business consolidé avec résumé exécutif LLM et impacts par règle | RevOps Manager, consultant |
| EP-04 / S5 | Métadonnées et transparence — date, workspace, durée, domaines inclus, éléments non analysés | RevOps Manager, consultant |

---

## 6. Spécifications fonctionnelles

### 6.1 Calcul du score global

#### Formule de calcul (phase NOW)

```
Score_global = (Score_proprietes × 0,5) + (Score_workflows × 0,5)
```

#### Redistribution si un domaine est indisponible

Si un domaine n'a pu être scoré (ex. workspace sans aucun workflow) :
```
Score_global = Score_domaine_disponible × 1,0
```
Le poids du domaine absent est intégralement redistribué sur le ou les domaines disponibles. La mention des domaines exclus et la raison de leur exclusion sont affichées explicitement dans le rapport (en-tête et métadonnées).

#### Arrondi et précision
Le score global est affiché sous forme d'un entier arrondi à l'unité (ex. "74/100"). Le calcul intermédiaire peut conserver des décimales.

#### Phase NEXT
Lorsque de nouveaux domaines d'audit seront ajoutés, les poids seront réévalués dans le PRD correspondant. La formule de phase NOW est spécifique aux 2 domaines de la v1.

### 6.2 Plages de score et statut

| Plage | Statut | Couleur de référence |
|---|---|---|
| 90 – 100 | Excellent | Vert foncé |
| 70 – 89 | Bon | Vert |
| 50 – 69 | À améliorer | Orange |
| 0 – 49 | Critique | Rouge |

Les bornes sont incluses : un score de 90 est "Excellent", un score de 50 est "À améliorer", un score de 70 est "Bon".

### 6.3 Structure du rapport

Le rapport est organisé en deux sections principales, précédées d'un en-tête.

#### En-tête du rapport
- Score global sur 100 (affiché en grand format, lisible immédiatement)
- Bandeau de statut correspondant à la plage du score
- Métadonnées courtes : nom du workspace, date et heure de l'audit
- Navigation rapide vers les sections principales (table des matières)
- Si des éléments n'ont pas pu être analysés (erreurs API) : avertissement visible dans l'en-tête

#### Section 1 — Résultats de l'audit par domaine

Pour chaque domaine analysé (Propriétés, Workflows) :

**Résumé de domaine (toujours visible) :**
- Score du domaine sur 100
- Comptage des problèmes par criticité : X critiques / Y avertissements / Z informations
- Nombre total d'éléments analysés dans ce domaine

**Détail par règle (collapse/expand) :**
- Les règles sont affichées dans l'ordre suivant : critiques en premier, puis avertissements, puis informations
- Au sein d'une même criticité : classées par nombre de problèmes détectés décroissant
- Chaque règle est cliquable pour dérouler son détail (expand)
- Par défaut : les règles avec problèmes sont repliées ; les règles sans problème affichent "✅ Aucun problème" et restent repliées
- Dans le détail d'une règle : identifiant (ex. W1), nom de la règle, criticité, liste des éléments concernés avec les colonnes définies dans le PRD du domaine correspondant, tri adapté à la règle

#### Section 2 — Impact business

**Résumé exécutif (en tête de section 2) :**
Voir spécifications détaillées en section 6.4.

**Impacts par règle :**
- Affiché uniquement pour les règles ayant au moins un problème détecté
- Chaque encart contient : titre en langage business (non technique), description de l'impact estimé, niveau d'urgence (Élevé / Moyen / Faible), nombre d'éléments concernés
- Triés par urgence décroissante : Élevé en premier, puis Moyen, puis Faible

La Section 2 est visuellement distincte de la Section 1 (séparation visuelle marquée) et accessible depuis la navigation en en-tête.

### 6.4 Résumé exécutif généré par LLM

#### Décision PO
Le résumé exécutif est généré par un LLM (Claude API ou équivalent), pas par un template statique. **Cette décision est définitive pour la phase NOW.**

#### Données transmises au LLM (input)
- Nom du workspace HubSpot analysé
- Score global et statut correspondant
- Pour chaque règle ayant des problèmes : identifiant de la règle, criticité, nombre d'éléments concernés, titre business de la règle, urgence
- Aucune donnée personnelle ni contenu des records HubSpot n'est transmis au LLM

#### Format du résumé (output attendu)
- Longueur : 3 à 5 phrases
- Langue : français
- Ton : langage dirigeant (compréhensible sans expertise HubSpot), copiable directement dans une communication email ou slide
- Le résumé traduit les enjeux business, il ne répète pas les détails techniques

#### Recommandation d'urgence selon le score global

Le résumé exécutif se conclut par une recommandation d'intervention calibrée selon le score :

| Score global | Formulation de la recommandation |
|---|---|
| < 50 | "Une intervention immédiate est recommandée sur les points critiques." |
| 50 – 69 | "Des corrections sont recommandées dans les prochaines semaines." |
| 70 – 89 | "Des améliorations sont souhaitables lors de la prochaine revue de configuration." |
| ≥ 90 | "Votre workspace est en bonne santé. Un audit de contrôle dans 3 mois est recommandé." |

#### Cas particulier : 0 problème détecté
Lorsqu'aucun problème n'est détecté sur l'ensemble des domaines, le résumé exécutif affiche un message positif et inclut la recommandation de ré-audit dans 3 mois.

#### Gestion des erreurs LLM
Si l'appel au LLM échoue (timeout, indisponibilité) :
- Un message de fallback est affiché à la place du résumé : "Le résumé exécutif n'a pas pu être généré. Consultez le détail des problèmes dans la Section 1."
- Le reste du rapport est affiché normalement.
- L'erreur est loguée côté application.

### 6.5 Lien de partage public

#### Décision PO
Le rapport est partageable via un lien public unique sans connexion requise. **Cette décision est définitive pour la phase NOW.**

#### Génération du lien
- Chaque rapport d'audit génère automatiquement une URL unique au format : `/audit/[uuid-rapport]`
- Le uuid est généré côté serveur à la création du rapport et ne peut pas être deviné (non séquentiel)
- L'URL est disponible immédiatement après la fin de l'audit

#### Accès au rapport partagé
- Le rapport est accessible à toute personne disposant du lien, sans connexion requise
- Le rapport s'affiche en lecture seule — aucune interaction modifiant les données n'est possible
- Le rapport affiché est identique au rapport de l'utilisateur authentifié (pas de version tronquée)
- Une mention "Généré par HubSpot Auditor" est affichée sur le rapport partagé

#### Conservation
Les rapports sont conservés indéfiniment. **Cette décision est définitive pour la phase NOW.**

### 6.6 Métadonnées de l'audit

Les métadonnées sont affichées dans une section dédiée (footer ou section "À propos de cet audit") et dans l'en-tête (sous forme courte).

**Contenu des métadonnées :**
- Date et heure de l'audit au format ISO 8601 (UTC) avec affichage du fuseau horaire local de l'utilisateur
- Nom du workspace HubSpot analysé
- Portal ID du workspace HubSpot
- Nombre total d'éléments analysés par domaine (ex. "148 workflows analysés")
- Liste des domaines inclus dans le calcul du score global
- Liste des domaines exclus du calcul et raison (ex. "Domaine Workflows exclu — aucun workflow trouvé")
- Durée totale d'exécution de l'audit (en secondes)
- Nombre d'éléments "Non analysés" par domaine (erreurs API) — 0 si aucune erreur

### 6.7 Cas particuliers d'affichage

| Cas | Traitement |
|---|---|
| 0 problème détecté sur tous les domaines | Score = 100, statut "Excellent", message positif dans la Section 1 et la Section 2, recommandation de ré-audit dans 3 mois |
| Domaine sans élément à analyser (ex. aucun workflow) | Score du domaine non calculé, mention explicite dans en-tête et métadonnées, redistribution du poids selon formule section 6.1 |
| Audit avec éléments non analysés (erreurs API) | Avertissement dans l'en-tête ET dans les métadonnées, éléments listés avec raison |
| Score calculé = 100 mais des problèmes "Info" ont été détectés | Score = 100 est valide (les plafonds des infos peuvent conduire à ce résultat), le statut reflète le score calculé. Les problèmes Info restent affichés dans la Section 1. |
| Rapport consulté via lien public | Rapport identique en lecture seule, mention "Généré par HubSpot Auditor" affichée |
| Appel LLM en échec | Message de fallback à la place du résumé exécutif, reste du rapport inchangé |

---

## 7. Dépendances & risques

### Dépendances

| Dépendance | Nature | Statut |
|---|---|---|
| EP-00 — Gestion du compte utilisateur | Les rapports sont associés à un compte utilisateur HubSpot Auditor (indépendant du compte HubSpot) | Doit être complété avant EP-04 |
| EP-01 — Connexion HubSpot OAuth | Fournit le token d'accès pour déclencher l'audit et les informations du workspace (nom, Portal ID) | Bloquant |
| EP-02 — Audit des propriétés | Fournit le Score_proprietes et la liste structurée des problèmes P1-P16 | Bloquant pour Section 1 domaine Propriétés |
| EP-03 — Audit des workflows | Fournit le Score_workflows et la liste structurée des problèmes W1-W7 | Bloquant pour Section 1 domaine Workflows |
| API LLM (Claude API ou équivalent) | Génère le résumé exécutif | Dépendance externe — prévoir fallback (spécifié en 6.4) |

### Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Résumé exécutif LLM incohérent avec les problèmes détectés | Faible | Élevé | Définir un prompt structuré avec les données d'entrée normalisées ; tester sur des jeux de données représentatifs en beta |
| Latence de l'appel LLM rallonge le temps d'affichage du rapport | Moyenne | Moyen | Générer le résumé en asynchrone après la fin de l'audit ; afficher le rapport immédiatement avec un état "génération en cours" pour le résumé |
| Accès au lien public par des parties non autorisées (données sensibles) | Moyenne | Élevé | Informer l'utilisateur avant génération que le lien est public ; envisager une option de désactivation du lien en NEXT phase |
| Charge base de données liée à la conservation indéfinie des rapports | Faible | Moyen | Prévoir une politique de rétention révisable en NEXT phase — la décision PO de conservation indéfinie s'applique pour la phase NOW |
| Score global incorrect en cas de redistribution de poids | Faible | Élevé | Tests unitaires automatisés sur tous les cas de redistribution (domaine absent, tous domaines présents, score 0) |

---

## 8. Critères d'acceptance

- [ ] Le score global est calculé conformément à la formule de la section 6.1 avec les poids définis (50/50 pour les 2 domaines de la phase NOW)
- [ ] La redistribution des poids fonctionne correctement lorsqu'un domaine est indisponible (ex. workspace sans workflow) — le score global = score du domaine disponible × 1,0
- [ ] Le bandeau de statut correspond systématiquement à la plage de score affichée, avec les bornes correctes (70 = Bon, 90 = Excellent)
- [ ] La Section 1 affiche les règles dans l'ordre criticité décroissante, puis volume décroissant au sein d'une même criticité
- [ ] Le mécanisme collapse/expand fonctionne sur le détail de chaque règle ; les règles sans problème affichent "✅ Aucun problème" repliées par défaut
- [ ] La Section 2 est visuellement distincte de la Section 1 et accessible depuis la navigation en en-tête
- [ ] Le résumé exécutif est généré par le LLM, en français, en 3 à 5 phrases, avec la recommandation d'urgence calibrée selon le score global
- [ ] Le résumé exécutif est cohérent avec les problèmes détectés (les domaines et règles mentionnés correspondent aux données d'entrée)
- [ ] En cas d'échec de l'appel LLM, un message de fallback s'affiche sans bloquer l'affichage du rapport
- [ ] Le lien de partage public est généré automatiquement pour chaque rapport et accessible sans connexion
- [ ] Le rapport partagé via lien public est en lecture seule et affiche la mention "Généré par HubSpot Auditor"
- [ ] Les métadonnées de l'audit sont complètes : date/heure (UTC + fuseau local), nom et Portal ID du workspace, nombre d'éléments analysés par domaine, durée d'exécution, domaines inclus/exclus
- [ ] Les éléments non analysés (erreurs API) sont mentionnés avec avertissement dans l'en-tête ET dans les métadonnées
- [ ] Le rapport s'affiche correctement sur un workspace avec 0 problème détecté (score 100, message positif, recommandation 3 mois)
- [ ] Le rapport s'affiche correctement sur un workspace sans aucun workflow (redistribution de poids, mention explicite du domaine exclu)

---

*Ce PRD ferme les questions ouvertes de l'epic EP-04 sur la base des décisions du PO :*
- *Q1 (URL unique par rapport) : lien public sans connexion — confirmé par le PO*
- *Q2 (conservation des rapports) : conservation indéfinie — confirmée par le PO*
- *Q3 (résumé exécutif LLM vs template) : généré par LLM — confirmé par le PO*
- *Q4 (masquer des problèmes) : hors scope phase NOW, NEXT phase — confirmé par le PO*
