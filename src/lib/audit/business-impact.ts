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

  // Contacts C-01 à C-12 (EP-05)
  c01: {
    titre: "Contacts inutilisables pour le marketing",
    estimation:
      "Sans adresse email, vous ne pouvez pas contacter ces prospects via HubSpot. C'est un frein direct à vos campagnes d'emailing et à l'automation marketing.",
    urgence: "critique",
  },
  c02: {
    titre: "Contacts anonymes dégradant la personnalisation",
    estimation:
      "Des contacts sans prénom ni nom rendent impossible toute personnalisation de vos communications. Cela impacte directement vos taux d'ouverture et de conversion.",
    urgence: "critique",
  },
  c03: {
    titre: "Pipeline et segmentation peu fiables",
    estimation:
      "Sans lifecycle stage, vous ne pouvez pas distinguer vos prospects de vos clients. Vos workflows de nurturing et vos rapports de conversion deviennent inexploitables.",
    urgence: "élevée",
  },
  c04a: {
    titre: "Incohérences lifecycle / deals créant des rapports erronés",
    estimation:
      "Des contacts gagnés (deal closedwon) avec un lifecycle non mis à jour faussent vos métriques de conversion et peuvent déclencher des workflows de nurturing inappropriés.",
    urgence: "élevée",
  },
  c04b: {
    titre: "Clients sans deal associé créant des angles morts",
    estimation:
      "Des contacts marqués 'customer' sans deal closedwon indiquent un process de vente non suivi dans HubSpot. Vos revenus réels ne sont pas reflétés dans votre CRM.",
    urgence: "modérée",
  },
  c04c: {
    titre: "Pipeline actif sans MQL ni SQL — entonnoir de vente invisible",
    estimation:
      "Avoir des deals ouverts sans aucun contact qualifié en MQL ou SQL indique que votre processus de qualification n'est pas tracé dans HubSpot. Impossible de piloter votre funnel.",
    urgence: "élevée",
  },
  c04d: {
    titre: "Leads précoces déjà en deal — processus de qualification court-circuité",
    estimation:
      "Des contacts en phase subscriber ou lead avec des deals associés suggèrent que votre qualification est incomplète. Cela fausse vos taux de conversion par étape.",
    urgence: "faible",
  },
  c05: {
    titre: "Impossible d'analyser les données par compte",
    estimation:
      "Sans lien contact-company, impossible de faire de l'ABM, le revenu par client est peu fiable et la vue 'compte' est inutilisable pour vos commerciaux.",
    urgence: "modérée",
  },
  c06: {
    titre: "Base contacts polluée par des doublons email",
    estimation:
      "Des doublons email faussent vos métriques marketing, doublent vos coûts d'envoi et créent de la confusion commerciale avec plusieurs fiches pour le même prospect.",
    urgence: "critique",
  },
  c07: {
    titre: "Risque de doublons non détectés par nom",
    estimation:
      "Des noms similaires dans la même company suggèrent des doublons. L'historique des interactions est fragmenté et vos commerciaux peuvent contacter la même personne deux fois.",
    urgence: "modérée",
  },
  c08: {
    titre: "Risque de doublons non détectés par téléphone",
    estimation:
      "Des numéros de téléphone identiques sur plusieurs fiches indiquent des doublons. L'historique des appels et SMS est dispersé entre plusieurs fiches.",
    urgence: "modérée",
  },
  c09: {
    titre: "Emails non délivrables dans la base",
    estimation:
      "Des emails au format invalide empoisonnent vos listes d'envoi, dégradent votre réputation d'expéditeur et faussent vos métriques de délivrabilité.",
    urgence: "modérée",
  },
  c10: {
    titre: "Contacts fantômes dans la base",
    estimation:
      "Des contacts inactifs depuis plus d'un an gonflent la taille de votre base, augmentent vos coûts de licence HubSpot et faussent vos métriques de segmentation.",
    urgence: "faible",
  },
  c11: {
    titre: "Manque de traçabilité — contacts sans propriétaire",
    estimation:
      "Sans propriétaire assigné, l'attribution des leads est impossible et aucun commercial n'est responsable du suivi. Ces contacts risquent de tomber dans l'oubli.",
    urgence: "faible",
  },
  c12: {
    titre: "Attribution impossible — contacts sans source",
    estimation:
      "Sans source d'acquisition, vous ne pouvez pas mesurer la performance de vos canaux marketing. L'optimisation budgétaire et le ROI par canal sont impossibles.",
    urgence: "faible",
  },

  // Companies CO-01 à CO-08 (EP-05b)
  co01: {
    titre: "Companies sans identité web",
    estimation:
      "Des entreprises sans domaine ne peuvent pas être dédupliquées automatiquement, ni enrichies via les outils d'enrichissement HubSpot. L'identification et le suivi des comptes sont compromis.",
    urgence: "critique",
  },
  co02: {
    titre: "Base entreprises polluée par des doublons",
    estimation:
      "Des companies en doublon fragmentent le CA par client, créent des incohérences dans les rapports account-based et empêchent de calculer un chiffre d'affaires fiable par client.",
    urgence: "critique",
  },
  co03: {
    titre: "Risque de doublons entreprises non détectés",
    estimation:
      "Des companies avec des noms similaires mais des domains différents peuvent représenter la même entité — historique commercial fragmenté, deals attribués à la mauvaise fiche.",
    urgence: "modérée",
  },
  co04: {
    titre: "Companies orphelines sans valeur commerciale",
    estimation:
      "Des fiches entreprises sans aucun contact associé depuis plus de 90 jours n'ont aucune valeur commerciale directe et polluent la base.",
    urgence: "modérée",
  },
  co05: {
    titre: "Companies sans propriétaire assigné",
    estimation:
      "Des companies sans owner, sans industrie ou sans dimensionnement rendent impossible la segmentation par taille, secteur ou territoire. Les rapports stratégiques sont faussés.",
    urgence: "faible",
  },
  co06: {
    titre: "Companies sans industrie renseignée",
    estimation:
      "Des companies sans industrie rendent impossible la segmentation sectorielle et les analyses de marché par vertical.",
    urgence: "faible",
  },
  co07: {
    titre: "Companies sans dimensionnement",
    estimation:
      "Des companies sans effectif ni chiffre d'affaires renseigné empêchent la segmentation par taille d'entreprise (PME, ETI, Grand compte).",
    urgence: "faible",
  },
  co08: {
    titre: "Companies fantômes dans la base",
    estimation:
      "Des companies inactives depuis plus d'un an gonflent la base et faussent les métriques de couverture marché.",
    urgence: "faible",
  },

  // Users U-01 à U-07 (EP-09)
  u01: {
    titre: "Utilisateurs invisibles dans les rapports d'équipe",
    estimation:
      "Des utilisateurs sans équipe sont exclus des vues par équipe, des rapports d'activité commerciale et des règles d'attribution automatique. Leur travail dans HubSpot n'apparaît nulle part dans le reporting d'équipe.",
    urgence: "modérée",
  },
  u02: {
    titre: "Surface d'attaque élargie par excès de Super Admins",
    estimation:
      "Chaque Super Admin peut exporter toutes les données, supprimer des objets en masse et modifier la configuration globale. Plus il y en a, plus le risque d'erreur humaine ou de fuite de données augmente.",
    urgence: "élevée",
  },
  u03: {
    titre: "Zone grise de gouvernance",
    estimation:
      "Des utilisateurs sans rôle explicite ont des permissions non maîtrisées. Impossible de savoir qui peut faire quoi — la gouvernance repose sur des hypothèses au lieu de règles configurées.",
    urgence: "modérée",
  },
  u04: {
    titre: "Principe du moindre privilège non respecté",
    estimation:
      "Si tous les utilisateurs ont le même rôle, des commerciaux ont probablement accès à des paramètres d'administration et des marketeurs peuvent modifier des pipelines de vente. Le risque d'erreur de configuration augmente avec chaque utilisateur.",
    urgence: "modérée",
  },
  u05: {
    titre: "Comptes fantômes — faille de sécurité",
    estimation:
      "Des comptes d'anciens employés ou prestataires encore actifs dans HubSpot représentent un risque direct de fuite de données. Chaque jour où ces comptes restent ouverts est un jour d'exposition.",
    urgence: "élevée",
  },
  u06: {
    titre: "Configuration orpheline",
    estimation:
      "Des équipes vides polluent les menus de filtrage et peuvent induire en erreur les utilisateurs. Elles sont le signe d'une réorganisation non finalisée.",
    urgence: "faible",
  },
  u07: {
    titre: "Licences potentiellement gaspillées",
    estimation:
      "Des comptes owner sans aucun objet CRM assigné (0 contacts, 0 deals, 0 companies) représentent des licences probablement payées mais non exploitées.",
    urgence: "faible",
  },

  // Deals D-01 à D-15 (EP-06)
  d01: {
    titre: "Deals sans montant rendant le forecast impossible",
    estimation:
      "Sans montant renseigné, votre forecast de revenus est inexact. Votre direction commerciale ne peut pas s'appuyer sur HubSpot pour ses prévisions de chiffre d'affaires.",
    urgence: "critique",
  },
  d02: {
    titre: "Deals sans date de clôture désorganisant le pipeline",
    estimation:
      "Sans date de clôture prévisionnelle, vos deals ouverts ne peuvent pas être priorisés temporellement. Vos commerciaux manquent de visibilité sur ce qu'ils doivent traiter en urgence.",
    urgence: "critique",
  },
  d03: {
    titre: "Deals anciens signalant des opportunités potentiellement perdues",
    estimation:
      "Des deals ouverts depuis plus de 60 jours sans progression indiquent soit des opportunités mortes non clôturées, soit un manque de suivi commercial. Cela gonfle artificiellement votre pipeline.",
    urgence: "élevée",
  },
  d04: {
    titre: "Propriétés obligatoires non renseignées dans les stages",
    estimation:
      "Des propriétés requises non renseignées dans certains stages indiquent que votre processus de vente n'est pas respecté. Vos deals avancent sans les informations nécessaires à leur qualification.",
    urgence: "critique",
  },
  d05: {
    titre: "Deals bloqués dans un stage depuis trop longtemps",
    estimation:
      "Des deals immobiles depuis plus de 60 jours dans le même stage encombrent votre pipeline et faussent vos métriques de vélocité commerciale.",
    urgence: "élevée",
  },
  d06: {
    titre: "Pipeline sans activité récente — potentiellement obsolète",
    estimation:
      "Un pipeline sans deal ouvert ni création récente est probablement obsolète. Il encombre la vue des commerciaux et peut créer de la confusion lors de la création de nouveaux deals.",
    urgence: "faible",
  },
  d07: {
    titre: "Pipeline avec trop de stages ralentissant la progression",
    estimation:
      "Un pipeline avec plus de 8 stages actifs complexifie inutilement le processus de vente. Les commerciaux risquent de sauter des étapes ou de mal qualifier la progression des deals.",
    urgence: "faible",
  },
  d08: {
    titre: "Deals sans propriétaire — responsabilité non attribuée",
    estimation:
      "Des deals sans owner signifient qu'aucun commercial n'est responsable de leur avancement. Ces opportunités risquent de tomber dans l'oubli.",
    urgence: "faible",
  },
  d09: {
    titre: "Deals sans contact associé — suivi impossible",
    estimation:
      "Des deals sans contact rendent impossible le suivi des interactions et la communication avec le prospect. Les emails et appels ne sont pas tracés sur le deal.",
    urgence: "élevée",
  },
  d10: {
    titre: "Deals sans company associée — vue compte incomplète",
    estimation:
      "Des deals sans company empêchent la consolidation du chiffre d'affaires par client et limitent la vision account-based de votre pipeline.",
    urgence: "faible",
  },
  d11: {
    titre: "Deals avec montant à 0 — forecast faussé",
    estimation:
      "Des deals avec un montant explicitement à 0 faussent votre weighted pipeline et vos prévisions de revenus. Ces deals doivent être qualifiés ou fermés.",
    urgence: "élevée",
  },
  d12: {
    titre: "Phases sautées dans le pipeline — processus non respecté",
    estimation:
      "Plus de 20% des deals sautent des étapes dans ce pipeline. Votre processus commercial n'est pas suivi, ce qui fausse les taux de conversion par étape et rend le coaching commercial difficile.",
    urgence: "élevée",
  },
  d13: {
    titre: "Points d'entrée multiples — pipeline mal structuré",
    estimation:
      "Plus de 20% des deals ne commencent pas à la première étape. Cela indique soit un pipeline mal structuré, soit des deals créés manuellement sans respect du processus.",
    urgence: "élevée",
  },
  d14: {
    titre: "Stages fermés redondants — configuration à simplifier",
    estimation:
      "Plusieurs stages 'Gagné' ou 'Perdu' dans le même pipeline créent de la confusion. Les commerciaux risquent de mal catégoriser les deals fermés, faussant vos métriques win/loss.",
    urgence: "élevée",
  },
  d15: {
    titre: "Stages sans activité depuis 90 jours — étapes obsolètes",
    estimation:
      "Des stages sans aucun deal ni activité depuis 3 mois sont probablement obsolètes. Ils encombrent la vue pipeline et complexifient inutilement le processus.",
    urgence: "faible",
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
