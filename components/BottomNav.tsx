'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Receipt, Plus, TrendingUp, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Expenses',
      href: '/dashboard/expenses',
      icon: Receipt,
    },
    {
      name: 'Add',
      href: '/dashboard/expenses?add=true',
      icon: Plus,
      isMainAction: true,
    },
    {
      name: 'Income',
      href: '/dashboard/income',
      icon: TrendingUp,
    },
    {
      name: 'Budgets',
      href: '/dashboard/budgets',
      icon: PiggyBank,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-zinc-200/50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          if (item.isMainAction) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center relative -mt-6 flex-shrink-0"
              >
                <div className="bg-zinc-900 text-white rounded-2xl w-14 h-14 flex items-center justify-center shadow-lg shadow-zinc-900/25 hover:shadow-xl hover:shadow-zinc-900/30 transition-all duration-200 active:scale-95 hover:scale-105">
                  <Icon className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-medium text-zinc-500 mt-1.5">
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition-all duration-200 active:scale-95 flex-1',
                isActive
                  ? 'text-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-600'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-xl transition-colors duration-200',
                isActive && 'bg-zinc-100'
              )}>
                <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              </div>
              <span className={cn(
                'text-[10px] mt-0.5 font-medium',
                isActive ? 'text-zinc-900' : 'text-zinc-500'
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
