'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createPurchaseWithPayment } from '@/features/purchases/actions';
import { Loader2, ShoppingCart } from 'lucide-react';

interface MercadoPagoPurchaseButtonProps {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  disabled?: boolean;
}

export default function MercadoPagoPurchaseButton({
  eventId,
  ticketTypeId,
  quantity,
  disabled
}: MercadoPagoPurchaseButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (quantity <= 0) return;

    setLoading(true);
    try {
      const result = await createPurchaseWithPayment({
        eventId,
        ticketTypeId,
        quantity,
      });

      if (result.error) {
        alert(result.error);
        return;
      }

      if (result.checkoutUrl) {
        // Redirect to MercadoPago checkout
        window.location.href = result.checkoutUrl;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to initiate purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePurchase}
      disabled={disabled || loading || quantity <= 0}
      className="w-full md:w-auto"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Buy Ticket
        </>
      )}
    </Button>
  );
}
