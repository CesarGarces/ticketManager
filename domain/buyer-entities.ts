// Buyer-specific domain entities

export interface Buyer {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Purchase {
  id: string;
  buyer_id: string;
  order_id: string;
  ticket_type_id: string;
  event_id: string;
  quantity: number;
  payment_id: string | null;
  payment_status: PaymentStatus;
  purchase_date: string;
}

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  IN_PROCESS = 'in_process',
}

// View models for buyer UI
export interface PurchaseWithDetails {
  purchase: Purchase;
  event: {
    id: string;
    title: string;
    slug: string;
    start_date: string;
    end_date: string;
    location: string;
  };
  ticketType: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
}
