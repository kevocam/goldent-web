import Link from 'next/link';
import { CalendarPlus, MousePointerClick, Plus } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { MedicalAlerts } from '@/components/shared/medical-alerts';
import { AppointmentStatusPill } from '@/components/shared/status-pills';
import { agendaHref, durationLabel, freeGaps, slotOf, timeFromMinutes } from '@/lib/agenda';
import { cn } from '@/lib/cn';
import { fullName } from '@/lib/format';
import type { AgendaAppointment } from '@/types/domain';
import { AppointmentPanel } from './appointment-panel';

export interface DayViewProps {
  date: string;
  today: string;
  appointments: AgendaAppointment[];
  selectedId: string | null;
  /** Minutos desde medianoche (Lima): los huecos de hoy empiezan desde ahora. */
  nowMinutes: number;
}

type Row =
  | { kind: 'appt'; start: number; a: AgendaAppointment; time: string; duration: number }
  | { kind: 'free'; start: number; end: number };

/** F08 · Día: lista por hora con huecos libres y panel de la cita seleccionada. */
export function DayView({ date, today, appointments, selectedId, nowMinutes }: DayViewProps) {
  const selected = appointments.find((a) => a.id === selectedId) ?? null;
  const slots = appointments.map((a) => ({ a, ...slotOf(a) }));

  // Huecos libres solo hoy (desde ahora) y en días futuros; no en el pasado.
  const busy = slots.filter((s) => s.a.status !== 'cancelled' && s.a.status !== 'no_show');
  const gaps = date < today ? [] : freeGaps(busy, date === today ? Math.max(8 * 60, Math.ceil(nowMinutes / 30) * 30) : undefined);

  const rows: Row[] = [
    ...slots.map((s) => ({ kind: 'appt' as const, start: s.start, a: s.a, time: s.time, duration: s.duration })),
    ...gaps.map((g) => ({ kind: 'free' as const, ...g })),
  ].sort((x, y) => x.start - y.start);

  return (
    <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_420px]">
      {selected ? (
        <div className="md:order-last">
          <AppointmentPanel appointment={selected} today={today} />
        </div>
      ) : null}

      {appointments.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          tone="gold"
          title={date < today ? 'No hubo citas este día' : 'Sin citas este día'}
          description={date < today ? undefined : 'Agenda una cita y envía el recordatorio por WhatsApp desde aquí.'}
          actions={
            date < today ? null : (
              <ButtonLink href={agendaHref({ vista: 'dia', fecha: date, nueva: true })} scroll={false}>
                <Plus className="size-5" aria-hidden />
                Nueva cita
              </ButtonLink>
            )
          }
        />
      ) : (
        <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
          {rows.map((r) =>
            r.kind === 'free' ? (
              <li key={`free-${r.start}`} className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 md:grid-cols-[64px_minmax(0,1fr)] md:gap-3.5">
                <span className="tabular pt-5 text-right text-[15px] font-extrabold text-ink-muted">{timeFromMinutes(r.start)}</span>
                <Link
                  href={agendaHref({ vista: 'dia', fecha: date, nueva: true, hora: timeFromMinutes(r.start) })}
                  scroll={false}
                  className="flex min-h-16 items-center gap-2.5 rounded-2xl border-[1.5px] border-dashed border-line px-[18px] text-[15px] font-bold text-ink-muted no-underline hover:border-gold-500 hover:text-gold-900"
                >
                  <Plus className="size-5 shrink-0" aria-hidden />
                  Libre hasta las {timeFromMinutes(r.end)} · Agendar
                </Link>
              </li>
            ) : (
              <li key={r.a.id} className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 md:grid-cols-[64px_minmax(0,1fr)] md:gap-3.5">
                <span className="flex flex-col items-end pt-3.5">
                  <span className="tabular text-[17px] font-extrabold">{r.time}</span>
                  <span className="text-xs font-bold text-ink-muted">{durationLabel(r.duration)}</span>
                </span>
                <Link
                  href={agendaHref({ vista: 'dia', fecha: date, cita: r.a.id })}
                  scroll={false}
                  replace
                  aria-current={r.a.id === selectedId ? 'true' : undefined}
                  className={cn(
                    'flex min-h-[72px] flex-wrap items-center gap-x-3.5 gap-y-2 rounded-2xl bg-surface px-4 py-3 text-ink no-underline',
                    r.a.id === selectedId ? 'border-2 border-gold-700' : 'border border-line-card hover:border-line',
                  )}
                >
                  <span className="flex min-w-[min(100%,200px)] flex-1 flex-col gap-0.5">
                    <span className={cn('truncate text-base font-extrabold', r.a.status === 'cancelled' && 'line-through')}>{fullName(r.a.patient)}</span>
                    <span className="truncate text-sm font-semibold text-ink-muted">{r.a.reason ?? 'Sin motivo'}</span>
                  </span>
                  <MedicalAlerts alerts={r.a.patient.alerts} compact size="sm" className="max-w-[180px]" />
                  <AppointmentStatusPill status={r.a.status} />
                </Link>
              </li>
            ),
          )}
        </ol>
      )}

      {!selected && appointments.length > 0 ? (
        <Card className="hidden flex-col items-center gap-2 px-6 py-10 text-center md:flex">
          <MousePointerClick className="size-7 text-ink-subtle" aria-hidden />
          <p className="m-0 text-[15px] font-semibold text-ink-muted">Toca una cita para ver al paciente, cambiar el estado o enviar el recordatorio.</p>
        </Card>
      ) : null}
    </div>
  );
}
