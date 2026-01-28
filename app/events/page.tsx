import { getEvents } from '@/features/events/actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function EventsPage() {
  const events = await getEvents();
  const publishedEvents = events.filter(e => e.status === 'published');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600">
            TicketManager
          </Link>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
              Explore Upcoming Events
            </h1>
            <p className="text-xl text-gray-600">
              Find and book tickets for the best events in your area.
            </p>
          </div>

          {publishedEvents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border">
              <p className="text-gray-500 text-lg">No events found at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-6 text-white text-center">
                    <h3 className="text-2xl font-bold">{event.title}</h3>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="capitalize">
                        {event.location}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-600 line-clamp-2 mb-4">
                      {event.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 border-t mt-auto">
                    <Link href={`/events/${event.slug}`} className="w-full">
                      <Button className="w-full mt-4" variant="outline">
                        View Details <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} TicketManager. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
