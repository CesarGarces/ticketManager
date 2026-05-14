'use server';

import { createServerSupabaseClient } from '@/services/supabase/client';
import { revalidatePath } from 'next/cache';

export interface CreateNotificationData {
  user_id: string;
  type: 'ticket_sold' | 'purchase_confirmed' | 'payment_verified';
  title: string;
  message: string;
  related_event_id?: string;
  related_purchase_id?: string;
  related_order_id?: string;
  buyer_email?: string;
  buyer_name?: string;
  event_title?: string;
  ticket_type_name?: string;
  quantity?: number;
  amount?: number;
  currency?: string;
}

/**
 * Create a notification (internal use - called from webhook)
 */
export async function createNotification(data: CreateNotificationData) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      related_event_id: data.related_event_id,
      related_purchase_id: data.related_purchase_id,
      related_order_id: data.related_order_id,
      buyer_email: data.buyer_email,
      buyer_name: data.buyer_name,
      event_title: data.event_title,
      ticket_type_name: data.ticket_type_name,
      quantity: data.quantity,
      amount: data.amount,
      currency: data.currency,
    });

  if (error) {
    console.error('Error creating notification:', error);
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Get unread notifications count for current user
 */
export async function getUnreadNotificationsCount() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get all notifications for current user
 */
export async function getNotifications(limit = 10) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error getting notifications:', error);
    return [];
  }

  return data || [];
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error);
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}
