'use client';

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
  variant?: 'destructive' | 'default';
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false,
  variant = 'destructive',
}: ConfirmModalProps) {
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-[400px] p-0 overflow-hidden bg-white border border-zinc-200">
        <div className="flex flex-col p-5 sm:p-6 text-left">
           
           {/* Minimalist Icon Header */}
           <div className="mb-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="space-y-1 pt-0.5">
                 <ResponsiveModalTitle className="text-base sm:text-lg font-bold text-zinc-950 leading-tight">
                  {title}
                </ResponsiveModalTitle>
                <ResponsiveModalDescription className="text-zinc-500 text-sm leading-relaxed">
                  {description}
                </ResponsiveModalDescription>
              </div>
           </div>

           {/* Buttons - Strict Black/White/Red */}
           <div className="grid grid-cols-2 gap-3 pt-1">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={isLoading}
                className="w-full bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50 font-medium h-10 text-sm"
              >
                {cancelText}
              </Button>
              <Button 
                variant="default" 
                onClick={onConfirm} 
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium h-10 text-sm shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  confirmText
                )}
              </Button>
           </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
