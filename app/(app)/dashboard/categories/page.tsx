'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalBody,
  ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit, Check, Tag, Loader2, Search, TrendingUp, TrendingDown, X } from 'lucide-react';
import { CATEGORY_ICONS, PRESET_COLORS, getIconComponent } from '@/lib/categoryIcons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  user_id: number | null;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Confirm Modal
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    icon: 'Tag',
    color: '#3b82f6',
    type: 'expense' as 'income' | 'expense',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const categoriesData = response.data?.data || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created successfully');
      }

      await fetchCategories();
      handleCloseDialog();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save category';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    if (!category.user_id) {
      toast.error('Cannot edit default categories');
      return;
    }

    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    if (!category.user_id) {
      toast.error('Cannot delete default categories');
      return;
    }
    setDeleteId(category.id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/categories/${deleteId}`);
      toast.success('Category deleted successfully');
      await fetchCategories();
      setDeleteModalOpen(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete category';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      icon: 'Tag',
      color: '#3b82f6',
      type: 'expense',
    });
    setError('');
  };

  // Filter categories based on tab and search
  const filteredCategories = categories.filter((cat) => {
    const matchesTab = activeTab === 'all' || cat.type === activeTab;
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const expenseCount = categories.filter((c) => c.type === 'expense').length;
  const incomeCount = categories.filter((c) => c.type === 'income').length;

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
          <h1 className="text-2xl font-bold text-zinc-900">Categories</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Organize your transactions</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Add Category</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Card className="border-rose-200/60 bg-gradient-to-br from-rose-50/80 to-rose-100/40">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs font-medium text-rose-600">Expense Categories</p>
                <p className="text-xl sm:text-2xl font-bold text-rose-700 mt-1">{expenseCount}</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-emerald-100/40">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs font-medium text-emerald-600">Income Categories</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">{incomeCount}</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-zinc-50/50 rounded-xl border border-zinc-200/60">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full sm:w-auto">
          <TabsList className="w-full sm:w-auto h-9 bg-zinc-100/80">
            <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
            <TabsTrigger value="expense" className="text-xs px-3">Expense</TabsTrigger>
            <TabsTrigger value="income" className="text-xs px-3">Income</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-white border-zinc-200/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-zinc-400 hover:text-zinc-600" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Table */}
      {filteredCategories.length === 0 ? (
        <Card className="border-zinc-200/60 bg-white/80">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
              <Tag className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="text-lg font-semibold text-zinc-900 mb-1">
              {searchQuery ? 'No categories found' : 'No categories yet'}
            </p>
            <p className="text-zinc-500 mb-6 text-center">
              {searchQuery ? 'Try adjusting your search' : 'Create your first category'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setDialogOpen(true)} className="bg-zinc-900 hover:bg-zinc-800">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-2">
            {filteredCategories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              return (
                <Card
                  key={category.id}
                  className="border-zinc-200/60 bg-white/80 hover:bg-zinc-50/50 transition-colors"
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: category.color }}
                      >
                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-zinc-900 truncate text-sm sm:text-base">{category.name}</p>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-[10px] sm:text-xs shrink-0 px-1.5 py-0 sm:px-2.5 sm:py-0.5',
                              category.type === 'expense'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            )}
                          >
                            {category.type}
                          </Badge>
                        </div>
                        <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">
                          {category.user_id ? 'Custom' : 'Default'}
                        </p>
                      </div>
                      {category.user_id && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(category)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-400" />
                          </Button>
                        </div>
                      )}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Icon</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Color</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Source</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60">
                  {filteredCategories.map((category) => {
                    const IconComponent = getIconComponent(category.icon);
                    return (
                      <tr key={category.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-9 w-9 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: category.color }}
                            >
                              <IconComponent className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-zinc-900">{category.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs',
                              category.type === 'expense'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            )}
                          >
                            {category.type === 'expense' ? (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            )}
                            {category.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-zinc-500 font-mono">{category.icon}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-5 w-5 rounded-md border border-zinc-200"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-sm text-zinc-500 font-mono">{category.color}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">
                            {category.user_id ? 'Custom' : 'Default'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {category.user_id ? (
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(category)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4 text-zinc-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(category)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-rose-400" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Add/Edit Modal */}
      <ResponsiveModal open={dialogOpen} onOpenChange={(open) => {
        if (!open) handleCloseDialog();
        setDialogOpen(open);
      }}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>{editingCategory ? 'Edit' : 'Add'} Category</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              {editingCategory ? 'Update category details' : 'Create a new category for your transactions'}
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <ResponsiveModalBody className="space-y-4">
              {error && (
                <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm border border-rose-200/60">
                  {error}
                </div>
              )}

              {/* Category Name */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">Category Name</Label>
                <Input
                  placeholder="e.g., Groceries"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={submitting}
                  autoFocus
                  className="h-11 bg-zinc-50/50 border-zinc-200/60"
                />
              </div>

              {/* Type Selection */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={formData.type === 'expense' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    disabled={submitting}
                    className={cn(
                      'h-11',
                      formData.type === 'expense' && 'bg-rose-600 hover:bg-rose-700'
                    )}
                  >
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Expense
                  </Button>
                  <Button
                    type="button"
                    variant={formData.type === 'income' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    disabled={submitting}
                    className={cn(
                      'h-11',
                      formData.type === 'income' && 'bg-emerald-600 hover:bg-emerald-700'
                    )}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Income
                  </Button>
                </div>
              </div>

              {/* Icon Preview & Color */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">Preview</Label>
                <div className="flex items-center gap-3 p-3 border border-zinc-200/60 rounded-xl bg-zinc-50/50">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: formData.color }}
                  >
                    {/* Dynamic Icon Component */}
                    {(() => {
                      const IconComponent = getIconComponent(formData.icon);
                      return <IconComponent className="h-6 w-6 text-white" />;
                    })()}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">{formData.name || 'Category Name'}</p>
                    <p className="text-xs text-zinc-500 capitalize">{formData.type} category</p>
                  </div>
                </div>
              </div>

              {/* Icon Picker */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">Icon</Label>
                <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto p-2 border border-zinc-200/60 rounded-xl bg-white">
                  {CATEGORY_ICONS.map((icon) => {
                    const Icon = getIconComponent(icon.name);
                    const isSelected = formData.icon === icon.name;
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: icon.name })}
                        disabled={submitting}
                        className={cn(
                          'relative p-2 rounded-lg flex items-center justify-center transition-all',
                          isSelected
                            ? 'bg-zinc-900 text-white'
                            : 'bg-zinc-100/50 hover:bg-zinc-200/80 text-zinc-600'
                        )}
                        title={icon.label}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Picker */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700">Color</Label>
                <div className="grid grid-cols-8 gap-1.5">
                  {PRESET_COLORS.map((color) => {
                    const isSelected = formData.color === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        disabled={submitting}
                        className={cn(
                          'relative h-8 rounded-lg transition-all',
                          isSelected ? 'ring-2 ring-offset-2 ring-zinc-900' : 'hover:scale-110'
                        )}
                        style={{ backgroundColor: color }}
                      >
                        {isSelected && (
                          <Check className="h-4 w-4 text-white absolute inset-0 m-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    disabled={submitting}
                    className="w-14 h-9 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    disabled={submitting}
                    placeholder="#3b82f6"
                    className="flex-1 h-9 font-mono text-sm bg-zinc-50/50 border-zinc-200/60"
                  />
                </div>
              </div>
            </ResponsiveModalBody>

            <ResponsiveModalFooter className="flex flex-col sm:flex-row gap-3 border-t border-zinc-200/60 bg-zinc-50/50 p-4 sm:p-6 w-full shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={submitting}
                className="h-11 w-full sm:flex-1 text-base rounded-xl border-zinc-200/60 hover:bg-zinc-100 hover:text-zinc-900 order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="h-11 w-full sm:flex-1 bg-zinc-900 hover:bg-zinc-800 text-white text-base rounded-xl shadow-lg shadow-zinc-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] order-1 sm:order-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </>
                )}
              </Button>
            </ResponsiveModalFooter>
          </form>
        </ResponsiveModalContent>
      </ResponsiveModal>
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Category?"
        description="Are you sure you want to delete this category? This might affect existing transactions."
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
