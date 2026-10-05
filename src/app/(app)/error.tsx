'use client';

import { ErrorState } from '@/components/shared/error-state';

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col px-4 py-8 md:px-8">
      <ErrorState onRetry={reset} className="md:mx-auto md:w-full md:max-w-xl" />
    </main>
  );
}
