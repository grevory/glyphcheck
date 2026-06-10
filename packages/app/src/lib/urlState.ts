export interface AppState {
  activeFonts: string[];
  tab: number;
  size: number;
  weight: number;
  letterSpacing: number;
  wordSpacing: number;
  lineHeight: number;
  italic: boolean;
  bold: boolean;
  ramp: boolean;
  fg: string;
  bg: string;
  text: string;
}

export const DEFAULT_STATE: AppState = {
  activeFonts: ['atkinson', 'lexend'],
  tab: 0,
  size: 18,
  weight: 400,
  letterSpacing: 0,
  wordSpacing: 0,
  lineHeight: 1.5,
  italic: false,
  bold: false,
  ramp: false,
  fg: '#221d2e',
  bg: '#ffffff',
  text: '',
};

export function encodeState(s: AppState): string {
  try {
    const compact = {
      f: s.activeFonts, t: s.tab, sz: s.size, wt: s.weight,
      ls: s.letterSpacing, ws: s.wordSpacing, lh: s.lineHeight,
      it: s.italic ? 1 : 0, bd: s.bold ? 1 : 0, rp: s.ramp ? 1 : 0,
      fg: s.fg, bg: s.bg, tx: s.text,
    };
    return btoa(encodeURIComponent(JSON.stringify(compact)));
  } catch {
    return '';
  }
}

type CompactState = {
  f?: string[]; t?: number; sz?: number; wt?: number;
  ls?: number; ws?: number; lh?: number;
  it?: number; bd?: number; rp?: number;
  fg?: string; bg?: string; tx?: string;
};

export function decodeState(str: string): CompactState | null {
  try {
    return JSON.parse(decodeURIComponent(atob(str))) as CompactState;
  } catch {
    return null;
  }
}

export function stateFromUrl(fontIds: Set<string>): AppState {
  try {
    const c = new URLSearchParams(window.location.search).get('c');
    const d = c ? decodeState(c) : null;
    if (d) {
      return {
        ...DEFAULT_STATE,
        activeFonts: Array.isArray(d.f) ? d.f.filter((id) => fontIds.has(id)) : DEFAULT_STATE.activeFonts,
        tab: d.t ?? 0,
        size: d.sz ?? 18,
        weight: d.wt ?? 400,
        letterSpacing: d.ls ?? 0,
        wordSpacing: d.ws ?? 0,
        lineHeight: d.lh ?? 1.5,
        italic: !!d.it,
        bold: !!d.bd,
        ramp: !!d.rp,
        fg: d.fg ?? DEFAULT_STATE.fg,
        bg: d.bg ?? DEFAULT_STATE.bg,
        text: d.tx ?? '',
      };
    }
  } catch { /* ignore */ }
  return DEFAULT_STATE;
}
