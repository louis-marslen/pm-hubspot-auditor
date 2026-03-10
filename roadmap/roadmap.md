# Roadmap — HubSpot Auditor

Format : **Now / Next / Later**
Pas de dates fermes — les items avancent selon la disponibilité et les apprentissages terrain.

Dernière mise à jour : Mars 2026

---

## 🟢 NOW — En cours de construction

Objectif : Avoir un produit fonctionnel utilisable par Louis pour ses missions, et testable par 3 à 5 beta users.

| Epic | Thème | Valeur délivrée | Taille |
|---|---|---|---|
| [EP-01] Connexion HubSpot (OAuth) | Infrastructure | Connecter un workspace HubSpot de façon sécurisée | M |
| [EP-02] Audit des propriétés | Audit core | Détecter propriétés inutilisées, redondantes, mal nommées | M |
| [EP-03] Audit des workflows | Audit core | Détecter workflows inactifs, en erreur, sans déclencheur actif | M |
| [EP-04] Tableau de bord & score de santé | Rapport | Vue d'ensemble avec score global et problèmes par criticité | M |

---

## 🔵 NEXT — Prochaine vague

Objectif : Rendre le produit partageable, vendable et utilisable en autonomie par des prospects.

| Epic | Thème | Valeur délivrée | Taille |
|---|---|---|---|
| [EP-05] Audit des contacts & doublons | Audit core | Détecter doublons, champs vides critiques, mauvaise segmentation | M |
| [EP-06] Audit des deals & pipelines | Audit core | Deals bloqués, étapes mal configurées, taux de conversion anormaux | M |
| [EP-07] Export du rapport (PDF) | Rapport | Rapport exportable et présentable pour les clients / le management | S |
| [EP-08] Onboarding & inscription self-service | Produit | Permettre à un utilisateur de s'inscrire et lancer son premier audit sans aide | M |

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

### Pourquoi l'export PDF n'est pas dans NOW ?

- Dans la phase NOW, Louis peut utiliser le tableau de bord directement en réunion
- L'export est une contrainte pour la persona "Louis Consultant" mais pas bloquante pour valider la valeur core

### Pourquoi le self-service (EP-08) n'est pas dans NOW ?

- La priorité est de valider que l'audit délivre de la valeur avant d'investir dans l'onboarding
- Louis est le premier utilisateur — le self-service viendra quand le produit sera stable

---

## Métriques de succès par phase

| Phase | Métrique cible |
|---|---|
| **NOW** | Louis utilise l'outil sur au moins 2 missions clients / 3 à 5 beta users ont lancé un audit |
| **NEXT** | 10 utilisateurs actifs / taux de complétion d'audit > 70% / 1 premier retour de valeur documenté |
| **LATER** | Premier utilisateur payant / NPS > 40 |
