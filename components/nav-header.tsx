import Link from 'next/link';
import { Button } from '@/components/ui/button';
import UserNav from '@/components/user-nav';
import LanguageSwitcher from '@/components/language-switcher';
import AuthSwitcher from '@/components/auth-switcher';
import { getProfile } from '@/features/auth/actions';
import { getTranslation } from '@/i18n/server';

export default async function NavHeader() {
  const profile = await getProfile();
  const { t } = await getTranslation();

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            TicketManager
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <div className="h-6 w-px bg-gray-200 mx-2" />

          {profile ? (
            <UserNav user={profile as any} />
          ) : (
            <AuthSwitcher />
          )}
        </div>
      </div>
    </header>
  );
}
