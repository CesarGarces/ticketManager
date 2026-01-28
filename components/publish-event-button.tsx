'use client';

import { useState } from 'react';
import { updateEventStatus } from '@/features/events/actions';
import { Button } from '@/components/ui/button';
import { EventStatus } from '@/domain/types';
import { useRouter } from 'next/navigation';

interface PublishEventButtonProps {
  eventId: string;
}

export default function PublishEventButton({ eventId }: PublishEventButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePublish() {
    setLoading(true);
    await updateEventStatus(eventId, EventStatus.PUBLISHED);
    setLoading(false);
    router.refresh();
  }

  return (
    <Button onClick={handlePublish} disabled={loading} size="lg">
      {loading ? 'Publishing...' : 'Publish Event'}
    </Button>
  );
}
