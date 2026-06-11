import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { SPECIMEN_PRESETS } from '../data/specimens';
import type { AppState } from '../lib/urlState';
import type { FontEntry } from '../data/fonts';
import { Surface, FgLabel } from './shared';
import { specimenStyle, fontList } from './shared-utils';

interface Props { s: AppState; registry: Record<string, FontEntry> }

export function StackedPanel({ s, registry }: Props) {
  const fonts = fontList(s, registry);
  const text = s.text || SPECIMEN_PRESETS.pangram;

  return (
    <Surface s={s}>
      <FgLabel s={s} sx={{ mb: 0.5 }}>Stacked specimens, same line, aligned</FgLabel>
      <Typography sx={{ fontSize: 13, color: s.fg, opacity: 0.6, mb: 2, maxWidth: 560 }}>
        The identical line set in each font and stacked, so differences in x-height, width and weight line up vertically.
      </Typography>
      <Box>
        {fonts.map((f, i) => (
          <Box key={f.id} sx={{
            py: 1.6, borderTop: i === 0 ? 'none' : `1px solid ${alpha(s.fg, 0.1)}`,
            display: 'flex', alignItems: 'baseline', gap: 2,
          }}>
            <Box sx={{ width: 130, flexShrink: 0 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: s.fg }}>{f.name}</Typography>
              <Typography sx={{ fontSize: 10, color: s.fg, opacity: 0.5 }}>
                {i === 0 ? 'primary' : f.cat}
              </Typography>
            </Box>
            <Box style={specimenStyle(s, f.css) as React.CSSProperties} sx={{ minWidth: 0, flex: 1 }}>
              {text}
            </Box>
          </Box>
        ))}
      </Box>
    </Surface>
  );
}
