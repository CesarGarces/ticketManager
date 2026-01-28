import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Ticket, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Event Management Made Simple
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Create events, sell tickets, and grow your business with our powerful B2B platform
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-16">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                Organizer Login
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Events</h3>
              <p className="text-gray-600">
                Set up professional events in minutes with our intuitive interface
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Ticket className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sell Tickets</h3>
              <p className="text-gray-600">
                Multiple ticket types, pricing tiers, and inventory management
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Manage Attendees</h3>
              <p className="text-gray-600">
                Track sales, manage orders, and engage with your audience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
