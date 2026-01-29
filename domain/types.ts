// Shared types and utilities for the domain layer

import type { Event, TicketType, Order, OrderItem } from './entities';
import { Currency } from './entities';

export type { Organizer, Event, TicketType, Order, OrderItem } from './entities';
export { EventStatus, OrderStatus, Currency } from './entities';

// DTOs for creating entities
export interface CreateEventDTO {
  title: string;
  description: string;
  location: string;
  category_id?: string;
  start_date: string;
  end_date: string;
  image_path?: string;
}

export interface CreateTicketTypeDTO {
  event_id: string;
  name: string;
  description?: string;
  price: number;
  currency: Currency;
  quantity_total: number;
}

export interface CreateOrderDTO {
  event_id: string;
  customer_name: string;
  customer_email: string;
  items: Array<{
    ticket_type_id: string;
    quantity: number;
  }>;
}

// View models for UI
export interface EventWithTickets {
  event: Event;
  ticketTypes: TicketType[];
}

export interface OrderWithItems {
  order: Order;
  items: Array<OrderItem & { ticket_type: TicketType }>;
}
