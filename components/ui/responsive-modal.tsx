'use client';

import * as React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalContentProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveModalContext = React.createContext<{
  isDesktop: boolean;
}>({
  isDesktop: true,
});

export function ResponsiveModal({
  open,
  onOpenChange,
  children,
}: ResponsiveModalProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (isDesktop) {
    return (
      <ResponsiveModalContext.Provider value={{ isDesktop }}>
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      </ResponsiveModalContext.Provider>
    );
  }

  return (
    <ResponsiveModalContext.Provider value={{ isDesktop }}>
      <Drawer open={open} onOpenChange={onOpenChange}>
        {children}
      </Drawer>
    </ResponsiveModalContext.Provider>
  );
}

export function ResponsiveModalContent({
  children,
  className,
}: ResponsiveModalContentProps) {
  const { isDesktop } = React.useContext(ResponsiveModalContext);

  if (isDesktop) {
    return (
      <DialogContent
        className={cn(
          'max-w-lg max-h-[90vh] overflow-hidden flex flex-col',
          'border-zinc-200/60 bg-white/95 backdrop-blur-xl shadow-xl',
          className
        )}
      >
        {children}
      </DialogContent>
    );
  }

  return (
    <DrawerContent className={cn('max-h-[90vh]', className)}>
      {children}
    </DrawerContent>
  );
}

export function ResponsiveModalHeader({
  children,
  className,
}: ResponsiveModalHeaderProps) {
  const { isDesktop } = React.useContext(ResponsiveModalContext);

  if (isDesktop) {
    return <DialogHeader className={className}>{children}</DialogHeader>;
  }

  return <DrawerHeader className={className}>{children}</DrawerHeader>;
}

export function ResponsiveModalTitle({
  children,
  className,
}: ResponsiveModalTitleProps) {
  const { isDesktop } = React.useContext(ResponsiveModalContext);

  if (isDesktop) {
    return (
      <DialogTitle className={cn('text-zinc-900', className)}>
        {children}
      </DialogTitle>
    );
  }

  return <DrawerTitle className={className}>{children}</DrawerTitle>;
}

export function ResponsiveModalDescription({
  children,
  className,
}: ResponsiveModalDescriptionProps) {
  const { isDesktop } = React.useContext(ResponsiveModalContext);

  if (isDesktop) {
    return (
      <DialogDescription className={cn('text-zinc-500', className)}>
        {children}
      </DialogDescription>
    );
  }

  return (
    <DrawerDescription className={className}>{children}</DrawerDescription>
  );
}

export function ResponsiveModalBody({
  children,
  className,
}: ResponsiveModalBodyProps) {
  const { isDesktop } = React.useContext(ResponsiveModalContext);

  if (isDesktop) {
    return (
      <div className={cn('flex-1 overflow-y-auto px-6 py-4', className)}>
        {children}
      </div>
    );
  }

  return (
    <DrawerBody className={cn('pb-safe', className)}>{children}</DrawerBody>
  );
}

export function ResponsiveModalFooter({
  children,
  className,
}: ResponsiveModalFooterProps) {
  const { isDesktop } = React.useContext(ResponsiveModalContext);

  if (isDesktop) {
    return <DialogFooter className={className}>{children}</DialogFooter>;
  }

  return (
    <DrawerFooter className={cn('pb-safe', className)}>{children}</DrawerFooter>
  );
}

export { DrawerClose as ResponsiveModalClose };
