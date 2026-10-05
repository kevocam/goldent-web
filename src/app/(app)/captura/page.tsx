import type { Metadata } from 'next';
import { QuickCaptureForm } from '@/components/features/capture/quick-capture-form';
import { getNextRecordNumber } from '@/lib/data/patients';

export const metadata: Metadata = { title: 'Captura rápida' };

/** F05 · Digitalizar historias en papel. */
export default async function CapturePage() {
  return (
    <main className="flex flex-1 flex-col">
      <QuickCaptureForm nextRecordNumber={await getNextRecordNumber()} />
    </main>
  );
}
