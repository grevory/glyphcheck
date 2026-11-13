import { contrastRatio, parseHex, type RGB } from '@glyphcheck/score';
import { APCAcontrast, sRGBtoY } from 'apca-w3';

// Colors can arrive from a shared permalink, so an unparseable value must not
// crash the rail. Fall back to black, which is what the previous hand-rolled
// parser produced for invalid input.
const BLACK: RGB = { r: 0, g: 0, b: 0 };
function toRgb(hex: string): RGB {
  try {
    return parseHex(hex);
  } catch {
    return BLACK;
  }
}

export function clampHex(hex: string): string | null {
  if (!/^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex || '')) return null;
  return hex[0] === '#' ? hex : '#' + hex;
}

export function wcagRatio(fg: string, bg: string): number {
  return contrastRatio(toRgb(fg), toRgb(bg));
}

export interface WcagReport {
  ratio: number;
  ratioStr: string;
  aaBody: boolean;
  aaaBody: boolean;
  aaLarge: boolean;
  aaaLarge: boolean;
  nonText: boolean;
}

export function wcagReport(fg: string, bg: string): WcagReport {
  const r = wcagRatio(fg, bg);
  return {
    ratio: r,
    ratioStr: r.toFixed(2) + ':1',
    aaBody: r >= 4.5,
    aaaBody: r >= 7,
    aaLarge: r >= 3,
    aaaLarge: r >= 4.5,
    nonText: r >= 3,
  };
}

/**
 * Signed APCA Lc: positive for dark text on a light background, negative for
 * light on dark. The score library's `apcaLc` returns only the magnitude, and
 * the rail shows polarity, so this calls the reference implementation directly.
 */
export function apcaLc(txtHex: string, bgHex: string): number {
  const t = toRgb(txtHex);
  const b = toRgb(bgHex);
  return Number(APCAcontrast(sRGBtoY([t.r, t.g, t.b]), sRGBtoY([b.r, b.g, b.b])));
}

export interface ApcaGuide {
  tier: string;
  use: string;
}

export function apcaGuide(lc: number): ApcaGuide {
  const a = Math.abs(lc);
  if (a >= 90) return { tier: 'Lc 90+', use: 'Any body text, incl. thin weights' };
  if (a >= 75) return { tier: 'Lc 75+', use: 'Body text ≥ ~16px' };
  if (a >= 60) return { tier: 'Lc 60+', use: 'Larger / medium body, ≥ ~18px' };
  if (a >= 45) return { tier: 'Lc 45+', use: 'Large headings only' };
  if (a >= 30) return { tier: 'Lc 30+', use: 'Non-text / large display' };
  if (a >= 15) return { tier: 'Lc 15+', use: 'Minimum perceivable, decorative' };
  return { tier: 'Lc < 15', use: 'Insufficient' };
}
