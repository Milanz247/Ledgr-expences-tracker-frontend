'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ExpensesByCategoryChart from '@/components/ExpensesByCategoryChart';
import {
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Calendar,
  Landmark,
  ShoppingBag,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import PaymentSourceBadge from '@/components/PaymentSourceBadge';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { format } from 'date-fns';

interface DashboardStats {
  total_balance: number;
  total_bank_balance: number;
  total_fund_balance: number;
  monthly_income: number;
  monthly_expenses: number;
  total_debt: number;
  recent_transactions: any[];
  category_breakdown: any[];
  monthly_trend: any[];
  upcoming_bills?: any[];
}

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#6366f1', '#f97316', '#14b8a6', '#a855f7'
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || Receipt;
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Premium Loading Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-auto border-zinc-200/60 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="py-3 px-3 lg:p-4 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-100/50 to-transparent skeleton-shimmer"></div>
                <div className="h-6 w-6 lg:h-10 lg:w-10 bg-zinc-100 rounded-xl"></div>
                <div className="mt-3 space-y-2">
                  <div className="h-3 bg-zinc-100 rounded-md w-20"></div>
                  <div className="h-6 bg-zinc-100 rounded-md w-24"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Calculate net cash flow (income - expenses for the month)
  const netCashFlow = stats.monthly_income - stats.monthly_expenses;

  // Savings rate = (Net Cash Flow / Income) * 100
  // If income is 0 or negative cash flow, show 0%
  const savingsRate = stats.monthly_income > 0 && netCashFlow > 0
    ? ((netCashFlow / stats.monthly_income) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Dashboard Summary Cards - Premium SaaS Style */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {/* Bank Balance Card */}
        <Card className="group relative overflow-hidden border-zinc-200/60 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 hover:scale-[1.02] h-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-transparent to-transparent opacity-60"></div>
          <CardContent className="relative py-3 px-3 lg:p-4 flex lg:flex-col items-start gap-2 lg:gap-0">
            <div className="h-8 w-8 lg:h-10 lg:w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-1.5 lg:p-2 shrink-0 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Landmark className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <div className="flex-1 lg:mt-3">
              <CardTitle className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Bank Balance
              </CardTitle>
              <div className="text-base lg:text-2xl font-bold text-zinc-900 mt-0.5 lg:mt-1 tracking-tight">
                {formatCurrency(stats.total_bank_balance)}
              </div>
              <p className="hidden lg:block text-[10px] lg:text-xs text-zinc-500 mt-1">
                Total in bank accounts
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cash & Wallets Card */}
        <Card className="group relative overflow-hidden border-zinc-200/60 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 hover:scale-[1.02] h-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-transparent to-transparent opacity-60"></div>
          <CardContent className="relative py-3 px-3 lg:p-4 flex lg:flex-col items-start gap-2 lg:gap-0">
            <div className="h-8 w-8 lg:h-10 lg:w-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-1.5 lg:p-2 shrink-0 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wallet className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <div className="flex-1 lg:mt-3">
              <CardTitle className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Cash & Wallets
              </CardTitle>
              <div className="text-base lg:text-2xl font-bold text-zinc-900 mt-0.5 lg:mt-1 tracking-tight">
                {formatCurrency(stats.total_fund_balance)}
              </div>
              <p className="hidden lg:block text-[10px] lg:text-xs text-zinc-500 mt-1">
                Available outside banks
              </p>
            </div>
          </CardContent>
        </Card>

        {/* This Month Income Card */}
        <Card className="group relative overflow-hidden border-zinc-200/60 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300 hover:scale-[1.02] h-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-transparent to-transparent opacity-60"></div>
          <CardContent className="relative py-3 px-3 lg:p-4 flex lg:flex-col items-start gap-2 lg:gap-0">
            <div className="h-8 w-8 lg:h-10 lg:w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-1.5 lg:p-2 shrink-0 flex items-center justify-center shadow-lg shadow-green-500/20">
              <ArrowUpRight className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <div className="flex-1 lg:mt-3">
              <CardTitle className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-zinc-500">
                This Month Income
              </CardTitle>
              <div className="text-base lg:text-2xl font-bold text-green-600 mt-0.5 lg:mt-1 tracking-tight">
                {formatCurrency(stats.monthly_income)}
              </div>
              <p className="hidden lg:block text-[10px] lg:text-xs text-zinc-500 mt-1">
                Total earnings
              </p>
            </div>
          </CardContent>
        </Card>

        {/* This Month Expenses Card */}
        <Card className="group relative overflow-hidden border-zinc-200/60 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 hover:scale-[1.02] h-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-transparent to-transparent opacity-60"></div>
          <CardContent className="relative py-3 px-3 lg:p-4 flex lg:flex-col items-start gap-2 lg:gap-0">
            <div className="h-8 w-8 lg:h-10 lg:w-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-1.5 lg:p-2 shrink-0 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <ArrowDownRight className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <div className="flex-1 lg:mt-3">
              <CardTitle className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-zinc-500">
                This Month Expenses
              </CardTitle>
              <div className="text-base lg:text-2xl font-bold text-rose-600 mt-0.5 lg:mt-1 tracking-tight">
                {formatCurrency(stats.monthly_expenses)}
              </div>
              <p className="hidden lg:block text-[10px] lg:text-xs text-zinc-500 mt-1">
                Total spending
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Savings Card */}
        <Card className="group relative overflow-hidden border-zinc-200/60 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 hover:scale-[1.02] h-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/80 via-transparent to-transparent opacity-60"></div>
          <CardContent className="relative py-3 px-3 lg:p-4 flex lg:flex-col items-start gap-2 lg:gap-0">
            <div className="h-8 w-8 lg:h-10 lg:w-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-1.5 lg:p-2 shrink-0 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <div className="flex-1 lg:mt-3">
              <CardTitle className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Net Cash Flow
              </CardTitle>
              <div className={`text-base lg:text-2xl font-bold mt-0.5 lg:mt-1 tracking-tight ${netCashFlow >= 0 ? 'text-zinc-900' : 'text-rose-600'}`}>
                {formatCurrency(netCashFlow)}
              </div>
              <p className="hidden lg:block text-[10px] lg:text-xs text-zinc-500 mt-1">
                {netCashFlow >= 0 ? `Income - Expenses` : 'Exceeds income'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Loans Card */}
        <Card className="group relative overflow-hidden border-zinc-200/60 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 hover:scale-[1.02] h-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-transparent to-transparent opacity-60"></div>
          <CardContent className="relative py-3 px-3 lg:p-4 flex lg:flex-col items-start gap-2 lg:gap-0">
            <div className="h-8 w-8 lg:h-10 lg:w-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-1.5 lg:p-2 shrink-0 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <div className="flex-1 lg:mt-3">
              <CardTitle className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Active Loans
              </CardTitle>
              <div className="text-base lg:text-2xl font-bold text-zinc-900 mt-0.5 lg:mt-1 tracking-tight">
                {formatCurrency(stats.total_debt)}
              </div>
              <p className="hidden lg:block text-[10px] lg:text-xs text-zinc-500 mt-1">
                {stats.total_debt > 0 ? 'Debt outstanding' : 'No active loans'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Spending Categories removed per user request */}

      {/* Upcoming Bills Widget - Premium Style */}
      {stats.upcoming_bills && stats.upcoming_bills.length > 0 && (
        <Card className="border-zinc-200/60 bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-transparent"></div>
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 text-zinc-900">
                  <div className="h-8 w-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  Upcoming Bills
                </CardTitle>
                <CardDescription className="text-zinc-500 mt-1">Recurring expenses due in the next 7 days</CardDescription>
              </div>
              <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200/50">
                {stats.upcoming_bills.length} {stats.upcoming_bills.length === 1 ? 'bill' : 'bills'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-3">
              {stats.upcoming_bills.map((bill: any) => {
                const daysUntil = bill.days_until_due;
                const isToday = daysUntil === 0;
                const isDueSoon = daysUntil <= 2;

                return (
                  <div
                    key={bill.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                      isToday
                        ? 'bg-rose-50/80 border-rose-200/60 shadow-sm shadow-rose-500/5'
                        : isDueSoon
                        ? 'bg-amber-50/80 border-amber-200/60 shadow-sm shadow-amber-500/5'
                        : 'bg-zinc-50/50 border-zinc-200/60 hover:bg-zinc-100/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        isToday
                          ? 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/20'
                          : isDueSoon
                          ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20'
                          : 'bg-gradient-to-br from-zinc-500 to-zinc-600 shadow-lg shadow-zinc-500/20'
                      }`}>
                        <span className="text-white">{getIcon(bill.category.icon)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-zinc-900">{bill.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-zinc-500">{bill.category.name}</p>
                          <span className="text-xs text-zinc-300">•</span>
                          <PaymentSourceBadge
                            type={bill.payment_source.type}
                            name={bill.payment_source.name}
                            variant="sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-zinc-900">{formatCurrency(bill.amount)}</p>
                      <p className={`text-xs font-medium mt-1 ${
                        isToday
                          ? 'text-rose-600'
                          : isDueSoon
                          ? 'text-amber-600'
                          : 'text-zinc-500'
                      }`}>
                        {isToday ? 'Due Today!' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row - Premium Style */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        {/* Monthly Trend Chart */}
        <Card className="border-zinc-200/60 bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-zinc-900">Income vs Expenses</CardTitle>
            <CardDescription className="hidden sm:block text-zinc-500">Last 6 months financial trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={stats.monthly_trend}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  {/* Premium gradient for Income */}
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02}/>
                  </linearGradient>
                  {/* Premium gradient for Expenses */}
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                {/* Subtle dashed grid lines */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e4e4e7"
                  vertical={false}
                  opacity={0.6}
                />
                <XAxis
                  dataKey="month"
                  stroke="#a1a1aa"
                  style={{ fontSize: '11px', fontWeight: 500 }}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={20}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#a1a1aa"
                  style={{ fontSize: '11px', fontWeight: 500 }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `LKR ${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `LKR ${(value / 1000).toFixed(0)}K`;
                    return `LKR ${value}`;
                  }}
                  width={70}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/60 rounded-xl p-3 shadow-xl shadow-zinc-900/10">
                          <p className="text-xs font-semibold text-zinc-500 mb-2">
                            {payload[0].payload.month}
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                              <span className="text-xs text-zinc-500">Income:</span>
                              <span className="text-xs font-bold text-zinc-900 ml-auto">
                                {formatCurrency(payload[0].value)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                              <span className="text-xs text-zinc-500">Expenses:</span>
                              <span className="text-xs font-bold text-zinc-900 ml-auto">
                                {formatCurrency(payload[1].value)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Smooth monotone curves with premium gradients */}
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  name="Income"
                  connectNulls={true}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#22c55e' }}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                  name="Expenses"
                  connectNulls={true}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#f43f5e' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expenses by Category Chart */}
        <ExpensesByCategoryChart compact={true} />
      </div>
    </div>
  );
}
