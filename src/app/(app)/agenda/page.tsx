import type { Metadata } from 'next';
import { CalendarDays } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { PhaseTag } from '@/components/shared/status-pills';

export const metadata: Metadata = { title: 'Agenda' };

/** F08 · Fase 2. La tabla appointments ya existe; la pantalla llega en la siguiente fase. */
export default function AgendaPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Agenda" actions={<PhaseTag />} variant="plain" />
      <div className="px-4 py-5 md:px-8">
        <EmptyState
          icon={CalendarDays}
          tone="gold"
          title="La agenda llega en la siguiente fase"
          description="Podrás ver tus citas del día y la semana, marcar quién vino y enviar recordatorios por WhatsApp."
          actions={<ButtonLink href="/">Ir a Pacientes</ButtonLink>}
        />
      </div>
    </main>
  );
}
