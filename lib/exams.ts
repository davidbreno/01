import { prisma } from '@/lib/prisma';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { promises as fs } from 'fs';

export const referenceRanges: Record<string, { min: number; max: number; unit: string }> = {
  Hemoglobina: { min: 13.5, max: 17.5, unit: 'g/dL' },
  Hematócrito: { min: 38, max: 52, unit: '%' },
  Leucócitos: { min: 4000, max: 11000, unit: '/mm3' },
  Glicemia: { min: 70, max: 99, unit: 'mg/dL' },
  'TGO/AST': { min: 5, max: 40, unit: 'U/L' },
  'TGP/ALT': { min: 5, max: 40, unit: 'U/L' },
  Creatinina: { min: 0.7, max: 1.3, unit: 'mg/dL' },
  'Colesterol Total': { min: 0, max: 200, unit: 'mg/dL' },
  HDL: { min: 40, max: 60, unit: 'mg/dL' },
  LDL: { min: 0, max: 130, unit: 'mg/dL' },
  Triglicerídeos: { min: 0, max: 150, unit: 'mg/dL' },
  TSH: { min: 0.4, max: 4.5, unit: 'uUI/mL' }
};

export async function extractTextFromFile(path: string, mimetype: string) {
  if (mimetype === 'application/pdf') {
    const buffer = await fs.readFile(path);
    const parsed = await pdfParse(buffer);
    return parsed.text;
  }
  if (['image/png', 'image/jpeg'].includes(mimetype) && process.env.ENABLE_OCR === 'true') {
    const result = await Tesseract.recognize(path, 'por');
    return result.data.text;
  }
  return '';
}

const markerRegex = new RegExp(
  Object.keys(referenceRanges)
    .map((marker) => marker.replace('/', '\\/'))
    .join('|'),
  'gi'
);

export function parseExamText(text: string) {
  const results: Array<{
    marker: string;
    value: number;
    unit: string;
    referenceMin: number;
    referenceMax: number;
    isOutOfRange: boolean;
  }> = [];

  const lines = text.split(/\n|\r/).map((line) => line.trim());
  for (const line of lines) {
    const match = line.match(markerRegex);
    if (!match) continue;
    const marker = match[0];
    const range = referenceRanges[marker];
    const valueMatch = line.match(/([0-9]+[,\.][0-9]+|[0-9]+)/);
    if (!valueMatch) continue;
    const value = Number(valueMatch[0].replace(',', '.'));
    const isOutOfRange = value < range.min || value > range.max;
    results.push({
      marker,
      value,
      unit: range.unit,
      referenceMin: range.min,
      referenceMax: range.max,
      isOutOfRange
    });
  }

  return results;
}

export async function saveExamResults(examFileId: string, text: string) {
  const parsed = parseExamText(text);
  await prisma.examResult.deleteMany({ where: { examFileId } });
  await prisma.examResult.createMany({
    data: parsed.map((item) => ({
      examFileId,
      marker: item.marker,
      value: item.value,
      unit: item.unit,
      referenceMin: item.referenceMin,
      referenceMax: item.referenceMax,
      isOutOfRange: item.isOutOfRange
    }))
  });
  return parsed;
}
