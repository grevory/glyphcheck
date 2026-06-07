const API_KEY = import.meta.env.VITE_GOOGLE_FONTS_API_KEY as string | undefined;
const CACHE_KEY = 'gf_catalog_v1';

export interface GFontItem {
  family: string;
  category: string;
  variants: string[];
}

let _catalog: GFontItem[] | null = null;

export async function fetchGoogleFontsCatalog(): Promise<GFontItem[]> {
  if (_catalog) return _catalog;
  if (!API_KEY) throw new Error('VITE_GOOGLE_FONTS_API_KEY not set');

  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      _catalog = JSON.parse(cached) as GFontItem[];
      return _catalog;
    } catch { /* fall through */ }
  }

  const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity&fields=items(family,category,variants)`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Fonts API ${res.status}`);
  const data = await res.json() as { items: GFontItem[] };
  _catalog = data.items;
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(_catalog)); } catch { /* quota */ }
  return _catalog;
}

const _loaded = new Set<string>();

export function loadGoogleFont(family: string, variants = '400,700'): void {
  if (_loaded.has(family)) return;
  _loaded.add(family);
  const encoded = encodeURIComponent(family);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.bunny.net/css?family=${encoded.replace(/%20/g, '+')}:${variants}&display=swap`;
  document.head.appendChild(link);
}

export function categoryLabel(gfCat: string): string {
  switch (gfCat) {
    case 'sans-serif': return 'Sans-serif';
    case 'serif': return 'Serif';
    case 'monospace': return 'Monospace';
    case 'display': return 'Display';
    case 'handwriting': return 'Handwriting';
    default: return gfCat;
  }
}

export function familyToId(family: string): string {
  return 'gf-' + family.toLowerCase().replace(/\s+/g, '-');
}
