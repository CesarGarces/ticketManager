import { getProfile } from '@/features/auth/actions';
import { getEvents, getDashboardStats } from '@/features/events/actions';
import { getTranslation } from '@/i18n/server';
import NavHeader from '@/components/nav-header';
import DashboardContent from '@/components/dashboard-content';

export default async function DashboardPage() {
  const profile = await getProfile();
  const events = await getEvents();
  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <DashboardContent events={events} stats={stats} />
      </main>
    </div>
  );
}
