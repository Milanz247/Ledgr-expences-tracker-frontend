'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, TrendingUp, AlertTriangle, Calendar, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { format } from 'date-fns';

type NotificationType = 'bill' | 'budget' | 'insight';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  data?: any;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch data and generate notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const [statsRes, budgetsRes] = await Promise.allSettled([
          api.get('/dashboard/stats'),
          api.get(`/budgets?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`)
        ]);

        const newNotifications: Notification[] = [];

        // 1. Process Upcoming Bills
        if (statsRes.status === 'fulfilled' && statsRes.value.data?.upcoming_bills) {
          const bills = statsRes.value.data.upcoming_bills;
          bills.forEach((bill: any) => {
            const daysUntil = bill.days_until_due;
            if (daysUntil <= 3) {
              newNotifications.push({
                id: `bill-${bill.id}`,
                type: 'bill',
                title: 'Upcoming Bill Due',
                message: `${bill.name} is due ${daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`}`,
                date: new Date(),
                read: false,
                priority: daysUntil <= 1 ? 'high' : 'medium',
                data: { amount: bill.amount }
              });
            }
          });
        }

        // 2. Process Budget Alerts
        if (budgetsRes.status === 'fulfilled') {
            // Handle potentially different response structures based on previous experience
            const budgetsData = budgetsRes.value.data;
            const budgetsList = Array.isArray(budgetsData) ? budgetsData : (budgetsData.data || []);
            
            if (Array.isArray(budgetsList)) {
                budgetsList.forEach((budget: any) => {
                    const percentage = (budget.spent / budget.amount) * 100;
                    if (percentage >= 100) {
                      newNotifications.push({
                        id: `budget-over-${budget.id}`,
                        type: 'budget',
                        title: 'Budget Exceeded',
                        message: `You've exceeded your ${budget.category.name} budget.`,
                        date: new Date(),
                        read: false,
                        priority: 'high',
                        data: { spent: budget.spent, limit: budget.amount }
                      });
                    } else if (percentage >= 90) {
                      newNotifications.push({
                        id: `budget-warn-${budget.id}`,
                        type: 'budget',
                        title: 'Budget Warning',
                        message: `You've used ${percentage.toFixed(0)}% of your ${budget.category.name} budget.`,
                        date: new Date(),
                        read: false,
                        priority: 'medium',
                         data: { spent: budget.spent, limit: budget.amount }
                      });
                    }
                });
            }
        }

        // 3. Weekly Insight (Mock)
        newNotifications.push({
          id: 'insight-weekly',
          type: 'insight',
          title: 'Weekly Insight',
          message: 'Your spending on Dining is 15% lower than last week. Great job!',
          date: new Date(),
          read: false,
          priority: 'low',
        });

        // Set state
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'bill': return <Calendar className="h-4 w-4 text-amber-500" />;
      case 'budget': return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      case 'insight': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'bill': return 'bg-amber-50';
      case 'budget': return 'bg-rose-50';
      case 'insight': return 'bg-emerald-50';
      default: return 'bg-zinc-50';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-zinc-100 transition-all duration-200 relative group">
          <Bell className="h-5 w-5 text-zinc-500 group-hover:text-zinc-700 transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 border-zinc-200 shadow-xl rounded-xl" align="end">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <h4 className="font-semibold text-zinc-900">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="h-auto px-2 py-1 text-xs text-zinc-500 hover:text-zinc-900"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
           {loading ? (
             <div className="flex flex-col items-center justify-center h-40 text-zinc-500 gap-2">
                <div className="h-5 w-5 border-2 border-zinc-200 border-t-zinc-500 rounded-full animate-spin"></div>
                <p className="text-xs">Checking updates...</p>
             </div>
           ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-zinc-500 gap-3">
              <div className="h-12 w-12 bg-zinc-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-zinc-300" />
              </div>
              <p className="text-sm">No new notifications</p>
            </div>
           ) : (
             <div className="divide-y divide-zinc-100">
               {notifications.map((notification) => (
                 <div 
                    key={notification.id} 
                    className={cn(
                        "p-4 hover:bg-zinc-50/50 transition-colors cursor-pointer relative group",
                        !notification.read && "bg-blue-50/30"
                    )}
                    onClick={() => markAsRead(notification.id)}
                 >
                   <div className="flex gap-3">
                     <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", getBgColor(notification.type))}>
                       {getIcon(notification.type)}
                     </div>
                     <div className="flex-1 space-y-1">
                       <div className="flex items-start justify-between">
                         <p className={cn("text-sm font-medium", !notification.read ? "text-zinc-900" : "text-zinc-600")}>
                           {notification.title}
                         </p>
                         {!notification.read && (
                           <span className="h-2 w-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                         )}
                       </div>
                       <p className="text-xs text-zinc-500 leading-relaxed">
                         {notification.message}
                       </p>
                       {notification.data && notification.data.amount && (
                           <div className="mt-1.5 inline-flex items-center px-2 py-1 rounded-md bg-white border border-zinc-200 shadow-sm">
                               <span className="text-[10px] font-semibold text-zinc-700 mr-1">Amount:</span>
                               <CurrencyDisplay amount={notification.data.amount} className="text-[10px] font-bold text-zinc-900" />
                           </div>
                       )}
                       {notification.data && notification.data.spent && (
                           <div className="mt-1.5">
                               <div className="flex items-center justify-between text-[10px] mb-1">
                                   <span className="text-zinc-500">
                                       <CurrencyDisplay amount={notification.data.spent} /> used
                                   </span>
                                   <span className="text-zinc-400">
                                        of <CurrencyDisplay amount={notification.data.limit} />
                                   </span>
                               </div>
                               <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                                   <div 
                                    className={cn("h-full rounded-full", notification.type === 'budget' && notification.priority === 'high' ? "bg-rose-500" : "bg-amber-500")} 
                                    style={{ width: `${Math.min(100, (notification.data.spent / notification.data.limit) * 100)}%` }}
                                   />
                               </div>
                           </div>
                       )}
                       <p className="text-[10px] text-zinc-400 mt-2">
                         {format(notification.date, 'MMM d, h:mm a')}
                       </p>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
