import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { format, addMonths } from 'date-fns';
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
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Edit, Trash, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

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
  const [monthsToPay, setMonthsToPay] = useState(1);

  const percentage = (installment.paid_months / installment.total_months) * 100;
  const remainingTotal = installment.total_amount - (installment.monthly_amount * installment.paid_months);
  const nextDueDate = addMonths(new Date(installment.start_date), installment.paid_months);
  const isCompleted = installment.status === 'completed';
  const remainingMonths = installment.total_months - installment.paid_months;
  const totalToPay = installment.monthly_amount * monthsToPay;

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
    setMonthsToPay(1);
  };

  const handleDelete = async () => {
    setLoading(true);
    await onDelete(installment.id);
    setLoading(false);
    setDeleteDialogOpen(false);
  };

  // Generate segments for progress bar (max 10)
  const totalSegments = 10;
  const filledSegments = Math.round((installment.paid_months / installment.total_months) * totalSegments);

  return (
    <>
      <Card className="group bg-white border border-zinc-200/60 shadow-none hover:border-zinc-400 transition-all duration-300 rounded-lg">
        <CardContent className="p-4 flex flex-col h-full">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
             <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-0.5 font-mono uppercase tracking-wider">
                   <span>SW</span>
                   <span className="w-px h-3 bg-zinc-200" />
                   <span className="truncate">{installment.category.name}</span>
                </div>
                <h3 className="text-sm font-bold text-zinc-900 truncate tracking-tight">{installment.item_name}</h3>
             </div>
             <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-900" onClick={() => onEdit(installment)}>
                       <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-rose-600" onClick={() => setDeleteDialogOpen(true)}>
                       <Trash className="h-3.5 w-3.5" />
                    </Button>
                 </div>
              </div>

          {/* Status Badge */}
          <div className="mb-4">
             <span className={cn(
                "inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-sm",
                isCompleted 
                   ? "bg-zinc-100 text-zinc-600 border-zinc-200" 
                   : "bg-white text-zinc-900 border-zinc-300"
             )}>
                {isCompleted ? 'Settled' : `${remainingMonths} MO / ${remainingTotal.toLocaleString()} LEFT`}
             </span>
          </div>

          {/* Data Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-b border-zinc-100 py-3">
             <div>
                <p className="text-[10px] text-zinc-400 font-mono uppercase">Monthly</p>
                <p className="text-sm font-bold text-zinc-900"><CurrencyDisplay amount={installment.monthly_amount} /></p>
             </div>
             <div className="text-right">
                <p className="text-[10px] text-zinc-400 font-mono uppercase">Total Paid</p>
                <p className="text-sm font-medium text-zinc-600"><CurrencyDisplay amount={installment.total_amount - remainingTotal} /></p>
             </div>
          </div>

          {/* Segmented Progress */}
          <div className="mb-4 space-y-1.5">
             <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>PROGRESS</span>
                <span>{Math.round(percentage)}%</span>
             </div>
             <div className="flex gap-0.5 h-1.5 w-full">
                {Array.from({ length: totalSegments }).map((_, i) => (
                   <div 
                      key={i} 
                      className={cn(
                         "flex-1 rounded-[1px]", 
                         i < filledSegments ? "bg-zinc-900" : "bg-zinc-100"
                      )} 
                   />
                ))}
             </div>
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between pt-2">
             <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                <Clock className="h-3 w-3" />
                <span>{isCompleted ? 'Completed' : `Due: ${format(nextDueDate, 'MMM dd')}`}</span>
             </div>
             
             {!isCompleted && (
                <Button 
                   size="sm" 
                   onClick={() => setPayDialogOpen(true)}
                   className="h-7 text-[10px] font-medium bg-zinc-900 hover:bg-zinc-800 text-white shadow-none px-3"
                >
                   Pay Now
                </Button>
             )}
          </div>

        </CardContent>
      </Card>

      {/* Pay Modal */}
      <ResponsiveModal open={payDialogOpen} onOpenChange={setPayDialogOpen}>
         <ResponsiveModalContent className="sm:max-w-md">
            <ResponsiveModalHeader>
               <ResponsiveModalTitle>Process Payment</ResponsiveModalTitle>
               <ResponsiveModalDescription>Pay installment for {installment.item_name}</ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <ResponsiveModalBody>
               <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                     <span className="text-sm text-zinc-600">Monthly Amount</span>
                     <span className="font-bold font-mono"><CurrencyDisplay amount={installment.monthly_amount} /></span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-zinc-500">Months to Pay</label>
                    <Select value={monthsToPay.toString()} onValueChange={(v) => setMonthsToPay(Number(v))}>
                       <SelectTrigger>
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                          {Array.from({ length: Math.min(12, remainingMonths) }, (_, i) => i + 1).map(num => (
                             <SelectItem key={num} value={num.toString()}>{num} Month{num > 1 ? 's' : ''}</SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                     <span className="text-sm font-medium">Total Payable</span>
                     <span className="text-lg font-bold text-zinc-900"><CurrencyDisplay amount={totalToPay} /></span>
                  </div>

                  {(installment.bank_account || installment.fund_source) && (
                     <div className={cn(
                        "flex items-center gap-2 text-xs", 
                        hasInsufficientFunds ? "text-rose-600" : "text-emerald-600"
                     )}>
                        {hasInsufficientFunds ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                        <span>Available Balance: <CurrencyDisplay amount={availableBalance} /></span>
                     </div>
                  )}
               </div>
            </ResponsiveModalBody>
            <ResponsiveModalFooter>
               <Button variant="ghost" onClick={() => setPayDialogOpen(false)}>Cancel</Button>
               <Button onClick={handlePay} disabled={loading || hasInsufficientFunds} className="bg-zinc-900 text-white hover:bg-zinc-800">
                  {loading ? 'Processing...' : 'Confirm'}
               </Button>
            </ResponsiveModalFooter>
         </ResponsiveModalContent>
      </ResponsiveModal>



      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Installment Plan?"
        description={`Are you sure you want to delete "${installment.item_name}"? This will remove all tracking for this plan.`}
        onConfirm={handleDelete}
        isLoading={loading}
      />
    </>
  );
}
