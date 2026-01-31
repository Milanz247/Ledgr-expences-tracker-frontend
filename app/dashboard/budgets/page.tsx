'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, AlertTriangle, PieChart, Edit, Trash2, Loader2, Layers, Activity } from 'lucide-react';
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
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { cn } from '@/lib/utils';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { toast } from 'sonner';

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

  // Confirm Modal State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        const budgetsList = budgetsData.data || budgetsData || [];
        setBudgets(Array.isArray(budgetsList) ? budgetsList : []);
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
      const expenseCategories = (data.data || data || []).filter((cat: any) => cat.type === 'expense');
      setCategories(expenseCategories);
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
        toast.success('Budget created successfully');
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
        toast.error(error.message || 'Failed to create budget');
      }
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
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
        toast.success('Budget updated successfully');
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
        toast.error(error.message || 'Failed to update budget');
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (budgetId: number) => {
    setDeleteId(budgetId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        toast.success('Budget deleted successfully');
        fetchData();
        setDeleteModalOpen(false);
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to delete budget');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-rose-600';
    if (percentage >= 90) return 'bg-yellow-500';
    return 'bg-zinc-900';
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-20 animate-in fade-in duration-500">
      <div className="max-w-[1920px] mx-auto p-4 lg:p-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <PieChart className="h-6 w-6 text-zinc-400" />
            Budgets Hub
          </h1>
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10">
            <Plus className="h-4 w-4 mr-2" />
            New Budget
          </Button>
        </div>

        {/* Month/Year Selector */}
        <div className="bg-white border border-zinc-200/60 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {[2024, 2025, 2026, 2027].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Micro-Metrics Bento Grid */}
        {overview && (
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
            {/* Total Budgeted */}
            <div className="bg-white border border-zinc-200/60 rounded-xl p-4 flex flex-col justify-between h-[100px]">
              <div className="flex items-center gap-2 text-zinc-500">
                <PieChart className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500/80">Budgeted</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-blue-600 font-mono tracking-tight">
                <CurrencyDisplay amount={overview.total_budgeted} />
              </div>
            </div>

            {/* Total Spent */}
            <div className="bg-white border border-zinc-200/60 rounded-xl p-4 flex flex-col justify-between h-[100px]">
              <div className="flex items-center gap-2 text-zinc-500">
                <TrendingUp className="h-3.5 w-3.5 text-rose-500" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500/80">Spent</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-rose-600 font-mono tracking-tight">
                <CurrencyDisplay amount={overview.total_spent} />
              </div>
            </div>

            {/* Total Remaining */}
            <div className="bg-white border border-zinc-200/60 rounded-xl p-4 flex flex-col justify-between h-[100px]">
              <div className="flex items-center gap-2 text-zinc-500">
                <Activity className="h-3.5 w-3.5 text-green-500" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-green-500/80">Remaining</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-green-600 font-mono tracking-tight">
                <CurrencyDisplay amount={overview.total_remaining} />
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {overview && overview.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200/60 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <h3 className="text-sm font-bold text-yellow-900 uppercase tracking-wide">Budget Alerts</h3>
            </div>
            <div className="space-y-2">
              {overview.warnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-2 text-xs text-yellow-800">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span><strong>{warning.category_name}:</strong> {warning.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
              <PieChart className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">No budgets for {monthNames[selectedMonth - 1]} {selectedYear}</p>
              <Button onClick={() => setCreateDialogOpen(true)} className="mt-4 bg-zinc-900 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create First Budget
              </Button>
            </div>
          ) : (
            budgets.map((budget) => {
              const percentage = Math.min(budget.percentage_used, 100);
              
              return (
                <div key={budget.id} className="group relative bg-white border border-zinc-200/60 rounded-xl p-5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50 transition-all duration-300">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-10 w-10 rounded-lg border flex items-center justify-center"
                        style={{ 
                          backgroundColor: `${budget.category.color}20`,
                          borderColor: budget.category.color
                        }}
                      >
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: budget.category.color }}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 leading-tight">{budget.category.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn(
                            "text-[9px] px-1.5 py-0 h-4 border rounded uppercase tracking-wider font-bold",
                            budget.is_exceeded ? "bg-red-50 text-red-700 border-red-200" :
                            budget.is_near_limit ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                            "bg-green-50 text-green-700 border-green-200"
                          )}>
                            {budget.is_exceeded ? 'Over' : budget.is_near_limit ? 'Near Limit' : 'On Track'}
                          </span>
                          {budget.rollover_enabled && budget.rollover_amount > 0 && (
                            <span className="text-[10px] text-green-600">
                              +<CurrencyDisplay amount={budget.rollover_amount} /> rollover
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Data Grid */}
                  <div className="grid grid-cols-3 gap-y-3 gap-x-4 border-t border-zinc-100 pt-3">
                    <div>
                      <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5">Spent</p>
                      <p className="text-sm font-bold text-rose-600 font-mono">
                        <CurrencyDisplay amount={budget.spent} />
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5">Budget</p>
                      <p className="text-sm font-bold text-zinc-900 font-mono">
                        <CurrencyDisplay amount={budget.total_budget} />
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5">Left</p>
                      <p className={cn(
                        "text-sm font-bold font-mono",
                        budget.remaining >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        <CurrencyDisplay amount={budget.remaining} />
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 pt-3 border-t border-zinc-100">
                    <div className="flex justify-between text-[9px] text-zinc-400 uppercase tracking-widest mb-1.5">
                      <span>Progress</span>
                      <span className="font-bold text-zinc-600">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", getProgressColor(budget.percentage_used))}
                        style={{width: `${percentage}%`}} 
                      />
                    </div>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50" 
                      onClick={() => openEditDialog(budget)}
                      title="Edit"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7 text-zinc-400 hover:text-rose-600 hover:bg-rose-50" 
                      onClick={() => handleDeleteClick(budget.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
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
              <ResponsiveModalBody className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Category</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
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

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Budget Amount</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    placeholder="10000.00"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rollover_enabled}
                      onChange={(e) => setFormData({ ...formData, rollover_enabled: e.target.checked })}
                      className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                    />
                    <span className="text-xs text-zinc-700">
                      Enable rollover (carry unused budget to next month)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.alert_at_90_percent}
                      onChange={(e) => setFormData({ ...formData, alert_at_90_percent: e.target.checked })}
                      className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                    />
                    <span className="text-xs text-zinc-700">
                      Alert me at 90% budget usage
                    </span>
                  </label>
                </div>
              </ResponsiveModalBody>

              <ResponsiveModalFooter className="flex flex-row gap-3 p-4 sm:p-6 bg-zinc-50/50 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : 'Create Budget'}
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
              <ResponsiveModalBody className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Category</label>
                  <input
                    type="text"
                    value={editingBudget?.category.name || ''}
                    disabled
                    className="w-full h-10 px-3 bg-zinc-100 border border-zinc-200 rounded-md text-sm text-zinc-600"
                  />
                  <p className="text-xs text-zinc-500">Category cannot be changed</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Budget Amount</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    placeholder="10000.00"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rollover_enabled}
                      onChange={(e) => setFormData({ ...formData, rollover_enabled: e.target.checked })}
                      className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                    />
                    <span className="text-xs text-zinc-700">
                      Enable rollover (carry unused budget to next month)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.alert_at_90_percent}
                      onChange={(e) => setFormData({ ...formData, alert_at_90_percent: e.target.checked })}
                      className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                    />
                    <span className="text-xs text-zinc-700">
                      Alert me at 90% budget usage
                    </span>
                  </label>
                </div>
              </ResponsiveModalBody>

              <ResponsiveModalFooter className="flex flex-row gap-3 p-4 sm:p-6 bg-zinc-50/50 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setEditingBudget(null);
                  }}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : 'Update Budget'}
                </Button>
              </ResponsiveModalFooter>
            </form>
          </ResponsiveModalContent>
        </ResponsiveModal>

        <ConfirmModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title="Delete Budget?"
          description="Are you sure you want to delete this budget? This will remove the spending limit for this category for this month."
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}
