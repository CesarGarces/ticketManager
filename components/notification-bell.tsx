'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/features/notifications/actions';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useTranslation } from '@/i18n/context';

interface Notification {
  id: string;
  type: 'ticket_sold' | 'purchase_confirmed' | 'payment_verified';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  buyer_name?: string;
  event_title?: string;
  amount?: number;
  currency?: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const dropdownRef = useClickOutside(() => setIsOpen(false));

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      const data = await getNotifications(10);
      const unread = await getUnreadNotificationsCount();
      setNotifications(data);
      setUnreadCount(unread);
      setIsLoading(false);
    };

    loadNotifications();
    
    // Reload every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ticket_sold':
        return '🎟️';
      case 'purchase_confirmed':
        return '✅';
      case 'payment_verified':
        return '💳';
      default:
        return '📬';
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const notifTime = new Date(date);
    const diff = now.getTime() - notifTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('notifications.just_now');
    if (minutes < 60) {
      const template = t('notifications.minutes_ago');
      return template.replace('{count}', minutes.toString());
    }
    if (hours < 24) {
      const template = t('notifications.hours_ago');
      return template.replace('{count}', hours.toString());
    }
    if (days < 7) {
      const template = t('notifications.days_ago');
      return template.replace('{count}', days.toString());
    }
    return notifTime.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-sm">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={handleMarkAllAsRead}
              >
                {t('notifications.mark_all_as_read')}
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {t('notifications.loading')}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {t('notifications.no_notifications')}
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="ml-2 text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            {t('notifications.mark_read')}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.amount && (
                        <p className="text-xs font-semibold text-gray-900 mt-2">
                          ${notification.amount.toFixed(2)} {notification.currency}
                        </p>
                      )}
                      <time className="text-xs text-gray-400 mt-2 block">
                        {formatTime(notification.created_at)}
                      </time>
                    </div>
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-gray-400 hover:text-gray-600 ml-2"
                      title={t('notifications.delete')}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
