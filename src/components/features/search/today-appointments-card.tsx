import Link from 'next/link';
import { CalendarPlus } from 'lucide-react';
import { SectionCard } from '@/components/shared/section-card';
import { agendaHref, limaTime } from '@/lib/agenda';
import { APPOINTMENT_STATUS } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { shortName } from '@/lib/format';
import type { AgendaAppointment } from '@/types/domain';

const MAX = 5;

export interface TodayAppointmentsCardProps {
  /** null = no se pudieron cargar (Inicio sigue funcionando igual). */
  appointments: AgendaAppointment[] | null;
  today: string;
}

/** Inicio · Citas de hoy (F08). Cada fila abre la cita en la agenda del día. */
export function TodayAppointmentsCard({ appointments, today }: TodayAppointmentsCardProps) {
  const list = appointments ?? [];
  const extra = list.length - MAX;

  return (
    <SectionCard title="Citas de hoy" action={{ label: 'Ver agenda', href: agendaHref({ vista: 'dia' }) }} className="self-start">
      {appointments === null ? (
        <p className="m-0 border-t border-line-soft pt-3 text-[15px] font-semibold text-ink-muted">No pudimos cargar las citas. Abre la agenda para reintentar.</p>
      ) : list.length === 0 ? (
        <div className="flex flex-col gap-2 border-t border-line-soft pt-3">
          <p className="m-0 text-[15px] font-semibold text-ink-muted">No tienes citas hoy.</p>
          <Link
            href={agendaHref({ vista: 'dia', fecha: today, nueva: true })}
            className="inline-flex min-h-11 items-center gap-1.5 self-start text-[15px] font-bold no-underline"
          >
            <CalendarPlus className="size-5" aria-hidden />
            Agendar cita
          </Link>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {list.slice(0, MAX).map((a) => {
            const st = APPOINTMENT_STATUS[a.status];
            return (
              <li key={a.id}>
                <Link
                  href={agendaHref({ vista: 'dia', fecha: today, cita: a.id })}
                  className="flex min-h-[60px] items-center gap-3 border-t border-line-soft text-ink no-underline"
                >
                  <span className="tabular w-[46px] text-[15px] font-extrabold">{limaTime(a.starts_at)}</span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className={cn('truncate text-[15px] font-bold', a.status === 'cancelled' && 'line-through')}>{shortName(a.patient)}</span>
                    {a.reason ? <span className="truncate text-[13px] font-semibold text-ink-muted">{a.reason}</span> : null}
                  </span>
                  <span className={cn('size-2.5 shrink-0 rounded-full', st.dot)} title={st.label} />
                  <span className="sr-only">{st.label}</span>
                </Link>
              </li>
            );
          })}
          {extra > 0 ? (
            <li className="border-t border-line-soft pt-3 text-sm font-bold text-ink-muted">
              + {extra} {extra === 1 ? 'cita más' : 'citas más'}
            </li>
          ) : null}
        </ul>
      )}
    </SectionCard>
  );
}
