import Link from 'next/link';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export type FeaturedEvent = {
  id: string;
  title: string;
  city: string;
  date: string;
  imageUrl: string;
  category: string;
  slug: string; // Added for routing
};

export function FeaturedEventHero({ event, ctaLabel }: { event: FeaturedEvent; ctaLabel: string }) {
  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden mb-12 group">
      {/* Background Image with Zoom Effect */}
      <img
        src={event.imageUrl}
        alt={event.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
        <div className="max-w-3xl space-y-4">
          <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-none uppercase tracking-wide">
            {event.category}
          </Badge>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight text-shadow-lg">
            {event.title}
          </h2>

          <div className="flex flex-wrap items-center gap-6 text-white/90 text-lg md:text-xl font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              <span>{event.city}</span>
            </div>
          </div>

          <div className="pt-4">
            <Link href={`/events/${event.slug}`}>
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300 gap-2 h-12 px-8 text-lg rounded-full">
                {ctaLabel} <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
