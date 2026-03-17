# HubSpot Best Practices par domaine

Ce fichier est injecté dans le system prompt du diagnostic IA. Il sert de référentiel pour évaluer les forces et identifier les écarts par rapport aux bonnes pratiques.

---

## Contacts & données de base

### Identification
- Chaque contact doit avoir au minimum : email, prénom, nom. L'email est l'identifiant unique du CRM — un contact sans email est inexploitable pour le marketing automation.
- Le lifecycle stage doit refléter la position réelle dans le funnel (subscriber → lead → MQL → SQL → opportunity → customer). Un lifecycle incohérent avec le statut des deals fausse le reporting et les segmentations.

### Déduplication
- Les doublons dégradent la fiabilité du reporting (double-comptage), créent des conflits d'attribution entre commerciaux et provoquent des envois marketing en double.
- Bonne pratique : mettre en place un workflow de déduplication automatique (HubSpot natif ou outil tiers type Dedupely/Insycle) avec exécution hebdomadaire.
- Les doublons par email sont les plus critiques (identifiant unique). Les doublons par nom+company et par téléphone sont des signaux de saisie manuelle non normalisée.

### Attribution & ownership
- Chaque contact doit avoir un owner assigné. Les contacts sans owner ne sont suivis par personne et tombent dans un angle mort commercial.
- La source d'acquisition (original source) est essentielle pour mesurer le ROI marketing. Un contact sans source rend impossible l'attribution des conversions.

### Hygiène
- Les contacts stale (>12 mois sans activité) encombrent la base, faussent les taux d'engagement et augmentent les coûts de licence HubSpot (facturation par contact marketing).
- Bonne pratique : revue trimestrielle des contacts inactifs, archivage ou suppression des contacts non engagés.

---

## Companies

### Identification
- Le domain est l'identifiant clé des companies dans HubSpot — il permet le dédoublonnage automatique, l'enrichissement (Clearbit, ZoomInfo) et l'association automatique contacts ↔ companies.
- Une company sans domain est une impasse : pas de déduplication possible, pas d'enrichissement, pas d'association automatique.

### Associations
- Les companies orphelines (0 contacts associés) sont souvent des importations non nettoyées ou des créations manuelles abandonnées. Elles polluent les listes et le reporting.
- Bonne pratique : chaque company active doit avoir ≥ 1 contact associé. Les companies sans contact depuis >90 jours doivent être revues.

### Qualification
- L'industrie et le dimensionnement (nombre d'employés, CA annuel) sont essentiels pour la segmentation B2B (ABM, scoring, routing).
- Une base companies sans ces données empêche toute stratégie de ciblage basée sur le profil entreprise.

---

## Deals & Pipelines

### Qualité des deals
- Un deal sans montant rend le forecast impossible. Un deal sans date de clôture ne peut pas être planifié dans le pipeline.
- Les deals bloqués (>60 jours dans le même stage sans progression) sont le signe d'un pipeline mal géré ou d'opportunités mortes non clôturées. Ils faussent le pipeline coverage et les prévisions.

### Structure des pipelines
- Un pipeline efficace a 4-7 stages clairement définis, avec des critères de passage explicites entre chaque étape.
- Plus de 8 stages indique souvent une granularité excessive qui ralentit la saisie et réduit l'adoption par les commerciaux.
- Les phases sautées (>20% des deals ne passent pas par tous les stages) signalent des stages inutiles ou un manque de formation.
- Les points d'entrée multiples (>20% des deals ne commencent pas au premier stage) indiquent un processus de vente non standardisé.
- Les stages fermés redondants (plusieurs "Gagné" ou plusieurs "Perdu") complexifient le reporting sans valeur ajoutée.

### Associations
- Un deal doit être associé à au minimum 1 contact (l'interlocuteur) et idéalement 1 company (le compte). Les deals non associés sont impossibles à rattacher dans le reporting par compte.

---

## Workflows

### Santé des automatisations
- Les workflows actifs avec un taux d'erreur >10% produisent une mauvaise expérience (emails non envoyés, tâches non créées) et doivent être investigués immédiatement.
- Les workflows actifs sans actions sont des coquilles vides qui consomment des ressources d'enrollment sans produire de résultat.
- Les workflows zombies (actifs mais 0 enrollment depuis >90 jours) encombrent la liste et créent de la confusion sur ce qui est réellement automatisé.

### Organisation
- Un nommage clair (objet + déclencheur + action, ex: "Contact — Nouveau MQL — Notification SDR") permet de comprendre le rôle du workflow sans l'ouvrir.
- L'organisation en dossiers est essentielle dès >10 workflows pour maintenir la lisibilité.

### Gouvernance
- Les workflows inactifs depuis >90 jours doivent être archivés ou supprimés. Leur accumulation crée un risque de réactivation accidentelle et de l'ambiguïté sur l'état réel des automatisations.

---

## Utilisateurs & Équipes

### Sécurité
- Le nombre de Super Admins doit être minimal (2-3 maximum, quel que soit la taille de l'organisation). Chaque Super Admin a un accès total et irréversible — c'est une surface d'attaque.
- Les utilisateurs inactifs (aucune connexion >90 jours) conservent leurs accès et licences. Ils doivent être désactivés pour des raisons de sécurité et de coût.

### Gouvernance des rôles
- Chaque utilisateur doit avoir un rôle explicite correspondant à ses responsabilités. Les utilisateurs sans rôle ont les permissions par défaut, qui sont souvent trop larges.
- Si >80% des utilisateurs ont le même rôle, les rôles ne sont pas utilisés comme outil de gouvernance — c'est un indicateur de configuration bâclée.

### Structure des équipes
- Les équipes structurent le routing (round-robin), le reporting managérial et les permissions. Un utilisateur sans équipe est invisible dans ces mécanismes.
- Les équipes vides sont des artefacts à nettoyer.

---

## Leads & Prospection

### Vélocité
- Les leads ont un cycle court (qualification en <30 jours). Un lead ouvert depuis >30 jours est probablement oublié ou mal qualifié.
- Un lead bloqué dans le même stage >30 jours indique un processus de qualification défaillant.

### Qualification
- Un lead qualifié doit générer un deal. Un lead marqué "qualifié" sans deal associé est une fuite dans le funnel — l'opportunité a été validée mais pas convertie.
- Les leads disqualifiés doivent avoir un motif structuré (enumeration, pas texte libre) pour permettre l'analyse des raisons de perte.

### Associations
- Chaque lead doit être associé à un contact (le prospect). Un lead sans contact est un dossier sans interlocuteur identifié.
