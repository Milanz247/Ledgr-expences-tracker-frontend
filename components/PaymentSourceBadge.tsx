'use client';

import { Landmark, Wallet, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PaymentSourceBadgeProps {
  type: 'bank' | 'fund' | 'loan';
  name: string;
  variant?: 'default' | 'sm' | 'icon-only';
  className?: string;
}

export default function PaymentSourceBadge({
  type,
  name,
  variant = 'default',
  className
}: PaymentSourceBadgeProps) {
  const Icon = type === 'bank' ? Landmark : type === 'fund' ? Wallet : CreditCard;
  const bgColor = type === 'bank' ? 'bg-blue-100' : type === 'fund' ? 'bg-green-100' : 'bg-purple-100';
  const textColor = type === 'bank' ? 'text-blue-700' : type === 'fund' ? 'text-green-700' : 'text-purple-700';
  const iconColor = type === 'bank' ? 'text-blue-600' : type === 'fund' ? 'text-green-600' : 'text-purple-600';

  if (variant === 'icon-only') {
    return (
      <div className={cn('rounded-lg p-2', bgColor, className)}>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </div>
    );
  }

  if (variant === 'sm') {
    return (
      <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-md', bgColor, className)}>
        <Icon className={cn('h-3 w-3', iconColor)} />
        <span className={cn('text-xs font-medium', textColor)}>{name}</span>
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-lg', bgColor, className)}>
      <Icon className={cn('h-4 w-4', iconColor)} />
      <span className={cn('text-sm font-medium', textColor)}>{name}</span>
    </div>
  );
}
