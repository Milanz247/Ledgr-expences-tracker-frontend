'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface StealthModeContextType {
  isStealthMode: boolean;
  toggleStealthMode: () => void;
}

const StealthModeContext = createContext<StealthModeContextType | undefined>(undefined);

export function StealthModeProvider({ children }: { children: React.ReactNode }) {
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('isStealthMode');
    if (stored) {
      setIsStealthMode(stored === 'true');
    }
  }, []);

  const toggleStealthMode = () => {
    setIsStealthMode((prev) => {
      const newValue = !prev;
      localStorage.setItem('isStealthMode', String(newValue));
      toast.success(newValue ? 'Stealth Mode Active' : 'Stealth Mode Disabled');
      return newValue;
    });
  };

  // Prevent hydration mismatch by rendering children only after mount,
  // or initial render with default state (though local storage needs mount)
  // For this simple toggle, it's safe to render immediately but state sync might flicker
  // if we don't handle it. However, blocking render might be bad for SEO/LCP.
  // We'll proceed with basic state initialization.

  return (
    <StealthModeContext.Provider value={{ isStealthMode, toggleStealthMode }}>
      {children}
    </StealthModeContext.Provider>
  );
}

export function useStealthMode() {
  const context = useContext(StealthModeContext);
  if (context === undefined) {
    throw new Error('useStealthMode must be used within a StealthModeProvider');
  }
  return context;
}
