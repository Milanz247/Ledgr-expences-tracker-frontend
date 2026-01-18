'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, AlertTriangle, CheckCircle2, PiggyBank, Edit, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalBody,
  ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';

interface Budget {
  id: number;
  category: {
    id: number;
    name: string;
    color: string;
  };
  amount: number;
  spent: number;
  rollover_amount: number;
  rollover_enabled: boolean;
  month: number;
  year: number;
  alert_at_90_percent: boolean;
  total_budget: number;
  remaining: number;
  percentage_used: number;
  is_near_limit: boolean;
  is_exceeded: boolean;
}

interface BudgetOverview {
  total_budgeted: number;
  total_spent: number;
  total_remaining: number;
  percentage_used: number;
  warnings: Array<{
    category_name: string;
    message: string;
  }>;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [overview, setOverview] = useState<BudgetOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    rollover_enabled: false,
    alert_at_90_percent: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No token found');
        return;
      }

      // Fetch budgets
      const budgetsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/budgets?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        }
      );

      if (!budgetsRes.ok) {
        console.error('Budgets fetch failed:', budgetsRes.status, budgetsRes.statusText);
        setBudgets([]);
      } else {
        const budgetsData = await budgetsRes.json();
        console.log('Budgets response:', budgetsData);
        const budgetsList = budgetsData.data || budgetsData || [];
        setBudgets(Array.isArray(budgetsList) ? budgetsList : []);
        console.log('Budgets loaded:', budgetsList.length);
      }

      // Fetch overview
      const overviewRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/budgets-overview?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        }
      );

      if (!overviewRes.ok) {
        console.error('Overview fetch failed:', overviewRes.status, overviewRes.statusText);
      } else {
        const overviewData = await overviewRes.json();
        console.log('Overview response:', overviewData);
        setOverview(overviewData.data || overviewData);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [selectedMonth, selectedYear]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      const data = await res.json();
      // Filter only expense categories
      const expenseCategories = (data.data || data || []).filter((cat: any) => cat.type === 'expense');
      setCategories(expenseCategories);
      console.log('Loaded categories:', expenseCategories.length);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          month: selectedMonth,
          year: selectedYear,
          amount: parseFloat(formData.amount),
        }),
      });

      if (res.ok) {
        setCreateDialogOpen(false);
        setFormData({
          category_id: '',
          amount: '',
          rollover_enabled: false,
          alert_at_90_percent: true,
        });
        fetchData();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to create budget');
      }
    } catch (error) {
      console.error('Error creating budget:', error);
      alert('Failed to create budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets/${editingBudget.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          rollover_enabled: formData.rollover_enabled,
          alert_at_90_percent: formData.alert_at_90_percent,
        }),
      });

      if (res.ok) {
        setEditDialogOpen(false);
        setEditingBudget(null);
        setFormData({
          category_id: '',
          amount: '',
          rollover_enabled: false,
          alert_at_90_percent: true,
        });
        fetchData();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to update budget');
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Failed to update budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = async (budgetId: number) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets/${budgetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to delete budget');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget');
    }
  };

  const openEditDialog = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category_id: budget.category.id.toString(),
      amount: budget.amount.toString(),
      rollover_enabled: budget.rollover_enabled,
      alert_at_90_percent: budget.alert_at_90_percent,
    });
    setEditDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  const getStatusColor = (budget: Budget) => {
    if (budget.is_exceeded) return 'text-red-600';
    if (budget.is_near_limit) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 90) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Budget Manager</h1>
          <p className="text-slate-600 mt-1">Track your spending against monthly budgets</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Budget
        </Button>
      </div>

      {/* Month/Year Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {[2024, 2025, 2026, 2027].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="py-3 sm:py-6">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6">
              <CardDescription className="text-xs sm:text-sm">Total Budgeted</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <p className="text-lg sm:text-2xl font-bold text-slate-900">
                {formatCurrency(overview.total_budgeted)}
              </p>
            </CardContent>
          </Card>

          <Card className="py-3 sm:py-6">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6">
              <CardDescription className="text-xs sm:text-sm">Total Spent</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <p className="text-lg sm:text-2xl font-bold text-slate-900">
                {formatCurrency(overview.total_spent)}
              </p>
            </CardContent>
          </Card>

          <Card className="py-3 sm:py-6">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6">
              <CardDescription className="text-xs sm:text-sm">Remaining</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                {formatCurrency(overview.total_remaining)}
              </p>
            </CardContent>
          </Card>

          <Card className="py-3 sm:py-6">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6">
              <CardDescription className="text-xs sm:text-sm">Overall Usage</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <p className="text-lg sm:text-2xl font-bold text-slate-900">
                {overview.percentage_used.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Warnings */}
      {overview && overview.warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 py-3 sm:py-6">
          <CardHeader className="px-4 sm:px-6 pb-2">
            <CardTitle className="flex items-center gap-2 text-yellow-900 text-sm sm:text-base">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              Budget Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 sm:px-6">
            {overview.warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-2 text-xs sm:text-sm text-yellow-800">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                <span><strong>{warning.category_name}:</strong> {warning.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Budget List */}
      <div className="grid gap-3 sm:gap-4">
        {budgets.length === 0 ? (
          <Card className="py-6 sm:py-6">
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
              <PiggyBank className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mb-3 sm:mb-4" />
              <p className="text-slate-600 text-center text-sm sm:text-base">
                No budgets set for {monthNames[selectedMonth - 1]} {selectedYear}
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="mt-4 text-xs sm:text-sm h-9 sm:h-10">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Create Your First Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => (
            <Card key={budget.id} className="hover:shadow-md transition-shadow py-3 sm:py-6">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                      style={{ backgroundColor: budget.category.color }}
                    />
                    <div>
                      <CardTitle className="text-base sm:text-lg">{budget.category.name}</CardTitle>
                      <CardDescription className="text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                        {budget.rollover_enabled && budget.rollover_amount > 0 && (
                          <span className="text-green-600">
                            +{formatCurrency(budget.rollover_amount)} rollover
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-right">
                      <p className={`text-base sm:text-lg font-bold ${getStatusColor(budget)}`}>
                        {budget.percentage_used.toFixed(0)}%
                      </p>
                      {budget.is_exceeded ? (
                        <span className="text-[10px] sm:text-xs text-red-600 font-medium">Over Budget</span>
                      ) : budget.is_near_limit ? (
                        <span className="text-[10px] sm:text-xs text-yellow-600 font-medium">Near Limit</span>
                      ) : (
                        <span className="text-[10px] sm:text-xs text-green-600 font-medium">On Track</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(budget)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6">
                <div className="relative">
                  <Progress
                    value={Math.min(budget.percentage_used, 100)}
                    className="h-2 sm:h-3"
                  />
                  <div
                    className={`absolute top-0 left-0 h-2 sm:h-3 rounded-full ${getProgressColor(budget.percentage_used)}`}
                    style={{ width: `${Math.min(budget.percentage_used, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs sm:text-sm">
                  <div>
                    <p className="text-slate-600">Spent</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(budget.spent)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-600">Budget</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(budget.total_budget)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-600">Remaining</p>
                    <p className={`font-semibold ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(budget.remaining)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Budget Dialog */}
      <ResponsiveModal open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Create New Budget</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Set a monthly spending limit for a category
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <form onSubmit={handleCreateBudget} className="flex flex-col h-full">
            <ResponsiveModalBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={categoriesLoading}
              >
                <option value="">{categoriesLoading ? 'Loading...' : 'Select a category'}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {!categoriesLoading && categories.length === 0 && (
                <p className="text-xs text-red-600 mt-1">No expense categories found. Please create one first.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Budget Amount (LKR) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="10000.00"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rollover_enabled}
                  onChange={(e) => setFormData({ ...formData, rollover_enabled: e.target.checked })}
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-slate-700">
                  Enable rollover (carry unused budget to next month)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.alert_at_90_percent}
                  onChange={(e) => setFormData({ ...formData, alert_at_90_percent: e.target.checked })}
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-slate-700">
                  Alert me at 90% budget usage
                </span>
              </label>
            </div>
            </ResponsiveModalBody>

            <ResponsiveModalFooter className="flex flex-col sm:flex-row gap-3 border-t border-zinc-200/60 bg-zinc-50/50 p-4 sm:p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                className="w-full sm:w-auto sm:flex-1 lg:flex-none h-12 lg:h-10 border-zinc-300 hover:bg-zinc-100"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto sm:flex-1 lg:flex-none h-12 lg:h-10 bg-zinc-900 hover:bg-zinc-800 text-white" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Budget'}
              </Button>
            </ResponsiveModalFooter>
          </form>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Edit Budget Dialog */}
      <ResponsiveModal open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Edit Budget</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Update your budget settings
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <form onSubmit={handleEditBudget} className="flex flex-col h-full">
            <ResponsiveModalBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={editingBudget?.category.name || ''}
                disabled
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
              />
              <p className="text-xs text-slate-500 mt-1">Category cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Budget Amount (LKR) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="10000.00"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rollover_enabled}
                  onChange={(e) => setFormData({ ...formData, rollover_enabled: e.target.checked })}
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-slate-700">
                  Enable rollover (carry unused budget to next month)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.alert_at_90_percent}
                  onChange={(e) => setFormData({ ...formData, alert_at_90_percent: e.target.checked })}
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-slate-700">
                  Alert me at 90% budget usage
                </span>
              </label>
            </div>
            </ResponsiveModalBody>

            <ResponsiveModalFooter className="flex flex-col sm:flex-row gap-3 border-t border-zinc-200/60 bg-zinc-50/50 p-4 sm:p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setEditingBudget(null);
                }}
                className="w-full sm:w-auto sm:flex-1 lg:flex-none h-12 lg:h-10 border-zinc-300 hover:bg-zinc-100"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto sm:flex-1 lg:flex-none h-12 lg:h-10 bg-zinc-900 hover:bg-zinc-800 text-white" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Budget'}
              </Button>
            </ResponsiveModalFooter>
          </form>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
