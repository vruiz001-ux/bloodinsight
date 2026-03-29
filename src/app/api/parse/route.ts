// POST /api/parse — Run OCR + parse + normalize pipeline on a report
// Accepts JSON { reportId, demoReportId? }

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getOcrEngine } from '@/lib/ocr/engine';
import { parseReport } from '@/lib/ocr/parser';
import { normalizeReport, type NormalizedBiomarker } from '@/lib/ocr/normalizer';
import { getDemoReport } from '@/lib/ocr/demo-reports';
import { calculateConfidence } from '@/lib/utils/confidence';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, demoReportId } = body;

    if (!reportId) {
      return Response.json(
        { error: 'Missing required field: reportId' },
        { status: 400 }
      );
    }

    // Verify the report exists
    const report = await prisma.labReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return Response.json(
        { error: `Report not found: ${reportId}` },
        { status: 404 }
      );
    }

    // Update status to processing
    await prisma.labReport.update({
      where: { id: reportId },
      data: { status: 'processing' },
    });

    let normalizedBiomarkers: NormalizedBiomarker[];
    let overallConfidence: number;
    let warnings: string[] = [];
    let labName: string | null = report.labName;
    let reportDate: Date | null = report.reportDate;

    if (demoReportId) {
      // Use pre-extracted demo data
      const demoReport = getDemoReport(demoReportId);
      if (!demoReport) {
        return Response.json(
          { error: `Demo report not found: ${demoReportId}` },
          { status: 404 }
        );
      }

      normalizedBiomarkers = demoReport.biomarkers;
      overallConfidence = 0.95;
      labName = demoReport.metadata.labName;
      reportDate = new Date(demoReport.metadata.reportDate);
    } else {
      // Run the full OCR -> parse -> normalize pipeline
      const engine = getOcrEngine();

      // In a real implementation, we'd read the file from storage.
      // For MVP, the mock engine returns pre-defined text.
      const ocrResult = await engine.recognize(Buffer.from(''));

      // Parse the OCR text
      const parseResult = parseReport(ocrResult.text);
      warnings.push(...parseResult.warnings);

      // Normalize the parsed rows
      const normResult = normalizeReport(parseResult.rows, parseResult.metadata);
      normalizedBiomarkers = normResult.biomarkers;
      overallConfidence = normResult.overallConfidence;
      warnings.push(...normResult.warnings);

      // Update report metadata from OCR if available
      if (parseResult.metadata.labName) {
        labName = parseResult.metadata.labName;
      }
      if (parseResult.metadata.reportDate) {
        reportDate = new Date(parseResult.metadata.reportDate);
      }
    }

    // Store extracted biomarkers in the database
    const createdBiomarkers = await Promise.all(
      normalizedBiomarkers.map(async (bm) => {
        // Calculate detailed confidence using the confidence module
        const confidenceBreakdown = calculateConfidence({
          rawName: bm.rawName,
          rawValue: bm.rawValue,
          rawUnit: bm.rawUnit,
          rawRange: bm.rawRange,
          rawFlag: bm.rawFlag,
          normalizedCode: bm.normalizedCode,
          normalizedValue: bm.normalizedValue,
          normalizedUnit: bm.normalizedUnit,
        });

        return prisma.extractedBiomarker.create({
          data: {
            reportId,
            rawName: bm.rawName,
            rawValue: bm.rawValue,
            rawUnit: bm.rawUnit,
            rawRange: bm.rawRange,
            rawFlag: bm.rawFlag,
            confidence: confidenceBreakdown.overall,
            normalizedCode: bm.normalizedCode,
            normalizedValue: bm.normalizedValue,
            normalizedUnit: bm.normalizedUnit,
            statusLevel: null, // Will be set during interpretation
            userCorrected: false,
          },
        });
      })
    );

    // Update report with metadata and status
    await prisma.labReport.update({
      where: { id: reportId },
      data: {
        status: 'extracted',
        labName,
        reportDate,
      },
    });

    return Response.json({
      reportId,
      status: 'extracted',
      biomarkerCount: createdBiomarkers.length,
      overallConfidence,
      warnings,
      biomarkers: createdBiomarkers.map((b) => ({
        id: b.id,
        rawName: b.rawName,
        rawValue: b.rawValue,
        rawUnit: b.rawUnit,
        rawRange: b.rawRange,
        rawFlag: b.rawFlag,
        normalizedCode: b.normalizedCode,
        normalizedValue: b.normalizedValue,
        normalizedUnit: b.normalizedUnit,
        confidence: b.confidence,
      })),
    });
  } catch (error) {
    console.error('Parse pipeline error:', error);
    return Response.json(
      { error: 'Failed to parse report.' },
      { status: 500 }
    );
  }
}
