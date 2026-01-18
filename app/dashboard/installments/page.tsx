'use client';

import { useState, useEffect } from 'react';
import { Plus, CreditCard, Calendar, Calculator, Loader2 } from 'lucide-react';
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
import InstallmentCard from '@/components/InstallmentCard';
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
  category: {
    id: number;
    name: string;
  };
  bank_account?: {
    id: number;
    bank_name: string;
    balance: number;
  };
  fund_source?: {
    id: number;
    source_name: string;
    amount: number;
  };
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
          fetchData(); // Refresh list to show updated progress
      } catch (error: any) {
          toast.error(error.response?.data?.message || 'Payment failed');
      }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Active Installments</h1>
          <p className="text-sm text-zinc-500 mt-1">Track and manage your monthly payments</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-lg shadow-zinc-900/10 transition-all active:scale-95">
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {[1, 2, 3].map(i => (
                 <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-xl" />
             ))}
        </div>
      ) : installments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
           <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
             <CreditCard className="h-8 w-8 text-zinc-400" />
           </div>
           <h3 className="text-lg font-medium text-zinc-900">No active installments</h3>
           <p className="text-sm text-zinc-500 mt-1 max-w-sm text-center">
             Add your first installment plan to start tracking your monthly payments.
           </p>
           <Button variant="outline" className="mt-6" onClick={() => { resetForm(); setDialogOpen(true); }}>
             Create Plan
           </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {installments.map(installment => (
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

      {/* Create/Edit Modal */}
      <ResponsiveModal open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
      }}>
        <ResponsiveModalContent>
            <ResponsiveModalHeader>
                <ResponsiveModalTitle>{editingId ? 'Edit Installment Plan' : 'Add New Installment Plan'}</ResponsiveModalTitle>
                <ResponsiveModalDescription>{editingId ? 'Update the details of your installment plan.' : 'Enter details about your installment purchase.'}</ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <ResponsiveModalBody>
               <div className="grid gap-4 py-2">
                 <div className="space-y-2">
                    <Label>Item Name</Label>
                    <Input 
                        placeholder="e.g. iPhone 15 Pro" 
                        value={formData.item_name}
                        onChange={e => setFormData({...formData, item_name: e.target.value})}
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
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Total Months</Label>
                        <Input 
                            type="number"
                            placeholder="e.g. 12"
                            value={formData.total_months}
                            onChange={e => setFormData({...formData, total_months: e.target.value})}
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
                            className="pl-9 bg-white"
                            value={formData.monthly_amount}
                            onChange={e => setFormData({...formData, monthly_amount: e.target.value})}
                            placeholder="0.00"
                        />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category_id} onValueChange={v => setFormData({...formData, category_id: v})}>
                        <SelectTrigger>
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
                    />
                 </div>

                 <div className="space-y-2">
                     <Label>Payment Source (Optional)</Label>
                     <p className="text-[10px] text-zinc-500">Expenses created will be linked to this source.</p>
                     <div className="grid grid-cols-2 gap-2">
                         <Select value={formData.bank_account_id} onValueChange={v => setFormData({...formData, bank_account_id: v})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Bank Account" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {bankAccounts.map(b => (
                                    <SelectItem key={b.id} value={b.id.toString()}>{b.bank_name}</SelectItem>
                                ))}
                            </SelectContent>
                         </Select>
                         <Select value={formData.fund_source_id} onValueChange={v => setFormData({...formData, fund_source_id: v})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Wallet/Cash" />
                            </SelectTrigger>
                            <SelectContent>
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
            <ResponsiveModalFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} className="bg-zinc-900 text-white">{editingId ? 'Update Plan' : 'Create Plan'}</Button>
            </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
