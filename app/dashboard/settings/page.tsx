'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft,
  User,
  Lock,
  Mail,
  Camera,
  Send,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

// Zod schemas for validation
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  password: z.string().min(8, 'New password must be at least 8 characters'),
  password_confirmation: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface ReportSettings {
  id: number;
  report_email: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  is_enabled: boolean;
  last_sent_at?: string;
}

// Get API base URL for avatar
const getAvatarUrl = (profilePicture: string | null | undefined) => {
  if (!profilePicture) return undefined;
  if (profilePicture.startsWith('http')) return profilePicture;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
  return `${baseUrl}${profilePicture}`;
};

// Get user initials
const getInitials = (name: string | undefined) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingReportSettings, setSavingReportSettings] = useState(false);
  const [testEmailSending, setTestEmailSending] = useState(false);

  // Avatar preview
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Report settings
  const [reportSettings, setReportSettings] = useState<ReportSettings | null>(null);
  const [reportFormData, setReportFormData] = useState({
    report_email: '',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    is_enabled: false,
  });

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  });

  // Load initial data
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
      });
      setReportFormData(prev => ({
        ...prev,
        report_email: user.email,
      }));
    }
    fetchReportSettings();
  }, [user]);

  const fetchReportSettings = async () => {
    try {
      const response = await api.get('/report-settings');
      setReportSettings(response.data);
      setReportFormData({
        report_email: response.data.report_email,
        frequency: response.data.frequency,
        is_enabled: response.data.is_enabled,
      });
    } catch (error) {
      console.error('Failed to fetch report settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle profile update
  const onProfileSubmit = async (data: ProfileFormData) => {
    setSavingProfile(true);
    try {
      const response = await api.put('/profile/info', data);
      updateUser(response.data.user);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle password update
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setSavingPassword(true);
    try {
      await api.put('/profile/password', data);
      passwordForm.reset();
      toast.success('Password updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update password';
      const errors = error.response?.data?.errors;
      if (errors?.current_password) {
        passwordForm.setError('current_password', { message: errors.current_password[0] });
      }
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      updateUser(response.data.user);
      setAvatarPreview(null);
      toast.success('Avatar uploaded successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to upload avatar';
      toast.error(message);
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle avatar removal
  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    try {
      const response = await api.delete('/profile/avatar');
      updateUser(response.data.user);
      toast.success('Avatar removed successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove avatar';
      toast.error(message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle report settings save
  const handleSaveReportSettings = async () => {
    if (!reportFormData.report_email) {
      toast.error('Please enter an email address');
      return;
    }

    setSavingReportSettings(true);
    try {
      const response = await api.post('/report-settings', reportFormData);
      setReportSettings(response.data.data);
      toast.success('Report settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSavingReportSettings(false);
    }
  };

  // Handle test email
  const handleSendTestEmail = async () => {
    if (!reportFormData.report_email) {
      toast.error('Please enter an email address first');
      return;
    }

    setTestEmailSending(true);
    try {
      await api.post('/report-settings/send-test', {
        report_email: reportFormData.report_email,
      });
      toast.success('Test email sent successfully! Check your inbox.');
    } catch (error) {
      console.error('Failed to send test email:', error);
      toast.error('Failed to send test email. Please try again.');
    } finally {
      setTestEmailSending(false);
    }
  };

  const frequencyLabels = {
    daily: 'Every day at 9:00 PM',
    weekly: 'Every Monday at 9:00 AM',
    monthly: 'On the 1st of each month at 9:00 AM',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email Reports</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          {/* Avatar Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Click on your avatar to upload a new photo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                    className="relative block"
                  >
                    <Avatar className="h-24 w-24 ring-4 ring-slate-100">
                      <AvatarImage
                        src={avatarPreview || getAvatarUrl(user?.profile_picture)}
                        alt={user?.name}
                      />
                      <AvatarFallback className="bg-primary text-white text-2xl font-semibold">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploadingAvatar ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </button>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  {user?.profile_picture && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your name and email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...profileForm.register('name')}
                    placeholder="John Doe"
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-xs text-destructive">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...profileForm.register('email')}
                    placeholder="john@example.com"
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {profileForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Ensure your account is using a long, secure password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input
                    id="current_password"
                    type="password"
                    {...passwordForm.register('current_password')}
                    placeholder="••••••••"
                  />
                  {passwordForm.formState.errors.current_password && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.current_password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...passwordForm.register('password')}
                    placeholder="••••••••"
                  />
                  {passwordForm.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirm New Password</Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    {...passwordForm.register('password_confirmation')}
                    placeholder="••••••••"
                  />
                  {passwordForm.formState.errors.password_confirmation && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.password_confirmation.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={savingPassword}>
                  {savingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Reports Tab */}
        <TabsContent value="reports" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle>Email Report Configuration</CardTitle>
                  <CardDescription>
                    Set up automated reports to be sent directly to your inbox
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label>Report Email Address</Label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={reportFormData.report_email}
                  onChange={(e) =>
                    setReportFormData({ ...reportFormData, report_email: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  The email address where you will receive your spending reports
                </p>
              </div>

              {/* Frequency Select */}
              <div className="space-y-2">
                <Label>Report Frequency</Label>
                <Select
                  value={reportFormData.frequency}
                  onValueChange={(value) =>
                    setReportFormData({
                      ...reportFormData,
                      frequency: value as 'daily' | 'weekly' | 'monthly',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {frequencyLabels[reportFormData.frequency]}
                </p>
              </div>

              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Enable Email Reports</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Turn on to start receiving automated reports
                  </p>
                </div>
                <Switch
                  checked={reportFormData.is_enabled}
                  onCheckedChange={(checked) =>
                    setReportFormData({ ...reportFormData, is_enabled: checked })
                  }
                />
              </div>

              {/* Last Sent Info */}
              {reportSettings?.last_sent_at && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Last report sent:{' '}
                    {new Date(reportSettings.last_sent_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveReportSettings}
                  disabled={savingReportSettings}
                  className="flex-1"
                >
                  {savingReportSettings ? 'Saving...' : 'Save Settings'}
                </Button>
                <Button
                  onClick={handleSendTestEmail}
                  disabled={testEmailSending}
                  variant="outline"
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {testEmailSending ? 'Sending...' : 'Send Test Email'}
                </Button>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  📧 <strong>Test Email:</strong> Click "Send Test Email" to see how your report
                  will look. This helps you verify the email is configured correctly.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's Included in Your Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-sm">💰</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Spending Summary</p>
                    <p className="text-xs text-muted-foreground">
                      Total expenses and net savings
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <span className="text-sm">📊</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Category Breakdown</p>
                    <p className="text-xs text-muted-foreground">
                      How much you spent per category
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <span className="text-sm">🏆</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Top Expenses</p>
                    <p className="text-xs text-muted-foreground">
                      Your 3 highest spending items
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                      <span className="text-sm">🏦</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Account Status</p>
                    <p className="text-xs text-muted-foreground">
                      Bank & fund source balances
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
