# EP-17 — Sélection des domaines d'audit

## Hypothèse

Nous croyons que permettre aux utilisateurs de choisir les domaines à auditer avant le lancement (via une modale de sélection) augmentera la pertinence perçue de l'audit et le taux de complétion — parce qu'aujourd'hui tous les domaines sont audités systématiquement, y compris ceux que l'utilisateur n'utilise pas (ex: companies pour un B2C, équipes pour un solo-preneur), ce qui produit du bruit et des scores faussés par des domaines non pertinents.

Nous mesurerons le succès via : taux de personnalisation (% d'audits avec ≥ 1 domaine désélectionné, cible : > 30%) + amélioration du score NPS sur la pertinence du rapport.

**Vision long terme :** cette modale de sélection est la **première brique** d'un système plus large de configuration pré-audit (EP-16 — Profil business & audit contextuel). À terme, la sélection des domaines sera enrichie par un questionnaire business (modèle B2B/B2C, cycle de vente, maturité CRM) qui adaptera non seulement les domaines audités mais aussi les seuils, les criticités et les recommandations. EP-17 pose les fondations UX et techniques de cette personnalisation.

---

## Périmètre

### In scope
- Modale de sélection des domaines affichée au clic sur "Lancer un audit" (avant le lancement effectif)
- Liste des 6 domaines actuels (Propriétés, Contacts, Companies, Workflows, Utilisateurs & Équipes, Deals) avec checkboxes
- Tous les domaines cochés par défaut — l'utilisateur décoche ceux qu'il ne veut pas
- Bouton "Lancer l'audit" dans la modale qui déclenche l'audit uniquement sur les domaines sélectionnés
- Minimum 1 domaine sélectionné (le domaine Propriétés est toujours obligatoire — c'est le socle de l'audit)
- Score global recalculé sur les domaines sélectionnés uniquement (même logique de pondération égale)
- Le tracker de progression (EP-UX-02) n'affiche que les domaines sélectionnés
- Le rapport final n'affiche que les sections des domaines audités
- Persistance de la sélection en base (colonne `audit_domains` jsonb sur `audit_runs`)
- Affichage dans le rapport et le rapport public des domaines audités vs non audités

### Out of scope
- Sélection de sous-domaines ou de règles individuelles (trop granulaire pour cette version)
- Sauvegarde de "profils d'audit" réutilisables — LATER (EP-16)
- Questionnaire business avec adaptation des seuils et criticités — LATER (EP-16)
- Sélection d'objets CRM additionnels non encore implémentés (leads, tickets, etc.) — LATER
- Recommandation automatique de domaines basée sur les données du workspace — LATER (EP-16)

---

## User stories

### Story 1 — Sélection des domaines avant le lancement

**En tant que** Admin HubSpot
**je veux** choisir les domaines à auditer avant de lancer l'audit
**afin de** concentrer l'analyse sur les aspects pertinents de mon workspace et obtenir un score qui reflète ma réalité

**Critères d'acceptance :**

*Scénario : Ouverture de la modale*
**Étant donné** que je suis sur le dashboard et que j'ai au moins un workspace connecté
**Quand** je clique sur "Lancer un audit"
**Alors** une modale s'ouvre affichant la liste des domaines d'audit disponibles
**Et** chaque domaine est accompagné d'une courte description (1 ligne)
**Et** tous les domaines sont cochés par défaut
**Et** un bouton "Lancer l'audit" est affiché en bas de la modale

*Scénario : Désélection d'un domaine*
**Étant donné** que la modale de sélection est ouverte
**Quand** je décoche le domaine "Companies"
**Alors** la checkbox "Companies" passe à l'état décoché
**Et** le bouton "Lancer l'audit" reste actif (il reste ≥ 1 domaine sélectionné)

*Scénario : Tentative de tout désélectionner*
**Étant donné** que la modale de sélection est ouverte
**Quand** je tente de décocher le dernier domaine sélectionné (Propriétés)
**Alors** la checkbox reste cochée
**Et** un tooltip ou un message inline s'affiche : "Au moins un domaine est requis pour lancer l'audit"

*Scénario : Domaine Propriétés obligatoire*
**Étant donné** que la modale de sélection est ouverte
**Quand** je regarde le domaine "Propriétés personnalisées"
**Alors** la checkbox est cochée et désactivée (non décochable)
**Et** un label "Obligatoire" est affiché à côté

---

### Story 2 — Lancement de l'audit avec sélection

**En tant que** Admin HubSpot
**je veux** que l'audit ne s'exécute que sur les domaines que j'ai sélectionnés
**afin de** gagner du temps et obtenir un rapport focalisé

**Critères d'acceptance :**

*Scénario : Lancement avec sélection partielle*
**Étant donné** que j'ai sélectionné Propriétés, Contacts et Workflows (3 domaines sur 6)
**Quand** je clique sur "Lancer l'audit"
**Alors** la modale se ferme
**Et** je suis redirigé vers la page d'audit avec le tracker de progression
**Et** le tracker affiche uniquement les 3 domaines sélectionnés (Propriétés, Contacts, Workflows)
**Et** l'audit ne s'exécute que sur ces 3 domaines

*Scénario : Lancement avec tous les domaines*
**Étant donné** que j'ai gardé tous les domaines cochés (défaut)
**Quand** je clique sur "Lancer l'audit"
**Alors** le comportement est identique à l'audit actuel (tous les domaines)

*Scénario : Annulation*
**Étant donné** que la modale de sélection est ouverte
**Quand** je clique en dehors de la modale ou sur le bouton fermer
**Alors** la modale se ferme sans lancer d'audit
**Et** aucune modification n'est persistée

---

### Story 3 — Score global adapté à la sélection

**En tant que** RevOps Manager
**je veux** que le score global ne prenne en compte que les domaines que j'ai choisi d'auditer
**afin de** ne pas être pénalisé par des domaines non pertinents pour mon usage

**Critères d'acceptance :**

*Scénario : Score sur 3 domaines*
**Étant donné** que l'audit a été lancé sur Propriétés (85), Contacts (72) et Workflows (90)
**Quand** l'audit est terminé et le score global calculé
**Alors** le score global = (85 + 72 + 90) / 3 = 82
**Et** les domaines non audités (Companies, Utilisateurs, Deals) ne sont pas pris en compte

*Scénario : Affichage des domaines non audités*
**Étant donné** que l'audit a été lancé sur 4 domaines (2 non sélectionnés)
**Quand** je consulte le rapport
**Alors** les sections des domaines non audités ne sont pas affichées dans la navigation
**Et** un bandeau informatif en bas du rapport mentionne : "Domaines non inclus dans cet audit : Companies, Deals"

---

### Story 4 — Persistance et affichage dans le rapport public

**En tant que** Consultant HubSpot (Louis)
**je veux** que le rapport partagé affiche clairement quels domaines ont été audités
**afin que** mon client comprenne le périmètre de l'audit sans ambiguïté

**Critères d'acceptance :**

*Scénario : Rapport public avec sélection partielle*
**Étant donné** qu'un audit a été lancé sur 4 domaines sur 6
**Quand** un visiteur accède au lien de partage public
**Alors** le rapport n'affiche que les 4 domaines audités
**Et** un encart en haut du rapport mentionne le périmètre : "Audit réalisé sur 4 domaines : Propriétés, Contacts, Companies, Workflows"
**Et** le score global est calculé sur ces 4 domaines uniquement

*Scénario : Historique des audits sur le dashboard*
**Étant donné** que j'ai lancé plusieurs audits avec des sélections différentes
**Quand** je consulte l'historique des audits sur le dashboard
**Alors** chaque audit affiche le nombre de domaines audités (ex: "4/6 domaines")
**Et** je peux voir le détail des domaines en survolant ou en cliquant

---

### Story 5 — Activation conditionnelle des domaines

**En tant que** Admin HubSpot
**je veux** être informé si un domaine que j'ai sélectionné ne peut pas être audité (conditions non remplies)
**afin de** comprendre pourquoi certains domaines sont absents du rapport

**Critères d'acceptance :**

*Scénario : Domaine Utilisateurs avec < 2 users*
**Étant donné** que mon workspace ne contient qu'un seul utilisateur
**Quand** la modale de sélection s'affiche
**Alors** le domaine "Utilisateurs & Équipes" est affiché avec un état désactivé
**Et** un message explique : "Requiert au moins 2 utilisateurs dans le workspace"
**Et** la checkbox n'est pas cochable

*Scénario : Scope OAuth manquant*
**Étant donné** que mon workspace n'a pas le scope `settings.users.read`
**Quand** l'audit tente d'exécuter le domaine Utilisateurs
**Alors** le domaine est marqué en erreur dans le tracker de progression
**Et** un message clair s'affiche avec instructions de re-autorisation
**Et** le score global est calculé sans ce domaine

---

## Spécifications fonctionnelles

### Liste des domaines

| ID | Label dans la modale | Description courte | Obligatoire | Conditions d'activation |
|---|---|---|---|---|
| `properties` | Propriétés personnalisées | Propriétés inutilisées, redondantes, mal typées | Oui (socle) | Toujours actif |
| `contacts` | Contacts & doublons | Doublons, emails invalides, contacts stale, attribution | Non | Toujours actif |
| `companies` | Companies | Doublons, companies orphelines, qualité des données | Non | Toujours actif |
| `workflows` | Workflows | Workflows inactifs, zombies, sans actions, legacy | Non | Toujours actif |
| `users` | Utilisateurs & Équipes | Super Admins, rôles, utilisateurs inactifs, équipes | Non | ≥ 2 utilisateurs dans le workspace |
| `deals` | Deals & Pipelines | Deals bloqués, étapes mal configurées, conversions | Non | Toujours actif (quand EP-06 livré) |

### Comportement de la modale

**Déclenchement :** le clic sur "Lancer un audit" (dashboard) ouvre la modale au lieu de lancer directement l'audit.

**Layout :**
- Titre : "Configurer votre audit"
- Sous-titre : "Sélectionnez les domaines à analyser"
- Liste des domaines avec checkboxes, labels et descriptions
- Le domaine Propriétés a la checkbox cochée et grisée + badge "Obligatoire"
- Les domaines non activables (conditions non remplies) sont grisés avec explication
- Bouton principal : "Lancer l'audit (X domaines)" — le compteur se met à jour dynamiquement
- Bouton secondaire : "Annuler" (ou clic outside pour fermer)

**Raccourci :** un lien "Tout sélectionner / Tout désélectionner" en haut de la liste pour accélérer la configuration.

### Impact sur le moteur d'audit

**Paramètre transmis à l'API :** le body du `POST /api/audit/run` reçoit un nouveau champ `selectedDomains: string[]` contenant les IDs des domaines sélectionnés (ex: `["properties", "contacts", "workflows"]`).

**Valeur par défaut :** si `selectedDomains` est absent ou vide, tous les domaines sont audités (rétrocompatibilité).

**Moteur d'audit (`engine.ts`) :** le `runFullAudit` filtre les domaines à exécuter en fonction de `selectedDomains`. Les domaines non sélectionnés sont simplement ignorés (pas d'appel API, pas de scoring).

**Score global :** la formule existante (moyenne pondérée des domaines actifs) s'applique naturellement — les domaines non sélectionnés ne produisent pas de score et ne sont donc pas comptés.

### Persistance

**Colonne ajoutée :** `audit_domains jsonb` sur la table `audit_runs`.

**Format :**
```json
{
  "selected": ["properties", "contacts", "workflows"],
  "available": ["properties", "contacts", "companies", "workflows", "users", "deals"],
  "skipped_reasons": {
    "users": "less_than_2_users"
  }
}
```

**Rétrocompatibilité :** les audits existants (avant EP-17) ont `audit_domains = null`, ce qui signifie "tous les domaines disponibles au moment de l'audit".

### Impact sur les composants existants

| Composant | Modification |
|---|---|
| Dashboard (bouton "Lancer un audit") | Ouvre la modale au lieu de lancer directement |
| `audit-progress-tracker.tsx` | N'affiche que les domaines sélectionnés |
| `audit-results-view.tsx` | N'affiche que les sections des domaines audités + bandeau périmètre |
| Rapport public (`share/[shareToken]`) | Idem + encart périmètre en haut |
| Historique des audits (dashboard) | Affiche "X/Y domaines" par audit |
| `engine.ts` | Filtre les domaines avant exécution |
| `global-score.ts` | Aucune modification (la logique existante gère déjà les domaines absents) |
| `progress.ts` | Initialise la progression uniquement pour les domaines sélectionnés |
| `llm-summary.ts` | Le résumé LLM mentionne les domaines audités et non audités |

### Edge cases

| Cas | Traitement |
|---|---|
| Tous les domaines sélectionnés | Comportement identique à l'audit actuel |
| Seul Propriétés sélectionné | Audit minimal — score global = score propriétés |
| Domaine sélectionné mais scope manquant | Le domaine passe en erreur, le score global l'exclut, une alert s'affiche |
| Domaine sélectionné mais condition non remplie (ex: users < 2) | Le domaine est exclu silencieusement avec mention dans les métadonnées |
| Audit ancien (avant EP-17) consulté | `audit_domains = null` → afficher comme "Tous les domaines" |
| Rapport public d'un audit partiel | Affiche clairement le périmètre en haut du rapport |

---

## Critères d'acceptance de l'epic

- [ ] Le clic sur "Lancer un audit" ouvre une modale de sélection des domaines
- [ ] Tous les domaines sont cochés par défaut
- [ ] Le domaine Propriétés est obligatoire (checkbox cochée et non décochable)
- [ ] Les domaines non activables (conditions non remplies) sont grisés avec explication
- [ ] Le bouton "Lancer l'audit" affiche le nombre de domaines sélectionnés
- [ ] L'audit ne s'exécute que sur les domaines sélectionnés
- [ ] Le tracker de progression n'affiche que les domaines sélectionnés
- [ ] Le score global est calculé uniquement sur les domaines audités
- [ ] Le rapport n'affiche que les sections des domaines audités
- [ ] Un bandeau mentionne les domaines non inclus dans l'audit
- [ ] La sélection est persistée en base (`audit_domains` jsonb)
- [ ] Le rapport public affiche clairement le périmètre d'audit
- [ ] L'historique des audits affiche "X/Y domaines" par audit
- [ ] Les audits anciens (avant EP-17) fonctionnent normalement (`audit_domains = null`)
- [ ] Le résumé LLM mentionne les domaines audités et non audités

---

## Dépendances

- **EP-04** (Tableau de bord) : le bouton "Lancer un audit" est modifié pour ouvrir la modale
- **EP-UX-02** (Progression d'audit) : le tracker doit être filtré par domaines sélectionnés
- **EP-UX** (Design System) : la modale utilise le composant `Modal` existant du design system

---

## Questions ouvertes

| # | Question | Impact | Statut |
|---|---|---|---|
| Q1 | Faut-il permettre de sauvegarder des "profils de sélection" réutilisables ? | UX consultants multi-clients | ✅ Décidé : LATER (EP-16) |
| Q2 | Faut-il mémoriser la dernière sélection de l'utilisateur comme défaut ? | UX récurrence | À décider |
| Q3 | Le résumé LLM doit-il adapter son contenu aux domaines sélectionnés ? | Qualité du résumé | ✅ Décidé : oui, le prompt LLM mentionne les domaines audités et non audités |
| Q4 | Faut-il un "mode rapide" (Propriétés + Workflows seulement) comme preset ? | UX onboarding | À décider (potentiellement via EP-16) |
