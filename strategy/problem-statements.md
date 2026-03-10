# Problem Statements — HubSpot Auditor

Deux problem statements correspondant aux deux cas d'usage du produit.

---

## Problem Statement 1 — Self-service (Persona primaire : Sophie RevOps)

### Narrative du problème

**Je suis :** une RevOps Manager responsable de la qualité du CRM dans une scale-up en croissance
- Administratrice HubSpot depuis plusieurs années, souvent sans formation formelle
- Seule ou dans une petite équipe ops, avec peu de temps disponible pour la maintenance
- Responsable des données devant la direction, sans toujours avoir les outils pour en garantir la fiabilité

**J'essaie de :**
- Maintenir un workspace HubSpot sain, fiable et bien gouverné pour que toute mon entreprise puisse prendre des décisions basées sur des données de confiance

**Mais :**
- Je n'ai pas de vue consolidée sur l'état de mon workspace — je découvre les problèmes par accident ou trop tard
- L'audit manuel est long, répétitif et incomplet : je ne sais même pas ce que je ne sais pas
- HubSpot ne propose pas nativement de rapport d'état du workspace ni de scoring de gouvernance
- Je ne peux pas facilement justifier un chantier de nettoyage sans données concrètes sur les problèmes existants
- Même quand j'identifie des problèmes, je n'arrive pas à les traduire en enjeux business pour convaincre ma direction d'allouer du budget ou du temps pour les corriger

**Parce que :**
- Il n'existe pas d'outil accessible, non-technique et autonome pour obtenir une photographie claire d'un workspace HubSpot en quelques minutes

**Ce qui me fait ressentir :**
- Anxieuse avant chaque réunion de direction impliquant des données CRM
- Frustrée de passer des heures sur un travail de vérification manuelle et répétitif
- Illégitime quand je ne peux pas répondre à des questions simples sur l'état de notre CRM

### Énoncé final

> Les RevOps Managers et admins HubSpot ont besoin d'un moyen d'obtenir rapidement et en autonomie un état de santé complet de leur workspace HubSpot — traduit en impact business compréhensible par leur direction — parce qu'il n'existe pas d'outil natif pour auditer la gouvernance d'un CRM HubSpot, ce qui les contraint à des vérifications manuelles longues et les laisse sans arguments chiffrés pour prioriser les corrections auprès de leur management.

---

## Problem Statement 2 — Usage professionnel (Persona secondaire : Louis Consultant)

### Narrative du problème

**Je suis :** un consultant RevOps freelance qui démarre régulièrement de nouvelles missions chez des clients HubSpot
- Expert du CRM mais toujours face à un workspace inconnu en début de mission
- Facturé à la journée ou au forfait ; chaque heure consacrée à la collecte de données est une heure de moins sur le conseil à valeur ajoutée
- Attendu par mon client pour délivrer rapidement des recommandations concrètes

**J'essaie de :**
- Comprendre rapidement l'état du HubSpot d'un nouveau client pour démarrer ma mission sur des bases solides et délivrer de la valeur dès le kick-off

**Mais :**
- Je dois passer 1 à 2 jours à "cartographier" manuellement le workspace avant de pouvoir formuler le moindre diagnostic
- Ce travail est répétitif d'une mission à l'autre, non différenciant et mal valorisé
- Je n'ai pas de livrable structuré à présenter à mon client en début de mission pour aligner sur les priorités
- Les problèmes que je détecte sont techniques : je dois faire l'effort de les retraduire en enjeux business moi-même, sans support, pour chaque mission et chaque interlocuteur dirigeant

**Parce que :**
- Il n'existe pas d'outil qui génère automatiquement un rapport d'audit structuré et exportable d'un workspace HubSpot, sans nécessiter d'accès permanent au compte client

**Ce qui me fait ressentir :**
- Frustré de répéter les mêmes tâches manuelles à chaque nouvelle mission
- Sous-valorisé quand une grande partie de mon temps facturé est consacré à de la collecte plutôt qu'au conseil
- Désireux de paraître encore plus professionnel et structuré auprès de mes clients dès le premier jour

### Énoncé final

> Les consultants RevOps ont besoin d'un moyen de générer en moins d'une heure un rapport d'audit structuré, exportable et traduit en impact business d'un workspace HubSpot client, parce que l'audit manuel initial prend 1 à 2 jours et produit un diagnostic technique difficile à faire passer auprès d'un CEO — ce qui retarde la création de valeur et les oblige à assurer eux-mêmes la traduction business à chaque mission.

---

## Ce que les deux problems statements partagent

| Dimension | Commun aux deux personas |
|---|---|
| **Problème core** | Pas de vue consolidée sur l'état d'un workspace HubSpot |
| **Cause racine** | Absence d'outil natif HubSpot pour l'audit et la gouvernance |
| **Résultat souhaité** | Un rapport d'état clair, priorisé et actionnable en quelques minutes |
| **Contrainte commune** | Non-destructif — l'outil ne doit jamais modifier les données |
| **Besoin partagé clé** | Traduire les problèmes CRM en enjeux business pour convaincre des dirigeants d'agir |
| **Différenciation entre personas** | Sophie veut de l'autonomie récurrente ; Louis veut de la vitesse ponctuelle et un livrable exportable |

---

## L'interlocuteur invisible : le dirigeant

Les deux personas ont un **interlocuteur commun** qu'ils doivent convaincre : le CEO, le DG, le directeur commercial ou le board. Cet interlocuteur n'utilise pas l'outil directement — il **reçoit** le rapport ou l'argumentaire.

C'est pourquoi HubSpot Auditor doit concevoir ses outputs pour être lisibles à deux niveaux simultanément :

- **Niveau opérationnel** (pour Sophie et Louis) : détail technique, liste des problèmes, marche à suivre
- **Niveau exécutif** (pour leur interlocuteur dirigeant) : résumé de l'impact business, priorisation par enjeu, recommandation d'investissement

Ce double registre n'est pas optionnel — c'est la condition pour que le rapport soit **actionné** plutôt que simplement **consulté**.
