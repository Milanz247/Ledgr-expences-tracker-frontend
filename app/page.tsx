'use client';

import Link from 'next/link';
import { Circle, TrendingUp, Wallet, PieChart, Calendar, ArrowRight, CheckCircle2, BarChart3, DollarSign, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/90 border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-black text-white rounded-lg p-2">
                <Circle className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-black">Ledgr</span>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" className="hidden sm:flex text-black hover:bg-zinc-100">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild className="bg-black hover:bg-zinc-800 text-white">
                <Link href="/register">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-24 pb-32 bg-zinc-50">
        <div className="absolute inset-0 bg-grid-slate-100 opacity-40" />
        <div className="mx-auto max-w-7xl relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
                <Circle className="h-4 w-4" />
                <span>Financial Management Platform</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-black leading-tight mb-6">
                Track money with clarity
              </h1>
              <p className="text-xl text-zinc-600 leading-relaxed mb-10">
                Professional expense tracking system designed for individuals and businesses.
                Automated income monitoring, budget management, and comprehensive financial analytics.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Button asChild size="lg" className="bg-black hover:bg-zinc-800 text-white text-lg h-14 px-8">
                  <Link href="/register">
                    Start tracking
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg h-14 px-8 border-2 border-black text-black hover:bg-zinc-50">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm text-zinc-600">
                <div className="flex flex-col">
                  <CheckCircle2 className="h-5 w-5 text-black mb-1" />
                  <span>Real-time sync</span>
                </div>
                <div className="flex flex-col">
                  <CheckCircle2 className="h-5 w-5 text-black mb-1" />
                  <span>Automated tracking</span>
                </div>
                <div className="flex flex-col">
                  <CheckCircle2 className="h-5 w-5 text-black mb-1" />
                  <span>Secure data</span>
                </div>
              </div>
            </div>

            {/* Right Dashboard Preview */}
            <div className="relative lg:ml-8">
              <div className="relative">
                {/* Main Dashboard Card */}
                <Card className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {/* Balance */}
                      <div>
                        <div className="text-sm font-medium text-zinc-600 mb-2">Total Balance</div>
                        <div className="text-4xl font-bold text-black">$24,680</div>
                        <div className="text-sm text-zinc-600 mt-1">+$2,340 this month</div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 pt-6 border-t-2 border-zinc-200">
                        <div className="bg-zinc-50 p-4 border-2 border-zinc-200">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-black" />
                            <span className="text-xs font-medium text-zinc-600">Income</span>
                          </div>
                          <div className="text-2xl font-bold text-black">$8,450</div>
                        </div>
                        <div className="bg-zinc-50 p-4 border-2 border-zinc-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Wallet className="h-5 w-5 text-black" />
                            <span className="text-xs font-medium text-zinc-600">Expenses</span>
                          </div>
                          <div className="text-2xl font-bold text-black">$3,240</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-zinc-600">Budget Usage</span>
                          <span className="text-sm font-bold text-black">62%</span>
                        </div>
                        <div className="h-3 bg-zinc-200 border-2 border-black">
                          <div className="h-full w-[62%] bg-black" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Floating Stats */}
                <div className="absolute -top-6 -right-6 bg-black text-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hidden lg:block">
                  <div className="text-xs font-medium mb-1">Active</div>
                  <div className="text-2xl font-bold">24/7</div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white border-2 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hidden lg:block">
                  <div className="text-xs font-medium text-zinc-600 mb-1">Transactions</div>
                  <div className="text-2xl font-bold text-black">1,247</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y-2 border-zinc-200">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">
              Automated Financial Intelligence
            </h2>
            <p className="text-xl text-zinc-600">
              Enterprise-grade financial tracking with intelligent automation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 border-zinc-200 hover:border-black transition-all bg-white">
              <CardContent className="p-8">
                <div className="bg-black text-white w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">Real-time Analytics</h3>
                <p className="text-zinc-600 leading-relaxed">
                  Automated transaction categorization with ML-powered insights and spending pattern recognition.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 border-zinc-200 hover:border-black transition-all bg-white">
              <CardContent className="p-8">
                <div className="bg-black text-white w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <LineChart className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">Smart Forecasting</h3>
                <p className="text-zinc-600 leading-relaxed">
                  Predictive budget analysis with automated alerts and intelligent expense tracking algorithms.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 border-zinc-200 hover:border-black transition-all bg-white">
              <CardContent className="p-8">
                <div className="bg-black text-white w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <DollarSign className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">Multi-Source Sync</h3>
                <p className="text-zinc-600 leading-relaxed">
                  Unified financial dashboard with bank account integration and automated reconciliation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-zinc-600">
              Choose the plan that fits your financial tracking needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-zinc-200 bg-white">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-black mb-2">Free</h3>
                  <div className="text-5xl font-bold text-black mb-1">$0</div>
                  <p className="text-zinc-500">Forever free</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-black flex-shrink-0" />
                    <span className="text-zinc-600">Up to 100 transactions/month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-black flex-shrink-0" />
                    <span className="text-zinc-600">Basic expense tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-black flex-shrink-0" />
                    <span className="text-zinc-600">2 bank accounts</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-black flex-shrink-0" />
                    <span className="text-zinc-600">Monthly reports</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-black flex-shrink-0" />
                    <span className="text-zinc-600">Mobile app access</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full h-12 text-lg border-2 border-black text-black hover:bg-zinc-50">
                  <Link href="/register">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 text-sm font-medium">
                RECOMMENDED
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-black mb-2">Pro</h3>
                  <div className="text-5xl font-bold text-black mb-1">$9.99</div>
                  <p className="text-zinc-500">per month</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-black flex-shrink-0" />
                    <span className="text-zinc-600">Unlimited transactions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-black flex-shrink-0" />
                    <span className="text-zinc-600">Advanced analytics & forecasting</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-black flex-shrink-0" />
                    <span className="text-zinc-600">Unlimited bank accounts</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-black flex-shrink-0" />
                    <span className="text-zinc-600">CSV/Excel export & import</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-black flex-shrink-0" />
                    <span className="text-zinc-600">Two-factor authentication</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-black flex-shrink-0" />
                    <span className="text-zinc-600">Priority support</span>
                  </li>
                </ul>
                <Button asChild className="w-full h-12 text-lg bg-black text-white hover:bg-zinc-800">
                  <Link href="/register">Start Pro Trial</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white opacity-5" />
        <div className="mx-auto max-w-4xl text-center relative">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Start tracking your finances today
          </h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Join professionals and businesses using Ledgr for intelligent financial management
          </p>
          <Button asChild size="lg" className="bg-white text-black hover:bg-zinc-200 text-lg h-14 px-10">
            <Link href="/register">
              Launch dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="mt-6 text-sm text-zinc-500">
            Enterprise-grade security • Real-time synchronization • Automated processing
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-50 border-t-2 border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-black text-white rounded-lg p-2">
                  <Circle className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-black">Ledgr</span>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Professional financial management platform for automated expense tracking and intelligent budget monitoring.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-bold text-black mb-4 uppercase tracking-wide">Platform</h3>
              <ul className="space-y-2">
                <li><Link href="/register" className="text-sm text-zinc-600 hover:text-black transition-colors">Get Started</Link></li>
                <li><Link href="/login" className="text-sm text-zinc-600 hover:text-black transition-colors">Sign In</Link></li>
                <li><Link href="/dashboard" className="text-sm text-zinc-600 hover:text-black transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            {/* Company Info */}
            <div>
              <h3 className="text-sm font-bold text-black mb-4 uppercase tracking-wide">Company</h3>
              <p className="text-sm text-zinc-600 mb-2">
                <span className="font-medium text-black">SHA CDL Solution</span>
              </p>
              <p className="text-sm text-zinc-600">
                Developed by <span className="font-medium text-black">Milan Madusanka</span>
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t-2 border-zinc-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-zinc-600">
                © 2026 Ledgr by SHA CDL Solution. All rights reserved.
              </p>
              <p className="text-sm text-zinc-600">
                Built with precision by Milan Madusanka
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
