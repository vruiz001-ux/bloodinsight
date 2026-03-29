import type { BiomarkerKnowledge } from './types';
import { cbcBiomarkers } from './cbc';
import { ironBiomarkers } from './iron';
import { metabolicBiomarkers } from './metabolic';
import { kidneyBiomarkers } from './kidney';
import { liverBiomarkers } from './liver';
import { lipidBiomarkers } from './lipids';
import { thyroidBiomarkers } from './thyroid';
import { inflammationBiomarkers } from './inflammation';
import { vitaminBiomarkers } from './vitamins';
import { electrolyteBiomarkers } from './electrolytes';
import { proteinBiomarkers } from './proteins';
import { hormoneBiomarkers } from './hormones';

// Re-export types
export type {
  BiomarkerKnowledge,
  ReferenceRange,
  RedFlagThreshold,
  ClinicalPattern,
  StatusLevel,
  Sex,
  Severity,
  BiomarkerCategory,
} from './types';

// Re-export module arrays for direct access
export { cbcBiomarkers } from './cbc';
export { ironBiomarkers } from './iron';
export { metabolicBiomarkers } from './metabolic';
export { kidneyBiomarkers } from './kidney';
export { liverBiomarkers } from './liver';
export { lipidBiomarkers } from './lipids';
export { thyroidBiomarkers } from './thyroid';
export { inflammationBiomarkers } from './inflammation';
export { vitaminBiomarkers } from './vitamins';
export { electrolyteBiomarkers } from './electrolytes';
export { proteinBiomarkers } from './proteins';
export { hormoneBiomarkers } from './hormones';

// --------------------------------------------------------------------------
// Master registry: Map<code, BiomarkerKnowledge>
// --------------------------------------------------------------------------

const allBiomarkerArrays: BiomarkerKnowledge[][] = [
  cbcBiomarkers,
  ironBiomarkers,
  metabolicBiomarkers,
  kidneyBiomarkers,
  liverBiomarkers,
  lipidBiomarkers,
  thyroidBiomarkers,
  inflammationBiomarkers,
  vitaminBiomarkers,
  electrolyteBiomarkers,
  proteinBiomarkers,
  hormoneBiomarkers,
];

/**
 * Primary lookup map: biomarker code -> BiomarkerKnowledge
 * Codes are stored in uppercase for consistent lookup.
 */
export const biomarkersByCode: Map<string, BiomarkerKnowledge> = new Map();

/**
 * Alias lookup map: alias (lowercase) -> biomarker code (uppercase)
 * Includes the canonical name and all aliases.
 */
const aliasToCode: Map<string, string> = new Map();

// Build both maps
for (const arr of allBiomarkerArrays) {
  for (const bm of arr) {
    const code = bm.code.toUpperCase();
    biomarkersByCode.set(code, bm);

    // Register canonical name and code as aliases
    aliasToCode.set(code.toLowerCase(), code);
    aliasToCode.set(bm.name.toLowerCase(), code);

    // Register all declared aliases
    for (const alias of bm.aliases) {
      aliasToCode.set(alias.toLowerCase(), code);
    }
  }
}

// --------------------------------------------------------------------------
// Helper functions
// --------------------------------------------------------------------------

/**
 * Look up a biomarker by its canonical code (case-insensitive).
 */
export function getBiomarkerByCode(code: string): BiomarkerKnowledge | undefined {
  return biomarkersByCode.get(code.toUpperCase());
}

/**
 * Look up a biomarker by any known alias, name, or code (case-insensitive).
 * Returns undefined if no match is found.
 */
export function getBiomarkerByAlias(alias: string): BiomarkerKnowledge | undefined {
  const code = aliasToCode.get(alias.toLowerCase());
  if (!code) return undefined;
  return biomarkersByCode.get(code);
}

/**
 * Search biomarkers by partial name or alias match.
 * Returns all biomarkers whose name, code, or any alias contains the query string.
 */
export function searchBiomarkers(query: string): BiomarkerKnowledge[] {
  const q = query.toLowerCase();
  const results: BiomarkerKnowledge[] = [];
  const seen = new Set<string>();

  for (const bm of biomarkersByCode.values()) {
    if (seen.has(bm.code)) continue;

    const matches =
      bm.code.toLowerCase().includes(q) ||
      bm.name.toLowerCase().includes(q) ||
      bm.aliases.some((a) => a.toLowerCase().includes(q));

    if (matches) {
      results.push(bm);
      seen.add(bm.code);
    }
  }

  return results;
}

/**
 * Get all biomarkers in a given category.
 */
export function getBiomarkersByCategory(category: string): BiomarkerKnowledge[] {
  return Array.from(biomarkersByCode.values()).filter(
    (bm) => bm.category === category
  );
}

/**
 * Get all registered biomarker codes.
 */
export function getAllBiomarkerCodes(): string[] {
  return Array.from(biomarkersByCode.keys());
}

/**
 * Get all biomarkers as a flat array.
 */
export function getAllBiomarkers(): BiomarkerKnowledge[] {
  return Array.from(biomarkersByCode.values());
}

/**
 * Total count of registered biomarkers.
 */
export const BIOMARKER_COUNT = biomarkersByCode.size;
