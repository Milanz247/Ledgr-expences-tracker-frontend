'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Calendar, Filter, X } from 'lucide-react';
import api from '@/lib/api';

interface DashboardFilterProps {
  onFilterChange: (filters: FilterState) => void;
  loading?: boolean;
}

export interface FilterState {
  start_date: string;
  end_date: string;
  category_id: string;
  source_type: string;
  source_id: string;
}

interface Category {
  id: number;
  name: string;
  type: string;
}

interface BankAccount {
  id: number;
  bank_name: string;
}

interface FundSource {
  id: number;
  source_name: string;
}

interface Loan {
  id: number;
  lender_name: string;
}

export default function DashboardFilter({ onFilterChange, loading = false }: DashboardFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [fundSources, setFundSources] = useState<FundSource[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [filters, setFilters] = useState<FilterState>({
    start_date: firstDayOfMonth,
    end_date: today,
    category_id: '',
    source_type: '',
    source_id: '',
  });

  useEffect(() => {
    fetchFilterData();
  }, []);

  const fetchFilterData = async () => {
    try {
      const [categoriesRes, accountsRes, fundRes, loansRes] = await Promise.all([
        api.get('/categories'),
        api.get('/bank-accounts'),
        api.get('/fund-sources'),
        api.get('/loans'),
      ]);

      setCategories(categoriesRes.data.filter((c: Category) => c.type === 'expense'));
      setBankAccounts(accountsRes.data);
      setFundSources(fundRes.data);
      setLoans(loansRes.data);
    } catch (error) {
      console.error('Failed to fetch filter data:', error);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };

    // Reset source_id when source_type changes
    if (key === 'source_type') {
      newFilters.source_id = '';
    }

    setFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(filters);
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      start_date: firstDayOfMonth,
      end_date: today,
      category_id: '',
      source_type: '',
      source_id: '',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const setDatePreset = (preset: string) => {
    const end = new Date();
    let start = new Date();

    switch (preset) {
      case 'today':
        start = new Date();
        break;
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'thisMonth':
        start = new Date(end.getFullYear(), end.getMonth(), 1);
        break;
    }

    const newFilters = {
      ...filters,
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const getSourceOptions = () => {
    switch (filters.source_type) {
      case 'bank':
        return bankAccounts.map(a => ({ id: a.id, name: a.bank_name }));
      case 'fund':
        return fundSources.map(f => ({ id: f.id, name: f.source_name }));
      case 'loan':
        return loans.map(l => ({ id: l.id, name: l.lender_name }));
      default:
        return [];
    }
  };

  const hasActiveFilters = filters.category_id || filters.source_type ||
    filters.start_date !== firstDayOfMonth || filters.end_date !== today;

  return (
    <div className="space-y-3">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {[filters.category_id, filters.source_type].filter(Boolean).length}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            disabled={loading}
            className="gap-2 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-4 bg-slate-50/50 border-slate-200">
          <div className="space-y-4">
            {/* Date Range Presets */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Quick Date Range
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset('today')}
                  disabled={loading}
                  className="text-xs"
                >
                  Today
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset('week')}
                  disabled={loading}
                  className="text-xs"
                >
                  Last 7 Days
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset('thisMonth')}
                  disabled={loading}
                  className="text-xs"
                >
                  This Month
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  disabled={loading}
                  className="text-xs"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="start_date" className="text-xs font-medium">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  disabled={loading}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end_date" className="text-xs font-medium">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  disabled={loading}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-1">
              <Label htmlFor="category_id" className="text-xs font-medium">Category</Label>
              <select
                id="category_id"
                value={filters.category_id}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="source_type" className="text-xs font-medium">Source Type</Label>
                <select
                  id="source_type"
                  value={filters.source_type}
                  onChange={(e) => handleFilterChange('source_type', e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                >
                  <option value="">All Sources</option>
                  <option value="bank">Bank Account</option>
                  <option value="fund">Cash Wallet</option>
                  <option value="loan">Loan</option>
                </select>
              </div>

              {filters.source_type && (
                <div className="space-y-1">
                  <Label htmlFor="source_id" className="text-xs font-medium">
                    Select {filters.source_type === 'bank' ? 'Bank' : filters.source_type === 'fund' ? 'Fund' : 'Loan'}
                  </Label>
                  <select
                    id="source_id"
                    value={filters.source_id}
                    onChange={(e) => handleFilterChange('source_id', e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                  >
                    <option value="">All</option>
                    {getSourceOptions().map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Apply Button */}
            <Button
              onClick={applyFilters}
              disabled={loading}
              className="w-full"
              size="sm"
            >
              {loading ? 'Applying...' : 'Apply Filters'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
