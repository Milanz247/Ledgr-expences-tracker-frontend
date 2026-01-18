'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import CurrencyDisplay from './CurrencyDisplay';

// Types (Mirrors the Loan interface)
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
}

interface LoanDossierCardProps {
  loan: Loan;
  onRepay: (loan: Loan) => void;
  onEdit: (loan: Loan) => void;
  onDelete: (id: number) => void;
}

export default function LoanDossierCard({ loan, onRepay, onEdit, onDelete }: LoanDossierCardProps) {
  // 3D Tilt Effect Logic
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Progress Calculation
  const progress = ((loan.amount - loan.balance_remaining) / loan.amount) * 100;
  // Create 10 blocks for segmented progress
  const segments = Array.from({ length: 10 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="relative group h-full"
    >
      <div 
        className={cn(
          "relative h-full bg-white border border-zinc-200/60 rounded-xl overflow-hidden shadow-sm transition-shadow duration-200",
          "group-hover:shadow-xl group-hover:border-zinc-300/80"
        )}
        style={{ transform: "translateZ(0)" }}
      >
        {/* Technical Header */}
        <div className="p-5 pb-4 border-b border-zinc-100 flex justify-between items-start bg-zinc-50/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-zinc-900 tracking-tight">{loan.lender_name}</h3>
              <span className={cn(
                "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border tracking-wider",
                loan.status === 'paid' ? "border-green-200 text-green-700 bg-green-50" :
                loan.status === 'unpaid' ? "border-amber-200 text-amber-700 bg-amber-50" :
                "border-zinc-200 text-zinc-600 bg-zinc-50"
              )}>
                {loan.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
              ID: {loan.id.toString().padStart(4, '0')} • {format(new Date(loan.created_at), 'MMM yyyy')}
            </p>
          </div>
          
          {/* Quick Actions (Visible on Hover) */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
             <Button variant="ghost" size="icon" onClick={() => onEdit(loan)} className="h-7 w-7 text-zinc-400 hover:text-zinc-900">
               <span className="sr-only">Edit</span>
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 1 22l1.5-6.5L17 3z"></path></svg>
             </Button>
             <Button variant="ghost" size="icon" onClick={() => onDelete(loan.id)} className="h-7 w-7 text-zinc-400 hover:text-rose-600">
               <span className="sr-only">Delete</span>
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
             </Button>
          </div>
        </div>

        {/* Dossier Body */}
        <div className="p-5 pt-4 space-y-6 flex flex-col flex-1 justify-between">
          
          {/* Data Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">Original</p>
              <div className="text-zinc-400 font-medium font-mono text-sm">
                 <CurrencyDisplay amount={loan.amount} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">Outstanding</p>
              <div className={cn(
                "font-bold font-mono text-lg tracking-tight",
                loan.balance_remaining > 0 ? "text-zinc-900" : "text-green-600"
              )}>
                 <CurrencyDisplay amount={loan.balance_remaining} />
              </div>
            </div>
          </div>

          {/* Segmented Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-end text-[10px] text-zinc-400 uppercase font-medium tracking-wider">
               <span>Repayment Progress</span>
               <span>{Math.round(progress)}%</span>
            </div>
            <div className="flex gap-0.5 h-1.5">
               {segments.map((_, i) => (
                 <div 
                   key={i} 
                   className={cn(
                     "flex-1 rounded-sm transition-all duration-500",
                     (i / 10) * 100 < progress ? "bg-zinc-900" : "bg-zinc-100"
                   )}
                 />
               ))}
            </div>
          </div>

          {/* Activity/Due Date Micro-Footer */}
          <div className="pt-2 border-t border-dashed border-zinc-200 flex items-center justify-between">
            {loan.due_date ? (
               <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Clock className="h-3 w-3" />
                  <span className={new Date(loan.due_date) < new Date() && loan.status !== 'paid' ? "text-amber-600 font-medium" : ""}>
                    Due {format(new Date(loan.due_date), 'MMM dd')}
                  </span>
               </div>
            ) : (
              <span className="text-[10px] text-zinc-400 italic">No fixed due date</span>
            )}
            
            {loan.is_funding_source && (
               <div className="flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                 <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                 Source
               </div>
            )}
          </div>
          
           {/* Action Button / Settled Badge */}
           {loan.status !== 'paid' ? (
              <Button 
                onClick={() => onRepay(loan)}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white shadow-none text-xs h-9 mt-auto"
              >
                  <DollarSign className="h-3 w-3 mr-1.5" />
                  Make Repayment
              </Button>
           ) : (
             <div className="w-full h-9 flex items-center justify-center bg-zinc-100 text-zinc-500 rounded-md text-xs font-medium uppercase tracking-wider mt-auto border border-zinc-200">
               <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full mr-2" />
               Settled
             </div>
           )}

        </div>
      </div>
    </motion.div>
  );
}
