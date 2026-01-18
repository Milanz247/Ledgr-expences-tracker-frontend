'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Circle, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      console.log('Registration attempt:', { name, email });
      await register(name, email, password, passwordConfirmation);
      console.log('Registration successful');
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      const errorMessage = err.response?.data?.message
        || err.response?.data?.errors
        || err.message
        || 'Registration failed';

      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 p-4">
      <div className="w-full max-w-sm">
        {/* Logo and Brand Section */}
        <div className="flex flex-row items-center justify-center gap-3 mb-10">
          <div className="bg-zinc-900 text-white rounded-2xl p-3 shadow-lg shadow-zinc-900/20">
            <Circle className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Ledgr</h1>
        </div>

        {/* Main Card */}
        <Card className="shadow-[0_8px_30px_-5px_rgba(0,0,0,0.1)] border border-zinc-200/60 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1.5 pb-4 pt-6">
            <CardTitle className="text-2xl font-bold text-center text-zinc-900">
              Create an account
            </CardTitle>
            <CardDescription className="text-center text-zinc-500 text-sm">
              Enter your details to get started
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
                <Label htmlFor="name" className="text-sm font-medium text-zinc-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-zinc-50/50 border-zinc-200 placeholder:text-zinc-400 focus-visible:ring-zinc-400 focus-visible:ring-2 focus-visible:border-transparent rounded-xl h-11 text-base transition-all"
                />
              </div>

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
                  className="bg-zinc-50/50 border-zinc-200 placeholder:text-zinc-400 focus-visible:ring-zinc-400 focus-visible:ring-2 focus-visible:border-transparent rounded-xl h-11 text-base transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-zinc-50/50 border-zinc-200 placeholder:text-zinc-400 focus-visible:ring-zinc-400 focus-visible:ring-2 focus-visible:border-transparent rounded-xl h-11 text-base transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirmation" className="text-sm font-medium text-zinc-700">
                  Confirm Password
                </Label>
                <Input
                  id="passwordConfirmation"
                  type="password"
                  placeholder="••••••••"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-zinc-50/50 border-zinc-200 placeholder:text-zinc-400 focus-visible:ring-zinc-400 focus-visible:ring-2 focus-visible:border-transparent rounded-xl h-11 text-base transition-all"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2 pb-6 px-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl font-semibold text-sm bg-zinc-900 hover:bg-zinc-800 shadow-sm shadow-zinc-900/20 transition-all duration-200 hover:shadow-md hover:shadow-zinc-900/25 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>

              <p className="text-center text-sm text-zinc-500">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-zinc-900 hover:text-zinc-700 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
