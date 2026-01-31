"use client";

import dynamic from 'next/dynamic';
import { useBackground } from '@/contexts/BackgroundContext';

// Lazy load all backgrounds - using default exports
const ParticleConstellation = dynamic(
  () => import('./ParticleConstellation'),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-transparent to-slate-500/5" /> }
);

const TerminalRainBackground = dynamic(
  () => import('./TerminalRainBackground'),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-transparent to-slate-500/5" /> }
);

const CircuitBoardBackground = dynamic(
  () => import('./CircuitBoardBackground'),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-transparent to-slate-500/5" /> }
);

export function DynamicBackground() {
  const { background } = useBackground();

  switch (background) {
    case 'particle-constellation':
      return <ParticleConstellation />;
    case 'terminal-rain':
      return <TerminalRainBackground />;
    case 'circuit-board':
      return <CircuitBoardBackground />;
    default:
      return <TerminalRainBackground />;
  }
}
