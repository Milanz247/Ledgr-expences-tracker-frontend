'use client';

import { useState, useEffect } from 'react';
import { Plus, CreditCard, Calendar, Calculator, Loader2, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
    ResponsiveModal, 
    ResponsiveModalContent, 
    ResponsiveModalHeader, 
    ResponsiveModalTitle, 
    ResponsiveModalDescription, 
    ResponsiveModalBody, 
    ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InstallmentCard from '@/components/InstallmentCard';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import api from '@/lib/api';

interface Installment {
  id: number;
  item_name: string;
  total_amount: number;
  monthly_amount: number;
  total_months: number;
  paid_months: number;
  start_date: string;
  status: 'ongoing' | 'completed';
  category: { id: number; name: string; };
  bank_account?: { id: number; bank_name: string; balance: number; };
  fund_source?: { id: number; source_name: string; amount: number; };
}

export default function InstallmentsPage() {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    total_amount: '',
    total_months: '',
    monthly_amount: '',
    start_date: new Date().toISOString().split('T')[0],
    category_id: '',
    bank_account_id: 'none',
    fund_source_id: 'none',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Data for dropdowns
  const [categories, setCategories] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [fundSources, setFundSources] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    fetchDropdowns();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/installments');
      setInstallments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch installments', error);
      toast.error('Failed to load installments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [cats, banks, funds] = await Promise.all([
        api.get('/categories'),
        api.get('/bank-accounts'),
        api.get('/fund-sources')
      ]);
      setCategories(cats.data || []);
      setBankAccounts(banks.data.data || []);
      setFundSources(funds.data.data || []);
    } catch (error) {
      console.error('Failed to fetch dropdown options', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.item_name || !formData.total_amount || !formData.monthly_amount || !formData.category_id) {
        toast.error('Please fill in required fields');
        return;
    }

    setSubmitting(true);
    try {
        const payload = {
            ...formData,
            bank_account_id: formData.bank_account_id === 'none' ? null : formData.bank_account_id,
            fund_source_id: formData.fund_source_id === 'none' ? null : formData.fund_source_id,
        };

        if (editingId) {
            await api.put(`/installments/${editingId}`, payload);
            toast.success('Installment plan updated');
        } else {
            await api.post('/installments', payload);
            toast.success('Installment plan created');
        }
        
        setDialogOpen(false);
        fetchData();
        resetForm();
    } catch (error) {
        toast.error('Failed to save installment plan');
    } finally {
        setSubmitting(false);
    }
  };

  const resetForm = () => {
      setEditingId(null);
      setFormData({
          item_name: '',
          total_amount: '',
          total_months: '',
          monthly_amount: '',
          start_date: new Date().toISOString().split('T')[0],
          category_id: '',
          bank_account_id: 'none',
          fund_source_id: 'none',
      });
  };

  const handleEdit = (installment: Installment) => {
      setEditingId(installment.id);
      setFormData({
          item_name: installment.item_name,
          total_amount: installment.total_amount.toString(),
          total_months: installment.total_months.toString(),
          monthly_amount: installment.monthly_amount.toString(),
          start_date: installment.start_date.split('T')[0],
          category_id: installment.category.id.toString(),
          bank_account_id: installment.bank_account?.id ? installment.bank_account.id.toString() : 'none',
          fund_source_id: installment.fund_source?.id ? installment.fund_source.id.toString() : 'none',
      });
      setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
      try {
          await api.delete(`/installments/${id}`);
          toast.success('Installment plan deleted');
          fetchData();
      } catch (error) {
          toast.error('Failed to delete installment plan');
      }
  };

  const calculateMonthly = () => {
      const total = Number(formData.total_amount);
      const months = Number(formData.total_months);
      if (total > 0 && months > 0) {
          setFormData(prev => ({ ...prev, monthly_amount: (total / months).toFixed(2) }));
      }
  };

  const handlePayInstallment = async (installment: Installment, months: number) => {
      try {
          await api.post(`/installments/${installment.id}/pay`, { months_to_pay: months });
          toast.success(`Payment for ${months} month(s) recorded`);
          fetchData();
      } catch (error: any) {
          toast.error(error.response?.data?.message || 'Payment failed');
      }
  };

  // Metrics Calculation
  const ongoingInstallments = installments.filter(i => i.status !== 'completed');
  const completedInstallments = installments.filter(i => i.status === 'completed');
  const totalMonthlyCommitment = ongoingInstallments.reduce((sum, i) => sum + Number(i.monthly_amount), 0);
  const totalRemainingDebt = ongoingInstallments.reduce((sum, i) => {
     const remaining = Number(i.total_amount) - (Number(i.monthly_amount) * i.paid_months);
     return sum + Math.max(0, remaining);
  }, 0);

  return (
    <div className="space-y-6 pb-20 lg:pb-0 max-w-[1920px] mx-auto animate-in fade-in duration-500">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-zinc-400" />
            Installment Plans
          </h1>
          <div className="flex gap-6 mt-3">
             <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Monthly Commitment</span>
                <span className="text-sm font-bold text-zinc-900 font-mono"><CurrencyDisplay amount={totalMonthlyCommitment} /></span>
             </div>
             <div className="w-px h-4 bg-zinc-200" />
             <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Total Remaining</span>
                <span className="text-sm font-bold text-zinc-900 font-mono"><CurrencyDisplay amount={totalRemainingDebt} /></span>
             </div>
          </div>
        </div>
        
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-none h-9 text-xs">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Create Plan
        </Button>
      </div>

      {/* 2. Content Area (Tabs & Grid) */}
      <Tabs defaultValue="ongoing" className="w-full space-y-6">
         <TabsList className="bg-zinc-100/50 p-1 w-fit">
            <TabsTrigger value="ongoing" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">Ongoing Plans ({ongoingInstallments.length})</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">History ({completedInstallments.length})</TabsTrigger>
         </TabsList>

         <TabsContent value="ongoing" className="m-0">
             {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-zinc-100 animate-pulse rounded-lg" />)}
                </div>
             ) : ongoingInstallments.length === 0 ? (
                <div className="text-center py-20 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl">
                   <p className="text-zinc-500 text-sm">No active installment plans.</p>
                   <Button variant="link" onClick={() => setDialogOpen(true)} className="mt-1">Create your first one</Button>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {ongoingInstallments.map(installment => (
                    <InstallmentCard 
                        key={installment.id} 
                        installment={installment} 
                        onPay={handlePayInstallment}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                  ))}
                </div>
             )}
         </TabsContent>

         <TabsContent value="completed" className="m-0">
             {completedInstallments.length === 0 ? (
                <div className="text-center py-20 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl">
                   <p className="text-zinc-500 text-sm">No completed plans found.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {completedInstallments.map(installment => (
                    <InstallmentCard 
                        key={installment.id} 
                        installment={installment} 
                        onPay={handlePayInstallment}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                  ))}
                </div>
             )}
         </TabsContent>
      </Tabs>

      {/* Create/Edit Modal */}
      <ResponsiveModal open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
      }}>
        <ResponsiveModalContent className="sm:p-6 p-0">
            <ResponsiveModalHeader className="px-5 pt-6 sm:px-0 sm:pt-0">
                <ResponsiveModalTitle>{editingId ? 'Edit Plan' : 'New Installment Plan'}</ResponsiveModalTitle>
                <ResponsiveModalDescription>Enter details about your installment purchase.</ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <ResponsiveModalBody className="max-h-[85vh] overflow-y-auto px-5 py-4 pb-10 sm:px-0 sm:py-0 sm:pb-0">
               <div className="grid gap-4 py-2">
                 <div className="space-y-2">
                    <Label>Item Name</Label>
                    <Input 
                        placeholder="e.g. iPhone 15 Pro" 
                        value={formData.item_name}
                        onChange={e => setFormData({...formData, item_name: e.target.value})}
                        className="bg-zinc-50/50"
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Total Amount</Label>
                        <Input 
                            type="number"
                            placeholder="0.00"
                            value={formData.total_amount}
                            onChange={e => setFormData({...formData, total_amount: e.target.value})}
                            className="bg-zinc-50/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Total Months</Label>
                        <Input 
                            type="number"
                            placeholder="e.g. 12"
                            value={formData.total_months}
                            onChange={e => setFormData({...formData, total_months: e.target.value})}
                            className="bg-zinc-50/50"
                        />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        Monthly Installment
                    </Label>
                    <div className="relative">
                        <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input 
                            className="pl-9 bg-zinc-50/50"
                            value={formData.monthly_amount}
                            onChange={e => setFormData({...formData, monthly_amount: e.target.value})}
                            placeholder="0.00"
                        />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category_id} onValueChange={v => setFormData({...formData, category_id: v})}>
                        <SelectTrigger className="bg-zinc-50/50">
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>

                 <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input 
                        type="date"
                        value={formData.start_date}
                        onChange={e => setFormData({...formData, start_date: e.target.value})}
                        className="bg-zinc-50/50"
                    />
                 </div>

                 <div className="space-y-2">
                     <Label>Payment Source (Optional)</Label>
                     <p className="text-[10px] text-zinc-500">Expenses created will be linked to this source.</p>
                     <div className="grid grid-cols-2 gap-2">
                         <Select value={formData.bank_account_id} onValueChange={v => setFormData({...formData, bank_account_id: v === 'none' ? 'none' : v, fund_source_id: 'none'})}>
                            <SelectTrigger className="bg-zinc-50/50">
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
                         <Select value={formData.fund_source_id} onValueChange={v => setFormData({...formData, fund_source_id: v === 'none' ? 'none' : v, bank_account_id: 'none'})}>
                            <SelectTrigger className="bg-zinc-50/50">
                                <SelectValue placeholder="Select Fund Source" />
                            </SelectTrigger>
                            <SelectContent className="z-[100]">
                                <SelectItem value="none">None</SelectItem>
                                {fundSources.map(f => (
                                    <SelectItem key={f.id} value={f.id.toString()}>{f.source_name}</SelectItem>
                                ))}
                            </SelectContent>
                         </Select>
                     </div>
                 </div>
               </div>
            </ResponsiveModalBody>
            <ResponsiveModalFooter className="flex flex-row gap-3 px-5 pb-6 sm:px-0 sm:pb-0">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 sm:flex-none">Cancel</Button>
                <Button onClick={handleSubmit} disabled={submitting} className="flex-1 sm:flex-none bg-zinc-900 text-white hover:bg-zinc-800">
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingId ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (editingId ? 'Update Plan' : 'Create Plan')}
                </Button>
            </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
