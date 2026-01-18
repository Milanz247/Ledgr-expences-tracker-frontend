'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalBody,
  ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerBody, DrawerFooter } from '@/components/ui/drawer';
import {
  Plus,
  TrendingUp,
  Trash2,
  Calendar,
  Landmark,
  Wallet,
  Edit,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import { getIconComponent } from '@/lib/categoryIcons';
import { format } from 'date-fns';
import { toast } from 'sonner';
import PaymentSourceBadge from '@/components/PaymentSourceBadge';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

interface Income {
  id: number;
  amount: number;
  description: string;
  date: string;
  category: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
  bank_account?: {
    id: number;
    bank_name: string;
  };
  fund_source?: {
    id: number;
    source_name: string;
  };
}

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: string;
}

interface BankAccount {
  id: number;
  bank_name: string;
  balance: number;
}

interface FundSource {
  id: number;
  source_name: string;
  amount: number;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function IncomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Data states
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [fundSources, setFundSources] = useState<FundSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  // Modal states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [destinationType, setDestinationType] = useState<'bank' | 'fund'>('bank');

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category_id') || '');
  const [selectedSourceType, setSelectedSourceType] = useState(searchParams.get('source_type') || '');
  const [startDate, setStartDate] = useState(searchParams.get('start_date') || '');
  const [endDate, setEndDate] = useState(searchParams.get('end_date') || '');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Pagination states
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });

  // Form states
  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    bank_account_id: '',
    fund_source_id: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check if any filter is active
  const hasActiveFilters = searchQuery || selectedCategory || selectedSourceType || startDate || endDate;

  // Update URL with filter params
  const updateUrlParams = useCallback((params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Fetch incomes with filters from URL
  const fetchIncomes = useCallback(async () => {
    setTableLoading(true);
    try {
      const params = new URLSearchParams();
      const page = searchParams.get('page') || '1';
      params.set('page', page);
      params.set('per_page', '15');

      const search = searchParams.get('search');
      const category = searchParams.get('category_id');
      const source = searchParams.get('source_type');
      const start = searchParams.get('start_date');
      const end = searchParams.get('end_date');

      if (search) params.set('search', search);
      if (category) params.set('category_id', category);
      if (source) params.set('source_type', source);
      if (start) params.set('start_date', start);
      if (end) params.set('end_date', end);

      const response = await api.get(`/incomes?${params.toString()}`);

      if (response.data.data) {
        setIncomes(response.data.data);
        setPagination({
          current_page: response.data.current_page || response.data.meta?.current_page || 1,
          last_page: response.data.last_page || response.data.meta?.last_page || 1,
          per_page: response.data.per_page || response.data.meta?.per_page || 15,
          total: response.data.total || response.data.meta?.total || 0,
          from: response.data.from || response.data.meta?.from || 0,
          to: response.data.to || response.data.meta?.to || 0,
        });
      } else {
        setIncomes(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch incomes:', error);
      toast.error('Failed to load incomes');
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  }, [searchParams]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, accountsRes, fundRes] = await Promise.all([
          api.get('/categories'),
          api.get('/bank-accounts'),
          api.get('/fund-sources'),
        ]);

        const categoriesData = categoriesRes.data?.data || categoriesRes.data || [];
        const accountsData = accountsRes.data?.data || accountsRes.data || [];
        const fundSourcesData = fundRes.data?.data || fundRes.data || [];

        setCategories(Array.isArray(categoriesData) ? categoriesData.filter((c: Category) => c.type === 'income') : []);
        setBankAccounts(Array.isArray(accountsData) ? accountsData : []);
        setFundSources(Array.isArray(fundSourcesData) ? fundSourcesData : []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load data');
      }
    };

    fetchInitialData();
  }, []);

  // Fetch incomes when filters change
  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Search if empty (clear) or at least 2 chars
      if (searchQuery.length === 0 || searchQuery.length >= 2) {
        if (searchQuery !== searchParams.get('search')) {
          updateUrlParams({ search: searchQuery, page: '1' });
        }
      }
    }, 800); // 800ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFilterChange = (key: string, value: string) => {
    const actualValue = value === 'all' ? '' : value;
    updateUrlParams({ [key]: actualValue, page: '1' });

    switch (key) {
      case 'category_id':
        setSelectedCategory(actualValue);
        break;
      case 'source_type':
        setSelectedSourceType(actualValue);
        break;
      case 'start_date':
        setStartDate(actualValue);
        break;
      case 'end_date':
        setEndDate(actualValue);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSourceType('');
    setStartDate('');
    setEndDate('');
    router.push(pathname, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page: page.toString() });
  };

  const editingIncome = incomes.find(i => i.id === editingId);
  const userCurrency = { symbol: 'Rs', code: 'LKR' };

  const handleCloseDialog = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditMode(false);
      setEditingId(null);
      setFormData({
        amount: '',
        category_id: '',
        bank_account_id: '',
        fund_source_id: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload: any = {
        amount: Number.parseFloat(formData.amount),
        category_id: Number.parseInt(formData.category_id),
        date: formData.date,
        description: formData.description,
      };

      if (destinationType === 'bank') {
        payload.bank_account_id = Number.parseInt(formData.bank_account_id);
      } else {
        payload.fund_source_id = Number.parseInt(formData.fund_source_id);
      }

      if (editMode && editingId) {
        await api.put(`/incomes/${editingId}`, payload);
        toast.success('Income updated successfully');
      } else {
        await api.post('/incomes', payload);
        toast.success('Income added successfully');
      }

      await fetchIncomes();
      setDialogOpen(false);
      resetForm();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to ${editMode ? 'update' : 'add'} income`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditMode(false);
    setEditingId(null);
    setFormData({
      amount: '',
      category_id: '',
      bank_account_id: '',
      fund_source_id: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setError('');
  };

  const handleEdit = (income: Income) => {
    setEditMode(true);
    setEditingId(income.id);

    if (income.bank_account) {
      setDestinationType('bank');
      setFormData({
        amount: income.amount.toString(),
        category_id: income.category.id.toString(),
        bank_account_id: income.bank_account.id.toString(),
        fund_source_id: '',
        date: income.date,
        description: income.description || '',
      });
    } else if (income.fund_source) {
      setDestinationType('fund');
      setFormData({
        amount: income.amount.toString(),
        category_id: income.category.id.toString(),
        bank_account_id: '',
        fund_source_id: income.fund_source.id.toString(),
        date: income.date,
        description: income.description || '',
      });
    }

    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this income?')) return;

    try {
      await api.delete(`/incomes/${id}`);
      toast.success('Income deleted successfully');
      await fetchIncomes();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete income';
      toast.error(errorMessage);
    }
  };

  const formatCurrency = (amount: number) => {
    return <CurrencyDisplay amount={amount} />;
  };

  const getTotalIncome = () => {
    return incomes.reduce((sum, income) => sum + Number.parseFloat(income.amount.toString()), 0);
  };



  // Pagination Component
  const PaginationControls = () => (
    <div className="flex items-center justify-between px-2 py-3">
      <p className="text-sm text-zinc-500">
        Showing {pagination.from} to {pagination.to} of {pagination.total} incomes
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.current_page - 1)}
          disabled={pagination.current_page === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
          let page;
          if (pagination.last_page <= 5) {
            page = i + 1;
          } else if (pagination.current_page <= 3) {
            page = i + 1;
          } else if (pagination.current_page >= pagination.last_page - 2) {
            page = pagination.last_page - 4 + i;
          } else {
            page = pagination.current_page - 2 + i;
          }

          return (
            <Button
              key={page}
              variant={pagination.current_page === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(page)}
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.current_page + 1)}
          disabled={pagination.current_page === pagination.last_page}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Income</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Track money added to your accounts</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Add Income</span>
        </Button>
      </div>

      {/* Total Income Card */}
      <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-emerald-100/40">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-emerald-600">Total Income</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1">{formatCurrency(getTotalIncome())}</p>
              <p className="text-[10px] sm:text-xs text-emerald-600/80 mt-1">
                {pagination.total} {pagination.total === 1 ? 'transaction' : 'transactions'}
              </p>
            </div>
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Bar Inline */}
      <div className="flex flex-col gap-3">
        {/* Desktop Filter Bar */}
        <div className="hidden lg:flex items-center gap-3 p-3 bg-zinc-50/50 rounded-xl border border-zinc-200/60">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search incomes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white border-zinc-200/60"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory || 'all'} onValueChange={(v) => handleFilterChange('category_id', v)}>
            <SelectTrigger className="w-[160px] h-9 bg-white border-zinc-200/60">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Source Type Filter */}
          <Select value={selectedSourceType || 'all'} onValueChange={(v) => handleFilterChange('source_type', v)}>
            <SelectTrigger className="w-[140px] h-9 bg-white border-zinc-200/60">
              <SelectValue placeholder="Destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Destinations</SelectItem>
              <SelectItem value="bank">Bank Account</SelectItem>
              <SelectItem value="fund">Cash/Wallet</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="h-9 w-[130px] bg-white border-zinc-200/60"
            />
            <span className="text-zinc-400">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="h-9 w-[130px] bg-white border-zinc-200/60"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 px-3 text-zinc-500 hover:text-zinc-900"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}

          {/* Loading indicator */}
          {tableLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          )}
        </div>

        {/* Mobile Filter Bar */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white border-zinc-200/60"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterDrawerOpen(true)}
            className={cn(
              'h-10 px-3 border-zinc-200/60',
              hasActiveFilters && 'border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {hasActiveFilters && <span className="ml-1.5 text-xs">{[selectedCategory, selectedSourceType, startDate].filter(Boolean).length}</span>}
          </Button>
        </div>
      </div>

      {/* Content */}
      {incomes.length === 0 && !hasActiveFilters ? (
        <Card className="border-zinc-200/60 bg-white/80">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="text-lg font-semibold text-zinc-900 mb-1">No income yet</p>
            <p className="text-zinc-500 mb-6 text-center">Add your first income to start tracking</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
          </CardContent>
        </Card>
      ) : incomes.length === 0 && hasActiveFilters ? (
        <Card className="border-zinc-200/60 bg-white/80">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="text-lg font-semibold text-zinc-900 mb-1">No results found</p>
            <p className="text-zinc-500 mb-6 text-center">
              {searchQuery ? `No results for "${searchQuery}"` : 'Try adjusting your filters'}
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile List View */}
          <div className="lg:hidden space-y-2">
            {incomes.map((income) => {
              const IconComponent = getIconComponent(income.category.icon);
              return (
                <Card
                  key={income.id}
                  className="border-zinc-200/60 bg-white/80 hover:bg-zinc-50/50 transition-colors"
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: income.category.color }}
                      >
                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-zinc-900 truncate text-sm sm:text-base">{income.category.name}</p>
                          <span className="font-bold text-emerald-600 shrink-0 text-sm sm:text-base">
                            + {formatCurrency(Number.parseFloat(income.amount.toString()))}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] sm:text-xs text-zinc-500 truncate">{income.description || 'No description'}</p>
                          <span className="text-zinc-300 transform scale-75">•</span>
                          <p className="text-[10px] sm:text-xs text-zinc-500 shrink-0">{format(new Date(income.date), 'MMM dd')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(income)} className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(income.id)} className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-400" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <Card className="hidden lg:block border-zinc-200/60 bg-white/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200/60 bg-zinc-50/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Destination</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60">
                  {tableLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-zinc-400 mx-auto" />
                      </td>
                    </tr>
                  ) : (
                    incomes.map((income) => {
                      const IconComponent = getIconComponent(income.category.icon);
                      return (
                        <tr key={income.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-zinc-600">
                            {format(new Date(income.date), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-8 w-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: income.category.color }}
                              >
                                <IconComponent className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-sm font-medium text-zinc-900">{income.category.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-500 max-w-[200px] truncate">
                            {income.description || '-'}
                          </td>
                          <td className="px-4 py-3">
                            {income.bank_account && (
                              <PaymentSourceBadge type="bank" name={income.bank_account.bank_name} variant="sm" />
                            )}
                            {income.fund_source && (
                              <PaymentSourceBadge type="fund" name={income.fund_source.source_name} variant="sm" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-emerald-600 text-right">
                            + {formatCurrency(Number.parseFloat(income.amount.toString()))}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(income)} className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4 text-zinc-400" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(income.id)} className="h-8 w-8 p-0">
                                <Trash2 className="h-4 w-4 text-rose-400" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total > pagination.per_page && <PaginationControls />}
          </Card>

          {/* Mobile Pagination */}
          {pagination.total > pagination.per_page && (
            <div className="lg:hidden">
              <PaginationControls />
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <ResponsiveModal open={dialogOpen} onOpenChange={handleCloseDialog}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>{editingIncome ? 'Edit Income' : 'Add New Income'}</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              {editingIncome ? 'Make changes to your income here.' : 'Add a new income source to track your earnings.'}
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <ResponsiveModalBody className="space-y-4">
              {error && (
                <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm border border-rose-200/60">
                  {error}
                </div>
              )}

              {/* Amount Input */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">
                    {userCurrency?.symbol}
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    disabled={submitting}
                    className="pl-8 h-11 bg-zinc-50/50 border-zinc-200/60 text-lg font-medium"
                  />
                </div>
              </div>

              {/* Destination Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-zinc-700">Destination</Label>
                
                {/* Type Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setDestinationType('bank');
                      setFormData({ ...formData, fund_source_id: '' });
                    }}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                      destinationType === 'bank'
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-700"
                    )}
                  >
                    <Landmark className="h-4 w-4" />
                    Bank Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDestinationType('fund');
                      setFormData({ ...formData, bank_account_id: '' });
                    }}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                      destinationType === 'fund'
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-700"
                    )}
                  >
                    <Wallet className="h-4 w-4" />
                    Cash / Wallet
                  </button>
                </div>

                {/* Specific Account Select */}
                {destinationType === 'bank' ? (
                  <Select
                    value={formData.bank_account_id}
                    onValueChange={(v) => setFormData({ ...formData, bank_account_id: v })}
                    disabled={submitting}
                  >
                    <SelectTrigger className="h-11 bg-zinc-50/50 border-zinc-200/60">
                      <SelectValue placeholder="Select Bank Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{account.bank_name}</span>
                            <span className="text-xs text-zinc-500">
                              {/* Assuming formatCurrency is available in scope or just raw value */}
                              On Hand: {userCurrency.symbol} {account.balance.toLocaleString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={formData.fund_source_id}
                    onValueChange={(v) => setFormData({ ...formData, fund_source_id: v })}
                    disabled={submitting}
                  >
                    <SelectTrigger className="h-11 bg-zinc-50/50 border-zinc-200/60">
                      <SelectValue placeholder="Select Fund Source" />
                    </SelectTrigger>
                    <SelectContent>
                      {fundSources.map((source) => (
                        <SelectItem key={source.id} value={source.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{source.source_name}</span>
                            <span className="text-xs text-zinc-500">
                                On Hand: {userCurrency.symbol} {source.amount.toLocaleString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Category Selection */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                  disabled={submitting}
                >
                  <SelectTrigger className="h-11 bg-zinc-50/50 border-zinc-200/60">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c.type === 'income')
                      .map((category) => {
                        const IconComponent = getIconComponent(category.icon);
                        return (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0"
                                style={{ backgroundColor: category.color }}
                              >
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  disabled={submitting}
                  className="h-11 bg-zinc-50/50 border-zinc-200/60"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">Description (Optional)</Label>
                <Textarea
                  placeholder="Where did this income come from?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={submitting}
                  className="min-h-[80px] bg-zinc-50/50 border-zinc-200/60 resize-none"
                />
              </div>
            </ResponsiveModalBody>

            <ResponsiveModalFooter className="flex flex-col sm:flex-row gap-3 border-t border-zinc-200/60 bg-zinc-50/50 p-4 sm:p-6 w-full shrink-0">
              <Button type="button" variant="outline" onClick={() => handleCloseDialog(false)} className="h-11 w-full sm:flex-1 text-base rounded-xl border-zinc-200/60 hover:bg-zinc-100 hover:text-zinc-900 order-2 sm:order-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting} 
                className="h-11 w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-base rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] order-1 sm:order-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    {editingIncome ? 'Update Income' : 'Save Income'}
                  </>
                )}
              </Button>
            </ResponsiveModalFooter>
          </form>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Mobile Filter Drawer */}
      <Drawer open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filter Income</DrawerTitle>
          </DrawerHeader>
          <DrawerBody className="space-y-4 pb-8">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-zinc-700">Category</Label>
              <Select value={selectedCategory || 'all'} onValueChange={(v) => handleFilterChange('category_id', v)}>
                <SelectTrigger className="h-11 bg-zinc-50/50 border-zinc-200/60">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-zinc-700">Destination</Label>
              <Select value={selectedSourceType || 'all'} onValueChange={(v) => handleFilterChange('source_type', v)}>
                <SelectTrigger className="h-11 bg-zinc-50/50 border-zinc-200/60">
                  <SelectValue placeholder="All Destinations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Destinations</SelectItem>
                  <SelectItem value="bank">Bank Account</SelectItem>
                  <SelectItem value="fund">Cash/Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-zinc-700">Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="h-11 bg-zinc-50/50 border-zinc-200/60"
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="h-11 bg-zinc-50/50 border-zinc-200/60"
                  placeholder="To"
                />
              </div>
            </div>
          </DrawerBody>
          <DrawerFooter>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="w-full h-12">
                Clear All Filters
              </Button>
            )}
            <Button onClick={() => setFilterDrawerOpen(false)} className="w-full h-12 bg-emerald-600">
              Apply Filters
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
