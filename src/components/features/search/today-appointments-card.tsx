import { CalendarDays } from 'lucide-react';
import { SectionCard } from '@/components/shared/section-card';
import { PhaseTag } from '@/components/shared/status-pills';

/** Citas de hoy: queda como aviso hasta implementar la agenda (fase 2, F08). */
export function TodayAppointmentsCard() {
  return (
    <SectionCard title="Citas de hoy" aside={<PhaseTag />} className="self-start">
      <div className="flex items-start gap-3 border-t border-line-soft pt-3">
        <CalendarDays className="mt-0.5 size-5 shrink-0 text-ink-muted" aria-hidden />
        <p className="m-0 text-[15px] leading-snug font-semibold text-ink-muted">
          La agenda llega en la siguiente fase. Por ahora, coordina las citas por WhatsApp desde la ficha.
        </p>
      </div>
    </SectionCard>
  );
}
