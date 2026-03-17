# Templates de projets d'amélioration CRM

Ce fichier est injecté dans le system prompt du diagnostic IA. Il fournit des templates de projets type pour guider la génération de la roadmap de recommandations. Le LLM doit adapter ces templates aux résultats concrets de l'audit (règles déclenchées, counts, domaines concernés).

---

## Projets de nettoyage de données

### Nettoyage et déduplication de la base contacts

**Quand le recommander :** C-06 (doublons email) OU C-07 (doublons nom+company) OU C-08 (doublons téléphone) déclenchés, ET/OU C-01 (sans email) ou C-02 (sans nom) déclenchés.

**Objectif type :** Réduire les doublons et compléter les données d'identification pour fiabiliser la base contacts.

**Actions clés type :**
- Identifier et fusionner les clusters de doublons par email (outil natif HubSpot ou Insycle/Dedupely)
- Enrichir les contacts sans email via les associations company (email = prénom@domain)
- Compléter les contacts sans nom via l'historique des interactions (emails envoyés, formulaires)
- Mettre en place un workflow de déduplication automatique (exécution hebdomadaire)
- Définir des règles de validation à la saisie (email obligatoire sur tous les formulaires)

**Taille type :** M (1-2 semaines)
**Impact type :** Fort

---

### Nettoyage de la base companies

**Quand le recommander :** CO-01 (sans domain) OU CO-02 (doublons domain) OU CO-04 (orphelines) déclenchés.

**Objectif type :** Fiabiliser la base companies en complétant les identifiants et en supprimant les doublons et orphelines.

**Actions clés type :**
- Renseigner le domain sur les companies sans identifiant web (recherche manuelle ou enrichissement)
- Fusionner les companies en doublon par domain
- Archiver ou supprimer les companies orphelines (0 contacts depuis >90 jours)
- Activer l'association automatique contacts ↔ companies par domain dans les paramètres HubSpot
- Compléter les données de qualification (industrie, dimensionnement) sur les companies actives

**Taille type :** S (quelques jours)
**Impact type :** Moyen

---

### Archivage des contacts et companies inactifs

**Quand le recommander :** C-10 (contacts stale >365j) OU CO-08 (companies stale) déclenchés avec des counts significatifs.

**Objectif type :** Réduire le volume de la base en archivant les enregistrements inactifs pour améliorer la pertinence des listes et réduire les coûts de licence.

**Actions clés type :**
- Créer une liste active "Contacts inactifs >12 mois" avec les critères appropriés
- Vérifier manuellement les contacts à forte valeur avant archivage (deals historiques, clients VIP)
- Exporter la liste pour archive puis supprimer en masse
- Mettre en place un workflow de réengagement automatique avant suppression (email "êtes-vous toujours intéressé ?")
- Planifier une revue trimestrielle de la base inactive

**Taille type :** S (quelques jours)
**Impact type :** Moyen

---

## Projets de structuration pipeline

### Restructuration du pipeline deals

**Quand le recommander :** D-07 (trop de stages) OU D-12 (phases sautées >20%) OU D-13 (points d'entrée multiples >20%) OU D-14 (stages fermés redondants) déclenchés.

**Objectif type :** Simplifier et standardiser le pipeline de vente pour améliorer l'adoption par les commerciaux et la fiabilité du forecast.

**Actions clés type :**
- Auditer les stages actuels avec l'équipe commerciale (quels stages sont réellement utilisés ?)
- Réduire à 5-7 stages avec des critères de passage clairs et documentés
- Supprimer les stages fermés redondants (1 seul "Gagné", 1 seul "Perdu")
- Configurer les propriétés obligatoires par stage (montant, date clôture, contact associé)
- Former les commerciaux au nouveau processus et suivre l'adoption pendant 2 semaines

**Taille type :** M (1-2 semaines)
**Impact type :** Fort

---

### Mise en qualité des deals existants

**Quand le recommander :** D-01 (sans montant) OU D-02 (sans date clôture) OU D-05 (deals bloqués) OU D-03 (deals anciens) déclenchés.

**Objectif type :** Compléter les données manquantes sur les deals ouverts et clôturer les deals morts pour fiabiliser le pipeline.

**Actions clés type :**
- Clôturer en masse les deals ouverts depuis >120 jours sans activité (en "Perdu" avec motif "Inactivité")
- Demander aux commerciaux de renseigner montant et date de clôture sur leurs deals actifs (campagne interne 1 semaine)
- Associer les deals orphelins à leurs contacts et companies
- Mettre en place une alerte automatique quand un deal stagne >30 jours dans un stage

**Taille type :** S à M (selon volume)
**Impact type :** Fort

---

## Projets de gouvernance

### Structuration de la gouvernance utilisateurs

**Quand le recommander :** U-02 (Super Admins en excès) OU U-03 (sans rôle) OU U-04 (rôles non différenciés) OU U-05 (utilisateurs inactifs) déclenchés.

**Objectif type :** Sécuriser les accès au CRM en limitant les Super Admins, en assignant des rôles différenciés et en désactivant les comptes inactifs.

**Actions clés type :**
- Réduire le nombre de Super Admins à 2-3 maximum (identifier les admins qui n'ont pas besoin du niveau Super)
- Créer 3-4 rôles types (Admin, Manager, Commercial, Marketing) avec des permissions adaptées
- Assigner un rôle explicite à chaque utilisateur
- Désactiver les comptes inactifs depuis >90 jours
- Mettre en place une revue trimestrielle des accès (checklist : comptes actifs, rôles pertinents, Super Admins justifiés)

**Taille type :** S (quelques jours)
**Impact type :** Moyen

---

### Organisation des équipes

**Quand le recommander :** U-01 (sans équipe) OU U-06 (équipes vides) déclenchés.

**Objectif type :** Structurer les équipes HubSpot pour activer le reporting managérial et le routing automatique.

**Actions clés type :**
- Mapper l'organigramme réel sur les équipes HubSpot
- Supprimer les équipes vides
- Assigner chaque utilisateur actif à une équipe primaire
- Configurer le round-robin par équipe pour l'attribution automatique des leads/contacts

**Taille type :** XS (quelques heures)
**Impact type :** Faible à Moyen

---

## Projets d'automatisation

### Remise en état des workflows

**Quand le recommander :** W1 (erreurs >10%) OU W2 (sans actions) OU W3 (zombies) OU W4 (inactifs >90j) déclenchés.

**Objectif type :** Nettoyer et fiabiliser les automatisations existantes pour restaurer la confiance dans le système.

**Actions clés type :**
- Investiguer et corriger les workflows en erreur (>10% error rate)
- Désactiver les workflows actifs sans actions (coquilles vides)
- Archiver ou supprimer les workflows inactifs depuis >90 jours
- Renommer les workflows avec une convention claire (objet — déclencheur — action)
- Organiser les workflows restants dans des dossiers thématiques

**Taille type :** S à M (selon volume de workflows)
**Impact type :** Moyen

---

### Mise en place de workflows de maintenance

**Quand le recommander :** Patterns récurrents de données incomplètes ou doublons, après un projet de nettoyage initial.

**Objectif type :** Automatiser la maintenance continue de la base CRM pour éviter la re-dégradation.

**Actions clés type :**
- Workflow de déduplication automatique (hebdomadaire)
- Workflow d'alerte sur contacts sans email créés depuis >7 jours
- Workflow d'alerte sur deals bloqués >30 jours
- Workflow de réengagement des contacts inactifs >6 mois
- Workflow de notification admin sur les nouveaux Super Admins

**Taille type :** M (1-2 semaines)
**Impact type :** Fort (prévention)

---

## Projets leads & prospection

### Optimisation du funnel de prospection

**Quand le recommander :** L-01 (leads anciens) OU L-02 (leads bloqués) OU L-13 (qualifiés sans deal) déclenchés.

**Objectif type :** Accélérer le cycle de qualification et réduire les fuites dans le funnel lead → deal.

**Actions clés type :**
- Clôturer les leads ouverts depuis >60 jours (disqualifier avec motif "Inactivité")
- Créer un SLA marketing/sales sur le traitement des leads (<48h pour un premier contact)
- Mettre en place un workflow de relance automatique à J+7 et J+14 pour les leads non traités
- Automatiser la création de deal quand un lead passe en "Qualifié"
- Définir les critères de qualification (BANT, MEDDIC) et les documenter dans les propriétés de stage

**Taille type :** M (1-2 semaines)
**Impact type :** Fort

---

### Structuration de la disqualification

**Quand le recommander :** L-11 (disqualifiés sans motif) OU L-12 (motif non structuré) déclenchés.

**Objectif type :** Permettre l'analyse des raisons de perte en structurant les motifs de disqualification.

**Actions clés type :**
- Créer une propriété "Motif de disqualification" de type enumeration (pas texte libre)
- Définir 5-8 motifs standards (budget insuffisant, timing, pas le bon interlocuteur, concurrent, hors cible, etc.)
- Rendre le motif obligatoire lors du passage au stage "Disqualifié"
- Mettre en place un dashboard de suivi des motifs de disqualification (répartition mensuelle)

**Taille type :** XS (quelques heures)
**Impact type :** Moyen

---

## Comment utiliser ces templates

1. **Sélectionner les templates pertinents** en fonction des règles déclenchées dans l'audit
2. **Adapter le contenu** aux données concrètes (remplacer les formulations type par les counts réels de l'audit)
3. **Prioriser** selon le modèle de maturité : un workspace Niveau 1 a besoin des projets de nettoyage de données en premier, pas d'optimisation de funnel
4. **Estimer la taille** en fonction du volume (un nettoyage de 50 doublons = S, de 500 doublons = M)
5. **Ne pas tous les recommander** — sélectionner les 5-10 plus pertinents pour l'audit en question
