'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Wallet, Trash2, DollarSign, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface FundSource {
  id: number;
  source_name: string;
  amount: number;
  description: string;
  created_at: string;
}

export default function FundSourcesPage() {
  const [sources, setSources] = useState<FundSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    source_name: '',
    amount: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await api.get('/fund-sources');
      const sourcesData = response.data?.data || response.data || [];
      setSources(Array.isArray(sourcesData) ? sourcesData : []);
    } catch (error) {
      console.error('Failed to fetch fund sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editMode && editingId) {
        await api.put(`/fund-sources/${editingId}`, {
          source_name: formData.source_name,
          amount: parseFloat(formData.amount),
          description: formData.description,
        });
      } else {
        await api.post('/fund-sources', {
          source_name: formData.source_name,
          amount: parseFloat(formData.amount),
          description: formData.description,
        });
      }

      await fetchSources();
      setDialogOpen(false);
      setEditMode(false);
      setEditingId(null);
      setFormData({ source_name: '', amount: '', description: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} fund source`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (source: FundSource) => {
    setEditMode(true);
    setEditingId(source.id);
    setFormData({
      source_name: source.source_name,
      amount: source.amount.toString(),
      description: source.description || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this fund source?')) return;

    try {
      await api.delete(`/fund-sources/${id}`);
      await fetchSources();
    } catch (error: any) {
      console.error('Failed to delete fund source:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete fund source';
      alert(errorMessage);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  const getTotalIncome = () => {
    return sources.reduce((sum, source) => sum + parseFloat(source.amount.toString()), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cash & Wallets</h1>
          <p className="text-slate-600 mt-1">Track your income and funding sources</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Fund Source
        </Button>
      </div>

      {/* Total Income Card */}
      {sources.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Total Income</CardTitle>
            <CardDescription className="text-green-700">
              All recorded cash & wallets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-900">
              {formatCurrency(getTotalIncome())}
            </p>
          </CardContent>
        </Card>
      )}

      {sources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">No cash wallets yet</p>
            <p className="text-slate-600 mb-4">Add your first income source to get started</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fund Source
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <Card key={source.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 rounded-lg p-2">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{source.source_name}</CardTitle>
                      <CardDescription className="text-xs">
                        {format(new Date(source.created_at), 'MMM dd, yyyy')}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(source.amount)}
                    </p>
                  </div>
                  {source.description && (
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Description</p>
                      <p className="text-sm text-slate-900">{source.description}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(source)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(source.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Fund Source Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit' : 'Add'} Fund Source</DialogTitle>
              <DialogDescription>
                {editMode ? 'Update your' : 'Record a new'} income or funding source
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-4 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="source_name">Source Name</Label>
                <Input
                  id="source_name"
                  placeholder="e.g., Monthly Salary, Freelance Project"
                  value={formData.source_name}
                  onChange={(e) =>
                    setFormData({ ...formData, source_name: e.target.value })
                  }
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 75000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., January 2026 Salary"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={submitting}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setEditMode(false);
                  setEditingId(null);
                  setFormData({ source_name: '', amount: '', description: '' });
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update Source' : 'Add Source')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
