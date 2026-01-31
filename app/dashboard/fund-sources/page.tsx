'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
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
import { Wallet, ArrowDownToLine, Loader2, DollarSign, Layers, Activity, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import CurrencyDisplay from '@/components/CurrencyDisplay';

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
      
      await fetchData();
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getTotalBalance = () => {
    return sources.reduce((sum, source) => sum + parseFloat(source.amount.toString()), 0);
  };

  const getTotalBankBalance = () => {
    return bankAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance.toString()), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  const totalWallet = getTotalBalance();
  const totalBank = getTotalBankBalance();

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-20 animate-in fade-in duration-500">
      <div className="max-w-[1920px] mx-auto p-4 lg:p-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6 text-zinc-400" />
            Wallet Hub
          </h1>
          <Button onClick={() => setWithdrawOpen(true)} className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10">
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Withdraw from Bank
          </Button>
        </div>


        {/* Wallet Source Card */}
        {sources.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {sources.map((source) => (
              <Card key={source.id} className="border-green-200/60 bg-gradient-to-br from-green-50/80 to-green-100/40">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-xl bg-green-100 border border-green-200 flex items-center justify-center text-green-600">
                          <Wallet className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-zinc-900 leading-tight">{source.source_name}</h3>
                          <p className="text-xs text-zinc-500 mt-0.5">Cash in hand</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-xs sm:text-sm font-medium text-green-600">Balance</p>
                        <p className="text-3xl sm:text-4xl font-bold text-green-700 mt-1">
                          <CurrencyDisplay amount={source.amount} />
                        </p>
                      </div>

                      {source.description && (
                        <div className="mt-4 pt-4 border-t border-green-200/60">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Note</p>
                          <p className="text-sm text-zinc-600">{source.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            <Wallet className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-sm font-medium">No wallet found</p>
          </div>
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
            <form onSubmit={handleWithdraw} className="flex flex-col h-full">
              <ResponsiveModalBody className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Bank Account</label>
                  <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                    <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 h-10">
                      <SelectValue placeholder="Select a bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.bank_name} - <CurrencyDisplay amount={parseFloat(account.balance.toString())} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </ResponsiveModalBody>

              <ResponsiveModalFooter className="flex flex-row gap-3 p-4 sm:p-6 bg-zinc-50/50 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setWithdrawOpen(false)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || !selectedBankId || !withdrawAmount} className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800">
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
    </div>
  );
}
