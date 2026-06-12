import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { FONTS, type FontEntry } from './data/fonts';
import { IconAdd } from './icons';
import type { AppState } from './lib/urlState';
import {
  fetchGoogleFontsCatalog,
  loadGoogleFont,
  categoryLabel,
  familyToId,
  type GFontItem,
} from './lib/googleFonts';
import { measureGoogleFont } from './lib/measureFont';

const MAX_FONTS = 5;

interface Option {
  id: string;
  name: string;
  css: string;
  cat: string;
  bench: boolean;
  isGf: boolean;
}

function fontToOption(f: FontEntry): Option {
  return { id: f.id, name: f.name, css: f.css, cat: f.cat, bench: f.bench, isGf: false };
}

function gfToOption(g: GFontItem): Option {
  const id = familyToId(g.family);
  return { id, name: g.family, css: `'${g.family}', ${g.category}`, cat: categoryLabel(g.category), bench: false, isGf: true };
}

interface MobileFontBarProps {
  activeFonts: string[];
  set: (patch: Partial<AppState>) => void;
  registry: Record<string, FontEntry>;
  onMetricsReady: (id: string, entry: FontEntry) => void;
}

export const MobileFontBar = React.memo(function MobileFontBar({ activeFonts: active, set, registry, onMetricsReady }: MobileFontBarProps) {
  const [gfCatalog, setGfCatalog] = useState<GFontItem[]>([]);
  const [gfLoading, setGfLoading] = useState(true);
  const [gfError, setGfError] = useState(false);

  useEffect(() => {
    fetchGoogleFontsCatalog()
      .then((items) => { setGfCatalog(items); setGfLoading(false); })
      .catch(() => { setGfError(true); setGfLoading(false); });
  }, []);

  const builtinIds = new Set(FONTS.map((f) => f.id));
  const activeSet = new Set(active);
  const gfIds = new Set(gfCatalog.map((g) => familyToId(g.family)));

  const options: Option[] = [
    ...FONTS.filter((f) => !activeSet.has(f.id)).map(fontToOption),
    ...gfCatalog
      .filter((g) => !activeSet.has(familyToId(g.family)) && !builtinIds.has(familyToId(g.family)))
      .map(gfToOption),
  ];

  const addFont = (opt: Option) => {
    if (activeSet.has(opt.id) || active.length >= MAX_FONTS) return;
    if (opt.isGf || gfIds.has(opt.id)) {
      loadGoogleFont(opt.name);
      const base: FontEntry = registry[opt.id] ?? {
        id: opt.id, name: opt.name, css: opt.css, cat: opt.cat,
        bench: false, blurb: `${opt.name} · served via Bunny Fonts CDN`,
        metrics: null, feat: { tnum: false, zero: false, onum: false, slashDefault: false },
      };
      onMetricsReady(opt.id, base);
      measureGoogleFont(opt.name).then((result) => {
        onMetricsReady(opt.id, { ...base, metrics: result.metrics, feat: result.feat });
      }).catch((err) => { console.warn('measureGoogleFont failed:', err); });
    }
    set({ activeFonts: [...active, opt.id] });
  };

  const removeFont = (id: string) => {
    if (active.length > 1) set({ activeFonts: active.filter((x) => x !== id) });
  };

  return (
    <Box sx={{ px: 2, pt: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Stack direction="row" sx={{ overflowX: 'auto', mb: 1, gap: 0.75, flexWrap: 'nowrap', pb: 0.5 }}>
        {active.map((id, i) => {
          const f = registry[id] as FontEntry | undefined;
          if (!f) return null;
          return (
            <Chip
              key={id}
              label={f.name}
              size="small"
              color={i === 0 ? 'primary' : 'default'}
              variant={i === 0 ? 'filled' : 'outlined'}
              onDelete={active.length > 1 ? () => removeFont(id) : undefined}
              sx={{ flexShrink: 0, fontFamily: f.css, fontSize: 12 }}
            />
          );
        })}
      </Stack>

      <Autocomplete
        size="small"
        options={options}
        value={null}
        blurOnSelect
        clearOnBlur
        disabled={active.length >= MAX_FONTS}
        loading={gfLoading}
        getOptionLabel={(o) => o.name}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        groupBy={(o) => o.isGf ? 'Google Fonts' : 'Built-in'}
        onChange={(_, v) => v && addFont(v)}
        filterOptions={(opts, { inputValue }) => {
          if (!inputValue) return opts.slice(0, 60);
          const q = inputValue.toLowerCase();
          return opts.filter((o) => o.name.toLowerCase().includes(q)).slice(0, 80);
        }}
        renderOption={(props, o) => (
          <li {...props} key={o.id}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 13.5, fontFamily: o.css }}>{o.name}</Typography>
              <Typography sx={{ fontSize: 10.5, color: 'text.secondary', ml: 1 }}>{o.cat}</Typography>
            </Box>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={
              active.length >= MAX_FONTS ? 'Limit reached'
                : gfError ? 'Add a font... (catalog unavailable)'
                : 'Add a font...'
            }
            slotProps={{
              ...params.slotProps,
              input: {
                ...(params.slotProps?.input as object | undefined),
                startAdornment: (
                  <Box sx={{ color: 'text.disabled', display: 'flex', pl: 0.5 }}>
                    {gfLoading ? <CircularProgress size={14} color="inherit" /> : <IconAdd size={16} />}
                  </Box>
                ),
              },
            }}
          />
        )}
      />
    </Box>
  );
});
