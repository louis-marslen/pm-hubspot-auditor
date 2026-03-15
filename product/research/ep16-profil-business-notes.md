# EP-16 — Profil business & audit contextuel — Notes de discovery

**Statut :** Notes brutes pour spécification future
**Date :** 2026-03-15
**Source :** discussions PO

---

## Vision

Aujourd'hui, tous les audits appliquent les mêmes règles avec les mêmes seuils, quelle que soit l'entreprise. Or un cycle de vente enterprise de 9 mois n'a rien à voir avec un cycle SaaS self-serve de 14 jours. Un deal "bloqué" à 60 jours est critique dans un cas, normal dans l'autre.

L'idée : **dès la connexion d'un nouveau workspace HubSpot, proposer un questionnaire business** qui qualifie le contexte de l'entreprise. Ce profil business alimente ensuite les règles d'audit, les seuils, le scoring et les recommandations pour produire un audit véritablement contextualisé.

---

## Questionnaire business — Axes à couvrir

### 1. Modèle business
- **B2B / B2C / B2B2C / Mixte** — impacte la pertinence des règles companies (CO-*), la criticité des associations deal↔company, la désactivation de certaines règles en B2C
- **Type de produit/service** : SaaS, services, e-commerce, marketplace, consulting, industrie…
- **Taille d'entreprise** : TPE (<10), PME (10-250), ETI (250-5000), Grand compte (5000+) — impacte le volume attendu de deals, contacts, etc.

### 2. Cycle de vente
- **Durée moyenne du cycle de vente** : < 1 mois / 1-3 mois / 3-6 mois / 6-12 mois / > 12 mois
  - → Adapte le seuil "deal bloqué" (D-05) : 30j pour un cycle court, 90j pour enterprise
  - → Adapte le seuil "deal ancien" (D-03) : même logique
- **Montant moyen d'un deal** : < 1k€ / 1k-10k€ / 10k-50k€ / 50k-200k€ / > 200k€
  - → Adapte la criticité de D-01 (montant manquant) : plus le deal moyen est gros, plus l'absence de montant est critique
- **Nombre de pipelines actifs** : 1 / 2-3 / 4+ — contexte pour D-06, D-07

### 3. ICP (Ideal Customer Profile)
- **Secteurs cibles** — contexte pour les règles companies (CO-06 industry)
- **Géographie** — impacte la normalisation téléphone (C-08), les formats de données
- **Taille d'entreprise cible** — contexte pour CO-07 (dimensionnement)

### 4. Personas cibles & usage HubSpot
- **Qui utilise le CRM au quotidien** : commerciaux, marketing, support, direction — impacte les recommandations
- **Nombre d'utilisateurs actifs** — contexte pour les futures règles EP-09 (users & teams)
- **Hubs HubSpot utilisés** : Marketing Hub, Sales Hub, Service Hub, CMS Hub — impacte la pertinence de certaines règles (workflows marketing vs sales, etc.)
- **Plan HubSpot** : Free / Starter / Pro / Enterprise — impacte les features disponibles (ex: required properties par stage uniquement sur Pro+)

### 5. Maturité CRM
- **Depuis quand le workspace existe** : < 6 mois / 6-12 mois / 1-3 ans / > 3 ans — contexte pour le volume de dette technique attendu
- **Y a-t-il eu une migration depuis un autre CRM** : oui/non — les migrations génèrent des doublons et des propriétés orphelines
- **Qui administre le workspace** : RevOps dédié / marketing / sales manager / personne — impacte les recommandations

---

## Impact sur les règles d'audit

### Seuils adaptatifs (exemples)

| Règle | Seuil actuel (fixe) | Seuil adapté court | Seuil adapté long |
|---|---|---|---|
| D-03 — Deal ancien | 60 jours | 30 jours (cycle < 1 mois) | 120 jours (cycle > 6 mois) |
| D-05 — Deal bloqué | 60 jours | 21 jours (cycle < 1 mois) | 90 jours (cycle > 6 mois) |
| D-06 — Pipeline inactif | 90 jours | 60 jours | 180 jours |
| C-10 — Contact stale | 365 jours | 180 jours (cycle court, base tournante) | 365 jours |
| CO-04 — Company sans contact | 90 jours grace | 60 jours | 120 jours |

### Criticité adaptative (exemples)

| Règle | Criticité actuelle | Si B2C | Si enterprise long cycle |
|---|---|---|---|
| D-09 — Deal sans contact | 🟡 Avertissement | 🟡 Avertissement | 🔴 Critique (chaque deal compte) |
| D-10 — Deal sans company | 🔵 Info | Désactivée | 🟡 Avertissement |
| CO-01 — Taux domain | 🔴 Critique | 🔵 Info (moins pertinent B2C) | 🔴 Critique |
| C-05 — Association contact-company | 🔵 Info | Désactivée | 🟡 Avertissement |

### Recommandations contextualisées

Au-delà des seuils, le profil business permet de **contextualiser les recommandations** dans les traductions business :
- B2B enterprise : "Avec un cycle de vente de 6-12 mois, chaque deal représente un investissement commercial significatif. L'absence de montant rend votre forecast trimestriel non fiable."
- SaaS self-serve : "Avec un volume élevé de deals à faible montant unitaire, la complétude des données est critique pour automatiser le scoring et le routing."

---

## UX du questionnaire

### Moment d'exécution
- **Trigger :** immédiatement après la connexion OAuth d'un nouveau workspace (callback success → questionnaire)
- **Optionnel mais fortement encouragé** : l'utilisateur peut skip, mais le rapport affichera un bandeau "Profil business non renseigné — vos seuils d'audit sont génériques"
- **Modifiable** : accessible depuis les paramètres du workspace (`/settings` → workspace → "Profil business")
- **Durée cible** : < 2 minutes (5-8 questions max, pas un formulaire exhaustif)

### Format
- Questions à choix unique ou multiple, pas de champ texte libre
- Progression visible (étape X/Y)
- Possibilité de revenir en arrière
- Preview de l'impact : "Avec ce profil, vos seuils seront adaptés à un cycle de vente long"

### Interaction avec EP-08 (Onboarding self-service)
EP-16 est complémentaire de EP-08. L'onboarding (EP-08) guide l'utilisateur dans ses premiers pas (connexion, premier audit). Le questionnaire business (EP-16) qualifie le contexte pour personnaliser les audits suivants. Ils pourraient être fusionnés dans le même flux post-connexion.

---

## Questions ouvertes pour la spécification future

1. **Granularité** : profil au niveau du workspace ou de l'utilisateur ? (Un consultant audite des clients différents → besoin d'un profil par workspace)
2. **Scoring adaptatif** : est-ce qu'on change aussi les poids dans la formule de scoring, ou seulement les seuils et criticités ?
3. **Rétroactivité** : quand le profil est modifié, est-ce qu'on recalcule les audits passés ou seulement les futurs ?
4. **Valeurs par défaut** : quels seuils appliquer si le questionnaire est skippé ? (Les seuils actuels, par défaut "B2B cycle moyen")
5. **IA** : est-ce qu'on peut inférer certaines réponses automatiquement à partir des données du workspace ? (Ex: si 0 company → probablement B2C, si deals moyens > 50k€ → probablement enterprise)
6. **Extensibilité** : comment ajouter de nouvelles questions sans casser les profils existants ?

---

## Liens avec d'autres epics

| Epic | Lien |
|---|---|
| **EP-08** (Onboarding) | Fusion possible du questionnaire dans le flux d'onboarding |
| **EP-14** (Recommandations IA) | Le profil business enrichit le contexte pour les recommandations LLM |
| **EP-12** (Historique) | Le profil business permet de contextualiser la comparaison entre audits |
| **Tous les epics d'audit** (EP-02→EP-11) | Les seuils de chaque règle deviennent des fonctions du profil business |
