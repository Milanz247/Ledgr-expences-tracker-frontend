'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Wifi, WifiOff, Download, Smartphone } from 'lucide-react';

export default function PWAStatusPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);
  const [manifestLoaded, setManifestLoaded] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    // Check if installed
    const installed = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(installed);

    // Check service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        setSwRegistered(!!reg);
      });
    }

    // Check manifest
    fetch('/manifest.json')
      .then(res => res.ok && setManifestLoaded(true))
      .catch(() => setManifestLoaded(false));
  }, []);

  const StatusItem = ({ label, status, icon: Icon }: any) => (
    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${status ? 'text-green-600' : 'text-red-600'}`} />
        <span className="font-medium text-slate-900">{label}</span>
      </div>
      {status ? (
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      ) : (
        <XCircle className="h-5 w-5 text-red-600" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">PWA Status</h1>
          <p className="text-slate-600 mt-2">Check your Progressive Web App configuration</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Installation Status</CardTitle>
            <CardDescription>Current PWA status and capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusItem
              label="Network Connection"
              status={isOnline}
              icon={isOnline ? Wifi : WifiOff}
            />
            <StatusItem
              label="App Installed"
              status={isInstalled}
              icon={Smartphone}
            />
            <StatusItem
              label="Service Worker"
              status={swRegistered}
              icon={Download}
            />
            <StatusItem
              label="Manifest Loaded"
              status={manifestLoaded}
              icon={CheckCircle2}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Install</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Android / Desktop</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                <li>Look for the install icon in the browser address bar</li>
                <li>Or tap the three-dot menu and select "Install app"</li>
                <li>Follow the installation prompts</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">iOS Safari</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                <li>Tap the Share button (square with arrow)</li>
                <li>Scroll and tap "Add to Home Screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">📱</div>
                <p className="text-sm font-medium">Installable</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">⚡</div>
                <p className="text-sm font-medium">Fast Loading</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">📴</div>
                <p className="text-sm font-medium">Works Offline</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-sm font-medium">Notifications Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
