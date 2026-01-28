# Event Management Platform MVP

A B2B event management SaaS platform where organizers can create events and sell tickets.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS, shadcn/ui
- **Backend**: Supabase (Auth + PostgreSQL)
- **Data Access**: Server Actions

## 📁 Project Structure

```
/app                    → Next.js pages and routing
/components             → Presentational UI components
  /ui                   → shadcn/ui components
/features               → Feature-based logic
  /auth                 → Authentication
  /events               → Event management
  /tickets              → Ticket management
  /orders               → Order processing
/domain                 → Entities, types, business rules
/services               → External services (Supabase)
/lib                    → Utilities and helpers
```

## 🛠 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy `.env.local.example` to `.env.local`
3. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set Up Database

1. Go to your Supabase project SQL Editor
2. Run the schema: `services/supabase/schema.sql`
3. Create a test user in Supabase Auth (Authentication > Users > Add User)
4. Update `services/supabase/seed.sql` with your user ID
5. Run the seed file: `services/supabase/seed.sql`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 Features

### Organizer Features
- ✅ Authentication (email/password)
- ✅ Dashboard with event list
- ✅ Create events
- ✅ Manage ticket types (pricing, inventory)
- ✅ Publish events
- ✅ View sales statistics

### Public Features
- ✅ Browse published events
- ✅ View event details
- ✅ Select and purchase tickets
- ✅ Order confirmation

## 🔐 Authentication

Test credentials (after setting up seed data):
- Email: `organizer@example.com`
- Password: (set when creating user in Supabase Auth)

## 📝 Key Design Decisions

### Architecture Principles (from AGENT.md)
- **No breaking changes**: Existing files never modified, only extended
- **Explicit boundaries**: UI, domain logic, and data access are separated
- **Replaceable infrastructure**: External services are abstracted
- **Production-ready structure**: Even as MVP, follows production patterns

### Data Access
- Server Actions for all data mutations
- Row Level Security (RLS) for multi-tenant isolation
- Type-safe domain entities

### UI/UX
- Clean, minimal design with shadcn/ui
- Responsive layouts
- Optimistic UI updates
- Form validation

## 🚧 Simulated Features

- **Payments**: Order creation is simulated (no real payment processing)
- **Email**: Confirmation emails are mentioned but not sent

## 🔮 Future Enhancements

The architecture supports:
- Multi-tenant SaaS
- Paid subscriptions
- Commission per ticket
- White-label organizers
- Mobile check-in apps
- Real payment integration (Stripe)
- Email notifications
- Analytics dashboard
- QR code tickets

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TailwindCSS](https://tailwindcss.com)
