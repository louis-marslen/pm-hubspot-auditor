/** Urgences possibles selon la criticité */
type Urgence = "critique" | "élevée" | "modérée" | "faible";

export interface BusinessImpact {
  titre: string;
  estimation: string;
  urgence: Urgence;
}

/**
 * Table statique mappant chaque règle P1-P16 vers son impact business.
 * Source : PRD EP-02, section 6.7.
 */
export const BUSINESS_IMPACTS: Record<string, BusinessImpact> = {
  p1: {
    titre: "Propriétés inutilisées encombrant votre CRM",
    estimation:
      "Chaque propriété vide depuis plus de 90 jours représente du bruit dans vos vues et segmentations. Votre équipe perd du temps à chercher de l'information dans un CRM surchargé.",
    urgence: "critique",
  },
  p2: {
    titre: "Propriétés sous-utilisées réduisant la qualité des données",
    estimation:
      "Un taux de remplissage inférieur à 5% signifie que ces propriétés ne sont pas intégrées dans les processus de l'équipe. Les rapports et segmentations basés dessus sont peu fiables.",
    urgence: "élevée",
  },
  p3: {
    titre: "Doublons de propriétés créant des incohérences",
    estimation:
      "Des propriétés aux noms similaires provoquent des erreurs de saisie et des données dispersées. Il est probable que votre équipe renseigne les deux indifféremment, rendant vos analyses inexactes.",
    urgence: "élevée",
  },
  p4: {
    titre: "Propriétés sans documentation ralentissant l'adoption",
    estimation:
      "Sans description, les nouveaux membres de l'équipe ne savent pas quoi saisir dans ces champs. Cela favorise les erreurs de saisie et réduit l'utilisation du CRM.",
    urgence: "faible",
  },
  p5: {
    titre: "Propriétés mal organisées réduisant la lisibilité",
    estimation:
      "Des propriétés non classées dans un groupe métier rendent la vue fiche contact/deal difficile à naviguer. Vos équipes passent plus de temps à trouver l'information qu'à l'utiliser.",
    urgence: "faible",
  },
  p6: {
    titre: "Types de données inadaptés limitant les analyses",
    estimation:
      "Stocker des dates ou des montants en texte libre empêche les tris, filtres numériques et calculs automatiques. Vos rapports sur ces champs seront incorrects ou impossibles.",
    urgence: "élevée",
  },
  p7: {
    titre: "Contacts sans email bloquant toute communication marketing",
    estimation:
      "Sans adresse email, vous ne pouvez pas contacter ces prospects via HubSpot. C'est un frein direct à vos campagnes d'emailing et à l'automation marketing.",
    urgence: "critique",
  },
  p8: {
    titre: "Contacts anonymes dégradant la personnalisation",
    estimation:
      "Des contacts sans prénom ni nom rendent impossible toute personnalisation de vos communications. Cela impacte directement vos taux d'ouverture et de conversion.",
    urgence: "élevée",
  },
  p9: {
    titre: "Lifecycle stage absent empêchant la segmentation",
    estimation:
      "Sans lifecycle stage, vous ne pouvez pas distinguer vos prospects de vos clients. Vos workflows de nurturing et vos rapports de conversion deviennent inexploitables.",
    urgence: "élevée",
  },
  p10a: {
    titre: "Incohérences lifecycle / deals créant des rapports erronés",
    estimation:
      "Des contacts gagnés (deal closedwon) avec un lifecycle non mis à jour faussent vos métriques de conversion et peuvent déclencher des workflows de nurturing inappropriés.",
    urgence: "élevée",
  },
  p10b: {
    titre: "Clients sans deal associé créant des angles morts",
    estimation:
      "Des contacts marqués 'customer' sans deal closedwon indiquent un process de vente non suivi dans HubSpot. Vos revenus réels ne sont pas reflétés dans votre CRM.",
    urgence: "modérée",
  },
  p10c: {
    titre: "Pipeline actif sans MQL ni SQL — entonnoir de vente invisible",
    estimation:
      "Avoir des deals ouverts sans aucun contact qualifié en MQL ou SQL indique que votre processus de qualification n'est pas tracé dans HubSpot. Impossible de piloter votre funnel.",
    urgence: "critique",
  },
  p10d: {
    titre: "Leads précoces déjà en deal — processus de qualification court-circuité",
    estimation:
      "Des contacts en phase subscriber ou lead avec des deals associés suggèrent que votre qualification est incomplète. Cela fausse vos taux de conversion par étape.",
    urgence: "faible",
  },
  p11: {
    titre: "Contacts non rattachés à une company limitant les vues B2B",
    estimation:
      "Dans un contexte B2B, des contacts sans company associée rendent impossible la vue 'compte' et la consolidation des interactions par entreprise. Vos équipes commerciales travaillent en silos.",
    urgence: "élevée",
  },
  p12: {
    titre: "Companies sans domaine bloquant l'enrichissement automatique",
    estimation:
      "Sans domaine web, HubSpot ne peut pas enrichir automatiquement les fiches company. Vous perdez des informations clés (effectif, industrie, revenus) sans effort de votre équipe.",
    urgence: "élevée",
  },
  p13: {
    titre: "Deals sans montant rendant le forecast impossible",
    estimation:
      "Sans montant renseigné, votre forecast de revenus est inexact. Votre direction commerciale ne peut pas s'appuyer sur HubSpot pour ses prévisions de chiffre d'affaires.",
    urgence: "critique",
  },
  p14: {
    titre: "Deals sans date de clôture désorganisant le pipeline",
    estimation:
      "Sans date de clôture prévisionnelle, vos deals ouverts ne peuvent pas être priorisés temporellement. Vos commerciaux manquent de visibilité sur ce qu'ils doivent traiter en urgence.",
    urgence: "critique",
  },
  p15: {
    titre: "Deals bloqués depuis plus de 60 jours signalant des opportunités perdues",
    estimation:
      "Des deals sans progression depuis 60+ jours indiquent soit des opportunités mortes non clôturées, soit un manque de suivi commercial. Cela gonfle artificiellement votre pipeline.",
    urgence: "critique",
  },
  p16: {
    titre: "Informations manquantes dans les stages bloquant la progression",
    estimation:
      "Des propriétés requises non renseignées dans certains stages indiquent que votre processus de vente n'est pas respecté. Vos deals avancent sans les informations nécessaires à leur qualification.",
    urgence: "élevée",
  },

  // Workflows W1-W7
  w1: {
    titre: "Workflows actifs avec un fort taux d'erreur",
    estimation:
      "Un taux d'erreur supérieur à 10% signifie que vos workflows automatisés échouent régulièrement. Des contacts ou deals passent entre les mailles du filet, vos séquences marketing et vos alertes commerciales ne fonctionnent pas correctement.",
    urgence: "critique",
  },
  w2: {
    titre: "Workflows actifs sans aucune action configurée",
    estimation:
      "Ces workflows sont activés mais ne font rien. Ils consomment des ressources, peuvent enrôler des contacts inutilement et créent de la confusion dans votre configuration HubSpot.",
    urgence: "critique",
  },
  w3: {
    titre: "Workflows actifs sans enrôlement récent — potentiellement obsolètes",
    estimation:
      "Un workflow actif qui n'a enrôlé aucun contact depuis plus de 90 jours est probablement obsolète. Il encombre votre liste, génère une fausse impression d'automatisation active et peut déclencher des actions inattendues si les critères sont à nouveau remplis.",
    urgence: "élevée",
  },
  w4: {
    titre: "Workflows inactifs depuis plus de 90 jours à archiver",
    estimation:
      "Des workflows inactifs anciens encombrent votre espace de travail. S'ils ne sont plus nécessaires, les laisser en place crée de la confusion pour les nouvelles personnes rejoignant l'équipe et rend la maintenance plus difficile.",
    urgence: "élevée",
  },
  w5: {
    titre: "Workflows récemment désactivés à surveiller",
    estimation:
      "Ces workflows ont été désactivés récemment. Vérifiez s'il s'agit d'une désactivation temporaire ou définitive, et documenter la décision pour éviter une réactivation accidentelle.",
    urgence: "modérée",
  },
  w6: {
    titre: "Workflows avec des noms non descriptifs",
    estimation:
      "Des noms génériques comme 'Copy of...' ou 'New Workflow' rendent impossible la compréhension rapide de ce que fait un workflow. La maintenance, l'audit et l'onboarding sont significativement ralentis.",
    urgence: "faible",
  },
  w7: {
    titre: "Workflows non organisés dans des dossiers",
    estimation:
      "Sans organisation en dossiers, votre liste de workflows devient rapidement ingérable au-delà d'une dizaine d'automatisations. La navigation et la recherche prennent du temps inutilement.",
    urgence: "faible",
  },
};
