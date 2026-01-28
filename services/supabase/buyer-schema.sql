-- Buyer Experience Database Schema
-- This extends the existing schema with buyer/purchase functionality

-- Buyers table (similar to organizers, for user profiles)
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases table (tracks individual ticket purchases with payment info)
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  payment_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected', 'cancelled', 'in_process')),
  purchase_date TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_event ON purchases(event_id);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_id ON purchases(payment_id);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_buyers_email ON buyers(email);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Buyers: Users can only see their own profile
CREATE POLICY "Users can view own buyer profile" ON buyers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own buyer profile" ON buyers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own buyer profile" ON buyers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Purchases: Buyers can view their own purchases
CREATE POLICY "Buyers can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can create purchases" ON purchases
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Organizers can view purchases for their events
CREATE POLICY "Organizers can view event purchases" ON purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = purchases.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

-- System can update purchase payment status (for webhooks)
CREATE POLICY "System can update purchase payment status" ON purchases
  FOR UPDATE USING (true)
  WITH CHECK (true);
