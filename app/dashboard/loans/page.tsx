'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerBody } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, CreditCard, Trash2, DollarSign, Calendar, User, AlertCircle, Edit } from 'lucide-react';
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
  is_funding_source?: boolean;
  available_balance?: number;
  expenses?: Array<{
    id: number;
    amount: number;
    description: string;
    date: string;
    category: { name: string; icon: string };
  }>;
}

interface Category {
  id: number;
  name: string;
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
  const [repayDialogOpen, setRepayDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'fund'>('bank');

  const [loanFormData, setLoanFormData] = useState({
    lender_name: '',
    amount: '',
    description: '',
    due_date: '',
    is_funding_source: false,
  });

  const [repayFormData, setRepayFormData] = useState({
    amount: '',
    category_id: '',
    bank_account_id: '',
    fund_source_id: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchData = async () => {
    try {
      const [loansRes, categoriesRes, accountsRes, fundRes] = await Promise.all([
        api.get('/loans'),
        api.get('/categories'),
        api.get('/bank-accounts'),
        api.get('/fund-sources'),
      ]);

      const loansData = loansRes.data?.data || loansRes.data || [];
      const categoriesData = categoriesRes.data?.data || categoriesRes.data || [];
      const accountsData = accountsRes.data?.data || accountsRes.data || [];
      const fundSourcesData = fundRes.data?.data || fundRes.data || [];

      setLoans(Array.isArray(loansData) ? loansData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData.filter((c: Category & { type: string }) => c.type === 'expense') : []);
      setBankAccounts(Array.isArray(accountsData) ? accountsData : []);
      setFundSources(Array.isArray(fundSourcesData) ? fundSourcesData : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editMode && editingId) {
        await api.put(`/loans/${editingId}`, {
          ...loanFormData,
          amount: parseFloat(loanFormData.amount),
        });
      } else {
        await api.post('/loans', {
          ...loanFormData,
          amount: parseFloat(loanFormData.amount),
        });
      }

      await fetchData();
      setDialogOpen(false);
      setEditMode(false);
      setEditingId(null);
      setLoanFormData({
        lender_name: '',
        amount: '',
        description: '',
        due_date: '',
        is_funding_source: false,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} loan`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (loan: Loan) => {
    setEditMode(true);
    setEditingId(loan.id);
    setLoanFormData({
      lender_name: loan.lender_name,
      amount: loan.amount.toString(),
      description: loan.description || '',
      due_date: loan.due_date || '',
      is_funding_source: loan.is_funding_source || false,
    });
    setDialogOpen(true);
  };

  const handleRepaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    setError('');
    setSubmitting(true);

    try {
      const payload: any = {
        amount: parseFloat(repayFormData.amount),
        category_id: parseInt(repayFormData.category_id),
        date: repayFormData.date,
        description: repayFormData.description,
      };

      if (paymentMethod === 'bank') {
        payload.bank_account_id = parseInt(repayFormData.bank_account_id);
      } else {
        payload.fund_source_id = parseInt(repayFormData.fund_source_id);
      }

      await api.post(`/loans/${selectedLoan.id}/repay`, payload);

      await fetchData();
      setRepayDialogOpen(false);
      setSelectedLoan(null);
      setRepayFormData({
        amount: '',
        category_id: '',
        bank_account_id: '',
        fund_source_id: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process repayment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this loan?')) return;

    try {
      await api.delete(`/loans/${id}`);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete loan');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      partially_paid: 'bg-yellow-100 text-yellow-800',
      unpaid: 'bg-red-100 text-red-800',
    };

    const labels = {
      paid: 'Paid',
      partially_paid: 'Partially Paid',
      unpaid: 'Unpaid',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const openRepayDialog = (loan: Loan) => {
    setSelectedLoan(loan);
    setRepayFormData({
      ...repayFormData,
      amount: loan.balance_remaining.toString(),
      description: `Repayment to ${loan.lender_name}`,
    });
    setRepayDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalDebt = loans
    .filter(l => l.status !== 'paid')
    .reduce((sum, l) => sum + l.balance_remaining, 0);

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Loans & Debts</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">Track money you've borrowed</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="min-w-[44px] min-h-[44px]">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Loan</span>
        </Button>
      </div>

      {/* Total Debt Card */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Outstanding Debt</p>
              <p className="text-3xl font-bold text-red-700 mt-2">{formatCurrency(totalDebt)}</p>
              <p className="text-xs text-red-600 mt-1">
                {loans.filter(l => l.status !== 'paid').length} active {loans.filter(l => l.status !== 'paid').length === 1 ? 'loan' : 'loans'}
              </p>
            </div>
            <div className="bg-red-100 rounded-full p-4">
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {loans.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">No loans yet</p>
            <p className="text-slate-600 mb-4 text-center">Add your first loan to start tracking</p>
            <Button onClick={() => setDialogOpen(true)} className="min-h-[44px]">
              <Plus className="h-4 w-4 mr-2" />
              Add Loan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loans.map((loan) => (
            <Card key={loan.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-slate-600" />
                      <h3 className="font-semibold text-lg text-slate-900">{loan.lender_name}</h3>
                    </div>
                    {getStatusBadge(loan.status)}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(loan)}
                      className="text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(loan.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Original Amount:</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(loan.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Remaining:</span>
                    <span className="font-bold text-red-600">{formatCurrency(loan.balance_remaining)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((loan.amount - loan.balance_remaining) / loan.amount) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-600 text-right">
                    {Math.round(((loan.amount - loan.balance_remaining) / loan.amount) * 100)}% paid
                  </div>

                  {loan.due_date && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      Due: {format(new Date(loan.due_date), 'MMM dd, yyyy')}
                    </div>
                  )}

                  {loan.description && (
                    <p className="text-sm text-slate-600 mt-2">{loan.description}</p>
                  )}

                  {/* Funding Source Indicator */}
                  {loan.is_funding_source && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-purple-700">💰 Funding Source</span>
                        <span className="text-xs text-purple-600">
                          {formatCurrency(loan.available_balance || 0)} available
                        </span>
                      </div>
                      {loan.expenses && loan.expenses.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-purple-700">{loan.expenses.length} expense(s) paid:</p>
                          {loan.expenses.slice(0, 3).map((expense) => (
                            <div key={expense.id} className="flex items-center justify-between text-xs">
                              <span className="text-purple-600 truncate">{expense.category.name}</span>
                              <span className="text-purple-700 font-medium">{formatCurrency(expense.amount)}</span>
                            </div>
                          ))}
                          {loan.expenses.length > 3 && (
                            <p className="text-xs text-purple-500 italic">+{loan.expenses.length - 3} more...</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {loan.status !== 'paid' && (
                  <Button
                    onClick={() => openRepayDialog(loan)}
                    className="w-full mt-4"
                    variant="default"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Make Repayment
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Loan Dialog/Drawer */}
      {isMobile ? (
        <Drawer open={dialogOpen} onOpenChange={setDialogOpen}>
          <DrawerContent>
            <form onSubmit={handleSubmit}>
              <DrawerHeader>
                <DrawerTitle>{editMode ? 'Edit' : 'Add'} Loan</DrawerTitle>
                <DrawerDescription>
                  Record money you've borrowed
                </DrawerDescription>
              </DrawerHeader>

              <DrawerBody>
                <div className="px-6 py-3 pb-40 space-y-3">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label htmlFor="lender_name" className="text-sm">Lender Name</Label>
                    <Input
                      id="lender_name"
                      placeholder="e.g., John, ABC Bank"
                      value={loanFormData.lender_name}
                      onChange={(e) => setLoanFormData({ ...loanFormData, lender_name: e.target.value })}
                      required
                      disabled={submitting}
                      className="min-h-[40px] text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="amount" className="text-sm">Amount Borrowed</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 10000"
                      value={loanFormData.amount}
                      onChange={(e) => setLoanFormData({ ...loanFormData, amount: e.target.value })}
                      required
                      disabled={submitting}
                      className="min-h-[40px] text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="due_date" className="text-sm">Due Date (Optional)</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={loanFormData.due_date}
                      onChange={(e) => setLoanFormData({ ...loanFormData, due_date: e.target.value })}
                      disabled={submitting}
                      className="min-h-[40px] text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="description" className="text-sm">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="e.g., Emergency loan"
                      value={loanFormData.description}
                      onChange={(e) => setLoanFormData({ ...loanFormData, description: e.target.value })}
                      disabled={submitting}
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="is_funding_source"
                      checked={loanFormData.is_funding_source}
                      onCheckedChange={(checked) =>
                        setLoanFormData({ ...loanFormData, is_funding_source: checked as boolean })
                      }
                      disabled={submitting}
                    />
                    <Label
                      htmlFor="is_funding_source"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Use this loan as a Cash Wallet?
                    </Label>
                  </div>
                </div>
              </DrawerBody>

              <DrawerFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditMode(false);
                    setEditingId(null);
                  }}
                  disabled={submitting}
                  className="min-h-[50px] w-full sm:w-auto text-base sm:text-sm font-semibold"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="min-h-[50px] w-full sm:w-auto text-base sm:text-sm font-semibold">
                  {submitting ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update Loan' : 'Add Loan')}
                </Button>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editMode ? 'Edit' : 'Add'} Loan</DialogTitle>
                <DialogDescription>
                  Record money you've borrowed
                </DialogDescription>
              </DialogHeader>

              <div className="px-6 py-4 space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="lender_name">Lender Name</Label>
                  <Input
                    id="lender_name"
                    placeholder="e.g., John, ABC Bank"
                    value={loanFormData.lender_name}
                    onChange={(e) => setLoanFormData({ ...loanFormData, lender_name: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount Borrowed</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 10000"
                    value={loanFormData.amount}
                    onChange={(e) => setLoanFormData({ ...loanFormData, amount: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date (Optional)</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={loanFormData.due_date}
                    onChange={(e) => setLoanFormData({ ...loanFormData, due_date: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., Emergency loan"
                    value={loanFormData.description}
                    onChange={(e) => setLoanFormData({ ...loanFormData, description: e.target.value })}
                    disabled={submitting}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_funding_source_desktop"
                    checked={loanFormData.is_funding_source}
                    onCheckedChange={(checked) =>
                      setLoanFormData({ ...loanFormData, is_funding_source: checked as boolean })
                    }
                    disabled={submitting}
                  />
                  <Label
                    htmlFor="is_funding_source_desktop"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Use this loan as a Fund Source?
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update Loan' : 'Add Loan')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Repayment Dialog/Drawer */}
      {isMobile ? (
        <Drawer open={repayDialogOpen} onOpenChange={setRepayDialogOpen}>
          <DrawerContent>
            <form onSubmit={handleRepaySubmit}>
              <DrawerHeader>
                <DrawerTitle>Make Repayment</DrawerTitle>
                <DrawerDescription>
                  Pay back {selectedLoan?.lender_name}
                </DrawerDescription>
              </DrawerHeader>

              <DrawerBody>
                <div className="px-6 py-3 pb-40 space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  {/* Balance Info */}
                  {selectedLoan && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-900">Remaining Balance</span>
                        <span className="text-xl font-bold text-blue-600">
                          {formatCurrency(selectedLoan.balance_remaining)}
                        </span>
                      </div>
                      {repayFormData.amount && parseFloat(repayFormData.amount) > 0 && (
                        <div className="pt-2 border-t border-blue-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-700">After Payment</span>
                            <span className="text-lg font-semibold text-green-600">
                              {formatCurrency(selectedLoan.balance_remaining - parseFloat(repayFormData.amount))}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label htmlFor="repay_amount" className="text-sm">Amount to Pay</Label>
                    <Input
                      id="repay_amount"
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      value={repayFormData.amount}
                      onChange={(e) => setRepayFormData({ ...repayFormData, amount: e.target.value })}
                      required
                      disabled={submitting}
                      className="min-h-[40px] text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="repay_category" className="text-sm">Category</Label>
                    <select
                      id="repay_category"
                      value={repayFormData.category_id}
                      onChange={(e) => setRepayFormData({ ...repayFormData, category_id: e.target.value })}
                      required
                      disabled={submitting}
                      className="w-full min-h-[40px] px-3 border border-slate-300 rounded-md text-sm"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Payment Source</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={paymentMethod === 'bank' ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod('bank')}
                        className="flex-1 min-h-[40px]"
                        disabled={submitting}
                      >
                        Bank Account
                      </Button>
                      <Button
                        type="button"
                        variant={paymentMethod === 'fund' ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod('fund')}
                        className="flex-1 min-h-[40px]"
                        disabled={submitting}
                      >
                        Cash Wallet
                      </Button>
                    </div>
                  </div>

                  {paymentMethod === 'bank' ? (
                    <div className="space-y-1">
                      <Label htmlFor="bank_account" className="text-sm">Bank Account</Label>
                      <select
                        id="bank_account"
                        value={repayFormData.bank_account_id}
                        onChange={(e) => setRepayFormData({ ...repayFormData, bank_account_id: e.target.value })}
                        required
                        disabled={submitting}
                        className="w-full min-h-[40px] px-3 border border-slate-300 rounded-md text-sm"
                      >
                        <option value="">Select bank account</option>
                        {bankAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.bank_name} - {formatCurrency(account.balance)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label htmlFor="fund_source" className="text-sm">Cash Wallet</Label>
                      <select
                        id="fund_source"
                        value={repayFormData.fund_source_id}
                        onChange={(e) => setRepayFormData({ ...repayFormData, fund_source_id: e.target.value })}
                        required
                        disabled={submitting}
                        className="w-full min-h-[40px] px-3 border border-slate-300 rounded-md text-sm"
                      >
                        <option value="">Select cash wallet</option>
                        {fundSources.map((source) => (
                          <option key={source.id} value={source.id}>
                            {source.source_name} - {formatCurrency(source.amount)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label htmlFor="repay_date" className="text-sm">Payment Date</Label>
                    <Input
                      id="repay_date"
                      type="date"
                      value={repayFormData.date}
                      onChange={(e) => setRepayFormData({ ...repayFormData, date: e.target.value })}
                      required
                      disabled={submitting}
                      className="min-h-[40px] text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="repay_description" className="text-sm">Description (Optional)</Label>
                    <Textarea
                      id="repay_description"
                      placeholder="Payment note"
                      value={repayFormData.description}
                      onChange={(e) => setRepayFormData({ ...repayFormData, description: e.target.value })}
                      disabled={submitting}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </div>
              </DrawerBody>

              <DrawerFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRepayDialogOpen(false)}
                  disabled={submitting}
                  className="min-h-[50px] w-full sm:w-auto text-base sm:text-sm font-semibold"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="min-h-[50px] w-full sm:w-auto text-base sm:text-sm font-semibold">
                  {submitting ? 'Processing...' : 'Make Payment'}
                </Button>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={repayDialogOpen} onOpenChange={setRepayDialogOpen}>
          <DialogContent>
            <form onSubmit={handleRepaySubmit}>
              <DialogHeader>
                <DialogTitle>Make Repayment</DialogTitle>
                <DialogDescription>
                  Pay back {selectedLoan?.lender_name}
                </DialogDescription>
              </DialogHeader>

              <div className="px-6 py-4 space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                {/* Balance Info */}
                {selectedLoan && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-900">Remaining Balance</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(selectedLoan.balance_remaining)}
                      </span>
                    </div>
                    {repayFormData.amount && parseFloat(repayFormData.amount) > 0 && (
                      <div className="pt-2 border-t border-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-700">After Payment</span>
                          <span className="text-lg font-semibold text-green-600">
                            {formatCurrency(selectedLoan.balance_remaining - parseFloat(repayFormData.amount))}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="repay_amount_desktop">Amount to Pay</Label>
                  <Input
                    id="repay_amount_desktop"
                    type="number"
                    step="0.01"
                    placeholder="Enter amount"
                    value={repayFormData.amount}
                    onChange={(e) => setRepayFormData({ ...repayFormData, amount: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repay_category_desktop">Category</Label>
                  <select
                    id="repay_category_desktop"
                    value={repayFormData.category_id}
                    onChange={(e) => setRepayFormData({ ...repayFormData, category_id: e.target.value })}
                    required
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Source</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={paymentMethod === 'bank' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('bank')}
                      className="flex-1"
                      disabled={submitting}
                    >
                      Bank Account
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === 'fund' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('fund')}
                      className="flex-1"
                      disabled={submitting}
                    >
                      Cash Wallet
                    </Button>
                  </div>
                </div>

                {paymentMethod === 'bank' ? (
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_desktop">Bank Account</Label>
                    <select
                      id="bank_account_desktop"
                      value={repayFormData.bank_account_id}
                      onChange={(e) => setRepayFormData({ ...repayFormData, bank_account_id: e.target.value })}
                      required
                      disabled={submitting}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    >
                      <option value="">Select bank account</option>
                      {bankAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.bank_name} - {formatCurrency(account.balance)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="fund_source_desktop">Cash Wallet</Label>
                    <select
                      id="fund_source_desktop"
                      value={repayFormData.fund_source_id}
                      onChange={(e) => setRepayFormData({ ...repayFormData, fund_source_id: e.target.value })}
                      required
                      disabled={submitting}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    >
                      <option value="">Select fund source</option>
                      {fundSources.map((source) => (
                        <option key={source.id} value={source.id}>
                          {source.source_name} - {formatCurrency(source.amount)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="repay_date_desktop">Payment Date</Label>
                  <Input
                    id="repay_date_desktop"
                    type="date"
                    value={repayFormData.date}
                    onChange={(e) => setRepayFormData({ ...repayFormData, date: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repay_description_desktop">Description (Optional)</Label>
                  <Textarea
                    id="repay_description_desktop"
                    placeholder="Payment note"
                    value={repayFormData.description}
                    onChange={(e) => setRepayFormData({ ...repayFormData, description: e.target.value })}
                    disabled={submitting}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRepayDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Processing...' : 'Make Payment'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
