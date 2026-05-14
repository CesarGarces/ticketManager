# 🚀 Notification System - Deployment Checklist

## ✅ What's Been Completed

### Code Implementation
- [x] Server actions for notification management (`features/notifications/actions.ts`)
- [x] NotificationBell UI component with dropdown (`components/notification-bell.tsx`)
- [x] Client wrapper for header integration (`components/notification-bell-wrapper.tsx`)
- [x] Header integration showing bell only when logged in (`components/nav-header.tsx`)
- [x] MercadoPago webhook integration for creating notifications (`app/api/webhooks/mercadopago/route.ts`)
- [x] Database schema with RLS policies (`services/supabase/schema.sql`)
- [x] Database migration file (`services/supabase/migrations/03_notifications.sql`)
- [x] Comprehensive documentation (`NOTIFICATIONS.md`)
- [x] Build verification - ✅ **Compiles successfully**

---

## 🎯 Next Steps - Apply to Supabase

### Step 1: Create the notifications table in Supabase

1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Create a new query
5. Copy and paste the SQL below:

```sql
-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
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
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update their own notifications"
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

DROP TRIGGER IF EXISTS notifications_updated_at_trigger ON notifications;
CREATE TRIGGER notifications_updated_at_trigger
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_notifications_updated_at();
```

6. Click **Run** (or press Cmd+Enter)
7. Wait for success message ✓

### Step 2: Deploy to Vercel

```bash
git add .
git commit -m "feat: add notification system with real-time alerts"
git push
```

Vercel will automatically deploy. Check deployment at [vercel.com](https://vercel.com)

### Step 3: Test the System

**Test as Organizer (Seller):**
1. Sign up as user A (organizer role)
2. Create an event with a ticket type
3. Note the organizer's user ID

**Test as Buyer:**
1. Sign up as user B (buyer role)
2. Go to the event page
3. Click "Buy Ticket"
4. Complete MercadoPago sandbox payment
5. Return to site

**Verify Notifications:**

**Organizer (User A) should see:**
- Bell icon with "1" badge in header
- Click bell → see "🎟️ Ticket Sold!" notification
- Shows buyer name, event, ticket type, quantity, price

**Buyer (User B) should see:**
- Bell icon with "1" badge in header
- Click bell → see "✅ Purchase Confirmed!" notification
- Shows event, ticket type, quantity, price

---

## 🧪 Advanced Testing

### Test Sandbox Payment Credentials
Use these test cards in MercadoPago sandbox:

| Card | Number | Exp | CVV |
|------|--------|-----|-----|
| Visa (Approved) | 4111 1111 1111 1111 | 11/25 | 123 |
| Visa (Rejected) | 4000 0000 0000 0002 | 11/25 | 123 |

### Test Multiple Notifications
1. Create multiple buyers
2. Have each buy different quantities
3. Organizer should see multiple "Ticket Sold" notifications
4. Each buyer should see their own "Purchase Confirmed"

### Test Mark as Read
1. See notification with "1" badge
2. Click "Mark read" on a notification
3. Notification row becomes gray
4. Badge count decreases to "0"
5. Click "Mark all as read"
6. All notifications gray out
7. Badge disappears

### Test Delete
1. Click ✕ button on notification
2. Notification disappears
3. Next notification takes its place (if any)

---

## 📊 How Notifications Work

### Payment → Notification Flow

```
1. Buyer clicks "Buy Ticket"
   ↓
2. MercadoPago Checkout opens
   ↓
3. Buyer completes payment
   ↓
4. MercadoPago sends IPN webhook
   ↓
5. Webhook handler fetches payment details
   ↓
6. Updates purchase status to "approved"
   ↓
7. Creates TWO notifications:
   - For ORGANIZER: "🎟️ Ticket Sold!"
   - For BUYER: "✅ Purchase Confirmed!"
   ↓
8. Users see bell badge immediately
   ↓
9. Click bell to see notification details
```

### Real-time Updates
- Notifications polled every **30 seconds**
- Shows unread count badge
- One-click mark as read
- Can delete old notifications

---

## 📋 Files Created/Modified

### New Files
```
features/notifications/actions.ts          (6 functions)
components/notification-bell.tsx           (UI with dropdown)
components/notification-bell-wrapper.tsx   (Client wrapper)
services/supabase/migrations/03_notifications.sql
NOTIFICATIONS.md                           (Full documentation)
DEPLOYMENT.md                              (This file)
```

### Modified Files
```
services/supabase/schema.sql               (Added notifications table)
components/nav-header.tsx                  (Integrated NotificationBell)
app/api/webhooks/mercadopago/route.ts      (Creates notifications on payment)
```

### Database Objects
```
- 1 new table: notifications
- 4 indexes for performance
- 3 RLS policies for security
- 1 trigger for updated_at timestamp
```

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] Notification table exists in Supabase
  - Query: `SELECT COUNT(*) FROM notifications;`
  - Should return: 0 rows initially

- [ ] RLS policies enabled
  - Go to Supabase Dashboard → Table Editor → notifications
  - Check "RLS Enabled" toggle is ON

- [ ] Indexes created
  - Query: `SELECT * FROM pg_indexes WHERE tablename = 'notifications';`
  - Should show 4 indexes

- [ ] Bell appears in header when logged in
  - Log in → check header for bell icon

- [ ] Webhook is receiving events
  - Make a purchase in sandbox
  - Check Vercel logs: `vercel logs`
  - Look for: `[MercadoPago Webhook] Creating notifications`

- [ ] Notifications appear in dropdown
  - Click bell icon
  - See list of notifications

- [ ] Mark as read works
  - Click "Mark read" on notification
  - Notification becomes gray
  - Unread count decreases

---

## ⚠️ Common Issues & Solutions

### Issue: "Bell doesn't appear in header"
**Solution:**
- Verify you're logged in
- Check browser console (F12) for errors
- Refresh page
- Clear browser cache

### Issue: "No notifications appearing after purchase"
**Solution:**
- Verify SQL migration was applied
  - Query: `\dt notifications` in Supabase SQL
  - Should show the notifications table
- Check webhook logs in Vercel
  - Run: `vercel logs`
  - Look for webhook processing logs
- Verify payment was approved (not pending/rejected)
  - Check in Supabase: `SELECT * FROM purchases;`
  - Look for `payment_status = 'approved'`

### Issue: "Can see other user's notifications"
**Solution:**
- This is an RLS policy violation
- Verify RLS is enabled on notifications table
- Run: `SELECT tablename FROM pg_tables WHERE rowsecurity = true;`
- Should include 'notifications'

### Issue: "Wrong user_id in webhook"
**Solution:**
- Check event.organizer_id is set correctly
- Verify buyer_id is set on purchase
- Check webhook logs for exact values being inserted

### Issue: "Unread count doesn't update"
**Solution:**
- Wait 30 seconds for polling to refresh
- Or refresh page (F5)
- Check if notification is actually in DB
  - Query: `SELECT * FROM notifications WHERE user_id = 'YOUR_USER_ID';`

---

## 🚀 Production Considerations

### For High Volume
- Notification polling every 30s may get expensive
- Consider Supabase real-time subscriptions for true real-time
- Implement notification archive after 30 days
- Add pagination if users get > 100 notifications

### For Email Notifications
- Future feature: Create `email_queue` table
- Webhook creates both DB notification + email queue entry
- Async job sends emails
- Users can disable in preferences

### For Mobile
- NotificationBell is responsive (works on mobile)
- Could add PWA push notifications
- Could add native mobile app integration

---

## 📞 Need Help?

**Check these files for details:**
- [NOTIFICATIONS.md](./NOTIFICATIONS.md) - Complete system documentation
- [app/api/webhooks/mercadopago/route.ts](./app/api/webhooks/mercadopago/route.ts) - Webhook integration
- [features/notifications/actions.ts](./features/notifications/actions.ts) - Server functions
- [components/notification-bell.tsx](./components/notification-bell.tsx) - UI component

**Debug commands:**
```bash
# Check if migrations were applied
npx supabase db pull

# View notification table structure
SELECT * FROM information_schema.columns WHERE table_name = 'notifications';

# See all notifications
SELECT * FROM notifications;

# See your notifications
SELECT * FROM notifications WHERE user_id = auth.uid();

# Count unread
SELECT COUNT(*) FROM notifications WHERE is_read = false AND user_id = auth.uid();

# Delete all notifications (testing)
DELETE FROM notifications;

# Verify webhook was called
# (check Vercel logs)
vercel logs
```

---

## ✨ Summary

The notification system is **fully implemented and ready to deploy**:

✅ Database schema created (services/supabase/schema.sql)
✅ Server actions implemented (features/notifications/actions.ts)
✅ UI component built (components/notification-bell.tsx)
✅ Webhook integration complete (app/api/webhooks/mercadopago/route.ts)
✅ Header integration done (components/nav-header.tsx)
✅ Build verified - **Compiles successfully**

**Next action:** Apply the SQL migration to Supabase, then deploy to Vercel.
