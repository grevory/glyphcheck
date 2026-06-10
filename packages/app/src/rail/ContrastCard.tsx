import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { wcagReport, apcaLc, apcaGuide } from '../lib/contrast';
import type { AppState } from '../lib/urlState';
import { FONT_BY_ID } from '../data/fonts';
import { IconContrast, IconCheck, IconClose } from '../icons';
import { Overline } from '../components/Overline';
import { Mono } from '../components/Mono';

function PassChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <Chip
      size="small" label={label}
      icon={ok ? <IconCheck size={13} /> : <IconClose size={13} />}
      color={ok ? 'success' : 'default'} variant={ok ? 'filled' : 'outlined'}
      sx={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, height: 24, fontWeight: 600,
        '& .MuiChip-icon': { ml: '6px' },
        ...(ok ? {} : { color: 'text.disabled', opacity: 0.8 }),
      }}
    />
  );
}

interface ContrastCardProps {
  s: AppState;
}

export function ContrastCard({ s }: ContrastCardProps) {
  const theme = useTheme();
  const rep = wcagReport(s.fg, s.bg);
  const lc = apcaLc(s.fg, s.bg);
  const guide = apcaGuide(lc);
  const ratioColor = rep.aaBody
    ? theme.palette.success.main
    : rep.aaLarge
    ? theme.palette.warning.main
    : theme.palette.error.main;

  const primaryFont = FONT_BY_ID[s.activeFonts[0]];

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.25 }}>
        <Box sx={{ color: 'primary.main', display: 'flex' }}><IconContrast size={17} /></Box>
        <Overline>Contrast</Overline>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden', borderColor: 'divider' }}>
        <Box sx={{
          bgcolor: s.bg, color: s.fg, px: 2, py: 1.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box sx={{ fontFamily: primaryFont?.css, fontSize: 28, fontWeight: 600, lineHeight: 1 }}>
            Ag&nbsp;0123
          </Box>
          <Box sx={{ fontFamily: primaryFont?.css, fontSize: 12, opacity: 0.85, textAlign: 'right' }}>
            preview<br />text · 13px
          </Box>
        </Box>
        <Box sx={{ p: 1.5 }}>
          <Stack direction="row" sx={{ alignItems: 'baseline' }} spacing={1}>
            <Mono sx={{ fontSize: 30, fontWeight: 600, color: ratioColor, lineHeight: 1 }}>
              {rep.ratioStr}
            </Mono>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>WCAG&nbsp;2.2 ratio</Typography>
          </Stack>
          <Box sx={{ mt: 1.25, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            <PassChip ok={rep.aaBody} label="AA body" />
            <PassChip ok={rep.aaaBody} label="AAA body" />
            <PassChip ok={rep.aaLarge} label="AA large" />
            <PassChip ok={rep.nonText} label="UI 3:1" />
          </Box>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 1.5, mt: 1.25, borderColor: 'divider' }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline' }}>
            <Mono sx={{ fontSize: 22, fontWeight: 600 }}>{Math.round(lc)}</Mono>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>APCA&nbsp;Lc</Typography>
          </Stack>
          <Tooltip arrow title="APCA is a perceptual contrast model drafted for WCAG 3. It was pulled from the draft in 2023 and is NOT an official standard -- shown for guidance only.">
            <Chip size="small" label="non-official" variant="outlined" color="warning"
              sx={{ height: 20, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", cursor: 'help' }} />
          </Tooltip>
        </Stack>
        <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.5 }}>
          <Mono component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>{guide.tier}</Mono>
          {' '}-- {guide.use}
        </Typography>
      </Paper>
    </Box>
  );
}
