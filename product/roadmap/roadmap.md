# Roadmap — HubSpot Auditor

Format : **Now / Next / Later**
Pas de dates fermes — les items avancent selon la disponibilité et les apprentissages terrain.

Dernière mise à jour : 15 Mars 2026

---

## ✅ LIVRÉ — Phase 1 complète

Objectif atteint : produit fonctionnel, utilisable par Louis sur ses missions, testable par des beta users.

| Epic | Thème | Valeur délivrée | Statut |
|---|---|---|---|
| [EP-00] Compte utilisateur | Infrastructure | Inscription email+password, confirmation email, reset password, suppression de compte | ✅ Livré |
| [EP-01] Connexion HubSpot (OAuth) | Infrastructure | Connecter un workspace HubSpot de façon sécurisée, multi-portail, tokens chiffrés | ✅ Livré |
| [EP-02] Audit des propriétés | Audit core | 16 règles : propriétés inutilisées, redondantes, mal typées, champs critiques vides | ✅ Livré |
| [EP-03] Audit des workflows | Audit core | 7 règles : workflows inactifs, zombies, sans actions, mal nommés, legacy | ✅ Livré |
| [EP-04] Tableau de bord & score de santé | Rapport | Score global, résumé LLM (GPT-4.1), lien de partage public, dashboard multi-workspace | ✅ Livré |
| [EP-UX] Design System & Rattrapage UX/UI | Fondation | Dark mode complet, design system (tokens, 13 composants), retrofit de tous les écrans (auth, dashboard, audit, rapport public, settings) | ✅ Livré |

---

## 🟢 NOW — En cours de construction

Objectif : Couvrir les 7 domaines d'audit HubSpot pour un diagnostic exhaustif, puis packager le produit pour la distribution.

| # | Epic | Thème | Valeur délivrée | Taille |
|---|---|---|---|---|
| 1 | [EP-05] Audit des contacts & doublons | Audit core | 12 règles : doublons multi-critères (email, nom+company, téléphone), qualité (emails invalides, stale, attribution), cohérence lifecycle | M |
| 1b | [EP-05b] Audit des companies | Audit core | 8 règles : doublons domain/nom, companies orphelines, qualité données entreprises | M |
| 2 | [EP-06] Audit des deals & pipelines | Audit core | Deals bloqués, étapes mal configurées, taux de conversion anormaux | M |
| 3 | [EP-09] Audit des utilisateurs & équipes | Audit core | Utilisateurs inactifs, rôles mal attribués, licences sous-utilisées | M |
| 4 | [EP-10] Audit des intégrations | Audit core | Connexions actives/inactives, erreurs de sync, intégrations orphelines | M |
| 5 | [EP-11] Audit du reporting | Audit core | Tableaux de bord orphelins, rapports non utilisés, métriques non configurées | M |
| 6 | [EP-07] Export du rapport (PDF) | Rapport | Rapport exportable et présentable pour les clients / le management | S |
| 7 | [EP-08] Onboarding & inscription self-service | Produit | Permettre à un utilisateur de s'inscrire et lancer son premier audit sans aide | M |

---

## ⚪ LATER — Horizon futur

Objectif : Étendre la valeur, explorer la monétisation et les cas d'usage avancés.

| Epic | Thème | Valeur délivrée | Statut |
|---|---|---|---|
| [EP-12] Historique & comparaison d'audits | Récurrence | Comparer l'évolution d'un workspace dans le temps | Idée |
| [EP-13] Mode multi-workspace | Consultant | Gérer plusieurs workspaces clients depuis un seul compte | Idée |
| [EP-14] Recommandations enrichies (IA) | Intelligence | Recommandations personnalisées basées sur le secteur / la taille | Idée |
| [EP-15] Modèle de pricing & paywall | Monétisation | Freemium + plan payant pour accès complet ou multi-workspace | Idée |

---

## Décisions structurantes

### Pourquoi commencer par les propriétés et les workflows ?

- Ce sont les deux domaines les plus universellement problématiques dans un workspace HubSpot
- Faisables sans accès à des données sensibles (pas de contacts nominatifs pour démarrer)
- Louis peut les tester immédiatement sur ses missions clients

### Pourquoi EP-UX était en première position de la phase 2 ? (livré)

- Les 5 epics de la phase 1 avaient été codés sans guidelines UI/UX — le rattrapage était nécessaire avant d'ajouter des features
- Un export PDF (EP-07) sur une UI non designée aurait produit un PDF non présentable
- L'onboarding self-service (EP-08) n'a de sens que si le parcours post-inscription est pensé
- Le design system créé par EP-UX est maintenant disponible pour tous les epics suivants

### Pourquoi prioriser la couverture d'audit complète (EP-05→11) avant le packaging (EP-07, EP-08) ?

- Chaque domaine d'audit ajouté augmente directement la valeur de chaque audit lancé — c'est du ROI immédiat
- Un export PDF ou un onboarding n'a de sens que si le rapport couvre un périmètre suffisant pour être convaincant
- L'outil doit couvrir les 7 domaines clés (contacts, deals, propriétés, workflows, équipes, intégrations, reporting) pour être un vrai "audit HubSpot" et pas juste un outil partiel
- Le self-service et le PDF sont du "packaging" — ils rendent le produit distribuable, mais ne changent pas sa valeur intrinsèque

---

## Métriques de succès par phase

| Phase | Métrique cible |
|---|---|
| **LIVRÉ (Phase 1)** | ✅ Louis utilise l'outil sur ses missions clients / beta users peuvent lancer un audit |
| **NOW (Phase 2)** | 10 utilisateurs actifs / taux de complétion d'audit > 70% / 1 premier retour de valeur documenté |
| **LATER** | Premier utilisateur payant / NPS > 40 |
