'use client';

import Link from 'next/link';
import { Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <Circle className="h-5 w-5" />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-slate-900">Ledgr</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </header>

        <main className="mt-16 sm:mt-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">
              Track money with clarity.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Ledgr helps you manage income, expenses, budgets, and recurring bills with a clean, simple dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="min-h-[44px]">
                <Link href="/register">Create free account</Link>
              </Button>
              <Button asChild variant="outline" className="min-h-[44px]">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
