// Character disambiguation: how visually different are commonly-confused
// glyphs? We rasterize each glyph into a normalized box and measure the
// difference between pairs. Higher difference = easier to tell apart. HEURISTIC.
//
// Requires a GlyphRasterizer (canvas-based in the browser). The pure math here
// (glyphDifference) is unit-testable without a font.

import type { OpenTypeFont, Bitmap, GlyphRasterizer, MetricResult } from '../types.js';
import { METRIC_WEIGHTS, naMetric, scoreToStatus } from './common.js';

export const CONFUSABLE_GROUPS: string[][] = [
  ['I', 'l', '1'],
  ['O', '0', 'o'],
  ['B', '8'],
  ['S', '5'],
  ['G', '6'],
  ['Z', '2'],
  ['b', 'd'],
  ['p', 'q'],
  ['c', 'e'],
  // Multi-glyph string pairs: rendered as strings and compared as bitmaps.
  ['rn', 'm'],
  ['cl', 'd'],
  ['vv', 'w'],
];

/**
 * Difference between two coverage bitmaps of equal size: differing coverage as a
 * fraction of combined coverage. 0 = identical, 1 = fully disjoint.
 */
export function glyphDifference(a: Bitmap, b: Bitmap): number {
  if (a.size !== b.size) throw new Error('Bitmaps must be the same size');
  let diff = 0;
  let union = 0;
  for (let i = 0; i < a.data.length; i++) {
    const av = a.data[i];
    const bv = b.data[i];
    diff += Math.abs(av - bv);
    union += Math.max(av, bv);
  }
  return union > 0 ? diff / union : 0;
}

function diffToScore(worst: number, mean: number): number {
  // The worst-confused pair should weigh heavily: a font is only as legible as
  // its most confusable pair. Blend worst and mean, then expand the useful range.
  const blended = 0.6 * worst + 0.4 * mean;
  return Math.max(0, Math.min(1, blended * 1.6));
}

/** Multiple sizes guard against hinting/anti-aliasing artifacts at any single size. */
const RASTER_SIZES = [12, 16, 32, 64];

export function scoreDisambiguation(
  font: OpenTypeFont,
  rasterize: GlyphRasterizer,
  groups: string[][] = CONFUSABLE_GROUPS,
  sizes: number[] = RASTER_SIZES,
): MetricResult {
  const cache = new Map<string, Bitmap | null>();
  const raster = (ch: string, size: number): Bitmap | null => {
    const key = `${ch}:${size}`;
    if (!cache.has(key)) cache.set(key, rasterize(font, ch, size));
    return cache.get(key) ?? null;
  };

  // For each pair, take the worst (lowest) difference across all sizes.
  // A pair that's confusable at any tested size counts as confusable.
  const pairDiffs: { pair: string; diff: number }[] = [];
  for (const group of groups) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        let worstDiff = Infinity;
        for (const size of sizes) {
          const a = raster(group[i], size);
          const b = raster(group[j], size);
          if (a && b) worstDiff = Math.min(worstDiff, glyphDifference(a, b));
        }
        if (worstDiff < Infinity)
          pairDiffs.push({ pair: `${group[i]}/${group[j]}`, diff: worstDiff });
      }
    }
  }

  if (pairDiffs.length === 0) {
    return naMetric(
      'disambiguation',
      'Character disambiguation',
      'No confusable glyphs could be rasterized for this font.',
      METRIC_WEIGHTS.disambiguation,
    );
  }

  const diffs = pairDiffs.map((p) => p.diff);
  const mean = diffs.reduce((s, d) => s + d, 0) / diffs.length;
  const worstPair = pairDiffs.reduce((w, p) => (p.diff < w.diff ? p : w));
  const score = diffToScore(worstPair.diff, mean);
  const status = scoreToStatus(score);

  return {
    id: 'disambiguation',
    label: 'Character disambiguation',
    value: Number(mean.toFixed(3)),
    score,
    weight: METRIC_WEIGHTS.disambiguation,
    status,
    detail:
      `Most confusable pair: ${worstPair.pair} (difference ${worstPair.diff.toFixed(2)}). ` +
      `Mean difference across ${pairDiffs.length} pairs: ${mean.toFixed(2)}. Higher is better. ` +
      `Tested at ${sizes.join(', ')}px.`,
  };
}
