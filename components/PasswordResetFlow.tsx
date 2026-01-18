'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, Lock, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import api from '@/lib/api';

type Step = 'email' | 'otp' | 'password';

export default function PasswordResetFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/forgot-password', { email });
      
      if (response.data.success) {
        toast.success('Check your inbox!', {
          description: 'We sent a 6-digit code to your email'
        });
        setStep('otp');
        setCountdown(60); // Start 60-second countdown
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error('Error', { description: message });
      
      if (error.response?.status === 429) {
        setCountdown(error.response.data.retry_after || 60);
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const response = await api.post('/resend-otp', { email });
      
      if (response.data.success) {
        toast.success('OTP Resent', {
          description: 'Check your inbox for the new code'
        });
        setCountdown(60);
        setOtp(''); // Clear previous OTP
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      toast.error('Error', { description: message });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP (auto-submit when 6 digits entered)
  useEffect(() => {
    if (otp.length === 6 && step === 'otp') {
      handleVerifyOTP();
    }
  }, [otp]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    
    setLoading(true);
    try {
      // Just verify OTP is valid, don't reset password yet
      const response = await api.post('/reset-password', {
        email,
        otp,
        password: 'temporary', // Temporary password for validation
        password_confirmation: 'temporary'
      });

      // If we get here without error, OTP is valid
      setStep('password');
      toast.success('Code verified!', {
        description: 'Now set your new password'
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid OTP';
      const remaining = error.response?.data?.attempts_remaining;
      
      if (remaining !== undefined) {
        setAttemptsRemaining(remaining);
        toast.error('Invalid Code', {
          description: `${message} (${remaining} attempts remaining)`
        });
      } else {
        toast.error('Error', { description: message });
      }
      
      setOtp(''); // Clear OTP on error
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/reset-password', {
        email,
        otp,
        password,
        password_confirmation: confirmPassword
      });

      if (response.data.success) {
        toast.success('Password reset successful!', {
          description: 'You can now login with your new password',
          icon: <CheckCircle2 className="h-5 w-5" />
        });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error('Error', { description: message });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-zinc-200 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            {step === 'email' && 'Enter your email to receive a verification code'}
            {step === 'otp' && 'Enter the 6-digit code sent to your email'}
            {step === 'password' && 'Create a new password for your account'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {/* Step 1: Email Input */}
            {step === 'email' && (
              <motion.form
                key="email"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleSendOTP}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-black hover:bg-zinc-800"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push('/login')}
                >
                  Back to Login
                </Button>
              </motion.form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-zinc-600 mb-4">
                      Code sent to <span className="font-semibold text-black">{email}</span>
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      disabled={loading}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="h-14 w-12 text-xl" />
                        <InputOTPSlot index={1} className="h-14 w-12 text-xl" />
                        <InputOTPSlot index={2} className="h-14 w-12 text-xl" />
                        <InputOTPSlot index={3} className="h-14 w-12 text-xl" />
                        <InputOTPSlot index={4} className="h-14 w-12 text-xl" />
                        <InputOTPSlot index={5} className="h-14 w-12 text-xl" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {loading && (
                    <div className="flex items-center justify-center text-sm text-zinc-600">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying code...
                    </div>
                  )}

                  <div className="text-center space-y-2">
                    <p className="text-sm text-zinc-600">
                      Attempts remaining: <span className="font-semibold text-black">{attemptsRemaining}</span>
                    </p>
                    <p className="text-xs text-zinc-500">Code expires in 10 minutes</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || loading}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Change Email
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: New Password */}
            {step === 'password' && (
              <motion.form
                key="password"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleResetPassword}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12"
                      required
                      minLength={8}
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-zinc-500">Must be at least 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-12"
                      required
                      minLength={8}
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-black hover:bg-zinc-800"
                  disabled={loading || !password || !confirmPassword}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <CheckCircle2 className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
