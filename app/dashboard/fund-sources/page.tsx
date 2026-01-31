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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wallet, ArrowDownToLine, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FundSource {
  id: number;
  source_name: string;
  amount: number;
  description: string;
  created_at: string;
}

interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  balance: number;
}

export default function FundSourcesPage() {
  const [sources, setSources] = useState<FundSource[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Withdraw Modal State
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchSources(), fetchBankAccounts()]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async () => {
    try {
      const response = await api.get('/fund-sources');
      const sourcesData = response.data?.data || response.data || [];
      setSources(Array.isArray(sourcesData) ? sourcesData : []);
    } catch (error) {
      console.error('Failed to fetch fund sources:', error);
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

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankId || !withdrawAmount) return;

    setSubmitting(true);
    try {
      await api.post('/fund-sources/withdraw', {
        bank_account_id: parseInt(selectedBankId),
        amount: parseFloat(withdrawAmount),
      });

      toast.success('Withdrawal successful');
      setWithdrawOpen(false);
      setSelectedBankId('');
      setWithdrawAmount('');
      
      // Refresh data to show updated balances
      await fetchData();
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      toast.error(error.response?.data?.message || 'Withdrawal failed');
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

  const getTotalBalance = () => {
    return sources.reduce((sum, source) => sum + parseFloat(source.amount.toString()), 0);
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
          <h1 className="text-3xl font-bold text-slate-900">Wallet</h1>
          <p className="text-slate-600 mt-1">Manage your wallet balance</p>
        </div>
        <Button onClick={() => setWithdrawOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <ArrowDownToLine className="h-4 w-4 mr-2" />
          Withdraw from Bank
        </Button>
      </div>

      {/* Total Wallet Balance Card */}
      {sources.length > 0 ? (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-green-900 text-lg sm:text-xl">Total Wallet Balance</CardTitle>
            <CardDescription className="text-green-700 text-xs sm:text-sm">
              Current cash in hand
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-3xl sm:text-4xl font-bold text-green-900">
              {formatCurrency(getTotalBalance())}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">No wallet found</p>
          </CardContent>
        </Card>
      )}

      {/* Withdraw Modal */}
      <ResponsiveModal open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Withdraw to Wallet</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Transfer money from a bank account to your wallet.
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <form onSubmit={handleWithdraw}>
            <ResponsiveModalBody className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank">Select Bank Account</Label>
                <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.bank_name} - {formatCurrency(parseFloat(account.balance.toString()))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 5000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required
                />
              </div>
            </ResponsiveModalBody>
            <ResponsiveModalFooter>
               <Button
                type="button"
                variant="outline"
                onClick={() => setWithdrawOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !selectedBankId || !withdrawAmount}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Withdraw'
                )}
              </Button>
            </ResponsiveModalFooter>
          </form>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
