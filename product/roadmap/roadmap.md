# Roadmap — HubSpot Auditor

Format : **Now / Next / Later**
Pas de dates fermes — les items avancent selon la disponibilité et les apprentissages terrain.

Dernière mise à jour : 17 Mars 2026

---

## ✅ LIVRÉ — Phase 1 complète

Objectif atteint : produit fonctionnel avec 7 domaines d'audit (6 + leads optionnel), utilisable par Louis sur ses missions, testable par des beta users. Rapport d'audit redesigné avec navigation sidebar et vue par sévérité. Navigation applicative unifiée via sidebar (remplacement de la topbar).

| Epic | Thème | Valeur délivrée | Statut |
|---|---|---|---|
| [EP-00] Compte utilisateur | Infrastructure | Inscription email+password, confirmation email, reset password, suppression de compte | ✅ Livré |
| [EP-01] Connexion HubSpot (OAuth) | Infrastructure | Connecter un workspace HubSpot de façon sécurisée, multi-portail, tokens chiffrés | ✅ Livré |
| [EP-02] Audit des propriétés | Audit core | 16 règles : propriétés inutilisées, redondantes, mal typées, champs critiques vides | ✅ Livré |
| [EP-03] Audit des workflows | Audit core | 7 règles : workflows inactifs, zombies, sans actions, mal nommés, legacy | ✅ Livré |
| [EP-04] Tableau de bord & score de santé | Rapport | Score global, résumé LLM (GPT-4.1), lien de partage public, dashboard multi-workspace | ✅ Livré |
| [EP-UX] Design System & Rattrapage UX/UI | Fondation | Dark mode complet, design system (tokens, 13 composants), retrofit de tous les écrans (auth, dashboard, audit, rapport public, settings) | ✅ Livré |
| [EP-05] Audit des contacts & doublons | Audit core | 12 règles : doublons multi-critères (email, nom+company, téléphone), qualité (emails invalides, stale, attribution), cohérence lifecycle | ✅ Livré |
| [EP-05b] Audit des companies | Audit core | 8 règles : doublons domain/nom, companies orphelines, qualité données entreprises | ✅ Livré |
| [EP-UX-02] Progression d'audit en temps réel | UX | Navigation immédiate, tracker de progression domaine par domaine avec sous-étapes, polling temps réel, transition fluide vers rapport | ✅ Livré |
| [EP-09] Audit des utilisateurs & équipes | Audit core | 7 règles U-01 à U-07, détection Super Admins en excès, utilisateurs inactifs, équipes vides, 2 recommandations non scorées (R1/R2), activation conditionnelle (≥ 2 users) | ✅ Livré |
| [EP-06] Audit des deals & pipelines | Audit core | 15 règles D-01 à D-15, deals bloqués, pipeline structurel (phases sautées, stages redondants, points d'entrée multiples), scoring pondéré ×1.5, migration P13-P16, associations batch | ✅ Livré |
| [EP-17] Sélection des domaines d'audit | Personnalisation | Modale de sélection pré-audit (6 domaines, Properties obligatoire), score global adapté, bandeau de périmètre, skipped_reasons, historique partiel, LLM scope-aware | ✅ Livré |
| [EP-18] Audit des leads & pipelines de prospection | Audit core | 14 règles (L-01 à L-14), leads bloqués, pipelines de prospection, disqualifications, handoff lead→deal, domaine optionnel (décoché par défaut), coefficient ×1.0, 7 domaines actifs | ✅ Livré |
| [EP-UX-03] Refonte page rapport d'audit + navigation sidebar | UX | Layout sidebar fixe, vue par sévérité cross-domaine, hero simplifié avec delta score, grille scores domaines, quick wins actionnables, section conformes, rapport public redesigné. **+** Remplacement de la navbar par une AppSidebar applicative (logo, navigation, paramètres, avatar), unification des styles sidebar dashboard/audit, renommage "Tableau de bord" → "Vue d'ensemble" | ✅ Livré |

---

## 🟢 NOW — En cours de construction

Objectif : Packager le produit pour la distribution et l'adoption self-service.

| # | Epic | Thème | Valeur délivrée | Taille |
|---|---|---|---|---|
| 1 | [EP-14] Diagnostic global IA & Recommandations | Intelligence | Diagnostic structuré (forces/faiblesses/risques) + roadmap de recommandations priorisées, générés par gpt-5.4. Remplace le résumé LLM et les quick wins | M |
| 2 | [EP-08] Onboarding & inscription self-service | Produit | Permettre à un utilisateur de s'inscrire et lancer son premier audit sans aide | M |

---

## ⚪ LATER — Horizon futur

Objectif : Étendre la valeur, explorer la monétisation et les cas d'usage avancés.

| Epic | Thème | Valeur délivrée | Statut |
|---|---|---|---|
| [EP-16] Profil business & audit contextuel | Personnalisation | Questionnaire business (B2B/B2C, cycle de vente, maturité CRM) → seuils adaptatifs, criticités contextuelles, recommandations personnalisées. Étend EP-17 | Idée |
| [EP-12] Historique & comparaison d'audits | Récurrence | Comparer l'évolution d'un workspace dans le temps | Idée |
| [EP-13] Mode multi-workspace | Consultant | Gérer plusieurs workspaces clients depuis un seul compte | Idée |
| ~~EP-14~~ | ~~Recommandations enrichies (IA)~~ | — | Promu en NOW — voir EP-14 Diagnostic global IA & Recommandations | Promu |
| [EP-15] Modèle de pricing & paywall | Monétisation | Freemium + plan payant pour accès complet ou multi-workspace | Idée |

---

## Décisions structurantes

### Pourquoi commencer par les propriétés et les workflows ?

- Ce sont les deux domaines les plus universellement problématiques dans un workspace HubSpot
- Faisables sans accès à des données sensibles (pas de contacts nominatifs pour démarrer)
- Louis peut les tester immédiatement sur ses missions clients

### Pourquoi EP-05/05b et EP-UX-02 ont été livrés en priorité dans la phase 2 ?

- EP-05/05b ajoutent les domaines contacts et companies — les deux objets CRM les plus utilisés, essentiels pour un audit crédible
- EP-UX-02 résout l'anxiété utilisateur pendant l'exécution de l'audit (30-300s) avec un feedback en temps réel — prérequis UX avant d'ajouter d'autres domaines qui allongent le temps d'audit
- Le score global intègre désormais 7 domaines (propriétés, workflows, contacts, companies, utilisateurs, deals + leads optionnel) avec pondération renforcée pour les deals (×1.5) et coefficient standard pour les leads (×1.0)

### Pourquoi EP-UX était en première position de la phase 2 ? (livré)

- Les 5 epics de la phase 1 avaient été codés sans guidelines UI/UX — le rattrapage était nécessaire avant d'ajouter des features
- L'onboarding self-service (EP-08) n'a de sens que si le parcours post-inscription est pensé
- Le design system créé par EP-UX est maintenant disponible pour tous les epics suivants

### Pourquoi EP-09 a été livré avant EP-06 ?

- EP-09 (utilisateurs & équipes) était plus rapide à implémenter que EP-06 (deals & pipelines) : API Settings + Owners vs API Deals avec pagination et analyse de pipelines
- La valeur sécurité/gouvernance (Super Admins en excès, comptes fantômes) est immédiate et universelle — chaque workspace HubSpot a des utilisateurs
- La parallélisation des 4 domaines post-Properties (Workflows, Contacts, Companies, Users via `Promise.all`) a été mise en place dans la foulée, réduisant significativement le temps d'audit total

### Pourquoi EP-17 (sélection des domaines) est priorisé maintenant ?

- Avec 6 domaines d'audit (5 livrés + deals en cours), le risque de "bruit" dans le rapport augmente — les utilisateurs qui n'utilisent pas certains objets CRM (ex: companies en B2C) voient leur score faussé
- C'est la **première brique** du futur questionnaire business (EP-16) — elle pose les fondations UX (modale de configuration) et techniques (`audit_domains` en base, paramètre `selectedDomains` dans le moteur)
- Impact technique faible (pas de nouvelle règle d'audit, principalement du filtrage) avec un impact UX élevé (pertinence perçue du score et du rapport)
- Prérequis avant d'ajouter de futurs objets CRM (leads, tickets) qui ne seront pas pertinents pour tous les utilisateurs

### Pourquoi EP-06 et EP-17 ont été livrés en priorité ?

- **EP-06** complète la couverture des 3 objets CRM fondamentaux (contacts, companies, deals) — le domaine le plus directement lié au chiffre d'affaires. 15 règles dont l'audit structurel des pipelines (phases sautées, points d'entrée multiples), feature unique sur le marché
- **EP-17** était un prérequis de qualité avant d'ajouter de nouveaux domaines optionnels (leads) — sans sélection des domaines, chaque nouveau domaine augmente le bruit pour les utilisateurs qui ne l'utilisent pas
- Les deux epics ont été livrés en 7 phases progressives (EP-17) puis un seul batch (EP-06)

### Pourquoi EP-18 (Leads) a été livré après EP-06 et EP-17 ?

- Les leads sont l'objet CRM logique après les deals — ils représentent l'étape pré-deal dans le cycle de vente
- Beaucoup de règles directement adaptées depuis EP-06 (deals/pipelines) avec des seuils ajustés (cycles de prospection plus courts : 30j au lieu de 60j)
- Le domaine est **optionnel par défaut** (décoché dans EP-17) car beaucoup d'entreprises n'utilisent pas l'objet Lead HubSpot
- EP-17 posait les fondations techniques pour les domaines optionnels — l'intégration a été minimale
- Le périmètre d'audit est désormais **complet avec 7 domaines** : propriétés, workflows, contacts, companies, utilisateurs, deals + leads

### Pourquoi EP-UX-03 (refonte rapport) a été priorisé après EP-18 ?

- Le rapport est le **livrable principal** vu par les destinataires (clients, managers) — son efficacité détermine la valeur perçue de l'outil
- Avec 7 domaines d'audit, le rapport par tabs horizontaux devenait difficile à scanner — la vue par sévérité cross-domaine permet d'identifier les priorités en < 10 secondes
- Le bloc quick wins donne un point d'entrée actionnable immédiat — essentiel pour les destinataires non-techniques
- Le delta score (vs audit précédent) pose les bases de la récurrence (EP-12 futur)
- Prérequis avant l'onboarding self-service (EP-08) : le rapport doit être convaincant dès le premier audit pour convertir

### Pourquoi EP-14 (diagnostic IA) est priorisé maintenant ?

- Le rapport liste ~100 règles par sévérité mais ne croise pas les résultats entre domaines — l'utilisateur doit lui-même synthétiser les patterns transverses et construire sa roadmap d'amélioration
- Les consultants RevOps revendent le rapport comme livrable — il doit être **autonome** (diagnostic + plan d'action, pas juste une liste de problèmes)
- Le résumé LLM actuel (3-5 phrases, gpt-4.1) est trop court et générique — il ne justifie pas la valeur perçue de la couche IA
- Les quick wins déterministes (EP-UX-03) sont limités à du reformatage de règles — les recommandations IA avec impact/effort/actions clés sont nettement plus riches
- gpt-5.4 + structured outputs permettent un JSON garanti valide avec un diagnostic de qualité — le timing technique est bon
- **Différenciateur** : aucun concurrent ne propose de recoupement inter-domaines ni de roadmap actionnablee dans un rapport d'audit CRM

### Pourquoi EP-10 (intégrations), EP-11 (reporting) et EP-07 (PDF) ont été abandonnés ?

- **EP-10 et EP-11** : les API HubSpot n'exposent pas suffisamment les données nécessaires pour auditer les intégrations (connexions, erreurs de sync) et le reporting (dashboards orphelins, rapports non utilisés) — impossible de construire un audit fiable sans accès aux données
- **EP-07** : l'export PDF n'apporte pas assez de valeur par rapport au lien de partage public déjà en place — le rapport web est plus riche, interactif et toujours à jour
- Le périmètre d'audit est complet à **7 domaines** (propriétés, workflows, contacts, companies, utilisateurs, deals + leads optionnel) — tous livrés, diagnostic HubSpot complet et crédible

---

## Métriques de succès par phase

| Phase | Métrique cible |
|---|---|
| **LIVRÉ (Phase 1)** | ✅ Louis utilise l'outil sur ses missions clients / beta users peuvent lancer un audit |
| **NOW (Phase 2)** | 10 utilisateurs actifs / taux de complétion d'audit > 70% / 1 premier retour de valeur documenté |
| **LATER** | Premier utilisateur payant / NPS > 40 |
