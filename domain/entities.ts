// Core domain entities for the event management platform

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Organizer {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  slug: string;
  location: string;
  category_id?: string;
  start_date: string;
  end_date: string;
  image_path?: string;
  image_url?: string;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: Currency;
  quantity_total: number;
  quantity_sold: number;
  created_at: string;
}

export interface Order {
  id: string;
  event_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  currency: Currency;
  status: OrderStatus;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  ticket_type_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum Currency {
  COP = 'COP',
}
