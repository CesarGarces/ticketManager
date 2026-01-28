// MercadoPago type definitions

export interface PaymentPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface PreferenceItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

export interface PreferenceData {
  items: PreferenceItem[];
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: 'approved' | 'all';
  external_reference: string;
  metadata?: Record<string, any>;
}

export interface PaymentNotification {
  id: number;
  live_mode: boolean;
  type: string;
  date_created: string;
  user_id: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

export interface PaymentInfo {
  id: number;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  external_reference: string;
  transaction_amount: number;
  currency_id: string;
  date_approved: string | null;
  date_created: string;
  metadata: Record<string, any>;
}
