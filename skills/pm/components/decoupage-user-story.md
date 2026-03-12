---
name: decoupage-user-story
description: Découper une grande story ou epic en stories plus petites et livrables en utilisant les patterns de découpage éprouvés. À utiliser quand les backlog items sont trop grands pour être estimés, séquencés ou livrés indépendamment.
type: component
source: adapté de deanpeters/Product-Manager-Skills — user-story-splitting
---

## Objectif

Décomposer les grandes user stories, epics ou features en stories plus petites et livrables indépendamment en utilisant des patterns de découpage systématiques. L'objectif est de rendre le travail plus gérable, réduire les risques, activer des cycles de feedback plus rapides et maintenir le flux en développement agile.

Ce n'est pas un découpage arbitraire — c'est une décomposition stratégique qui préserve la valeur utilisateur tout en réduisant la complexité.

---

## Les 8 patterns de découpage

Basés sur le "Humanizing Work Guide to Splitting User Stories" de Richard Lawrence et Peter Green.

**Travailler les patterns dans l'ordre — s'arrêter quand l'un s'applique.**

---

### Pattern 1 : Étapes du workflow

**Question :** Cette story contient-elle plusieurs étapes séquentielles ?

**Principe :** Découper en **tranches verticales bout-en-bout**, pas étape par étape. Commencer par un cas simple couvrant le **workflow complet**, puis ajouter des étapes intermédiaires comme stories séparées.

**Exemple :**
- **Original :** "Publier un contenu (avec revue éditoriale, approbation juridique, mise en staging)"
- **❌ Mauvais découpage (étape par étape) :** Story 1 = Revue éditoriale, Story 2 = Approbation juridique, Story 3 = Publication
- **✅ Bon découpage (tranche bout-en-bout) :**
  - Story 1 : Publier du contenu (chemin simple : l'auteur uploade, le contenu est publié immédiatement)
  - Story 2 : Ajouter l'étape de revue éditoriale
  - Story 3 : Ajouter l'étape d'approbation juridique

---

### Pattern 2 : Opérations (CRUD)

**Question :** Cette story utilise-t-elle des mots comme "gérer", "administrer" ou "maintenir" ? Si oui, elle regroupe probablement plusieurs opérations (CRUD).

**Exemple :**
- **Original :** "Gérer les profils utilisateurs"
- **Découpage :**
  - Story 1 : Créer un profil utilisateur
  - Story 2 : Consulter les détails d'un profil
  - Story 3 : Modifier les informations d'un profil
  - Story 4 : Supprimer un profil utilisateur

---

### Pattern 3 : Variations de règles métier

**Question :** Cette story a-t-elle des règles différentes pour des scénarios différents (types d'utilisateurs, régions, niveaux d'abonnement) ?

**Exemple :**
- **Original :** "Recherche de vols avec dates flexibles (plage de dates, week-ends spécifiques, décalages)"
- **Découpage :**
  - Story 1 : Recherche par plage de dates (+/- N jours)
  - Story 2 : Recherche par week-ends spécifiques uniquement
  - Story 3 : Recherche par décalage de dates

---

### Pattern 4 : Variations de données

**Question :** Cette story gère-t-elle différents types de données, formats ou structures ?

**Exemple :**
- **Original :** "Uploader des fichiers (images, PDFs, vidéos)"
- **Découpage :**
  - Story 1 : Uploader des images (JPG, PNG)
  - Story 2 : Uploader des documents PDF
  - Story 3 : Uploader des vidéos (MP4, MOV)

---

### Pattern 5 : Méthodes de saisie

**Question :** Cette story inclut-elle des éléments UI complexes (date pickers, autocomplete, drag-and-drop) non essentiels à la fonctionnalité principale ?

**Exemple :**
- **Original :** "Recherche avec calendar date picker"
- **Découpage :**
  - Story 1 : Recherche par date (saisie texte simple : "JJ/MM/AAAA")
  - Story 2 : Ajouter le calendar picker visuel

---

### Pattern 6 : Effort majeur

**Question :** Cette story implique-t-elle une infrastructure dont la **première implémentation** est complexe mais les ajouts suivants sont simples ?

**Exemple :**
- **Original :** "Accepter les paiements par carte (Visa, Mastercard, Amex, Discover)"
- **Découpage :**
  - Story 1 : Accepter les paiements Visa (construire toute l'infrastructure de paiement)
  - Story 2 : Ajouter Mastercard, Amex, Discover (ajouts simples)

---

### Pattern 7 : Simple/Complexe

**Question :** Quelle est la **version la plus simple** de cette epic qui délivre encore de la valeur ?

**Exemple :**
- **Original :** "Recherche de vols (avec nombre d'escales max, aéroports proches, dates flexibles)"
- **Découpage :**
  - Story 1 : Recherche de vols basique (origine, destination, date)
  - Story 2 : Ajouter le filtre nombre d'escales max
  - Story 3 : Ajouter l'option aéroports proches
  - Story 4 : Ajouter l'option dates flexibles

---

### Pattern 8 : Différer la performance

**Question :** Peut-on livrer de la valeur fonctionnelle d'abord, puis optimiser la performance/sécurité/scalabilité ensuite ?

**Exemple :**
- **Original :** "Recherche en temps réel avec temps de réponse <100ms"
- **Découpage :**
  - Story 1 : La recherche fonctionne (fonctionnelle, sans garantie de performance)
  - Story 2 : Optimiser la recherche à <100ms (ajout de cache, indexation)

---

### Pattern 9 (dernier recours) : Spike de découverte

Si aucun des patterns 1 à 8 ne s'applique, c'est le signe d'une **forte incertitude**. Time-boxer une investigation pour réduire l'incertitude, puis redécouper.

Un spike est une investigation time-boxée (pas une story) qui répond à des questions comme :
- Est-ce techniquement faisable ?
- Quelle approche performe le mieux ?
- Que retourne vraiment cette API ?

**Après le spike**, reprendre au Pattern 1.

---

## Processus de découpage

### Étape 1 : Vérification INVEST (sauf "Small")

Avant de découper, vérifier que la story satisfait les critères INVEST (sauf Small) :
- **Indépendante** : Peut-elle être priorisée et développée sans dépendances bloquantes ?
- **Négociable** : Laisse-t-elle de la place pour la collaboration sur les détails d'implémentation ?
- **Valeur** : Délivre-t-elle une valeur observable à l'utilisateur ?
- **Estimable** : L'équipe peut-elle dimensionner cette story ?
- **Testable** : A-t-elle des critères d'acceptance concrets ?

⚠️ **Si la story échoue sur "Valeur"** : NE PAS découper. Plutôt combiner avec d'autres travaux pour créer un incrément de valeur réel.

### Étape 2 : Appliquer les patterns séquentiellement

Pour chaque pattern, demander "Est-ce que cela s'applique ?" Continuer jusqu'à trouver le bon.

### Étape 3 : Rédiger les stories découpées

Pour chaque découpage, utiliser le format du skill `user-story`.

### Étape 4 : Évaluer la qualité du découpage

Après le découpage, vérifier :
1. **Ce découpage révèle-t-il du travail à faible valeur qu'on peut déprioritiser ou éliminer ?**
2. **Ce découpage produit-il des stories de taille plus égale ?**

Si aucun critère n'est satisfait, essayer un autre pattern.

---

## Méta-pattern (applicable à tous les patterns)

1. **Identifier la complexité centrale** — Qu'est-ce qui rend cette epic difficile ?
2. **Lister les variations** — Quels sont tous les cas, règles, types de données différents ?
3. **Réduire à une seule tranche complète** — Choisir la variation la plus simple qui délivre de la valeur bout-en-bout
4. **Faire des autres variations des stories séparées**

---

## Exemple complet — Pattern 2 (CRUD)

**Story originale :**
"En tant qu'admin HubSpot, je veux gérer les utilisateurs de mon workspace afin de contrôler les accès."

**Découpage (Pattern 2 — Opérations CRUD) :**
1. Inviter un nouvel utilisateur dans le workspace
2. Consulter la liste des utilisateurs actifs
3. Modifier les permissions d'un utilisateur
4. Désactiver un utilisateur inactif

**Évaluation :**
✅ Révèle du travail à faible valeur : La story "Consulter la liste" est peut-être déjà native HubSpot — à vérifier avant de construire
✅ Stories de taille comparable : Environ 1 à 2 jours chacune

---

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Découpage horizontal (couches techniques) | "Story 1 : API. Story 2 : UI." | Chaque story doit inclure les couches nécessaires pour délivrer de la valeur utilisateur |
| Sur-découpage | "Story 1 : Ajouter bouton. Story 2 : Connecter bouton à l'API." | Ne découper que si la story est trop grande. Une story de 2 jours n'a pas besoin d'être découpée |
| Découpage arbitraire | "Première moitié. Deuxième moitié." | Utiliser un des 8 patterns — chaque découpage doit avoir une justification claire |
| Dépendances dures créées | "Story 2 ne peut pas démarrer avant que Story 1 soit 100% terminée" | Découper de façon à permettre le développement indépendant |
| Ne pas re-découper les grandes stories | Stories découpées qui font encore 5+ jours | Si une story est encore trop grande, reprendre au Pattern 1 pour cette story |
