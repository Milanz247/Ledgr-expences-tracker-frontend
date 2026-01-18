'use client';

import { BankAccount } from '@/app/dashboard/bank-accounts/page';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, MoreVertical, Trash2, Copy, Share2, Wallet } from 'lucide-react';
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
        <div className="relative group perspective-1000">
             {/* Sleek Tile Container */}
            <div className={cn(
                "relative overflow-hidden rounded-xl border border-zinc-800 transition-all duration-300",
                "bg-zinc-950 hover:bg-zinc-900/80 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1",
                "flex flex-col h-[180px] select-none"
            )}>
                
                {/* Technical Grid Background Pattern (CSS Trick) */}
                <div 
                    className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                />

                <div className="relative z-10 flex flex-col justify-between h-full p-5">
                    
                    {/* Top Row: Bank Name & Balance */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                                <Wallet className="h-5 w-5 text-zinc-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-zinc-100 tracking-wide">{account.bank_name}</h3>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Liquid Asset</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="font-bold text-lg text-emerald-500 tracking-tight">
                                 <CurrencyDisplay amount={account.balance} />
                             </div>
                        </div>
                    </div>

                    {/* Middle Row: Account Number */}
                    <div className="flex items-center gap-3 pt-2">
                        <p className="font-mono text-xl text-zinc-300 tracking-widest tabular-nums">
                            {account.account_number}
                        </p>
                         <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 rounded-md transition-colors"
                            onClick={handleCopyAccountNumber}
                            title="Copy Account Number"
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>

                    {/* Bottom Row: Holder & Branch + Actions */}
                    <div className="flex items-end justify-between border-t border-zinc-900/50 pt-3 mt-1">
                        <div className="space-y-0.5">
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">Holder</p>
                             <p className="text-sm font-medium text-zinc-400 uppercase truncate max-w-[150px]">
                                {account.account_holder_name || 'Unknown'}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="text-right space-y-0.5">
                                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">Branch</p>
                                <p className="text-sm font-mono text-zinc-400">
                                    {account.branch_code || 'N/A'}
                                </p>
                            </div>
                            
                            {/* Actions Group */}
                            <div className="flex items-center gap-1 pl-3 border-l border-zinc-800">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md"
                                    onClick={handleShareInfo}
                                    title="Share Info"
                                >
                                    <Share2 className="h-4 w-4" />
                                </Button>
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40 bg-zinc-950 border-zinc-800 text-zinc-400">
                                        <DropdownMenuItem className="focus:bg-zinc-900 focus:text-zinc-200 cursor-pointer" onClick={() => onEdit(account)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            className="text-rose-900 focus:bg-rose-950/30 focus:text-rose-500 cursor-pointer" 
                                            onClick={() => onDelete(account.id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
