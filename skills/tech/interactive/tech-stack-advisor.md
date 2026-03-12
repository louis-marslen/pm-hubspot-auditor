---
name: tech-stack-advisor
description: Guider le choix d'une librairie ou d'un service technique en structurant les trade-offs
type: interactive
---

# Tech Stack Advisor

## Objectif

Structurer une décision de choix technologique en posant les bonnes questions, en comparant les options de façon objective et en aboutissant à une recommandation argumentée. L'output est utilisable directement comme base d'un ADR.

## Processus guidé

### Phase 1 — Cadrer le besoin (questions à poser)

```
1. Quel problème technique dois-tu résoudre ?
   (Ex: "envoyer des emails transactionnels", "authentifier les utilisateurs")

2. Quelles contraintes non-négociables s'appliquent ?
   - Budget (ex: gratuit en early stage)
   - Stack existante (ex: doit s'intégrer avec Next.js)
   - Compétences disponibles (ex: pas d'expérience DevOps)
   - Réversibilité (ex: facile à remplacer plus tard ?)

3. Quel est le volume anticipé pour le MVP ?
   (Ex: < 100 users, < 10k emails/mois)

4. Quelles options as-tu déjà en tête ?
```

### Phase 2 — Structurer la comparaison

Pour chaque option, évaluer sur ces axes :

| Critère | Description |
|---|---|
| **Intégration** | Facilité d'intégration dans la stack actuelle (SDK, docs, exemples) |
| **DX** | Qualité de l'expérience développeur (temps d'onboarding, documentation) |
| **Coût** | Prix pour le volume MVP, évolution tarifaire à scale |
| **Maturité** | Ancienneté, adoption dans l'industrie, stabilité de l'API |
| **Réversibilité** | Facilité de migration vers une alternative si besoin |
| **Vendor lock-in** | Dépendance aux spécificités propriétaires |

### Phase 3 — Notation rapide (optionnel)

Si l'indécision persiste, noter chaque option sur 5 pour chaque critère et pondérer selon l'importance contextuelle.

### Phase 4 — Recommandation

Format de sortie :

```
Recommandation : [Option X]

Raison principale : [Une phrase — pourquoi cette option devant les autres dans CE contexte]

Risque principal accepté : [Ce à quoi on renonce ou ce qu'on risque]

Condition de révision : [Quand reconsidérer ce choix — ex: "Si on dépasse 10k emails/mois"]

ADR suggéré : [Oui / Non — si décision structurante, créer un ADR]
```

## Exemple d'application

**Besoin** : Choisir un service d'email transactionnel pour HubSpot Auditor en early stage.

**Contraintes** : Gratuit ou quasi, intégration Node.js simple, < 3000 emails/mois au lancement.

**Options** : Resend, SendGrid, AWS SES

| Critère | Resend | SendGrid | AWS SES |
|---|---|---|---|
| Intégration | ★★★★★ SDK officiel, 5 min | ★★★★ Bien documenté | ★★★ Config SMTP complexe |
| DX | ★★★★★ API minimaliste | ★★★★ Complet mais verbeux | ★★ Config DNS + IAM |
| Coût MVP | ★★★★★ 3000/mois gratuit | ★★★★ 100/jour gratuit | ★★★ 0.10$/1000 mais setup |
| Maturité | ★★★ Récent (2022) | ★★★★★ Très établi | ★★★★★ AWS, très stable |
| Réversibilité | ★★★★ API standard | ★★★★ API standard | ★★★ Moins portable |

**Recommandation** : Resend

Raison principale : DX et intégration Next.js optimales pour un développeur solo sans expertise DevOps email.

Risque principal accepté : Service plus récent, moins de track record sur la deliverability long terme.

Condition de révision : Si deliverability devient un problème documenté ou si on dépasse 3000 emails/mois régulièrement.

ADR suggéré : Oui → ADR-001

## Pièges courants

| Piège | Symptôme | Correction |
|---|---|---|
| Choisir "le plus populaire" | "Tout le monde utilise X" | Évaluer dans le contexte spécifique du projet |
| Ignorer le coût à scale | "C'est gratuit !" | Calculer le coût à 10x le volume MVP |
| Sous-estimer la DX | "Ça a l'air bien documenté" | Tester un hello world avant de décider |
| Décision sans trace | Choix verbal, pas documenté | Créer un ADR après chaque décision structurante |

## Skills liés

- `architecture-decision-record` — documenter la décision prise
- `technical-design-doc` — la stack choisie informe la spec technique
