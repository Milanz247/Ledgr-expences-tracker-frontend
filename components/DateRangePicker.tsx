'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subDays, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { cn } from '@/lib/utils';

export interface DateRange {
  from: string;
  to: string;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const PRESETS = [
  {
    label: 'Today',
    getValue: () => {
      const today = new Date();
      return {
        from: format(today, 'yyyy-MM-dd'),
        to: format(today, 'yyyy-MM-dd'),
      };
    },
  },
  {
    label: 'Last 7 Days',
    getValue: () => {
      const today = new Date();
      const lastWeek = subDays(today, 6);
      return {
        from: format(lastWeek, 'yyyy-MM-dd'),
        to: format(today, 'yyyy-MM-dd'),
      };
    },
  },
  {
    label: 'This Week',
    getValue: () => ({
      from: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      to: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'This Month',
    getValue: () => ({
      from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'Last 30 Days',
    getValue: () => {
      const today = new Date();
      const lastMonth = subDays(today, 29);
      return {
        from: format(lastMonth, 'yyyy-MM-dd'),
        to: format(today, 'yyyy-MM-dd'),
      };
    },
  },
  {
    label: 'This Year',
    getValue: () => ({
      from: format(startOfYear(new Date()), 'yyyy-MM-dd'),
      to: format(endOfYear(new Date()), 'yyyy-MM-dd'),
    }),
  },
];

export default function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('This Month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  // Initialize with "This Month" if no value provided
  useEffect(() => {
    if (!value) {
      const thisMonth = PRESETS.find(p => p.label === 'This Month')?.getValue();
      if (thisMonth) {
        onChange(thisMonth);
      }
    }
  }, []);

  useEffect(() => {
    if (value) {
      setCustomFrom(value.from);
      setCustomTo(value.to);
    }
  }, [value]);

  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    const range = preset.getValue();
    setSelectedPreset(preset.label);
    setIsCustom(false);
    onChange(range);
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      onChange({ from: customFrom, to: customTo });
      setSelectedPreset('Custom');
      setIsCustom(true);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    const thisMonth = PRESETS.find(p => p.label === 'This Month')?.getValue();
    if (thisMonth) {
      onChange(thisMonth);
      setSelectedPreset('This Month');
      setIsCustom(false);
    }
  };

  const formatDateRange = () => {
    if (!value) return 'Select date range';

    try {
      const fromDate = new Date(value.from);
      const toDate = new Date(value.to);

      if (value.from === value.to) {
        return format(fromDate, 'MMM dd, yyyy');
      }

      return `${format(fromDate, 'MMM dd, yyyy')} - ${format(toDate, 'MMM dd, yyyy')}`;
    } catch {
      return 'Select date range';
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full lg:w-auto justify-start text-left font-normal min-h-[44px]"
      >
        <Calendar className="mr-2 h-4 w-4" />
        <span className="flex-1 truncate">{formatDateRange()}</span>
        {isCustom && (
          <X
            className="ml-2 h-4 w-4 opacity-50 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          />
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
            aria-label="Close date picker"
          />

          {/* Dropdown Content */}
          <div className="absolute top-full left-0 right-0 lg:left-0 lg:right-auto mt-2 bg-white rounded-lg border border-slate-200 shadow-lg z-50 w-full lg:w-[400px]">
            <div className="p-4 space-y-3">
              {/* Presets */}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Quick Select</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      variant={selectedPreset === preset.label && !isCustom ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePresetClick(preset)}
                      className="w-full justify-start text-sm"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              <div className="border-t border-slate-200 pt-3">
                <p className="text-xs font-semibold text-slate-600 mb-2">Custom Range</p>
                <div className="space-y-2">
                  <div>
                    <label htmlFor="date-from" className="text-xs text-slate-600 mb-1 block">From</label>
                    <Input
                      id="date-from"
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="date-to" className="text-xs text-slate-600 mb-1 block">To</label>
                    <Input
                      id="date-to"
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button
                    onClick={handleCustomApply}
                    disabled={!customFrom || !customTo}
                    className="w-full"
                    size="sm"
                  >
                    Apply Custom Range
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
