import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { addDays, agendaHref, weekStart, type AgendaView } from '@/lib/agenda';
import { cn } from '@/lib/cn';

export interface AgendaToolbarProps {
  view: AgendaView;
  date: string;
  today: string;
  /** "Hoy · lunes 5 de octubre" o "5 – 10 oct 2026". */
  title: string;
}

/** Título, navegación por día/semana, Día|Semana y Nueva cita. */
export function AgendaToolbar({ view, date, today, title }: AgendaToolbarProps) {
  const step = view === 'semana' ? 7 : 1;
  const unit = view === 'semana' ? 'Semana' : 'Día';
  const isCurrent = view === 'semana' ? weekStart(date) === weekStart(today) : date === today;

  return (
    <header className="flex flex-wrap items-center gap-3 px-4 pt-5 md:px-8 md:pt-6">
      <h1 className="m-0 text-[24px] font-extrabold tracking-[-.02em] md:text-[28px]">Agenda</h1>

      <div className="order-last flex w-full items-center justify-center gap-1.5 md:order-none md:w-auto md:flex-1">
        <ButtonLink variant="secondary" size="icon" href={agendaHref({ vista: view, fecha: addDays(date, -step) })} aria-label={`${unit} anterior`} replace>
          <ChevronLeft className="size-5" aria-hidden />
        </ButtonLink>
        <span className="min-w-0 flex-1 truncate text-center text-[17px] font-extrabold md:max-w-[300px] md:min-w-[220px] md:text-lg" aria-live="polite">
          {title}
        </span>
        <ButtonLink variant="secondary" size="icon" href={agendaHref({ vista: view, fecha: addDays(date, step) })} aria-label={`${unit} siguiente`} replace>
          <ChevronRight className="size-5" aria-hidden />
        </ButtonLink>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        {!isCurrent ? (
          <ButtonLink variant="ghost" size="sm" href={agendaHref({ vista: view })} replace>
            Hoy
          </ButtonLink>
        ) : null}
        <nav aria-label="Vista de la agenda" className="inline-flex gap-1 rounded-[14px] bg-surface-2 p-1">
          {(
            [
              { id: 'dia', label: 'Día' },
              { id: 'semana', label: 'Semana' },
            ] as const
          ).map((o) => {
            const on = o.id === view;
            return (
              <Link
                key={o.id}
                href={agendaHref({ vista: o.id, fecha: date })}
                replace
                aria-current={on ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center rounded-[10px] px-4 text-[15px] no-underline',
                  on ? 'bg-surface font-extrabold text-ink shadow-[0_1px_3px_rgba(17,17,17,.12)]' : 'font-bold text-ink-muted hover:text-ink',
                )}
              >
                {o.label}
              </Link>
            );
          })}
        </nav>
        <ButtonLink href={agendaHref({ vista: view, fecha: date, nueva: true })} aria-label="Nueva cita" scroll={false}>
          <Plus className="size-5" aria-hidden />
          <span className="hidden sm:inline">Nueva cita</span>
        </ButtonLink>
      </div>
    </header>
  );
}
