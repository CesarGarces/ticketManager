'use client';

import { useState } from 'react';
import { updateEventStatus } from '@/features/events/actions';
import { Button } from '@/components/ui/button';
import { EventStatus } from '@/domain/types';
import { useRouter } from 'next/navigation';

import { useTranslation } from '@/i18n/context';

interface PublishEventButtonProps {
  eventId: string;
}

export default function PublishEventButton({ eventId }: PublishEventButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function handlePublish() {
    setLoading(true);
    await updateEventStatus(eventId, EventStatus.PUBLISHED);
    setLoading(false);
    router.refresh();
  }

  return (
    <Button onClick={handlePublish} disabled={loading} size="lg">
      {loading ? t('dashboard.publishing') : t('dashboard.publish_event')}
    </Button>
  );
}
