import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { IconInfo, IconRefresh, IconSwap, IconChevron } from '../icons';
import { ColorField } from '../components/ColorField';
import { Overline } from '../components/Overline';
import { Mono } from '../components/Mono';
import type { AppState } from '../lib/urlState';
import { trackTextSettingChanged } from '../analytics';

interface LabeledSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  fmt?: (v: number) => string;
  onChange: (v: number) => void;
}

function LabeledSlider({ label, value, min, max, step, unit, fmt, onChange }: LabeledSliderProps) {
  return (
    <Box sx={{ minWidth: 116, flex: 1 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: '-2px' }}>
        <Overline sx={{ fontSize: 9.5, whiteSpace: 'nowrap' }}>{label}</Overline>
        <Mono sx={{ fontSize: 11.5, fontWeight: 600 }}>
          {fmt ? fmt(value) : value}{unit}
        </Mono>
      </Stack>
      <Slider size="small" value={value} min={min} max={max} step={step}
        onChange={(_, v) => onChange(v as number)} sx={{ py: 1.1 }} />
    </Box>
  );
}

interface ControlsBarProps {
  s: AppState;
  set: (patch: Partial<AppState>) => void;
  onReset: () => void;
}

export function ControlsBar({ s, set, onReset }: ControlsBarProps) {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const hideColorLabels = isPhone;
  const trackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackDebounced = (setting: string, value: string | number) => {
    if (trackTimer.current) clearTimeout(trackTimer.current);
    trackTimer.current = setTimeout(() => trackTextSettingChanged(setting, value), 600);
  };

  const colorControls = (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <ColorField label="Text" value={s.fg} hideLabel={hideColorLabels} onChange={(v) => { set({ fg: v }); trackDebounced('text_color', v); }} />
      <Tooltip arrow title="Swap foreground / background (polarity)">
        <IconButton size="small" onClick={() => set({ fg: s.bg, bg: s.fg })}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <IconSwap size={16} />
        </IconButton>
      </Tooltip>
      <ColorField label="Background" value={s.bg} hideLabel={hideColorLabels} onChange={(v) => { set({ bg: v }); trackDebounced('background_color', v); }} />
    </Stack>
  );

  // On phone: render a single chevron toggle that reveals all controls.
  if (isPhone) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 3, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', p: 1, flexWrap: 'wrap', rowGap: 1 }}>
          {colorControls}
          <Box sx={{ flex: 1 }} />
          <Tooltip arrow title={mobileOpen ? 'Hide controls' : 'Style controls'}>
            <IconButton size="small" onClick={() => setMobileOpen((v) => !v)}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, color: mobileOpen ? 'primary.main' : 'text.secondary' }}>
              <Box sx={{ transition: 'transform .2s', transform: mobileOpen ? 'rotate(180deg)' : 'none', display: 'flex' }}>
                <IconChevron size={16} />
              </Box>
            </IconButton>
          </Tooltip>
        </Stack>
        <Collapse in={mobileOpen}>
          <Divider />
          <Box sx={{ p: 1.5 }}>
            <ToggleButtonGroup size="small" exclusive value={null} sx={{ mb: 1.25 }}>
              <ToggleButton value="italic" selected={s.italic} onClick={() => set({ italic: !s.italic })}
                sx={{ textTransform: 'none', px: 1.5, fontStyle: 'italic' }}>
                Italic
              </ToggleButton>
              <ToggleButton value="bold" selected={s.bold} onClick={() => set({ bold: !s.bold })}
                sx={{ textTransform: 'none', px: 1.5, fontWeight: 700 }}>
                Bold
              </ToggleButton>
              <ToggleButton value="ramp" selected={s.ramp} onClick={() => set({ ramp: !s.ramp })}
                sx={{ textTransform: 'none', px: 1.5 }}>
                Size&nbsp;ramp
              </ToggleButton>
            </ToggleButtonGroup>
            <Stack direction="row" sx={{ rowGap: 1, flexWrap: 'wrap' }} spacing={2.5}>
              <LabeledSlider label="Size" unit="px" value={s.size} min={8} max={40} step={1}
                onChange={(v) => { set({ size: v }); trackDebounced('font_size', `${v}px`); }} />
              <LabeledSlider label="Weight" value={s.weight} min={300} max={800} step={100}
                onChange={(v) => { set({ weight: v }); trackDebounced('font_weight', v); }} />
              <LabeledSlider label="Tracking" unit="em" value={s.letterSpacing} min={-0.05} max={0.3} step={0.01}
                fmt={(v) => v.toFixed(2)} onChange={(v) => { set({ letterSpacing: v }); trackDebounced('letter_spacing', `${v.toFixed(2)}em`); }} />
              <LabeledSlider label="Word space" unit="em" value={s.wordSpacing} min={0} max={1} step={0.05}
                fmt={(v) => v.toFixed(2)} onChange={(v) => { set({ wordSpacing: v }); trackDebounced('word_spacing', `${v.toFixed(2)}em`); }} />
              <LabeledSlider label="Leading" value={s.lineHeight} min={1} max={2.4} step={0.05}
                fmt={(v) => v.toFixed(2)} onChange={(v) => { set({ lineHeight: v }); trackDebounced('line_height', v.toFixed(2)); }} />
            </Stack>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button size="small" startIcon={<IconRefresh size={14} />} onClick={onReset}
                sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 12.5 }}>
                Reset
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 1.75, borderColor: 'divider' }}>
      {/* Always-visible row: style toggles + colors */}
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
        <ToggleButtonGroup size="small" exclusive value={null} sx={{ flexShrink: 0 }}>
          <ToggleButton value="italic" selected={s.italic} onClick={() => set({ italic: !s.italic })}
            sx={{ textTransform: 'none', px: 1.5, fontStyle: 'italic', whiteSpace: 'nowrap' }}>
            Italic
          </ToggleButton>
          <ToggleButton value="bold" selected={s.bold} onClick={() => set({ bold: !s.bold })}
            sx={{ textTransform: 'none', px: 1.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
            Bold
          </ToggleButton>
          <ToggleButton value="ramp" selected={s.ramp} onClick={() => set({ ramp: !s.ramp })}
            sx={{ textTransform: 'none', px: 1.5, whiteSpace: 'nowrap' }}>
            Size&nbsp;ramp
          </ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ flex: 1 }} />

        {colorControls}

        <Tooltip arrow title={open ? 'Hide text settings' : 'Text size, weight, spacing'}>
          <IconButton size="small" onClick={() => setOpen((v) => !v)}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, color: open ? 'primary.main' : 'text.secondary' }}>
            <Box sx={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none', display: 'flex' }}>
              <IconChevron size={16} />
            </Box>
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Collapsible: sliders */}
      <Collapse in={open}>
        <Divider sx={{ mt: 1.5, mb: 1.25 }} />
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Overline>Text settings</Overline>
            <Tooltip arrow title="Size, weight, letter-spacing, word-spacing and line-height map to WCAG 1.4.12 Text Spacing.">
              <Box sx={{ color: 'text.disabled', display: 'flex', cursor: 'help' }}>
                <IconInfo size={14} />
              </Box>
            </Tooltip>
          </Stack>
          <Button size="small" startIcon={<IconRefresh size={14} />} onClick={onReset}
            sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 12.5 }}>
            Reset
          </Button>
        </Stack>
        <Stack direction="row" spacing={2.5} sx={{ rowGap: 1, flexWrap: 'wrap' }}>
          <LabeledSlider label="Size" unit="px" value={s.size} min={8} max={40} step={1}
            onChange={(v) => { set({ size: v }); trackDebounced('font_size', `${v}px`); }} />
          <LabeledSlider label="Weight" value={s.weight} min={300} max={800} step={100}
            onChange={(v) => { set({ weight: v }); trackDebounced('font_weight', v); }} />
          <LabeledSlider label="Tracking" unit="em" value={s.letterSpacing} min={-0.05} max={0.3} step={0.01}
            fmt={(v) => v.toFixed(2)} onChange={(v) => { set({ letterSpacing: v }); trackDebounced('letter_spacing', `${v.toFixed(2)}em`); }} />
          <LabeledSlider label="Word space" unit="em" value={s.wordSpacing} min={0} max={1} step={0.05}
            fmt={(v) => v.toFixed(2)} onChange={(v) => { set({ wordSpacing: v }); trackDebounced('word_spacing', `${v.toFixed(2)}em`); }} />
          <LabeledSlider label="Leading" value={s.lineHeight} min={1} max={2.4} step={0.05}
            fmt={(v) => v.toFixed(2)} onChange={(v) => { set({ lineHeight: v }); trackDebounced('line_height', v.toFixed(2)); }} />
        </Stack>
      </Collapse>
    </Paper>
  );
}
