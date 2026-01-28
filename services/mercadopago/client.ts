import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import type { PreferenceData, PaymentPreference, PaymentInfo } from './types';

// Initialize MercadoPago client
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
  },
});

const preferenceClient = new Preference(client);
const paymentClient = new Payment(client);

/**
 * Create a payment preference for MercadoPago checkout
 */
export async function createPaymentPreference(
  data: PreferenceData
): Promise<PaymentPreference> {
  try {
    const preference = await preferenceClient.create({
      body: data,
    });

    return {
      id: preference.id!,
      init_point: preference.init_point!,
      sandbox_init_point: preference.sandbox_init_point!,
    };
  } catch (error) {
    console.error('Error creating payment preference:', error);
    throw new Error('Failed to create payment preference');
  }
}

/**
 * Get payment information by ID
 */
export async function getPaymentInfo(paymentId: string): Promise<PaymentInfo> {
  try {
    const payment = await paymentClient.get({ id: paymentId });

    return {
      id: payment.id!,
      status: payment.status as PaymentInfo['status'],
      status_detail: payment.status_detail!,
      external_reference: payment.external_reference!,
      transaction_amount: payment.transaction_amount!,
      currency_id: payment.currency_id!,
      date_approved: payment.date_approved || null,
      date_created: payment.date_created!,
      metadata: payment.metadata || {},
    };
  } catch (error) {
    console.error('Error getting payment info:', error);
    throw new Error('Failed to get payment information');
  }
}

/**
 * Verify webhook signature (basic validation)
 */
export function verifyWebhookSignature(
  signature: string | null,
  data: string
): boolean {
  // In production, implement proper signature verification
  // For now, we'll do basic validation
  return signature !== null && signature.length > 0;
}
