# Roadmap — HubSpot Auditor

Format : **Now / Next / Later**
Pas de dates fermes — les items avancent selon la disponibilité et les apprentissages terrain.

Dernière mise à jour : Mars 2026

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

---

## 🟢 NOW — En cours de construction

Objectif : Rendre le produit partageable, vendable et utilisable en autonomie par des prospects.

| Epic | Thème | Valeur délivrée | Taille |
|---|---|---|---|
| **[EP-UX] Design System & Rattrapage UX/UI** | **Fondation** | **Cohérence visuelle, parcours guidé, rattrapage des écrans existants** | **M** |
| [EP-07] Export du rapport (PDF) | Rapport | Rapport exportable et présentable pour les clients / le management | S |
| [EP-08] Onboarding & inscription self-service | Produit | Permettre à un utilisateur de s'inscrire et lancer son premier audit sans aide | M |
| [EP-05] Audit des contacts & doublons | Audit core | Détecter doublons, champs vides critiques, mauvaise segmentation | M |
| [EP-06] Audit des deals & pipelines | Audit core | Deals bloqués, étapes mal configurées, taux de conversion anormaux | M |

---

## ⚪ LATER — Horizon futur

Objectif : Étendre la valeur, explorer la monétisation et les cas d'usage avancés.

| Epic | Thème | Valeur délivrée | Statut |
|---|---|---|---|
| [EP-09] Audit des utilisateurs & équipes | Audit core | Utilisateurs inactifs, rôles mal attribués, licences sous-utilisées | Idée |
| [EP-10] Audit des intégrations | Audit core | Connexions actives/inactives, erreurs de sync, intégrations orphelines | Idée |
| [EP-11] Audit du reporting | Audit core | Tableaux de bord orphelins, rapports non utilisés, métriques non configurées | Idée |
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

### Pourquoi EP-UX est en première position de la phase 2 ?

- Les 5 epics de la phase 1 ont été codés sans guidelines UI/UX — le rattrapage est nécessaire avant d'ajouter des features
- Un export PDF (EP-07) sur une UI non designée produira un PDF non présentable
- L'onboarding self-service (EP-08) n'a de sens que si le parcours post-inscription est pensé
- Le design system créé par EP-UX sera réutilisé par tous les epics suivants

### Pourquoi l'export PDF est dans NOW (phase 2) ?

- La phase 1 valide que l'audit délivre de la valeur — le dashboard suffit pour cette phase
- L'export devient prioritaire dès que Louis veut partager des rapports à des clients sans les inviter sur l'outil

### Pourquoi le self-service (EP-08) est dans NOW (phase 2) ?

- L'authentification est fonctionnelle mais l'onboarding n'est pas guidé
- Un utilisateur externe ne sait pas quoi faire après l'inscription — il faut une séquence d'activation

---

## Métriques de succès par phase

| Phase | Métrique cible |
|---|---|
| **LIVRÉ (Phase 1)** | ✅ Louis utilise l'outil sur ses missions clients / beta users peuvent lancer un audit |
| **NOW (Phase 2)** | 10 utilisateurs actifs / taux de complétion d'audit > 70% / 1 premier retour de valeur documenté |
| **LATER** | Premier utilisateur payant / NPS > 40 |
