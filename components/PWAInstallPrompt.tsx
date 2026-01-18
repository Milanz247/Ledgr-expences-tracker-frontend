'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Don't show immediately - wait a bit for user to explore
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 30000); // Show after 30 seconds
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');

    // Show again after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-prompt-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 lg:left-auto lg:right-8 lg:bottom-8 lg:w-96 animate-in slide-in-from-bottom duration-500">
      <Card className="shadow-2xl border-2 border-primary/20">
        <CardContent className="p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>

          <div className="flex items-start gap-4 pr-8">
            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-3 shadow-lg">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 mb-1">
                Install Expense Tracker
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Add to your home screen for quick access and offline use!
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  className="flex-1 min-h-[44px]"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install App
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="min-h-[44px]"
                >
                  Later
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-primary font-semibold text-lg">📱</div>
                <p className="text-xs text-slate-600 mt-1">Works Offline</p>
              </div>
              <div>
                <div className="text-primary font-semibold text-lg">⚡</div>
                <p className="text-xs text-slate-600 mt-1">Fast Loading</p>
              </div>
              <div>
                <div className="text-primary font-semibold text-lg">🔔</div>
                <p className="text-xs text-slate-600 mt-1">Notifications</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
