'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Plus, HandCoins, Trash2, Edit, DollarSign, Loader2, AlertCircle, History, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
    payment_source: 'bank', // 'bank' or 'wallet'
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
      console.error('Failed to delete loan:', error);
      toast.error(error.response?.data?.message || 'Failed to delete loan');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
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
        return 'Partially Paid';
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

  const renderLoanCard = (loan: Loan) => {
    const paymentPercentage = getPaymentPercentage(loan);

    return (
      <Card key={loan.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-red-100 rounded-lg p-2">
                <HandCoins className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-base">{loan.lender_name}</CardTitle>
                <CardDescription className="text-xs">
                  {format(new Date(loan.created_at), 'MMM dd, yyyy')}
                </CardDescription>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(loan.status)}`}>
              {getStatusText(loan.status)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-600 mb-1">Original Amount</p>
              <p className="text-sm font-bold text-slate-900">
                {formatCurrency(loan.amount)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-600 mb-1">Balance Remaining</p>
              <p className="text-sm font-bold text-red-600">
                {formatCurrency(loan.balance_remaining)}
              </p>
            </div>
          </div>

          {loan.status === 'partially_paid' && (
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Payment Progress</span>
                <span className="font-medium">{paymentPercentage}%</span>
              </div>
              <Progress value={paymentPercentage} className="h-2" />
            </div>
          )}

          {loan.due_date && (
            <div>
              <p className="text-xs text-slate-600 mb-1">Due Date</p>
              <p className="text-xs text-slate-900">
                {format(new Date(loan.due_date), 'MMM dd, yyyy')}
              </p>
            </div>
          )}

          {loan.description && (
            <div>
              <p className="text-xs text-slate-600 mb-1">Description</p>
              <p className="text-xs text-slate-900">{loan.description}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {loan.status !== 'paid' && (
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => handleRepayClick(loan)}
              >
                <DollarSign className="h-3 w-3 mr-1" />
                Repay
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleHistoryClick(loan)}
            >
              <History className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(loan)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteClick(loan.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Loans</h1>
          <p className="text-slate-600 mt-1">Track and manage your debts</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Loan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Total Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {formatCurrency(stats.total_debt)}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Active Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.active_loans}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Paid Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.paid_loans}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {filterLoansByStatus('active').length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <HandCoins className="h-12 w-12 text-slate-400 mb-4" />
                <p className="text-lg font-medium text-slate-900 mb-2">No active loans</p>
                <p className="text-slate-600 mb-4">Add a loan to start tracking</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Loan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterLoansByStatus('active').map(renderLoanCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="paid" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterLoansByStatus('paid').map(renderLoanCard)}
          </div>
          {filterLoansByStatus('paid').length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-slate-600">
                No paid loans yet
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Loan Modal */}
      <ResponsiveModal open={dialogOpen} onOpenChange={setDialogOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>{editMode ? 'Edit' : 'Add'} Loan</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              {editMode ? 'Update the' : 'Add a new'} loan details
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <form onSubmit={handleSubmit}>
            <ResponsiveModalBody className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="lender_name">Lender Name</Label>
                <Input
                  id="lender_name"
                  placeholder="e.g., Bank, Friend, Family"
                  value={formData.lender_name}
                  onChange={(e) => setFormData({ ...formData, lender_name: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 100000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date (Optional)</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., Personal loan for car"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={submitting}
                  rows={3}
                />
              </div>
            </ResponsiveModalBody>

            <ResponsiveModalFooter>
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
                className="w-full lg:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="w-full lg:w-auto">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editMode ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editMode ? 'Update Loan' : 'Add Loan'
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
          <form onSubmit={handleRepaySubmit}>
            <ResponsiveModalBody className="space-y-4">
              {repayingLoan && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-900">
                    Balance Remaining: <strong>{formatCurrency(repayingLoan.balance_remaining)}</strong>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="repay_amount">Amount</Label>
                <Input
                  id="repay_amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={repayData.amount}
                  onChange={(e) => setRepayData({ ...repayData, amount: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={repayData.category_id}
                  onValueChange={(value) => setRepayData({ ...repayData, category_id: value })}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label>Payment Source</Label>
                <Select
                  value={repayData.payment_source}
                  onValueChange={(value) =>
                    setRepayData({ ...repayData, payment_source: value, bank_account_id: '', fund_source_id: '' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {repayData.payment_source === 'bank' && (
                <div className="space-y-2">
                  <Label>Bank Account</Label>
                  <Select
                    value={repayData.bank_account_id}
                    onValueChange={(value) => setRepayData({ ...repayData, bank_account_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id.toString()}>
                          {acc.bank_name} - {formatCurrency(parseFloat(acc.balance.toString()))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {repayData.payment_source === 'wallet' && (
                <div className="space-y-2">
                  <Label>Wallet</Label>
                  <Select
                    value={repayData.fund_source_id}
                    onValueChange={(value) => setRepayData({ ...repayData, fund_source_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {fundSources.map((source) => (
                        <SelectItem key={source.id} value={source.id.toString()}>
                          {source.source_name} - {formatCurrency(parseFloat(source.amount.toString()))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="repay_date">Date</Label>
                <Input
                  id="repay_date"
                  type="date"
                  value={repayData.date}
                  onChange={(e) => setRepayData({ ...repayData, date: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repay_description">Description (Optional)</Label>
                <Textarea
                  id="repay_description"
                  placeholder="Add note"
                  value={repayData.description}
                  onChange={(e) => setRepayData({ ...repayData, description: e.target.value })}
                  disabled={submitting}
                  rows={2}
                />
              </div>
            </ResponsiveModalBody>

            <ResponsiveModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRepayOpen(false)}
                disabled={submitting}
                className="w-full lg:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="w-full lg:w-auto">
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
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : repayments.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                <Clock className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                <p>No payment history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {repayments.map((repayment) => (
                  <div
                    key={repayment.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {formatCurrency(repayment.amount)}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {format(new Date(repayment.payment_date), 'MMM dd, yyyy')}
                      </p>
                      {repayment.description && (
                        <p className="text-xs text-slate-500 mt-1">{repayment.description}</p>
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
          <ResponsiveModalFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)} className="w-full lg:w-auto">
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
        description="Are you sure you want to delete this loan? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
