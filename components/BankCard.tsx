'use client';

import { BankAccount } from '@/app/dashboard/bank-accounts/page';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, MoreVertical, Trash2, Copy, Share2, Wallet, CreditCard, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import CurrencyDisplay from './CurrencyDisplay';

interface BankCardProps {
    account: BankAccount & {
        account_holder_name?: string;
        branch_code?: string;
        color?: string;
    };
    onEdit: (account: BankAccount) => void;
    onDelete: (id: number) => void;
}

export default function BankCard({ account, onEdit, onDelete }: BankCardProps) {
    
    const handleShareInfo = () => {
        const text = `🏦 *${account.bank_name}*\nName: ${account.account_holder_name || 'N/A'}\nAcc: ${account.account_number}\nBranch: ${account.branch_code || 'N/A'}`;
        navigator.clipboard.writeText(text);
        toast.success('Bank details copied for sharing!');
    };

    const handleCopyAccountNumber = () => {
        navigator.clipboard.writeText(account.account_number);
        toast.success('Account number copied!');
    };

    return (
        <div className="relative group perspective-1000 h-full">
             {/* Sleek Virtual Card Container */}
            <div className={cn(
                "relative overflow-hidden rounded-xl transition-all duration-500 ease-out transform",
                "bg-zinc-950 border border-zinc-800",
                "group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-black/50 group-hover:border-zinc-700",
                "flex flex-col h-[200px] select-none"
            )}>
                
                {/* Granular Noise / Dot Grid Texture */}
                <div 
                    className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '12px 12px' }}
                />
                
                {/* Ambient Glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between h-full p-6">
                    
                    {/* Top Row: Identification */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                             <div className="h-9 w-9 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                                <Layers className="h-4 w-4 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-zinc-100 tracking-wide uppercase">{account.bank_name}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                    </span>
                                    <p className="text-[9px] text-emerald-500/80 uppercase tracking-widest font-semibold">Active Gateway</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                             <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900 rounded-md"
                                onClick={handleShareInfo}
                            >
                                <Share2 className="h-3.5 w-3.5" />
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900 rounded-md">
                                        <MoreVertical className="h-3.5 w-3.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 bg-zinc-950 border-zinc-800 text-zinc-400">
                                    <DropdownMenuItem className="focus:bg-zinc-900 focus:text-zinc-200 cursor-pointer" onClick={() => onEdit(account)}>
                                        <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        className="text-rose-900 focus:bg-rose-950/30 focus:text-rose-500 cursor-pointer" 
                                        onClick={() => onDelete(account.id)}
                                    >
                                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Middle: Financials */}
                    <div className="space-y-1">
                        <div className="flex items-baseline gap-1">
                             <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                                 <CurrencyDisplay amount={account.balance} />
                             </span>
                        </div>
                        <div className="flex items-center gap-2 group/copy cursor-pointer w-fit" onClick={handleCopyAccountNumber}>
                            <p className="font-mono text-sm text-zinc-500 tracking-[0.2em] group-hover/copy:text-zinc-300 transition-colors">
                                {account.account_number}
                            </p>
                            <Copy className="h-3 w-3 text-zinc-700 group-hover/copy:text-zinc-400 transition-colors opacity-0 group-hover/copy:opacity-100" />
                        </div>
                    </div>

                    {/* Bottom Row: Technical Metadata */}
                    <div className="flex items-end justify-between border-t border-zinc-900 pt-4 mt-2">
                        <div className="space-y-1">
                            <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Holder</p>
                             <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest truncate max-w-[120px]">
                                {account.account_holder_name || 'ANONYMOUS'}
                            </p>
                        </div>
                        
                        <div className="text-right space-y-1">
                            <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Branch</p>
                            <p className="text-[10px] font-mono text-zinc-400 tracking-wider">
                                {account.branch_code || '---'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Tilt Reflection Effect (Optional CSS Polish) */}
            <style jsx>{`
                .perspective-1000 { perspective: 1000px; }
            `}</style>
        </div>
    );
}
