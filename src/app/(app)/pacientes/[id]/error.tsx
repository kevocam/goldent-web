'use client';

import { ErrorState } from '@/components/shared/error-state';

export default function PatientError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col px-4 py-8 md:px-8">
      <ErrorState title="No pudimos abrir la ficha" onRetry={reset} className="md:mx-auto md:w-full md:max-w-xl" />
    </main>
  );
}
