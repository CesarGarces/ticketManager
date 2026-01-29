'use client';

import { useTranslation } from '@/i18n/context';

export default function AppFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t py-8">
      <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} TicketManager. {t('common.all_rights_reserved')}.
      </div>
    </footer>
  );
}
