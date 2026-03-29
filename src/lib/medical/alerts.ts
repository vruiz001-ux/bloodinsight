// Urgent alert detection engine

import type {
  BiomarkerKnowledge,
  Severity,
} from './knowledge/types';
import { BIOMARKER_KNOWLEDGE } from './knowledge/biomarkers';

export interface Alert {
  biomarkerCode: string;
  biomarkerName: string;
  severity: Severity;
  value: number;
  unit: string;
  threshold: number;
  direction: 'high' | 'low';
  message: string;
  action: string;
}

/**
 * Check a single biomarker value against its red flag thresholds.
 * Returns all alerts that are triggered (a value can trigger multiple thresholds).
 */
export function checkAlerts(
  value: number,
  unit: string,
  biomarker: BiomarkerKnowledge
): Alert[] {
  const alerts: Alert[] = [];

  for (const flag of biomarker.redFlagThresholds) {
    let triggered = false;

    if (flag.direction === 'high' && value >= flag.value) {
      triggered = true;
    }
    if (flag.direction === 'low' && value <= flag.value) {
      triggered = true;
    }

    if (triggered) {
      alerts.push({
        biomarkerCode: biomarker.code,
        biomarkerName: biomarker.name,
        severity: flag.severity,
        value,
        unit,
        threshold: flag.value,
        direction: flag.direction,
        message: flag.message,
        action: flag.action,
      });
    }
  }

  // Sort by severity: critical first, then warning, then info
  const severityOrder: Record<Severity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}

/**
 * Check a batch of biomarker results for critical alerts.
 * Looks up each code in the knowledge base and evaluates red flags.
 */
export function checkCriticalAlerts(
  results: Array<{ code: string; value: number; unit: string }>
): Alert[] {
  const allAlerts: Alert[] = [];

  for (const result of results) {
    const biomarker = BIOMARKER_KNOWLEDGE.get(result.code);
    if (!biomarker) continue;

    const alerts = checkAlerts(result.value, result.unit, biomarker);
    allAlerts.push(...alerts);
  }

  // Sort by severity: critical first
  const severityOrder: Record<Severity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };
  allAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return allAlerts;
}
