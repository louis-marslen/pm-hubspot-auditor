// ─── Audit Domain Selection (EP-17) ──────────────────────────────────────────

export type AuditDomainId = 'properties' | 'contacts' | 'companies' | 'workflows' | 'users' | 'deals' | 'leads';

export interface AuditDomainSelection {
  selected: AuditDomainId[];
  available: AuditDomainId[];
  skipped_reasons?: Record<string, string>;
}

export interface AuditDomainMeta {
  id: AuditDomainId;
  label: string;
  description: string;
  required: boolean;
  implemented: boolean;
  defaultSelected?: boolean;
  tooltip?: string;
}

export const AUDIT_DOMAINS: AuditDomainMeta[] = [
  {
    id: 'properties',
    label: 'Propriétés personnalisées',
    description: 'Propriétés inutilisées, redondantes, mal typées',
    required: true,
    implemented: true,
  },
  {
    id: 'contacts',
    label: 'Contacts & doublons',
    description: 'Doublons, emails invalides, contacts stale, attribution',
    required: false,
    implemented: true,
  },
  {
    id: 'companies',
    label: 'Companies',
    description: 'Doublons, companies orphelines, qualité des données',
    required: false,
    implemented: true,
  },
  {
    id: 'workflows',
    label: 'Workflows',
    description: 'Workflows inactifs, zombies, sans actions, legacy',
    required: false,
    implemented: true,
  },
  {
    id: 'users',
    label: 'Utilisateurs & Équipes',
    description: 'Super Admins, rôles, utilisateurs inactifs, équipes',
    required: false,
    implemented: true,
  },
  {
    id: 'deals',
    label: 'Deals & Pipelines',
    description: 'Deals bloqués, étapes mal configurées, conversions',
    required: false,
    implemented: true,
  },
  {
    id: 'leads',
    label: 'Leads & Prospection',
    description: 'Leads bloqués, disqualifications, handoff lead → deal, pipelines de prospection',
    required: false,
    implemented: true,
    defaultSelected: false,
    tooltip: 'Activez si votre équipe utilise l\'objet Lead HubSpot pour gérer la prospection.',
  },
];

// ─── Audit Progress (EP-UX-02) ────────────────────────────────────────────

export interface DomainProgress {
  status: "pending" | "running" | "completed" | "error";
  currentStep: "fetching" | "analyzing" | "scoring" | null;
  completedSteps: string[];
  itemCount: number | null;
  fetchedCount: number | null;  // nombre d'objets récupérés jusqu'ici (étape fetching)
  error: string | null;
}

export interface AuditProgress {
  domains: Record<string, DomainProgress>;
  llmSummary: { status: "pending" | "running" | "completed" | "error"; error?: string };
  globalProgress: number;
}

// ─── Workflows domain ─────────────────────────────────────────────────────

export interface WorkflowIssue {
  id: string;
  name: string;
  folderId: number | null;
  createdAt: string;
  updatedAt: string;
  status: "ACTIVE" | "INACTIVE";
  lastEnrollmentAt: string | null;
  actionCount: number;
  errorRate: number | null;     // null = non calculable
  deactivatedAt: string | null; // proxy via updatedAt si INACTIVE
  isLegacy?: boolean;           // ancienne génération "Simple"
  notAnalyzed?: boolean;        // erreur API individuelle
}

export interface WorkflowAuditResults {
  totalWorkflows: number;
  hasWorkflows: boolean;
  w1: WorkflowIssue[];
  w2: WorkflowIssue[];
  w3: WorkflowIssue[];
  w4: WorkflowIssue[];
  w5: WorkflowIssue[];
  w6: WorkflowIssue[];
  w7: WorkflowIssue[];
  notAnalyzed: WorkflowIssue[];
  score: number | null;      // null si hasWorkflows=false
  scoreLabel: string | null;
  totalCritiques: number;
  totalAvertissements: number;
  totalInfos: number;
}

// ─── AI Diagnostic (EP-14) ───────────────────────────────────────────────

export interface DiagnosticCluster {
  titre: string;
  description: string;
  domaines: string[];
  regles_sources: string[];
  criticite: "critique" | "élevé" | "modéré";
}

export interface RecommandationProject {
  titre: string;
  objectif: string;
  impact_attendu: string;
  niveau_impact: "Fort" | "Moyen" | "Faible";
  taille: "XS" | "S" | "M" | "L" | "XL";
  priorite: "P1" | "P2" | "P3";
  domaines: string[];
  actions_cles: string[];
}

export interface AIDiagnostic {
  diagnostic: {
    forces: DiagnosticCluster[];
    faiblesses: DiagnosticCluster[];
    risques: DiagnosticCluster[];
  };
  hero_summary: string;
  roadmap: RecommandationProject[];
  backlog: RecommandationProject[];
}

export interface GlobalAuditResults {
  propertyResults: AuditResults;
  workflowResults: WorkflowAuditResults | null;
  contactResults: ContactAuditResults | null;
  companyResults: CompanyAuditResults | null;
  userResults: UserAuditResults | null;
  dealResults: DealAuditResults | null;
  leadResults: LeadAuditResults | null;
  globalScore: number;
  globalScoreLabel: string;
  propertyWeight: number;
  workflowWeight: number;
  contactWeight: number;
  companyWeight: number;
  userWeight: number;
  dealWeight: number;
  leadWeight: number;
}

// ─── Users & Teams domain (EP-09) ─────────────────────────────────────────

export interface UserIssue {
  userId: string;
  email: string;
  name: string;
  role: string;
  teamName: string | null;
  createdAt: string | null;
}

export interface TeamIssue {
  teamId: string;
  name: string;
}

export interface RoleDistribution {
  roleId: string | null;
  roleName: string;
  count: number;
  percentage: number;
}

/** Raw HubSpot user from Settings API */
export interface HubSpotUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roleId: string | null;
  roleIds?: string[];
  superAdmin: boolean;
  primaryTeamId: string | null;
  secondaryTeamIds?: string[];
  createdAt?: string;
}

/** Raw HubSpot team from Settings API */
export interface HubSpotTeam {
  id: string;
  name: string;
  userIds?: string[];
  secondaryUserIds?: string[];
}

/** Raw HubSpot role from Settings API */
export interface HubSpotRole {
  id: string;
  name: string;
}

/** Raw HubSpot owner from Owners API */
export interface HubSpotOwner {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt?: string;
  archived: boolean;
}

/** Login activity from Enterprise Account Info API */
export interface LoginActivity {
  id: string;
  email: string;
  loginAt: string;
  loginSucceeded: boolean;
}

export interface UserAuditResults {
  totalUsers: number;
  totalTeams: number;
  totalRoles: number;
  hasUsers: boolean;
  isEnterprise: boolean;

  // Règles scorées
  u01: UserIssue[];                 // Sans équipe — avertissement (1 par user)
  u02: {                            // Super Admins en excès — critique (1 unique)
    triggered: boolean;
    superAdminCount: number;
    totalUsers: number;
    rate: number;
    threshold: string;
    superAdmins: UserIssue[];
  };
  u03: UserIssue[];                 // Sans rôle — avertissement (1 par user)
  u04: {                            // Pas de différenciation — avertissement (1 unique)
    triggered: boolean;
    disabled: boolean;
    disabledReason: string | null;
    dominantRate: number;
    distribution: RoleDistribution[];
  };
  u05: {                            // Inactifs — critique (1 par user)
    isEnterprise: boolean;
    inactiveUsers: UserIssue[];
    lastLoginDates: Record<string, string | null>;
  };
  u06: TeamIssue[];                 // Équipes vides — info (1 par équipe)
  u07: UserIssue[];                 // Owner sans objet CRM — info (1 par owner)

  score: number;
  scoreLabel: string;
  totalCritiques: number;
  totalAvertissements: number;
  totalInfos: number;

  /** Error if scope missing — domain partially or fully unavailable */
  scopeError: string | null;
}

// ─── Contacts domain (EP-05) ───────────────────────────────────────────────

export interface ContactIssue {
  id: string;           // Hub ID du contact
  name: string;         // firstname + lastname (ou "Sans nom")
  email: string | null;
  lifecycleStage: string | null;
  ownerId: string | null;
  source: string | null;
  phone: string | null;
  mobilephone: string | null;
  companyId: string | null;
  lastModifiedDate: string | null;
  createdAt: string;
}

export interface DuplicateCluster {
  criterion: "email" | "name_company" | "phone";
  normalizedValue: string;   // valeur normalisée servant de clé de regroupement
  members: ContactIssue[];
  size: number;
}

export interface ContactAuditResults {
  totalContacts: number;
  hasContacts: boolean;

  // Règles migrées (ex-P7→C-01, P8→C-02, P9→C-03, P10a-d→C-04a-d, P11→C-05)
  c01: RateResult;                                                    // Email rate < 80% — critique
  c02: { count: number; examples: ContactIssue[] };                   // Sans prénom ni nom — critique
  c03: RateResult;                                                    // Lifecycle rate < 60% — avertissement
  c04a: { count: number; examples: ContactIssue[] };                  // Deal won sans customer — avertissement
  c04b: { count: number; examples: ContactIssue[] };                  // Customer sans deal won — info
  c04c: { triggered: boolean };                                       // 0 MQL/SQL avec deals — avertissement
  c04d: { count: number; examples: ContactIssue[] };                  // Lead avec deal actif — info
  c05: RateResult | null;                                             // Sans company (B2B) < 60% — info

  // Doublons
  c06: DuplicateCluster[];   // Doublons email exact — critique (1 par cluster)
  c07: DuplicateCluster[];   // Doublons nom+company — avertissement (1 par cluster)
  c08: DuplicateCluster[];   // Doublons téléphone — avertissement (1 par cluster)

  // Qualité
  c09: ContactIssue[];       // Email invalide — avertissement (1 par contact)
  c10: ContactIssue[];       // Contact stale > 365j — info (1 par contact)
  c11: ContactIssue[];       // Sans owner — info (1 par contact)
  c12: ContactIssue[];       // Sans source — info (1 par contact)

  score: number;
  scoreLabel: string;
  totalCritiques: number;
  totalAvertissements: number;
  totalInfos: number;
}

// ─── Companies domain (EP-05b) ────────────────────────────────────────────

export interface CompanyIssue {
  id: string;           // Hub ID de la company
  name: string;         // nom de la company (ou "Sans nom")
  domain: string | null;
  industry: string | null;
  numberOfEmployees: string | null;
  annualRevenue: string | null;
  ownerId: string | null;
  lastModifiedDate: string | null;
  createdAt: string;
  contactCount: number;  // nombre de contacts associés
  dealCount: number;     // nombre de deals associés
}

export interface CompanyDuplicateCluster {
  criterion: "domain" | "name";
  normalizedValue: string;   // valeur normalisée servant de clé de regroupement
  members: CompanyIssue[];
  size: number;
}

export interface CompanyAuditResults {
  totalCompanies: number;
  hasCompanies: boolean;

  // CO-01 : Taux domain < 70% — critique
  co01: RateResult;
  // CO-02 : Doublons domain exact — critique (1 par cluster)
  co02: CompanyDuplicateCluster[];
  // CO-03 : Doublons nom entreprise (Levenshtein > 85%) — avertissement (1 par cluster)
  co03: CompanyDuplicateCluster[];
  // CO-04 : Company sans contact (> 90j) — avertissement (1 par company)
  co04: CompanyIssue[];
  // CO-05 : Company sans owner — info (1 par company)
  co05: CompanyIssue[];
  // CO-06 : Company sans industrie — info (1 par company)
  co06: CompanyIssue[];
  // CO-07 : Company sans dimensionnement — info (1 par company)
  co07: CompanyIssue[];
  // CO-08 : Company stale > 365j — info (1 par company)
  co08: CompanyIssue[];

  score: number;
  scoreLabel: string;
  totalCritiques: number;
  totalAvertissements: number;
  totalInfos: number;
}

// ─── Deals & Pipelines domain (EP-06) ─────────────────────────────────────

export interface DealDetailIssue {
  id: string;
  name: string;
  pipeline: string;
  pipelineLabel: string;
  stage: string;
  stageLabel: string;
  amount: number | null;
  closedate: string | null;
  ownerId: string | null;
  createdAt: string;
  lastModifiedDate: string | null;
  ageInDays: number;
  daysInStage?: number;
  dateEnteredStage?: string | null;
  missingProperties?: string[];
  contactCount?: number;
  companyCount?: number;
}

export interface BlockedDealGroup {
  pipelineId: string;
  pipelineLabel: string;
  stageId: string;
  stageLabel: string;
  deals: DealDetailIssue[];
}

export interface PipelineInfo {
  id: string;
  label: string;
  stageCount: number;
  activeStageCount: number;
  openDealCount: number;
  totalDealCount: number;
  lastDealCreatedAt: string | null;
  stages: PipelineStageInfo[];
}

export interface PipelineStageInfo {
  id: string;
  label: string;
  displayOrder: number;
  isClosed: boolean;
  probability: number;
  openDealCount: number;
  lastActivity: string | null;
}

export interface SkippedStageInfo {
  stageId: string;
  stageLabel: string;
  skipCount: number;
}

export interface PipelineRuleResult {
  pipelineId: string;
  pipelineLabel: string;
  triggered: boolean;
  // D-06
  totalDeals?: number;
  lastDealCreatedAt?: string | null;
  stageCount?: number;
  // D-07
  activeStageCount?: number;
  stages?: PipelineStageInfo[];
  // D-12
  skippedRate?: number;
  dealsWithSkips?: number;
  totalAnalyzed?: number;
  topSkippedStages?: SkippedStageInfo[];
  // D-13
  nonStandardEntryRate?: number;
  nonStandardEntries?: number;
  entryDistribution?: { stageId: string; stageLabel: string; count: number }[];
  // D-14
  closedWonStages?: { id: string; label: string; dealCount: number }[];
  closedLostStages?: { id: string; label: string; dealCount: number }[];
}

export interface StageRuleResult {
  pipelineId: string;
  pipelineLabel: string;
  stageId: string;
  stageLabel: string;
  displayOrder: number;
  lastActivity: string | null;
}

export interface DealAuditResults {
  totalDeals: number;         // tous statuts
  totalOpenDeals: number;     // statut open uniquement
  totalPipelines: number;
  hasDeals: boolean;

  // Règles migrées depuis EP-02
  d01: RateResult;                    // Taux montant insuffisant — critique
  d02: RateResult;                    // Taux date de clôture insuffisant — critique
  d03: DealDetailIssue[];             // Deal open ancien 60j+ — avertissement
  d04: PipelineStageIssue[];          // Propriétés obligatoires manquantes — critique

  // Deals bloqués
  d05: BlockedDealGroup[];            // Deal bloqué dans un stage — avertissement

  // Configuration pipeline
  d06: PipelineRuleResult[];          // Pipeline sans activité — info
  d07: PipelineRuleResult[];          // Pipeline trop de stages — info
  d12: PipelineRuleResult[];          // Phases sautées — avertissement
  d13: PipelineRuleResult[];          // Points d'entrée multiples — avertissement
  d14: PipelineRuleResult[];          // Stages fermés redondants — avertissement
  d15: StageRuleResult[];             // Stage sans activité 90j — info

  // Qualité données
  d08: DealDetailIssue[];             // Sans owner — info
  d09: DealDetailIssue[];             // Sans contact associé — avertissement
  d10: { disabled: boolean; disabledReason: string | null; deals: DealDetailIssue[] }; // Sans company — info
  d11: DealDetailIssue[];             // Montant à 0 — avertissement

  score: number;
  scoreLabel: string;
  totalCritiques: number;
  totalAvertissements: number;
  totalInfos: number;
}

// ─── Leads & Pipelines de prospection domain (EP-18) ─────────────────────

export interface LeadIssue {
  id: string;
  name: string;
  pipeline: string;
  pipelineLabel: string;
  stage: string;
  stageLabel: string;
  ownerId: string | null;
  createdAt: string;
  lastModifiedDate: string | null;
  ageInDays: number;
  daysInStage?: number;
  dateEnteredStage?: string | null;
  contactCount?: number;
  dealCount?: number;
  source?: string | null;
  disqualificationReason?: string | null;
}

export interface LeadBlockedGroup {
  pipelineId: string;
  pipelineLabel: string;
  stageId: string;
  stageLabel: string;
  leads: LeadIssue[];
}

export interface LeadPipelineRuleResult {
  pipelineId: string;
  pipelineLabel: string;
  triggered: boolean;
  // L-05
  totalLeads?: number;
  lastLeadCreatedAt?: string | null;
  stageCount?: number;
  // L-06
  activeStageCount?: number;
  stages?: PipelineStageInfo[];
  // L-07
  skippedRate?: number;
  leadsWithSkips?: number;
  totalAnalyzed?: number;
  topSkippedStages?: SkippedStageInfo[];
  // L-08
  nonStandardEntryRate?: number;
  nonStandardEntries?: number;
  entryDistribution?: { stageId: string; stageLabel: string; count: number }[];
  // L-09
  qualifiedStages?: { id: string; label: string; leadCount: number }[];
  disqualifiedStages?: { id: string; label: string; leadCount: number }[];
}

export interface LeadStageRuleResult {
  pipelineId: string;
  pipelineLabel: string;
  stageId: string;
  stageLabel: string;
  displayOrder: number;
  lastActivity: string | null;
}

export interface LeadDisqualificationResult {
  triggered: boolean;
  totalDisqualified: number;
  withoutReason: number;
  rate: number;
  leads: LeadIssue[];
}

export interface LeadDisqualificationPropertyResult {
  triggered: boolean;
  disabled: boolean;
  disabledReason: string | null;
  propertyName: string | null;
  propertyType: string | null;
}

export interface LeadHandoffResult {
  triggered: boolean;
  totalQualified: number;
  withoutDeal: number;
  rate: number;
  leads: LeadIssue[];
}

export interface LeadAuditResults {
  totalLeads: number;
  totalOpenLeads: number;
  totalPipelines: number;
  hasLeads: boolean;

  // Qualité données leads
  l01: LeadIssue[];                     // Lead ouvert ancien 30j+ — avertissement
  l02: LeadBlockedGroup[];              // Lead bloqué dans un stage — avertissement
  l03: LeadIssue[];                     // Lead sans propriétaire — info
  l04: LeadIssue[];                     // Lead sans contact — critique

  // Pipeline config
  l05: LeadPipelineRuleResult[];        // Pipeline sans activité — info
  l06: LeadPipelineRuleResult[];        // Pipeline trop de stages — info
  l07: LeadPipelineRuleResult[];        // Phases sautées — avertissement
  l08: LeadPipelineRuleResult[];        // Points d'entrée multiples — avertissement
  l09: LeadPipelineRuleResult[];        // Stages fermés redondants — avertissement
  l10: LeadStageRuleResult[];           // Stage sans activité 60j — info

  // Spécifiques leads
  l11: LeadDisqualificationResult;      // Disqualifié sans motif — avertissement
  l12: LeadDisqualificationPropertyResult; // Motif non structuré — info
  l13: LeadHandoffResult;               // Qualifié sans deal — critique
  l14: LeadIssue[];                     // Lead sans source — avertissement

  score: number;
  scoreLabel: string;
  totalCritiques: number;
  totalAvertissements: number;
  totalInfos: number;

  scopeError?: string | null;
}

export interface PropertyIssue {
  label: string;
  name: string;
  objectType: string;
  groupName?: string;
  description?: string;
  createdAt?: string;
  fillRate?: number;
  filledCount?: number;
  totalCount?: number;
}

export interface PropertyPair {
  a: PropertyIssue;
  b: PropertyIssue;
  similarity: number;
}

export interface TypingIssue extends PropertyIssue {
  currentType: string;
  suggestedType: string;
  reason: string;
}

export interface RateResult {
  rate: number;
  filledCount: number;
  totalCount: number;
  threshold: number;
  triggered: boolean;
}

export interface DealIssue {
  id: string;
  name: string;
  pipeline: string;
  stage: string;
  createdAt: string;
  ageInDays: number;
}

export interface PipelineStageIssue {
  pipeline: string;
  stage: string;
  missingProperties: string[];
  deals: DealIssue[];
}

export interface AuditResults {
  objectCounts: Record<string, number>; // { contacts: N, companies: N, deals: N }
  customPropertyCounts: Record<string, number>;

  // Règles propriétés custom
  p1: PropertyIssue[];
  p2: PropertyIssue[];
  p3: PropertyPair[];
  p4: PropertyIssue[];
  p5: PropertyIssue[];
  p6: TypingIssue[];

  // Règles propriétés système (P7-P11 → contacts EP-05, P12 → companies EP-05b)
  p13: RateResult;
  p14: RateResult;
  p15: DealIssue[];
  p16: PipelineStageIssue[];

  score: number;
  scoreLabel: string; // Critique | À améliorer | Bon | Excellent
  totalCritiques: number;
  totalAvertissements: number;
  totalInfos: number;
}
