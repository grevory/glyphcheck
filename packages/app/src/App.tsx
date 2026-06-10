import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Snackbar from '@mui/material/Snackbar';
import { buildTheme } from './theme';
import { Header } from './Header';
import { HowItWorksModal } from './HowItWorksModal';
import { FontDrawer } from './FontDrawer';
import { SpecimenField } from './SpecimenField';
import { ControlsBar } from './rail/ControlsBar';
import { ScoresRail } from './rail/ScoresRail';
import { DisambiguationPanel } from './panels/DisambiguationPanel';
import { ConfusableStringsPanel } from './panels/ConfusableStringsPanel';
import { FontVsFontPanel } from './panels/FontVsFontPanel';
import { StackedPanel } from './panels/StackedPanel';
import { NumbersPanel } from './panels/NumbersPanel';
import { FONT_BY_ID, type FontEntry } from './data/fonts';
import { DEFAULT_STATE, stateFromUrl, encodeState, type AppState } from './lib/urlState';
import { LEGIBILITY_WEIGHTS } from './lib/legibility';
import { track } from './analytics';

const TABS = [
  { label: 'Disambiguation' },
  { label: 'Confusable strings' },
  { label: 'Font vs font' },
  { label: 'Stacked' },
  { label: 'Numbers & figures' },
] as const;

const MAX_FONTS = 5;

function ActivePanel({ s }: { s: AppState }) {
  switch (s.tab) {
    case 0: return <DisambiguationPanel s={s} />;
    case 1: return <ConfusableStringsPanel s={s} />;
    case 2: return <FontVsFontPanel s={s} weights={LEGIBILITY_WEIGHTS} />;
    case 3: return <StackedPanel s={s} />;
    case 4: return <NumbersPanel s={s} />;
    default: return <DisambiguationPanel s={s} />;
  }
}

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [state, setState] = useState<AppState>(() =>
    stateFromUrl(new Set(Object.keys(FONT_BY_ID)))
  );
  const [snack, setSnack] = useState('');
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [metricsRev, setMetricsRev] = useState(0);
  const theme = useMemo(() => buildTheme(mode), [mode]);

  const set = useCallback((patch: Partial<AppState>) => {
    setState((p) => ({ ...p, ...patch }));
  }, []);

  const s = state;

  useEffect(() => {
    try { window.history.replaceState(null, '', '?c=' + encodeState(s)); } catch { /* ignore */ }
  }, [s]);

  const handleUpload = async (file: File) => {
    if (s.activeFonts.length >= MAX_FONTS) {
      setSnack('Comparison set is full — remove a font first.');
      return;
    }
    try {
      const fam = 'UP' + Date.now();
      const url = URL.createObjectURL(file);
      const ff = new FontFace(fam, `url(${url})`);
      await ff.load();
      document.fonts.add(ff);
      const font: FontEntry = {
        id: fam,
        name: file.name.replace(/\.(woff2?|ttf|otf)$/i, ''),
        css: `'${fam}', sans-serif`,
        cat: 'Uploaded',
        bench: false,
        blurb: 'Your uploaded font — loaded locally, nothing left your device.',
        metrics: null,
        feat: { tnum: false, zero: false, onum: false, slashDefault: false },
      };
      FONT_BY_ID[font.id] = font;
      set({ activeFonts: [...s.activeFonts, font.id] });
      setSnack(`Loaded "${font.name}" locally · 0 bytes uploaded`);
      track('font_selected', { fontName: font.name, source: 'upload' });
    } catch {
      setSnack('Could not read that font file.');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setSnack('Permalink copied to clipboard');
    } catch {
      setSnack('Permalink is in the address bar');
    }
    track('comparison_run', { tab: s.tab });
  };

  const showSpecimenField = s.tab === 2 || s.tab === 3;

  const handleTabChange = (_: React.SyntheticEvent, v: number) => {
    set({ tab: v });
    track('test_changed', { tab: v });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header mode={mode} onToggleMode={() => setMode((m) => m === 'dark' ? 'light' : 'dark')} onShare={handleShare} onHowItWorks={() => setHowItWorksOpen(true)} />

        <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* left: fonts */}
          <Box sx={{
            width: 312, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider',
            overflowY: 'auto', display: { xs: 'none', md: 'block' }, bgcolor: 'background.paper',
          }}>
            <FontDrawer s={s} set={set} onUpload={handleUpload} onMetricsReady={() => setMetricsRev((v) => v + 1)} />
          </Box>

          {/* center: workspace */}
          <Box sx={{ flex: 1, minWidth: 0, overflowY: 'auto', bgcolor: 'background.default' }}>
            <Box sx={{ p: { xs: 2, md: 2.5 }, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 1280, mx: 'auto' }}>
              <ControlsBar s={s} set={set} onReset={() => set({
                size: DEFAULT_STATE.size,
                weight: DEFAULT_STATE.weight,
                letterSpacing: DEFAULT_STATE.letterSpacing,
                wordSpacing: DEFAULT_STATE.wordSpacing,
                lineHeight: DEFAULT_STATE.lineHeight,
                italic: false,
                bold: false,
                ramp: false,
              })} />

              <Paper variant="outlined" sx={{ borderRadius: 3, borderColor: 'divider', overflow: 'hidden' }}>
                <Tabs value={s.tab} onChange={handleTabChange} variant="scrollable"
                  scrollButtons="auto" allowScrollButtonsMobile
                  sx={{
                    px: 1, borderBottom: '1px solid', borderColor: 'divider', minHeight: 46,
                    '& .MuiTab-root': { textTransform: 'none', fontSize: 13.5, fontWeight: 600, minHeight: 46, py: 0 },
                  }}>
                  {TABS.map((t, i) => <Tab key={i} label={t.label} />)}
                </Tabs>
                <Box sx={{ p: { xs: 1.25, md: 1.75 } }}>
                  {showSpecimenField && (
                    <Box sx={{ mb: 1.75 }}><SpecimenField s={s} set={set} /></Box>
                  )}
                  <ActivePanel s={s} />
                </Box>
              </Paper>

              <Typography sx={{ fontSize: 11, color: 'text.disabled', textAlign: 'center', pb: 1, lineHeight: 1.6 }}>
                Glyphcheck · free fonts served via privacy-first Bunny Fonts · contrast by WCAG 2.2 &amp; APCA (draft) ·
                legibility scores are heuristics, not certifications.
              </Typography>
            </Box>
          </Box>

          {/* right: scores */}
          <Box sx={{
            width: 324, flexShrink: 0, borderLeft: '1px solid', borderColor: 'divider',
            overflowY: 'auto', display: { xs: 'none', lg: 'block' }, bgcolor: 'background.paper',
          }}>
            <ScoresRail s={s} weights={LEGIBILITY_WEIGHTS} metricsRev={metricsRev} />
          </Box>
        </Box>
      </Box>

      <HowItWorksModal open={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />

      <Snackbar open={!!snack} autoHideDuration={3200} onClose={() => setSnack('')}
        message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </ThemeProvider>
  );
}
