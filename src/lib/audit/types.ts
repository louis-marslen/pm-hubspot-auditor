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

  // Règles propriétés système
  p7: RateResult;
  p8: { count: number; examples: { id: string; createdAt: string }[] };
  p9: RateResult;
  p10a: { count: number; examples: unknown[] };
  p10b: { count: number };
  p10c: { triggered: boolean };
  p10d: { count: number };
  p11: RateResult | null; // null = workspace B2C (aucune company)
  p12: RateResult;
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
