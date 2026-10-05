import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Card } from '@/components/ui/card';
import { agendaHref, dayNumber, layoutLanes, slotOf, timeFromMinutes, visibleHours, weekdayShort } from '@/lib/agenda';
import { APPOINTMENT_STATUS } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { shortName } from '@/lib/format';
import type { AgendaAppointment } from '@/types/domain';

const HOUR_PX = 56;

export interface WeekViewProps {
  days: string[];
  today: string;
  appointments: AgendaAppointment[];
  /** Minutos desde medianoche (Lima) para la línea de "ahora". */
  nowMinutes: number;
}

/** F08 · Semana: columnas por día, filas por hora. En móvil se desplaza en horizontal. */
export function WeekView({ days, today, appointments, nowMinutes }: WeekViewProps) {
  const withSlot = appointments.map((a) => ({ a, ...slotOf(a) }));
  const hours = visibleHours(withSlot);
  const top = (min: number) => ((min - hours.start * 60) / 60) * HOUR_PX;
  const height = (hours.end - hours.start) * HOUR_PX;
  const columns: CSSProperties = { gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))` };
  const hourLabels = Array.from({ length: hours.end - hours.start }, (_, i) => timeFromMinutes((hours.start + i) * 60));

  return (
    <div className="flex flex-col gap-3">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid border-b border-line-card" style={columns}>
              <span />
              {days.map((d) => {
                const isToday = d === today;
                return (
                  <Link
                    key={d}
                    href={agendaHref({ vista: 'dia', fecha: d })}
                    className="flex h-[54px] items-center justify-center gap-2 border-l border-line-soft text-ink no-underline hover:bg-bg"
                    aria-label={`Ver el día ${weekdayShort(d)} ${dayNumber(d)}`}
                  >
                    <span className="text-sm font-bold text-ink-muted">{weekdayShort(d)}</span>
                    <span
                      className={cn(
                        'flex size-[34px] items-center justify-center rounded-full text-base font-extrabold',
                        isToday ? 'bg-gold-700 text-white' : 'text-ink',
                      )}
                    >
                      {dayNumber(d)}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="grid" style={{ ...columns, height }}>
              <div className="flex flex-col">
                {hourLabels.map((h) => (
                  <span key={h} className="tabular shrink-0 pt-1 pr-2 text-right text-xs font-bold text-ink-muted" style={{ height: HOUR_PX }}>
                    {h}
                  </span>
                ))}
              </div>

              {days.map((d) => {
                const items = layoutLanes(withSlot.filter((x) => x.date === d));
                const isToday = d === today;
                const nowTop = top(nowMinutes);
                return (
                  <div
                    key={d}
                    className={cn('relative border-l border-line-soft', isToday ? 'bg-gold-25' : 'bg-surface')}
                    style={{
                      backgroundImage: `repeating-linear-gradient(to bottom, var(--color-line-soft) 0, var(--color-line-soft) 1px, transparent 1px, transparent ${HOUR_PX}px)`,
                    }}
                  >
                    {items.map(({ a, start, end, time, lane, lanes }) => {
                      const st = APPOINTMENT_STATUS[a.status];
                      const h = Math.max(((end - start) / 60) * HOUR_PX - 4, 26);
                      const width = 100 / lanes;
                      return (
                        <Link
                          key={a.id}
                          href={agendaHref({ vista: 'dia', fecha: d, cita: a.id })}
                          className={cn(
                            'absolute flex flex-col gap-px overflow-hidden rounded-[10px] px-2 py-1 no-underline',
                            st.className,
                            a.status === 'cancelled' && 'line-through',
                          )}
                          style={{ top: top(start) + 2, height: h, left: `calc(${lane * width}% + 4px)`, width: `calc(${width}% - 8px)` }}
                          title={`${time} · ${shortName(a.patient)} · ${st.label}`}
                        >
                          <span className="truncate text-[13px] font-extrabold">{shortName(a.patient)}</span>
                          {h >= 34 ? (
                            <span className="truncate text-xs font-semibold">
                              {time}
                              {a.reason ? ` · ${a.reason}` : ''}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                    {isToday && nowTop >= 0 && nowTop <= height ? (
                      <span aria-hidden className="pointer-events-none absolute inset-x-0 h-0.5 bg-gold-700" style={{ top: nowTop }}>
                        <span className="absolute -top-1 -left-[5px] size-2.5 rounded-full bg-gold-700" />
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2">
        {appointments.length === 0 ? <span className="text-sm font-bold text-ink-muted">Sin citas esta semana.</span> : null}
        {Object.values(APPOINTMENT_STATUS).map((s) => (
          <span key={s.label} className="inline-flex items-center gap-2 text-[13px] font-bold text-ink-muted">
            <span aria-hidden className={cn('size-3.5 rounded ring-1 ring-ink/10', s.className)} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
