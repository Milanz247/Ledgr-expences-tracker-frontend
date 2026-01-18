import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle2, AlertTriangle, ArrowRight, CreditCard, Clock, MoreVertical, Edit, Trash, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { format, addMonths } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface InstallmentCardProps {
  installment: Installment;
  onPay: (installment: Installment, months: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onEdit: (installment: Installment) => void;
}

export default function InstallmentCard({ installment, onPay, onDelete, onEdit }: InstallmentCardProps) {
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Payment State
  const [monthsToPay, setMonthsToPay] = useState(1);

  const percentage = (installment.paid_months / installment.total_months) * 100;
  const remainingTotal = installment.total_amount - (installment.monthly_amount * installment.paid_months);
  const nextDueDate = addMonths(new Date(installment.start_date), installment.paid_months);
  const isCompleted = installment.status === 'completed';
  const remainingMonths = installment.total_months - installment.paid_months;

  // Calculate dynamic totals
  const totalToPay = installment.monthly_amount * monthsToPay;
  
  // Determine available balance based on linked source
  const availableBalance = installment.bank_account 
    ? installment.bank_account.balance 
    : installment.fund_source 
      ? installment.fund_source.amount 
      : 0;

  const hasInsufficientFunds = totalToPay > availableBalance;

  const handlePay = async () => {
    if (hasInsufficientFunds && (installment.bank_account || installment.fund_source)) return;
    setLoading(true);
    await onPay(installment, monthsToPay);
    setLoading(false);
    setPayDialogOpen(false);
    setMonthsToPay(1); // Reset
  };

  const handleDelete = async () => {
    setLoading(true);
    await onDelete(installment.id);
    setLoading(false);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="group relative overflow-hidden bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900" />
        
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 tracking-tight">{installment.item_name}</h3>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-1">
                {installment.category.name}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
                <div className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  isCompleted 
                    ? "bg-zinc-900 text-white border-zinc-900" 
                    : "bg-white text-zinc-900 border-zinc-200"
                )}>
                  {isCompleted ? 'Completed' : `${remainingMonths} Months Left`}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-zinc-400 hover:text-zinc-600">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(installment)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit Plan
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => setDeleteDialogOpen(true)}>
                      <Trash className="mr-2 h-4 w-4" /> Delete Plan
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>

          {/* Amount Display */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-1">Monthly</p>
              <div className="font-bold text-zinc-900 text-lg">
                <CurrencyDisplay amount={installment.monthly_amount} />
              </div>
            </div>
            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-1">Remaining</p>
              <div className="font-bold text-zinc-900 text-lg opacity-80">
                <CurrencyDisplay amount={remainingTotal} />
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-zinc-700">Payment Progress</span>
              <span className="text-zinc-500">{installment.paid_months} of {installment.total_months} months</span>
            </div>
            <Progress value={percentage} className="h-2 bg-zinc-100" indicatorClassName="bg-zinc-900" />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
             <div className="flex items-center gap-2 text-xs text-zinc-500">
               <Clock className="h-3.5 w-3.5" />
               <span>Next: {format(nextDueDate, 'MMM dd, yyyy')}</span>
             </div>

             {!isCompleted && (
               <Button 
                size="sm" 
                onClick={() => setPayDialogOpen(true)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10 transition-all active:scale-95"
               >
                 Pay Installment
               </Button>
             )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Confirmation Modal */}
      <ResponsiveModal open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Pay Installment</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Select how many months you want to pay for <strong>{installment.item_name}</strong>.
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <ResponsiveModalBody>
            <div className="space-y-4 py-2">
                
                {/* Month Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">Months to Pay</label>
                    <Select 
                      value={monthsToPay.toString()} 
                      onValueChange={(v) => setMonthsToPay(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: Math.min(12, remainingMonths) }, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Month{num > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>

                {/* Calculation Card */}
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-500">Amount per Month</span>
                    <span className="text-zinc-900">
                      <CurrencyDisplay amount={installment.monthly_amount} />
                    </span>
                  </div>
                  <div className="h-px bg-zinc-200/50" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-zinc-900">Total to Pay</span>
                    <span className="font-bold text-lg text-zinc-900">
                      <CurrencyDisplay amount={totalToPay} />
                    </span>
                  </div>
                </div>

                {/* Balance Check */}
                {(installment.bank_account || installment.fund_source) && (
                    <div className={cn(
                        "flex items-center justify-between p-3 rounded-lg text-sm border",
                        hasInsufficientFunds 
                            ? "bg-rose-50 border-rose-100 text-rose-700"
                            : "bg-emerald-50 border-emerald-100 text-emerald-700"
                    )}>
                        <span className="flex items-center gap-2">
                            {hasInsufficientFunds ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                            Available Balance
                        </span>
                        <span className="font-bold">
                            <CurrencyDisplay amount={availableBalance} />
                        </span>
                    </div>
                )}
            </div>
          </ResponsiveModalBody>
          <ResponsiveModalFooter>
            <Button variant="outline" onClick={() => setPayDialogOpen(false)}>Cancel</Button>
            <Button 
                onClick={handlePay} 
                disabled={loading || hasInsufficientFunds} 
                className={cn(
                    "bg-zinc-900 hover:bg-zinc-800",
                    hasInsufficientFunds && "opacity-50 cursor-not-allowed hover:bg-zinc-900"
                )}
            >
              {loading ? 'Processing...' : hasInsufficientFunds ? 'Insufficient Funds' : 'Confirm Payment'}
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Delete Confirmation Modal */}
      <ResponsiveModal open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <ResponsiveModalContent>
            <ResponsiveModalHeader>
                <ResponsiveModalTitle>Delete Installment Plan</ResponsiveModalTitle>
                <ResponsiveModalDescription>
                    Are you sure you want to delete <strong>{installment.item_name}</strong>? This action cannot be undone.
                </ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <ResponsiveModalFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                    {loading ? 'Deleting...' : 'Delete Plan'}
                </Button>
            </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  );
}
