import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Logo } from './components/Logo';
import { IconShare, IconSun, IconMoon, IconQuestion } from './icons';

interface HeaderProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
  onShare: () => void;
  onHowItWorks: () => void;
}

export function Header({ mode, onToggleMode, onShare, onHowItWorks }: HeaderProps) {
  return (
    <AppBar position="static" color="default" elevation={0}
      sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 1.5, minHeight: { xs: 60, md: 64 } }}>
        <Logo />
        <Box sx={{ flex: 1 }} />

        <Tooltip arrow title="How Glyphcheck works: scoring methodology and usage guide">
          <IconButton onClick={onHowItWorks} sx={{ color: 'text.secondary' }}>
            <IconQuestion size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip arrow title="Copy share link">
          <IconButton onClick={onShare} sx={{ color: 'text.secondary' }}>
            <IconShare size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip arrow title={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}>
          <IconButton onClick={onToggleMode} sx={{ color: 'text.secondary' }}>
            {mode === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
