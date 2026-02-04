import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCcw, ArrowLeft, Home, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { getPurchaseById } from '@/features/purchases/actions';
import { getTranslation } from '@/i18n/server';

export default async function PaymentFailurePage({
  searchParams,
}: {
  searchParams: Promise<{ purchase_id: string }>;
}) {
  const { purchase_id } = await searchParams;
  const { t } = await getTranslation();
  const purchase = purchase_id ? await getPurchaseById(purchase_id) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-xl w-full shadow-2xl border-t-8 border-t-red-500 overflow-hidden">
        <div className="bg-red-50 p-10 text-center border-b">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-red-900 mb-2">{t('payment.failed_title')}</h1>
          <p className="text-red-700">{t('payment.failed_desc')}</p>
        </div>

        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-gray-400" />
                {t('payment.what_to_do')}
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <span>{t('payment.check_connection')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <span>{t('payment.card_balance')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <span>{t('payment.try_different')}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4 pt-4">
              {purchase && (
                <Link href={`/buy/${purchase.event?.slug}`}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg">
                    <RefreshCcw className="mr-2 w-5 h-5" /> {t('payment.try_again')}
                  </Button>
                </Link>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Link href="/events">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> {t('payment.browse_events')}
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" className="w-full flex items-center gap-2">
                    <Home className="w-4 h-4" /> {t('common.home')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
