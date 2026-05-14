# 📬 Notification System Implementation

## What Was Built

A real-time notification system for the ticket management platform with:

- **Seller Notifications**: Organizers receive "Ticket Sold" alerts when someone buys a ticket
- **Buyer Notifications**: Buyers receive "Purchase Confirmed" alerts after successful payment
- **Real-time UI**: NotificationBell component in header showing unread count and notification details
- **Database**: Notifications table with RLS policies and performance indexes

---

## 🚀 Deployment Steps

### 1. Apply Database Migration

The notification system requires a new table in Supabase. Run this SQL in Supabase SQL Editor:

```sql
-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ticket_sold', 'purchase_confirmed', 'payment_verified')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  related_purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  buyer_email TEXT,
  buyer_name TEXT,
  event_title TEXT,
  ticket_type_name TEXT,
  quantity INTEGER,
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications Updated At Trigger
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_updated_at_trigger
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_notifications_updated_at();
```

### 2. Check Current Implementation

The following files are already created and integrated:

#### Server Actions
- File: [features/notifications/actions.ts](../features/notifications/actions.ts)
- Functions:
  - `createNotification()` - Create notification (called from webhook)
  - `getNotifications()` - Fetch user's notifications
  - `getUnreadNotificationsCount()` - Get unread count
  - `markNotificationAsRead()` - Mark single notification as read
  - `markAllNotificationsAsRead()` - Mark all as read
  - `deleteNotification()` - Remove notification

#### UI Components
- File: [components/notification-bell.tsx](../components/notification-bell.tsx)
  - Real-time bell icon with unread badge
  - Dropdown showing recent notifications (10 max)
  - Click to mark as read
  - Delete individual notifications
  - Auto-refresh every 30 seconds

- File: [components/notification-bell-wrapper.tsx](../components/notification-bell-wrapper.tsx)
  - Client wrapper for NotificationBell component
  - Integrated in nav-header

#### Integration Points
- File: [components/nav-header.tsx](../components/nav-header.tsx)
  - NotificationBell shown only for authenticated users
  - Positioned between LanguageSwitcher and UserNav

- File: [app/api/webhooks/mercadopago/route.ts](../app/api/webhooks/mercadopago/route.ts)
  - Creates notifications when payment is approved
  - Seller gets: `ticket_sold` with buyer info + event + amount
  - Buyer gets: `purchase_confirmed` with event + ticket type + amount

---

## 📊 Notification Types

### 1. `ticket_sold`
**Recipient:** Event Organizer (Seller)
```
Title: 🎟️ Ticket Sold!
Message: "{quantity} ticket(s) for {event_title} sold to {buyer_name}"
Includes: buyer_email, buyer_name, event_title, ticket_type_name, quantity, amount
```

### 2. `purchase_confirmed`
**Recipient:** Buyer
```
Title: ✅ Purchase Confirmed!
Message: "Your purchase of {quantity} ticket(s) for {event_title} is confirmed"
Includes: event_title, ticket_type_name, quantity, amount
```

### 3. `payment_verified` (Future)
Reserved for additional payment verification alerts.

---

## 🔄 How It Works

### Payment Flow with Notifications

1. **Buyer initiates purchase**
   - Clicks "Buy Ticket" → MercadoPago Checkout Pro

2. **Payment confirmed**
   - MercadoPago sends IPN webhook notification

3. **Webhook processes payment**
   - File: [app/api/webhooks/mercadopago/route.ts](../app/api/webhooks/mercadopago/route.ts)
   - Updates `purchases.payment_status` to "approved"
   - Fetches full purchase details (buyer, event, ticket type)
   - Creates two notifications:
     - **For Seller:** Type `ticket_sold`
     - **For Buyer:** Type `purchase_confirmed`

4. **Users see notifications**
   - Bell icon shows unread count
   - Click bell → dropdown with latest 10 notifications
   - Click "Mark read" → notification no longer unread
   - Notifications persist for review

### Database Schema

**notifications table:**
- `id` - UUID primary key
- `user_id` - Recipient (references profiles)
- `type` - One of: 'ticket_sold', 'purchase_confirmed', 'payment_verified'
- `title` - Short notification title (32 chars typical)
- `message` - Full notification text
- `is_read` - Boolean tracking read status
- `related_event_id`, `related_purchase_id`, `related_order_id` - FK references
- `buyer_email`, `buyer_name` - For seller notifications
- `event_title`, `ticket_type_name` - Denormalized for display
- `quantity`, `amount`, `currency` - Transaction details
- `created_at`, `updated_at` - Timestamps

**RLS Policies:**
- Users can only view their own notifications
- System can insert notifications (no row-level restriction)
- Users can only update their own notifications

**Indexes for performance:**
- `(user_id)` - For fetching user's notifications
- `(is_read)` - For filtering unread
- `(user_id, is_read)` - Combined query optimization
- `(created_at DESC)` - For sorting by recency

---

## 🎯 Key Features

✅ **Real-time Badge** - Unread count shown on bell icon
✅ **Dropdown UI** - See notifications without leaving the page
✅ **Mark as Read** - One-at-a-time or all-at-once
✅ **Auto-refresh** - Checks for new notifications every 30 seconds
✅ **Delete** - Remove old notifications
✅ **Time Formatting** - "just now", "5m ago", "2h ago", "3d ago"
✅ **Emojis** - Visual indicators for notification type
✅ **Performance** - Optimized indexes, limited to 10 recent

---

## 🧪 Testing

### Test Seller Notification (Organizer)

1. Create organizer account
2. Create event with ticket type (e.g., $10 ticket)
3. Create buyer account
4. Go to event page as buyer
5. Click "Buy Ticket" → complete MercadoPago payment (sandbox)
6. Organizer should see:
   - Bell icon with "1" badge
   - Click bell → see "🎟️ Ticket Sold!" notification
   - Shows buyer name, event, price

### Test Buyer Notification

1. Complete payment as buyer (step 5 above)
2. Buyer should see:
   - Bell icon with "1" badge
   - Click bell → see "✅ Purchase Confirmed!" notification
   - Shows event, ticket type, price

### Test Unread Status

1. Don't click any notifications
2. Bell shows "1" (unread count)
3. Click a notification row "Mark read"
4. Notification grays out
5. Bell count decreases

---

## 🚨 Edge Cases Handled

✅ Webhook fails to create notification - webhook still succeeds (logged)
✅ Slow webhook - success page still works (has fallback verification)
✅ User deletes notification - re-creates on next payment (by design)
✅ Network error on refresh - retries in 30 seconds
✅ Multiple purchases same hour - separate notifications per purchase
✅ No real-time sync needed - polling is sufficient for MVP

---

## 📈 Future Enhancements

- Real-time Supabase subscriptions (instead of 30s polling)
- Email notifications for important alerts
- Notification preferences (which types to show)
- Notification history/archive
- Push notifications (mobile)
- Notification templates system
- Seller dashboard notifications widget
- Commission/payout notifications
- Ticket verification check-in notifications

---

## 🔧 Files Modified/Created

### New Files
- `features/notifications/actions.ts` - Server actions for notifications
- `components/notification-bell.tsx` - UI component
- `components/notification-bell-wrapper.tsx` - Client wrapper
- `services/supabase/migrations/03_notifications.sql` - DB migration

### Modified Files
- `services/supabase/schema.sql` - Added notifications table + RLS + indexes
- `components/nav-header.tsx` - Integrated NotificationBell
- `app/api/webhooks/mercadopago/route.ts` - Create notifications on payment approval

### Database
- 1 new table: `notifications`
- 4 new indexes
- 3 RLS policies
- 1 trigger function

---

## 📋 Checklist for Production

- [ ] Apply SQL migration to Supabase
- [ ] Test organizer receives "Ticket Sold" notification
- [ ] Test buyer receives "Purchase Confirmed" notification
- [ ] Verify notification bell appears only when logged in
- [ ] Check unread count updates correctly
- [ ] Test marking individual notification as read
- [ ] Test marking all notifications as read
- [ ] Test deleting notification
- [ ] Verify RLS policies prevent viewing other user's notifications
- [ ] Test on mobile (responsive UI)
- [ ] Verify timestamps are correct timezone
- [ ] Check indexes are created in Supabase

---

## 📞 Troubleshooting

**Bell doesn't appear in header:**
- Check user is authenticated: `getProfile()` returns value
- Check `NotificationBellWrapper` is imported
- Check browser console for errors

**No notifications appearing:**
- Verify SQL migration was applied
- Check webhook is being called: Look at Vercel logs
- Check webhook is creating notifications: Verify in Supabase SQL Editor
- Run: `SELECT * FROM notifications LIMIT 5;`

**Unread count wrong:**
- Force refresh page
- Check no other browser tabs
- Verify RLS policy allows user to see their notifications

**Notifications too slow to load:**
- Currently 30s polling is by design
- For real-time, implement Supabase real-time subscriptions

---

## 💡 Notes

- All payments go to platform account (single MercadoPago account)
- Webhook is idempotent (safe to call multiple times)
- Notifications are permanent (not auto-archived)
- No email notifications yet (future enhancement)
- No notification preferences (all users get all notifications)
