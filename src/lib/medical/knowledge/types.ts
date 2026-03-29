// Medical knowledge base type definitions

export type StatusLevel = 'normal' | 'borderline' | 'abnormal' | 'urgent';
export type Sex = 'male' | 'female' | 'any';
export type Severity = 'info' | 'warning' | 'critical';

export type BiomarkerCategory =
  | 'hematology'
  | 'metabolic'
  | 'lipid'
  | 'liver'
  | 'kidney'
  | 'thyroid'
  | 'vitamin'
  | 'mineral'
  | 'inflammation'
  | 'hormone'
  | 'cardiac'
  | 'iron'
  | 'electrolyte'
  | 'protein'
  | 'other';

export interface ReferenceRange {
  sex: Sex;
  min: number | null;
  max: number | null;
  unit: string;
  ageMin?: number;
  ageMax?: number;
  source: string;
  pregnancyCaveat?: string;
}

export interface RedFlagThreshold {
  direction: 'high' | 'low';
  value: number;
  unit: string;
  severity: Severity;
  message: string;
  action: string;
}

export interface BiomarkerKnowledge {
  code: string;
  name: string;
  aliases: string[];
  category: BiomarkerCategory;
  specimenType: string;
  defaultUnit: string;
  alternativeUnits?: string[];
  referenceRanges: ReferenceRange[];
  redFlagThresholds: RedFlagThreshold[];
  whatItMeasures: string;
  whatResultMayMean: { high: string; low: string };
  commonNonDangerousReasons: { high: string[]; low: string[] };
  whenItMatters: string;
  dailyLifeActions: { high: string[]; low: string[] };
  whenToSeeDoctor: { high: string; low: string };
  preAnalyticalConfounders: string[];
  medicationsAffecting: string[];
  relatedBiomarkers: string[];
  evidenceTier: 1 | 2 | 3;
  lastReviewed: string;
}

export interface ClinicalPattern {
  id: string;
  name: string;
  description: string;
  requiredBiomarkers: { code: string; direction: 'high' | 'low' | 'any' }[];
  optionalBiomarkers: { code: string; direction: 'high' | 'low' | 'any' }[];
  interpretation: string;
  uncertainty: string;
  confounders: string[];
  nextStepQuestions: string[];
  clinicianDiscussionPoints: string[];
}

// Backward-compatible aliases
export type PatternDefinition = ClinicalPattern;
export interface PatternCriterion {
  code: string;
  condition: 'low' | 'high' | 'abnormal';
}
