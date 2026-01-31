'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Plus, HandCoins, Trash2, Edit, DollarSign, Loader2, AlertCircle, History, Clock, TrendingUp, Layers, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface Loan {
  id: number;
  lender_name: string;
  amount: number;
  balance_remaining: number;
  description: string;
  status: 'unpaid' | 'partially_paid' | 'paid';
  due_date: string | null;
  created_at: string;
}

interface Repayment {
  id: number;
  amount: number;
  payment_date: string;
  description: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface BankAccount {
  id: number;
  bank_name: string;
  balance: number;
}

interface FundSource {
  id: number;
  source_name: string;
  amount: number;
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [fundSources, setFundSources] = useState<FundSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    lender_name: '',
    amount: '',
    description: '',
    due_date: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  // Repay Modal
  const [repayOpen, setRepayOpen] = useState(false);
  const [repayingLoan, setRepayingLoan] = useState<Loan | null>(null);
  const [repayData, setRepayData] = useState({
    amount: '',
    category_id: '',
    payment_source: 'bank',
    bank_account_id: '',
    fund_source_id: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  // History Modal
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Delete Modal
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total_debt: 0,
    paid_loans: 0,
    active_loans: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchLoans(),
        fetchStats(),
        fetchCategories(),
        fetchBankAccounts(),
        fetchFundSources(),
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans');
      setLoans(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/loans-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const data = response.data?.data || response.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const response = await api.get('/bank-accounts');
      const data = response.data?.data || response.data || [];
      setBankAccounts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error);
    }
  };

  const fetchFundSources = async () => {
    try {
      const response = await api.get('/fund-sources');
      const data = response.data?.data || response.data || [];
      setFundSources(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch fund sources:', error);
    }
  };

  const fetchLoanHistory = async (loanId: number) => {
    setLoadingHistory(true);
    try {
      const response = await api.get(`/loans/${loanId}/repayments`);
      setRepayments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch loan history:', error);
      toast.error('Failed to load loan history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editMode && editingId) {
        await api.put(`/loans/${editingId}`, {
          lender_name: formData.lender_name,
          amount: parseFloat(formData.amount),
          description: formData.description,
          due_date: formData.due_date || null,
        });
        toast.success('Loan updated successfully');
      } else {
        await api.post('/loans', {
          lender_name: formData.lender_name,
          amount: parseFloat(formData.amount),
          description: formData.description,
          due_date: formData.due_date || null,
        });
        toast.success('Loan added successfully');
      }

      await fetchData();
      setDialogOpen(false);
      setEditMode(false);
      setEditingId(null);
      setFormData({ lender_name: '', amount: '', description: '', due_date: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} loan`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (loan: Loan) => {
    setEditMode(true);
    setEditingId(loan.id);
    setFormData({
      lender_name: loan.lender_name,
      amount: loan.amount.toString(),
      description: loan.description || '',
      due_date: loan.due_date ? format(new Date(loan.due_date), 'yyyy-MM-dd') : '',
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/loans/${deleteId}`);
      toast.success('Loan deleted successfully');
      await fetchData();
      setDeleteModalOpen(false);
    } catch (error: any) {
      if (error.response?.status === 422) {
        // Expected error for loans with history - just show toast, no console error
        toast.error('Cannot Delete Loan', {
          description: 'This loan has associated transaction history. Please delete the repayments specifically from the History view first.',
          duration: 5000,
        });
      } else {
        // Log unexpected errors
        console.error('Failed to delete loan:', error);
        toast.error(error.response?.data?.message || 'Failed to delete loan');
      }
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleRepayClick = (loan: Loan) => {
    setRepayingLoan(loan);
    setRepayData({
      amount: '',
      category_id: '',
      payment_source: 'bank',
      bank_account_id: '',
      fund_source_id: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setRepayOpen(true);
  };

  const handleHistoryClick = (loan: Loan) => {
    setSelectedLoan(loan);
    fetchLoanHistory(loan.id);
    setHistoryOpen(true);
  };

  const handleRepaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayingLoan) return;

    setSubmitting(true);
    try {
      const payload: any = {
        amount: parseFloat(repayData.amount),
        category_id: parseInt(repayData.category_id),
        date: repayData.date,
        description: repayData.description || `Repayment to ${repayingLoan.lender_name}`,
      };

      if (repayData.payment_source === 'bank' && repayData.bank_account_id) {
        payload.bank_account_id = parseInt(repayData.bank_account_id);
      } else if (repayData.payment_source === 'wallet' && repayData.fund_source_id) {
        payload.fund_source_id = parseInt(repayData.fund_source_id);
      }

      await api.post(`/loans/${repayingLoan.id}/repay`, payload);
      toast.success('Repayment recorded successfully');
      
      await fetchData();
      setRepayOpen(false);
      setRepayingLoan(null);
    } catch (error: any) {
      console.error('Failed to process repayment:', error);
      toast.error(error.response?.data?.message || 'Failed to process repayment');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'partially_paid':
        return 'Partial';
      default:
        return 'Unpaid';
    }
  };

  const getPaymentPercentage = (loan: Loan) => {
    if (loan.amount === 0) return 0;
    const paid = loan.amount - loan.balance_remaining;
    return Math.round((paid / loan.amount) * 100);
  };

  const filterLoansByStatus = (status: string) => {
    if (status === 'active') return loans.filter(l => l.status === 'unpaid' || l.status === 'partially_paid');
    return loans.filter(l => l.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  const activeLoans = filterLoansByStatus('active');
  const paidLoans = filterLoansByStatus('paid');
  const avgBalance = activeLoans.length > 0 ? activeLoans.reduce((sum, l) => sum + l.balance_remaining, 0) / activeLoans.length : 0;

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-20 animate-in fade-in duration-500">
      <div className="max-w-[1920px] mx-auto p-4 lg:p-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <HandCoins className="h-6 w-6 text-zinc-400" />
            Loans Hub
          </h1>
          <Button onClick={() => setDialogOpen(true)} className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10">
            <Plus className="h-4 w-4 mr-2" />
            New Loan
          </Button>
        </div>

        {/* Total Debt Card */}
        <Card className="border-rose-200/60 bg-gradient-to-br from-rose-50/80 to-rose-100/40">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-rose-600">Total Debt</p>
                <p className="text-2xl sm:text-3xl font-bold text-rose-700 mt-1">
                  <CurrencyDisplay amount={stats.total_debt} />
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Active</p>
                    <p className="text-sm font-bold text-zinc-900">{stats.active_loans}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Paid</p>
                    <p className="text-sm font-bold text-green-600">{stats.paid_loans}</p>
                  </div>
                </div>
              </div>
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-rose-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter Tabs */}
        <div className="flex items-center gap-6 border-b border-zinc-200/60 px-1">
          {['active', 'paid'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 text-xs font-bold uppercase tracking-wider transition-all",
                activeTab === tab ? "text-zinc-900 border-b-2 border-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Loan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filterLoansByStatus(activeTab).length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
              <HandCoins className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">No {activeTab} loans</p>
            </div>
          ) : (
            filterLoansByStatus(activeTab).map((loan) => {
              const paymentPercentage = getPaymentPercentage(loan);
              
              return (
                <div key={loan.id} className="group relative bg-white border border-zinc-200/60 rounded-xl p-5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50 transition-all duration-300">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500">
                        <HandCoins className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 leading-tight">{loan.lender_name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-zinc-200 text-zinc-500 uppercase tracking-wider">
                            {getStatusText(loan.status)}
                          </Badge>
                          {loan.due_date && (
                            <span className="text-[10px] text-zinc-400">
                              Due {format(new Date(loan.due_date), 'MMM dd')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Data Grid */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-t border-zinc-100 pt-3">
                    <div>
                      <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5">Amount</p>
                      <p className="text-sm font-bold text-zinc-900 font-mono">
                        <CurrencyDisplay amount={loan.amount} />
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5">Balance</p>
                      <p className="text-sm font-bold text-rose-600 font-mono">
                        <CurrencyDisplay amount={loan.balance_remaining} />
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {loan.status === 'partially_paid' && (
                    <div className="mt-3 pt-3 border-t border-zinc-100">
                      <div className="flex justify-between text-[9px] text-zinc-400 uppercase tracking-widest mb-1.5">
                        <span>Progress</span>
                        <span className="font-bold text-zinc-600">{paymentPercentage}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-zinc-900 rounded-full transition-all duration-500" 
                          style={{width: `${paymentPercentage}%`}} 
                        />
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {loan.description && (
                    <div className="mt-3 pt-3 border-t border-zinc-100">
                      <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mb-1">Note</p>
                      <p className="text-xs text-zinc-600 line-clamp-2">{loan.description}</p>
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                    {loan.status !== 'paid' && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 text-zinc-400 hover:text-green-600 hover:bg-green-50" 
                        onClick={() => handleRepayClick(loan)}
                        title="Repay"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7 text-zinc-400 hover:text-blue-600 hover:bg-blue-50" 
                      onClick={() => handleHistoryClick(loan)}
                      title="History"
                    >
                      <History className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50" 
                      onClick={() => handleEdit(loan)}
                      title="Edit"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7 text-zinc-400 hover:text-rose-600 hover:bg-rose-50" 
                      onClick={() => handleDeleteClick(loan.id)}
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

        {/* Add/Edit Loan Modal */}
        <ResponsiveModal open={dialogOpen} onOpenChange={setDialogOpen}>
          <ResponsiveModalContent>
            <ResponsiveModalHeader>
              <ResponsiveModalTitle>{editMode ? 'Edit Loan' : 'New Loan'}</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                {editMode ? 'Update loan details' : 'Add a new loan to track'}
              </ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <ResponsiveModalBody className="space-y-3">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Lender Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Bank, Friend, Family"
                    value={formData.lender_name}
                    onChange={(e) => setFormData({ ...formData, lender_name: e.target.value })}
                    required
                    disabled={submitting}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      disabled={submitting}
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Due Date</label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      disabled={submitting}
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Description (Optional)</label>
                  <textarea
                    placeholder="Add note"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={submitting}
                    rows={3}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 resize-none"
                  />
                </div>
              </ResponsiveModalBody>

              <ResponsiveModalFooter className="flex flex-row gap-3 p-4 sm:p-6 bg-zinc-50/50 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditMode(false);
                    setEditingId(null);
                    setFormData({ lender_name: '', amount: '', description: '', due_date: '' });
                  }}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editMode ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editMode ? 'Update' : 'Create'
                  )}
                </Button>
              </ResponsiveModalFooter>
            </form>
          </ResponsiveModalContent>
        </ResponsiveModal>

        {/* Repay Modal */}
        <ResponsiveModal open={repayOpen} onOpenChange={setRepayOpen}>
          <ResponsiveModalContent>
            <ResponsiveModalHeader>
              <ResponsiveModalTitle>Repay Loan</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                Make a repayment to {repayingLoan?.lender_name}
              </ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <form onSubmit={handleRepaySubmit} className="flex flex-col h-full">
              <ResponsiveModalBody className="space-y-3">
                {repayingLoan && (
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                    <p className="text-sm text-blue-900">
                      Balance: <strong className="font-mono"><CurrencyDisplay amount={repayingLoan.balance_remaining} /></strong>
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={repayData.amount}
                      onChange={(e) => setRepayData({ ...repayData, amount: e.target.value })}
                      required
                      disabled={submitting}
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Date</label>
                    <input
                      type="date"
                      value={repayData.date}
                      onChange={(e) => setRepayData({ ...repayData, date: e.target.value })}
                      required
                      disabled={submitting}
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Category</label>
                  <Select
                    value={repayData.category_id}
                    onValueChange={(value) => setRepayData({ ...repayData, category_id: value })}
                  >
                    <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 h-10">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Payment Source</label>
                  <Select
                    value={repayData.payment_source}
                    onValueChange={(value) =>
                      setRepayData({ ...repayData, payment_source: value, bank_account_id: '', fund_source_id: '' })
                    }
                  >
                    <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Account</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {repayData.payment_source === 'bank' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Bank Account</label>
                    <Select
                      value={repayData.bank_account_id}
                      onValueChange={(value) => setRepayData({ ...repayData, bank_account_id: value })}
                    >
                      <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 h-10">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id.toString()}>
                            {acc.bank_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {repayData.payment_source === 'wallet' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Wallet</label>
                    <Select
                      value={repayData.fund_source_id}
                      onValueChange={(value) => setRepayData({ ...repayData, fund_source_id: value })}
                    >
                      <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 h-10">
                        <SelectValue placeholder="Select wallet" />
                      </SelectTrigger>
                      <SelectContent>
                        {fundSources.map((source) => (
                          <SelectItem key={source.id} value={source.id.toString()}>
                            {source.source_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Note (Optional)</label>
                  <textarea
                    placeholder="Add note"
                    value={repayData.description}
                    onChange={(e) => setRepayData({ ...repayData, description: e.target.value })}
                    disabled={submitting}
                    rows={2}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 resize-none"
                  />
                </div>
              </ResponsiveModalBody>

              <ResponsiveModalFooter className="flex flex-row gap-3 p-4 sm:p-6 bg-zinc-50/50 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRepayOpen(false)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Record Repayment'
                  )}
                </Button>
              </ResponsiveModalFooter>
            </form>
          </ResponsiveModalContent>
        </ResponsiveModal>

        {/* History Modal */}
        <ResponsiveModal open={historyOpen} onOpenChange={setHistoryOpen}>
          <ResponsiveModalContent>
            <ResponsiveModalHeader>
              <ResponsiveModalTitle>Loan History</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                Payment history for {selectedLoan?.lender_name}
              </ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <ResponsiveModalBody>
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
              ) : repayments.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No payment history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {repayments.map((repayment) => (
                    <div
                      key={repayment.id}
                      className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-lg hover:bg-zinc-100 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-zinc-900 font-mono text-sm">
                          <CurrencyDisplay amount={repayment.amount} />
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {format(new Date(repayment.payment_date), 'MMM dd, yyyy')}
                        </p>
                        {repayment.description && (
                          <p className="text-xs text-zinc-400 mt-1">{repayment.description}</p>
                        )}
                      </div>
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ResponsiveModalBody>
            <ResponsiveModalFooter className="flex flex-row gap-3 p-4 sm:p-6 bg-zinc-50/50 border-t border-zinc-200">
              <Button variant="outline" onClick={() => setHistoryOpen(false)} className="flex-1">
                Close
              </Button>
            </ResponsiveModalFooter>
          </ResponsiveModalContent>
        </ResponsiveModal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title="Delete Loan?"
          description="This will permanently remove this loan. This action cannot be undone."
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}
