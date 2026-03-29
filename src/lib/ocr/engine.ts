// OCR abstraction layer
// MVP: mock engine. Swap in Tesseract.js or cloud OCR via the OcrEngine interface.

export interface OcrBlock {
  text: string;
  bbox: { x: number; y: number; width: number; height: number };
  confidence: number;
}

export interface OcrResult {
  text: string;
  confidence: number;
  blocks: OcrBlock[];
}

/**
 * Abstract OCR engine interface.
 * Implement this to plug in Tesseract.js, Google Vision, AWS Textract, etc.
 */
export interface OcrEngine {
  name: string;
  recognize(imageBuffer: Buffer | ArrayBuffer): Promise<OcrResult>;
}

// ── Mock OCR engine for demo/testing ─────────────────────────────────────

/**
 * Demo OCR engine that returns pre-defined text.
 * Used for development and testing without requiring actual OCR infrastructure.
 */
export class MockOcrEngine implements OcrEngine {
  name = 'mock';

  private mockText: string;

  constructor(mockText?: string) {
    this.mockText = mockText ?? DEFAULT_MOCK_TEXT;
  }

  setMockText(text: string): void {
    this.mockText = text;
  }

  async recognize(_imageBuffer: Buffer | ArrayBuffer): Promise<OcrResult> {
    const lines = this.mockText.split('\n').filter((l) => l.trim().length > 0);
    const blocks: OcrBlock[] = lines.map((line, index) => ({
      text: line,
      bbox: { x: 0, y: index * 20, width: 600, height: 18 },
      confidence: 0.95,
    }));

    return {
      text: this.mockText,
      confidence: 0.95,
      blocks,
    };
  }
}

const DEFAULT_MOCK_TEXT = `
HealthFirst Lab - Complete Blood Panel
Patient: Sarah Johnson
Date: 03/15/2024
Sex: Female  Age: 35

Test                    Result    Units       Reference Range    Flag
WBC                     6.2       10^3/uL     4.0-11.0
RBC                     4.1       10^6/uL     3.8-5.1
Hemoglobin              11.2      g/dL        12.0-16.0          L
Hematocrit              34.5      %           36.0-46.0          L
MCV                     84        fL          80-100
Platelets               245       10^3/uL     150-400
Ferritin                15        ng/mL       15-200
Iron                    45        ug/dL       60-170             L
TIBC                    420       ug/dL       250-400            H
Transferrin Sat         11        %           20-50              L
Glucose, Fasting        95        mg/dL       70-99
HbA1c                   5.8       %           4.0-5.6            H
Total Cholesterol       235       mg/dL       <200               H
LDL Cholesterol         165       mg/dL       <100               H
HDL Cholesterol         48        mg/dL       >50                L
Triglycerides           220       mg/dL       <150               H
AST                     22        U/L         10-40
ALT                     19        U/L         7-56
Alk Phos                65        U/L         44-147
GGT                     18        U/L         9-48
Creatinine              0.8       mg/dL       0.6-1.2
BUN                     14        mg/dL       7-20
eGFR                    95        mL/min      >60
TSH                     2.1       mIU/L       0.4-4.0
Free T4                 1.2       ng/dL       0.8-1.8
CRP                     4.5       mg/L        <3.0               H
ESR                     18        mm/hr       0-20
Vitamin D               18        ng/mL       30-100             L
Vitamin B12             450       pg/mL       200-900
Folate                  12        ng/mL       3.0-20.0
Sodium                  140       mmol/L      136-145
Potassium               4.2       mmol/L      3.5-5.0
Calcium                 9.4       mg/dL       8.5-10.5
`.trim();

// ── Engine registry ──────────────────────────────────────────────────────

let currentEngine: OcrEngine = new MockOcrEngine();

/**
 * Get the currently active OCR engine.
 */
export function getOcrEngine(): OcrEngine {
  return currentEngine;
}

/**
 * Set the active OCR engine (e.g., swap in Tesseract.js at runtime).
 */
export function setOcrEngine(engine: OcrEngine): void {
  currentEngine = engine;
}
