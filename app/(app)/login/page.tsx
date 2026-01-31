'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Circle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState("ledgr");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Admin login attempted");
    // Placeholder for future admin login logic
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 p-4">
      <div className="w-full max-w-sm">
        {/* Logo and Brand Section */}
        <div className="flex flex-row items-center justify-center gap-3 mb-8">
          <div className="bg-zinc-900 text-white rounded-2xl p-3 shadow-lg shadow-zinc-900/20">
            <Circle className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Ledgr</h1>
        </div>

        <Tabs defaultValue="ledgr" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-white/50 backdrop-blur-sm border border-zinc-200/60 rounded-xl p-1 shadow-sm">
            <TabsTrigger 
              value="ledgr" 
              className="rounded-lg text-sm font-medium data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              Ledgr
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="rounded-lg text-sm font-medium data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ledgr">
            <Card className="shadow-[0_8px_30px_-5px_rgba(0,0,0,0.1)] border border-zinc-200/60 bg-white/80 backdrop-blur-sm animate-in fade-in-50 zoom-in-95 duration-300">
              <CardHeader className="space-y-1.5 pb-4 pt-6">
                <CardTitle className="text-2xl font-bold text-center text-zinc-900">
                  Welcome back
                </CardTitle>
                <CardDescription className="text-center text-zinc-500 text-sm">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pb-4 px-6">
                  {error && (
                    <div className="bg-rose-50 border border-rose-200/60 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      suppressHydrationWarning
                      className="bg-zinc-50/50 border-zinc-200 placeholder:text-zinc-400 focus-visible:ring-zinc-400 focus-visible:ring-2 focus-visible:border-transparent rounded-xl h-11 text-base transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
                        Password
                      </Label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-zinc-600 hover:text-zinc-900 font-medium transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      suppressHydrationWarning
                      className="bg-zinc-50/50 border-zinc-200 placeholder:text-zinc-400 focus-visible:ring-zinc-400 focus-visible:ring-2 focus-visible:border-transparent rounded-xl h-11 text-base transition-all"
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-2 pb-6 px-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    suppressHydrationWarning
                    className="w-full h-11 rounded-xl font-semibold text-sm bg-zinc-900 hover:bg-zinc-800 shadow-sm shadow-zinc-900/20 transition-all duration-200 hover:shadow-md hover:shadow-zinc-900/25 active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>

                  <p className="text-center text-sm text-zinc-500">
                    Don&apos;t have an account?{' '}
                    <Link
                      href="/register"
                      className="text-zinc-900 hover:text-zinc-700 font-semibold transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card className="shadow-[0_8px_30px_-5px_rgba(0,0,0,0.1)] border border-zinc-200/60 bg-white/80 backdrop-blur-sm animate-in fade-in-50 zoom-in-95 duration-300">
              <CardHeader className="space-y-1.5 pb-4 pt-6">
                <CardTitle className="text-2xl font-bold text-center text-zinc-900">
                  Portfolio Admin
                </CardTitle>
                <CardDescription className="text-center text-zinc-500 text-sm">
                  Restricted access for portfolio management
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleAdminSubmit}>
                <CardContent className="space-y-4 pb-4 px-6">
                  <div className="bg-amber-50 border border-amber-200/60 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium">
                   This area is currently under development.
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-sm font-medium text-zinc-700">
                      Admin Email
                    </Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@milanmadusanka.me"
                      disabled
                      className="bg-zinc-100 border-zinc-200 text-zinc-500 cursor-not-allowed rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-sm font-medium text-zinc-700">
                      Key
                    </Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••••••"
                      disabled
                      className="bg-zinc-100 border-zinc-200 text-zinc-500 cursor-not-allowed rounded-xl h-11"
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-2 pb-6 px-6">
                  <Button
                    type="button"
                    disabled
                    className="w-full h-11 rounded-xl font-semibold text-sm bg-zinc-300 text-zinc-500 cursor-not-allowed"
                  >
                    Access Dashboard
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
