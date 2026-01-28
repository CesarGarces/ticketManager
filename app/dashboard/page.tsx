import { getProfile } from '@/features/auth/actions';
import { getEvents, getDashboardStats } from '@/features/events/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Calendar, MapPin, Plus, TrendingUp, Users, DollarSign } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import UserNav from '@/components/user-nav';
import { EventSalesChart } from '@/components/dashboard/event-sales-chart';
import { TicketDistributionChart } from '@/components/dashboard/ticket-distribution-chart';

export default async function DashboardPage() {
  const profile = await getProfile();
  const events = await getEvents();
  const stats = await getDashboardStats();

  const totalSales = stats?.eventSales.reduce((acc, ev) => acc + ev.sales, 0) || 0;
  const totalRevenue = stats?.eventSales.reduce((acc, ev) => acc + ev.revenue, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">TicketManager</Link>
          <div className="flex items-center gap-4">
            {profile && <UserNav user={profile as any} />}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h2>
            <p className="text-gray-600 mt-1">Manage your events and track performance</p>
          </div>
          <Link href="/dashboard/events/new">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets Sold</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales}</div>
              <p className="text-xs text-muted-foreground">+20% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">+15% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.filter(e => e.status === 'published').length}</div>
              <p className="text-xs text-muted-foreground">{events.length} total events</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {events.length > 0 && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Event Sales</CardTitle>
                <CardDescription>Tickets sold per event</CardDescription>
              </CardHeader>
              <CardContent>
                <EventSalesChart data={stats.eventSales} />
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Ticket Distribution</CardTitle>
                <CardDescription>Sales by ticket category</CardDescription>
              </CardHeader>
              <CardContent>
                <TicketDistributionChart data={stats.typeDistribution} />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Events</h3>
          {events.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Calendar className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                <p className="text-gray-600 mb-6">Create your first event to get started</p>
                <Link href="/dashboard/events/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-indigo-50">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={event.status === 'published' ? 'default' : 'secondary'} className={event.status === 'published' ? 'bg-indigo-600' : ''}>
                          {event.status}
                        </Badge>
                      </div>
                      <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-400" />
                          <span>{formatDate(event.start_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-indigo-400" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
