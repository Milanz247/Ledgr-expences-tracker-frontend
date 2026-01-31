"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardTrendChartProps {
  data: any[];
}

export default function DashboardTrendChart({ data }: DashboardTrendChartProps) {
  return (
    <Card className="border-zinc-200/60 bg-white/80 backdrop-blur-sm overflow-hidden h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-zinc-900">Income vs Expenses</CardTitle>
        <CardDescription className="hidden sm:block text-zinc-500">Last 6 months financial trend</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
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
                            <CurrencyDisplay
                              amount={payload[0].value}
                              className="text-xs font-bold text-zinc-900 ml-auto"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                          <span className="text-xs text-zinc-500">Expenses:</span>
                            <CurrencyDisplay
                              amount={payload[1].value}
                              className="text-xs font-bold text-zinc-900 ml-auto"
                            />
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
  );
}
