// Composition: gather metrics, weight the applicable ones, produce 0..100 + grade.

import type {
  FontAccessibilityScore,
  TypefaceScore,
  ScenarioScore,
  MetricResult,
  OpenTypeFont,
  ScoreContext,
  Grade,
} from './types.js';
import { xHeightMetric } from './metrics/xHeight.js';
import { numeralsMetric } from './metrics/numerals.js';
import { scoreDisambiguation } from './metrics/disambiguation.js';
import { contrastMetric } from './contrast.js';
import { METRIC_WEIGHTS, naMetric } from './metrics/common.js';

/** Weights for the scenario score blend (typeface + contrast). Must sum to 1. */
export const SCENARIO_WEIGHTS = {
  typeface: 0.7,
  contrast: 0.3,
} as const;

export const CAVEATS: string[] = [
  'Heuristic, not a certification. The glyph-legibility metrics are informed estimates, not a validated standard.',
  'The color-contrast metric is standards-based (WCAG 2.x); the glyph metrics are not.',
  'No automated score replaces testing with real users and assistive technology.',
];

export function grade(overall: number): Grade {
  if (overall >= 85) return 'A';
  if (overall >= 70) return 'B';
  if (overall >= 55) return 'C';
  if (overall >= 40) return 'D';
  return 'F';
}

/** Weighted average of scored metrics, scaled to 0..100. */
export function composeScore(metrics: MetricResult[]): { overall: number; grade: Grade } {
  const scored = metrics.filter((m) => m.score != null && m.status !== 'na');
  const wsum = scored.reduce((s, m) => s + m.weight, 0) || 1;
  const overall = Math.round(
    (100 * scored.reduce((s, m) => s + (m.score as number) * m.weight, 0)) / wsum,
  );
  return { overall, grade: grade(overall) };
}

/**
 * Score a parsed opentype.js font. Pass colors in `ctx` to include contrast,
 * and a `rasterize` function to include character disambiguation.
 *
 * Returns a `FontAccessibilityScore` with two sub-scores:
 * - `typeface`: heuristic score over glyph properties only, independent of color.
 * - `scenario`: typeface + WCAG contrast, only present when fg/bg colors are provided.
 */
export function scoreFont(font: OpenTypeFont, ctx: ScoreContext = {}): FontAccessibilityScore {
  const typefaceMetrics: MetricResult[] = [xHeightMetric(font), numeralsMetric(font)];

  typefaceMetrics.push(
    ctx.rasterize
      ? scoreDisambiguation(font, ctx.rasterize)
      : naMetric(
          'disambiguation',
          'Character disambiguation',
          'Provide a rasterizer (canvasRasterizer from glyphcheck-score/browser) to enable this metric.',
          METRIC_WEIGHTS.disambiguation,
        ),
  );

  const { overall: typefaceOverall, grade: typefaceGrade } = composeScore(typefaceMetrics);
  const typeface: TypefaceScore = {
    overall: typefaceOverall,
    grade: typefaceGrade,
    metrics: typefaceMetrics,
  };

  const contrastResult = contrastMetric(ctx);
  let scenario: ScenarioScore | null = null;
  if (contrastResult) {
    const scenarioOverall = Math.round(
      SCENARIO_WEIGHTS.typeface * typefaceOverall +
      SCENARIO_WEIGHTS.contrast * (contrastResult.score ?? 0) * 100,
    );
    scenario = {
      overall: scenarioOverall,
      grade: grade(scenarioOverall),
      contrast: contrastResult,
    };
  }

  return { typeface, scenario, caveats: CAVEATS };
}
