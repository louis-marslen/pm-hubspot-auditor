# Modèle de maturité CRM

Ce fichier est injecté dans le system prompt du diagnostic IA. Il sert de grille de lecture pour positionner le workspace audité sur une échelle de maturité et calibrer le ton et l'ambition des recommandations.

---

## Les 4 niveaux de maturité

### Niveau 1 — Réactif (score global 0-49)

**Caractéristiques observées :**
- Données de base incomplètes (contacts sans email, deals sans montant, companies sans domain)
- Pas de processus de déduplication — doublons nombreux et non traités
- Workflows absents ou cassés (erreurs >10%, workflows zombies)
- Rôles et permissions non configurés (Super Admins en excès, pas de différenciation)
- Pipeline deals mal structuré (trop de stages, phases sautées)

**Ce que ça signifie :** Le CRM est utilisé comme un carnet d'adresses, pas comme un outil de pilotage. Les données ne sont pas fiables pour le reporting ou les décisions.

**Priorité des recommandations :** Fondamentaux — nettoyer les données de base, sécuriser les accès, structurer le pipeline.

---

### Niveau 2 — Structuré (score global 50-69)

**Caractéristiques observées :**
- Données de base partiellement renseignées (quelques champs critiques manquants)
- Quelques doublons mais pas de processus systématique de déduplication
- Workflows en place mais avec des trous (inactifs non archivés, nommage incohérent)
- Rôles configurés mais avec des exceptions (quelques utilisateurs sans rôle, Super Admins un peu en excès)
- Pipeline fonctionnel mais avec des inefficacités (deals bloqués, associations manquantes)

**Ce que ça signifie :** Le CRM est opérationnel mais fragile. Les processus existent mais ne sont pas maintenus régulièrement. Le reporting est approximatif.

**Priorité des recommandations :** Consolidation — combler les lacunes de données, automatiser la maintenance, standardiser les processus.

---

### Niveau 3 — Optimisé (score global 70-89)

**Caractéristiques observées :**
- Données de base complètes (>80% de remplissage sur les champs critiques)
- Doublons rares et traités régulièrement
- Workflows bien organisés et fonctionnels (nommage clair, dossiers, peu d'erreurs)
- Gouvernance en place (rôles différenciés, Super Admins limités, équipes structurées)
- Pipelines bien structurés (4-7 stages, taux de passage correct, associations en place)

**Ce que ça signifie :** Le CRM est un outil de pilotage fiable. Le reporting est utilisable pour les décisions. Les processus sont documentés et suivis.

**Priorité des recommandations :** Raffinement — optimiser les processus existants, ajouter de l'automatisation avancée, améliorer la segmentation.

---

### Niveau 4 — Excellence (score global 90-100)

**Caractéristiques observées :**
- Données quasi-complètes et à jour
- Déduplication automatisée et proactive
- Workflows couvrant l'ensemble du cycle de vie (nurturing, routing, alertes, nettoyage)
- Gouvernance mature (revue trimestrielle des accès, audit régulier des workflows)
- Pipelines optimisés avec des critères de passage formalisés

**Ce que ça signifie :** Le CRM est un avantage concurrentiel. Les équipes s'appuient dessus au quotidien avec confiance. Les données alimentent des décisions stratégiques.

**Priorité des recommandations :** Maintien et innovation — maintenir la qualité, explorer des cas d'usage avancés (scoring prédictif, ABM, attribution multi-touch).

---

## Comment utiliser ce modèle dans le diagnostic

1. **Positionner le workspace** sur l'échelle à partir du score global et de la distribution des scores par domaine
2. **Calibrer le ton** : un workspace Niveau 1 a besoin de recommandations fondamentales (pas d'optimisation avancée). Un workspace Niveau 3 a besoin de raffinement (pas de rappel des basiques).
3. **Adapter l'ambition des projets** : pour un Niveau 1, un projet "XL" de nettoyage de base est prioritaire. Pour un Niveau 3, des projets "S" d'optimisation ciblée sont plus pertinents.
4. **Identifier le niveau cible réaliste** : viser le niveau immédiatement supérieur, pas l'excellence d'emblée. Un workspace Niveau 1 doit d'abord devenir Structuré.

---

## Indicateurs de progression entre niveaux

| Transition | Indicateurs clés |
|---|---|
| Niveau 1 → 2 | Email rate >80%, 0 Super Admin en excès, pipeline avec ≤8 stages, doublons critiques traités |
| Niveau 2 → 3 | Lifecycle cohérent >80%, workflows nommés et organisés, déduplication régulière, associations deals complètes |
| Niveau 3 → 4 | Score >90 stable sur 3 audits consécutifs, 0 workflow zombie, gouvernance documentée, revue trimestrielle en place |
