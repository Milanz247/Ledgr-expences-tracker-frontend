'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, Edit, Trash2, Power, TrendingUp, Layers, Activity, ArrowRight, Zap, Loader2 } from 'lucide-react';
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

  // Confirm Modal State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) return;

      const filterParam = filter === 'all' ? '' : `?is_active=${filter === 'active' ? 1 : 0}`;
      const transactionsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions${filterParam}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.data || []);
      }

      const upcomingRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions-upcoming?days=7`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (upcomingRes.ok) {
        const upcomingData = await upcomingRes.json();
        setUpcomingBills(upcomingData.data || []);
      }
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
      toast.error('Failed to load recurring transactions');
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
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories((data.data || data || []).filter((cat: any) => cat.type === 'expense'));
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchPaymentSources = async () => {
    try {
      setPaymentSourcesLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const [banksRes, fundsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/bank-accounts`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/fund-sources`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      if (banksRes.ok) {
        const banksData = await banksRes.json();
        setBankAccounts(banksData.data || banksData || []);
      }
      if (fundsRes.ok) {
        const fundsData = await fundsRes.json();
        setFundSources(fundsData.data || fundsData || []);
      }
    } catch (error) {
      console.error('Error fetching payment sources:', error);
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
      if (formData.bank_account_id) payload.bank_account_id = parseInt(formData.bank_account_id);
      if (formData.fund_source_id) payload.fund_source_id = parseInt(formData.fund_source_id);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setCreateDialogOpen(false);
        setFormData({
            name: '', description: '', category_id: '', bank_account_id: '', fund_source_id: '',
            amount: '', frequency: 'monthly', day_of_month: '1', start_date: new Date().toISOString().split('T')[0], notify_3_days_before: true
        });
        fetchData();
        toast.success('Subscription created successfully');
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to create subscription');
      }
    } catch (error) {
      toast.error('Failed to create subscription');
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
        bank_account_id: formData.bank_account_id ? parseInt(formData.bank_account_id) : null,
        fund_source_id: formData.fund_source_id ? parseInt(formData.fund_source_id) : null,
      };
      if (formData.frequency === 'monthly') payload.day_of_month = parseInt(formData.day_of_month);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions/${editingTransaction.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditDialogOpen(false);
        setEditingTransaction(null);
        fetchData();
        toast.success('Subscription updated successfully');
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to update subscription');
      }
    } catch (error) {
      toast.error('Failed to update subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (transactionId: number) => {
    setDeleteId(transactionId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        fetchData();
        toast.success('Subscription deleted');
      } else {
        toast.error('Failed to delete subscription');
      }
    } catch (error) {
      toast.error('Error deleting subscription');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (transactionId: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions/${transactionId}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        fetchData();
        toast.success(currentStatus ? 'Subscription paused' : 'Subscription activated');
      } else {
        toast.error('Failed to toggle status');
      }
    } catch (error) {
      toast.error('Error toggling status');
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

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Metrics Logic
  const activeSubs = transactions.filter(t => t.is_active);
  const inactiveSubs = transactions.filter(t => !t.is_active);
  const totalMonthlyCommitment = activeSubs.reduce((sum, t) => {
      // Simplified approximation for monthly impact
      if (t.frequency === 'monthly') return sum + t.amount;
      if (t.frequency === 'weekly') return sum + (t.amount * 4.33);
      if (t.frequency === 'daily') return sum + (t.amount * 30);
      if (t.frequency === 'yearly') return sum + (t.amount / 12);
      return sum;
    }, 0);
  const next7DaysOutflow = upcomingBills.reduce((sum, b) => sum + b.amount, 0);
  const savingsOpportunity = inactiveSubs.reduce((sum, t) => sum + t.amount, 0); // Crude total of inactive

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-20 animate-in fade-in duration-500">
      <div className="max-w-[1920px] mx-auto p-4 lg:p-6 space-y-8">
        
        {/* 1. Slim Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                <RefreshCw className="h-6 w-6 text-zinc-400" />
                Recurring Hub
            </h1>
             <Button onClick={() => setCreateDialogOpen(true)} className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10">
                <Plus className="h-4 w-4 mr-2" />
                New Subscription
            </Button>
        </div>

        {/* 2. Micro-Metrics Bento Grid */}
        <div className="grid grid-cols-3 gap-3 lg:gap-4">
             {/* Metric 1 */}
            <div className="bg-white border border-zinc-200/60 rounded-xl p-4 flex flex-col justify-between h-[100px]">
                <div className="flex items-center gap-2 text-zinc-500">
                    <Layers className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Active Subs</span>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-zinc-900 font-mono tracking-tight">{activeSubs.length}</div>
            </div>
             {/* Metric 2 */}
            <div className="bg-white border border-zinc-200/60 rounded-xl p-4 flex flex-col justify-between h-[100px]">
                <div className="flex items-center gap-2 text-zinc-500">
                    <Activity className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Monthly Commitment</span>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-zinc-900 font-mono tracking-tight">
                    <CurrencyDisplay amount={totalMonthlyCommitment} />
                </div>
            </div>
             {/* Metric 3 */}
            <div className="bg-white border border-zinc-200/60 rounded-xl p-4 flex flex-col justify-between h-[100px]">
                <div className="flex items-center gap-2 text-zinc-500">
                    <TrendingUp className="h-3.5 w-3.5 text-rose-500" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500/80">Next 7 Days Outflow</span>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-rose-600 font-mono tracking-tight">
                     <CurrencyDisplay amount={next7DaysOutflow} />
                </div>
            </div>
        </div>

        {/* 3. Glassmorphic Timeline */}
        {upcomingBills.length > 0 && (
            <div className="relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-zinc-200 rounded-full flex items-center justify-center z-10 shadow-sm">
                    <Clock className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="ml-4 pl-8 flex gap-3 overflow-x-auto pb-4 scrollbar-hide mask-fade-right">
                    {upcomingBills.map(bill => {
                        const days = getDaysUntilDue(bill.next_due_date);
                        const isToday = days === 0;
                        return (
                            <div key={bill.id} className={cn(
                                "flex items-center gap-3 pl-1 pr-4 py-1.5 rounded-full border whitespace-nowrap backdrop-blur-sm transition-all hover:scale-105 select-none cursor-default",
                                isToday ? "bg-emerald-50/50 border-emerald-200 text-emerald-900" : "bg-white/60 border-zinc-200 text-zinc-600"
                            )}>
                                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold", isToday ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500")}>
                                    {new Date(bill.next_due_date).getDate()}
                                </div>
                                <span className="text-xs font-semibold">{bill.name}</span>
                                <span className={cn("text-[10px] uppercase tracking-wider font-medium", isToday ? "text-emerald-500" : "text-zinc-400")}>
                                    {isToday ? 'Today' : `In ${days}d`}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        )}

        {/* 4. Filter Tabs */}
        <div className="flex items-center gap-6 border-b border-zinc-200/60 px-1">
            {['active', 'inactive', 'all'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setFilter(tab as any)}
                    className={cn(
                        "pb-3 text-xs font-bold uppercase tracking-wider transition-all",
                        filter === tab ? "text-zinc-900 border-b-2 border-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* 5. Technical Inventory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {transactions.length === 0 ? (
                 <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                    <RefreshCw className="h-10 w-10 mb-3 opacity-20" />
                    <p className="text-sm font-medium">No subscriptions in this view</p>
                 </div>
            ) : (
                transactions.map((t) => (
                    <div key={t.id} className="group relative bg-white border border-zinc-200/60 rounded-xl p-5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50 transition-all duration-300">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.category.color }} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-900 leading-tight">{t.name}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                         <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-zinc-200 text-zinc-500 uppercase tracking-wider">
                                            {t.frequency.substring(0, 3)}
                                         </Badge>
                                         <span className="text-[10px] text-zinc-400 truncate max-w-[100px]">{t.category.name}</span>
                                    </div>
                                </div>
                            </div>
                            <Switch 
                                checked={t.is_active} 
                                onCheckedChange={() => handleToggleActive(t.id, t.is_active)}
                                className="scale-75 data-[state=checked]:bg-zinc-900"
                            />
                        </div>

                        {/* Data Grid */}
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-t border-zinc-100 pt-3">
                            <div>
                                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5">Amount</p>
                                <p className="text-sm font-bold text-zinc-900 font-mono"><CurrencyDisplay amount={t.amount} /></p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5">Next Due</p>
                                <p className={cn("text-sm font-medium font-mono", getDaysUntilDue(t.next_due_date) <= 3 ? "text-amber-600" : "text-zinc-700")}>
                                    {new Date(t.next_due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5">Source</p>
                                <div className="flex items-center gap-1.5">
                                   <DollarSign className="h-3 w-3 text-zinc-300" />
                                   <p className="text-[10px] font-medium text-zinc-600 truncate max-w-[80px]">
                                       {t.bank_account?.name || t.fund_source?.name || '---'}
                                   </p>
                                </div>
                            </div>
                        </div>

                        {/* Hover Actions */}
                        {/* Mobile Direct Actions (Always visible on mobile, hover on desktop) */}
                        <div className="absolute top-4 right-14 flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                             <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400 hover:text-zinc-900" onClick={() => openEditDialog(t)}>
                                <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400 hover:text-rose-600" onClick={() => handleDeleteClick(t.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Create/Edit Modal */}
        <ResponsiveModal open={createDialogOpen || editDialogOpen} onOpenChange={(open) => {
            if (!open) {
                setCreateDialogOpen(false);
                setEditDialogOpen(false);
            }
        }}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>{editDialogOpen ? 'Edit Subscription' : 'New Subscription'}</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Details for this recurring expense.
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <form onSubmit={editDialogOpen ? handleEditRecurring : handleCreateRecurring} className="flex flex-col h-full">
            <ResponsiveModalBody className="max-h-[85vh] overflow-y-auto px-5 py-4 pb-10 sm:px-0 sm:py-0 sm:pb-0 space-y-4">
              <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                          <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Name</label>
                          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900" placeholder="e.g. Netflix" />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                          <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Category</label>
                          <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm">
                              <option value="">Select</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Amount</label>
                          <input type="number" required min="0" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-mono" placeholder="0.00" />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                          <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Frequency</label>
                           <select required value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm">
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                          </select>
                      </div>
                      <div className="space-y-1">
                           <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Next Date</label>
                           <input type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm" />
                      </div>
                  </div>
                   <div className="space-y-1">
                          <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Payment Source (Optional)</label>
                          <p className="text-[10px] text-zinc-500 mb-2">Select the source this subscription will be paid from.</p>
                          <div className="grid grid-cols-2 gap-2">
                              <Select 
                                value={formData.bank_account_id} 
                                onValueChange={(v) => setFormData({...formData, bank_account_id: v === 'none' ? '' : v, fund_source_id: ''})}
                              >
                                  <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 h-10 text-sm">
                                      <SelectValue placeholder="Select Bank Account" />
                                  </SelectTrigger>
                                  <SelectContent className="z-[100]">
                                      <SelectItem value="none">None</SelectItem>
                                      {bankAccounts.map(b => (
                                          <SelectItem key={b.id} value={b.id.toString()}>
                                              {b.bank_name} <span className="text-zinc-400 text-xs ml-1 font-mono">- {b.account_number}</span>
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>

                              <Select 
                                value={formData.fund_source_id} 
                                onValueChange={(v) => setFormData({...formData, fund_source_id: v === 'none' ? '' : v, bank_account_id: ''})}
                              >
                                  <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 h-10 text-sm">
                                      <SelectValue placeholder="Select Fund Source" />
                                  </SelectTrigger>
                                  <SelectContent className="z-[100]">
                                      <SelectItem value="none">None</SelectItem>
                                      {fundSources.map(f => (
                                          <SelectItem key={f.id} value={f.id.toString()}>{f.name || f.source_name}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>
                      </div>
                   </div>
              </div>
            </ResponsiveModalBody>
            <ResponsiveModalFooter className="flex flex-row gap-3 p-4 sm:p-6 bg-zinc-50/50 border-t border-zinc-200">
                <Button type="button" variant="outline" onClick={() => {setCreateDialogOpen(false); setEditDialogOpen(false);}} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800">
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (editDialogOpen ? 'Update' : 'Create')}
                </Button>
            </ResponsiveModalFooter>
          </form>
        </ResponsiveModalContent>
      </ResponsiveModal>

      <ConfirmModal 
        open={deleteModalOpen} 
        onOpenChange={setDeleteModalOpen} 
        title="Delete Subscription?"
        description="This will permanently remove this recurring transaction. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />


      </div>
    </div>
  );
}