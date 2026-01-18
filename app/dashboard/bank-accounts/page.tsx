'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalBody,
  ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';
import { Plus, Landmark, Trash2, Edit } from 'lucide-react';

interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  balance: number;
}

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    balance: '',
  });
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
        await api.put(`/bank-accounts/${editingId}`, {
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          balance: parseFloat(formData.balance),
        });
      } else {
        await api.post('/bank-accounts', {
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          balance: parseFloat(formData.balance),
        });
      }

      await fetchAccounts();
      setDialogOpen(false);
      setEditMode(false);
      setEditingId(null);
      setFormData({ bank_name: '', account_number: '', balance: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} account`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditMode(true);
    setEditingId(account.id);
    setFormData({
      bank_name: account.bank_name,
      account_number: account.account_number,
      balance: account.balance.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;

    try {
      await api.delete(`/bank-accounts/${id}`);
      await fetchAccounts();
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
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
          <h1 className="text-3xl font-bold text-slate-900">Bank Accounts</h1>
          <p className="text-slate-600 mt-1">Manage your bank accounts and balances</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Landmark className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">No bank accounts yet</p>
            <p className="text-slate-600 mb-4">Add your first bank account to get started</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Bank Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} className="hover:shadow-lg transition-shadow py-3 sm:py-6">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-primary/10 rounded-lg p-1.5 sm:p-2">
                      <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">{account.bank_name}</CardTitle>
                      <CardDescription className="text-[10px] sm:text-xs">
                        {account.account_number}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-0.5 sm:mb-1">Current Balance</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                      onClick={() => handleEdit(account)}
                    >
                      <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                      onClick={() => handleDelete(account.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Account Dialog */}
      <ResponsiveModal open={dialogOpen} onOpenChange={setDialogOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>{editMode ? 'Edit' : 'Add'} Bank Account</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              {editMode ? 'Update' : 'Add a new'} bank account to track your finances
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <ResponsiveModalBody className="space-y-4">


              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  placeholder="e.g., Bank of Ceylon"
                  value={formData.bank_name}
                  onChange={(e) =>
                    setFormData({ ...formData, bank_name: e.target.value })
                  }
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  placeholder="e.g., 1234567890"
                  value={formData.account_number}
                  onChange={(e) =>
                    setFormData({ ...formData, account_number: e.target.value })
                  }
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance">Initial Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 50000"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({ ...formData, balance: e.target.value })
                  }
                  required
                  disabled={submitting}
                />
              </div>
            </ResponsiveModalBody>

            <ResponsiveModalFooter className="flex flex-col sm:flex-row gap-3 border-t border-zinc-200/60 bg-zinc-50/50 p-4 sm:p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setEditMode(false);
                  setEditingId(null);
                }}
                disabled={submitting}
                className="w-full sm:w-auto sm:flex-1 lg:flex-none h-12 lg:h-10 border-zinc-300 hover:bg-zinc-100"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto sm:flex-1 lg:flex-none h-12 lg:h-10 bg-zinc-900 hover:bg-zinc-800 text-white">
                {submitting ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update Account' : 'Add Account')}
              </Button>
            </ResponsiveModalFooter>
          </form>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
