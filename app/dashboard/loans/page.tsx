'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ResponsiveModal, ResponsiveModalContent, ResponsiveModalHeader, ResponsiveModalTitle, ResponsiveModalDescription, ResponsiveModalBody, ResponsiveModalFooter } from '@/components/ui/responsive-modal';
import { Plus, CreditCard, AlertCircle, TrendingDown, LayoutGrid, List } from 'lucide-react';
import { format } from 'date-fns';
import LoanDossierCard from '@/components/LoanDossierCard';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
}

interface Category { id: number; name: string; }
interface BankAccount { id: number; bank_name: string; balance: number; }
interface FundSource { id: number; source_name: string; amount: number; }

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [fundSources, setFundSources] = useState<FundSource[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [repayDialogOpen, setRepayDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // Form States
  const [loanFormData, setLoanFormData] = useState({ lender_name: '', amount: '', description: '', due_date: '', is_funding_source: false });
  const [repayFormData, setRepayFormData] = useState({ amount: '', category_id: '', bank_account_id: '', fund_source_id: '', date: new Date().toISOString().split('T')[0], description: '' });
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'fund'>('bank');
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [loansRes, categoriesRes, accountsRes, fundRes] = await Promise.all([
        api.get('/loans'),
        api.get('/categories'),
        api.get('/bank-accounts'),
        api.get('/fund-sources'),
      ]);
      setLoans(loansRes.data?.data || loansRes.data || []);
      
      const categoriesData = categoriesRes.data?.data || categoriesRes.data || [];
      setCategories(categoriesData.filter((c: any) => c.type === 'expense' || !c.type) || []);
      
      setBankAccounts(accountsRes.data?.data || accountsRes.data || []);
      setFundSources(fundRes.data?.data || fundRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load loan data');
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD Handlers (Simplified for brevity as logic is same) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...loanFormData, amount: parseFloat(loanFormData.amount) };
      if (editMode && editingId) {
        await api.put(`/loans/${editingId}`, payload);
        toast.success('Loan dossier updated');
      } else {
        await api.post('/loans', payload);
        toast.success('New loan dossier created');
      }
      setDialogOpen(false);
      resetLoanForm();
      fetchData(); // Refresh in background
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleRepaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;
    setSubmitting(true);
    try {
      const payload: any = {
        amount: parseFloat(repayFormData.amount),
        category_id: parseInt(repayFormData.category_id),
        date: repayFormData.date,
        description: repayFormData.description,
      };
      if (paymentMethod === 'bank') payload.bank_account_id = parseInt(repayFormData.bank_account_id);
      else payload.fund_source_id = parseInt(repayFormData.fund_source_id);

      await api.post(`/loans/${selectedLoan.id}/repay`, payload);
      toast.success('Repayment recorded');
      setRepayDialogOpen(false);
      fetchData(); // Refresh in background
    } catch (err: any) {
      setError(err.response?.data?.message || 'Repayment failed');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('This will permanently delete this loan dossier. Continue?')) return;
    try {
      await api.delete(`/loans/${id}`);
      toast.success('Loan dossier deleted');
      await fetchData();
    } catch (error: any) { toast.error('Failed to delete loan'); }
  };

  const resetLoanForm = () => {
    setEditMode(false);
    setEditingId(null);
    setLoanFormData({ lender_name: '', amount: '', description: '', due_date: '', is_funding_source: false });
    setError('');
  };

  // --- UI Helpers ---
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

  const openRepayDialog = (loan: Loan) => {
    setSelectedLoan(loan);
    setRepayFormData(prev => ({ ...prev, amount: loan.balance_remaining.toString() }));
    setRepayDialogOpen(true);
  };

  const totalOutstanding = loans.filter(l => l.status !== 'paid').reduce((sum, l) => sum + Number(l.balance_remaining), 0);
  
  // Dummy data for sparkline if no real history
  const sparklineData = [
    { value: totalOutstanding * 1.2 },
    { value: totalOutstanding * 1.1 },
    { value: totalOutstanding * 1.15 },
    { value: totalOutstanding * 1.05 },
    { value: totalOutstanding }
  ];

  if (loading) return null; // Or a skeleton

  return (
    <div className="space-y-8 pb-24 lg:pb-6 max-w-[1600px] mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-zinc-400" />
            Liability Management
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Track and manage external financial obligations.</p>
        </div>
        <Button onClick={() => { resetLoanForm(); setDialogOpen(true); }} className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-none">
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Slim Metric Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-zinc-200/60 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between shadow-sm">
           <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Outstanding</p>
              <div className="flex items-baseline gap-3">
                 <span className="text-4xl font-bold text-zinc-900 tracking-tighter">
                    <CurrencyDisplay amount={totalOutstanding} />
                 </span>
                 <span className="flex items-center text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -4.2%
                 </span>
              </div>
           </div>
           
           {/* Sparkline Chart */}
           <div className="h-16 w-32 sm:w-48 mt-4 sm:mt-0">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={sparklineData}>
                    <defs>
                       <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#18181b" strokeWidth={1.5} fillOpacity={1} fill="url(#colorValue)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-xl p-6 flex flex-col justify-center shadow-sm">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-zinc-100 rounded-lg">
                 <List className="h-5 w-5 text-zinc-600" />
              </div>
              <span className="text-sm font-medium text-zinc-600">Active Dossiers</span>
           </div>
           <p className="text-3xl font-bold text-zinc-900">{loans.filter(l => l.status !== 'paid').length}</p>
           <p className="text-xs text-zinc-400 mt-1">Pending repayment</p>
        </div>
      </div>

      {/* Loan Dossier Grid */}
      {loans.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl">
           <p className="text-zinc-500">No active loan dossiers found.</p>
           <Button variant="link" onClick={() => setDialogOpen(true)}>Create one now</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {loans.map(loan => (
              <div key={loan.id} className="h-full"> {/* Flexible height */}
                 <LoanDossierCard 
                    loan={loan}
                    onRepay={openRepayDialog}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                 />
              </div>
           ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <ResponsiveModal open={dialogOpen} onOpenChange={setDialogOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>{editMode ? 'Edit Dossier' : 'New Loan Entry'}</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
             {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label>Lender Name</Label>
                   <Input value={loanFormData.lender_name} onChange={e => setLoanFormData({...loanFormData, lender_name: e.target.value})} required className="bg-zinc-50/50" />
                </div>
                <div className="space-y-2">
                   <Label>Amount</Label>
                   <Input type="number" value={loanFormData.amount} onChange={e => setLoanFormData({...loanFormData, amount: e.target.value})} required className="bg-zinc-50/50" />
                </div>
             </div>
             <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={loanFormData.due_date} onChange={e => setLoanFormData({...loanFormData, due_date: e.target.value})} className="bg-zinc-50/50" />
             </div>
             <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={loanFormData.description} onChange={e => setLoanFormData({...loanFormData, description: e.target.value})} rows={2} className="bg-zinc-50/50" />
             </div>
             <div className="flex items-center gap-2">
                <Checkbox id="fund" checked={loanFormData.is_funding_source} onCheckedChange={(c) => setLoanFormData({...loanFormData, is_funding_source: c as boolean})} />
                <Label htmlFor="fund" className="font-normal text-zinc-600">Track as funding source?</Label>
             </div>
             <ResponsiveModalFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800">{editMode ? 'Update' : 'Create Record'}</Button>
             </ResponsiveModalFooter>
          </form>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Repay Modal */}
      <ResponsiveModal open={repayDialogOpen} onOpenChange={setRepayDialogOpen}>
         <ResponsiveModalContent>
            <ResponsiveModalHeader>
               <ResponsiveModalTitle>Process Repayment</ResponsiveModalTitle>
               <ResponsiveModalDescription>Record a payment for {selectedLoan?.lender_name}</ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <form onSubmit={handleRepaySubmit} className="space-y-4 pt-4">
               {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
               <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Current Balance</span>
                  <span className="font-mono font-bold text-zinc-900"><CurrencyDisplay amount={selectedLoan?.balance_remaining || 0} /></span>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>Amount</Label>
                     <Input type="number" value={repayFormData.amount} onChange={e => setRepayFormData({...repayFormData, amount: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                     <Label>Category</Label>
                     <select className="w-full h-9 px-3 rounded-md border border-zinc-200 text-sm" value={repayFormData.category_id} onChange={e => setRepayFormData({...repayFormData, category_id: e.target.value})} required>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                  </div>
               </div>
               <div className="space-y-2">
                  <Label>Payment Source</Label>
                  <div className="flex gap-2">
                     <Button type="button" variant={paymentMethod === 'bank' ? 'default' : 'outline'} onClick={() => setPaymentMethod('bank')} className="flex-1">Bank</Button>
                     <Button type="button" variant={paymentMethod === 'fund' ? 'default' : 'outline'} onClick={() => setPaymentMethod('fund')} className="flex-1">Cash</Button>
                  </div>
                  {paymentMethod === 'bank' ? (
                     <select className="w-full h-9 px-3 rounded-md border border-zinc-200 text-sm" value={repayFormData.bank_account_id} onChange={e => setRepayFormData({...repayFormData, bank_account_id: e.target.value})} required>
                        <option value="">Select Bank Account</option>
                        {bankAccounts.map(b => <option key={b.id} value={b.id}>{b.bank_name}</option>)}
                     </select>
                  ) : (
                     <select className="w-full h-9 px-3 rounded-md border border-zinc-200 text-sm" value={repayFormData.fund_source_id} onChange={e => setRepayFormData({...repayFormData, fund_source_id: e.target.value})} required>
                        <option value="">Select Wallet</option>
                        {fundSources.map(f => <option key={f.id} value={f.id}>{f.source_name}</option>)}
                     </select>
                  )}
               </div>
               <ResponsiveModalFooter>
                  <Button type="button" variant="outline" onClick={() => setRepayDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800">Confirm Payment</Button>
               </ResponsiveModalFooter>
            </form>
         </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
