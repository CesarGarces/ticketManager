-- Notifications table for real-time alerts
-- Both sellers (organizers) and buyers receive notifications

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL, -- 'ticket_sold', 'purchase_confirmed', 'payment_verified'
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  
  -- Metadata for actions
  related_event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  related_purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
  related_order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  -- For seller: buyer info
  buyer_email VARCHAR,
  buyer_name VARCHAR,
  
  -- For buyer: event & ticket info
  event_title VARCHAR,
  ticket_type_name VARCHAR,
  quantity INTEGER,
  amount DECIMAL(10, 2),
  currency VARCHAR,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Trigger to update updated_at
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
