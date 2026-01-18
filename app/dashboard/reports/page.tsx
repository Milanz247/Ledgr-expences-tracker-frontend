'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  Download,
  Wallet,
  Landmark,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileBarChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { toast } from 'sonner';

// --- Interfaces ---
interface ReportData {
  overview: {
    cash_flow: Array<{ name: string; income: number; expense: number }>;
    liquidity_mix: Array<{ name: string; value: number; fill: string }>;
    net_worth: number;
    total_assets: number;
    total_liabilities: number;
  };
  budgets_recurring: {
    budget_adherence: Array<{
      id: number;
      category: string;
      limit: number;
      spent: number;
      percentage: number;
      color: string;
    }>;
    monthly_recurring_cost: number;
    upcoming_recurring: Array<{
      id: number;
      name: string;
      amount: number;
      due_date: string;
    }>;
  };
  debts_assets: {
    debt_distribution: Array<{ name: string; value: number; fill: string }>;
    loan_progress: Array<{
      id: number;
      name: string;
      total: number;
      paid: number;
      remaining: number;
      percentage: number;
      due_date: string;
    }>;
    installment_progress: Array<{
        id: number;
        name: string;
        category: string;
        total: number;
        paid: number;
        remaining: number;
        percentage: number;
        finish_date: string;
      }>;
    asset_ratio: Array<{ name: string; value: number; fill: string }>;
  };
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const response = await api.get('/reports');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load financial report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.info('Exporting report... (Feature coming soon)');
    // Implementation for PDF/CSV generation would go here
  };

  if (loading) {
    return <ReportsSkeleton />;
  }

  if (!data) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AlertTriangle className="h-12 w-12 text-zinc-300 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-900">Failed to load reports</h3>
            <Button variant="outline" className="mt-4" onClick={fetchReportData}>
                Try Again
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <FileBarChart className="h-6 w-6 text-emerald-600" />
            Financial Command Center
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Comprehensive analytics across your entire financial profile.
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="debts">Debts & Assets</TabsTrigger>
        </TabsList>

        {/* --- Tab 1: Overview --- */}
        <TabsContent value="overview" className="space-y-6">
          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              title="Net Worth"
              amount={data.overview.net_worth}
              description="Assets - Liabilities"
              icon={Landmark}
              trend={data.overview.net_worth > 0 ? 'positive' : 'negative'}
            />
            <SummaryCard
              title="Total Assets"
              amount={data.overview.total_assets}
              description="Bank & Cash Balances"
              icon={Wallet}
              trend="positive"
            />
            <SummaryCard
              title="Total Liabilities"
              amount={data.overview.total_liabilities}
              description="Loans & Installments"
              icon={CreditCard}
              trend="negative" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cash Flow Chart */}
            <Card className="lg:col-span-2 shadow-sm">
                <CardHeader>
                    <CardTitle>Cash Flow Trend</CardTitle>
                    <CardDescription>Income vs. Expenses (Last 6 Months)</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.overview.cash_flow} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#71717a' }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#71717a' }}
                                tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                            />
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e4e4e7" />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [value ? value.toLocaleString() : '0', '']}
                            />
                            <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                            <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Liquidity Mix Donut */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Liquidity Mix</CardTitle>
                    <CardDescription>Where your money is stored</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex flex-col justify-center">
                     <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={data.overview.liquidity_mix}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.overview.liquidity_mix.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-4">
                        <p className="text-xs text-zinc-500">Total Liquid Assets</p>
                        <p className="text-2xl font-bold text-zinc-900 mt-1">
                            <CurrencyDisplay amount={data.overview.total_assets} />
                        </p>
                    </div>
                </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- Tab 2: Budgets & Recurring (Planning) --- */}
        <TabsContent value="planning" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recurring Summary Card */}
            <Card className="shadow-sm h-fit">
                <CardHeader>
                    <CardTitle>Fixed Monthly Costs</CardTitle>
                    <CardDescription>Recurring bills & subscriptions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <p className="text-sm text-zinc-500">Total Monthly Commitment</p>
                        <p className="text-3xl font-bold text-zinc-900 mt-1">
                            <CurrencyDisplay amount={data.budgets_recurring.monthly_recurring_cost} />
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-zinc-900 flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Upcoming Bills
                        </h4>
                        {data.budgets_recurring.upcoming_recurring.length > 0 ? (
                            data.budgets_recurring.upcoming_recurring.map((bill) => (
                                <div key={bill.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                                    <div>
                                        <p className="font-medium text-sm text-zinc-900">{bill.name}</p>
                                        <p className="text-xs text-zinc-500">Due: {bill.due_date}</p>
                                    </div>
                                    <span className="font-semibold text-sm">
                                        <CurrencyDisplay amount={bill.amount} />
                                    </span>
                                </div>
                            ))
                        ) : (
                             <p className="text-sm text-zinc-500 italic">No upcoming bills found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Budget Adherence List */}
            <Card className="lg:col-span-2 shadow-sm">
                <CardHeader>
                    <CardTitle>Budget Adherence</CardTitle>
                    <CardDescription>How you're tracking against your limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {data.budgets_recurring.budget_adherence.length > 0 ? (
                        data.budgets_recurring.budget_adherence.map((budget) => (
                            <div key={budget.id} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: budget.color }} />
                                        {budget.category}
                                    </span>
                                    <span className={cn(
                                        "font-medium",
                                        budget.percentage > 100 ? "text-rose-600" : "text-zinc-600"
                                    )}>
                                        <CurrencyDisplay amount={budget.spent} /> / <CurrencyDisplay amount={budget.limit} />
                                    </span>
                                </div>
                                <Progress 
                                    value={Math.min(budget.percentage, 100)} 
                                    className="h-2" 
                                    indicatorClassName={budget.percentage > 100 ? "bg-rose-500" : undefined}
                                />
                                <div className="flex justify-between text-xs text-zinc-400">
                                    <span>{budget.percentage.toFixed(0)}% Used</span>
                                    <span>
                                        {budget.limit - budget.spent > 0 
                                            ? `${(budget.limit - budget.spent).toLocaleString()} remaining` 
                                            : `${Math.abs(budget.limit - budget.spent).toLocaleString()} over`
                                        }
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                         <div className="text-center py-12 text-zinc-500">
                            <p>No active budgets set.</p>
                         </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        {/* --- Tab 3: Debts & Assets --- */}
        <TabsContent value="debts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Asset Ratio */}
                 <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Asset vs. Debt Ratio</CardTitle>
                        <CardDescription>Net Assets vs. Borrowed Amount</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.debts_assets.asset_ratio}
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {data.debts_assets.asset_ratio.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="middle" align="right" layout="vertical" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Debt Breakdown */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Debt Breakdown</CardTitle>
                        <CardDescription>Loans vs. Installments</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.debts_assets.debt_distribution} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                                    {data.debts_assets.debt_distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Loan Progress */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Active Loans</CardTitle>
                        <CardDescription>Repayment progress</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {data.debts_assets.loan_progress.length > 0 ? (
                            data.debts_assets.loan_progress.map((loan) => (
                                <div key={loan.id} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-zinc-900">{loan.name}</span>
                                        <span className="text-zinc-500">
                                            <CurrencyDisplay amount={loan.paid} /> / <CurrencyDisplay amount={loan.total} />
                                        </span>
                                    </div>
                                    <Progress value={loan.percentage} className="h-2" />
                                     <div className="flex justify-between text-xs text-zinc-400">
                                        <span>{loan.percentage}% Paid</span>
                                        <span>Due: {loan.due_date}</span>
                                    </div>
                                </div>
                            ))
                        ): (
                            <p className="text-sm text-zinc-500 italic">No active loans.</p>
                        )}
                    </CardContent>
                </Card>

                 {/* Installment Progress */}
                 <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Ongoing Installments</CardTitle>
                        <CardDescription>EMI progress tracking</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                       {data.debts_assets.installment_progress.length > 0 ? (
                            data.debts_assets.installment_progress.map((inst) => (
                                <div key={inst.id} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-zinc-900">{inst.name}</span>
                                        <span className="text-zinc-500">
                                            <CurrencyDisplay amount={inst.paid} /> / <CurrencyDisplay amount={inst.total} />
                                        </span>
                                    </div>
                                    <Progress value={inst.percentage} className="h-2" />
                                     <div className="flex justify-between text-xs text-zinc-400">
                                        <span>{inst.percentage}% Paid</span>
                                        <span>Ends: {inst.finish_date}</span>
                                    </div>
                                </div>
                            ))
                        ): (
                            <p className="text-sm text-zinc-500 italic">No active installments.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({ title, amount, description, icon: Icon, trend }: any) {
    return (
        <Card className="shadow-sm">
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-zinc-500">{title}</p>
                    <Icon className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="flex items-baseline gap-2">
                    <h2 className="text-2xl font-bold text-zinc-900">
                        <CurrencyDisplay amount={amount} />
                    </h2>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{description}</p>
            </CardContent>
        </Card>
    );
}

function ReportsSkeleton() {
    return (
        <div className="space-y-6 pb-6 max-w-7xl mx-auto">
             <div className="flex justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
             <Skeleton className="h-[400px] w-full" />
        </div>
    )
}
