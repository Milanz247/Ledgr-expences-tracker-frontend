'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, Edit, Trash2, Power } from 'lucide-react';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalBody,
  ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';

interface RecurringTransaction {
  id: number;
  name: string;
  description: string | null;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  last_processed_date: string | null;
  is_active: boolean;
  notify_3_days_before: boolean;
  category: {
    id: number;
    name: string;
    color: string;
  };
  bank_account: {
    id: number;
    name: string;
  } | null;
  fund_source: {
    id: number;
    name: string;
  } | null;
  start_date: string;
  end_date: string | null;
}

export default function RecurringPage() {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [fundSources, setFundSources] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    bank_account_id: '',
    fund_source_id: '',
    amount: '',
    frequency: 'monthly',
    day_of_month: '1',
    start_date: new Date().toISOString().split('T')[0],
    notify_3_days_before: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [paymentSourcesLoading, setPaymentSourcesLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No token found');
        return;
      }

      // Fetch all recurring transactions
      const filterParam = filter === 'all' ? '' : `?is_active=${filter === 'active' ? 1 : 0}`;
      const transactionsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions${filterParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        }
      );

      if (!transactionsRes.ok) {
        console.error('Transactions fetch failed:', transactionsRes.status, transactionsRes.statusText);
        setTransactions([]);
      } else {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.data || []);
      }

      // Fetch upcoming bills (next 7 days)
      const upcomingRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions-upcoming?days=7`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        }
      );

      if (!upcomingRes.ok) {
        console.error('Upcoming bills fetch failed:', upcomingRes.status, upcomingRes.statusText);
        setUpcomingBills([]);
      } else {
        const upcomingData = await upcomingRes.json();
        setUpcomingBills(upcomingData.data || []);
      }
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchPaymentSources();
  }, [filter]);

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

  const fetchPaymentSources = async () => {
    try {
      setPaymentSourcesLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No token found');
        return;
      }

      const [banksRes, fundsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/bank-accounts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/fund-sources`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
      ]);

      if (banksRes.ok) {
        const banksData = await banksRes.json();
        const banks = banksData.data || banksData || [];
        setBankAccounts(Array.isArray(banks) ? banks : []);
        console.log('Loaded bank accounts:', banks.length);
      } else {
        console.error('Failed to fetch bank accounts:', banksRes.status);
        setBankAccounts([]);
      }

      if (fundsRes.ok) {
        const fundsData = await fundsRes.json();
        const funds = fundsData.data || fundsData || [];
        setFundSources(Array.isArray(funds) ? funds : []);
        console.log('Loaded fund sources:', funds.length);
      } else {
        console.error('Failed to fetch fund sources:', fundsRes.status);
        setFundSources([]);
      }
    } catch (error) {
      console.error('Error fetching payment sources:', error);
      setBankAccounts([]);
      setFundSources([]);
    } finally {
      setPaymentSourcesLoading(false);
    }
  };

  const handleCreateRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');

      const payload: any = {
        name: formData.name,
        description: formData.description || null,
        category_id: parseInt(formData.category_id),
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        start_date: formData.start_date,
        notify_3_days_before: formData.notify_3_days_before,
      };

      if (formData.frequency === 'monthly') {
        payload.day_of_month = parseInt(formData.day_of_month);
      }

      if (formData.bank_account_id) {
        payload.bank_account_id = parseInt(formData.bank_account_id);
      }

      if (formData.fund_source_id) {
        payload.fund_source_id = parseInt(formData.fund_source_id);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setCreateDialogOpen(false);
        setFormData({
          name: '',
          description: '',
          category_id: '',
          bank_account_id: '',
          fund_source_id: '',
          amount: '',
          frequency: 'monthly',
          day_of_month: '1',
          start_date: new Date().toISOString().split('T')[0],
          notify_3_days_before: true,
        });
        fetchData();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to create recurring transaction');
      }
    } catch (error) {
      console.error('Error creating recurring transaction:', error);
      alert('Failed to create recurring transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');

      const payload: any = {
        name: formData.name,
        description: formData.description || null,
        category_id: parseInt(formData.category_id),
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        start_date: formData.start_date,
        notify_3_days_before: formData.notify_3_days_before,
      };

      if (formData.frequency === 'monthly') {
        payload.day_of_month = parseInt(formData.day_of_month);
      }

      if (formData.bank_account_id) {
        payload.bank_account_id = parseInt(formData.bank_account_id);
      } else {
        payload.bank_account_id = null;
      }

      if (formData.fund_source_id) {
        payload.fund_source_id = parseInt(formData.fund_source_id);
      } else {
        payload.fund_source_id = null;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions/${editingTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditDialogOpen(false);
        setEditingTransaction(null);
        setFormData({
          name: '',
          description: '',
          category_id: '',
          bank_account_id: '',
          fund_source_id: '',
          amount: '',
          frequency: 'monthly',
          day_of_month: '1',
          start_date: new Date().toISOString().split('T')[0],
          notify_3_days_before: true,
        });
        fetchData();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to update recurring transaction');
      }
    } catch (error) {
      console.error('Error updating recurring transaction:', error);
      alert('Failed to update recurring transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecurring = async (transactionId: number) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions/${transactionId}`, {
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
        alert(error.message || 'Failed to delete recurring transaction');
      }
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      alert('Failed to delete recurring transaction');
    }
  };

  const handleToggleActive = async (transactionId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions/${transactionId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to toggle status');
    }
  };

  const openEditDialog = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
      name: transaction.name,
      description: transaction.description || '',
      category_id: transaction.category.id.toString(),
      bank_account_id: transaction.bank_account?.id.toString() || '',
      fund_source_id: transaction.fund_source?.id.toString() || '',
      amount: transaction.amount.toString(),
      frequency: transaction.frequency,
      day_of_month: transaction.frequency === 'monthly' ? new Date(transaction.next_due_date).getDate().toString() : '1',
      start_date: transaction.start_date,
      notify_3_days_before: transaction.notify_3_days_before,
    });
    setEditDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: 'bg-blue-100 text-blue-800',
      weekly: 'bg-green-100 text-green-800',
      monthly: 'bg-purple-100 text-purple-800',
      yearly: 'bg-orange-100 text-orange-800',
    };
    return colors[frequency as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  const totalMonthlyCommitment = transactions
    .filter(t => t.is_active)
    .reduce((sum, t) => {
      if (t.frequency === 'monthly') return sum + t.amount;
      if (t.frequency === 'weekly') return sum + (t.amount * 4.33);
      if (t.frequency === 'daily') return sum + (t.amount * 30);
      if (t.frequency === 'yearly') return sum + (t.amount / 12);
      return sum;
    }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading recurring transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Recurring Transactions</h1>
          <p className="text-slate-600 mt-1">Manage subscriptions and recurring expenses</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Recurring
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="py-3 sm:py-6">
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6">
            <CardDescription className="text-xs sm:text-sm">Active Subscriptions</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-lg sm:text-2xl font-bold text-slate-900">
              {transactions.filter(t => t.is_active).length}
            </p>
          </CardContent>
        </Card>

        <Card className="py-3 sm:py-6">
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6">
            <CardDescription className="text-xs sm:text-sm">Monthly Commitment</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-lg sm:text-2xl font-bold text-slate-900">
              {formatCurrency(totalMonthlyCommitment)}
            </p>
          </CardContent>
        </Card>

        <Card className="py-3 sm:py-6 col-span-2 sm:col-span-1">
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6">
            <CardDescription className="text-xs sm:text-sm">Upcoming (7 days)</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-lg sm:text-2xl font-bold text-orange-600">
              {upcomingBills.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bills Alert */}
      {upcomingBills.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 py-3 sm:py-6">
          <CardHeader className="px-4 sm:px-6 pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-900 text-sm sm:text-base">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              Upcoming Bills (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6">
            {upcomingBills.map((bill) => {
              const daysUntil = getDaysUntilDue(bill.next_due_date);
              return (
                <div key={bill.id} className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                      style={{ backgroundColor: bill.category.color }}
                    />
                    <div>
                      <p className="font-medium text-slate-900 text-sm sm:text-base">{bill.name}</p>
                      <p className="text-[10px] sm:text-xs text-slate-600">{bill.category.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-sm sm:text-base">{formatCurrency(bill.amount)}</p>
                    <p className="text-[10px] sm:text-xs text-orange-600">
                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            filter === 'active'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            filter === 'inactive'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Inactive
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            filter === 'all'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All
        </button>
      </div>

      {/* Transactions List */}
      <div className="grid gap-3 sm:gap-4">
        {transactions.length === 0 ? (
          <Card className="py-6 sm:py-6">
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
              <RefreshCw className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mb-3 sm:mb-4" />
              <p className="text-slate-600 text-center text-sm sm:text-base">
                No recurring transactions found
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="mt-4 text-xs sm:text-sm h-9 sm:h-10">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Add Your First Recurring Transaction
              </Button>
            </CardContent>
          </Card>
        ) : (
          transactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow py-3 sm:py-6">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                      style={{ backgroundColor: transaction.category.color }}
                    />
                    <div>
                      <CardTitle className="text-base sm:text-lg">{transaction.name}</CardTitle>
                      <CardDescription className="text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                        {transaction.description || transaction.category.name}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getFrequencyBadge(transaction.frequency)} text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-0.5`}>
                    {transaction.frequency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600">Amount</p>
                    <p className="text-lg sm:text-xl font-bold text-slate-900">{formatCurrency(transaction.amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-slate-600">Next Due</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900">{formatDate(transaction.next_due_date)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-600">
                    {transaction.bank_account && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {transaction.bank_account.name}
                      </span>
                    )}
                    {transaction.fund_source && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {transaction.fund_source.name}
                      </span>
                    )}
                    {transaction.last_processed_date && (
                      <span className="flex items-center gap-1 line-clamp-1 max-w-[80px] sm:max-w-none">
                        <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        Last: {formatDate(transaction.last_processed_date)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    {transaction.is_active ? (
                      <Badge className="bg-green-100 text-green-800 text-[10px] sm:text-xs px-1.5 py-0 sm:px-2.5 sm:py-0.5">
                        <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-800 text-[10px] sm:text-xs px-1.5 py-0 sm:px-2.5 sm:py-0.5">
                        <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(transaction.id)}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                      title={transaction.is_active ? 'Deactivate' : 'Activate'}
                    >
                      <Power className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${transaction.is_active ? 'text-green-600' : 'text-slate-400'}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(transaction)}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                    >
                      <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRecurring(transaction.id)}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Recurring Transaction Dialog */}
      <ResponsiveModal open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Create Recurring Transaction</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Set up automatic recurring expenses
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <form onSubmit={handleCreateRecurring} className="flex flex-col h-full">
            <ResponsiveModalBody className="space-y-3">
            {/* Row 1: Name + Description */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Netflix Subscription"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Monthly streaming"
                />
              </div>
            </div>

            {/* Row 2: Category + Amount */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={categoriesLoading}
                >
                  <option value="">{categoriesLoading ? 'Loading...' : 'Select'}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Amount (LKR) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="1500.00"
                />
              </div>
            </div>

            {/* Row 3: Frequency + Day/Start Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Frequency *
                </label>
                <select
                  required
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {formData.frequency === 'monthly' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Day of Month *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="31"
                    value={formData.day_of_month}
                    onChange={(e) => setFormData({ ...formData, day_of_month: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </div>

            {/* Row 4: Bank Account + Fund Source */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bank Account
                </label>
                <select
                  value={formData.bank_account_id}
                  onChange={(e) => setFormData({ ...formData, bank_account_id: e.target.value, fund_source_id: '' })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={paymentSourcesLoading}
                >
                  <option value="">{paymentSourcesLoading ? 'Loading...' : 'None'}</option>
                  {bankAccounts.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.bank_name || bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fund Source
                </label>
                <select
                  value={formData.fund_source_id}
                  onChange={(e) => setFormData({ ...formData, fund_source_id: e.target.value, bank_account_id: '' })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={paymentSourcesLoading}
                >
                  <option value="">{paymentSourcesLoading ? 'Loading...' : 'None'}</option>
                  {fundSources.map((fund) => (
                    <option key={fund.id} value={fund.id}>
                      {fund.source_name || fund.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notify_3_days_before}
                  onChange={(e) => setFormData({ ...formData, notify_3_days_before: e.target.checked })}
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-slate-700">
                  Notify 3 days before
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
                {submitting ? 'Creating...' : 'Create Recurring'}
              </Button>
            </ResponsiveModalFooter>
          </form>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Edit Recurring Transaction Dialog */}
      <ResponsiveModal open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Edit Recurring Transaction</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Update your recurring transaction settings
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <form onSubmit={handleEditRecurring} className="flex flex-col h-full">
            <ResponsiveModalBody className="space-y-3">
            {/* Row 1: Name + Description */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Netflix Subscription"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Monthly streaming"
                />
              </div>
            </div>

            {/* Row 2: Category + Amount */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={categoriesLoading}
                >
                  <option value="">{categoriesLoading ? 'Loading...' : 'Select'}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Amount (LKR) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="1500.00"
                />
              </div>
            </div>

            {/* Row 3: Frequency + Day/Start Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Frequency *
                </label>
                <select
                  required
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {formData.frequency === 'monthly' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Day of Month *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="31"
                    value={formData.day_of_month}
                    onChange={(e) => setFormData({ ...formData, day_of_month: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </div>

            {/* Row 4: Bank Account + Fund Source */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bank Account
                </label>
                <select
                  value={formData.bank_account_id}
                  onChange={(e) => setFormData({ ...formData, bank_account_id: e.target.value, fund_source_id: '' })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={paymentSourcesLoading}
                >
                  <option value="">{paymentSourcesLoading ? 'Loading...' : 'None'}</option>
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bank_name || acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fund Source
                </label>
                <select
                  value={formData.fund_source_id}
                  onChange={(e) => setFormData({ ...formData, fund_source_id: e.target.value, bank_account_id: '' })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={paymentSourcesLoading}
                >
                  <option value="">{paymentSourcesLoading ? 'Loading...' : 'None'}</option>
                  {fundSources.map((fund) => (
                    <option key={fund.id} value={fund.id}>
                      {fund.source_name || fund.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notify_3_days_before}
                  onChange={(e) => setFormData({ ...formData, notify_3_days_before: e.target.checked })}
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-slate-700">
                  Notify 3 days before
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
                  setEditingTransaction(null);
                }}
                className="w-full sm:w-auto sm:flex-1 lg:flex-none h-12 lg:h-10 border-zinc-300 hover:bg-zinc-100"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto sm:flex-1 lg:flex-none h-12 lg:h-10 bg-zinc-900 hover:bg-zinc-800 text-white" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Recurring'}
              </Button>
            </ResponsiveModalFooter>
          </form>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
