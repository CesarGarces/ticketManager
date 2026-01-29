-- Seed data for testing the event management platform

-- Note: You'll need to create a test user in Supabase Auth first
-- Then replace 'YOUR_USER_ID_HERE' with the actual UUID from auth.users

-- Insert test organizer (replace with your actual auth user ID)
INSERT INTO organizers (id, email, name) VALUES
  ('YOUR_USER_ID_HERE', 'organizer@example.com', 'Test Organizer');

-- Insert test categories
INSERT INTO event_categories (id, name, slug, description) VALUES
  ('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380e11', 'Conferencia', 'conferencias', 'Eventos profesionales y tecnológicos'),
  ('e2eebc99-9c0b-4ef8-bb6d-6bb9bd380e22', 'Taller', 'talleres', 'Sesiones prácticas de aprendizaje'),
  ('e3eebc99-9c0b-4ef8-bb6d-6bb9bd380e33', 'Música', 'musica', 'Conciertos y festivales musicales'),
  ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e44', 'Reunión', 'reuniones', 'Encuentros sociales y networking');

-- Insert test events
INSERT INTO events (id, organizer_id, category_id, title, description, slug, location, start_date, end_date, status) VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'YOUR_USER_ID_HERE',
    'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380e11',
    'Tech Conference 2026',
    'Annual technology conference featuring the latest innovations in software development, AI, and cloud computing.',
    'tech-conference-2026',
    'San Francisco Convention Center',
    '2026-06-15 09:00:00+00',
    '2026-06-17 18:00:00+00',
    'published'
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'YOUR_USER_ID_HERE',
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e44',
    'Startup Networking Mixer',
    'Connect with fellow entrepreneurs, investors, and innovators in the startup ecosystem.',
    'startup-networking-mixer',
    'Downtown Innovation Hub',
    '2026-05-20 18:00:00+00',
    '2026-05-20 22:00:00+00',
    'published'
  ),
  (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'YOUR_USER_ID_HERE',
    'e2eebc99-9c0b-4ef8-bb6d-6bb9bd380e22',
    'Product Design Workshop',
    'Hands-on workshop covering user research, prototyping, and design thinking methodologies.',
    'product-design-workshop',
    'Creative Studio Downtown',
    '2026-07-10 10:00:00+00',
    '2026-07-10 16:00:00+00',
    'draft'
  );

-- Insert ticket types for Tech Conference
INSERT INTO ticket_types (event_id, name, description, price, currency, quantity_total, quantity_sold) VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Early Bird',
    'Limited early bird pricing - save 40%!',
    500000.00,
    'COP',
    100,
    75
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'General Admission',
    'Full conference access including all sessions and networking events',
    850000.00,
    'COP',
    500,
    120
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'VIP Pass',
    'Premium access with exclusive workshops, VIP lounge, and speaker meet & greet',
    1500000.00,
    'COP',
    50,
    12
  );

-- Insert ticket types for Startup Mixer
INSERT INTO ticket_types (event_id, name, description, price, currency, quantity_total, quantity_sold) VALUES
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Standard Entry',
    'Includes entry, welcome drink, and networking access',
    120000.00,
    'COP',
    200,
    85
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Investor Pass',
    'Priority access with dedicated investor networking area',
    250000.00,
    'COP',
    30,
    18
  );

-- Insert ticket types for Design Workshop
INSERT INTO ticket_types (event_id, name, description, price, currency, quantity_total, quantity_sold) VALUES
  (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'Workshop Ticket',
    'Full day workshop with materials and lunch included',
    350000.00,
    'COP',
    30,
    0
  );
