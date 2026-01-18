'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  Landmark,
  Wallet,
  Circle,
  Tag,
  Menu,
  X,
  LogOut,
  Bell,
  CreditCard,
  Settings,
  PiggyBank,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Receipt, label: 'Expenses', href: '/dashboard/expenses' },
  { icon: TrendingUp, label: 'Income', href: '/dashboard/income' },
  { icon: PiggyBank, label: 'Budgets', href: '/dashboard/budgets' },
  { icon: RefreshCw, label: 'Recurring', href: '/dashboard/recurring' },
  { icon: CreditCard, label: 'Loans', href: '/dashboard/loans' },
  { icon: Landmark, label: 'Bank Accounts', href: '/dashboard/bank-accounts' },
  { icon: Wallet, label: 'Cash & Wallets', href: '/dashboard/fund-sources' },
  { icon: Tag, label: 'Categories', href: '/dashboard/categories' },
];

// Get user initials for avatar fallback
const getInitials = (name: string | undefined) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Get API base URL for avatar
const getAvatarUrl = (profilePicture: string | null | undefined) => {
  if (!profilePicture) return undefined;
  // If it's a full URL, return as is
  if (profilePicture.startsWith('http')) return profilePicture;
  // Otherwise prepend the API base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
  return `${baseUrl}${profilePicture}`;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50/50">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed top-0 left-0 z-50 h-screen w-64 bg-white/95 backdrop-blur-xl border-r border-zinc-200/50 shadow-[4px_0_20px_-5px_rgba(0,0,0,0.05)] transition-transform duration-300 lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="bg-zinc-900 text-white rounded-xl p-2">
                  <Circle className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-zinc-900">Ledgr</span>
              </div>
              <button
                className="lg:hidden p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-zinc-900 text-white shadow-sm shadow-zinc-900/20'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    )}
                  >
                    <item.icon className={cn('h-[18px] w-[18px]', isActive && 'stroke-[2.5]')} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}

              {/* Settings Link */}
              <Link
                href="/dashboard/settings"
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200',
                  pathname === '/dashboard/settings'
                    ? 'bg-zinc-900 text-white shadow-sm shadow-zinc-900/20'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                )}
              >
                <Settings className={cn('h-[18px] w-[18px]', pathname === '/dashboard/settings' && 'stroke-[2.5]')} />
                <span className="text-sm font-medium">Settings</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Top Navbar */}
          <header className="bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 sticky top-0 z-30 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between px-4 py-3.5 lg:px-8">
              <button
                className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 hover:bg-zinc-100 rounded-xl transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 text-zinc-700" />
              </button>

              {/* Mobile Greeting */}
              <div className="lg:hidden">
                <p className="text-base font-semibold text-zinc-900">
                  Hi, {user?.name?.split(' ')[0]} 👋
                </p>
              </div>

              {/* Desktop Greeting */}
              <div className="hidden lg:block">
                <p className="text-sm text-zinc-500">
                  Welcome back, <span className="font-semibold text-zinc-900">{user?.name}</span>
                </p>
              </div>

              {/* Right side buttons */}
              <div className="flex items-center gap-1">
                {/* Notification Bell */}
                <button className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-zinc-100 transition-all duration-200 relative group">
                  <Bell className="h-5 w-5 text-zinc-500 group-hover:text-zinc-700 transition-colors" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-rose-50 transition-all duration-200 group"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5 text-zinc-500 group-hover:text-rose-600 transition-colors" />
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 sm:p-5 lg:p-6 pb-24 lg:pb-8 max-w-7xl mx-auto">
            {children}
          </main>

          {/* PWA Install Prompt */}
          <PWAInstallPrompt />

          {/* Bottom Navigation (Mobile Only) */}
          <BottomNav />
        </div>
      </div>
    </ProtectedRoute>
  );
}
