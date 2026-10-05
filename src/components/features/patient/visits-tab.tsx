'use client';

import { useOptimistic, useState, useTransition, type ReactNode } from 'react';
import { CalendarPlus, FileText } from 'lucide-react';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { useToast } from '@/components/ui/toast';
import { EmptyState } from '@/components/shared/empty-state';
import { TreatmentItem } from '@/components/shared/treatment-item';
import { updateTreatmentStatus } from '@/lib/actions/visits';
import { cn } from '@/lib/cn';
import { dayParts, pluralize } from '@/lib/format';
import { toothLabel } from '@/lib/teeth';
import type { TreatmentStatus, VisitWithTreatments } from '@/types/domain';

type Filter = 'all' | TreatmentStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'in_progress', label: 'En proceso' },
  { value: 'planned', label: 'Planificados' },
  { value: 'done', label: 'Realizados' },
];

export interface VisitsTabProps {
  patientId: string;
  visits: VisitWithTreatments[];
  /** Páginas del formato en papel digitalizado (entrada final del timeline). */
  paperPages: number;
  paperDate: string | null;
}

/** Ficha · Visitas y tratamientos: timeline con filtro por estado y cambio de estado. */
export function VisitsTab({ patientId, visits, paperPages, paperDate }: VisitsTabProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const toast = useToast();
  const [optimistic, setOptimistic] = useOptimistic(visits, (state, change: { id: string; status: TreatmentStatus }) =>
    state.map((v) => ({ ...v, treatments: v.treatments.map((t) => (t.id === change.id ? { ...t, status: change.status } : t)) })),
  );

  const changeStatus = (id: string, status: TreatmentStatus) => {
    setPendingId(id);
    startTransition(async () => {
      setOptimistic({ id, status });
      const res = await updateTreatmentStatus(id, patientId, status);
      setPendingId(null);
      if (!res.ok) toast({ title: 'No se pudo cambiar el estado', description: res.error, tone: 'error' });
    });
  };

  if (visits.length === 0 && paperPages === 0) {
    return (
      <EmptyState
        icon={CalendarPlus}
        tone="gold"
        title="Sin visitas registradas"
        description="Cada visita guarda el motivo, los tratamientos por pieza y tus notas."
        actions={<ButtonLink href={`/pacientes/${patientId}/visitas/nueva`}>Registrar primera visita</ButtonLink>}
      />
    );
  }

  const shown = optimistic
    .map((v) => ({ ...v, treatments: filter === 'all' ? v.treatments : v.treatments.filter((t) => t.status === filter) }))
    .filter((v) => filter === 'all' || v.treatments.length > 0);

  const entries = shown.length + (filter === 'all' && paperPages > 0 ? 1 : 0);

  return (
    <div className="flex flex-col gap-4 md:gap-[18px]">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="m-0 mr-2 text-lg font-extrabold">{pluralize(visits.length, 'visita', 'visitas')}</h2>
        {FILTERS.map((f) => (
          <Chip key={f.value} size="sm" selected={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
          </Chip>
        ))}
      </div>

      {entries === 0 ? (
        <p className="m-0 text-[15px] font-semibold text-ink-muted">No hay tratamientos con ese estado.</p>
      ) : (
        <ol className="m-0 flex list-none flex-col p-0">
          {shown.map((v, i) => {
            return (
              <TimelineEntry key={v.id} first={i === 0} {...dayParts(v.visit_date)}>
                {v.reason ? <p className="m-0 text-[17px] font-extrabold">{v.reason}</p> : null}
                {v.treatments.map((t) => (
                  <TreatmentItem
                    key={t.id}
                    name={t.service.name}
                    toothText={toothLabel(t.tooth)}
                    status={t.status}
                    notes={t.notes}
                    busy={pendingId === t.id}
                    onStatusChange={(s) => changeStatus(t.id, s)}
                  />
                ))}
                {v.notes ? <p className="m-0 text-[15px] leading-relaxed font-medium text-ink-muted">{v.notes}</p> : null}
              </TimelineEntry>
            );
          })}
          {filter === 'all' && paperPages > 0 ? (
            <TimelineEntry first={shown.length === 0} {...dayParts(paperDate)}>
              <p className="m-0 flex items-center gap-2 text-[17px] font-extrabold">
                <FileText className="size-5 text-ink-muted" aria-hidden />
                Historia digitalizada desde formato en papel
              </p>
              <p className="m-0 text-[15px] font-medium text-ink-muted">
                {pluralize(paperPages, 'página fotografiada', 'páginas fotografiadas')}.{' '}
                <Link href={`/pacientes/${patientId}?tab=archivos`} className="font-bold">
                  Ver en Archivos
                </Link>
              </p>
            </TimelineEntry>
          ) : null}
        </ol>
      )}
    </div>
  );
}

function TimelineEntry({ first, day, year, children }: { first: boolean; day: string; year: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[56px_20px_minmax(0,1fr)] gap-x-2 md:grid-cols-[88px_28px_minmax(0,1fr)] md:gap-x-3">
      <div className="flex flex-col items-end pt-4 text-right">
        <span className="text-base leading-none font-extrabold md:text-xl">{day}</span>
        <span className="mt-1 text-[13px] font-bold text-ink-muted">{year}</span>
      </div>
      <div className="flex flex-col items-center" aria-hidden>
        <span className={cn('h-5 w-0.5', first ? 'bg-transparent' : 'bg-line-paper')} />
        <span className="size-3.5 shrink-0 rounded-full border-[3px] border-gold-500 bg-surface" />
        <span className="w-0.5 flex-1 bg-line-paper" />
      </div>
      <article className="mb-4 flex flex-col gap-2.5 rounded-[18px] border border-line-card bg-surface px-4 py-4 md:px-5">{children}</article>
    </li>
  );
}
