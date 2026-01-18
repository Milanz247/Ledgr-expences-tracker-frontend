'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector,
} from 'recharts';

interface CategoryExpense {
  category: string;
  amount: number;
  fill: string;
  [key: string]: string | number;
}

interface ExpensesByCategoryChartProps {
  compact?: boolean;
}

// Premium color palette - modern and harmonious
const PREMIUM_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Rose
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f97316', // Orange
  '#a855f7', // Purple
];

// Active sector render for hover effect
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.9}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        fill={fill}
      />
    </g>
  );
};

export default function ExpensesByCategoryChart({
  compact = true,
}: ExpensesByCategoryChartProps) {
  const [data, setData] = useState<CategoryExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetchExpensesByCategory();
  }, []);

  const fetchExpensesByCategory = async () => {
    try {
      const response = await api.get('/reports/expenses-by-category');
      const categoryData = response.data || [];

      // Add premium colors
      const dataWithColors = categoryData.map((item: any, index: number) => ({
        ...item,
        fill: PREMIUM_COLORS[index % PREMIUM_COLORS.length],
      }));

      setData(dataWithColors);
    } catch (error) {
      console.error('Failed to fetch expenses by category:', error);
      setData([]);
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

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `LKR ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `LKR ${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  // Premium custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = payload[0].payload.totalAmount || 0;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

      return (
        <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/60 rounded-xl p-3 shadow-xl shadow-zinc-900/10">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: data.payload.fill }}
            />
            <p className="text-xs font-semibold text-zinc-900">
              {data.payload.category}
            </p>
          </div>
          <p className="text-sm font-bold text-zinc-900">
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Center label content
  const renderCenterLabel = () => {
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

    return (
      <g>
        <text
          x="50%"
          y="45%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground"
          style={{ fontSize: '12px', fontWeight: 600 }}
        >
          Total Spent
        </text>
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground"
          style={{ fontSize: compact ? '18px' : '24px', fontWeight: 700 }}
        >
          {formatCompactCurrency(totalAmount)}
        </text>
      </g>
    );
  };

  if (loading) {
    return (
      <Card className="w-full border-zinc-200/60 bg-white/80 backdrop-blur-sm">
        <CardHeader className="p-4 pb-3">
          <CardTitle className="text-lg font-semibold text-zinc-900">
            Expenses by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-200 border-t-zinc-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="w-full border-zinc-200/60 bg-white/80 backdrop-blur-sm">
        <CardHeader className="p-4 pb-3">
          <CardTitle className="text-lg font-semibold text-zinc-900">
            Expenses by Category
          </CardTitle>
          <CardDescription className="text-sm text-zinc-500">
            Monthly breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 flex items-center justify-center h-[400px]">
          <div className="text-center">
            <p className="text-sm text-zinc-500">
              No expenses recorded for this month
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const dataWithTotal = data.map(item => ({ ...item, totalAmount }));

  return (
    <Card className="w-full border-zinc-200/60 bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-lg font-semibold text-zinc-900">
          Expenses by Category
        </CardTitle>
        <CardDescription className="text-sm text-zinc-500">
          {formatCurrency(totalAmount)} spent this month
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {/* Donut Chart */}
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={dataWithTotal}
              cx="50%"
              cy="50%"
              innerRadius={compact ? 70 : 80}
              outerRadius={compact ? 100 : 110}
              paddingAngle={2}
              dataKey="amount"
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              {dataWithTotal.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  className="transition-all duration-300 cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {renderCenterLabel()}
          </PieChart>
        </ResponsiveContainer>

        {/* Interactive Category List with Percentages */}
        <div className="w-full mt-6 space-y-2">
          {data.map((item, index) => {
            const percentage = totalAmount > 0 ? ((item.amount / totalAmount) * 100).toFixed(1) : 0;
            const isActive = activeIndex === index;

            return (
              <div
                key={index}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-100/80 scale-[1.02] shadow-sm'
                    : 'bg-zinc-50/50 hover:bg-zinc-100/50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`h-4 w-4 rounded-full transition-transform duration-200 shadow-sm ${
                      isActive ? 'scale-125' : ''
                    }`}
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className={`font-medium text-sm transition-colors ${
                    isActive ? 'text-zinc-900' : 'text-zinc-600'
                  }`}>
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold text-sm transition-colors ${
                    isActive ? 'text-zinc-900' : 'text-zinc-600'
                  }`}>
                    {formatCurrency(item.amount)}
                  </span>
                  <span className={`text-xs font-bold w-12 text-right transition-colors ${
                    isActive ? 'text-zinc-900' : 'text-zinc-500'
                  }`}>
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
