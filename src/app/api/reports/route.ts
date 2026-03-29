// POST /api/reports — Upload a lab report
// Accepts multipart form data with a file upload or a demo report ID

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? '';

    let fileName: string;
    let fileType: string;
    let labName: string | null = null;
    let reportDate: Date | null = null;
    let userId: string;
    let isDemoReport = false;
    let demoReportId: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      // Real file upload
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      userId = (formData.get('userId') as string) ?? 'demo-user';

      if (!file) {
        return Response.json(
          { error: 'No file provided. Include a "file" field in the form data.' },
          { status: 400 }
        );
      }

      fileName = file.name;
      fileType = file.type.includes('pdf') ? 'pdf' : 'image';

      // For MVP, we don't store the actual file — just the reference.
      // In production, upload to S3/R2 and store the URL.
    } else {
      // JSON body — used for demo reports
      const body = await request.json();
      userId = body.userId ?? 'demo-user';
      fileName = body.fileName ?? 'demo-report.pdf';
      fileType = body.fileType ?? 'pdf';
      labName = body.labName ?? null;
      reportDate = body.reportDate ? new Date(body.reportDate) : null;
      isDemoReport = body.isDemoReport ?? false;
      demoReportId = body.demoReportId ?? null;
    }

    // Ensure the user exists (create a demo user if needed)
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      // For demo, auto-create user. In production, require auth.
      user = await prisma.user.upsert({
        where: { email: `${userId}@demo.bloodinsight.app` },
        update: {},
        create: {
          id: userId,
          email: `${userId}@demo.bloodinsight.app`,
          name: 'Demo User',
        },
      });
    }

    // Create the report record
    const report = await prisma.labReport.create({
      data: {
        userId: user.id,
        fileName,
        fileType,
        labName,
        reportDate,
        status: 'uploading',
      },
    });

    return Response.json(
      {
        reportId: report.id,
        fileName: report.fileName,
        status: report.status,
        isDemoReport,
        demoReportId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Report upload error:', error);
    return Response.json(
      { error: 'Failed to create report record.' },
      { status: 500 }
    );
  }
}
