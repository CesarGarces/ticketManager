'use client';

import { useState } from 'react';
import { updateEvent } from '@/features/events/actions';
import { uploadEventImage } from '@/services/storage/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Edit, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n/context';
import type { Event } from '@/domain/types';

interface EditEventModalProps {
  event: Event;
}

export default function EditEventModal({ event }: EditEventModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');

    const imageFile = formData.get('image') as File;
    let imagePath = event.image_path;

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

    const data: Record<string, string> = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
    };

    if (imagePath) {
      data.image_path = imagePath;
    }

    const result = await updateEvent(event.id, data);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          {t('dashboard.edit_event')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dashboard.edit_event')}</DialogTitle>
          <DialogDescription>
            {t('dashboard.edit_event_desc')}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('dashboard.event_title')} *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={event.title}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('dashboard.description_label')}</Label>
            <Input
              id="description"
              name="description"
              defaultValue={event.description}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('dashboard.location_label')} *</Label>
            <Input
              id="location"
              name="location"
              defaultValue={event.location}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">{t('dashboard.event_image')}</Label>
            {event.image_url && (
              <div className="mb-2 rounded-md overflow-hidden border max-h-40">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {!event.image_url && (
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                <ImageIcon className="w-4 h-4" />
                {t('dashboard.event_image')}
              </div>
            )}
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">{t('dashboard.start_date')} *</Label>
              <Input
                id="start_date"
                name="start_date"
                type="datetime-local"
                defaultValue={event.start_date.slice(0, 16)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">{t('dashboard.end_date')} *</Label>
              <Input
                id="end_date"
                name="end_date"
                type="datetime-local"
                defaultValue={event.end_date.slice(0, 16)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t('dashboard.saving') : t('common.save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
