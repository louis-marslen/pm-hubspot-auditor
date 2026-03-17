# Patterns inter-domaines

Ce fichier est injecté dans le system prompt du diagnostic IA. Il décrit les corrélations connues entre règles de domaines différents. Le LLM doit utiliser ces patterns pour construire les clusters de faiblesses et de risques du diagnostic.

---

## Pattern 1 — Qualité des données d'identification

**Signal :** Les données de base (identifiants, champs critiques) sont incomplètes à travers plusieurs objets CRM.

**Règles corrélées :**
- C-01 (contacts sans email) + C-02 (contacts sans nom)
- CO-01 (companies sans domain)
- D-01 (deals sans montant) + D-02 (deals sans date clôture)
- L-14 (leads sans source)
- P1 (propriétés vides >90j) — signal indirect : si les propriétés custom sont vides, les propriétés standard le sont probablement aussi

**Cause racine probable :** Absence de contrôle à la saisie (pas de champs obligatoires configurés), imports CSV non nettoyés, création manuelle sans processus standardisé.

**Conséquence systémique :** Le reporting est non fiable, le scoring est faussé, le marketing automation ne peut pas fonctionner (segmentation impossible sans données de base).

---

## Pattern 2 — Prolifération de doublons

**Signal :** Des doublons sont détectés sur plusieurs objets CRM simultanément.

**Règles corrélées :**
- C-06 (doublons email) + C-07 (doublons nom+company) + C-08 (doublons téléphone)
- CO-02 (doublons domain) + CO-03 (doublons nom entreprise)
- P3 (doublons de propriétés)

**Cause racine probable :** Pas de processus de déduplication en place, imports multiples sans vérification, intégrations tierces qui créent des doublons (Salesforce sync, formulaires web, enrichissement).

**Conséquence systémique :** Double-comptage dans le reporting (pipeline gonflé, base contacts surestimée), conflits d'attribution entre commerciaux, expérience client dégradée (emails en double, appels en double).

---

## Pattern 3 — Deals non exploitables pour le forecast

**Signal :** Les données des deals sont incomplètes et le pipeline est mal structuré.

**Règles corrélées :**
- D-01 (sans montant) + D-02 (sans date clôture) + D-04 (propriétés obligatoires manquantes)
- D-05 (deals bloqués) + D-03 (deals anciens >60j)
- D-09 (sans contact associé) + D-10 (sans company associée)
- D-12 (phases sautées) + D-13 (points d'entrée multiples)

**Cause racine probable :** Pipeline non adapté au cycle de vente réel, pas de critères de passage entre stages, commerciaux qui ne remplissent que le minimum.

**Conséquence systémique :** Forecast impossible (pas de montant ni date = pas de projection), pipeline coverage non calculable, management aveugle sur la performance commerciale.

---

## Pattern 4 — Gouvernance insuffisante

**Signal :** Les accès, rôles et équipes ne sont pas configurés de manière rigoureuse.

**Règles corrélées :**
- U-02 (Super Admins en excès) + U-03 (utilisateurs sans rôle) + U-04 (rôles non différenciés)
- U-01 (sans équipe) + U-06 (équipes vides)
- U-05 (utilisateurs inactifs)

**Cause racine probable :** Configuration initiale par un admin non formé, onboarding des utilisateurs sans processus de rôle/équipe, départs non gérés (comptes non désactivés).

**Conséquence systémique :** Risque de sécurité (accès trop larges, comptes fantômes), coût de licence gaspillé (utilisateurs inactifs), reporting managérial faussé (équipes vides = pas de visibilité par équipe).

---

## Pattern 5 — Associations manquantes (objets isolés)

**Signal :** Les objets CRM ne sont pas reliés entre eux — contacts, companies, deals et leads existent en silos.

**Règles corrélées :**
- C-05 (contacts sans company)
- CO-04 (companies orphelines, 0 contacts)
- D-09 (deals sans contact) + D-10 (deals sans company)
- L-04 (leads sans contact)

**Cause racine probable :** Création manuelle sans association, imports qui ne mappent pas les relations, workflows qui créent des objets sans les relier.

**Conséquence systémique :** Impossible de construire une vue compte (account-based) cohérente, pas de visibilité sur le cycle complet prospect → lead → deal → client, reporting par compte impossible.

---

## Pattern 6 — Automatisations dégradées

**Signal :** Les workflows sont en mauvais état de fonctionnement et d'organisation.

**Règles corrélées :**
- W1 (erreurs >10%) + W2 (actifs sans actions)
- W3 (zombies, 0 enrollment) + W4 (inactifs >90j)
- W6 (mauvais nommage) + W7 (sans dossier)

**Cause racine probable :** Workflows créés au fil de l'eau sans gouvernance, pas de revue périodique, turnover de l'admin HubSpot sans passation.

**Conséquence systémique :** Perte de confiance dans l'automatisation (emails non envoyés, tâches non créées), risque de réactivation accidentelle d'un workflow obsolète, temps perdu à identifier quel workflow fait quoi.

---

## Pattern 7 — Funnel de prospection cassé (leads)

**Signal :** Le processus de qualification des leads ne fonctionne pas bout en bout.

**Règles corrélées :**
- L-01 (leads anciens >30j) + L-02 (leads bloqués)
- L-13 (qualifiés sans deal) — fuite critique dans le funnel
- L-11 (disqualifiés sans motif) + L-12 (motif non structuré)
- L-04 (leads sans contact)

**Cause racine probable :** Processus de qualification non formalisé, pas de SLA entre marketing et sales sur le traitement des leads, pipeline de prospection utilisé comme "parking" au lieu d'outil de vélocité.

**Conséquence systémique :** Leads gaspillés (qualification mais pas de conversion en deal), pas de visibilité sur les raisons de perte (analyse impossible sans motifs structurés), cycle de vente allongé artificiellement.

---

## Pattern 8 — Propriétés custom non maintenues

**Signal :** Les propriétés personnalisées ne sont pas utilisées ni documentées.

**Règles corrélées :**
- P1 (vides >90j) + P2 (sous-utilisées <5%)
- P3 (doublons de propriétés)
- P4 (sans description) + P5 (mal organisées)
- P6 (mauvais typage)

**Cause racine probable :** Accumulation de propriétés créées pour des besoins ponctuels (import, intégration, campagne) sans nettoyage, pas de gouvernance sur la création de propriétés.

**Conséquence systémique :** Formulaires surchargés (trop de champs), confusion entre propriétés similaires (doublons), données inutilisables (mauvais typage), onboarding des nouveaux utilisateurs complexifié.

---

## Comment utiliser ces patterns

1. **Identifier les patterns actifs** : pour chaque pattern, vérifier si ≥ 2 règles corrélées sont déclenchées. Si oui, le pattern est actif.
2. **Construire les clusters de faiblesses** : chaque pattern actif devient un cluster dans le diagnostic. Le titre du cluster reprend le nom du pattern.
3. **Construire les risques** : combiner 2+ patterns actifs pour identifier des risques systémiques. Exemple : Pattern 1 (données incomplètes) + Pattern 2 (doublons) = risque "Base CRM non fiable pour le pilotage".
4. **Prioriser** : les patterns touchant les données de base (patterns 1, 2, 5) sont généralement plus critiques que les patterns organisationnels (patterns 6, 8) car ils impactent toute la chaîne en aval.
