'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/features/orders/actions';
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
import { ShoppingCart } from 'lucide-react';
import { TicketType } from '@/domain/types';
import { formatCurrency } from '@/lib/utils';

import { useTranslation } from '@/i18n/context';

interface TicketSelectorProps {
  eventId: string;
  ticketType: TicketType;
  maxQuantity: number;
}

export default function TicketSelector({ eventId, ticketType, maxQuantity }: TicketSelectorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');

    const data = {
      event_id: eventId,
      customer_name: formData.get('customer_name') as string,
      customer_email: formData.get('customer_email') as string,
      items: [
        {
          ticket_type_id: ticketType.id,
          quantity,
        },
      ],
    };

    const result = await createOrder(data);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.order) {
      router.push(`/orders/${result.order.id}/confirmation`);
    }
  }

  const total = Number(ticketType.price) * quantity;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ShoppingCart className="w-4 h-4 mr-2" />
          {t('events.buy_tickets')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('events.purchase_ticket')} {ticketType.name}</DialogTitle>
          <DialogDescription>
            {t('events.complete_purchase_desc')}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">{t('buyer.quantity')}</Label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? t('events.ticket') : t('events.tickets_count')}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>{t('orders.total')}</span>
              <span>{formatCurrency(total, ticketType.currency)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_name">{t('common.name')} *</Label>
            <Input
              id="customer_name"
              name="customer_name"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_email">{t('common.email')} *</Label>
            <Input
              id="customer_email"
              name="customer_email"
              type="email"
              placeholder="john@example.com"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded text-sm">
            <strong>{t('common.status')}:</strong> {t('events.simulated_notice')}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t('events.processing') : t('events.complete_purchase_btn')}
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
