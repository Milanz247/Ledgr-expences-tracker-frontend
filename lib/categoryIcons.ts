import * as LucideIcons from 'lucide-react';

// Curated list of common icons for categories (20-30 icons)
export const CATEGORY_ICONS = [
  { name: 'Utensils', label: 'Food' },
  { name: 'ShoppingCart', label: 'Shopping' },
  { name: 'ShoppingBag', label: 'Shopping Bag' },
  { name: 'Car', label: 'Transport' },
  { name: 'Home', label: 'Home' },
  { name: 'Heart', label: 'Health' },
  { name: 'Zap', label: 'Utilities' },
  { name: 'Coffee', label: 'Coffee' },
  { name: 'Tv', label: 'Entertainment' },
  { name: 'Smartphone', label: 'Phone' },
  { name: 'Laptop', label: 'Tech' },
  { name: 'Briefcase', label: 'Work' },
  { name: 'GraduationCap', label: 'Education' },
  { name: 'Plane', label: 'Travel' },
  { name: 'Gift', label: 'Gift' },
  { name: 'Music', label: 'Music' },
  { name: 'Dumbbell', label: 'Fitness' },
  { name: 'Pizza', label: 'Pizza' },
  { name: 'Wine', label: 'Drinks' },
  { name: 'TrendingUp', label: 'Investment' },
  { name: 'CreditCard', label: 'Card' },
  { name: 'Wallet', label: 'Wallet' },
  { name: 'Receipt', label: 'Receipt' },
  { name: 'Tag', label: 'Tag' },
  { name: 'Star', label: 'Star' },
  { name: 'DollarSign', label: 'Money' },
  { name: 'Shirt', label: 'Clothing' },
  { name: 'Gamepad', label: 'Gaming' },
  { name: 'Book', label: 'Books' },
  { name: 'Camera', label: 'Photos' },
];

// Preset colors for category selection
export const PRESET_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#64748b', // Slate
];

export const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Tag;
  return Icon;
};
