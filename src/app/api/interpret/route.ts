// POST /api/interpret — Run interpretation engine on extracted biomarkers
// Accepts JSON { reportId }

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getBiomarkerByCode } from '@/lib/medical/knowledge';
import { evaluateAgainstRange } from '@/lib/medical/ranges';
import { checkAlerts } from '@/lib/medical/alerts';
import { detectPatterns } from '@/lib/medical/patterns';
import { interpretBiomarker } from '@/lib/medical/interpreter';
import type { StatusLevel, Sex } from '@/lib/medical/knowledge/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId } = body;

    if (!reportId) {
      return Response.json(
        { error: 'Missing required field: reportId' },
        { status: 400 }
      );
    }

    // Fetch report with biomarkers and user info
    const report = await prisma.labReport.findUnique({
      where: { id: reportId },
      include: {
        biomarkers: true,
        user: true,
      },
    });

    if (!report) {
      return Response.json(
        { error: `Report not found: ${reportId}` },
        { status: 404 }
      );
    }

    if (report.biomarkers.length === 0) {
      return Response.json(
        { error: 'No biomarkers found for this report. Run /api/parse first.' },
        { status: 400 }
      );
    }

    // Determine patient sex and age
    const sex: Sex = (report.user.sex as Sex) ?? 'female';
    const age = report.user.dateOfBirth
      ? Math.floor(
          (Date.now() - new Date(report.user.dateOfBirth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : undefined;

    // Process each biomarker
    const allAlerts: Array<{
      biomarkerCode: string;
      severity: string;
      value: number;
      unit: string;
      message: string;
      action: string;
    }> = [];

    const rangeResults: Array<{
      code: string;
      value: number;
      unit: string;
      status: StatusLevel;
    }> = [];

    const interpretations: Array<{
      biomarkerId: string;
      code: string;
      summary: string;
      explanation: string;
      significance: string;
      lifestyleActions: string[];
      followUp: string[];
    }> = [];

    for (const bm of report.biomarkers) {
      if (!bm.normalizedCode || bm.normalizedValue === null || !bm.normalizedUnit) {
        continue;
      }

      const knowledge = getBiomarkerByCode(bm.normalizedCode);
      if (!knowledge) continue;

      // 1. Evaluate against reference range
      const reportRange =
        bm.rawRange
          ? parseReportRange(bm.rawRange)
          : undefined;

      const rangeResult = evaluateAgainstRange(
        bm.normalizedValue,
        bm.normalizedUnit,
        knowledge,
        sex,
        age,
        reportRange
      );

      // Update status level on the biomarker
      await prisma.extractedBiomarker.update({
        where: { id: bm.id },
        data: { statusLevel: rangeResult.status },
      });

      rangeResults.push({
        code: bm.normalizedCode,
        value: bm.normalizedValue,
        unit: bm.normalizedUnit,
        status: rangeResult.status,
      });

      // 2. Check alerts
      const alerts = checkAlerts(bm.normalizedValue, bm.normalizedUnit, knowledge);
      for (const alert of alerts) {
        allAlerts.push({
          biomarkerCode: alert.biomarkerCode,
          severity: alert.severity,
          value: alert.value,
          unit: alert.unit,
          message: alert.message,
          action: alert.action,
        });
      }

      // 3. Generate interpretation
      const interp = interpretBiomarker(
        bm.normalizedCode,
        bm.normalizedValue,
        bm.normalizedUnit,
        rangeResult.status,
        sex
      );

      interpretations.push({
        biomarkerId: bm.id,
        code: bm.normalizedCode,
        summary: interp.summary,
        explanation: interp.explanation,
        significance: interp.significance,
        lifestyleActions: interp.lifestyleActions,
        followUp: interp.followUpSuggestions,
      });
    }

    // 4. Detect clinical patterns
    const patterns = detectPatterns(rangeResults);

    // 5. Store alerts in database
    if (allAlerts.length > 0) {
      await prisma.alert.createMany({
        data: allAlerts.map((a) => ({
          reportId,
          biomarkerCode: a.biomarkerCode,
          severity: a.severity,
          value: a.value,
          unit: a.unit,
          message: a.message,
          action: a.action,
        })),
      });
    }

    // 6. Store patterns in database
    if (patterns.length > 0) {
      await prisma.clinicalPattern.createMany({
        data: patterns.map((p) => ({
          reportId,
          patternType: p.id,
          description: p.description,
          confidence: p.confidence,
          biomarkerCodes: JSON.stringify(p.matchedBiomarkers),
        })),
      });
    }

    // 7. Store interpretations in database
    for (const interp of interpretations) {
      await prisma.interpretation.create({
        data: {
          biomarkerId: interp.biomarkerId,
          summary: interp.summary,
          explanation: interp.explanation,
          significance: interp.significance,
          lifestyleActions: JSON.stringify(interp.lifestyleActions),
          followUp: JSON.stringify(interp.followUp),
        },
      });
    }

    // 8. Update report status
    await prisma.labReport.update({
      where: { id: reportId },
      data: { status: 'interpreted' },
    });

    // Build summary counts
    const urgentCount = rangeResults.filter((r) => r.status === 'urgent').length;
    const abnormalCount = rangeResults.filter((r) => r.status === 'abnormal').length;
    const borderlineCount = rangeResults.filter((r) => r.status === 'borderline').length;
    const normalCount = rangeResults.filter((r) => r.status === 'normal').length;

    return Response.json({
      reportId,
      status: 'interpreted',
      summary: {
        totalBiomarkers: rangeResults.length,
        normalCount,
        borderlineCount,
        abnormalCount,
        urgentCount,
        alertCount: allAlerts.length,
        patternCount: patterns.length,
      },
      alerts: allAlerts,
      patterns: patterns.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        confidence: p.confidence,
        matchedBiomarkers: p.matchedBiomarkers,
        interpretation: p.interpretation,
      })),
      interpretations: interpretations.map((i) => ({
        biomarkerId: i.biomarkerId,
        code: i.code,
        summary: i.summary,
        explanation: i.explanation,
        significance: i.significance,
        lifestyleActions: i.lifestyleActions,
        followUp: i.followUp,
      })),
    });
  } catch (error) {
    console.error('Interpretation error:', error);
    return Response.json(
      { error: 'Failed to interpret report.' },
      { status: 500 }
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

function parseReportRange(
  rangeStr: string
): { min: number | null; max: number | null } | undefined {
  // "12.0-16.0"
  const dashMatch = rangeStr.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
  if (dashMatch) {
    return {
      min: parseFloat(dashMatch[1]),
      max: parseFloat(dashMatch[2]),
    };
  }

  // "<200"
  const lessThan = rangeStr.match(/[<≤]\s*=?\s*(\d+\.?\d*)/);
  if (lessThan) {
    return { min: null, max: parseFloat(lessThan[1]) };
  }

  // ">60"
  const greaterThan = rangeStr.match(/[>≥]\s*=?\s*(\d+\.?\d*)/);
  if (greaterThan) {
    return { min: parseFloat(greaterThan[1]), max: null };
  }

  return undefined;
}
