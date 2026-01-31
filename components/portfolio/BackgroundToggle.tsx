"use client";

import { useBackground, BackgroundType } from '@/contexts/BackgroundContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Layers, Sparkles, Terminal, Cpu } from 'lucide-react';

const BACKGROUND_OPTIONS: { value: BackgroundType; label: string; icon: React.ReactNode }[] = [
  { value: 'particle-constellation', label: 'Particles', icon: <Sparkles className="h-4 w-4" /> },
  { value: 'terminal-rain', label: 'Terminal Rain', icon: <Terminal className="h-4 w-4" /> },
  { value: 'circuit-board', label: 'Circuit Board', icon: <Cpu className="h-4 w-4" /> },
];

export function BackgroundToggle() {
  const { background, setBackground, backgroundName } = useBackground();

  const currentIcon = BACKGROUND_OPTIONS.find(opt => opt.value === background)?.icon || <Layers className="h-4 w-4" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-full"
          title={`Background: ${backgroundName}`}
          suppressHydrationWarning
        >
          {currentIcon}
          <span className="sr-only">Toggle background</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {BACKGROUND_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setBackground(option.value)}
            className={`flex items-center gap-2 cursor-pointer ${
              background === option.value ? 'bg-accent' : ''
            }`}
          >
            {option.icon}
            <span>{option.label}</span>
            {background === option.value && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
