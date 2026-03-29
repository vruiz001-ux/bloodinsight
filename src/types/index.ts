// Shared TypeScript types for BloodInsight

import type { StatusLevel, Severity, Sex } from '@/lib/medical/knowledge/types';

// ── User ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string | null;
  sex: Sex | null;
  dateOfBirth: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Lab Reports ───────────────────────────────────────────────────────────

export type ReportStatus = 'uploading' | 'processing' | 'extracted' | 'interpreted' | 'error';

export interface LabReport {
  id: string;
  userId: string;
  uploadDate: Date;
  labName: string | null;
  reportDate: Date | null;
  fileName: string;
  fileType: string;
  status: ReportStatus;
  createdAt: Date;
}

// ── Extracted Biomarkers ──────────────────────────────────────────────────

export interface ExtractedBiomarker {
  id: string;
  reportId: string;
  rawName: string;
  rawValue: string;
  rawUnit: string | null;
  rawRange: string | null;
  rawFlag: string | null;
  confidence: number;
  normalizedCode: string | null;
  normalizedValue: number | null;
  normalizedUnit: string | null;
  statusLevel: StatusLevel | null;
  userCorrected: boolean;
}

// ── Interpretation ────────────────────────────────────────────────────────

export interface InterpretationRecord {
  id: string;
  biomarkerId: string;
  summary: string;
  explanation: string;
  significance: string;
  lifestyleActions: string[];
  followUp: string[];
  version: number;
  createdAt: Date;
}

// ── Alert ─────────────────────────────────────────────────────────────────

export interface AlertRecord {
  id: string;
  reportId: string;
  biomarkerCode: string;
  severity: Severity;
  value: number;
  unit: string;
  message: string;
  action: string;
  createdAt: Date;
}

// ── Clinical Pattern ──────────────────────────────────────────────────────

export interface ClinicalPatternRecord {
  id: string;
  reportId: string;
  patternType: string;
  description: string;
  confidence: number;
  biomarkerCodes: string[];
  createdAt: Date;
}

// ── Audit Log ─────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  details: string | null;
  createdAt: Date;
}

// ── Upload & Pipeline ─────────────────────────────────────────────────────

export interface UploadResult {
  reportId: string;
  fileName: string;
  status: ReportStatus;
}

export interface ExtractionResult {
  reportId: string;
  biomarkers: ExtractedBiomarker[];
  overallConfidence: number;
  warnings: string[];
}

export interface PipelineResult {
  reportId: string;
  extraction: ExtractionResult;
  alerts: AlertRecord[];
  patterns: ClinicalPatternRecord[];
  interpretations: Map<string, InterpretationRecord>;
}

// ── UI-specific ───────────────────────────────────────────────────────────

export interface BiomarkerDisplayCard {
  code: string;
  name: string;
  value: number;
  unit: string;
  status: StatusLevel;
  rangeMin: number | null;
  rangeMax: number | null;
  percentageFromMidpoint: number;
  interpretation: string | null;
}

export interface DashboardSummary {
  totalBiomarkers: number;
  normalCount: number;
  borderlineCount: number;
  abnormalCount: number;
  urgentCount: number;
  alertCount: number;
  patternCount: number;
}
