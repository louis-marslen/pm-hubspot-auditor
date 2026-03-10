---
name: conseiller-priorisation
description: Choisir un framework de priorisation selon le stade du produit, le contexte de l'équipe et les besoins des parties prenantes. À utiliser pour décider entre RICE, ICE, valeur/effort ou une autre approche de scoring.
type: interactive
source: adapté de deanpeters/Product-Manager-Skills — prioritization-advisor
---

## Objectif

Guider le PM dans le choix du bon framework de priorisation en posant des questions adaptatives sur le stade du produit, le contexte de l'équipe, les besoins de prise de décision et la disponibilité des données. L'objectif est d'éviter le "framework whiplash" (changer de framework constamment) ou d'appliquer le mauvais framework.

---

## Les principaux frameworks de priorisation

### Frameworks de scoring
| Framework | Description | Idéal pour |
|---|---|---|
| **RICE** (Reach, Impact, Confidence, Effort) | Data-driven, nécessite des métriques | Produits avec données d'usage, scaling |
| **ICE** (Impact, Confidence, Ease) | Léger, scoring rapide | Validation rapide, early stage |
| **Valeur vs. Effort** (matrice 2×2) | Quick wins vs. paris stratégiques | Alignement visuel des parties prenantes |
| **Scoring pondéré** | Critères personnalisés avec pondération | Contextes avec critères multiples |

### Frameworks stratégiques
| Framework | Description | Idéal pour |
|---|---|---|
| **Modèle Kano** | Classifier les features (basiques, performance, enchantement) | Comprendre les attentes clients |
| **MoSCoW** (Must, Should, Could, Won't) | Forçage de décisions difficiles | Définir le périmètre d'un sprint ou d'une release |
| **Coût du délai** | Basé sur l'urgence | Features time-sensitive |
| **Impact Mapping** | Guidé par les objectifs | Lier les features aux résultats business |

---

## Process interactif

### Question 1 : Stade du produit

**"À quel stade est votre produit ?"**

1. **Avant product-market fit** — "En recherche de PMF ; expérimentation rapide ; incertitude élevée sur ce que veulent les clients" (besoin de vitesse)
2. **PMF trouvé, en scaling** — "PMF initial trouvé ; croissance rapide ; ajout de features pour retenir/étendre" (équilibre vitesse + qualité)
3. **Produit mature, optimisation** — "Marché établi ; améliorations incrémentales ; décisions basées sur les données" (faible incertitude)
4. **Portefeuille de produits** — "Plusieurs produits ; dépendances cross-produit ; parties prenantes multiples" (complexité de coordination)

---

### Question 2 : Contexte de l'équipe

**"Quel est l'environnement de votre équipe et des parties prenantes ?"**

1. **Petite équipe, ressources limitées** — "3 à 5 ingénieurs, 1 PM, besoin de focus absolu" (besoin d'un framework simple et rapide)
2. **Équipe cross-fonctionnelle, alignée** — "Produit, design, engineering alignés ; objectifs clairs" (peut utiliser des frameworks data-driven)
3. **Parties prenantes multiples, désalignées** — "Execs, sales, clients ont tous des opinions ; besoin d'un processus transparent" (besoin d'un framework de consensus)
4. **Grande organisation, dépendances complexes** — "Plusieurs équipes, roadmap partagée, dépendances inter-équipes" (besoin d'un framework de coordination)

---

### Question 3 : Besoin de prise de décision

**"Quel est le défi principal que vous essayez de résoudre avec la priorisation ?"**

1. **Trop d'idées, incertitude sur laquelle poursuivre** — "Backlog de 100+ items ; besoin de réduire à top 10" (framework de filtrage)
2. **Désaccord des parties prenantes sur les priorités** — "Sales veut des features, les execs veulent des paris stratégiques" (framework d'alignement)
3. **Manque de décisions basées sur les données** — "Priorisation au feeling ; besoin d'un processus basé sur les métriques" (framework de scoring)
4. **Arbitrages difficiles entre paris stratégiques et quick wins** — "Équilibre vision long terme vs. besoins clients court terme" (framework valeur/effort)

---

### Question 4 : Disponibilité des données

**"Combien de données avez-vous pour informer la priorisation ?"**

1. **Données minimales** — "Nouveau produit, pas de métriques d'usage, peu de clients" → frameworks basés sur le jugement
2. **Quelques données** — "Analytics de base, feedback clients, mais pas de collecte rigoureuse" → frameworks de scoring légers
3. **Données riches** — "Métriques d'usage, A/B tests, enquêtes clients, métriques de succès claires" → frameworks data-driven

---

## Recommandations par contexte

### Early stage + données limitées → ICE ou Valeur/Effort

**Pourquoi pas RICE :** Pas assez de données pour estimer le Reach.

**Implémentation ICE :**
1. Lister tous les items à prioriser
2. Pour chaque item, scorer : Impact (1-10), Confidence (1-10), Ease (1-10)
3. Calculer : Score ICE = Impact × Confidence × Ease
4. Trier par score, revoir avec l'équipe
5. Ajuster pour l'alignement stratégique

---

### PMF trouvé + équipe alignée + quelques données → RICE

**Implémentation RICE :**

| Feature | Reach (users/mois) | Impact (1-3) | Confidence (%) | Effort (mois) | Score RICE |
|---|---|---|---|---|---|
| Feature A | 10 000 | 3 (massif) | 80% | 2 | 12 000 |
| Feature B | 5 000 | 2 (élevé) | 70% | 1 | 7 000 |

**Formule :** `(Reach × Impact × Confidence) / Effort`

**Critères de scoring :**
- **Reach :** Combien d'utilisateurs cette feature touchera-t-elle par mois/trimestre ?
- **Impact :** Dans quelle mesure améliorera-t-elle leur expérience ? (1 = minimal, 2 = élevé, 3 = massif)
- **Confidence :** Quelle est votre certitude sur les estimations de Reach/Impact ? (50% = peu de données, 80% = bonnes données)
- **Effort :** Combien de mois-personnes pour construire ? (Design + engineering + QA)

---

### Parties prenantes désalignées → MoSCoW ou Scoring pondéré

**Implémentation MoSCoW :**
1. Lister tous les items à prioriser
2. Pour chaque item, demander à chaque partie prenante de voter : Must / Should / Could / Won't
3. Agréger les votes
4. Débattre des désaccords (généralement "Must" vs. "Should")
5. Définir les critères de "Must" explicitement

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Mauvais framework pour le stade | Startup pre-PMF qui utilise un scoring pondéré à 10 critères | Adapter le framework au stade : pre-PMF = ICE, scaling = RICE |
| Framework whiplash | Changer de framework chaque trimestre | Rester sur un framework 6 à 12 mois, ne changer que si le stade/contexte change |
| Traiter les scores comme des oracles | "Feature A a 8 000, Feature B a 7 999, donc A gagne" | Les frameworks sont un input, pas une automatisation. Le jugement PM l'emporte si nécessaire |
| Scoring solo du PM | PM score les features seul, présente à l'équipe | Sessions de scoring collaboratives : PM, design, engineering scorent ensemble |
| Aucun framework | "On priorise par qui crie le plus fort" | Choisir *n'importe quel* framework — même imparfait, c'est mieux que le chaos |
