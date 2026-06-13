import React from 'react';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { useTheme, alpha } from '@mui/material/styles';
import { IconClose } from './icons';

interface Props {
  open: boolean;
  onClose: () => void;
}

const METRICS = [
  {
    id: 'disambiguation',
    label: 'Character disambiguation',
    weight: '30%',
    color: 'primary' as const,
    how: 'Each pair of commonly-confused glyphs (I/l/1, O/0, b/d, …) is rasterized at 64 px and compared pixel-by-pixel. The score is driven by the worst-confused pair; a font is only as readable as its most ambiguous pair.',
    good: 'Distinct serifs or open apertures that clearly separate I from l from 1.',
    bad: 'Geometric sans-serifs where I, l, and 1 look nearly identical.',
  },
  {
    id: 'xHeight',
    label: 'x-height ratio',
    weight: '20%',
    color: 'primary' as const,
    how: 'Measured as x-height ÷ cap height from the font\'s OS/2 table (or bounding boxes). Scores peak in the 0.62–0.76 range: tall enough to read at small sizes, not so tall that ascenders and descenders crowd each other.',
    good: 'Ratio 0.62–0.76 (e.g. most modern text fonts).',
    bad: 'Very low ratio (≤ 0.48, e.g. some display faces) or extreme tall x-height (> 0.80).',
  },
  {
    id: 'numerals',
    label: 'Numeral scanning',
    weight: '20%',
    color: 'primary' as const,
    how: 'Checks whether digits are tabular by default (advance widths within 1%), or whether the font exposes a "tnum" OpenType feature. Also looks for a slashed/dotted zero ("zero" feature). Proportional digits that don\'t align in columns score lower.',
    good: 'Tabular figures by default or "tnum" available; slashed zero ("zero") present.',
    bad: 'Proportional digits only, no "tnum" feature, no slashed zero.',
  },
  {
    id: 'contrast',
    label: 'Color contrast',
    weight: '30% of scenario score',
    color: 'secondary' as const,
    how: 'Standards-based: WCAG 2.x relative luminance contrast ratio for the foreground/background colors you set. This is a scenario property — it reflects your color choice, not the font itself. Only included in the scenario score when colors are configured.',
    good: 'AA ≥ 4.5 : 1 (normal text), AAA ≥ 7 : 1.',
    bad: 'Below 3 : 1 is difficult for many low-vision users.',
  },
];

const WEIGHTS_NOTE = `Typeface score = Σ (metric_score × weight) / Σ weights, over typeface metrics that ran.
Scenario score = 70% typeface + 30% color contrast (only when colors are set).
All metric scores are normalized 0–1 before weighting; both scores are scaled to 0–100.`;

const GRADE_BANDS = [
  { grade: 'A', range: '85–100', desc: 'Very low legibility risk in this setup.' },
  { grade: 'B', range: '70–84', desc: 'Strong, with minor issues to review.' },
  { grade: 'C', range: '55–69', desc: 'Usable, but has noticeable weak spots.' },
  { grade: 'D', range: '40–54', desc: 'Risky for accessibility-sensitive use.' },
  { grade: 'F', range: '0–39', desc: 'High risk; review carefully before using.' },
];

export function HowItWorksDrawer({ open, onClose }: Props) {
  const theme = useTheme();

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      slotProps={{ paper: { sx: { width: 'min(440px, 100vw)', bgcolor: 'background.paper' } } }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0,
      }}>
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>How Glyphcheck works</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <IconClose size={18} />
        </IconButton>
      </Box>

      <Box sx={{ overflowY: 'auto', px: 2.5, pt: 2, pb: 3 }}>
        {/* Usage */}
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 2.5 }}>
          Pick fonts from the left panel (up to 5). Set your text and background colors in the
          controls bar. Choose a tab to inspect a specific aspect of legibility: glyph disambiguation,
          confusable strings, side-by-side comparison, stacked specimen, or numeral alignment.
          The right panel shows per-font scores that update as you change colors and fonts.
          You can upload your own font files; nothing leaves your browser.
        </Typography>

        <Divider sx={{ mb: 2.5 }} />

        {/* Scores */}
        <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1.75, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
          Score metrics
        </Typography>

        <Stack spacing={2} sx={{ mb: 2.5 }}>
          {METRICS.map((m, i) => (
            <Box key={i} sx={{
              p: 1.75, borderRadius: 2,
              bgcolor: alpha(theme.palette.text.primary, 0.03),
              border: '1px solid', borderColor: 'divider',
            }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>{m.label}</Typography>
                <Chip label={m.weight} size="small"
                  sx={{ fontSize: 10.5, height: 18, fontFamily: "'IBM Plex Mono', monospace" }} />
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.65, mb: 1 }}>
                {m.how}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="body2" sx={{ fontSize: 11.5 }}>
                  <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>Good: </Box>
                  {m.good}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 11.5 }}>
                  <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>Poor: </Box>
                  {m.bad}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        {/* Formula */}
        <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1.25, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
          Overall score formula
        </Typography>
        <Box sx={{
          p: 1.5, borderRadius: 2, mb: 2.5,
          bgcolor: alpha(theme.palette.text.primary, 0.04),
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5,
          color: 'text.secondary', whiteSpace: 'pre-line', lineHeight: 1.8,
        }}>
          {WEIGHTS_NOTE}
        </Box>

        {/* Grades */}
        <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1.25, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
          Grade bands
        </Typography>
        <Stack spacing={0.5} sx={{ mb: 2.5 }}>
          {GRADE_BANDS.map((g) => (
            <Stack key={g.grade} direction="row" spacing={1.25} sx={{ alignItems: 'baseline' }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, width: 16, flexShrink: 0, fontFamily: "'IBM Plex Mono', monospace" }}>
                {g.grade}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: 'text.disabled', fontFamily: "'IBM Plex Mono', monospace", width: 52, flexShrink: 0 }}>
                {g.range}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12.5 }}>
                {g.desc}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Caveats */}
        <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
          Caveats
        </Typography>
        <Stack spacing={0.75}>
          {[
            'These are heuristics, not a validated standard or certification. This is a legibility-risk score, not an accessibility certification.',
            'Color contrast (WCAG 2.x) is the only standards-based metric here. The typeface metrics are automated legibility estimates.',
            'Color contrast is a property of your color choice, not the font. A font cannot pass or fail on contrast alone.',
            'No automated score replaces testing with real users and assistive technology.',
          ].map((c, i) => (
            <Typography key={i} variant="body2" sx={{ color: 'text.secondary', fontSize: 12.5, lineHeight: 1.65 }}>
              · {c}
            </Typography>
          ))}
        </Stack>
      </Box>
    </Drawer>
  );
}
