import { Pill } from '@/components/ui/pill';
import { APPOINTMENT_STATUS, TREATMENT_STATUS } from '@/lib/constants';
import type { AppointmentStatus, TreatmentStatus } from '@/types/domain';

export function TreatmentStatusPill({ status, size }: { status: TreatmentStatus; size?: 'sm' | 'md' }) {
  const s = TREATMENT_STATUS[status];
  return (
    <Pill dot size={size} className={s.className}>
      {s.label}
    </Pill>
  );
}

export function AppointmentStatusPill({ status, size }: { status: AppointmentStatus; size?: 'sm' | 'md' }) {
  const s = APPOINTMENT_STATUS[status];
  return (
    <Pill dot size={size} className={s.className}>
      {s.label}
    </Pill>
  );
}

/** Etiqueta gris "Fase 2" para lo que todavía no está implementado. */
export function PhaseTag({ children = 'Fase 2' }: { children?: string }) {
  return <Pill className="bg-surface-2 text-ink-muted">{children}</Pill>;
}
