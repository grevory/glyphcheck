import * as opentype from 'opentype.js';
import { scoreFont } from '@glyphcheck/score';
import { canvasRasterizer } from '@glyphcheck/score/browser';
import type { FontMetrics, FontFeatures } from '../data/fonts';

async function resolveWoffUrl(family: string): Promise<string> {
  const slug = family.toLowerCase().replace(/\s+/g, '+');
  const css = await fetch(`https://fonts.bunny.net/css?family=${slug}:400&display=swap`).then((r) => r.text());
  // Prefer latin subset plain woff (opentype.js can't decompress woff2 in the browser)
  const latinMatch = css.match(/url\((https:\/\/fonts\.bunny\.net\/[^)]+latin[^)]+\.woff)\) format\('woff'\)/);
  if (latinMatch) return latinMatch[1];
  // Fall back to any woff
  const anyMatch = css.match(/url\((https:\/\/fonts\.bunny\.net\/[^)]+\.woff)\) format\('woff'\)/);
  if (anyMatch) return anyMatch[1];
  throw new Error(`No woff URL found for "${family}"`);
}

function mapMetrics(results: { id: string; score: number | null }[]): FontMetrics {
  const get = (id: string) => {
    const r = results.find((m) => m.id === id);
    return r?.score != null ? Math.round(r.score * 100) : 50;
  };
  return {
    dis: get('disambiguation'),
    ctr: get('strokeContrast'),
    xh: get('xHeight'),
    even: get('strokeContrast'), // best available proxy for stroke evenness
    wd: 60, // advance width — not yet a @glyphcheck/score metric, use neutral default
  };
}

interface GsubFeatureRecord { featureTag: string }
interface GsubTable { featureList?: { featureRecords?: GsubFeatureRecord[] } }

function mapFeatures(font: opentype.Font): FontFeatures {
  const tags: Set<string> = new Set();
  try {
    const tables = font.tables as Record<string, unknown>;
    const gsub = tables['gsub'] as GsubTable | undefined;
    if (gsub?.featureList?.featureRecords) {
      for (const rec of gsub.featureList.featureRecords) {
        tags.add(rec.featureTag);
      }
    }
  } catch { /* ignore */ }
  return {
    tnum: tags.has('tnum'),
    zero: tags.has('zero'),
    onum: tags.has('onum'),
    slashDefault: false,
  };
}

export interface MeasureResult {
  metrics: FontMetrics;
  feat: FontFeatures;
  overall: number;
  typefaceScore: { overall: number; grade: string };
}

const _cache = new Map<string, Promise<MeasureResult>>();

export function measureGoogleFont(family: string): Promise<MeasureResult> {
  if (_cache.has(family)) return _cache.get(family)!;

  const p = (async (): Promise<MeasureResult> => {
    const woffUrl = await resolveWoffUrl(family);
    const buffer = await fetch(woffUrl).then((r) => r.arrayBuffer());
    const font = opentype.parse(buffer);
    const { typeface } = scoreFont(font, { rasterize: canvasRasterizer });
    return {
      metrics: mapMetrics(typeface.metrics),
      feat: mapFeatures(font),
      overall: typeface.overall,
      typefaceScore: { overall: typeface.overall, grade: typeface.grade },
    };
  })();

  _cache.set(family, p);
  return p;
}
