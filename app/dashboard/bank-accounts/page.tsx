'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalBody,
  ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';
import { Plus, Landmark, Loader2 } from 'lucide-react';
import BankCard from '@/components/BankCard'; // Ensure this path is correct based on where you saved it
import { toast } from 'sonner';

export interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  balance: number;
  account_holder_name?: string;
  branch_code?: string;
  color?: string;
}

const SRI_LANKAN_BANKS = [
  'Bank of Ceylon',
  'Peoples Bank',
  'Sampath Bank',
  'Hatton National Bank',
  'Commercial Bank',
  'Nations Trust Bank',
  'Pan Asia Bank',
  'Seylan Bank',
  'National Development Bank',
  'DFCC Bank',
  'Amana Bank',
  'Union Bank',
  'Cargills Bank',
  'Standard Chartered Bank',
  'HSBC',
  'Other'
];

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    balance: '',
    account_holder_name: '',
    branch_code: '',
  });
  const [selectedBankListValue, setSelectedBankListValue] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/bank-accounts');
      const accountsData = response.data?.data || response.data || [];
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      toast.error('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleBankSelect = (value: string) => {
    setSelectedBankListValue(value);
    if (value !== 'Other') {
      setFormData(prev => ({ ...prev, bank_name: value }));
    } else {
        setFormData(prev => ({ ...prev, bank_name: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        balance: parseFloat(formData.balance),
        account_holder_name: formData.account_holder_name,
        branch_code: formData.branch_code,
      };

      if (editMode && editingId) {
        await api.put(`/bank-accounts/${editingId}`, payload);
        toast.success('Bank account updated successfully');
      } else {
        await api.post('/bank-accounts', payload);
        toast.success('Bank account created successfully');
      }

      await fetchAccounts();
      handleCloseDialog();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} account`);
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditMode(true);
    setEditingId(account.id);
    
    // Check if bank is in list
    const isKnownBank = SRI_LANKAN_BANKS.includes(account.bank_name);
    setSelectedBankListValue(isKnownBank ? account.bank_name : 'Other');

    setFormData({
      bank_name: account.bank_name,
      account_number: account.account_number,
      balance: account.balance.toString(),
      account_holder_name: account.account_holder_name || '',
      branch_code: account.branch_code || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;

    try {
      await api.delete(`/bank-accounts/${id}`);
      toast.success('Bank account deleted');
      await fetchAccounts();
    } catch (error: any) {
        console.error('Failed to delete account:', error);
        toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setEditingId(null);
    setFormData({ bank_name: '', account_number: '', balance: '', account_holder_name: '', branch_code: '' });
    setSelectedBankListValue('');
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 lg:pb-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Landmark className="h-6 w-6 text-indigo-600" />
            My Wallet
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">Manage your bank accounts and cards</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-zinc-900 hover:bg-zinc-800">
          <Plus className="h-4 w-4 mr-2" />
          Add New Card
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card className="border-dashed border-2 bg-zinc-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-zinc-100 p-4 rounded-full mb-4">
                <Landmark className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="text-lg font-medium text-zinc-900 mb-1">No bank accounts added</p>
            <p className="text-zinc-500 mb-6 text-center max-w-sm">
                Add your bank details to track balances and expenses.
            </p>
            <Button onClick={() => setDialogOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <BankCard 
                key={account.id} 
                account={account} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <ResponsiveModal open={dialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>{editMode ? 'Edit Card Details' : 'Add New Bank Card'}</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              {editMode ? 'Update your virtual card details.' : 'Enter your bank details to generate a virtual card.'}
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <ResponsiveModalBody className="space-y-4">
              {error && (
                <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm border border-rose-200/60">
                  {error}
                </div>
              )}

              {/* Bank Selection */}
              <div className="space-y-2">
                <Label htmlFor="bank_select">Bank Name</Label>
                <Select value={selectedBankListValue} onValueChange={handleBankSelect}>
                  <SelectTrigger className="h-11 bg-zinc-50/50 border-zinc-200/60">
                    <SelectValue placeholder="Select Bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {SRI_LANKAN_BANKS.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Custom Bank Name Input */}
                {selectedBankListValue === 'Other' && (
                     <Input
                        placeholder="Enter Bank Name"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        required
                        className="h-11 mt-2 bg-white border-zinc-200/60"
                        autoFocus
                    />
                )}
              </div>

               {/* Account Holder */}
               <div className="space-y-2">
                <Label htmlFor="holder_name">Account Holder Name</Label>
                <Input
                  id="holder_name"
                  placeholder="e.g. JOHN DOE"
                  value={formData.account_holder_name}
                  onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                  className="h-11 bg-zinc-50/50 border-zinc-200/60 uppercase placeholder:normal-case"
                />
              </div>

              {/* Account Number & Branch Code */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                    id="account_number"
                    placeholder="0000 0000 0000"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    required
                    className="h-11 bg-zinc-50/50 border-zinc-200/60 font-mono"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="branch_code">Branch Code</Label>
                     <Input
                    id="branch_code"
                    placeholder="000"
                    value={formData.branch_code}
                    onChange={(e) => setFormData({ ...formData, branch_code: e.target.value })}
                    className="h-11 bg-zinc-50/50 border-zinc-200/60"
                    />
                </div>
              </div>

              {/* Balance */}
              <div className="space-y-2">
                <Label htmlFor="balance">Current Balance</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">LKR</span>
                    <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    required
                    className="pl-12 h-11 bg-zinc-50/50 border-zinc-200/60 text-lg font-medium"
                    />
                </div>
              </div>

            </ResponsiveModalBody>

            <ResponsiveModalFooter className="flex flex-col sm:flex-row gap-3 border-t border-zinc-200/60 bg-zinc-50/50 p-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={submitting}
                className="w-full sm:flex-1 h-11"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="w-full sm:flex-1 h-11 bg-zinc-900 hover:bg-zinc-800">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editMode ? 'Update Card' : 'Create Card')}
              </Button>
            </ResponsiveModalFooter>
          </form>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
