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

export interface GlobalAuditResults {
  propertyResults: AuditResults;
  workflowResults: WorkflowAuditResults | null;
  contactResults: ContactAuditResults | null;
  companyResults: CompanyAuditResults | null;
  globalScore: number;
  globalScoreLabel: string;
  propertyWeight: number;
  workflowWeight: number;
  contactWeight: number;
  companyWeight: number;
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
