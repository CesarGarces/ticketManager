'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Tag } from 'lucide-react';
import { useTranslation } from '@/i18n/context';

interface EventFiltersProps {
  categories: { id: string; name: string; slug: string }[];
}

export function EventFilters({ categories }: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || 'all';

  const [search, setSearch] = useState(currentSearch);

  function handleSearch() {
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }

  function handleCategoryChange(categoryId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === 'all') {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-50 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t('events.search_placeholder') || 'Buscar por lugar o título...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 h-12 bg-gray-50 border-gray-100 focus:bg-white transition-all rounded-xl"
          />
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          disabled={isPending}
          className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
        >
          {isPending ? t('common.loading') : t('common.search') || 'Buscar'}
        </Button>
      </div>

      {/* Categories */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-500">
          <Tag className="w-4 h-4" />
          <span>{t('events.filter_by_type') || 'Filtrar por tipo'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={currentCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange('all')}
            className={`rounded-full px-4 ${currentCategory === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-600 border-gray-200'}`}
          >
            {t('common.all') || 'Todos'}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={currentCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(cat.id)}
              className={`rounded-full px-4 ${currentCategory === cat.id ? 'bg-indigo-600 text-white' : 'text-gray-600 border-gray-200'}`}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
