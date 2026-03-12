# Vision & Positionnement — HubSpot Auditor

---

## Vision produit

> Permettre à n'importe quel utilisateur HubSpot — qu'il soit RevOps, admin ou consultant — d'obtenir en quelques minutes un état de santé clair et actionnable de son workspace, **traduit en impact business** pour convaincre les dirigeants d'agir.

---

## Positionnement

### Proposition de valeur

**Pour** les RevOps Managers, admins HubSpot et consultants CRM
**qui ont besoin de** comprendre rapidement l'état de leur workspace HubSpot et de traduire les problèmes techniques en enjeux business pour convaincre leur direction d'agir
**HubSpot Auditor**
**est un** outil d'audit et de scoring CRM
**qui** analyse automatiquement un workspace HubSpot et délivre un rapport d'audit priorisé — chaque problème est traduit en impact business concret (temps perdu, revenus à risque, opportunités manquées) pour faciliter la prise de décision à tous les niveaux

### Énoncé de différenciation

**Contrairement à** un audit manuel dans des tableurs ou à un outil de monitoring purement technique
**HubSpot Auditor**
**fournit** un rapport d'audit immédiat et non-destructif qui parle aussi bien aux opérationnels (problèmes CRM détaillés) qu'aux dirigeants (impact business chiffré et priorisé) — en moins de 5 minutes

---

## Principe non-négociable

> **L'outil ne modifie jamais les données HubSpot. Il lit, analyse, recommande — jamais ne touche.**

---

## Personas

### Persona 1 — "Sophie RevOps" *(persona primaire, self-service)*

**Profil :**
- RevOps Manager ou Admin HubSpot dans une scale-up (30 à 500 personnes)
- 2 à 5 ans d'expérience HubSpot, majoritairement autodidacte
- Responsable de la qualité des données CRM, de la configuration des workflows et des pipelines
- Utilise HubSpot quotidiennement ; a hérité d'un workspace parfois mal configuré

**Situation :**
Elle sent que son HubSpot "part dans tous les sens" mais n'a pas de vue consolidée des problèmes. Elle découvre les anomalies par accident ou trop tard.

**Objectifs :**
- Avoir une photographie claire de l'état de son workspace à tout moment
- Justifier un chantier de nettoyage auprès de son management avec des données
- Gagner du temps sur les vérifications manuelles récurrentes

**Contrainte d'usage :**
- Veut une solution self-service, pas besoin d'aide pour la configurer
- Doit pouvoir partager le rapport à son manager ou à son équipe
- Sensible au prix (budget ops souvent limité dans les scale-ups)

**Verbatims :**
- "J'ai 200 propriétés custom dont je suis sûre que la moitié ne sert à rien."
- "Je découvre les workflows cassés quand un client se plaint."
- "Avant chaque COMEX, je re-vérifie tout manuellement parce que je ne fais pas confiance aux données."
- "Je sais qu'il y a des problèmes, mais je ne sais pas comment expliquer ça à mon CEO sans qu'il me demande 'et alors, ça coûte combien ?'"

---

### Persona 2 — "Louis Consultant" *(persona secondaire, usage professionnel)*

**Profil :**
- Consultant RevOps ou CRM freelance / en cabinet
- Démarre régulièrement de nouvelles missions avec un HubSpot client qu'il ne connaît pas
- Facture à la journée ou au forfait ; chaque heure comptée

**Situation :**
En début de mission, il passe 1 à 2 jours à "cartographier" l'état du HubSpot client. Ce travail est répétitif, non facturé au meilleur taux, et ralentit la création de valeur pour le client.

**Objectifs :**
- Avoir un point de départ structuré en moins d'une heure sur un nouveau workspace
- Délivrer un rapport d'état professionnel à son client dès le kick-off
- Se concentrer sur l'analyse et les recommandations plutôt que sur la collecte de données

**Contrainte d'usage :**
- A besoin d'un rapport exportable et présentable (PDF ou similaire)
- Doit pouvoir connecter le HubSpot d'un client facilement, sans accès permanent
- L'outil doit être perçu comme professionnel par ses clients

**Verbatims :**
- "J'aurais besoin de 2 jours juste pour comprendre comment ce HubSpot est configuré."
- "Le client pense que je fais de la magie, mais en vrai je suis en train de cliquer partout."
- "Si je pouvais avoir un rapport en 10 minutes, je pourrais aller directement au conseil."
- "Mon vrai problème, c'est de faire comprendre au CEO que les problèmes HubSpot ont un impact sur son CA — pas juste sur la vie des ops."

---

## Principes produit

| Principe | Ce que ça signifie concrètement |
|---|---|
| **Actionnable avant tout** | Chaque problème détecté est accompagné d'une recommandation concrète et d'une prochaine action claire |
| **Non-destructif** | L'outil lit uniquement, ne modifie jamais les données HubSpot |
| **Priorisé** | Les problèmes sont classés par criticité : 🔴 Critique / 🟡 Avertissement / 🔵 Info |
| **Accessible** | Les résultats sont compréhensibles sans expertise technique HubSpot avancée |
| **Reproductible** | Le même audit réalisé deux fois sur le même workspace produit les mêmes résultats |
| **Traduit en business** | Chaque problème CRM est systématiquement traduit en impact business pour les dirigeants |

---

## Principe de traduction business

C'est le principe différenciateur du produit. Chaque problème détecté dans le CRM doit être accompagné d'une traduction en langage dirigeant — pas uniquement d'une description technique.

### Pourquoi c'est critique

Les utilisateurs de l'outil (RevOps, admin, consultant) ne sont pas toujours les décideurs. Ils ont besoin de **convaincre** leur CEO, leur DG, ou leur client d'investir du temps et des ressources pour corriger les problèmes CRM. Sans traduction business, les findings restent des problèmes "d'ops" — invisibles et déprioritisés.

### Le double registre de lecture

Chaque problème et chaque recommandation doivent fonctionner à deux niveaux :

| Niveau | Audience | Langage | Exemple |
|---|---|---|---|
| **Technique** | RevOps, admin | Terminologie CRM | "47 workflows inactifs depuis plus de 90 jours dont 12 en erreur silencieuse" |
| **Business** | CEO, DG, directeur commercial | Impact mesurable | "Des leads entrants ne reçoivent probablement aucun suivi automatisé — risque de perte de revenus sur les nouveaux contacts" |

### Les 4 dimensions d'impact business à couvrir

1. **Temps perdu** — Combien d'heures/semaine sont gaspillées à cause de ce problème (saisie manuelle, vérifications, corrections) ?
2. **Revenus à risque** — Quelles opportunités commerciales sont affectées (deals mal suivis, leads non traités, segmentation erronée) ?
3. **Coût caché** — Quelles ressources sont payées pour rien (licences inutilisées, intégrations inactives, campagnes mal ciblées) ?
4. **Risque de décision** — Quelles décisions stratégiques reposent sur des données potentiellement incorrectes ?

### Exemples de traductions par domaine d'audit

| Problème CRM | Traduction business |
|---|---|
| 180 propriétés custom non renseignées depuis 6 mois | Vos commerciaux remplissent des champs inutiles à chaque saisie — estimez le temps perdu × leur coût horaire |
| 8 workflows en erreur silencieuse | Des actions automatiques censées être déclenchées ne le sont pas — leads non assignés, relances non envoyées |
| 2 400 contacts en doublon | Budget marketing potentiellement gaspillé sur des doublons ; données de reporting déformées |
| 34 deals sans activité depuis 30+ jours | CA potentiel immobilisé dans le pipeline sans suivi actif — forecasting probablement surestimé |
| 6 utilisateurs HubSpot inactifs depuis 3 mois | Licences payées pour des comptes non utilisés |
| Pipeline avec 1 seul stage utilisé sur 7 | Pas de visibilité réelle sur l'avancement des deals — décisions commerciales prises sans données |
