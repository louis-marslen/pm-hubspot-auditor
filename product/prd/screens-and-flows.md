# Conception des écrans & parcours utilisateur — HubSpot Auditor

**Statut :** Proposition de design
**Epic associé :** EP-UX
**Dernière mise à jour :** 2026-03-15
**Auteur :** Product Design

---

## Table des matières

1. [Architecture d'information](#1-architecture-dinformation)
2. [Navigation globale](#2-navigation-globale)
3. [Parcours utilisateurs](#3-parcours-utilisateurs)
4. [Écrans détaillés](#4-écrans-détaillés)
5. [Système d'états](#5-système-détats)
6. [Changements par rapport à l'existant](#6-changements-par-rapport-à-lexistant)

---

## 1. Architecture d'information

### Carte des écrans

```
                        ┌──────────────┐
                        │   Landing    │
                        │   (page.tsx) │
                        └──────┬───────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              ┌─────▼─────┐        ┌─────▼─────┐
              │   Login    │        │  Register  │
              └─────┬──────┘        └─────┬──────┘
                    │                     │
                    │               ┌─────▼──────┐
                    │               │  Confirm    │
                    │               │  email      │
                    │               └─────┬───────┘
                    │                     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │                     │
                    │   APP SHELL         │
                    │   (sidebar + top)   │
                    │                     │
                    │  ┌───────────────┐  │
                    │  │  Dashboard    │◄─┼──── Page d'accueil connectée
                    │  └───────┬───────┘  │
                    │          │          │
                    │  ┌───────▼───────┐  │
                    │  │  Workspaces   │  │
                    │  │  (détail)     │  │
                    │  └───────┬───────┘  │
                    │          │          │
                    │  ┌───────▼───────┐  │
                    │  │  Résultats    │  │
                    │  │  d'audit      │  │
                    │  └───────────────┘  │
                    │                     │
                    │  ┌───────────────┐  │
                    │  │  Paramètres   │  │
                    │  │  du compte    │  │
                    │  └───────────────┘  │
                    │                     │
                    └─────────────────────┘

              ┌───────────────┐
              │  Rapport      │  ← Accès public, hors app shell
              │  public       │
              └───────────────┘
```

### Hiérarchie des pages

| Niveau | Page | URL | Auth requise |
|---|---|---|---|
| 0 | Landing / redirect | `/` | Non |
| 1 | Login | `/login` | Non |
| 1 | Register | `/register` | Non |
| 1 | Forgot password | `/forgot-password` | Non |
| 1 | Reset password | `/reset-password` | Non |
| 1 | Confirm email | `/confirm` | Non |
| 1 | **Dashboard** | `/dashboard` | Oui |
| 2 | Résultats d'audit | `/audit/:auditId` | Oui |
| 1 | **Paramètres** | `/settings` | Oui |
| 0 | Rapport public | `/share/:shareToken` | Non |

> **Changement clé :** La page `/workspaces` disparaît en tant que page distincte. Les workspaces sont gérés directement depuis le dashboard. Cela élimine la duplication et simplifie la navigation.

---

## 2. Navigation globale

### Structure : Topbar simple (pas de sidebar)

Justification : l'application n'a que 2 sections principales (Dashboard, Paramètres). Une sidebar est surdimensionnée pour cette complexité. Une topbar suffit et maximise l'espace de contenu.

```
┌────────────────────────────────────────────────────────────────────┐
│  🔍 HubSpot Auditor          Dashboard    Paramètres    [Avatar ▾]│
│                                  ●                                │
└────────────────────────────────────────────────────────────────────┘
│                                                                    │
│                     Zone de contenu principal                      │
│                       (max-width: 1120px)                          │
│                         centrée                                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Éléments de la topbar

| Position | Élément | Comportement |
|---|---|---|
| Gauche | Logo / Nom "HubSpot Auditor" | Lien vers `/dashboard` |
| Centre | Navigation principale | Liens : Dashboard, Paramètres. Indicateur actif sous l'item courant |
| Droite | Menu utilisateur | Avatar (initiale de l'email) + dropdown : email affiché, lien "Paramètres", bouton "Déconnexion" |

### Topbar — Pages non-auth

Pour les pages login/register/forgot-password :

```
┌────────────────────────────────────────────────────────────────────┐
│  🔍 HubSpot Auditor                               Se connecter   │
└────────────────────────────────────────────────────────────────────┘
```

Topbar minimale : logo à gauche, lien contextuel à droite (sur `/register` → "Se connecter", sur `/login` → "Créer un compte").

### Topbar — Page publique

```
┌────────────────────────────────────────────────────────────────────┐
│  🔍 HubSpot Auditor                       Auditer mon workspace → │
└────────────────────────────────────────────────────────────────────┘
```

Logo + CTA d'acquisition.

---

## 3. Parcours utilisateurs

### Parcours 1 — Nouvel utilisateur (inscription → premier audit)

```
Register ──→ Confirm email ──→ Login ──→ Dashboard (empty state)
                                              │
                                              │ CTA "Connecter HubSpot"
                                              ▼
                                        OAuth HubSpot
                                              │
                                              │ callback
                                              ▼
                                        Dashboard (workspace connecté)
                                              │
                                              │ CTA "Lancer mon premier audit"
                                              ▼
                                        Dashboard (audit en cours, progress)
                                              │
                                              │ auto-redirect
                                              ▼
                                        Résultats d'audit
                                              │
                                              │ CTA "Partager le rapport"
                                              ▼
                                        Copier le lien public
```

**Points de design critiques :**
- Le dashboard **empty state** doit expliquer les 3 étapes (1. Connecter, 2. Auditer, 3. Partager) et avoir un CTA unique
- Après OAuth callback, le dashboard doit montrer un **état de succès** + un CTA pour lancer l'audit
- Pendant l'audit, afficher une **progression contextuelle** (pas juste un spinner)
- Après l'audit, **auto-naviguer vers les résultats** ou afficher un lien proéminent

### Parcours 2 — Utilisateur récurrent (re-audit)

```
Login ──→ Dashboard (workspaces + historique)
               │
               │ CTA "Relancer un audit" sur workspace
               ▼
         Dashboard (audit en cours)
               │
               │ auto-redirect
               ▼
         Résultats d'audit
```

**Points de design critiques :**
- Le dashboard affiche le **dernier score** de chaque workspace pour donner du contexte
- Le bouton "Relancer" indique la date du dernier audit ("Dernier audit : il y a 3 jours")
- L'historique des audits permet de comparer visuellement les scores

### Parcours 3 — Consultant partageant un rapport

```
Résultats d'audit ──→ "Partager" ──→ Copier lien ──→ Envoyer par email
                                                            │
                                                            ▼
                                          Destinataire ouvre le lien
                                                            │
                                                            ▼
                                                    Rapport public
                                                            │
                                                            ▼
                                                  CTA "Auditer mon workspace"
```

**Points de design critiques :**
- Le bouton "Partager" doit être **visible et évident** sur la page de résultats
- Le rapport public est un **livrable présentable** — header branded, mise en page propre
- Le CTA d'acquisition en fin de rapport public est un levier de croissance

### Parcours 4 — Gestion du compte

```
Dashboard ──→ Menu utilisateur ──→ Paramètres
                                       │
                             ┌─────────┼──────────┐
                             ▼         ▼          ▼
                       Mon profil   Workspaces   Danger zone
                       (email,      (liste,      (supprimer
                        mdp)        déconnecter)  le compte)
```

**Points de design critiques :**
- Les paramètres centralisent tout ce qui n'est pas l'audit
- La suppression de compte est dans une "danger zone" clairement identifiée, pas accessible en 1 clic

---

## 4. Écrans détaillés

### 4.1 — Pages d'authentification

Toutes les pages auth partagent le même layout :

```
┌────────────────────────────────────────────────────────────────────┐
│  Topbar minimale (logo + lien contextuel)                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                                                                    │
│                    ┌──────────────────────┐                        │
│                    │                      │                        │
│                    │     Colonne gauche   │                        │
│                    │     Pitch produit    │                        │
│                    │     (optionnel)      │                        │
│                    │                      │                        │
│                    ├──────────────────────┤                        │
│                    │                      │                        │
│                    │      Formulaire      │                        │
│                    │                      │                        │
│                    │   [Email]            │                        │
│                    │   [Password]         │                        │
│                    │                      │                        │
│                    │   [  CTA Button  ]   │                        │
│                    │                      │                        │
│                    │   Lien secondaire    │                        │
│                    │                      │                        │
│                    └──────────────────────┘                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

#### Login (`/login`)

| Zone | Contenu |
|---|---|
| Titre | "Connectez-vous à HubSpot Auditor" |
| Formulaire | Email + Password + Remember me (checkbox) |
| CTA principal | "Se connecter" (bouton primary, full-width) |
| Lien secondaire | "Mot de passe oublié ?" (sous le formulaire) |
| Footer formulaire | "Pas encore de compte ? Créer un compte" |
| États | Erreur credentials (alert inline), email non confirmé (alert warning + bouton resend) |

#### Register (`/register`)

| Zone | Contenu |
|---|---|
| Titre | "Créez votre compte" |
| Sous-titre | "Auditez votre workspace HubSpot en quelques minutes" |
| Formulaire | Email + Password + Confirm password |
| Validation password | Checklist en temps réel : ✓/✗ 8 caractères, ✓/✗ 1 majuscule, ✓/✗ 1 chiffre ou spécial. Chaque règle devient verte quand validée |
| CTA principal | "Créer mon compte" |
| Footer formulaire | "Déjà un compte ? Se connecter" |
| États | Compte existant (alert avec lien login), erreurs validation (inline sous les champs) |

#### Forgot password (`/forgot-password`)

| Zone | Contenu |
|---|---|
| Titre | "Réinitialiser votre mot de passe" |
| Texte explicatif | "Entrez votre email, nous vous enverrons un lien de réinitialisation." |
| Formulaire | Email seul |
| CTA principal | "Envoyer le lien" |
| Lien secondaire | "Retour à la connexion" |
| État succès | Le formulaire est remplacé par un message de confirmation + icône email |

#### Reset password (`/reset-password`)

| Zone | Contenu |
|---|---|
| Titre | "Nouveau mot de passe" |
| Formulaire | New password + Confirm password (même validation que register) |
| CTA principal | "Enregistrer" |
| Après succès | Redirect vers `/login` avec banner de succès |

#### Confirm email (`/confirm`)

| Zone | Contenu |
|---|---|
| Icône | Enveloppe stylisée (grande, centrée) |
| Titre | "Vérifiez votre boîte email" |
| Texte | "Un lien de confirmation a été envoyé à **{email}**. Cliquez dessus pour activer votre compte." |
| Sous-texte | "Le lien est valable 24 heures." |
| Action secondaire | "Renvoyer l'email" (lien, avec cooldown de 60s) |
| Lien | "Retour à la connexion" |

---

### 4.2 — Dashboard (`/dashboard`)

Le dashboard est **la page centrale** de l'application. Il remplace l'ancienne dualité dashboard/workspaces.

```
┌────────────────────────────────────────────────────────────────────┐
│  Topbar                                                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  SECTION 1 — Workspaces connectés                           │  │
│  │                                                              │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐  │  │
│  │  │  Workspace A    │  │  Workspace B    │  │    +        │  │  │
│  │  │  ───────────    │  │  ───────────    │  │  Connecter  │  │  │
│  │  │  Score: 72/100  │  │  Score: —       │  │  un         │  │  │
│  │  │  Dernier: 2j    │  │  Pas d'audit    │  │  workspace  │  │  │
│  │  │                 │  │                 │  │             │  │  │
│  │  │ [Lancer audit]  │  │ [Lancer audit]  │  │             │  │  │
│  │  └─────────────────┘  └─────────────────┘  └────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  SECTION 2 — Historique des audits                          │  │
│  │                                                              │  │
│  │  ┌────────────┬────────────┬────────┬───────────┬────────┐  │  │
│  │  │ Workspace  │ Date       │ Score  │ Problèmes │ Action │  │  │
│  │  ├────────────┼────────────┼────────┼───────────┼────────┤  │  │
│  │  │ Portal A   │ 12 mar.    │ 72     │ 3⚠ 12ℹ   │ Voir → │  │  │
│  │  │ Portal A   │ 5 mar.     │ 65     │ 5⚠ 15ℹ   │ Voir → │  │  │
│  │  │ Portal B   │ 1 mar.     │ 81     │ 1⚠ 8ℹ    │ Voir → │  │  │
│  │  └────────────┴────────────┴────────┴───────────┴────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

#### Section 1 — Workspaces

**Layout :** Grille horizontale de cards (1-3 par ligne, responsive).

**Workspace card :**

```
┌──────────────────────────────┐
│  ● Actif           Hub 12345│  ← Badge statut + Hub ID
│                              │
│  Portal Name                 │  ← Titre (gras, taille lg)
│  domain.com                  │  ← Sous-titre (gris, taille sm)
│                              │
│  ┌────────────────────────┐  │
│  │  Score: 72/100         │  │  ← Dernier score (si existant)
│  │  Dernier audit: il y   │  │
│  │  a 2 jours             │  │
│  └────────────────────────┘  │
│                              │
│  [   Lancer un audit    ]    │  ← Bouton primary
└──────────────────────────────┘
```

**Variantes de la workspace card :**

| État | Visuel |
|---|---|
| Connecté, pas d'audit | Pas de bloc score. Bouton : "Lancer mon premier audit" |
| Connecté, audit existant | Score affiché + date du dernier audit. Bouton : "Relancer un audit" |
| Connecté, audit en cours | Barre de progression ou indication. Bouton désactivé : "Audit en cours…" |
| Token expiré | Badge rouge "Expiré". Bouton : "Reconnecter" (lance le flow OAuth) |

**Card d'ajout (+) :**
- Card en pointillés (dashed border)
- Icône `+` centrée
- Texte : "Connecter un workspace HubSpot"
- Clic → lance le flow OAuth

#### Section 2 — Historique des audits

**Layout :** Tableau sobre, trié par date décroissante.

**Colonnes :**

| Colonne | Contenu | Style |
|---|---|---|
| Workspace | Nom du portail | Texte medium |
| Date | Date relative ("il y a 2 jours") + date absolue au hover | Texte sm, gris |
| Score | Badge numérique coloré (rouge ≤49, orange ≤69, jaune ≤89, vert ≥90) | Badge arrondi |
| Problèmes | Compteur critiques (rouge) + warnings (orange) | Badges inline |
| Action | "Voir →" | Lien |

**Si aucun audit :** Pas de section affichée (inutile de montrer un tableau vide quand la section workspaces guide déjà l'utilisateur).

#### Dashboard — Empty state (premier login, 0 workspace)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│                    ┌──────────────────────┐                        │
│                    │                      │                        │
│                    │     Illustration     │                        │
│                    │     ou icône         │                        │
│                    │                      │                        │
│                    └──────────────────────┘                        │
│                                                                    │
│              Bienvenue sur HubSpot Auditor !                      │
│                                                                    │
│    Connectez votre workspace HubSpot pour obtenir un diagnostic    │
│    complet de la qualité de vos données et automatisations.        │
│                                                                    │
│          ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│          │ 1.      │  │ 2.      │  │ 3.      │                    │
│          │Connecter│→ │ Auditer │→ │Partager │                    │
│          │HubSpot  │  │         │  │le       │                    │
│          │         │  │         │  │rapport  │                    │
│          └─────────┘  └─────────┘  └─────────┘                    │
│                                                                    │
│           [  Connecter mon workspace HubSpot  ]                    │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

3 étapes visuelles (icônes + labels) qui expliquent le flux. Un seul CTA.

---

### 4.3 — Résultats d'audit (`/audit/:auditId`)

C'est la page la plus dense. Le redesign vise à la rendre **scannable** et **navigable**.

#### Structure de la page

```
┌────────────────────────────────────────────────────────────────────┐
│  Topbar                                                           │
├────────────────────────────────────────────────────────────────────┤
│  Breadcrumb : Dashboard > Portal Name > Audit du 12 mars 2026     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  HERO — Score global                                        │  │
│  │                                                              │  │
│  │  ┌────────┐                                                  │  │
│  │  │  72    │  Bon · 3 critiques · 12 avertissements · 8 infos│  │
│  │  │ /100   │  Portal Name · 2 340 contacts · 156 deals       │  │
│  │  └────────┘  12 mars 2026 · Durée: 45s                      │  │
│  │                                                              │  │
│  │  Propriétés: 68/100    Workflows: 76/100                    │  │
│  │                                                              │  │
│  │  [ Partager le rapport ]  [ ← Dashboard ]                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────┐                                                    │
│  │  Nav intra │  Résumé | Propriétés | Contacts | Deals |         │
│  │  -page     │  Companies | Workflows                            │
│  └────────────┘                                                    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  RÉSUMÉ EXÉCUTIF                                            │  │
│  │  (texte LLM, encadré, icône IA)                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  SECTION — Propriétés custom (score: 68/100)                │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐    │  │
│  │  │ 🔴 P1  Propriétés vides > 90j           12 trouvés  │    │  │
│  │  │        Impact: Pollution des données...  [Déplier ▾] │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  │  ┌──────────────────────────────────────────────────────┐    │  │
│  │  │ 🟡 P2  Fill rate < 5%                    8 trouvés  │    │  │
│  │  │        Impact: ...                       [Déplier ▾] │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  │  ┌──────────────────────────────────────────────────────┐    │  │
│  │  │ ✅ P3  Doublons de label                 0 trouvé   │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  │  ...                                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  (Sections Contacts, Deals, Companies, Workflows — même pattern)  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  FOOTER                                                     │  │
│  │  Généré par HubSpot Auditor · [Relancer un audit]           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

#### Hero — Score global

Card pleine largeur, fond légèrement teinté selon le score (vert clair si bon, orange clair si moyen, rouge clair si critique).

| Élément | Détail |
|---|---|
| Score circle | Grand (120px), centré à gauche, chiffre bold, couleur sémantique |
| Label | "Excellent" / "Bon" / "À améliorer" / "Critique" — à droite du cercle |
| Résumé chiffré | Compteurs par sévérité : "3 critiques · 12 avertissements · 8 infos" |
| Contexte | Nom du portail, nombre de contacts/companies/deals |
| Métadonnées | Date de l'audit, durée d'exécution |
| Sous-scores | Petits cercles : "Propriétés: 68/100" et "Workflows: 76/100" |
| Actions | Bouton "Partager le rapport" (primary) + lien "← Dashboard" (ghost) |

#### Navigation intra-page (sticky)

Barre d'onglets horizontale qui **reste visible au scroll** (sticky top, sous la topbar).

Onglets : **Résumé** | **Propriétés** | **Contacts** | **Deals** | **Companies** | **Workflows**

Chaque onglet affiche un badge avec le nombre de problèmes de la catégorie. Cliquer scrolle vers la section correspondante (scroll-to-anchor). L'onglet actif suit le scroll (intersection observer).

#### Résumé exécutif

Card distincte avec :
- Icône "IA" ou "✨" pour indiquer le contenu généré
- Texte du résumé LLM
- Si pas de résumé : ne pas afficher la section (pas de placeholder)

#### Sections de règles (pattern répété)

Chaque domaine actif (Propriétés, Contacts, Companies, Workflows — et à terme Deals) est une section. Un domaine inactif (0 élément) n'apparaît pas dans la navigation :

**Header de section :**
```
┌──────────────────────────────────────────────────────────────────┐
│  Propriétés custom                                    68/100    │
│  6 règles analysées · 2 critiques · 1 avertissement             │
└──────────────────────────────────────────────────────────────────┘
```

**Rule card (repliée) :**
```
┌──────────────────────────────────────────────────────────────────┐
│  🔴 CRITIQUE   P1   Propriétés vides > 90 jours    12 trouvés ▾│
└──────────────────────────────────────────────────────────────────┘
```

**Rule card (dépliée) :**
```
┌──────────────────────────────────────────────────────────────────┐
│  🔴 CRITIQUE   P1   Propriétés vides > 90 jours    12 trouvés ▴│
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Impact business :                                               │
│  Ces propriétés polluent vos filtres et ralentissent la          │
│  recherche dans HubSpot. Les supprimer améliorerait…             │
│                                                                  │
│  ┌──────────┬─────────────────────────┬───────────┐              │
│  │ Objet    │ Propriété               │ Dernière  │              │
│  ├──────────┼─────────────────────────┤ mise à j. │              │
│  │ Contact  │ custom_field_legacy      │ Jamais    │              │
│  │ Contact  │ old_import_source        │ 2024-01   │              │
│  │ Deal     │ internal_ref_deprecated  │ 2023-06   │              │
│  │ ...      │                         │           │              │
│  └──────────┴─────────────────────────┴───────────┘              │
│                                                                  │
│  Affichage 1-20 sur 12          [← Précédent] [Suivant →]       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Règle sans problème (repliée, pas de chevron) :**
```
┌──────────────────────────────────────────────────────────────────┐
│  ✅ OK       P3   Doublons de label                 0 trouvé    │
└──────────────────────────────────────────────────────────────────┘
```

**Logique d'ouverture par défaut :**
- Les règles avec des problèmes **critiques** sont ouvertes par défaut
- Les avertissements et infos sont repliés
- Les règles sans problème sont repliées et non cliquables

#### Règles de type "cluster de doublons" (C-06, C-07, C-08, CO-02, CO-03)

Pour les règles qui détectent des doublons, afficher une **liste de clusters** triée par taille décroissante dans la rule card :

```
┌──────────────────────────────────────────────────────────────────┐
│  🔴 CRITIQUE   C-06   Doublons email exact          8 clusters ▴│
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Impact business :                                               │
│  Les doublons email faussent les métriques marketing…            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  📧 john.doe@acme.com                        3 contacts   │  │
│  │  ┌──────────┬──────────────────┬──────────────┬─────────┐ │  │
│  │  │ Hub ID   │ Nom              │ Email orig.  │ Créé le │ │  │
│  │  ├──────────┼──────────────────┼──────────────┼─────────┤ │  │
│  │  │ 12345    │ John Doe         │ john.doe@... │ 2024-01 │ │  │
│  │  │ 67890    │ John Doe         │ John.Doe@... │ 2024-06 │ │  │
│  │  │ 11111    │ J. Doe           │ john.doe+w@..│ 2025-02 │ │  │
│  │  └──────────┴──────────────────┴──────────────┴─────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  📧 jane.smith@example.com                    2 contacts   │  │
│  │  ...                                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Affichage 1-20 sur 8 clusters    [← Précédent] [Suivant →]    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Pour les clusters companies (CO-02, CO-03), chaque membre affiche en plus le **nombre de contacts et deals associés** (aide à décider quelle fiche conserver) :

```
│  │  🏢 acme.com                                  3 companies  │  │
│  │  ┌──────────┬──────────────┬──────────┬──────────┬────────┐ │  │
│  │  │ Hub ID   │ Nom          │ Domain   │ Contacts │ Deals  │ │  │
│  │  ├──────────┼──────────────┼──────────┼──────────┼────────┤ │  │
│  │  │ 12345    │ Acme SAS     │ acme.com │ 45       │ 12     │ │  │
│  │  │ 67890    │ ACME         │ acme.com │ 3        │ 0      │ │  │
│  │  │ 11111    │ Acme Inc.    │ Acme.com │ 0        │ 0      │ │  │
│  │  └──────────┴──────────────┴──────────┴──────────┴────────┘ │  │
```

#### Règles de type "taux" (C-01, C-03, C-05, CO-01, P13, P14)

Pour les règles qui mesurent un taux (ex. "87% des contacts ont un email"), afficher une **barre de progression** dans la rule card :

```
┌──────────────────────────────────────────────────────────────────┐
│  🟡 AVERT.   P9   Lifecycle stage renseigné         62%   ▾    │
│  ████████████████████░░░░░░░░░░  62% · seuil: 80%              │
└──────────────────────────────────────────────────────────────────┘
```

La barre est colorée selon que le taux est au-dessus ou en-dessous du seuil.

#### Section Contacts (EP-05)

La section Contacts apparaît dans la navigation intra-page entre "Propriétés" et "Deals".

**Header de section :**
```
┌──────────────────────────────────────────────────────────────────┐
│  Contacts                                                82/100 │
│  12 règles analysées · 2 340 contacts · 1 critique · 3 avert.   │
└──────────────────────────────────────────────────────────────────┘
```

**Organisation des règles dans la section :**

| Bloc | Règles | Affichage |
|---|---|---|
| Doublons | C-06, C-07, C-08 | Pattern "clusters" (voir ci-dessus), triés par taille décroissante |
| Qualité | C-09, C-10, C-11, C-12 | Listes paginées standard (Hub ID, nom, valeur problématique) |
| Cohérence lifecycle | C-01, C-03, C-05 (taux), C-02 (comptage), C-04a-d (exemples) | Barres de progression pour les taux, previews 5 exemples pour lifecycle |

**Conditions d'affichage :**
- Si 0 contact dans le workspace : l'onglet "Contacts" n'apparaît pas dans la navigation
- Si 0 company (B2C) : les règles C-05 et C-07 affichent "Non applicable — aucune company détectée"

#### Section Companies (EP-05b)

La section Companies apparaît dans la navigation intra-page entre "Deals" et "Workflows".

**Header de section :**
```
┌──────────────────────────────────────────────────────────────────┐
│  Companies                                              75/100  │
│  8 règles analysées · 890 companies · 2 critiques · 1 avert.    │
└──────────────────────────────────────────────────────────────────┘
```

**Organisation des règles dans la section :**

| Bloc | Règles | Affichage |
|---|---|---|
| Doublons | CO-02, CO-03 | Pattern "clusters" avec colonnes contacts/deals associés par membre |
| Qualité | CO-01 (taux), CO-04 à CO-08 | Barre de progression pour CO-01, listes paginées pour CO-04 à CO-08 |

**Conditions d'affichage :**
- Si 0 company dans le workspace : l'onglet "Companies" n'apparaît pas dans la navigation, mention dans les métadonnées

#### Mise à jour du Hero — Sous-scores (post EP-05 + EP-05b)

Après EP-05 et EP-05b, le Hero affiche jusqu'à 4 sous-scores :

```
│  Propriétés: 68/100    Contacts: 82/100    Companies: 75/100    Workflows: 76/100  │
```

Si un domaine est inactif (ex. 0 company), son sous-score n'est pas affiché.

#### Mise à jour de la progression d'audit (section 5.5)

Après EP-05 et EP-05b, les étapes de progression incluent :

```
              ✓ Connexion au workspace
              ✓ Récupération des propriétés
              ✓ Analyse des contacts (2 340)…
              ◌ Analyse des companies (890)…
              ○ Analyse des deals
              ○ Analyse des workflows
              ○ Génération du rapport
```

---

### 4.4 — Paramètres (`/settings`)

Nouvelle page qui centralise la gestion du compte et des workspaces.

```
┌────────────────────────────────────────────────────────────────────┐
│  Topbar                                                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Paramètres                                                        │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Mon profil                                                 │  │
│  │                                                              │  │
│  │  Email : louis@exemple.com                                   │  │
│  │  Mot de passe : ••••••••           [ Modifier le mot de... ] │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Workspaces HubSpot                                         │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐    │  │
│  │  │  Portal Name (Hub 12345)       ● Actif               │    │  │
│  │  │  domain.com · Connecté le 5 mars 2026                 │    │  │
│  │  │                                   [ Déconnecter ]     │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  │                                                              │  │
│  │  [ + Connecter un workspace ]                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Danger zone                                      (rouge)   │  │
│  │                                                              │  │
│  │  Supprimer mon compte                                        │  │
│  │  Cette action est irréversible. Toutes vos données           │  │
│  │  et audits seront définitivement supprimés.                  │  │
│  │                                          [ Supprimer... ]    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

#### Sections

| Section | Contenu |
|---|---|
| **Mon profil** | Email (lecture seule), bouton "Modifier le mot de passe" (ouvre une modale ou redirige vers le flow de reset) |
| **Workspaces HubSpot** | Liste des workspaces connectés avec nom, Hub ID, domaine, date de connexion, statut, bouton "Déconnecter" (avec confirmation). Bouton "+ Connecter un workspace" en bas |
| **Danger zone** | Bordure rouge. Bouton "Supprimer mon compte" (ouvre une modale de confirmation avec saisie d'email, pas une page séparée) |

**Modale de suppression :**
```
┌──────────────────────────────────┐
│  Supprimer mon compte            │
│                                  │
│  ⚠ Cette action supprimera :     │
│  · Votre compte                  │
│  · Tous vos workspaces connectés │
│  · Tout votre historique d'audit │
│                                  │
│  Tapez votre email pour          │
│  confirmer :                     │
│                                  │
│  [________________________]      │
│                                  │
│  [ Annuler ] [Supprimer ██████]  │
│                    (rouge, disabled│
│                    tant que email │
│                    ne match pas)  │
└──────────────────────────────────┘
```

---

### 4.5 — Rapport public (`/share/:shareToken`)

Le rapport public reprend la même structure que les résultats d'audit, avec des différences :

```
┌────────────────────────────────────────────────────────────────────┐
│  Topbar publique (logo + "Auditer mon workspace →")               │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  BANDEAU                                                    │  │
│  │  📊 Rapport d'audit HubSpot                                 │  │
│  │  Portal Name · Généré le 12 mars 2026                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  (Même contenu que la page de résultats privée)                    │
│  - Hero score                                                      │
│  - Navigation intra-page                                           │
│  - Résumé exécutif                                                 │
│  - Sections de règles                                              │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  FOOTER PUBLIC                                              │  │
│  │                                                              │  │
│  │  Généré par HubSpot Auditor                                  │  │
│  │  Auditez gratuitement votre workspace HubSpot                │  │
│  │                                                              │  │
│  │  [   Créer mon compte gratuitement   ]                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Différences avec la version privée :**

| Élément | Version privée | Version publique |
|---|---|---|
| Topbar | Navigation complète | Logo + CTA acquisition |
| Bandeau en-tête | Breadcrumb | Bandeau "Rapport d'audit" avec date et portail |
| Bouton "Partager" | Présent | Absent |
| Bouton "Relancer" | Présent dans le footer | Absent |
| Footer | "Généré par HubSpot Auditor" | CTA d'acquisition ("Créer mon compte") |
| Alerte read-only | Absente | Présente (discrète, inline, pas un bloc alert) |

---

## 5. Système d'états

Chaque écran doit gérer systématiquement ces 5 états :

### 5.1 — Empty state

Affiché quand il n'y a pas de données. Toujours inclure :
- Une illustration ou icône
- Un titre explicatif
- Un texte de description
- Un CTA pour créer la première donnée

| Écran | Empty state | CTA |
|---|---|---|
| Dashboard (0 workspace) | Illustration + 3 étapes visuelles | "Connecter mon workspace" |
| Dashboard (0 audit) | Section historique masquée | — |
| Résultats (0 problème dans une règle) | "✅ Aucun problème détecté" en vert | — |

### 5.2 — Loading state

| Contexte | Pattern |
|---|---|
| Chargement de page | Squelettes (skeleton) à la place du contenu (pas de spinner plein page) |
| Lancement d'audit | Barre de progression ou étapes textuelles ("Analyse des propriétés…", "Analyse des workflows…") |
| Action bouton | Spinner inline dans le bouton + texte "En cours…" + bouton disabled |
| Chargement de section | Skeleton de la section concernée |

### 5.3 — Error state

| Contexte | Pattern |
|---|---|
| Erreur de formulaire | Message inline rouge sous le champ concerné |
| Erreur d'action (audit, déconnexion) | Alert rouge au-dessus de la section concernée (pas en haut de page) |
| Erreur de chargement de page | Card centrée avec icône erreur + message + bouton "Réessayer" |
| Audit échoué | Card rouge sur la page de résultats avec le message d'erreur + bouton "Relancer" |

### 5.4 — Success state

| Contexte | Pattern |
|---|---|
| Workspace connecté | Alert verte au-dessus de la workspace card (auto-dismiss après 5s) |
| Audit terminé | Redirect automatique vers les résultats |
| Mot de passe réinitialisé | Banner verte sur la page de login |
| Lien copié | Toast notification en bas de l'écran (auto-dismiss après 3s) |
| Email renvoyé | Texte de confirmation inline (remplace le bouton temporairement) |

### 5.5 — In-progress state (spécifique à l'audit)

L'audit prend 30-300 secondes. C'est le moment le plus critique pour le rétention.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│                    ┌──────────────────────┐                        │
│                    │                      │                        │
│                    │    Animation ou      │                        │
│                    │    illustration      │                        │
│                    │                      │                        │
│                    └──────────────────────┘                        │
│                                                                    │
│              Audit en cours de Portal Name…                        │
│                                                                    │
│              ✓ Connexion au workspace                              │
│              ✓ Récupération des propriétés                         │
│              ◌ Analyse des contacts (2 340)…                       │
│              ○ Analyse des deals                                   │
│              ○ Analyse des workflows                               │
│              ○ Génération du rapport                               │
│                                                                    │
│              ━━━━━━━━━━━━━━━━━░░░░░░░  65%                        │
│                                                                    │
│              Temps estimé restant : ~30s                           │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

Afficher l'avancement **étape par étape** avec des checkmarks donne un sentiment de progrès et réduit l'anxiété. Le pourcentage et le temps estimé sont optionnels mais recommandés.

> **Note technique :** Cela nécessite que l'API renvoie des événements de progression (SSE ou polling). Si cette complexité est trop élevée pour la v1, un fallback acceptable est une animation avec des textes qui changent toutes les 10 secondes ("Analyse des propriétés…", "Analyse des workflows…") même sans refléter la progression réelle.

---

## 6. Changements par rapport à l'existant

### Résumé des suppressions

| Supprimé | Raison | Remplacé par |
|---|---|---|
| Page `/workspaces` | Duplique le dashboard | Section workspaces dans `/dashboard` + section dans `/settings` |
| Page `/account/delete` | Page isolée, inaccessible depuis la nav | Modale dans `/settings` (danger zone) |
| Header ad hoc par page | Incohérent, change à chaque page | Topbar globale persistante |

### Résumé des ajouts

| Ajouté | Raison |
|---|---|
| Topbar globale | Navigation cohérente et persistante |
| Page `/settings` | Centraliser la gestion du compte (profil, workspaces, suppression) |
| Navigation intra-page (résultats d'audit) | Rendre les résultats navigables sans scroller 5 écrans |
| Empty state guidé (dashboard) | Onboarder le nouvel utilisateur sans page dédiée |
| Audit progress (étapes) | Réduire l'anxiété pendant les 30-300s d'attente |
| Bandeau + footer branded (rapport public) | Professionnaliser le livrable partagé + CTA acquisition |
| Barres de progression (règles de taux) | Rendre les taux visuellement scannables |
| Breadcrumb (résultats d'audit) | Donner du contexte et un chemin de retour |
| Modale de suppression de compte | Éviter une page dédiée pour une action rare |
| Toast notifications | Feedback discret pour les actions réussies (copie de lien, etc.) |

### Résumé des modifications

| Modifié | Avant | Après |
|---|---|---|
| Dashboard | 2 sections plates (workspaces list + audit table) | Cards workspace avec dernier score intégré + table historique enrichie |
| Workspace cards | Informations minimales (nom, hub ID) | Score, date du dernier audit, CTA contextuel |
| Résultats d'audit - hero | Score circle + texte brut | Card hero avec fond coloré, sous-scores, actions |
| Résultats d'audit - sections | Tout dans un seul flux vertical | Sections avec headers, nav sticky, ouverture conditionnelle |
| Rule cards | Accordéon simple (titre + chevron) | Sévérité + code + titre + compteur + impact inline |
| Pages auth | Cards blanches minimales, pas de branding | Layout avec topbar, identité visuelle, textes orientés valeur |
| Rapport public | Alert bleu + composant brut | Bandeau en-tête branded, footer CTA, topbar publique |

---

## Annexe — Composants UI nécessaires

Composants à créer ou étendre pour implémenter ces écrans :

| Composant | Statut actuel | Action requise |
|---|---|---|
| `Button` | Existe (3 variants) | Ajouter variant `ghost`, état `loading` amélioré, taille `sm/md/lg` |
| `Input` | Existe (basique) | Ajouter focus ring orange cohérent, taille `sm/md` |
| `Alert` | Existe (4 types) | OK, garder tel quel |
| `Badge` | N'existe pas | Créer (sévérité, score, statut) |
| `Card` | N'existe pas (inline styles) | Créer composant réutilisable |
| `Table` | N'existe pas (inline `<table>`) | Créer avec header sticky, hover row |
| `Modal` | N'existe pas | Créer (pour suppression de compte, confirmations) |
| `Toast` | N'existe pas | Créer (auto-dismiss, position bottom-right) |
| `Topbar` | N'existe pas | Créer (logo, nav, user menu) |
| `Skeleton` | N'existe pas | Créer (rectangles animés pour loading) |
| `ProgressBar` | N'existe pas | Créer (pour barres de taux dans les règles) |
| `ScoreCircle` | Existe (inline) | Extraire en composant réutilisable |
| `SeverityBadge` | Existe (inline) | Extraire en composant réutilisable |
| `EmptyState` | N'existe pas | Créer (icône + titre + texte + CTA) |
| `Breadcrumb` | N'existe pas | Créer |
| `Tabs` (sticky nav) | N'existe pas | Créer (scroll-to-anchor + intersection observer) |
| `Dropdown` | N'existe pas | Créer (pour user menu) |
| `RuleCard` | Existe (inline, RuleSection) | Refactoriser en composant propre avec les nouvelles specs |
| `WorkspaceCard` | N'existe pas (inline) | Créer |
