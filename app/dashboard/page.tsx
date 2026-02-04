import { getOrganizerProfile } from '@/features/auth/actions';
import { getEvents, getDashboardStats } from '@/features/events/actions';
import { getTranslation } from '@/i18n/server';
import NavHeader from '@/components/nav-header';
import DashboardContent from '@/components/dashboard-content';

export default async function DashboardPage() {
  // This validates that user is authenticated and has organizer role
  // If not, getOrganizerProfile will redirect to home
  const profile = await getOrganizerProfile();
  
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
