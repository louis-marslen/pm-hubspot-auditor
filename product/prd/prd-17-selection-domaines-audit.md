# PRD-17 — Sélection des domaines d'audit

**Epic associé :** EP-17
**Version :** 1.0
**Date :** 2026-03-16
**Statut :** Prêt pour développement

---

## 1. Résumé exécutif

EP-17 ajoute une étape de configuration avant le lancement d'un audit : une modale permettant à l'utilisateur de sélectionner les domaines à auditer (Propriétés, Contacts, Companies, Workflows, Utilisateurs & Équipes, Deals). L'audit ne s'exécute que sur les domaines sélectionnés, le score global est recalculé en conséquence, et le rapport affiche clairement le périmètre audité.

Cette fonctionnalité est la **première brique** d'un système de personnalisation pré-audit plus large (EP-16 — Profil business & audit contextuel) qui ajoutera à terme un questionnaire business adaptant les seuils, criticités et recommandations au contexte de l'entreprise (modèle B2B/B2C, cycle de vente, maturité CRM).

**Décisions PO actées dans ce PRD :**
- Le domaine Propriétés est toujours obligatoire (socle de l'audit, non décochable)
- Tous les domaines sont cochés par défaut — l'utilisateur opt-out plutôt qu'opt-in
- Pas de sauvegarde de profils de sélection en v1 — renvoyé à EP-16
- La sélection est persistée par audit (pas de "dernière sélection mémorisée" en v1)
- Le résumé LLM est adapté pour mentionner le périmètre audité
- Le rapport public affiche un encart de périmètre en haut

---

## 2. Problème utilisateur

### Narrative du problème

**Je suis :** Sophie, RevOps Manager dans une PME B2B de 80 personnes
- Mon entreprise utilise HubSpot principalement pour les Sales (contacts, deals, pipelines) et le marketing (workflows, emails)
- Nous n'utilisons pas du tout l'objet Companies dans HubSpot — nos commerciaux travaillent en contact direct
- Quand je lance un audit HubSpot Auditor, le domaine Companies est audité et fait baisser mon score global car les companies sont mal renseignées — mais c'est normal, on ne les utilise pas
- De même, nous n'avons que 2 utilisateurs dans HubSpot, donc l'audit "Utilisateurs & Équipes" n'est pas très pertinent

**J'essaie de :**
- Obtenir un score de santé qui reflète la réalité de mon usage de HubSpot, pas un idéal théorique

**Mais :**
- L'audit couvre systématiquement tous les domaines, sans possibilité de personnaliser
- Mon score est tiré vers le bas par des domaines que je n'utilise pas

**Parce que :**
- L'outil a été conçu pour un audit exhaustif, sans tenir compte de la diversité des usages HubSpot

**Ce qui me fait ressentir :**
- Frustrée de voir un score "À améliorer" alors que les domaines que j'utilise vraiment sont en bonne santé
- Sceptique sur la pertinence du rapport que je vais présenter à ma direction

### Énoncé du problème

Les utilisateurs de HubSpot Auditor ont besoin d'un moyen de cibler leur audit sur les domaines pertinents pour leur usage parce que l'audit systématique de tous les domaines produit des scores faussés et des recommandations non pertinentes pour les entreprises qui n'utilisent pas tous les objets CRM de HubSpot.

### Problèmes spécifiques adressés

1. **Score faussé** : des domaines non utilisés (ex: Companies en B2C) tirent le score global vers le bas sans raison valable
2. **Bruit dans le rapport** : des sections entières de recommandations sur des domaines non pertinents diluent l'attention sur les vrais problèmes
3. **Temps d'audit inutile** : auditer des domaines non utilisés rallonge le temps d'exécution sans valeur ajoutée
4. **Crédibilité du rapport** : un rapport partagé qui signale des problèmes sur des domaines non utilisés réduit la confiance du lecteur dans l'outil

---

## 2bis. Personas & Jobs-to-be-Done

### Sophie RevOps Manager *(persona primaire)*

**Jobs fonctionnels :**
- Configurer l'audit en 10 secondes pour cibler les domaines pertinents
- Obtenir un score qui reflète la santé réelle de mon usage HubSpot
- Partager un rapport crédible à ma direction sans avoir à expliquer "ignorez cette section"

**Jobs sociaux :**
- Présenter un score de santé CRM positif et crédible à ma direction
- Démontrer que les domaines critiques sont sous contrôle

**Jobs émotionnels :**
- Se sentir en contrôle de l'outil (pas l'inverse)
- Avoir confiance dans la pertinence du score affiché

**Douleurs clés :**
- Score global tiré vers le bas par des domaines non utilisés
- Rapport avec des sections non pertinentes qui diluent le message

---

### Louis Consultant HubSpot *(persona secondaire)*

**Jobs fonctionnels :**
- Adapter le périmètre d'audit au contexte de chaque client
- Lancer un audit ciblé sur les domaines que le client utilise réellement
- Partager un rapport dont le périmètre est clair pour le client

**Douleurs clés :**
- Devoir expliquer au client pourquoi certaines sections du rapport ne sont pas pertinentes
- Un audit "one size fits all" n'est pas adapté au travail de consulting

---

## 2ter. Contexte stratégique

**Lien avec la vision produit :** EP-17 est la première étape vers un audit véritablement personnalisé. C'est la brique fondatrice du futur questionnaire business (EP-16) qui adaptera les seuils, les criticités et les recommandations au contexte de l'entreprise.

**Pourquoi maintenant :** avec 6 domaines d'audit (5 livrés + deals en cours), le risque de "bruit" dans le rapport augmente. Les entreprises qui n'utilisent pas tous les objets CRM de HubSpot vont voir leur score faussé. Plus on ajoute de domaines, plus la sélection devient nécessaire.

**Indicateur différenciant :** la plupart des outils d'audit CRM appliquent un scan exhaustif sans personnalisation. La sélection des domaines est un premier pas vers un audit "sur mesure" — un positionnement différenciant pour HubSpot Auditor.

**Lien avec EP-16 :** EP-17 pose les fondations techniques et UX :
- La modale de sélection pourra être enrichie avec des questions business (EP-16)
- Le champ `audit_domains` en base pourra être étendu avec le profil business
- Le moteur d'audit est déjà prêt à recevoir des paramètres de configuration (seuils adaptatifs)

---

## 2quart. Vue d'ensemble de la solution

Nous ajoutons une étape intermédiaire entre le clic "Lancer un audit" et l'exécution effective : une modale de configuration permettant de sélectionner les domaines à auditer. Le moteur d'audit, le tracker de progression, le scoring et l'affichage des résultats sont tous filtrés par cette sélection.

**Comment ça fonctionne :**
1. L'utilisateur clique sur "Lancer un audit" dans le dashboard
2. Une modale s'ouvre avec la liste des 6 domaines, tous cochés par défaut
3. L'utilisateur décoche les domaines non pertinents
4. L'utilisateur clique sur "Lancer l'audit (X domaines)"
5. La modale se ferme, l'audit démarre uniquement sur les domaines sélectionnés
6. Le tracker de progression affiche les domaines sélectionnés
7. Le score global est calculé sur les domaines audités
8. Le rapport affiche les sections pertinentes + un bandeau de périmètre

**Features clés :** modale de sélection avec checkboxes, domaine Propriétés obligatoire, score global adapté, rapport filtré, persistance de la sélection, rétrocompatibilité avec les audits existants.

**Considérations UX :**
- **Parcours utilisateur :** la modale s'insère dans le flux existant sans ajout de page. Le clic "Lancer un audit" ouvre la modale. C'est une étape de 5-10 secondes, pas un parcours complexe.
- **États clés :**
  - *Défaut* : tous les domaines cochés, bouton "Lancer l'audit (6 domaines)"
  - *Personnalisé* : certains domaines décochés, compteur mis à jour dynamiquement
  - *Domaine non disponible* : checkbox grisée avec explication (ex: "Requiert ≥ 2 utilisateurs")
  - *Minimum non atteint* : impossible de décocher le dernier domaine, tooltip explicatif
- **Composants UI existants à réutiliser :** `Modal`, `Button`, `Badge`, `Checkbox` (si existant, sinon créer un simple input checkbox stylé avec les tokens du design system).

---

## 3. Objectifs & métriques de succès

### Objectifs

| Objectif | Description |
|---|---|
| O1 — Pertinence du score | Permettre un score global qui reflète l'usage réel du CRM |
| O2 — Réduction du bruit | Éliminer les sections non pertinentes du rapport |
| O3 — Fondation personnalisation | Poser les bases UX et techniques pour EP-16 (questionnaire business) |
| O4 — Crédibilité du rapport partagé | Un rapport dont le périmètre est clair et maîtrisé |

### KPIs

| KPI | Cible | Méthode de mesure |
|---|---|---|
| Taux de personnalisation (≥ 1 domaine désélectionné) | > 30% des audits | Analytics sur `audit_domains` |
| Temps moyen dans la modale de sélection | < 10 secondes | Analytics (si trackable) |
| Taux de complétion d'audit (pas d'abandon après la modale) | > 95% | Analytics |
| Réduction du temps d'audit moyen (audits partiels) | -20% sur les audits avec ≤ 4 domaines | Monitoring |

### Métriques garde-fous
- Pas de régression du taux de lancement d'audit (la modale ne doit pas être un frein)
- Les audits avec tous les domaines restent identiques en résultat et en temps

---

## 4. Périmètre

### In scope

- Modale de sélection des domaines (6 domaines avec checkboxes)
- Domaine Propriétés obligatoire (non décochable)
- Transmission de la sélection au moteur d'audit
- Filtrage du tracker de progression par domaines sélectionnés
- Score global sur les domaines audités uniquement
- Rapport filtré par domaines audités + bandeau de périmètre
- Rapport public avec encart de périmètre
- Persistance en base (`audit_domains` jsonb)
- Rétrocompatibilité avec les audits existants
- Historique : affichage "X/Y domaines" par audit
- Résumé LLM adapté au périmètre audité

### Out of scope (renvoyé à EP-16 et au-delà)

- Sauvegarde de profils de sélection réutilisables
- Mémorisation de la dernière sélection comme défaut
- Questionnaire business (modèle, cycle de vente, maturité CRM)
- Adaptation des seuils et criticités selon le profil business
- Sélection de sous-domaines ou de règles individuelles
- Recommandation automatique de domaines basée sur les données du workspace
- Objets CRM non encore implémentés (leads, tickets, etc.)

---

## 5. User stories associées

| ID | Titre | Priorité |
|---|---|---|
| EP-17-S1 | Sélection des domaines avant le lancement | Must have |
| EP-17-S2 | Lancement de l'audit avec sélection | Must have |
| EP-17-S3 | Score global adapté à la sélection | Must have |
| EP-17-S4 | Persistance et affichage dans le rapport public | Must have |
| EP-17-S5 | Activation conditionnelle des domaines | Should have |

Les stories complètes avec leurs critères d'acceptance Given/When/Then sont définies dans le fichier `/epics/ep17-selection-domaines-audit.md`.

---

## 6. Spécifications fonctionnelles

### 6.1 Modale de sélection des domaines

#### Layout et contenu

```
┌─────────────────────────────────────────────┐
│                                         ✕   │
│  Configurer votre audit                     │
│  Sélectionnez les domaines à analyser       │
│                                             │
│  ─── Tout sélectionner / Tout désélectionner│
│                                             │
│  ☑ Propriétés personnalisées    Obligatoire │
│    Propriétés inutilisées, redondantes,     │
│    mal typées                               │
│                                             │
│  ☑ Contacts & doublons                      │
│    Doublons, emails invalides, contacts     │
│    stale, attribution                       │
│                                             │
│  ☑ Companies                                │
│    Doublons, companies orphelines,          │
│    qualité des données                      │
│                                             │
│  ☑ Workflows                                │
│    Workflows inactifs, zombies, sans        │
│    actions, legacy                          │
│                                             │
│  ☑ Utilisateurs & Équipes                   │
│    Super Admins, rôles, utilisateurs        │
│    inactifs, équipes                        │
│                                             │
│  ☐ Deals & Pipelines              Bientôt  │
│    Deals bloqués, étapes mal configurées,   │
│    conversions                              │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │     Lancer l'audit (5 domaines)     │    │
│  └─────────────────────────────────────┘    │
│                    Annuler                   │
└─────────────────────────────────────────────┘
```

#### Règles de la modale

| Règle | Comportement |
|---|---|
| Ouverture | Au clic sur "Lancer un audit" dans le dashboard |
| Fermeture | Clic sur ✕, clic sur "Annuler", clic outside, touche Escape |
| Domaine Propriétés | Checkbox cochée + désactivée + badge "Obligatoire" |
| Domaines non disponibles (EP-06 non livré) | Checkbox grisée + badge "Bientôt" |
| Domaines conditionnels (ex: Users < 2) | Checkbox grisée + tooltip "Requiert ≥ 2 utilisateurs" |
| Sélection minimum | ≥ 1 domaine (Propriétés garantit toujours ce minimum) |
| Compteur bouton | "Lancer l'audit (X domaines)" — mis à jour dynamiquement |
| Tout sélectionner | Coche tous les domaines disponibles (sauf grisés) |
| Tout désélectionner | Décoche tous les domaines sauf Propriétés |
| Accessibilité | Focus trap dans la modale, navigation clavier (Tab, Espace pour toggle) |

### 6.2 Transmission au moteur d'audit

**Endpoint modifié :** `POST /api/audit/run`

**Body actuel :**
```json
{
  "workspaceId": "uuid"
}
```

**Body modifié :**
```json
{
  "workspaceId": "uuid",
  "selectedDomains": ["properties", "contacts", "companies", "workflows", "users"]
}
```

**Validation côté serveur :**
- `selectedDomains` doit contenir au moins `"properties"`
- Les IDs doivent être parmi les domaines connus : `properties`, `contacts`, `companies`, `workflows`, `users`, `deals`
- Si `selectedDomains` est absent ou vide : fallback sur tous les domaines (rétrocompatibilité)
- Les domaines non implémentés (ex: `deals` avant EP-06) sont ignorés silencieusement

### 6.3 Impact sur le moteur d'audit (`engine.ts`)

Le `runFullAudit` reçoit `selectedDomains` en paramètre et filtre les domaines à exécuter :

```
runFullAudit(accessToken, workspaceId, selectedDomains?) {
  // Phase 1 : toujours exécuter Properties
  const propertyResults = await runPropertyAudit(accessToken)

  // Phase 2 : exécuter en parallèle les domaines sélectionnés (hors Properties)
  const domainsToRun = selectedDomains
    ? selectedDomains.filter(d => d !== 'properties')
    : ['contacts', 'companies', 'workflows', 'users', 'deals']

  await Promise.all(domainsToRun.map(domain => runDomainAudit(domain, accessToken)))

  // Phase 3 : score global sur les domaines exécutés uniquement
  const globalScore = computeGlobalScore(executedDomains)
}
```

### 6.4 Persistance

**Migration SQL :**
```sql
-- EP-17 : Sélection des domaines d'audit
ALTER TABLE public.audit_runs
  ADD COLUMN audit_domains jsonb;
```

**Structure jsonb :**
```json
{
  "selected": ["properties", "contacts", "workflows"],
  "available": ["properties", "contacts", "companies", "workflows", "users"],
  "skipped_reasons": {
    "users": "less_than_2_users"
  }
}
```

**Rétrocompatibilité :** `audit_domains = null` → interprété comme "tous les domaines disponibles au moment de l'audit".

### 6.5 Impact sur le tracker de progression

Le tracker de progression (`audit-progress-tracker.tsx`) doit être filtré :

- **Domaines affichés :** uniquement ceux présents dans `selectedDomains`
- **Progression globale :** calculée sur le nombre de sous-étapes des domaines sélectionnés
- **Ordre d'affichage :** Properties en premier, puis les autres dans l'ordre de la modale

### 6.6 Impact sur le rapport (résultats)

**Navigation intra-page (tabs sticky) :** seuls les onglets des domaines audités sont affichés.

**Bandeau de périmètre :** si l'audit n'inclut pas tous les domaines disponibles, un bandeau informatif est affiché :

```
ℹ️ Cet audit couvre X domaines sur Y disponibles : Propriétés, Contacts, Workflows.
   Domaines non inclus : Companies, Utilisateurs & Équipes.
```

**Placement du bandeau :** sous le score global, avant les tabs de navigation.

**Style :** fond `bg-gray-850`, bordure `border-gray-700`, icône ℹ️, texte `text-gray-400` pour les domaines non inclus.

### 6.7 Impact sur le rapport public

Le rapport public (`share/[shareToken]`) applique les mêmes règles :
- Seuls les domaines audités sont affichés
- Un encart en haut mentionne le périmètre
- Le score global est calculé sur les domaines audités

### 6.8 Impact sur l'historique des audits (dashboard)

Chaque carte d'audit dans l'historique affiche :
- **Audit complet :** aucune mention supplémentaire (tous les domaines)
- **Audit partiel :** badge "X/Y domaines" à côté de la date ou du score
- **Détail au hover :** tooltip listant les domaines audités

### 6.9 Impact sur le résumé LLM

Le prompt LLM est modifié pour inclure le contexte de périmètre :

```
Domaines audités : Propriétés, Contacts, Workflows (3/6).
Domaines non inclus dans cet audit : Companies, Utilisateurs & Équipes, Deals.
Le score global de XX/100 est calculé sur les 3 domaines audités uniquement.
```

Le résumé LLM doit :
- Mentionner le périmètre en introduction
- Ne commenter que les domaines audités
- Ne pas émettre de recommandations sur les domaines non audités
- Suggérer d'auditer les domaines manquants si pertinent (une phrase max)

---

## 7. Dépendances & risques

### Dépendances

| Dépendance | Nature | Impact si bloquant |
|---|---|---|
| **EP-04 — Tableau de bord** | Le bouton "Lancer un audit" est modifié | Bloquant — point d'entrée principal |
| **EP-UX — Design System** | Composant `Modal` existant à réutiliser | Non bloquant — peut être adapté |
| **EP-UX-02 — Progression d'audit** | Le tracker doit être filtré | Bloquant — le tracker afficherait des domaines non audités |

### Risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| R1 — La modale freine le lancement d'audit (friction ajoutée) | Moyenne | Élevé | Tous les domaines cochés par défaut → l'utilisateur qui ne veut pas personnaliser clique juste "Lancer" |
| R2 — Confusion sur le score (score partiel vs score complet) | Faible | Moyen | Bandeau de périmètre clair dans le rapport + mention dans le résumé LLM |
| R3 — Comparaison impossible entre audits avec périmètres différents | Faible | Faible | Mentionner le périmètre dans l'historique — la comparaison fine sera traitée dans EP-12 |
| R4 — Régression sur l'API si `selectedDomains` mal géré | Faible | Élevé | Validation côté serveur + fallback sur tous les domaines si absent |

### Questions ouvertes

| Question | Décision |
|---|---|
| Faut-il permettre de sauvegarder des profils de sélection ? | ✅ Décidé : LATER (EP-16) |
| Mémoriser la dernière sélection comme défaut ? | À décider — potentiel quick win UX |
| Faut-il un preset "Audit rapide" (Propriétés + Workflows) ? | À décider (EP-16) |
| Le résumé LLM doit-il adapter son contenu ? | ✅ Décidé : oui |

---

## 8. Critères d'acceptance

- [ ] Le clic sur "Lancer un audit" ouvre une modale de sélection des domaines
- [ ] La modale affiche les 6 domaines avec checkboxes, descriptions et états
- [ ] Tous les domaines sont cochés par défaut
- [ ] Le domaine Propriétés est obligatoire (checkbox cochée et non décochable, badge "Obligatoire")
- [ ] Les domaines non disponibles (EP-06 non livré) sont grisés avec badge "Bientôt"
- [ ] Les domaines conditionnels non activables sont grisés avec explication
- [ ] Le bouton "Lancer l'audit (X domaines)" affiche le compteur dynamique
- [ ] "Tout sélectionner / Tout désélectionner" fonctionne correctement
- [ ] La modale se ferme sans effet au clic outside, sur ✕, sur "Annuler", ou sur Escape
- [ ] L'audit ne s'exécute que sur les domaines sélectionnés
- [ ] Le tracker de progression n'affiche que les domaines sélectionnés
- [ ] Le score global est calculé uniquement sur les domaines audités (moyenne pondérée)
- [ ] Le rapport n'affiche que les sections des domaines audités
- [ ] Un bandeau de périmètre est affiché si l'audit est partiel
- [ ] Le rapport public affiche le bandeau de périmètre
- [ ] La sélection est persistée en base (`audit_domains` jsonb)
- [ ] Les audits existants (`audit_domains = null`) fonctionnent normalement
- [ ] L'historique affiche "X/Y domaines" pour les audits partiels
- [ ] Le résumé LLM mentionne le périmètre audité
- [ ] Validation serveur : `selectedDomains` doit contenir `"properties"` au minimum
- [ ] Fallback serveur : si `selectedDomains` absent → tous les domaines
- [ ] Accessibilité : navigation clavier dans la modale (Tab, Espace, Escape)
