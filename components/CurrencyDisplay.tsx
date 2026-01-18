'use client';

import { useStealthMode } from '@/contexts/StealthModeContext';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number;
  currency?: { symbol: string; code: string };
  className?: string;
  decimals?: number;
}

export default function CurrencyDisplay({
  amount,
  currency = { symbol: 'Rs', code: 'LKR' },
  className,
  decimals = 2,
}: CurrencyDisplayProps) {
  const { isStealthMode } = useStealthMode();

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  // Replace default currency symbol with custom one if needed
  // Intl usually does a good job, but if we want 'Rs' specifically:
  const displayAmount = currency.code === 'LKR' 
    ? formattedAmount.replace('LKR', 'Rs') 
    : formattedAmount;

  if (isStealthMode) {
    return (
      <span className={cn('font-mono tracking-widest select-none filter blur-[3px]', className)} aria-label="Hidden amount">
        ****
      </span>
    );
  }

  return (
    <span className={className}>
      {displayAmount}
    </span>
  );
}
