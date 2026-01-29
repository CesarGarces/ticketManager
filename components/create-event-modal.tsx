'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createEvent, getEventCategories } from '@/features/events/actions';
import { uploadEventImage } from '@/services/storage/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useTranslation } from '@/i18n/context';
import { useClickOutside } from '@/hooks/useClickOutside';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);
  const { t } = useTranslation();
  const modalRef = useClickOutside(onClose);

  useEffect(() => {
    async function loadCategories() {
      const cats = await getEventCategories();
      setCategories(cats);
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');

    let imagePath;
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', imageFile);

      const { path, error: uploadError } = await uploadEventImage(uploadFormData);

      if (uploadError) {
        setError(uploadError);
        setLoading(false);
        return;
      }
      imagePath = path;
    }

    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      category_id: formData.get('category_id') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      image_path: imagePath,
    };

    const result = await createEvent(data);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.event) {
      onClose();
      router.push(`/dashboard/events/${result.event.id}`);
    }
  }

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
    >
      <Card
        ref={modalRef}
        className={`w-full max-w-2xl shadow-2xl border-t-4 border-t-indigo-600 relative transition-all duration-500 max-h-[90vh] overflow-y-auto ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <CardHeader>
          <CardTitle>{t('dashboard.create_new_event')}</CardTitle>
          <CardDescription>{t('dashboard.fill_details')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t('dashboard.event_title')} *</Label>
              <Input
                id="title"
                name="title"
                placeholder={t('dashboard.title_placeholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('dashboard.description_label')} *</Label>
              <textarea
                id="description"
                name="description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('dashboard.description_placeholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t('dashboard.location_label')} *</Label>
              <Input
                id="location"
                name="location"
                placeholder={t('dashboard.location_placeholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">{t('dashboard.event_type')} *</Label>
              <select
                id="category_id"
                name="category_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">{t('dashboard.select_category')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">{t('dashboard.event_image')}</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">{t('dashboard.start_date')} *</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="datetime-local"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">{t('dashboard.end_date')} *</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="datetime-local"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {loading ? t('dashboard.creating') : t('dashboard.create_event')}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
