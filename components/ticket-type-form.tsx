'use client';

import { useState } from 'react';
import { createTicketType } from '@/features/tickets/actions';
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
import { Plus } from 'lucide-react';
import { Currency } from '@/domain/types';
import { useRouter } from 'next/navigation';

import { useTranslation } from '@/i18n/context';

interface TicketTypeFormProps {
  eventId: string;
}

export default function TicketTypeForm({ eventId }: TicketTypeFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');

    const data = {
      event_id: eventId,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      currency: (formData.get('currency') as Currency) || Currency.COP,
      quantity_total: parseInt(formData.get('quantity_total') as string),
    };

    const result = await createTicketType(data);

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
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          {t('dashboard.add_ticket_type')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dashboard.add_ticket_type')}</DialogTitle>
          <DialogDescription>
            {t('dashboard.ticket_type_desc')}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('dashboard.ticket_name')} *</Label>
            <Input
              id="name"
              name="name"
              placeholder={t('dashboard.ticket_name_placeholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('dashboard.ticket_desc_label')}</Label>
            <Input
              id="description"
              name="description"
              placeholder={t('dashboard.ticket_desc_placeholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t('dashboard.price')} *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="500"
                min="0"
                placeholder="50000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">{t('dashboard.currency')} *</Label>
              <select
                id="currency"
                name="currency"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="COP">COP</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity_total">{t('dashboard.total_quantity')} *</Label>
            <Input
              id="quantity_total"
              name="quantity_total"
              type="number"
              min="1"
              placeholder={t('dashboard.quantity_placeholder')}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t('dashboard.creating') : t('dashboard.create_ticket_type_btn')}
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
