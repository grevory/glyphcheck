import React, { useRef, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { FONTS, FONT_BY_ID, type FontEntry } from './data/fonts';
import { FontCard } from './components/FontCard';
import { Overline } from './components/Overline';
import { Mono } from './components/Mono';
import { IconAdd, IconUpload, IconStar } from './icons';
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
  return {
    id,
    name: g.family,
    css: `'${g.family}', ${g.category}`,
    cat: categoryLabel(g.category),
    bench: false,
    isGf: true,
  };
}

interface FontDrawerProps {
  s: AppState;
  set: (patch: Partial<AppState>) => void;
  onUpload: (file: File) => void;
  onMetricsReady: () => void;
}

export function FontDrawer({ s, set, onUpload, onMetricsReady }: FontDrawerProps) {
  const active = s.activeFonts;
  const fileRef = useRef<HTMLInputElement>(null);

  const [gfCatalog, setGfCatalog] = useState<GFontItem[]>([]);
  const [gfLoading, setGfLoading] = useState(false);
  const [gfError, setGfError] = useState(false);

  useEffect(() => {
    setGfLoading(true);
    fetchGoogleFontsCatalog()
      .then((items) => { setGfCatalog(items); setGfLoading(false); })
      .catch(() => { setGfError(true); setGfLoading(false); });
  }, []);

  const builtinIds = new Set(FONTS.map((f) => f.id));
  const activeSet = new Set(active);

  const builtinOptions: Option[] = FONTS.filter((f) => !activeSet.has(f.id)).map(fontToOption);

  const gfIds = new Set(gfCatalog.map((g) => familyToId(g.family)));
  const gfOptions: Option[] = gfCatalog
    .filter((g) => !activeSet.has(familyToId(g.family)) && !builtinIds.has(familyToId(g.family)))
    .map(gfToOption);

  const options: Option[] = [...builtinOptions, ...gfOptions];

  const benches = FONTS.filter((f) => f.bench && !activeSet.has(f.id));

  const addFont = (opt: Option) => {
    if (activeSet.has(opt.id) || active.length >= MAX_FONTS) return;

    if (opt.isGf || gfIds.has(opt.id)) {
      loadGoogleFont(opt.name);
      if (!FONT_BY_ID[opt.id]) {
        const entry: FontEntry = {
          id: opt.id,
          name: opt.name,
          css: opt.css,
          cat: opt.cat,
          bench: false,
          blurb: `${opt.name} · served via Bunny Fonts CDN`,
          metrics: null,
          feat: { tnum: false, zero: false, onum: false, slashDefault: false },
        };
        FONT_BY_ID[opt.id] = entry;
      }
      measureGoogleFont(opt.name).then((result) => {
        const entry = FONT_BY_ID[opt.id];
        if (entry) {
          entry.metrics = result.metrics;
          entry.feat = result.feat;
          setTimeout(() => onMetricsReady(), 0);
        }
      }).catch((err) => { console.warn('measureGoogleFont failed:', err); });
    }

    set({ activeFonts: [...active, opt.id] });
  };

  const addBuiltin = (id: string) => {
    const f = FONTS.find((x) => x.id === id);
    if (f) addFont(fontToOption(f));
  };

  const removeFont = (id: string) => {
    if (active.length > 1) set({ activeFonts: active.filter((x) => x !== id) });
  };
  const makePrimary = (id: string) => {
    set({ activeFonts: [id, ...active.filter((x) => x !== id)] });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
        <Overline>Comparison set</Overline>
        <Mono sx={{ fontSize: 11, color: 'text.secondary' }}>{active.length}/{MAX_FONTS}</Mono>
      </Stack>

      <Stack spacing={1.25}>
        {active.map((id) => {
          const f = FONT_BY_ID[id] as FontEntry | undefined;
          if (!f) return null;
          return (
            <FontCard key={id} font={f} isPrimary={id === active[0]}
              onPrimary={() => makePrimary(id)} onRemove={() => removeFont(id)} />
          );
        })}
      </Stack>

      <Box sx={{ mt: 2 }}>
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
                <Box>
                  <Typography sx={{ fontSize: 13.5, fontFamily: o.css }}>{o.name}</Typography>
                  <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>{o.cat}</Typography>
                </Box>
                {o.bench && (
                  <Box sx={{ color: 'primary.main', display: 'flex' }}><IconStar size={13} /></Box>
                )}
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
                      {gfLoading
                        ? <CircularProgress size={14} color="inherit" />
                        : <IconAdd size={16} />
                      }
                    </Box>
                  ),
                },
              }}
            />
          )}
        />
      </Box>

      <Button fullWidth variant="outlined" startIcon={<IconUpload size={16} />}
        onClick={() => fileRef.current?.click()}
        sx={{
          mt: 1.25, textTransform: 'none', justifyContent: 'flex-start',
          color: 'text.secondary', borderColor: 'divider',
          '&:hover': { borderColor: 'text.secondary' },
        }}>
        Upload .woff2 / .ttf / .otf
      </Button>
      <input ref={fileRef} type="file" accept=".woff2,.woff,.ttf,.otf,font/*" hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = '';
        }} />

      {benches.length > 0 && (
        <Box sx={{ mt: 2.5 }}>
          <Overline sx={{ mb: 1, display: 'block' }}>Legibility benchmarks</Overline>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
            {benches.map((f) => (
              <Chip key={f.id} label={f.name} size="small" onClick={() => addBuiltin(f.id)}
                icon={<IconAdd size={13} />} variant="outlined"
                sx={{ borderColor: 'divider', '& .MuiChip-icon': { ml: '6px' } }} />
            ))}
          </Stack>
          <Typography sx={{ fontSize: 10.5, color: 'text.disabled', mt: 1, lineHeight: 1.5 }}>
            Designed-for-legibility references to compare your candidates against.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
